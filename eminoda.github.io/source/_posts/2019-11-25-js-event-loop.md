---
title: 从事件轮询 Event Loop，看 microTask、macroTask
tags: js
categories:
  - 开发
  - 前端开发
thumb_img: javascript.jpg
date: 2019-11-25 16:52:32
---


# 前言

我们都知道执行 javascript 的引擎是单线程的，那么 js 中是按什么顺序处理不同的“异步”事件呢？

这篇就从一个面试题开始，讲述事件轮循 Event Loop ，以及 microTask、macroTask 的相关概念。

# 一个经典的面试题

```js
var data = 1;

log(data);

setTimeout(function() {
  data = 6;
  log(data);
}, 2000);

setTimeout(function() {
  data = 5;
  log(data);
}, 1000);

Promise.resolve()
  .then(function() {
    data = 3;
    log(data);
  })
  .then(function() {
    data = 4;
    log(data);
  });

data = 2;
log(data);

function log(data) {
  console.log(data);
}
```

输出顺序为：1,2,3,4,5,6

# 事件轮询 Event Loop

在解释 Event Loop 前，我们先了解下 js 的执行栈。

## 执行栈 Call Stack

我们知道程序中的函数定义，参数都会被放到一个执行栈 stack 中。如下就是个很普通的一段程序：

```js
const bar = () => console.log("bar");

const baz = () => console.log("baz");

const foo = () => {
  console.log("foo");
  bar();
  baz();
};

foo();
```

最后会按顺序输出：

```js
foo;
bar;
baz;
```

栈图如下：

{% asset_img callstack.png 摘自：flaviocopes %}

整个程序，按照**先进后出的队列**（LIFO queue）进行栈的操作。foo 优先被调用塞进栈内，随后对内部的 bar 进行入栈，执行后再出栈，baz 类似 ，内部方法全部执行结束后 foo 出栈，清空该栈。

整个顺序和我们预期的一样，那如果涉及 setTimout 的话，整个过程会怎么样呢？

```js
const bar = () => console.log("bar");

const baz = () => console.log("baz");

const foo = () => {
  console.log("foo");
  // 只是将 bar 定义在 setTimout 中
  setTimeout(bar, 0);
  baz();
};

foo();
```

栈图如下：

{% asset_img callstack-event.png 摘自：flaviocopes %}

注意上图中 setTimout 的那部分，虽然在 foo 进栈后，setTimout 紧接着进栈，但随后并没有 pending 住等待它的执行结束。就像它只是进来注册下，然后马上 baz 跟了进来。当 baz 和最外层的 foo 执行结束后，setTimout 中的 bar 才出现在栈中，开始 bar 的执行操作。

那 setTimout 注册后，被藏到哪里去了？内部的方法又是怎么被再次出现？

这个就涉及 js 的 Event Loop 机制。

## Event Loop

javascript 运行时，会同步方式挨个在执行栈中执行我们代码，就像上例中没有 setTimout 的例子。

同时还有一个分支，叫做消息队列。当执行栈内没有代码执行后，会遍历该消息队列，把达到要求的方法放到执行栈来执行，并不停轮询。

```js
while (queue.waitForMessage()) {
  queue.processNextMessage();
}
```

类似上述通过 while 来轮询的代码，以达到事件循环的机制就称为事件轮循 Event Loop。

也就解释了上例中，setTimeout 第一次进来后，它被放到了哪里（消息队列中）。当执行栈没有执行的代码后，循环该消息队列，取出了 setTimeout 中的 bar 方法放到执行栈中运行。

# microTask 和 macroTask

回到最初的面试题，到此你应该大致明白了“普通” js 和 setTimout 的执行顺序问题。

那什么是 microTask 和 macroTask 呢？

该消息队列又对其中的消息类型进行了分类，微任务和宏任务。

macroTask

- setTimeout
- setInterval
- setImmediate
- I/O
- UI render
- http

microTask

- process.nextTick
- promise
- Object.observe
- MutationObserver

microTask 还是属于当前 js 线程的，不同于 macroTask 像 setTimeout 会单独启用一个 Timer 线程来执行当前任务，它会涉及多个线程互相通讯的问题。

另外 microTask 只是会比“普通”的 js 执行延后而已，但优先于 macroTask。

# 参考

> 我只是知识点的“加工者”， 更多内容请查阅原文链接 :thought_balloon: ， 同时感谢原作者的付出：

- [javascript-event-loop](https://flaviocopes.com/javascript-event-loop/)
- [从浏览器多进程到 JS 单线程，JS 运行机制最全面的一次梳理](https://segmentfault.com/a/1190000012925872)
