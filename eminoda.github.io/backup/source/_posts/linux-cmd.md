---
title: linux-cmd
date: 2017-07-28 09:47:48
tags:
  - linux
categories: linux
comments: true
---

## netstat
-a (all)显示所有选项，默认不显示LISTEN相关
-t (tcp)仅显示tcp相关选项
-u (udp)仅显示udp相关选项
-n 拒绝显示别名，能显示数字的全部转化成数字。
-l 仅列出有在 Listen (监听) 的服務状态
-p 显示建立相关链接的程序名
-r 显示路由信息，路由表
-e 显示扩展信息，例如uid等
-s 按各个协议进行统计
-c 每隔一个固定时间，执行该netstat命令。

````
// 显示所有tcp，udp的监听中的ip信息，包含程序名
netstat -alptun |grep nginx
````

备注：如果非0.0.0.0:port而是ip:port，确认下nginx下server中listen数值
{% asset_img 1.png nginx显示0.0.0.0和ip的区别 %}

## ps
[参考ps api](http://www.cnblogs.com/wangkangluo1/archive/2011/09/23/2185938.html)

-A 显示所有进程（等价于-e）(utility)
-a 显示一个终端的所有进程，除了会话引线
-N 忽略选择。
-d 显示所有进程，但省略所有的会话引线(utility)
-x 显示没有控制终端的进程，同时显示各个命令的具体路径。dx不可合用。（utility）
-p pid 进程使用cpu的时间
-u uid or username 选择有效的用户id或者是用户名
-g gid or groupname 显示组的所有进程。
U username 显示该用户下的所有进程，且显示各个命令的详细路径。如:ps U zhang;(utility)
-f 全部列出，通常和其他选项联用。如：ps -fa or ps -fx and so on.
-l 长格式（有F,wchan,C 等字段）
-j 作业格式
-o 用户自定义格式。
v 以虚拟存储器格式显示
s 以信号格式显示
-m 显示所有的线程
-H 显示进程的层次(和其它的命令合用，如：ps -Ha)（utility）
e 命令之后显示环境（如：ps -d e; ps -a e）(utility)
h 不显示第一行

## curl
[curl api](https://curl.haxx.se/docs/httpscripting.html)