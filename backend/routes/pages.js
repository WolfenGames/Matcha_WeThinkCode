const express = require('express');
const router = express.Router();
const ListUsers = require('../functions/userList');
const DeleteUsers = require('../functions/userManagement');
const FuncUser = require('../functions/userSave');
const bcrypt = require('bcrypt');
const verify = require('../functions/verify');
const login = require('../functions/login');
const url = require('url');
const getIP = require('ipware')().get_ip;

router.get('/', function(req, res) {
	if (!req.session.user)
		res.redirect('/login');
	else
		res.render('pages/index', { user: req.session.user, setup: req.session.setup });
});

router.get('/profile', function(req, res) {
	if (!req.session.user)
		res.redirect(404);
	res.render('pages/profile/profile', { user: req.session.user });
});

router.get('/login', function(req, res) {
	res.render('pages/profile/login', { user: req.session.user });
});

router.get('/delete/:name', function(req, res) {
	message = {};
	Deleteuser.deleteByUsername(req.params.name, function(reason) {
		message = { err: reason };
	});
	res.redirect('/admin', { user: req.session.user });
});

router.get('/deleteall', function(req, res) {
	DeleteUsers.deleteAll();
	res.redirect('/admin');
});

router.get('/create', function(req, res) {
	message = {};
	var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
	FuncUser.userSave('jwolf@student.wethinkcode.co.za', 'password', 'User', false, fullUrl);
	res.redirect('/admin', {user: req.session.user});
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
	res.redirect('/admin', { user: req.session.user });
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
	res.render('pages/profile/signup', { user: req.session.user });
})

router.get('/admin', function(req, res) {
	if (req.session.user){
		ListUsers.ListUser((result) => {
			res.render('pages/profile/admin', { results: result, user: req.session.user });
		});
	}else
		res.redirect(404);
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
		if (loginres){
			req.session.user = loginres;
			var user = loginres;
			if (!user['username'] || !user['firstname'] || !user['surname'] || !user['sex'] || !user['sexuality']
			|| !user['bio'] || !user['tags'])
				req.session.setup = false;
			res.end('{"msg": "OK"}');
		}else{
			res.end('{"msg": "Needs verified or cant be found"}');
		}
	});
})

router.get('*', function(req, res) {
	res.render('pages/404');
});

module.exports = router;