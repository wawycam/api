# WaWy Camera API

WaWy Camera API is a set of APIs written in Nodejs that allow any thirds applications like Smartphone App or Web App to take photo, create a timelapse or streaming a video from a Raspberry Pi.

This API is the main piece of an entiere project call "WAWY". More information about WaWy can be found here [http://wawy.io](https://wawy.io)

# Quick Install

Wanted to start playing with WaWy Camera API in a couple of minutes ? Just ```wget https://wawy.io/install.sh``` then ```chmod u=rx install.sh``` and ```sudo ./install.sh```

After installation completed, the API should be up and running on port 3001.

```
curl "http://localhost:3001/service/status" \
     -H 'Content-Type: application/json; charset=utf-8' \
     -d $'{}'
```

You can also send a request to the API from your computer. Just be sure that your raspberry on your computer are on the same Wifi network and replace "localhost" by the name of your raspberry (can be found in ```/etc/hostname```)

```
curl "http://{your-raspberypi-name}.local:3001/service/status" \
     -H 'Content-Type: application/json; charset=utf-8' \
     -d $'{}'
```

*Note: depending on your environmment, the dependencies installation can take up to 10 minutes on a Rapsberry PI 3*


# Install (development mode)

Fist, well, clone this repository ;-)

As some functionnalities require dependencies, please run the installer before.

```
sudo ./setup/install.sh
```

*Note: On a Rapsberry PI 3, dependencies installation can take up to 10 minutes.*

```
npm install
```

# Running

```
sudo npm run dev
```

The APIs is running on your Raspberry PI on port 3001 in "development" mode.

Be sure that the Rapsberry Pi and your Computer are on the same WiFi. 

You can request the API depending on the name of your Rapsberry PI. The name can be found by typing
```
/etc/hostname
```

Open up a terminal on your computer and type the folowing command (please change "wawycam" according to the name of your Raspberry Pi)

```
curl "http://wawycam.local:3001/service/status" \
     -H 'Content-Type: application/json; charset=utf-8' \
     -d $'{}'
```

Wich should return this result

```
HTTP/1.1 200 OK
Server: API
Content-Type: application/json
Content-Length: 7
Access-Control-Allow-Origin: *
Access-Control-Allow-Headers: Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, Api-Version, Response-Time
Access-Control-Allow-Methods: GET
Access-Control-Expose-Headers: Api-Version, Request-Id, Response-Time
Connection: close
Content-MD5: I2N2ZdnviPIQIH8gzt1yIQ==
Date: Sun, 26 Nov 2017 12:49:48 GMT
Api-Version: 1.0.0
Request-Id: f7db37ca-2264-40da-9410-c7310a710441
Response-Time: NaN

"alive"
```

# Video Streaming

This API allow you to stream a real-time video. 
The API use [Picam](https://github.com/iizukanao/picam) for recording and ffmpeg+nginx to broadcast.

Please be sure to run ```sudo ./[wawy-cam-dir]/setup/install.sh``` to have all dependencies installed before use video broadcasting.

Configure Nginx :

```
cd /etc/nginx/sites-available
sudo mv default default.conf
sudo cp [wawy-cam-dir]/setup/nginx-default-conf ./default
sudo service nginx restart
```

To start broadcasting :

```
curl -X "POST" "http://localhost:3001/video/broadcast" \
     -H 'Content-Type: application/json; charset=utf-8' \
     -d $'{}'
```

The API should respond 

```
{
	"url":{
		"local":"http://{your-camera-name}.local/live/index.m3u8",
		"remote":"http://xxx.xxx.xxx.xxx/live/index.m3u8"}}
```

Open a video player like VLC and copy/paste the "local" url. You should see the video streaming.

*Note : The HTTP Live Streaming latency is 3-4 seconds.*


# API DOCUMENTATION

# VIDEO

## `POST` /video/broadcast

*Start broadcasting video*

### Request:

+ Headers:
    No specific headers needed.

+ Url Params:
    No specific query parameters needed.

+ Body:
```
{}
```

***


### Response:

+ Status: **200**

+ Body:
+ 
```
{
	"url":{
		"local":"http://wawycam.local/live/index.m3u8",
		"remote":"http://xxx.xxx.xxx.xxx/live/index.m3u8"
	}
}
```

## `DELETE` /video/broadcast

*Stop broadcasting video*

### Request:

+ Headers:
    No specific headers needed.

+ Url Params:
    No specific query parameters needed.

+ Body:
```
{}
```

***

### Response:

+ Status: **204**


# PHOTO

## `POST` /photo

*Take a photo*

### Request:

+ Headers:
    No specific headers needed.

+ Url Params:
    No specific query parameters needed.

+ Body:
```
{}
```

***

### Response:

+ Status: **200**

+ Body:
+ 
```
{
	"photo": "025d7c1e-3766-45c1-bf41-ed0c4469c08f.png"
}
```

## `POST` /photo/filter

*Apply a filter on a photo.  
Filters can be : 'xpro2', 'willow', 'lofi', 'juno', 'clarendon', '1977'*

### Request:

+ Headers:
    No specific headers needed.

+ Url Params:
    No specific query parameters needed.

+ Body:
+ 
```
{
    "filter": "xpro2",
    "photo": "timelapse-2017-11-20-10:29/0002.png"
}
```

## `POST` /photo/timelapse

*Start a timelapse*

### Request:

+ Headers:
    No specific headers needed.

+ Url Params:
    No specific query parameters needed.

+ Body:
```
{
    "interval": "30"
}
```

***
### Response:

+ Status: **201**


## `DELETE` /photo/timelapse

*Stop a timelapse*

### Request:

+ Headers:
    No specific headers needed.

+ Url Params:
    No specific query parameters needed.

+ Body:
```
{}
```

***

### Response:

+ Status: **204**

## `POST` /photo/timelapse/footage

*Create a timelapse video based on a photos series.  
Note: this route call WaWy Microservice API [read more](https://wip.io)*


### Request:

+ Headers:
    No specific headers needed.

+ Url Params:
    No specific query parameters needed.

+ Body:
+ 
```
{
    "folder": "timelapse-2017-11-20-10:29"
}
```


## `DELETE` /photo/timelapse/{timelapseFolder}

*Delete timelapse images and folder*

### Request:

+ Headers:
    No specific headers needed.

+ Url Params:
    timelapse folder

+ Body:
```
{}
```

***

### Response:

+ Status: **204**


## `GET` /photo/timelapse/{timelapseFolder}/last

*Get last photo of a timelapse*

### Request:

+ Headers:
    No specific headers needed.

+ Url Params:
    timelpasefolder.

+ Body:
```
{}
```

***

### Response:

+ Status: **200**

+ Body:
+ 
```
{
	"photo": "0044.png"
}
```

## `GET` /photo

*List all photos in ./snap folder*

### Request:

+ Headers:
    No specific headers needed.

+ Url Params:
    No specific query parameters needed.

+ Body:
```
{}
```

***

### Response:
+ Status: **200**

+ Body:
+ 
```
{
  "photos": [
    "snap/025d7c1e-3766-45c1-bf41-ed0c4469c08f.png",
    "snap/538946eb-03f0-42ee-8a40-20a9c829b42c.png",
    "snap/7e9b8d57-fc68-4912-9993-f119137088ea.png",
    "snap/801c2edf-9ee7-47bc-8e05-702238354326.png",
    "snap/be02b3c1-a3f1-4c73-9289-22a04ec5a5aa.png",
    "snap/timelapse-2017-11-20-10:29/0001.png",
    "snap/timelapse-2017-11-20-10:29/0001_1977.png",
    "snap/timelapse-2017-11-20-10:29/0002.png",
    "snap/timelapse-2017-11-20-10:29/0002_lofi.png",
    "snap/timelapse-2017-11-20-10:29/0002_xpro2.png",
    "snap/timelapse-2017-11-20-10:29/0003.png",
    "snap/timelapse-2017-11-20-10:29/480x_0001.png",
    "snap/timelapse-2017-11-20-10:29/480x_0002.png",
    "snap/timelapse-2017-11-20-10:29/480x_0003.png",
    "snap/timelapse-2017-11-20-10:29/photos.tgz",
    "snap/timelapse-2017-11-20-10:29/timelapse.mp4"
  ]
}
```

#WAWY

## `GET` /wawy

*Return WaWy informations*

### Request:

+ Headers:
    No specific headers needed.

+ Url Params:
    No specific query parameters needed.

+ Body:
```
{}
```

***

### Response:

+ Status: **200**

+ Body:
+ 
```
{
  "__v": 0,
  "_id": "5a11a80f3208f10ce34944bb",
  "createdAt": "2017-11-19T15:49:35.953Z",
  "isBroadcasting": false,
  "isSnapping": false,
  "name": "wawycam",
  "rotation": 270,
  "serial": "00000000fe864d2f",
  "updatedAt": "2017-11-26T11:30:09.938Z",
  "timelapses": [
    {
      "_id": "5a12aea294151736e654f5d7",
      "count": 3,
      "name": "timelapse-2017-11-20-10:29",
      "status": "processing",
      "updatedAt": "2017-11-20T10:30:27.421Z",
      "photos": [
        {
          "_id": "5a12aeaf94151736e654f5d8",
          "name": "0001.png"
        },
        {
          "_id": "5a12aeb994151736e654f5d9",
          "name": "0002.png"
        },
        {
          "_id": "5a12aec394151736e654f5da",
          "name": "0003.png"
        }
      ]
    },
    {
      "_id": "5a1aa5b7b134fd217008bdf2",
      "count": 0,
      "name": "timelapse-2017-11-26-11:29",
      "photos": []
    }
  ]
}
```

## `POST` /wawy/name

*Change Camera name*

### Request:

+ Headers:
    No specific headers needed.

+ Url Params:
    No specific query parameters needed.

+ Body:
```
{
    "name": "wawycam"
}
```

***

### Response:

+ Status: **201**



## `POST` /wawy/rotation/{degree}

*Change Camera Rotation Lens*

### Request:

+ Headers:
    No specific headers needed.

+ Url Params:
    rotation lens in degree

+ Body:
```
{}
```

***

### Response:

+ Status: **201**



## `POST` /wawy/qrcode

*Create QR Code based on WaWy's name*

### Request:

+ Headers:
    No specific headers needed.

+ Url Params:
    No specific query parameters needed.

+ Body:
```
{}
```

***

### Response:

+ Status: **201**


## `GET` /wawy/qrcode.svg

*Return WaWy QRCode in SVG*

### Request:

+ Headers:
    No specific headers needed.

+ Url Params:
    No specific query parameters needed.

+ Body:
```
{}
```

***

### Response:

+ Status: **200**

+ Body:

```
<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg version="1.1" baseProfile="full" width="132" height="132" viewBox="0 0 132 132" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:ev="http://www.w3.org/2001/xml-events">
<rect x="0" y="0" width="132" height="132" fill="rgb(255,255,255)" fill-opacity="1.00" />
<defs><rect id="p" width="4" height="4" /></defs>
<g fill="rgb(0,0,0)" fill-opacity="1.00">
<use x="16" y="16" xlink:href="#p" />...

```


# SERVICE

## `GET` /service/version

*Return API version*

### Request:

+ Headers:
    No specific headers needed.

+ Url Params:
    No specific query parameters needed.

+ Body:
```
{}
```

***

### Response:

+ Status: **200**

+ Body:
+ 
```
{
	"version": "1.0.0"
}
```

## `GET` /service/status

*Return API status*

### Request:

+ Headers:
    No specific headers needed.

+ Url Params:
    No specific query parameters needed.

+ Body:
```
{}
```

***

### Response:

+ Status: **200**

+ Body:
+ 
```
"alive"
```

## `GET` /service/info

*Return WaWy Uptime and Disk strorage information*

### Request:

+ Headers:
    No specific headers needed.

+ Url Params:
    No specific query parameters needed.

+ Body:
```
{}
```

***

### Response:

+ Status: **200**

+ Body:
+ 
```
{
  "disk": {
    "free": "3.32",
    "total": "7.19"
  },
  "uptime": 1511538891
}
```

## `GET` /service/serial

*Return WaWy Serial number*

### Request:

+ Headers:
    No specific headers needed.

+ Url Params:
    No specific query parameters needed.

+ Body:
```
{}
```

***

### Response:

+ Status: **200**

+ Body:
+ 
```
{
	"serial":"00000000fe864d2f"
}
```

## `POST` /service/reboot

*reboot wawy camera*

### Request:

+ Headers:
    No specific headers needed.

+ Url Params:
    No specific query parameters needed.

+ Body:
```
{}
```

***

### Response:

+ Status: **201**


## `POST` /service/halt

*halt wawy camera*

### Request:

+ Headers:
    No specific headers needed.

+ Url Params:
    No specific query parameters needed.

+ Body:
```
{}
```

***

### Response:

+ Status: **201**


# WIFI

## `GET` /wifi

*Return ssids list*

### Request:

+ Headers:
    No specific headers needed.

+ Url Params:
    No specific query parameters needed.

+ Body:
+ 
```
{}
```

***

### Response:

+ Status: **200**

+ Body:
+ 
```
{
    "list": [
        {
            "bssid": "f4:ca:e5:e7:da:52",
            "signalLevel": 2467,
            "ssid": "home"
        },
        {
            "bssid": "f4:ca:e5:e7:da:5b",
            "signalLevel": 2467,
            "ssid": "office"
        },
        {
            "bssid": "f4:ca:e5:e7:ca:52",
            "signalLevel": 2467,
            "ssid": "open"
        }
    ]
}
```  


## `POST` /wifi

*Associate to a ssid*

### Request:

+ Headers:
    No specific headers needed.

+ Url Params:
    No specific query parameters needed.

+ Body:
+ 
```
{
    "ssid": "home",
    "psk": "secret"
}
```

***


### Response:

+ Status: **201**



## `GET` /wifi/enabled

*Return enabled ssids list*

### Request:

+ Headers:
    No specific headers needed.

+ Url Params:
    No specific query parameters needed.

+ Body:
+ 
```
{}
```

***


### Response:

+ Status: **200**

+ Body:
+ 
```
{
    "list": [
        {
            "id": 0,
            "ssid": "iPhone"
        },
        {
            "id": 1,
            "ssid": "home"
        }
    ]
}
```


## `GET` /wifi/status

*Get Wifi status*

### Request:

+ Headers:
    No specific headers needed.

+ Url Params:
    No specific query parameters needed.

+ Body:
+ 
```
{}
```

***


### Response:

+ Status: **200**

+ Body:
+ 
```
{
    "ssid": "home",
    "ip_address": "192.168.0.51"
}
```

