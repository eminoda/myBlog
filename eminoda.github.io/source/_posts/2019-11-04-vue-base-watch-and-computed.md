---
title: vue 基础-计算属性 computed
tags: vue
categories:
  - 开发
  - 前端开发
thumb_img: vue.png
date: 2019-11-04 15:28:33
---


# 前言

此系列是再次回炉 vue 记的笔记，除了官网那部分知识点外，还会加入自己的一些理解。（里面会有大部分和官网相同的文案，有经验的同学择感兴趣的阅读）

# 计算属性 computed

## 起因

在页面模板中使用 js 的表达式做一些简单功能逻辑非常方便，但太多的运算逻辑会使得模板过重难以维护。

你可以对比如下两种实现，如果你是该项目的维护者，你会选择哪种？

```html
<div id="example">
  {{ message.split('').reverse().join('') }}
</div>
```

```html
<div id="example">
  {{ reversedMessage }}
</div>
```

如果你看到项目组有类似的代码，一定也会头大。毕竟使得 html template 变得异常臃肿会难以维护，它有时只是作为数据的显示而已。

## 用法

看下 computed 在 vue 中的运用、以及几个细节：

```html
<div id="example">
  <p>Original message: "{{ message }}"</p>
  <p>Computed reversed message: "{{ reversedMessage }}"</p>
</div>
```

```js
var vm = new Vue({
  el: "#example",
  data: {
    message: "Hello"
  },
  computed: {
    // 计算属性的 getter
    reversedMessage: function() {
      // `this` 指向 vm 实例
      return this.message
        .split("")
        .reverse()
        .join("");
    }
  }
});
```

计算属性中的 reversedMessage 会专门定义一个 getter 函数用于逻辑处理，它内部的 this.message 会和 reversedMessage 进行依赖。一旦 this.message 更改了，reversedMessage 就会随之做对应的改变。

相关源码：

```js
// src\core\instance\state.js
function initComputed(vm: Component, computed: Object) {
  for (const key in computed) {
    const userDef = computed[key]; // 获取计算属性的 getter 方法
    if (!(key in vm)) {
      // 遍历 vm 属性
      // 定义动态响应，vm 属性发生变化时，会触发对应的计算属性
      defineComputed(vm, key, userDef);
    }
  }
}
```

同时，也能让 template 模板更简约。

## 计算属性的 setter

上面默认是一个 getter 功能的方法，当然可以提供一个 setter 的方法。

```js
computed: {
  fullName: {
    // getter
    get: function () {
      return this.firstName + ' ' + this.lastName
    },
    // setter
    set: function (newValue) {
      var names = newValue.split(' ')
      this.firstName = names[0]
      this.lastName = names[names.length - 1]
    }
  }
}
```

当给 this.fullName 赋值时就会被触发调用。

# 计算属性缓存 vs 方法

可以通过 methods 达到一样效果

```html
<p>Reversed message: "{{ reversedMessage() }}"</p>
```

```js
methods: {
  reversedMessage: function () {
    return this.message.split('').reverse().join('')
  }
}
```

当 message 改变时，对应的 reversedMessage() 也会自动执行，并在页面上实时更新。

那有什么区别？计算属性 computed 是和响应式依赖有联系的，当依赖变化，他就会变化，如果没有变化，就会直接返回“缓存的数据”。

就像如下的 now 属性，并不会再次执行当前时间的计算，直接返回首次缓存的数字：

```js
computed: {
  now: function () {
    return Date.now()
  }
}
```

相反 methods 就会每次执行当前的方法。如果有相对大运算量的逻辑，method 就会消耗性能。不过缓存特性的使用要根据不同业务需求走。

# 计算属性 vs 侦听属性

有一些数据需要随着其它数据变动而变动时，就会联想使用 watch，但是多数场景还是 computed 更为适用，体会如下例子：

```js
watch: {
  firstName: function (val) {
    this.fullName = val + ' ' + this.lastName
  },
  lastName: function (val) {
    this.fullName = this.firstName + ' ' + val
  }
}

```

```js
 computed: {
    fullName: function () {
      return this.firstName + ' ' + this.lastName
    }
  }
```

watch 里监听了 firstName 和 lastName ，目的就是为了动态更新 fullName ，但就此例子，完全可以使用 computed 对 fullName 进行 getter 函数的封装实现。

**那什么时候 watch 更为适用呢？**

如果监听的数据是异步操作时，watch 的优势就凸显出来了。 computed 计算属性是同步操作，在这个场景下就无法发挥作用。

```js
export default {
  name: "HelloWorld",
  data() {
    return {
      message: "1 2 3",
      msg: "not change"
    };
  },
  computed: {},
  watch: {
    msg(newQuestion, oldQuestion) {
      if (oldQuestion !== newQuestion) {
        this.message = "4 5 6";
      }
    }
  },
  methods: {},
  created() {
    let self = this;
    // 一个简单的异步操作
    setTimeout(function() {
      self.msg = "change";
    }, 3000);
  }
};
```

如上，watch 监听 msg 字段，3 秒后，msg 发生更改后，message 就联动更新在页面模板上，更新为 4 5 6。这样的处理就变得很合适。

# 总结

说了下 computed 计算属性的相关用法，以及和 method 、 watch 的使用场景的运用。
