---
title: nginx重定向
date: 2017-11-08 13:53:32
tags:
  - nginx
categories: nginx
comments: true
---

# 1. 用法、范例
````
server {
    listen       80;
    server_name  www.example.org  example.org;
    if ($http_host = example.org) {
        rewrite  (.*)  http://www.example.org$1;
    }
    location /users/ {
        rewrite ^/users/(.*)$ /show?user=$1 break;
    }
    ...
}
````

# 2. last break permanent redirect
## 1. http响应状态
{% asset_img last.png last %}
{% asset_img break.png break %}
{% asset_img permanent.png permanent %}
{% asset_img redirect.png redirect %}

## 2. nginx请求日志
{% asset_img last1.png http://localhost:5001/last %}
{% asset_img break1.png http://localhost:5001/break %}
{% asset_img permanent1.png http://localhost:5001/permanent %}
{% asset_img permanent2.png Status Code %}
{% asset_img redirect1.png http://localhost:5001/redirect %}
{% asset_img redirect2.png Status Code %}

## 3. permanent和redirect的区别（301和302的区别）
301 redirects are what is known as permanent redirects. This tells search engines that the old page has been moved permanently.
302 redirects are temporary redirects. These obviously tell search engines that the page has temporarily moved.
个人理解：一般情况permanent 301对爬虫友好，通知爬虫原链接失效，请保存新的location地址。相反302不会

## 4. last和break
break:当访问目标地址失败，跳过之后location，直接返回404
last：当访问目标地址失败，继续寻找符合条件的location，并执行
````
location /last {
    rewrite (.*) /test1 last;
}

    location /break {
    rewrite (.*) /test2 break;	
}

location /test1 {
    return 500;
    #proxy_set_header Host $http_host;
    #proxy_pass http://127.0.0.1:3000/test1;
}
location /test2 {
    return 500;
    #proxy_set_header Host $http_host;
    #proxy_pass http://127.0.0.1:3000/test1;
}
````
{% asset_img last2.png 404 %}
{% asset_img break2.png 500 %}

[rewrite example](http://nginx.org/en/docs/http/converting_rewrite_rules.html)
[302 301 不同](https://blog.ss88.uk/301-permanent-302-temporary-redirect-nginx)
