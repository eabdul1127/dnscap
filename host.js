var path = require('path');
var express = require('express');
var os = require('os');
var amqp = require('amqplib/callback_api');
var async = require('async');
var config = require('./config.js');

var stats = {
  totalRequests: 0,
  recentRequests: 0,
  cpuUsage: 0,
  freeMemory: 0
};
var packetSet = {};
var currentInterval = 0;
var connectionChannel;
var app = express();

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/graph.html'));
});

app.get('/update', function (req, res) {
  stats.cpuUsage = (os.loadavg()[0]) / os.cpus().length;
  stats.freeMemory = os.freemem();
  res.json(stats);
});

app.listen(3000, 'localhost', function () {
  console.log('Listening on port 3000!');
});

var interpretMessage = function (msg) {
  stats.recentRequests = Object.keys(msg).length;
  stats.totalRequests += stats.recentRequests;
  delete msg.recentRequests;
  cargo.push(msg);
}

var cargo = async.cargo(function (data, cb) {
  connectionChannel.sendToQueue('dnscap-q', new Buffer(data));
   return cb();
}, config.CARGO_ASYNC);

amqp.connect('amqp://rabbitmqadmin:rabbitmqadmin@' + config.rabbit_master_ip, function (err, conn) {
  conn.createChannel(function (err, ch) {
    ch.prefetch(40);
    ch.consume('dnscap2-q', function (m) {
      var msg = m.content.toString('utf8');
      interpretMessage(JSON.parse(msg));
      ch.ack(m);
    });
  }, {
    noAck: false
  });
});

amqp.connect("amqp://rabbitmqadmin:rabbitmqadmin@" + config.rabbit_master_ip, function (err, conn) {
  conn.createChannel(function (err, ch) {
    connectionChannel = ch;
  });
});
