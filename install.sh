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

npm install pm2 -g
npm install node-gyp -g

echo "Install WAWY CAMERA API"

mkdir ${DESTINATION}
chown -R pi:pi ${DESTINATION}
sudo -u pi bash << EOF

cd ${DESTINATION}
wget http://wawy.io/builds/cam-api-tarball/cam-api-latest.tgz

# Extract latest
tar -xvf cam-api-latest.tgz

# Delete tarball
rm -rf cam-api-latest.tgz

# Install dependencies
cd ${DESTINATION}/api
npm install

sudo -s

# Start API server
npm start


