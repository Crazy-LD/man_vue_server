const mongoose = require('mongoose');
const { Schema } = mongoose;
const { statusDic, classifiedGradeDic } = require('./dictionary');

const conferRoomSchema = new Schema({ // 会议室
    code: { // 会议室编号
        type: String,
        unique: true,
        require: true
    },
    name: { // 名称
        type: String,
        require: true
    },
    capacity: {
        type: Number,
        require: true
    }, // 容纳人数
    introduce: {
        type: String,
        default: ''
    }, // 介绍
    status: { // 状态
        type: Number,
        enum: [0, 1, 2],
        default: 0
    },
    classifiedGrade: {
        type: Number,
        enum: [0, 1, 2],
        default: 0
    },
}, { collection: 'conferRoom', versionKey: false, toJSON: { virtuals: true } });
conferRoomSchema.virtual('statusName').get(function () {
    return statusDic[this.status];
});
conferRoomSchema.virtual('classifiedGradeName').get(function () {
    return classifiedGradeDic[this.classifiedGrade];
});
module.exports = mongoose.model('conferRoom', conferRoomSchema);