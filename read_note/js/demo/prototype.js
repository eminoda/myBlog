function User() {
	this.nickName = 'aaaa';
}
User.prototype.name = 'abcd';

const userInstance = new User();

// isPrototypeOf
console.log(User.prototype.isPrototypeOf(userInstance));

// hasOwnProperty
console.log(userInstance.hasOwnProperty('name')); // false
console.log(userInstance.hasOwnProperty('nickName')); // true

// in
console.log('name' in userInstance); // true
console.log('nickName' in userInstance); // true

// Object.keys
console.log(Object.keys(userInstance)); // [ 'nickName' ]
