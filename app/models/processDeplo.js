const mongoose = require('mongoose');
const { Schema } = mongoose;

const processDeploSchema = new Schema({ // 流程部署
    name: String, // 名称
    category: String, // 类别
    file: String, // 部署文件的路径
    time: { // 时间
        type: Date,
        default: Date.now
    }
}, { collection: 'processDeplo', versionKey: false });

module.exports = mongoose.model('processDeplo', processDeploSchema);