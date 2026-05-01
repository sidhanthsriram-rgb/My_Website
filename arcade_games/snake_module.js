/**
 * Snake Game Module for Arcade Engine
 * Adapted from user's original snake game
 */

class SnakeGame {
  static displayName = "Snake";

  constructor(options) {
    this.canvas = options.canvas;
    this.ctx = options.ctx;
    this.engine = options.engine;
    this.score = 0;

    // Game constants
    this.gridSize = 20;
    this.gameSpeed = 100; // milliseconds

    // Game state
    this.snake = [
      { x: 160, y: 160 },
      { x: 140, y: 160 },
      { x: 120, y: 160 }
    ];
    this.dx = this.gridSize; // Horizontal velocity
    this.dy = 0; // Vertical velocity
    this.food = { x: 0, y: 0 };
    this.frameCounter = 0;
    this.keyPressed = null;

    // Initialize food
    this.createFood();

    // Bind keyboard handler
    this.boundHandleKeyDown = (e) => this.handleKeyDown(e);
    document.addEventListener("keydown", this.boundHandleKeyDown);
  }

  createFood() {
    this.food.x = Math.floor(Math.random() * (this.canvas.width / this.gridSize)) * this.gridSize;
    this.food.y = Math.floor(Math.random() * (this.canvas.height / this.gridSize)) * this.gridSize;
  }

  hasGameEnded() {
    // Check self collision
    for (let i = 4; i < this.snake.length; i++) {
      if (this.snake[i].x === this.snake[0].x && this.snake[i].y === this.snake[0].y) {
        return true;
      }
    }

    // Check wall collisionc
    const hitLeftWall = this.snake[0].x < 0;
    const hitRightWall = this.snake[0].x >= this.canvas.width;
    const hitTopWall = this.snake[0].y < 0;
    const hitBottomWall = this.snake[0].y >= this.canvas.height;

    return hitLeftWall || hitRightWall || hitTopWall || hitBottomWall;
  }

  advanceSnake() {
    const head = {
      x: this.snake[0].x + this.dx,
      y: this.snake[0].y + this.dy
    };

    this.snake.unshift(head);

    const didEatFood = this.snake[0].x === this.food.x && this.snake[0].y === this.food.y;
    if (didEatFood) {
      this.score += 10;
      this.createFood();
    } else {
      this.snake.pop();
    }
  }

  update() {
    // Update snake movement at intervals
    this.frameCounter++;
    if (this.frameCounter * 16 >= this.gameSpeed) { // Approximate 100ms at 60fps
      this.advanceSnake();
      this.frameCounter = 0;

      if (this.hasGameEnded()) {
        this.engine.endGame();
        document.removeEventListener("keydown", this.boundHandleKeyDown);
      }
    }
  }

  draw() {
    // Clear canvas
    this.ctx.fillStyle = "#0f1f1f";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw grid background (optional)
    this.ctx.strokeStyle = "#1a3a3a";
    this.ctx.lineWidth = 0.5;
    for (let i = 0; i <= this.canvas.width; i += this.gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(i, 0);
      this.ctx.lineTo(i, this.canvas.height);
      this.ctx.stroke();
    }
    for (let i = 0; i <= this.canvas.height; i += this.gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, i);
      this.ctx.lineTo(this.canvas.width, i);
      this.ctx.stroke();
    }

    // Draw food
    this.ctx.fillStyle = "#ff6b6b";
    this.ctx.fillRect(this.food.x, this.food.y, this.gridSize - 2, this.gridSize - 2);

    // Draw snake
    this.ctx.fillStyle = "#71D9E2";
    for (let part of this.snake) {
      this.ctx.fillRect(part.x, part.y, this.gridSize - 2, this.gridSize - 2);
    }

    // Draw score
    this.ctx.fillStyle = "#71D9E2";
    this.ctx.font = "bold 48px Arial";
    this.ctx.textAlign = "left";
    this.ctx.fillText("Score: " + this.score, 20, 60);

    // Draw instructions
    this.ctx.font = "20px Arial";
    this.ctx.fillText("Arrow keys to move | ESC to exit", 20, this.canvas.height - 20);
  }

  handleKeyDown(e) {
    const LEFT_KEY = 37;
    const RIGHT_KEY = 39;
    const UP_KEY = 38;
    const DOWN_KEY = 40;

    const keyPressed = e.keyCode;
    const goingUp = this.dy === -this.gridSize;
    const goingDown = this.dy === this.gridSize;
    const goingRight = this.dx === this.gridSize;
    const goingLeft = this.dx === -this.gridSize;

    if (keyPressed === LEFT_KEY && !goingRight) {
      this.dx = -this.gridSize;
      this.dy = 0;
    }
    if (keyPressed === UP_KEY && !goingDown) {
      this.dx = 0;
      this.dy = -this.gridSize;
    }
    if (keyPressed === RIGHT_KEY && !goingLeft) {
      this.dx = this.gridSize;
      this.dy = 0;
    }
    if (keyPressed === DOWN_KEY && !goingUp) {
      this.dx = 0;
      this.dy = this.gridSize;
    }
  }
}
