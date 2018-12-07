const db = require('../database/db');

module.exports = {
	ListUser(fn) {
		db.mongo.connect(db.url, {useNewUrlParser: true}).then(db => {
			var dbo = db.db('Matcha');
			dbo.collection('Users').find({}).toArray().then(result => {
				fn(result);
				db.close();
			}).catch(err => {
				console.log("Cant list users " + err);
			});
            db.close();
		}).catch(err => {
			console.log("Cant connect " + err);
		});
	}
}