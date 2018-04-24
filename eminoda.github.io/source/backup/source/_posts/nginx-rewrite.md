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
在chrome F12下，last break redirect 都是302，permanent 301

{% asset_img last.png last %}
{% asset_img break.png break %}
{% asset_img permanent.png permanent %}
{% asset_img redirect.png redirect %}

## 2. nginx请求日志
permanent在nginx日志里面没有access记录日志

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
- 测试结果：
    1. last break在server下，命中后，直接寻找匹配的下一个location
    2. last location，匹配后，跳出location，重新在server中寻找匹配location
    3. break location，匹配后，结束匹配。
````
	server {
		listen 5000;
		server_name test.nginx1.com;
		
		# 测试server-break，如果没有location /test-server-last，则404
		rewrite /test-server-break /test-server-last break;

		# 测试server中-last，不会执行上下两句的跳转，直接走到下面location test41
		rewrite /test41 http://www.google.com break;
		rewrite /test-server-last /test41 last;
		rewrite /test41 http://www.baidu.com break;

		# 不是从server下的所有开始
		#rewrite /test51 /test53 break;
		
		# 3. 即使我在上面，也被执行。说明是从server下匹配的location开始。
		location /test51 {
			return 501;
		}
		# 1. 请求地址
		# 测试location-last，1-->2-->3
		location /test-last {
			# 2. 重定向到 /test51
			rewrite /test /test51 last;
			# last后跳出【当前location】，没有出现503
			rewrite /test51 /test52 break;
		}
		# 测试location-break,终止当前跳转，404
		location /test-break {
			rewrite /test /test51 break;
			# 没走
			rewrite /test51 /test52 break;
		}
		location /test52 {
			return 502;
		}
		location /test53 {
			return 503;
		}
		location /test41 {
			return 401;
		}
		location /test54 {
			rewrite /test /test54 break;
			
		}
		#location /test-server-last {
			#return 403;
		#}
	}
````

{% asset_img last3.png location-last %}
{% asset_img last4.png server-last %}
{% asset_img break3.png location-break %}
{% asset_img break4.png server-break %}

## 5. 参考链接
[rewrite example](http://nginx.org/en/docs/http/converting_rewrite_rules.html)
[302 301 不同](https://blog.ss88.uk/301-permanent-302-temporary-redirect-nginx)
[last break](https://serverfault.com/questions/131474/nginx-url-rewriting-difference-between-break-and-last)
[last break](http://longlog.me/2017/03/17/nginx-rewrite-break/)