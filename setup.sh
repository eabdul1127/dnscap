echo "$0: install nodejs packages"
npm install
echo "$0: install and configure nginx"
apt-get install nginx -y
apt-get install apache2-utils -y
mv ./default /etc/nginx/sites-available/default -f
service nginx restart
echo "$0: update dns decode"
mv ./dns.js ./node_modules/decode/dns.js -f
echo "$0: Please run \"htpasswd /etc/nginx/.htpasswd USERNAME_HERE\" to create login credentials for the
web interface and restart nginx"
