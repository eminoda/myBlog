---
js扩展--bind call apply 那些事
---

无论接触多少 js，call 和 apply 基本都有耳闻，无论是哪个目标都是改变执行作用域。
这里简单说下区别和用法：

如果先看具体用法和例子，请参考 [深入浅出妙用 Javascript 中 apply、call、bind](http://web.jobbole.com/83642/)

## call

> 接受的是若干个参数的列表

```js
//Function.prototype.call
fn.call(thisArg, arg1, arg2, ...)
```

## apply

> 接受的是一个包含多个参数的数组

```js
//Function.prototype.apply
fn.call(thisArg, [argsArray]);
```

## bind

和 call ，apply 作用类似，但可以不设置传参，相对方便些。但缺点主要是浏览器的兼容问题。

```js
//Function.prototype.bind
fn.bind(thisArg[, arg1[, arg2[, ...]]])
```

```js
function User() {
  this.name = "aaaa";
}
function say() {
  console.log(this.name);
}
var test = say.bind(new User());
test(); //aaaa
```

# 使用场景

## 继承

参考：[https://github.com/eminoda/myBlog/issues/5](https://github.com/eminoda/myBlog/issues/5) 中的 **借用构造函数继承**

## “黑科技”用法

参考：[https://eminoda.github.io/2018/11/16/js-hack-skill/](https://eminoda.github.io/2018/11/16/js-hack-skill/) 中的 **数组中取最大值**

## polyfill bind 的例子

因为兼容问题，可能有些框架会有兼容方案，比如 Vue：

```js
function polyfillBind(fn: Function, ctx: Object): Function {
  function boundFn(a) {
    const l = arguments.length;
    return l
      ? l > 1
        ? fn.apply(ctx, arguments)
        : fn.call(ctx, a)
      : fn.call(ctx);
  }

  boundFn._length = fn.length;
  return boundFn;
}
```

但是有一个疑问，为何 return 中根据参数个数返回不同的处理方式（apply or call）？

答案：**因为性能**

一个简单测试，可以查看 [https://www.measurethat.net/Benchmarks/Show/398/0/direct-call-vs-bind-vs-call-vs-apply](https://www.measurethat.net/Benchmarks/Show/398/0/direct-call-vs-bind-vs-call-vs-apply)
