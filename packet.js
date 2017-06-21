var DNS = require("/home/compassys/node_modules/pcap/decode/dns.js");

function clean_packet (host, status, ip, extra) {
  this.host= host;
  this.status= status;
  this.ip = ip;
  this.extra = extra;
}
exports.clean_packet =clean_packet;

exports.packetToString = function(clean_packet){
  return JSON.stringify(clean_packet);
}

exports.sanitizePacket = function (packet){
  var packetStatus = "OK";
  var packetData= packet.payload.payload.payload.data;
  var packetLength = udpPacket.length;
  if(packetData!=undefined)
  {
    var decodedPacket = new DNS().decode(packetData,0);
    var flags = decodedPacket.header;
    var packetSet = decodedPacket.answer.rrs;
    var ipSet =[];
    var isfirstIP= true;
    var firstIP;
    var properResponse = false;
    if(decodedPacket.ancount>0)
    {
      for (var i=0; i<packetSet.length; i++){
        if(packetSet[i].class==1)
        {
          properResponse=true;
          break;
        }
      }

      if(!properResponse)
      return;
      for(var i =0; i< packetSet.length; i++)
      {
        if(isfirstIP&& packetSet[i].rdata!=null){
          isfirstIP=false;
          firstIP= packetSet[i].rdata.toString();
        }
        else{
          if(packetSet[i].rdata!=null){
            ipSet.push(packetSet[i].rdata.toString());

          }
        }
      }
    }
    else {
      packetStatus=responseToString(decodedPacket.header.responseCode);
    }
    if(decodedPacket.ancount>0)
    {
      var nextPacket = new clean_packet(packetSet[packetSet.length-1].name,packetStatus,firstIP,ipSet);
    }
    else {
      var nextPacket = new clean_packet(decodedPacket.question.rrs[0].name,packetStatus,null,ipSet);
    }
    return nextPacket;
  }
}

exports.dictToString= function (Dictionary)
{
  var ret = JSON.stringify(Dictionary);
  return ret;
}

function responseToString(responseCode) {
  switch (responseCode) {
    case 0:
    return "OK";
    case 1:
    return "FORMAT ERR";
    case 2:
    return "SERVER ERR";
    case 3:
    return "NXDOMAIN ERR";
    case 4:
    return "UNSUPPORTED ERR";
    case 5:
    return "REFUSED ERR";
    default:
    return "OK";
  }
}

function addToDictionary (Dictionary, nextPacket, value)
{
  value = parseInt(value);
  var key = JSON.stringify(nextPacket);
  if(Dictionary[key]==undefined)
  {
    Dictionary[key]= 1;
  }
  else
  {
    var count = Dictionary[key];
    count+=value;
    Dictionary[key]=count;
  }
}

exports.addToDictionary= addToDictionary
