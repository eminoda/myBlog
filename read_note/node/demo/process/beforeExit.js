var count = 0;
process.on('beforeExit', exitCode => {
	console.log(`exitCode:${exitCode}`);
	// 异步，程序不会退出，继续触发 beforeExit
	setTimeout(() => {
		console.log(count++);
	}, 0);
});
// 由于异步操作，beforeExit 陷入循环，exit 不会被执行
process.on('exit', () => {
	console.log(88);
});
