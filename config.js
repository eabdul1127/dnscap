const rabbit_master_ip = 'amqp://rabbitmqadmin:rabbitmqadmin@130.245.168.178';
const rabbit_master_ip_local = 'amqp://rabbitmqadmin:rabbitmqadmin@192.168.0.159';
// const intervalTimer = 30000;
const intervalTimer = 600000;
const CARGO_ASYNC = 100;
const QUEUE_ASYNC = 100;
const index_setting = "dnscap-new";
const type_setting = "udp_requests"
const hosts = [
  "192.168.0.191:9200", "192.168.0.182:9200", "192.168.0.183:9200", 
  "192.168.0.180:9200", "192.168.0.187:9200", "192.168.0.189:9200", 
  "192.168.0.184:9200" 
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
