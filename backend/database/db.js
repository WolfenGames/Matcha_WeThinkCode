const mongo = require('mongodb').MongoClient;
"use strict";

const url = 'mongodb://localhost:27017/Matcha';

module.exports = {
	url,
	mongo,
	createCollection(collectionName) {
		mongo.connect(url, { useNewUrlParser: true }, function(err, db) {
			console.log("Conneting");
			if (err) throw err;
			var dbo = db.db('Matcha');
			dbo.createCollection(collectionName, function(err, res) {
				console.log("creating collection " + collectionName);
				if (err) throw err;
				res.createIndex({ email: 1}, {unique: true});
				db.close();
			});
		});	
	}
 };