// var endTag = /^<\/((?:[a-zA-Z_][\w\-\.]*\:)?[a-zA-Z_][\w\-\.]*)[^>]*>/;
// var html = "</div>";
// var endTagMatch = html.match(endTag);
// // [ '</div>', 'div', index: 0, input: '</div>' ]
// console.log(endTagMatch);

const ncname = "[a-zA-Z_][\\w\\-\\.]*";
const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
const startTagOpen = new RegExp(`^<${qnameCapture}`);
// var startTagOpen = new RegExp(`^<((?:[a-zA-Z_][\\w\\-\\.]*\\:)?[a-zA-Z_][\\w\\-\\.]*)`);
// [ '<div', 'div', index: 0, input: '<div>123</div>' ]
console.log("<div>123</div>".match(startTagOpen));
