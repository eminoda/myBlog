---
title: mongo 数据库的备份迁移
tags: mongodb
categories:
  - 开发
  - 数据库
thumb_img: mongodb.jpg
date: 2018-08-14 11:18:48
---

因为云服务器更换，所以牵扯到要备份数据库到新服务器。记录一笔

## 备份并导出库——[mongodump](https://docs.mongodb.com/manual/reference/program/mongodump/)

配置权限链接本地库，配置输出位置

```
mongodump -h 127.0.0.1:27017 --db 数据库名称 --out 备份输出位置 -u 用户名 -p 密码
```

**常用命令**
[更多详见官方文档](https://docs.mongodb.com/manual/reference/program/mongodump/#options)

```
--help

--verbose, -v
    输出日志

--quite

--version

--uri
    eg:mongodb://[username:password@]host1[:port1][,host2[:port2],...[,hostN[:portN]]][/[database][?options]]
    通过uri可以简化mongodump配置（合在--uri定义）[URI参数说明](https://docs.mongodb.com/manual/reference/connection-string/)

--host <hostname><:port>, -h <hostname><:port>
    Default: localhost:27017

--port <port>
    Default: 27017

--username <username>, -u <username>

--password <password>, -p <password>

--authenticationDatabase <dbname>

--db <database>, -d <database>

--collection <collection>, -c <collection>
    定义哪些指定collection输出

--excludeCollection string
    排除某些collection

--gzip
    压缩输出文件

--out <path>, -o <path
    输出格式为 BSON files
```

## 导入备份数据库——[mongorestore](https://docs.mongodb.com/manual/reference/program/mongorestore/)

之前需要把备份的数据库迁移到新服务器中

```
mongorestore --db 数据库名称 /mydata/dump/xxx
```

**常用命令**

```
--help

--verbose, -v

--quiet

--version

--uri <connectionString>

--host <hostname><:port>, -h <hostname><:port>

--port <port>

--db <database>, -d <database>

--collection <collection>, -c <collection>

--drop
    清除备份文件

--gzip

<path>
    不能同时定义path和--dir

--dir string

```
