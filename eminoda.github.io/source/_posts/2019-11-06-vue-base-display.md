---
title: vue 基础-数据显示
tags: vue
categories:
  - 开发
  - 前端开发
thumb_img: vue.png
date: 2019-11-06 14:17:13
---


# 前言

《vue 基础》系列是再次回炉 vue 记的笔记，除了官网那部分知识点外，还会加入自己的一些理解。（里面会有部分和官网相同的文案，有经验的同学择感兴趣的阅读）

# 条件渲染

## v-if

**v-if** 指令用于条件性地渲染一块内容。这块内容只会在指令的表达式返回 truthy 值的时候被渲染。

与 v-if 对应的是 **v-else** ，显示相反的逻辑。

```html
<h1 v-if="awesome">Vue is awesome!</h1>
<h1 v-else>Oh no 😢</h1>
```

v-else 元素必须紧跟在带 v-if 或者 v-else-if 的元素的后面，否则它将不会被识别。

另外还可以设置 **v-else-if** 。

### 代码片段的显示

可以使用 template 来对代码片段做统一的显示隐藏，而不是另起一个 div 来做这样的逻辑，会徒增页面标签。

```html
<template>
    <div class="hello">
        <template v-if="isNum">
            <div>123</div>
            <div>456</div>
        </template>
        <template v-if="!isNum">
            <div>abc</div>
            <div>def</div>
        </template>
    </div>
</template>
```

### 用 key 管理可复用的元素

vue 会对模板做复用用于高效渲染，就像这样：

{% asset_img key.gif %}

由于模板复用，虽然两个不同的业务逻辑，但在切换中 input 的 value 却保留着。这明显不符合正常的需求。

但可以在 input 后面添加 key 属性，用于标注所属标签的唯一性：

```html
<input placeholder="Enter your username" key="username-input" />
```

这样每次渲染切换的时候，就会重新渲染模板内容。

{% asset_img key2.gif %}

## v-show

和 v-if 效果相同，但元素依旧会保留在 dom 中，只是通过 css 控制了显示隐藏。

同时，v-if 是惰性的，会根据逻辑条件来判断是否要渲染标签，而 v-show 是一直会渲染标签的。

# 列表渲染 v-for

## 用法

通过 v-for 指令，按照 items 数组长度重复渲染模板。

```html
<ul id="example-1">
    <li v-for="(item, index) in items">
        {{ item.message }}
    </li>
</ul>
```

把 in 替换成 of 也同样适用。建议适用 of ，这样会和 javascript 的逻辑保持一致。

除了可以取到 index 索引之外，还可以专门取键值对，只是遍历对象要 **换成对象**，而非数组:

```html
<div v-for="(value,name) in obj" :key="value">{{name}}-{{value}}</div>
```

## 数组更新检测

vue 对数组类型的属性进行的封装，如果调用相关 api 也会触发对应的更新机制。

涉及：push()，pop()，shift()，unshift()，splice()，sort()，reverse()

```js
// src\core\observer\array.js
methodsToPatch.forEach(function(method) {
    // cache original method
    const original = arrayProto[method];
    def(arrayMethods, method, function mutator(...args) {
        const result = original.apply(this, args);
        const ob = this.__ob__;
        let inserted;
        switch (method) {
            case "push":
            case "unshift":
                inserted = args;
                break;
            case "splice":
                inserted = args.slice(2);
                break;
        }
        if (inserted) ob.observeArray(inserted);
        // notify change
        ob.dep.notify();
        return result;
    });
});
```

相反 filter()， concat()， slice() 就需要手动赋值给 vm 数组变量。

## 对象变更检测注意事项

另外，由于 JavaScript 的限制，Vue 不能检测对象属性的添加或删除：

```js
var vm = new Vue({
    data: {
        a: 1
    }
});
// `vm.a` 现在是响应式的

vm.b = 2;
// `vm.b` 不是响应式的
```

可以通过 vm.\$set(vm.userProfile, 'age', 27) 来完成响应式属性难改的添加，或者触发。

## 显示过滤/排序后的结果

有时，我们想要显示一个数组经过过滤或排序后的版本，而不实际改变或重置原始数据。在这种情况下，可以创建一个计算属性，来返回过滤或排序后的数组。

```html
<li v-for="n in evenNumbers">{{ n }}</li>
```

```js
data: {
  numbers: [ 1, 2, 3, 4, 5 ]
},
computed: {
  evenNumbers: function () {
    return this.numbers.filter(function (number) {
      return number % 2 === 0
    })
  }
}

```

计算属性相对操作简单，也具备高性能。但在其不适合的场景下（嵌套 for 循环），可以定义 method 方法，来指定执行：

```html
<li v-for="n in even(numbers)">{{ n }}</li>
```

```html
data: { numbers: [ 1, 2, 3, 4, 5 ] }, methods: { even: function (numbers) { return numbers.filter(function (number) { return number % 2 === 0 }) } }
```

## 其他

和 v-if 一样，可以用在 template 标签上，用于渲染代码块。

但 v-for 不能和 v-if 一同使用，在构建时会给出错误警告，原因就是这两者都是对 dom 进行操作。

# 样式显示

## class

vue 可以对 class 属性进行绑定，来动态切换 class

```html
<div class="static" v-bind:class="{ active: isActive, 'text-danger': hasError }"></div>
```

或者一个复杂的对象：

```html
<div v-bind:class="classObject"></div>
```

```js
data: {
  classObject: {
    active: true,
    'text-danger': false
  }
}
```

数组语法：

```html
<div v-bind:class="[activeClass, errorClass]"></div>

<div v-bind:class="[isActive ? activeClass : '', errorClass]"></div>

<div v-bind:class="[{ active: isActive }, errorClass]"></div>
```

```js
data: {
    isActive：true,
    activeClass: 'active',
    errorClass: 'text-danger'
}
```

## style

和 class 一样，也可以设置内联样式

```html
<div v-bind:style="{ color: activeColor, fontSize: fontSize + 'px' }"></div>

<div v-bind:style="[baseStyles, overridingStyles]"></div>
```

另外也可以设置多种前缀

```html
<div :style="{ display: ['-webkit-box', '-ms-flexbox', 'flex'] }"></div>
```

# 总结

介绍了 v-for 、v-if 、v-show 的用法以及区别；也列了 vue 控制样式的 class 、style 的使用说明。
