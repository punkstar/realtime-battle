// Constants
var TEAMS = ['red', 'blue'];
var TEAM_COUNT = 10; // Number of entities on each team
var WALK_SPEED = 1;

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
    switch (team) {
        case 'red': this.orientation = 'left'; break;
        case 'blue': this.orientation = 'right'; break;
    }
    this.action = 'walk';

    this.update = function() {
         switch(this.action) {
             case 'walk': this.walk(); break;
         }
    }

    // ACTIONS
    this.walk = function() {
        direction = {x: 0, y: 0};
        
        switch (this.orientation) {
            case 'left': direction.x -= WALK_SPEED; break;
            case 'right': direction.x += WALK_SPEED; break;
            case 'up': direction.y += WALK_SPEED; break;
            case 'down': direction.y -= WALK_SPEED; break;
        }

        this.pos.x += direction.x;
        this.pos.y += direction.y;
    }
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

function updateEntities() {
    for (var i in entities) {
        entities[i].update();
    }
}

function gameLoop() {
    updateEntities();
    io.sockets.emit('update', entities); 
    setTimeout(gameLoop, 1000/30); 
}


// Create all the entities in the game (initially a bunch of bots)
var entities = createBots();

// Enter gameloop
gameLoop();

