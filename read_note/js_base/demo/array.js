var arr = [2, 3, 4, 9, 6, 7];
// 从索引2开始
console.log(arr.slice(2)); //[ 4, 9, 6, 7 ];
// 原数组不变
console.log(arr); //[ 2, 3, 4, 9, 6, 7 ]

// 结束索引为负数，倒序获取
console.log(arr.slice(1, -3)); //[ 3, 4 ]
console.log(arr.slice(3, -3)); //[]

var objArr = [{
    name: 'aaa'
}, {
    name: 'bbb'
}]

var newObjArr = objArr.slice(); //copy
newObjArr[1].name = 'ccc';

console.log(objArr); //[ { name: 'aaa' }, { name: 'ccc' } ]

var popArr = [1, 2, 3, 4, 5, 6];

popArr.pop();

console.log(popArr); //[ 1, 2, 3, 4, 5 ]

popArr.push(7);

console.log(popArr); //[ 1, 2, 3, 4, 5, 7 ]