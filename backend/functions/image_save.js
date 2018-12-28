const multer = require('multer');

var Storage = multer.diskStorage({
	destination: function(req, file, cb) {
		cb(null, "public/images/");
	},
	filename: function(req, file, cb) {
		req.session.user.f1 = Date.now() + "_" + file.originalname;
		cb(null, req.session.user.f1);
	}
});

var upload = multer({
	storage: Storage
});

module.exports = {
	upload: upload
}