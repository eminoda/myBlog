---
title: linux 开机自启动服务
tags:
  - linux
categories:
  - 开发
  - 运维部署
no_sketch: true
date: 2018-07-11 10:32:22
---

测试环境会因为运维某些需求（更改硬件配置，分配服务器资源...）使得会停服。
即使在工作时间之外维护，但也会导致次日上班时某些开发单独维护的服务没有及时启动，导致工作进度受影响。
那怎么友好的避免？编写服务器重启脚本。

那怎么做呢？

## 准备服务启动 shell

拿运维写的 tomcat，和 node 做个例子（以备今后使用）
由于我们项目都是专门归类在同一目录之下，所以采用简单的循环启动服务即可。

```shell
#!/bin/bash
serverDir=/mydata/tomcats

for dir in `ls $serverDir/`
do
        if [ -f "$serverDir/$dir/bin/startup.sh" ]; then
        $serverDir/$dir/bin/startup.sh &
        fi
done
```

```shell
#!/bin/bash
# chkconfig: 345 88 08
# description: Forever for Node.js
serverDir=/mydata/nodeProject
export PATH=$PATH:/mydata/node-v8.9.0-linux-x64/bin
cd $serverDir
for dir in `ls $serverDir/`
do
        if [ -f "$serverDir/$dir/bin/www.js" ]; then
            cd $dir
            forever start -s ./bin/www.js
            cd ../
            sleep 2
        fi
done
```

## 编写 linux 重启 shell

[先了解一下/etc/rc.d/init.d](https://blog.csdn.net/acs713/article/details/7322082)
/etc/rc.d/init.d
存放了各种系统服务启动的信息

/etc/rc.d/rc[0-6].d
是指服务运行的级别

- 0：表示关机
- 1：单用户模式
- 2：无网络连接的多用户命令行模式
- 3：有网络连接的多用户命令行模式
- 4：不可用
- 5：带图形界面的多用户模式
- 6：重新启动

也可使用**chkconfig**来维护修改。[查看更多](https://blog.csdn.net/lanyang123456/article/details/54695567)

```shell
# 查询
[root@localhost etc]# chkconfig --list
NetworkManager 	0:off	1:off	2:off	3:off	4:off	5:off	6:off
abrt-ccpp      	0:off	1:off	2:off	3:off	4:off	5:off	6:off
abrtd          	0:off	1:off	2:off	3:off	4:off	5:off	6:off
acpid          	0:off	1:off	2:off	3:off	4:off	5:off	6:off
...
```

**正题：编写/etc/rc.d/rc.local**
把上面的各种服务 sh 维护到此文件中，当重启后，系统自动执行。

```shell
#!/bin/sh
#
# This script will be executed *after* all the other init scripts.
# You can put your own initialization stuff in here if you don't
# want to do the full Sys V style init stuff.

touch /var/lock/subsys/local
#Start Tomcats
/mydata/bashShells/startTomcats.sh
#Start Nginx
/usr/sbin/nginx
#Start Node Projects
/mydata/bashShells/startNodeProjs.sh
mount -o username=Administrator,password=Cn654321Ty //192.168.1.90/yunwei /mnt/yunwei
```
