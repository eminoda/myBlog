---
title: readInt16BE 和 readInt16LE的区别
tags: node
categories:
  - 前端
  - node
  - buffer
thumb_img: endianess.jpg
date: 2018-05-08 00:36:45
---


放张图，如果不出所料，大家应该也不知道什么意思。毕竟写个页面为毛和**进制**扯上关系了。这是个扩展出来的话题，要不是看[getCookies的bug](https://news.ycombinator.com/item?id=16975025)，我也不会去查阅了解这个文章标题中2个规范有什么区别。

{% asset_img endian.jpg big endian 和 little endian %}
下面就慢慢学习吧？（以下内容大概阅读15分钟）

## [端（endian）的起源](https://zh.wikipedia.org/wiki/%E5%AD%97%E8%8A%82%E5%BA%8F)
“endian”一词来源于十八世纪爱尔兰作家乔纳森·斯威夫特（Jonathan Swift）的小说《格列佛游记》（Gulliver's Travels）。小说中，小人国为水煮蛋该从大的一端（Big-End）剥开还是小的一端（Little-End）剥开而争论，争论的双方分别被称为“大端派”和“小端派”。以下是1726年关于大小端之争历史的描述：

>“我下面要告诉你的是，Lilliput和Blefuscu这两大强国在过去36个月里一直在苦战。战争开始是由于以下的原因：我们大家都认为，吃鸡蛋前，原始的方法是打破鸡蛋较大的一端，可是当今皇帝的祖父小时候吃鸡蛋，一次按古法打鸡蛋时碰巧将一个手指弄破了。因此他的父亲，当时的皇帝，就下了一道敕令，命令全体臣民吃鸡蛋时打破鸡蛋较小的一端，违令者重罚。老百姓们对这项命令极其反感。历史告诉我们，由此曾经发生过6次叛乱，其中一个皇帝送了命，另一个丢了王位。这些叛乱大多都是由Blefuscu的国王大臣们煽动起来的。叛乱平息后，流亡的人总是逃到那个帝国去寻求避难。据估计，先后几次有11000人情愿受死也不肯去打破鸡蛋较小的一端。关于这一争端，曾出版过几百本大部著作，不过大端派的书一直是受禁的，法律也规定该派任何人不得做官。”
— 《格列夫游记》 第一卷第4章 蒋剑锋（译）

## 什么是Big Endian、Little Endian
Big Endian:低地址存放最高有效字节
示例中，最高位字节是0x0A 存储在最低的内存地址处。下一个字节0x0B存在后面的地址处。正类似于十六进制字节从左到右的阅读顺序。
{% asset_img endian-1.png 摘自维基百科 %}
最低位字节是0x0D 存储在最低的内存地址处。后面字节依次存在后面的地址处。
Little Endian:低地址存放最低有效字节
{% asset_img endian-2.png 摘自维基百科 %}

## 那和node有毛关系？
下面几个api熟悉么？Buffer看见过吧？
{% asset_img buffer-1.png buffer api %}
node玩了许久，其实也就是调调接口，底层api接触的不多，如果不再查漏补缺可能来年就要被淘汰了，出去找工作都不好意思说有node经验。

通过一个例子，来看下：
````
//请问，分别输出多少？
Buffer.from('000A', 'hex').readUInt16BE(0);
Buffer.from('000A', 'hex').readUInt16LE(0);
````

开始解题：
1. 先看下Buffer.from什么意思？
// 根据编码，解析string，返回一个数组buffer
Buffer.from(str[, encoding]) returns a new Buffer containing a copy of the provided string.
````
Buffer.from('000A', 'hex');//<Buffer 00 0a>
````

2. readUInt16XX 到底怎么算？
看node api描述：readUInt16BE() returns big endian, readUInt16LE() returns little endian。
好了，看到这个就大致明白开头恶补的端的知识点(大端：顺着取位，小端：倒着取位)
那么，根据前面的buffer data，有以下计算过程：
00(16进制) -> 0(10进制) -> 00000000(2进制)（**8bit（位）=1byte（字节）**=1B）
0a -> 10(10) -> 00001010(2)
结果就非常好算了：
readUInt16BE(0) = 00000000 00001010 = 10
readUInt16LE(0) = 00001010 00000000 = 2560

## 实际应用
那就练下？看下某个库中p的值是怎么在实际运用的
{% asset_img try.png getCookie %}