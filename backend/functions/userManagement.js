const User = require('../models/user');

module.exports = {
	deleteByUsername(user) {
		User.deleteOne({ _id: user }).then(result => {
			console.log('Users deleted by name:: ' + user);
		}).catch(error => {
			console.log("Error deleting many:: " + error);
		})
	},
	deleteAll() {
		User.deleteMany({ type: 'User' }).then(result => {
			console.log('All users deleted');
		}).catch(error => {
			console.log('Cant delete all -> ' + error);
		});
	}
}