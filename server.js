// Constants
var TEAMS = ['red', 'blue'];
var TEAM_COUNT = 10; // Number of entities on each team

// Globals
var id = 0;

var express = require('express');
var app = express.createServer()
var io = require('socket.io').listen(app);

io.set('log level', 1); // Reduce the log messages

app.configure(function() {
  app.use(express.static(__dirname + '/public'));
});

app.listen(8080);

app.get('/', function (req, res) {
    res.sendfile(__dirname + '/index.html');
});

io.sockets.on('connection', function (socket) {
    socket.emit('A new player has joined.'); 
    
    var player = new Entity({x: 10, y: 10}, 'green', false);
    entities.push(player);
    
    socket.on('direction-update', function (data) {
        if (data == 'N') {
            player.orientation.y = -1;
        } else if (data == 'S') {
            player.orientation.y = 1;
        } else if (data == 'W') {
            player.orientation.x = -1;
        } else if (data == 'E') {
            player.orientation.x = 1;
        } else if (data == '') {
            player.orientation.x = 0;
            player.orientation.y = 0;
        }
    })
});

var Entity = function(pos, team, npc) {
    this.id = id++;
    this.pos = pos;
    this.team = team;
    this.npc = npc;
    this.orientation = {
        x: 0,
        y: 0
    };
}

function createBots() {
    var bots = new Array();

    for (var i in TEAMS) {
        for (var j = 0; j < TEAM_COUNT; j++) {
            bots.push(new Entity({x:Math.random() * 700, y:Math.random() * 500}, TEAMS[i], true));
        }
    }

    return bots;
}

function moveEveryone() {
    for (var i in entities) {
        if (entities[i].npc) {
            entities[i].pos.x += Math.random();
            entities[i].pos.y += Math.random();
        } else {
            entities[i].pos.x += Math.random() * 20 * entities[i].orientation.x;
            entities[i].pos.y += Math.random() * 20 * entities[i].orientation.y;
        }
    }
}


function gameLoop() {
    moveEveryone();
    io.sockets.emit('update', entities); 
    setTimeout(gameLoop, 1000/5); 
}


// Create all the entities in the game (initially a bunch of bots)
var entities = createBots();

// Enter gameloop
gameLoop();

