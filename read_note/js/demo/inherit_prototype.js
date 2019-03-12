function Parent() {
	this.name = 'parent';
}
Parent.prototype.pName = 'parent';
Parent.prototype.age = 2;
Parent.prototype.say = function() {
	console.log(this.name + ' is called');
};

function Child() {
	this.name = 'child';
}
Child.prototype = new Parent();
Child.prototype.age = 1;
Child.prototype.littleSay = function() {
	console.log(this.name + ' is called');
};

var instance = new Child();
console.log(instance.name); // child
console.log(instance.pName); // parent
instance.say(); // child is called
instance.littleSay(); // child is called

console.log(instance);
console.log(instance.prototype);
