---
title: TCP 三次握手及四次挥手
tags:
  - http
categories:
  - 开发
  - 前端开发
thumb_img: tcp.png
---

# TCP（传输控制协议）

> **TCP：传输控制协议（Transmission Control Protocol）** 是一种面向连接的、可靠的、基于字节流的传输层通信协议，由 IETF 的 RFC 793 定义。

通常我们听到 **TCP/IP 协议（族）** 那么种称呼，其作用如下：

> TCP/IP 提供了点对点链接的机制，将资料应该如何封装、寻址、传输、路由以及在目的地如何接收，都加以标准化。
> 它将软件通信过程抽象化为 **四个抽象层**，采取协议堆栈的方式，分别实现出不同通信协议。协议族下的各种协议，依其功能不同，分别归属到这四个层次结构之中，常视为是 **简化的七层 OSI 模型**。

那什么是 **七层 OSI 模型** ？下图展示了 **OSI 模型** 的结构：

{% asset_img osi.png 七层OSI模型 %}

了解了 **OSI 模型** 后，再来看下 **TCP/IP 四层模型** 的对比：

{% asset_img tcp-ip-layer.png TCP/IP四层模型 %}

# WireShake

为了了解 TCP 协议怎么进行握手的？相信各位肯定看了很多遍类似这样的图：

{% asset_img tcp_open_close.jpg tcp握手图例 %}

这图很正确，但我一直没有真真实实地看到 TCP 连接和断开连接这样的过程，希望能像 **Chrome Develop Tool** 直观看到接口的请求和响应。而不是根据别人的文章所云的进行机械的记忆。

这里就需要用到一个网络分析工具： **WireShake**。

下面在说明 **三次握手** 和 **四次挥手** 时，会结合在 **WireShake** 看到的实际结果来理解 TCP 的连接过程。

# 三次握手（three-way handshake）

在开始 TCP 说如何创建连接之前，先看下一些关键名词解释：

- **seq（Sequence Number）**：端与端之间通讯的（初始化）序列号
- **SYN（Synchronize Sequence Numbers）**：每次通讯需要对上述序列号（seq）进行 **同步操作**，以 **解决网络包乱序问题**（reordering）。
- **ACK（Acknowledgement Number）**：用于确定接收到包后的回复确认，**解决不丢包的问题**。

了解了上述名词后，再来看 **三次握手** 的过程图：

{% asset_img tcp-connect.png TCP创建连接 %}

上图创建连接的过程已经很清晰了，下面结合 **WireShake** 看下步骤细节：

1. 首先，我们创建连接会有三段 TCP 的握手过程

   {% asset_img tcp-create-1.png %}

2. 第一次，客户端向正常工作的服务端（**LISTEN** 状态）发送 seq=x 同步序列号请求，同时客户端状态为：**SYN_SENT**

   {% asset_img tcp-create-2.png %}

3. 第二次，服务端收到后，进入 **SYN_RCVD** 状态，创建 ACK 应答码（值为 x+1）作为收到确认信息，并创建新的 seq=y 一同发送给客户端

   {% asset_img tcp-create-3.png %}

4. 第三次，客户端收到后，进入 **ESTABLISHED** 状态，也创建 ACK 应答码（值为 y+1）作为收到确认信息，再发送给服务端

   {% asset_img tcp-create-4.png %}

5. 最后，服务端收到后，进入 **ESTABLISHED** 状态，TCP 连接创建成功。

   {% asset_img tcp-create-5.png %}

{% asset_img tcp-close.png TCP关闭连接 %}

# 四次挥手

# 参考

[TCP 的那些事儿](https://coolshell.cn/articles/11564.html)
[计算机网络漫谈：OSI 七层模型与 TCP/IP 四层（参考）模型](https://www.jianshu.com/p/c793a279f698)
[通俗大白话来理解 TCP 协议的三次握手和四次分手](https://github.com/jawil/blog/issues/14)
[好文推荐：计算机网络篇](https://github.com/JeffyLu/JeffyLu.github.io/issues/22)
