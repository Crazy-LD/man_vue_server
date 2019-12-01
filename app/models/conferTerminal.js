const mongoose = require('mongoose');
const { Schema } = mongoose;
const { classifiedGradeDic, statusDic } = require('./dictionary');
const conferTerminalSchema = new Schema({ // 会议终端
    code: { // 会议室编号
        type: String,
        require: true
    },
    name: {
        type: String,
        require: true
    }, // 会议室名称
    ip: {
        type: String,
        validate: {
            validator(v) {
                return /^((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})(\.((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})){3}$/.test(v);
            },
            message: props => `${props.value} is not email`
        },
        require: true
    },
    classifiedGrade: {
        type: Number,
        enum: [0, 1, 2],
        default: 0
    },
    status: {
        type: Number,
        enum: [0, 1, 2],
        default: 0
    }
}, { collection: 'conferTerminal', versionKey: false, toJSON: { virtuals: true } });
conferTerminalSchema.virtual('statusName').get(function () {
    return statusDic[this.status];
});
conferTerminalSchema.virtual('classifiedGradeName').get(function () {
    return classifiedGradeDic[this.classifiedGrade];
});
module.exports = mongoose.model('conferTerminal', conferTerminalSchema);