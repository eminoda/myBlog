---
title: vue 基础-过滤器 filter 和指令 directive 示例
tags: vue
categories:
  - 开发
  - 前端开发
thumb_img: vue.png
date: 2019-11-10 23:57:41
---


# 前言

《vue 基础》系列是再次回炉 vue 记的笔记，除了官网那部分知识点外，还会加入自己的一些理解。（里面会有部分和官网相同的文案，有经验的同学择感兴趣的阅读）

说下 vue 里过滤器 **filter** 和指令 **directvie** 相关用法。

# filter 过滤器

过滤器 **filter** 没什么好说，如果你以前玩过 angular.js ，那么就不会太陌生。通过 **filter** 能对模板上写的数据进行二次加工。

我们不用通过计算属性 computed，或者某个地方对数据进行新的赋值等操作，在模板上简单的通过 xxx | filter 编写即可。

通过几个例子来说明用法：

## filter 字典文案

将通过接口获取到的 value （ number 类型），在前端转换成对应的文案。

```js
Vue.filter("drawStatus", function(value) {
  let types = ["处理中", "已完成", "已驳回", "待放款", "放款中", "已撤销"];
  return types[value] || "其他";
});
```

{% asset_img filter-value-html.png %}

## filter 时间格式

一般，后端返回时间存储格式和前端展示会有差异，封装 **moment** 工具库，以过滤器 filter 形式来简化这种格式化操作。

```js
  return value ? moment(value).format(format || "YYYY-MM-DD HH:mm:ss") : "";
});
```

{% asset_img filter-params-html.png %}

注意：这个 timeFormat 过滤器示范了如何传递第二个参数。

# directive 指令

vue 里的指令都默认以 **v-** 开头，像：v-for 、v-if、v-model ... 等等。我们也可以自定义指令，根据需要作出不同的功能指令属性，简化 vue 逻辑代码。

还是先列举几个例子，再开始介绍：

## directive 点击图片自动加载

```js
/**
 * 刷新图片
 * <img alt="" v-reload-img="'/verifyCode.api'" src="/verifyCode.api">
 */
Vue.directive("reload-img", {
  bind: function(el, binding) {
    el.src = binding.value ? binding.value : "/verifyCode.api";
    el.addEventListener("click", function(event) {
      el.src = el.src + "?t=" + new Date().getTime();
    });
  }
});
```

## directive 根据数据切换不同样式

```js
/**
 * 正负红绿样式
 * <span v-red-green="value">
 */
Vue.directive("red-green", {
  componentUpdated: function(el, binding) {
    // console.log('<update>' + binding.value);
    let setClass = (el.className + " ").replace(/color-red|color-green/g, "");
    if (binding.value >= 0) {
      setClass = setClass + "color-red";
    } else {
      setClass = setClass + "color-green";
    }
    el.className = setClass;
  }
});
```

## directive 模拟路由指令实现跳转

```js
/**
 * 页面跳转
 * <li v-go="'/active/center'"></li>
 */
Vue.directive("go", {
  bind: function(el, binding, vnode) {
    el.addEventListener("click", function() {
      vnode.context.$router.push(binding.value);
    });
  }
});
```

## 钩子函数介绍

在开始举例前，看下自定义指令里的钩子函数：

- bind
  只调用一次，指令第一次绑定到元素时调用。在这里可以进行一次性的初始化设置。
- inserted
  被绑定元素插入父节点时调用 (仅保证父节点存在，但不一定已被插入文档中)。
- update
  所在组件的 VNode 更新时调用，但是可能发生在其子 VNode 更新之前。指令的值可能发生了改变，也可能没有。需要通过前后值得比较来确定不必要的更新。
- componentUpdated
  指令所在组件的 VNode **及其子 VNode** 全部更新后调用。

## 钩子函数触发顺序

我录制了一个 gif ，分三个阶段来触发钩子函数，希望大家能对钩子函数有个感性认识：

- 组件 A 首次加载
- 切换组件 B
- 再次切换至 A 组件

{% asset_img directive-hook-order.gif 钩子函数执行顺序 %}

能看到指令的 **bind** 、 **inserted** 是在生命周期 **mounted** 之前进行执行的；同时 **unbind** 在组件销毁时触发。

{% asset_img directive-hook-order.png 钩子函数执行顺序 %}

那 **update** 、 **componentUpdated** 呢？

他们在数据更新时被触发调用，并且是在生命周期 **beforeUpdate** 和 **updated** 之间完成。

{% asset_img directive-hook-order2.png 钩子函数执行顺序 %}

## 钩子函数参数

- el：指令所绑定的元素，可进行 dom 操作。
- binding：Object：
  - name：指令名，不包括 v- 前缀。
  - value：指令的绑定值，例如：v-my-directive="1 + 1" 中，绑定值为 2。
  - oldValue：指令绑定的前一个值，**仅在 update 和 componentUpdated 钩子中可用**
  - expression：字符串形式的指令表达式。例如 v-my-directive="1 + 1" 中，表达式为 "1 + 1"。
  - arg：传给指令的参数，可选。例如 v-my-directive:foo 中，参数为 "foo"。
  - modifiers：一个包含修饰符的对象。例如：v-my-directive.foo.bar 中，修饰符对象为 { foo: true, bar: true }。
- vnode：Vue 编译生成的虚拟节点。
- oldVnode：上一个虚拟节点，**仅在 update 和 componentUpdated 钩子中可用**

# 指令钩子 inserted 没被插入的原因

比如我们指令所属标签的子标签内含操作 dom 的指令或者逻辑，比如 v-if

{% asset_img directive-insert.png %}

如果我们的 v-if 为 false ，然后你会发现，虽然 insert 被触发了，但页面实际上没有子标签内容的插入，可能你需要避免这方面的 bug 产生。

# 指令钩子 update 更新的正确判断

当我们绑定在指令上的数据发生更新时（数据 从 1 更新为 2），会触发 update 钩子

```js
update: function(el, binding, vnode, oldVnode) {
  console.log('[directive parent]', `update`);
  console.log('<update>', 'bind-value', binding.value); // 2
  console.log('<update>', 'bind-oldValue', binding.oldValue); // 1
}
```

此时 binding.value 就更新了。

但注意，下图中的红框内容，虽然当前 vnode 更新了相关元素，但其子 VNode 却没有变化。

{% asset_img directive-update.png %}

{% asset_img directive-update2.png %}

所以当你使用 VNode 做一些更新判断是，就需要根据不同的场景来选择更新模板的契机，以免不必要的无用判断。

# 指令钩子 componentUpdated 的错误理解

这个 hook 让我真不好理解，不过你可以看下别人怎么理解的：

> https://stackoverflow.com/questions/50634762/hook-componentupdated-of-vue-directive-not-triggered

你要注意到，在官方文档上这个 **及其子 VNode** 是加粗的，这是个“与”判断。首先不能因为只修改了子模板的 VNode 就认为会触发 **componentUpdated** 。

其次你该理解 **所在组件的** 的真正含义，因为 **componentUpdated** 是说所在组件和子 VNode 被触发，那么如下举例：为什么我在 **componentUpdated** 中取到的两个 ClassName 后的 num 后缀不一样呢？（num 应该同时更新的）：

{% asset_img directive-componentupdate.png  %}

{% asset_img directive-componentupdate-result.png  %}

解释：虽然 **v-my-directive** 指令是写在父模板中，但是写在 **mt-badge** 组件内。当 num 更新，触发 **lifecycle** 中的 **udpate** ，然后接连触发 **update** 和 **componentUpdated** 钩子，但是这个 **mt-badge** 却还没有被触发它的 **lifecycle** 的 **update** （如果每个组件的 update 没有顺序，那还怎么管理数据流），它是在指令 **v-my-directive** 的 componentUpdated 结束后才更新。

所以指令触发 **componentUpdated** 时， **v-my-directive** 所在组件 VNode 更新了，但子组件的 VNode 还保持原样。

你可以试下，如果把 **mt-badge** 换成一个普通标签，那取到的 ClassName 就一致了。

# 总结

本文列举了过滤器和指令的几种场景运用，给出了 5 个简单的 Demo 示例。同时对指令的 inserted、update 、componentUpdated 做了重点说明。

原本以为 filter 和 directive 篇幅不会过长，但在说指令中几个钩子时扩展了下。希望各位在开发中遇到问题时能有个更好的判断，如果有帮助就分享给更多的开发者。
