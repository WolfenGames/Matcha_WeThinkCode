const mongoose = require('mongoose');

const url = 'mongodb://localhost:27017/Matcha';

mongoose.connect(url, { useNewUrlParser: true}).then(() => {
	console.log("Database connected");
}).catch((error) => {
	console.log('Failed to connect:: ' + error);
});
