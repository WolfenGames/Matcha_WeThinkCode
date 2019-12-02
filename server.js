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

// https://www.youtube.com/watch?v=tHbCkikFfDE

var connections = [];
const io = require('socket.io').listen();//server);

io.sockets.on('connection',function(socket){
    connections.push(socket);
    console.log('Connected: %s', connections);

    //Disconnect
    connections.splice(connections.indexOf(socket), 1)
})