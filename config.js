const rabbit_master_ip = 'amqp://rabbitmqadmin:rabbitmqadmin@130.245.169.67';
const rabbit_master_ip_local = 'amqp://rabbitmqadmin:rabbitmqadmin@192.168.0.26';
const intervalTimer = 600000;
const CARGO_ASYNC = 100;
const QUEUE_ASYNC = 100;
const index_setting = "dnscap-new";
const type_setting = "udp_requests"
const hosts = [
  "192.168.0.104:9200", "192.168.0.105:9200", "192.168.0.106:9200", 
  "192.168.0.107:9200", "192.168.0.108:9200", "192.168.0.109:9200", 
  "192.168.0.110:9200", "192.168.0.111:9200", "192.168.0.112:9200", 
  "192.168.0.113:9200", "192.168.0.114:9200", "192.168.0.117:9200", 
  "192.168.0.119:9200", "192.168.0.120:9200", "192.168.0.121:9200", 
  "192.168.0.122:9200", "192.168.0.123:9200", "192.168.0.124:9200", 
  "192.168.0.125:9200", "192.168.0.127:9200", "192.168.0.128:9200", 
  "192.168.0.129:9200", "192.168.0.13:9200", "192.168.0.130:9200", 
  "192.168.0.131:9200"
];

module.exports = {
    CARGO_ASYNC : CARGO_ASYNC,
    QUEUE_ASYNC : QUEUE_ASYNC,
    index_setting : index_setting,
    type_setting : type_setting,
    rabbit_master_ip : rabbit_master_ip,
    rabbit_master_ip_local : rabbit_master_ip_local,
    intervalTimer : intervalTimer,
    hosts : hosts
};
