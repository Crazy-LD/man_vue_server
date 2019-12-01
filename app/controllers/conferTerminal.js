const ConferTerminal = require('../models/conferTerminal');
const { isInvalid } = require('../util/validate');

const add = async ctx => {
    let { code, name, ip, classifiedGrade } = ctx.request.body;
    if (isInvalid(code, name, ip, classifiedGrade)) {
        ctx.body = {
            code: 1,
            msg: '传入的参数无效'
        };
        return;
    }
    try {
        const tmepConferTerminal = await ConferTerminal.create({ code, name, ip, classifiedGrade });
        const conferTerminal = await ConferTerminal.findOne({ _id: tmepConferTerminal._id }).select('+statusName');
        ctx.body = {
            code: 0,
            data: conferTerminal
        };
    } catch (e) {
        console.log(e);
        ctx.body = {
            code: 1,
            msg: '该会议室终端终端已经存在'
        };
    }
};

const find = async ctx => {
    const { name } = ctx.query;
    let conferTerminals = [];
    let conferTerminalQuery = ConferTerminal.find();
    try {
        if (!isInvalid(name)) {
            const reg = new RegExp(name);
            conferTerminalQuery = conferTerminalQuery.find({ name: { $regex: reg } });
        }
        conferTerminals = await conferTerminalQuery;
    } catch (e) {
        ctx.code = {
            code: 1,
            msg: '请检查参数类型'
        };
        console.log(e);
    }
    if (conferTerminals.length > 0) {
        ctx.body = {
            bode: 0,
            data: conferTerminals
        };
    } else {
        ctx.body = {
            code: 1,
            msg: '该查询条件没有会议室终端终端存在'
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
        const updateConferTerminal = await ConferTerminal.updateMany({ _id: { $in: ids } }, { status });
        if (updateConferTerminal.nModified > 0) {
            ctx.body = {
                code: 0,
                data: {
                    count: updateConferTerminal.nModified
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

const update = async ctx => {
    let { _id, code, name, ip, classifiedGrade } = ctx.request.body;
    if (isInvalid(code, name, ip)) {
        ctx.body = {
            code: 1,
            msg: '传入的参数无效'
        };
        return;
    }
    try {
        const tempConferTerminal = await ConferTerminal.updateOne({ _id }, { code, name, ip, classifiedGrade });
        const conferTerminal = await ConferTerminal.findOne({ _id }).select('+statusName');
        console.log(tempConferTerminal);
        if (tempConferTerminal.nModified === 1) {
            ctx.body = {
                code: 0,
                data: conferTerminal
            };
        } else {
            ctx.body = {
                code: 1,
                msg: '修改会议室终端失败'
            };
        }
    } catch (e) {
        console.log(e);
        ctx.body = {
            code: 1,
            msg: '修改会议室终端失败'
        };
    }
};

module.exports = {
    add,
    find,
    batchChangeStatus,
    update
};