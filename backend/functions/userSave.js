const User = require('../models/user');

module.exports = {
	userSave(username, email, password, type) {
		const user = new User ({
			username: username,
			password: password,
			email: email,
			age: 1,
			type: type
		});
		user.save().then(result => {
			console.log('User created');
		}).catch(error => {
			console.log('Error saving user:: ' + error);
		});
	}
}