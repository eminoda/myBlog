---
es6--class
---

# class

class 是什么鬼，具体看下[阮老师的文章](http://es6.ruanyifeng.com/#docs/class)

这里更多记录一些 class 使用上的一些注意点

## 语法糖和原生 js 的实现

只是揣摩 class 的实现，不一定正确，但总得有个理解过程。

```js
class Parent {
	constructor() {
		this.name = 'Parent';
	}
	say() {
		console.log(this.name);
	}
}
class Child extends Parent {
	constructor() {
		super();
		this.name = 'Child';
	}
}

const instance = new Child();
console.log(instance);
```

```js
function ParentES5() {
	this.name = 'Parent';
}
ParentES5.prototype.say = function() {
	console.log(this.name);
};
function ChildES5() {
	ParentES5.call(this);
	this.name = 'Child';
}
var prototype = Object.create(ParentES5.prototype);
prototype.contructor = ChildES5;
ChildES5.prototype = prototype;

var instanceES5 = new ChildES5();
console.log(instanceES5);
```

## class 中定义 defineProperty

我们一个“类”、对象被创建时，里面的 this 通常指定其本身引用。但是看到 Egg 在绑定 service 时用到如下技巧，虽然是在实例化它的工具类，但内部却把属性定义绑定在指定 obj 上。

这个 this 不要错误认为是 TestProperDefined，而是 obj 的。

```js
var obj = {
	name: 123
};
class TestProperDefined {
	constructor() {
		Object.defineProperty(obj, 'service', {
			get() {
				console.log(this); // { name: 123 }
				return 'service';
			}
		});
	}
}
new TestProperDefined();

console.log(obj.service); // service
```
