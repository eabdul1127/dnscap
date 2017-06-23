const DNS = require("./nodejs_pcap/decode/dns.js"); // Local Copy of nodejs pcap modified for dns packet decoding to work properly

function clean_packet (host, status, extra) {
  this.host = host;
  this.status = status;
  this.extra = extra;
  if(extra != undefined)
  	this.ip = extra[0];
  else
    this.extra = [];
}
exports.clean_packet = clean_packet;

exports.sanitizePacket = function (packet) {
  var packetData= packet.payload.payload.payload.data;
  var packetLength = packet.payload.payload.payload.length;
  if(packetData != undefined) {
  	var decodedPacket = new DNS().decode(packetData, 0);
    var rrs = decodedPacket.answer.rrs;
    var ipSet =[];
    var packetStatus;
    var properResponse = false;
    if(decodedPacket.ancount > 0) {
    	properResponse = rrs.some(function (element, index, array) {
    		return element.type == 1;
      });
    }
    if(!properResponse) {
    	if(decodedPacket.question.rrs[0].type != 1 /* A record */)
    		return;
      if(decodedPacket.header.responseCode == 0)
        console.log(decodedPacket.question.rrs[0].toString());
	  }
    for(var i =0; i< rrs.length; i++) {
    	if(rrs[i].rdata != null) {
        	ipSet.push(rrs[i].rdata.toString());
      }
    }
 }
  packetStatus=responseToString(decodedPacket.header.responseCode);

  if(decodedPacket.ancount>0)
  	var nextPacket = new clean_packet(decodedPacket.question.rrs[0].name, packetStatus, ipSet);
  else
  	var nextPacket = new clean_packet(decodedPacket.question.rrs[0].name, packetStatus, undefined);

  return nextPacket;
}

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
	}
	catch (err) {
	console.log("Unable to determine response code for "+responseCode)
	return "CODE "+responseCode;
	}
};

function addToDictionary (Dictionary, nextPacket, value) {
  value = parseInt(value);
  var key = JSON.stringify(nextPacket);
  if(Dictionary[key]==undefined)
    Dictionary[key]= 1;
  else {
    var count = Dictionary[key];
    count+=value;
    Dictionary[key]=count;
  }
}

exports.addToDictionary= addToDictionary
