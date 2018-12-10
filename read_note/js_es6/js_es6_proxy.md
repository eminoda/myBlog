---
es6--proxy
---

# [proxy](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy)

[参考：http://es6.ruanyifeng.com/#docs/proxy](http://es6.ruanyifeng.com/#docs/proxy)

> Proxy 用于定义基本操作的自定义行为（如属性查找，赋值，枚举，函数调用等），代理模式。可能你需要区分 装饰器模式。

## 语法

- target 代理源对象
- handler 具体代理的行为模式

```js
let proxy = new Proxy(target, handler);
```

示例：

```js
var handler = {
  get: function(target, name) {
    console.log("get called");
    return target[name] || "not defined";
  }
};
var target = { name: "aaaa" };
var proxy = new Proxy(target, handler);

console.log(proxy.name); //aaaa
console.log(proxy.age); //not defined
```

API：取消代理

```js
var proxy2 = Proxy.revocable(target, handler);
console.log(proxy2.age); //undefined
```

## proxy 支持代理的属性方法

贴出常见，其他由于兼容性，并不是全环境有效

```js
var handler = {
  get: function(target, name) {
    return target[name] || "not defined";
  },
  set: function(target, name, value) {
    target[name] = `proxy:${value}`;
  },
  has: function(target, name) {
    return name in target;
  },
  deleteProperty: function(target, name) {
    return !(name in target) ? false : delete target[name];
  }
};
var target = {
  name: "aaaa",
  nick: "abc"
};
var proxy = new Proxy(target, handler);
// get
console.log(`get:name:` + proxy.name); //aaaa
console.log(`get:age:` + proxy.age); //not defined
// set
proxy.age = 10;
console.log(`set:age:` + proxy.age); //proxy:10
// has
console.log("has:testHas:");
console.log("testHas" in proxy); // false
console.log("has:age:");
console.log("name" in proxy); // true
// deleteProperty
console.log("deleteProperty:age:" + delete proxy.age); //true
console.log("deleteProperty:age:" + delete proxy.age2); //false
```
