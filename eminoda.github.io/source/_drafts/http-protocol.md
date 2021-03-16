---
title: 深入浅出 Http 协议
tags:
  - http
categories:
  - 开发
  - 前端开发
thumb_img: http.png
---

# 前言

# OSI 和 TCP/IP 分层模型

## OSI（网络七层协议）

**网络七层协议** 又名 **开放式系统互联模型（OSI：Open System Interconnection Model）**

> 是一种概念模型，由国际标准化组织提出，一个试图使各种计算机在世界范围内互连为网络的标准框架。定义于 ISO/IEC 7498-1。

> 该模型将通信系统中的数据流划分为七个层，从跨通信介质传输位的物理实现到分布式应用程序数据的最高层表示。每个中间层为其上一层提供功能，其自身功能则由其下一层提供。功能的类别通过标准的通信协议在软件中实现。

具体每层干什么事情看下图：

{% asset_img osi.png 七层OSI模型 %}

## TCP/IP 四层模型

> TCP/IP 提供了点对点链接的机制，将资料应该如何封装、寻址、传输、路由以及在目的地如何接收，都加以标准化。它将软件通信过程抽象化为四个抽象层，采取协议堆栈的方式，分别实现出不同通信协议。协议族下的各种协议，依其功能不同，分别归属到这四个层次结构之中，常视为是简化的七层 OSI 模型。

下图，示意了和 OSI 的区别：

{% asset_img tcp-ip-layer.png TCP/IP四层模型 %}

## ICMP

**互联网控制消息协议（ICMP：Internet Control Message Protocol）**，和 TCP/IP 一样，也是互联网协议族的核心协议之一。

> 它用于网际协议（IP）中发送控制消息，提供可能发生在通信环境中的各种问题反馈。通过这些信息，使管理者可以对所发生的问题作出诊断，然后采取适当的措施解决。

> ICMP 依靠 IP 来完成它的任务，它是 IP 的主要部分。它与传输协议（如 TCP 和 UDP）显著不同：它一般不用于在两点间传输数据。它通常不由网络程序直接使用，除了 ping 和 traceroute 这两个特别的例子。 IPv4 中的 ICMP 被称作 ICMPv4，IPv6 中的 ICMP 则被称作 ICMPv6。

# Http 协议

## 三次握手

## 四次分手

## http2

# Https

# 最后

## 参考

[TCP/IP Model: Layers & Protocol | What is TCP IP Stack?](https://www.guru99.com/tcp-ip-model.html)
[计算机网络漫谈：OSI 七层模型与 TCP/IP 四层（参考）模型](https://www.jianshu.com/p/c793a279f698)
