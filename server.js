const http = require("http");
const { app, sessionMiddleware } = require("./backend/app");
const {
	addChat,
	getRoomChats,
	RoomLogin,
	RoomUser
} = require("./backend/functions/chat");
const { Message } = require("./backend/classes/Message");
const manageUser = require("./backend/functions/userManagement")
const notification = require("./backend/functions/notification")
const dotenv = require('dotenv')

const result = dotenv.config()
 
if (result.error) {
  throw result.error
}

const normalizePort = val => {
	var port = parseInt(val, 10);
	if (isNaN(port)) {
		return val;
	}
	if (port >= 0) {
		return port;
	}
	return false;
};

const onError = error => {
	if (error.syscall !== "listen") {
		throw error;
	}
	const bind = typeof addr === "string" ? "pipe " + addr : "port " + port;
	switch (error.code) {
		case "EACCESS":
			console.error(bind + " requires elevated privileges");
			process.exit(1);
			break;
		case "EADDRINUSE":
			console.error(bind + " is already in use");
			process.exit(1);
			break;
		default:
			throw error;
	}
};

const onListening = () => {
	const addr = server.address();
	const bind = typeof addr === "string" ? "pipe " + addr : "port " + port;
	console.log("listening on " + bind);
};

const port = normalizePort(process.env.PORT || 8080);

app.set("port", port);
const server = http.createServer(app);

server.on("error", onError);
server.on("listening", onListening);

server.listen(port);

/******************************************************************************/
/*********************************RYAN FUN TIMES*******************************/
/******************************************************************************/

var io = require("socket.io")(server);

io.use((socket, next) => {
	sessionMiddleware(socket.request, socket.request.res, next);
});

io.on("connection", function(socket) {
	socket.on("init", async id => {
		if (
			socket.request.session &&
			socket.request.session.user._id == id.id1
		) {
			let room = await RoomLogin(id.id1, id.id2)
			let chats = await getRoomChats(room.room_login)
			socket.join(room.room_login)
			io.sockets.in(room.room_login)
				.emit("joined", {
					roomName: room.room_login,
					history: chats,
					person: socket.request.session.user.username
				})
		}
	});

	socket.on("chat message", async function(roomname, sender, msg) {
		let res = await RoomUser(roomname)
		if (res) {
			if (
				socket.request.session.user._id == res.id1 ||
				socket.request.session.user._id == res.id2
			) {
				if (msg) {
					var newMessage = new Message(
						roomname,
						sender,
						msg,
						Date.now()
					);
					addChat(newMessage);
					io.sockets
						.in(roomname)
						.emit("chat message", newMessage);
					if (socket.request.session.user._id === res.id1) {
						var rec = res.id2;
						var sen = res.id1;
					} else {
						var rec = res.id1;
						var sen = res.id2;
					};
					let user = await manageUser.getUserInfo(sen)
					let reciever = await manageUser.getUserInfo(rec)
					notification.addNotification(reciever ,"<img src='"+user.profile_picture+"'>"+user.username+" sent you a message");
				}
			}
		}
	});
});
