const express = require('express');
const router = express.Router();
const ListUsers = require('../functions/userList');
const DelteUsers = require('../functions/userManagement');
const FuncUser = require('../functions/userSave');
const bcrypt = require('bcrypt');

router.get('/', function(req, res) {
	res.render('pages/index');
});

router.get('/about', function(req, res) {
	res.render('pages/about');
});

router.get('/profile', function(req, res) {
	ListUsers.ListUser((result) => {
		res.render('pages/profile/profile', { users: result });
	});
})

router.get('/login', function(req, res) {
	res.render('pages/profile/login');
})

router.get('/delete/:name', function(req, res) {
	DelteUsers.deleteByUsername(req.params.name);
	res.redirect('/profile');
});

router.get('/deleteall', function(req, res) {
	DelteUsers.deleteAll();
	res.redirect('/profile');
});

router.get('/create', function(req, res) {
	FuncUser.userSave('Test@gmail.com', 'password', 'User');
	res.redirect('/profile');
});

router.get('/createAdmin', function(req, res) {
	FuncUser.userSave('Admin@gmail.com', 'password', 'Admin');
	res.redirect('/profile');
});

router.post('/User/Create', function(req, res) {
	const oPass = req.body.oPassword;
	const cPass = req.body.cPassword
	const email = req.body.Email;
	if (cPass == oPass) {
		let hash = bcrypt.hashSync(oPass, 10);
		FuncUser.userSave(email, hash, 'User');
	}
	res.redirect(200, '/');
});

router.get('/signup', function(req, res) {
	res.render('pages/profile/signup');
})

router.get('*', function(req, res) {
	res.render('pages/404');
})

module.exports = router;