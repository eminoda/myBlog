---
title: js 基础：对象属性 property 相关 api 示例
tags: js
categories:
  - 开发
  - 前端开发
thumb_img: javascript.jpg
date: 2019-12-12 11:17:17
---

# 前言

面向对象语言有个基本的特征，就是有 **类** 这样一个概念。我们也通过各种渠道知道 ECMAScript 中是没有类这个概念的，因起 js 里的对象和面向对象语言中的对象有所不同。

> 官方把对象定义为：“无序属性的集合，其属性可以包括基本值、对象或者函数”

本篇以对象中无序属性的集合 property 为核心，说下与其相关的一些 api 。

# 属性类型

如下是，我们最常用的对象定义方式： **对象字面量**

```js
var user = {
  name: "eminoda",
  age: 29
};
```

表面上看我们只能看到显式的属性定义，其实 js 内部对对象的属性有 **特定值** 来说明其属性的行为特征，分别有两种不同的方式：**数据属性** 和 **访问器属性**。

对于用于对象属性特性进行 **描述的属性**，我们无法显式调用，这些特性都是由 js 引擎来使用的。当然我们可以调用 **Object.defineProerty()** 来修改。

# 数据属性

数据属性包含以下 4 个 描述特征：

- configurable: boolean 类型，表示是否可以删除属性、修改属性特性
- enumerable: boolean 类型，表示是否可以通过 for-in 遍历对象属性
- writable: boolean 类型，表示是否可以修改属性值
- value: any 类型，属性值

下面通过一些例子，来加深对这些属性的理解：

## configurable

当 configurable 为 false 后，属性 name 无法 delete 删除：

```js
// configurable
Object.defineProperty(user, "name", {
  configurable: false, // 注意：无法删除属性、修改属性特性
  enumerable: true,
  writable: true,
  value: "eminoda"
});

delete user.name;
log("configurable", user.name); //eminoda
```

修改非 writable、value 的其他特征就会报错：**Cannot redefine property: name**

```js
Object.defineProperty(user, "name", {
  configurable: false, // Cannot redefine property: name
  enumerable: true, // Cannot redefine property: name
  writable: false,
  value: "eminoda2"
});
log("configurable", user.name); //eminoda2
```

## writable

当 writable 为 false 后，属性 nickName 无法再次通过赋值来修改属性值：

```js
// writable
Object.defineProperty(user, "nickName", {
  writable: false,
  value: "sxh"
});

user.nickName = "sxh2";
log("writable", user.nickName); //sxh
```

## enumerable

当 enumerable 为 false 后，无法通过 for-in 遍历其对象上属性：

```js
// enumerable
Object.defineProperty(user, "salary", {
  enumerable: false,
  value: 10000
});
log("enumerable", user.salary); //10000
for (let item in user) {
  log(item); //name age
}
```

本以为 enumerable 使用场景很小，但是在 vue 数据响应处理时，就对 \_\_ob\_\_ 做了这样的限制：

```js
Object.defineProperty(obj, key, {
  value: val,
  enumerable: !!enumerable, //默认 false
  writable: true,
  configurable: true
});
```

## 注意

当我们使用例如对象字面量方式来创建对象时， configurable 、enumerable 、writable 都默认为 **true** ，value 为我们定义的值，没有则为 undefined。

如果我们通过 Object.defineProperty 等 api 来定义对象属性，但没有写全这些特征属性的话，默认为 **false** 。

**最佳实践**：建议不要偷懒写全所有的特征描述，除非你知道这些默认值的作用。

# 访问器属性

访问器属性中的访问器即使有 getter/setter 函数，就像 java 里对象中的 getter/setter。

访问器属性包含以下 4 个 描述特征：

- configurable: boolean 类型，表示是否可以删除属性、修改属性特性
- enumerable: boolean 类型，表示是否可以通过 for-in 遍历对象属性
- get: function 类型，属性调用时触发
- set: function 类型，属性赋值时触发

相对数据属性的描述特性，我们重点只需要放在 getter/setter 函数。

下面是个简单用法：

```js
Object.defineProperty(user, "hobby", {
  configurable: true,
  enumerable: true,
  get() {
    return this._hobby;
  },
  set(val) {
    this._hobby = `${this.name} hobby is ${val}`;
  }
});

user.hobby = "持续前端技术分享";
log(user.hobby); //eminoda2 hobby is 持续前端技术分享
```

vue 的数据响应核心就是用过类似这样的方法，只是它在 getter/setter 做了更多的“工作”。

# 更多 API

除了上面用到的 Object.defineProperty 方法外，还有几个常用的 api

## 多属性定义

利用 **Object.defineProperties** 来一次性的对多个对象属性进行特性描述：

```js
Object.defineProperties(user, {
  skill: {
    configurable: true,
    enumerable: true,
    writable: true,
    value: "javascript"
  },
  address: {
    configurable: false,
    enumerable: true,
    writable: false,
    value: "shanghai"
  }
});

console.log(user);
/*
 { name: 'eminoda2',
  age: 29,
  _hobby: 'eminoda2 hobby is 持续前端技术分享',
  skill: 'javascript',
  address: 'shanghai' }
 */
```

## 特性描述读取

在严格模式下，如果我们不知道别人对某对象是如何进行特征定义的话，可能会出现非预期的错误，为避免这样的情况发生，我们可以通过 **Object.getOwnPropertyDescriptor** 获取对象属性的特性描述。

```js
const desc = Object.getOwnPropertyDescriptor(user, "name");
log(desc);
/**
{ value: 'eminoda2',
  writable: false,
  enumerable: true,
  configurable: false }
  */
```

# 对象“限制”

我们知道通过属性特征的 configurable、writable 来使得对象更趋于“稳定”，但调用 Object.defineProperty 方法好像有些麻烦。从 es5 开始，提供了几个 api 方式来帮助我们 **防止对象非预期的篡改情况发生** 。

现实我们也经常在框架看到这些 api 的出现，但要知道本质都是使用 **属性特征** 来做控制的。

## 不可扩展对象

特点：不可扩展（不可添加新属性，添加无效为 undefined）

```js
Object.preventExtensions(obj);
```

下面来测试下，对象限制后的情况：

```js
// 测试工具方法
function _testObj(obj, type) {
  log(`[${type}] `, "扩展性: ", Object.isExtensible(obj), 
    "密封性: ", Object.isSealed(obj), 
    "冻结性: ", Object.isFrozen(obj));

  obj.name = "eminoda2";
  log(obj.name !== "eminoda" ? "属性可修改" : "属性不可修改");
  obj.name2 = "sxh";
  log(!obj.name2 ? "属性不可新增" : "属性可新增");
  delete obj.name;
  log(!obj.name ? "属性可删除" : "属性不可删除");
}
```

```js
let noExtensionUser = Object.preventExtensions({
  name: "eminoda"
});
_testObj(noExtensionUser, "preventExtensions");
// [preventExtensions]  扩展性:  false 密封性:  false 冻结性:  false
// 属性可修改
// 属性不可新增
// 属性可删除
```

## 密封对象

不可扩展、不可删除属性（configurable 为 false）

```js
Object.seal(obj);
```

```js
let sealUser = Object.seal({
  name: "eminoda"
});
_testObj(sealUser, "seal");
// [seal]  扩展性:  false 密封性:  true 冻结性:  false
// 属性可修改;
// 属性不可新增;
// 属性不可删除;
```

## 冻结对象

不可扩展、不可删除属性、并且不可更新属性值（writable 为 false）

```js
Object.freeze(obj);
```

```js
let forzenUser = Object.freeze({
  name: "eminoda"
});
_testObj(forzenUser, "freeze");
// [freeze]  扩展性:  false 密封性:  true 冻结性:  true
// 属性不可修改
// 属性不可新增
// 属性不可删除
```

# 总结

写这篇的目的是因为最近在看 **vue** 源码，发现在数据响应这块逻辑实现上运用了几处对象属性描述特征，即调用了：**Object.defineProperty** 方法。

我们平时业务代码使用的较少，多是框架帮我们做了这些“事情”。所以借这个机会来探究原生 js 涉及 **对象属性描述定义** 这块的知识点，同时也提到了几个 **对象属性限制** 方面的 api 。希望对此不太清楚的同学能打好基础。
