const path = require('path');

// 由共同路径开始，后者绝对路径，只输出绝对路径
// console.log(path.resolve('/test/foo/boo', '/test/a.js'));
// e:\test\a.js

// 不相干路径，后者绝对路径，只输出绝对路径
// console.log(path.resolve('/other/foo', '/test/a.js'));
// e:\test\a.js

// 相对路径
// console.log(path.resolve(__dirname, 'test/a.js'));
// e:\my_work\github\myBlog\read_note\node\demo\path\test\a.js



// console.log(path.relative('/test/foo/boo', '/test/a.js'));
// console.log(path.resolve('/test/foo/boo')); // e:\test\foo\boo
// console.log(path.resolve('/test/a.js')); // e:\test\a.js
// ..\..\a.js
// console.log(path.resolve('/other/foo/boo')) // e:\other\foo
// path.resolve('/test/a.js'); // e:\test\a.js
// 没有公共路径。
// let r = path.relative('/other/foo', '/test/a.js'); // ..\..\test\a.js
// console.log(r);

// ..\..\test\a.js
// console.log(path.resolve(__dirname, '/test/a.js'));
// ..\..\..\..\..\..\..\test\a.js
// console.log(path.relative(__dirname, 'test/a.js'));
// test\a.js

console.log(path.posix.resolve('/test/foo'));
console.log(path.resolve('/test/foo'));

console.log(path.basename('/test/foo', '.js'));
console.log(path.basename('/test/foo.html', '.html'));

console.log(path.win32.resolve('/test/foo'));