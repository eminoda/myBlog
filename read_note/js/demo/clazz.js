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
