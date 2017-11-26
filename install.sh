#!/bin/bash

apt-get update
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -

apt-get install -y nodejs
apt-get install -y git
apt-get install -y hostapd 
apt-get install -y dnsmasq
apt-get install -y imagemagick
apt-get install -y mongodb-server
apt-get install -y nginx
apt-get install -y libcairo2-dev
apt-get install -y libjpeg-dev 
apt-get install -y libgif-dev
apt-get install -y ffmpeg

npm install pm2 -g

