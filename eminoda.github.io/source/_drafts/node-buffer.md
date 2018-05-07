---
title: node-buffer
tags:
---

# Buffer
接触过文件IO，Http传输数据，想必对Buffer不陌生。
但是node中Buffer怎么玩耍？我们平时项目遇到他只是单纯操作API，是否知道其中含义？
我希望这篇能够阐述几个Buffer的知识点，帮助你和我更多的了解这个API。

## 储存单位换算
首先了解下存储这玩意儿在计算机中的换算关系
8bit（位）=1byte（字节）=1B
1KB=1024B
1MB=1024KB
1GB = 1024MB
1TB = 1024GB
...

## 使用Buffer有什么好处

## Node中Buffer使用注意

## buf.readXX 和 buf.writeXX
| [node.js node.js里面.readUInt16BE是什么意思啊](http://cnodejs.org/topic/57aecb7e4653749872ec709f)

没怎么搞清楚，举个例子：
````
var hexBuffer = Buffer.from('000A', 'hex');//<Buffer 00 0a>
bufferHex.length;//2
var hexBufferBE = Buffer.from('000A', 'hex').readUInt16BE(0);//10
var hexBufferLE = Buffer.from('000A', 'hex').readUInt16LE(0);//2560
````
解释一波：
1. [端（endian）的起源](https://zh.wikipedia.org/wiki/%E5%AD%97%E8%8A%82%E5%BA%8F)
“endian”一词来源于十八世纪爱尔兰作家乔纳森·斯威夫特（Jonathan Swift）的小说《格列佛游记》（Gulliver's Travels）。小说中，小人国为水煮蛋该从大的一端（Big-End）剥开还是小的一端（Little-End）剥开而争论，争论的双方分别被称为“大端派”和“小端派”。以下是1726年关于大小端之争历史的描述：

“	我下面要告诉你的是，Lilliput和Blefuscu这两大强国在过去36个月里一直在苦战。战争开始是由于以下的原因：我们大家都认为，吃鸡蛋前，原始的方法是打破鸡蛋较大的一端，可是当今皇帝的祖父小时候吃鸡蛋，一次按古法打鸡蛋时碰巧将一个手指弄破了。因此他的父亲，当时的皇帝，就下了一道敕令，命令全体臣民吃鸡蛋时打破鸡蛋较小的一端，违令者重罚。老百姓们对这项命令极其反感。历史告诉我们，由此曾经发生过6次叛乱，其中一个皇帝送了命，另一个丢了王位。这些叛乱大多都是由Blefuscu的国王大臣们煽动起来的。叛乱平息后，流亡的人总是逃到那个帝国去寻求避难。据估计，先后几次有11000人情愿受死也不肯去打破鸡蛋较小的一端。关于这一争端，曾出版过几百本大部著作，不过大端派的书一直是受禁的，法律也规定该派任何人不得做官。”	”
— 《格列夫游记》 第一卷第4章 蒋剑锋（译）

2. 什么是Big Endian、Little Endian
Big Endian:低地址存放最高有效字节
示例中，最高位字节是0x0A 存储在最低的内存地址处。下一个字节0x0B存在后面的地址处。正类似于十六进制字节从左到右的阅读顺序。
{% asset_img endian-1.png 摘自维基百科 %}
最低位字节是0x0D 存储在最低的内存地址处。后面字节依次存在后面的地址处。
Little Endian:低地址存放最低有效字节
{% asset_img endian-2.png 摘自维基百科 %}

3. 说了辣么多，现在解释代码
Buffer.from('000A', 'hex'); 生成长度为2的数组(<Buffer 00 0a>)，并且每个是16进制
进制换算
00(16) -> 0(10) -> 00000000(2)
0a -> 10(10) -> 00001010(2)
readUInt16BE:00000000 00001010 = 0
readUInt16LE:00001010 00000000 = 2560

````
