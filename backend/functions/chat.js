const db = require("../database/db");
("use strict");

async function RoomLogin(id1, id2) {
	let result = await db.pool.query('SELECT * FROM room_login($1::int, $2::int)', [id1, id2])
	return result.rows[0]
}

async function RoomUser(roomName) {
	let result = await db.pool.query('SELECT * FROM get_room($1)', [roomName])
	return result.rows[0]
}

async function addChat(message) {
	await db.pool.query('CALL add_chat($1, $2, $3)', 
	[
		message.roomName,
		message.sender,
		message.text
	])
}

async function getRoomChats(roomName) {
	let result = await db.pool.query("SELECT * FROM get_room_chats($1)", [roomName])
	return result.rows
}

module.exports = {
	addChat: addChat,
	getRoomChats: getRoomChats,
	RoomLogin: RoomLogin,
	RoomUser: RoomUser
};
