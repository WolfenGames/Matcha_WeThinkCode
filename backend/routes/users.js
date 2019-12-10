const express = require("express");
const router = express.Router();
const manageUser = require("../functions/userManagement");
const FuncUser = require("../functions/userSave");
const bcrypt = require("bcrypt");
const url = require("url");
const IS = require("../functions/image_save");
const db = require("../database/db");

var password_regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&_])[A-Za-z\d@$#!%*?&_]{8,}$/;

router.get("/view/:id", function(req, res) {
	if (req.session.user) {
		if (typeof req.params.id === "string") {
			manageUser.getUserInfoId(req.params.id, user => {
				if (user) {
					manageUser.updateUserOne(
						{ email: user.email },
						{
							$set: { views: user.views + 1 },
							$addToSet: { viewedBy: req.session.user._id }
						},
						() => {
							manageUser.getHighestView(val => {
								res.render("potentials/profile", {
									user: req.session.user,
									req_user: user,
									highestView: val
								});
							});
						}
					);
				} else res.redirect("/404");
			});
		} else res.redirect("/404");
	} else res.redirect("/404");
});

router.get("/block/:id", function(req, res) {
	if (req.session.user) {
		if (typeof req.params.id === "string") {
			manageUser.getUserInfoId(req.params.id, user => {
				if (user) {
					manageUser.updateUserOne(
						{ email: req.session.user.email },
						{
							$addToSet: {
								blocks: user._id
							}
						},
						_result => {
							manageUser.getUserInfo(
								req.session.user.email,
								fn => {
									req.session.user = fn;
									res.redirect("/unlike/" + req.params.id);
								}
							);
						}
					);
				} else res.redirect("/404");
			});
		} else res.redirect("/404");
	} else res.redirect("/404");
});

router.get("/unblock/:id", function(req, res) {
	if (req.session.user) {
		if (typeof req.params.id === "string") {
			manageUser.getUserInfoId(req.params.id, user => {
				if (user) {
					manageUser.updateUserOne(
						{ email: req.session.user.email },
						{
							$pull: {
								blocks: user._id
							}
						},
						_result => {
							manageUser.getUserInfo(
								req.session.user.email,
								fn => {
									req.session.user = fn;
									res.redirect("/");
								}
							);
						}
					);
				} else res.redirect("/404");
			});
		} else res.redirect("/404");
	} else res.redirect("/404");
});

router.get("/like/:id", function(req, res) {
	if (req.session.user) {
		if (typeof req.params.id === "string") {
			manageUser.getUserInfoId(req.params.id, user => {
				if (user) {
					var id = db._mongo.ObjectId(req.params.id);
					manageUser.updateUserOne(
						{ email: req.session.user.email },
						{ $addToSet: { likes: req.params.id } },
						() => {
							manageUser.updateUserOne(
								{ _id: id },
								{
									$addToSet: { likedBy: req.session.user._id }
								},
								() => {
									res.redirect("/");
								}
							);
						}
					);
				} else res.redirect("/404");
			});
		} else res.redirect("/404");
	} else res.redirect("/404");
});

router.get("/unlike/:id", function(req, res) {
	if (req.session.user) {
		if (typeof req.params.id === "string") {
			manageUser.getUserInfoId(req.params.id, user => {
				if (user) {
					var id = db._mongo.ObjectId(req.params.id);
					manageUser.updateUserOne(
						{ email: req.session.user.email },
						{ $pull: { likes: req.params.id } },
						() => {
							manageUser.updateUserOne(
								{ _id: id },
								{ $pull: { likedBy: req.session.user._id } },
								() => {
									res.redirect("/");
								}
							);
						}
					);
				} else res.redirect("/404");
			});
		} else res.redirect("/404");
	} else res.redirect("/404");
});

router.get("/unblock/:id", function(req, res) {
	if (req.session.user) {
		if (typeof req.params.id === "string") {
			manageUser.getUserInfoId(req.params.id, user => {
				if (user) {
					manageUser.updateUserOne(
						{ email: req.session.user.email },
						{ $pull: { blocks: req.params.id } },
						() => {
							res.redirect("/");
						}
					);
				} else res.redirect("/404");
			});
		} else res.redirect("/404");
	} else res.redirect("/404");
});

router.get("/unmatch/:id", function(req, res) {
	if (req.session.user) {
		if (typeof req.params.id === "string") {
			manageUser.getUserInfoId(req.params.id, user => {
				if (user) {
					var id = db._mongo.ObjectId(req.params.id);
					manageUser.updateUserOne(
						{ email: req.session.user.email },
						{ $pull: { likes: req.params.id } },
						() => {
							manageUser.updateUserOne(
								{ _id: id },
								{ $pull: { likedBy: req.session.user._id } },
								() => {
									res.redirect("/");
								}
							);
						}
					);
				} else res.redirect("/404");
			});
		} else res.redirect("/404");
	} else res.redirect("/404");
});

router.post("/resetpass", function(req, res) {
	var email = req.body.Email;
	var pass = req.body.oPassword;
	var cpass = req.body.cPassword;
	var verify = req.body.verify;
	if (pass == cpass) {
		if (password_regex.test(pass)) {
			let hash = bcrypt.hashSync(pass, 10);
			manageUser.updateUserOne(
				{ email: email, verification: verify },
				{ $set: { password: hash } },
				result => {
					if (result) res.end('{"msg":"OK"}');
					else res.end('{"msg":"Could not update Password"}');
				}
			);
		} else
			res.end(
				'{"msg":"Passwords need 1 Caps, 1 lower, 1 number, 1 special character, min 8 characters"}'
			);
	} else res.end('{"msg":"Passwords dont match"}');
});

router.post("/user/updateLoc", (req, res) => {
	if (req.body.long && req.body.lat) {
		if (req.session.user)
			manageUser.setGeoLocBrowser(
				req.body.long,
				req.body.lat,
				req.session.user
			);
		res.sendStatus(200);
	}
});

router.post("/user/locType", (req, res) => {
	// console.log(req.body);
	if (req.body.locType && req.session.user) {
		var val = 0;
		switch (req.body.locType) {
			case "Ip":
				val = 0;
				break;
			case "Browser":
				val = 1;
				break;
			case "Custom":
				val = 2;
				break;
			default:
				val = 0;
				break;
		}
		req.session.user.locationType = val;
		manageUser.setTypeOfLoc(val, req.session.user);
		manageUser.updateLoc(req.session.user);
	}
	res.sendStatus(200);
});

router.get("/delete/:name", (req, res) => {
	if (req.session.user && req.session.user.type === "Admin") {
		FuncUser.deleteUser(req.params.name);
		res.redirect("/user/admin");
	} else res.redirect("/404");
});

router.get("/user/admin", (req, res) => {
	if (req.session.user && req.session.user.type === "Admin") {
		FuncUser.getAll(result => {
			res.render("pages/profile/admin", {
				user: req.session.user,
				results: result
			});
		});
	} else res.redirect("/404");
});

router.post("/file/uploads/profile/Main", function(req, res) {
	if (req.session.user) {
		IS.upload.single("Image1")(req, res, _err => {
			var picture = {
				Picture1: "/images/" + req.session.user.f1,
				Picture2:
					req.session.user.picture.Picture1 === null
						? "/images/" + req.session.user.picture.Picture1
						: req.session.user.picture.Picture2,
				Picture3:
					req.session.user.picture.Picture1 === null
						? "/images/" + req.session.user.picture.Picture1
						: req.session.user.picture.Picture3,
				Picture4:
					req.session.user.picture.Picture1 === null
						? "/images/" + req.session.user.picture.Picture1
						: req.session.user.picture.Picture4,
				Picture5:
					req.session.user.picture.Picture1 === null
						? "/images/" + req.session.user.picture.Picture1
						: req.session.user.picture.Picture5
			};
			var email = req.session.user.email;
			manageUser.updateUserOne(
				{ email: email },
				{
					$set: {
						picture: picture,
						Prof: "/images/" + req.session.user.f1
					}
				},
				function() {
					res.redirect("/profile");
					// response.end(JSON.stringify({ msg: "OK" }));
				}
			);
		});
	} else res.redirect("/404");
});

router.post("/file/uploads/profile/First", function(req, res) {
	if (req.session.user) {
		IS.upload.single("Image2")(req, res, _err => {
			var picture = {
				Picture1:
					req.session.user.picture.Picture1 === null
						? "/images/" + req.session.user.picture.Picture1
						: req.session.user.picture.Picture1,
				Picture2: "/images/" + req.session.user.f1,
				Picture3:
					req.session.user.picture.Picture3 === null
						? "/images/" + req.session.user.picture.Picture3
						: req.session.user.picture.Picture3,
				Picture4:
					req.session.user.picture.Picture4 === null
						? "/images/" + req.session.user.picture.Picture4
						: req.session.user.picture.Picture4,
				Picture5:
					req.session.user.picture.Picture5 === null
						? "/images/" + req.session.user.picture.Picture5
						: req.session.user.picture.Picture5
			};
			var email = req.session.user.email;
			manageUser.updateUserOne(
				{ email: email },
				{ $set: { picture: picture } },
				function() {
					res.redirect("/profile");
				}
			);
		});
	} else res.end('{"msg":"404"}');
});

router.post("/file/uploads/profile/Second", function(req, res) {
	if (req.session.user) {
		IS.upload.single("Image3")(req, res, _err => {
			var picture = {
				Picture1:
					req.session.user.picture.Picture1 === null
						? "/images/" + req.session.user.picture.Picture1
						: req.session.user.picture.Picture1,
				Picture2:
					req.session.user.picture.Picture2 === null
						? "/images/" + req.session.user.picture.Picture2
						: req.session.user.picture.Picture2,
				Picture3: "/images/" + req.session.user.f1,
				Picture4:
					req.session.user.picture.Picture4 === null
						? "/images/" + req.session.user.picture.Picture4
						: req.session.user.picture.Picture4,
				Picture5:
					req.session.user.picture.Picture5 === null
						? "/images/" + req.session.user.picture.Picture5
						: req.session.user.picture.Picture5
			};
			var email = req.session.user.email;
			manageUser.updateUserOne(
				{ email: email },
				{ $set: { picture: picture } },
				function() {
					res.redirect("/profile");
				}
			);
		});
	} else res.end('{"msg":"404"}');
});

router.get("/report/:id", function(req, res) {
	if (req.session.user) {
		if (typeof req.params.id === "string") {
			manageUser.getUserInfoId(req.params.id, user => {
				if (user) {
					manageUser.updateUserOne(
						{ email: user.email },
						{ $set: { reports: user.reports + 1 } },
						() => {
							manageUser.updateUserOne(
								{ email: user.email },
								{
									$set: { rating: user.rating - user.reports }
								},
								() => {
									if (user.reports + 1 > 6)
										manageUser.updateUserOne(
											{ email: user.email },
											{ $set: { banned: true } },
											() => {
												res.redirect(
													"/block/" + req.params.id
												);
											}
										);
									else
										res.redirect("/block/" + req.params.id);
								}
							);
						}
					);
				} else res.redirect("/404");
			});
		} else res.redirect("/404");
	} else res.redirect("/404");
});
router.post("/file/uploads/profile/Third", function(req, res) {
	if (req.session.user) {
		IS.upload.single("Image4")(req, res, _err => {
			var picture = {
				Picture1:
					req.session.user.picture.Picture1 === null
						? "/images/" + req.session.user.picture.Picture1
						: req.session.user.picture.Picture1,
				Picture2:
					req.session.user.picture.Picture2 === null
						? "/images/" + req.session.user.picture.Picture2
						: req.session.user.picture.Picture2,
				Picture3:
					req.session.user.picture.Picture3 === null
						? "/images/" + req.session.user.picture.Picture3
						: req.session.user.picture.Picture3,
				Picture4: "/images/" + req.session.user.f1,
				Picture5:
					req.session.user.picture.Picture5 === null
						? "/images/" + req.session.user.picture.Picture5
						: req.session.user.picture.Picture5
			};
			var email = req.session.user.email;
			manageUser.updateUserOne(
				{ email: email },
				{ $set: { picture: picture } },
				function() {
					res.redirect("/profile");
				}
			);
		});
	} else res.end('{"msg":"404"}');
});

router.post("/file/uploads/profile/Fourth", function(req, res) {
	if (req.session.user) {
		IS.upload.single("Image5")(req, res, _err => {
			var picture = {
				Picture1:
					req.session.user.picture.Picture1 === null
						? "/images/" + req.session.user.picture.Picture1
						: req.session.user.picture.Picture1,
				Picture2:
					req.session.user.picture.Picture2 === null
						? "/images/" + req.session.user.picture.Picture2
						: req.session.user.picture.Picture2,
				Picture3:
					req.session.user.picture.Picture3 === null
						? "/images/" + req.session.user.picture.Picture3
						: req.session.user.picture.Picture3,
				Picture4:
					req.session.user.picture.Picture4 === null
						? "/images/" + req.session.user.picture.Picture4
						: req.session.user.picture.Picture4,
				Picture5: "/images/" + req.session.user.f1
			};
			var email = req.session.user.email;
			manageUser.updateUserOne(
				{ email: email },
				{ $set: { picture: picture } },
				function() {
					res.redirect("/profile");
				}
			);
		});
	} else res.end('{"msg":"404"}');
});

router.get("/forgotpass", function(req, res) {
	var adr = req.protocol + "://" + req.get("host") + req.url;
	var q = url.parse(adr, true);
	manageUser.getUserInfo(q.query.email, user => {
		if (user) {
			if (user["verification"] === q.query.verify)
				res.render("pages/profile/forgot", {
					email: user["email"],
					verify: user["verification"]
				});
			else res.redirect("/login");
		} else res.redirect("/404");
	});
});

module.exports = router;
