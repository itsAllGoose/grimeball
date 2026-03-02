import { createScene } from '../render/createScene.js';
import { createHud } from '../ui/hud.js';
import { createInput } from './input.js';
import { GAME } from './constants.js';
import { createInitialState, getPointWinner, resetPositions, step } from './physics.js';

export class Game {
  constructor({ mount, hudRoot }) {
    this.mount = mount;
    this.sceneView = createScene({ mount });
    this.hud = createHud(hudRoot);
    this.input = createInput();

    this.state = createInitialState();
    this.score = { p1: 0, p2: 0 };

    this._acc = 0;
    this._lastT = null;
    this._raf = null;
    this._serveTimer = GAME.serveDelaySeconds;
    this._serveToRight = true;
    this._roundOver = false;

    this.hud.setScore(this.score.p1, this.score.p2, GAME.pointsToWin);
    this.hud.setStatus('First to 7. Serve in a moment...');

    // Start stationary until first serve.
    this.state.ball.vel.x = 0;
    this.state.ball.vel.y = 0;
  }

  start() {
    if (this._raf) return;
    this._lastT = performance.now();
    this._raf = requestAnimationFrame(this._tick);
  }

  stop() {
    if (this._raf) cancelAnimationFrame(this._raf);
    this._raf = null;
  }

  _tick = (t) => {
    const dtSeconds = Math.min(0.05, (t - this._lastT) / 1000);
    this._lastT = t;
    this._acc += dtSeconds;

    const p1 = this.input.getPlayer1();
    const p2 = this.input.getPlayer2();

    if (this.input.consumeRestart()) {
      this._restart();
    }

    let subSteps = 0;
    while (this._acc >= GAME.fixedDt && subSteps < GAME.maxSubSteps) {
      this._acc -= GAME.fixedDt;
      this._updateFixed(p1, p2, GAME.fixedDt);
      subSteps++;
    }

    this.sceneView.setEntityTransforms({
      ballPos: this.state.ball.pos,
      slime1Pos: this.state.p1.pos,
      slime2Pos: this.state.p2.pos,
    });
    this.sceneView.render();

    this._raf = requestAnimationFrame(this._tick);
  };

  _restart() {
    this.score.p1 = 0;
    this.score.p2 = 0;
    this._serveToRight = true;
    this._roundOver = false;
    this._serveTimer = GAME.serveDelaySeconds;
    resetPositions(this.state, this._serveToRight);
    this.state.ball.vel.x = 0;
    this.state.ball.vel.y = 0;
    this.hud.setScore(this.score.p1, this.score.p2, GAME.pointsToWin);
    this.hud.setStatus('Restarted. Get ready...');
  }

  _startServe(serveToRight) {
    resetPositions(this.state, serveToRight);
  }

  _updateFixed(p1Input, p2Input, dt) {
    if (this._roundOver) return;

    if (this._serveTimer > 0) {
      this._serveTimer -= dt;
      if (this._serveTimer <= 0) {
        this.hud.setStatus('');
        this._startServe(this._serveToRight);
      }
      return;
    }

    step(this.state, p1Input, p2Input, dt);

    const winner = getPointWinner(this.state);
    if (winner) {
      this._awardPoint(winner);
    }
  }

  _awardPoint(winner) {
    this.score[winner] += 1;
    this.hud.setScore(this.score.p1, this.score.p2, GAME.pointsToWin);

    if (this.score[winner] >= GAME.pointsToWin) {
      this._roundOver = true;
      this.hud.setStatus(`${winner === 'p1' ? 'P1' : 'P2'} wins! Press R to restart.`);
      return;
    }

    // Next serve comes from the player who scored; serve direction goes toward the other side.
    this._serveToRight = winner === 'p1';
    this._serveTimer = GAME.serveDelaySeconds;
    this.state.ball.vel.x = 0;
    this.state.ball.vel.y = 0;
    this.hud.setStatus(`${winner === 'p1' ? 'P1' : 'P2'} scores! Serving...`);
  }
}

