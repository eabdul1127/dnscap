var amqp = require('amqplib/callback_api');
var async = require('async');
var config = require('./config.js');

var resolve_task = function (data, cb) {
  if(data.m) {
  	data.ch.ack(data.m);
  	return cb();
  }
  config.client.bulk({
  	body: data.array
  }, function (err, resp, status) {
    console.log(resp);
    return cb();
  });
};

var q = async.queue(resolve_task, config.QUEUE_ASYNC);
amqp.connect('amqp://rabbitmqadmin:rabbitmqadmin@' + config.rabbit_master_ip, function (err, conn) {
  conn.createChannel(function (err, ch) {
    ch.prefetch(40);
    ch.consume('dnscap-q', function (m) {
      var msg = JSON.parse(m.content.toString('utf8'));
      var bulk = msg.map(function (x) {
      	var date = x.date;
      	delete x.date;
      	var packet = JSON.parse(Object.keys(x))
      	return {
      		hostname: packet.host,
      		ip_address: packet.ip,
      		status: packet.status,
      		total: x[Object.keys(x)],
      		timestamp: date,
      		extra: packet.extra
      	};
      });
      var bulkArr = [];
      var bulkObj = {};
      for(var i = 0; i < bulk.length; i++) {
      	bulkArr.push({index: {_index: 'dnscap', _type: 'udp_requests'}});
      	bulkArr.push(bulk[i]);
      }
      bulkObj.array = bulkArr;
      q.push(bulkObj);
      q.push({ m: m, ch: ch });
    });
  }, {
    noAck: false
  });
});
