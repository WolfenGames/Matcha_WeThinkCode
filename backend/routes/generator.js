const express = require("express");
const router = express.Router();

const { authHandler, authHandlerPost } = require("../functions/auxiliary")

router.get("/generate", function(req, res) {
	require("../functions/generator").UserGenerator();
	res.redirect("/");
});

router.post("/generate", authHandlerPost, async function(req, res) {
	await require("../functions/generator").UserGenerator()
	res.redirect("/user/admin");
});

router.get("/resetall", authHandler, async function(req, res) {
	await require("../functions/userManagement").deleteAll();
	res.redirect("/user/admin")
});

router.post("/resetall", authHandlerPost, async function(req, res) {
	await require("../functions/userManagement").deleteAll();
	res.sendStatus(204);
});

module.exports = router;
