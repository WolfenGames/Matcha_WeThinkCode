const db = require('../database/db');

module.exports = {
	ListUser(user, fn) {
		db.mongo.connect(db.url, {useNewUrlParser: true}).then(db => {
			var dbo = db.db('Matcha');

			var check = [];
			if (user['sex'] === "3")
			{
				check.push( { sex: "3" });
			} else {
				if (user['sexuality'] === "3")
				{
					check.push( { sexuality: "1", sex: user['sex'] } );
					check.push( { sexuality: "3", sex: user['sex'] } );
				}
				if (user['sexuality'] === "2")
				{
					check.push( { sexuality: "1", sex: user['sex'] === "1" ? "2" : "1" } );
					check.push( { sexuality: "2", sex: user['sex'] === "1" ? "2" : "1" } );
				}
				if (user['sexuality'] === "1")
				{
					check.push( { sexuality: "1", sex: "1" } );
					check.push( { sexuality: "1", sex: "2" } );
					check.push( { sex: user['sex'] === "1" ? "2" : "1", sexuality: "2" } );
					check.push( { sex: user['sex'], sexuality: "3" } );
				}
			}
			
			var query = {
				$or: ((check.length === 0) ? [{}] : check),
				banned: false,
				location: {
				$nearSphere: {
					$geometry: {
						type: "Point",
						coordinates: user.location
						},
					$maxDistance: 1000 * 1000
					}
				}
			}
			dbo.collection('Users').find(query).toArray().then(result => {
				fn(result);
			}).catch(err => {
				console.log("Cant list users " + err);
			});
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
	getViewedUsers(user, fn) {
		db.mongo.connect(db.url, { useNewUrlParser: true }).then(dbs => {
			var dbo = dbs.db('Matcha');
			var prof_id = user.viewedBy.map(id => { return  db._mongo.ObjectId(id) });
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