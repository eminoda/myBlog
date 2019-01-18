function Test() {
	this.say = function() {
		throw new Error(123);
		console.log('something err');
	};
	process.on('uncaughtException', err => {
		console.log('catch err');
	});
}

var test = new Test();
test.say();
