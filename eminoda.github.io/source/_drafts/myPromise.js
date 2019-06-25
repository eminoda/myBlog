function MyPromise(fn) {
	this.resolveFn = function(callback) {
		return callback;
	};
	this.rejectFn = function(callback) {
		return callback;
	};
	this.then = function(callback, errFn) {
		fn(this.resolveFn(callback), this.rejectFn(errFn));
	};
}

new MyPromise(function(resolve, reject) {
	setTimeout(function() {
		resolve(true);
	}, 1000);
}).then(
	function(data) {
		console.log(data);
	},
	function(data) {
		console.log(data);
	}
);

let data = 0;
setTimeout(function() {
	data++;
	setTimeout(function() {
		data++;
		setTimeout(function() {
			data++;
			console.log(data); //  3
		}, 1000);
	}, 1000);
}, 1000);

var timePromiseFn = function(data) {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			resolve(++data);
		}, 1000);
	});
};
timePromiseFn(0)
	.then(data => {
		return timePromiseFn(data);
	})
	.then(data => {
		return timePromiseFn(data);
	})
	.then(data => {
		console.log(data);
	});
