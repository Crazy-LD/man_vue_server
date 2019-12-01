const Router = require('koa-router');
const router = new Router();

const { add, getDepartOps, batchChangeStatus, update, find } = require('../app/controllers/department');
router.post('/add', add);
router.get('/getdepartops', getDepartOps);
router.post('/batchchangestatus', batchChangeStatus);
router.post('/update', update);
router.get('/find', find);
module.exports = router.routes();