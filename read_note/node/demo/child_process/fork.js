const { fork } = require("child_process");

const child = fork("./script/childSend", {});

child.on("message", data => {
  console.log(data);
});
