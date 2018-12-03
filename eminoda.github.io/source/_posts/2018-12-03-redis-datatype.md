---
title: redis 数据类型说明
tags: redis
categories:
  - 前端
  - redis
thumb_img: redis.png
date: 2018-12-03 16:05:20
---


> 全文参考：[redis 数据类型 https://redis.io/topics/data-types-intro](https://redis.io/topics/data-types-intro)

redis 不是简单的键值对存储容器，它是一个具有数据结构的服务，支持不同数据类型：

- String 字符串
- Lists 列表
- Sets 唯一、无序的元素集合
- Sorted sets 和 Sets 类似，但每个元素具有一个 Score 标识分数，通过分数的高低来排序整个集合
- Hashes 具有 map 类型，存储 key-value
- Bit arrays(bitmaps)
- HyperLogLogs

## Redis Strings

最简单的数据类型，比如：用于缓存 html 模板或页面。

value 可以保存二进制文件，比如图片资源，但有最大限制（512 MB）

### 简单 **set/get** 示例：

```
192.168.1.60:0>set test:string abcd
OK

192.168.1.60:0>get test:string
abcd
```

### set 可以设置 optios，完成一些特殊需求

```
set key value options
```

- EX seconds -- Set the specified expire time, in seconds.
- PX milliseconds -- Set the specified expire time, in milliseconds.
- NX -- Only set the key if it does not already exist.
- XX -- Only set the key if it already exist.

```
# 设置失效时间3s，到期自动删除
192.168.1.60:0>set test:string abcd ex 3
OK
# key已存在，失败
192.168.1.60:0>set test:string abcd nx
NULL

# key不存在，失败
192.168.1.60:0>set test:string2 abcd xx
NULL

192.168.1.60:0>set test:string abcd xx
OK
```

### incr 累加

> That even multiple clients issuing INCR against the same key will never enter into a race condition

这类操作符具有原子性，多个客户端并发请求并不会造成同样的 result

除了 **INCR** 相同的操作还有：**INCRBY、DECR、DECRBY**

备注：如果 key 为非数字，则会默认从 1 开始。

```
192.168.1.60:0>set test:string 10
OK
# 每次+1
192.168.1.60:0>incr test:string
11
# 设置增量
192.168.1.60:0>incrby test:string 20
31
```

### 合并 merge 操作

```
192.168.1.60:0>mset test:string2 eee test:string3 fff
OK

192.168.1.60:0>mget test:string2 test:string3
1) eee
2) fff
```

### 存在和删除

```
192.168.1.60:0>exists test:string3
1

192.168.1.60:0>del test:string3
1

192.168.1.60:0>del test:string3
0

192.168.1.60:0>exists test:string3
0
```

### 类型 Type

查询 redis 的数据类型

```
192.168.1.60:0>type test:string
string
```

### 过期时间 Expires

单位是秒，到期后删除 key

```
192.168.1.60:0>expire test:string2 10
1
192.168.1.60:0>get test:string2
NULL
```

## Redis Lists

redis lists 是链表数据结构，这意味着即使有个包含很多元素的 list，从表头 or 从表尾添加元素的耗时是一样的。

### rpush & lpush

- rpush 表尾添加元素
- lpush 表头添加元素

```
192.168.1.60:0>rpush test:list a
1

192.168.1.60:0>rpush test:list b
2

192.168.1.60:0>lpush test:list c
3

192.168.1.60:0>lrange test:list 0 1
1) c
2) a
```

### 出栈 rpop & lpop

取元素，取完该 list 就为空

```
192.168.1.60:0>rpush test:list a b c
3

192.168.1.60:0>rpop test:list
c

192.168.1.60:0>lpop test:list
a

192.168.1.60:0>lpop test:list
b

192.168.1.60:0>lpop test:list
NULL
```

### 典型场景

- 用于社交圈中最新的信息
- 生产者和消费者

### 对 list 整体的操作

**ltrim** 理解为裁剪列表，类似于 js slice

**llen** 查询 list 长度

```
192.168.1.60:0>rpush test:list a b c d e
5

# test:list 最终为 b c
192.168.1.60:0>ltrim test:list 1 2
OK

192.168.1.60:0>llen test:list
2

192.168.1.60:0>exists test:list
1
# 删除 list
192.168.1.60:0>del test:list
1

192.168.1.60:0>exists test:list
0
```

## Redis Hashes

**hmset** 保存多个 key-value 键值对到对象中

区别 hset

```
192.168.1.60:0>hmset user:1 name aaaa age 10
OK

192.168.1.60:0>hget user:1 age
10

# 区别 hset
192.168.1.60:0>hset user:2 name bbbb age 20
ERR wrong number of arguments for 'hset' command

192.168.1.60:0>hset user:2 name bbbb
1

192.168.1.60:0>hget user:2 name
bbbb
```

## Redis Sets

```
192.168.1.60:0>sadd test:set 1 2 3
3

192.168.1.60:0>smembers test:set
1) 1
2) 2
3) 3
# 元素不存在
192.168.1.60:0>sismember test:set 100
0

192.168.1.60:0>sismember test:set 3
1
```

### Redis Sorted sets

```
# 设置无序元素
192.168.1.60:0>zadd test:sset 20 a 30 b 2 c
3

# 从小到大，排序输出
192.168.1.60:0>zrange test:sset 0 -1
1) c
2) a
3) b
```

## Bitmaps

不是一种新的数据类型，归于 String type 中。但能创建 512mb 的空间，约 2^32 的 bits。
因为是二进制，value 只能设为 0、1

```
# setbit key space value
192.168.1.60:0>setbit test:space 20000 1
0

192.168.1.60:0>setbit test:space 20000 1
0

192.168.1.60:0>getbit test:space 20000
1

192.168.1.60:0>getbit test:space 19999
0
```

## HyperLogLogs

> A HyperLogLog is a probabilistic data structure used in order to count unique things (technically this is referred to estimating the cardinality of a set). Usually counting unique items requires using an amount of memory proportional to the number of items you want to count, because you need to remember the elements you have already seen in the past in order to avoid counting them multiple times. However there is a set of algorithms that trade memory for precision: you end with an estimated measure with a standard error, which in the case of the Redis implementation is less than 1%. The magic of this algorithm is that you no longer need to use an amount of memory proportional to the number of items counted, and instead can use a constant amount of memory! 12k bytes in the worst case, or a lot less if your HyperLogLog (We'll just call them HLL from now) has seen very few elements.

HLLs 是一种统计学上的一种算法。通常储存元素和内存占用成正比，但通过 HLLs 可以最大 12k 来标识所要存储的所有数据。**用精度换取内存空间**

可能不太会使用，暂不尝试
