---
title: js 基础：类型转换
tags: js
categories:
  - 开发
  - 前端开发
thumb_img: javascript.jpg
---

# 前言

类型转换一直是 js 里的大坑，多少人从入门到放弃，即使多年经验的前端开发说不定也对此块概念细节避而远之。

看了《你不知道的 javascript》后，觉得收获颇多，这里和大家分享下。

# 类型转换

> 将值从一种类型转到另一种类型的过程。

分为显式，和隐式（强制类型转换 **coercion** ）

举个常见的例子：

```js
var a = 10;
var b = a + ""; //隐式
var c = String(a); //显式

console.log(typeof a, typeof b, typeof c); //number string string
```

当然如果你明白 **a + ""** 的意思，也可以理解为显式，每个人的区分方式不同，都是相对而言的。

无论哪种方式，最终都是通过类型转换返回 **基本类型值** 。

# 转化规则

## ToString 转字符串

常见几种类型，通过 **String()** 来显式转换值类型：

```js
String(null); // 'null'
String(undefined); // 'undefined'

String(true); // 'true'

String(123); // '123'
String(1000000000000000000000); // "1e+21"

String([1, 2, 3]); // "1,2,3"
String({ name: 123 }); //"[object Object]"
```

**JSON.stringify**：

**JSON.stringify** 内部会调用 **toString** 方法，所以效果和上述类似。

```js
JSON.stringify(null); // 'null'
JSON.stringify(true); // 'true'
JSON.stringify(123); // '123'
JSON.stringify("123"); // '"123"'
String(Symbol(1)); // "Symbol(1)"
```

不同的是，数组，以及不是 **JSON-safe** 的值会有不同（ **undefined、function、symbol** ）

```js
JSON.stringify([1, 2, 3]); //"[1,2,3]"
JSON.stringify(undefined); // undefined
JSON.stringify(function() {}); // undefined
JSON.stringify(Symbol(1)); // undefined
```

如果需要被 JSON 序列化的对象包含 **JSON-safe** 的值，将会被忽略（如果是数组，将会被替换为 **null** ）：

```js
JSON.stringify([undefined, 2, function() {}]); // "[null,2,null]"
```

## ToNumber

常见几种类型，通过 **Number()** 来显式转换值类型：

```js
Number(true); // 1
Number(false); // 0
Number(null); // 0
Number(undefined); // NaN
```

如果转换对象类型数据，将会调用其内部的 **valueOf** （优先） 、 **toString** 方法：

```js
var a = { name: 1 };
var b = {
  valueOf() {
    return "2";
  }
};
var c = {
  toString() {
    return "3";
  }
};

Number(a); //NaN
Number(b); //2
Number(c); //3
```

如果是数组，可以在数组对象上重写 toString 方法

```js
Number([1, 2]); //NaN

var d = [1, 2];
d.toString = function() {
  return this.join("");
};
Number(d); //12
```

## ToBoolean

常见几种类型，通过 **Boolean()** 来显式转换值类型：

```js
Boolean(undefined); //false
Boolean(null); //false
Boolean(false); //false
Boolean(0); //false
Boolean(""); //false
```

除了上述这些，其他值得转换都是真值 **true** 。

值得一提，使用假值来新建的布尔对象，其结果是 true ：

```js
var a = new Boolean(false); // Boolean {false}
var b = new Boolean(0); // Boolean {false}
var c = new Boolean(a && b); // Boolean {true}
```

可能想表达的意思不明显，你可以看下如下输出：

```js
if (a) {
  console.log("falsy object, 假值对象，因为是对象但我依旧是 true"); //output
}
```

# 显式转换

## 一般的字符串和数字转换

像上面提到的 ToNumber 和 ToString 规则，我们可以定义为显式转换。

```js
var a = 40;
var b = a.toString(); // '40' string; number 类型没有 toString 方法，js 引擎会封装一个对象，调用 toString 方法

var c = "30";
var d = +c; // 30 number;
```

（为基本类型）**封装对象**：基本类型没有 length 、 toString 诸如此类的方法， js 会为其包装一个封装对象。

## 日期 Date 转数字

```js
var date = new Date();
var dateTimestamp = +date; // 1579192486485
// 当然我们有更好的选择
console.log(date.getTime(), Date.now()); //1579192486485 1579192486485
```

## ~ 非运算符

~ 会将值强制转成 32 位数字（涉及位操作符涉及的操作都会被输出成 32 位的整数），然后取二进制数的反码。

等同于如下一个简单的表达式：

```js
-(x + 1);
```

只有当 x 为 -1 时，整个表达式的结果才为 -0 ，放在条件判断时，就是个**假值**。

所以我们通常可以用在 **indexOf** 这样的判断中：

```js
if (!-(foo.indexOf("a") + 1)) {
}
```

这样我们就不用了写类似 >=0 , !=-1 之类的判断了（抽象渗漏），虽然我们经常这样用。

说那么多，和 ~ 运算符有什么关系？

因为 ~ 也可以达到这样的效果，而且表现效果上更为“优雅”

```js
if (!~foo.indexOf("a"))) {
}
```

我们知道 -1 的二进制是 32 个的 1（十进制正数 1 转成二进制，取反则为前 31 个 1，最后位 0，再 +1 得到）

```js
// -1 的二进制
00000000 00000000 00000000 00000001 // 1 的二进制值
11111111 11111111 11111111 11111110 // 取反
11111111 11111111 11111111 11111111 // +1，得 -1 最终二进制值
```

所以 ~-1 的二进制就是 32 个 0，最后加个负数符号，即为 -0 。

