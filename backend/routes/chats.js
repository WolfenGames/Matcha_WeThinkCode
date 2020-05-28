const express = require("express");
const router = express.Router();
const aux = require("../functions/auxiliary")
const manageUser = require("../functions/userManagement")

const { getRoomChats } = require("../functions/chat");

// chatFn.addChat("Eyy", "Eyyyyy", "Etyyyyyy");
// chatFn.getAllChats("Eyyyyy", "Eyy", res => {
// 	console.log(res);
// })

// localhost:8000/chat/messages?roomName=........
router.get("/messages", aux.authHandler, async (req, res) => {
	if (req.params.roomName) {
		let result = await getRoomChats(req.params.roomName)
		res.json(JSON.stringify(result))
	} else {
		res.sendStatus(203);
	}
});

router.get("*", aux.authHandler, async (req, res, next) => {
	let result = await manageUser.getMatches(req.session.user._id)
	res.render("pages/chat", {
		user: req.session.user,
		name: req.session.user,
		matches: result
	});
});

module.exports = router;
