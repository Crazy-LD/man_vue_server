const mongoose = require('mongoose');
const { statusDic } = require('./dictionary');
const { Schema } = mongoose;

const userSchema = new Schema({ // 用户
    username: { // 用户名
        type: String,
        unique: true,
        require: true
    },
    hash: { // 加密后的密码
        type: String,
        require: true,
    },
    name: String, // 姓名
    status: { // 状态码,反射见statusDic
        type: Number,
        enum: [0, 1, 2],
        default: 0
    },
    sex: {
        type: String,
        enum: ['男', '女'],
        default: '男'
    },
    email: { // 邮箱
        type: String,
        validate: {
            validator(v) {
                return /^([A-Za-z0-9_\-\.\u4e00-\u9fa5])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,8})$/.test(v);
            },
            message: props => `${props.value} is not a valid phone number`
        }
    },
    phone: { // 手机
        type: String,
        validate: {
            validator(v) {
                return /^1\d{10}/.test(v);
            },
            message: props => `${props.value} is not a phone`
        }
    },
    entryTime: {
        type: Date,
        default: Date.now
    }, // 入职的时间
    departmentId: {
        type: Schema.Types.ObjectId,
        ref: 'department'
    }, // 所属部门的id
    positionId: {
        type: Schema.Types.ObjectId,
        ref: 'position'
    }, // 所属职位的id
    classifiedGradeId: {
        type: Number,
        enum: [0, 1, 2],
        default: 0
    }, // 密级的id
    roleIds: [{
        type: Schema.Types.ObjectId,
        ref: 'role'
    }], // 所有的角色的id
    addPermissions: {
        type: [Number],
        default: []
    },
    noPermissions: {
        type: [Number],
        default: []
    }

}, { collection: 'user', versionKey: false, toJSON: { virtuals: true } });

userSchema.pre(/^find/, function () {
    this.populate('roleIds').populate('positionId').populate('departmentId');
});

userSchema.virtual('statusName').get(function () {
    return statusDic[this.status];
});

userSchema.virtual('permissions').get(function () {
    const rolePermissions = this.roleIds.map(role => role.permissions);
    const flatPermissions = rolePermissions[0];
    this.addPermissions.forEach(item => {
        flatPermissions.push(item);
    });
    return flatPermissions.filter(item => !this.noPermissions.includes(item));
});

module.exports = mongoose.model('user', userSchema);
