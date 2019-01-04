---
js基础--this
---

# this

你肯定不陌生 **this**，作为 javascript 里一个普通的关键词，其实际作用却有些特殊，甚至让人摸不着头脑。

这里说明如何判断 this 的引用。

## 错误的理解

首先举例一些错误的理解

**指向自身**

```js
function say() {
	console.log(this.foo);
	this.foo++;
	console.log(this.foo);
}
var foo = 1;
say.foo = 0;
for (var i = 0; i < 5; i++) {
	say();
}
console.log(say.foo); //0
```

在 say 中用 this 指定了 foo 属性，运行 for 循环后却没有达到预期的累加效果。其实 this 指定的是全局范围而非 say 内部。

**作用域**

```js
function bar() {
	console.log("bar called");
	console.log(this.a); // undefined
}

function foo() {
	var a = 1;
	this.bar();
}

foo();
```

看似调用栈 foo -> bar -> foo.a，但其实 **this 是 js 引擎内部运行时产生的**，并不是简单拍脑袋以为词法作用域所能串联起来的。同时更不可能在 bar 中试图通过 this 来获取 foo 的 a 属性。

## 绑定规则

通常 this 有如下 4 中绑定方式：

1. 默认绑定

    通常在没有特殊指定时，this 默认会指到全局环境，即我们熟悉的 windows

2. 隐藏绑定

    确认是否有 **上下文** context 的影响。

    ```js
    function foo() {
    	console.log(this.a);
    }
    var obj = {
    	a: 1,
    	foo: foo
    };
    obj.foo(); //1
    ```

    上面这个例子中，foo 是一个函数声明并且在声明时 **提升到全局**，但在被 obj 调用时，函数 foo 的 **引用** 给予了 obj.foo，导致最后 this 的上下文环境变更到了 obj 中。

    ```js
    function foo() {
    	console.log(this.a);
    }
    var obj = {
    	a: 1,
    	foo: foo
    };

    var foo2 = obj.foo; // 引用又被拎到外面
    var a = 2;

    obj.foo(); //1
    foo2(); //2
    ```

    如果理解了这样一种隐藏绑定的意思，那么对于 foo2 输出 2 这个结果其实也就水到渠成了。

    ```js
    function foo3(fn) {
    	fn();
    }
    foo3(obj.foo); //2
    ```

    更为 **隐藏** 的方式，通过回调函数、参数的方式来执行。这就解释了用 setTimeout 之类的方法出现 this 丢失，或者引用错误的原因。

3. 显式绑定

    使用 call，apply

    ```js
    // var foo2 = obj.foo;
    // foo2()
    var foo2 = obj.foo.call(obj);
    ```

    当然也有 es5 的 bind

4. new 绑定

    “构造函数”（当然 js 是面向函数编程的语言，不存在类的概念。“构造函数”只是 oo 规范化的称呼，其实就是 new 所修饰的调用的函数而已。）

    ```js
    function User() {
    	this.name = "aaaa";
    }
    var name = "bbbb";
    var user = new User();
    console.log(user.name); // aaaa
    ```

## 参考

-   你不知道的 JavaScript（上卷）
