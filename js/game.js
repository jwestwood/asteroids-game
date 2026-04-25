import { dist, wrap } from './utils.js';
import { Asteroid } from './asteroids.js';
import { Bullet } from './bullets.js';
import { createExplosion } from './particles.js';
import { PowerUp, getAllPowerupTypes, PowerupTypes } from './powerups.js';
import { keys } from './input.js';
export { keys };

const POWERUP_SPAWN_MIN = 300;
const POWERUP_SPAWN_MAX = 1200;
const SHIELD_RADIUS = 80;
const SHIP_RESPAWN_TIME = 120;
const SHIP_INVINCIBLE_TIME = 180;
const MAX_BULLET_LIFE_NORMAL = 50;
const MAX_BULLET_LIFE_LONG = 200;

export class GameState {
    constructor() {
        this.ship = {
            x: 0, y: 0, vx: 0, vy: 0,
            angle: -Math.PI / 2, radius: 18,
            alive: true, invincible: 0, respawn: 0,
        };
        this.asteroids = [];
        this.bullets = [];
        this.particles = [];
        this.powerups = [];
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.fireCooldown = 0;
        this.powerupTimer = 0;
        this.powerupNext = POWERUP_SPAWN_MIN + Math.floor(Math.random() * (POWERUP_SPAWN_MAX - POWERUP_SPAWN_MIN));
        this.activePowerups = { rapidFire: 0, splitShot: 0, longRange: 0, shield: 0 };
        this.gameOver = false;
        this.gameStarted = false;
    }

    resetGame(W, H) {
        this.ship.x = W() / 2;
        this.ship.y = H() / 2;
        this.ship.vx = this.ship.vy = 0;
        this.ship.angle = -Math.PI / 2;
        this.ship.alive = true;
        this.ship.invincible = SHIP_INVINCIBLE_TIME;
        this.resetLevel(W, H);
    }

    resetLevel(W, H) {
        this.asteroids = [];
        this.bullets = [];
        this.particles = [];
        this.ship.invincible = SHIP_INVINCIBLE_TIME;
        this.spawnAsteroids(3 + this.level, 50, W, H);
    }

    spawnAsteroids(count, size, W, H) {
        for (let i = 0; i < count; i++) {
            let x, y;
            do { x = Math.random() * W(); y = Math.random() * H(); }
            while (dist({ x, y }, this.ship) < 150);
            const sp = (1 + Math.random() * 1.5) * (1 + this.level * 0.15);
            const a = Math.random() * Math.PI * 2;
            const isClusteroid = this.level >= 2 && Math.random() < 0.25;
            this.asteroids.push(new Asteroid(x, y, Math.cos(a) * sp, Math.sin(a) * sp, size, isClusteroid));
        }
        if (this.level >= 3) {
            for (let i = 0; i < Math.floor(this.level / 3); i++) {
                let x, y;
                do { x = Math.random() * W(); y = Math.random() * H(); }
                while (dist({ x, y }, this.ship) < 150);
                const sp = 3 + Math.random() * 2;
                const a = Math.random() * Math.PI * 2;
                this.asteroids.push(new Asteroid(x, y, Math.cos(a) * sp, Math.sin(a) * sp, size, false, true));
            }
        }
    }

    isControlEnabled () {
        return this.gameStarted && !this.gameOver && this.ship.alive;
    }

    update(W, H) {
        if (!this.gameStarted) return;

        this.updateRespawn(W, H);
        this.updateShipMovement();
        this.updateShipPosition(W, H);
        this.handleFiring();
        this.updateBullets(W, H);
        this.updateAsteroids(W, H);
        this.updateParticles();
        this.updatePowerupSpawning(W, H);
        this.updatePowerupCollection();
        this.updateActivePowerupTimers();
        this.handleBulletAsteroidCollision();
        this.handleShipAsteroidCollision(W, H);
        this.checkLevelComplete(W, H);
    }

    updateRespawn(W, H) {
        if (this.gameOver) return;
        if (!this.ship.alive) {
            this.ship.respawn--;
            if (this.ship.respawn <= 0) {
                this.ship.alive = true;
                this.ship.x = W() / 2;
                this.ship.y = H() / 2;
                this.ship.vx = this.ship.vy = 0;
                this.ship.angle = -Math.PI / 2;
                this.ship.invincible = SHIP_INVINCIBLE_TIME;
            }
        }
    }

    updateShipMovement() {
        if (!this.isControlEnabled()) return;
        if (keys['ArrowLeft'] || keys['KeyA']) this.ship.angle -= 0.06;
        if (keys['ArrowRight'] || keys['KeyD']) this.ship.angle += 0.06;

        if (keys['ArrowUp'] || keys['KeyW']) {
            this.ship.vx += Math.cos(this.ship.angle) * 0.12;
            this.ship.vy += Math.sin(this.ship.angle) * 0.12;
        }

        this.ship.vx *= 0.995;
        this.ship.vy *= 0.995;
        const spd = Math.sqrt(this.ship.vx * this.ship.vx + this.ship.vy * this.ship.vy);
        if (spd > 8) {
            this.ship.vx = this.ship.vx / spd * 8;
            this.ship.vy = this.ship.vy / spd * 8;
        }
    }

    updateShipPosition(W, H) {
        this.ship.x += this.ship.vx;
        this.ship.y += this.ship.vy;
        wrap(this.ship, W, H);
        if (this.ship.invincible > 0) this.ship.invincible--;
    }

    handleFiring() {
        if (!this.isControlEnabled()) return;
        if (this.fireCooldown > 0) this.fireCooldown--;
        const fireRate = this.activePowerups.rapidFire > 0 ? 2 : 8;
        if (keys['Space'] && this.fireCooldown <= 0) {
            this.fireCooldown = fireRate;
            const angles = this.activePowerups.splitShot > 0
                ? [this.ship.angle, this.ship.angle - 0.35, this.ship.angle + 0.35]
                : [this.ship.angle];
            for (const ang of angles) {
                const spread = ang + (Math.random() - 0.5) * 0.05;
                const bullet = new Bullet(
                    this.ship.x + Math.cos(spread) * 20,
                    this.ship.y + Math.sin(spread) * 20,
                    Math.cos(spread) * 12 + this.ship.vx * 0.2,
                    Math.sin(spread) * 12 + this.ship.vy * 0.2,
                    this.activePowerups.longRange > 0 ? MAX_BULLET_LIFE_LONG : MAX_BULLET_LIFE_NORMAL
                );
                this.bullets.push(bullet);
            }
        }
    }

    updateBullets(W, H) {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const b = this.bullets[i];
            b.update(W, H);
            wrap(b, W, H);
            if (b.dead) this.bullets.splice(i, 1);
        }
    }

    updateAsteroids(W, H) {
        for (const a of this.asteroids) {
            a.update(W, H);
            wrap(a, W, H);
        }
    }

    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vx *= 0.96;
            p.vy *= 0.96;
            p.life--;
            if (p.life <= 0) this.particles.splice(i, 1);
        }
    }

    updatePowerupSpawning(W, H) {
        if (!this.gameStarted || this.gameOver) return;
        this.powerupTimer++;
        if (this.powerupTimer >= this.powerupNext) {
            this.powerupTimer = 0;
            this.powerupNext = POWERUP_SPAWN_MIN + Math.floor(Math.random() * (POWERUP_SPAWN_MAX - POWERUP_SPAWN_MIN));
            const count = Math.random() < 0.25 ? 2 : 1;
            for (let n = 0; n < count; n++) {
                const cx = W() / 2 + (Math.random() - 0.5) * W() * 0.8;
                const cy = H() / 2 + (Math.random() - 0.5) * H() * 0.8;
                const type = getAllPowerupTypes()[Math.floor(Math.random() * getAllPowerupTypes().length)];
                this.powerups.push(new PowerUp(cx, cy, type));
            }
        }
    }

    updatePowerupCollection() {
        for (let i = this.powerups.length - 1; i >= 0; i--) {
            const pw = this.powerups[i];
            pw.update();
            if (pw.expired) { this.powerups.splice(i, 1); continue; }

            if (dist(this.ship, pw) < this.ship.radius + 16) {
                this.applyPowerup(pw);
                this.particles.push(...createExplosion(pw.x, pw.y, 12, 6, [1, 1, 1], 15, 3));
                this.powerups.splice(i, 1);
            }
        }
    }

    applyPowerup(pw) {
        if (pw.type === PowerupTypes.NUKE) {
            this.nukeAllAsteroids();
        } else {
            this.activePowerups[pw.type] += pw.getDuration();
        }
    }

    nukeAllAsteroids() {
        const newAsteroids = [];
        for (const a of this.asteroids) {
            if (a.isIndestructible) {
                newAsteroids.push(a);
            } else {
                this.score += a.getScore();
                this.particles.push(...Asteroid.createNukeExplosion(a.x, a.y, a.radius));
                newAsteroids.push(...a.split());
            }
        }
        this.asteroids = newAsteroids;
    }

    updateActivePowerupTimers() {
        if (!this.isControlEnabled()) return;
        for (const key of Object.keys(this.activePowerups)) {
            if (this.activePowerups[key] > 0) this.activePowerups[key]--;
        }
    }

    handleBulletAsteroidCollision() {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            for (let j = this.asteroids.length - 1; j >= 0; j--) {
                if (dist(this.bullets[i], this.asteroids[j]) < Math.max(this.asteroids[j].radius, 24)) {
                    if (this.asteroids[j].isIndestructible) {
                        this.particles.push(...createExplosion(this.bullets[i].x, this.bullets[i].y, 5, 2, [0.9, 0.85, 0.1], 10, 1));
                    } else {
                        this.destroyAsteroid(j);
                    }
                    this.bullets.splice(i, 1);
                    break;
                }
            }
        }
    }

    destroyAsteroid(index) {
        const ast = this.asteroids[index];
        this.score += ast.getScore();
        this.particles.push(...Asteroid.createBulletExplosion(ast.x, ast.y, ast.radius, ast.isClusteroid));
        this.asteroids.splice(index, 1, ...ast.split());
    }

    handleShipAsteroidCollision(W, H) {
        if (!this.ship.alive) return;
        const shieldActive = this.activePowerups.shield > 0;
        const effectiveRadius = shieldActive ? SHIELD_RADIUS : this.ship.radius;

        if (this.ship.invincible <= 0 || shieldActive) {
            for (let i = this.asteroids.length - 1; i >= 0; i--) {
                const a = this.asteroids[i];
                const collisionDist = effectiveRadius + a.radius - (shieldActive ? 0 : 4);

                if (dist(this.ship, a) < collisionDist) {
                    if (shieldActive && !a.isIndestructible) {
                        this.score += a.getScore();
                        this.particles.push(...Asteroid.createShieldExplosion(a.x, a.y, a.radius));
                        this.asteroids.splice(i, 1, ...a.split());
                    } else if (!shieldActive) {
                        this.shipHit();
                        break;
                    }
                }
            }
        }
    }

    shipHit() {
        this.lives--;
        this.ship.alive = false;
        this.ship.respawn = SHIP_RESPAWN_TIME;
        if (this.lives <= 0) this.gameOver = true;
        this.particles.push(...createExplosion(this.ship.x, this.ship.y, 100, 20, [1, 0.9, 0.7], 30, 2));
        this.particles.push(...createExplosion(this.ship.x, this.ship.y, 40, 3, [1, 0.5, 0.2], 60, 5));
        this.particles.push(...createExplosion(this.ship.x, this.ship.y, 20, 1, [0.5, 0.6, 0.7], 120, 4));
    }

    checkLevelComplete(W, H) {
        const destructibleCount = this.asteroids.filter(a => !a.isIndestructible).length;
        if (!this.gameOver && destructibleCount === 0) {
            this.level++;
            this.resetLevel(W, H);
        }
    }
}

// Backward-compatible singleton instance
const state = new GameState();
export { state };

export function resetLevel(W, H) { state.resetLevel(W, H); }
export function resetGame(W, H) { state.resetGame(W, H); }
export function update(W, H) { state.update(W, H); }
