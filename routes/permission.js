const Router = require('koa-router');
const router = new Router();

const { getPermissionOps } = require('../app/controllers/permission');
router.get('/getpermissionops', getPermissionOps);

module.exports = router.routes();