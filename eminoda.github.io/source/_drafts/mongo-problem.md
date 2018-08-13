---
title: mongo-problem
tags:
---

## 未维护数据库存放位置，mongod未启动起来
````
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
````

## 自定义匹配文件，启动失败
原因同上，可查看mongo.log解决问题
````
[root@izuf637zf5euwjrr6z5xdyz ~]# mongod -f  /mydata/mongo/conf/mongod.conf 
about to fork child process, waiting until server is ready for connections.
forked process: 18036
ERROR: child process failed, exited with error number 100
````