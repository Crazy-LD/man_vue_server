const { isInvalid } = require('../util/validate');
const Position = require('../models/position');

const find = async ctx => {
    const { name } = ctx.query;
    let positions = [];
    let positionQuery = Position.find();
    try {
        if (!isInvalid(name)) {
            const reg = new RegExp(name);
            positionQuery = positionQuery.find({ name: { $regex: reg } });
        }
        positions = await positionQuery;
    } catch (e) {
        ctx.code = {
            code: 1,
            msg: '请检查参数类型'
        };
        console.log(e);
    }
    if (positions.length > 0) {
        ctx.body = {
            bode: 0,
            data: positions
        };
    } else {
        ctx.body = {
            code: 1,
            msg: '该查询条件没有职位存在'
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
        const updatePositon = await Position.updateMany({ _id: { $in: ids } }, { status });
        if (updatePositon.nModified > 0) {
            ctx.body = {
                code: 0,
                data: {
                    count: updatePositon.nModified
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
    console.log(code, name);
    if (isInvalid(code, name)) {
        ctx.body = {
            code: 1,
            msg: '传入的参数无效'
        };
        return;
    }
    try {
        const tempPosition = await Position.create({ code, name });
        const position = await Position.findOne({ _id: tempPosition._id }).select('+statusName');
        ctx.body = {
            code: 0,
            data: position
        };
    } catch (e) {
        console.log(e);
        ctx.body = {
            code: 1,
            msg: '创建职位失败'
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
        const tempPosition = await Position.updateOne({ _id }, { code, name });
        const position = await Position.findOne({ _id }).select('+statusName');
        console.log(Position);
        if (tempPosition.nModified === 1) {
            ctx.body = {
                code: 0,
                data: position
            };
        } else {
            ctx.body = {
                code: 1,
                msg: '修改职位失败'
            };
        }
    } catch (e) {
        ctx.body = {
            code: 1,
            msg: '修改职位失败'
        };
    }
};

module.exports = {
    find,
    batchChangeStatus,
    add,
    update
};