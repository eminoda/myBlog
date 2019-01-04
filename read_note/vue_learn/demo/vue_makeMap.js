function markMap(str, expectsLowerCase) {
	var map = Object.create(null);
	var list = str.split(",");
	for (var i = 0; i < list.length; i++) {
		map[list[i]] = true;
	}
	return expectsLowerCase
		? function(val) {
				return map[val.toLowerCase()];
		  }
		: val => map[val];
}
var isPlainTextElement = markMap("script,style", true);
console.log(isPlainTextElement("script"));
