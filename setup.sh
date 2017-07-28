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
mv ./dns.js ./node_modules/decode/dns.js -f
echo "$0: Please run \"htpasswd /etc/nginx/.htpasswd USERNAME_HERE\" to create login credentials for the
web interface and restart nginx"
