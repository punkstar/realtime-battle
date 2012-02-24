var app = require('express').createServer()
  , io = require('socket.io').listen(app);

app.listen(8080);

app.get('/', function (req, res) {
    //res.sendfile(__dirname + '/index.html');
});

io.sockets.on('connection', function (socket) {
    io.sockets.emit('A new player has joined.'); 
});

// Create objects

// Enter gameloop

