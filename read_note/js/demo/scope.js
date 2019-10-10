function calc(data) {
  return Math.round((data / 1024 / 1024) * 100) / 100 + " MB";
}
function logger() {
  let mem = process.memoryUsage();
  console.log(new Date(), "memory now:", calc(mem.rss));
}
var theThing = null;
var replaceThing = function() {
  logger();
  var originalThing = theThing;
  var unused = function foo() {
    if (originalThing1) {
      console.log("未被调用，但 originalThing 有个 someMethod 的引用");
    }
  };
  theThing = {
    // longStr: new Array(1000000).join("*"),
    someMethod: function() {
      console.log("没做任何事情，但我是闭包");
    }
  };

  console.log("parse");
};
setInterval(replaceThing, 1000);
