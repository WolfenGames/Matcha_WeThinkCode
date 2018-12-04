const db = require("../database/db");
const bcrypt = require("bcrypt");
const mailer = require("./sendmail");
"use strict";

function login(email, password, cb) {
	db.mongo.connect(db.url, { useNewUrlParser: true }).then(db => {
		var dbo = db.db('Matcha');
		var searchQuery = {
			email: email,
			isVerified: true
		}
		dbo.collection("Users").findOne(searchQuery).then(res => {
			if (res)
			{
				if (bcrypt.compareSync(password, res['password']))
				{
					if (res['email_subscription'])
						mailer.sendNotificationEmail(res['email'], res['username'] === null ? 'User' : res['username']);
					cb(res);
				}
				else
					cb(null);
			}
			else
				cb(null);
			db.close();
		}).catch(err => {
			console.log("Cant login due to " + err);
		});
	}).catch(err => {
		console.log("Cant connect to db called by login(" + email + ",__hidden__)");
	});
}

module.exports = {
	login: login
}