const db = require("../database/db");
// const bcrypt = require("bcrypt");
'use strict'

function CreateRoomCollection()
{
	db.mongo.connect(db.url, { useNewUrlParser: true, useUnifiedTopology: true }).then(db => {
		var dbo = db.db('Matcha');
		dbo.createCollection("Rooms").then(res => {
			db.close();
		}).catch(err => {
			console.log("Cant create collection { Chat } due to -> " + err);
		});
	}).catch(err => {
		console.log("Cant connect to database called by CreateChatCollection() due to -> " + err);
	})
}

function CreateChatCollection()
{
	db.mongo.connect(db.url, { useNewUrlParser: true, useUnifiedTopology: true }).then(db => {
		var dbo = db.db('Matcha');
		dbo.createCollection("Chat").then(res => {
			res.createIndex({sender: 1});
			res.createIndex({reciever: 1});
			db.close();
		}).catch(err => {
			console.log("Cant create collection { Chat } due to -> " + err);
		});
	}).catch(err => {
		console.log("Cant connect to database called by CreateChatCollection() due to -> " + err);
	})
}

function RoomLogin(id1, id2, cb) {
    db.mongo.connect(db.url, { useNewUrlParser: true, useUnifiedTopology: true }).then(db => {
		var dbo = db.db('Matcha');
		dbo.collection('Rooms').findOne({$or: [{id1: id1, id2: id2}, {id1:id2, id2:id1}]}).then(result => {
            if (!result)
            {
                dbo.collection('Rooms').insertOne({roomName: 'room-' + id1 + '-' + id2, id1: id1, id2: id2}).then(res => {
                    console.log(res.ops.roomName);
                    cb(res.ops.roomName)
                }).catch(err => {console.log(err)})
            }else
                cb(result.roomName)
            }).catch(err => {console.log(err)})
		}).catch(err => {
			console.log("Cant create collection { Chat } due to -> " + err);
		});
}

async function addChat(sender, reciever, message)
{
	db.mongo.connect(db.url, { useNewUrlParser: true, useUnifiedTopology: true}).then(db => {
		let dbo = db.db('Matcha')
		dbo.collection('Chat').insertOne({
				sender: sender,
				reciever: reciever,
				message: message,
				timeStamp: Date()
			}).catch(err => {
				console.log("fuck fuck fuck " + err)
			})
	}).catch(err => {
		console.log("fuck fuck " + err)
	});
}

function getAllChats(a, b, cb)
{
	db.mongo.connect(db.url, { useNewUrlParser: true, useUnifiedTopology: true}).then(db => {
		let dbo = db.db('Matcha')
		dbo.collection('Chat').find(
			{
				$or: [
					{ sender: a, reciever: b},
					{ sender: b, reciever: a}
				]
			}
		).toArray().then(res => {
			cb(res);
		}).catch(err => {
			console.log("Fuck fuck fg " + err);
		})
	}).catch(err => {
		console.log("fuck fuck " + err)
	});
}

module.exports = {
	CreateChatCollection: CreateChatCollection,
	addChat: addChat,
    getAllChats: getAllChats,
    CreateRoomCollection: CreateRoomCollection,
    RoomLogin: RoomLogin
}