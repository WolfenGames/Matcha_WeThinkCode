const db = require("../database/db");

async function verify(email, verify) {
	await db.pool.query('CALL verify_user($1, $2);', [verify, email])
}

module.exports = {
	verify: verify
};
