---
title: vue框架学习--基础js知识点
secret: false
tags: 
  - vue
categories:
  - 前端
  - vue
no_sketch: true
---

# 前言，目标：
- 加强js知识点巩固
- 学习js技巧
- 帮助更好的学习vue思想

# 关于对象Object
## [创建不可修改对象](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze)
````
var emptyObject = Object.freeze({});
````
Object.freeze() 方法可以冻结一个对象，冻结指的是不能向这个对象添加新的属性，不能修改其已有属性的值，不能删除已有属性，以及不能修改该对象已有属性的可枚举性、可配置性、可写性。也就是说，这个对象永远是不可变的。该方法返回被冻结的对象。
````
const object1 = {
  property1: 42
};

const object2 = Object.freeze(object1);

object2.property1 = 33;
// Throws an error in strict mode

console.log(object2.property1);
// expected output: 42
````

## [创建一个原型为null的空对象](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/create)
````
var map = Object.create(null);
````
和用{}创建一个字面量对象有什么不同？
````
o = {};
// 以字面量方式创建的空对象就相当于:
o = Object.create(Object.prototype);
````
创建了一个**空**对象，没有原型链，没有继承Object的一些原型方法，例如toString()等。你也可以复写一些有争议的Object方法，不用担心影响到。
[可以看看这篇](https://juejin.im/post/5acd8ced6fb9a028d444ee4e)

## [修改对象特征](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)
````
// 会直接在一个对象上定义一个新属性，或者修改一个对象的现有属性， 并返回这个对象。
Object.defineProperty(obj, prop, descriptor)
````
descriptor：属性描述符。分为：
- 数据描述符：是一个具有值的属性，该值可能是可写的，也可能不是可写的。
    - configurable(false)：表示对象的属性是否可以被删除，**以及除writable特性外的其他特性**是否可以被修改。
    - enumerable(false)
    - value(undefined)
    - writable(false)
- 存取描述符：是由getter-setter函数对描述的属性。
    - get(false)
    - set(false)
    - configurable(false)
    - enumerable(false)

**描述符必须是这两种形式之一；不能同时是两者。**

数据和存取特征属性的一些例子：
````js
var o = {}; // 创建一个新对象

// 在对象中添加一个属性与数据描述符的示例
Object.defineProperty(o, "a", {
    value: 37,
    writable: true,
    enumerable: true,
    configurable: false
});
o.a = 1;
console.log(o.a); //1，if writable false,修改无效 还为37
// Uncaught TypeError: Cannot redefine property: a
// if configurable false,无法再修改属性
// Object.defineProperty(o, "a", {
//     configurable: true
// });
var bValue;
Object.defineProperty(o, "b", {
    get: function () {
        console.log('get');
        return bValue;
    },
    set: function (newValue) {
        console.log('set');
        bValue = newValue;
    },
    enumerable: true,
    configurable: true
});

o.b = 123;
// set
console.log(o.b);
// get
````

考虑特性被赋予的默认特性值非常重要
````
var o = {};
o.a = 1;
// 等同于 :
Object.defineProperty(o, "a", {
  value : 1,
  writable : true,
  configurable : true,
  enumerable : true
});

// 另一方面，
Object.defineProperty(o, "a", { value : 1 });
// 等同于 :
Object.defineProperty(o, "a", {
  value : 1,
  writable : false,
  configurable : false,
  enumerable : false
});
````

**注意**
ie8，对此方法不友好。也是vue至少ie9起步的原因之一。


# 技巧方法
## 如何定义一个map
````js
function makeMap(
    str,
    expectsLowerCase
) {
    var map = Object.create(null);
    var list = str.split(',');
    for (var i = 0; i < list.length; i++) {
        // 每个key，复制true
        map[list[i]] = true;
    }
    // 返回一个closure
    return expectsLowerCase ?
        function (val) {
            return map[val.toLowerCase()];
        } :
        function (val) {
            return map[val];
        }
}
var isBuiltInTag = makeMap('slot,component', true);
````

## 定义一个Set
````js
_Set = (function () {
    function Set() {
        this.set = Object.create(null);
    }
    Set.prototype.has = function has(key) {
        return this.set[key] === true
    };
    Set.prototype.add = function add(key) {
        this.set[key] = true;
    };
    Set.prototype.clear = function clear() {
        this.set = Object.create(null);
    };

    return Set;
}());
````

## 方法缓存处理
如果testFn是一个非逻辑等操作，可存入缓存。缓存中首次创建新对象，key标记testFn参数，用于缓存命中。
````js
function cached(fn) {
    var cache = Object.create(null);
    console.log('obj created');
    return (function cachedFn(str) {
        console.log(cache);
        var hit = cache[str];
        console.log('hit:'+hit);
        return hit || (cache[str] = fn(str))
    })
}
var testFn = cached(function(data){
    console.log('receive data:'+data);
    return data;
});
testFn('foo1');
// obj created
// Object {}
// hit:undefined
// receive data:foo1
testFn('foo1');
// Object {foo1: "foo1"}
// hit:foo1
````

## 浏览器的识别
````js
var inBrowser = typeof window !== 'undefined';
var inWeex = typeof WXEnvironment !== 'undefined' && !!WXEnvironment.platform;
var weexPlatform = inWeex && WXEnvironment.platform.toLowerCase();
var UA = inBrowser && window.navigator.userAgent.toLowerCase();
var isIE = UA && /msie|trident/.test(UA);
var isIE9 = UA && UA.indexOf('msie 9.0') > 0;
var isEdge = UA && UA.indexOf('edge/') > 0;
var isAndroid = (UA && UA.indexOf('android') > 0) || (weexPlatform === 'android');
var isIOS = (UA && /iphone|ipad|ipod|ios/.test(UA)) || (weexPlatform === 'ios');
var isChrome = UA && /chrome\/\d+/.test(UA) && !isEdge;
````