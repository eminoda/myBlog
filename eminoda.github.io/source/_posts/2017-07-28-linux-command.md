---
title: linux常用命令
tags:
  - linux
  - nginx
categories: linux
no_sketch: true
date: 2017-07-28 09:47:48
---


不是专业运维，有时候操作服务器也是烦的一笔。记录几个常用命令，基本日常生活够用了。

## [netstat](https://baike.baidu.com/item/Netstat)
> Netstat是在内核中访问网络连接状态及其相关信息的程序，它能提供TCP连接，TCP和UDP监听，进程内存管理的相关报告

| 参数 | 说明 |
| - | --- |
| -a | 显示所有socket，包括正在监听的。|
| -c | 每隔1秒就重新显示一遍，直到用户中断它。|
| -i | 显示所有网络接口的信息，格式“netstat -i”。|
| -n | 以网络IP地址代替名称，显示出网络连接情形。|
| -r |显示核心路由表，格式同“route -e”。|
| -t | 显示TCP协议的连接情况 |
| -u | 显示UDP协议的连接情况。|
| -v | 显示正在进行的工作。|
| -p | 显示建立相关连接的程序名和PID。|
| -b | 显示在创建每个连接或侦听端口时涉及的可执行程序。|
| -e | 显示以太网统计。此选项可以与 -s 选项结合使用。|
| -f | 显示外部地址的完全限定域名(FQDN)。|
| -o | 显示与每个连接相关的所属进程 ID。|
| -s | 显示每个协议的统计。|
| -x | 显示 NetworkDirect 连接、侦听器和共享端点。|
| -y | 显示所有连接的 TCP 连接模板。无法与其他选项结合使用。|

举例：显示所有tcp，udp的监听中的ip信息，包含程序名
````
netstat -alptun |grep nginx
````
备注：如果非0.0.0.0:port而是ip:port，确认下nginx下server中listen数值
{% asset_img 1.png nginx显示0.0.0.0和ip的区别 %}

## [ps](http://www.cnblogs.com/wangkangluo1/archive/2011/09/23/2185938.html)
查看进程的命令

| 参数 | 说明 |
| - | --- |
| -A |  显示所有进程（等价于-e）(utility) |
| -a |  显示一个终端的所有进程，除了会话引线 |
| -N |  忽略选择。 |
| -d |  显示所有进程，但省略所有的会话引线(utility) |
| -x |  显示没有控制终端的进程，同时显示各个命令的具体路径。dx不可合用。（utility） |
| -p |  pid 进程使用cpu的时间 |
| -u |  uid or username 选择有效的用户id或者是用户名 |
| -g |  gid or groupname 显示组的所有进程。 |
| U  | username 显示该用户下的所有进程，且显示各个命令的详细路径。如:ps U zhang;(utility) |
| -f |  全部列出，通常和其他选项联用。如：ps -fa or ps -fx and so on. |
| -l |  长格式（有F,wchan,C 等字段） |
| -j |  作业格式 |
| -o |  用户自定义格式。 |
| v  | 以虚拟存储器格式显示 |
| s  | 以信号格式显示 |
| -m |  显示所有的线程 |
| -H |  显示进程的层次(和其它的命令合用，如：ps -Ha)（utility） |
| e  | 命令之后显示环境（如：ps -d e; ps -a e）(utility) |
| h  | 不显示第一行 |

举例：列出特定进程
````
ps aux |grep node
USER PID    %CPU    %MEM    VSZ     RSS     TTY     STAT    START   TIME    COMMAND
root 1819   0.0     0.4     968256  36988   ?       Sl      May16   0:04    /mydata/node-v4.4.1/bin/node /usr/share/nodeProject/com.cfniu.www/bin/www.js
USER: 行程拥有者
PID: pid
%CPU: 占用的 CPU 使用率
%MEM: 占用的记忆体使用率
VSZ: 占用的虚拟记忆体大小
RSS: 占用的记忆体大小
TTY: 终端的次要装置号码 (minor device number of tty)
````
## curl
[curl api](https://curl.haxx.se/docs/httpscripting.html)

## [ulimit](https://www.ibm.com/developerworks/cn/linux/l-cn-ulimit/)
> 通过一些参数选项来管理不同种类的系统资源

| 参数 | 说明 |
| - | --- |
| -H | 设置硬资源限制. |
| -S | 设置软资源限制. |
| -a | 显示当前所有的资源限制. |
| -c | size:设置core文件的最大值.单位:blocks |
| -d | size:设置数据段的最大值.单位:kbytes |
| -f | size:设置创建文件的最大值.单位:blocks |
| -l | size:设置在内存中锁定进程的最大值.单位:kbytes |
| -m | size:设置可以使用的常驻内存的最大值.单位:kbytes |
| -n | size:设置内核可以同时打开的文件描述符的最大值.单位:n |
| -p | size:设置管道缓冲区的最大值.单位:kbytes |
| -s | size:设置堆栈的最大值.单位:kbytes |
| -t | size:设置CPU使用时间的最大上限.单位:seconds |
| -v | size:设置虚拟内存的最大值.单位:kbytes |
| -u | <程序数目> 　用户最多可开启的程序数目 |

举例：nginx: [warn] 65536 worker_connections exceed open file resource limit: 65535

````
[root@iZbp18tya24l2k7vs6b7j4Z ~]# nginx 
nginx: [warn] 65536 worker_connections exceed open file resource limit: 65535
# 查询现在文件打开最大值
[root@iZbp18tya24l2k7vs6b7j4Z ~]# ulimit -n
65535
# 重新设置
[root@iZbp18tya24l2k7vs6b7j4Z ~]# ulimit -n 65536
[root@iZbp18tya24l2k7vs6b7j4Z ~]# ulimit -n
65536
````