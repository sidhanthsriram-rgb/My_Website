/**
 * Breakout Game Module for Arcade Engine
 * Adapted from user's original breakout game
 */

class BreakoutGame {
  static displayName = "Breakout";

  constructor(options) {
    this.canvas = options.canvas;
    this.ctx = options.ctx;
    this.engine = options.engine;
    this.score = 0;

    // Ball variables
    this.x = this.canvas.width / 2;
    this.y = this.canvas.height - 30;
    this.dx = 4;
    this.dy = -4;
    this.ballRadius = 10;

    // Paddle variables
    this.paddleHeight = 10;
    this.paddleWidth = 75;
    this.paddleX = (this.canvas.width - this.paddleWidth) / 2;
    this.rightPressed = false;
    this.leftPressed = false;

    // Brick variables
    this.brickRowCount = 5;
    this.brickColumnCount = 8;
    this.brickWidth = 75;
    this.brickHeight = 20;
    this.brickPadding = 10;
    this.brickOffsetTop = 30;
    this.brickOffsetLeft = 30;

    // Initialize bricks
    this.bricks = [];
    for (let c = 0; c < this.brickColumnCount; c++) {
      this.bricks[c] = [];
      for (let r = 0; r < this.brickRowCount; r++) {
        this.bricks[c][r] = { x: 0, y: 0, status: 1 };
      }
    }

    // Bind event handlers
    this.boundKeyDown = (e) => this.keyDownHandler(e);
    this.boundKeyUp = (e) => this.keyUpHandler(e);
    document.addEventListener("keydown", this.boundKeyDown);
    document.addEventListener("keyup", this.boundKeyUp);
  }

  keyDownHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") this.rightPressed = true;
    else if (e.key === "Left" || e.key === "ArrowLeft") this.leftPressed = true;
  }

  keyUpHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") this.rightPressed = false;
    else if (e.key === "Left" || e.key === "ArrowLeft") this.leftPressed = false;
  }

  collisionDetection() {
    for (let c = 0; c < this.brickColumnCount; c++) {
      for (let r = 0; r < this.brickRowCount; r++) {
        let b = this.bricks[c][r];
        if (b.status === 1) {
          if (
            this.x > b.x &&
            this.x < b.x + this.brickWidth &&
            this.y > b.y &&
            this.y < b.y + this.brickHeight
          ) {
            this.dy = -this.dy;
            b.status = 0; // "Break" the brick
            this.score += 10;
          }
        }
      }
    }
  }

  drawBall() {
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.ballRadius, 0, Math.PI * 2);
    this.ctx.fillStyle = "#71D9E2";
    this.ctx.fill();
    this.ctx.closePath();
  }

  drawPaddle() {
    this.ctx.beginPath();
    this.ctx.rect(this.paddleX, this.canvas.height - this.paddleHeight, this.paddleWidth, this.paddleHeight);
    this.ctx.fillStyle = "#71D9E2";
    this.ctx.fill();
    this.ctx.closePath();
  }

  drawBricks() {
    for (let c = 0; c < this.brickColumnCount; c++) {
      for (let r = 0; r < this.brickRowCount; r++) {
        if (this.bricks[c][r].status === 1) {
          let brickX = (c * (this.brickWidth + this.brickPadding)) + this.brickOffsetLeft;
          let brickY = (r * (this.brickHeight + this.brickPadding)) + this.brickOffsetTop;
          this.bricks[c][r].x = brickX;
          this.bricks[c][r].y = brickY;
          this.ctx.beginPath();
          this.ctx.rect(brickX, brickY, this.brickWidth, this.brickHeight);
          this.ctx.fillStyle = "#ff6b6b";
          this.ctx.fill();
          this.ctx.closePath();
        }
      }
    }
  }

  update() {
    // Wall Bouncing
    if (this.x + this.dx > this.canvas.width - this.ballRadius || this.x + this.dx < this.ballRadius) {
      this.dx = -this.dx;
    }
    if (this.y + this.dy < this.ballRadius) {
      this.dy = -this.dy;
    } else if (this.y + this.dy > this.canvas.height - this.ballRadius) {
      if (this.x > this.paddleX && this.x < this.paddleX + this.paddleWidth) {
        this.dy = -this.dy; // Bounce off paddle
      } else {
        // Game over
        this.engine.endGame();
        document.removeEventListener("keydown", this.boundKeyDown);
        document.removeEventListener("keyup", this.boundKeyUp);
        return;
      }
    }

    // Paddle movement
    if (this.rightPressed && this.paddleX < this.canvas.width - this.paddleWidth) {
      this.paddleX += 7;
    } else if (this.leftPressed && this.paddleX > 0) {
      this.paddleX -= 7;
    }

    // Update ball position
    this.x += this.dx;
    this.y += this.dy;

    // Collision detection
    this.collisionDetection();
  }

  draw() {
    // Clear canvas
    this.ctx.fillStyle = "#0f1f1f";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw game elements
    this.drawBricks();
    this.drawBall();
    this.drawPaddle();

    // Draw score
    this.ctx.fillStyle = "#71D9E2";
    this.ctx.font = "bold 48px Arial";
    this.ctx.textAlign = "left";
    this.ctx.fillText("Score: " + this.score, 20, 60);

    // Draw instructions
    this.ctx.font = "20px Arial";
    this.ctx.fillText("Arrow keys to move | ESC to exit", 20, this.canvas.height - 20);
  }
}
