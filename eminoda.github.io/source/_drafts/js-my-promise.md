---
title: 写一个我自己的 promise
tags: js
categories:

    - 开发
    - js

thumb_img: javascript.jpg
---

# MyPromise

## 先了解下 Promise

## MyPromise 简单实现

```js
function MyPromise(fn) {
    this.uid = new Date().getTime();
    this.resolveFn = function(data) {
        return function(callback) {
            callback(data);
        }
    }
    this.then = function(callback) {
        fn(this.resolveFn(data)(callback), this.rejectFn)
    }
}
```

## 别人怎么做的

## 附录

## 参考

> 我只是知识点的“加工者”， 更多内容请查阅原文链接 :thought_balloon: ， 同时感谢原作者的付出： 

- [Window​.performance MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/performance)
- [Performance MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/Performance)
- [前端性能监控： window.performance 掘金](https://juejin.im/entry/58ba9cb5128fe100643da2cc)

