const multer = require('multer');

var Storage = multer.diskStorage({
	destination: function(req, file, cb) {
		cb(null, Date.now() + "public/images/");
	},
	filename: function(req, file, cb) {
		cb(null, file.originalname);
	}
});

var upload = multer({
	storage: Storage
});

module.exports = {
	upload: upload
}