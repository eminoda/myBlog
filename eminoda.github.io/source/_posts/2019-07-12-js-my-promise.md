---
title: 写一个我自己的 promise
tags: js
categories:
  - 开发
  - 前端开发
thumb_img: javascript.jpg
date: 2019-07-12 15:25:36
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
    };
  };
}

MyPromise.prototype.then = function(callback) {
  this.lazyFn(this._resolve(callback)); // 执行异步函数
};

new MyPromise(function(resolve) {
  setTimeout(function() {
    resolve('ok');
  }, 1000);
}).then(data => {
  console.log(data);
});
```

这里的实现牵扯一个重要的概念 —— **高阶函数**

this.\_resolve 会返回一个高阶 function，并且这个 function 的参数 data 是 resolve('ok') 中的 ok ；

在新建 MyPromise 对象后，将初始化一个延迟函数 this.lazyFn ，其需要一个 resolve 函数 ，就和原生 Promise 需要 resolve 和 reject 一样；

调用 then 后，传入 callback 函数，其是在延迟函数执行完，通过 this.\_resolve 返回的高阶函数后触发执行。

## 别人怎么做的

### jQuery

简单的看下 jq 中 deferred 的 promise.then 的实现：

{% asset_img jquery-deferred.png jquery-deferred %}

```js
tuples = [
  // action, add listener, listener list, final state
  ['resolve', 'done', jQuery.Callbacks('once memory'), 'resolved'],
  ['reject', 'fail', jQuery.Callbacks('once memory'), 'rejected'],
  ['notify', 'progress', jQuery.Callbacks('memory')]
];
```

tuples 定义了 promise 相关调用的 api ，调用 then 时就会遍历这些 api ，看哪些被用户定义使用；

{% asset_img jquery-deferred-ajax.png jquery-deferred-ajax %}

比如上图的 ajax 调用，会把 jqXHR 推入到 deferred.promise 函数中，在 ajax 请求完毕后，执行对应的 resolve 方法。最后通知到 newDefer 执行对应 callback 。

## promise-polyfill

相对于 bluebird ，promise-polyfill 是一个轻量级的“腻子”，[点击直接查看源码](https://github.com/taylorhakes/promise-polyfill/blob/master/src/index.js)

借它，看下正儿八经的 promise 如何实现：

1. 首先初始化

在 new Promise 时调用创建

```js
function Promise(fn) {
  if (!(this instanceof Promise)) throw new TypeError('Promises must be constructed via new');
  if (typeof fn !== 'function') throw new TypeError('not a function');
  /** @type {!number} */
  this._state = 0;
  /** @type {!boolean} */
  this._handled = false;
  /** @type {Promise|undefined} */
  this._value = undefined;
  /** @type {!Array<!Function>} */
  this._deferreds = [];

  doResolve(fn, this);
}
```

2. 构建一个高阶函数，并执行

```js
function doResolve(fn, self) {
  var done = false;
  try {
    fn(
      function(value) {
        if (done) return;
        done = true;
        resolve(self, value);
      },
      function(reason) {
        if (done) return;
        done = true;
        reject(self, reason);
      }
    );
  } catch (ex) {
    if (done) return;
    done = true;
    reject(self, ex);
  }
}
```

fn 即是新建 Promise 传入的函数，并且参数列表 resolve、reject 是对应传入的两个函数。

```js
new Promise((resolve, reject) => {
  fooTimer(function() {
    resolve('ok');
  }, 1000);
});
```

当 fn 执行完异步方法后，就触发：resolve('ok')

3. 执行 resolve function

```js
function(value) {
  if (done) return;
    done = true;
    resolve(self, value);
}
```

注意：这里的 newValue 即是 resolve 实际的参数。会根据 newValue 类型来做后续的判断（promise 链式调用等）

这里 newValue 是 resolve('ok') 中的 ok

```js
function resolve(self, newValue) {
  try {
    // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
    if (newValue === self) throw new TypeError('A promise cannot be resolved with itself.');
    if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
      var then = newValue.then;
      if (newValue instanceof Promise) {
        self._state = 3;
        self._value = newValue;
        finale(self);
        return;
      } else if (typeof then === 'function') {
        doResolve(bind(then, newValue), self);
        return;
      }
    }
    self._state = 1;
    self._value = newValue;
    finale(self);
  } catch (e) {
    reject(self, e);
  }
}
```

设置 Promise.\_state = 1，执行 finale

4. 对 Promise 流程做最后的控制

```js
function finale(self) {
  if (self._state === 2 && self._deferreds.length === 0) {
    Promise._immediateFn(function() {
      if (!self._handled) {
        Promise._unhandledRejectionFn(self._value);
      }
    });
  }

  for (var i = 0, len = self._deferreds.length; i < len; i++) {
    handle(self, self._deferreds[i]);
  }
  self._deferreds = null;
}
```

当然由于 Promise.\_state == 1,Promise.\_deferreds.length == 0 ,所以什么都不会发生，只是运行了异步函数。

5. then 的触发

一开始，用户会调用 then ，接受成功和失败两个方法，再次初始化 Promise ，作用就是构造一个空的 Promise chain；

并执行 handle ，对 Promise.deferreds 放入 new Handler ，注意这里的 this ，其实是一开始的 new Promise 的引用。

```js
Promise.prototype.then = function(onFulfilled, onRejected) {
  // @ts-ignore
  var prom = new this.constructor(noop);

  handle(this, new Handler(onFulfilled, onRejected, prom));
  return prom;
};
```

handle 会拿 deferred 的成功和失败做 callback 函数，并最后执行。

```js
function handle(self, deferred) {
  while (self._state === 3) {
    self = self._value;
  }
  if (self._state === 0) {
    self._deferreds.push(deferred);
    return;
  }
  self._handled = true;
  Promise._immediateFn(function() {
    var cb = self._state === 1 ? deferred.onFulfilled : deferred.onRejected;
    if (cb === null) {
      (self._state === 1 ? resolve : reject)(deferred.promise, self._value);
      return;
    }
    var ret;
    try {
      ret = cb(self._value);
    } catch (e) {
      reject(deferred.promise, e);
      return;
    }
    resolve(deferred.promise, ret);
  });
}
```

当然只是分析最简单的 Promise 方式，关于 Promise chain 就根据 self.\_deferreds 和 resolve 中 newValue 类型判断对 Promise.\_state 做不同的标记来区分

## 参考

> 我只是知识点的“加工者”， 更多内容请查阅原文链接 :thought_balloon: ， 同时感谢原作者的付出：

- [Promises MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Using_promises)
- [Promise 对象 阮一峰](http://es6.ruanyifeng.com/#docs/promise)
