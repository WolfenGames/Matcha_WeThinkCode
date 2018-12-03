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
		subject: "Test",
		text: "Matcha Verify",
		html: "<h1> Good day User </h1> <br><hr> <p>Verify Account please</p>" + "<a href='"+verifykey+"'><input type='button' value='verify'></a>"
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