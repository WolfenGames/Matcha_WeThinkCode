const db = require("../database/db");

async function getTags() {
	let res = await db.pool.query('SELECT * from Tags')
	return (res.rows)
}


async function setTags(user, tag) {
	await db.pool.query('CALL add_tag_for_user($1::int, $2::varchar, $3::varchar)',
		[
			user._id,
			user.username,
			tag
		]
	)
}

async function getUpdatedTags(user) {
	let result = await db.pool.query('SELECT * FROM get_tags_for_user($1::int)', [user._id])
	return (result.rows)
}

async function removeTag(user, tag_id, tag_name) {
	
	await db.pool.query('CALL delete_tag_for_user($1::int, $2::varchar, $3::int);', 
		[
			user._id,
			tag_name,
			tag_id
		]
	)
}

module.exports = {
	getTags: getTags,
	setTags: setTags,
	getUpdatedTags: getUpdatedTags,
	removeTag: removeTag,
};
