var express = require('express');
var os = require('os');
var amqp = require('amqplib/callback_api');

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
  stats.recentRequests = Object.keys(packetSet).length;
  res.json(stats);
});

app.listen(3000, 'localhost', function () {
  console.log('Listening on port 3000!');
});

var cargo = async.cargo(function (data, cb) {
  connectionChannel.sendToQueue('dnscap-q', new Buffer(data));
   return cb();
}, config.CARGO_ASYNC);

amqp.connect('amqp://rabbitmqadmin:rabbitmqadmin@' + config.rabbit_master_ip, function (err, conn) {
  conn.createChannel(function (err, ch) {
    ch.prefetch(40);
    ch.consume('dnscap2-q', function (m) {
      var msg = m.content.toString('utf8');
      cargo.push(msg);
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
