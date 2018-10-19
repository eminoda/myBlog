---
title: nginx基础学习进阶
tags: nginx
categories:
  - 前端
  - nginx
no_sketch: true
date: 2018-08-10 17:36:36
---


> 内容摘自[nginx官方文档](http://nginx.org/en/docs/beginners_guide.html)，自己配合实例更细致的熟悉nginx

# 命令启动，停止，重启 配置
一旦nginx运行起来，通过如下方式invoking nginx的控制变更：
````
nginx -s stop // 停服
nginx -s quit // 优雅的停服
nginx -s reload // 重启配置文件
nginx -s reopen // 重新打开log文件
````

## quit 和 stop有何区别？
quit会等最近一个request响应结束后退出进程（graceful shutdown）。
比如一个服务会hold起数秒，即使执行了quit命令，还是会等结果处理完毕后关闭nginx。
stop则马上停止。

## 配置文件错误，reload是否会影响线上？
不会，如果configure错误，nginx将roll back回老的配置文件，直到配置正确才会真正reload起效。

## 除了stop等，怎么停止nginx服务？
````
ps -ax | grep nginx
26318 ?        Ss     0:00 nginx: master process nginx
26351 ?        S      0:00 nginx: worker process
26357 pts/3    R+     0:00 grep --color=auto nginx
# 需要停止master进程
kill -s QUIT 26318
````

## [了解更多nginx控制命令](http://nginx.org/en/docs/control.html)

# nginx配置文件的结构
````js
events {
    worker_connections 1024;
}
http {
    server {
        location / {
            proxy_pass http://127.0.0.1:8080;
        }
    }
}
````

# 文件服务
静态文件管理也是Nginx最大的特色之一（托管图片资源，静态HTML文件）

## 使用场景
比如如下是个存放静态资源的路径
````
/root/mydata/test/www  # 存放html
/root/mydata/test/images # 存放资源
````

**访问静态页面**
location指定以 **/** 为前缀（prefix），匹配请求地址的URI，匹配到的URI将添加到root指令的地址后。
访问：http://test.eminoda.com:81/test.html
nginx按照：/root/mydata/test/www/test.html 输出文件
````
location / {
    root   /root/mydata/test/www;
}
````

**访问图片等资源**
匹配以 **/images/** 开始的资源请求地址，**注意，location / 也是可以匹配到的，但会根据实际路径有优先关系**
访问：http://test.eminoda.com:81/images/yuyu.jpg
nginx按照：/root/mydata/test/images/yuyu.jpg 输出文件
````
location /images/ {
    root /root/mydata/test;
}
````
## root 和 alias的区别？
| 指令 | 范围 |
| --- | --- |
| root | http, server, location, if in location |
| alias | location |

访问：http://test.eminoda.com:81/versionChange/yuyu.jpg
nginx按照：/root/mydata/test/images/yuyu.jpg 输出文件
````
# 模拟一种常见，因为某些需求，更改了资源路径，但不能影响原有资源的输出访问
location /versionChange/ {
    alias /root/mydata/test/images/;
}
````

**注意：斜杠问题**，结合上例，比较有何不同
````
location /versionChange/ {
    alias /root/mydata/test/images; #error /root/mydata/test/imagesyuyu.jpg
}
location /versionChange {
    alias /root/mydata/test/images; #ok
}
````


## 怎么权衡root和alias的使用？
如果location匹配路径和指令的value最后部分相同时，建议使用root。
````
location /images/ {
    alias /data/w3/images/;
}
# better
location /images/ {
    root /data/w3;
}
````

## alias 和 正则匹配问题？
如果location 包含regex expression，就会匹配正则捕获内容，在alias中替换**（而非替换整个location路径）**。
访问：http://test.eminoda.com:81/yuyu.jpg
````
location ~ ^/(.+\.(?:gif|jpg|png))$ {
    alias /root/mydata/test/images/$1;
}
````

访问：http://test.eminoda.com:81/foo/yuyu.jpg
````
location ~ ^/foo/(.+\.(?:gif|jpg|png))$ {
    alias /root/mydata/test/images/$1; #error /root/mydata/test/images/foo/yuyu.jpg
}
````

# [设置简单的代理Proxy服务](http://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_pass)
使用nginx代理，可能是解决我们日常开发，服务调用的最大原因

在了解proxy之前，先看下location路径匹配
## location
| 指令 | 范围 | 语法 |
| --- | --- | --- |
| location | server, location | location [ = &#124; ~ &#124; ~* &#124; ^~ ] uri { ... } |

location依赖request的URI。按优先级排序。
=: 绝对匹配，exact match
~*：正则（忽略大小写），case-insensitive matching
~：正则，case-sensitive matching
^~：不能和uri定义的配置重复，prefix match
uri：路径URI匹配，uri match

**举个经典的范例**
````
location = / {
    [ configuration A ]
}

location / {
    [ configuration B ]
}

location /documents/ {
    [ configuration C ]
}

location ^~ /images/ {
    [ configuration D ]
}

location ~* \.(gif|jpg|jpeg)$ {
    [ configuration E ]
}
````
- 首先命中绝对匹配
- 如果有符合regex规则，则进入正则匹配。
- 剩下根据uri匹配

**normalized URI 标准化URI**
- decode参数
- 解析相对路径
- 解析斜杠（merge_slashes）

**merge_slashes**

| key | value |
| --- | --- |
| Syntax | merge_slashes on &#124; off; |
| Default | merge_slashes on; |
| Context | http, server |

打开 merge_slashes 配置，将允许 //foo之类多斜杠的路径匹配

## proxy_pass
| 指令 | 范围 |
| --- | --- |
| proxy_pass | location, if in location, limit_except |

**proxy_pass定义了URI的区别**

http://127.0.0.1:9000/users 提供服务

**specified without a URI**（忽略URI）
访问：http://test.eminoda.com:81/users
````
location /users {
    proxy_pass http://127.0.0.1:3001;
}
````
request URI在location匹配后，原样传送给server

**specified with a URI** （指定URI）
访问：http://test.eminoda.com:81/withinURI/users
````
location /withinURI/ {
    proxy_pass http://127.0.0.1:9000/;
}
````
如果proxy_pass is specified with a URI，当request URI在location命中，URI将替换被location匹配中的request URI的part（注意location 需要后面维护个/）
> If the proxy_pass directive is specified with a URI, then when a request is passed to the server, the part of a normalized request URI matching the location is replaced by a URI specified in the directive

**注意：location 需要后面维护个/**
访问：http://test.eminoda.com:81/withinURIusers 注意这里故意没有写 **/**
````
location /withinURI {
    proxy_pass http://127.0.0.1:9000/;
}
````

**修改配置：注意location的/**
访问：http://test.eminoda.com:81/users
````
location /users/ {
    proxy_pass http://127.0.0.1:3001;
}
````
**注意：**浏览器 http://test.eminoda.com:81/users 会自动变成 http://test.eminoda.com:81/users/。原以为浏览器会默认添加，但是错了。

浏览器分别输入/users，当location /users，浏览器不会默认添加/，而 location /users/ 则会自动添加。感觉像是location告诉浏览器你给我变的样子
查阅location文档：
如果location规则尾部包含斜杠（location /users/），在响应时会发送301永久重定向，地址后面自动加上斜杠（这就是为何浏览器会有斜杠的原因）
> If a location is defined by a prefix string that ends with the slash character, and requests are processed by one of proxy_pass, fastcgi_pass, uwsgi_pass, scgi_pass, memcached_pass, or grpc_pass, then the special processing is performed. In response to a request with URI equal to this string, but without the trailing slash, a permanent redirect with the code 301 will be returned to the requested URI with the slash appended.

### proxy_pass有些其他规则，request URI不确定被替换更改
**location定义正则，同时proxy_pass不能定义URI**
**location定义中有rewrite break，后跟proxy_pass**
````
location /name/ {
    rewrite    /name/([^/]+) /users?name=$1 break;
    proxy_pass http://127.0.0.1;
}
````
**proxy_pass使用变量**
````
location /name/ {
    proxy_pass http://127.0.0.1$request_uri;
}
````

## rewrite
| 指令 | 范围 |
| --- | --- |
| rewrite | server, location, if |

rewrite regex replacement [flag];
如果正则匹配到request URI，URI则会和replacement替换

### last
> stops processing the current set of ngx_http_rewrite_module directives and starts a search for a new location matching the changed URI;

````
location /rewrite/test1 {
    rewrite ^/rewrite /last last; #跳出本location，到新的location查找/last
    return 404; #并不会输出
}
location /last {
    proxy_pass http://127.0.0.1:3001;
}
````
访问 **http://test.eminoda.com:81/rewrite/test1**，location，rewrite命中，发起/last请求，在location中继续寻找

**修改配置：location做如下修改**
访问 **http://test.eminoda.com:81/rewrite/test1**，location不会命中，rewrite则不会匹配到
访问 **http://test.eminoda.com:81/rewrite/test1/**，可以命中
````
location /rewrite/test1/ {
    rewrite ^/rewrite /last last;
}
````
和本例无关，只是平时书写location，要增强路径/的判断。请求地址包含/，则在location的规则上写上/，不然就不要添加

### break
> stops processing the current set of ngx_http_rewrite_module directives as with the break directive

````
location /rewrite/test2 {
    rewrite ^/rewrite/test2/foo /break break;
    proxy_pass http://127.0.0.1:3001;
}
# 不会执行
location /break {
    proxy_pass http://127.0.0.1:3001;
}
````
访问 **http://test.eminoda.com:81/rewrite/test2**，location命中，rewrite未匹配，之后请求proxy_pass
访问 **http://test.eminoda.com:81/rewrite/test2/foo**，location中rewrite命中，发起/break，由于之后是proxy_pass，则实际访问 **http://127.0.0.1:3001/break**
**和last不同，rewrite匹配后，不会重新寻找location**

修改配置：结合上例，主要体现 **ngx_http_rewrite_module这个点**
````
location /rewrite/test2 {
    rewrite ^/rewrite/test2/foo /break break;
    return 500;
}
````
访问 **http://test.eminoda.com:81/rewrite/test2**，location匹配，rewrite未匹配，直接访问return 返回500
访问 **http://test.eminoda.com:81/rewrite/test2/foo**，location中rewrite命中，发起/break，注意**break会停止ngx_http_rewrite_module模块的指令**，则不会像上例一样，或者last寻找新的location。会在本地寻找 ooxx/break 资源，无则返回404；

### redirect
````
rewrite ^/redirect1 / redirect ;
rewrite ^/redirect2 http://test.eminoda.com:81 redirect ;
````
返回302 code，如果不以协议“http://”, “https://”, or “$scheme”开头的匹配，则替换

### permanent
> returns a permanent redirect with the 301 code.

### ngx_http_rewrite_module
- break
- if
- return
- rewrite
- rewrite_log
- set
- uninitialized_variable_warn

[了解更多](http://nginx.org/en/docs/http/ngx_http_proxy_module.html)


## [条件判断](http://nginx.org/en/docs/http/ngx_http_rewrite_module.html#if)
