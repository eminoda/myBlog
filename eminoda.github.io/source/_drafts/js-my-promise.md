---
title: 写一个我自己的 promise
tags: js
categories:
	- 开发
	- js
thumb_img: javascript.jpg
---

## 起因

在老项目开发某功能，为了实现方便想用 promise，但因为浏览器兼容问题没有直接使用 promise，使用了 jquery 的 deferred ，对原生 promise 有了些疑问？

- jquery 怎么通过 deferred 支持类 promise 操作
- 怎么写个 promise-polyfill

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
new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(++data);
    }, 1000);
  })
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

对比 callback 方式，promise 无论在编码方式（异步转 **同步**），还是 **可读性** 上面都有这巨大的提升。

## MyPromise 简单实现

```js
function MyPromise(lazyFn) {
  this.lazyFn = lazyFn;
  this._resolve = function resolve(callback) {
    return function(data) {
      callback(data);
    }
  }
}

MyPromise.prototype.then = function(callback) {
  this.lazyFn(this._resolve(callback)); // 执行异步函数
}

new MyPromise(function(resolve) {
  setTimeout(function() {
    resolve('ok');
  }, 1000);
}).then(data => {
  console.log(data);
})
```

这里的实现牵扯一个重要的概念 —— **高阶函数**

this._resolve 会返回一个高阶 function，并且这个 function 的参数 data 是 resolve('ok') 中的 ok ；

在新建 MyPromise 对象后，将初始化一个延迟函数 this.lazyFn ，其需要一个 resolve 函数 ，就和原生 Promise 需要 resolve 和 reject 一样；

调用 then 后，传入 callback 函数，其是在延迟函数执行完，通过 this._resolve 返回的高阶函数后触发执行

## 别人怎么做的

## 附录

## 参考

> 我只是知识点的“加工者”， 更多内容请查阅原文链接 :thought_balloon: ， 同时感谢原作者的付出：

- [Promises MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Using_promises)
- [Promise 对象 阮一峰](http://es6.ruanyifeng.com/#docs/promise)
