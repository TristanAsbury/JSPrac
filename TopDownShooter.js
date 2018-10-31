let backgroundColor;
let gamePlayer;
let gameBullets = [];
let gameParticles = [];

function setup(){
  textAlign(CENTER);
  gamePlayer = new Player();
  createCanvas(windowWidth, windowHeight);
  backgroundColor = color(195,58,95);
}

function draw(){
  background(backgroundColor);
  gamePlayer.move();
  gamePlayer.show();
  for(b = 0; b < gameBullets.length; b++){ //move and show bullets
    gameBullets[b].move();
    gameBullets[b].show();
  }
  for(p = 0; p < gameParticles.length; p++){
    gameParticles[p].move();
    gameParticles[p].show();
  }
  drawUI();
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}

//For movement
function keyPressed(e){
  gamePlayer.updateMovement(e);
}

function keyReleased(e){
  gamePlayer.updateMovement(e);
}

//For combat
function mousePressed(){
  console.log("Mouse Down!");
  gamePlayer.updateGun();
}

function mouseReleased(){
  console.log("Mouse Up!");
  gamePlayer.updateGun();
}


class Enemy {

  constructor(){
    this.level = random(1, gamePlayer.level);
    this.health = this.level * 7.25;

    //position
    this.pos = new createVector()
  }

  move(){
  }



  show(){
    ellipse(this.pos.x, this.pos.y, 15, 15);
  }

}

class Player {

  constructor(){
    //moving booleans
    this.isMovingForward = false;
    this.isMovingBack = false;
    this.isMovingLeft = false;
    this.isMovingRight = false;

    //player data
    this.level = 0;
    this.xp = 0;
    this.xpCap = 100;
    this.health = 100;

    //gun and combat booleans
    this.isFiring = false;
    this.timeSinceLastShot = 0;
    this.shootInterval = 8; //this could be replaced with gun fire rat variable from gun picked up
    this.magSize = 100; //could be replaced with gun magazine size from gun picked up
    this.ammo = this.magSize; //could be set to the gun [picked up] max mag size
    this.reloadTime = 90; //could be set to reload speed of gun picked up
    this.reloadedTime = 0;

    //movement data
    this.pos = new createVector(windowWidth / 2, windowHeight / 2);
    this.vertical = new createVector(0, 3);
    this.horizontal = new createVector(3, 0);
    this.vertSmooth = new createVector(0, 0.1);
    this.horSmooth = new createVector(0.1, 0);
  }

  updateMovement(keyPressed){
    if(keyPressed.key == "w"){
      if(this.isMovingForward){
        this.isMovingForward = false;
      } else {
        this.isMovingForward = true;
      }
    }
    if(keyPressed.key == "a"){
      if(this.isMovingLeft){
        this.isMovingLeft = false;
      } else {
        this.isMovingLeft = true;
      }
    }
    if(keyPressed.key == "s"){
      if(this.isMovingBack){
        this.isMovingBack = false;
      } else {
        this.isMovingBack = true;
      }
    }
    if(keyPressed.key == "d"){
      if(this.isMovingRight){
        this.isMovingRight = false;
      } else {
        this.isMovingRight = true;
      }
    }
  }

  updateGun(){ //ugly toggle
      if(this.isFiring){
        this.isFiring = false;
      } else {
        this.isFiring = true;
      }
  }

  move(){
    if(this.isFiring){
      if(this.timeSinceLastShot >= this.shootInterval){ //basically saying if the last time you fired was more than the rate of fire, then the gun shoots
        if(this.ammo <= 0){
          this.isReloading = true;
        } else {
          this.shootingDir = new createVector(mouseX - this.pos.x, mouseY - this.pos.y);
          gameBullets.push(new Bullet(this.pos, this.shootingDir));
          this.ammo--;
          this.timeSinceLastShot = 0;
        }
      }
      this.timeSinceLastShot++;
    }

    if(this.isReloading){
      if(this.reloadedTime >= this.reloadTime){
        this.isReloading = false;
        this.ammo = this.magSize;
        this.reloadedTime = 0;
      } else {
        this.reloadedTime++;
      }
    }

    if(this.isMovingForward){
      this.pos.sub(this.vertical);
    }
    if(this.isMovingBack){
      this.pos.add(this.vertical);
    }
    if(this.isMovingLeft){
      this.pos.sub(this.horizontal);
    }
    if(this.isMovingRight){
      this.pos.add(this.horizontal)
    }
  }

  show(){ //simply draws the player at its pos
    push();
    fill(0);
    strokeWeight(3);
    stroke(255);
    ellipse(this.pos.x, this.pos.y, 35, 35);
    pop();
  }

}

class Bullet {

  constructor(originEntity, dir){
    this.lifeTime = 0;
    this.maxLifeTime = 70;
    this.pos = new createVector(originEntity.x, originEntity.y);
    this.randomFactor = new createVector(random(-30, 30), random(-30, 30));
    this.dir = dir;
    this.dir.add(this.randomFactor);
  }

  move(){
    this.pos.add(this.dir.normalize().x * 8, this.dir.normalize().y * 8);
  }

  show(){
    push();
    noStroke();
    fill(0);
    ellipse(this.pos.x, this.pos.y, 8, 8);

    this.lifeTime++;
    if(this.lifeTime >= this.maxLifeTime){
      for(var p = 0; p < 10; p++){ //create particles
        gameParticles.push(new Particle(this, color(237, random(76,197), random(45,67))));
      }
      gameBullets.splice(gameBullets.indexOf(this), 1);
    }

  }

}

class Particle {
  constructor(originEntity, color){
    this.pos = new createVector(originEntity.pos.x, originEntity.pos.y);
    this.dir = new createVector(random(-3, 3), random(-3, 3));
    this.color = color;
    this.lifeTime = 0;
    this.maxLifeTime = random(10, 50);
  }

  move(){
    this.pos.add(this.dir);
  }

  show(){
    push();
    noStroke();
    fill(this.color)
    ellipse(this.pos.x, this.pos.y, 5, 5);
    pop();
    this.lifeTime++;
    if(this.lifeTime >= this.maxLifeTime){
      gameParticles.splice(gameParticles.indexOf(this), 1);
    }
  }
}

function drawUI(){
  textAlign(CENTER);
  textSize(24);
  if(gamePlayer.isReloading){
    text("Ammo: RELOADING", windowWidth/2, windowHeight - 30);
  } else {
    text("Ammo: " + gamePlayer.ammo + " / " + gamePlayer.magSize, windowWidth/2, windowHeight - 30);
  }
}

function normalize(originalVector){
  let divNum = sqrt(pow(originalVector.x, 2) + pow(originalVector.y, 2));

  let newVector = new createVector(originalVector.x / divNum, originalVector.y / divNum);

  return newVector;
}
