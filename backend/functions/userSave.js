const db = require('../database/db');

module.exports = {
	userSave(email, password, uType) {
		db.mongo.connect(db.url, {useNewUrlParser: true}).then(db => {
			var dbo = db.db('Matcha');
			var saveOptions = {
				username: 'To Be added Later ' + Date(),
				firstname: 'To Be added Later ' + Date(),
				surname: 'To Be added Later ' + Date(),
				sex: 'To Be added Later ' + Date(),
				sexuality: 'To Be added Later ' + Date(),
				email: email,
				password: password,
				age: 100,
				fame: 0,
				rating: 0,
				type: uType
			};
			dbo.collection('Users').insertOne(saveOptions).then(res => {
				db.close();
				return true;
			}).catch(err => {
				console.log("Error Saving user " + err);
				return false;
			});
		}).catch(err => {
			console.log("Error savinf user " + err);
			return false;
		});
	}
}