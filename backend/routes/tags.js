const express = require("express");
const router = express.Router();
const tags = require("../functions/tags");
const aux = require("../functions/auxiliary")

router.get("/tags/get", aux.authHandler, async function(req, res) {
	let result = await tags.getTags()
	if (result) 
		res.json(result);
	else 
		res.json({});
});

router.post("/tags/set", aux.authHandlerPost, async function(req, res) {
	await tags.setTags( req.session.user, req.body.Tag)
	res.send('{"msg":"OK"}');
});

router.post("/tag/delete", aux.authHandlerPost, async function(req, res) {
	await tags.removeTag(req.session.user, req.body.tag_id, req.body.tag_name);
	res.send('{"msg":"OK"}');
});

router.get("/tags/get/mine", aux.authHandler, async function(req, res) {
	let result = await tags.getUpdatedTags(req.session.user)
	if (result) 
		res.json(result);
	else 
		res.json({});
});

module.exports = router;
