---
title: 写一个我自己的 promise
tags: js
categories:
	- 开发
	- js
thumb_img: javascript.jpg
---

MyPromise

## 先了解下 Promise

首先 Promise 是一种异步解决方案，更友好的解决 js 里的“地狱回调”。

比如：我们有多个异步操作，为了让变量按照预设逻辑执行，代码就会变成如下回调循环

```js
let data = 0;
setTimeout(function() {
	data++;
	setTimeout(function() {
		data++;
		setTimeout(function() {
			data++;
			console.log(data); //  3
		}, 1000);
	}, 1000);
}, 1000);
```

如果使用 Promise 就可以变成如下形式：

```js
var timePromiseFn = function(data) {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			resolve(++data);
		}, 1000);
	});
};
timePromiseFn(0)
	.then(data => {
		return timePromiseFn(data);
	})
	.then(data => {
		return timePromiseFn(data);
	})
	.then(data => {
		console.log(data);
	});
```

对比 callback 方式，promise 无论在编码，还是可读性上面都有这巨大的提升。

## MyPromise 简单实现

```js
function MyPromise(fn) {
	this.uid = new Date().getTime();
	this.resolveFn = function(data) {
		return function(callback) {
			callback(data);
		};
	};
	this.then = function(callback) {
		fn(this.resolveFn(data)(callback), this.rejectFn);
	};
}
```

## 别人怎么做的

## 附录

## 参考

> 我只是知识点的“加工者”， 更多内容请查阅原文链接 :thought_balloon: ， 同时感谢原作者的付出：

-   [Promises MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Using_promises)
-   [Promise 对象 阮一峰](http://es6.ruanyifeng.com/#docs/promise)
