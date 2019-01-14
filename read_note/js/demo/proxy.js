var handler = {
    get: function(target, name) {
        return target[name] || "not defined";
    },
    set: function(target, name, value) {
        target[name] = `proxy:${value}`;
    },
    has: function(target, name) {
        return name in target;
    },
    deleteProperty: function(target, name) {
        return !(name in target) ? false : delete target[name];
    }
};
var target = {
    name: "aaaa",
    nick: "abc"
};
var proxy = new Proxy(target, handler);
// get
console.log(`get:name:` + proxy.name); //aaaa
console.log(`get:age:` + proxy.age); //not defined
// set
proxy.age = 10;
console.log(`set:age:` + proxy.age); //proxy:10
// has
console.log("has:testHas:");
console.log("testHas" in proxy); // false
console.log("has:age:");
console.log("name" in proxy); // true
// deleteProperty
console.log("deleteProperty:age:" + delete proxy.age); //true
console.log("deleteProperty:age:" + delete proxy.age2); //false