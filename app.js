const Koa = require('koa');
const config = require('./config');
const cors = require('koa2-cors');
const bodyParser = require('koa-bodyparser');
const Router = require('koa-router');
const session = require('koa-session');
const checkToken = require('./app/middleware/checkToken');


const app = new Koa();
const router = new Router();

// 连接数据库及初始化数据
require('./initDatabase')();

app.keys = [config.secret];

const CONFIG = {
    key: 'koa:sess',
    maxAge: 1000 * 60,
    autoCommit: true,
    overwrite: true,
    httpOnly: true,
    signed: true,
    rolling: false,
    renew: false,
};

// 使用中间件
app.use(cors({
    credentials: true
}));

app.use(session(CONFIG, app));
app.use(bodyParser());
app.use(checkToken);
// 使用模块路由
router.use('/user', require('./routes/user'));
router.use('/department', require('./routes/department'));
router.use('/role', require('./routes/role'));
router.use('/position', require('./routes/position'));
router.use('/conferroom', require('./routes/conferRoom'));
router.use('/conferTerminal', require('./routes/conferTerminal'));
router.use('/permission', require('./routes/permission'));
// 使用路由
app.use(router.routes()).use(router.allowedMethods());
app.listen(config.port);

