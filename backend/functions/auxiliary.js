const public_ip = require("public-ip");

function text_truncate(str, length, cb) {
    if (length == null) {
    length = 150;
    }
    if (str.length > length) {
        cb(str.substring(0, length));
    } else {
        cb(str);
    }
};

function getIp(cb){
    public_ip.v4({https: true, timeout: 10000}).then(ip => {
        cb(ip);
    }).catch(err => {
        console.log("Cant get IP => " + err);
        cb(null);
    });
}

module.exports = {
    text_truncate: text_truncate,
    getIp: getIp
}