const { execFile } = require("child_process");

// linux
// const linuxProcess = execFile("./script/say.sh",{ shell: true }, (err, stdout, stderr) => {
//   console.log(err, stdout, stderr);
// });

// window
const winProcess = execFile("say.bat", { shell: true, cwd: "./script" }, (err, stdout, stderr) => {
  console.log(err, stdout, stderr);
});
