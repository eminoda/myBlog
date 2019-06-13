function MyPromise(fn) {
    this.resolveFn = function(callback) {
        return callback;
    }
    this.rejectFn = function(callback) {
        return callback;
    }
    this.then = function(callback, errFn) {
        fn(this.resolveFn(callback), this.rejectFn(errFn));
    }
}

new MyPromise(function(resolve, reject) {
    setTimeout(function() {
        resolve(true)
    }, 1000)
}).then(function(data) {
    console.log(data);
}, function(data) {
    console.log(data);
})