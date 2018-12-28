---
js扩展--currying 柯里函数
---

更多信息参见 [JavaScript 专题之函数柯里化](https://github.com/mqyqingfeng/Blog/issues/42)

这里只是把其中的 currying 封装的方法贴出来，跑下看下。

```js
// https://github.com/mqyqingfeng/Blog/issues/42#issuecomment-323919896
var curry = fn =>
	(judge = (...args) =>
		args.length === fn.length ? fn(...args) : arg => judge(...args, arg));
```

可能涉及 es6 看的第一眼无法解读，这里再写的繁琐下

```js
var curry = function(fn) {
	/**
	 * judge
	 * args: 柯里化函数的参数
	 */
	return function judge() {
		var args = [].slice.call(arguments);
		// 柯里化定义的函数参数 == 调用该函数的参数
		if (args.length >= fn.length) {
			return fn(...args);
		} else {
			// 通过 ()() 形式调用 -- 柯里化
			return function() {
				var args2 = [].slice.call(arguments);
				// 拼接成新的参数，递归继续judge
				return judge.apply(null, args.concat(args2));
			};
		}
	};
};
```

那解决什么场景的问题？

比如：实现不同幅度的相加功能

```js
var sum = function(increment, number) {
	return increment + number;
};
// 虽然都是相同的相加逻辑，可能在函数命名、功能定义上会有不同（当然这里只是硬性举个例子）。
var addOne = sum;
var addTen = sum;

console.log(addOne(1, 5)); //6
console.log(addTen(10, 5)); //15
```

如果函数柯里化后：

```js
var addOne = curry(sum)(1)(5); //6
var addTen = curry(sum)(10)(5); //15
```

虽然生搬硬套，不过现实业务也会有类似场景。这里能体会到 curry 带来的好处：

-   定制化。原有共性的方法，被拆成符合不同场景的业务方法
-   参数明确。由于 curry 是根据固定参数约定的，所以通过()()形式固化了参数用意（比如第一个是累加数，第二个是被相加数）
