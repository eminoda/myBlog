const { spawn } = require("child_process");
const ps = spawn("ps", ["axff"]);
const grep = spawn("grep", ["pm2"]);

ps.stdout.on("data", data => {
  grep.stdin.write(data);
});
ps.on("close", code => {
  console.log("ps code", code);
  if (code !== 0) {
    console.log(`ps process exited with code ${code}`);
  }
  grep.stdin.end();
});

grep.stdout.on("data", data => {
  console.log("grep", "print data");
  console.log(data.toString());
});
grep.on("close", code => {
  console.log("grep code", code);
  if (code !== 0) {
    console.log(`grep process exited with code ${code}`);
  }
});

/**
 * ps code 0
 * grep print data
 * 28849 ?        Ssl    5:04 PM2 v3.2.2: God Daemon (/root/.pm2)
 * 28859 ?        Ssl    2:22  \_ node /root/.pm2/modules/pm2-intercom/node_modules/pm2-intercom/i
 * 31891 ?        Ssl    0:52  \_ node /root/.pm2/modules/pm2-logrotate/node_modules/pm2-logrotate
 *
 * grep code 0
 */
