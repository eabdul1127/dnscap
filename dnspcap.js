#!/usr/bin/node

var pcap = require("pcap");
var zmq = require("zeromq"), 
    sock = zmq.socket("push");
    sock.setsockopt('SNDHWM', 100000);
var SysLogger = require("ain2"),
    logger = new SysLogger();
var Cryptr = require("cryptr"),
    cryptr = new Cryptr(config.encryption_string, "aes-128-ctr");
var memoize = require("memoizee"),
    memoized = memoize(cryptr.encrypt, { maxAge: 8640000 }); //24 Hours

var config = require("/etc/dnspcap.js");

var sanitizePacket = function (packet) {
  var packetData = packet.payload.payload.payload.data;
  var hashed_ip = memoized(packet.payload.payload.daddr + config.encryption_string);
  var hashed_mac = memoized(packet.payload.payload.dhost + config.encryption_string)
  return { mac: hashed_mac, ip: hashed_ip, packetData: packetData };
};

sock.connect("tcp://127.0.0.1:5000");
var handlePacket = function (raw_packet) {
  try {
    var packet = pcap.decode.packet(raw_packet);
    var sanitizedPacket = sanitizePacket(packet);
    sock.send(JSON.stringify(sanitizedPacket));
  } catch (e) {
    var errString = "Error Occurred: " + e + " Packet: " + packet;
    if(sanitizedPacket != undefined)
      errString += "Sanitized: " + sanitizedPacket;
    logger.error(errString);
  }
};
//Does this need to be argv[2] or argv[1]
var pcap_session = pcap.createSession(process.argv[2], "ip proto 17 and src port 53");
pcap_session.on("packet", handlePacket);