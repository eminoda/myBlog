---
title: nginx默认server_name
date: 2017-07-24 11:21:05
tags:
  - nginx
categories: nginx
comments: true
---

# default_server
> Nginx 的虚拟主机是通过HTTP请求中的Host值来找到对应的虚拟主机配置，如果找不到呢？那 Nginx 就会将请求送到指定了 default_server 的 节点来处理

````
server {
  listen       80  default_server;
  server_name  your domain;
  ...
}
````

````
#对于没有匹配的 Host 值时
server {
  listen       80  default_server;
  server_name  _;
  return       444;
}
````

# [参考](http://www.oschina.net/question/12_3565)
