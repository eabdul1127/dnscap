var path = require('path');
var amqp = require('amqplib/callback_api');
var express = require('express');
var packets = require('./packet.js');
var pcap = require("pcap");
var async = require('async');
var config = require('./config.js');

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
  var interval = Math.trunc((new Date().getTime() - config.initTime) / config.intervalTimer);
  if(currentInterval != interval) {
    currentInterval = interval;
    var setRef = packetSet;
    packetSet = {};
    var timeStamp = config.initTime + (interval * config.intervalTimer);
    Object.keys(setRef).forEach(function (packet) {
      var msg = {
        date: timeStamp
      };
      msg[packet] = setRef[packet];
      cargo.push(msg);
    });
  }

  var packet = pcap.decode.packet(raw_packet);
  var nextPacket = packets.sanitizePacket(packet);
  if(nextPacket == undefined)
    return;
  packets.addToDictionary(packetSet, nextPacket, 1);
  stats.totalRequests++;
}

var pcap_session = [];
for(var i = 1; i < 4; i++) {
  pcap_session[i-1] = pcap.createSession("eno" + i, "ip proto 17 and src port 53");
  pcap_session[i-1].on('packet', handlePacket);
}
