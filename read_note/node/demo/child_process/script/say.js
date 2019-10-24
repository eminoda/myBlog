let count = 0;
let timer = setInterval(() => {
  count = count + 1;
  console.log(`${new Date()}`, " say data", `count=${count}`);

  if (count == 1) {
    process.send("message");
  }
  if (count == 5) {
    process.disconnect();
  }
  if (count == 10) {
    precess.kill("SIGHUP");
    // clearInterval(timer);
  }
}, 1000);
