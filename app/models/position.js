const mongoose = require('mongoose');
const { Schema } = mongoose;
const { statusDic } = require('./dictionary');

const positionSchema = new Schema({ // 职位
    code: { // 编码
        type: String,
        unique: true,
        require: true
    },
    name: { // 名称
        type: String,
        unique: true,
        require: true
    },
    status: { // 状态
        type: Number,
        enum: [0, 1, 2],
        default: 0
    }
}, { collection: 'position', versionKey: false, toJSON: { virtuals: true } });
positionSchema.virtual('statusName').get(function () {
    return statusDic[this.status];
});
module.exports = mongoose.model('position', positionSchema);