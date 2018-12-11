const multer = require('multer');

var Storage = multer.diskStorage({
	destination: function(req, file, cb) {
		cb(null, "./images");
	},
	filename: function(req, file, cb) {
		cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
	}
});

var upload = multer({
	storage: Storage
});

module.exports = {
	upload: upload
}