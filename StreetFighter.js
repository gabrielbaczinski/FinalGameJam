let player1, player2;
let round = 1;
let maxRounds = 2;
let gameOver = false;
let powerMax = 100;

function setup() {
  createCanvas(800, 400);
  player1 = new Fighter(
    100,
    300,
    'Player 1',
    ['A', 'D', 'W', 'S'],
    'F',
    ['A', 'S', 'D', 'F'], // sequencia hadouken player1
    ['D', 'D', 'F']       // sequencia poder supremo player1
  );
  player2 = new Fighter(
    650,
    300,
    'Player 2',
    ['LEFT_ARROW', 'RIGHT_ARROW', 'UP_ARROW', 'DOWN_ARROW'],
    'L',
    ['LEFT_ARROW', 'DOWN_ARROW', 'RIGHT_ARROW', 'L'], // hadouken player2
    ['RIGHT_ARROW', 'RIGHT_ARROW', 'L']               // poder supremo player2
  );
  textAlign(CENTER, CENTER);
  textSize(24);
}

function draw() {
  background(100, 150, 200);
  fill(40, 150, 40);
  rect(0, height - 20, width, 20);

  if (gameOver) {
    fill(255, 0, 0);
    textSize(40);
    text(
      `${player1.life <= 0 ? player2.name : player1.name} venceu o jogo!`,
      width / 2,
      height / 2
    );
    return;
  }

  player1.update();
  player2.update();

  checkAttacks();

  checkRound();

  drawHUD();
}

function keyPressed() {
  if (gameOver) return;

  player1.keyPressed(key);
  player2.keyPressed(key);
}

function checkAttacks() {
  [player1, player2].forEach((attacker, i) => {
    let defender = i === 0 ? player2 : player1;

    if (attacker.isAttacking && !attacker.hasHit) {
      if (hitCheck(attacker, defender)) {
        let damage = attacker.attackPower;
        if (attacker.isPowerAttack) damage *= 3;
        defender.takeDamage(damage);
        attacker.hasHit = true;
        attacker.isPowerAttack = false;
        attacker.addPower(15);
      }
    }

    if (attacker.isSpecialAttacking && !attacker.hasHit) {
      if (hitCheck(attacker, defender)) {
        defender.takeDamage(30);
        attacker.hasHit = true;
        attacker.isSpecialAttacking = false;
      }
    }
  });
}

function hitCheck(attacker, defender) {
  let distX = abs(attacker.x - defender.x);
  let distY = abs(attacker.y - defender.y);
  return distX < 60 && distY < 50;
}

function checkRound() {
  if (player1.life <= 0 || player2.life <= 0) {
    if (round >= maxRounds) {
      gameOver = true;
    } else {
      round++;
      player1.reset();
      player2.reset();
    }
  }
}

function drawHUD() {
  fill(255);
  textSize(18);
  text(`Round: ${round}`, width / 2, 20);

  drawLifeBar(player1, 20, 20, 200);
  drawLifeBar(player2, width - 220, 20, 200);

  drawPowerBar(player1, 20, 50, 200);
  drawPowerBar(player2, width - 220, 50, 200);
}

function drawLifeBar(player, x, y, w) {
  fill(0, 0, 255);
  rect(x, y, w, 20);
  fill(0, 255, 0);
  rect(x, y, (w * player.life) / 100, 20);
  fill(255);
  text(player.name, x + w / 2, y + 50);
}

function drawPowerBar(player, x, y, w) {
  fill(100);
  rect(x, y, w, 10);
  fill(255, 165, 0);
  rect(x, y, (w * player.power) / powerMax, 10);
  fill(255);
  textSize(12);
  text('Poder', x + w / 2, y - 5);
}

class Fighter {
  constructor(x, y, name, moveKeys, attackKey, hadoukenSeq, powerSeq) {
    this.name = name;
    this.x = x;
    this.y = y;
    this.w = 50;
    this.h = 80;
    this.vx = 0;
    this.vy = 0;
    this.life = 100;
    this.power = 0;
    this.onGround = true;
    this.isBlocking = false;

    this.moveKeys = moveKeys; // [left, right, jump, down]
    this.attackKey = attackKey;
    this.hadoukenSeq = hadoukenSeq;
    this.powerSeq = powerSeq;

    this.isAttacking = false;
    this.isSpecialAttacking = false;
    this.isPowerAttack = false;
    this.attackTimer = 0;
    this.attackPower = 15;
    this.hasHit = false;

    this.keyBuffer = [];
    this.keyBufferMaxSize = 10;
  }

  update() {
    this.handleMovement();

    this.x += this.vx;
    this.y += this.vy;

    this.vy += 1.0; // gravidade

    if (this.y > 300) {
      this.y = 300;
      this.vy = 0;
      this.onGround = true;
    }

    this.x = constrain(this.x, 0, width - this.w);

    if (this.isAttacking || this.isSpecialAttacking) {
      this.attackTimer--;
      if (this.attackTimer <= 0) {
        this.isAttacking = false;
        this.isSpecialAttacking = false;
        this.hasHit = false;
        this.isPowerAttack = false;
      }
    }

    this.display();
  }

  handleMovement() {
    this.vx = 0;
    this.isBlocking = false;

    if (keyIsDown(keyCodeFromKey(this.moveKeys[0]))) this.vx = -5;
    if (keyIsDown(keyCodeFromKey(this.moveKeys[1]))) this.vx = 5;

    if (keyIsDown(keyCodeFromKey(this.moveKeys[2])) && this.onGround) {
      this.vy = -18;
      this.onGround = false;
    }

    if (keyIsDown(keyCodeFromKey(this.moveKeys[3]))) this.isBlocking = true;
  }

  attack() {
    if (!this.isAttacking && !this.isSpecialAttacking) {
      this.isAttacking = true;
      this.attackTimer = 15;
      this.hasHit = false;
      this.isPowerAttack = false;
    }
  }

  specialAttack() {
    if (this.power >= powerMax) {
      this.isSpecialAttacking = true;
      this.attackTimer = 25;
      this.hasHit = false;
      this.power = 0;
    }
  }

  takeDamage(amount) {
    if (!this.isBlocking) {
      this.life -= amount;
      this.life = max(this.life, 0);
    } else {
      this.life -= amount / 3; // bloqueia e sofre menos dano
      this.life = max(this.life, 0);
    }
  }

  addPower(amount) {
    this.power += amount;
    if (this.power > powerMax) this.power = powerMax;
  }

  reset() {
    this.life = 100;
    this.power = 0;
    this.x = this.name === 'Player 1' ? 100 : 650;
    this.y = 300;
    this.vx = 0;
    this.vy = 0;
    this.isAttacking = false;
    this.isSpecialAttacking = false;
    this.attackTimer = 0;
    this.hasHit = false;
    this.isBlocking = false;
    this.onGround = true;
    this.keyBuffer = [];
  }

  display() {
    fill(this.name === 'Player 1' ? 'blue' : 'red');
    rect(this.x, this.y - this.h, this.w, this.h);

    if (this.isAttacking) {
      fill('yellow');
      let attackX = this.x + (this.name === 'Player 1' ? this.w : -20);
      ellipse(attackX, this.y - this.h / 2, 20, 40);
    }

    if (this.isSpecialAttacking) {
      fill('orange');
      let attackX = this.x + (this.name === 'Player 1' ? this.w + 10 : -40);
      ellipse(attackX, this.y - this.h / 2, 50, 80);
    }

    if (this.isBlocking) {
      fill('cyan');
      ellipse(this.x + this.w / 2, this.y - this.h / 2, 20, 20);
    }
  }

  keyPressed(k) {
    k = k.toUpperCase();

    // Ataque simples
    if (k === this.attackKey) {
      this.attack();
    }

    // Atualiza buffer de teclas
    this.keyBuffer.push(k);
    if (this.keyBuffer.length > this.keyBufferMaxSize) this.keyBuffer.shift();

    // Checa Hadouken
    if (this.checkSequence(this.hadoukenSeq)) {
      this.isSpecialAttacking = true;
      this.attackTimer = 25;
      this.hasHit = false;
      // Hadouken não consome power, mas causa dano forte
      this.isPowerAttack = false;
      this.keyBuffer = [];
    }

    // Checa poder supremo
    if (this.checkSequence(this.powerSeq) && this.power >= powerMax) {
      this.specialAttack();
      this.keyBuffer = [];
    }
  }

  checkSequence(seq) {
    if (seq.length > this.keyBuffer.length) return false;
    for (let i = 0; i < seq.length; i++) {
      if (this.keyBuffer[this.keyBuffer.length - seq.length + i] !== seq[i])
        return false;
    }
    return true;
  }
}

function keyCodeFromKey(k) {
  let keyMap = {
    A: 65,
    D: 68,
    W: 87,
    S: 83,
    F: 70,
    LEFT_ARROW: LEFT_ARROW,
    RIGHT_ARROW: RIGHT_ARROW,
    UP_ARROW: UP_ARROW,
    DOWN_ARROW: DOWN_ARROW,
    L: 76,
  };
  return keyMap[k] || k.charCodeAt(0);
}
