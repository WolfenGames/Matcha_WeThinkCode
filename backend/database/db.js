const mongo = require("mongodb").MongoClient;
const _mongo = require("mongodb");
("use strict");

const url = "mongodb://localhost:27017/Matcha";

function createCollection(collectionName) {
	mongo
		.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
		.then(db => {
			var dbo = db.db("Matcha");
			dbo.createCollection(collectionName)
				.then(res => {
					res.createIndex({ email: 1 }, { unique: true });
					res.createIndex({ location: "2dsphere" });
					res.createIndex({ locationIp: "2dsphere" });
					res.createIndex({ locationCustom: "2dsphere" });
					res.createIndex({ locationBrowser: "2dsphere" });
					db.close();
				})
				.catch(err => {
					console.log(
						"Cant create collection {" +
							collectionName +
							"} due to -> " +
							err
					);
				});
		})
		.catch(err => {
			console.log(
				"Cant connect to database called by createCollection(" +
					collectionName +
					") due to -> " +
					err
			);
		});
}

function createTagsCollection() {
	mongo
		.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
		.then(db => {
			var dbo = db.db("Matcha");
			dbo.createCollection("Tags")
				.then(res => {
					res.createIndex({ Tag: 1 }, { unique: true});
					db.close();
				})
				.catch(err => {
					// console.log("Cant create collection {Tags} due to " + err);
				});
		})
		.catch(err => {
			console.log(
				"Cant connect to database called by createTagsCollection due to " +
					err
			);
		});
}
module.exports = {
	url,
	mongo,
	_mongo,
	createCollection: createCollection,
	createTagsCollection: createTagsCollection
};
