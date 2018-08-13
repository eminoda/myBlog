---
title: mongo-backup
tags:
---

因为云服务器更换，所以牵扯到要备份数据库到新服务器。记录一笔

## [mongodump](https://docs.mongodb.com/manual/reference/program/mongodump/)
````
mongodump -h 127.0.0.1:27017 --db 数据库名称 --out 备份输出位置 -u 用户名 -p 密码
````