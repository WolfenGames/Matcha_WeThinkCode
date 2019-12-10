const db = require("../database/db");
("use strict");

function CreateRoomCollection() {
	db.mongo
		.connect(db.url, { useNewUrlParser: true, useUnifiedTopology: true })
		.then(db => {
			var dbo = db.db("Matcha");
			dbo.createCollection("Rooms")
				.then(res => {
					db.close();
				})
				.catch(err => {
					console.log(
						"Cant create collection { Chat } due to -> " + err
					);
				});
		})
		.catch(err => {
			console.log(
				"Cant connect to database called by CreateChatCollection() due to -> " +
					err
			);
		});
}

function CreateChatCollection() {
	db.mongo
		.connect(db.url, { useNewUrlParser: true, useUnifiedTopology: true })
		.then(db => {
			var dbo = db.db("Matcha");
			dbo.createCollection("Chat")
				.then(res => {
					res.createIndex({ sender: 1 });
					res.createIndex({ reciever: 1 });
					db.close();
				})
				.catch(err => {
					console.log(
						"Cant create collection { Chat } due to -> " + err
					);
				});
		})
		.catch(err => {
			console.log(
				"Cant connect to database called by CreateChatCollection() due to -> " +
					err
			);
		});
}

function RoomLogin(id1, id2, cb) {
	db.mongo
		.connect(db.url, { useNewUrlParser: true, useUnifiedTopology: true })
		.then(db => {
			var dbo = db.db("Matcha");
			dbo.collection("Rooms")
				.findOne({
					$or: [
						{ id1: id1, id2: id2 },
						{ id1: id2, id2: id1 }
					]
				})
				.then(result => {
					if (!result) {
						dbo.collection("Rooms")
							.insertOne({
								roomName: "room-" + id1 + "-" + id2,
								id1: id1,
								id2: id2
							})
							.then(res => {
								cb(res.ops.roomName);
							})
							.catch(err => {
								console.log(err);
							});
					} else cb(result.roomName);
				})
				.catch(err => {
					console.log(err);
				});
		})
		.catch(err => {
			console.log("Cant create collection { Chat } due to -> " + err);
		});
}

function RoomUser(roomName, cb) {
	db.mongo
		.connect(db.url, { useNewUrlParser: true, useUnifiedTopology: true })
		.then(db => {
			var dbo = db.db("Matcha");
			dbo.collection("Rooms")
				.findOne({ roomName: roomName })
				.then(result => {
					console.log(result);
					if (!result) {
						cb(null);
					} else cb(result);
				})
				.catch(err => {
					console.log(err);
				});
		})
		.catch(err => {
			console.log("Cant create collection { Rooms } due to -> " + err);
		});
}

async function addChat(message) {
	db.mongo
		.connect(db.url, { useNewUrlParser: true, useUnifiedTopology: true })
		.then(db => {
			let dbo = db.db("Matcha");
			dbo.collection("Chat")
				.insertOne(message)
				.catch(err => {
					console.log("fuck fuck fuck " + err);
				});
		})
		.catch(err => {
			console.log("fuck fuck " + err);
		});
}

function getRoomChats(roomName, cb) {
	db.mongo
		.connect(db.url, { useNewUrlParser: true, useUnifiedTopology: true })
		.then(db => {
			let dbo = db.db("Matcha");
			dbo.collection("Chat")
				.find({ roomName: roomName }, { date: 1 })
				.limit(10)
				.sort({ date: -1 })
				.toArray()
				.then(res => {
					var rev = res.reverse();
					cb(rev);
				})
				.catch(err => {
					console.log("Fuck fuck fg " + err);
				})
				.catch(err => {
					console.log("fuck fuck " + err);
				});
		})
		.catch(err => {
			console.log("Error getting room chats: " + err);
		});
}

module.exports = {
	CreateChatCollection: CreateChatCollection,
	addChat: addChat,
	getRoomChats: getRoomChats,
	CreateRoomCollection: CreateRoomCollection,
	RoomLogin: RoomLogin,
	RoomUser: RoomUser
};
