const db = require('../database/db');

function deleteByUsername(email, cb) {
	db.mongo.connect(db.url, { useNewUrlParser: true }).then(db => {
		var dbo = db.db('Matcha');
		var query = { email: email};
		dbo.collection('Users').deleteOne(query).then(res => {
			cb("Suceesss");
		}).catch(err => {
			cb("Error");
			console.log("Can't deleteby one (email:: " + email + ") -> " + err);
		});
		db.close();
	}).catch(err => {
		cb("Cant connect to database");
		console.log("Cant connect to database called by deleteByUsername(" + user + ")");
	});
} 
function deleteAll() {
	db.mongo.connect(db.url, { useNewUrlParser: true }).then(db => {
		var dbo = db.db('Matcha');
		var query = {type: 'User'};
		dbo.collection('Users').deleteMany(query).then(res => {
		}).catch(err => {
			console.log("Cant delete many called by deleteAll()");
		});
		db.close();
	}).catch(err => {
		console.log("Cant connect to database called by deleteAll");
	});
}

function updateUserOne(query, set, cb){
	db.mongo.connect(db.url, { useNewUrlParser: true }).then(db => {
		var dbo = db.db('Matcha');
		dbo.collection('Users').updateOne(query, set).then(res => {
			cb(true);
		}).catch(err => {
			console.log("Cant update called by updateUserOne("+query+","+set+") due to => " + err);
			cb(false);
		});
		db.close();
	}).catch(err => {
		console.log("Can't connect to database called by updateUserOne(" + query + ", " + set + ") due to => " + err);
		cb(false);
	});
}

function getUserInfo(email, cb) {
	db.mongo.connect(db.url, { useNewUrlParser: true }).then(db => {
		var dbo = db.db('Matcha');
		dbo.collection('Users').findOne({email: email}).then(res => {
			cb(res);
			db.close();
		}).catch(err => {
			console.log("Cant fetch user " + err);
		})
	}).catch(err => {
		console.log("Cant connect to database " + err);
	})
}

function getUserInfoId(id, cb) {
	var validID = /^[0-9a-fA-F]{24}$/;
	if (validID.test(id)) {
		var o_id = new db._mongo.ObjectID(id);
		db.mongo.connect(db.url, { useNewUrlParser: true }).then(db => {
			var dbo = db.db('Matcha');
			if (o_id !== null)
			{
				dbo.collection('Users').findOne({_id: o_id}).then(res => {
					cb(res);
					db.close();
				}).catch(err => {
					console.log("Cant fetch user " + err);
				})
			}else
				cb(null)
		}).catch(err => {
			console.log("Cant connect to database " + err);
		})
	} else
		cb(null);
}

module.exports = {
	deleteByUsername: deleteByUsername,
	deleteAll: deleteAll,
	updateUserOne: updateUserOne,
	getUserInfoId: getUserInfoId,
	getUserInfo: getUserInfo
}