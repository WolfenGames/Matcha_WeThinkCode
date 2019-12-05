const http = require('http');
const app = require('./backend/app');

const normalizePort = val => {
  var port = parseInt(val, 10);
  if (isNaN(port)){
	return val;
  }
  if (port >= 0)
  {
	return port;
  }
  return false;
}

const onError = error => {
  if (error.syscall !== "listen"){
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
}

const onListening = () => {
  const addr = server.address();
  const bind = typeof addr === "string" ? "pipe " + addr : "port " + port;
  console.log("listening on " + bind);
}

const port = normalizePort(process.env.PORT || 8000);

app.set('port', port)
const server = http.createServer(app);

server.on("error", onError);
server.on('listening', onListening);

server.listen(port);

/******************************************************************************/
/*********************************RYAN FUN TIMES*******************************/
/******************************************************************************/

var io = require('socket.io')(server)

io.on('connection', function(socket){
	const {addChat, getAllChats, RoomLogin} = require('./backend/functions/chat')
	console.log('A client has connected...');

	socket.on('init', (id) => {
		RoomLogin(id.id1, id.id2, res =>{
				socket.join(res);
				io.sockets.in(res).emit('joined', res)
			})
	})

	socket.on('chat message', function(roomname, msg){
	  	io.sockets.to(roomname).emit('chat message', msg);
	});
  });
