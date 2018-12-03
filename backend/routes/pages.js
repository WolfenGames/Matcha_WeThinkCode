const express = require('express');
const router = express.Router();
const ListUsers = require('../functions/userList');
const DelteUsers = require('../functions/userManagement');
const FuncUser = require('../functions/userSave');
const bcrypt = require('bcrypt');
const verify = require('../functions/verify');
const login = require('../functions/login');
const url = require('url');

var message = {};

router.get('/', function(req, res) {
	res.render('pages/index');
});

router.get('/about', function(req, res) {
	res.render('pages/about');
});

router.get('/profile', function(req, res) {
		res.render('pages/profile/profile');
});

router.get('/login', function(req, res) {
	res.render('pages/profile/login');
});

router.get('/delete/:name', function(req, res) {
	message = {};
	DelteUsers.deleteByUsername(req.params.name, function(reason) {
		message = { err: reason };
	});
	res.redirect('/admin');
});

router.get('/deleteall', function(req, res) {
	DelteUsers.deleteAll();
	res.redirect('/admin');
});

router.get('/create', function(req, res) {
	message = {};
	var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
	FuncUser.userSave('jwolf@student.wethinkcode.co.za', 'password', 'User', false, fullUrl);
	res.redirect('/admin');
});

router.get('/createAdmin', function(req, res) {
	message = {};
	var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
	if (!FuncUser.userSave('Admin@gmail.com', 'password', 'Admin', fullUrl))
	{
		message = {
			error: "Can't create User -> Possible duplicate entry"
		}
	}
	res.redirect('/admin');
});

router.post('/User/Create', function(req, res) {
	const oPass = req.body.oPassword;
	const cPass = req.body.cPassword
	const email = req.body.Email;
	const sub = req.body.emailpref;
	if (cPass == oPass) {
		let hash = bcrypt.hashSync(oPass, 10);
		var fullUrl = req.protocol + '://' + req.get('host') + "/verify?email=" + email + "&verify=";
		FuncUser.userSave(email, hash, 'User', sub, fullUrl);
	}
	res.redirect(200, '/');
});

router.get('/signup', function(req, res) {
	res.render('pages/profile/signup');
})

router.get('/admin', function(req, res) {
	ListUsers.ListUser((result) => {
		res.render('pages/profile/admin', { users: result, message });
	});
});

router.get('/verify', function(req, res) {
	var adr = req.protocol + '://' + req.get('host') + req.url;
	var q = url.parse(adr, true);
	let mail = q.query.email;
	let verifyKey = q.query.verify;
	verify.verify(mail, verifyKey);
	res.redirect('/login');
});

router.get('/logout/user', function(req, res) {
	req.session.destroy();
	res.redirect('/');
});

router.post('/login/user', function(req, res) {
	login.login(req.body.email, req.body.password, function(loginres) {
		if (loginres !== 'none'){
			req.session.user = loginres['email'];
		}
	});
	res.redirect('/');
})

router.get('*', function(req, res) {
	res.render('pages/404');
});

module.exports = router;