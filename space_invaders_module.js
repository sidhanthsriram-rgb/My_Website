/**
 * Enhanced Space Invaders Game Module for Arcade Engine
 * Features: Levels, Bunkers, Multiple Alien Types, Bombs
 */

class SpaceInvadersGame {
  static displayName = "Space Invaders";

  constructor(options) {
    this.canvas = options.canvas;
    this.ctx = options.ctx;
    this.engine = options.engine;
    this.score = 0;
    this.level = 1;

    // Game Settings
    this.playerWidth = 40;
    this.playerHeight = 20;
    this.bunkerWidth = 60;
    this.bunkerHeight = 40;
    this.bunkerHealth = 3; // Hits to destroy

    // State
    this.playerX = (this.canvas.width - this.playerWidth) / 2;
    this.bullets = [];
    this.aliens = [];
    this.bombs = [];
    this.bunkers = [];
    this.alienDirection = 1;
    this.rightPressed = false;
    this.leftPressed = false;
    this.frameCount = 0;
    this.ufoSpawnChance = 0.0005; // Rare spawn chance per frame
    this.lastFireTime = 0;
    this.fireRate = 500; // 0.5 seconds in milliseconds
    this.alienMoveCounter = 0;
    this.alienMoveInterval = 15; // Move aliens every 15 frames

    // Initialize bunkers
    this.createBunkers();

    // Initialize aliens for level 1
    this.createAliens();

    // Bind event handlers
    this.boundKeyDown = (e) => this.handleKeyDown(e);
    this.boundKeyUp = (e) => this.handleKeyUp(e);
    document.addEventListener("keydown", this.boundKeyDown);
    document.addEventListener("keyup", this.boundKeyUp);
  }

  createBunkers() {
    this.bunkers = [];
    const bunkerCount = 4;
    const spacing = this.canvas.width / (bunkerCount + 1);

    for (let i = 0; i < bunkerCount; i++) {
      this.bunkers.push({
        x: spacing * (i + 1) - this.bunkerWidth / 2,
        y: this.canvas.height - 100,
        health: this.bunkerHealth
      });
    }
  }

  createAliens() {
    this.aliens = [];
    
    // Calculate difficulty multiplier based on level
    const difficultyMultiplier = 1 + (this.level - 1) * 0.3;
    
    // Red aliens (standard)
    const redAlienCount = 8 + this.level * 2;
    for (let i = 0; i < redAlienCount; i++) {
      this.aliens.push({
        x: (i % 8) * 50 + 30,
        y: Math.floor(i / 8) * 50 + 30,
        type: "red",
        alive: true,
        speed: 1 * difficultyMultiplier,
        bombCooldown: 0
      });
    }

    // Dark blue aliens (2x faster)
    const blueAlienCount = 2 + Math.floor(this.level / 2);
    for (let i = 0; i < blueAlienCount; i++) {
      this.aliens.push({
        x: (i % 4) * 60 + 50,
        y: 150 + (i % 2) * 50,
        type: "darkblue",
        alive: true,
        speed: 2 * difficultyMultiplier,
        bombCooldown: 0
      });
    }

    // White aliens (bigger, drop bombs)
    const whiteAlienCount = 1 + Math.floor(this.level / 3);
    for (let i = 0; i < whiteAlienCount; i++) {
      this.aliens.push({
        x: (i % 3) * 80 + 80,
        y: 200 + (i % 2) * 60,
        type: "white",
        alive: true,
        speed: 0.8 * difficultyMultiplier,
        bombCooldown: 0,
        bombInterval: 120 - this.level * 5 // Faster bombs at higher levels
      });
    }
  }

  handleKeyDown(e) {
    if (e.key === "ArrowRight") this.rightPressed = true;
    if (e.key === "ArrowLeft") this.leftPressed = true;
    if (e.key === " " || e.key === "ArrowUp") {
      e.preventDefault();
      const now = Date.now();
      if (now - this.lastFireTime >= this.fireRate) {
        this.bullets.push({
          x: this.playerX + this.playerWidth / 2 - 2,
          y: this.canvas.height - 30
        });
        this.lastFireTime = now;
      }
    }
  }

  handleKeyUp(e) {
    if (e.key === "ArrowRight") this.rightPressed = false;
    if (e.key === "ArrowLeft") this.leftPressed = false;
  }

  levelUp() {
    this.level++;
    this.createBunkers();
    this.createAliens();
    this.alienDirection = 1;
  }

  update() {
    this.frameCount++;

    // Player movement
    if (this.rightPressed && this.playerX < this.canvas.width - this.playerWidth) {
      this.playerX += 5;
    }
    if (this.leftPressed && this.playerX > 0) {
      this.playerX -= 5;
    }

    // Handle Bullets
    for (let bIndex = this.bullets.length - 1; bIndex >= 0; bIndex--) {
      this.bullets[bIndex].y -= 7;

      // Collision with Aliens
      for (let aIndex = this.aliens.length - 1; aIndex >= 0; aIndex--) {
        const alien = this.aliens[aIndex];
        const bullet = this.bullets[bIndex];
        const alienSize = alien.type === "white" ? 40 : (alien.type === "ufo" ? 50 : 30);

        if (
          alien.alive &&
          bullet.x > alien.x &&
          bullet.x < alien.x + alienSize &&
          bullet.y > alien.y &&
          bullet.y < alien.y + 20
        ) {
          alien.alive = false;
          this.bullets.splice(bIndex, 1);

          // Score based on alien type
          if (alien.type === "ufo") {
            this.score += 300;
          } else if (alien.type === "white") {
            this.score += 20;
          } else if (alien.type === "darkblue") {
            this.score += 15;
          } else {
            this.score += 10;
          }
          break;
        }
      }

      if (bIndex < this.bullets.length && this.bullets[bIndex].y < 0) {
        this.bullets.splice(bIndex, 1);
      }
    }

    // Handle Bombs
    for (let bombIndex = this.bombs.length - 1; bombIndex >= 0; bombIndex--) {
      const bomb = this.bombs[bombIndex];
      bomb.y += 5;

      // Collision with Bunkers
      for (let bIndex = 0; bIndex < this.bunkers.length; bIndex++) {
        const bunker = this.bunkers[bIndex];
        if (
          bomb.x > bunker.x &&
          bomb.x < bunker.x + this.bunkerWidth &&
          bomb.y > bunker.y &&
          bomb.y < bunker.y + this.bunkerHeight
        ) {
          bunker.health--;
          this.bombs.splice(bombIndex, 1);
          break;
        }
      }

      // Collision with Player
      if (
        bomb.x > this.playerX &&
        bomb.x < this.playerX + this.playerWidth &&
        bomb.y > this.canvas.height - this.playerHeight - 10 &&
        bomb.y < this.canvas.height
      ) {
        this.engine.endGame();
        document.removeEventListener("keydown", this.boundKeyDown);
        document.removeEventListener("keyup", this.boundKeyUp);
        return;
      }

      if (bomb.y > this.canvas.height) {
        this.bombs.splice(bombIndex, 1);
      }
    }

    // Handle Aliens
    let aliveCount = 0;
    let edgeReached = false;

    // Move aliens at regular intervals to prevent jittery movement
    this.alienMoveCounter++;
    if (this.alienMoveCounter >= this.alienMoveInterval) {
      this.alienMoveCounter = 0;

      for (let i = 0; i < this.aliens.length; i++) {
        const alien = this.aliens[i];
        if (!alien.alive) continue;

        // Move alien horizontally
        alien.x += alien.speed * this.alienDirection * 2;

        // Check if any alien hits the wall
        if ((this.alienDirection === 1 && alien.x + 40 > this.canvas.width) ||
            (this.alienDirection === -1 && alien.x < 0)) {
          edgeReached = true;
        }
      }

      // If edge reached, reverse direction and move down
      if (edgeReached) {
        this.alienDirection *= -1;
        for (let i = 0; i < this.aliens.length; i++) {
          if (this.aliens[i].alive) {
            this.aliens[i].y += 20;
          }
        }
      }
    }

    // Update all aliens
    for (let i = 0; i < this.aliens.length; i++) {
      const alien = this.aliens[i];
      if (!alien.alive) continue;

      aliveCount++;

      // White aliens drop bombs
      if (alien.type === "white") {
        alien.bombCooldown++;
        if (alien.bombCooldown >= alien.bombInterval) {
          this.bombs.push({
            x: alien.x + 15,
            y: alien.y + 20
          });
          alien.bombCooldown = 0;
        }
      }

      // Check Game Over - Aliens reached bottom (bunker area)
      if (alien.y >= this.canvas.height - 120) {
        this.engine.endGame();
        document.removeEventListener("keydown", this.boundKeyDown);
        document.removeEventListener("keyup", this.boundKeyUp);
        return;
      }
    }

    // Check if all bunkers destroyed
    if (this.bunkers.every(b => b.health <= 0)) {
      this.engine.endGame();
      document.removeEventListener("keydown", this.boundKeyDown);
      document.removeEventListener("keyup", this.boundKeyUp);
      return;
    }

    // Check if all aliens defeated - Level Up
    if (aliveCount === 0) {
      this.levelUp();
    }

    // Rare UFO spawn
    if (Math.random() < this.ufoSpawnChance && this.aliens.filter(a => a.type === "ufo" && a.alive).length === 0) {
      this.aliens.push({
        x: -50,
        y: 50,
        type: "ufo",
        alive: true,
        speed: 3,
        bombCooldown: 0
      });
    }
  }

  draw() {
    // Clear canvas
    this.ctx.fillStyle = "#0f1f1f";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw Player
    this.ctx.fillStyle = "#71D9E2";
    this.ctx.fillRect(
      this.playerX,
      this.canvas.height - this.playerHeight - 10,
      this.playerWidth,
      this.playerHeight
    );

    // Draw Bullets
    this.ctx.fillStyle = "#ffff00";
    for (let bullet of this.bullets) {
      this.ctx.fillRect(bullet.x, bullet.y, 4, 10);
    }

    // Draw Bombs
    this.ctx.fillStyle = "#ff6b6b";
    for (let bomb of this.bombs) {
      this.ctx.fillRect(bomb.x - 3, bomb.y, 6, 10);
    }

    // Draw Bunkers
    for (let bunker of this.bunkers) {
      // Color based on health
      if (bunker.health === 3) {
        this.ctx.fillStyle = "#71D9E2";
      } else if (bunker.health === 2) {
        this.ctx.fillStyle = "#4a9fb5";
      } else {
        this.ctx.fillStyle = "#2d5f6f";
      }
      this.ctx.fillRect(bunker.x, bunker.y, this.bunkerWidth, this.bunkerHeight);
    }

    // Draw Aliens
    for (let alien of this.aliens) {
      if (!alien.alive) continue;

      const alienWidth = alien.type === "white" ? 40 : (alien.type === "ufo" ? 50 : 30);
      const alienHeight = alien.type === "ufo" ? 30 : 20;

      if (alien.type === "red") {
        this.ctx.fillStyle = "#ff6b6b";
      } else if (alien.type === "darkblue") {
        this.ctx.fillStyle = "#1e3a8a";
      } else if (alien.type === "white") {
        this.ctx.fillStyle = "#ffffff";
      } else if (alien.type === "ufo") {
        this.ctx.fillStyle = "#ffd700"; // Gold
      }

      this.ctx.fillRect(alien.x, alien.y, alienWidth, alienHeight);
    }

    // Draw score and level
    this.ctx.fillStyle = "#71D9E2";
    this.ctx.font = "bold 36px Arial";
    this.ctx.textAlign = "left";
    this.ctx.fillText("Score: " + this.score, 20, 50);
    this.ctx.fillText("Level: " + this.level, 20, 90);

    // Draw instructions
    this.ctx.font = "16px Arial";
    this.ctx.fillText("Arrow keys to move | SPACE to shoot | Protect bunkers!", 20, this.canvas.height - 20);
  }
}