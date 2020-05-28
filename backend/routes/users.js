const express = require("express");
const router = express.Router();
const manageUser = require("../functions/userManagement");
const FuncUser = require("../functions/userSave");
const bcrypt = require("bcrypt");
const url = require("url");
const IS = require("../functions/image_save");
const notification = require("../functions/notification");
const aux = require('../functions/auxiliary')

var password_regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&_])[A-Za-z\d@$#!%*?&_]{8,}$/;

router.get("/view/:id", aux.authHandler, async function(req, res) {
	const user = await manageUser.getUserInfo(req.params.id)
	if (user)
	{

		const tags = await manageUser.getTags(user)
	
		//TODO: LOCATION
		user.location = [0,0]
	
		me_likey_arr = await manageUser.getLikes(req.session.user._id)
		me_likey_arr = me_likey_arr.map(e => e.likes)
		me_likey = (me_likey_arr.indexOf(user._id) !== -1)
		
		me_blocky_arr = await manageUser.getBlocks(req.session.user._id)
		me_blocky_arr = me_blocky_arr.map(e => e.blocks)
		me_blocky = (me_blocky_arr.indexOf(user._id) !== -1)
		
		views = await manageUser.getMyViews(user._id)
	
		await manageUser.viewUser(req.session.user._id, user._id)
	
		if (req.session.user._id === user._id)
			res.redirect("/profile")
		else {
			notification.addNotification(user, "<img src='"+req.session.user.profile_picture+"'>"+req.session.user.username+" VIEWED YOU O.O");
			res.render("potentials/profile", {
				user: req.session.user,
				req_user: user,
				tags: tags,
				views: views,
				highestView: -99,
				me_likey: me_likey,
				me_blocky: me_blocky
			});
		}
	}
	else
		res.redirect("/")
});

router.get("/block/:id", aux.authHandler, async function(req, res) {
	let user = await manageUser.getUserInfo(req.params.id)
	if (user) {
		notification.addNotification(user, "<img src='"+req.session.user.profile_picture+"'>"+req.session.user.username+" BLOCKED YOU </3");
		await manageUser.blockUser(req.session.user._id, user._id)
		res.redirect(`/view/${user._id}`)
	} else res.redirect("/404");
});

router.get("/unblock/:id", aux.authHandler, async function(req, res) {
	let user = await manageUser.getUserInfo(req.params.id)
	if (user) {
		notification.addNotification(user, "<img src='"+req.session.user.profile_picture+"'>"+req.session.user.username+" UNBLOCKED YOU <3");
		await manageUser.blockUser(req.session.user._id, user._id)
		res.redirect(`/view/${user._id}`)
	} else res.redirect("/404");
});

router.get("/like/:id", aux.authHandler, async function(req, res) {
	let user = await manageUser.getUserInfo(req.params.id)
	if (user) {
		notification.addNotification(user, "<img src='"+req.session.user.profile_picture+"'>"+req.session.user.username+" LIKED YOU <3");
		await manageUser.likeUser(req.session.user._id, user._id)
		res.redirect(`/view/${user._id}`)
	} else res.redirect("/404");
});

router.get("/unlike/:id", aux.authHandler, async function(req, res) {
	let user = await manageUser.getUserInfo(req.params.id)
	if (user) {
		notification.addNotification(user, "<img src='"+req.session.user.profile_picture+"'>"+req.session.user.username+" UNLIKED YOU </3");
		await manageUser.likeUser(req.session.user._id, user._id)
		res.redirect(`/view/${user._id}`)
	} else res.redirect("/404");
});

router.get("/unmatch/:id", aux.authHandler, async function(req, res) {
	let user = await manageUser.getUserInfo(req.params.id)
	if (user) {
		notification.addNotification(user, "<img src='"+req.session.user.profile_picture+"'>"+req.session.user.username+" UNMATCHED YOU </3");
		await manageUser.likeUser(req.session.user._id, user._id)
		res.redirect(`/`)
	} else res.redirect("/404");
});

router.post("/resetpass", async function(req, res) {
	var email = req.body.Email;
	var pass = req.body.oPassword;
	var cpass = req.body.cPassword;
	var verify = req.body.verify;
	if (pass == cpass) {
		if (password_regex.test(pass)) {
			let hash = bcrypt.hashSync(pass, 10);
			await manageUser.updatePassword(email, hash, verify);
			res.end('{"msg":"OK"}');
		} else
			res.end('{"msg":"Passwords need 1 Caps, 1 lower, 1 number, 1 special character, min 8 characters"}');
	} 
	else 
		res.end('{"msg":"Passwords dont match"}');
});

router.post("/user/updateLoc",aux.authHandlerPost, (req, res) => {
	if (req.body.long && req.body.lat) {
		manageUser.setGeoLocBrowser(req.session.user, req.body.long, req.body.lat);
		res.sendStatus(200);
	}
});

router.post("/user/locType", (req, res) => {
	if (req.body.locType && req.session.user) {
		var val = '';
		switch (req.body.locType) {
			case "IP":
				val = "IP";
				break;
			case "BROWSER":
				val = "BROWSER";
				break;
			case "CUSTOM":
				val = "CUSTOM";
				break;
			default:
				val = 'IP';
				break;
		}
		manageUser.setTypeOfLoc(req.session.user, val);
	}
	res.sendStatus(200);
});

router.get("/delete/:id", aux.authHandler, async (req, res) => {
	if (req.session.user.utype === "Admin") {
		await manageUser.deleteByUsername(req.params.id)
		res.redirect("/user/admin");
	} else res.redirect("/404");
});

router.get("/user/admin", aux.authHandler, async (req, res) => {
	if (req.session.user.utype === "Admin") {
		let results = await manageUser.getAllUsers()
		res.render("pages/profile/admin", {
			user: req.session.user,
			results: results
		})
	} else res.redirect("/404");
});

router.post("/file/uploads/profile/Main", aux.authHandler, function(req, res) {
	IS.upload.single("Image1")(req, res, _err => {
		let loc = "/images/" + req.file.filename
		manageUser.updateProfilePicture(req.session.user._id, loc);
		res.redirect("/profile")
	});
});

router.post("/file/uploads/profile/First", aux.authHandlerPost, function(req, res) {
	IS.upload.single("Image2")(req, res, _err => {
		let loc = "/images/" + req.file.filename
		manageUser.updateProfilePictureOne(req.session.user._id, loc);
		res.redirect("/profile")
	});
});

router.post("/file/uploads/profile/Second", aux.authHandlerPost, function(req, res) {
	IS.upload.single("Image3")(req, res, _err => {
		let loc = "/images/" + req.file.filename
		manageUser.updateProfilePictureTwo(req.session.user._id, loc);
		res.redirect("/profile")
	});
});

router.post("/file/uploads/profile/Third", aux.authHandlerPost, function(req, res) {
	IS.upload.single("Image4")(req, res, _err => {
		let loc = "/images/" + req.file.filename
		manageUser.updateProfilePictureThree(req.session.user._id, loc);
		res.redirect("/profile")
	});
});
	
router.post("/file/uploads/profile/Fourth", aux.authHandlerPost, function(req, res) {
	IS.upload.single("Image5")(req, res, _err => {
		let loc = "/images/" + req.file.filename
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
