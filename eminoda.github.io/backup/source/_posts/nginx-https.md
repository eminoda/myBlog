---
title: nginx-https
date: 2017-07-06 09:26:49
tags:
  - nginx
  - nginx-https
categories: nginx
comments: true
---

# 配置nginx https
1. 生成秘钥，置于配置文件夹下。server.key
````
# 这里有第三方提供
-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEAmz8UZVIkbGtHqmvWTlup199idIfwlhFWToSHha/pyGDdULY4
HK3SszivTXQij5VM1HF86WQYHXhebXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
aNv8fjuuPaSQksZd0L8xcQfb3337L3HoSBCAh1ed/4qU
-----END RSA PRIVATE KEY-----

````

2. nginx开启443端口server
````
server {
  listen 443;
  server_name  eminoda.github.io;
  root         /usr/share/xxxx
  #....
  #....
  #....
}
````