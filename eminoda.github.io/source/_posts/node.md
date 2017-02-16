---
title: linux配置node环境
date: 2017-02-15 10:42:29
tags:
  - node
categories: node
comments: true
---
# 步骤
1. 下载node包
[官网下载](http://nodejs.cn/#download)

2. 解压
````
cd /usr/local/node/
tar zxcf node-v4.4.0-linux-x64
````

3. 配置环境变量
````
vi /etc/profile
export JAVA_HOME=/soft/jdk1.7.0_67/
export NODE_HOME=/usr/local/node/node-v4.4.0-linux-x64/
export PATH=$PATH:$JAVA_HOME/bin:$NODE_HOME/bin/

source /etc/profit
````
