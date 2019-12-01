const { isInvalid } = require('../util/validate');
const Role = require('../models/role');

const find = async ctx => {
    const { name } = ctx.query;
    let roles = [];
    let roleQuery = Role.find();
    try {
        if (!isInvalid(name)) {
            const reg = new RegExp(name);
            roleQuery = roleQuery.find({ name: { $regex: reg } });
        }
        roles = await roleQuery;
    } catch (e) {
        ctx.code = {
            code: 1,
            msg: '请检查参数类型'
        };
        console.log(e);
    }
    if (roles.length > 0) {
        ctx.body = {
            bode: 0,
            data: roles
        };
    } else {
        ctx.body = {
            code: 1,
            msg: '该查询条件没有角色存在'
        };
    }
};

const batchChangeStatus = async ctx => {
    let { ids, status } = ctx.request.body;
    if (isInvalid(ids, status)) {
        ctx.body = {
            code: 1,
            msg: '传入的参数无效'
        };
        return;
    }
    try {
        const updateRole = await Role.updateMany({ _id: { $in: ids } }, { status });
        if (updateRole.nModified > 0) {
            ctx.body = {
                code: 0,
                data: {
                    count: updateRole.nModified
                }
            };
        } else {
            ctx.body = {
                code: 1,
                msg: '没有修改数据'
            };
        }
    } catch (e) {
        console.log(e);
        ctx.body = {
            code: 1,
            msg: '修改数据失败'
        };
    }
};

const add = async ctx => {
    let { code, name } = ctx.request.body;
    if (isInvalid(code, name)) {
        ctx.body = {
            code: 1,
            msg: '传入的参数无效'
        };
        return;
    }
    try {
        const tempRole = await Role.create({ code, name });
        const role = await Role.findOne({ _id: tempRole._id }).select('+statusName');
        ctx.body = {
            code: 0,
            data: role
        };
    } catch (e) {
        console.log(e);
        ctx.body = {
            code: 1,
            msg: '创建角色失败'
        };
    }
};

const update = async ctx => {
    let { _id, code, name } = ctx.request.body;
    if (isInvalid(code, name)) {
        ctx.body = {
            code: 1,
            msg: '传入的参数无效'
        };
        return;
    }
    try {
        const tempRole = await Role.updateOne({ _id }, { code, name });
        const role = await Role.findOne({ _id }).select('+statusName');
        if (tempRole.nModified === 1) {
            ctx.body = {
                code: 0,
                data: role
            };
        } else {
            ctx.body = {
                code: 1,
                msg: '修改角色失败'
            };
        }
    } catch (e) {
        ctx.body = {
            code: 1,
            msg: '修改角色失败'
        };
    }
};

const changePermissions = async ctx => {
    const { _id, permissions } = ctx.request.body;
    if (isInvalid(_id, permissions)) {
        ctx.body = {
            code: 1,
            msg: '传入的参数无效'
        };
        return;
    }
    try {
        const tempRole = await Role.updateOne({ _id }, { permissions });
        const role = await Role.findOne({ _id }).select('+statusName');
        if (tempRole.nModified === 1) {
            ctx.body = {
                code: 0,
                data: role
            };
        } else {
            ctx.body = {
                code: 1,
                msg: '修改权限失败,不存在该角色'
            };
        }
    } catch (e) {
        console.log(e);
        ctx.body = {
            code: 1,
            msg: '修改权限失败，请检查参数是否正确'
        };
    }
};

module.exports = {
    find,
    batchChangeStatus,
    add,
    update,
    changePermissions
};