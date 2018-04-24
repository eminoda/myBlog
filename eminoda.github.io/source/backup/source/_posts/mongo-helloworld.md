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
2. [下载mongo对应平台的包-官网](https://www.mongodb.com/download-center?jmp=tutorials&_ga=2.252562570.2062839427.1510731503-1753723628.1510731503)
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
[文档-官网](https://docs.mongodb.com/manual/crud/)
[query-官网](https://docs.mongodb.com/manual/tutorial/query-documents/)

{% asset_img 3.png crud-创建，查询 %}

# 再进一步
## 1. 守护启动
> [参数的解释](https://my.oschina.net/zhuzhu0129/blog/53290)

{% asset_img 4.png fork-后台运行 %}

[关闭mongo-官网](https://docs.mongodb.com/manual/tutorial/manage-mongodb-processes/)

{% asset_img 5.png close-关闭方式之一 %}

## 2. auth验证
[安全auth-官网](https://docs.mongodb.com/manual/security/)
[关于权限的配置](https://www.cnblogs.com/shaosks/p/5775757.html)
[权限role解释](https://docs.mongodb.com/manual/reference/built-in-roles/#userAdminAnyDatabase)
[管理role](https://docs.mongodb.com/manual/tutorial/manage-users-and-roles/)
### 创建权限用户（[简单的权限创建过程](https://docs.mongodb.com/manual/tutorial/enable-authentication/)）
1. 开启mongo
````
# 无权限方式启动
mongod --config /root/mydata/mongodb-linux-x86_64-3.4.10/bin/mongod.conf
# 链接mongo
mongo
````
2. 创建权限用户
````
> use admin
switched to db admin
> db.createUser({
... user:'myUserAdmin',
... pwd:'abc123',
... roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
... })
Successfully added user: {
	"user" : "myUserAdmin",
	"roles" : [
		{
			"role" : "userAdminAnyDatabase",
			"db" : "admin"
		}
	]
}
> 
````
3. 权限登录
````
# 重新链接mongo
[root@izj6c8pmxwulw3fkf18zqqz ~]# mongo
MongoDB shell version v3.4.10
connecting to: mongodb://127.0.0.1:27017
MongoDB server version: 3.4.10
> show dbs
# 显示没有权限
2017-11-16T15:46:39.284+0800 E QUERY    [thread1] Error: listDatabases failed:{
	"ok" : 0,
	"errmsg" : "not authorized on admin to execute command { listDatabases: 1.0 }",
	"code" : 13,
	"codeName" : "Unauthorized"
} :
_getErrorWithCode@src/mongo/shell/utils.js:25:13
Mongo.prototype.getDBs@src/mongo/shell/mongo.js:62:1
shellHelper.show@src/mongo/shell/utils.js:781:19
shellHelper@src/mongo/shell/utils.js:671:15
@(shellhelp2):1:1
> use admin
switched to db admin
> db.auth('myUserAdmin','abc123')
1
> show dbs
admin  0.000GB
local  0.000GB
test   0.000GB
> 
````
4. mongod.conf配置
````
# systemLog:
 # path: /data/log/logger.log
 # destination: file
 # logAppend: true
storage:
 # 数据库目录
 dbPath: /data/db
security:
 authorization: enabled
````


## 3. 客户端工具选择
[robo https://robomongo.org/](https://robomongo.org/)
{% asset_img 7.png client-客户端 %}

## 4. 主从节点
1. 从节点无法查询
````
> use test
switched to db test
> db.testdb.find()
Error: error: {
	"ok" : 0,
	"errmsg" : "not master and slaveOk=false",
	"code" : 13435,
	"codeName" : "NotMasterNoSlaveOk"
}
````
[解决](https://docs.mongodb.com/manual/reference/method/Mongo.setSlaveOk/#Mongo.setSlaveOk)