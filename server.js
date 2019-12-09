const http = require("http");
const app = require("./backend/app");
const {
	addChat,
	getRoomChats,
	RoomLogin,
	RoomUser
} = require("./backend/functions/chat");
const { Message } = require("./backend/classes/Message");

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

const port = normalizePort(process.env.PORT || 8000);

app.set("port", port);
const server = http.createServer(app);

server.on("error", onError);
server.on("listening", onListening);

server.listen(port);

/******************************************************************************/
/*********************************RYAN FUN TIMES*******************************/
/******************************************************************************/

var io = require("socket.io")(server);

io.on("connection", function(socket) {
	console.log("A client has connected...");
	console.log(socket.id);

	socket.on("disconnect", thing => {
		console.log(socket.id);
	});

	socket.on("init", id => {
		// let thingmyjig = require('socket.io')
		// console.log((socket.id = id));
		RoomLogin(id.id1, id.id2, res => {
			getRoomChats(res, chats => {
				console.log(" init res " + res);
				socket.join(res);
				io.sockets
					.in(res)
					.emit("joined", { roomName: res, history: chats });
				res = null;
			});
		});
	});

	socket.on("chat message", function(roomname, sender, msg) {
		RoomUser(roomname, res => {
			if (res) {
				var newMessage = new Message(roomname, sender, msg, Date.now());
				addChat(newMessage);
				io.sockets.to(roomname).emit("chat message", newMessage);
			}
		});
	});
});
