const Permission = require('../models/permission');

const getPermissionOps = async ctx => {
    const permissionOps = await Permission.findOne().select('permissionOptions');
    if (permissionOps) {
        ctx.body = {
            code: 0,
            data: permissionOps
        };
    } else {
        ctx.body = {
            code: 1,
            msg: '获取权限列表成功'
        };
    }
};

module.exports = {
    getPermissionOps
};