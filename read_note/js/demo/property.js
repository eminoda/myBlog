var obj = {
	_name: 'abcd'
};
Object.defineProperty(obj, 'name', {
	configurable: true,
	writable: true, // error
	value: 'aaaa', // error
	get() {
		return this._name;
	}
});
// TypeError: Invalid property descriptor.
// Cannot both specify accessors and a value or writable attribute, #<Object>
console.log(obj.name);
