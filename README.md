This is a project whos purpose is to manage the traffic of DNS resolutions between a host ZeroMQ network  to eventually be indexed in an elasticsearch server written entirely with Node.js and html.

# Brief descriptions of files:
cert.tgz: this is a self signed certificate for a web based graphical interface that can be viewed for the DNSCap traffic currently being collected.

config.js: set of configuration fields that tailor this to the Stony Brook Computer Science cloud network

cron.reboot.sh: script to restart pm2 daemon in the event that the machine reboots, currently inactive due to priveledge limitations on the machine this is deployed

dnscap.js: primary running script responsible for pulling traffic out of ZeroMQ(see Dnspcap https://github.com/eabdul1127/dnspcap) and sending the resolution to a RabbitMQ queue for the purposes of being indexed by another script

graph.html: simple html graph displaying DNS resolution traffic in real time

nginx.conf: configuration file that the nginx web server is currently running on

package.json: all npm services necessary to get this to run

rabbitmq_to_elasticsearch.js: script responsible for handling traffic between the RabbitMQ queue and indexing them properly within elasticsearch

setup.sh: general script created to install all necessary packages and run the dnscap daemon. The only thing remaining will be to setup http authentication credentials with nginx and start the nginx server file that has been installed

# Usage
In a situatuion where you are starting from scratch then to get started (assuming dnspcap is currently running) you can simply just clone the repository, run the setup script as root, setup credentials, and start nginx. In more common scenarios where you will be pushing updates you will want ssh privledges to the relevant machines (whos IP addresses can be provided by appropriate faculty) which you can then use to edit and test the code.

# Notable Tools and Services

PM2: Node.js script daemon service that allows all of the running scripts to persist

RabbitMQ: simple queue that allows authorized machines to take requests and pull data out of relevant queues.

Nginx: Hosts server that displays the graph of web traffic

Elasticsearch: stores and indexes all incoming requests and allows them to be easily searchable
