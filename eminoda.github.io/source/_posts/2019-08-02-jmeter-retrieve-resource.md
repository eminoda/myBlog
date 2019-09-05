---
title: Jmeter 获取资源文件
tags:
  - jmeter
categories:
  - 开发
  - 自动化测试
thumb_img: jmeter.png
comments: true
date: 2019-08-02 09:58:58
---

通过问题形式，逐渐让大家对这内容有个认识：

## 如何使用 Jmeter 测试页面上的异步资源？

如果之前有类似经验，很容易知道下图的含义：

{% asset_img jmeter-resource.png %}

通常我们会压测某个 API 接口的性能情况，但是如果测试前端页面时，却不能反应真实的页面负载情况，因为页面上存在大量的异步资源（图片、js、css）

勾选 **Retrieve All Embedded Resources** ，Jmeter 将自动为我们从页面上解析这些资源，并向服务端请求。

## 加载异步资源后，会对测试有什么不同结果？

先看下 2 组测试：

- 测试首页。并发 100 次，不含资源
- 测试首页。并发 10 次，含资源（大致 26 个异步资源）

{% asset_img result-api.jpg 不含资源 %}

{% asset_img result-resource.jpg 含资源 %}

发现测试同一页面在是否勾选加载异步资源上，性能差别很大（即使这里给加载资源这组测试，并发调整为 10 次）

## 为什么会变得如此之差？

这个就涉及该选项 **Retrieve All Embedded Resources**，对资源是 **并发请求** 还是 **队列请求**。

经过测试：将其中一个异步资源 hold on 10 秒，结果发现后续请求都被 **堵塞**，证明该选项是会使请求挨个发出。

{% asset_img result.jpg %}

## 怎么改成并发请求？

勾选：**Parallel downloads**，并设置加载数量 Number，就可以改变其方式。

{% asset_img result-all.jpg %}

发现最慢的接口挪到了最后位，页面上的所有资源没有被异常堵塞。

## 参考

> 我只是知识点的“加工者”， 更多内容请查阅原文链接 :thought_balloon: ， 同时感谢原作者的付出：
