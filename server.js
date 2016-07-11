var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var UUID = require("node-uuid");

var verbose = true;

//Redirect GET for root to the index file
app.get('/', function(req, res){
  res.sendFile(__dirname + "/index.html");
});

//http://buildnewgames.com/real-time-multiplayer/
//Redirect all other GET's to the correct folder
app.get('/*', function(req, res, next){
    var file = req.params[0];
    if(verbose)console.log("File requested: " + file);
    res.sendFile(__dirname + "/" + file);
});

io.on('connection', function(client){
    client.userId = UUID();
    
    console.log('User connected: ' + client.userId);
    
    io.on('disconnect', function(){
        console.log('User disconnected: ' + client.userId);
    });
});

//Create a socket.io instance for our io listener
http.listen(process.env.PORT, function(){
    console.log('listening on port: ' + process.env.PORT);
});

