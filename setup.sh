echo "$0: install nodejs packages"
npm install
echo "$0: install and configure nginx"
wget https://nginx.org/download/nginx-1.12.1.tar.gz
tar xfvz nginx-1.12.1.tar.gz
cd nginx-1.12.1/
./configure --prefix=$HOME/nginx
make -j 4
make install
echo "$0: update dns decode"
mv /home/mferdman/dnscap/dns.js /home/mferdman/dnscap/node_modules/pcap/decode/dns.js
echo "update nginx.conf"
mv /home/mferdman/dnscap/nginx.conf /home/mferdman/nginx/conf/nginx.conf
pm2 startup
pm2 start /home/mferdman/dnscap/host.js --watch -- 5001 5002 5003
pm2 save
