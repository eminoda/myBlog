const path = require('path');

// path.resolve
console.log('path.resolve', path.resolve('/test/foo/boo', '/test/a.js'));
console.log('path.resolve', path.resolve('/other/foo', '/test/a.js'));
console.log('path.resolve', path.resolve(__dirname, 'test/a.js'));

// path.relative
console.log('path.resolve', path.resolve('/test/foo/boo'));
console.log('path.resolve', path.resolve('/test/a.js'));
console.log('path.relative', path.relative('/test/foo/boo', '/test/a.js'));
console.log('path.resolve', path.resolve('/other/foo/boo'));
console.log('path.resolve', path.resolve('/test/a.js'));
console.log('path.relative', path.relative('/other/foo', '/test/a.js'));
console.log('path.relative', path.relative(__dirname, 'test/a.js'));

// posix & win32
console.log(path.posix.resolve('/test/foo'));
console.log(path.win32.resolve('/test/foo'));
console.log(path.resolve('/test/foo'));

// base api
console.log(path.basename('/test/foo', '.js'));
console.log(path.basename('/test/foo.html', '.html'));

console.log(process.env.path);

console.log(path.join('/foo', 'bar', 'baz/asdf', 'quux', '..'));
console.log(path.join('/foo', 'bar', 'baz/asdf', '/quux'));

console.log(path.normalize('C:////temp\\\\/\\/\\/foo/..\\bar/test/hello.js'));
console.log(path.parse('/foo/bar/test.js'));
console.log(path.parse('C:\\foo\\bar\\test.js'));
