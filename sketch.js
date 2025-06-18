// Variáveis globais
let sprites = {
    ryu: {},
    ken: {},
    chun: {},
    makoto: {}
};

// Array para armazenar os backgrounds
let backgrounds = [];
let selectedBg; // Armazenará o background selecionado aleatoriamente

let spritesLoaded = false;
let isPaused = false;
let player1, player2;
let projectiles = [];
let powerMax = 100;
let gameTime = 99;
let gameTimer = 0;
let gameOver = false;
let winner = null;
let roundTime = 60; // segundos por round
let gameStarted = false; // Para controlar a introdução
let introTimer = 0;
let introTime = 3000; // 3 segundos de introdução

// Função auxiliar para converter teclas
function keyCodeFromKey(key) {
    switch(key) {
        case 'LEFT_ARROW': return 37;
        case 'RIGHT_ARROW': return 39;
        case 'UP_ARROW': return 38;
        case 'DOWN_ARROW': return 40;
        default: return key.charCodeAt(0);
    }
}

// Classe Projectile
class Projectile {
    constructor(x, y, vx, vy, size, damage, color, owner, isPowerAttack) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.size = size;
        this.damage = damage;
        this.color = color;
        this.owner = owner;
        this.p = owner.p;
        this.isPowerAttack = isPowerAttack;
        this.active = true;
        this.maxWidth = this.p.width;
        this.growSpeed = 20;
    }

    update() {
        if (this.isPowerAttack) {
            if (this.size < this.maxWidth) {
                this.size += this.growSpeed;
            }
        } else {
            this.x += this.vx;
            this.y += this.vy;
        }

        // Verificar colisão com oponente
        let target = this.owner === player1 ? player2 : player1;
        if (this.checkCollision(target)) {
            if (!target.isBlocking) {
                target.takeDamage(this.damage, Math.sign(this.vx));
            }
            this.active = false;
        }

        // Verificar limites da tela
        if (this.x < 0 || this.x > this.p.width || this.y < 0 || this.y > this.p.height) {
            this.active = false;
        }
    }

    checkCollision(target) {
        return this.x > target.x - target.w/2 &&
               this.x < target.x + target.w/2 &&
               this.y > target.y - target.h &&
               this.y < target.y;
    }

    display() {
        this.p.push();
        this.p.fill(this.color[0], this.color[1], this.color[2]);
        
        if (this.isPowerAttack) {
            this.p.rect(this.x - this.size/2, this.y - 200, this.size, 400);
        } else {
            this.p.ellipse(this.x, this.y, this.size);
        }
        
        this.p.pop();
    }
}

// Classe Fighter
class Fighter {
    constructor(x, y, name, moveKeys, attackKey, blockKey, hadoukenSeq, powerSeq, p, charConfig, charTypeSprite) {
        this.x = x;
        this.y = y;
        this.name = name;
        this.p = p;
        this.charType = charConfig.name.toLowerCase();
        this.charTypeSprite = charTypeSprite || this.charType;
        this.spriteColor = charConfig.color;
        
        // Propriedades físicas
        this.w = 80;
        this.h = 120;
        this.vx = 0;
        this.vy = 0;
        this.gravity = 0.8;
        this.jumpForce = -12;
        this.moveSpeed = 5;
        this.onGround = true;
        this.facingDirection = name === 'Player 1' ? 1 : -1;
        
        // Status
        this.life = 100;
        this.maxLife = 100;
        this.power = 0;
        this.powerMax = 100;
        this.attackPower = 8;
        
        // Estados
        this.isAttacking = false;
        this.isCasting = false;
        this.isBlocking = false;
        this.isCrouching = false;
        this.isStunned = false;
        this.currentState = 'intro'; // Começa com introdução
        
        // Timers
        this.attackTimer = 0;
        this.castTimer = 0;
        this.stunTimer = 0;
        this.lastDamageTimer = 0;
        this.animationTimer = 0;
        
        // Controles - agora com tecla de bloqueio personalizada
        this.moveKeys = moveKeys;
        this.attackKey = attackKey;
        this.blockKey = blockKey; // Tecla específica para bloqueio
        this.hadoukenSeq = hadoukenSeq;
        this.powerSeq = powerSeq;
        
        // Combos e sequências
        this.keySequence = [];
        this.sequenceTimer = 0;
    }

    handleMovement() {
        if (this.isStunned || this.currentState === 'intro') return;
        
        // Verificar bloqueio com a tecla específica do jogador
        if (this.p.keyIsDown(keyCodeFromKey(this.blockKey))) {
            this.isBlocking = true;
            
            if (!this.isAttacking && !this.isCasting) {
                this.currentState = 'blocking';
            }
            
            if (Math.abs(this.vx) > 0.1) {
                this.vx *= 0.7;
            }
            return;
        } else {
            this.isBlocking = false;
        }
        
        if (this.currentState === 'blocking') {
            this.currentState = 'standing';
        }
        
        // Movimento horizontal
        if (this.p.keyIsDown(keyCodeFromKey(this.moveKeys[0]))) {
            this.vx = -this.moveSpeed;
            this.facingDirection = -1;
            if (this.onGround) this.currentState = 'walking';
        } else if (this.p.keyIsDown(keyCodeFromKey(this.moveKeys[1]))) {
            this.vx = this.moveSpeed;
            this.facingDirection = 1;
            if (this.onGround) this.currentState = 'walking';
        } else if (Math.abs(this.vx) < 0.1) {
            if (this.onGround && !this.isCrouching && !this.isAttacking && !this.isCasting) {
                this.currentState = 'standing';
            }
        }

        // Pulo - não pode pular enquanto bloqueia
        if (this.p.keyIsDown(keyCodeFromKey(this.moveKeys[2])) && this.onGround && !this.isBlocking) {
            this.vy = this.jumpForce;
            this.onGround = false;
            this.currentState = 'jumping';
        }

        // Agachar - pode agachar e bloquear ao mesmo tempo (bloqueio agachado)
        if (this.p.keyIsDown(keyCodeFromKey(this.moveKeys[3]))) {
            this.isCrouching = true;
            
            // Se não estiver bloqueando, define o estado como agachado
            if (!this.isBlocking) {
                this.currentState = 'crouching';
            }
            // Se estiver bloqueando, mantém o estado de bloqueio
        } else {
            this.isCrouching = false;
        }
    }

    checkSequence(sequence) {
        let allPressed = true;
        for (let key of sequence) {
            if (!this.p.keyIsDown(keyCodeFromKey(key))) {
                allPressed = false;
                break;
            }
        }
        return allPressed;
    }

    attack() {
        // Não pode atacar enquanto bloqueia
        if (this.isAttacking || this.isCasting || this.isBlocking || this.currentState === 'intro') return;

        this.isAttacking = true;
        this.attackTimer = 20;
        this.currentState = 'punching'; // Estado de soco
        this.animationTimer = 20; // Duração da animação

        let opponent = this === player1 ? player2 : player1;
        let distance = Math.abs(this.x - opponent.x);
        
        if (distance <= 70) {
            if ((this.facingDirection > 0 && this.x < opponent.x) ||
                (this.facingDirection < 0 && this.x > opponent.x)) {
                
                // Verificar se o oponente está agachado - o ataque normal não acerta inimigos agachados
                let canHit = !opponent.isCrouching;
                
                // Socos aéreos podem acertar oponentes agachados
                if (!this.onGround) {
                    canHit = true;
                }
                
                if (canHit) {
                    let damage = this.attackPower;
                    // Se o oponente estiver bloqueando, o dano já será reduzido no método takeDamage
                    opponent.takeDamage(damage, this.facingDirection);
                    // Ganhar power ao acertar um golpe
                    this.power = Math.min(this.power + 8, this.powerMax);
                }
            }
        }
    }

    hadouken() {
        if (this.isAttacking || this.isCasting || this.power < 25 || this.currentState === 'intro') return;

        this.isCasting = true;
        this.castTimer = 25;
        this.currentState = 'special'; // Estado de ataque especial
        this.animationTimer = 25; // Duração da animação

        // Projéteis específicos por personagem
        switch(this.charType) {
            case 'ken':
                // Triple fireball
                for(let i = -1; i <= 1; i++) {
                    projectiles.push(new Projectile(
                        this.x + (this.facingDirection * 40),
                        this.y - this.h/2 + (i * 15),
                        8 * this.facingDirection,
                        i,
                        25,
                        6,
                        [255, 100, 0],
                        this,
                        false
                    ));
                }
                break;
                
            case 'chun-li':
                // Fast kikoken
                projectiles.push(new Projectile(
                    this.x + (this.facingDirection * 40),
                    this.y - this.h/2,
                    10 * this.facingDirection,
                    0,
                    20,
                    8,
                    [0, 200, 255],
                    this,
                    false
                ));
                break;
                
            case 'makoto':
                // Hayate
                this.vx = this.facingDirection * 15; // Dash forward
                setTimeout(() => {
                    if (this.x > 0 && this.x < this.p.width) {
                        projectiles.push(new Projectile(
                            this.x + (this.facingDirection * 30),
                            this.y - this.h/2,
                            0,
                            0,
                            60,
                            10,
                            [200, 100, 0],
                            this,
                            false
                        ));
                    }
                }, 200);
                break;
                
            default: // Ryu
                projectiles.push(new Projectile(
                    this.x + (this.facingDirection * 40),
                    this.y - this.h/2,
                    7 * this.facingDirection,
                    0,
                    30,
                    10,
                    [60, 170, 255],
                    this,
                    false
                ));
        }

        this.power -= 25;
    }

    powerAttack() {
        if (this.isAttacking || this.isCasting || this.power < this.powerMax || this.currentState === 'intro') return;

        this.isCasting = true;
        this.castTimer = 40;
        this.currentState = 'special'; // Estado de ataque especial
        this.animationTimer = 40; // Duração da animação longa

        // Super ataques específicos
        switch(this.charType) {
            case 'ken':
                // Shoryuken
                this.vy = -15;
                for(let i = 0; i < 5; i++) {
                    setTimeout(() => {
                        projectiles.push(new Projectile(
                            this.x,
                            this.y - this.h/2,
                            (Math.random() - 0.5) * 6,
                            -Math.random() * 8,
                            40,
                            15,
                            [255, 50, 0],
                            this,
                            false
                        ));
                    }, i * 100);
                }
                break;
                
            case 'chun-li':
                // Lightning legs
                for(let i = 0; i < 8; i++) {
                    setTimeout(() => {
                        projectiles.push(new Projectile(
                            this.x + (this.facingDirection * 20),
                            this.y - this.h/2,
                            8 * this.facingDirection,
                            (Math.random() - 0.5) * 4,
                            15,
                            8,
                            [0, 255, 255],
                            this,
                            false
                        ));
                    }, i * 50);
                }
                break;
                
            case 'makoto':
                // Tanden Renki
                this.attackPower *= 2; // Dobra o poder de ataque temporariamente
                setTimeout(() => {
                    this.attackPower /= 2; // Retorna ao normal após 5 segundos
                }, 5000);
                
                // Efeito visual
                for(let i = 0; i < 10; i++) {
                    setTimeout(() => {
                        projectiles.push(new Projectile(
                            this.x,
                            this.y - this.h/2,
                            (Math.random() - 0.5) * 8,
                            (Math.random() - 0.5) * 8,
                            30,
                            0, // Sem dano, apenas visual
                            [255, 165, 0],
                            this,
                            false
                        ));
                    }, i * 80);
                }
                break;
                
            default: // Ryu
                // Beam attack
                projectiles.push(new Projectile(
                    this.x,
                    this.y - this.h/2,
                    0,
                    0,
                    400,
                    30,
                    [100, 200, 255],
                    this,
                    true
                ));
        }

        this.power = 0;
    }

    takeDamage(amount, direction) {
        // Diferenciar bloqueio em pé e agachado
        if (this.isBlocking) {
            // Bloqueio reduz o dano em 70%
            amount *= 0.3;
            
            // Efeito de vibração leve ao bloquear
            this.vx += direction * 1;
            
            // Ganhar um pouco de power por bloquear com sucesso
            this.power = Math.min(this.power + amount * 0.5, this.powerMax);
            
            // Manter o estado de bloqueio
            // não mudar para o estado de dano
        } else {
            // Se não estiver bloqueando, mudar para o estado de dano
            this.currentState = 'damage';
            this.isStunned = true;
            this.stunTimer = 10;
            
            // Knockback mais forte
            this.vx += direction * 3;
            if (this.onGround) {
                this.vy = -2;
            }
            
            // Ganhar mais power ao tomar dano sem bloqueio
            this.power = Math.min(this.power + amount * 0.8, this.powerMax);
        }
        
        this.life = Math.max(0, this.life - amount);
        this.lastDamageTimer = 15;
        
        // Verificar se morreu
        if (this.life <= 0) {
            this.life = 0;
            gameOver = true;
            winner = this === player1 ? 'Player 2' : 'Player 1';
        }
    }

    display() {
        this.p.push();
        
        // Efeito de damage
        if (this.lastDamageTimer > 0) {
            this.p.tint(255, 150, 150);
        }
        
        // Tentar usar sprites se disponíveis
        let charSprites = sprites[this.charTypeSprite];
        let currentSprite = null;
        
        if (charSprites && spritesLoaded) {
            switch(this.currentState) {
                case 'intro':
                    currentSprite = charSprites.intro || charSprites.standing;
                    break;
                case 'walking':
                    currentSprite = charSprites.walking;
                    break;
                case 'jumping':
                    currentSprite = charSprites.jumping;
                    break;
                case 'crouching':
                    currentSprite = charSprites.crouching;
                    break;
                case 'damage':
                    currentSprite = charSprites.damage;
                    break;
                case 'punching':
                    currentSprite = charSprites.punch || charSprites.standing;
                    break;
                case 'special':
                    currentSprite = charSprites.special || charSprites.standing;
                    break;
                case 'blocking':
                    currentSprite = charSprites.block || charSprites.standing;
                    break;
                default:
                    currentSprite = charSprites.standing;
            }
        }

        if (currentSprite && currentSprite.width > 0) {
            this.p.imageMode(this.p.CENTER);
            
            // Ajustar posição vertical quando agachado
            let verticalOffset = 0;
            if (this.currentState === 'crouching' || (this.currentState === 'blocking' && this.isCrouching)) {
                verticalOffset = 20;
            }
            
            if (this.facingDirection < 0) {
                this.p.scale(-1, 1);
                this.p.image(currentSprite, -this.x, this.y - this.h/2 + verticalOffset);
            } else {
                this.p.image(currentSprite, this.x, this.y - this.h/2 + verticalOffset);
            }
        } else {
            // Fallback para retângulo
            this.p.fill(this.spriteColor[0], this.spriteColor[1], this.spriteColor[2]);
            this.p.rectMode(this.p.CENTER);
            
            if (this.isCrouching) {
                this.p.rect(this.x, this.y - this.h/3, this.w, this.h * 0.7);
            } else {
                this.p.rect(this.x, this.y - this.h/2, this.w, this.h);
            }
        }
        
        this.p.noTint();
        
        // Efeito visual de bloqueio (apenas se não tivermos a sprite de bloco ou como reforço visual)
        if (this.isBlocking) {
            this.p.noFill();
            this.p.stroke(0, 255, 255);
            this.p.strokeWeight(3);
            
            if (this.isCrouching) {
                // Bloqueio baixo
                this.p.rect(this.x, this.y - this.h/3, this.w + 15, this.h * 0.7 + 15);
            } else {
                // Bloqueio em pé
                this.p.rect(this.x, this.y - this.h/2, this.w + 15, this.h + 15);
            }
            
            // Adicionando um pequeno flash quando o bloqueio está ativo
            if (this.p.frameCount % 10 < 5) {
                this.p.stroke(100, 255, 255, 150);
                this.p.strokeWeight(5);
                if (this.isCrouching) {
                    this.p.rect(this.x, this.y - this.h/3, this.w + 20, this.h * 0.7 + 20);
                } else {
                    this.p.rect(this.x, this.y - this.h/2, this.w + 20, this.h + 20);
                }
            }
        }

        // Efeitos visuais - ataque na altura média
        if (this.isAttacking) {
            this.p.fill(255, 255, 0, 150);
            // Posicionar o efeito de ataque na altura do corpo (não abaixo)
            this.p.rect(this.x + (this.facingDirection * 40), this.y - this.h/2, 35, 50);
        }
        
        if (this.isCasting) {
            this.p.fill(255, 255, 255, 100);
            this.p.ellipse(this.x + (this.facingDirection * 30), this.y - this.h/2, 40, 40);
        }

        this.p.pop();
    }

    update(opponent) {
        if (gameOver) return;
        
        // Atualizar timers
        if (this.lastDamageTimer > 0) {
            this.lastDamageTimer--;
            if (this.lastDamageTimer <= 0 && this.currentState === 'damage') {
                // Se não estiver bloqueando, volta ao estado normal após o dano
                if (!this.isBlocking) {
                    this.currentState = 'standing';
                } else {
                    // Se estiver bloqueando, volta ao estado de bloqueio
                    this.currentState = 'blocking';
                }
            }
        }
        
        if (this.stunTimer > 0) {
            this.stunTimer--;
            if (this.stunTimer <= 0) {
                this.isStunned = false;
            }
        }
        
        // Animação de introdução
        if (this.currentState === 'intro') {
            if (!gameStarted) return;
            
            if (this.p.millis() - introTimer > introTime) {
                this.currentState = 'standing';
            }
            return;
        }
        
        // Atualizar timer de animação
        if (this.animationTimer > 0) {
            this.animationTimer--;
            if (this.animationTimer <= 0) {
                // Retornar ao estado normal ou de bloqueio após a animação
                if ((this.currentState === 'punching' || this.currentState === 'special')) {
                    if (this.isBlocking) {
                        this.currentState = 'blocking';
                    } else {
                        this.currentState = 'standing';
                    }
                }
            }
        }
        
        if (!this.isStunned) {
            // Movimento e bloqueio
            this.handleMovement();
            
            // Verificar ataques - não pode atacar enquanto bloqueia
            if (this.p.keyIsDown(keyCodeFromKey(this.attackKey)) && !this.isBlocking) {
                this.attack();
            }
            
            // Verificar sequências de habilidades - não pode usar enquanto bloqueia
            if (!this.isBlocking) {
                if (this.checkSequence(this.hadoukenSeq)) {
                    this.hadouken();
                }
                if (this.checkSequence(this.powerSeq)) {
                    this.powerAttack();
                }
            }
        }
        
        // Física
        if (!this.onGround) {
            this.vy += this.gravity;
        }
        
        this.x += this.vx;
        this.y += this.vy;

        // Limites da tela horizontais
        this.x = Math.max(this.w/2, Math.min(this.p.width - this.w/2, this.x));

        // Colisão com o chão - ajustada para a altura correta
        const FLOOR_HEIGHT = this.p.height - 20; // Mesma altura do chão
        
        if (this.y >= FLOOR_HEIGHT) {
            this.y = FLOOR_HEIGHT;
            this.vy = 0;
            this.onGround = true;
            if (this.currentState === 'jumping') {
                if (this.isBlocking) {
                    this.currentState = 'blocking';
                } else {
                    this.currentState = 'standing';
                }
            }
        } else {
            this.onGround = false;
        }

        // Atrito mais forte para evitar deslizamento
        if (this.onGround) {
            this.vx *= 0.8;
            if (Math.abs(this.vx) < 0.1) {
                this.vx = 0;
            }
        }

        // Timers de ataque
        if (this.attackTimer > 0) this.attackTimer--;
        if (this.castTimer > 0) this.castTimer--;
        
        if (this.attackTimer <= 0) this.isAttacking = false;
        if (this.castTimer <= 0) this.isCasting = false;
        
        // Atualizar hitbox
        if (this.isCrouching) {
            this.h = 80; // Menor altura quando agachado
        } else {
            this.h = 120; // Altura normal
        }
    }
}

// Sketch principal
const sketch = (p) => {
    p.preload = function() {
        // Carregar sprites dos personagens (código existente...)
        // Ryu sprites
        sprites.ryu.standing = p.loadImage('Sprites/Ryu Standing.gif');
        sprites.ryu.walking = p.loadImage('Sprites/Ryu Walking.gif');
        sprites.ryu.jumping = p.loadImage('Sprites/Ryu Jump.gif');
        sprites.ryu.crouching = p.loadImage('Sprites/Ryu Crouch.gif');
        sprites.ryu.damage = p.loadImage('Sprites/Ryu Damage.gif');
        sprites.ryu.punch = p.loadImage('Sprites/Ryu Punch.gif');
        sprites.ryu.special = p.loadImage('Sprites/Ryu Special.gif');
        sprites.ryu.block = p.loadImage('Sprites/Ryu Block.gif');

        // Ken sprites
        sprites.ken.standing = p.loadImage('Sprites/Ken Standing.gif');
        sprites.ken.walking = p.loadImage('Sprites/Ken Walking.gif');
        sprites.ken.jumping = p.loadImage('Sprites/Ken Jump.gif');
        sprites.ken.crouching = p.loadImage('Sprites/Ken Crouch.gif');
        sprites.ken.damage = p.loadImage('Sprites/Ken Damage.gif');
        sprites.ken.punch = p.loadImage('Sprites/Ken Punch.gif');
        sprites.ken.special = p.loadImage('Sprites/Ken Special.gif');
        sprites.ken.intro = p.loadImage('Sprites/Ken Intro.gif');
        sprites.ken.block = p.loadImage('Sprites/Ken Block.gif');

        // Chun-Li sprites
        sprites.chun.standing = p.loadImage('Sprites/Chun Standing.gif');
        sprites.chun.walking = p.loadImage('Sprites/Chun Walking.gif');
        sprites.chun.jumping = p.loadImage('Sprites/Chun Jump.gif');
        sprites.chun.crouching = p.loadImage('Sprites/Chun Crouch.gif');
        sprites.chun.damage = p.loadImage('Sprites/Chun Damage.gif');
        sprites.chun.punch = p.loadImage('Sprites/Chun Punch.gif');
        sprites.chun.special = p.loadImage('Sprites/Chun Special.gif');
        sprites.chun.intro = p.loadImage('Sprites/Chun Intro.gif');
        sprites.chun.block = p.loadImage('Sprites/Chun Block.gif');

        // Makoto sprites
        sprites.makoto.standing = p.loadImage('Sprites/Makoto Standing.gif');
        sprites.makoto.walking = p.loadImage('Sprites/Makoto Walking.gif');
        sprites.makoto.jumping = p.loadImage('Sprites/Makoto Jump.gif');
        sprites.makoto.crouching = p.loadImage('Sprites/Makoto Crouch.gif');
        sprites.makoto.damage = p.loadImage('Sprites/Makoto Damage.gif');
        sprites.makoto.punch = p.loadImage('Sprites/Makoto Punch.gif');
        sprites.makoto.special = p.loadImage('Sprites/Makoto Special.gif');
        sprites.makoto.intro = p.loadImage('Sprites/Makoto Intro.gif');
        sprites.makoto.block = p.loadImage('Sprites/Makoto Block.gif');

        // Carregar os 6 backgrounds
        backgrounds[0] = p.loadImage('Sprites/BG1.gif');
        backgrounds[1] = p.loadImage('Sprites/BG2.gif');
        backgrounds[2] = p.loadImage('Sprites/BG3.gif');
        backgrounds[3] = p.loadImage('Sprites/BG4.gif');
        backgrounds[4] = p.loadImage('Sprites/BG5.gif');
        backgrounds[5] = p.loadImage('Sprites/BG6.gif');
    };

    p.setup = function() {
        p.createCanvas(800, 400);
        
        // Selecionar um background aleatoriamente
        let randomIndex = Math.floor(p.random(0, backgrounds.length));
        selectedBg = backgrounds[randomIndex];
        
        // Obter personagens selecionados
        let char1 = window.selectedPlayer1 || CHARACTERS.ryu;
        let char2 = window.selectedPlayer2 || CHARACTERS.ken;

        // Ajustar para usar os nomes dos arquivos
        let char1Type = char1.name.toLowerCase();
        let char2Type = char2.name.toLowerCase();
        
        // Converter 'chun-li' para 'chun' para corresponder aos nomes de arquivo
        if (char1Type === 'chun-li') char1Type = 'chun';
        if (char2Type === 'chun-li') char2Type = 'chun';

        // Altura do chão ajustada
        const FLOOR_HEIGHT = p.height - 20;

        player1 = new Fighter(
            150, FLOOR_HEIGHT, 'Player 1',  // Posição Y ajustada para tocar o chão
            ['A', 'D', 'W', 'S'], 'F', 'C', // 'C' como tecla de bloqueio para P1
            ['Q', 'E'], ['R', 'T'],
            p, char1, char1Type
        );

        player2 = new Fighter(
            650, FLOOR_HEIGHT, 'Player 2',  // Posição Y ajustada para tocar o chão
            ['LEFT_ARROW', 'RIGHT_ARROW', 'UP_ARROW', 'DOWN_ARROW'], 'L', 'M', // 'M' como tecla de bloqueio para P2
            ['U', 'I'], ['J', 'K'],
            p, char2, char2Type
        );

        spritesLoaded = true;
        
        // Iniciar a sequência de introdução
        player1.currentState = 'intro';
        player2.currentState = 'intro';
        introTimer = p.millis();
        
        // Adiar o início do jogo real
        setTimeout(() => {
            gameStarted = true;
            gameTimer = p.millis();
        }, 1000);
    };
    
    p.draw = function() {
        // Desenhar o background selecionado
        if (selectedBg && selectedBg.width > 0) {
            p.image(selectedBg, 0, 0, p.width, p.height);
        } else {
            p.background(135, 206, 235);
            p.fill(34, 139, 34);
            p.rect(0, p.height - 20, p.width, 20);
        }

        // Desenhar uma linha de chão sutil se necessário para ver o limite
        p.stroke(255, 255, 255, 50);
        p.line(0, p.height - 20, p.width, p.height - 20);
        p.noStroke();

        // Só atualizar se não estiver pausado e não for game over
        if (!isPaused && !gameOver) {
            // Atualizar timer depois que a intro terminar
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

                // Atualizar jogadores
                player1.update(player2);
                player2.update(player1);

                // Atualizar projéteis
                for (let i = projectiles.length - 1; i >= 0; i--) {
                    let proj = projectiles[i];
                    if (proj.active) {
                        proj.update();
                        proj.display();
                    } else {
                        projectiles.splice(i, 1);
                    }
                }
            } else {
                // Durante a intro, apenas exibir os jogadores sem atualizar mecânicas
                player1.update(player2);
                player2.update(player1);
            }
        }

        // Sempre desenhar jogadores (mesmo pausado)
        player1.display();
        player2.display();

        // UI
        drawUI();
    };

    function drawUI() {
        // Round intro
        if (gameStarted && p.millis() - introTimer <= introTime) {
            p.textAlign(p.CENTER);
            p.textSize(48);
            p.fill(255, 255, 0);
            p.text('ROUND 1', p.width/2, p.height/2 - 40);
            p.textSize(32);
            p.text('FIGHT!', p.width/2, p.height/2 + 20);
            return;
        }

        // Timer
        p.textAlign(p.CENTER);
        p.textSize(32);
        p.fill(255);
        p.text(gameTime, p.width/2, 40);

        // Barras de vida
        p.fill(255, 0, 0);
        p.rect(50, 20, (player1.life / player1.maxLife) * 250, 25);
        p.rect(p.width - 300, 20, (player2.life / player2.maxLife) * 250, 25);

        // Molduras das barras de vida
        p.noFill();
        p.stroke(255);
        p.strokeWeight(2);
        p.rect(50, 20, 250, 25);
        p.rect(p.width - 300, 20, 250, 25);

        // Barras de poder
        p.fill(0, 255, 255);
        p.rect(50, 50, (player1.power / player1.powerMax) * 250, 15);
        p.rect(p.width - 300, 50, (player2.power / player2.powerMax) * 250, 15);

        // Molduras das barras de poder
        p.noFill();
        p.rect(50, 50, 250, 15);
        p.rect(p.width - 300, 50, 250, 15);

        // Nomes dos jogadores
        p.textAlign(p.LEFT);
        p.textSize(16);
        p.fill(255);
        p.text(player1.name, 50, 15);
        p.textAlign(p.RIGHT);
        p.text(player2.name, p.width - 50, 15);

        // PAUSADO - mostrar primeiro
        if (isPaused) {
            p.fill(0, 0, 0, 150);
            p.rect(0, 0, p.width, p.height);
            p.textAlign(p.CENTER);
            p.textSize(48);
            p.fill(255, 255, 0);
            p.text('PAUSED', p.width/2, p.height/2);
            p.textSize(16);
            p.fill(255);
            p.text('Press P to resume', p.width/2, p.height/2 + 40);
        }

        // Game Over - mostrar por último
        if (gameOver) {
            p.fill(0, 0, 0, 150);
            p.rect(0, 0, p.width, p.height);
            p.textAlign(p.CENTER);
            p.textSize(48);
            p.fill(255, 255, 0);
            p.text('GAME OVER', p.width/2, p.height/2 - 50);
            p.textSize(32);
            p.text(winner + ' WINS!', p.width/2, p.height/2);
            p.textSize(16);
            p.fill(255);
            p.text('Press R to restart', p.width/2, p.height/2 + 40);
        }
    }

    // Reiniciar o jogo com um novo background aleatório
    function restartGame() {
        // Selecionar um novo background aleatoriamente
        let randomIndex = Math.floor(p.random(0, backgrounds.length));
        selectedBg = backgrounds[randomIndex];
        
        // Resetar estados do jogo
        player1.life = 100;
        player2.life = 100;
        player1.power = 0;
        player2.power = 0;
        player1.x = 150;
        player2.x = 650;
        player1.y = FLOOR_HEIGHT;  // Ajustar para a altura do chão
        player2.y = FLOOR_HEIGHT;  // Ajustar para a altura do chão
        player1.vx = 0;
        player1.vy = 0;
        player2.vx = 0;
        player2.vy = 0;
        gameTime = 99;
        gameOver = false;
        winner = null;
        projectiles = [];
        
        // Reiniciar sequência de introdução
        player1.currentState = 'intro';
        player2.currentState = 'intro';
        introTimer = p.millis();
        gameStarted = false;
        
        setTimeout(() => {
            gameStarted = true;
            gameTimer = p.millis();
        }, 1000);
    }

    p.keyPressed = function() {
        // Pausar/Despausar
        if (p.key === 'p' || p.key === 'P') {
            isPaused = !isPaused;
        }
        
        // Restart apenas se game over
        if ((p.key === 'r' || p.key === 'R') && gameOver) {
            restartGame();
        }
    };
};