const Router = require('koa-router');
const router = new Router();


const { find, batchChangeStatus, add, update, changePermissions } = require('../app/controllers/role');

router.get('/find', find);
router.post('/batchchangestatus', batchChangeStatus);
router.post('/add', add);
router.post('/update', update);
router.post('/changepermissions', changePermissions);

module.exports = router.routes();