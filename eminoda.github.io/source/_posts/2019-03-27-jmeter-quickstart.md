---
title: 初涉 JMeter
tags:
  - jmeter
categories:
  - 开发
  - jmeter
thumb_img: jmeter.png
date: 2019-03-27 18:17:04
---


# JMeter

> 用 Java 设计的测试工具，初衷设计用来测试 web 应用，现在扩展到更多的测试领域

这是一个最最最简单的入门，了解 **阿里云 PTS** 测试时顺带看下 jmeter，什么术业有专攻，在前（quan）端（zhan）面前全是浮云。

## 环境配置

**jdk 安装**

网上一大把资料，这里不再描述

**JMeter 安装**

[下载地址](http://jmeter.apache.org/download_jmeter.cgi)

在上面下载页中，找到 **apache-jmeter-5.x.x.tgz** 下载（最低需要 java 8+ 以上的版本）

一顿无脑安装，在 **安装目录下**（jmeter\apache-jmeter-5.1.1\bin） 找到 **jmeter.bat** 点击运行

# 举一个例子

模拟一个 Http 测试计划，来介绍 JMeter 的配置

## 创建一个新任务

所有 TestPlan 都是需要线程作为用户来运作，首先需要新建 Thread Group

{% asset_img ThreadGroup-1.png 新建 TreadGroup %}

{% asset_img ThreadGroup-2.png 主界面 %}

**主要参数**

| 参数                       | 说明               |
| -------------------------- | ------------------ |
| Number of Threads(users)   | 线程数（虚拟用户） |
| Ramp-Up Period(in seconds) | 每秒增加用户数     |
| Loop Count                 | 循环次数           |

举例：

1. 明白 Ramp-Up Period 参数

   - Number of Threads = 10
   - Ramp-Up Period = 20
   - Loop Count = 1

   将准备 10 个线程，每 2 秒（Ramp-Up Period/Number of Threads）后创建新线程运行 plan，总共循环 1 次

   ```
   [26/Mar/2019:13:18:23 +0800]
   [26/Mar/2019:13:18:25 +0800]
   [26/Mar/2019:13:18:27 +0800]
   [26/Mar/2019:13:18:29 +0800]
   [26/Mar/2019:13:18:31 +0800]
   [26/Mar/2019:13:18:33 +0800]
   [26/Mar/2019:13:18:35 +0800]
   [26/Mar/2019:13:18:37 +0800]
   [26/Mar/2019:13:18:39 +0800]
   [26/Mar/2019:13:18:41 +0800]
   ```

2. 每秒发送一个请求持续 1 分钟

   - Number of Threads = 1
   - Ramp-Up Period = 1
   - Loop Count = 60

## 创建一个 Http 用例

注意是在 TreadGroup 这栏，右键创建
{% asset_img HttpRequest-1.png %}

{% asset_img HttpRequest-2.png 主界面 %}

这里可以设置 Http 请求所有的内容：协议、方法、地址、端口、参数。按照具体要求设置。

**值得一提** 的是在 Advanced tab 选项中，可以设置：**Retrieve All Embedded Resources**

{% asset_img HttpRequest-3.png 异步资源 %}

一般情况下测试一个页面，测试工具只是拿到页面的 document 内容，不会对页面中异步资源（js、css、images）做二次请求（包括 ab），如果勾选了上面这个选项，就会请求所有异步资源。

## Http 公用配置

Jmeter 也提供了很多自定义的配置，方便公用

这里举个维护 Http 请求头的例子：

{% asset_img Config-1.png Http-Header %}

{% asset_img Config-Http.png Http-Agent %}

## 添加监听

运行完，你也不知道发生什么。通常还需要设置一个监听，这样所有的用例结果就会提现出来

{% asset_img Listener.png %}

{% asset_img Listener-Result.png %}

这图正好有两条记录，分别测试 Retrieve All Embedded Resources 选项的区别，能看到响应时间差的不是一点半点。

# Jmeter 报告

需要一个图形化统计来量化这些测试结果数据

具体 api 解释：

```
To run Apache JMeter in NON_GUI mode and generate a report at end :
Open a command prompt (or Unix shell) and type:

jmeter.bat(Windows)/jmeter.sh(Linux) -n -t test-file [-p property-file] [-l results-file] [-j log-file] -e -o [Path to output folder]
```

参考脚本：

```
jmeter\apache-jmeter-5.1.1\bin>jmeter -n -t ./jm/indexPlan.jmx -l ./jm/result/log -e -o ./jm/output
```

**可能出现的问题**

```
WARNING: Could not open/create prefs root node Software\JavaSoft\Prefs at root 0x80000002. Windows RegCreateKeyEx(...) returned error code 5.
```

登录注册表：regedit，修改/新添加：计算机\HKEY_LOCAL_MACHINE\SOFTWARE\JavaSoft\Prefs

# 其他

上面都是些简单操作，更多的需要专业的测试人员来接入。这里补充一点其他基础内容：

## 一个页面总用时时间消耗在哪些方面？

首先，在服务器端，某页面请求 nginx 日志如下：

```
[26/Mar/2019:10:34:51 +0800] Mozilla/5.0 ... Chrome/49.0.2623.221 1.0 GET / HTTP/1.1 200 24612 0.042 -
```

最后位 0.042 代表耗时 42ms

而然，在浏览器端却耗时 93ms，相差一半。放张图，聪明的你一看就明白我想说什么了：

{% asset_img request.png %}

| 项目               | 说明                       |
| ------------------ | -------------------------- |
| Queueing           | 浏览器内部的发请求排队时间 |
| Stalled            | 发送请求前，准备的时间     |
| Proxy negotiation  | 代理商解析时间             |
| DNS Lookup         | DNS 解析时间               |
| Initial connection | TCP 握手时间               |
| Request sent       | 请求信息发出时间           |
| Waiting (TTFB)     | 服务器响应时间             |
| Content Download   | 响应资源下载时间           |

上面内容可能解释有出入，但基本也解释了这一半多时间消耗在哪方面。

## 阿里云 PTS

> 性能测试（Performance Testing Service，简称 PTS）是具备强大的分布式压测能力的 SaaS 压测平台，可模拟海量用户的真实业务场景，全方位验证业务站点的性能、容量和稳定性。

下面是 200 并发，对首页做的测试：
{% asset_img pts.png pts %}
{% asset_img pts2.png pst-time %}

- TPS:188.33 （事务/秒）
- 请求总数：11577 （个）

对比 ab，结果差不多

```

[root@iZbp15avj2fzy1tjdlwce7Z ~]# ab -n 11500 -c 200 http://www.niu100.com

Document Path:          /
Document Length:        35695 bytes

Concurrency Level:      200
Time taken for tests:   60.122 seconds
Complete requests:      11500
Failed requests:        1179
   (Connect: 0, Receive: 0, Length: 1179, Exceptions: 0)
Write errors:           0
Total transferred:      406280852 bytes
HTML transferred:       404440852 bytes
Requests per second:    191.28 [#/sec] (mean)
Time per request:       1045.606 [ms] (mean)
Time per request:       5.228 [ms] (mean, across all concurrent requests)
Transfer rate:          6599.19 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        1    1   0.3      1      13
Processing:    28 1020 949.6    740    4324
Waiting:       26 1019 949.6    738    4323
Total:         29 1021 949.6    742    4325

Percentage of the requests served within a certain time (ms)
  50%    742
  66%   1124
  75%   1457
  80%   1651
  90%   3035
  95%   3117
  98%   3208
  99%   3481
 100%   4325 (longest request)
```

## 参考

[timing 含义解释](https://blog.csdn.net/qq_20881087/article/details/56682525)
[jmeter 压力测试 设置一秒发送一次请求，一秒两次请求](http://www.jsjtt.com/java/javaceshi/124.html)
