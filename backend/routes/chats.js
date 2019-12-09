const express = require("express");
const router = express.Router();
const ListUsers = require("../functions/userList");

const { getRoomChats } = require("../functions/chat");

// chatFn.addChat("Eyy", "Eyyyyy", "Etyyyyyy");
// chatFn.getAllChats("Eyyyyy", "Eyy", res => {
// 	console.log(res);
// })

router.get("*", (req, res, next) => {
	if (!req.session.user) res.redirect("/404");
	else
		ListUsers.getMatchedUsers(req.session.user, result => {
			res.render("pages/chat", {
				user: req.session.user,
				name: req.session.user,
				matches: result
			});
		});
});

// localhost:8000/chat/messages?roomName=........
router.get("/messages", (req, res) => {
	if (req.params.roomName) {
		getRoomChats(req.params.roomName, result => {
			res.json(JSON.stringify(result));
		});
	} else {
		res.sendStatus(203);
	}
});

router.get("*", (req, res, next) => {
	if (!req.session.user) res.redirect("/404");
	ListUsers.getMatchedUsers(req.session.user, result => {
		res.render("pages/chat", {
			user: req.session.user,
			name: req.session.user,
			matches: result
		});
	});
});

module.exports = router;
