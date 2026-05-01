/**
 * The Elemental Odyssey RPG Module for Arcade Engine
 * Adapted from user's original RPG game
 */

class ElementalOdysseyGame {
  static displayName = "Elemental Odyssey";

  constructor(options) {
    this.canvas = options.canvas;
    this.ctx = options.ctx;
    this.engine = options.engine;

    // Game state
    this.gameState = {
      username: "Hero",
      element: null,
      level: 1,
      exp: 0,
      skin: "medieval_tunic",
      realm: "Enchanted Forest",
      items: { staff: null, armor: "Cloth", gems: 0 }
    };

    this.ELEMENTS = ["Lightning", "Fire", "Water", "Nature", "Healing", "Air", "Stone", "Plain"];

    this.REALMS = [
      { name: "Enchanted Forest", minLevel: 1, color: "#1b4332" },
      { name: "Sky Realm", minLevel: 20, color: "#a2d2ff" },
      { name: "Void Realm", minLevel: 60, color: "#2d004d" },
      { name: "Champion Realm", minLevel: 100, color: "#ff9f1c" }
    ];

    this.gameStarted = false;
    this.setupMenuActive = true;
    this.selectedElement = null;

    // Bind event handlers
    this.boundKeyDown = (e) => this.handleKeyDown(e);
    this.boundClick = (e) => this.handleClick(e);
    document.addEventListener("keydown", this.boundKeyDown);
    document.addEventListener("click", this.boundClick);

    // Load or initialize game
    this.loadGame();
  }

  saveGame() {
    localStorage.setItem("elementalOdyssey_Data", JSON.stringify(this.gameState));
  }

  loadGame() {
    const saved = localStorage.getItem("elementalOdyssey_Data");
    if (saved) {
      this.gameState = JSON.parse(saved);
      this.setupMenuActive = false;
      this.gameStarted = true;
    }
  }

  handleKeyDown(e) {
    if (e.key === "Escape") {
      this.engine.endGame();
      document.removeEventListener("keydown", this.boundKeyDown);
      document.removeEventListener("click", this.boundClick);
    }
  }

  handleClick(e) {
    if (!this.setupMenuActive) return;

    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    const buttonWidth = 120;
    const buttonHeight = 50;
    const buttonsPerRow = 4;
    const spacing = 140;

    // Calculate button positions
    for (let i = 0; i < this.ELEMENTS.length; i++) {
      const row = Math.floor(i / buttonsPerRow);
      const col = i % buttonsPerRow;
      const x = centerX - (buttonsPerRow * spacing) / 2 + col * spacing;
      const y = centerY - 50 + row * 80;

      if (
        e.clientX > x - buttonWidth / 2 &&
        e.clientX < x + buttonWidth / 2 &&
        e.clientY > y - buttonHeight / 2 &&
        e.clientY < y + buttonHeight / 2
      ) {
        this.gameState.element = this.ELEMENTS[i];
        const username = prompt("Enter your hero name:", "Hero") || "Hero";
        this.gameState.username = username;
        this.setupMenuActive = false;
        this.gameStarted = true;
        this.saveGame();
      }
    }
  }

  checkLevelUp() {
    const nextLevelExp = this.gameState.level * 100;
    if (this.gameState.exp >= nextLevelExp) {
      this.gameState.level++;
      this.gameState.exp = 0;

      // Realm unlocking
      const currentRealm = this.REALMS.reduce((last, r) => {
        return this.gameState.level >= r.minLevel ? r : last;
      }, this.REALMS[0]);
      this.gameState.realm = currentRealm.name;

      this.saveGame();
    }
  }

  getElementColor(element) {
    const colors = {
      Lightning: "#f1c40f",
      Fire: "#e67e22",
      Water: "#3498db",
      Nature: "#2ecc71",
      Healing: "#ff75a0",
      Air: "#ecf0f1",
      Stone: "#95a5a6",
      Plain: "#bdc3c7"
    };
    return colors[element] || "#fff";
  }

  update() {
    // Simulate gameplay - gain exp over time
    if (this.gameStarted && !this.setupMenuActive) {
      this.gameState.exp += 0.1;
      this.checkLevelUp();
    }
  }

  draw() {
    if (this.setupMenuActive) {
      this.drawSetupMenu();
    } else {
      this.drawGameplay();
    }
  }

  drawSetupMenu() {
    // Draw semi-transparent overlay
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw menu box
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    const menuWidth = 600;
    const menuHeight = 400;

    this.ctx.fillStyle = "#2c3e50";
    this.ctx.fillRect(centerX - menuWidth / 2, centerY - menuHeight / 2, menuWidth, menuHeight);

    this.ctx.strokeStyle = "#8e44ad";
    this.ctx.lineWidth = 4;
    this.ctx.strokeRect(centerX - menuWidth / 2, centerY - menuHeight / 2, menuWidth, menuHeight);

    // Draw title
    this.ctx.fillStyle = "#8e44ad";
    this.ctx.font = "bold 36px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillText("Choose Your Element", centerX, centerY - 150);

    // Draw element buttons
    const buttonWidth = 120;
    const buttonHeight = 50;
    const buttonsPerRow = 4;
    const spacing = 140;

    for (let i = 0; i < this.ELEMENTS.length; i++) {
      const row = Math.floor(i / buttonsPerRow);
      const col = i % buttonsPerRow;
      const x = centerX - (buttonsPerRow * spacing) / 2 + col * spacing;
      const y = centerY - 50 + row * 80;

      this.ctx.fillStyle = "#8e44ad";
      this.ctx.fillRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight);

      this.ctx.fillStyle = "#fff";
      this.ctx.font = "bold 14px Arial";
      this.ctx.textAlign = "center";
      this.ctx.fillText(this.ELEMENTS[i], x, y + 5);
    }

    // Draw instructions
    this.ctx.fillStyle = "#e0e0e0";
    this.ctx.font = "16px Arial";
    this.ctx.fillText("Click an element to begin your journey", centerX, centerY + 180);
  }

  drawGameplay() {
    // Draw Background based on Realm
    const realmData = this.REALMS.find(r => r.name === this.gameState.realm);
    this.ctx.fillStyle = realmData.color;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Pixelated "Ground" effect
    this.ctx.fillStyle = "rgba(0,0,0,0.1)";
    for (let i = 0; i < this.canvas.width; i += 40) {
      for (let j = 0; j < this.canvas.height; j += 40) {
        if ((i + j) % 80 === 0) this.ctx.fillRect(i, j, 40, 40);
      }
    }

    // Draw Player (Pixelated sprite)
    this.ctx.fillStyle = "#fff";
    this.ctx.fillRect(this.canvas.width / 2 - 20, this.canvas.height / 2 - 20, 40, 40);

    // Elemental Aura
    this.ctx.strokeStyle = this.getElementColor(this.gameState.element);
    this.ctx.lineWidth = 4;
    this.ctx.strokeRect(this.canvas.width / 2 - 25, this.canvas.height / 2 - 25, 50, 50);

    // Draw UI overlay
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    this.ctx.fillRect(10, 10, 300, 150);

    this.ctx.fillStyle = "#e0e0e0";
    this.ctx.font = "16px Arial";
    this.ctx.textAlign = "left";
    this.ctx.fillText("Player: " + this.gameState.username, 20, 35);
    this.ctx.fillText("Element: " + this.gameState.element, 20, 60);
    this.ctx.fillText("Level: " + this.gameState.level, 20, 85);
    this.ctx.fillText("Realm: " + this.gameState.realm, 20, 110);
    this.ctx.fillText("EXP: " + Math.floor(this.gameState.exp) + "/" + (this.gameState.level * 100), 20, 135);

    // Draw instructions
    this.ctx.fillStyle = "#71D9E2";
    this.ctx.font = "14px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillText("Press ESC to exit", this.canvas.width / 2, this.canvas.height - 20);
  }
}
