const db = require('../database/db');
const crypt = require('bcrypt');

function userSave(email, password, uType, sub) {
	db.mongo.connect(db.url, {useNewUrlParser: true}).then(db => {
		var dbo = db.db('Matcha');
		let hash = crypt.hashSync(email + password + Date(), 10);
		var saveOptions = {
			username: null,
			firstname: null,
			surname: null,
			sex: null,
			sexuality: null,
			verification: hash,
			isVerified: false,
			email_subscription: sub,
			email: email,
			password: password,
			age: 100,
			fame: 0,
			rating: 0,
			type: uType
		};
		dbo.collection('Users').insertOne(saveOptions).then(res => {
			db.close();
		}).catch(err => {
			console.log("Error Saving user " + err);
		});
	}).catch(err => {
		console.log("Error saving user " + err);
	});
}

module.exports = {
	userSave: userSave	
}