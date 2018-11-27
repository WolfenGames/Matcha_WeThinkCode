const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
	username: { type: String, required: true },
	password: { type: String, required: true},
	email: { type: String, required: true},
	age: { type: Number, required: true},
	type: { type: String, default: 'User'}
});

module.exports = mongoose.model('Users', userSchema);