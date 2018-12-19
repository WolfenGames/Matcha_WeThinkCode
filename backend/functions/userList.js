const db = require('../database/db');

module.exports = {
	ListUser(user, fn) {
		db.mongo.connect(db.url, {useNewUrlParser: true}).then(db => {
			var dbo = db.db('Matcha');
			var query = { location: {
				$nearSphere: {
					$geometry: {
						type: "Point",
						coordinates: user.location
						},
					$maxDistance: 10000
					}
				}
			}
			var sex, sexuality, usex = user.sex, usexuality = user.sexuality;
			console.log(usex);
			console.log(usexuality);
			//Deciding
			if (usexuality == '0') {
				console.log("Sexuality 1");
				if (usex == '0')
					sex = '0'
				if (usex == '1')
					sex = '1'
				if (usex == '2')
					sex = '2';
			}
			if (usexuality == '1') {
				console.log("Sexuality 2");
				if (usex == '0')
					sex = '1'
				if (usex == '1')
					sex = '0'
				if (usex == '2')
					sex = '2'
			}
			if (usexuality == '2') {
				console.log("Sexuality 3");
				sex = {$or: [{sex: '0', sex: '1', sex: '2'}]};
			}
			console.log(sex);
			console.log(sexuality);
			query = {
				location: query.location,
				sex: sex,
				sexuality: usexuality
			}
			console.log(query);
			dbo.collection('Users').find(query).sort({age: 1}).toArray().then(result => {
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