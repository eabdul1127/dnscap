var amqp = require('amqplib/callback_api');
var async = require('async');
var elasticsearch = require('elasticsearch');

const rabbit_master_ip = "192.168.0.26";
const QUEUE_ASYNC = 10000;
const SATURATED = 25000;
const client = new elasticsearch.Client({
  hosts: [
    "192.168.0.205:9200", "192.168.0.206:9200", "192.168.0.208:9200",
    "192.168.0.209:9200", "192.168.0.210:9200", "192.168.0.212:9200",
    "192.168.0.213:9200", "192.168.0.214:9200", "192.168.0.215:9200",
    "192.168.0.216:9200", "192.168.0.217:9200", "192.168.0.218:9200",
    "192.168.0.219:9200", "192.168.0.221:9200", "192.168.0.222:9200",
    "192.168.0.223:9200", "192.168.0.224:9200", "192.168.0.225:9200",
    "192.168.0.226:9200", "192.168.0.227:9200", "192.168.0.228:9200",
    "192.168.0.229:9200"
  ]
});

var resolve_task = function (data, cb) {
  if(data.m) {
		data.ch.ack(data.m);
		return cb();
  }
  var date = data.date;
  delete data.date;
  var pre_packet = (Object.keys(data));
  var packet = JSON.parse(pre_packet);
  client.index({
    index: 'dnscap',
    type: 'udp_requests',
    body: {
      hostname: packet.host,
      ip_address: packet.ip,
      status: packet.status,
      total:data[pre_packet],
      timestamp : date,
      extra : packet.extra
    }
  }, function(err, resp, status) {
    return cb();
  });
};

var q = async.queue(resolve_task, QUEUE_ASYNC);
amqp.connect('amqp://rabbitmqadmin:rabbitmqadmin@' + rabbit_master_ip, function (err, conn) {
  conn.createChannel(function (err, ch) {
  	var qu = 'dnscap-q';
    ch.prefetch(40);
    ch.consume('dnscap-q', function (m) {
      var msg = JSON.parse(m.content.toString('utf8'));
      q.push(msg);
      q.push({ m: m, ch: ch });
    });
  }, {
    noAck: false
  });
});
