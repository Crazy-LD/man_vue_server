const Router = require('koa-router');
const router = new Router();


const { add, find, batchChangeStatus, update } = require('../app/controllers/conferRoom');

router.post('/add', add);
router.get('/find', find);
router.post('/batchchangestatus', batchChangeStatus);
router.post('/update', update);

module.exports = router.routes();