// Constants
var TEAMS = ['red', 'blue'];
var TEAM_COUNT = 10; // Number of entities on each team

// Globals
var id = 0;

var app = require('express').createServer()
  , io = require('socket.io').listen(app);

app.listen(8080);

app.get('/', function (req, res) {
    //TODO serve up the template file
    //res.sendfile(__dirname + '/index.html');
});

io.sockets.on('connection', function (socket) {
    io.sockets.emit('A new player has joined.'); 
});

var Entity = function(position, team) {
    this.id = id++;
    this.position = position;
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
        entities[i].position.x += Math.random();
        entities[i].position.y += Math.random();
    }
}


function gameLoop() {
    moveEveryone();
    console.log(entities);
    setTimeout(gameLoop, 500); 
}


// Create all the entities in the game (initially a bunch of bots)
var entities = createBots();

console.log(entities);
// Enter gameloop
gameLoop();

