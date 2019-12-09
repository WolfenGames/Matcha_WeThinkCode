const db = require("../database/db");

function deleteByUsername(email, cb) {
	db.mongo
		.connect(db.url, { useNewUrlParser: true, useUnifiedTopology: true })
		.then(db => {
			var dbo = db.db("Matcha");
			var query = { email: email };
			dbo.collection("Users")
				.deleteOne(query)
				.then(res => {
					cb("Suceesss");
				})
				.catch(err => {
					cb("Error");
					console.log(
						"Can't deleteby one (email:: " + email + ") -> " + err
					);
				});
			db.close();
		})
		.catch(err => {
			cb("Cant connect to database");
			console.log(
				"Cant connect to database called by deleteByUsername(" +
					user +
					")"
			);
		});
}
function deleteAll() {
	db.mongo
		.connect(db.url, { useNewUrlParser: true, useUnifiedTopology: true })
		.then(db => {
			var dbo = db.db("Matcha");
			var query = { type: "User" };
			dbo.collection("Users")
				.deleteMany(query)
				.then(res => {})
				.catch(err => {
					console.log("Cant delete many called by deleteAll()");
				});
			db.close();
		})
		.catch(err => {
			console.log("Cant connect to database called by deleteAll");
		});
}

function updateUserOne(query, set, cb) {
	db.mongo
		.connect(db.url, { useNewUrlParser: true, useUnifiedTopology: true })
		.then(db => {
			var dbo = db.db("Matcha");
			dbo.collection("Users")
				.updateOne(query, set)
				.then(res => {
					cb(true);
				})
				.catch(err => {
					console.log(
						"Cant update called by updateUserOne(" +
							query +
							"," +
							set +
							") due to => " +
							err
					);
					cb(false);
				});
			db.close();
		})
		.catch(err => {
			console.log(
				"Can't connect to database called by updateUserOne(" +
					query +
					", " +
					set +
					") due to => " +
					err
			);
			cb(false);
		});
}

function getUserInfo(email, cb) {
	db.mongo
		.connect(db.url, { useNewUrlParser: true, useUnifiedTopology: true })
		.then(db => {
			var dbo = db.db("Matcha");
			dbo.collection("Users")
				.findOne({ email: email })
				.then(res => {
					if (res.reports >= 5) {
						updateUserOne(
							{ email: email },
							{ $set: { lastTime: Date(), banned: true } },
							() => {
								cb(res);
								db.close();
							}
						);
					} else {
						updateUserOne(
							{ email: email },
							{ $set: { lastTime: Date() } },
							() => {
								cb(res);
								db.close();
							}
						);
					}
				})
				.catch(err => {
					console.log("Cant fetch user " + err);
				});
		})
		.catch(err => {
			console.log("Cant connect to database " + err);
		});
}

function getUserInfoId(id, cb) {
	var validID = /^[0-9a-fA-F]{24}$/;
	if (validID.test(id)) {
		var o_id = new db._mongo.ObjectID(id);
		db.mongo
			.connect(db.url, {
				useNewUrlParser: true,
				useUnifiedTopology: true
			})
			.then(db => {
				var dbo = db.db("Matcha");
				if (o_id !== null) {
					dbo.collection("Users")
						.findOne({ _id: o_id })
						.then(res => {
							cb(res);
							db.close();
						})
						.catch(err => {
							console.log("Cant fetch user " + err);
						});
				} else cb(null);
			})
			.catch(err => {
				console.log("Cant connect to database " + err);
			});
	} else cb(null);
}

function getHighestView(cb) {
	db.mongo
		.connect(db.url, { useNewUrlParser: true, useUnifiedTopology: true })
		.then(db => {
			var dbo = db.db("Matcha");
			dbo.collection("Users")
				.find()
				.sort({ views: -1 })
				.limit(1)
				.toArray()
				.then(res => {
					if (res[0] && res[0].views) cb(res[0].views);
					else cb(0);
				})
				.catch(err => {
					console.log("Fuck " + err);
				});
		})
		.catch(err => {
			console.log("Cant connect to database " + err);
		});
}

function setGeoLocBrowser(long, lat, user) {
	db.mongo
		.connect(db.url, { useNewUrlParser: true, useUnifiedTopology: true })
		.then(db => {
			var dbo = db.db("Matcha");
			dbo.collection("Users")
				.updateOne(
					{ email: user.email },
					{
						$set: {
							locationBrowser: [parseFloat(long), parseFloat(lat)]
						}
					}
				)
				.catch(err => {});
		})
		.catch(err => {
			console.log("Cant connect to database " + err);
		});
}

function setTypeOfLoc(locType, user) {
	db.mongo
		.connect(db.url, { useNewUrlParser: true, useUnifiedTopology: true })
		.then(db => {
			var dbo = db.db("Matcha");
			dbo.collection("Users")
				.updateOne(
					{ email: user.email },
					{
						$set: {
							locationType: parseInt(locType)
						}
					}
				)
				.catch(err => {});
		})
		.catch(err => {
			console.log("Cant connect to database " + err);
		});
}

function setCustomLoc(user, long, lat) {
	db.mongo
		.connect(db.url, { useNewUrlParser: true, useUnifiedTopology: true })
		.then(db => {
			var dbo = db.db("Matcha");
			dbo.collection("Users")
				.updateOne(
					{ email: user.email },
					{
						$set: {
							locationCustom: [long, lat]
						}
					}
				)
				.catch(err => {});
		})
		.catch(err => {
			console.log("Cant connect to database " + err);
		});
}

function updateLoc(user) {
	switch (user.locationType) {
		case 0:
			user.location = user.locationIp;
			break;
		case 1:
			user.location = user.locationBrowser;
			break;
		case 2:
			user.location = user.locationCustom;
			break;
	}
	db.mongo
		.connect(db.url, { useNewUrlParser: true, useUnifiedTopology: true })
		.then(db => {
			var dbo = db.db("Matcha");
			dbo.collection("Users")
				.updateOne(
					{ email: user.email },
					{
						$set: {
							location: user.location
						}
					}
				)
				.catch(err => {});
		})
		.catch(err => {
			console.log("Cant connect to database " + err);
		});
}

function filter(thing, cb) {
	db.mongo
		.connect(db.url, { useNewUrlParser: true, useUnifiedTopology: true })
		.then(db => {
			var dbo = db.db("Matcha");
			dbo.collection("Users")
				.find(thing)
				.toArray()
				.then(res => {
					cb(res);
				})
				.catch(err => {});
		})
		.catch(err => {
			console.log("Cant connect to database " + err);
		});
}

module.exports = {
	deleteByUsername: deleteByUsername,
	deleteAll: deleteAll,
	updateUserOne: updateUserOne,
	getUserInfoId: getUserInfoId,
	getUserInfo: getUserInfo,
	getHighestView: getHighestView,
	setGeoLocBrowser: setGeoLocBrowser,
	setTypeOfLoc: setTypeOfLoc,
	updateLoc: updateLoc,
	setCustomLoc: setCustomLoc,
	filter: filter
};
