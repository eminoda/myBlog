function Parent() {
	console.log('Parent called');
	this.books = ['parent'];
}
Parent.prototype.publicBooks = ['aa', 'bb'];

function Child() {
	Parent.call(this);
}

Child.prototype = new Parent();

const instance1 = new Child();
console.log(instance1.publicBooks);
instance1.publicBooks.push('cc');
console.log(instance1.books); //['parent']

const instance2 = new Child();

console.log(instance2.publicBooks);
