---
title: http 运营商劫持
tags: http
categories:
    - 开发
    - 其他
no_sketch: true
date: 2018-08-17 14:21:21
---

经常遇到这几个情况：

1. 好端端的一个 web 网站，代码、静态资源都是托管于公司云服务器，但是会遇到几次用户上报有什么红包浮窗（广告），结果我们并没有类似的功能代码
   {% asset_img hijack2.png 拿360举个例子 %}

2. App 嵌套我们 H5 页面，但是会发生页面无法展示，或者跳转到某电商推广页
   app 端日志显示跳转的地址变更为如下：

```
sinaweibo://cardlist?containerid=102803&luicode=10000404&lfid=yunyi_9999_005
```

3. 在公共网络下（地铁 wifi 等），访问某些网站会被强制跳转下，虽然页面出现，但是 Url 后添加了写参数。甚至有些海外服务器会被屏蔽。

> 为何会出现这些现象，其实都是运营商做的，称之为 Http 劫持

## [Http 劫持](https://baike.baidu.com/item/http劫持/383091)

> HTTP 劫持是在使用者与其目的网络服务所建立的专用数据通道中，监视特定数据信息，提示当满足设定的条件时，就会在正常的数据流中插入精心设计的网络数据报文，目的是让用户端程序解释“错误”的数据，并以弹出新窗口的形式在使用者界面展示宣传性广告或者直接显示某网站的内容。

{% asset_img hijack.png 简单说明http劫持（1，运营商缓存数据 2，运营商修改数据） %}

## 怎么避免、解决

虽说这不是我们开发造成的问题，但是为了更好的促使公司业务不受影响，还是提出几个方案

### 工信部投诉

看了几篇 blog 都说是良性部门，不妨一试。不过你要知道投诉的目标是什么。和开发没啥关系。

### http 缓存 https

最快，最方便。市面上有很多提供 https 的服务商，阿里也有免费的服务。

### 代码处理

参考[【前端安全】JavaScript 防 http 劫持与 XSS](http://www.cnblogs.com/coco1s/p/5777260.html)已经给出了详细点的解决方案

目前大致发现 2 种方式的劫持

-   iframe 嵌套。运营商会把我们网站嵌套于 iframe 下，在 iframe 外添加广告浮窗内容
-   body 注入广告代码。查看问题页面源码，会莫名多出非本站的 html 标签，或者引入了第三方 script

解决流程（伪代码）

```js
// 判断父子窗口的location
if (window.self != window.top) {
	// 非本站地址
	if (!whiteList) {
		// 标记hijack flag
		// 重定向，正确地址
	}
}

// 判断script标签
let sTag = document.getElementsByTagName('script');
// script标签不是白名单维护
if (sTag != whiteList) {
	// 标记hijack flag
}

// 判断body异常注入html
// 可以使用MutationObserver来判断
var targetNode = document.getElementById('bodyAll');
var observer = new MutationObserver(function(mutationsList) {
	for (var mutation of mutationsList) {
		if (mutation.type == 'childList') {
			// A child node has been added or removed.
			// mutation.addedNodes 获取添加的Node信息
			console.log(mutation.addedNodes[0]);
			// 判断是否非法
			// 标记hijack flag
		} else if (mutation.type == 'attributes') {
			console.log('The ' + mutation.attributeName + ' attribute was modified.');
		}
	}
});
observer.observe(targetNode, {
	attributes: true,
	childList: true,
	subtree: true
});
```

### 日志上报

代码处理方式中，上述多处记录了 hijack flag，可以专门写个上报的接口，用于记录那些非法链接等信息。用于对未来更好的处理劫持问题作参考。

## 参考

[【前端安全】JavaScript 防 http 劫持与 XSS](http://www.cnblogs.com/coco1s/p/5777260.html)
[关于 DNS、HTTP 劫持的一些事](http://m635674608.iteye.com/blog/2342832)
[深入理解 Http 请求、DNS 劫持与解析](https://juejin.im/post/59ba146c6fb9a00a4636d8b6)
[MutationObserver](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver)
