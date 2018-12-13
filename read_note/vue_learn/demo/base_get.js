var config = {
    version: '0.0.1',
    performance: false
}
var configDef = {}
configDef.get = function() {
    return config;
}
// 定义对象
var user = {};
// 挂在一个config属性，并具备getter能力
Object.defineProperty(user, 'config', configDef);

console.log(user.config); //{version: "0.0.1", performance: false}