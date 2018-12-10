var getHandler = {
    get: function get(target, key) {
        console.log("get called " + key);
        if (typeof key === 'string' && !(key in target)) {
            console.log(JSON.stringify(target) + ',' + key);
        }
        return target[key]
    }
};

var initProxy = function initProxy(vm) {
    return new Proxy(vm, getHandler);
};

var vm = {
    data: {
        name: 'aaaa'
    }
}
var proxy = initProxy(vm);

console.log(proxy.data);
// get called data
// { name: 'aaaa' }

console.log(proxy.data2);
// get called data2
// {"data":{"name":"aaaa"}},data2
// undefined