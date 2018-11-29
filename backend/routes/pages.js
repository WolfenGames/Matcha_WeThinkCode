const express = require('express');
const router = express.Router();
const ListUsers = require('../functions/userList');
const DelteUsers = require('../functions/userManagement');
const FuncUser = require('../functions/userSave');
const bcrypt = require('bcrypt');

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
	FuncUser.userSave('Test@gmail.com', 'password', 'User', function(result){
		message = { err: result };
	});
	res.redirect('/admin');
});

router.get('/createAdmin', function(req, res) {
	message = {};
	if (!FuncUser.userSave('Admin@gmail.com', 'password', 'Admin'))
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
		FuncUser.userSave(email, hash, 'User', sub);
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

router.get('*', function(req, res) {
	res.render('pages/404');
});

module.exports = router;