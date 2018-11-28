const db = require('../database/db');

module.exports = {
	ListUser(fn) {
		db.mongo.connect(db.url, {useNewUrlParser: true}).then(db => {
			var dbo = db.db('Matcha');
			dbo.collection('Users').find({}).toArray().then(result => {
				fn(result);
			}).catch(err => {
				console.log("Cant list users " + err);
			});
		}).catch(err => {
			console.log("Cant connect " + err);
		});
	}
}