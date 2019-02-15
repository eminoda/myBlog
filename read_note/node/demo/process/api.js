// setInterval(() => {
// 	console.log(123);
// }, 1000);

// exit
// process.abort();

// args
// node ./api.js --test=1 -test2=2 test3=3
// var args = process.argv;
// [ 'D:\\tool\\node\\install\\node.exe',
//   'e:\\github\\myBlog\\read_note\\node\\demo\\process\\api.js',
//   '--test=1',
//   '-test2=2',
//   'test3=3' ]
// console.log(args);
// console.log(process.argv0);

// cwd
console.log(process.cwd());

try {
	process.chdir('/github');
	console.log(process.cwd());
} catch (err) {
	console.log(err);
}
