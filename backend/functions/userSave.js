const db = require('../database/db');
const crypt = require('bcrypt');
const mailer = require('../functions/sendmail');

function generatedUser(first, second, email, age, bio, likes, sex, sexuality) {
	db.mongo.connect(db.url, {useNewUrlParser: true}).then(db => {
		var dbo = db.db('Matcha');
		var password = "WeThinkCode_2018";
		// myAge = myAge.getFullYear()
		var date = new Date()
		crypt.hash(password, 10).then(hash => {
			var saveOptions = {
				username: first + second + (Math.floor(Math.random() * 2018)),
				firstname: first,
				surname: second,
				sex: sex.toString(),
				sexuality: sexuality.toString(),
				locationType: 0,
				location: [16.5 + (Math.random() * 17), -22 + (Math.random() * 12)],
				locationIp: [0,0],
				locationCustom: [0,0],
				locationBrowser: [0,0],
				verification: hash,
				isVerified: true,
				email_subscription:  false,
				email: email,
				password: hash,
				age: date.getFullYear() - age + "-" + (Math.floor(Math.random() * 12) + 1) + "-" + (Math.floor(Math.random() * 20) + 1),
				fame: 0,
				rating: 100,
				type: 'Generated',
				tags: (likes) ? likes : [],
				likes: [],
				blocks: [],
				likedBy: [],
				likedBy: [],
				viewedBy: [],
				reports: 0,
				banned: false,
				picture: {
					Picture1: '/default.jpeg',
					Picture2: '/default.jpeg',
					Picture3: '/default.jpeg',
					Picture4: '/default.jpeg',
					Picture5: '/default.jpeg'
				},
				Prof: '/default.jpeg',
				biography: bio,
				views: 1,
				rating: 100
			};
			dbo.collection('Users').insertOne(saveOptions).then(res => {
				db.close();
			}).catch(err => {
				console.log("Error Saving user " + err);
			});
		}).catch(err => {
			console.log("Cant hash becuase fucked up " + err);
		});
	}).catch(err => {
		console.log("Error saving user " + err);
	});
}

function userSave(email, password, uType, sub, url) {
	db.mongo.connect(db.url, {useNewUrlParser: true}).then(db => {
		var dbo = db.db('Matcha');
		crypt.hash(password, 10).then(hash => {
			var saveOptions = {
				username: null,
				firstname: null,
				surname: null,
				sex: "3",
				sexuality: "1",
				locationType: 0,
				location: [0,0],
				locationIp: [0,0],
				locationCustom: [0,0],
				locationBrowser: [0,0],
				verification: hash,
				isVerified: false,
				email_subscription: sub === 'true' ? true : false,
				email: email,
				password: password,
				age: 0,
				fame: 0,
				rating: 100,
				type: uType,
				tags: [],
				likes: [],
				blocks: [],
				likedBy: [],
				likedBy: [],
				viewedBy: [],
				reports: 0,
				banned: false,
				picture: {
					Picture1: null,
					Picture2: null,
					Picture3: null,
					Picture4: null,
					Picture5: null
				},
				Prof: null,
				biography: null,
				views: 1,
				rating: 100

			};
			dbo.collection('Users').insertOne(saveOptions).then(res => {
				mailer.sendVerifyEmail(email, url + hash);
				db.close();
			}).catch(err => {
				console.log("Error Saving user " + err);
			});
		}).catch(err => {
			console.log("Cant hash becuase fucked up " + err);
		});
	}).catch(err => {
		console.log("Error saving user " + err);
	});
}

function emailExists(email, cb) {
	db.mongo.connect(db.url, { useNewUrlParser: true }).then(db => {
		var dbo = db.db("Matcha");
		dbo.collection('Users').findOne({email: email}).then(res => {
			cb(res);
		}).catch(err => {
			console.log("Cant use email Exists => " + err);
		})
	}).catch(err => {
		console.log("Can't connect to database called by emailExists(" + email + ")");
	});
}

function getAll(cb) {
	db.mongo.connect(db.url, { useNewUrlParser: true }).then(db => {
		var dbo = db.db("Matcha");
		dbo.collection('Users').find({}).toArray().then(res => {
			cb(res);
		}).catch(err => {
			console.log("Cant use email Exists => " + err);
		})
	}).catch(err => {
		console.log("Can't connect to database called by getAll() -> " + err);
	});
}

function deleteUser(name)
{
	db.mongo.connect(db.url, { useNewUrlParser: true }).then(db => {
		var dbo = db.db("Matcha");
		dbo.collection('Users').deleteOne({username: name}).then(res => {
			
		}).catch(err => {
			console.log("Cant use email Exists => " + err);
		})
	}).catch(err => {
		console.log("Can't connect to database called by getAll() -> " + err);
	});
}

module.exports = {
	userSave: userSave,
	emailExists: emailExists,
	generatedUser: generatedUser,
	getAll: getAll,
	deleteUser: deleteUser
}