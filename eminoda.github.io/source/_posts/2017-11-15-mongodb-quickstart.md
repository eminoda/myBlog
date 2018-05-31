---
title: mongodb 快速入门
tags: mongodb
categories:
  - 前端
  - mongodb
thumb_img: mongodb.jpg
date: 2017-11-15 17:50:12
---


{% asset_img mongodb.jpg %}
# [什么是mongodb](https://www.mongodb.com)
有哪些好处？（外面是这样流传的）
1. 对比传统主流数据库，比较‘新’。
2. 非关系数据库。没有结构的约束，扩展，速度会更‘快’
3. 适合填坑的你...

# 环境配置
1. [mongodb 下载](https://www.mongodb.com/download-center?jmp=nav#community)
2. 解压mongo安装包
    ````
    tar -zxvf ./mongodb-linux-x86_64-3.4.10.tgz
    ````
3. 配置环境变量
    ````
    MONGO_HOME=/root/mydata/mongodb-linux-x86_64-3.4.10
    ````
4. [开启mongod服务](https://docs.mongodb.com/manual/tutorial/manage-mongodb-processes/#start-mongod-processes)
    {% asset_img mongod.png %}

    注意这是非守护进程方式，一关后面就连接不上了
    ````
    [root@izj6c8pmxwulw3fkf18zqqz mydata]# mongo
    MongoDB shell version v3.4.10
    connecting to: mongodb://127.0.0.1:27017
    2018-05-31T11:30:51.137+0800 W NETWORK  [thread1] Failed to connect to 127.0.0.1:27017, in(checking socket for error after poll), reason: Connection refused
    2018-05-31T11:30:51.137+0800 E QUERY    [thread1] Error: couldn't connect to server 127.0.0.1:27017, connection attempt failed :
    connect@src/mongo/shell/mongo.js:237:13
    @(connect):1:6
    exception: connect failed
    ````

5. [链接mongo](https://docs.mongodb.com/manual/mongo/)
    ````
    [root@izj6c8pmxwulw3fkf18zqqz mydata]# mongo
    MongoDB shell version v3.4.10
    connecting to: mongodb://127.0.0.1:27017
    MongoDB server version: 3.4.10
    > 
    ````

# 配置mongod
## 简单的一些修改
1. 数据库路径
路径文件夹需要提前建好
````
mongod --dbpath /your path
````
2. 日志文件路径
````
mongod --logpath /your path
````
3. 修改端口port
````
mongod --port 12345
````

## 关闭进程
1. shutdownServer
````
> use admin
switched to db admin
> db.shutdownServer()
server should be down...
2018-05-31T11:40:56.277+0800 I NETWORK  [thread1] trying reconnect to 127.0.0.1:27017 (127.0.0.1) failed
2018-05-31T11:40:56.277+0800 W NETWORK  [thread1] Failed to connect to 127.0.0.1:27017, in(checking socket for error after poll), reason: Connection refused
2018-05-31T11:40:56.277+0800 I NETWORK  [thread1] reconnect 127.0.0.1:27017 (127.0.0.1) failed failed 
````
2. kill
````
[root@izj6c8pmxwulw3fkf18zqqz ~]# ps -aux |grep mongo
root     12185  0.7  3.9 942148 40512 pts/1    Sl+  11:43   0:00 mongod
root     12212  0.0  0.0 112660   972 pts/2    R+   11:44   0:00 grep --color=auto mongo
[root@izj6c8pmxwulw3fkf18zqqz ~]# kill -9 12185
````
3. shutdown
````
[root@izj6c8pmxwulw3fkf18zqqz ~]# mongod --shutdown
killing process with pid: 12213
````
## 配置文件
1. 指定配置文件方式
指定配置文件 --config <filename>, -f <filename>

2. 编写配置文件（YAML 范式）
````
# 守护开启
processManagement:
  fork: true
# 系统日志
systemLog:
  destination: file
  path: "/root/mydata/mongo/mongod.log"
  logAppend: true
# 数据库存储位置
storage:
  dbPath: "/root/mydata/mongo/data/db"
# 安全
security:
  authorization: enabled
````

## 守护配置
参考配置文件，如果你没有配置，就--fork开启守护模式
````
[root@izj6c8pmxwulw3fkf18zqqz ~]# mongod -f /root/mydata/mongo/conf/mongod.conf 
about to fork child process, waiting until server is ready for connections.
forked process: 12343
child process started successfully, parent exiting
````

# 权限
1. 添加权限用户
````
> use admin
switched to db admin
> db.createUser({
...     user:"xxx_dba",
...     pwd:"xxxxxx",
...     roles:[{
...         role:"userAdminAnyDatabase",
...         db:"admin"
...     }]
... })
Successfully added user: {
	"user" : "eminoda_dba",
	"roles" : [
		{
			"role" : "userAdminAnyDatabase",
			"db" : "admin"
		}
	]
}
> 
````

2. 开启权限模式
````
mongod -f /root/mydata/mongo/conf/mongod.conf --auth
````

3. 按照权限操作不同功能
````
> use admin
switched to db admin
> show dbs
2018-05-31T14:26:11.129+0800 E QUERY    [thread1] Error: listDatabases failed:{
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
> db.auth('xxx_dba','xxxxxx')
1
> show dbs
admin  0.000GB
local  0.000GB
````
4. 显示用户
````
> show users
{
	"_id" : "admin.xxx_dba",
	"user" : "xxx_dba",
	"db" : "admin",
	"roles" : [
		{
			"role" : "userAdminAnyDatabase",
			"db" : "admin"
		}
	]
}
````

# 常用操作命令
## 数据库操作
1. 显示当前库
````
> db
test
````
2. 切换（添加）数据库
后续insert一条数据，新增数据库就会出现
````
> use eminoda_db
switched to db eminoda_db
````
3. 显示数据库
````
> show dbs
admin       0.000GB
eminoda_db  0.000GB
local       0.000GB
````
4. 删除数据库
````
> db
eminoda_db
> db.dropDatabase()
{ "dropped" : "eminoda_db", "ok" : 1 }
> show dbs
admin  0.000GB
local  0.000GB
````

## CRUD
1. 增
````
db.user.insertOne({
    name:'eminoda',
    age:28
})
````
2. 删
````
db.user.deleteOne({
    name:'eminoda'
})
````
3. 改
````
db.user.updateMany({
    name:'eminoda'
},{
    $set:{
        age:28
    }
})
````
4. 查
````
# 条件判断
db.user.find({
    age:{
        $gt:28
    }
})
db.user.find({
    $or:[{
        name:'zhang3'
    },{
        age:28
    }]
})
````

# 帮助资料（基本都来自官网）
- [mongo](https://docs.mongodb.com/manual/reference/program/mongo/#bin.mongo)
- [mongod](https://docs.mongodb.com/manual/reference/program/mongod/#bin.mongod)
- [管理mongod进程](https://docs.mongodb.com/manual/tutorial/manage-mongodb-processes)
- [mongod配置-关于启动运行](https://docs.mongodb.com/manual/administration/configuration/)
- [mongod配置文件详解](https://docs.mongodb.com/manual/reference/configuration-options/index.html)
- [security 目录](https://docs.mongodb.com/manual/security/)
- [roles 角色介绍](https://docs.mongodb.com/manual/reference/built-in-roles)
- [创建一个授权用户](https://docs.mongodb.com/manual/tutorial/enable-authentication/)
- [创建auth，基本够用了](https://www.cnblogs.com/shiyiwen/p/5552750.html)
- [db 相关操作](https://docs.mongodb.com/manual/reference/command/nav-administration/)
- [query](https://docs.mongodb.com/manual/tutorial/query-documents/#additional-query-tutorials)

# 参考
> [mongodb vs mysql]https://blog.panoply.io/mongodb-and-mysql
  [MongoDB 等 NoSQL 与关系型数据库相比，有什么优缺点及适用场景？](https://www.zhihu.com/question/20059632)