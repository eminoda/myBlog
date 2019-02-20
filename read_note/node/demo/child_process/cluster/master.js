const cluster = require('cluster');
const http = require('http');
const numCPUs = require('os').cpus().length;
const fs = require('fs');

process.once('SIGINT', () => {
	fs.writeFile('./text.txt', 'master is called');
	console.log('SIGINT');
});
cluster.setupMaster({
	exec: 'worker.js',
	args: ['--test', 'test1'],
	silent: false
});
if (cluster.isMaster) {
	for (let i = 0; i < numCPUs; i++) {
		cluster.fork();
	}
}
cluster.on('fork', worker => {
	console.log('fork::' + worker.process.pid);
});
cluster.on('message', (worker, message, handle) => {
	console.log('pid::%s ' + message, worker.process.pid);
});
cluster.on('exit', (worker, code, signal) => {
	console.log('exit');
});
