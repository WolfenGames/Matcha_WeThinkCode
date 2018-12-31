const db = require('../database/db');

module.exports = {
	ListUser(user, fn) {
		db.mongo.connect(db.url, {useNewUrlParser: true}).then(db => {
			var dbo = db.db('Matcha');
			var query = { banned: false,
				location: {
				$nearSphere: {
					$geometry: {
						type: "Point",
						coordinates: user.location
						},
					$maxDistance: 100000000000000000000000000000000000000000000000
					}
				}
			}
			dbo.collection('Users').find(query).toArray().then(result => {
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
			dbo.collection('Users').find({_id: {$in: prof_id}}).toArray().then(result => {
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
	},
	getMatchedUsers(user, fn) {
		var usersMatched = [];
		var likedBy = user.likedBy;
		var likes = user.likes;
		if (likedBy && likes) {
		likes.forEach(like => {
				likedBy.forEach(liker => {
					if (like == liker)
						usersMatched.push(liker);
				});
			});
		}
		db.mongo.connect(db.url, { useNewUrlParser: true }).then(dbs => {
			var dbo = dbs.db('Matcha');
			var prof_id = usersMatched.map(id => { return db._mongo.ObjectID(id) });
			dbo.collection('Users').find({ _id: { $in: prof_id } }).toArray().then(result => {
				fn(result);
			})
		}).catch(err => {
			fn(null); 
			console.log("Can't connect to database => " + err);
		});
	}
}