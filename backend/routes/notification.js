const express = require("express");
const router = express.Router();
const notification = require("../functions/notification");

// localhost:8000/notification/new
router.post("/new", (req, res) => {
	if (req.session.user) {
        var isN = notification.isNewNotifications(req.session.user._id);
        res.json(JSON.stringify(isN))
	} else {
		res.sendStatus(203);
	}
});