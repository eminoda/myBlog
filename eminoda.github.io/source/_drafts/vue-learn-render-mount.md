---
title: vue 源码学习-渲染：挂载渲染器 mount
tags: vue
categories:
  - 开发
  - 前端开发
thumb_img: vue.png
---

# 前言

从“数据动态响应”章节，我们了解了 **vue** 是怎么实现这样的机制。这篇我们从 **mount** 开始入手，了解渲染器的工作原理，以及内部对 **ast** 语法树、 **vnode** 虚拟节点相关解读。

# Vue.prototype.\$mount

## 两处 mount 定义

**mount** 意思是“挂载”意思，就像 **Linux** 利用 **mount** 实现外部资源文件的关联一样。

在 **vue** 代码一共出现两处 **mount** 挂载的定义：

```js
// src\platforms\web\entry-runtime-with-compiler.js

const mount = Vue.prototype.$mount;
Vue.prototype.$mount = function(el?: string | Element, hydrating?: boolean): Component {
  // ...
  const options = this.$options;
  if (!options.render) {
    // ...
    const { render, staticRenderFns } = compileToFunctions();
    options.render = render;
    options.staticRenderFns = staticRenderFns;
  }
  // 已经获取到 options.render 渲染器
  return mount.call(this, el, hydrating);
};
```

```js
// src\platforms\web\runtime\index.js

Vue.prototype.__patch__ = inBrowser ? patch : noop;

// public mount method
Vue.prototype.$mount = function() {
  // ...
  return mountComponent(this, el, hydrating);
};
```

## 区别

那这两个有什么区别呢？

首先我们从 **entry-runtime-with-compiler.js** 很明确知道，在进入改文件前已经有了 **Vue.prototype.\$mount** 的声明定义，并且赋值给 **mount** 变量。

按照 **rollup** 的打包方式，我们也知道此文件是个入口 **entry** 文件，经过它打包后你将拥有 **完整版** 的 **vue** （运行时+编译器）。

如果你对 **vue** 不同的构建版本有什么区别，可以看下我之前写的这篇文章： [vue 基础-不同构建版本说明](https://www.toutiao.com/i6755334564530356749/)

并且你能在此文件的 **\$mount** 方法中看到对 **\$options.render** 进行取值的操作，就是声明 **编译器** 。

再看，最先声明的 **Vue.prototype.\$mount** 方法：

```js
// src\core\instance\lifecycle.js

Vue.prototype.$mount = function() {
  // ...
  return mountComponent(this, el, hydrating);
};

function mountComponent(vm: Component, el: ?Element, hydrating?: boolean): Component {
  vm.$el = el;
  if (!vm.$options.render) {
    vm.$options.render = createEmptyVNode;
    // ...
  }
  callHook(vm, "beforeMount");
  // ...
  updateComponent = () => {
    vm._update(vm._render(), hydrating);
  };
  new Watcher(
    vm,
    updateComponent,
    noop,
    {
      before() {
        if (vm._isMounted && !vm._isDestroyed) {
          callHook(vm, "beforeUpdate");
        }
      }
    },
    true /* isRenderWatcher */
  );
  // ...
}
```

能看到这个 **Vue.prototype.\$mount** 方法内有个 mountComponent 方法，如果我们是完整版，那么它将拥有 **render** 方法，并且交给 **Watcher** 对象作为 **expOrFn** 观察。

虽然第一个 **Vue.prototype.\$mount** 先声明，但是没有实质的对 **render** 进行赋值，而是返回一个 **高阶函数** **mountComponent** ，并赋值给 **mount** 变量。

在第二个真正为完整版服务的 **Vue.prototype.\$mount** 服务的方法中，得到 **render** 渲染器方法，再次返回一个高阶函数 **mount** ，使这两者虽然看上去矛盾，但在不同构建版本中起到不同的作用。

# 完整版 \$mount 做了什么

## 代码主体

先回顾，我们在一个最简单的 demo 中会怎么使用 vue ？

```js
var app = new Vue({
  el: "#app",
  data: {
    message: "Hello Vue!"
  }
});
```

这个 **#app** 就是页面上用 **id=app** 来定义的模板钩子。

随后构建 Vue 对象，在其中调用 **\_init** 方法：

```js
// src\core\instance\init.js
Vue.prototype._init = function() {
  // ...
  if (vm.$options.el) {
    vm.$mount(vm.$options.el);
  }
};
```

因为 **vm** 是 **Vue** 的 **this** 引用，所有调用的就是完整版中的 **Vue.prototype.\$mount** 方法，这我们已经在上一部分了解过了。

接下来我们详细看这块代码的主体：

```js
Vue.prototype.$mount = function(el?: string | Element, hydrating?: boolean): Component {
  el = el && query(el);
  const options = this.$options;
  if (!options.render) {
    let template = options.template;
    if (template) {
      // 多种情况加工 template
      if (typeof template === "string") {
        template = idToTemplate(template);
      } else if (template.nodeType) {
        template = template.innerHTML;
      } else {
        return this;
      }
    } else if (el) {
      template = getOuterHTML(el);
    }
    if (template) {
      const { render, staticRenderFns } = compileToFunctions(
        template,
        {
          /** */
        },
        this
      );
      options.render = render;
      options.staticRenderFns = staticRenderFns;
    }
  }
  return mount.call(this, el, hydrating);
};
```

## template 解析

假设我们定义了 **template** 选项，并且是以 **#** 开头的字符串：

```js
if (typeof template === "string") {
  if (template.charAt(0) === "#") {
    template = idToTemplate(template);
  }
}
```

**vue** 就会判断该值是否是 **id 类型的 dom 选择器** ，并进行选取。

```js
const idToTemplate = cached(id => {
  const el = query(id);
  return el && el.innerHTML;
});

function query(el: string | Element): Element {
  if (typeof el === "string") {
    const selected = document.querySelector(el);
    if (!selected) {
      return document.createElement("div");
    }
    return selected;
  } else {
    return el;
  }
}
```

如果 **template** 有 **nodeType** 属性，则会获取 **template.innerHTML** 属性值：

```js
else if (template.nodeType) {
    template = template.innerHTML
}
```

如果 **template** 没有定义就像我们 **demo** 一样，则会直接根据 **el** 解析：

```js
else if (el) {
    template = getOuterHTML(el)
}

function getOuterHTML (el: Element): string {
  if (el.outerHTML) {
    return el.outerHTML
  } else {
    const container = document.createElement('div')
    container.appendChild(el.cloneNode(true))
    return container.innerHTML
  }
}
```

根据这些初始化方法，我们最终就能得到一个 **template** 字符串模板。

## compileToFunctions 解析 render 选项

compileToFunctions 方法是一个很复杂的 **高阶函数** 嵌套，我们下面再说。这里我们看它目前是做什么的：

```js
const { render, staticRenderFns } = compileToFunctions(
  template,
  {
    outputSourceRange: process.env.NODE_ENV !== "production",
    shouldDecodeNewlines,
    shouldDecodeNewlinesForHref,
    delimiters: options.delimiters,
    comments: options.comments
  },
  this
);
options.render = render;
options.staticRenderFns = staticRenderFns;
```

这些方法属性，是给 **ast** 使用的。最终我们能通过其得到 **render** 渲染方法

# 渲染编译函数 compileToFunctions

为什么前面说 **compileToFunctions** 方法复杂，你可以看下它的实现：

1. **Vue.prototype.\$mount** 方法中的调用触发 **compileToFunctions** 方法：

   ```js
   // src\platforms\web\entry-runtime-with-compiler.js

   const { render, staticRenderFns } = compileToFunctions(template, options, this);
   ```

2. **compileToFunctions** 实际是 **createCompiler** 方法执行结果的一部分的引用：

   ```js
   // src\platforms\web\compiler\index.js

   const { compile, compileToFunctions } = createCompiler(baseOptions);
   export { compile, compileToFunctions };
   ```

3. **createCompiler** 方法实质是调用编译器创建工厂方法 **createCompilerCreator**

   ```js
   // src\compiler\index.js

   export const createCompiler = createCompilerCreator(function baseCompile(template: string, options: CompilerOptions): CompiledResult {
     // ...
     return {};
   });
   ```

4. **createCompilerCreator** 方法其实是个 **Thunk** 函数，能看到传入 **baseCompile** 编译基础方法，内部实现 AST 抽象语法树（这个下篇在探讨）

   ```js
   // src\compiler\index.js

   function baseCompile(template: string, options: CompilerOptions): CompiledResult {
     const ast = parse(template.trim(), options);
     if (options.optimize !== false) {
       optimize(ast, options);
     }
     const code = generate(ast, options);
     return {
       ast,
       render: code.render,
       staticRenderFns: code.staticRenderFns
     };
   }
   ```

5. 另外 **createCompilerCreator** 方法也是个高阶函数，返回一个 **createCompiler** 方法，并且注意到内部 **return** 的对象中还有个高阶函数 **createCompileToFunctionFn**

   ```js
   // src\compiler\create-compiler.js

   export function createCompilerCreator(baseCompile: Function): Function {
     return function createCompiler(baseOptions: CompilerOptions) {
       function compile(template: string, options?: CompilerOptions): CompiledResult {
         // ...
         const compiled = baseCompile(template.trim(), finalOptions);
         // ...
         return compiled;
       }
       return {
         compile,
         compileToFunctions: createCompileToFunctionFn(compile)
       };
     };
   }
   ```

   注意：最终 **createCompilerCreator** 方法返回的对象 **{ compile,compileToFunctions}** 就是 **步骤 2** 使用的引用。

   **createCompileToFunctionFn** 方法将返回：调用 **Thunk** 方式传入的 **baseCompile Function** 经过一系列得到 **{ ast,render,staticRenderFns }**

# 总结

顺着 **vue** 代码顺序看了 **compileToFunctions** 方法，简直晕头转向，说实话这是我第一次看到那么复杂的调用逻辑。当然其中的设计思想随着我们的开发阅历会理解的越来越清晰。

归根结底反正最后拿到了 **render** 渲染函数，也是在生命周期中 **updateComponent** 所需要使用的：

```js
updateComponent = () => {
  vm._update(vm._render(), hydrating);
};
```

当然 **\$mount** 只是整个渲染的外部壳子，下面我们从 **baseCompile** 开始看其中的编译器工厂方法是如何工作的。
