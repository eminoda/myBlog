function polyfillBind(fn, ctx) {
    function boundFn(a) {
        const l = arguments.length;
        return l ?
            l > 1 ?
            fn.apply(ctx, arguments) :
            fn.call(ctx, a) :
            fn.call(ctx)
    }

    boundFn._length = fn.length
    return boundFn
}

let bind = polyfillBind;

function User() {
    this.name = 'aaaa'
}

function say(nickname, age) {
    console.log(this.name);
}

var userSay = bind(say, new User());
userSay('abc', 123);