process.on('uncaughtException', err => {
	console.log(err);
});

throw new Error('error');
