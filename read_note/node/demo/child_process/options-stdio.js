const { spawn } = require("child_process");

console.log("i am parent");

// child process data 打印在 parent process 控台上
// const childProcess = spawn("node", ["-v"], { stdio: "inherit" });

// 这样 childPipe 有了自己的 stdio 管道
// const childProcess = spawn("node", ["-v"], { stdio: "pipe" });

// const childProcess = spawn("node", ["-v"], { stdio: "ignore" });

const childProcess = spawn("node", ["./script/childSend.js"], {
  stdio: ["pipe",null,"pipe","ipc"]
});

childProcess.on("message", data => {
  console.log(`from child`, data);
});

childProcess.stdout.on("data", data => {
  console.log(`stdout: ${data}`); // v8.9.0
});
