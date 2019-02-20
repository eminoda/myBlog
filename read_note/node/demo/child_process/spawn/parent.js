const { spawn } = require('child_process');
const fs = require('fs');

const spawnCmd = spawn('node', ['child.js'], {
	detached: false,
	stdio: ['pipe', 'pipe', 'pipe', 'ipc']
}); // return ChildProcess

spawnCmd.stdout.on('data', data => {
	console.log('stdout::' + data);
});

spawnCmd.stderr.on('data', data => {
	console.log('stderr::' + data);
});

spawnCmd.on('message', msg => {
	console.log('message::' + msg);
});
spawnCmd.on('close', (code, signal) => {
	console.log(`close::code::${code},signal::${signal}`);
});
spawnCmd.on('exit', (code, signal) => {
	console.log(`exit::code::${code},signal::${signal}`);
});
spawnCmd.on('disconnect', msg => {
	console.log('disconnect::' + msg);
	// process.kill();
});

setTimeout(() => {
	spawnCmd.kill('SIGTERM');
}, 3000);
