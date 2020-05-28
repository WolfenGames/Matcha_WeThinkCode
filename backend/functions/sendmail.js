const mailer = require("nodemailer");
const manageUser = require("./userManagement");
const bcrypt = require("bcrypt");
("use strict");

let transporter = mailer.createTransport({
	service: "gmail",
	host: "smtp.gmail.com",
	port: 465,
	auth: {
		user: process.env.EMAIL,
		pass: process.env.EMAIL_PASSWORD
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

async function resendVerify(email, url) {
	let user = await manageUser.getUserInfoByEmail(email)
	if (user)
	{
		let newhash = await bcrypt.hashSync(Date.now() + '', 10)
		await manageUser.updateVerification(email, newhash);
		sendVerifyEmail(email, url = user.verification_key)
		return true;
	}
	else
		return false;
}

async function sendPassForget(email, url) {
	let user = await manageUser.getUserInfoByEmail(email)
	if (user)
	{
		let newhash = await bcrypt.hashSync(Date.now() + '', 10)
		await manageUser.updateVerification(email, newhash)
		sendPassForgetEmail(email, url + newhash)
		return true;
	}
	else
		return false;
}

module.exports = {
	sendPassForget: sendPassForget,
	resendVerify: resendVerify,
	sendVerifyEmail: sendVerifyEmail,
};
