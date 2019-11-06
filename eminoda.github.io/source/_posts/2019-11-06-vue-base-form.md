---
title: vue 基础-表单
tags: vue
categories:
  - 开发
  - 前端开发
thumb_img: vue.png
date: 2019-11-06 14:17:20
---


# 前言

此系列是再次回炉 vue 记的笔记，除了官网那部分知识点外，还会加入自己的一些理解。（里面会有大部分和官网相同的文案，有经验的同学择感兴趣的阅读）

# 表单

## 基础用法

提到表单 form ，就要想到里面最重要的指令 v-model ，它会作用在 input、textarea、select 这些表单标签上实现 **双向数据绑定** 这么一项功能。

输入框 input

```html
<input v-model="message" placeholder="edit me" />
<p>Message is: {{ message }}</p>
```

页面 message 的文案，会随着 input 输入框更改而实时更新。

复选框 checkbox

```html
<input type="checkbox" id="jack" value="Jack" v-model="checkedNames" />
<label for="jack">Jack</label>
<input type="checkbox" id="john" value="John" v-model="checkedNames" />
<label for="john">John</label>
```

单选框 radio

```html
<input type="radio" id="one" value="One" v-model="picked" />
<label for="one">One</label>
<br />
<input type="radio" id="two" value="Two" v-model="picked" />
<label for="two">Two</label>
```

当 radio id=one 选择后，值为 One

选择框 select

```html
<select v-model="selected">
    <option disabled value="">请选择</option>
    <option value="A">A</option>
    <option value="B">B</option>
    <option value="C">C</option>
</select>
```

当 select 选择后，值为 option 选择的某项 value 。为了避免 IOS 首项兼容问题，可以将第一个 options 失效，绕过处理。

## 修饰符

### .lazy

input 事件（实时触发）变成了 change 事件，只有当光标改变了状态才会触发值得更新。

```html
<input v-model.lazy="msg" />
```

效果如下：

{% asset_img lazy.gif %}

### .trim

将自动过滤输入字符串的首位空格

```html
<input v-model.trim="msg" />
```

### .number

如果想自动将用户的输入值转为数值类型，先知道一点 html input 内输入的值都是字符串，即使你设置了 type="number" 返回的也是字符串。

通过该修饰符，会通过 parseFloat 进行解析，返回处理结果。

当然如果解析失败则会返回请输入的原始值，所以要通过 type="number" 限制用户的输入一定为数值。

```html
<input v-model.number="age" type="number" />
```

# 总结

列举 form 表单 v-model 在模板中的运用，最后介绍了三种修饰符。
