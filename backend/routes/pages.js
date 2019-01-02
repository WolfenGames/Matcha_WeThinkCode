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
const tags			= require('../functions/tags');
const IS			= require('../functions/image_save');
const db			= require('../database/db');

var password_regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
var email_regex = /^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,10})$/;
var username_regex = /^[a-zA-Z0-9 ]{5,}$/;

router.get('/', function(req, res) {
	if (!req.session.user)
		res.redirect('/login');
	else{
		manageUser.getUserInfo(req.session.user.email, result => {
			var user = req.session.user;
			req.session.setup = (!user['username'] || !user['firstname'] || !user['surname'] || !user['sex'] || !user['sexuality']
					|| !user['biography'] || !user['Prof']) ?
						false : true;
			req.session.user = result;
			ListUsers.ListUser(user, result => {
				res.render('pages/index', { user: req.session.user, users: result, setup: req.session.setup });
			})
		})
	}
});

router.get('/profile', function(req, res) {
	if (!req.session.user)
		res.redirect('/404');
	else
	{
		manageUser.getUserInfo(req.session.user.email, result => {
			req.session.user = result;
			res.render('pages/profile/profile', { user: req.session.user, usertags: result.tags});
		})
	}
});

router.get('/login', function(req, res) {
	if (req.session.user)
		res.redirect('/');
	else
		res.render('pages/profile/login', { user: req.session.user });
});

router.post('/delete', function(req, res) {
	if (req.session.user) {
		manageUser.deleteByUsername(req.body.email, function(reason) {
			if (reason) {
				res.end('{"msg": "OK", "extra": "You have deleted your account"}');
			} else {
				res.end('{"msg": "Failed", "extra": "Failed to delete your account"}');
			}
		});
	}else
		res.end('{"msg":"404"}');
});

router.post('/User/Create', function(req, res) {
	const oPass = req.body.oPassword;
	const cPass = req.body.cPassword
	const email = req.body.Email;
	const sub = req.body.emailpref;
	FuncUser.emailExists(email, function(result) {
		if (!result)
		{
			if (email_regex.test(email)) {
				if (password_regex.test(oPass) && password_regex.test(cPass))
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
	if (email_regex.test(email)){
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
	if (email_regex.test(req.body.email)){
		if (password_regex.test(req.body.password)){
			login.login(req.body.email, req.body.password, function(loginres) {
				if (loginres){
					req.session.user = loginres;
					var user = loginres;
					if (!user['username'] || !user['firstname'] || !user['surname'] || !user['sex'] || !user['sexuality']
					|| !user['biography'])
						req.session.setup = false;
					else
						req.session.setup = true;
					aux.getIp(result => {
						if (result)
						{
							var loc = geoip.lookup(result);
							if (!loc)
							{
								loc.ll[0] = 0;
								loc.ll[1] = 0;
							}
							req.session.loc = [loc.ll[1], loc.ll[0]];
							manageUser.updateUserOne({email: req.session.user.email}, {$set : {location: req.session.loc}}, cb => {
									res.end('{"msg": "OK"}');
							});
						}
						else
							res.end('{"msg": "error???"}');
					});
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
	if (email_regex.test(email)){
		if (email) {
				var fullUrl = req.protocol + '://' + req.get('host') + "/forgotpass/?email=" + email + "&verify=";
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
		if (email_regex.test(newEmail)) {
			var query = { email: req.session.user.email};
			var set = { $set: { email: newEmail }};
			manageUser.updateUserOne(query, set, function(result) {
				if (result) {
					req.session.user.email = newEmail;
					if (!newEmail)
						req.session.setup = false;
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
		if (newusername && newusername.length > 0 && username_regex.test(newusername))
		{
			var query = { email: req.session.user.email};
			var set = { $set: { username: newusername }};
			manageUser.updateUserOne(query, set, function(result) {
				if (result) {
					req.session.user.username = newusername;
					if (!newusername)
						req.session.setup = false;
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
					if (!result_string)
						req.session.setup = false;
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

router.post('/update/Lastname', function(req, res) {
	if (req.session.user)
	{
		var lname = req.body.lastname;
		var query = { email: req.session.user.email};
		var set = { $set: { surname: lname }};
		manageUser.updateUserOne(query, set, function(result) {
			if (result) {
				req.session.user.surname = lname;
				if (!lname)
					req.session.setup = false;
				res.end('{"msg": "OK"}');
			}
			else
				res.end('{"msg": "Sex could not be updated"}')
		});
	}else
		res.end('{"msg":"Need to be logged in to do this"}');
});

router.post('/update/Dob', function(req, res) {
	if (!req.session.user)
		res.redirect('/404');
	manageUser.updateUserOne({email: req.session.user.email}, { $set: {age: req.body.dob}}, res =>
	{
		
	});
	res.send('{"msg":"OK"}');
})

router.get('/tags/get', function(req, res) {
	if (!req.session.user) {
		tags.getTags(result => {
			if (result)
				res.json(result);
			else
				res.json({});
		})	
	}
	else
		res.redirect('/404');
});

router.post('/tags/set', function(req, res) {
	if (req.session.user)
	{
		tags.setTags(req.body.tag, req.session.user.email, res => {
			req.session.user.tags = res;
		});
	}
	res.send('{"msg":"OK"}');
});

router.post('/tag/delete', function(req, res) {
	if (req.session.user)
	{
		tags.removeTag(req.session.user.email, req.body.tag);
	}
	res.send('{"msg":"OK"}');
});

router.get('/tags/get/mine', function(req, res) {
	if (req.session.user) {
		tags.getUpdatedTags(req.session.user.email, result => {
			if (result)
				res.json(result);
			else
				res.json({});
		});
	}
	else
		res.redirect('/404');
});


router.post('/file/uploads/profile/Main', function(req, res) {
	if (req.session.user)
	{
		IS.upload.single('Image1')(req, res, err => {
			var picture = {
				Picture1: "/images/" + req.session.user.f1,
				Picture2: req.session.user.picture.Picture1 === null ? "/images/" + req.session.user.picture.Picture1 : req.session.user.picture.Picture2,
				Picture3: req.session.user.picture.Picture1 === null ? "/images/" + req.session.user.picture.Picture1 : req.session.user.picture.Picture3,
				Picture4: req.session.user.picture.Picture1 === null ? "/images/" + req.session.user.picture.Picture1 : req.session.user.picture.Picture4,
				Picture5: req.session.user.picture.Picture1 === null ? "/images/" + req.session.user.picture.Picture1 : req.session.user.picture.Picture5,
			}
			var email = req.session.user.email;
			manageUser.updateUserOne({email: email}, {$set : {picture: picture, Prof: "/images/" + req.session.user.f1}}, function() {
					res.redirect("/profile");
			})
		})
	}else
		res.end('{"msg":"404"}');
});

router.post('/file/uploads/profile/First', function(req, res) {
	if (req.session.user)
	{
		IS.upload.single('Image2')(req, res, err => {
			var picture = {
				Picture1: req.session.user.picture.Picture1 === null ? "/images/" + req.session.user.picture.Picture1 : req.session.user.picture.Picture1,
				Picture2: "/images/" + req.session.user.f1,
				Picture3: req.session.user.picture.Picture3 === null ? "/images/" + req.session.user.picture.Picture3 : req.session.user.picture.Picture3,
				Picture4: req.session.user.picture.Picture4 === null ? "/images/" + req.session.user.picture.Picture4 : req.session.user.picture.Picture4,
				Picture5: req.session.user.picture.Picture5 === null ? "/images/" + req.session.user.picture.Picture5 : req.session.user.picture.Picture5,
			}
			var email = req.session.user.email;
			manageUser.updateUserOne({email: email}, {$set : {picture: picture}}, function() {
					res.redirect("/profile");
			})
		})
	}
	else
	res.end('{"msg":"404"}');
});

router.post('/file/uploads/profile/Second', function(req, res) {
	if (req.session.user)
	{
		IS.upload.single('Image3')(req, res, err => {
			var picture = {
				Picture1: req.session.user.picture.Picture1 === null ? "/images/" + req.session.user.picture.Picture1 : req.session.user.picture.Picture1,
				Picture2: req.session.user.picture.Picture2 === null ? "/images/" + req.session.user.picture.Picture2 : req.session.user.picture.Picture2,
				Picture3: "/images/" + req.session.user.f1,
				Picture4: req.session.user.picture.Picture4 === null ? "/images/" + req.session.user.picture.Picture4 : req.session.user.picture.Picture4,
				Picture5: req.session.user.picture.Picture5 === null ? "/images/" + req.session.user.picture.Picture5 : req.session.user.picture.Picture5,
			}
			var email = req.session.user.email;
			manageUser.updateUserOne({email: email}, {$set : {picture: picture}}, function() {
					res.redirect("/profile");
			})
		})
	}
	else
		res.end('{"msg":"404"}');
});

router.post('/file/uploads/profile/Third', function(req, res) {
	if (req.session.user)
	{
		IS.upload.single('Image4')(req, res, err => {
			var picture = {
				Picture1: req.session.user.picture.Picture1 === null ? "/images/" + req.session.user.picture.Picture1 : req.session.user.picture.Picture1,
				Picture2: req.session.user.picture.Picture2 === null ? "/images/" + req.session.user.picture.Picture2 : req.session.user.picture.Picture2,
				Picture3: req.session.user.picture.Picture3 === null ? "/images/" + req.session.user.picture.Picture3 : req.session.user.picture.Picture3,
				Picture4: "/images/" + req.session.user.f1,
				Picture5: req.session.user.picture.Picture5 === null ? "/images/" + req.session.user.picture.Picture5 : req.session.user.picture.Picture5,
			}
			var email = req.session.user.email;
			manageUser.updateUserOne({email: email}, {$set : {picture: picture}}, function() {
					res.redirect("/profile");
			})
		})
	}else
	res.end('{"msg":"404"}');
});

router.post('/file/uploads/profile/Fourth', function(req, res) {
	if (req.session.user)
	{
		IS.upload.single('Image5')(req, res, err => {
			var picture = {
				Picture1: req.session.user.picture.Picture1 === null ? "/images/" + req.session.user.picture.Picture1 : req.session.user.picture.Picture1,
				Picture2: req.session.user.picture.Picture2 === null ? "/images/" + req.session.user.picture.Picture2 : req.session.user.picture.Picture2,
				Picture3: req.session.user.picture.Picture3 === null ? "/images/" + req.session.user.picture.Picture3 : req.session.user.picture.Picture3,
				Picture4: req.session.user.picture.Picture4 === null ? "/images/" + req.session.user.picture.Picture4 : req.session.user.picture.Picture4,
				Picture5: "/images/" + req.session.user.f1,
			}
			var email = req.session.user.email;
			manageUser.updateUserOne({email: email}, {$set : {picture: picture}}, function() {
					res.redirect("/profile");
			})
		})
	}else
	res.end('{"msg":"404"}');
});

router.get('/forgotpass', function(req, res) {
	var adr = req.protocol + '://' + req.get('host') + req.url;
	var q = url.parse(adr, true);
	manageUser.getUserInfo(q.query.email, user => {
		if (user)
		{
			if (user['verification'] === q.query.verify)
				res.render('pages/profile/forgot', {email: user['email'], verify: user['verification']});
			else
				res.redirect('/login');
		}else
			res.redirect('/404');
	});
});

router.get('/view/:id', function(req, res) {
	if (req.session.user){
		if (typeof req.params.id === 'string') {
			manageUser.getUserInfoId(req.params.id, user => {
				if (user)
				{
					manageUser.updateUserOne({email: user.email}, { $set: {views: user.views + 1}}, () => {
						res.render('potentials/profile', { user: req.session.user, req_user: user });
					})
				}
				else
					res.redirect('/404');
			})
		}
		else
			res.redirect('/404');
	} else
		res.redirect('/404');
})

router.get('/block/:id', function(req, res) {
	if (req.session.user) {
		if (typeof req.params.id === 'string') {
			manageUser.getUserInfoId(req.params.id, user => {
				if (user) {
					manageUser.updateUserOne({email: req.session.user.email}, {
						$addToSet: {
							blocks: user._id
						}
					}, result => {
						manageUser.getUserInfo(req.session.user.email, fn => {
							req.session.user = fn;
							res.redirect('/unlike/' + req.params.id);
						})
					});
				}
				else
					res.redirect('/404');
			})
		}
		else
			res.redirect('/404');
	}
	else
		res.redirect('/404');
})

router.get('/unblock/:id', function(req, res) {
	if (req.session.user) {
		if (typeof req.params.id === 'string') {
			manageUser.getUserInfoId(req.params.id, user => {
				if (user) {
					manageUser.updateUserOne({email: req.session.user.email}, {
						$pull: {
							blocks: user._id
						}
					}, result => {
						manageUser.getUserInfo(req.session.user.email, fn => {
							req.session.user = fn;
							res.redirect('/');
						})
					});
				}
				else
					res.redirect('/404');
			})
		}
		else
			res.redirect('/404');
		}
	else
		res.redirect('/404');
})


router.get('/like/:id', function(req, res) {
	if (req.session.user) {
		if (typeof req.params.id === 'string') {
			manageUser.getUserInfoId(req.params.id, user => {
				if (user)
				{
					var id = db._mongo.ObjectId(req.params.id);
					manageUser.updateUserOne( { email: req.session.user.email }, { $addToSet: { likes: req.params.id } }, () => {
						manageUser.updateUserOne( { _id: id }, { $addToSet: { likedBy: req.session.user._id } }, () => {
							res.redirect('/');
						})
					})
				}
				else
					res.redirect('/404');
			})
		}
		else
			res.redirect('/404');
	}
	else
		res.redirect('/404');
})

router.get('/unlike/:id', function(req, res) {
	if (req.session.user) {
		if (typeof req.params.id === 'string') {
			manageUser.getUserInfoId(req.params.id, user => {
				if (user)
				{
					var id = db._mongo.ObjectId(req.params.id);
					manageUser.updateUserOne( { email: req.session.user.email }, { $pull: { likes: req.params.id } }, () => {
						manageUser.updateUserOne( { _id: id }, { $pull: { likedBy: req.session.user._id } }, () => {
							res.redirect('/');
						})
					})
				}
				else
					res.redirect('/404');
			})
		}
		else
			res.redirect('/404');
	}
	else
		res.redirect('/404');
})

router.get('/unblock/:id', function(req, res) {
	if (req.session.user) { 
		if (typeof req.params.id === 'string') {
			manageUser.getUserInfoId(req.params.id, user => {
				if (user)
				{
					manageUser.updateUserOne( { email: req.session.user.email }, { $pull: { blocks: req.params.id } }, () => {
							res.redirect('/');
					})
				}
				else
					res.redirect('/404');
			})
		}
		else
			res.redirect('/404');
	}
	else
		res.redirect('/404');
})

router.get('/unmatch/:id', function(req, res) {
	if (req.session.user) {
		if (typeof req.params.id === 'string') {
			manageUser.getUserInfoId(req.params.id, user => {
				if (user)
				{
					var id = db._mongo.ObjectId(req.params.id);
					manageUser.updateUserOne( { email: req.session.user.email }, { $pull: { likes: req.params.id } }, () => {
						manageUser.updateUserOne( { _id: id }, { $pull: { likedBy: req.session.user._id } }, () => {
							res.redirect('/');
						})
					})
				}
				else
					res.redirect('/404');
			})
		}
		else
			res.redirect('/404');
	}
	else
		res.redirect('/404');
})

router.post('/resetpass', function(req, res) {
	var email = req.body.Email;
	var pass = req.body.oPassword;
	var cpass = req.body.cPassword;
	if (pass == cpass)
	{
		if (password_regex.test(pass))
		{
			let hash = bcrypt.hashSync(pass, 10);
			manageUser.updateUserOne({email: email, verification: verify}, {$set : {password: hash}}, result => {
				if (result)
					res.end('{"msg":"OK"}');
				else
					res.end('{"msg":"Could not update Password"}')
			})
		}else
			res.end('{"msg":"Passwords need 1 Caps, 1 lower, 1 number, 1 special character, min 8 characters"}');
	}else
		res.end('{"msg":"Passwords dont match"}');
});

router.get('/likes', function(req, res) {
	if (req.session.user) {
		ListUsers.getLikedUsers(req.session.user, likes => {
			res.render('potentials/likes', {user: req.session.user, likes})
		})
	}
	else
		res.redirect('/404');
})

router.get('/blocks', function(req, res) {
	if (req.session.user) {
		ListUsers.getBlockedUsers(req.session.user, blocks => {
			res.render('potentials/blocks', {user: req.session.user, blocks})
		})
	}
	else
		res.redirect('/404');
})

router.get('/matches', function(req, res) {
	if (req.session.user) {
		ListUsers.getMatchedUsers(req.session.user, result => {
			res.render('potentials/matches', {user: req.session.user, matches: result });
		})
	}
	else
		res.redirect('/404');
})

router.get('/report/:id', function(req, res) {
	if (req.session.user){
		if (typeof req.params.id === 'string') {
			manageUser.getUserInfoId(req.params.id, user => {
				if (user)
				{
					manageUser.updateUserOne({email: user.email}, { $set: {reports: user.reports + 1}}, () => {
						res.redirect('/block/' + req.params.id);
					})
				}
				else
					res.redirect('/404');
			})
		}
		else
			res.redirect('/404');
	}
	else
		res.redirect('/404');
})

router.get('/generate', function(req, res) {
	require('../functions/generator').UserGenerator();
	res.redirect('/');
})


router.get('/resetall', function(req, res) {
	db.mongo.connect(db.url, { useNewUrlParser: true }).then(dbs => {
		var dbo = dbs.db('Matcha');
		dbo.collection('Users').deleteMany({type: "Generated"}).then(result => {
			res.redirect('/');
		})
	})
})

router.get('/iotest', function(req, res) {
	res.render('pages/io');
})

router.post('*', function(req, res) {
	res.end('{"msg":"404"}');
});


router.get('*', function(req, res) {
	res.render('pages/404');
});

module.exports = router;