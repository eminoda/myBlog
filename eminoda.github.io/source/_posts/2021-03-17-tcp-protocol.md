---
title: 借助 wireshark 网络分析工具，剖析 TCP 三次握手流程
tags:
  - http
categories:
  - 开发
  - 前端开发
thumb_img: tcp.png
date: 2021-03-17 16:13:36
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

**TCP/IP 模型** 中，将 **OSI** 的应用层，表示层，会话层抽象为一个大应用层。

# WireShake

相信各位肯定看了很多遍类似这样的图：

{% asset_img tcp_open_close.jpg tcp握手图例 %}

但我一直没有真真实实地看到 **TCP** 创建和断开连接这样的过程，希望能像 **Chrome Develop Tool** 直观看到接口的请求和响应。而不是根据别人的文章所云的进行机械的记忆。

为了了解 **TCP** 协议怎么进行握手的？这里就需要用到一个网络分析工具： **WireShake**。

下面在说明 **三次握手** 和 **四次挥手** 时，会结合在 **WireShake** 看到的实际结果来理解 TCP 的连接过程。

# 三次握手（three-way handshake）

在开始 TCP 说如何创建连接之前，先看下一些关键名词解释：

- **seq（Sequence Number）**：端与端之间通讯的（初始化）序列号
- **SYN（Synchronize Sequence Numbers）**：每次通讯需要对上述序列号（seq）进行 **同步操作**，以 **解决网络包乱序问题**（reordering）。
- **ACK（Acknowledgement Number）**：用于确定接收到包后的回复确认，**解决不丢包的问题**。

了解了上述名词后，再来看 **三次握手** 的过程图：

{% asset_img tcp-connect.png TCP创建连接 %}

上图已经已经很清晰地展示了创建连接的过程。现在我们实际发送一个 Http 请求，并结合 **WireShake** 看下具体步骤细节：

1. 首先，我们访问一个网站（http://www.eminoda.com/elsa），在 Http 请求之前，先有了三次 TCP 的请求记录：

   {% asset_img tcp-create-1.png %}

2. 第 1 次：客户端向正常工作的服务端（**LISTEN** 状态）发送同步序列号请求（seq=x），同时客户端状态进入 **SYN_SENT**

   {% asset_img tcp-create-2.png %}

3. 第 2 次：服务端收到后，创建 **ACK** 应答码作为收到确认信息（值为接受到的 seq+1，即：ACK=x+1），并创建新的序列号（seq=y），再一同发送给客户端。并进入 **SYN_RCVD** 状态

   {% asset_img tcp-create-3.png %}

4. 第 3 次：客户端收到后，也创建 **ACK** 应答码作为收到确认信息（值为接受到的 seq+1，即：ACK=y+1），再发送给服务端，并进入 **ESTABLISHED** 状态

   {% asset_img tcp-create-4.png %}

5. 最后，服务端收到后，进入 **ESTABLISHED** 状态，此时 **TCP** 连接创建成功，

   {% asset_img tcp-create-5.png %}

# 四次挥手

四次挥手和三次握手相反，用于 TCP 连接后的断开，下面是过程图：

{% asset_img tcp-close.png TCP关闭连接 %}

结合 **WireShake** 也看下步骤：

1. 首先，在 **WireShake** 找到对应四次挥手的 TCP 请求：

   {% asset_img tcp-close-1.png %}

2. 第 1 次：客户端准备 **序列号（seq=4710）** 和 **应答码（ACK=1245）**，并设置 **FIN** 标识（示意没有数据传输了，要求释放连接）发送给服务端后，进入 **FIN_WAIT_1** 状态

   {% asset_img tcp-close-2.png %}

3. 第 2 次：服务端收到后，准备 **序列号（seq=1245）** 和 **应答码（ACK=4710+1）** 发送给客户端，进入 **CLOSE_WAIT** 状态

   {% asset_img tcp-close-3.png %}

4. 客户端收到后，确认了服务端同意关闭连接请求，并进入 **FIN_WAIT_2** 状态。此状态中将等待服务端再次发送的请求，已让客户端可以关闭连接。
5. 第 3 次：过些“时间”后，服务端像客户端第一次发送的数据类似，发送 **序列号（seq=1245）** 和 **应答码（ACK=4711）**，并设置 **FIN** 标识，并进入 **LAST_ACK** 状态

   {% asset_img tcp-close-4.png %}

6. 第 4 次：客户端收到后，发送 **序列号（seq=4711）** 和**应答码（ACK=1245+1）**，进入 **TIME_WAIT** 状态，如果服务端收到后将关闭。之后客户端等待 2MSL 时间后还没收到服务端数据也将关闭，至此整个 **TCP** 连接中断。

   {% asset_img tcp-close-5.png %}

# 一些问题

## 为什么握手是三次，而不是二次？

减少次数，看上去更能提高通讯效率，但同样会增加连接的不确定性。详见下图：

{% asset_img doc.png %}

总结下，就是端与端之间需要单独一次一来一回的通讯（以确认 **seq** 是否串台）来防止非预期的连接错误，加上首次的 **SYN** 请求总共三次。

## 那为何挥手是四次？

因为 **TCP** 是双工通讯，某一端要向另一端发送关闭连接请求都是需要发送一次 FIN 请求，和接受一次针对 **FIN** 请求的应答确认。此时一端处于半连接状态（还可以发送数据），则需要反过来发送一次 **FIN** ，和接口一次 **ACK** 应答，最后两端才能都关闭。

## TCP 数据包长什么样？

先来看下 **TCP** 数据表的结构：

{% asset_img tcp-data-pkg1.png tcp数据结构 %}

但凡网络课程睡觉的同学看到这表格可能和我一样蒙，但又说不出的熟悉，这里使用 **WireShake** 来读懂这个数据结构。

先看下和 **标准网络 OSI 模型** 的映射关系：

{% asset_img tcp-ref.png 和OSI模型的映射关系 %}

下面逐步对这个数据包进行拆分查看，首先是 **Frame** ：

{% asset_img tcp-pkg-1.png Frame %}

能看到整个数据包大小为 753 字节，其数据就和上图下方的内容：

```
0000   c8 a7 76 d2 08 52 80 30 49 26 62 97 08 00 45 00   ..v..R.0I&b...E.
0010   02 e3 32 be 40 00 80 06 38 9b c0 a8 11 3f 2f 67   ..2.@...8....?/g
0020   8b 6d c7 c7 00 50 bb a1 d5 70 b3 2f 4b 04 50 18   .m...P...p./K.P.
0030   02 01 0e 63 00 00 47 45 54 20 2f 65 6c 73 61 2f   ...c..GET /elsa/
...
```

接着看以太网 **Ethernet** 内容：

{% asset_img tcp-pkg-2.png Ethernet %}

以太网帧头部为 14 字节（你可以双击 Ethernet 那栏，然后在底部看到“c8 a7 76 d2 08 52 80 30 49 26 62 97 08 00”被选中），并能看到 2 个通讯方的 Mac 地址，以及了解网卡是哪个厂家生产的。

最后注意有个 **Type** 字段，标识上层协议是 **IPV4** 。

然后是 **Internet Protocol** 内容：

{% asset_img tcp-pkg-3.png Internet Protocol %}

IP 协议层头部为 20 字节内容，这里你能具体看到两个 IP 地址值。

再是 **Transmission Control Protocol** （TCP）传输层的内容：

{% asset_img tcp-pkg-4.png Transmission Control Protocol %}

在这里能看到数据包大小（**TCP Segment Len**）为 699 字节（753-14-20），这个值比较重要，因为下一次服务端将用 ACK=700（699+1）作为应答码发送给客户端。

另外，因为连接已经创建，这次 **TCP** 报文中的标识符除了上面见过的 **FIN** ， **ACK** ， **SYN** 外，还出现了 **PUSH** （指示接收方应该尽快将这个报文段交给应用层而不用等待缓冲区装满）。

再提个，能在底部看到一个 iRTT（Initial Round Trip Time）参数，他是个计算 TCP Window 窗口滑动的参数之一（有兴趣可以在底部参考链接里查阅）。

最后就是我们再熟悉不过的 **http** 协议：

{% asset_img tcp-pkg-5.png http %}

# 最后

本文结合 **wireshake** 工具的使用，泛泛讲了下一些 TCP 协议的知识点，更多深入的内容可以查阅如下参考文章。

[TCP 的那些事儿（上/下）](https://coolshell.cn/articles/11564.html)
[计算机网络漫谈：OSI 七层模型与 TCP/IP 四层（参考）模型](https://www.jianshu.com/p/c793a279f698)
[通俗大白话来理解 TCP 协议的三次握手和四次分手](https://github.com/jawil/blog/issues/14)
[好文推荐：计算机网络篇](https://github.com/JeffyLu/JeffyLu.github.io/issues/22)
[Wireshark-TCP 协议分析（包结构以及连接的建立和释放）](https://blog.csdn.net/ahafg/article/details/51039584)
[Determining TCP Initial Round Trip Time](https://blog.packet-foo.com/2014/07/determining-tcp-initial-round-trip-time/)
