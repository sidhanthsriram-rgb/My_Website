/**
 * Flappy Bird Game Module for Arcade Engine
 * Fully modular implementation for proper initialization and cleanup
 */

class FlappyBirdGame {
  static displayName = "Flappy Bird";

  constructor(options) {
    this.canvas = options.canvas;
    this.ctx = options.ctx;
    this.engine = options.engine;
    this.score = 0;

    // Game constants
    this.gravity = 0.5;
    this.flapPower = -12;
    this.pipeGap = 250;
    this.pipeWidth = 60;
    this.pipeSpeed = 4;

    // Bird state
    this.bird = {
      x: 50,
      y: this.canvas.height / 3,
      width: 30,
      height: 30,
      velocity: 0,
    };

    // Pipes
    this.pipes = [];
    this.frameCount = 0;

    // Bind event handler
    this.boundHandleKeyDown = (e) => this.handleKeyDown(e);
    document.addEventListener("keydown", this.boundHandleKeyDown);
  }

  handleKeyDown(e) {
    if (e.key === " " || e.key === "ArrowUp") {
      e.preventDefault();
      this.bird.velocity = this.flapPower;
    }
  }

  generatePipe() {
    const minHeight = 50;
    const maxHeight = this.canvas.height - this.pipeGap - 50;
    const randomHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;

    this.pipes.push({
      x: this.canvas.width,
      topHeight: randomHeight,
      bottomY: randomHeight + this.pipeGap,
      passed: false,
    });
  }

  update() {
    // Apply gravity
    this.bird.velocity += this.gravity;
    this.bird.y += this.bird.velocity;

    // Check collision with ground and ceiling
    if (this.bird.y + this.bird.height >= this.canvas.height || this.bird.y <= 0) {
      this.engine.endGame();
      document.removeEventListener("keydown", this.boundHandleKeyDown);
      return;
    }

    // Update pipes
    for (let i = this.pipes.length - 1; i >= 0; i--) {
      this.pipes[i].x -= this.pipeSpeed;

      // Check collision with pipes
      if (
        this.bird.x < this.pipes[i].x + this.pipeWidth &&
        this.bird.x + this.bird.width > this.pipes[i].x &&
        (this.bird.y < this.pipes[i].topHeight || this.bird.y + this.bird.height > this.pipes[i].bottomY)
      ) {
        this.engine.endGame();
        document.removeEventListener("keydown", this.boundHandleKeyDown);
        return;
      }

      // Score when passing pipe
      if (!this.pipes[i].passed && this.bird.x > this.pipes[i].x + this.pipeWidth) {
        this.pipes[i].passed = true;
        this.score++;
      }

      // Remove off-screen pipes
      if (this.pipes[i].x + this.pipeWidth < 0) {
        this.pipes.splice(i, 1);
      }
    }

    // Generate new pipes
    this.frameCount++;
    if (this.frameCount % 150 === 0) {
      this.generatePipe();
    }
  }

  draw() {
    // Draw pipes
    this.ctx.fillStyle = "#71D9E2";
    for (let pipe of this.pipes) {
      // Top pipe
      this.ctx.fillRect(pipe.x, 0, this.pipeWidth, pipe.topHeight);
      // Bottom pipe
      this.ctx.fillRect(pipe.x, pipe.bottomY, this.pipeWidth, this.canvas.height - pipe.bottomY);
    }

    // Draw bird
    this.ctx.fillStyle = "#71D9E2";
    this.ctx.beginPath();
    this.ctx.arc(this.bird.x + this.bird.width / 2, this.bird.y + this.bird.height / 2, this.bird.width / 2, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.strokeStyle = "#ffffff";
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    // Draw score on canvas
    this.ctx.fillStyle = "#71D9E2";
    this.ctx.font = "bold 48px Arial";
    this.ctx.textAlign = "left";
    this.ctx.fillText("Score: " + this.score, 20, 60);

    // Draw instructions
    this.ctx.font = "20px Arial";
    this.ctx.fillText("SPACE or UP ARROW to flap | ESC to exit", 20, this.canvas.height - 20);
  }
}