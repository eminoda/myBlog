const childprocess = require('child_process');
const sendmessage = require('sendmessage');
console.log('child.js called');

// post data to forkProcess
var i = 0;
setInterval(() => {
	// process.send({
	// 	data: 'test::' + i++,
	// 	from: 'child',
	// 	to: 'parent'
	// });
	sendmessage(process, {
		data: 'test::' + i++,
		from: 'child',
		to: 'parent'
	});
}, 1000);

process.on('beforeExit', function() {
	process.send({
		data: 'beforeExit',
		from: 'child',
		to: 'parent'
	});
});

process.on('disconnect', function() {
	process.send({
		data: 'disconnect',
		from: 'child',
		to: 'parent'
	});
});
setTimeout(() => {
	process.exit();
}, 5000);

process.on('uncaughtException', err => {
	process.send({
		data: 'uncaughtException::pid::' + process.pid,
		from: 'child',
		to: 'parent'
	});
	// throw new Error('eee');
});
throw new Error('123');
