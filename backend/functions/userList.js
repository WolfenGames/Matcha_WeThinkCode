const db = require('../database/db');

module.exports = {
	ListUser(fn) {
		db.mongo.connect(db.url, {useNewUrlParser: true}, function(err, db) {
			if (err) throw err;
			var dbo = db.db('Matcha');
			dbo.collection('Users').find({}).toArray(function(err, result) {
				if (err) throw err;
				fn(result);
			});
		});	
	}
}