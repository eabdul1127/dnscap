var elasticsearch = require('elasticsearch');

const rabbit_master_ip = "130.245.169.67";
exports.rabbit_master_ip = rabbit_master_ip;

const rabbit_master_ip_local = "192.168.0.26";
exports.rabbit_master_ip_local = rabbit_master_ip_local;

const QUEUE_ASYNC = 10000;
exports.QUEUE_ASYNC = QUEUE_ASYNC;

const intervalTimer = 2000;
exports.intervalTimer = intervalTimer;

const CARGO_ASYNC = 20000;
exports.CARGO_ASYNC = CARGO_ASYNC;

const initTime = new Date().getTime();
exports.initTime = initTime;

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
exports.client = client;

