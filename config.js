const rabbit_master_ip = "130.245.169.67";
const rabbit_master_ip_local = "192.168.0.26";
const QUEUE_ASYNC = 10000;
const intervalTimer = 2000;
const CARGO_ASYNC = 20000;
const interfaces = ['eno1', 'eno2', 'eno3'];

module.exports = {
    QUEUE_ASYNC : QUEUE_ASYNC,
    CARGO_ASYNC : CARGO_ASYNC,
    rabbit_master_ip : rabbit_master_ip,
    intervalTimer : intervalTimer,
    interfaces : interfaces
};
