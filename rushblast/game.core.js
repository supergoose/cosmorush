function isServer()
{
    return ('undefined' != typeof global); 
}

function GameCore(world)
{
    console.log("Initialising GameCore...");
    
    //save the world
    var game_world = world;
    var players = [];
    
    this.time = new Date().getTime();
    
    this.local_inputs_to_handle = [];
    this.remote_inputs_to_handle = [];
    
    if(!isServer())
    {
        console.log("Not server");
        requestAnimationFrame(GameCoreUpdate);
    }else{
        setInterval(GameCoreUpdate, 15); //physics step
    }
    
    //As the same class is used for server and client, if this is the server version then it will need to call this first...
    this.initServer = function()
    {
        //require("pixi.js");
    }
    
    this.addPlayer = function(p, uid)
    {
        players[uid] = p;
    }
    
    this.getPlayers = function()
    {
        return players;
    }
    
    this.handleInput = function(i)
    {
        var p = players[i.uid];
        p.handleInput(i.GameInput);
    }
}

function GameCoreUpdate()
{
    //Get delta time
    var now = new Date().getTime();
    var dt = now - this.time;
    this.time = now;
    
    if(!isServer())requestAnimationFrame(GameCoreUpdate);
    
    if(this.local_inputs_to_handle.length > 0)
    {
        do
        {
            var ipt = this.local_inputs_to_handle[0]; //get the earliest input from the player
            this.local_inputs_to_handle.shift(); //delete the earliest input from the player
        }while(this.local_inputs_to_handle.length > 0)
    }
}

if(isServer()) {
    module.exports.GameCore = global.GameCore = GameCore;
}


function GameWorld()
{
    //make some kind of game world with asteroids etc.
}

if( 'undefined' != typeof global ) {
    module.exports.GameWorld = global.GameWorld = GameWorld;
}


/*
Input class
-----------
Class is used to create and store inputs

*/
function UserInput(data, time)
{
    this.data = data;
    this.time = time;
}



/*
Player class
------------
*/

function Player(sx, sy, rb)
{
    GameSprite.call(this, sx, sy, rb);
    
    var forward = {};
    var brake = {};
    var direction = 0; 
    var thrust = 1;
    const maxSpeed = 4;
    var maxSpeedSquare = maxSpeed * maxSpeed;
    this.playerId = null;
    
    this.setUUID = function(u)
    {
        if(this.playerId == null)
        {
            this.playerId = u;
        }
    }
    
    this.handleInput = function(i)
    {
        if(i.forward)
        {
            
        }
    }
    
    this.applyThrust = function()
    {
        if(forward.isDown)
        {
            //clamp the velocity
            var curVel = this.getVelocity();
            var vel = {
                x:curVel.x+ Math.cos(direction) * thrust,
                y:curVel.y+ Math.sin(direction) * thrust
            }
            
            var speedSquared = vel.x*vel.x + vel.y*vel.y;
            
            if(speedSquared > maxSpeed * maxSpeed)
            {
                speedSquared = maxSpeed;
                var speed = Math.sqrt(speedSquared);

                var dir  = Math.atan2(vel.y, vel.x);
                vel.x = Math.cos(dir) * speed;
                vel.y = Math.sin(dir) * speed;
            }
            
            this.setVelocity(vel.x, vel.y);
        }
    }
    
    this.applyBrake = function()
    {
        if(brake.isDown)
        {
            var vel = this.getVelocity();
            vel.x *= 0.9;
            vel.y *= 0.9;
            this.setVelocity(vel.x, vel.y);
        }
    }
}

Player.prototype = Object.create(GameSprite);
Player.prototype.constructor = Player;

Player.prototype.getUUID = function()
{
    return this.playerId;
}


/*
GameSprite class
----------------
Class is used as the cornerstone of all moving sprites onscreen.

Args
----
Starting position: x, y

*/
function GameSprite(sx, sy, rb)
{
    
    //Initial velocity
    var velocity = {x:0, y:0};
    
    //Key privileged variables
    this.active = true; //automatically active
    this.visible = true;
    this.width = this.height = 0;
    
    //Set whether this has a rigidbody attached or not - all rigidbodies use circular collision detection for speed
    this.rigidbody = rb || false; //enables physics on this
    this.initialPosition = {x:sx || 0, y:sy || 0}; //set initial position
    
    //Accessor Methods
    //----------------
    
    this.setVelocity = function(velX, velY)
    {
        velocity.x = velX;
        velocity.y = velY;
    }
    
    this.getVelocity = function()
    {
        return velocity;
    }
    
    this.setVector = function(v)
    {
        velocity.x = Math.cos(v.r)*v.s;
        velocity.y = Math.sin(v.r)*v.s;
    }
    
    this.getMass = function()
    {
        return 10;
    }
    
    this.setSprite = function(spr)
    {
        this.sprite = spr;
        this.width = spr.width;
        this.height = spr.height;
    }
    
}

//Update function called every frame
GameSprite.prototype.update = function()
{
    //Move the sprite according to it's current velocity
    if(this.active)
    {
        this.x -= this.getVelocity().x;
        this.y -= this.getVelocity().y;
    }
}

//Collided method
//Calls when sprite has been collided with
GameSprite.prototype.collided = function(o)
{
    //has a collided method, but doesn't do anything yet
}

//Kill method
GameSprite.prototype.kill = function()
{
    this.active = false;
    this.visible = false;
}

//Awaken - opposite of kill
GameSprite.prototype.awaken = function()
{
    this.active = true;
    this.visible = true;
}

GameSprite.prototype.getVector = function()
{
    var vel = this.getVelocity();
    var s = Math.sqrt((vel.x*vel.x)+(vel.y*vel.y));
    return {speed: s, direction: this.rotation};
}

//Avoid calling every frame as uses square root function
GameSprite.prototype.distanceTo = function(o)
{
    var d = Math.sqrt((this.x - o.x)*(this.x - o.x)+(this.y - o.y)*(this.y - o.y));
    return d;
}

GameSprite.prototype.reset = function()
{
    this.awaken();
    
    this.x = this.initialPosition.x;
    this.y = this.initialPosition.y;
    
    this.setVelocity(0,0);
}