const db = require("../database/db");
const conn = db.mongo;

function getTags(cb) {
	conn.connect(db.url, { useNewUrlParser: true })
		.then(db => {
			var dbo = db.db("Matcha");
			dbo.collection("Tags")
				.find({})
				.toArray()
				.then(res => {
					cb(res);
				})
				.catch(err => {
					cb(null);
					console.log("Cant fetch tags =>" + err);
				});
			db.close();
		})
		.catch(err => {
			cb(null);
			console.log(
				"Cant connect to database getTags(" + cb + ") => " + err
			);
		});
}

function setTags(query, user, cb) {
	if (query && user) {
		conn.connect(db.url, { useNewUrlParser: true })
			.then(db => {
				var dbo = db.db("Matcha");
				dbo.collection("Tags")
					.insertOne({ Tag: query })
					.then(result => {
						dbo.collection("Users")
							.findOne({ email: user })
							.then(res => {
								dbo.collection("Users")
									.updateOne(
										{ email: user },
										{ $addToSet: { tags: query } }
									)
									.then(result => {
										dbo.collection("Users")
											.findOne({ email: user })
											.then(result => {
												db.close();
												cb(result.tags);
											})
											.catch(err => {
												console.log(
													"1: Cant connect to collection -> " +
														err
												);
											});
									})
									.catch(err => {
										console.log(
											"Cant update the users tag due to => " +
												err
										);
									});
							})
							.catch(err => {
								console.log("Cant find tags due to " + err);
							});
					})
					.catch(err => {
						dbo.collection("Users")
							.findOne({ email: user })
							.then(res => {
								if (query) {
									dbo.collection("Users")
										.updateOne(
											{ email: user },
											{ $addToSet: { tags: query } }
										)
										.then(result => {
											dbo.collection("Users")
												.findOne({ email: user })
												.then(result => {
													db.close();
													if (result) cb(result.tags);
													else cb({});
												})
												.catch(err => {
													console.log(
														"2: Cant connect to collection -> " +
															err
													);
												});
										})
										.catch(err => {
											console.log(
												"Cant update the users tag due to => " +
													err
											);
										});
								} else cb({});
							})
							.catch(err => {
								console.log("Cant find tags due to " + err);
							});
					});
			})
			.catch(err => {
				console.log(
					"Cant connect to database setTags(" + query + ") =>" + err
				);
			});
	}
}

function getUpdatedTags(email, cb) {
	conn.connect(db.url, { useNewUrlParser: true })
		.then(db => {
			var dbo = db.db("Matcha");
			dbo.collection("Users")
				.findOne({ email: email })
				.then(result => {
					db.close();
					cb(result.tags);
				})
				.catch(err => {
					console.log("3: Cant connect to collection -> " + err);
				});
		})
		.catch(err => {
			console.log("Cant connect to database due to => " + err);
		});
}

function removeTag(email, tag) {
	conn.connect(db.url, { useNewUrlParser: true })
		.then(db => {
			var dbo = db.db("Matcha");
			dbo.collection("Users")
				.updateOne({ email: email }, { $pull: { tags: tag } })
				.then(result => {
					db.close();
				})
				.catch(err => {
					console.log("Cannot remove due to reason " + err);
				});
		})
		.catch(err => {
			console.log("Cannot connect to database due to reason => " + err);
		});
}

function addTag(tag) {
	conn.connect(db.url, { useNewUrlParser: true, useUnifiedTopology: true })
		.then(db => {
			var dbo = db.db("Matcha");
			dbo.collection("Tags").insert({ Tag: tag });
		})
		.catch(err => {
			console.log("Cannot connect to database due to reason => " + err);
		});
}

module.exports = {
	getTags: getTags,
	setTags: setTags,
	getUpdatedTags: getUpdatedTags,
	removeTag: removeTag
};
