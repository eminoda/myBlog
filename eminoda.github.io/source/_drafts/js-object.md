---
title: js 基础：对象
tags: js
categories:
  - 开发
  - 前端开发
thumb_img: javascript.jpg
---

# 前言

最近在做前端偏系统的复习，接触到很多平时业务涉及不到的东西（你可以理解是些偏语言本身的原理）

下面通过一些实际应用，来更好理解的讲下 js 中的“对象”及相关概念。

# 怎么自定义一个 new 操作符

## 什么是对象

首先我们知道 **javascript** 在对象概念上有别于其他面向对象语言，因为其中没有 **类** 这个概念。

但通俗的讲 **js** 中出现的任何定义可能都是对象，因为：

> 官方把对象定义为：“无序属性的集合，其属性可以包括基本值、对象或者函数”

像最简单方式创建的 **对象字面量** ，或者一个普通的 **function** 函数。

如下，使我们创建对象的一个简单方式：

```js
function User(name) {
  this.name = name;
  this.eat = function() {};
}
User.prototype.say = function() {};
```

{% asset_img new-1.png %}

User 对象的输出就是我们所定义的那样，只是 **function** 被缩写成 **f** 而已。

## 原型属性 prototype

另外，每个对象定义出来后（声明完构造函数后），就会自带一个**原型属性 prototype** ，并且指向 **原型对象 Prototype**：

```js
User.prototype;
```

{% asset_img new-2.png %}

我们在 **User.prototype** 定义的属性和方法最终都会挂到 **原型对象** 上。

## 原型对象

**原型对象** 中含有一个 **constructor** 构造函数引用，例如：User.prototype 的 **constructor** 指向 User 构造函数对象。

同时，内部还有个只读属性 **\_\_proto\_\_** ，指向该构造函数的原型对象 **Object** ：

{% asset_img new-3.png %}

## 对象实例

我们通过 new 操作符来创建 User 对象的实例：

```js
let user = new User("eminoda");
```

根据构造函数实例化创建的对象 user 将含有一个 **\_\_proto\_\_** 属性，该属性指向 **对象原型** 。
所以该 user 实例对象除了可以获取到 User 对象的属性外，也能获取到 **prototype** 上的属性，比如 say 方法。

{% asset_img new-4.png %}

## 实现

那 **怎么自定义一个 new 操作符** ？

```js
function MyNew(Ctor) {
  // 最简单方式声明一个 Object 对象
  let obj = {};
  // 重写原型对象引用
  if (Ctor.prototype) {
    obj.__proto__ = Ctor.prototype;
  }
  // 传参处理
  let args = Array.prototype.slice.call(arguments, 1);
  // 使用 apply 来过借 Ctor 的 this 引用到 obj 上
  Ctor.apply(obj, args);
  return obj;
}

let instance = MyNew(User, "eminoda");
```

# 对一个 JSON 序列化字符串的解析

我们除了可以通过 **JSON.parse** 快速实现，还可以通过 **Function** 函数。

## 认识 Function

首先看下 **Function** 的定义：

```txt
new Function ([arg1[, arg2[, ...argN]],] functionBody)
```

接收动态的参数列表，最后再加上一个函数表达式（字符串）

一个简单的相加 demo ：

```js
let sum = new Function("a", "b", `return a+b;`);
console.log(sum(1, 2)); //3
```

## 实现

```js
let json = { a: 1, b: 2, c: 3 };
let jsonstr = JSON.stringify(json);

console.log(new Function(`return ${jsonstr}`)());
```

当然这个只是借这个例子衬托下，引出 **Function** 的使用。

## 好处

你应该隐约发现了 Function 的好处之一：接收一个字符串，并且参数都是约定好的。

无法想象，如果让我们拿到一个字符串表达式怎么来运行它？

```js
// 难道用 eval 吗？众所周知，eval 的性能不太理想
console.log(eval(`(${jsonstr})`));
```

第二个就是 **作用域** 问题。 **Function** 内就是一个相对安全的闭包环境。

```js
let a = 1;

eval(`(a=2)`);
console.log("eval", a); //2

new Function(`a=3;`)();
console.log("Function", a); //2
```

甚至我们可以利用 **Function** 来运行一段简单的代码，测试浏览器是否被设置了 **CSP** ：

```js
// 摘自 vue
// detect possible CSP restriction
try {
  new Function("return 1");
} catch (e) {
  if (e.toString().match(/unsafe-eval|CSP/)) {
  }
}
```

# instanceof 的实现

## 基本用法

先看看定义：

> **instanceof** 运算符用于检测构造函数的 **prototype** 属性是否出现在某个实例对象的原型链

```js
function User() {}

function Animal() {}

let animal = new Animal();
let user = new User();

console.log(animal instanceof User); // false
console.log(animal instanceof Animal); // true
console.log(animal instanceof Object); // true
```

## 实现

我们已经在 “怎么自定义一个 new 操作符” 中知道了对象相关的基本原理。

那么我们只要将 **实例对象的内部原型引用 \_\_proto\_\_** 和 **构造函数的 prototype 原型属性引用** 判断是否一致就行了；

当判断不一致时，我们从 \_\_proto\_\_ 中，往上继续获取其的原型引用进行判断。

```js
function myInstanceof(target, origin) {
  let proto = target.__proto__;
  let prototype = origin.prototype;
  while (true) {
    if (proto === null) return false;
    if (proto === prototype) return true;
    proto = proto.__proto__;
  }
}

console.log(myInstanceof(animal, User)); // false
console.log(myInstanceof(animal, Animal)); // true
console.log(myInstanceof(animal, Object)); // true
```
