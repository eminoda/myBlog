const { exec } = require("child_process");

const nodeProcess = exec("node -v", (err, stdout, stderr) => {
  console.log(err, stdout, stderr);
});
