---
title: js 里不平凡的函数
tags: js
categories:
  - 前端
  - js
thumb_img: javascript.jpg
date: 2018-12-27 17:48:43
---


函数 function 作为 js 里的一等公民，这样一句话做前端的总多多少少听说过。其实更为准确应该描述为 **First-class functions**。

对于 first-class function 可以翻译成 **头等函数**、一等函数。

即使 js 没有像 java 一样有类的概念，但通过 function 各种风骚的操作，让我们在 **面向函数编程** 中更欢乐的使用 js。

## 语言支持

对于 **函数模型** 实现并不是所有程序语言都支持，或者放在头等重要的位置。就比如 **高阶函数**， java 直到 jdk8 有了 lambda 才能使用起来。如下贴个语言支持表：

{% asset_img function-limit.png 语言支持 %}

## 高阶函数

要成为高阶函数，要具备如下 2 个条件之一：

-   能让函数作为参数作为输入
-   输出一个函数

```js
function sum(a, b) {
	var s = a + b;
	return s;
}
function mySum(sum, c) {
	return sum(1, 2) + c;
}
mySum(sum, 3); //6
```

## 偏函数 Partial Application

> In computer science, partial application (or partial function application) refers to the process of fixing a number of arguments to a function, producing another function of smaller arity. Given a function **f:(X \* Y \* Z)-> N**, we might fix (or 'bind') the first argument, producing a function of type **partial(f):(Y \* Z)->N**.

简单理解就是写个 **偏函数** ，效果是实现某功能需要的参数发生了变化，参数变成更小/少的元（arity）

```js
function sum(a, b) {
	return a + b;
}
sum(1, 2); //3
function pSum(c) {
	return sum.bind(null, 1, c)(); //1+2
}
pSum(2); //3
```

## 柯里函数 Currying

> 在计算机科学中，柯里化（英语：Currying），又译为卡瑞化或加里化，是把接受多个参数的函数变换成接受一个单一参数（最初函数的第一个参数）的函数，并且返回接受余下的参数而且返回结果的新函数的技术。

```js
function currySum(a) {
	return function(b) {
		return function(c) {
			return a + b + c;
		};
	};
}
currySum(1)(2)(3); //6
```

## 总结

糊里糊涂说了几个概念，其实对于 **面向函数编程** 的 js 来说，了解这些会提升编程体验，和知道设计模式是一个道理。除了装 X，更多的可是使我们能容易理解优秀框架的代码，从而落实到工作中。

## 参考

-   [mdn-First-class_Function](https://developer.mozilla.org/en-US/docs/Glossary/First-class_Function)
-   [wiki-头等函数](https://zh.wikipedia.org/wiki/%E5%A4%B4%E7%AD%89%E5%87%BD%E6%95%B0)
-   [wiki-高阶函数](https://zh.wikipedia.org/wiki/%E9%AB%98%E9%98%B6%E5%87%BD%E6%95%B0)
-   [wiki-partial application](https://en.wikipedia.org/wiki/Partial_application)
-   [currying-vs-partial-application](https://www.datchley.name/currying-vs-partial-application/)
-   [mqyqingfeng-
    JavaScript 专题之函数柯里化](https://github.com/mqyqingfeng/Blog/issues/42)
-   [知乎-面向对象程序设计比传统的面向过程程序设计更有什么好处？](https://www.zhihu.com/question/19729316)
