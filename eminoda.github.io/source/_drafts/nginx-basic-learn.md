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
location / {
    root /data/www; # 根据地址，寻找/data/www下匹配的静态资源
}
````

### root 和 alias的区别？
root 用于：http, server, location, if in location
alias 用于：location

````
# /root/mydata/test/yuyu.jpg
# url: http://test.eminoda.com:81/test/yuyu.jpg
location /test {
    root /root/mydata; 
}
location /test/ {
    root /root/mydata/; # 对斜杠不敏感，建议路径匹配还是加上尾缀/
}
# url: http://test.eminoda.com:81/hello/yuyu.jpg
location /hello/ {
    alias  /root/mydata/test/; # ok
}
location /hello {
    alias  /root/mydata/test; # ok
}
location /hello/ {
    alias  /root/mydata/test; # error 会对斜杠进行匹配，需注意。
}
````

### alias 和 正则匹配问题？
````
# /root/mydata/test/yuyu.jpg
# url: http://test.eminoda.com:81/hello/yuyu.jpg
# 需要设定root，不然是相对/usr/share/nginx/html之下
root /root/mydata/;
location ~ ^/hello/(.+\.jpg)$ {
    lias  /test/$1; # 别名不起作用，直接映射为root+/hello/yuyu.jpg 路径
}
````