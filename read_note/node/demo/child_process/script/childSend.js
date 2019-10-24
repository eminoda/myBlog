setInterval(() => {
  console.log('console.log data');
  process.send("hello parent");
}, 1000);
