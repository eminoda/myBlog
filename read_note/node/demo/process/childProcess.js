process.on('disconnect', () => {
	console.log('child process is disconnected');
});
process.send({ from: 'child', data: 'hello message' });
