const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// window.addEventListener('resize',function(){
//     canvas.width = window.innerWidth;
//     canvas.height = window.innerHeight;
// });
//your code here

function thisWayUp(keyCode){
    switch(keyCode){
        case 'w':
        case 's':
            MainGame.player.startVslow();
            break;
        case 'a':
        case 'd':
            MainGame.player.startHslow();
            break;
    }
}

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
        thisWayUp(event.key);
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
        this.maxWidth = width;
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
    draw(xData,yData){
        ctx.fillStyle = calculateColor(this.currentHp/this.maxHp);
        ctx.strokeStyle = "rgb(50,50,50)";
        ctx.lineWidth = 2;
        ctx.fillRect(this.x - xData + 25, this.y - yData - 10,Math.floor((this.currentHp/this.maxHp)*this.width),this.height);
        ctx.strokeRect(this.x - xData + 25, this.y - yData - 10,this.maxWidth,this.height);
    }
    getDamaged(amount){
        //this method returns whether or not this object remains alive.
        if(this.currentHp > amount && amount > 0){
            this.currentHp -= amount;
            return true;
        }else{
            return false;
        }
    }
    setHp(amount){
        if(amount >= 0){
            this.currentHp = amount;
        }
    }
}

class PlayerHealthBar{
    constructor(width,height,maxHp){
        this.width = width;
        this.maxWidth = width;
        this.height = height;
        this.maxHp = maxHp;
        this.currentHp = maxHp;
        this.timeoutID = 0;
        this.regenCD = 5000;
        this.regenAmount = 5;
        this.regenerating = true;
    }
    draw(){
        ctx.fillStyle = calculateColor(this.currentHp/this.maxHp);
        ctx.strokeStyle = "rgb(50,50,50)";
        ctx.lineWidth = 2;
        ctx.fillRect(Math.floor(canvas.width/2 - this.width/2),Math.floor(canvas.height/2) - 80,this.width * (this.currentHp/this.maxHp),this.height);
        ctx.strokeRect(Math.floor(canvas.width/2 - this.width/2),Math.floor(canvas.height/2) - 80,this.maxWidth,this.height);
        ctx.font = "10px sans-serif";
        ctx.fillStyle = "black";
        ctx.fillText(this.currentHp.toString() + " / " + this.maxHp.toString(),Math.floor(canvas.width/2 - this.width/2),Math.floor(canvas.height/2) - 85);
    }
    setHp(amount){
        if(amount >= 0){
            this.currentHp = amount;
        }   
    }
    playerRegen(){
        this.regenerating = true;
    }
    regenUpdate(isAlive){
        if(isAlive && this.regenerating){
            if(this.currentHp + this.regenAmount < this.maxHp){
                this.currentHp += this.regenAmount;
            }
            else{
                this.currentHp = this.maxHp;
                this.regenerating = false;
            }
        }
    }
    getDamaged(amount){
        if(this.currentHp > amount && amount > 0){
            this.currentHp -= amount;
            this.regenerating = false;
            clearTimeout(this.timeoutID);
            this.timeoutID = setTimeout(function(){MainGame.player.healthBar.playerRegen();},this.regenCD);
            return true;
        }else{
            return false;
        }
    }
}

class playerGUI{
    constructor(playerObject){
        this.player = playerObject;
        this.xp = 0;
        this.level = 1;
        this.maxLevel = 45;
        this.levelUpTreshold = 45;
        this.isMaxLevel = false;
        this.width = 300;
        this.height = 40;
        this.maxWidth = 300;
        this.x = Math.floor((canvas.width - this.width)/2);
        this.y = Math.floor(canvas.height - this.height) - 50;
        this.xpCurve = 1.2;
        this.hpCurve = 1.2;
    }
    draw(){
        ctx.fillStyle = "rgb(212, 113, 254)";
        ctx.strokeStyle = "rgb(97, 0, 83)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(this.x,this.y,this.width,this.height,15);
        ctx.stroke();
        ctx.closePath();
        ctx.beginPath();
        ctx.roundRect(this.x,this.y,this.width*this.xp/this.levelUpTreshold,this.height,15);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "black";
        ctx.font = "20px sans-serif";
        ctx.fillText(this.xp.toString() + " / " + (this.levelUpTreshold).toString() + "   level: " + this.level.toString(),this.x-80+Math.round(this.width/2),this.y+10+Math.round(this.height/2),this.width-100);
    }
    addXP(xp){
        this.xp += xp;
        this.checkLevelUp();
    }
    checkLevelUp(){
        if(this.xp > this.levelUpTreshold){
            this.xp = 0;
            this.levelUp();
        }
    }
    levelUp(){
        if(this.level < this.maxLevel){
            this.level++;
            this.levelUpTreshold = Math.round(this.levelUpTreshold*this.xpCurve);
            this.player.healthBar.maxHp = Math.round(this.player.healthBar.maxHp*this.hpCurve);
            this.player.healthBar.regenAmount++;
            clearTimeout(this.player.healthBar.timeoutID);
            this.player.healthBar.playerRegen();
            this.player.healthBar.isInvincible = true;
            setTimeout(function(){MainGame.player.isInvincible = false;},2000);
        }else{
            this.isMaxLevel = true;
        }
    }
}

class Player{
    constructor(mapObject){
        this.radius = 50;
        this.bounds = [mapObject.MapWidth - canvas.width,mapObject.MapHeight - canvas.height - 5];
        this.x = Math.floor(this.bounds[0]/2);
        this.y = Math.floor(this.bounds[1]/2);
        this.GUI = new playerGUI(this);
        this.renderDistance = 600 + canvas.width;
        this.speed = 5;
        this.atkDamage = 100;
        this.isInvincible = false;
        this.isAlive = true;
        this.healthBar = new PlayerHealthBar(100,15,1500);
        this.ySpeed = 0;
        this.xSpeed = 0;
        this.hSlow = false;
        this.vSlow = false;
        this.lastHorizontalMoveLeft = false;
        this.lastVerticalMoveUp = false;
        this.dirChangeCompensation = 0.2;
    }
    draw(){
        if(this.isAlive){
            ctx.fillStyle = "rgb(70,100,150)";
            ctx.strokeStyle = "rgb(35,50,75)";
        }else{
            ctx.fillStyle = "rgb(150,100,70)";
            ctx.strokeStyle = "rgb(75,50,35)";
        }
        ctx.beginPath();
        ctx.arc(canvas.width/2,canvas.height/2,this.radius,0,Math.PI*2);
        ctx.fill();
        
        ctx.lineWidth = 5;
        ctx.stroke();
        this.healthBar.draw();
        this.GUI.draw();
    }
    moveUp(){
        if(this.vSlow){
            this.ySpeed = this.dirChangeCompensation;
        }this.vSlow = false;
        if(this.y-this.radius > -canvas.height/2){
            this.ySpeed += this.ySpeed < this.speed ? 0.1 : 0;
            this.y -= this.ySpeed;
        }this.lastVerticalMoveUp = true;
    }
    moveDown(){
        if(this.vSlow){
            this.ySpeed = this.dirChangeCompensation;
        }this.vSlow = false;
        if(this.y+this.radius < this.bounds[1] + canvas.height/2){
            this.ySpeed += this.ySpeed < this.speed ? 0.1 : 0;
            this.y += this.ySpeed;
        }this.lastVerticalMoveUp = false;
    }
    moveLeft(){
        if(this.hSlow){
            this.xSpeed = this.dirChangeCompensation;
        }this.hSlow = false;
        if(this.x-this.radius > -canvas.width/2){
            this.xSpeed += this.xSpeed < this.speed ? 0.1 : 0;
            this.x -= this.xSpeed;
        }this.lastHorizontalMoveLeft = true;
    }
    moveRight(){
        if(this.hSlow){
            this.xSpeed = this.dirChangeCompensation;
        }this.hSlow = false;
        if(this.x+this.radius < this.bounds[0] + canvas.width/2){
            this.xSpeed += this.xSpeed < this.speed ? 0.1 : 0;
            this.x += this.xSpeed;
        }this.lastHorizontalMoveLeft = false;
    }
    slowHorizontal(){
        if(this.xSpeed > 0.3){
            this.xSpeed -= Math.floor(this.xSpeed * 10) / 50;
            this.x += this.lastHorizontalMoveLeft ? -this.xSpeed : this.xSpeed;
        }else{
            this.xSpeed = 0;
            this.hSlow = false;
        }
    }
    slowVertical(){
        if(this.ySpeed > 0.3){
            this.ySpeed -= Math.floor(this.ySpeed * 10) / 50;
            this.y += this.lastVerticalMoveUp ? -this.ySpeed : this.ySpeed;
        }else{
            this.ySpeed = 0;
            this.vSlow = false;
        }
    }
    startHslow(){
        this.hSlow = true;
    }
    startVslow(){
        this.vSlow = true;
    }
    MovementUpdate(){
        if(this.hSlow){
            this.slowHorizontal();
        }
        if(this.vSlow){
            this.slowVertical();
        }
    }
    onDestroyObject(points){
        if(points > 0){
            this.GUI.addXP(points);
        }
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
        this.xSpeed = 0;
        this.ySpeed = 0;
        this.isMoving = false;
    }
    moveTo(x,y){
        this.x = x;
        this.y = y;
    }
    isVisible(playerObject){
        return dist(this.x + (this.width/2),playerObject.x + Math.floor(canvas.width/2),this.y + (this.height/2),playerObject.y + Math.floor(canvas.height/2)) < playerObject.renderDistance;
    }
    isColliding(playerObject){
        return dist(this.x + (this.width/2),playerObject.x + Math.floor(canvas.width/2),this.y + (this.height/2),playerObject.y + Math.floor(canvas.height/2)) < 100;
    }
    addForceFrom(x,y){
        this.isMoving = true;
        if(Math.abs(this.x - x) < 20){
            this.xSpeed = this.x > x ? 1 : -1;
        }
        else if(Math.abs(this.x - x) < 30){
            this.xSpeed = this.x > x ? 1.5 : -1.5;
        }
        else{
            this.xSpeed = this.x > x ? 2 : -2;
        }

        if(Math.abs(this.y - y) < 20){
            this.ySpeed = this.y > y ? 1 : -1;
        }
        else if(Math.abs(this.y - y) < 30){
            this.ySpeed = this.y > y ? 1.5 : -1.5;
        }
        else{
            this.ySpeed = this.y > y ? 2 : -2;
        }
    }
}

class Tile extends gameObject{
    constructor(adjustedX,adjustedY,width,height,colorStr){
        super(adjustedX,adjustedY,width,height);
        this.type = "TILE0";
        this.color = colorStr
    }
    draw(xData,yData){
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - xData, this.y - yData, this.width, this.height);
        ctx.strokeStyle = "rgb(100,100,100)";
        ctx.lineWidth = 3;
        ctx.strokeRect(this.x - xData, this.y - yData, this.width, this.height);
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
        let tempColor;
        let tempType;
        for(let i = 0; i < tileX; i++){
            for(let j = 0; j < tileY; j++){
                if(i <= 1 || i >= tileX - 2 || j <= 1 || j >= tileY - 2){tempColor = "rgb(120,120,120)";tempType = "TILE1";}
                else{tempColor = "rgb(150,150,150)";tempType = "TILE0";}
                this.MapData[this.MapData.push(new Tile(i*tileW,j*tileH,tileW,tileH,tempColor)) - 1].type = tempType;
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
        this.type = "SQUARE";
        this.dir = 0;
        this.healthBar = new HealthBar(this.x,this.y,70,10,500);
    }
    draw(xData,yData){
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - xData, this.y - yData, this.width, this.height);
        ctx.strokeStyle = this.borderColor;
        ctx.lineWidth = 10;
        ctx.strokeRect(this.x - xData, this.y - yData, this.width, this.height);
        this.healthBar.draw(xData,yData);
    }
    UpdatePosition(xBound,yBound){
        if(this.x+this.xSpeed > 100 && this.x+this.xSpeed < xBound - 100){
            this.x += this.xSpeed;
        }
        if(this.y+this.ySpeed > 100 && this.y+this.ySpeed < yBound - 100){
            this.y += this.ySpeed;
        }
        this.healthBar.updatePos(this.x,this.y);

        if(Math.abs(this.xSpeed) < 0.3){
            this.xSpeed = 0;
        }
        else{
            this.xSpeed += this.xSpeed > 0 ? -0.1 : 0.1;
        }

        if(Math.abs(this.ySpeed) < 0.3){
            this.ySpeed = 0;
        }
        else{
            this.ySpeed += this.ySpeed > 0 ? -0.1 : 0.1;
        }
        if(this.xSpeed == 0 && this.ySpeed == 0){
            this.isMoving = false;
        }
    }
}

class Triangle extends gameObject{
    constructor(x,y){
        super(x,y,50,50);
        this.color = "rgb(200,150,120)";
        this.borderColor = "rgb(100,75,60)";
        this.scale = 1;
        this.points = 35;
        this.type = "TRIANGLE";
        this.healthBar = new HealthBar(this.x,this.y,80,10,1500);
    }
    draw(xData,yData){
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(this.x - xData + (50*this.scale), this.y - yData + (50*this.scale));
        ctx.lineTo(this.x - xData + (25*this.scale),this.y - yData + (7*this.scale));
        ctx.lineTo(this.x - xData,this.y - yData + (50*this.scale));
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = this.borderColor;
        ctx.lineWidth = 10;
        ctx.stroke();
        this.healthBar.draw(xData,yData);
    }
    UpdatePosition(xBound,yBound){
        if(this.x+this.xSpeed > 100 && this.x+this.xSpeed < xBound - 100){
            this.x += this.xSpeed;
        }
        if(this.y+this.ySpeed > 100 && this.y+this.ySpeed < yBound - 100){
            this.y += this.ySpeed;
        }
        this.healthBar.updatePos(this.x,this.y);

        if(Math.abs(this.xSpeed) < 0.3){
            this.xSpeed = 0;
        }
        else{
            this.xSpeed += this.xSpeed > 0 ? -0.1 : 0.1;
        }

        if(Math.abs(this.ySpeed) < 0.3){
            this.ySpeed = 0;
        }
        else{
            this.ySpeed += this.ySpeed > 0 ? -0.1 : 0.1;
        }
        if(this.xSpeed == 0 && this.ySpeed == 0){
            this.isMoving = false;
        }
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
                    this.generate(this.objectIDlist[iter], Math.floor(Math.random() * (this.mapW - 250) + 151), Math.floor(Math.random() * (this.mapH - 250) + 151));
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
    remove(obj){
        switch(obj.type){
            case "SQUARE":
                if(this.objectCounts[0]>0){
                    this.objectCounts[0]--;
                }
                break;
            case "TRIANGLE":
                if(this.objectCounts[1]>0){
                    this.objectCounts[1]--;
                }
                break;

            default:
                break;
        }
    }
}

class Game{
    constructor(mapObject,generator){
        this.player = new Player(mapObject);
        this.map = mapObject;
        this.generator = generator;
        this.objects = [];
        this.removalList = [];
        this.distanceTreshold = 120; //this value represents the minimum distance two objects can have without colliding
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
        this.generator.remove(obj);
        this.objects.splice(this.objects.indexOf(obj),1);
        this.player.onDestroyObject(obj.points);
    }
    objectCollisionUpdate(){
        for(let index1 = 0; index1 < this.objects.length; index1++){
            for(let index2 = index1+1; index2 < this.objects.length; index2++){
                if(dist(this.objects[index1].x,this.objects[index2].x,this.objects[index1].y,this.objects[index2].y) < this.distanceTreshold){
                    //push objects in the opposite direction.
                    this.objects[index1].addForceFrom(this.objects[index2].x,this.objects[index2].y);
                    this.objects[index2].addForceFrom(this.objects[index1].x,this.objects[index1].y);
                }
            }
        }
    }
    objectMovementUpdate(){
        for(let i = 0; i < this.objects.length; i++){
            this.objects[i].UpdatePosition(this.map.MapWidth,this.map.MapHeight);
        }
    }
    CollisionUpdate(){
        for(let index = 0; index < this.objects.length; index++){
            if(this.objects[index].isColliding(this.player)){

                if(!this.objects[index].healthBar.getDamaged(this.player.atkDamage)){
                    this.removalList.push(this.objects[index]);
                }else{
                    this.objects[index].addForceFrom(this.player.x + Math.floor(canvas.width/2),this.player.y + Math.floor(canvas.height/2));
                }
                if(!this.player.isInvincible){
                    let tempDMG;
                    switch(this.objects[index].type){
                        case "SQUARE":
                            tempDMG = 8;
                            break;
                        case "TRIANGLE":
                            tempDMG = 18;
                            break;
                        //add object types as needed.
                        default:
                            tempDMG = 0;
                            break;
                    }
                    if(this.player.isAlive && !this.player.isInvincible){
                        this.player.isAlive = this.player.healthBar.getDamaged(tempDMG);
                    }
                }
            }
        }
        for(let k=0;k<this.removalList.length;k++){
            this.RemoveObject(this.removalList[k]);
        }
        this.removalList = [];
        this.objectCollisionUpdate();
    }
    PlayerUpdate(){
        this.player.healthBar.regenUpdate(this.player.isAlive);
        this.player.MovementUpdate();
    }
    
}

//syntax: [[maxCount,spawnCD],...]
const mainGenerator = new ObjectGenerator([[50,20],[35,30]]);

const mainMap = new GameMap(50,50,100,100);
const MainGame = new Game(mainMap,mainGenerator);

mainGenerator.setGame(MainGame);
mainGenerator.setMap(mainMap);

let deltaTime = 0;
let deltaTime2 = 0;
let timeStamp = 0;
let lastTime = 0;
let fps = 30;
const frameInterval = 10/fps;

function animate(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    MainGame.Render();
    
    timeStamp = requestAnimationFrame(animate);

    let tempTime = timeStamp - lastTime;
    deltaTime += tempTime;
    deltaTime2 += tempTime;
    MainGame.generator.updateTimers(tempTime);

    lastTime = timeStamp;

    if(deltaTime > frameInterval){
        deltaTime = 0;
        handleInput();
        MainGame.objectMovementUpdate();
    }
    if(deltaTime2 > 3){ //code here will execute slower compared to deltaTime 1
        deltaTime2 = 0;
        MainGame.CollisionUpdate();
        MainGame.PlayerUpdate();
    }
}

animate();