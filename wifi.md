# `GET` /wifi

*Search ssids*

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
    "list": [
        {
            "bssid": "f4:ca:e5:e7:da:59",
            "signalLevel": 2467,
            "ssid": "home"
        },
        {
            "bssid": "f4:ca:e5:e7:da:5b",
            "signalLevel": 2467,
            "ssid": "office"
        },
        {
            "bssid": "f4:ca:e5:e7:da:58",
            "signalLevel": 2467,
            "ssid": "open"
        }
    ]
}
```


# `POST` /wifi

*Connect to a ssid*

### Request:

+ Headers:
    No specific headers needed.

+ Url Params:
    No specific query parameters needed.

+ Body:
+ 
```
{
    "ssid": "potato",
    "psk": "chewbacca"
}
```

***


### Response:

+ Status: **201**




# `GET` /wifi/enabled

*Enable ssids list*

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
    "list": [
        {
            "id": 0,
            "ssid": "iPhone"
        },
        {
            "id": 1,
            "ssid": "potato"
        }
    ]
}
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
            "ssid": "Home"
        }
    ]
}
```
***


# `GET` /wifi/status

*Get Wifi status*

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
    "ssid": "home",
    "ip_address": "192.168.0.51"
}
```
***


