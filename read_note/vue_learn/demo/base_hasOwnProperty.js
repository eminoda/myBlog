var hasOwnProperty = Object.prototype.hasOwnProperty;

function hasOwn(obj, key) {
    return hasOwnProperty.call(obj, key)
}

function User() {
    this.name = 'aaaa'
}
User.prototype.nickName = 'a'

var user = new User();
console.log(hasOwn(user, 'name')) //true
console.log(hasOwn(user, 'nickName')) //false