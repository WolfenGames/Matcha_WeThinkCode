const db = require('../database/db');

function deleteByUsername(user, cb) {
	db.mongo.connect(db.url, { useNewUrlParser: true }).then(db => {
		var dbo = db.db('Matcha');
		var query = { username: user};
		dbo.collection('Users').deleteOne(query).then(res => {
			cb("Suceesss");
			db.close();
		}).catch(err => {
			cb("Error");
			console.log("Can't deleteby one (user:: " + user + ") -> " + err);
		});
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
			db.close();
		}).catch(err => {
			console.log("Cant delete many called by deleteAll()");
		});
	}).catch(err => {
		console.log("Cant connect to database called by deleteAll");
	});
}

module.exports = {
	deleteByUsername: deleteByUsername,
	deleteAll: deleteAll
}