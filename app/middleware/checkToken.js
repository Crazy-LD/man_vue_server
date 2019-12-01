const jwt = require('jsonwebtoken');
const config = require('../../config');
async function checkToken(ctx, next) {
    const whiteList = ['/user/login', '/user/register', '/user/getcaptcha'];
    if (whiteList.some(item => ctx.request.url.indexOf(item) > -1)) {
        await next();
    } else {
        const token = ctx.request.headers['x-token'];
        let decoded = null;
        try {
            decoded = jwt.verify(token, config.secret);
        } catch (e) {
            ctx.body = {
                code: 1,
                msg: e.message
            };
            return;
        }
        const { time, timeout, username, permissions } = decoded;
        if (Date.now() - time < timeout) {
            ctx.request.username = username; // 将username解析到request对象中
            ctx.request.permissions = permissions;
            await next();
        } else {
            ctx.body = {
                code: 50014,
                msg: 'token过期'
            };
        }
    }
}

module.exports = checkToken;