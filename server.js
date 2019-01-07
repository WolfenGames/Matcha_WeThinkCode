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
const io = require('socket.io').listen(server);

io.on('connection', function (socket) {
  console.log("Connected succesfully to the socket ...");

  var news = [
      { title: 'The cure of the Sadness is to play Videogames',date:'04.10.2016'},
      { title: 'Batman saves Racoon City, the Joker is infected once again',date:'05.10.2016'},
      { title: "Deadpool doesn't want to do a third part of the franchise",date:'05.10.2016'},
      { title: 'Quicksilver demand Warner Bros. due to plagiarism with Speedy Gonzales',date:'04.10.2016'},
  ];

  // Send news on the socket
  socket.emit('news', news);

  socket.on('my other event', function (data) {
      console.log(data);
  });
});

server.on("error", onError);
server.on('listening', onListening);

server.listen(port);