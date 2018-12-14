<!-- vue 学习--js相关基础 -->

因为是 Vue 框架源码，会涉及大量平时业务代码没有使用过的 js 相关 api、或一些 **最佳实践** 的方法。

这里做记录并写 [demo 实践](https://github.com/eminoda/myBlog/tree/master/read_note/vue_learn/demo)

# dom

## [document.querySelector(el)](https://developer.mozilla.org/zh-CN/docs/Web/API/Document/querySelector)

根据 css 选择器，获取匹配的 html 元素（Element）

> Element 是非常通用的基类，所有 Document 对象下的对象都继承它. 这个接口描述了所有相同种类的元素所普遍具有的方法和属性

[ELEMENT](https://developer.mozilla.org/zh-CN/docs/Web/API/Element) = document.querySelector('#app');

## [element.outerHTML](https://developer.mozilla.org/zh-CN/docs/Web/API/Element/outerHTML)

返回当前 ELEMENT 元素节点及其子元素的 html 片段；也可以重设节点元素。

```
var htmlStr = el.outerHTML;
```

htmlStr

```
<div id="app">
    {{ message }}
</div>
```

# js

一些常用工具方法；简单技巧

## remove-splice

移除数组元素，参考：

[https://github.com/eminoda/myBlog/issues/9-splice](https://github.com/eminoda/myBlog/issues/9)

## hasOwn-hasOwnProperty

判断对象属性是否存在，参考：

[https://github.com/eminoda/myBlog/issues/4-hasOwnProperty(key)](https://github.com/eminoda/myBlog/issues/4)

## cached

缓存方法执行结果

```js
function cached(fn) {
  console.log("create cache space");
  var cache = Object.create(null);
  return function cachedFn(str) {
    var hit = cache[str];
    console.log(`cache=${JSON.stringify(cache)}`);
    console.log("hit?" + hit);
    return hit || (cache[str] = fn(str));
  };
}
var fn = function(str) {
  console.log(`fn called::str=${str}`);
  return str.toUpperCase();
};
var cacheFn = cached(fn); // create cache space
// cache={}
// hit?undefined
// fn called::str=123
cacheFn("123");
// cache={"123":"123"}
// hit?123
cacheFn("123");
```

## camelizeRE

处理 app-List 转驼峰的替换

```js
var camelizeRE = /-(\w)/g;
var camelize = function(str) {
  return str.replace(camelizeRE, function(_, c) {
    return c ? c.toUpperCase() : "";
  });
};

var str = "app-list";
var str2 = "app-List";
var str3 = "app-List_item";

// 全局模式要注意的点
console.log(camelizeRE.test(str)); //true
console.log(camelizeRE.lastIndex); //5
camelizeRE.lastIndex = 0;
console.log(camelizeRE.test(str2)); //false
camelizeRE.lastIndex = 0;
console.log(camelizeRE.test(str3)); //true

console.log(camelize(str)); //appList
console.log(camelize(str2)); //appList
console.log(camelize(str3)); //appList_item
```

关于正则，参考：[https://github.com/eminoda/myBlog/issues/10--实例属性](https://github.com/eminoda/myBlog/issues/10)

## Object.defineProperty

定义对象属性，参考: [https://github.com/eminoda/myBlog/issues/2--访问器属性](https://github.com/eminoda/myBlog/issues/2)

```js
var opts = {};
Object.defineProperty(opts, "passive", {
  get: function get() {
    supportsPassive = true;
  }
});
```
