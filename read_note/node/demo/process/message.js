const { fork } = require('child_process');
const child = fork('./childProcess.js', {
	stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
	detached: true
});

// 事件会一直 holding
child.on('message', msg => {
	console.log(msg);
});
