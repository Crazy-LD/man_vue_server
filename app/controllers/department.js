const Department = require('../models/department');
const { isInvalid } = require('../util/validate');
const { statusDic } = require('../models/dictionary');

const add = async ctx => {
    let { name, dateOfEstablishment, responsibility, introduce, pId } = ctx.request.body;
    if (isInvalid(name, dateOfEstablishment)) {
        ctx.body = {
            code: 1,
            msg: '传入的参数无效'
        };
        return;
    }
    if (pId === '') {
        pId = null;
    }
    try {
        const tmepDepartment = await Department.create({ name, dateOfEstablishment, responsibility, introduce, pId });
        const department = await Department.findOne({ _id: tmepDepartment._id }).select('+statusName');
        const departmentOpt = await Department.findOne().select('departmentOptions');
        ctx.body = {
            code: 0,
            data: {
                department,
                departmentOpt
            }
        };
    } catch (e) {
        console.log(e);
        ctx.body = {
            code: 1,
            msg: '该部门已经存在'
        };
    }
};

// 这种方案，打印的时候没有departmentOptions,但是前端接受到的数据却存在
// const getAll = async ctx => {
//     // const departments = Department.find().select('-departmentOptions');
//     // const departments = query.select('-departmentOptions').exec();
//     const departments = await Department.find();
//     if (departments.length > 0) {
//         ctx.body = {
//             bode: 0,
//             data: departments
//         };
//     } else {
//         ctx.body = {
//             code: 1,
//             msg: '查询失败'
//         };
//     }
// };

const getDepartOps = async ctx => {
    const departOps = await Department.findOne().select('departmentOptions');
    if (departOps) {
        ctx.body = {
            code: 0,
            data: departOps
        };
    } else {
        ctx.body = {
            code: 1,
            msg: '获取部门选项失败'
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
        const updateDepart = await Department.updateMany({ _id: { $in: ids } }, { status });
        if (updateDepart.nModified > 0) {
            ctx.body = {
                code: 0,
                data: {
                    count: updateDepart.nModified
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
    let { _id, name, dateOfEstablishment, responsibility, introduce, pId } = ctx.request.body;
    if (isInvalid(_id, name, dateOfEstablishment)) {
        ctx.body = {
            code: 1,
            msg: '传入的参数无效'
        };
        return;
    }
    if (pId === '') {
        pId = null;
    }
    try {
        const tempDepartment = await Department.updateOne({ _id }, { name, dateOfEstablishment, responsibility, introduce, pId });
        const department = await Department.findOne({ _id }).select('+statusName');
        const departmentOpt = await Department.findOne().select('departmentOptions');
        if (tempDepartment.nModified === 1) {
            ctx.body = {
                code: 0,
                data: {
                    departmentOpt,
                    department
                }
            };
        } else {
            ctx.body = {
                code: 1,
                msg: '修改部门失败'
            };
        }
    } catch (e) {
        ctx.body = {
            code: 1,
            msg: '该部门已经存在'
        };
    }
};

const find = async ctx => {
    const { startTime, endTime } = ctx.query;
    let { ids } = ctx.query;
    console.log(ids, startTime, endTime);

    let departments = [];
    let departmentQuery = Department.find();
    try {

        if (!isInvalid(ids)) {
            ids = ids.split(',');
            departmentQuery = departmentQuery.find({ _id: { $in: ids } });
        }
        if (!isInvalid(startTime, endTime)) {
            departmentQuery = departmentQuery.find({ dateOfEstablishment: { $gte: start, $lte: end } });
        }
        departments = await departmentQuery;
    } catch (e) {
        ctx.code = {
            code: 1,
            msg: '请检查参数类型'
        };
        console.log(e);
    }
    if (departments.length > 0) {
        ctx.body = {
            bode: 0,
            data: departments
        };
    } else {
        ctx.body = {
            code: 1,
            msg: '该查询条件没有部门存在'
        };
    }
};
module.exports = {
    add,
    getDepartOps,
    batchChangeStatus,
    update,
    find
};