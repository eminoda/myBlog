var jwt = require('jsonwebtoken');

function buildJwt(payload, secretOrPrivateKey) {
    return jwt.sign(payload, secretOrPrivateKey, {
        // expiresIn: '1',
        // audience: 'audience',
        // issuer: 'issuer',
        // jwtid: 'jwtid',
        // subject: 'subject',
        // noTimestamp: false,
        header: {
            'typ': 'JWT',
            'alg': 'HS256'
        }
    });
}

hexo.extend.helper.register('jwt', function (payload) {
    return buildJwt(payload, 'hexo');
});

hexo.extend.generator.register('jwt2', function (locals) {
    console.log(locals.posts[0]);
    return 123;
})