var path = require('path');
var DNS = require("./pcap/decode/dns.js"); // Local Copy of nodejs pcap modified for dns packet decoding to work properly
var amqp = require('amqplib/callback_api');
var express = require('express');
var pcap = require("pcap");
var async = require('async');
var config = require('./config.js');

var clean_packet = function (host, status, extra) {
  this.host = host;
  this.status = status;
  this.extra = extra;
  if(extra != undefined)
    this.ip = extra[0];
  else
    this.extra = [];
};

var addToDictionary = function (Dictionary, nextPacket, value) {
  value = parseInt(value);
  var key = JSON.stringify(nextPacket);
  if(Dictionary[key] == undefined)
    Dictionary[key] = 1;
  else {
    var count = Dictionary[key];
    count += value;
    Dictionary[key] = count;
  }
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
    console.log("Unable to determine response code for " + responseCode)
    return "CODE " + responseCode;
  }
};

var sanitizePacket = function (packet) {
  var packetData = packet.payload.payload.payload.data;
  var question_rrs;
  var answer_rrs;
  if(packetData != undefined) {
    var decodedPacket = new DNS().decode(packetData, 0);
    var ipSet = [];
    var packetStatus;
    var properResponse = false;
    question_rrs = decodedPacket.question.rrs;
    answer_rrs = decodedPacket.answer.rrs;
    if(decodedPacket.ancount > 0) {
      properResponse = answer_rrs.some(function (element, index, array) {
        return element.type == 1;
      });
    }
    if(!properResponse) {
      if(question_rrs.type != 1 /* A record */ )
        return;
    }
    for(var i = 0; i < answer_rrs.length; i++) {
      if(answer_rrs[i].rdata != null) {
        ipSet.push(answer_rrs[i].rdata.toString());
      }
    }
  }
  packetStatus = responseToString(decodedPacket.header.responseCode);
  var sanitizedPacket = new clean_packet(decodedPacket.question.rrs[0].name, packetStatus, ipSet);
  return sanitizedPacket;
};

var stats = {
  totalRequests: 0,
  recentRequests: 0,
};
var packetSet = {};
var currentInterval = 0;
var connectionChannel;
var app = express();

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/graph.html'));
});

app.get('/update', function (req, res) {
  stats.recentRequests = Object.keys(packetSet).length;
  res.json(stats);
});

app.listen(3000, 'localhost', function () {
  console.log('Listening on port 3000!');
});

amqp.connect("amqp://rabbitmqadmin:rabbitmqadmin@" + config.rabbit_master_ip, function (err, conn) {
  conn.createChannel(function (err, ch) {
    connectionChannel = ch;
  });
});

var cargo = async.cargo(function (data, cb) {
  connectionChannel.sendToQueue('dnscap-q', new Buffer(JSON.stringify(data)));
  return cb();
}, config.CARGO_ASYNC);

var handlePacket = function (raw_packet) {
  var interval = Math.trunc(new Date().getTime() / config.intervalTimer) * config.intervalTimer;
  if(currentInterval != interval) {
    currentInterval = interval;
    var setRef = packetSet;
    packetSet = {};
    Object.keys(setRef).forEach(function (packet) {
      var msg = {};
      msg['date'] = interval;
      msg[packet] = setRef[packet];
      cargo.push(msg);
    });
  }

  var packet = pcap.decode.packet(raw_packet);
  var sanitizedPacket = sanitizePacket(packet);
  if(sanitizedPacket == undefined)
    return;   //Syslog
  addToDictionary(packetSet, sanitizedPacket, 1);
  stats.totalRequests++;
}

var pcap_session = [];
for(var i = 0; i < config.interfaces.length; i++) {
  pcap_session[i] = pcap.createSession(config.interfaces[i], "ip proto 17 and src port 53");
  pcap_session[i].on('packet', handlePacket);
}
