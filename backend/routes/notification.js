const express = require("express");
const router = express.Router();
const notification = require("../functions/notification");

// localhost:8000/notification/new
router.post("/new", (req, res) => {
	if (req.session.user) {
		notification.isNewNotifications(req.session.user._id, result => {
			console.log(result)
			res.end(JSON.stringify(result))
		});
	} else {
		res.sendStatus(203);
	}
});

module.exports = router