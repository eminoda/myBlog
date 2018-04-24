---
title: nginx-proxy_pass 代理注意点
date: 2018-02-05 22:57:21
tags: nginx
categories: nginx
comments: true
---

# [proxy_pass](http://nginx.org/en/docs/http/ngx_http_proxy_module.html)

# 几个场景的应用
1. 以.api后缀结尾代理到后台server
http://127.0.0.1/test.api?param=123 ==> http://127.0.0.1:3000/test.api?param=123
````
location ~* \.(api)$ {
    proxy_pass http://127.0.0.1:3000;
}
````

2. 以.api后缀结尾代理到后台server某路径下
http://127.0.0.1/test2.api?param=123 ==> http://127.0.0.1:3000/foo/test2.api?param=123
````
location ~* \.(api)$ {
    proxy_pass http://127.0.0.1:3000/foo$request_uri;
}
````

3. 针对某指定路径分别处理不同路由
http://127.0.0.1/router/pc?param=123 ==> http://127.0.0.1:3000/new/pc?param=123
http://127.0.0.1/router/mobile?param=123 ==> http://127.0.0.1:3000/router/mobile?param=123
````
location /router {
    rewrite /router/(pc) /new/$1 break;
    proxy_pass http://127.0.0.1:3000;
}
````

# 注意点
1. location为正则等条件时，不能在代理中用URI
````
nginx: [emerg] "proxy_pass" cannot have URI part in location given by regular expression, or inside named location, or inside "if" statement, or inside "limit_except" block in F:\development\nginx-1.13.8/conf/nginx.conf:76
````

2. rewrite break后，request URI将被更改
http://127.0.0.1/router/mobile?param=123 ==> http://127.0.0.1:3000/rewritetest/mobile?param=123
即：最终链接=proxy url + request url（去除 location string）
````
location /router {
    rewrite /router/(pc) /new/$1 break;
    proxy_pass http://127.0.0.1:3000/rewritetest;
}
````

3. 使用内置变量，$request_uri，匹配的URI将替换源request URI