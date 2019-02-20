const child_process = require('child_process');

const worker = child_process.fork('fork.js');

worker.on('message', msg => {
	console.log(msg);
});
