var amqp = require("amqplib/callback_api");
var async = require("async");
var config = require("./config.js");
var elasticsearch = require("elasticsearch");
var LZUTF8 = require('lzutf8');

var client = new elasticsearch.Client({
  hosts : config.hosts 
});

var index_requests = function (data, cb) {
  client.bulk({
    body: data.array
  }, function (err, resp, status) {
    if(err)
      console.log(err);
    return cb();
  });
};

var q = async.queue(index_requests, config.QUEUE_ASYNC);
amqp.connect(config.rabbit_master_ip_local, function (err, conn) {
  conn.createChannel(function (err, ch) {
    ch.prefetch(40);
    ch.consume("dnscap-q", function (m) {
      try{
        var msg = JSON.parse(LZUTF8.decompress(new Uint8Array(m.content,0)));
        var bulk = msg.map(function (request) {
          var date = request.date;
          delete request.date;
          var packet = JSON.parse(Object.keys(request)); 
          var name_array = packet.host.split(".");
          var partial_name = "";
          var subname_count = name_array.length
          for(var i = 0; i < subname_count; i++)  {
            if(i == 0)
               partial_name = name_array.pop();
            else
               partial_name = name_array.pop() + '.' + partial_name;
            packet["name_" + i.toString()] = partial_name;
          }
          var elasticsearch_object = {
            hostname: packet.host,
            ip_address: packet.ip,
            status: packet.status,
            total: request[Object.keys(request)],
            timestamp: date,
            ips: packet.ips,
            hashed_ip: packet.hashed_ip,
            hashed_mac: packet.hashed_mac
          };
          for(var i = 0; i < 3; i++) {
            if(packet["name_" + i.toString()] != undefined)
              elasticsearch_object["name_" + i.toString()] = packet["name_" + i.toString()];
          }
          return elasticsearch_object;
        });
        var bulkObj = {array: []};
        for(var i = 0; i < bulk.length; i++) {
          bulkObj.array.push({
            index: {
              _index: config.index_setting,
              _type: config.type_setting
            }
          });
          bulkObj.array.push(bulk[i]);
        }
        q.push(bulkObj);
        ch.ack(m);
      }
      catch(err) {
        ch.ack(m);
        console.log(err);
      }
    });
  }, {
    noAck: false
  });
});
