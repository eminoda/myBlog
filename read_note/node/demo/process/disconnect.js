const { fork } = require('child_process');
const child = fork('./childProcess.js', {
	stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
	detached: true
});

setTimeout(() => {
	child.disconnect();
}, 3000);

child.stdout.pipe(process.stdout);
