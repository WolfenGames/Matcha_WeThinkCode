const express = require("express");
const router = express.Router();
const manageUser = require("../functions/userManagement");
const aux = require("../functions/auxiliary");

var username_regex = /^[a-zA-Z0-9 ]{5,}$/;

router.post("/update/Email", function(req, res) {
	if (req.session.user) {
		var newEmail = req.body.email;
		if (email_regex.test(newEmail)) {
			var query = { email: req.session.user.email };
			var set = { $set: { email: newEmail } };
			manageUser.updateUserOne(query, set, function(result) {
				if (result) {
					req.session.user.email = newEmail;
					if (!newEmail) req.session.setup = false;
					res.end('{"msg": "OK"}');
				} else res.end('{"msg": "Email could not be updated"}');
			});
		} else
			res.end(
				'{"msg":"Error", "extra":"Needs to be a valid email adress"}'
			);
	} else res.end('{"msg":"Need to be logged in to do this"}');
});

router.post("/update/loc", (req, res) => {
	if (req.body && req.body.long && req.body.lat && req.session.user)
		manageUser.updateLoc(req.session.user);
	res.sendStatus(200);
});

router.post("/update/loc/custom", (req, res) => {
	if (req.body && req.body.long && req.body.lat && req.session.user) {
		let [long, lat] = [parseFloat(req.body.long), parseFloat(req.body.lat)];
		manageUser.setCustomLoc(req.session.user, long, lat);
		manageUser.updateLoc(req.session.user);
	}
	res.sendStatus(200);
});

router.post("/update/Username", function(req, res) {
	if (req.session.user) {
		var newusername = req.body.username;
		if (
			newusername &&
			newusername.length > 0 &&
			username_regex.test(newusername)
		) {
			var query = { email: req.session.user.email };
			var set = { $set: { username: newusername } };
			manageUser.updateUserOne(query, set, function(result) {
				if (result) {
					req.session.user.username = newusername;
					if (!newusername) req.session.setup = false;
					res.end('{"msg": "OK"}');
				} else res.end('{"msg": "Username could not be updated"}');
			});
		} else
			res.end(
				'{"msg":"Error", "extra":"Username can\'t be empty or null, minimum 5 characters, Can only contain spaces no special characters"}'
			);
	} else res.end('{"msg":"Need to be logged in to do this"}');
});

router.post("/update/Biography", function(req, res) {
	if (req.session.user) {
		var biography = req.body.biography;
		aux.text_truncate(biography, 150, function(result_string) {
			var query = { email: req.session.user.email };
			var set = { $set: { biography: result_string } };
			manageUser.updateUserOne(query, set, function(result) {
				if (result) {
					req.session.user.biography = result_string;
					if (!result_string) req.session.setup = false;
					res.end('{"msg": "OK"}');
				} else res.end('{"msg": "Username could not be updated"}');
			});
		});
	} else res.end('{"msg":"Need to be logged in to do this"}');
});

router.post("/update/Gender", function(req, res) {
	if (req.session.user) {
		var gender = req.body.gender;
		var query = { email: req.session.user.email };
		var set = { $set: { sex: gender } };
		manageUser.updateUserOne(query, set, function(result) {
			if (result) {
				req.session.user.sex = gender;
				res.end('{"msg": "OK"}');
			} else res.end('{"msg": "Gender could not be updated"}');
		});
	} else res.end('{"msg":"Need to be logged in to do this"}');
});

router.post("/update/Sex", function(req, res) {
	if (req.session.user) {
		var sex = req.body.sex;
		var query = { email: req.session.user.email };
		var set = { $set: { sexuality: sex } };
		manageUser.updateUserOne(query, set, function(result) {
			if (result) {
				req.session.user.sexuality = sex;
				res.end('{"msg": "OK"}');
			} else res.end('{"msg": "Sex could not be updated"}');
		});
	} else res.end('{"msg":"Need to be logged in to do this"}');
});

router.post("/update/Firstname", function(req, res) {
	if (req.session.user) {
		var fname = req.body.firstname;
		var query = { email: req.session.user.email };
		var set = { $set: { firstname: fname } };
		manageUser.updateUserOne(query, set, function(result) {
			if (result) {
				req.session.user.firstname = fname;
				res.end('{"msg": "OK"}');
			} else res.end('{"msg": "Sex could not be updated"}');
		});
	} else res.end('{"msg":"Need to be logged in to do this"}');
});

router.post("/update/Lastname", function(req, res) {
	if (req.session.user) {
		var lname = req.body.lastname;
		var query = { email: req.session.user.email };
		var set = { $set: { surname: lname } };
		manageUser.updateUserOne(query, set, function(result) {
			if (result) {
				req.session.user.surname = lname;
				if (!lname) req.session.setup = false;
				res.end('{"msg": "OK"}');
			} else res.end('{"msg": "Sex could not be updated"}');
		});
	} else res.end('{"msg":"Need to be logged in to do this"}');
});

router.post("/update/Dob", function(req, res) {
	if (!req.session.user) res.redirect("/404");
	manageUser.updateUserOne(
		{ email: req.session.user.email },
		{ $set: { age: req.body.dob } },
		res => {
			res.send('{"msg":"OK"}');
		}
	);
});

module.exports = router;
