# Asteroids

Browser-based Asteroids clone using WebGL.

## Installation

```bash
npm install
```

## Launch

```bash
npm start
```

Open http://localhost:3000 in your browser.

## Game Data

High scores are persisted server-side in `data/highscores.json`.

## How to Play

- **Arrow keys** or **WASD** — rotate and thrust
- **Space** — shoot
- Destroy asteroids to score points. Each asteroid splits into smaller pieces.
- Collect power-ups that appear periodically:
  - **R** (Rapid Fire) — faster shooting
  - **N** (Nuke) — destroys all asteroids on screen
  - **S** (Split Shot) — fires multiple bullets at once
  - **L** (Long Range) — bullets travel farther
  - **H** (Shield) — invulnerability; destroys colliding asteroids
- You have 3 lives. Each life grants a brief period of invincibility on respawn.
