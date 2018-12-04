const mailer = require('nodemailer');
const settings = require('./settings');
"use strict";

let transporter = mailer.createTransport({
		service: 'gmail',
		auth : {
			user: settings.user,
			pass: settings.pass
		}
	});

function sendVerifyEmail(email, verifykey) {
	let mailOptions = {
		from: "'Matcha' <jwolfmatcha@gmail.com>",
		to: email + ", <"+email+">",
		subject: "Matcha Welcomes you",
		text: "Matcha Verify",
		html: "<h1> Good day User </h1> <br><hr> <p>Verify Account please</p>" + "<a href='"+verifykey+"'><input type='button' value='verify'></a>"
	}
	transporter.sendMail(mailOptions).then(info => {
	}).catch(error => {
		console.log ("Error " + error);
	})
}

function sendNotificationEmail(email, user) {
	let mailOptions = {
		from: "'Matcha' <jwolfmatcha@gmail.com>",
		to: email + ", <"+email+">",
		subject: "Matcha Notification",
		text: "Matcha Notification",
		html: "<h1> Good day "+user+" </h1> <br><hr> <p>This is a notification for your account</p>"
	}
	transporter.sendMail(mailOptions).then(info => {
	}).catch(error => {
		console.log ("Error " + error);
	})
}

module.exports = {
	sendVerifyEmail: sendVerifyEmail,
	sendNotificationEmail: sendNotificationEmail 
}