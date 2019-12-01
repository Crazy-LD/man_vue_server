const mongoose = require('mongoose');
const { Schema } = mongoose;
const permissionSchema = new Schema({ // 权限
    code: { // 编码
        type: Number,
        require: true
    },
    label: { // 名称
        type: String,
        require: true
    },
    pId: {
        type: Schema.Types.ObjectId,
        ref: 'permission'
    }, // 父部门
}, { collection: 'permission', versionKey: false, toJSON: { virtuals: true } }); // 一定要加上virtual，不然不会返回statusName  
// 绑定pre中间件只能在绑定model之前
permissionSchema.pre(/^find/, function () {
    this.populate({ path: 'pId', select: 'name' });
});

permissionSchema.post('save', function () {
    updatePermissionOptions().then(data => {
        permissionOptions = data;
    });
});
let permissionModel = mongoose.model('permission', permissionSchema);

const updatePermissionOptions = async () => {
    const permissions = await permissionModel.find({ pId: null });
    let permissionOptions = [];
    self(permissions, permissionOptions);
    function self(permissions, targetOptions) {
        permissions.forEach(async item => {
            const tempOption = { code: item.code, label: item.label };
            targetOptions.push(tempOption);
            const tempPermissions = await permissionModel.find({ pId: item._id });
            if (tempPermissions.length !== 0) {
                tempOption.children = [];
                self(tempPermissions, tempOption.children);
            }
        });
    }
    return permissionOptions;
};

let permissionOptions = [];
updatePermissionOptions().then(data => {
    permissionOptions = data;
});

// 注意async和一般函数的区别，该get中，不支持async，如果用async，则得到的是一个空的对象，而本来应该是一个promise对象
permissionSchema.virtual('permissionOptions').get(function () {
    return permissionOptions;
});

module.exports = permissionModel;