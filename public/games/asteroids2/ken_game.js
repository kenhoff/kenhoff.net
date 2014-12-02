
window.onload = function() {

	//require_testing = require ("./require_test.js")

	var game = new Phaser.Game("100", "100", Phaser.AUTO, '', { preload: preload, create: create, update: update, render: render });

	var random = new Phaser.RandomDataGenerator()
	var score = 0;

	var logo;

	var reloaded
	var reloadTimer = new Phaser.Timer()

	var playerCG, bulletsCG, asteroidsCG
	var worldSize = 5000
	var starCount = 1000

	var asteroidCount = 100
	var asteroidMass = 10

	var shipSpeed = 100
	var shipForwardSpeed = 100
	var shipRotateSpeed = 10;
	
	var shotThrust = 10000
	var shotMass = 0.1

	var laserNoise
	var asteroidNoise

	var gameOverFlag = false;
	
	function preload () {

		game.load.image('ship', 'playerShip1_blue.png');
		game.load.image("star", "star1.png")
		game.load.image("shot", "laserBlue01.png")
		preloadAsteroids()
		game.physics.startSystem(Phaser.Physics.P2JS);
		cursors = game.input.keyboard.createCursorKeys();

		game.load.audio('laser', "Laser_Shoot10.wav")
		game.load.audio('asteroid', "Explosion4.wav")

		game.load.bitmapFont("nokia", "nokia.png", "nokia.xml")


	}

	function create () {
		playerCG = game.physics.p2.createCollisionGroup()
		bulletsCG = game.physics.p2.createCollisionGroup()
		asteroidsCG = game.physics.p2.createCollisionGroup()

		laserNoise = game.add.audio('laser')
		asteroidNoise = game.add.audio('asteroid')
		
		// create stars here

		for (var i = 0; i < starCount; i++) {
			game.add.sprite(random.between(0, worldSize), random.between(0, worldSize), "star")
		}

		// create asteroids
		
		for (var j = 0; j < asteroidCount; j++) {
			createAsteroid()
		}


		game.world.setBounds(0, 0, worldSize, worldSize)
		ship = game.add.sprite(game.world.centerX, game.world.centerY, 'ship');
		game.physics.p2.enable(ship);
		ship.anchor.setTo(0.5, 0.5)
		ship.body.clearShapes()
		ship.body.addCircle(50)


		game.camera.follow(ship, Phaser.Camera.FOLLOW_TOPDOWN)

		ship.body.setCollisionGroup(playerCG)
		ship.body.collides(asteroidsCG)
		ship.body.createGroupCallback(asteroidsCG, function (thisShip, thisAsteroid) {
			gameOver(ship.x, ship.y)
			thisShip.sprite.destroy()
		}, this)

		game.physics.p2.setImpactEvents(true)
		game.physics.p2.applyDamping = true;
		
		reloaded = true;
		
		life = game.add.text("Score: ", 32, 32, {fill: "white"})
		life.fixedToCamera = true;
		game.time.advancedTiming = true;
	}

	function update () {

		if (!gameOverFlag) {

			ship.body.setZeroForce()
			//ship.body.angularAcceleration = 0;

			if (cursors.left.isDown) {
				ship.body.angularForce -= shipRotateSpeed
			}
			else if (cursors.right.isDown) {
				ship.body.angularForce += shipRotateSpeed
			}
			if (cursors.up.isDown) {
				ship.body.thrust(shipSpeed)
			}

			if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
				fire()
			}
		}
	}

	fire = function () {
	
		if (reloaded == true) {
			laserNoise.play()
			shot = game.add.sprite(ship.x, ship.y, "shot")
			game.physics.p2.enable(shot)
			shot.body.mass = shotMass
			shot.body.angle = ship.body.angle
			shot.body.setCollisionGroup(bulletsCG)
			shot.body.collides(asteroidsCG)
			shot.body.thrust(shotThrust)

			shot.body.createGroupCallback(asteroidsCG, function (thisShot, thisAsteroid) {
				asteroidNoise.play()
				var newSize = thisAsteroid.asteroidSize - 1

				
				var newVelocity = thisAsteroid.velocity

				var shotAngle = Math.atan2(thisShot.velocity.y, thisShot.velocity.x)

				thisShot.sprite.destroy()

				var asteroidSpacing
				switch (newSize) {
					case 4:
						asteroidSpacing = 50
						break
					case 3:
						asteroidSpacing = 21
						break
					case 2:
						asteroidSpacing = 14
						break
					case 1:
						asteroidSpacing = 9
						break
				}
				//r = (random.angle() / 180 ) * Math.PI
				r = shotAngle
				asteroidSplitSpeed = 100
				newVelocity.x += Math.cos(r) * asteroidSplitSpeed
				newVelocity.y += Math.sin(r) * asteroidSplitSpeed
			
				var reverseNewVelocity = {}
				reverseNewVelocity.x = -newVelocity.x
				reverseNewVelocity.y = -newVelocity.y



				var asteroid1 = createAsteroid(newSize, thisAsteroid.x + (Math.cos(r) * asteroidSpacing), thisAsteroid.y + (Math.sin(r) * asteroidSpacing), newVelocity)
				var asteroid2 = createAsteroid(newSize, thisAsteroid.x - (Math.cos(r) * asteroidSpacing), thisAsteroid.y - (Math.sin(r) * asteroidSpacing), reverseNewVelocity)

				thisAsteroid.sprite.destroy()
				score += 1
			})

			game.time.events.add(300, function () {this.destroy()}, shot)

			reloaded = false
			game.time.events.add(500, function () {reloaded = true}, this)
		}
	}

	function preloadAsteroids() {
		game.load.image("asteroid4", "meteorGrey_big1.png")
		game.load.image("asteroid3", "meteorGrey_med1.png")
		game.load.image("asteroid2", "meteorGrey_small1.png")
		game.load.image("asteroid1", "meteorGrey_tiny1.png")
	}

	function createAsteroid(size, x, y, velocity) {
		if (size == 0) {
			return 
		}
		if (!size) {
			size = 4
		}
		if (!x && !y) {
			x = random.between(0, worldSize)
			y = random.between(0, worldSize)
		}
		var asteroid = game.add.sprite(x, y, "asteroid" + size)

		game.physics.p2.enable(asteroid)
		asteroid.body.clearShapes()
		switch (size) {
			case 4:
				asteroid.body.addCircle(50)
				break
			case 3:
				asteroid.body.addCircle(21)
				break
			case 2:
				asteroid.body.addCircle(14)
				break
			case 1:
				asteroid.body.addCircle(9)
				break
			
		}

		asteroid.body.mass = asteroidMass * (size / 4)
		asteroid.body.setCollisionGroup(asteroidsCG)
		asteroid.body.asteroidSize = size
		asteroid.body.collides([playerCG, bulletsCG, asteroidsCG])
		if (!velocity) {
			asteroid.body.velocity.x = random.between(-100, 100)
			asteroid.body.velocity.y = random.between(-100, 100)
		}
		else {
			asteroid.body.velocity.x = velocity.x
			asteroid.body.velocity.y = velocity.y
		}
		return asteroid
	}

	function render () {
		//game.debug.text("FPS: " + game.time.fps || "--", 32, 64)
		//game.debug.text("Physics bodies: " + game.physics.p2.getBodies().length, 32, 96)
		//game.debug.text("Score: " + score, 32, 32)
	}

	function gameOver(x, y) {
		game.add.bitmapText(x, y, "nokia", "Score: " + score)
		gameOverFlag = true
	}
};

