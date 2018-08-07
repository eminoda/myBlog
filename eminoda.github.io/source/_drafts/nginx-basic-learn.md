---
title: nginx基础学习进阶
tags: nginx
---

> 内容摘自[nginx官方文档](http://nginx.org/en/docs/beginners_guide.html)，自己配合实例更细致的熟悉nginx

# [开胃小菜](http://nginx.org/en/docs/beginners_guide.html)
## 命令启动，停止，重启 配置
一旦nginx运行起来，通过如下方式invoking nginx的控制变更：
````
nginx -s stop // 停服
nginx -s quit // 优雅的停服
nginx -s reload // 重启配置文件
nginx -s reopen // 重新打开log文件
````

### quit 和 stop有何区别？
quit会等最近一个request响应结束后退出进程（graceful shutdown）。
比如一个服务会hold起数秒，即使执行了quit命令，还是会等结果处理完毕后关闭nginx。
stop则马上停止。

### 配置文件错误，reload是否会影响线上？
不会，如果configure错误，nginx将roll back回老的配置文件，直到配置正确才会真正reload起效。

### 除了stop等，怎么停止nginx服务？
````
ps -ax | grep nginx
26318 ?        Ss     0:00 nginx: master process nginx
26351 ?        S      0:00 nginx: worker process
26357 pts/3    R+     0:00 grep --color=auto nginx
# 需要停止master进程
kill -s QUIT 26318
````

### [了解更多nginx控制命令](http://nginx.org/en/docs/control.html)

## nginx配置文件的结构
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

## 文件服务
静态文件管理也是Nginx最大的特色之一
````
# prefix compared with the URI from the request
# url: http://test.eminoda.com:81/hello/yuyu.jpg
location / {
    root /root/mydata; # 根据URI地址，寻找/data/www下匹配的静态资源
}
# 匹配/test路径，并在设置root下，寻找URI资源
# url: http://test.eminoda.com:81/test/yuyu.jpg
location /test/ {
    root /root/mydata/; # 对value后添加/斜杠不敏感
}
````

### root 和 alias的区别？
| 指令 | 范围 |
| --- | --- |
| root | http, server, location, if in location |
| alias | location |

````
# url: http://test.eminoda.com:81/hello/yuyu.jpg
location /hello/ {
    alias  /root/mydata/test/; # ok
}
location /hello {
    alias  /root/mydata/test; # ok
}
location /hello/ {
    alias  /root/mydata/test; # error 会对斜杠进行匹配替换，需注意。
}
````

**怎么权衡root和alias的使用？**
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

### alias 和 正则匹配问题？
如果location 包含regex expression，就会匹配正则捕获内容，在alias中替换（而非替换整个location路径）。
````
# file: /root/mydata/test/yuyu.jpg
# url: http://test.eminoda.com:81/yuyu.jpg ok
# url：http://test.eminoda.com:81/foo/yuyu.jpg error $1实际访问/root/mydata/test/foo/yuyu.jpg
location ~ ^/(.+\.(?:gif|jpg|png))$ {
    alias /root/mydata/test/$1;
}
# url: http://test.eminoda.com:81/foo/yuyu.jpg
location ~ ^/foo/(.*\.jpg)$ {
    alias /root/mydata/test/$1;
}
````

## [设置简单的代理Proxy服务](http://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_pass)
使用nginx代理，可能是解决我们日常开发，服务调用的最大原因

在了解proxy之前，先看下location路径匹配
### location
| 指令 | 范围 | 语法 |
| --- | --- | --- |
| location | server, location | location [ = &#124; ~ &#124; ~* &#124; ^~ ] uri { ... } |

location依赖request的URI。按优先级排序。
=: 绝对匹配，exact match
~*：正则，case-insensitive matching
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

### proxy_pass
| 指令 | 范围 |
| --- | --- |
| proxy_pass | location, if in location, limit_except |

**proxy_pass 末尾跟/的区别**
proxy_pass url分两种：
- without a URI
- with a URI

如果proxy_pass is specified with a URI，URI将替换request URI匹配中的location配置（注意location 需要后面维护个/）
如果proxy_pass is specified without a URI，URI更改为request URI

来看下如下配置的不同
````
# specified without a URI
# 这是个普通的路径匹配，请求3001服务下 /users 地址
location /users {
    proxy_pass http://127.0.0.1:3001;
}
# specified with a URI
# 由于添加/斜杠，将替换location。相当于 location /。URI specified替换request URI
location /users/ {
    proxy_pass http://127.0.0.1:3001/;
}
# specified with a URI
# error，实际访问 http://127.0.0.1:3001//
location /users {
    proxy_pass http://127.0.0.1:3001/;
}
````

### rewrite
| 指令 | 范围 |
| --- | --- |
| rewrite | server, location, if |

**rewrite regex replacement [flag];**

**flag几个值的区别**
- last
- break
- redirect
- permanent

##[了解更多](http://nginx.org/en/docs/http/ngx_http_proxy_module.html)##