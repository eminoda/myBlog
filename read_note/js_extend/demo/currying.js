var curry1 = fn =>
	(judge = (...args) =>
		args.length === fn.length ? fn(...args) : arg => judge(...args, arg));

var curry = function(fn) {
	/**
	 * judge
	 * args: 柯里化函数的参数
	 */
	return function judge() {
		var args = [].slice.call(arguments);
		// 柯里化定义的函数参数 == 调用该函数的参数
		if (args.length == fn.length) {
			return fn(...args);
		} else {
			// 通过 ()() 形式调用
			return function() {
				var args2 = [].slice.call(arguments);
				// 拼接成新的参数，递归继续judge
				return judge.apply(null, args.concat(args2));
			};
		}
	};
};

var sum = function(a, b) {
	return `result:${a + b}`;
};
var testFn = curry(sum);
console.log(testFn(1)(2));
console.log(testFn(1, 2));
