const bcrypt = require('bcrypt');

const encrypt = (password, saltRounds) => {
    return bcrypt.hashSync(password, saltRounds);
};

const decrypt = (password, hash) => {
    return bcrypt.compareSync(password, hash);
};

module.exports = {
    encrypt,
    decrypt
};