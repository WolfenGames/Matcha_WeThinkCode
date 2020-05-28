const db = require("../database/db");
const bcrypt = require("bcrypt");
const mailer = require("./sendmail");
("use strict");

async function login(email, password) {
	const res = await db.pool.query('SELECT * FROM get_user_by_email($1::varchar);', [email])
	let user;
	if (user = res.rows[0])
	{
		if (user.email_verified)
		{
			const matches = await bcrypt.compareSync(password, user.password)
			return (matches) ? res.rows[0] : null
		}
		return null;
	}
	return null;
}

async function updateLoginTime(uid) {
	await db.pool.query('CALL update_last_login($1::int);',[uid])
}

module.exports = {
	login: login,
	updateLoginTime
};
