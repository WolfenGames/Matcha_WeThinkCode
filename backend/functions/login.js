const db = require("../database/db");
const bcrypt = require("bcrypt");
"use strict";

function login(email, password, cb) {
	db.mongo.connect(db.url, { useNewUrlParser: true }).then(db => {
		var dbo = db.db('Matcha');
		var searchQuery = {
			email: email
		}
		dbo.collection("Users").findOne(searchQuery).then(res => {
			if (bcrypt.compareSync(password, res['password']))
			{
				cb(res);
			}
			else
			{
				cb("none");
			}
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