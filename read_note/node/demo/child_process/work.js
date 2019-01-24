process.send({
	action: `i am ${process.pid}`,
	from: 'work',
	to: 'master'
});

setTimeout(function() {
	process.send({
		action: `work 88 ${process.pid}`,
		from: 'work',
		to: 'master'
	});
	process.exit(1);
}, 3000);
