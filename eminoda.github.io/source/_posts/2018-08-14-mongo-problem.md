---
title: mongo 用问题记录
tags: mongodb
categories:
  - 开发
  - 数据库
thumb_img: mongodb.jpg
date: 2018-08-14 11:18:54
---

## 未维护数据库存放位置，mongod 未启动起来

```
[root@izuf637zf5euwjrr6z5xdyz mydata]# mongod
2018-08-13T18:44:28.035+0800 I CONTROL  [initandlisten] MongoDB starting : pid=18023 port=27017 dbpath=/data/db 64-bit host=izuf637zf5euwjrr6z5xdyz
2018-08-13T18:44:28.035+0800 I CONTROL  [initandlisten] db version v3.4.10
2018-08-13T18:44:28.035+0800 I CONTROL  [initandlisten] git version: 078f28920cb24de0dd479b5ea6c66c644f6326e9
2018-08-13T18:44:28.035+0800 I CONTROL  [initandlisten] allocator: tcmalloc
2018-08-13T18:44:28.035+0800 I CONTROL  [initandlisten] modules: none
2018-08-13T18:44:28.035+0800 I CONTROL  [initandlisten] build environment:
2018-08-13T18:44:28.035+0800 I CONTROL  [initandlisten]     distarch: x86_64
2018-08-13T18:44:28.035+0800 I CONTROL  [initandlisten]     target_arch: x86_64
2018-08-13T18:44:28.035+0800 I CONTROL  [initandlisten] options: {}
2018-08-13T18:44:28.035+0800 I STORAGE  [initandlisten] exception in initAndListen: 29 Data directory /data/db not found., terminating
2018-08-13T18:44:28.035+0800 I NETWORK  [initandlisten] shutdown: going to close listening sockets...
2018-08-13T18:44:28.035+0800 I NETWORK  [initandlisten] shutdown: going to flush diaglog...
2018-08-13T18:44:28.035+0800 I CONTROL  [initandlisten] now exiting
2018-08-13T18:44:28.035+0800 I CONTROL  [initandlisten] shutting down with code:100
```

## 自定义匹配文件，启动失败

原因同上，可查看 mongo.log 解决问题

```
[root@izuf637zf5euwjrr6z5xdyz ~]# mongod -f  /mydata/mongo/conf/mongod.conf
about to fork child process, waiting until server is ready for connections.
forked process: 18036
ERROR: child process failed, exited with error number 100
```

## 添加 Role 失败

```
> db.createUser({
... user:"xxxxx",
... pwd:"xxxxx",
... roles:[{
... role:"readWriteAnyDatabase",
... db:"xxx"
... }]})
2018-08-14T11:37:55.993+0800 E QUERY    [thread1] Error: couldn't add user: No role named readWriteAnyDatabase@xxx :
_getErrorWithCode@src/mongo/shell/utils.js:25:13
DB.prototype.createUser@src/mongo/shell/db.js:1292:15
@(shell):1:1
```

查看是否 role 定义错误，[虽然官网定义如下 Role，**但是用于 admin database**，具体还要辨别：](https://docs.mongodb.com/manual/reference/built-in-roles/#all-database-roles)

- readAnyDatabase
- readWriteAnyDatabase
- userAdminAnyDatabase
- dbAdminAnyDatabase

[更多 Role](https://docs.mongodb.com/manual/reference/built-in-roles/#database-user-roles)
