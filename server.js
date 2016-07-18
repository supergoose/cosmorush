//http://buildnewgames.com/real-time-multiplayer/

/* global GameCore, GameWorld */

//Create the express app
var app = require('express')();
var http = require('http');

//Create the server
var server = http.createServer(app);

//Start listening on the appropriate port
server.listen(process.env.PORT);
console.log("Listening on port: " + process.env.PORT);

//Start socket.io on the server
var io = require('socket.io').listen(server);

//Request unique ID Node Package (used later)
var UUID = require("node-uuid");

//Set whether we do lots of console logs
var verbose = true;

var game = null;
var world = null;
var pollTimer = null;
var time = null;

//Redirect GET for root to the index file
app.get('/', function(req, res){
  res.sendFile(__dirname + "/rushblast/index.html");
});

app.get('/pixi.*', function(req, res){
    var file = req.params[0];
    res.sendFile(__dirname + "/node_modules/pixi.js/bin/pixi."+file);
});

app.get('/node.*', function(req, res){
    var file = req.params[0];
    res.sendFile(__dirname + "/node_modules/"+file);
});


//Redirect all other GET's to the correct folder
app.get('/*', function(req, res, next){
    var file = req.params[0];
    if(verbose)console.log("File requested: " + file);
    res.sendFile(__dirname + "/" + file);
});

//When a user connects we will log it out
require('./rushblast/game.core.js');
io.on('connection', function(client){
    client.userId = UUID();
    
    console.log('User connected: ' + client.userId);
    
    client.emit('on_connected', { 
        id: client.userId 
    });
    
    //hosting stuff - i.e. check for a host, otherwise create a game ourselves
    //for now we'll just have one game
    if(game == null)
    {
        world = GameWorld(); //require('./rushblast/game.core.js').GameWorld();
        game = GameCore(world); //require('./rushblast/game.core.js').GameCore(world);
        pollTimer = setInterval(UpdateClients, 45);
        
    }
    
    
    
    client.emit('on_game_generated', {
        //world parameters
        //players and their positions
    });
    
    client.on('disconnect', function(){
        console.log('User disconnected: ' + client.userId);
    });
    
    client.on('player_created', function(playerObj){
        console.log("Player created");
        //game.addPlayer({}, client.userId);
    });
    
    client.on('update', function(data){
        
        //update the game core with any new information from the client
        
    });
    
    
});

function UpdateClients()
{
    //push a message to all connected players with current game state
    var now = new Date().getTime();
    io.sockets.emit('server_poll', {time: now});
}