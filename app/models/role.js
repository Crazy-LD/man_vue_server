const mongoose = require('mongoose');
const { Schema } = mongoose;
const { statusDic } = require('./dictionary');


const roleSchema = new Schema({ // 角色
    code: {
        type: String,
        unique: true,
        require: true
    },
    name: {
        type: String,
        unique: true,
        require: true
    },
    status: {
        type: Number,
        enum: [0, 1, 2],
        default: 0
    },
    permissions: { // 存放当前角色的全部权限
        type: [Number],
        default: []
    }
}, { collection: 'role', versionKey: false, toJSON: { virtuals: true } });

roleSchema.virtual('statusName').get(function () {
    return statusDic[this.status];
});

module.exports = mongoose.model('role', roleSchema);