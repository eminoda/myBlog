---
title: 初涉 JMeter
tags:
  - jmeter
categories:
  - 开发
  - jmeter
thumb_img: jmeter.png
---

# JMeter

这是一个最最最简单的入门，我只为了完成 **阿里云 PTS** 测试顺带看下 jmeter，什么术业有专攻，在前（quan）端（zhan）面前全是扯淡。

## 环境配置

**jdk 安装**

网上一大把资料，这里不再描述

**JMeter 安装**

[下载地址](http://jmeter.apache.org/download_jmeter.cgi)

在上面下载页中，找到 **apache-jmeter-5.x.x.tgz** 下载（最低需要 java 8+ 以上的版本）

一顿无脑安装，在 **安装目录下**（jmeter\apache-jmeter-5.1.1\bin） 找到 **jmeter.bat** 点击运行

模拟一个 Http 测试计划，来简单说明 JMeter 的配置

## Thread Group

新建 TreadGroup

{% asset_img ThreadGroup-1.png 新建 TreadGroup %}

主界面

{% asset_img ThreadGroup-2.png %}

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

# 其他

上面都有些无聊，这里补充一些基础知识点

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

# 参考

[timing 含义解释](https://blog.csdn.net/qq_20881087/article/details/56682525)
[jmeter 压力测试 设置一秒发送一次请求，一秒两次请求](http://www.jsjtt.com/java/javaceshi/124.html)
