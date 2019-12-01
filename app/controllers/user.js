const jwt = require('jsonwebtoken');
const svgCaptcha = require('svg-captcha');
const User = require('../models/user');
const Role = require('../models/role');
const { isInvalid, isArray } = require('../util/validate');
const passport = require('../util/passport');
const config = require('../../config');

const register = async (ctx, next) => {
    const { username, password } = ctx.request.body;
    if (isInvalid(username, password)) {
        ctx.body = {
            code: 1,
            msg: '缺少参数'
        };
        return;
    }
    const tryUser = await User.findOne({ username });
    if (tryUser !== null) {
        ctx.body = {
            code: 1,
            msg: '该用户名已经被注册'
        };
        return;
    }
    const hash = passport.encrypt(password, config.saltRounds);
    const commonRole = await Role.findOne({ code: 'common' });
    const user = await User.create({ username, hash, roleIds: [commonRole._id] });

    if (user !== null) {
        const payload = { username, time: new Date().getTime(), timeout: 1000 * 60 * 60 * 2, permissions: commonRole.permissions };
        const token = jwt.sign(payload, config.secret);
        ctx.body = {
            code: 0,
            data: {
                token
            }
        };
    } else {
        ctx.body = {
            code: 1,
            msg: '注册失败，请联系管理员'
        };
    }
};

const login = async (ctx, next) => {
    const { username, password, captcha } = ctx.request.body;
    console.log(ctx.session.captcha);
    if (isInvalid(username, password)) {
        ctx.body = {
            code: 1,
            msg: '缺少参数'
        };
        return;
    }
    if (captcha.toLowerCase() !== ctx.session.captcha) {
        ctx.body = {
            code: 1,
            msg: '验证码错误'
        };
        return;
    }
    const user = await User.findOne({ username });
    if (user !== null && passport.decrypt(password, user.hash)) {
        // 根据角色，用户，生成权限列表
        let plainPermissions = [];
        user.roleIds.forEach(item => {
            item.permissions.forEach(item => {
                plainPermissions.push(item);
            });
        });
        const permissions = Array.from(new Set(plainPermissions));
        const payload = { username, time: new Date().getTime(), timeout: 1000 * 60 * 60 * 2, permissions };
        const token = jwt.sign(payload, config.secret);
        ctx.body = {
            code: 0,
            data: {
                token
            }
        };
    } else {
        ctx.body = {
            code: 1,
            msg: '用户名或密码错误'
        };
    }
};

const getUserInfo = async (ctx, next) => {
    const { username } = ctx.request;
    const user = await User.findOne({ username }).select('-hash');
    if (user !== null) {
        ctx.body = {
            code: 0,
            data: {
                user,
                permissions: ctx.request.permissions
            }
        };
    } else {
        ctx.body = {
            code: 1,
            msg: '获取信息失败，请重新登录'
        };
    }
};

const reset = async (ctx, next) => {
    const { username } = ctx.request;
    const { oldPassword, password } = ctx.request.body;
    if (isInvalid(username, oldPassword, password)) {
        ctx.body = {
            code: 1,
            msg: '缺少参数'
        };
        return;
    }
    const user = await User.findOne({ username });
    if (passport.decrypt(oldPassword, user.hash)) {
        const updateUser = await User.updateOne({ username }, { hash: passport.encrypt(password, config.saltRounds) });
        if (updateUser.nModified === 1) {
            ctx.body = {
                code: 0
            };
        } else {
            ctx.body = {
                code: 1,
                msg: '修改密码失败'
            };
        }
    } else {
        ctx.body = {
            code: 1,
            msg: '密码错误'
        };
    }
};

const find = async ctx => {
    const { name, startTime, endTime } = ctx.query;
    let { departmentIds } = ctx.query;

    let users = [];
    let userQuery = User.find();
    try {
        if (!isInvalid(departmentIds)) {
            departmentIds = departmentIds.split(',');
            userQuery = userQuery.find({ departmentId: { $in: departmentIds } });
        }
        if (!isInvalid(startTime, endTime)) {
            userQuery = userQuery.find({ dateOfEstablishment: { $gte: start, $lte: end } });
        }

        if (!isInvalid(name)) {
            const reg = new RegExp(name);
            userQuery = userQuery.find({ name: { $regex: reg } });
        }
        users = await userQuery;
    } catch (e) {
        ctx.code = {
            code: 1,
            msg: '请检查参数类型'
        };
        console.log(e);
    }
    if (users.length > 0) {
        ctx.body = {
            bode: 0,
            data: users
        };
    } else {
        ctx.body = {
            code: 1,
            msg: '该查询条件没有用户存在'
        };
    }
};

const update = async ctx => {
    let { _id, name, sex, phone, email, entryTime, departmentId, positionId, roleIds } = ctx.request.body;
    if (isInvalid(name, entryTime, sex) || !isArray(roleIds) || roleIds.length === 0) {
        ctx.body = {
            code: 1,
            msg: '传入的参数无效'
        };
        return;
    }
    if (departmentId === '') {
        departmentId = null;
    }
    if (positionId === '') {
        positionId = null;
    }
    try {
        const tempUser = await User.updateOne({ _id }, { name, sex, phone, email, entryTime, departmentId, positionId, roleIds });
        const user = await User.findOne({ _id }).select('+statusName');
        if (tempUser.nModified === 1) {
            ctx.body = {
                code: 0,
                data: user
            };
        } else {
            ctx.body = {
                code: 1,
                msg: '修改人员失败'
            };
        }
    } catch (e) {
        console.log(e);
        ctx.body = {
            code: 1,
            msg: '修改人员失败'
        };
    }
};

const add = async ctx => {
    let { username, password, name, sex, phone, email, entryTime, departmentId, positionId, roleIds } = ctx.request.body;
    if (isInvalid(username, name, entryTime, sex) || !isArray(roleIds) || roleIds.length === 0) {
        ctx.body = {
            code: 1,
            msg: '传入的参数无效'
        };
        return;
    }
    if (departmentId === '') {
        departmentId = null;
    }
    if (positionId === '') {
        positionId = null;
    }
    try {
        const hash = passport.encrypt(password, config.saltRounds);
        const tempUser = await User.create({ username, hash, name, sex, phone, email, entryTime, departmentId, positionId, roleIds });
        const user = await User.findOne({ _id: tempUser._id }).select('+statusName');
        ctx.body = {
            code: 0,
            data: user
        };
    } catch (e) {
        console.log(e);
        ctx.body = {
            code: 1,
            msg: '创建角色失败'
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
        const updateUser = await User.updateMany({ _id: { $in: ids } }, { status });
        if (updateUser.nModified > 0) {
            ctx.body = {
                code: 0,
                data: {
                    count: updateUser.nModified
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

/* 获取图形验证码 */
const getCaptcha = async ctx => {
    const captcha = svgCaptcha.create({
        ignoreChars: '0o1l',
        noise: 2,
        color: true
    });
    ctx.session.captcha = captcha.text.toLowerCase();
    ctx.type = 'svg';
    ctx.body = captcha.data;
};

const changePermissions = async ctx => {
    const { _id, addPermissions, noPermissions } = ctx.request.body;
    if (isInvalid(addPermissions, noPermissions)) {
        ctx.body = {
            code: 1,
            msg: '传入的参数无效'
        };
        return;
    }
    try {
        const targetUser = await Uesr.findOne({ _id });
        const targetAdd = targetUser.addPermissions.cancat(addPermissions);
        const targetNo = targetUser.noPermissions.cancat(noPermissions);
        addPermissions.forEach(addPermission => {
            const index = targetNo.findIndex(addPermission);
            if (index > -1) {
                delete targetNo[index];
            }
        });
        noPermissions.forEach(noPermission => {
            const index = targetAdd.findIndex(noPermission);
            if (index > -1) {
                delete targetAdd[index];
            }
        });
        const tempUser = await User.updateOne({ _id }, { addPermissions: targetAdd, noPermissions: targetNo });
        const user = await User.findOne({ _id }).select('+statusName');
        if (tempUser.nModified > 0) {
            ctx.body = {
                code: 0,
                data: user
            };
        } else {
            ctx.body = {
                code: 1,
                msg: '修改权限失败'
            };
        }
    } catch (e) {
        console.log(e);
        ctx.body = {
            code: 1,
            msg: '修改权限失败，请检查参数'
        };
    }

};

module.exports = {
    register,
    login,
    getUserInfo,
    reset,
    find,
    update,
    add,
    batchChangeStatus,
    getCaptcha,
    changePermissions
};