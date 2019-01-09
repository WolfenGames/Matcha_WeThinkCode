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
	fileFilter: function (req, file, cb) {
		if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
			return cb(new Error('Only image files are allowed!'));
		}
		cb(null, true);
	},
	storage: Storage
});

module.exports = {
	upload: upload
}