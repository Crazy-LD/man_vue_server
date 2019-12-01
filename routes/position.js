const Router = require('koa-router');
const router = new Router();


const { find, batchChangeStatus, add, update } = require('../app/controllers/position');

router.get('/find', find);
router.post('/batchchangestatus', batchChangeStatus);
router.post('/add', add);
router.post('/update', update);


module.exports = router.routes();