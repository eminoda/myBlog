let count = 1;
let timer = setInterval(() => {
	// console.log('from child::' + count++);
	process.send('from child::' + count++);
	if (timer && count == 5) {
		// process.disconnect();
	}
	if (timer && count == 10) {
		clearInterval(timer);
	}
}, 1 * 1000);
