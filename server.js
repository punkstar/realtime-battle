// Constants
var TEAMS = ['red', 'blue'];
var TEAM_COUNT = 10; // Number of entities on each team
var WALK_SPEED = 5;
var FPS = 30;
var MAX = {x: 800, y: 600};

// Globals
var id = 0;

var express = require('express');
var app = express.createServer()
var io = require('socket.io').listen(app);
var _ = require('./public/underscore.js')._;

io.set('log level', 1); // Reduce the log messages

app.configure(function() {
  app.use(express.static(__dirname + '/public'));
});

app.listen(8080);

app.get('/', function (req, res) {
    res.sendfile(__dirname + '/index.html');
});

io.sockets.on('connection', function (socket) {
    socket.emit('message', 'Welcome to the game'); 
    
    var player = new Entity({ x: 10, y: 10 }, 'green', false);
    entities.push(player);
    
    socket.on('direction-update', function (data) {
        if (data == 'N') {
            player.orientation = 'up';
        } else if (data == 'S') {
            player.orientation = 'down';
        } else if (data == 'W') {
            player.orientation = 'left';
        } else if (data == 'E') {
            player.orientation = 'right';
        } else if (data == '') {
            player.orientation = null;
        }
    })
});

var Entity = function(pos, team, npc) {
    this.id = id++;
    this.pos = pos;
    this.team = team;
    this.npc = npc;
    this.dead = false
    switch (team) {
        case 'red':  this.orientation = 'left';  break;
        case 'blue': this.orientation = 'right'; break;
    }
    this.action = 'walk';

    this.update = function() {
        if (this.npc && this.isColliding()) {
            this.dead = true;
        } else {
            switch(this.action) {
                case 'walk': this.walk(); break;
            }
        }
    }

    this.isColliding = function () {
        return _.any(entities, function (entity) {
            if (entity.id == this.id) return false;
            
            var d_x = entity.pos.x - this.pos.x;
            var d_y = entity.pos.y - this.pos.y;
            
            var d = Math.sqrt(Math.pow(d_x, 2) + Math.pow(d_y, 2));
            
            return d <= 10;
        }, this);
    }

    // ACTIONS
    this.walk = function() {
        direction = { x: 0, y: 0 };
        
        switch (this.orientation) {
            case 'left':  this._walk('x', -WALK_SPEED); break;
            case 'right': this._walk('x',  WALK_SPEED); break;
            case 'up':    this._walk('y', -WALK_SPEED); break;
            case 'down':  this._walk('y',  WALK_SPEED); break;
        }
    }

    this._walk = function(axis, speed) {
        switch(axis) {
            case 'x':
                this.pos.x += speed;
                if (this.pos.x < 0) {
                    this.pos.x = MAX.x;
                } else if (this.pos.x > MAX.x) {
                    this.pos.x = 0;
                }
                break;
            case 'y':
                this.pos.y += speed;
                if (this.pos.y < 0) {
                    this.pos.y = MAX.y;
                } else if (this.pos.y > MAX.y) {
                    this.pos.y = 0;
                }
                break;
        }
    }
}

function createBots() {
    for (var i in TEAMS) {
        for (var j = 0; j < TEAM_COUNT; j++) {
            createBot(TEAMS[i]);
        }
    }
}

function createBot(team) {
    var e = new Entity({ x: Math.random() * MAX.x, y: Math.random() * MAX.y }, team, true);
    entities.push(e);
}

function updateEntities() {
    for (var i in entities) {
        var entity = entities[i];
        entity.update();
        
        if (entity.dead) {
            var team = entity.team; team = team.charAt(0).toUpperCase() + team.slice(1);
            createBot(entity.team);
            io.sockets.emit('message', 'Current <strong>Bot #' + i + '</strong> (' + team + ' team) has died'); 
            entities.splice(i,1);
        }
    }
}

function gameLoop() {
    updateEntities();
    io.sockets.emit('update', entities); 
    setTimeout(gameLoop, 1000/FPS); 
}


// Create all the entities in the game (initially a bunch of bots)
var entities = [];
createBots();

// Enter gameloop
gameLoop();

