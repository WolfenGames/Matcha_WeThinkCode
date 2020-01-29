const express = require("express");
const router = express.Router();
const ListUsers = require("../functions/userList");
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

router.get("/", function(req, res) {
	if (!req.session.user) res.redirect("/login");
	else {
		manageUser.getUserInfo(req.session.user.email, result => {
			var user = req.session.user;
			req.session.setup =
				!user["username"] ||
				!user["firstname"] ||
				!user["surname"] ||
				!user["sex"] ||
				!user["sexuality"] ||
				!user["biography"] ||
				!user["Prof"]
					? false
					: true;
			req.session.user = result;
			ListUsers.ListUser(user, result => {
				res.render("pages/index", {
					user: req.session.user,
					users: result,
					setup: req.session.setup
				});
			});
		});
	}
});

router.get("/profile", function(req, res) {
	if (!req.session.user) res.redirect("/404");
	else {
		manageUser.getUserInfo(req.session.user.email, result => {
			req.session.user = result;
			res.render("pages/profile/profile", {
				user: req.session.user,
				usertags: result.tags
			});
		});
	}
});

router.get("/login", function(req, res) {
	if (req.session && req.session.user) res.redirect("/");
	else res.render("pages/profile/login", { user: req.session.user });
});

router.post("/delete", function(req, res) {
	if (req.session.user) {
		manageUser.deleteByUsername(req.body.email, function(reason) {
			if (reason) {
				res.end(
					'{"msg": "OK", "extra": "You have deleted your account"}'
				);
			} else {
				res.end(
					'{"msg": "Failed", "extra": "Failed to delete your account"}'
				);
			}
		});
	} else res.end('{"msg":"404"}');
});

router.post("/User/Create", function(req, res) {
	const oPass = req.body.oPassword;
	const cPass = req.body.cPassword;
	const email = req.body.Email;
	const sub = req.body.emailpref;
	const uname = req.body.Username;
	FuncUser.emailExists(email, function(result) {
		if (!result) {
			FuncUser.unameExists(uname, function(result) {
				if (!result) {
					if (email_regex.test(email)) {
						if (password_regex.test(oPass) && password_regex.test(cPass)) {
							if (cPass == oPass) {
								let hash = bcrypt.hashSync(oPass, 10);
								var fullUrl =
									req.protocol +
									"://" +
									req.get("host") +
									"/verify?email=" +
									email +
									"&verify=";
								FuncUser.userSave(uname, email, hash, "User", sub, fullUrl);
								res.end('{"msg": "OK"}');
							} else {
								res.end('{"msg": "Passwords dont match"}');
							}
						} else
							res.end(
								'{"msg": "Passwords need 1 Caps, 1 lower, 1 number, 1 special character, min 8 characters"}'
							);
					} else res.end('{"msg": "Please enter a valid email"}');
				} else res.end('{"msg":"Usename already in use"}');
			});
		} else res.end('{"msg":"Email already in use"}');
	});
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

router.post("/login/resend", function(req, res) {
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
			mailer.resendVerify(email, fullUrl, function(ret) {
				if (ret) res.send('{"msg":"OK"}');
				else res.send('{"msg":"No email associated with account"}');
			});
		} else res.send('{"msg":"No email Provided"}');
	} else res.end('{"msg":"Please enter a valid email address"}');
});

router.post("/login/user", function(req, res) {
	if (email_regex.test(req.body.email)) {
		if (password_regex.test(req.body.password)) {
			login.login(req.body.email, req.body.password, function(loginres) {
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
					aux.getIp(result => {
						if (result) {
							var loc = geoip.lookup(result);
							if (!loc) {
								loc.ll[0] = 0;
								loc.ll[1] = 0;
							}
							req.session.loc = [loc.ll[1], loc.ll[0]];
							req.session.rooms = [];
							manageUser.updateUserOne(
								{ email: req.session.user.email },
								{ $set: { locationIp: req.session.loc } },
								cb => {
									res.end('{"msg": "OK"}');
								}
							);
						} else res.end('{"msg": "error???"}');
					});
				} else {
					res.end(
						'{"msg": "Needs to be verified or can\'t be found"}'
					);
				}
			});
		} else
			res.end(
				'{"msg":"Passwords need 1 Caps, 1 lower, 1 number, 1 special character, min 8 characters"}'
			);
	} else res.end('{"msg":"Please enter a valid email address"}');
});

router.post("/login/forgot", function(req, res) {
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
			mailer.sendPassForget(email, fullUrl, function(ret) {
				if (ret) res.send('{"msg":"OK"}');
				else res.send('{"msg":"No email associated with account"}');
			});
		} else res.send('{"msg":"No email Provided"}');
	} else res.end('{"msg":"Please enter a valid email address"}');
});

router.get("/filter", (req, res) => {
	/*
		/:minAge/:maxAge/:distance:/
	*/
	if (req.session.user) {
		manageUser.getUserInfo(req.session.user.email, result => {
			var user = req.session.user;
			req.session.setup =
				!user["username"] ||
				!user["firstname"] ||
				!user["surname"] ||
				!user["sex"] ||
				!user["sexuality"] ||
				!user["biography"] ||
				!user["Prof"]
					? false
					: true;
			req.session.user = result;
			if (!req.query.minAge) req.query.minAge = 17;
			if (!req.query.maxAge) req.query.maxAge = 99;
			if (!req.query.dist) req.query.dist = 1000;
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
			if (!(req.query.dist instanceof Number)) {
				try {
					req.query.dist = parseInt(req.query.dist);
				} catch (ex) {
					req.query.dist = 99;
				}
			}
			var date = new Date();
			var date2 = new Date();
			date.setFullYear(date.getFullYear() - parseInt(req.query.minAge));
			date2.setFullYear(date2.getFullYear() - parseInt(req.query.maxAge));
			var x = require("dateformat");
			var y = x(date, "yyyy-mm-dd");
			var z = x(date2, "yyyy-mm-dd");
			var dist = parseInt(req.query.dist) * parseInt(req.query.dist);
			var check = [];
			if (user["sex"] === "3") {
				check.push({ sex: "3" });
			} else {
				if (user["sexuality"] === "3") {
					check.push({ sexuality: "1", sex: user["sex"] });
					check.push({ sexuality: "3", sex: user["sex"] });
				}
				if (user["sexuality"] === "2") {
					check.push({
						sexuality: "1",
						sex: user["sex"] === "1" ? "2" : "1"
					});
					check.push({
						sexuality: "2",
						sex: user["sex"] === "1" ? "2" : "1"
					});
				}
				if (user["sexuality"] === "1") {
					check.push({ sexuality: "1", sex: "1" });
					check.push({ sexuality: "1", sex: "2" });
					check.push({
						sex: user["sex"] === "1" ? "2" : "1",
						sexuality: "2"
					});
					check.push({ sex: user["sex"], sexuality: "3" });
				}
			}

			var query = {
				age: {
					$lte: y,
					$gte: z
				},
				$or: check.length === 0 ? [{}] : check,
				banned: false,
				isVerified: true,
				location: {
					$nearSphere: {
						$geometry: {
							type: "2dSphere",
							coordinates: user.location
						},
						$maxDistance: dist
					}
				}
			};
			if (req.query.tags && req.query.tags.length != 0) {
				if (req.query.tags instanceof Array)
					query.tags = { $in: req.query.tags };
				else query.tags = { $in: [req.query.tags] };
			}
			manageUser.filter(query, result => {
				res.render("pages/filter", {
					user: req.session.user,
					users: result,
					setup: req.session.setup
				});
			});
		});
	} else res.redirect("/404");
});

module.exports = router;
