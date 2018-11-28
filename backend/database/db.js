const mongo = require('mongodb').MongoClient;
"use strict";

const url = 'mongodb://localhost:27017/Matcha';
function createCollection(collectionName) {
	mongo.connect(url, { useNewUrlParser: true }).then(db => {
		var dbo = db.db('Matcha');
		dbo.createCollection(collectionName).then(res => {
			res.createIndex({email: 1}, {unique: true});
			db.close();
		}).catch(err => {
			console.log("Cant create collection {" + collectionName + "} due to -> " + err);
		});
	}).catch(err => {
		console.log("Cant connect to database called by createCollection(" + collectionName + ") due to -> " + err);
	})
}
module.exports = {
	url,
	mongo,
	createCollection: createCollection
 };