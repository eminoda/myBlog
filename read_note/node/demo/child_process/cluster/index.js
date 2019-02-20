const cp = require('child_process');
var child = cp.spawn('node', ['master.js'], {
	stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
	detached: true
});
child.on('message', msg => {
	console.log(msg);
});
process.once('SIGINT', () => {
	console.log('SIGINT');
	process.exit(0);
});
process.once('exit', () => {
	console.log(123);
	child.kill('SIGINT');
});
