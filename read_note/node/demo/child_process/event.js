const { spawn } = require("child_process");

const nodeCommond = spawn("node", ["./script/say.js"], {
  stdio: [null, null, null, "ipc"]
});

nodeCommond.stdout.on("data", data => {
  console.log(`stdout: ${data}`); // v8.9.0
});
nodeCommond.on("close", code => {
  console.log("close");
});
nodeCommond.on("disconnect", code => {
  console.log("disconnect");
});
nodeCommond.on("message", code => {
  console.log("message");
});
nodeCommond.on("error", code => {
  console.log("error");
});
nodeCommond.on("exit", code => {
  console.log("exit");
});

