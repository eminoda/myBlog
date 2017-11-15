---
title: mongo入门-环境配置
date: 2017-11-15 17:50:12
tags:
  - mongo入门
categories: mongo
comments: true
---

# 入门上手
## 1. 安装mongo及配置
1. [官网地址](https://www.mongodb.com)
2. [下载mongo对应平台的包](https://www.mongodb.com/download-center?jmp=tutorials&_ga=2.252562570.2062839427.1510731503-1753723628.1510731503)
3. 解压mongo安装包
    ````
    tar -zxvf ./mongodb-linux-x86_64-3.4.10.tgz
    ````
4. 配置环境变量（不然只能去安装目录运行，具体配置自行百度）

## 2. 搞起玩耍
1. 启动
    ````
    mongod
    ````
    {% asset_img 1.png 启动 %}
    ````
    # 注意mongod没有守护启动，所以界面不要ctrl c掉
    mongo
    ````
    {% asset_img 2.png 链接mongo %}

2. 注意
    请打开解压后的包，阅读里面的readme，不然启动是会报错滴

3. 简单的crud
[见官方文档](https://docs.mongodb.com/manual/crud/)
[query](https://docs.mongodb.com/manual/tutorial/query-documents/)

{% asset_img 3.png crud-创建，查询 %}

# 再进一步
## 1. 守护启动
> [参数的解释](https://my.oschina.net/zhuzhu0129/blog/53290)

{% asset_img 4.png fork-后台运行 %}

[关闭mongo](https://docs.mongodb.com/manual/tutorial/manage-mongodb-processes/)

{% asset_img 5.png close-关闭方式之一 %}

## 2. auth验证
[安全auth](https://docs.mongodb.com/manual/security/)
[关于权限的配置](https://www.cnblogs.com/shaosks/p/5775757.html)

## 3. 客户端工具选择
[robo https://robomongo.org/](https://robomongo.org/)
{% asset_img 7.png client-客户端 %}