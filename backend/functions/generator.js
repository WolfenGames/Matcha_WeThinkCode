const fs = require("fs");
const util = require("util")
const userSave = require("./userSave");
const db = require("../database/db");
const manageUser = require("../functions/userManagement")

const readFile = util.promisify(fs.readFile);

async function UserGenerator() {
	let userArr = [];
	let fNames = await readFile("./backend/data/firstnames.txt", "utf8")
	let sNames = await readFile("./backend/data/surname.txt", "utf8")
	let likes = await readFile("./backend/data/likes.txt", "utf8")
	fNames = fNames.split("\n");
	sNames = sNames.split("\n");
	likes = likes.split("\n");
	var i;
	for (i = 0; i < 500; i++) {
		var x = Math.floor(Math.random() * fNames.length);
		var y = Math.floor(Math.random() * sNames.length);
		var likeCountMax = Math.floor(Math.random() * likes.length);
		var likesArray = [];
		var first = fNames[x];
		var second = sNames[y];
		var email =
			first.trim("\r ") +
			second.trim("\r ") +
			(
				Math.floor(
					Math.random() *
						(new Date().getFullYear() *
							new Date().getFullYear())
				) + i
			).toString() +
			"@bogusEmail.com";
		for (var j = 0; j < likeCountMax; j++) {
			var val = Math.floor(Math.random() * likes.length);
			if (likesArray.indexOf(likes[val].trim("\r")) == -1) {
				likesArray.push(likes[val].trim("\r"));
			}
		}
		var age = 18 + Math.floor(Math.random() * 50);
		var bio =
			"This is a random Biography made for purpose of testing, I serve no other purpose, please ignore";
		var sexuality = Math.floor(Math.random() * 3) + 1;
		var sex = Math.floor(Math.random() * 3) + 1;
		let va2 = userSave.generatedUser(
			first,
			second,
			email,
			age,
			bio,
			likesArray,
			sex,
			sexuality
		);
		userArr.push(va2);
	}
	var cleanUserArr = userArr.filter(
		(arr, index, self) =>
			index === self.findIndex(t => t.email == arr.email)
	);
	if (cleanUserArr.length !== 0) {
		cleanUserArr.forEach(async user => {

			await db.pool.query("call add_user($1, $2, $3, $4, $5, $6, $7, $8);",
				[
					user.username,
					user.email,
					user.password,
					user.firstname,
					user.surname,
					"N/A",
					"Generated",
					false
				]
			)
			likesArray.forEach(async like => {
				try {
					await db.pool.query("call add_tag_for_user($1, $2, $3);",
						[
							-1,
							user.username,
							like
						]
					)
				} catch (error) {
					console.log(err);
				}
			})
			let _user = await manageUser.getUserInfoByEmail(user.email)
			await manageUser.updateGender(_user._id, user.sex)
			await manageUser.updateSex(_user._id, user.sexuality)
			await manageUser.updateBio(_user._id, user.biography)

			await manageUser.setTypeOfLoc(_user, "BROWSER")
			await manageUser.setGeoLocBrowser(_user, user.location[0], user.location[1])

			await require("../functions/login").updateLoginTime(_user._id)
		})
	}
}

module.exports = {
	UserGenerator: UserGenerator
};
