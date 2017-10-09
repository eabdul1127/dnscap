const rabbit_master_ip = 'amqp://rabbitmqadmin:rabbitmqadmin@130.245.169.67';
const rabbit_master_ip_local = 'amqp://rabbitmqadmin:rabbitmqadmin@192.168.0.26';
const intervalTimer = 30000;
const CARGO_ASYNC = 100;
const QUEUE_ASYNC = 100;
const interfaces = ['eno1', 'eno2', 'eno3'];
const index_setting = "dnscap";
const type_setting = "udp_requests"
const hosts = [
  "192.168.0.205:9200", "192.168.0.206:9200", "192.168.0.208:9200",
  "192.168.0.209:9200", "192.168.0.210:9200", "192.168.0.212:9200",
  "192.168.0.213:9200", "192.168.0.214:9200", "192.168.0.215:9200",
  "192.168.0.216:9200", "192.168.0.217:9200", "192.168.0.218:9200",
  "192.168.0.219:9200", "192.168.0.221:9200", "192.168.0.222:9200",
  "192.168.0.223:9200", "192.168.0.224:9200", "192.168.0.225:9200",
  "192.168.0.226:9200", "192.168.0.227:9200", "192.168.0.228:9200",
  "192.168.0.229:9200"
];

module.exports = {
    CARGO_ASYNC : CARGO_ASYNC,
    QUEUE_ASYNC : QUEUE_ASYNC,
    index_setting : index_setting,
    type_setting : type_setting,
    rabbit_master_ip : rabbit_master_ip,
    rabbit_master_ip_local : rabbit_master_ip_local,
    intervalTimer : intervalTimer,
    interfaces : interfaces,
    hosts : hosts
};
