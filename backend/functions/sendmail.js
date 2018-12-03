const mailer = require('nodemailer');
const settings = require('./settings');
"use strict";

let transporter = null;

mailer.createTestAccount().then(account => {
	transporter = mailer.createTransport({
		service: 'gmail',
		auth : {
			user: settings.user,
			pass: settings.pass
		}
	});
	console.log(account);
}).catch(error => {
	console.log(error);
});

function sendVerifyEmail() {
	let mailOptions = {
		from: "'Matcha' <admin@matcha.com>",
		to: "jwolf@mailinator.com, <jwolf@mailinator.com>",
		subject: "Test",
		text: "Hello World",
		html: "<h1> HELLO WORLD </h1>",
	}
	transporter.sendMail(mailOptions).then(info => {
		console.log("message sent");
	}).catch(error => {
		console.log ("Error " + error);
	})
}

function sendNotificationEmail() {

}

module.exports = {
	sendVerifyEmail: sendVerifyEmail,
	sendNotificationEmail: sendNotificationEmail 
}