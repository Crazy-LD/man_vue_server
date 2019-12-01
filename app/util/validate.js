const isInvalid = (...args) => {
    let result = false;
    args.forEach(item => {
        if (item === undefined || item === '') {
            result = true;
        }
    });
    return result;
};

/**
 * 
 * @param {Array} arg 
 */
const isArray = arg => {
    if (typeof Array.isArray === 'undefined') {
        return Object.prototype.toString.call(arg) === '[object Array]';
    }
    return Array.isArray(arg);
}

module.exports = {
    isInvalid,
    isArray
};