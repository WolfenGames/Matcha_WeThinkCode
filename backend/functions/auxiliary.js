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

module.exports = {
    text_truncate: text_truncate
}