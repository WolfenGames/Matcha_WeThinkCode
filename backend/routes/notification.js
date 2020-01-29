const express = require("express");
const router = express.Router();
const notification = require("../functions/notification");

// chatFn.addChat("Eyy", "Eyyyyy", "Etyyyyyy");
// chatFn.getAllChats("Eyyyyy", "Eyy", res => {
// 	console.log(res);
// })

router.get("*", (req, res, next) => {
	if (!req.session.user) res.redirect("/404");
	else {
		notification.getNotifications(req.session.user._id, result => {
			res.render("potentials/notifications", {
				user: req.session.user,
				name: req.session.user,
				notifications: result
			});
		});
		notification.clearNotification(req.session.user._id)
	}
});

// localhost:8000/notification/new
router.post("/new", (req, res) => {
	if (req.session.user) {
		notification.isNewNotifications(req.session.user._id, result => {
			res.end(JSON.stringify(result))
		});
	} else {
		res.sendStatus(203);
	}
});

module.exports = router