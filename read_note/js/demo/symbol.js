let NAME = Symbol('NAME');
let AGE = Symbol('AGE');

let test = {
	name: 'aaaa'
};

test[NAME] = 'bbbb';
test[AGE] = 123;

console.log(test); //{ name: 'aaaa', [Symbol(NAME)]: 'bbbb', [Symbol(AGE)]: 123 }
console.log(test[NAME]); //bbbb

// var instance = new Symbol();

// console.log(NAME.description);
