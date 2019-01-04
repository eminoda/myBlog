// function say() {
// 	this.foo = "2";
// }
// say.foo = "1";
// say();
// console.log(say.foo); //1

function bar() {
	console.log("bar");
	console.log(this.a);
}

function foo() {
	var a = 1;
	this.bar();
}

foo();
