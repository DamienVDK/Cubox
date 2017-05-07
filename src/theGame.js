var theGame = function(game){
  // all variables stored in the game object
  this.squareSize = 40;
  this.startingSquareX = 2;
  this.startingSquareY = 7;
  this.level = 8;
  this.moveTime = 125;
  this.count = Math.ceil(Math.random()*5)+2;
  this.score = 0;
  // all variables available with their name
  var squareSize = this.squareSize;
  var startingSquareX = this.startingSquareX;
  var startingSquareY = this.startingSquareY;
  var count = this.count;
}
theGame();

theGame.prototype = {
  init: function(game){
    this.score = 0;
    this.count = Math.ceil(Math.random()*5)+2;
    this.level = 8;
    this.moveTime = 125;
  },
  create: function(game){

      game.stage.backgroundColor = 808080;

      //start music
      music = this.game.add.audio('soundtrack');
      music.fadeIn(1500);

			//create all groups
		  this.terrainGroup = game.add.group();
		  this.enemyGroup = game.add.group();
      this.smasherGroup = game.add.group();

			// filling the field with squares to create the terrain
      //game.width/squareSize+2
		  for(var i=0; i<24; i++){
		      var square = game.add.sprite(i*squareSize, 8*squareSize, "ground");
		      this.terrainGroup.add(square);
		  }

			// adding the hero
		  this.hero = game.add.sprite(startingSquareX*squareSize+squareSize/2, startingSquareY*squareSize+squareSize/2, "hero");
		  this.hero.eyes=game.add.sprite(startingSquareX*squareSize+squareSize/2, startingSquareY*squareSize+squareSize/2, "eyes");
		  this.hero.anchor.set(0.5);
		  this.hero.eyes.anchor.set(0.5);
		  this.hero.canMove = true;
		  game.physics.enable(this.hero, Phaser.Physics.ARCADE);
		  this.hero.body.moves = false;

      //Prevent directions and space key events bubbling up to browser
      game.input.keyboard.addKeyCapture([
        Phaser.Keyboard.LEFT,
        Phaser.Keyboard.RIGHT,
        Phaser.Keyboard.UP,
        Phaser.Keyboard.DOWN,
        Phaser.Keyboard.SPACEBAR
    ]);
			// input listener waiting for mouse or touch input, then calling moveSquare method
		  //game.input.onDown.add(this.moveSquare, this);
      //game.input.onHold.add(this.moveSquare, this);


	},
	moveSquare: function(game){
    //nothing
		if(this.hero.canMove){

	    this.hero.canMove = false;

			// if the hero have to go up
	    this.terrainGroup.sort("x", Phaser.Group.SORT_ASCENDING);
	    if(this.terrainGroup.getChildAt(3).y==(this.hero.y+squareSize/2)){
	      //do nothing
	    }else if(this.terrainGroup.getChildAt(3).y<(this.hero.y+squareSize/2)){
	      //go up
	      this.hero.y-=squareSize;
	      this.hero.eyes.y-=squareSize;
	    }

      //tween to scroll all groups to the left by squareSize pixels
      this.terrainGroup.forEach(function(item){
        var scrollTween = this.add.tween(item).to({
  	      x: item.x - squareSize
  	    }, this.moveTime, Phaser.Easing.Linear.None, true);
      }, this);
      this.enemyGroup.forEach(function(item){
        var scrollTween = this.add.tween(item).to({
  	      x: item.x - squareSize
  	    }, this.moveTime, Phaser.Easing.Linear.None, true);
      }, this);
      this.smasherGroup.forEach(function(item){
        var scrollTween = this.add.tween(item).to({
  	      x: item.x - squareSize
  	    }, this.moveTime, Phaser.Easing.Linear.None, true);
      }, this);

			// tween to rotate and move the hero
	    var moveTween = this.add.tween(this.hero).to({
	      angle: this.hero.angle+90
	    },this.moveTime, Phaser.Easing.Linear.None, true);

      // once the rotation has been completed...
      moveTween.onComplete.add(function(){
        if(this.terrainGroup.getChildAt(3).y>(this.hero.y+squareSize/2)){
          //go up
          this.hero.y+=squareSize;
          this.hero.eyes.y+=squareSize;
        }

        //the hero can move again
        this.hero.canMove = true;
        this.terrainGroup.sort("x", Phaser.Group.SORT_ASCENDING);

        //getting the leftmost enemy and destroy it
        this.enemyGroup.sort("x",Phaser.Group.SORT_ASCENDING);
        if(this.enemyGroup.length > 0 && this.enemyGroup.getChildAt(0).x <= this.terrainGroup.getChildAt(0).x){
          this.enemyGroup.getChildAt(0).destroy();
        }
        //bring leftmost square to the right
        this.terrainGroup.getChildAt(0).y=this.level*squareSize;
        this.terrainGroup.getChildAt(0).x+=this.terrainGroup.length*squareSize;

        // determining the level of the ground
        var sign=Math.random() < 0.5 ? -1 : 1;
        if(count<3){
          if(this.level>8){
            this.level-=1;
          }else if(this.level<7){
            this.level+=1;
          }else{
            this.level+=1*sign;
          }
          count=Math.ceil(Math.random()*5)+2;
          }
        else{
            count--;
        }
        //create enemy with the enemy's creator handler
        if(this.rnd.integerInRange(0,9)<6){
          this.addSmasher();
        }else{  this.addEnemy();}
      }, this);
      this.score++;
		}
	},
	update: function(game){
    var that=this;
    if(game.input.activePointer.isDown){
      that.moveSquare();
    };
    if(game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)){
      var speed=this.game.add.audio('speed');
      var slow=this.game.add.audio('slowdown');
      that.hero.tint = 0xd21111;
      speed.play("",0,0.2);
      that.moveTime=75;
      game.time.events.add(Phaser.Timer.SECOND*1.4, function(){
        slow.play("",0,0.2);
        game.time.events.add(Phaser.Timer.SECOND*0.6, function(){
          that.moveTime=125;
          that.hero.tint = 0xFFFFFF;
        },that);
      }, this);
    }
    if(this.smasherGroup.length>=1){
      this.smasherGroup.forEach(function(item){
        item.fall(item.lastHeight);
      },this);
    }
		//looking for collision between the hero and the enemies
    game.physics.arcade.collide(this.hero,this.enemyGroup,restart);
    game.physics.arcade.collide(this.hero,this.smasherGroup,restart);
    function restart(){
      //restart the game
      var gameover = that.game.add.audio('gameover');
      gameover.play();
      that.state.start("GameOver",true,false,that.score);
      music.destroy();
    }
	},
	addEnemy: function(game){
    // adding the enemy over the rightmost tile
    this.terrainGroup.sort("x", Phaser.Group.SORT_DESCENDING);
    var enemy = this.add.sprite(this.terrainGroup.getChildAt(0).x,0,"enemy");
    this.physics.enable(enemy,Phaser.Physics.ARCADE);
    enemy.body.moves=false;
    var lastHeight=this.terrainGroup.getChildAt(0).y-40;
    //giving the enemy a yoyo tween to move it at a random speed
    this.add.tween(enemy).to({
      y:lastHeight
    },1000+this.rnd.integerInRange(0, 750),Phaser.Easing.Default,true,0,-1,true);

    this.enemyGroup.add(enemy);

	},
  addSmasher: function(game){
    // adding the enemy over the rightmost tile
    this.terrainGroup.sort("x", Phaser.Group.SORT_DESCENDING);
    var smasher = this.add.sprite(this.terrainGroup.getChildAt(0).x,0,"smasher");
    var crush = this.game.add.audio('crush');
    this.physics.enable(smasher,Phaser.Physics.ARCADE);
    smasher.body.moves=true;
    smasher.lastHeight=this.terrainGroup.getChildAt(0).y-40;
    // stay in place
    var stay=this.game.add.tween(smasher).to({y : smasher.y+10},1050,Phaser.Easing.Linear.None,true,0,-1,true);
    var that=this;
    smasher.fall=function(lastHeight){
      if(smasher.body.moves&&that.hero.x==smasher.x-20){
        that.tweens.remove(stay);
        smasher.body.moves=false;
        // fall
        var fall=that.add.tween(smasher).to({y:lastHeight},400+that.rnd.integerInRange(100, 350),Phaser.Easing.Default,true,0);
        fall.onComplete.add(swat,that);
        function swat(){
          that.game.camera.shake(0.003,125);
        }
        fall.onComplete.add(disappear,that);
        function disappear(){
          crush.play("",0,0.4);
          var disappear=that.add.tween(smasher).to({alpha:0},125,Phaser.Easing.Linear.None,true,0);
          disappear.onComplete.add(die,that);
          function die(){
            smasher.destroy();
          }
        }
      }

    }
    this.smasherGroup.add(smasher);
    this.terrainGroup.sort("x", Phaser.Group.SORT_ASCENDING);

  }
}
