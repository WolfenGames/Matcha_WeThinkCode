const db = require('../database/db');

module.exports = {
	deleteByUsername(user) {
		db.mongo.connect(db.url, {useNewUrlParser: true}, function(err, db) {
			if (err) throw err;
			var dbo = db.db('Matcha');
			var query = { username: user };
			dbo.collection('Users').deleteOne(query, function(err, res) {
				if (err) throw err;
				db.close();
			});
		});
	},
	deleteAll() {
		db.mongo.connect(db.url, {useNewUrlParser: true}, function(err, db) {
			if (err) throw err;
			var dbo = db.db('Matcha');
			var query = { type: 'User' };
			dbo.collection('Users').deleteMany(query, function(err, res) {
				if (err) throw err;
				db.close();
			});
		});
	}
}