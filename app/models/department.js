const mongoose = require('mongoose');
const { Schema } = mongoose;
const { statusDic } = require('./dictionary');
const departmentSchema = new Schema({ // 部门
    name: { // 名称
        type: String,
        unique:true
    },
    dateOfEstablishment: { // 成立时间
        type: Date,
        default: Date.now
    },
    responsibility: {
        type: String,
        default: ''
    }, // 职责
    introduce: {
        type: String,
        default: 0
    }, // 介绍
    pId: {
        type: Schema.Types.ObjectId,
        ref: 'department'
    }, // 父部门
    status: { // 状态
        type: Number,
        enum: [0, 1],
        default: 0
    }
}, { collection: 'department', versionKey: false, toJSON: { virtuals: true } }); // 一定要加上virtual，不然不会返回statusName  
// 绑定pre中间件只能在绑定model之前
departmentSchema.pre(/^find/, function () {
    this.populate({ path: 'pId', select: 'name' });
});

departmentSchema.post('save', function () {
    updateDepartmentOptions().then(data => {
        departmentOptions = data;
    });
});
let departmentModel = mongoose.model('department', departmentSchema);

const updateDepartmentOptions = async () => {
    const departments = await departmentModel.find({ pId: null });
    let departmentOptions = [];
    self(departments, departmentOptions);
    function self(departments, targetOptions) {
        departments.forEach(async item => {
            const tempOption = { value: item._id, label: item.name };
            targetOptions.push(tempOption);
            const tempDepartments = await departmentModel.find({ pId: item._id });
            if (tempDepartments.length !== 0) {
                tempOption.children = [];
                self(tempDepartments, tempOption.children);
            }
        });
    }
    return departmentOptions;
};

let departmentOptions = [];
updateDepartmentOptions().then(data => {
    departmentOptions = data;
});
// 注意async和一般函数的区别，该get中，不支持async，如果用async，则得到的是一个空的对象，而本来应该是一个promise对象
departmentSchema.virtual('statusName').get(function () {
    return statusDic[this.status];
});

departmentSchema.virtual('departmentOptions').get(function () {
    return departmentOptions;
});


module.exports = departmentModel;