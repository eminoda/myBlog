---
title: js-base-skill
tags: js
categories:
  - 开发
  - 前端开发
thumb_img: javascript.jpg
---

啃 vue 代码时，随手记录一些 js 基础（工具）方法，也算补习基础知识

## 判断对象中属性的存在

```js
const hasOwnProperty = Object.prototype.hasOwnProperty;
function hasOwn(obj, key) {
  return hasOwnProperty.call(obj, key);
}
hasOwn([1, 2, 3], 3); //true
hasOwn({ test: 1 }, 'test'); //true
```

## 判断类型

首先明确下 js 的几种数据类型：

- 基本类型：String,Number,Boolean,Null,Undefined,Symbol
- 引用类型：Object,Array,Function

### typeof

> 返回一个字符串，表示未经计算的操作数的类型。

```js
typeof 'abc'; //"string"
typeof 123; //"number"

var testFn = function() {};
typeof testFn; //"function"

typeof [1, 2, 3]; //"object"

var testObj = {};
typeof testObj; //"object"

var testRE = /\d+/;
typeof testRE; //"object"

typeof null; //"object"

typeof abc; //"undefined"
```

### instanceof

> 用于测试构造函数的 prototype 属性是否出现在对象的原型链中的任何位置

```js
[] instanceof Array //true
[] instanceof Object //true
Array instanceof Object //true

123 instanceof Number //false
'abc' instanceof String //false
new String('abc') instanceof String //true
```

### toString

> 返回一个表示该对象的字符串

```js
const _toString = Object.prototype.toString;
// 判断对象
function isPlainObject(obj) {
  return _toString.call(obj) === '[object Object]';
}
// 判断正则
function isRegExp(v: any): boolean {
  return _toString.call(v) === '[object RegExp]';
}
// 判断数组
if (!Array.isArray) {
  Array.isArray = function(arg) {
    return _toString.call(arg) === '[object Array]';
  };
}
_toString('abc'); //'[object Object]'
_toString(123); //'[object Object]'
```

以上分别用 typeof, instanceof, toString() 做了示例，那具体有什么不同呢？

- typeof 对 **引用类型** 不能很好的区分，但能区分 **基础类型**
- toString 能对 **引用类型** 有个很好的辨认，但不能分辨 **基础类型**
- instanceof 用于判断对象的 **原型链关系**，不适合做类型区分

## 快速从数组中移除已有元素

```js
// vue util.js
function remove(arr = [], item) {
  if (arr.length) {
    const index = arr.indexOf(item);
    if (index > -1) {
      return arr.splice(index, 1);
    }
  }
}
```

中间利用了 indexOf 从数组找出目标元素的索引值，然后利用 splice 删除元素，并且返回修改后的数组。
