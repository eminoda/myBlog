const events = require('events');
events.defaultMaxListeners = 1;
process.on('foo', () => {});
process.on('foo', () => {});
// process.on('warning', warning => {
// 	console.log(warning.name);
// 	console.log(warning.message);
// 	// console.log(warning.stack);
// });
