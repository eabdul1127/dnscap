var pcap = require("pcap");
var zmq = require('zeromq')
  , sock = zmq.socket('push');
var config = require('./config.js');
var DNS = require("./node_modules/pcap/decode/dns.js"); // Local Copy of nodejs pcap modified for dns packet decoding to work properly
var SysLogger = require('ain2');
var logger = new SysLogger();
var Cryptr = require('cryptr'),
    cryptr = new Cryptr(config.encryption_string,'aes-128-ctr');
var memoize = require('memoizee');
var memoized = memoize(cryptr.encrypt);
var errCount = 0;

var clean_packet = function (origin, decodedPacket) {
  this.origin = origin;
  this.decodedPacket = decodedPacket;
};

var sanitizePacket = function (packet) {
  var packetData = packet.payload.payload.payload.data;
  try {
    var decodedPacket = new DNS().decode(packetData, 0);
    var hashed_ip = memoized(packet.payload.payload.daddr + config.encryption_string);
    var hashed_mac = memoized(packet.payload.payload.dhost + config.encryption_string)
    return new clean_packet( { mac: hashed_mac, ip: hashed_ip }, decodedPacket);
  }
  catch(err) {
    errCount++;
    logger.error(err);
    return undefined;
  }
};

sock.connect('tcp://127.0.0.1:5000');
var handlePacket = function (raw_packet) {
  try {
    var packet = pcap.decode.packet(raw_packet);
    var sanitizedPacket = sanitizePacket(packet);
    if(sanitizedPacket == undefined)
      return;
    sock.send(JSON.stringify(sanitizedPacket));

  } catch (e) {
    errCount++;
    var errString = "Error Occurred : " + e + " Packet: " + packet;
    if(sanitizedPacket != undefined)
      errString += sanitizedPacket;
    logger.error(errString);
  }
};

var pcap_session = pcap.createSession(process.argv[2], 'ip proto 17 and src port 53');
pcap_session.on('packet', handlePacket);
