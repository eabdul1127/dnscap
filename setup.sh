echo "$0: install nodejs packages"
npm install
echo "Decrypting rsa private key"
tar xfvz cert.tgz
openssl rsa -in dnscap_compas_cs_stonybrook_edu.key -out dnscap_compas_cs_stonybrook_edu_unencrcypted.key
echo "$0: install and configure nginx"
wget https://nginx.org/download/nginx-1.12.1.tar.gz
tar xfvz nginx-1.12.1.tar.gz
cd nginx-1.12.1/
wget https://www.openssl.org/source/openssl-1.0.2l.tar.gz
tar xfvz openssl-1.0.2l.tar.gz
./configure --prefix=$HOME/nginx --with-http_ssl_module --with-openssl=openssl-1.0.2l
make -j 4
make install
echo "update nginx.conf"
mv $HOME/dnscap/nginx.conf $HOME/nginx/conf/nginx.conf
pm2 startup
pm2 start /$HOME/dnscap/dnscap.js --watch -- 5002 5003 5004
pm2 save
echo "Run './node_modules/htpasswd/bin/htpasswd -c $HOME/dnscap/.htpasswd USER_NAME' to setup authentication credentials, then start nginx"
