const rabbit_master_ip = '130.245.169.67';
const rabbit_master_ip_local = '192.168.0.26';
const intervalTimer = 2000;
const CARGO_ASYNC = 100;
const interfaces = ['eno1', 'eno2', 'eno3'];

module.exports = {
    CARGO_ASYNC : CARGO_ASYNC,
    rabbit_master_ip : rabbit_master_ip,
    rabbit_master_ip_local : rabbit_master_ip_local,
    intervalTimer : intervalTimer,
    interfaces : interfaces,
};
