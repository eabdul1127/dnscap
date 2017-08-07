var path = require("path");
var zmq = require("zeromq");
var DNS = require("dns-suite").DNSPacket; // Local Copy of nodejs pcap modified for dns packet decoding to work properly
var express = require("express");
var os = require("os");
var amqp = require("amqplib/callback_api");
var async = require("async");
var config = require("./config.js");
var LZUTF8 = require('lzutf8');
var memoize = require("memoizee"),
    memoized = memoize(DNS.parse, { maxAge: 1000*60*60}); // 1 hour
var SysLogger = require("ain2"),
    logger = new SysLogger();

var stats = {
  totalRequests: 0,
  recentRequests: 0,
  cpuUsage: 0,
  freeMemory: 0,
  recent_interface: [0,0,0],
  total_interface: [0,0,0]
};
var packetSet = {};
var currentInterval = 0;
var connectionChannel;
var app = express();
var errCount = 0;

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname + "/graph.html"));
});

app.get("/update", function (req, res) {
  stats.cpuUsage = (os.loadavg()[0]) / os.cpus().length;
  stats.freeMemory = os.freemem();
  res.json(stats);
  stats.recentRequests = 0;
  for(var i = 0; i < 3; i++)
    stats.recent_interface[i] = 0;
});

app.listen(3000, "localhost", function () {
  console.log("Listening on port 3000!");
});

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
  var finished_packet;
  try {
    finished_packet = interpretMessage(message);
  }
  catch(e) {
    var errString = "Error Occurred: " + e + ", message: " + message ;
    logger.log(errString);
  }

  if(finished_packet != undefined) {
    addToPacketCounts(packetSet, finished_packet, 1);
    stats.total_interface[this.interface_no]++;
    stats.recent_interface[this.interface_no]++;
    stats.recentRequests++;
    stats.totalRequests++;
    }
};

var elasticsearch_packet = function (host, status, origin, ips) {
  this.host = host;
  this.status = status;
  this.hashed_ip = origin.ip;
  this.hashed_mac = origin.mac;
  this.ips = ips;
  if(ips.length != 0)
    this.ip = ips[0];
};

var interpretMessage = function (message) {
  var parsedMessage = JSON.parse(message.toString());
  var buffer = new Buffer(parsedMessage.packetData);
  var decodedPacket = DNS.parse(buffer);
  var ips = [];
      answer_rrs = decodedPacket.answer;
      question_rrs = decodedPacket.question;
      var packetStatus;
      var properResponse = false;
      if(answer_rrs.length > 0) {
        properResponse = answer_rrs.some(function (element, index, array) {
          return element.type == 1;
        });
      }
      if(!properResponse) {
        if(question_rrs[0].type != 1 /* A record */ )
          return;
      }
      for(var i = 0; i < answer_rrs.length; i++) {
        if(answer_rrs[i].type == 1) {
          ips.push(answer_rrs[i].address);
        }
      }
    packetStatus = responseToString(decodedPacket.header.rcode);
    return new elasticsearch_packet(question_rrs[0].name, packetStatus, parsedMessage,  ips);
}

var addToPacketCounts = function (packetCounts, nextPacket, value) {
  value = parseInt(value);
  var key = JSON.stringify(nextPacket);
  packetCounts[key] = (packetCounts[key]+value) || value;
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
    logger.log("Unable to determine response code for " + responseCode)
    return "CODE " + responseCode;
  }
};

var cargo = async.cargo(function (data, cb) {
  try{
    connectionChannel.sendToQueue("dnscap-q", new Buffer.from(LZUTF8.compress(JSON.stringify(data))));
  }
  catch(err) {
    logger.log("Failed to connect to rabbitmq, attempting to reconnect at next interval");
  }
   return cb();
}, config.CARGO_ASYNC);
amqp.connect("amqp://rabbitmqadmin:rabbitmqadmin@" + config.rabbit_master_ip, function (err, conn) {
  conn.createChannel(function (err, ch) {
    connectionChannel = ch;
  });
});

var sock;
var enpoint = "tcp://127.0.0.1:";
for(var i = 0; i < 3; i++) {
  sock = zmq.socket("pull");
  sock.interface_no = i;
  sock.bind(enpoint + process.argv[i+2]);
  sock.on("message", handleMessage);
}
