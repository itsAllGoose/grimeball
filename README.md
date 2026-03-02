# Slime Volleyball (Three.js)

A browser-based Slime Volleyball clone built with Three.js. Two players control bouncy slimes on opposite sides of a net, volleying a ball back and forth. First to 7 points wins.

## Features

- **Local 2-player** keyboard controls on the same device
- **Arcade physics** (gravity, bounces, ball–slime collisions)
- **Responsive layout** with fixed aspect ratio and scaling
- **Score tracking** and serve/reset flow
- **Procedural rendering** (no external assets)

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or newer recommended; v14.18+ may work with Vite 4)
- npm (comes with Node.js)

## Getting Started

### Install dependencies

```bash
npm install
```

### Run development server

```bash
npm run dev
```

Open the URL shown in the terminal (e.g. `http://127.0.0.1:5173/`).

### Build for production

```bash
npm run build
```

Output goes to `dist/`. Serve with any static server:

```bash
npm run preview
```

## How to Play

### Controls

| Player | Move Left | Move Right | Jump |
|--------|-----------|------------|------|
| **P1** (green) | `A` | `D` | `W` |
| **P2** (blue)  | `←` | `→` | `↑` |

- **`R`** — Restart game (resets score and positions)

### Rules

- The ball must bounce on the opponent’s side of the court to score.
- If the ball touches the ground on your side, the opponent scores.
- First to **7 points** wins.
- After each point, the scorer serves toward the other side.
- A short delay (0.7s) before each serve gives you time to get ready.

## Project Structure

```
demo/
├── index.html          # Entry HTML, HUD container, loads main.js
├── package.json
├── public/             # Static assets (optional)
├── src/
│   ├── main.js        # Bootstraps the game
│   ├── game/
│   │   ├── Game.js    # Game loop, scoring, serve/reset logic
│   │   ├── constants.js
│   │   ├── input.js   # Keyboard state handling
│   │   └── physics.js # Movement, collisions, integration
│   ├── render/
│   │   └── createScene.js  # Three.js scene, camera, meshes
│   └── ui/
│       └── hud.js     # Score overlay, status text
└── README.md
```

## Technical Details

### Architecture

- **Game loop**: Fixed timestep (120 Hz) with an accumulator for stable physics.
- **Rendering**: Orthographic camera for 2D-style gameplay; court is in the X–Y plane.
- **Physics**: Custom arcade-style integration (no external engine).

### Rendering

- **Scene**: Ground plane, net, ball, two slimes (hemisphere meshes).
- **Lighting**: Ambient + directional lights for depth.
- **Camera**: Orthographic view with aspect-based resize.

### Physics

- **Ball**: Gravity, restitution on ground/walls/net, max speed cap.
- **Slimes**: Move acceleration, friction, jump impulse, grounded check.
- **Collisions**: Ball vs ground, walls, net (AABB), and slimes (circle–circle).

### Game Loop

1. `_tick` runs each frame.
2. Real elapsed time is accumulated.
3. Fixed steps are run while enough time remains.
4. Each step: read input, apply physics, check for point.
5. Render meshes from `state` positions.

## Customization

Tuning constants live in `src/game/constants.js`:

| Constant | Description | Default |
|----------|-------------|---------|
| `COURT.halfWidth` | Court half-width (units) | 10 |
| `NET.height` | Net height | 3.25 |
| `BALL.radius` | Ball radius | 0.45 |
| `BALL.restitution` | Bounce factor | 0.9 |
| `BALL.maxSpeed` | Maximum ball speed | 18 |
| `SLIME.radius` | Slime radius | 1.65 |
| `SLIME.moveAccel` | Horizontal acceleration | 45 |
| `SLIME.jumpSpeed` | Jump impulse | 11.5 |
| `SLIME.gravity` | Gravity strength | 26 |
| `GAME.pointsToWin` | Points to win match | 7 |
| `GAME.serveDelaySeconds` | Delay before serve | 0.7 |
| `GAME.fixedDt` | Physics timestep | 1/120 |

## Dependencies

- **three** — 3D rendering
- **vite** — Dev server and build tooling

## License

MIT
