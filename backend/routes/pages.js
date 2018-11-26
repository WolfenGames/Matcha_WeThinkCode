const express = require('express');
const router = express.Router();

router.get('/', function(req, res) {
	console.log(req.session);
	if (req.session.email)
		console.log('session email');
	res.render('pages/index');
});

router.get('/about', function(req, res) {
	res.render('pages/about');
});

router.get('/profile', function(req, res) {
	res.render('pages/profile/profile');
})

router.get('/login', function(req, res) {
	res.render('pages/profile/login');
})


router.get('/signup', function(req, res) {
	res.render('pages/profile/signup');
})

module.exports = router;