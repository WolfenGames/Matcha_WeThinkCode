const express		= require('express');
const router		= express.Router();
const ListUsers		= require('../functions/userList');
const manageUser	= require('../functions/userManagement');
const FuncUser		= require('../functions/userSave');
const bcrypt		= require('bcrypt');
const verify		= require('../functions/verify');
const login			= require('../functions/login');
const url			= require('url');
const mailer		= require('../functions/sendmail');
const aux			= require('../functions/auxiliary');
const geoip			= require('geoip-lite');


var regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
var e_regex = /^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,10})$/;
var u_regex = /^[a-zA-Z0-9 ]{5,}$/;

router.get('/', function(req, res) {
	if (!req.session.user)
		res.redirect('/login');
	else
		res.render('pages/index', { user: req.session.user, setup: req.session.setup });
});

router.get('/profile', function(req, res) {
	if (!req.session.user)
		res.redirect(404);
	else
		res.render('pages/profile/profile', { user: req.session.user });
});

router.get('/login', function(req, res) {
	if (req.session.user)
		res.redirect('/');
	else
		res.render('pages/profile/login', { user: req.session.user });
});

router.post('/delete', function(req, res) {
	manageUser.deleteByUsername(req.body.email, function(reason) {
		if (reason) {
			res.end('{"msg": "OK", "extra": "You have deleted your account"}');
		} else {
			res.end('{"msg": "Failed", "extra": "Failed to delete your account"}');
		}
	});	
});

router.get('/deleteall', function(req, res) {
	manageUser.deleteAll();
	res.redirect('/admin');
});

router.post('/User/Create', function(req, res) {
	const oPass = req.body.oPassword;
	const cPass = req.body.cPassword
	const email = req.body.Email;
	const sub = req.body.emailpref;
	FuncUser.emailExists(email, function(result) {
		if (!result)
		{
			if (e_regex.test(email)) {
				if (regex.test(oPass) && regex.test(cPass))
				{
					if (cPass == oPass) {
						let hash = bcrypt.hashSync(oPass, 10);
						var fullUrl = req.protocol + '://' + req.get('host') + "/verify?email=" + email + "&verify=";
						FuncUser.userSave(email, hash, 'User', sub, fullUrl);
						res.end('{"msg": "OK"}');
					}else{
						res.end('{"msg": "Passwords dont match"}');
					}
				}
				else
					res.end('{"msg": "Passwords need 1 Caps, 1 lower, 1 number, 1 special character, min 8 characters"}');
			}else
				res.end('{"msg": "Please enter a valid email"}');
		}else
			res.end('{"msg":"Email already in use"}');
	});
});

router.get('/signup', function(req, res) {
	if (!req.session.user)
		res.render('pages/profile/signup', { user: req.session.user });
	else
		res.redirect('/');
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

router.post('/login/resend', function(req, res) {
	var email = req.body.email;
	if (e_regex.test(email)){
	if (email) {
			var fullUrl = req.protocol + '://' + req.get('host') + "/verify?email=" + email + "&verify=";
			mailer.resendVerify(email, fullUrl, function(ret) {
				if (ret)
					res.send('{"msg":"Verification sent"}');
				else
					res.send('{"msg":"No email associated with account"}');
			});
		}else
			res.send('{"msg":"No email Provided"}');
	}else
		res.end('{"msg":"Please enter a valid email address"}')
});

router.post('/login/user', function(req, res) {
	if (e_regex.test(req.body.email)){
		if (regex.test(req.body.password)){
			login.login(req.body.email, req.body.password, function(loginres) {
				if (loginres){
					req.session.user = loginres;
					var user = loginres;
					if (!user['username'] || !user['firstname'] || !user['surname'] || !user['sex'] || !user['sexuality']
					|| !user['bio'] || !user['tags'])
						aux.getIp(result => {
							var loc = geoip.lookup(result);
							req.session.loc = loc.ll;
							manageUser.updateUserOne({email: req.session.user.email}, {$set : {location: req.session.loc}}, cb => {
								
							});
						});
						req.session.setup = false;
					res.end('{"msg": "OK"}');
				}else{
					res.end('{"msg": "Needs to be verified or can\'t be found"}');
				}
			});
		}
		else
			res.end('{"msg":"Passwords need 1 Caps, 1 lower, 1 number, 1 special character, min 8 characters"}')
	}else
		res.end('{"msg":"Please enter a valid email address"}')
})

router.post('/login/forgot', function(req, res) {
	var email = req.body.email;
	if (e_regex.test(email)){
		if (email) {
				var fullUrl = req.protocol + '://' + req.get('host') + "/verify?email=" + email + "&verify=";
				mailer.sendPassForget(email, fullUrl, function(ret) {
					if (ret)
						res.send('{"msg":"Forgot password sent"}');
					else
						res.send('{"msg":"No email associated with account"}');
				});
			}else
				res.send('{"msg":"No email Provided"}');
	}else
		res.end('{"msg":"Please enter a valid email address"}')
});

router.post('/update/Email', function(req, res) {
	if (req.session.user)
	{
		var newEmail = req.body.email;
		if (e_regex.test(newEmail)) {
			var query = { email: req.session.user.email};
			var set = { $set: { email: newEmail }};
			manageUser.updateUserOne(query, set, function(result) {
				if (result) {
					req.session.user.email = newEmail;
					res.end('{"msg": "OK"}');
				}
				else
					res.end('{"msg": "Email could not be updated"}')
			});
		}else
			res.end('{"msg":"Error", "extra":"Needs to be a valid email adress"}');
	}else
		res.end('{"msg":"Need to be logged in to do this"}');
});

router.post('/update/Username', function(req, res) {
	if (req.session.user)
	{
		var newusername = req.body.username;
		if (newusername && newusername.length > 0 && u_regex.test(newusername))
		{
			var query = { email: req.session.user.email};
			var set = { $set: { username: newusername }};
			manageUser.updateUserOne(query, set, function(result) {
				if (result) {
					req.session.user.username = newusername;
					res.end('{"msg": "OK"}');
				}
				else
					res.end('{"msg": "Username could not be updated"}')
			});
		}else
			res.end('{"msg":"Error", "extra":"Username can\'t be empty or null, Only spaces no special characters"}');
	}else
		res.end('{"msg":"Need to be logged in to do this"}');
});

router.post('/update/Biography', function(req, res) {
	if (req.session.user)
	{
		var biography = req.body.biography;
		aux.text_truncate(biography, 150, function(result_string) {
			var query = { email: req.session.user.email};
			var set = { $set: { biography: result_string }};
			manageUser.updateUserOne(query, set, function(result) {
				if (result) {
					req.session.user.biography = result_string;
					res.end('{"msg": "OK"}');
				}
				else
					res.end('{"msg": "Username could not be updated"}')
			});
		});
	}else
		res.end('{"msg":"Need to be logged in to do this"}');
});

router.post('/update/Gender', function(req, res) {
	if (req.session.user)
	{
		var gender = req.body.gender;
		var query = { email: req.session.user.email};
		var set = { $set: { sex: gender }};
		manageUser.updateUserOne(query, set, function(result) {
			if (result) {
				req.session.user.sex = gender;
				res.end('{"msg": "OK"}');
			}
			else
				res.end('{"msg": "Gender could not be updated"}')
		});
	}else
		res.end('{"msg":"Need to be logged in to do this"}');
});

router.post('/update/Sex', function(req, res) {
	if (req.session.user)
	{
		var sex = req.body.sex;
		var query = { email: req.session.user.email};
		var set = { $set: { sexuality: sex }};
		manageUser.updateUserOne(query, set, function(result) {
			if (result) {
				req.session.user.sexuality = sex;
				res.end('{"msg": "OK"}');
			}
			else
				res.end('{"msg": "Sex could not be updated"}')
		});
	}else
		res.end('{"msg":"Need to be logged in to do this"}');
});

router.post('/update/Firstname', function(req, res) {
	if (req.session.user)
	{
		var fname = req.body.firstname;
		var query = { email: req.session.user.email};
		var set = { $set: { firstname: fname }};
		manageUser.updateUserOne(query, set, function(result) {
			if (result) {
				req.session.user.firstname = fname;
				res.end('{"msg": "OK"}');
			}
			else
				res.end('{"msg": "Sex could not be updated"}')
		});
	}else
		res.end('{"msg":"Need to be logged in to do this"}');
});

router.get('*', function(req, res) {
	res.render('pages/404');
});

module.exports = router;