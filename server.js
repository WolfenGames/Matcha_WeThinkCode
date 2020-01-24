const http = require("http");
const { app, sessionMiddleware } = require("./backend/app");
const {
	addChat,
	getRoomChats,
	RoomLogin,
	RoomUser
} = require("./backend/functions/chat");
const { Message } = require("./backend/classes/Message");
const _mongo          = require('mongodb');
const db = require("./backend/database/db");
const notification = require("./backend/functions/notification")

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

io.use((socket, next) => {
	sessionMiddleware(socket.request, socket.request.res, next);
});

io.on("connection", function(socket) {
	socket.on("init", id => {
		if (
			socket.request.session &&
			socket.request.session.user._id === id.id1
		) {
			RoomLogin(id.id1, id.id2, res => {
				getRoomChats(res, chats => {
					socket.join(res);
					io.sockets
						.in(res)
						.emit("joined", {
							roomName: res,
							history: chats,
							person: socket.request.session.user.username
						});
					res = null;
				});
			});
		}
	});

	socket.on("chat message", function(roomname, sender, msg) {
		RoomUser(roomname, res => {
			if (res) {
				if (
					socket.request.session.user._id === res.id1 ||
					socket.request.session.user._id === res.id2
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
						var oID =  new _mongo.ObjectID(sen);
						db.mongo
							.connect(db.url, { useNewUrlParser: true, useUnifiedTopology: true })
							.then(db => {
								var dbo = db.db("Matcha");
								return dbo.collection("Users")
									.findOne({_id: oID}, {username: 1})
							}).then(function(res){
								notification.addNotification(rec ,"<img src='"+res.picture.Picture1+"'>"+res.username+" sent you a message");
							});
					}
				}
			}
		});
	});
});
