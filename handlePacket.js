// Server/Queue side application that will continuously check the queue for information, upon finding something, it
// will convert the contents back to clean_packets and log them into a MasterDictionary as. Also currently adds them
// to a list that is sorted by value
var totalRequests= 0;
var recentRequests =0;
var path = require('path');
var lastDate;
var amqp = require('amqplib/callback_api');
const express = require('express')
const app = express()
var pcap1 = require("pcap");
pcap_session1 = pcap1.createSession("eno2", "ip proto 17 and src port 53");
var packets= require('./packet.js')
var packetSet = {};
var interval = 1000;
var rabbit_master_ip= "130.245.169.67";

app.get('/', function (req, res) {
  displayContents(req,res);
})

app.get('/update', function(req,res){
        res.contentType='application/json';
        var requests=recentRequests;
        var o = {
                point:requests,
                total:totalRequests.toString(),
                lastDump:new Date.toLocaleString();
        }
        res.send(JSON.stringify(o));
})
app.listen(3000,'localhost', function () {
  console.log('Example app listening on port 3000!')
})

function displayContents(req, res){
        res.sendFile(path.join(__dirname + '/graph.html'));
}

function sendData(err, ch, q){
      var setRef = packetSet;
      packetSet= {};
      Object.keys(setRef).forEach(function(key){
        var msg = {date : (new Date().getTime())-interval};
        msg[key]=setRef[key];
        ch.sendToQueue(q, new Buffer(JSON.stringify(msg)));
        console.log(msg);
      })
      recentRequests=0;
}

amqp.connect("amqp://rabbitmqadmin:rabbitmqadmin@130.245.169.67", function(err,conn) {
        conn.createChannel(function(err, ch) {
        var q = 'dnscap-q';
        setInterval(function(){sendData(err,ch,q)},interval);
    });
    });

pcap_session1.on('packet', function (raw_packet)
  {
    var packet = pcap1.decode.packet(raw_packet);
    var nextPacket = packets.sanitizePacket(packet);
    if(nextPacket== undefined)
    return;
    if(nextPacket.ip==null)
        delete nextPacket.ip;
    packets.addToDictionary(packetSet,nextPacket,1);
    totalRequests++;
    recentRequests++;
 });
