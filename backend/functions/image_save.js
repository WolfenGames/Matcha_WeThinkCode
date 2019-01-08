const multer = require('multer');

var Storage = multer.diskStorage({
	destination: function(req, file, cb) {
		if (file.mimetype !== 'image/jpeg' || file.mimetype !== 'image/jpg' || file.mimetype !== 'image/png')
			cb(null, null);
		else
			cb(null, "public/images/");
	},
	filename: function(req, file, cb) {
		if (file.mimetype !== 'image/jpeg' || file.mimetype !== 'image/jpg' || file.mimetype !== 'image/png') {
			req.session.user.f1 = null;
			cb(null, null);// req.session.user.f1);
		}
		else {
			req.session.user.f1 = Date.now() + "_" + file.originalname;
			cb(null, req.session.user.f1);
		}
	}
});

var upload = multer({
	storage: Storage
});

module.exports = {
	upload: upload
}