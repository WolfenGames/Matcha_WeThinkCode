const db = require("../database/db");

async function deleteByUsername(uid) {
	await db.pool.query('CALL delete_user($1::int);', [uid])
}

async function deleteAll() {
	await db.pool.query('CALL delete_generated_users()')
}

async function getAllUsers()
{
	let result = await db.pool.query('SELECT * FROM get_users()')
	return result.rows
}

async function getTags(user){
	let result = await db.pool.query('SELECT * FROM get_tags_for_user($1::int)', [user._id])
	return (result.rows)
}

async function getUserInfo(uid) {
	let res = await db.pool.query('SELECT * FROM get_user($1::int);', [uid])
	return (res.rows[0])
}


async function getUserInfoByEmail(email) {
	let res = await db.pool.query('SELECT * FROM get_user_by_email($1::varchar);', [email])
	return (res.rows[0])
}

async function getMatchesCount(uid) {
	let res = await db.pool.query('SELECT * FROM matches($1::int);', [uid])
	return res.rowCount
}


async function getMatches(uid) {
	let res = await db.pool.query('SELECT * FROM matches($1::int);', [uid])
	return res.rows
}

async function getLikesCount(uid) {
	let res = await db.pool.query('SELECT * FROM get_likes($1::int);', [uid])
	return res.rowCount
}

async function getLikes(uid) {
	let res = await db.pool.query('SELECT * FROM get_likes($1::int);', [uid])
	return res.rows
}

async function getMyViews(uid)
{
	let res = await db.pool.query('SELECT * FROM get_viewed_by($1::int);', [uid])
	return res.rowCount
}

async function getViewedByCount(uid) {
	let res = await db.pool.query('SELECT * FROM get_views($1::int);', [uid])
	return res.rowCount
}


async function getViewedBy(uid) {
	let res = await db.pool.query('SELECT * FROM get_viewed_by($1::int);', [uid])
	return res.rows
}

async function getBlocksCount(uid) {
	let res = await db.pool.query('SELECT * FROM get_blocks($1::int);', [uid])
	return res.rowCount
}


async function getBlocks(uid) {
	let res = await db.pool.query('SELECT * FROM get_blocks($1::int);', [uid])
	return res.rows
}

async function reportUser(reporter, bad) {
	await db.pool.query('CALL report_user($1::int, $2::int);', [reporter, bad])
}

async function updateEmail(uid, email) {
	await db.pool.query(`

		UPDATE Users
			SET email = $2::varchar
		WHERE
			_id = $1::int
	
	`,[uid, email])
}

async function updateBio(uid, bio) {
	await db.pool.query(`

		UPDATE UserInfo
			SET biography = $2::varchar
		WHERE
			uid = $1::int;
	
	`,[uid, bio])
}

async function updateGender(uid, sex) {
	await db.pool.query(`

		UPDATE UserInfo
			SET sex = $2::int
		WHERE
			uid = $1::int;
	
	`,[uid, sex])
}

async function updateSex(uid, sex) {
	await db.pool.query(`

		UPDATE UserInfo
			SET sexuality = $2::int
		WHERE
			uid = $1::int;
	
	`,[uid, sex])
}

async function updateFirstname(uid, firstname) {
	await db.pool.query(`

		UPDATE UserInfo
			SET firstname = $2::varchar
		WHERE
			uid = $1::int;
	
	`,[uid, firstname])
}

async function updateLastname(uid, lastname) {
	await db.pool.query(`

		UPDATE UserInfo
			SET surname = $2::varchar
		WHERE
			uid = $1::int;
	
	`,[uid, lastname])
}

async function updateDOB(uid, dob) {
	await db.pool.query(`

		UPDATE UserInfo
			SET date_of_birth = $2::TIMESTAMP
		WHERE
			uid = $1::int;
	
	`,[uid, dob])
}

async function updateProfilePicture(uid, imgloc) {
	await db.pool.query(`

		UPDATE Pictures
			SET profile_picture = $2::varchar
		WHERE
			uid = $1::int;
	
	`,[uid, imgloc])
}

async function updateProfilePictureOne(uid, imgloc) {
	await db.pool.query(`

		UPDATE Pictures
			SET picture_one = $2::varchar
		WHERE
			uid = $1::int;
	
	`,[uid, imgloc])
}

async function updateProfilePictureTwo(uid, imgloc) {
	await db.pool.query(`

		UPDATE Pictures
			SET picture_two = $2::varchar
		WHERE
			uid = $1::int;
	
	`,[uid, imgloc])
}

async function updateProfilePictureThree(uid, imgloc) {
	await db.pool.query(`

		UPDATE Pictures
			SET picture_three = $2::varchar
		WHERE
			uid = $1::int;
	
	`,[uid, imgloc])
}

async function updateProfilePictureFour(uid, imgloc) {
	await db.pool.query(`

		UPDATE Pictures
			SET picture_four = $2::varchar
		WHERE
			uid = $1::int;
	
	`,[uid, imgloc])
}

async function likeUser(liker, likee)
{
	await db.pool.query(`CALL like_user($1::int, $2::int)`, [liker, likee])
}

async function blockUser(blocker, blockee)
{
	await db.pool.query(`CALL block_user($1::int, $2::int)`, [blocker, blockee])
}

async function updatePassword(email, password, verify)
{
	await db.pool.query(`CALL update_password($1::varchar, $2::varchar, $3::varchar)`, [email, password, verify])
}

async function unbanUser(uid) {
	await db.pool.query(`
		delete from reports where reported = $1;
		UPDATE UserInfo SET banned = false WHERE uid = $1;`,
		[uid]
	)
}

async function getLikedUsers(user) {
	let likes = await db.pool.query(`
		SELECT * FROM get_my_likes($1::int)`,
		[user._id])
	return likes.rows
}

async function getBlockedUsers(user) {
	let blocks = await db.pool.query(
		`SELECT * from get_my_blocks($1::int)`,
		[user._id]
	)
	return blocks.rows
}

async function viewUser(user, view)
{
	await db.pool.query(`CALL view_user($1::int, $2::int);`, [user, view])
}

async function getUsers(user) {
	let users = await db.pool.query(`SELECT * FROM get_users_for_user($1::int)`,[user._id])
	return users.rows
}

async function updateLocation(uid, type, long, lat)
{
	let [longitude, latitude] = [parseFloat(long), parseFloat(lat)];
	await db.pool.query(`CALL update_location($1, $2, $3, $4)`, [uid, type, longitude, latitude])
}

// TODO: DO I NEED YOU?
async function getHighestView() {

}

async function updateVerification(email, hash) {
	await db.pool.query('CALL update_verification($1, $2)', [email, hash])
}

async function setIPBrowser(user, long, lat) {
	await updateLocation(user._id, 'IP', long, lat)
}

async function setGeoLocBrowser(user, long, lat) {
	await updateLocation(user._id, 'BROWSER', long, lat)
}

async function setCustomLoc(user, long, lat) {
	await updateLocation(user._id, 'CUSTOM', long, lat)
}

async function setTypeOfLoc(user, type) {
	await db.pool.query('CALL update_location_type($1, $2);', [user._id, type])
}

async function updateLoc(user, long, lat) {
	await db.pool.query('CALL update_my_location($1, $2, $3);', [user._id, long, lat])
}

async function filter(user, query) {
	let result = await db.pool.query('SELECT * FROM get_users_filter($1, $2, $3, $4, $5, $6, $7, $8, $9)',
		[
			user._id,
			query.age.gt,
			query.age.lt,
			query.location.gt,
			query.location.lt,
			query.compaitibility.gt,
			query.compaitibility.lt,
			query.sexuality,
			query.sex
		]
	)
	return result.rows
}

async function get_my_location(uid)
{
	let location = await db.pool.query('SELECT * FROM get_my_location($1)', [uid])
	return location.rows
}

module.exports = {
	deleteByUsername: deleteByUsername,
	deleteAll: deleteAll,
	getHighestView: getHighestView,
	setGeoLocBrowser: setGeoLocBrowser,
	setTypeOfLoc: setTypeOfLoc,
	updateLoc: updateLoc,
	setIPBrowser,
	setCustomLoc: setCustomLoc,
	filter: filter,
	getUserInfo: getUserInfo,
	getUserInfoByEmail,
	getTags,
	getMatches,
	getMatchesCount,
	getLikes,
	getLikesCount,
	getViewedBy,
	getViewedByCount,
	getMyViews,
	getBlocks,
	getBlocksCount,
	getUsers,
	reportUser,
	updateEmail,
	updateBio,
	updateGender,
	updateSex,
	updateFirstname,
	updateLastname,
	updateDOB,
	updateProfilePicture,
	updateProfilePictureOne,
	updateProfilePictureTwo,
	updateProfilePictureThree,
	updateProfilePictureFour,
	updatePassword,
	likeUser,
	blockUser,
	unbanUser,
	getLikedUsers,
	getBlockedUsers,
	viewUser,
	updateLocation,
	getAllUsers,
	updateVerification,
	get_my_location
};
																																																			