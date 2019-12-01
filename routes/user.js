const Router = require('koa-router');
const router = new Router();


const { register, login, getUserInfo, reset, find, update, add, batchChangeStatus, getCaptcha, changePermissions } = require('../app/controllers/user');

router.post('/register', register);
router.post('/login', login);
router.post('/reset', reset);
router.get('/getuserinfo', getUserInfo);
router.get('/find', find);
router.post('/update', update);
router.post('/add', add);
router.post('/batchchangestatus', batchChangeStatus);
router.get('/getcaptcha', getCaptcha);
router.post('/changepermissions', changePermissions);


module.exports = router.routes();