// splice
var arr = [2, 3, 4, 1];
// 删除
console.log(arr.splice(2, 1)); //[4]
console.log(arr); //[ 2, 3, 1 ]
console.log(arr.splice(2, 2)); //[1]
console.log(arr); //[ 2, 3 ]
// 非法
console.log(arr.splice(2, 'sf')); //[]
console.log(arr); //[ 2, 3 ]
// 非法
console.log(arr.splice(2, -1)); //[]
console.log(arr); //[ 2, 3 ]

// 添加
arr = [2, 3, 4, 1];
arr.splice(1, 0, 'a', 'b');
console.log(arr); //[ 2, 'a', 'b', 3, 4, 1 ]

// vue 移除元素
function remove(arr, item) {
    if (arr.length) {
        var index = arr.indexOf(item);
        if (index > -1) {
            return arr.splice(index, 1)
        }
    }
}
console.log(remove(arr, 'a')); //[ 'a' ]
console.log(arr); //[ 2, 'b', 3, 4, 1 ]