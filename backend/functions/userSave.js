const db = require('../database/db');
const crypt = require('bcrypt');
const mailer = require('../functions/sendmail');

function userSave(email, password, uType, sub, url) {
	db.mongo.connect(db.url, {useNewUrlParser: true}).then(db => {
		var dbo = db.db('Matcha');
		crypt.hash(password, 10).then(hash => {
			var saveOptions = {
				username: null,
				firstname: null,
				surname: null,
				sex: null,
				sexuality: null,
				location: null,
				verification: hash,
				isVerified: false,
				email_subscription: sub,
				email: email,
				password: password,
				age: 100,
				fame: 0,
				rating: 0,
				type: uType,
				tags: {}
			};
			dbo.collection('Users').insertOne(saveOptions).then(res => {
				mailer.sendVerifyEmail(email, url + hash);
				db.close();
			}).catch(err => {
				console.log("Error Saving user " + err);
			});
		}).catch(err => {
			console.log("Cant hash becuase fucked up");
		});
	}).catch(err => {
		console.log("Error saving user " + err);
	});
}

module.exports = {
	userSave: userSave	
}