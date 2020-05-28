const express = require("express");
const router = express.Router();
const notification = require("../functions/notification");
const aux = require("../functions/auxiliary")

// chatFn.addChat("Eyy", "Eyyyyy", "Etyyyyyy");
// chatFn.getAllChats("Eyyyyy", "Eyy", res => {
// 	console.log(res);
// })

router.get("*", aux.authHandler, async (req, res, next) => {
	let result = await notification.getNotifications(req.session.user)
	res.render("potentials/notifications", {
		user: req.session.user,
		name: req.session.user,
		notifications: result
	});
	notification.clearNotification(req.session.user)
});

// localhost:8000/notification/new
router.post("/new", aux.authHandler, async (req, res) => {
	let result = await notification.isNewNotifications(req.session.user)
	res.end(JSON.stringify(result))
});

module.exports = router