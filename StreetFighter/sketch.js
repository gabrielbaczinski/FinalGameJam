// Variáveis globais
let sprites = {
    ryu: {},
    ken: {},
    chun: {},
    makoto: {}
};
let backgrounds = [];
let selectedBg;
let spritesLoaded = false;
let isPaused = false;
let player1, player2;
let projectiles = [];
let gameTime = 99;
let gameTimer = 0;
window.gameOver = false;
window.winner = null;
let gameStarted = false;
let introTimer = 0;
let introTime = 3000; // 3 segundos de introdução
let bgm, bgmButton, bgmPlaying = false;
let introPlayed = false;

// Controle de teclas pressionadas
window.keyState = {};
window.addEventListener('keydown', (e) => {
    window.keyState[e.key.toUpperCase()] = true;
    window.keyState[e.code] = true;
});
window.addEventListener('keyup', (e) => {
    window.keyState[e.key.toUpperCase()] = false;
    window.keyState[e.code] = false;
});

let loadingProgress = 0;
let loadingDone = false;

// Modifique o preloadSprites para atualizar o progresso de loading
function preloadSprites(p) {
    let total = 32; // ajuste conforme o número real de sprites + backgrounds
    let loaded = 0;
    function inc() {
        loaded++;
        loadingProgress = loaded / total;
        if (loaded >= total) loadingDone = true;
    }
    // Ryu
    sprites.ryu.idle = p.loadImage('Sprites/Ryu Standing.gif', inc);
    sprites.ryu.walk = p.loadImage('Sprites/Ryu Walking.gif', inc);
    sprites.ryu.jump = p.loadImage('Sprites/Ryu Jump.gif', inc);
    sprites.ryu.crouch = p.loadImage('Sprites/Ryu Crouch.gif', inc);
    sprites.ryu.damage = p.loadImage('Sprites/Ryu Damage.gif', inc);
    sprites.ryu.punch = p.loadImage('Sprites/Ryu Punch.gif', inc);
    sprites.ryu.special = p.loadImage('Sprites/Ryu Special.gif', inc);
    sprites.ryu.block = p.loadImage('Sprites/Ryu Block.gif', inc);
    sprites.ryu.intro = p.loadImage('Sprites/Ryu Intro.gif', inc);
    sprites.ryu.win = p.loadImage('Sprites/Ryu Win.gif', inc);
    sprites.ryu.lost = p.loadImage('Sprites/Ryu Lost.gif', inc);
    sprites.ryu.super = p.loadImage('Sprites/Ryu Super.gif', inc);
    sprites.ryu.walkBack = p.loadImage('Sprites/Ryu WalkBack.gif', inc);

    // Ken
    sprites.ken.idle = p.loadImage('Sprites/Ken Standing.gif', inc);
    sprites.ken.walk = p.loadImage('Sprites/Ken Walking.gif', inc);
    sprites.ken.jump = p.loadImage('Sprites/Ken Jump.gif', inc);
    sprites.ken.crouch = p.loadImage('Sprites/Ken Crouch.gif', inc);
    sprites.ken.damage = p.loadImage('Sprites/Ken Damage.gif', inc);
    sprites.ken.punch = p.loadImage('Sprites/Ken Punch.gif', inc);
    sprites.ken.special = p.loadImage('Sprites/Ken Special.gif', inc);
    sprites.ken.block = p.loadImage('Sprites/Ken Block.gif', inc);
    sprites.ken.intro = p.loadImage('Sprites/Ken Intro.gif', inc);
    sprites.ken.win = p.loadImage('Sprites/Ken Win.gif', inc);
    sprites.ken.lost = p.loadImage('Sprites/Ken Lost.gif', inc);
    sprites.ken.super = p.loadImage('Sprites/Ken Super.gif', inc);
    sprites.ken.walkBack = p.loadImage('Sprites/Ken WalkBack.gif', inc);

    // Chun-Li
    sprites.chun.idle = p.loadImage('Sprites/Chun Standing.gif', inc);
    sprites.chun.walk = p.loadImage('Sprites/Chun Walking.gif', inc);
    sprites.chun.jump = p.loadImage('Sprites/Chun Jump.gif', inc);
    sprites.chun.crouch = p.loadImage('Sprites/Chun Crouch.gif', inc);
    sprites.chun.damage = p.loadImage('Sprites/Chun Damage.gif', inc);
    sprites.chun.punch = p.loadImage('Sprites/Chun Punch.gif', inc);
    sprites.chun.special = p.loadImage('Sprites/Chun Special.gif', inc);
    sprites.chun.block = p.loadImage('Sprites/Chun Block.gif', inc);
    sprites.chun.intro = p.loadImage('Sprites/Chun Intro.gif', inc);
    sprites.chun.win = p.loadImage('Sprites/Chun Win.gif', inc);
    sprites.chun.lost = p.loadImage('Sprites/Chun Lost.gif', inc);
    sprites.chun.super = p.loadImage('Sprites/Chun Super.gif', inc);
    sprites.chun.walkBack = p.loadImage('Sprites/Chun WalkBack.gif', inc);

    // Makoto
    sprites.makoto.idle = p.loadImage('Sprites/Makoto Standing.gif', inc);
    sprites.makoto.walk = p.loadImage('Sprites/Makoto Walking.gif', inc);
    sprites.makoto.jump = p.loadImage('Sprites/Makoto Jump.gif', inc);
    sprites.makoto.crouch = p.loadImage('Sprites/Makoto Crouch.gif', inc);
    sprites.makoto.damage = p.loadImage('Sprites/Makoto Damage.gif', inc);
    sprites.makoto.punch = p.loadImage('Sprites/Makoto Punch.gif', inc);
    sprites.makoto.special = p.loadImage('Sprites/Makoto Special.gif', inc);
    sprites.makoto.block = p.loadImage('Sprites/Makoto Block.gif', inc);
    sprites.makoto.intro = p.loadImage('Sprites/Makoto Intro.gif', inc);
    sprites.makoto.win = p.loadImage('Sprites/Makoto Win.gif', inc);
    sprites.makoto.lost = p.loadImage('Sprites/Makoto Lost.gif', inc);
    sprites.makoto.super = p.loadImage('Sprites/Makoto Super.gif', inc);
    sprites.makoto.walkBack = p.loadImage('Sprites/Makoto WalkBack.gif', inc);

    // Backgrounds
    for (let i = 1; i <= 6; i++) {
        backgrounds.push(p.loadImage(`Sprites/BG${i}.gif`, inc));
    }
}

// Função para mapear teclas para códigos
function keyCodeFromKey(key) {
    if (typeof key === 'number') return key;
    if (typeof key === 'string') {
        switch (key.toUpperCase()) {
            case 'LEFT_ARROW': return 37;
            case 'UP_ARROW': return 38;
            case 'RIGHT_ARROW': return 39;
            case 'DOWN_ARROW': return 40;
            case 'A': return 65;
            case 'D': return 68;
            case 'W': return 87;
            case 'S': return 83;
            case 'F': return 70;
            case 'G': return 71;
            case 'K': return 75;
            case 'L': return 76;
            case 'Q': return 81;
            case 'E': return 69;
            case 'R': return 82;
            case 'T': return 84;
            case 'U': return 85;
            case 'I': return 73;
            case 'J': return 74;
            case 'O': return 79;
            case 'C': return 67;
            case 'M': return 77;
            default: return key.toUpperCase().charCodeAt(0);
        }
    }
    return 0;
}

// Sketch principal
const sketch = (p) => {
    p.preload = function () {
        preloadSprites(p);
    };

    p.setup = function () {
        p.createCanvas(1024, 512); // Canvas maior
        // Selecionar um background aleatoriamente
        let randomIndex = Math.floor(p.random(0, backgrounds.length));
        selectedBg = backgrounds[randomIndex];

        let char1 = { name: 'Ryu' };
        let char2 = { name: 'Ken' };
        try {
            const p1 = localStorage.getItem('selectedPlayer1');
            const p2 = localStorage.getItem('selectedPlayer2');
            if (p1) char1 = JSON.parse(p1);
            if (p2) char2 = JSON.parse(p2);
        } catch (e) { }
        let char1Type = char1.name.toLowerCase();
        let char2Type = char2.name.toLowerCase();
        if (char1Type === 'chun-li') char1Type = 'chun';
        if (char2Type === 'chun-li') char2Type = 'chun';

        const FLOOR_HEIGHT = p.height - 20;

        player1 = new Fighter(
            200, FLOOR_HEIGHT, 'Player 1',
            ['A', 'D', 'W', 'S'], 'F', 'G',
            ['Q'], ['E'],
            p, sprites[char1Type], char1Type
        );

        // No setup, ajuste as teclas do player2 para ArrowLeft, ArrowRight, ArrowUp, ArrowDown (com maiúsculas)
        player2 = new Fighter(
            p.width - 200, FLOOR_HEIGHT, 'Player 2',
            ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'], 'K', 'L',
            ['I'], ['O'],
            p, sprites[char2Type], char2Type
        );

        // Garante que ambos começam no chão
        player1.y = FLOOR_HEIGHT;
        player2.y = FLOOR_HEIGHT;
        player1.vy = 0;
        player2.vy = 0;
        player1.onGround = true;
        player2.onGround = true;

        spritesLoaded = true;
        player1.currentState = 'intro';
        player2.currentState = 'intro';
        introTimer = p.millis();

        setTimeout(() => {
            gameStarted = true;
            gameTimer = p.millis();
        }, 1000);
    };

    p.draw = function () {
        if (!loadingDone) {
            // Fundo branco
            p.background(255);
            // Barra de loading centralizada
            const barWidth = 400;
            const barHeight = 32;
            const x = (p.width - barWidth) / 2;
            const y = (p.height - barHeight) / 2;
            p.fill(230);
            p.stroke("#ffcc00");
            p.strokeWeight(4);
            p.rect(x, y, barWidth, barHeight, 12);
            p.noStroke();
            p.fill("#44cc44");
            p.rect(x + 4, y + 4, Math.max(0, (barWidth - 8) * loadingProgress), barHeight - 8, 8);
            p.fill("#222");
            p.textAlign(p.CENTER, p.CENTER);
            p.textSize(22);
            p.text("Carregando...", p.width / 2, y - 30);
            p.textSize(16);
            p.text(Math.round(loadingProgress * 100) + "%", p.width / 2, y + barHeight + 18);
            return;
        }

        // Fundo
        if (selectedBg && selectedBg.width > 0) {
            p.image(selectedBg, 0, 0, p.width, p.height);
        } else {
            p.background(135, 206, 235);
            p.fill(34, 139, 34);
            p.rect(0, p.height - 20, p.width, 20);
        }


        // Atualização do jogo
        if (!isPaused && !gameOver) {
            if (gameStarted && p.millis() - introTimer > introTime) {
                if (p.millis() - gameTimer > 1000) {
                    gameTime--;
                    gameTimer = p.millis();
                    if (gameTime <= 0) {
                        gameOver = true;
                        winner = player1.life > player2.life ? 'Player 1' :
                            player2.life > player1.life ? 'Player 2' : 'Draw';
                    }
                }
                player1.update(player2);
                player2.update(player1);

                // Projéteis reais
                for (let i = projectiles.length - 1; i >= 0; i--) {
                    let proj = projectiles[i];
                    if (proj instanceof Projectile) {
                        proj.update();
                        proj.display();
                        // Checa colisão com o oponente correto
                        if (proj.isActive) {
                            if (proj.owner === player1) proj.checkCollision(player2);
                            if (proj.owner === player2) proj.checkCollision(player1);
                        }
                        if (!proj.isActive) {
                            projectiles.splice(i, 1);
                        }
                    } else {
                        // Projétil antigo (objeto literal), converte para classe
                        let newProj = new Projectile(
                            proj.x, proj.y, proj.vx < 0, p,
                            proj.damage || 15,
                            proj.color || [255, 255, 0],
                            proj.size || 30,
                            proj.type || 'hadouken'
                        );
                        newProj.vx = proj.vx;
                        newProj.vy = proj.vy;
                        newProj.owner = proj.owner;
                        newProj.isPowerAttack = proj.isPowerAttack;
                        projectiles[i] = newProj;
                    }
                }
            } else {
                player1.update(player2);
                player2.update(player1);
            }
        }

        // Sempre desenhar jogadores
        player1.display();
        player2.display();

        // UI
        drawUI();
    };

    // Barra estilizada igual ao CSS das outras páginas
    function drawAttributeBar(p, x, y, w, h, percent, color, borderColor, label, playerName, align = "left") {
        p.push();
        // Sombra
        p.noStroke();
        p.fill(0, 0, 0, 120);
        p.rect(x - 6, y + 6, w + 12, h + 12, 18);
        // Borda
        p.stroke(borderColor);
        p.strokeWeight(4);
        p.fill(30, 30, 30, 220);
        p.rect(x, y, w, h, 14);
        // Barra principal com gradiente
        let grad = p.drawingContext.createLinearGradient(x, y, x + w, y);
        grad.addColorStop(0, color);
        grad.addColorStop(1, "#222");
        p.drawingContext.fillStyle = grad;
        p.noStroke();
        let barLength = p.constrain((w - 8) * percent, 0, w - 8);
p.rect(x + 4, y + 4, barLength, h - 8, 10);
        p.fill("#ffcc00");
        p.textSize(16);
        p.textAlign(align === "left" ? p.LEFT : p.RIGHT);
        if (playerName) {
            p.text(playerName, align === "left" ? x : x + w, y - 12);
        }
        p.textAlign(p.CENTER);
        p.textSize(13);
        p.fill("#fff");
        p.text(label, x + w / 2, y + h - 6);
        p.pop();
    }

    function drawUI() {
        if (gameOver) {
            p.push();
            p.noStroke();
            p.fill(0, 0, 0, 230);
            p.rect(0, 0, p.width, p.height);
            // Glow
            p.textAlign(p.CENTER);
            p.textSize(60);
            p.fill("#ffcc00");
            p.stroke("#fff");
            p.strokeWeight(4);
            p.text('GAME OVER', p.width / 2, p.height / 2 - 70);
            p.noStroke();
            p.textSize(38);
            p.fill("#fff");
            p.text(winner + ' WINS!', p.width / 2, p.height / 2 - 10);
            p.textSize(24);
            p.fill("#ffcc00");
            p.text('Pressione ESPAÇO para voltar à seleção de personagens', p.width / 2, p.height / 2 + 50);
            p.pop();
            return;
        }
        // Só mostra a intro se ainda não foi exibida
        if (!introPlayed && gameStarted && p.millis() - introTimer <= introTime) {
            p.push();
            p.textAlign(p.CENTER);
            p.textSize(54);
            p.fill("#ffcc00");
            p.stroke("#fff");
            p.strokeWeight(3);
            p.text('ROUND 1', p.width / 2, p.height / 2 - 40);
            p.textSize(36);
            p.noStroke();
            p.fill("#fff");
            p.text('FIGHT!', p.width / 2, p.height / 2 + 20);
            p.pop();
            // Marca como exibida após o tempo da intro
            if (p.millis() - introTimer > introTime) {
                introPlayed = true;
                // Troca o estado dos personagens para idle após a intro
                player1.currentState = 'idle';
                player2.currentState = 'idle';
            }
            return;
        }

        // Timer estilizado
        p.push();
        p.textAlign(p.CENTER);
        p.textSize(44);
        p.stroke(0, 0, 0, 120);
        p.strokeWeight(8);
        p.fill("#ffcc00");
        p.text(gameTime, p.width / 2, 62);
        p.noStroke();
        p.pop();

        // Barras de vida e poder estilizadas
        drawAttributeBar(p, 60, 30, 400, 28, player1.life / player1.maxLife, "#e74c3c", "#fff", "VIDA", player1.name, "left");
        drawAttributeBar(p, 60, 70, 400, 18, player1.power / player1.powerMax, "#00e6e6", "#fff", "PODER", "", "left");
        drawAttributeBar(p, p.width - 460, 30, 400, 28, player2.life / player2.maxLife, "#e74c3c", "#fff", "VIDA", player2.name, "right");
        drawAttributeBar(p, p.width - 460, 70, 400, 18, player2.power / player2.powerMax, "#00e6e6", "#fff", "PODER", "", "right");

        // Pausado
        if (isPaused) {
            p.push();
            p.fill(0, 0, 0, 180);
            p.rect(0, 0, p.width, p.height);
            p.textAlign(p.CENTER);
            p.textSize(48);
            p.fill(255, 255, 0);
            p.text('PAUSED', p.width / 2, p.height / 2);
            p.textSize(16);
            p.fill(255);
            p.text('Pressione P para continuar', p.width / 2, p.height / 2 + 40);
            p.pop();
        }
    }

    // Reiniciar o jogo com um novo background aleatório
    function restartGame() {
        let randomIndex = Math.floor(p.random(0, backgrounds.length));
        selectedBg = backgrounds[randomIndex];
        player1.life = 100;
        player2.life = 100;
        player1.power = 0;
        player2.power = 0;
        player1.x = 200;
        player2.x = p.width - 200;
        player1.y = p.height - 20;
        player2.y = p.height - 20;
        player1.vx = 0;
        player1.vy = 0;
        player2.vx = 0;
        player2.vy = 0;
        gameTime = 99;
        window.gameOver = false;
        winner = null;
        projectiles = [];
        player1.currentState = 'intro';
        player2.currentState = 'intro';
        introTimer = p.millis();
        gameStarted = false;
        setTimeout(() => {
            gameStarted = true;
            gameTimer = p.millis();
        }, 1000);
    }

    p.keyPressed = function () {
        if (p.key === 'p' || p.key === 'P') {
            isPaused = !isPaused;
        }
        if ((p.key === 'r' || p.key === 'R') && window.gameOver) {
            restartGame();
        }
        // Voltar para seleção de personagens ao apertar ENTER
        if (window.gameOver && (p.key === ' ' || p.key === 'Spacebar' || p.keyCode === 32)) {
            window.location.href = "./selecao.html"; // ajuste o caminho se necessário
        }
    };
};

class Fighter {
    constructor(x, y, name, moveKeys, attackKey, blockKey, specialKeys, ultimateKeys, p5Instance, sprites, character) {
        this.x = x;
        this.y = y;
        this.width = 90;   // AUMENTE A LARGURA DA HITBOX
        this.height = 180; // AUMENTE A ALTURA DA HITBOX
        this.vx = 0;
        this.vy = 0;
        this.speed = 5;
        this.gravity = 0.6;
        this.onGround = true;
        this.life = 100;
        this.maxLife = 100;
        this.power = 0;
        this.powerMax = 100;
        this.name = name;
        this.moveKeys = moveKeys;
        this.attackKey = attackKey;
        this.blockKey = blockKey;
        this.specialKeys = specialKeys;
        this.ultimateKeys = ultimateKeys;
        this.p = p5Instance;
        this.sprites = sprites;
        this.character = character;
        this.currentState = 'idle';
        this.isAttacking = false;
        this.isBlocking = false;
        this.isCasting = false;
        this.isStunned = false;
        this.isFacingLeft = false;
        this.actionStartTime = 0;
        this.attackTimer = 0;
        this.castTimer = 0;
        this.stunTimer = 0;
        this.lastDamageTimer = 0;
        this.animationTimer = 0;
        this.lastKeyPressed = null;
        this.keyHistory = [];
        this.attackPower = 10;
    }

    // Retorna a hitbox do personagem
    getHitbox() {
        return {
            left: this.x - this.width / 2,
            right: this.x + this.width / 2,
            top: this.y - this.height,
            bottom: this.y
        };
    }

    // Retorna a área de ataque (um retângulo à frente do personagem) - agora só aparece durante o ataque
    getAttackBox() {
        if (!(this.currentState === 'punching' || this.currentState === 'special' || this.currentState === 'super')) {
            // Não está atacando, não há caixa de ataque
            return null;
        }
        const range = 90; // ajuste conforme necessário
        const height = this.height * 0.6; // ataque cobre parte do corpo
        const yOffset = this.height * 0.2; // ataque fica na altura do peito
        if (this.isFacingLeft) {
            return {
                left: this.x - this.width / 2 - range,
                right: this.x - this.width / 2,
                top: this.y - this.height + yOffset,
                bottom: this.y - this.height + yOffset + height
            };
        } else {
            return {
                left: this.x + this.width / 2,
                right: this.x + this.width / 2 + range,
                top: this.y - this.height + yOffset,
                bottom: this.y - this.height + yOffset + height
            };
        }
    }

    // Checa colisão entre dois retângulos
    static rectsCollide(a, b) {
        return (
            a.left < b.right &&
            a.right > b.left &&
            a.top < b.bottom &&
            a.bottom > b.top
        );
    }

    attack() {
        if (this.isAttacking || this.isCasting || !(this.currentState === 'idle' || this.currentState === 'walking')) {
            return;
        }
        this.currentState = 'punching';
        this.actionStartTime = Date.now();
        this.isAttacking = true;
        this.vx = 0;

        setTimeout(() => {
            if (this.currentState === 'punching') {
                this.currentState = 'idle';
            }
            this.isAttacking = false;
            this._alreadyHit = false;
        }, 130);
    }

    takeDamage(amount, direction) {
        if (isNaN(amount) || amount <= 0) return;
        if (this.isBlocking) {
            amount = amount / 2;
            this.power = Math.min(this.powerMax, this.power + Math.floor(amount / 2));
            this.vx = direction * 5;
        } else {
            this.vx = direction * 10;
            this.isStunned = true;
            this.stunTimer = 15;
            this.currentState = 'damage';
            this.damageAnimTimer = 20;
        }
        this.life = Math.max(0, this.life - amount);
        this.lastDamageTimer = amount > 10 ? 20 : 15;
        // Limita o poder ao máximo
        this.power = Math.min(this.power, this.powerMax);

        // Corrigido: só executa o game over uma vez
        if (this.life <= 0 && !window.gameOver) {
            console.log("GAME OVER disparado por", this.name);
            window.gameOver = true;
            window.winner = this.name === 'Player 1' ? 'Player 2' : 'Player 1';
            // ...restante do código...            this.currentState = 'lost';
            const opponent = this.name === 'Player 1' ? window.player2 : window.player1;
            if (opponent) {
                opponent.currentState = 'win';
            }
            // Garante que ambos os jogadores parem de agir
            this.isAttacking = false;
            this.isCasting = false;
            this.isStunned = false;
            if (opponent) {
                opponent.isAttacking = false;
                opponent.isCasting = false;
                opponent.isStunned = false;
            }
        }
    }

    moveLeft() {
        if (this.currentState === 'idle' || this.currentState === 'walking') {
            this.vx = -this.speed;
            if (!this.isFacingLeft) {
                this.isWalkingBack = true;
            } else {
                this.isWalkingBack = false;
            }
            this.currentState = 'walking';
            const characterHalfWidth = 35;
            this.x = Math.max(characterHalfWidth, this.x);
        }
    }
    moveRight() {
        if (this.currentState === 'idle' || this.currentState === 'walking') {
            this.vx = this.speed;
            if (this.isFacingLeft) {
                this.isWalkingBack = true;
            } else {
                this.isWalkingBack = false;
            }
            this.currentState = 'walking';
            const characterHalfWidth = 35;
            this.x = Math.min(this.p.width - characterHalfWidth, this.x);
        }
    }
    jump() {
        if (this.onGround && (this.currentState === 'idle' || this.currentState === 'walking')) {
            this.vy = -15;
            this.onGround = false;
            this.currentState = 'jumping';
        }
    }
    crouch() {
        if (this.onGround && !this.isAttacking) {
            this.currentState = 'crouching';
        }
    }
    block() {
        if (this.onGround && (this.currentState === 'idle' || this.currentState === 'walking')) {
            this.currentState = 'blocking';
            this.isBlocking = true;
        }
    }
    hadouken() {
        if (this.isAttacking || this.isCasting || this.power < 25 || this.currentState === 'intro') return;
        this.isCasting = true;
        this.castTimer = 25;
        this.currentState = 'special';
        this.animationTimer = 25;
        const direction = this.isFacingLeft ? -1 : 1;
        const speed = 8 * direction;
        // Projétil centralizado na mão do personagem
        const projX = this.x + direction * (this.width / 2 + 20);
        const projY = this.y - this.height * 0.6;
        let color, size = 40, damage = 5;
    // Cores personalizadas por personagem
    switch (this.character) {
        case 'ryu':
            color = [0, 120, 255]; // azul
            break;
        case 'ken':
            color = [255, 80, 0]; // laranja/vermelho
            size = 35;
            damage = 5;
            break;
        case 'makoto':
            color = [180, 120, 40]; // marrom/dourado
            damage = 8;
            break;
        case 'chun-li':
            color = [0, 200, 255]; // azul claro
            break;
        default:
            color = [255, 255, 0];
    }
        let proj = new Projectile(projX, projY, direction < 0, this.p, damage, color, size, 'hadouken');
        proj.vx = speed;
        proj.owner = this;
        projectiles.push(proj);
        this.power -= 25;
    }

    powerAttack() {
        if (this.isAttacking || this.isCasting || this.power < this.powerMax || this.currentState === 'intro') return;
        this.isCasting = true;
        this.castTimer = 40;
        this.currentState = 'special';
        this.animationTimer = 40;
        const direction = this.isFacingLeft ? -1 : 1;
        // Projétil centralizado no topo da cabeça
        const projX = this.x + direction * (this.width / 2 + 30);
        const projY = this.y - this.height * 0.7;
        let color = [255, 255, 0], size = 50, damage = 8, type = 'power', vx = direction > 0 ? 5 : -5;
        switch (this.character) {
        case 'ryu':
            color = [255, 50, 50]; // vermelho
            break;
        case 'ken':
            color = [255, 180, 0]; // amarelo/laranja
            size = 60;
            damage = 12;
            break;
        case 'chun-li':
            color = [0, 220, 255]; // azul claro
            size = 40;
            damage = 11;
            break;
        case 'makoto':
            color = [139, 69, 19]; // marrom escuro
            vx = direction > 0 ? 6 : -6;
            size = 70;
            damage = 23;
            break;
        default:
            color = [255, 255, 0];
    }
        let proj = new Projectile(projX, projY, vx < 0, this.p, damage, color, size, type);
        proj.vx = vx;
        proj.owner = this;
        proj.isPowerAttack = true;
        projectiles.push(proj);
        this.power = 0;
    }
castSpecial() {
    if (this.power >= 30) {
        this.power -= 30;
        this.currentState = 'special';
        this.actionStartTime = Date.now();
        this.isAttacking = true;
        if (!window.effects) window.effects = [];
        window.effects.push({ x: this.x, y: this.y - 60, type: 'special', timer: 30, size: 80 });
        setTimeout(() => {
            this.isAttacking = false;
            if (this.currentState === 'special') {
                this.currentState = 'idle';
            }
        }, 500);

        const direction = this.isFacingLeft ? -1 : 1;
        if (this.character === 'chun-li') {
            // Kikoken: projétil azul claro, menor e mais rápido
            const projX = this.x + direction * (this.width / 2 + 30);
            const projY = this.y - this.height * 0.7;
            const projectileColor = [100, 220, 255];
            const projectile = new Projectile(projX, projY, this.isFacingLeft, this.p, 10, projectileColor, 32, 'kikoken');
            projectile.vx = direction * 12;
            projectile.owner = this;
            projectiles.push(projectile);
        } else {
            // Outros personagens: hadouken normal
            const projX = this.x + direction * (this.width / 2 + 30);
            const projY = this.y - this.height * 0.7;
            let projectileColor = [255, 200, 0];
            switch (this.character) {
                case 'ryu': projectileColor = [0, 120, 255]; break;
                case 'ken': projectileColor = [255, 80, 0]; break;
                case 'makoto': projectileColor = [180, 120, 40]; break;
                default: projectileColor = [255, 200, 0];
            }
            const projectile = new Projectile(projX, projY, this.isFacingLeft, this.p, 10, projectileColor, 40, 'hadouken');
            projectile.owner = this;
            projectiles.push(projectile);
        }
    }
}

castUltimate() {
    if (this.power >= 100) {
        this.power = 0;
        this.currentState = 'super';
        this.actionStartTime = Date.now();
        this.isAttacking = true;
        this.isCasting = true;
        this.castTimer = 60;
        const direction = this.isFacingLeft ? -1 : 1;

        if (this.character === 'chun-li') {
            // Kikosho: esfera gigante parada, dano em área
            const projX = this.x + direction * (this.width / 2 + 80);
            const projY = this.y - this.height * 0.7;
            const projectileColor = [100, 220, 255];
            const projectile = new Projectile(projX, projY, false, this.p, 30, projectileColor, 120, 'kikosho');
            projectile.vx = 0;
            projectile.owner = this;
            projectile.duration = 60; // frames
            projectiles.push(projectile);
            setTimeout(() => {
                this.isAttacking = false;
                this.isCasting = false;
                if (this.currentState === 'super' || this.currentState === 'special') {
                    this.currentState = 'idle';
                }
            }, 1500);
        } else if (this.character === 'ryu') {
            // Ryu: feixe contínuo (Shinku Hadouken)
            const projX = this.x + direction * (this.width / 2 + 40);
            const projY = this.y - this.height * 0.7;
            const color = [0, 220, 255];
            const size = 60;
            const damage = 3; // por frame
            const type = 'shinku-beam';
            // Cria um projétil especial de feixe contínuo
            const beam = new Projectile(projX, projY, direction < 0, this.p, damage, color, size, type);
            beam.vx = 0;
            beam.owner = this;
            beam.duration = 60; // dura 1 segundo (60 frames)
            beam.direction = direction;
            projectiles.push(beam);
            setTimeout(() => {
                this.isAttacking = false;
                this.isCasting = false;
                if (this.currentState === 'super' || this.currentState === 'special') {
                    this.currentState = 'idle';
                }
            }, 1200);
        } else {
            // Supers dos outros personagens (mantém o padrão)
            for (let i = -2; i <= 2; i++) {
                const projX = this.x + direction * (this.width / 2 + 40);
                const projY = this.y - this.height * 0.7 + (i * 20);
                let color = [255, 255, 0], size = 60, damage = 12, type = 'power';
                switch (this.character) {
                    case 'ken': color = [255, 150, 0]; size = 80; damage = 12; break;
                    case 'makoto': color = [180, 120, 40]; size = 90; damage = 15; break;
                }
                const proj = new Projectile(projX, projY, direction < 0, this.p, damage, color, size, type);
                proj.vx = direction > 0 ? 7 : -7;
                proj.owner = this;
                projectiles.push(proj);
            }
            setTimeout(() => {
                this.isAttacking = false;
                this.isCasting = false;
                if (this.currentState === 'super' || this.currentState === 'special') {
                    this.currentState = 'idle';
                }
            }, 1500);
        }
    }
}

    display() {
        try {
            const p = this.p;
            if (!p) return;
            if (isNaN(this.x) || isNaN(this.y)) {
                if (isNaN(this.x)) this.x = this.name === "Player 1" ? 200 : 600;
                if (isNaN(this.y)) this.y = 400;
            }
            let currentSprite = null;
            if (this.sprites) {
                // Animação de dano
                if (this.currentState === 'damage' && this.sprites.damage) {
                    currentSprite = this.sprites.damage;
                }
                // Animação de andar para trás
                else if (this.currentState === 'walking' && this.isWalkingBack && this.sprites.walkBack) {
                    currentSprite = this.sprites.walkBack;
                }
                // Demais estados
                else {
                    switch (this.currentState) {
                        case 'idle': currentSprite = this.sprites.idle; break;
                        case 'walking': currentSprite = this.sprites.walk; break;
                        case 'punching': currentSprite = this.sprites.punch; break;
                        case 'jumping': currentSprite = this.sprites.jump; break;
                        case 'crouching': currentSprite = this.sprites.crouch; break;
                        case 'blocking': currentSprite = this.sprites.block; break;
                        case 'intro': currentSprite = this.sprites.intro || this.sprites.idle; break;
                        case 'win': currentSprite = this.sprites.win || this.sprites.idle; break;
                        case 'lost': currentSprite = this.sprites.lost || this.sprites.damage; break;
                        case 'special': currentSprite = this.sprites.special; break;
                        case 'super': currentSprite = this.sprites.super || this.sprites.special; break;
                        default: currentSprite = this.sprites.idle;
                    }
                }
            }
            // Fallback: se o sprite não existir, desenha um retângulo colorido
            if (!currentSprite || !currentSprite.width || !currentSprite.height) {
                p.push();
                p.fill(this.name === "Player 1" ? p.color(255, 0, 0) : p.color(0, 0, 255));
                p.rect(this.x - this.width / 2, this.y - this.height, this.width, this.height);
                p.fill(255);
                p.textAlign(p.CENTER, p.CENTER);
                p.textSize(16);
                p.text(this.character ? this.character.toUpperCase() : this.name, this.x, this.y - this.height + 20);
                p.pop();
            } else {
                if (currentSprite.width > 0 && currentSprite.height > 0) {
                    p.push();
                    const spriteScale = 2.2;
                    if (this.isFacingLeft) {
                        p.translate(this.x, this.y);
                        p.scale(-spriteScale, spriteScale);
                        p.image(currentSprite, -currentSprite.width / 2, -currentSprite.height);
                    } else {
                        p.translate(this.x, this.y);
                        p.scale(spriteScale, spriteScale);
                        p.image(currentSprite, -currentSprite.width / 2, -currentSprite.height);
                    }
                    p.pop();
                } else {
                    p.push();
                    p.fill(this.name === "Player 1" ? p.color(255, 0, 0) : p.color(0, 0, 255));
                    p.rect(this.x - this.width / 2, this.y - this.height, this.width, this.height);
                    p.fill(255);
                    p.textAlign(p.CENTER, p.CENTER);
                    p.textSize(16);
                    p.text(this.character ? this.character.toUpperCase() : this.name, this.x, this.y - this.height + 20);
                    p.pop();
                }
            }
            // --- REMOVA O BLOCO DE DEBUG DAS HITBOXES ---
            // (Nada mais aqui)
        } catch (error) {
            console.error("Erro ao desenhar personagem:", error);
        }
    }
    update(opponent) {
        if (window.gameOver) return;
        if (isNaN(this.x) || isNaN(this.y) || isNaN(this.vx) || isNaN(this.vy)) {
            if (isNaN(this.x)) this.x = this.name === "Player 1" ? 200 : 600;
            if (isNaN(this.y)) this.y = 400;
            if (isNaN(this.vx)) this.vx = 0;
            if (isNaN(this.vy)) this.vy = 0;
        }
        this.handleMovement();
        this.checkSpecialMoves();
        if (this.isStunned) {
            this.vx *= 0.5;
        }
        if (Math.abs(this.vx) < 0.1) {
            this.vx = 0;
            if (this.onGround && this.currentState === 'walking') {
                this.currentState = 'idle';
            }
        }
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        if (this.x < 50) this.x = 50;
        if (this.x > 1000) this.x = 1000;
        if (this.y >= this.p.height - 20) { // chão
            this.y = this.p.height - 20;
            this.vy = 0;
            this.onGround = true;
            if (this.currentState === 'jumping') {
                this.currentState = 'idle';
            }
        }
        this.vx *= 0.8;
        if (this.attackTimer > 0) {
            this.attackTimer--;
            if (this.attackTimer === 0) {
                this.isAttacking = false;
                if (this.currentState === 'punching') {
                    this.currentState = 'idle';
                }
            }
        }
        if (this.currentState === 'punching' && !this._alreadyHit && opponent) {
            const attackBox = this.getAttackBox();
            const oppHitbox = opponent.getHitbox();
            if (attackBox && Fighter.rectsCollide(attackBox, oppHitbox)) {
                console.log(`[HIT] ${this.name} acertou ${opponent.name}! Vida antes: ${opponent.life}`);
                opponent.takeDamage(7, this.x < opponent.x ? 1 : -1);
                this.power += 10;
                console.log(`[HIT] ${opponent.name} vida depois: ${opponent.life}`);
                this._alreadyHit = true; // Evita múltiplos hits no mesmo ataque
            }
        }
        if (this.castTimer > 0) {
            this.castTimer--;
            if (this.castTimer === 0) {
                this.isCasting = false;
                if (this.currentState === 'special') {
                    this.currentState = 'idle';
                }
            }
        }
        if (this.stunTimer > 0) {
            this.stunTimer--;
            if (this.stunTimer === 0) {
                this.isStunned = false;
            }
        }
        if (this.lastDamageTimer > 0) {
            this.lastDamageTimer--;
        }
        if (this.damageAnimTimer > 0) {
            this.damageAnimTimer--;
            if (this.damageAnimTimer === 0) {
                if (this.currentState === 'damage') {
                    this.currentState = 'idle';
                }
            }
        }

        // DEBUG: Verifica colisão direta das hitboxes (corpos encostando)
        if (opponent) {
            const myHitbox = this.getHitbox();
            const oppHitbox = opponent.getHitbox();
            if (Fighter.rectsCollide(myHitbox, oppHitbox)) {
                console.log(`[DEBUG] ${this.name} e ${opponent.name} estão encostando!`);
            }

            // ...código de empurrão e direção...
            const myWidth = this.sprites && this.sprites.idle ? this.sprites.idle.width * 1.3 : 70;
            const oppWidth = opponent.sprites && opponent.sprites.idle ? opponent.sprites.idle.width * 1.3 : 70;
            const minDistance = (myWidth + oppWidth) / 3;
            const distance = Math.abs(this.x - opponent.x);
            if (distance < minDistance) {
                const overlap = minDistance - distance;
                const pushDirection = this.x < opponent.x ? -1 : 1;
                if (!this.isStunned && !opponent.isStunned) {
                    this.x += pushDirection * overlap / 2.5;
                    opponent.x -= pushDirection * overlap / 2.5;
                } else if (this.isStunned && !opponent.isStunned) {
                    this.x += pushDirection * overlap;
                } else if (!this.isStunned && opponent.isStunned) {
                    opponent.x -= pushDirection * overlap;
                }
                this.x = Math.max(myWidth / 2, Math.min(800 - myWidth / 2, this.x));
                opponent.x = Math.max(oppWidth / 2, Math.min(800 - oppWidth / 2, opponent.x));
            }
            if (!this.isAttacking && !this.isCasting) {
                this.isFacingLeft = opponent.x < this.x;
            }
        }
        if (!window.gameOver && this.power < this.powerMax && this.p.frameCount % 30 === 0) {
            this.power += 2;
        }
        this.updateKeyHistory();
        if (this.isCasting || this.isAttacking) {
            if (!this._animationSafetyTimer) this._animationSafetyTimer = 0;
            this._animationSafetyTimer++;
            if (this._animationSafetyTimer > 180) {
                this.isAttacking = false;
                this.isCasting = false;
                this.currentState = 'idle';
                this._animationSafetyTimer = 0;
            }
        } else {
            this._animationSafetyTimer = 0;
        }
    }
    handleMovement() {
        if (this.isAttacking || this.isCasting) return;
        if (window.keyState && window.keyState[this.moveKeys[0]]) {
            this.moveLeft();
            this.isWalkingBack = this.isFacingLeft ? false : true;
        }
        else if (window.keyState && window.keyState[this.moveKeys[1]]) {
            this.moveRight();
            this.isWalkingBack = this.isFacingLeft ? true : false;
        } else if (this.currentState === 'walking') {
            this.currentState = 'idle';
            this.isWalkingBack = false;
        }
        if (window.keyState && window.keyState[this.moveKeys[2]] && this.onGround) {
            this.jump();
        }
        if (window.keyState && window.keyState[this.moveKeys[3]]) {
            this.crouch();
        } else if (this.currentState === 'crouching') {
            this.currentState = 'idle';
        }
        if (window.keyState && window.keyState[this.attackKey]) {
            this.attack();
        }
        if (window.keyState && window.keyState[this.blockKey]) {
            this.block();
        } else {
            if (this.currentState === 'blocking') {
                this.currentState = 'idle';
            }
            this.isBlocking = false;
        }
    }
    checkSequence(sequence) {
        if (!sequence || !Array.isArray(sequence)) {
            return false;
        }
        let allPressed = true;
        for (let key of sequence) {
            if (!this.p.keyIsDown(keyCodeFromKey(key))) {
                allPressed = false;
                break;
            }
        }
        return allPressed;
    }
    updateKeyHistory() {
        if (!this.keyHistory) this.keyHistory = [];
        const relevantKeys = [...this.moveKeys, this.attackKey, this.blockKey];
        for (const key of relevantKeys) {
            if (window.keyState && window.keyState[key] && (!this.lastKeyPressed || this.lastKeyPressed !== key)) {
                this.keyHistory.push(key);
                this.lastKeyPressed = key;
                if (this.keyHistory.length > 10) {
                    this.keyHistory.shift();
                }
            } else if (!window.keyState || !window.keyState[key]) {
                this.lastKeyPressed = null;
            }
        }
    }
    checkSpecialMoves() {
        if (this.specialKeys && this.specialKeys.length > 0) {
            for (let key of this.specialKeys) {
                if (window.keyState && window.keyState[key]) {
                    this.castSpecial();
                    break;
                }
            }
        }
        if (this.ultimateKeys && this.ultimateKeys.length > 0) {
            for (let key of this.ultimateKeys) {
                if (window.keyState && window.keyState[key]) {
                    this.castUltimate();
                    break;
                }
            }
        }
        if (window.keyState && window.keyState[this.moveKeys[3]] && window.keyState[this.moveKeys[1]] && window.keyState[this.attackKey]) {
            this.hadouken();
        }
        if (this.power >= this.powerMax && window.keyState && window.keyState[this.moveKeys[3]] && window.keyState[this.moveKeys[0]] && window.keyState[this.attackKey]) {
            this.powerAttack();
        }
    }
}

// Adicione knockback visual e tela piscando ao acertar projéteis
class Projectile {
    constructor(x, y, isGoingLeft, p, damage = 15, color = [255, 255, 0], size = 30, type = 'hadouken') {
        this.x = x;
        this.y = y;
        this.isGoingLeft = isGoingLeft;
        this.vx = isGoingLeft ? -8 : 8;
        this.vy = 0;
        this.size = size;
        this.damage = damage;
        this.color = color;
        this.p = p;
        this.isActive = true;
        this.type = type;
        this.owner = null;
        this.isPowerAttack = false;
    }

    update() {
        if (!this.isActive) return;

        this.x += this.vx;
        this.y += this.vy;

         if (this.type === 'kikosho' || this.type === 'shinku-beam') {
        if (this.duration === undefined) this.duration = 60;
        this.duration--;
        if (this.duration <= 0) {
            this.isActive = false;
        }
    }
        // Check if out of bounds
        if (this.isOffScreen()) {
            this.isActive = false;
        }
    }

    display() {
        if (!this.isActive || !this.p) return;

    this.p.push();
    this.p.noStroke();

    if (this.type === 'kikoken') {
        // Kikoken: azul claro, menor, com cauda
        this.p.fill(this.color[0], this.color[1], this.color[2], 220);
        this.p.ellipse(this.x, this.y, this.size, this.size * 0.7);
        // Cauda
        this.p.noStroke();
        this.p.fill(this.color[0], this.color[1], this.color[2], 100);
        this.p.ellipse(this.x - (this.isGoingLeft ? -1 : 1) * this.size * 0.7, this.y, this.size * 0.8, this.size * 0.4);
        // Brilho
        this.p.fill(255, 255, 255, 120);
        this.p.ellipse(this.x, this.y, this.size * 0.4, this.size * 0.3);
    }
    else if (this.type === 'kikosho') {
        // Kikosho: esfera gigante azul clara, com brilho pulsante
        let pulse = 1 + 0.1 * Math.sin(this.p.frameCount * 0.4);
        this.p.fill(this.color[0], this.color[1], this.color[2], 120);
        this.p.ellipse(this.x, this.y, this.size * pulse, this.size * pulse);
        this.p.fill(255, 255, 255, 80);
        this.p.ellipse(this.x, this.y, this.size * 0.7 * pulse, this.size * 0.7 * pulse);
        // Efeito de energia
        for (let i = 0; i < 8; i++) {
            let angle = (Math.PI * 2 * i) / 8 + this.p.frameCount * 0.05;
            let ex = this.x + Math.cos(angle) * this.size * 0.7 * pulse;
            let ey = this.y + Math.sin(angle) * this.size * 0.7 * pulse;
            this.p.fill(this.color[0], this.color[1], this.color[2], 60);
            this.p.ellipse(ex, ey, this.size * 0.2, this.size * 0.2);
        }
    }
    else if (this.type === 'shinku-beam') {
        // Shinku Hadouken: feixe contínuo
        let beamLength = 400;
        let beamDir = this.direction || 1;
        this.p.fill(this.color[0], this.color[1], this.color[2], 120);
        this.p.rect(this.x, this.y - this.size / 2, beamLength * beamDir, this.size);
        this.p.fill(255, 255, 255, 80);
        this.p.rect(this.x, this.y - this.size / 4, beamLength * beamDir, this.size / 2);
    }

        this.p.push();
        this.p.noStroke();

        
        // Draw projectile based on type
        if (this.type === 'hadouken') {
            // Hadouken style - energy ball
            this.p.fill(this.color[0], this.color[1], this.color[2], 200);
            this.p.ellipse(this.x, this.y, this.size, this.size);

            // Inner glow
            this.p.fill(255, 255, 255, 150);
            this.p.ellipse(this.x, this.y, this.size * 0.6, this.size * 0.6);

            // Wave effect
            const waveSize = this.size * 1.2 * (1 + Math.sin(this.p.frameCount * 0.2) * 0.1);
            this.p.noFill();
            this.p.stroke(this.color[0], this.color[1], this.color[2], 100);
            this.p.strokeWeight(2);
            this.p.ellipse(this.x, this.y, waveSize, waveSize);
        }
        else if (this.type === 'power') {
            // Power attack - larger, more impressive
            // Outer glow
            this.p.fill(this.color[0], this.color[1], this.color[2], 100);
            this.p.ellipse(this.x, this.y, this.size * 1.5, this.size * 1.5);

            // Main body
            this.p.fill(this.color[0], this.color[1], this.color[2], 200);
            this.p.ellipse(this.x, this.y, this.size, this.size);

            // Inner core
            this.p.fill(255, 255, 255, 200);
            this.p.ellipse(this.x, this.y, this.size * 0.4, this.size * 0.4);

            // Particles
            for (let i = 0; i < 5; i++) {
                const angle = Math.random() * Math.PI * 2;
                const distance = Math.random() * (this.size / 2);
                // Optionally, you can add particle drawing here if needed
            }
        }
    }

    checkCollision(player) {
        if (!this.isActive || !player || this.owner === player) return false;
        // Hitbox cobre toda a altura do personagem adversário
        // Aumenta a largura da hitbox do projétil e do player para facilitar o acerto
        const projWidth = this.size * 1.5;
        const projHeight = this.size * 1.2;
        const projLeft = this.x - projWidth / 2;
        const projRight = this.x + projWidth / 2;
        const projTop = this.y - projHeight / 2;
        const projBottom = this.y + projHeight / 2;

        const playerWidth = player.width * 1.2;
        const playerLeft = player.x - playerWidth / 2;
        const playerRight = player.x + playerWidth / 2;
        const playerTop = player.y - player.height;
        const playerBottom = player.y;

        if (this.type === 'kikosho') {
        // Grande círculo de dano
        const dx = player.x - this.x;
        const dy = (player.y - player.height / 2) - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < this.size * 0.6) {
            player.takeDamage(player.isBlocking ? Math.floor(this.damage * 0.4) : this.damage, this.x < player.x ? 1 : -1);
            // Não desativa, dano contínuo
            return true;
        }
        return false;
    }
    if (this.type === 'shinku-beam') {
        // Feixe: retângulo longo
        let beamLength = 400;
        let beamDir = this.direction || 1;
        let left = this.x;
        let right = this.x + beamLength * beamDir;
        if (beamDir < 0) [left, right] = [right, left];
        const beamRect = {
            left: Math.min(left, right),
            right: Math.max(left, right),
            top: this.y - this.size / 2,
            bottom: this.y + this.size / 2
        };
        const playerRect = player.getHitbox();
        if (Fighter.rectsCollide(beamRect, playerRect)) {
            player.takeDamage(player.isBlocking ? Math.floor(this.damage * 0.4) : this.damage, beamDir);
            // Não desativa, dano contínuo
            return true;
        }
        return false;
    }
        if (
            projRight > playerLeft &&
            projLeft < playerRight &&
            projBottom > playerTop &&
            projTop < playerBottom
        ) {
            const knockbackDirection = this.isGoingLeft ? -1 : 1;
            // Dano do projétil
            player.takeDamage(
                player.isBlocking ? Math.floor(this.damage * 0.4) : this.damage,
                knockbackDirection * 2 // knockback mais forte para projétil
            );
            // Efeito de tela piscando/vermelha ao acertar
            if (window.effects) {
                window.effects.push({
                    x: this.x,
                    y: this.y,
                    type: player.isBlocking ? 'block' : 'hit',
                    timer: 15,
                    size: this.size * 1.5
                });
            }
            // Efeito de tela piscando
            const canvas = document.querySelector('canvas');
            if (canvas) {
                canvas.style.transition = 'none';
                canvas.style.filter = 'brightness(2) drop-shadow(0 0 20px #ff0000)';
                setTimeout(() => {
                    canvas.style.transition = 'filter 0.2s';
                    canvas.style.filter = '';
                }, 80);
            }
            this.isActive = false;
            return true;
        }
        return false;
    }

    isOffScreen() {
        return this.x < -50 || this.x > this.p.width + 50;
    }
}



// Inicializa o p5
new p5(sketch);