const express = require("express");
const router = express.Router();
const manageUser = require("../functions/userManagement");
const FuncUser = require("../functions/userSave");
const UserList = require("../functions/userList")
const bcrypt = require("bcrypt");
const url = require("url");
const IS = require("../functions/image_save");
const db = require("../database/db");
const _mongo          = require('mongodb');
const notification = require("../functions/notification");
const aux = require('../functions/auxiliary')

var password_regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&_])[A-Za-z\d@$#!%*?&_]{8,}$/;

router.get("/view/:id", function(req, res) {
	if (req.session.user) {
		if (typeof req.params.id === "string") {
			manageUser.getUserInfoId(req.params.id, user => {
				if (user) {
					var sen = req.session.user._id;
					var rec = req.params.id;
					var oID =  new _mongo.ObjectID(sen);
						db.mongo
							.connect(db.url, { useNewUrlParser: true, useUnifiedTopology: true })
							.then(db => {
								var dbo = db.db("Matcha");
								return dbo.collection("Users")
									.findOne({_id: oID}, {username: 1})
							}).then(function(rem){
								notification.addNotification(rec ,"<img src='"+rem.Prof+"'>"+rem.username+" viewed your profile.");
							});
					manageUser.updateUserOne(
						{ email: user.email },
						{
							$set: { views: user.views + 1 },
							$addToSet: { viewedBy: req.session.user._id },
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
					var sen = req.session.user._id;
					var rec = req.params.id;
					var oID =  new _mongo.ObjectID(sen);
						db.mongo
							.connect(db.url, { useNewUrlParser: true, useUnifiedTopology: true })
							.then(db => {
								var dbo = db.db("Matcha");
								return dbo.collection("Users")
									.findOne({_id: oID}, {username: 1})
							}).then(function(rem){
								notification.addNotification(rec ,"<img src='"+rem.Prof+"'>"+rem.username+" BLOCKED YOU!!!");
							});
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
									notification.addNotification(user._id ,"<img src='"+req.session.user.Prof+"'>"+req.session.user.username+" UNBLOCKED YOU =(");
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
					var sen = req.session.user._id;
					var rec = req.params.id;
					var oID =  new _mongo.ObjectID(sen);
						db.mongo
							.connect(db.url, { useNewUrlParser: true, useUnifiedTopology: true })
							.then(db => {
								var dbo = db.db("Matcha");
								return dbo.collection("Users")
									.findOne({_id: oID}, {username: 1})
							}).then(function(rem){
								notification.addNotification(rec ,"<img src='"+rem.Prof+"'>"+rem.username+" LIKED YOU <3");
							});
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
					var sen = req.session.user._id;
					var rec = req.params.id;
					var oID =  new _mongo.ObjectID(sen);
						db.mongo
							.connect(db.url, { useNewUrlParser: true, useUnifiedTopology: true })
							.then(db => {
								var dbo = db.db("Matcha");
								return dbo.collection("Users")
									.findOne({_id: oID}, {username: 1})
							}).then(function(rem){
								notification.addNotification(rec ,"<img src='"+rem.Prof+"'>"+rem.username+" UNLIKED YOU =(");
							});
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
							console.log(user._id)
							notification.addNotification(user._id ,"<img src='"+req.session.user.Prof+"'>"+req.session.user.username+" UNBLOCKED YOU =(");
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
									notification.addNotification(user._id ,"<img src='"+req.session.user.Prof+"'>"+req.session.user.username+" UNMATCHED YOU =(");
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

router.post("/file/uploads/profile/Main", aux.authHandler, function(req, res) {
	IS.upload.single("Image1")(req, res, _err => {
		let loc = "/images/" + req.file.filename
		console.log(loc)
		manageUser.updateProfilePicture(req.session.user._id, loc);
		res.redirect("/profile")
	});
});

router.post("/file/uploads/profile/First", aux.authHandlerPost, function(req, res) {
	IS.upload.single("Image2")(req, res, _err => {
		let loc = "/images/" + req.file.filename
		console.log(loc)
		manageUser.updateProfilePictureOne(req.session.user._id, loc);
		res.redirect("/profile")
	});
});

router.post("/file/uploads/profile/Second", aux.authHandlerPost, function(req, res) {
	IS.upload.single("Image3")(req, res, _err => {
		let loc = "/images/" + req.file.filename
		console.log(loc)
		manageUser.updateProfilePictureTwo(req.session.user._id, loc);
		res.redirect("/profile")
	});
});

router.post("/file/uploads/profile/Third", aux.authHandlerPost, function(req, res) {
	IS.upload.single("Image4")(req, res, _err => {
		let loc = "/images/" + req.file.filename
		console.log(loc)
		manageUser.updateProfilePictureThree(req.session.user._id, loc);
		res.redirect("/profile")
	});
});
	
router.post("/file/uploads/profile/Fourth", aux.authHandlerPost, function(req, res) {
	IS.upload.single("Image5")(req, res, _err => {
		let loc = "/images/" + req.file.filename
		console.log(loc)
		manageUser.updateProfilePictureFour(req.session.user._id, loc);
		res.redirect("/profile")
	});
});
	
router.get("/forgotpass", async function(req, res) {
	var adr = req.protocol + "://" + req.get("host") + req.url;
	var q = url.parse(adr, true);
	let user = await manageUser.getUserInfoByEmail(q.query.email)
	if (user)
	{
		if (user["verify_key"] === q.query.verify)
			res.render("pages/profile/forgot", {
				email: user["email"],
				verify: user[""]
			})
		else
			res.redirect("/login")
	}
	else
		res.redirect("/404")
});

router.get("/report/:id", aux.authHandler, async function(req, res) {
	if (typeof req.params.id === "string") {
		let reported_user = await manageUser.getUserInfo(parseInt(req.params.id))
		if (reported_user)
		{
			// TODO: Maybe add back to the block thing
			manageUser.reportUser(req.session.user._id, reported_user._id)
		} else res.redirect("/404")
	} else res.redirect("/404");
});
	
module.exports = router;
