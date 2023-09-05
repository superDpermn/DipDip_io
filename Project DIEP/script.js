const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize',function(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});
//your code here

//Autocompleted inputHandler setup
const pressedKeys = [];

window.addEventListener('keydown',function(event){
    if(event.key.length == 1 && !event.repeat){
        if(['w','a','s','d'].includes(event.key)){
            pressedKeys.push(event.key);
        }
    }
});

window.addEventListener('keyup',function(event){
    if(event.key.length == 1 && pressedKeys.includes(event.key)){
        pressedKeys.splice(pressedKeys.indexOf(event.key),1);
    }
});

function calculateColor(percentRemaining){
    let RED = Math.floor(254 - (percentRemaining * 254)) + 1;
    let GREEN = Math.floor(percentRemaining * 254) + 1;
    return "rgb("+RED+","+GREEN+",50)";
}

class HealthBar{
    constructor(initX,initY,width,height,maxHp){
        this.width = width;
        this.height = height;
        this.maxHp = maxHp;
        this.currentHp = maxHp;
        this.x = initX;
        this.y = initY;
    }
    updatePos(x,y){
        this.x = x - Math.floor(this.width/2);
        this.y = y - this.height - 15;
    }
    draw(){
        ctx.fillStyle = calculateColor(this.currentHp/this.maxHp);
        ctx.strokeStyle = "rgb(50,50,50)";
        ctx.lineWidth = 2;
        ctx.fillRect(this.x,this.y,Math.floor((this.currentHp/this.maxHp)*this.width),this.height);
        ctx.strokeRect(this.x,this.y,Math.floor((this.currentHp/this.maxHp)*this.width),this.height);
    }
}

class PlayerHealthBar{
    constructor(width,height,maxHp){
        this.width = width;
        this.height = height;
        this.maxHp = maxHp;
        this.currentHp = maxHp;
    }
    draw(){
        ctx.fillStyle = calculateColor(this.currentHp/this.maxHp);
        ctx.strokeStyle = "rgb(50,50,50)";
        ctx.lineWidth = 2;
        ctx.fillRect(Math.floor(canvas.width/2 - this.width/2),Math.floor(canvas.height/2) - 80,this.width,this.height);
        ctx.strokeRect(Math.floor(canvas.width/2 - this.width/2),Math.floor(canvas.height/2) - 80,this.width,this.height);
    }
}

class Player{
    constructor(mapObject){
        this.radius = 50;
        this.bounds = [mapObject.MapWidth - canvas.width,mapObject.MapHeight - canvas.height - 5];
        this.x = Math.floor(this.bounds[0]/2);
        this.y = Math.floor(this.bounds[1]/2);
        this.renderDistance = 600 + canvas.width;
        this.speed = 5;
        this.healthBar = new PlayerHealthBar(100,15,500);
    }
    draw(){
        ctx.fillStyle = "rgb(70,100,150)";
        ctx.beginPath();
        ctx.arc(canvas.width/2,canvas.height/2,this.radius,0,Math.PI*2);
        ctx.fill();
        ctx.strokeStyle = "rgb(35,50,75)";
        ctx.lineWidth = 5;
        ctx.stroke();
        this.healthBar.draw();
    }
    moveUp(){
        if(this.y-this.radius > -canvas.height/2){this.y -= this.speed;}
    }
    moveDown(){
        if(this.y+this.radius < this.bounds[1] + canvas.height/2){this.y += this.speed;}
    }
    moveLeft(){
        if(this.x-this.radius > -canvas.width/2){this.x -= this.speed;}
    }
    moveRight(){
        if(this.x+this.radius < this.bounds[0] + canvas.width/2){this.x += this.speed;}
    }
}

function Up(){MainGame.player.moveUp();}
function Left(){MainGame.player.moveLeft();}
function Down(){MainGame.player.moveDown();}
function Right(){MainGame.player.moveRight();}

function handleInput(){ //call this in every game frame
    if(pressedKeys.length > 0){
        for(let keyIndex = 0; keyIndex < pressedKeys.length; keyIndex++){
            switch(pressedKeys[keyIndex]){
                case"w":
                    Up();
                break;
                case"a":
                    Left();
                break;
                case"s":
                    Down();
                break;
                case"d":
                    Right();
                break;
            }
        }
    }
} //Autocomplete ends here

function dist(x1,x2,y1,y2){return Math.sqrt((x1-x2) * (x1-x2) + (y1-y2) * (y1-y2));}

class gameObject{
    constructor(x,y,width,height){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    isVisible(playerObject){
        return dist(this.x + (this.width/2),playerObject.x + Math.floor(canvas.width/2),this.y + (this.height/2),playerObject.y + Math.floor(canvas.height/2)) < playerObject.renderDistance;
    }
    isColliding(playerObject){
        return dist(this.x + (this.width/2),playerObject.x + Math.floor(canvas.width/2),this.y + (this.height/2),playerObject.y + Math.floor(canvas.height/2)) < playerObject.radius + this.width + 10;
    }
}

class Tile extends gameObject{
    constructor(adjustedX,adjustedY,width,height,colorStr){
        super(adjustedX,adjustedY,width,height);
        this.type = "TILE";
        this.color = colorStr
    }
    draw(xData,yData){
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - xData, this.y - yData, this.width, this.height);
    }
}

class GameMap{
    constructor(tileX,tileY,tileW,tileH){
        this.Xcount = tileX;
        this.Ycount = tileY;
        this.tileWidth = tileW;
        this.tileHeight = tileH;
        this.MapWidth = this.Xcount * this.tileWidth;
        this.MapHeight = this.Ycount * this.tileHeight;
        this.MapData = [];
        let tempColor = "rgb(100,100,100)";
        for(let i = 0; i < tileX; i++){
            for(let j = 0; j < tileY; j++){
                if(i == 0 || i == tileX - 1 || j == 0 || j == tileY - 1){tempColor = "rgb(100,100,100)";}
                else{tempColor = "gray";}
                this.MapData.push(new Tile(i*tileW,j*tileH,tileW,tileH,tempColor));
            }
        }
    }
    draw(playerObject){
        let myX = playerObject.x;
        let myY = playerObject.y;
        for(let temp = 0; temp < this.MapData.length; temp++){
            if(this.MapData[temp].isVisible(playerObject)){this.MapData[temp].draw(myX,myY);}
        }
    }
}

class Square extends gameObject{
    constructor(x,y){
        super(x,y,50,50);
        this.color = "rgb(200,200,50)";
        this.borderColor = "rgb(100,100,25)";
        this.points = 10;
    }
    draw(xData,yData){
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - xData, this.y - yData, this.width, this.height);
        ctx.strokeStyle = this.borderColor;
        ctx.lineWidth = 10;
        ctx.strokeRect(this.x - xData, this.y - yData, this.width, this.height);
    }
}

class Triangle extends gameObject{
    constructor(x,y){
        super(x,y,50,50);
        this.color = "rgb(200,150,120)";
        this.borderColor = "rgb(100,75,60)";
        this.scale = 1;
        this.points = 35;
    }
    draw(xData,yData){
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(this.x - xData, this.y - yData);
        ctx.lineTo(this.x - xData - (25*this.scale),this.y - yData - (43*this.scale));
        ctx.lineTo(this.x - xData - (50*this.scale),this.y - yData);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = this.borderColor;
        ctx.lineWidth = 10;
        ctx.stroke();
    }
}

class ObjectGenerator{
    constructor(DataArray){
        this.objectData = DataArray;
        this.counters = [];
        this.counterMax = [];
        this.objectCounts = [];
        this.objectCountsMax = [];
        this.objectIDlist = [];
        for(let i = 0; i < DataArray.length; i++){
            this.counters.push(0);
            this.counterMax.push(DataArray[i][1]);
            this.objectCounts.push(0);
            this.objectCountsMax.push(DataArray[i][0]);
            this.objectIDlist.push(i);
        }
    }
    generate(objectID,xCoord,yCoord){
        switch(objectID){ //add objects here as you create classes for them
            case 0:
                this.theGame.AddObject(new Square(xCoord,yCoord));
                this.objectCounts[0]++;
                break;
            case 1:
                this.theGame.AddObject(new Triangle(xCoord,yCoord));
                this.objectCounts[1]++;
                break;

            default:
                break;
        }
    }
    updateTimers(passedTime){
        for(let iter = 0; iter < this.counters.length; iter++){
            this.counters[iter] += passedTime;
            if(this.counters[iter] > this.counterMax[iter]){
                this.counters[iter] = 0;
                if(this.objectCounts[iter] < this.objectCountsMax[iter]){
                    this.objectCounts[iter]++;
                    this.generate(this.objectIDlist[iter], Math.floor(Math.random() * (this.mapW - 100) + 51), Math.floor(Math.random() * (this.mapH - 100) + 51));
                }
            }
        }
    }
    setGame(game){
        this.theGame = game;
    }
    setMap(map){
        this.theMap = map;
        this.mapW = map.MapWidth;
        this.mapH = map.MapHeight;
    }
}

class Game{
    constructor(mapObject,generator){
        this.player = new Player(mapObject);
        this.map = mapObject;
        this.generator = generator;
        this.objects = [];
    }
    Render(){
        this.map.draw(this.player);
        
        let PX = this.player.x;
        let PY = this.player.y;
        for(let index = 0; index < this.objects.length; index++){
            if(this.objects[index].isVisible(this.player)){
                this.objects[index].draw(PX,PY);
            }
        }
        this.player.draw();
    }
    AddObject(obj){
        this.objects.push(obj);
    }
    RemoveObject(obj){
        this.objects.splice(this.objects.indexOf(obj),1);
    }
    CollisionUpdate(){
        for(let index = 0; index < this.objects.length; index++){
            if(this.objects[index].isColliding(this.player)){
                
            }
        }
    }
}

//syntax: [[maxCount,spawnCD],...]
const mainGenerator = new ObjectGenerator([[30,60],[20,80]]);
const mainMap = new GameMap(30,30,100,100);
const MainGame = new Game(mainMap,mainGenerator);

mainGenerator.setGame(MainGame);
mainGenerator.setMap(mainMap);

let deltaTime = 0;
let timeStamp = 0;
let lastTime = 0;
let fps = 30;
const frameInterval = 1/fps;

function animate(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    MainGame.Render();
    
    timeStamp = requestAnimationFrame(animate);

    let tempTime = timeStamp - lastTime;
    deltaTime += tempTime
    MainGame.generator.updateTimers(tempTime);

    lastTime = timeStamp;

    if(deltaTime > frameInterval){
        deltaTime = 0;
        handleInput();
    }
}

animate();