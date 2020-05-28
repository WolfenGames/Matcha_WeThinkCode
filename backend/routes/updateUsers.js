const express = require("express");
const router = express.Router();
const manageUser = require("../functions/userManagement");
const userFunc = require("../functions/userSave")
const aux = require("../functions/auxiliary");

var username_regex = /^[a-zA-Z0-9 ]{3,}$/;
var password_regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&_])[A-Za-z\d@$#!%*?&_]{8,}$/;
var email_regex = /^[_a-zA-Z0-9-]+(\.[_a-zA-Z0-9-]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*(\.[a-zA-Z]{2,10})$/;

router.post("/update/Email", aux.authHandlerPost, async function(req, res) {
		var newEmail = req.body.email;
		if (email_regex.test(newEmail))
		{
			manageUser.updateEmail(req.session.user._id, newEmail)
			res.end('{"msg": "OK"}');
		}
		else
			res.end('{"msg":"Error", "extra":"Needs to be a valid email adress"}');
});

router.post("/update/loc", (req, res) => {
	if (req.body && req.body.long && req.body.lat && req.session.user)
		manageUser.updateLoc(req.session.user);
	res.sendStatus(200);
});

router.post("/update/loc/custom", (req, res) => {
	if (req.body && req.body.long && req.body.lat && req.session.user) {
		let [long, lat] = [parseFloat(req.body.long), parseFloat(req.body.lat)];
		manageUser.setTypeOfLoc(req.session.user, "CUSTOM")
		manageUser.updateLocation(req.session.user, long, lat);
	}
	res.sendStatus(200);
});

router.post("/update/Biography", aux.authHandlerPost, function(req, res) {
	var biography = req.body.biography;
	let str_trunc = aux.text_truncate(biography, 150);
	manageUser.updateBio(req.session.user._id, str_trunc);
	res.end('{"msg": "OK"}');
});

router.post("/update/Gender", aux.authHandlerPost, function(req, res) {
	var gender = req.body.gender;
	manageUser.updateGender(req.session.user._id, gender)
	res.end('{"msg": "OK"}');
});

router.post("/update/Sex", aux.authHandlerPost, function(req, res) {
	var sex = req.body.sex
	manageUser.updateSex(req.session.user._id, sex);
	res.end('{"msg": "OK"}');
});

router.post("/update/Firstname", aux.authHandlerPost, function(req, res) {
	var fname = req.body.firstname;
	manageUser.updateFirstname(req.session.user._id, fname)
	res.end('{"msg": "OK"}');
});

router.post("/update/Lastname", aux.authHandlerPost, function(req, res) {
	var lname = req.body.lastname;
	manageUser.updateLastname(req.session.user._id, lname)
	res.end('{"msg": "OK"}');
});

router.post("/update/Dob", aux.authHandlerPost, function(req, res) {
	let id = req.session.user._id
	let age = req.body.dob
	manageUser.updateDOB(id, age)
	res.end('{"msg": "OK"}');
});

module.exports = router;
