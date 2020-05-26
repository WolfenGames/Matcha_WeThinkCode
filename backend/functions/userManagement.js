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
				.then(() => {
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

async function getTags(uid){
	let res = await db.pool.query("SELECT * FROM get_tags_for_user($1::int);", [uid])
	return (res.rows[0])
}

async function getUserInfo(uid) {
	let res = await db.pool.query('SELECT * FROM get_user($1::int);', [uid])
	return (res.rows[0])
}


async function getUserInfoByEmail(email) {
	let res = await db.pool.query('SELECT * FROM get_user($1::varchar);', [email])
	return (res.rows[0])
}

async function getMatches(uid) {
	let res = await db.pool.query('SELECT * FROM matches($1::int);', [uid])
	return res.rowCount
}

async function getLikes(uid) {
	let res = await db.pool.query('SELECT * FROM get_likes($1::int);', [uid])
	return res.rowCount
}

async function getViewedBy(uid) {
	let res = await db.pool.query('SELECT * FROM get_views($1::int);', [uid])
	return res.rowCount
}

async function getBlocks(uid) {
	let res = await db.pool.query('SELECT * FROM get_blocks($1::int);', [uid])
	return res.rowCount
}

async function reportUser(reporter, bad) {
	// TODO: HIGHLY UNTESTED
	await db.pool.query('CALL report_user($1::int, $2::int);', [reporter, bad])
}

async function updateEmail(uid, email) {
	await db.pool.query(`

		UPDATE Users
			SET email = $2::varchar
		WHERE
			_id = $1::int
	
	`,[uid, email])
}

async function updateBio(uid, bio) {
	await db.pool.query(`

		UPDATE UserInfo
			SET biography = $2::varchar
		FROM UserInfo as ui
		INNER JOIN Users as u on u._id = ui.uid
		WHERE
			u._id = $1::int;
	
	`,[uid, bio])
}

async function updateGender(uid, sex) {
	await db.pool.query(`

		UPDATE UserInfo
			SET sex = $2::int
		FROM UserInfo as ui
		INNER JOIN Users as u on u._id = ui.uid
		WHERE
			u._id = $1::int;
	
	`,[uid, sex])
}

async function updateSex(uid, sex) {
	await db.pool.query(`

		UPDATE UserInfo
			SET sexuality = $2::int
		FROM UserInfo as ui
		INNER JOIN Users as u on u._id = ui.uid
		WHERE
			u._id = $1::int;
	
	`,[uid, sex])
}

async function updateFirstname(uid, firstname) {
	await db.pool.query(`

		UPDATE UserInfo
			SET firstname = $2::varchar
		FROM UserInfo as ui
		INNER JOIN Users as u on u._id = ui.uid
		WHERE
			u._id = $1::int;
	
	`,[uid, firstname])
}

async function updateLastname(uid, lastname) {
	await db.pool.query(`

		UPDATE UserInfo
			SET surname = $2::varchar
		FROM UserInfo as ui
		INNER JOIN Users as u on u._id = ui.uid
		WHERE
			u._id = $1::int;
	
	`,[uid, lastname])
}

async function updateDOB(uid, dob) {
	await db.pool.query(`

		UPDATE UserInfo
			SET date_of_birth = $2::TIMESTAMP
		FROM UserInfo as ui
		INNER JOIN Users as u on u._id = ui.uid
		WHERE
			u._id = $1::int;
	
	`,[uid, dob])
}

async function updateProfilePicture(uid, imgloc) {
	await db.pool.query(`

		UPDATE Pictures
			SET profile_picture = $2::varchar
		FROM Pictures as p
		INNER JOIN Users as u on u._id = p.uid
		WHERE
			u._id = $1::int;
	
	`,[uid, imgloc])
}

async function updateProfilePictureOne(uid, imgloc) {
	await db.pool.query(`

		UPDATE Pictures
			SET picture_one = $2::varchar
		FROM Pictures as p
		INNER JOIN Users as u on u._id = p.uid
		WHERE
			u._id = $1::int;
	
	`,[uid, imgloc])
}

async function updateProfilePictureTwo(uid, imgloc) {
	await db.pool.query(`

		UPDATE Pictures
			SET picture_two = $2::varchar
		FROM Pictures as p
		INNER JOIN Users as u on u._id = p.uid
		WHERE
			u._id = $1::int;
	
	`,[uid, imgloc])
}

async function updateProfilePictureThree(uid, imgloc) {
	await db.pool.query(`

		UPDATE Pictures
			SET picture_three = $2::varchar
		FROM Pictures as p
		INNER JOIN Users as u on u._id = p.uid
		WHERE
			u._id = $1::int;
	
	`,[uid, imgloc])
}

async function updateProfilePictureFour(uid, imgloc) {
	await db.pool.query(`

		UPDATE Pictures
			SET picture_four = $2::varchar
		FROM Pictures as p
		INNER JOIN Users as u on u._id = p.uid
		WHERE
			u._id = $1::int;
	
	`,[uid, imgloc])
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

async function updateLoc(user) {
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
	await db.mongo
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
	getHighestView: getHighestView,
	setGeoLocBrowser: setGeoLocBrowser,
	setTypeOfLoc: setTypeOfLoc,
	updateLoc: updateLoc,
	setCustomLoc: setCustomLoc,
	filter: filter,
	getUserInfo: getUserInfo,
	getUserInfoByEmail,
	getTags,
	getMatches,
	getLikes,
	getViewedBy,
	getBlocks,
	reportUser,
	updateEmail,
	updateBio,
	updateGender,
	updateSex,
	updateFirstname,
	updateLastname,
	updateDOB,
	updateProfilePicture,
	updateProfilePictureOne,
	updateProfilePictureTwo,
	updateProfilePictureThree,
	updateProfilePictureFour
};
