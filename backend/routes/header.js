const express = require("express");
const router = express.Router();
const aux = require("../functions/auxiliary")
const manageUser = require("../functions/userManagement")

router.get("/likes", aux.authHandler, async function(req, res) {
	let likes = await manageUser.getLikedUsers(req.session.user)
	res.render("potentials/likes", { user: req.session.user, likes });
});

router.get("/blocks", aux.authHandler, async function(req, res) {
	let blocks = await manageUser.getBlockedUsers(req.session.user)
	res.render("potentials/blocks", { user: req.session.user, blocks });
});

router.get("/matches", aux.authHandler, async function(req, res) {
	let users = await manageUser.getMatches(req.session.user._id)
	res.render("potentials/matches", {
		user: req.session.user,
		matches: users
	})
});

router.get("/myViews", aux.authHandler, async function(req, res) {
	let likes = await manageUser.getViewedBy(req.session.user._id)
	res.render("potentials/viewedBy", {
		user: req.session.user,
		likes: likes
	});
});

module.exports = router;
