process.on('exit', exitCode => {
	setTimeout(() => {
		console.log('88'); // no print
	}, 0);
});
