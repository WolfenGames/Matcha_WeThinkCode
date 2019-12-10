const express = require("express");
const router = express.Router();
const db = require("../database/db");

router.get("/generate", function(req, res) {
	require("../functions/generator").UserGenerator();
	res.redirect("/");
});

router.post("/generate", function(req, res) {
	require("../functions/generator").UserGenerator(done => {
		res.redirect("/user/admin");
	});
});

router.get("/resetall", function(req, res) {
	db.mongo
		.connect(db.url, { useNewUrlParser: true, useUnifiedTopology: true })
		.then(dbs => {
			var dbo = dbs.db("Matcha");
			dbo.collection("Users")
				.deleteMany({ type: "Generated" })
				.then(result => {
					res.redirect("/");
				});
		});
});

router.post("/resetall", function(req, res) {
	db.mongo
		.connect(db.url, { useNewUrlParser: true, useUnifiedTopology: true })
		.then(dbs => {
			var dbo = dbs.db("Matcha");
			dbo.collection("Users")
				.deleteMany({ type: "Generated" })
				.then(result => {
					res.sendStatus(200);
				})
				.catch(err => {
					console.log("Can't reset -> " + err);
					res.sendStatus(403);
				});
		});
});

module.exports = router;
