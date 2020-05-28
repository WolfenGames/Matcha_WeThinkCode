const express = require("express");
const router = express.Router();
const manageUser = require("../functions/userManagement");
const FuncUser = require("../functions/userSave");
const bcrypt = require("bcrypt");
const verify = require("../functions/verify");
const login = require("../functions/login");
const url = require("url");
const mailer = require("../functions/sendmail");
const aux = require("../functions/auxiliary");
const geoip = require("geoip-lite");

var password_regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&_])[A-Za-z\d@$#!%*?&_]{8,}$/;
var email_regex = /^[_a-zA-Z0-9-]+(\.[_a-zA-Z0-9-]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*(\.[a-zA-Z]{2,10})$/;

router.get("/", aux.authHandler, async function(req, res) {
	let users = await manageUser.getUsers(req.session.user)
	res.render("pages/index",{
		user: req.session.user,
		users: users,
		setup: true
	})
});

router.get("/profile", aux.authHandler, async function(req, res) {
	const tags = await manageUser.getTags(req.session.user)
	res.render("pages/profile/profile", {
		user: req.session.user,
		usertags: tags,
		map_api_key: process.env.MAP_SECRET
	});
});

router.get("/login", function(req, res) {
	if (req.session && req.session.user) res.redirect("/");
	else res.render("pages/profile/login", { user: req.session.user });
});

router.post("/delete", aux.authHandlerPost, async function(req, res) {
	await manageUser.deleteByUsername(req.session.user._id)
	res.end('{"msg": "OK", "extra": "You have deleted your account"}');
});

router.post("/User/Create", async function(req, res) {
	const oPass = req.body.oPassword;
	const cPass = req.body.cPassword;
	const email = req.body.Email;
	const sub = req.body.emailpref;
	const uname = req.body.Username;

	if (await FuncUser.emailExists(email))
		res.end('{"msg": "Email already exists"}')
	else if (await FuncUser.unameExists(uname))
		res.end('{"msg": "Username already exists"}')
	else if (email_regex.test(email)) {
		if (password_regex.test(oPass) && password_regex.test(cPass)) {
			if (cPass == oPass) {
				let hash = await bcrypt.hashSync(oPass, 10);
				var fullUrl =
					req.protocol +
					"://" +
					req.get("host") +
					"/verify?email=" +
					email +
					"&verify=";
				FuncUser.userSave(uname, email, hash, "User", sub, fullUrl);
				res.end('{"msg": "OK"}');
			} else res.end('{"msg": "Passwords dont match"}');
		} else res.end('{"msg": "Passwords need 1 Caps, 1 lower, 1 number, 1 special character, min 8 characters"}');
	} else res.end('{"msg": "Please enter a valid email"}');

});

router.get("/signup", function(req, res) {
	if (!req.session.user)
		res.render("pages/profile/signup", { user: req.session.user });
	else res.redirect("/");
});

router.get("/verify", function(req, res) {
	var adr = req.protocol + "://" + req.get("host") + req.url;
	var q = url.parse(adr, true);
	let mail = q.query.email;
	let verifyKey = q.query.verify;
	verify.verify(mail, verifyKey);
	res.redirect("/login");
});

router.get("/logout/user", function(req, res) {
	req.session.destroy();
	res.redirect("/");
});

router.post("/login/resend", async function(req, res) {
	var email = req.body.email;
	if (email_regex.test(email)) {
		if (email) {
			var fullUrl =
				req.protocol +
				"://" +
				req.get("host") +
				"/verify?email=" +
				email +
				"&verify=";
			let ret = await mailer.resendVerify(email, fullUrl)
				if (ret) res.send('{"msg":"OK"}');
				else res.send('{"msg":"No email associated with account"}');
		} else res.send('{"msg":"No email Provided"}');
	} else res.end('{"msg":"Please enter a valid email address"}');
});

router.post("/login/user", async function(req, res) {
	if (email_regex.test(req.body.email)) {
		if (password_regex.test(req.body.password)) {
			let loginres = await login.login(req.body.email, req.body.password)
			if (loginres) {
				req.session.user = loginres;
				var user = loginres;
				if (
					!user["username"] ||
					!user["firstname"] ||
					!user["surname"] ||
					!user["sex"] ||
					!user["sexuality"] ||
					!user["biography"]
				)
					req.session.setup = false;

				else req.session.setup = true;
				aux.getIp(async result => {
					if (result) {
						var loc = geoip.lookup(result);
						if (!loc) {
							loc.ll[0] = 0;
							loc.ll[1] = 0;
						}
						await manageUser.setTypeOfLoc(req.session.user, "IP")
						await manageUser.setIPBrowser(req.session.user, loc.ll[1], loc.ll[0])
						await login.updateLoginTime(req.session.user._id)
						res.end('{"msg": "OK"}')
					} else res.end('{"msg": "error???"}');
				});
			} else {
				res.end('{"msg": "Needs to be verified or can\'t be found"}');
			}
		} else
			res.end(
				'{"msg":"Passwords need 1 Caps, 1 lower, 1 number, 1 special character, min 8 characters"}'
			);
	} else res.end('{"msg":"Please enter a valid email address"}');
});

router.post("/login/forgot", async function(req, res) {
	var email = req.body.email;
	if (email_regex.test(email)) {
		if (email) {
			var fullUrl =
				req.protocol +
				"://" +
				req.get("host") +
				"/forgotpass/?email=" +
				email +
				"&verify=";
			let ret = await mailer.sendPassForget(email, fullUrl)
			if (ret) res.send('{"msg":"OK"}');
			else res.send('{"msg":"No email associated with account"}');
		} else res.send('{"msg":"No email Provided"}');
	} else res.end('{"msg":"Please enter a valid email address"}');
});

router.get("/filter", aux.authHandler, async (req, res) => {
	/*
		/:minAge/:maxAge/:distance:/
	*/

	let user = req.session.user;
	if (!req.query.minAge) req.query.minAge = 17;
	if (!req.query.maxAge) req.query.maxAge = 99;
	if (!req.query.minDistance) req.query.minDistance = -1;
	if (!req.query.maxDistance) req.query.maxDistance = 500;
	if (!req.query.minCompat) req.query.minCompat = -1;
	if (!req.query.maxCompat) req.query.maxCompat = 101;
	if (!req.query.sex) req.query.sex = '';
	if (!req.query.sexuailty) req.query.sexuailty = '';

	if (!(req.query.minAge instanceof Number)) {
		try {
			req.query.minAge = parseInt(req.query.minAge);
		} catch (ex) {
			req.query.minAge = 17;
		}
	}
	if (!(req.query.maxAge instanceof Number)) {
		try {
			req.query.maxAge = parseInt(req.query.maxAge);
		} catch (ex) {
			req.query.maxAge = 99;
		}
	}
	if (!(req.query.minDistance instanceof Number)) {
		try {
			req.query.minDistance = parseInt(req.query.minDistance);
		} catch (ex) {
			req.query.minDistance = -1;
		}
	}
	if (!(req.query.maxDistance instanceof Number)) {
		try {
			req.query.maxDistance = parseInt(req.query.maxDistance);
		} catch (ex) {
			req.query.maxDistance = 500;
		}
	}
	if (!(req.query.minCompat instanceof Number)) {
		try {
			req.query.minCompat = parseInt(req.query.minCompat);
		} catch (ex) {
			req.query.minCompat = -1;
		}
	}
	if (!(req.query.maxCompat instanceof Number)) {
		try {
			req.query.maxCompat = parseInt(req.query.maxCompat);
		} catch (ex) {
			req.query.maxCompat = 101;
		}
	}

	var query = {
		age: {
			lt: req.query.maxAge,
			gt: req.query.minAge
		},
		location: {
			lt: req.query.maxDistance,
			gt: req.query.minDistance
		},
		compaitibility: {
			lt: req.query.maxCompat,
			gt: req.query.minCompat
		},
		sex: req.query.sex,
		sexuality: req.query.sexuailty 
	};
	let result = await manageUser.filter(user, query)
	res.render("pages/filter", {
		user: user,
		users: result,
		setup: req.session.setup
	});
});

module.exports = router;
