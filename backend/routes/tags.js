const express = require("express");
const router = express.Router();
const tags = require("../functions/tags");

router.get("/tags/get", function(req, res) {
	if (req.session.user) {
		tags.getTags(result => {
			if (result) res.json(result);
			else res.json({});
		});
	} else res.redirect("/404");
});

router.post("/tags/set", function(req, res) {
	if (req.session.user) {
		tags.setTags(req.body.tag, req.session.user.email, res => {
			req.session.user.tags = res;
		});
	}
	res.send('{"msg":"OK"}');
});

router.post("/tag/delete", function(req, res) {
	if (req.session.user) {
		tags.removeTag(req.session.user.email, req.body.tag);
	}
	res.send('{"msg":"OK"}');
});

router.get("/tags/get/mine", function(req, res) {
	if (req.session.user) {
		tags.getUpdatedTags(req.session.user.email, result => {
			if (result) res.json(result);
			else res.json({});
		});
	} else res.redirect("/404");
});

module.exports = router;
