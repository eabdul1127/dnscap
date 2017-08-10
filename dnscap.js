var path = require("path");
var zmq = require("zeromq");
var DNS = require("dns-suite").DNSPacket;
var express = require("express");
var os = require("os");
var amqp = require("amqplib/callback_api");
var async = require("async");
var config = require("./config.js");
var LZUTF8 = require('lzutf8');

var stats = {
  totalRequests: 0,
  totalFailedRequests: 0,
  recentRequests: 0,
  cpuUsage: 0,
  freeMemory: 0,
  recent_interface: [],
  total_interface: [],
  errCount: 0
};
var packetSet = {};
var app = express();

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname + "/graph.html"));
});

app.get("/update", function (req, res) {
  stats.cpuUsage = (os.loadavg()[0]) / os.cpus().length;
  stats.freeMemory = os.freemem();
  res.json(stats);
  stats.recentRequests = 0;
  for(var i = 0; i < process.argv.length-2; i++)
    stats.recent_interface[i] = 0;
});

app.listen(3000, "localhost", function () {
  console.log("Listening on port 3000!");
});

var addToPacketCounts = function (packetCounts, nextPacket, value) {
  value = parseInt(value);
  var key = JSON.stringify(nextPacket);
  packetCounts[key] = (packetCounts[key]+value) || value;
};

var filtered_packet = function (host, status, origin, ips) {
  this.host = host;
  this.status = status;
  this.hashed_ip = origin.ip;
  this.hashed_mac = origin.mac;
  this.ips = ips;
  if(ips.length != 0)
  this.ip = ips[0];
};
var responseToString = function (responseCode) {
  try {
    return {
      0: "OK",
      1: "FORMAT ERR",
      2: "SERVER ERR",
      3: "NXDOMAIN ERR",
      4: "UNSUPPORTED ERR",
      5: "REFUSED ERR"
    }[responseCode];
  } catch(err) {
    errCount++;
    console.error("Unable to determine response code for " + responseCode)
    return "CODE " + responseCode;
  }
};

var interpretMessage = function (message) {
  var parsedMessage = JSON.parse(message.toString());
  var buffer = new Buffer(parsedMessage.packetData);
  var decodedPacket = DNS.parse(buffer);
  var ips = [];
  answer_rrs = decodedPacket.answer;
  question_rrs = decodedPacket.question;
  var packetStatus = responseToString(decodedPacket.header.rcode);
  var properResponse = false;
  if(answer_rrs.length > 0) {
    properResponse = answer_rrs.some(function (element, index, array) {
      return element.type == 1;
    });
  }
  if(!properResponse) {
    return;
  }
  var ips = answer_rrs.map(function (record) {
    if(record.type == 1)
      return record.address;
  });

  return new filtered_packet(question_rrs[0].name, packetStatus, parsedMessage,  ips);
}

var currentInterval = Math.trunc(new Date().getTime() / config.intervalTimer) * config.intervalTimer;
var handleMessage = function (message) {
  var interval = Math.trunc(new Date().getTime() / config.intervalTimer) * config.intervalTimer;
  if(currentInterval != interval) {
    currentInterval = interval;
    var setRef = packetSet;
    packetSet = {};
    Object.keys(setRef).forEach(function (message) {
      var msg = {};
      msg["date"] = interval;
      msg[message] = setRef[message];
      cargo.push(msg);
    });
  }
  try {
    var finished_packet = interpretMessage(message);
    if(finished_packet == undefined)
      throw new Error("Failed to decode message");
    addToPacketCounts(packetSet, finished_packet, 1);
    stats.recent_interface[this.interface_no]++;
    stats.recentRequests++;
  } catch(e) {
    stats.totalFailedRequests++;
    var errString = "Error Occurred: " + e + ", message: " + message ;
    console.error(errString);
  }
  stats.totalRequests++;
  stats.total_interface[this.interface_no]++;
};

amqp.connect(config.rabbit_master_ip, function (err, conn) {
  conn.createChannel(function (err, ch) {
    connectionChannel = ch;
  });
});

var connectionChannel;
var cargo = async.cargo(function (data, cb) {
  try{
    connectionChannel.sendToQueue("dnscap-q", new Buffer.from(LZUTF8.compress(JSON.stringify(data))));
  } catch(err) {
    console.error("Failed to connect to rabbitmq, attempting to reconnect at next interval");
  }
  return cb();
}, config.CARGO_ASYNC);

var enpoint = "tcp://127.0.0.1:";
for(var i = 0; i < process.argv.length-2; i++) {
  var sock = zmq.socket("pull");
  sock.interface_no = i;
  sock.bind(enpoint + process.argv[i+2]);
  sock.on("message", handleMessage);
}
