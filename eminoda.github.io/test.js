var jwt = require('jsonwebtoken');
var test = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.MjEzNDEyMw.3OtlZ_6M3TKV9IEgesWYxdYZkoj9wDCS2SBw7RmZG8Y';

console.log(jwt.decode(test));