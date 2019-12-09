const mailer = require("nodemailer");
const settings = require("./settings");
const db = require("../database/db");
("use strict");

let transporter = mailer.createTransport({
	service: "gmail",
	// host: "smtp.gmail.com",
	auth: {
		user: settings.user,
		pass: settings.pass
	}
});

function sendPassForgetEmail(email, url) {
	let mailOptions = {
		from: "'Matcha' <jwolfmatcha@gmail.com>",
		to: email + ", <" + email + ">",
		subject: "Matcha Forgot Password",
		text: "Matcha Forgot password",
		html:
			"<h1> Good day User </h1> <br><hr> <p>Click here to reset your password</p>" +
			"<a href='" +
			url +
			"'><input type='button' value='Here'></a>"
	};
	transporter
		.sendMail(mailOptions)
		.then(info => {})
		.catch(error => {
			console.log("Error sending mail: " + error);
		});
}

function sendVerifyEmail(email, verifykey) {
	let mailOptions = {
		from: "'Matcha' <jwolfmatcha@gmail.com>",
		to: email + ", <" + email + ">",
		subject: "Matcha Welcomes you",
		text: "Matcha Verify",
		html:
			"<h1> Good day User </h1> <br><hr> <p>Verify Account please</p>" +
			"<a href='" +
			verifykey +
			"'><input type='button' value='verify'></a>"
	};
	transporter
		.sendMail(mailOptions)
		.then(info => {})
		.catch(error => {
			console.log("Error sending mail: " + error);
		});
}

function sendNotificationEmail(email, user) {
	let mailOptions = {
		from: "'Matcha' <jwolfmatcha@gmail.com>",
		to: email + ", <" + email + ">",
		subject: "Matcha Notification",
		text: "Matcha Notification",
		html:
			"<h1> Good day " +
			user +
			" </h1> <br><hr> <p>This is a notification for your account</p>"
	};
	transporter
		.sendMail(mailOptions)
		.then(info => {})
		.catch(error => {
			console.log("Error sending mail: " + error);
		});
}

function resendVerify(email, url, cb) {
	db.mongo
		.connect(db.url, { useNewUrlParser: true, useUnifiedTopology: true })
		.then(db => {
			var dbo = db.db("Matcha");
			var query = { email: email };
			dbo.collection("Users")
				.findOne(query)
				.then(res => {
					if (res) {
						if (res["verification"]) {
							sendVerifyEmail(email, url + res["verification"]);
							cb(true);
						} else cb(false);
					} else cb(false);
					db.close();
				})
				.catch(err => {
					console.log(
						"Cant connect to collection 'Users' due to => " + err
					);
					cb(false);
				});
			db.close();
		})
		.catch(err => {
			console.log(
				"Cant connect to database called by resendVerify(" +
					email +
					", ...)"
			);
			cb(false);
		});
}

function sendPassForget(email, url, cb) {
	db.mongo
		.connect(db.url, { useNewUrlParser: true, useUnifiedTopology: true })
		.then(db => {
			var dbo = db.db("Matcha");
			var query = { email: email };
			dbo.collection("Users")
				.findOne(query)
				.then(res => {
					if (res) {
						if (res["verification"]) {
							sendPassForgetEmail(
								email,
								url + res["verification"]
							);
							cb(true);
						} else cb(false);
					} else {
						cb(false);
					}
				})
				.catch(err => {
					console.log(
						"Cant connect to collection 'Users' due to => " + err
					);
					cb(false);
				});
			db.close();
		})
		.catch(err => {
			console.log(
				"Cant connect to database called by resendVerify(" +
					email +
					", ...)"
			);
			cb(false);
		});
}

module.exports = {
	sendPassForget: sendPassForget,
	resendVerify: resendVerify,
	sendVerifyEmail: sendVerifyEmail,
	sendNotificationEmail: sendNotificationEmail
};
