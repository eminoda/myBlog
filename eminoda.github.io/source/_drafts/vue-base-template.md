---
title: vue 基础-模板语法
tags: vue
categories:
  - 开发
  - 前端开发
thumb_img: vue.png
---

# 前言

此系列是再次回炉 vue 记的笔记，除了官网那部分知识点外，还会加入自己的一些理解。（里面会有大部分和官网类似的文案，有经验的同学择感兴趣的阅读）

# 插值

## Mustache（双大括号）

很简单，也是主流前端框架的大特色，相比于远古时期的 dom 操作，释放了劳动力，也结合框架机制加入了**数据动态响应机制**。

```html
<span>Message: {{ msg }}</span>
```

Mustache（双大括号）方式只能用于标签的 innerHTML 上，即标签内的文本范围。作用在 Html 标签内部，需要使用 v-bind。

```html
<div v-bind:id="dynamicId"></div>
```

## 原始 HTML

如果数据是普通的 HTML 标签，则通过双大括号形式无法输出成真正的 HTML。需要通过 v-html 指令完成该操作。如果需要也要对数据有预防 XSS 攻击的措施。

```html
<p>Using v-html directive: <span v-html="rawHtml"></span></p>
```

## 使用 JavaScript 表达式

模板中允许写简单的 js 表达式：

```html
{{ number + 1 }} {{ ok ? 'YES' : 'NO' }} {{ message.split('').reverse().join('') }}

<div v-bind:id="'list-' + id"></div>
```

但如果像写代码那样的写，就不行了。

```html
<!-- 这是语句，不是表达式 -->
{{ var a = 1 }}

<!-- 流控制也不会生效，请使用三元表达式 -->
{{ if (ok) { return message } }}
```

# 指令

vue 的指令通常以 v- 作为前缀，不如：v-bind、v-html、v-once ... 。作用是**响应式地作用于 DOM** 。

```html
<p v-if="seen">现在你看到我了</p>
```

## 参数

指令属性后，以冒号表示的参数。用于针对不同 html 属性做的绑定。

```html
<a v-bind:href="url">...</a>
```

## 动态参数

参数位置可以通过 [] 来动态化，这个 js 里的方式是一样的。

```html
<a v-on:[eventName]="doSomething"> ... </a>
```

值得注意，动态参数建议避免有大写字符，参数也不建议复杂化。

# 修饰符

比如参数 submit 是 html 特定的事件 event，对应会有冒泡等事件相关的处理，就可以通过修饰符来设置。

```html
<form v-on:submit.prevent="onSubmit">...</form>
```

# 缩写

```html
<!-- 完整语法 -->
<a v-bind:href="url">...</a>

<!-- 缩写 -->
<a :href="url">...</a>
```

```html
<!-- 完整语法 -->
<a v-on:click="doSomething">...</a>

<!-- 缩写 -->
<a @click="doSomething">...</a>
```
