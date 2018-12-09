const db = require('../database/db');

function verify(email, verify) {
	db.mongo.connect(db.url, { useNewUrlParser: true }).then(db => {
		var dbo = db.db('Matcha');
		var query = { email: email, verification: verify };
		var values = { $set: { isVerified: true }};
		dbo.collection('Users').updateOne(query, values).then(res => {
			db.close();
		}).catch(err => {
			console.log("Failed " + err + " Called by verify(" + email + "," + verify +")");
		})
	}).catch(err => {
		console.log("Cant connect to database called by verify(" + email + ","+verify+") Error: " + err);
	});
}

module.exports = {
	verify: verify
}