// 连接数据库，及初始化数据库
const mongoose = require('mongoose');
const config = require('./config');
const Role = require('./app/models/role');
const User = require('./app/models/user');
const Permission = require('./app/models/permission');
const Department = require('./app/models/department');
const Position = require('./app/models/position');
const passport = require('./app/util/passport');
const permissionData = require('./permission.json');

async function generatePermission(permissions, pId) {
    for (const permission of permissions) {
        const permisDoc = await Permission.create({ code: permission.code, label: permission.label, pId });
        if (permission.children && permission.children.length > 0) {
            generatePermission(permission.children, permisDoc._id);
        }
    }
}

module.exports = () => {
    mongoose.connect(config.database, { useNewUrlParser: true, useCreateIndex: true, }, async err => {
        if (err) {
            console.log('数据库连接失败');
        } else {
            console.log('数据库连接成功');
            try {
                const tempRole = await Role.findOne({ code: 'admin' }); // 查询数据库是否初始化
                if (tempRole === null) {
                    // 初始化权限列表
                    generatePermission(permissionData);
                    const auditorPermissions = new Array(17).fill(0).map((item, index) => index + 34);
                    const systemPermissions = new Array(20).fill(0).map((item, index) => index + 1);
                    const securityPermissions = new Array(10).fill(0).map((item, index) => index + 21);
                    const adminPermissions = new Array(45).fill(0).map((item, index) => index + 1);
                    // 初始化普通用户和管理员审计员，安全员，系统管理员
                    Role.create({ code: 'common', name: '普通用户' });
                    const adminRole = await Role.create({ code: 'admin', name: '管理员', permissions: adminPermissions });
                    const auditorRole = await Role.create({ code: 'auditor', name: '安全审计员', permissions: auditorPermissions });
                    const securityRole = await Role.create({ code: 'security', name: '安全管理员', permissions: securityPermissions });
                    const systemRole = await Role.create({ code: 'system', name: '系统管理员', permissions: systemPermissions });

                    // 初始化管理员,安全审计员,安全管理员
                    const adminHash = passport.encrypt('admin', config.saltRounds);
                    User.create({ username: 'admin', hash: adminHash, name: '管理员', roleIds: [adminRole._id] });
                    const auditHash = passport.encrypt('auditor', config.saltRounds);
                    User.create({ username: 'auditor', hash: auditHash, name: '安全审计员', roleIds: [auditorRole._id] });
                    const securityHash = passport.encrypt('security', config.saltRounds);
                    User.create({ username: 'security', hash: securityHash, name: '安全管理员', roleIds: [securityRole._id] });
                    const systemHash = passport.encrypt('system', config.saltRounds);
                    User.create({ username: 'system', hash: systemHash, name: '系统管理员', roleIds: [systemRole._id] });
                    // 初始化部门和职位
                    Position.create({ code: 'test', name: '测试' });
                    Department.create({ code: 'test', name: '测试', });
                    console.log('数据库初始化成功');

                }
            } catch (error) {
                console.log('数据库初始化失败', error);
            }
        }
    });
};
