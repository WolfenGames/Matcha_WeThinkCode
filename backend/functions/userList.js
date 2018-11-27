const mongoose = require('mongoose');
const User = require('../models/user');

module.exports = {
	ListUser(fn) {
		User.find({}).then(result => {
			let users = [];
			result.forEach(
				function (res) {
					users.push(res);
				}
			);
			fn(users);
		}).catch(error => {
			console.log("Cant find users:: " + error);
		});
	}
}