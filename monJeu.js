var config = {
	type: Phaser.AUTO,
	width: 800,
	height: 600,
physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: true
        }
    },
scene: {
		init: init,
		preload: preload,
		create: create,
		update: update
	}
};

var game = new Phaser.Game(config);
var score = 0;

function init(){
 	var platforms;
	var player;
	var cursors; 
	var stars;
	var scoreText;
	var bomb;
	var scoreJump;
	var jumpCount;

}

function preload(){
	this.load.image('background','_img/Background800x600.png');	
	this.load.image('fond','_img/ground.png');
	this.load.image('etoile','_img/Etoile.png');
	this.load.image('sol','_img/platform.png');
	this.load.image('bomb','_img/Bombe.png');
	this.load.spritesheet('perso','_img/adventurer-SheetW.png',{frameWidth: 24, frameHeight: 35});
}



function create(){
	this.add.image(0,0,'background').setOrigin(0,0);

	platforms = this.physics.add.staticGroup();
	platforms.create(400,568,'fond');
	platforms.create(600,400,'sol');
	platforms.create(50,250,'sol');
	
	player = this.physics.add.sprite(100,450,'perso');
	player.setCollideWorldBounds(true);
	player.setBounce(0.2);
	player.body.setGravityY(000);
	this.physics.add.collider(player,platforms);
	
	cursors = this.input.keyboard.createCursorKeys(); 

	var timeSinceLastIncrement = 0;
	
	this.anims.create({
		key:'left',
		frames: this.anims.generateFrameNumbers('perso', {start: 8, end: 13}),
		frameRate: 10,
		repeat: -1
	});
	
	this.anims.create({
		key:'stop',
		frames: [{key: 'perso', frame:0}],
		frameRate: 20
	});
	
	stars = this.physics.add.group({
		key: 'etoile',
		repeat:11,
		setXY: {x:12,y:0,stepX:70}
	});
	
	this.physics.add.collider(stars,platforms);
	this.physics.add.overlap(player,stars,collectStar,null,this);

	scoreText = this.add.text(16,16, 'score: 0', {fontSize: '32px', fill:'#000'});
	scoreJump = this.add.text(16,48, 'Jump: 0', {fontSize: '32px', fill:'#000'});
	bombs = this.physics.add.group();
	this.physics.add.collider(bombs,platforms);
	this.physics.add.collider(bombs,bombs);
	this.physics.add.collider(player,bombs, hitBomb, null, this);

	jumpCount = 0;

	this.physics.add.overlap(bombs,stars,bombHitStar,null,this);

}

function update(){
	if(cursors.left.isDown){
		player.anims.play('left', true);
		player.setVelocityX(-300);
		player.setFlipX(true);
	}else if(cursors.right.isDown){
		player.setVelocityX(300);
		player.anims.play('left', true);
		player.setFlipX(false);
	}else{ 
		player.anims.play('stop', true);
		player.setVelocityX(0);
	}
	
	if(cursors.down.isDown && !player.body.touching.down){
		player.setVelocityY(300);
	}

	if(cursors.up.isDown && player.body.touching.down){
		player.body.touching.down
		player.setVelocityY(-330);	
		scoreJump.setText('scoreJump: '+jumpCount);
	}else if(cursors.up.isUp && !player.body.touching.down){
		this.time.addEvent({
			delay: 100,
			callback: ()=>{
				if(cursors.up.isDown  && jumpCount <1){
				doubleJump(player)
				}
			},
		})	
	}

	if(player.body.touching.down){
		jumpCount = 0;
		scoreJump.setText('scoreJump: '+jumpCount);
	}


}

function doubleJump(player){
	
		player.setVelocityY(-330);
		jumpCount += 1;
		scoreJump.setText('scoreJump: '+jumpCount);
}


function hitBomb(player, bombs){
	this.physics.pause();
	player.setTint(0xff0000);
	player.anims.play('turn');
	gameOver=true;
}

function bombHitStar(bombs, stars){
	bombs.setVelocity(400);
}

function collectStar(player, star){
	star.disableBody(true,true);
	score += 10;
	scoreText.setText('score: '+score);
	if(stars.countActive(true)===0){
		stars.children.iterate(function(child){
			child.enableBody(true,child.x,0, true, true);
		});
		
		var x = (player.x < 400) ? 
			Phaser.Math.Between(400,800):
			Phaser.Math.Between(0,400);
		var bomb = bombs.create(x, 16, 'bomb');
		bomb.setBounce(1);
		bomb.setCollideWorldBounds(true);
		bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
	}
}