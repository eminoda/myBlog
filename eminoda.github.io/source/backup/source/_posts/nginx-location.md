---
title: nginx location 处理逻辑先后顺序及注意问题
date: 2018-02-05 22:02:39
tags: nginx
categories: nginx
comments: true
---

# location几种表现形式
[参考链接](http://nginx.org/en/docs/http/ngx_http_core_module.html#location)

````
# 绝对匹配
location = / {
    [ configuration A ]
}

# 默认匹配
location / {
    [ configuration B ]
}

# 字符串路径匹配
location /documents/ {
    [ configuration C ]
}

# 字符串前缀匹配，prefix string
location ^~ /images/ {
    [ configuration D ]
}

# 正则匹配，Regular expressions，~* 忽略大小写
location ~* \.(gif|jpg|jpeg)$ {
    [ configuration E ]
}
# 正则匹配，Regular expressions，~* case-sensitive matching
location ~ \.(GIF|jpg|jpeg)$ {
    [ configuration E ]
}
````

# 测试结果
1. configuration A 优先级最高
2. configuration E 优先 configuration C (正则>字符串)
3. configuration E 优先 configuration D (正则>字符串前缀)
4. configuration C 优先 configuration D (字符串>字符串前缀)
5. configuration B 最后匹配

# 测试环境
准备：express搭建简单的httpServer，分别启动3000和3001服务

# 部分测试过程
## 字符串 vs 字符串前缀
````
location /conf1 {
    proxy_pass http://127.0.0.1:3001;
}
location  ^~ /conf1/ {
    proxy_pass http://127.0.0.1:3000;
}
````
{% asset_img 1.png 字符串优先 %}

## 正则 vs 字符串
````
location /conf2 {
    proxy_pass http://127.0.0.1:3001;
}
location ~* (conf2)$ {
    proxy_pass http://127.0.0.1:3000;
}
````
{% asset_img 2.png 正则优先 %}

## 正则 vs 字符串前缀
````
location ^~ conf3 {
    proxy_pass http://127.0.0.1:3001;
}
location ~* (conf3)$ {
    proxy_pass http://127.0.0.1:3000;
}
````
{% asset_img 3.png 正则优先 %}

# 注意事项
1. 字符串前缀匹配不能和字符串匹配配置路径相同
````
nginx: [emerg] duplicate location "/conf1" in F:\development\nginx-1.13.8/conf/nginx.conf:48
````
    

