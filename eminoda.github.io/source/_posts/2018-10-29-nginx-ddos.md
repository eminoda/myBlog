---
title: 使用 nginx 防刷
tags: nginx
categories:
  - 前端
  - nginx
no_sketch: true
date: 2018-10-29 17:27:30
---


今天，没错就是今天，发生一个意料之中的线上问题：服务器被攻击，页面疯狂被刷，导致node服务cpu 100%，页面渲染直接被崩掉。

这类问题对于互联网开发来说，见怪不怪。什么 **Ddos、CC** 等等吧，总之就是被人盯上了，想办法攻守转换吧。

**解决方式**
**云方案**
对于像我们一样小公司来说，为了减少运维成本，都用上了xx云。对于国内一些的云肯定提供了 **解决方案**
- 扩容，买机器硬杠
- 使用防xx攻击的付费服务
- 从访问日志中找出ip，添加黑名单

当然这些不是重点，类似方案专业的运维肯定能提供很多。主要引出 Nginx 方案

**Nginx限流**
如果你还未使用过nginx，不防看下这篇文章 [nginx 线上那些实用的最佳实践](https://eminoda.github.io/2018/10/19/nginx-product-practice/) ，可能会有架设一台Nginx的想法。

**解决思路**：在后台服务，比如node、java之上，专门提供一台nginx，负责各种请求的接入。因为覆盖了所有请求，我们可以对非法的请求通过nginx来做限流，或者我们业务上的一些代理转发等。

1. 链接数限制

[http://nginx.org/en/docs/http/ngx_http_limit_conn_module.html#limit_conn](http://nginx.org/en/docs/http/ngx_http_limit_conn_module.html#limit_conn)
````
http{
    limit_conn_zone     $binary_remote_addr     zone=perip:10m;
    server{
        location = / {
            # 限制链接数1个
            limit_conn perip 1;
            ...
        }
    }
}
````

测试：并发发送5个request

nginx.log
````
58.247.91.82 - - [29/Oct/2018:16:49:36 +0800] "GET /?r=42.827815233418384 HTTP/1.1" 503 213 "-" "-" "-"
58.247.91.82 - - [29/Oct/2018:16:49:36 +0800] "GET /?r=20.655923601902337 HTTP/1.1" 503 213 "-" "-" "-"
58.247.91.82 - - [29/Oct/2018:16:49:36 +0800] "GET /?r=53.32509284109306 HTTP/1.1" 503 213 "-" "-" "-"
58.247.91.82 - - [29/Oct/2018:16:49:37 +0800] "GET /?r=81.48015710993863 HTTP/1.1" 200 12715 "-" "-" "-"
58.247.91.82 - - [29/Oct/2018:16:49:37 +0800] "GET /?r=26.774798805224908 HTTP/1.1" 200 12715 "-" "-" "-"
````
结果：只有2个请求状态200，符合配置预期

2. 访问频率限制
[http://nginx.org/en/docs/http/ngx_http_limit_req_module.html](http://nginx.org/en/docs/http/ngx_http_limit_req_module.html)
````
http{
    limit_req_zone      $binary_remote_addr     zone=reqps:10m rate=10r/s;
    server{
        location = / {
            limit_req zone=reqps burst=2;
            ...
        }
    }
}
````
测试：并发5个请求

````
limit_req_zone      $binary_remote_addr     zone=reqps:10m rate=10r/s;
limit_req zone=reqps; 
````
{% asset_img 1.png %}

````
limit_req_zone      $binary_remote_addr     zone=reqps:10m rate=10r/s;
limit_req zone=reqps burst=3; #最多额外允许3个请求
````
{% asset_img 2.png %}

````
limit_req_zone      $binary_remote_addr     zone=reqps:10m rate=1r/s; #每秒设置1个请求
limit_req zone=reqps burst=3; #最多额外允许3个请求
````
**注意：当rate为1r/s时，burst的请求将延至执行**
{% asset_img 3.png %}

````
limit_req_zone      $binary_remote_addr     zone=reqps:10m rate=1r/s; #每秒设置1个请求
limit_req zone=reqps burst=3 nodelay; #最多额外允许3个请求
````
**设置nodelay，取消延迟；**
{% asset_img 4.png %}