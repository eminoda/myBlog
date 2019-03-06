// es6 class 方式继承
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

// es5 旧方式定义继承
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

// 对象 getter/setter 在 class 绑定一些技巧
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
