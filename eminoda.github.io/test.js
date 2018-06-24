var jwt = require('jsonwebtoken');
var test = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCwiLCJleHBpcmVzSW4iOiIxaCJ9.MjAxOC8wNi8yMy9ub3RlLWktd2lsbC1qb2ItaG9wcGluZy8.97berpDdQfxpBxpFymE7wsH2AUXvO4nDBwI9WaLufeY';

console.log(jwt.decode(test, 'hexo'));