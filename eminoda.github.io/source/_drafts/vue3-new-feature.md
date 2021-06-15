---
title: vue3-new-feature
tags:
---

# 基础

## 应用创建 createApp

**Vue.createApp** 是创建 **Vue** 应用实例 **app** 根组件的方法，和 **2.x** 不同，原先直接可以从 **Vue.xxx** 上调用 **use，directive，component...** 之类的全局方法，现在都需要通过 **app** 来获取。

同时，该组件的实例 **vm** 将由 **mount** 渲染后获得，而非原来的 **new Vue**。

**下面对比 2.x 和 3.x 的区别：**

```js
// 2.x
Vue.use(Vant);
Vue.component("foo", {});
Vue.directive("foo", {});
const vm = new Vue({
  // 选项
});
```

```js
// 3.x
const app = Vue.createApp({
  // 选项
});
app.use(Vant).component("foo", {}).directive("foo", {});
const vm = app.amount("#app");
```

**3.x 做的改变：**

> 全局 Vue API 已更改为使用应用程序实例

原先在 **Vue 原型**上使用各种 **API** ，会使得之后通过 **new Vue** 创建的实例存在共享全局配置。

现在通过 **Vue.createApp** 创建的 **app** 后，再调用对应的 **API** 来定制化只针对当前应用的配置。

## v-model 的改变

**v-model** 作为数据事件绑定的常用方法，做了很多的改动：

1. **prop** 属性的 **value** 字段的命名更改，以及 **model** 属性的移除
2. **.sync** 的移除
3.
4. 多个 **v-model** 的定义
5. 自定义 **v-model** 修饰符

**2.x** 上 **v-model** 其实就是组件上定义名为 **value** 的 **prop** 和名为 **input** 的事件的语法糖：

```html
<my-input :value="foo" @input="$emit('input', $event.target.value)" />
<!-- 语法糖 -->
<my-input v-model="foo" />
```

但在 **checkbox，radio** 等类型的 \<input> 控件上，其 **value** 会指代特别的属性 **checked** ， **selected**，且事件也不同为 **change**，**select**，所以需要特殊处理，才能被 **v-model** 语法糖使用：

```html
<my-checkbox v-model="foo" />

<!-- my-checkbox.vue -->
<template>
  <input type="checkbox" @change="onChange" :checked="checked" />
</template>

<script>
  export default {
    // 语法糖替换为：
    // :checked="foo" @change="$emit('change',$event.target.checked)"
    model: {
      prop: "checked",
      event: "change",
    },
    props: {
      checked: Boolean,
    },
    methods: {
      onChange(e) {
        this.$emit("change", e.target.checked);
      },
    },
  };
</script>
```

在 **3.x** 中，会去除 **model** 属性，并且 **props** 中的 **value** 替换成 **modelValue**：

```html
<my-checkbox :modelValue="foo" @update:modelValue="foo = $event.target.value" />
```

这样具有特殊意义的 **value** 将被释放出来，同时 **modelValue** 可以自定义命名，这样 **.sync** 就没有必要了。

另外支持定义多个 **v-model** ，也可以自定义约定事件修饰符：

```html
<my-component v-model.capitalize="bar"></my-component>

<script>
  export default {
    props: {
      modelValue: String,
      modelModifiers: {
        default: () => ({}),
      },
    },
    methods: {
      // input 控件上触发 emitValue
      emitValue(e) {
        let value = e.target.value;
        // 完成 v-model 修饰符的描述（组件 created 后，为 true）
        if (this.modelModifiers.capitalize) {
          value = value.charAt(0).toUpperCase() + value.slice(1);
        }
        this.$emit("update:modelValue", value);
      },
    },
  };
</script>
```

### key

在 **3.x** 中，**Vue** 会自动帮我们生成唯一的 **key** 。所以在 v-if/v-else 切换模板时，不用再像 **2.x** 那样单独为每个条件分支指定 **key**。

```html
<!-- 2.x -->
<template v-if="loginType === 'username'">
  <label>Username</label>
  <input placeholder="Enter your username" key="username-input" />
</template>
<template v-else>
  <label>Email</label>
  <input placeholder="Enter your email address" key="email-input" />
</template>
```

另外，在 **\<template v-for>** 中，key 不需要定义在子节点上，直接放在 **template** 标签上。

## Data

定义类型

## 计算属性

使用场景

## v-if 和 v-for 优先级
