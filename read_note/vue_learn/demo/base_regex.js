var camelizeRE = /-(\w)/g;
var camelize = function(str) {
    return str.replace(camelizeRE, function(_, c) {
        return c ? c.toUpperCase() : '';
    })
}

var str = 'app-list';
var str2 = 'app-List';
var str3 = 'app-List_item';

// 全局模式要注意的点
console.log(camelizeRE.test(str)); //true
console.log(camelizeRE.lastIndex); //5
camelizeRE.lastIndex = 0
console.log(camelizeRE.test(str2)); //false
camelizeRE.lastIndex = 0
console.log(camelizeRE.test(str3)); //true

console.log(camelize(str)); //appList
console.log(camelize(str2)); //appList
console.log(camelize(str3)); //appList_item