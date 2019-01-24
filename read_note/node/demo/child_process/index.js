// node module
const { spawn } = require('child_process');
const path = require('path');
const childprocess = require('child_process');
const cluster = require('cluster');
// spawn 子命令
// const cmd = spawn('node', ['./child.js', 'start', '--name=test'], {
// 	cwd: path.join(__dirname, 'cmd')
// });
// cmd.stdout.on('data', data => {
// 	console.log(`stdout: ${data}`);
// });
// cmd.stderr.on('data', data => {
// 	console.log(`stderr: ${data}`);
// });

// cmd.on('close', code => {
// 	console.log(`child process exited with code ${code}`);
// });

//
const forkCmd = childprocess.fork(`${__dirname}/child.js`, []);
forkCmd.on('message', message => {
	console.log({ message });
});
forkCmd.on('error', err => {
	console.log({ err });
});
forkCmd.once('exit', (code, signal) => {
	console.log({ event: 'exit', code, signal });
});
forkCmd.once('error', err => {
	console.log(err);
});
// spawn process bye,will emited
forkCmd.on('disconnect', function() {
	console.log('disconnect::forkCmd');
});

// spawn process bye,will emited
// forkCmd2.on('disconnect', function() {
// 	console.log('disconnect');
// });

cluster.setupMaster({
	exec: 'work.js',
	silent: false
});
cluster.fork();
cluster.fork();
// if (cluster.isMaster) {
// 	console.log(`Master ${process.pid} is running`);
// 	cluster.fork();
// }
cluster.on('fork', worker => {
	console.log(`fork::${worker.id}`);
});
cluster.on('message', (worker, message) => {
	console.log(`worker.id::${worker.id}::message::${JSON.stringify(message)}`);
});

cluster.on('exit', (code, signal) => {
	console.log({ event: 'exit', workerId: code.id, pId: code.process.pid });
});
