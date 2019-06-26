const data = {
  name: 'abc'
};
const vm = {
  say: function() {
    console.log('vm say');
  }
};

Object.defineProperty(data, '__ob__', {
  value: vm,
  enumerable: false,
  writable: false,
  configurable: true
});

data['__ob__'].say();
