/* global io */
    
//Start socket client
var socket;// = io();
var connected = false;
var UUID = 0;

/* global PIXI */

/* global GameSprite */

/* global GameCore, GameWorld, UserInput */

//Set PIXI aliases
var Container = PIXI.Container;
var Renderer = PIXI.autoDetectRenderer;
var Loader = PIXI.loader;
var Resources = PIXI.loader.resources;
var Sprite = PIXI.Sprite;
var Rectangle = PIXI.Rectangle;
var ParticleContainer = PIXI.ParticleContainer;

//Create rendering equipment
var renderer = new Renderer(800,600);
var stage = new Container(0x000000);

renderer.view.style.position = "absolute";
renderer.view.style.display = "block";
renderer.autoResize = true;
renderer.resize(window.innerWidth-20, window.innerHeight-30);

//Input
/* global Keyboard */
var Mouse = renderer.plugins.interaction.mouse.global;
var w = Keyboard(87);
var s = Keyboard(83);
var a = Keyboard(65);
var d = Keyboard(68);
var space = Keyboard(32);
var quit = Keyboard(27);
var inputs = [];

//Camera
/* global Camera */
var camera = new Camera(stage);
var camPoint = {x:0, y:0};
camera.zoom = 1;
camera.width = renderer.width;
camera.height = renderer.height;
camera.target = camPoint;

var world;
var core;

//Get ready to setup once all scripts have loaded
window.onload = function()
{
    //Add the renderer view to the screen
    document.body.appendChild(renderer.view);
    
    //Start loading assets
    Loader
    .add("Ship", "rushblast/img/ship.png")
    .load(setup);
}



//Commence initialisation
function setup()
{
    
    //Connect to socket.io
    socket = io();
    socket.on('on_connected', function(data)
    {
        connected = true;
        UUID = data.id;
        console.log("Connected: " + UUID);
        console.log("Getting game world...");
    });
    
    socket.on('on_game_generated', function(data)
    {
        console.log("Game world found.");
        console.log("Creating player...");
        
        world = new GameWorld();
        core = new GameCore(world);
        
        //Create the player
        var player = new GameSprite(300, 300, true);
        var pSprite = new Sprite(Resources["Ship"].texture);
        stage.addChild(pSprite);
        player.sprite = pSprite;
        console.log("Adding player to server...");
        socket.emit('player_created', { p: true} );
    });
    
    socket.on('player_add_successful', function()
    {
        console.log("Player added. Commencing game.");
    });
    
    socket.on('server_poll', function(data)
    {
        
    });
    
    
    renderer.render(camera);
    
    //Connect the keys
    window.addEventListener("keydown", handleKeyboardInputDown, false);
    window.addEventListener("keyup", handleKeyboardInputUp, false);
}

function handleKeyboardInputDown(e)
{
    console.log("Input down: " + e.keyCode);
    
    var now = new Date().getTime();
    
    var i = new UserInput(
        { 
        type:"keyboard",
        key:e.keyCode, 
        toggle: true
        }, 
        now);
    core.local_inputs_to_handle.push(i);
    
    if(connected)
    {
        var serverPacket = 'i.' + e.keyCode + ".d." + now.toString();
        socket.emit('update', serverPacket);
    }
    
}

function handleKeyboardInputUp(e)
{
    console.log("Input up: " + e.keyCode);
    var now = new Date().getTime();
    
    var i = new UserInput(
        { 
        type:"keyboard",
        key:e.keyCode, 
        toggle: false
        }, 
        now);
    core.local_inputs_to_handle.push(i);
    
    if(connected)
    {
        
        var serverPacket = 'i.' + e.keyCode + ".u." + now.toString();
        socket.emit('update', serverPacket);
    }
}