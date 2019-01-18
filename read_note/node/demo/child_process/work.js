process.send({
	action: `i am ${process.pid}`,
	from: 'work',
	to: 'master'
});

process.on('exit', function(code) {
	console.log('work disconnect::' + code);
});

// process.exit(1);
