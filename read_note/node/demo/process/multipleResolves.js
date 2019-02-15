process.on('multipleResolves', (type, promise, reason) => {
	console.error(type, promise, reason);
	setImmediate(() => process.exit(1));
});

async function main() {
	try {
		return await new Promise((resolve, reject) => {
			resolve('First call');
			resolve('Swallowed resolve');
			reject(new Error('Swallowed reject'));
		});
	} catch (err) {
		throw new Error('Failed');
	}
}

main().then(console.log);
// resolve: Promise { 'First call' } 'Swallowed resolve'
// reject: Promise { 'First call' } Error: Swallowed reject
//     at Promise (*)
//     at new Promise (<anonymous>)
//     at main (*)
// First call
