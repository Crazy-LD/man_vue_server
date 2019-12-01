const ConferRoom = require('../models/conferRoom');
const { isInvalid } = require('../util/validate');

const add = async ctx => {
    let { code, name, capacity, introduce, classifiedGrade } = ctx.request.body;
    if (isInvalid(code, name)) {
        ctx.body = {
            code: 1,
            msg: '传入的参数无效'
        };
        return;
    }
    if (capacity === '') {
        capacity = 0;
    }

    try {
        const tmepConferRoom = await ConferRoom.create({ code, name, capacity, introduce, classifiedGrade });
        const conferroom = await ConferRoom.findOne({ _id: tmepConferRoom._id }).select('+statusName');
        ctx.body = {
            code: 0,
            data: conferroom
        };
    } catch (e) {
        console.log(e);
        ctx.body = {
            code: 1,
            msg: '该会议室已经存在'
        };
    }
};

const find = async ctx => {
    const { name, startNumber, endNumber } = ctx.query;
    let conferRooms = [];
    let conferRoomQuery = ConferRoom.find();
    try {
        if (!isInvalid(name)) {
            const reg = new RegExp(name);
            conferRoomQuery = conferRoomQuery.find({ name: { $regex: reg } });
        }
        if (!isInvalid(startNumber)) {
            conferRoomQuery = conferRoomQuery.where('capacity').gte(startNumber);
        }
        if (!isInvalid(endNumber)) {
            conferRoomQuery = conferRoomQuery.where('capacity').lte(endNumber);
        }
        conferRooms = await conferRoomQuery;
    } catch (e) {
        ctx.code = {
            code: 1,
            msg: '请检查参数类型'
        };
        console.log(e);
    }
    if (conferRooms.length > 0) {
        ctx.body = {
            bode: 0,
            data: conferRooms
        };
    } else {
        ctx.body = {
            code: 1,
            msg: '该查询条件没有会议室存在'
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
        const updateConferRoom = await ConferRoom.updateMany({ _id: { $in: ids } }, { status });
        if (updateConferRoom.nModified > 0) {
            ctx.body = {
                code: 0,
                data: {
                    count: updateConferRoom.nModified
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
    let { _id, code, name, capacity, introduce, classifiedGrade } = ctx.request.body;
    if (isInvalid(code, name)) {
        ctx.body = {
            code: 1,
            msg: '传入的参数无效'
        };
        return;
    }
    if (capacity === '') {
        capacity = 0;
    }
    try {
        const tempConferRoom = await ConferRoom.updateOne({ _id }, { code, name, capacity, introduce, classifiedGrade });
        const conferRoom = await ConferRoom.findOne({ _id }).select('+statusName');
        console.log(ConferRoom);
        if (tempConferRoom.nModified === 1) {
            ctx.body = {
                code: 0,
                data: conferRoom
            };
        } else {
            ctx.body = {
                code: 1,
                msg: '修改会议室失败'
            };
        }
    } catch (e) {
        console.log(e);
        ctx.body = {
            code: 1,
            msg: '修改会议室失败'
        };
    }
};

module.exports = {
    add,
    find,
    batchChangeStatus,
    update
};