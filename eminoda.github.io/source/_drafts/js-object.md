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

## prototype  属性

另外，每个对象定义出来后（声明完构造函数后），就会自带一个**prototype  属性** ，并且指向 **原型对象 Prototype**：

```js
User.prototype;
```

{% asset_img new-2.png %}

我们在 **User.prototype** 定义的属性和方法最终都会挂到 **原型对象** 上。

## 原型对象

**原型对象** 中默认含有一个 **constructor** 构造函数引用，并且  **constructor**  指向构造函数对象（即： User ）。

同时，内部还有个只读属性 **\_\_proto\_\_** ，指向该构造函数的原型对象 **Object** ：

{% asset_img new-3.png %}

## 对象实例

我们通过 new 操作符来创建 User 对象的实例：

```js
let user = new User("eminoda");
```

根据构造函数实例化创建的对象 user 将含有一个 **\_\_proto\_\_** 属性，该属性也指向 **对象原型** 。
所以该 user 实例对象除了可以获取到 User 对象的属性外，也能获取到 **prototype** 上的属性，比如 say 方法。

{% asset_img new-4.png %}

## 实现

那 **怎么自定义一个 new 操作符** ？

我画了一个简图用来归纳上面的一些细节，同时也是下面代码实现的基础：

{% asset_img desc1.png %}

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

# 纠正 2 种错误的 this 理解

摘自《你不知道的 javascript 》，如下会贴出两种对 this 引用错误的理解，知道这些对于理解 js 中的对象引用会非常有好处。

## 指向自身

包括我在内，相信很多人接触 this 关键词时，会把它通过字面意思理解成：当前对象的引用，就像 this 这个英文单词的意思一样。但肯定是错误的。

```js
function foo() {
  this.count++; // this.count 是 foo 函数（对象）的属性
}
foo.count = 0; // 初始化
for (let i = 0; i < 5; i++) {
  foo();
}
console.log(foo.count); //0
```

如果你知道最后的 console 输出是 0 ，恭喜你！你没有这样错误的思维误区。

或许你平时都是这样写的，某种意义上根本没有遇到这样的误区：

```js
function foo() {
  data.count++;
}
let data = {
  count: 0
};
for (let i = 0; i < 5; i++) {
  foo();
}
console.log(data.count); // 5
```

利用 **词法作用域** 来规避了这个误区的发生。

当编译器解析代码时，会进行 LHS 查询，判断 data.count 是否在作用域中，如果没有，则将 data 存到作用域中，js 引擎执行到 foo 方法中的 data.count 会通过 RHS 方式在作用域中查找之前赋值的 data.count 值，再做相关操作。

我只希望在读的各位真正的能理解其中的原因，而不是某些写法规避了对 js 语言上本质的思考。

## 指向当前作用域

同样看个例子：

```js
function foo() {
  let a = 2;
  this.bar();
}
function bar() {
  console.log(this.a); //undefined
}
foo();
```

如果你简单认为 this.a 是谁来执行就是谁的作用域那也错了， a 的值并不是 2 。

## 怎么判断 this 引用

下面归纳下 this 中的 4 种绑定规则：

### 默认绑定

我们知道浏览器中的全局对象概念，如果像如下代码，最终就会取到全局对象：

```js
var a = "gobal";
function foo() {
  console.log(this.a); // gobal
}
foo();
```

这是作为一种备用绑定方式，也是我们平时经常 get 到的经验教训。

### 隐式绑定

```js
function foo() {
  console.log(this.a); // obj inner prop
}
let obj = {
  a: "obj inner prop",
  foo: foo
};
obj.foo();
```

注意，此例子不同于上面的“指向自身”那个示范。

当调用 **obj.foo()** 时，会找到 **obj** 对象上的 **foo** 属性，其值引用了 **function foo** 的方法，该函数确定了 **执行上下文** 关系。

所以 **this** 引用是指向 **obj** 对象的（而非全局对象）。

因为是隐藏的这么一个关系，我们平时一些不注意的操作就会“破坏”这样的绑定：

```js
// ...
let wrongRef = obj.foo;
var a = "gobal";
wrongRef(); // gobal
```

用 **wrongRef** 变量来保存 **obj.foo** 的引用，当调用 **wrongRef** 时，运行了 **function foo** 方法，其 this 指向了全局对象范围。

是不是又踩到坑了？丢失 this 引用关系是非常常见的。

### 显示绑定

在我们看 js 继承时肯定见过这样的实现：

```js
function foo() {
  console.log(this.a);
}
let obj = {
  a: "obj inner prop"
};

foo(); // undefined
foo.call(obj); // obj inner prop
```

一样作用的还有 **apply** ，这两个是 js 为我们提供转化执行上下文的工具方法，让在调用 **foo** 时，却把引用迁移到了 **obj** 上。

由于这样“强势”的绑定机制，在 ES5 中提供了 bind 方法，也让这种引用的绑定更好的理解。

```js
foo.bind(obj);
```

### new 绑定

我们之前已经通过 **实现一个 new 操作符** 理解过了 **new** 的内部原理。

虽然 **new** 不是其他面向对象语言中新创建一个 **Class** 类，但我们可以通过这样“对象创建”的方式来“控制” **this** 引用。

```js
function foo(a) {
  this.a = a;
}
var bar = new foo("obj prop");
console.log(bar.a);
```
