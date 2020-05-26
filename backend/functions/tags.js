const db = require("../database/db");
const conn = db.mongo;

async function getTags() {
	let res = await db.pool.query('SELECT tags from Tags')
	return (res.rows)
}


function setTags(query, user, cb) {
	// if (query && user) {
	// 	conn.connect(db.url, {
	// 		useNewUrlParser: true,
	// 		useUnifiedTopology: true
	// 	})
	// 		.then(db => {
	// 			var dbo = db.db("Matcha");
	// 			dbo.collection("Tags")
	// 				.insertOne({ Tag: query })
	// 				.then(_res => {
	// 					dbo.collection("Users")
	// 						.findOneAndUpdate(
	// 							{ email: user },
	// 							{ $addToSet: { Tag: query } }
	// 						)
	// 						.then(res => {
	// 							cb(res.tags);
	// 						});
	// 				})
	// 				.catch(_err => {});
	// 		})
	// 		.catch(() => {});
	// }
}

function getUpdatedTags(email, cb) {
	// conn.connect(db.url, { useNewUrlParser: true, useUnifiedTopology: true })
	// 	.then(db => {
	// 		var dbo = db.db("Matcha");
	// 		dbo.collection("Users")
	// 			.findOne({ email: email })
	// 			.then(result => {
	// 				db.close();
	// 				cb(result.tags);
	// 			})
	// 			.catch(err => {
	// 				console.log("3: Cant connect to collection -> " + err);
	// 			});
	// 	})
	// 	.catch(err => {
	// 		console.log("Cant connect to database due to => " + err);
	// 	});
}

function removeTag(email, tag) {
	// conn.connect(db.url, { useNewUrlParser: true, useUnifiedTopology: true })
	// 	.then(db => {
	// 		var dbo = db.db("Matcha");
	// 		dbo.collection("Users")
	// 			.updateOne({ email: email }, { $pull: { Tag: tag } })
	// 			.then(() => {
	// 				db.close();
	// 			})
	// 			.catch(err => {
	// 				console.log("Cannot remove due to reason " + err);
	// 			});
	// 	})
	// 	.catch(err => {
	// 		console.log("Cannot connect to database due to reason => " + err);
	// 	});
}

module.exports = {
	getTags: getTags,
	setTags: setTags,
	getUpdatedTags: getUpdatedTags,
	removeTag: removeTag,
};
