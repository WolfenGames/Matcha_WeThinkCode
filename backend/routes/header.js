const express = require("express");
const router = express.Router();
const ListUsers = require("../functions/userList");

router.get("/likes", function(req, res) {
	if (req.session.user) {
		ListUsers.getLikedUsers(req.session.user, likes => {
			res.render("potentials/likes", { user: req.session.user, likes });
		});
	} else res.redirect("/404");
});

router.get("/blocks", function(req, res) {
	if (req.session.user) {
		ListUsers.getBlockedUsers(req.session.user, blocks => {
			res.render("potentials/blocks", { user: req.session.user, blocks });
		});
	} else res.redirect("/404");
});

router.get("/matches", function(req, res) {
	if (req.session.user) {
		ListUsers.getMatchedUsers(req.session.user, result => {
			res.render("potentials/matches", {
				user: req.session.user,
				matches: result
			});
		});
	} else res.redirect("/404");
});

router.get("/myViews", function(req, res) {
	if (req.session.user) {
		ListUsers.getViewedUsers(req.session.user, result => {
			res.render("potentials/viewedBy", {
				user: req.session.user,
				likes: result
			});
		});
	} else res.redirect("/404");
});

module.exports = router;
