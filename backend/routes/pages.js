const express = require('express');
const router = express.Router();
const ListUsers = require('../functions/userList');
const DelteUsers = require('../functions/userManagement');
const FuncUser = require('../functions/userSave');

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
	FuncUser.userSave('Test', 'Test@gmail.com', 'Any');
	res.redirect('/profile');
});

router.get('/createAdmin', function(req, res) {
	FuncUser.userSave('Admin', 'Admin@gmail.com', 'Any', 'Admin');
	res.redirect('/profile');
});

router.get('/signup', function(req, res) {
	res.render('pages/profile/signup');
})

module.exports = router;