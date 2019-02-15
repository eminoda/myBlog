let condition = true;
let promiseFn = () => {
	return new Promise((resolve, reject) => {
		if (condition) {
			condition = !condition;
			resolve(true);
		} else {
			reject(false);
		}
	});
};
promiseFn().then(data => {
	console.log(data);
	return promiseFn();
});
process.on('unhandledRejection', (reason, p) => {
	console.log('Unhandled Rejection at:', p, 'reason:', reason);
	p.catch(err => {});
});
process.on('rejectionHandled', reason => {
	console.log('rejectionHandled called');
	console.log(reason);
});
