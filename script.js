const startBtn = document.getElementById("start-btn");
const gameArea = document.getElementById("game-area");
const scoreDisplay = document.getElementById("score");
const timeDisplay = document.getElementById("time");

let score = 0;
let gameRunning = false;
let gameState = "home"; // "home", "playing", "gameover", "game_select"
let gameCanvas;
let ctx;
let fullscreenContainer;
let currentGame = "flappy"; // Track which game is active

// Event listener references for cleanup
let keydownListener = null;
let clickListener = null;
let resizeListener = null;

// Game instance
let gameInstance = null;

// Secret menu activation
let secretKeySequence = [];
const secretCode = "kong"; // String for easier comparison

function initGame() {
  // Remove any existing fullscreen container
  const existingContainer = document.getElementById("flappy-fullscreen");
  if (existingContainer) {
    existingContainer.parentNode.removeChild(existingContainer);
  }

  // Clean up old event listeners
  if (keydownListener) document.removeEventListener("keydown", keydownListener);
  if (clickListener) document.removeEventListener("click", clickListener);
  if (resizeListener) window.removeEventListener("resize", resizeListener);

  // Reset game state completely
  score = 0;
  gameState = "home";
  currentGame = "flappy";
  gameRunning = false;
  gameInstance = null;
  secretKeySequence = [];

  // Create fullscreen container
  fullscreenContainer = document.createElement("div");
  fullscreenContainer.id = "flappy-fullscreen";
  fullscreenContainer.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(180deg, #1a1a1a 0%, #0f0f0f 100%);
    z-index: 10000;
    display: flex;
    justify-content: center;
    align-items: center;
  `;

  // Create canvas
  gameCanvas = document.createElement("canvas");
  gameCanvas.width = window.innerWidth;
  gameCanvas.height = window.innerHeight;
  gameCanvas.style.cssText = `
    display: block;
    background: linear-gradient(180deg, #1a3a3a 0%, #0f1f1f 100%);
  `;

  ctx = gameCanvas.getContext("2d");
  fullscreenContainer.appendChild(gameCanvas);
  document.body.appendChild(fullscreenContainer);

  // Create new event listeners
  keydownListener = (e) => handleKeyDown(e);
  clickListener = (e) => handleClick(e);
  resizeListener = (e) => handleResize(e);

  document.addEventListener("keydown", keydownListener);
  document.addEventListener("click", clickListener);
  window.addEventListener("resize", resizeListener);

  // Start game loop
  scoreDisplay.textContent = score;
  timeDisplay.textContent = "Menu";
  gameLoop();
}

function handleKeyDown(e) {
  // Secret code detection (home screen only)
  if (gameState === "home") {
    secretKeySequence.push(e.key.toLowerCase());
    // Keep only last 4 characters
    if (secretKeySequence.length > 4) {
      secretKeySequence.shift();
    }
    // Check if secret code matches
    if (secretKeySequence.join("") === secretCode) {
      gameState = "game_select";
      secretKeySequence = [];
      return;
    }
  }

  if (e.key === "Escape") {
    e.preventDefault();
    if (gameState === "game_select") {
      gameState = "home";
    } else if (gameRunning) {
      endGame();
    } else if (gameState === "home") {
      exitGame();
    }
    return;
  }

  if (gameState === "home") {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      startGameplay();
    }
    return;
  }

  if (gameState !== "playing") return;

  // Delegate to game instance
  if (gameInstance && gameInstance.handleKeyDown) {
    gameInstance.handleKeyDown(e);
  }
}

function handleClick(e) {
  const centerX = gameCanvas.width / 2;
  const buttonWidth = 200;
  const buttonHeight = 60;

  if (gameState === "home") {
    // Check if click is on "Play" button area
    const centerY = gameCanvas.height / 2;
    const playButtonY = gameCanvas.height / 2 + 80;
    const gameSelectButtonY = gameCanvas.height / 2 + 160;
    const exitButtonY = gameCanvas.height / 2 + 240;

    if (
      e.clientX > centerX - buttonWidth / 2 &&
      e.clientX < centerX + buttonWidth / 2 &&
      e.clientY > playButtonY - buttonHeight / 2 &&
      e.clientY < playButtonY + buttonHeight / 2
    ) {
      startGameplay();
    }

    // Check if click is on "Games" button area
    if (
      e.clientX > centerX - buttonWidth / 2 &&
      e.clientX < centerX + buttonWidth / 2 &&
      e.clientY > gameSelectButtonY - buttonHeight / 2 &&
      e.clientY < gameSelectButtonY + buttonHeight / 2
    ) {
      gameState = "game_select";
    }

    // Check if click is on "Exit" button area
    if (
      e.clientX > centerX - buttonWidth / 2 &&
      e.clientX < centerX + buttonWidth / 2 &&
      e.clientY > exitButtonY - buttonHeight / 2 &&
      e.clientY < exitButtonY + buttonHeight / 2
    ) {
      exitGame();
    }
  } else if (gameState === "gameover") {
    // Check if click is on "Menu" button area
    const menuButtonY = gameCanvas.height / 2 + 120;

    if (
      e.clientX > centerX - buttonWidth / 2 &&
      e.clientX < centerX + buttonWidth / 2 &&
      e.clientY > menuButtonY - buttonHeight / 2 &&
      e.clientY < menuButtonY + buttonHeight / 2
    ) {
      gameState = "home";
      score = 0;
      scoreDisplay.textContent = score;
      timeDisplay.textContent = "Menu";
    }
  } else if (gameState === "game_select") {
    handleGameSelectClick(e);
  }
}

function handleGameSelectClick(e) {
  const centerX = gameCanvas.width / 2;
  const startY = gameCanvas.height / 2 - 100;
  const buttonWidth = 250;
  const buttonHeight = 50;
  const spacing = 70;

  const games = [
    { name: "Flappy Bird", id: "flappy" },
    { name: "Snake", id: "snake" },
    { name: "Space Invaders", id: "space_invaders" },
    { name: "Platformer", id: "platformer" },
    { name: "Breakout", id: "breakout" },
    { name: "The Elemental Odyssey", id: "custom", large: true },
  ];

  let yOffset = 0;
  for (let i = 0; i < games.length; i++) {
    const game = games[i];
    const isLarge = game.large;
    const width = isLarge ? buttonWidth * 1.5 : buttonWidth;
    const height = isLarge ? buttonHeight * 1.5 : buttonHeight;
    const buttonY = startY + yOffset;

    if (
      e.clientX > centerX - width / 2 &&
      e.clientX < centerX + width / 2 &&
      e.clientY > buttonY - height / 2 &&
      e.clientY < buttonY + height / 2
    ) {
      if (game.id === "custom") {
        currentGame = "custom";
        gameState = "home";
        startGameplay();
      } else {
        currentGame = game.id;
        gameState = "home";
        startGameplay();
      }
      return;
    }

    yOffset += spacing;
  }

  // Check for Return button
  const returnButtonY = startY + yOffset + 20;
  if (
    e.clientX > centerX - buttonWidth / 2 &&
    e.clientX < centerX + buttonWidth / 2 &&
    e.clientY > returnButtonY - buttonHeight / 2 &&
    e.clientY < returnButtonY + buttonHeight / 2
  ) {
    gameState = "home";
  }
}

function handleResize() {
  if (gameCanvas) {
    gameCanvas.width = window.innerWidth;
    gameCanvas.height = window.innerHeight;
  }
}

function startGameplay() {
  // Initialize game instance based on current game
  if (currentGame === "flappy") {
    gameInstance = new FlappyBirdGame({
      canvas: gameCanvas,
      ctx: ctx,
      engine: { endGame: endGame }
    });
  } else if (currentGame === "snake") {
    gameInstance = new SnakeGame({
      canvas: gameCanvas,
      ctx: ctx,
      engine: { endGame: endGame }
    });
  } else if (currentGame === "breakout") {
    gameInstance = new BreakoutGame({
      canvas: gameCanvas,
      ctx: ctx,
      engine: { endGame: endGame }
    });
  } else if (currentGame === "space_invaders") {
    gameInstance = new SpaceInvadersGame({
      canvas: gameCanvas,
      ctx: ctx,
      engine: { endGame: endGame }
    });
  } else if (currentGame === "custom") {
    gameInstance = new ElementalOdysseyGame({
      canvas: gameCanvas,
      ctx: ctx,
      engine: { endGame: endGame }
    });
  } else {
    gameInstance = null;
  }

  gameState = "playing";
  gameRunning = true;
  timeDisplay.textContent = "Playing";
}

function update() {
  if (gameState !== "playing") return;

  if (gameInstance && gameInstance.update) {
    gameInstance.update();
  }
}

function draw() {
  // Clear canvas
  ctx.fillStyle = "#0f1f1f";
  ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

  if (gameState === "home") {
    drawHomeScreen();
  } else if (gameState === "playing") {
    drawGameplay();
  } else if (gameState === "gameover") {
    drawGameOver();
  } else if (gameState === "game_select") {
    drawGameSelect();
  }
}

function drawHomeScreen() {
  // Draw title
  ctx.fillStyle = "#71D9E2";
  ctx.font = "bold 80px Arial";
  ctx.textAlign = "center";
  ctx.fillText("ARCADE", gameCanvas.width / 2, gameCanvas.height / 2 - 100);

  // Draw instructions
  ctx.font = "24px Arial";
  ctx.fillStyle = "#c0c0c0";
  ctx.fillText("Press SPACE or ENTER to start", gameCanvas.width / 2, gameCanvas.height / 2 + 20);

  // Draw buttons
  const centerX = gameCanvas.width / 2;
  const playButtonY = gameCanvas.height / 2 + 80;
  const gameSelectButtonY = gameCanvas.height / 2 + 160;
  const exitButtonY = gameCanvas.height / 2 + 240;
  const buttonWidth = 200;
  const buttonHeight = 60;

  // Play button
  ctx.fillStyle = "#71D9E2";
  ctx.fillRect(centerX - buttonWidth / 2, playButtonY - buttonHeight / 2, buttonWidth, buttonHeight);
  ctx.fillStyle = "#000000";
  ctx.font = "bold 32px Arial";
  ctx.fillText("PLAY", centerX, playButtonY + 12);

  // Game Select button
  ctx.fillStyle = "#71D9E2";
  ctx.fillRect(centerX - buttonWidth / 2, gameSelectButtonY - buttonHeight / 2, buttonWidth, buttonHeight);
  ctx.fillStyle = "#000000";
  ctx.font = "bold 32px Arial";
  ctx.fillText("GAMES", centerX, gameSelectButtonY + 12);

  // Exit button
  ctx.fillStyle = "#71D9E2";
  ctx.fillRect(centerX - buttonWidth / 2, exitButtonY - buttonHeight / 2, buttonWidth, buttonHeight);
  ctx.fillStyle = "#000000";
  ctx.font = "bold 32px Arial";
  ctx.fillText("EXIT", centerX, exitButtonY + 12);

  ctx.textAlign = "left";
}

function drawGameplay() {
  if (gameInstance && gameInstance.draw) {
    gameInstance.draw();
  }
}

function drawGameOver() {
  // Semi-transparent overlay
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

  // Game over text
  ctx.fillStyle = "#71D9E2";
  ctx.font = "bold 72px Arial";
  ctx.textAlign = "center";
  ctx.fillText("GAME OVER", gameCanvas.width / 2, gameCanvas.height / 2 - 50);

  if (gameInstance && gameInstance.score !== undefined) {
    ctx.font = "bold 48px Arial";
    ctx.fillText("Score: " + gameInstance.score, gameCanvas.width / 2, gameCanvas.height / 2 + 50);
  }

  // Draw menu button
  const centerX = gameCanvas.width / 2;
  const menuButtonY = gameCanvas.height / 2 + 120;
  const buttonWidth = 200;
  const buttonHeight = 60;

  ctx.fillStyle = "#71D9E2";
  ctx.fillRect(centerX - buttonWidth / 2, menuButtonY - buttonHeight / 2, buttonWidth, buttonHeight);

  ctx.fillStyle = "#000000";
  ctx.font = "bold 32px Arial";
  ctx.fillText("MENU", centerX, menuButtonY + 12);

  ctx.textAlign = "left";
}

function drawGameSelect() {
  // Draw title
  ctx.fillStyle = "#71D9E2";
  ctx.font = "bold 60px Arial";
  ctx.textAlign = "center";
  ctx.fillText("SELECT A GAME", gameCanvas.width / 2, 80);

  const centerX = gameCanvas.width / 2;
  const startY = gameCanvas.height / 2 - 100;
  const buttonWidth = 250;
  const buttonHeight = 50;
  const spacing = 70;

  const games = [
    { name: "Flappy Bird", id: "flappy" },
    { name: "Snake", id: "snake" },
    { name: "Space Invaders", id: "space_invaders" },
    { name: "Platformer", id: "platformer" },
    { name: "Breakout", id: "breakout" },
    { name: "The Elemental Odyssey", id: "custom", large: true },
  ];

  let yOffset = 0;
  for (let game of games) {
    const isLarge = game.large;
    const width = isLarge ? buttonWidth * 1.5 : buttonWidth;
    const height = isLarge ? buttonHeight * 1.5 : buttonHeight;
    const buttonY = startY + yOffset;

    ctx.fillStyle = "#71D9E2";
    ctx.fillRect(centerX - width / 2, buttonY - height / 2, width, height);

    ctx.fillStyle = "#000000";
    ctx.font = isLarge ? "bold 28px Arial" : "bold 24px Arial";
    ctx.textAlign = "center";
    ctx.fillText(game.name, centerX, buttonY + (isLarge ? 10 : 5));

    yOffset += spacing;
  }

  // Draw return button
  const returnButtonY = startY + yOffset + 20;
  ctx.fillStyle = "#71D9E2";
  ctx.fillRect(centerX - buttonWidth / 2, returnButtonY - buttonHeight / 2, buttonWidth, buttonHeight);

  ctx.fillStyle = "#000000";
  ctx.font = "bold 24px Arial";
  ctx.fillText("RETURN", centerX, returnButtonY + 5);

  ctx.textAlign = "left";
}

function endGame() {
  gameRunning = false;
  gameState = "gameover";
}

function exitGame() {
  gameRunning = false;

  if (keydownListener) document.removeEventListener("keydown", keydownListener);
  if (clickListener) document.removeEventListener("click", clickListener);
  if (resizeListener) window.removeEventListener("resize", resizeListener);

  if (fullscreenContainer && fullscreenContainer.parentNode) {
    fullscreenContainer.parentNode.removeChild(fullscreenContainer);
  }
  timeDisplay.textContent = "Ready";
}

function gameLoop() {
  if (!fullscreenContainer || !fullscreenContainer.parentNode) return;

  update();
  draw();
  requestAnimationFrame(gameLoop);
}

startBtn.addEventListener("click", () => {
  initGame();
});
