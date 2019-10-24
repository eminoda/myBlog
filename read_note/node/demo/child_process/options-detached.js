const { spawn } = require("child_process");
const fs = require("fs");

// process.argv[0]: node program exe
const subProcess = spawn(process.argv[0], ["./script/say.js"], {
  detached: true,
  stdio: ["ignore", fs.openSync("./script/out.log", "a"), fs.openSync("./script/out.log", "a")]
  // stdio: 'ignore'
});

// 看下 子进程 输出些什么
// subProcess.stdout.on("data", data => {
//   console.log(`subProcess:`, `${data}`);
// });

// subProcess.unref();
