---
title: redis
date: 2017-02-08 21:05:09
tags:
  - redis
categories: redis
comments: true
---
### 下载
[redis](https://redis.io/download)

### linux安装
1. 解压
````
tar zxvf redis-3.2.7.tar.gz
````

2. 编译
````
cd redis目录
make
````

3. 安装
````
cd src
make install
````

4. 环境配置
````
vi /etc/profile
export REDIS_HOME=/root/eminoda/redis/redis-3.2.7
export PATH=$NGINX_HOME/sbin:$MONGDB_HOME/bin:$NODE_HOME/bin:$REDIS_HOME/src:$PATH
source /etc/profile
````

5. 启动
{% asset_img 1.png 启动成功式样 %}
````
redis-server
````

6. 后台启动
````
vi redis.conf
daemonize yes
redis-server /root/eminoda/redis/redis-3.2.7/redis.conf 
````

7. cli
````
redis-cli
````

8. 关闭
	````
	ps -aux |grep redis
	root     15774  0.0  0.7 136964  7536 ?        Ssl  00:18   0:44 redis-server 106.14.35.133:6379
	kill -9 15774
	````
	````
	redis-cli -p 6379 shutdown
	````

### 客户端
[redis manager](https://github.com/ServiceStack/redis-windows)

### 文档
[redis 公网访问](http://www.cnblogs.com/moxiaoan/p/5683743.html)
[redis sockio](http://blog.csdn.net/icetime17/article/details/45768065)