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
mv ./dns.js ./node_modules/pcap/decode/dns.js
echo "update nginx.conf"
mv ./nginx.conf /home/nginx/conf/nginx.conf
pm2 startup
pm2 start /home/dnscap/host.js --watch -- 5001 5002 5003
pm2 save
