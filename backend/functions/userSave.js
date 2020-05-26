const db = require("../database/db");
const crypt = require("bcrypt");
const mailer = require("./sendmail");

function generatedUser(first, second, email, age, bio, likes, sex, sexuality) {
	var password = "WeThinkCode_2018";
	var date = new Date();
	let val = crypt.hashSync(password, 10);
	var saveOptions = {
		username: first + second + Math.floor(Math.random() * 2018),
		firstname: first,
		surname: second,
		sex: sex.toString(),
		sexuality: sexuality.toString(),
		locationType: 0,
		location: [16.5 + Math.random() * 17, -22 + Math.random() * 12],
		locationIp: [0, 0],
		locationCustom: [0, 0],
		locationBrowser: [0, 0],
		verification: val,
		isVerified: true,
		email_subscription: false,
		email: email,
		password: val,
		age:
			date.getFullYear() -
			age +
			"-" +
			(Math.floor(Math.random() * 12) + 1) +
			"-" +
			(Math.floor(Math.random() * 20) + 1),
		fame: 0,
		rating: 100,
		type: "Generated",
		Tag: likes ? likes : [],
		likes: [],
		blocks: [],
		likedBy: [],
		likedBy: [],
		viewedBy: [],
		reports: 0,
		banned: false,
		picture: {
			Picture1: "/default.jpeg",
			Picture2: "/default.jpeg",
			Picture3: "/default.jpeg",
			Picture4: "/default.jpeg",
			Picture5: "/default.jpeg"
		},
		notifications: [],
		Prof: "/default.jpeg",
		biography: bio,
		views: 1,
		rating: 100
	};
	return saveOptions;
}

async function userSave(uname, email, password, uType, sub, url) {
	let verifyKey = await crypt.hashSync(uname + email, 10)
	console.log("password: " + password)
	await db.pool.query('CALL add_user($1, $2, $3, $4, $5, $6, $7, $8)',
		[
			uname,
			email,
			password,
			'Give me FirstName Pls',
			'Give me Surname Pls',
			verifyKey,
			uType,
			sub
		]
	)
	mailer.sendVerifyEmail(email, url + verifyKey)
}

async function emailExists(email) {
	const res = await db.pool.query("SELECT * FROM Users as u WHERE u.email = $1", [email])
	return (res.rowCount > 0)
}

async function unameExists(uname) {
	const res = await db.pool.query("SELECT * FROM Users as u WHERE u.username = $1", [uname])
	return (res.rowCount > 0)
}

function getAll(cb) {
	db.mongo
		.connect(db.url, { useNewUrlParser: true, useUnifiedTopology: true })
		.then(db => {
			var dbo = db.db("Matcha");
			dbo.collection("Users")
				.find({})
				.toArray()
				.then(res => {
					cb(res);
				})
				.catch(err => {
					console.log("Cant use email Exists => " + err);
				});
		})
		.catch(err => {
			console.log(
				"Can't connect to database called by getAll() -> " + err
			);
		});
}

function deleteUser(name) {
	db.mongo
		.connect(db.url, { useNewUrlParser: true, useUnifiedTopology: true })
		.then(db => {
			var dbo = db.db("Matcha");
			dbo.collection("Users")
				.deleteOne({ username: name })
				.then(res => {})
				.catch(err => {
					console.log("Cant use email Exists => " + err);
				});
		})
		.catch(err => {
			console.log(
				"Can't connect to database called by getAll() -> " + err
			);
		});
}

module.exports = {
	userSave: userSave,
	emailExists: emailExists,
	unameExists: unameExists,
	generatedUser: generatedUser,
	getAll: getAll,
	deleteUser: deleteUser
};
