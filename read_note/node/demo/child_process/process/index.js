// console.log(process.argv);
setInterval(() => {
	console.log('alive');
}, 1000);
process.once('SIGINT', function() {
	console.log('SIGINT');
});
// kill(3) Ctrl-\
process.once('SIGQUIT', function() {
	console.log('SIGQUIT');
});
// kill(15) default
process.once('SIGTERM', function() {
	console.log('SIGTERM');
});
