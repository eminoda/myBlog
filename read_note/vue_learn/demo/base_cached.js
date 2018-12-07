function cached(fn) {
    console.log('create cache space');
    var cache = Object.create(null);
    return (function cachedFn(str) {
        var hit = cache[str];
        console.log(`cache=${JSON.stringify(cache)}`);
        console.log('hit?' + hit);
        return hit || (cache[str] = fn(str))
    })
}
var fn = function(str) {
    console.log(`fn called::str=${str}`);
    return str.toUpperCase();
}
var cacheFn = cached(fn); // create cache space
// cache={}
// hit?undefined
// fn called::str=123
cacheFn('123');
// cache={"123":"123"}
// hit?123
cacheFn('123')