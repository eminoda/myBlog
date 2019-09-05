---
title: nginx 线上那些实用的最佳实践
tags: nginx
categories:
  - 开发
  - 运维部署
thumb_img: nginx.jpg
date: 2018-10-19 15:28:50
---

虽然公司小，但随着时间的推移各种需求，产线的复杂度逐渐增提升。原先一个线上项目只要解决跨域代理的问题，现在可能会解决各种问题。当没有运维或第三方的支持时，nginx 就由我们万能的前端来对接。何况前端本来就应该能 hold 它。

Nginx 基础，可以参考 [http://eminoda.github.io/2018/08/10/nginx-basic-learn/](http://eminoda.github.io/2018/08/10/nginx-basic-learn/)

以下列出一些使用心得，如果有错误欢迎 issue

## API 接口统一代理

比如有个 3000 端口的 node 云服务，为了更好的管理接口，前端统一以 **/api** 作为接口前缀。

http://test.eminoda.com:81/api/getUsers => http://127.0.0.1:3000/getUsers

```
location ^~ /api/ {
  proxy_set_header host                $host;
  proxy_set_header X-forwarded-for     $proxy_add_x_forwarded_for;
  proxy_set_header X-real-ip           $remote_addr;
  proxy_pass http://127.0.0.1:3000/;
}
```

后缀匹配，解决老业务.do、.action 等接口/页面

```
location ~* /*\.do$ {
  proxy_set_header host                $host;
  proxy_set_header X-forwarded-for     $proxy_add_x_forwarded_for;
  proxy_set_header X-real-ip           $remote_addr;
  proxy_pass http://127.0.0.1:8080;
}
```

## 指定专有域名

可以开设多个子域名，只要云上做了泛解析。

举例，完成接口统一接入

```
server {
  listen          80;
  server_name     api.eminoda.com;

  location / {
    proxy_set_header host                $host;
    proxy_set_header X-forwarded-for	 $proxy_add_x_forwarded_for;
    proxy_set_header X-real-ip           $remote_addr;
    proxy_pass http://127.0.0.1:3000;
  }
}
```

移动端 page

```
server {
  listen          80;
  server_name     h5.eminoda.com;

  ...
}
```

## 指定默认域名

通常会在 nginx 维护多个 server_name，当访问的 host 不存在，但服务器 ip 又被解析，nginx 根据它的机制给出默认的请求域名（可能根据配置文件的排序等）

使用 **default_server** 指定默认 server

```
server {
  listen          80 default_server;
  server_name     www.niu100.com;
  ...
}
```

## 日志管理

安装 nginx 后，会有默认的配置结构。

```
http {
    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';
    access_log  /var/log/nginx/access.log  main;
}
```

如果没有专门的数据分析，作为问题回溯，这样基本够用了。

```
114.34.159.157 - - [18/Oct/2018:13:28:37 +0800] "GET / HTTP/1.1" 403 571 "-" "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36" "-"
```

但是如果有些具体的数据打标，跟踪需求，可以参考如下配置：

业务 cookie 信息的获取

```
set $userId "-";
  if ( $http_cookie ~* "userId=(\S+)(;.*|$)" ){
    set $userId $1;
  }
```

爬虫请求确认，如果你们有 seo 之类的统计

```
  set $spider "-";
  if ($http_user_agent ~* "Baiduspider|Googlebot|Sosospider"){
    set $spider "1";
  }
```

设置 logger format，输出位置

```
log_format  eminoda  '$remote_addr $http_x_forwarded_for - [$time_local] '
                    '$request $status $body_bytes_sent $request_time '
                    '$userId $http_user_agent $spider';

access_log  /var/log/nginx/my-access.log  eminoda;
```

## 整理 nginx 文件

nginx 是一个 http 服务，里面包含多个 server，当项目复杂起来，一定会造成杂乱的配置。这时需要一定的 **整理**，方便日后修改。根据个人习惯吧

不同 server

```
http {
    include /etc/nginx/server/api.eminoda.conf;
    include /etc/nginx/server/static.emionda.conf;
    include /etc/nginx/server/eminoda.*.conf;
    ...
}
```

相同配置抽取

```
server {
    listen          80 default_server;
    server_name     www.eminoda.com;

    # ip拦截
    include /etc/nginx/conf/ipLimit.conf;
    # 业务信息打标
    include /etc/nginx/conf/bussMark.conf;
    # 接口代理代理
    include /etc/nginx/conf/proxy_A.conf;
    include /etc/nginx/conf/proxy_B.conf;
    ...
}
```

## 配置 SSL——https

市面上有很多免费的证书提供商，以下给出阿里云的默认配置

https://www.eminoda.com

```
server {
        listen 443;
        server_name www.eminoda.com;
        ssl on;
        ssl_certificate   cert-eminoda/123.pem;
        ssl_certificate_key  cert-eminoda/123.key;
        ssl_session_timeout 5m;
        ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE:ECDH:AES:HIGH:!NULL:!aNULL:!MD5:!ADH:!RC4;
        ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
        ssl_prefer_server_ciphers on;


	location / {
		...
    }
}
```

## 自动跳转 https 站点

google 对 https 站的 seo 会更好，像安全性等好处这里不做展开

```
server {
  listen 80;
  server_name  www.eminoda.com;

  location / {
    proxy_set_header Host $http_host;
    proxy_set_header host                $host;
    proxy_set_header X-forwarded-for     $proxy_add_x_forwarded_for;
    proxy_set_header X-real-ip           $remote_addr;
    rewrite ^/(.*) https://www.eminoda.com/$1 permanent;
  }
}
```

## 多端的适配

实现在移动端访问 PC 页面，重定向到手机页面

```
if ($http_user_agent ~* "(Mobile|Android|iPad|iPhone|iPod|BlackBerry|Windows Phone)") {
    rewrite ^/ http://h5.eminoda.com redirect;
}
```

## IP 限制

```
if ( $http_x_forwarded_for ~ "106.120.121.128$|106.120.121.129$|106.120.121.1[3-5][0-9]$") {
    rewrite ^/ http://limit.eminoda.com/limit.html rewrite;
}
```

## 短连接

可能因为短信运营商的字符数量限制、业务需要，要尽可能缩短链接长度。

http://l.em.com/123456789/987654321 ==> http://www.eminoda.com/aaa/bbb/123456789?id=987654321

```
server {
  listen          80;
  server_name     l.em.com;
  rewrite ^/(\d+)/(\d+) http://www.eminoda.com/aaa/bbb/$1?id=$2  rewrite;
}
```

## 异常错误页面的指定

服务器宕机、发布，网页的超时等因素，默认 nginx 的错误页面可能令用户产生疑惑。需要指定 error page，提升体验。

```
error_page 404 = http://m.eminoda.com/404;
error_page 405 = http://m.eminoda.com/405;
error_page 500 = http://m.eminoda.com/500;
```
