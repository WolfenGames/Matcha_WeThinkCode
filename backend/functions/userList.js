const db = require('../database/db');

module.exports = {
	ListUser(user, fn) {
		db.mongo.connect(db.url, {useNewUrlParser: true}).then(db => {
			var dbo = db.db('Matcha');
			dbo.collection('Users').find({location: {
				$nearSphere: {
					$geometry: {
						type: "Point",
						coordinates: user.location
					},
					$maxDistance: 20
				}
				}
			}).toArray().then(result => {
				fn(result);
				db.close();
			}).catch(err => {
				console.log("Cant list users " + err);
			});
            db.close();
		}).catch(err => {
			console.log("Cant connect " + err);
		});
	},
	getLikedUsers(user, fn) {
		db.mongo.connect(db.url, { useNewUrlParser: true }).then(dbs => {
			var dbo = dbs.db('Matcha');
			var prof_id = user.likes.map(id => { return  db._mongo.ObjectId(id) });
			dbo.collection('Users').find({email: user.email, _id: {$in: prof_id}}).toArray().then(result => {
				fn(result);
				dbs.close();
			}).catch(err => {
				console.log("Cant find users => " + err);
			})
		}).catch(err => {
			console.log("Cant connect to database => " + err)
		})
	},
	getBlockedUsers(user, fn) {
		db.mongo.connect(db.url, { useNewUrlParser: true }).then(dbs => {
			var dbo = dbs.db('Matcha');
			var prof_id = user.blocks.map(id => { return  db._mongo.ObjectId(id) });
			dbo.collection('Users').find({ _id: {$in: prof_id}}).toArray().then(result => {
				console.log(result);
				fn(result);
				dbs.close();
			}).catch(err => {
				console.log("Cant find users => " + err);
				fn(null);
			})
		}).catch(err => {
			fn(null);
			console.log("Cant connect to database => " + err)
		})
	}
}