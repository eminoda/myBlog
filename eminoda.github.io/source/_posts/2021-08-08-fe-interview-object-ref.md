---
title: 'a.x = a = {n:2}，a.x 为什么是 undefined'
tags:
  - 前端面试
categories:
  - 开发
  - 前端开发
date: 2021-08-08 01:48:20
---


# 前言

如果你一看便知这道面试题的答案，恭喜你有着扎实的 JS 功底，可惜我半天都想不明白，则写下这篇记录：

```js
var a = { n: 1 };
var b = a;

a.x = a = { n: 2 };

console.log(a.x); //?
console.log(a); //?
console.log(b); //?
```

答案：

```js
console.log(a.x); // undefined
console.log(a); // { n: 2 }
console.log(b); // { n: 1, x: { n: 2 } }
```

# 为什么

先来看两段代码就当热身：

```js
var a = 1;
var b = a;

a = 2;
console.log(a, b); // 2, 1
```

```js
var a = { n: 1 };
var b = a;

a.n = 2;
console.log(a, b); // { n: 2 } { n: 2 }
```

结果似乎不用过脑子，因为日常的编码里已经操练过很多次了。但上面到面试题，却出乎意料的摸不清头绪，你是不是像我一样在面试中思考片秒后，给出这样的答案？

```js
var a = { n: 1 };
var b = a;

a.x = a = { n: 2 };

console.log(a.x); // {n:2} 错，应为 undefined
console.log(a); // {n:2} 虽对但理解错
console.log(b); // {n:1} 错，应为{ n: 1, x: { n: 2 } }
```

那我们就逐行分析其中的原由，首先是这两行的简单代码：

```js
var a = { n: 1 };
var b = a;
```

变量 a 在堆内存创建了一个对象 { n: 1 }，并指向它。同时变量 b 的引用也指向了 a 创建的那个对象。此时他们的值都为 { n: 1 }。

{% asset_img ref1.png a，b对象的引用 %}

最磨人的这行代码来了：

```js
a.x = a = { n: 2 };
```

首先根据 js 编译器解析代码原则，会先在作用域中依次寻找 a 和 a.x 是否已经声明过。如果没有则会创建对应的变量。（见：你不知道的 Javascript 上卷[p7]）

因为 a 我们已经创建过了，但 a.x 没有，则会在那个创建对象内部声明 x（其值 undefined）

{% asset_img ref2.png a.x为undefined %}

**注意一点：此时 a 引用是最开始在堆内存里创建的对象**（这理解很重要，会影响能否读懂这题）

当代码被 js 引擎执行起来后，会从右往左依次进行赋值运算，即代码的优先级会变成这样：

```text
a.x = (a = { n: 2 });
```

第一次 a = { n: 2 } 进行赋值：

变量 a 重新在堆内存申请了一个对象地址，其值为 { n: 2 }：

{% asset_img ref3.png a的新指向 %}

第二次赋值 a.x = a：

的确 a.x 的值是为 {n: 2}，但不同的是：这里的 a.x 的 a 是老对象引用（引用并没有被释放掉），a.x 指向了 a 的新地址 {n: 2}：

{% asset_img ref4.png 区分a引用 %}

所以：

```js
console.log(a.x); // undefined
console.log(a); // { n: 2 }
console.log(b); // { n: 1, x: { n: 2 } }
```

a.x 为 undefined：因为 a 新的引用地址（{n: 2}）的对象中没有 x 属性。

a 为 { n: 2 }：因为 a 为新的引用地址。

b 为 { n: 1, x: { n: 2 } }：因为 b 还是指向 a 的旧引用地址，但 a.x 指向了 a 的新引用地址。

# 最后

似乎豁然开朗，没明白就多看几遍吧。虽然日常不可能写这样会引起 bug 的代码，但的确能测试回答这问题人的水平，反正我面试是挂了，水平像个刚入门的新生一样。

（本篇在循环播放 **米津玄师的 Loser** 中完成）

# 参考

- [js 连续赋值及 js 引用类型指针(赋值从右往左)](https://zhuanlan.zhihu.com/p/102085119)
