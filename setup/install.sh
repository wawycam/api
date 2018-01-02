#!/bin/bash


echo ""
echo "WaWy Camera Installer"
echo ""

DESTINATION="/home/pi/wawycam"

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
apt-get install -y libpango1.0-dev
apt-get install -y build-essential
apt-get install -y g++
apt-get install -y ffmpeg

echo "Install PICAM"

wget https://github.com/iizukanao/picam/releases/download/v1.4.6/picam-1.4.6-binary-stretch.tar.xz
tar -xvf picam-1.4.6-binary-stretch.tar.xz
mv picam-1.4.6-binary-stretch $DESTINATION/picam
rm -rf picam-1.4.6-binary-stretch.tar.xz

echo "Install NPM Global Packages"

npm install pm2 -g
npm install node-gyp -g


