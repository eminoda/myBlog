const { spawn } = require("child_process");

const nodeCommond = spawn("node", ["-v"]);

nodeCommond.stdout.on("data", data => {
  console.log(`stdout: ${data}`); // v8.9.0
});

nodeCommond.on("close", code => {
  console.log(`child process exited with code ${code}`); // child process exited with code 0
});
