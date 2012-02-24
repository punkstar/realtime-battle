// Constants
var TEAMS = ['red', 'blue'];
var TEAM_COUNT = 10; // Number of entities on each team

// Globals
var id = 0;

var express = require('express');
var app = express.createServer()
var io = require('socket.io').listen(app);

app.configure(function() {
  app.use(express.static(__dirname + '/public'));
});

app.listen(8080);

app.get('/', function (req, res) {
    res.sendfile(__dirname + '/index.html');
});

io.sockets.on('connection', function (socket) {
    io.sockets.emit('A new player has joined.'); 
});

var Entity = function(pos, team) {
    this.id = id++;
    this.pos = pos;
    this.team = team;
}

function createBots() {
    var bots = new Array();

    for (var i in TEAMS) {
        for (var j = 0; j < TEAM_COUNT; j++) {
            bots.push(new Entity({x:Math.random() * 700, y:Math.random() * 500}, TEAMS[i]));
        }
    }

    return bots;
}

function moveEveryone() {
    for (var i in entities) {
        entities[i].pos.x += Math.random();
        entities[i].pos.y += Math.random();
    }
}


function gameLoop() {
    moveEveryone();
    io.sockets.emit('update', entities); 
    setTimeout(gameLoop, 1000/30); 
}


// Create all the entities in the game (initially a bunch of bots)
var entities = createBots();

// Enter gameloop
gameLoop();

