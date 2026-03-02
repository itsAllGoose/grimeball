import { BALL, COURT, NET, SLIME } from './constants.js';

function clamp(x, a, b) {
  return Math.max(a, Math.min(b, x));
}

function length2(x, y) {
  return Math.hypot(x, y);
}

function normalize2(x, y) {
  const len = Math.hypot(x, y);
  if (len <= 1e-9) return { x: 0, y: 1, len: 0 };
  return { x: x / len, y: y / len, len };
}

function dot2(ax, ay, bx, by) {
  return ax * bx + ay * by;
}

export function createInitialState() {
  return {
    ball: {
      pos: { x: 0, y: COURT.groundY + NET.height + 2.2 },
      vel: { x: 2.2, y: 0 },
      r: BALL.radius,
    },
    p1: {
      pos: { x: -5, y: COURT.groundY + SLIME.radius },
      vel: { x: 0, y: 0 },
      r: SLIME.radius,
      grounded: true,
    },
    p2: {
      pos: { x: 5, y: COURT.groundY + SLIME.radius },
      vel: { x: 0, y: 0 },
      r: SLIME.radius,
      grounded: true,
    },
  };
}

export function resetPositions(state, serveToRight) {
  state.p1.pos.x = -5;
  state.p1.pos.y = COURT.groundY + SLIME.radius;
  state.p1.vel.x = 0;
  state.p1.vel.y = 0;
  state.p1.grounded = true;

  state.p2.pos.x = 5;
  state.p2.pos.y = COURT.groundY + SLIME.radius;
  state.p2.vel.x = 0;
  state.p2.vel.y = 0;
  state.p2.grounded = true;

  state.ball.pos.x = serveToRight ? -2.5 : 2.5;
  state.ball.pos.y = COURT.groundY + NET.height + 2.3;
  state.ball.vel.x = serveToRight ? 5.2 : -5.2;
  state.ball.vel.y = 6.8;
}

function applyPlayerInput(player, input, dt) {
  const dir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  if (dir !== 0) {
    player.vel.x += dir * SLIME.moveAccel * dt;
  } else {
    const decay = Math.exp(-SLIME.moveFriction * dt);
    player.vel.x *= decay;
    if (Math.abs(player.vel.x) < 0.05) player.vel.x = 0;
  }

  player.vel.x = clamp(player.vel.x, -SLIME.maxSpeed, SLIME.maxSpeed);

  if (input.jump && player.grounded) {
    player.vel.y = SLIME.jumpSpeed;
    player.grounded = false;
  }
}

function integrateBody(body, dt, gravity) {
  body.vel.y -= gravity * dt;
  body.pos.x += body.vel.x * dt;
  body.pos.y += body.vel.y * dt;
}

function collideWithGround(body, restitution) {
  const minY = COURT.groundY + body.r;
  if (body.pos.y < minY) {
    body.pos.y = minY;
    if (body.vel.y < 0) body.vel.y = -body.vel.y * restitution;
    return true;
  }
  return false;
}

function clampBallSpeed(ball) {
  const speed = length2(ball.vel.x, ball.vel.y);
  if (speed > BALL.maxSpeed) {
    const s = BALL.maxSpeed / speed;
    ball.vel.x *= s;
    ball.vel.y *= s;
  }
}

function collideBallWithWalls(ball) {
  const leftX = -COURT.halfWidth + ball.r;
  const rightX = COURT.halfWidth - ball.r;
  if (ball.pos.x < leftX) {
    ball.pos.x = leftX;
    if (ball.vel.x < 0) ball.vel.x = -ball.vel.x * COURT.wallRestitution;
  } else if (ball.pos.x > rightX) {
    ball.pos.x = rightX;
    if (ball.vel.x > 0) ball.vel.x = -ball.vel.x * COURT.wallRestitution;
  }
}

function constrainPlayerToHalf(player, isLeft) {
  const minX = -COURT.halfWidth + player.r;
  const maxX = COURT.halfWidth - player.r;
  const netLimit = (NET.thickness / 2) + player.r;

  if (isLeft) {
    player.pos.x = clamp(player.pos.x, minX, -netLimit);
  } else {
    player.pos.x = clamp(player.pos.x, netLimit, maxX);
  }
}

function collideBallWithNet(ball) {
  const rectMinX = NET.x - NET.thickness / 2;
  const rectMaxX = NET.x + NET.thickness / 2;
  const rectMinY = COURT.groundY;
  const rectMaxY = COURT.groundY + NET.height;

  const closestX = clamp(ball.pos.x, rectMinX, rectMaxX);
  const closestY = clamp(ball.pos.y, rectMinY, rectMaxY);

  const dx = ball.pos.x - closestX;
  const dy = ball.pos.y - closestY;
  const dist2 = dx * dx + dy * dy;
  const r = ball.r;

  if (dist2 >= r * r) return;

  const n = normalize2(dx, dy);
  const penetration = r - n.len;
  ball.pos.x += n.x * penetration;
  ball.pos.y += n.y * penetration;

  const vN = dot2(ball.vel.x, ball.vel.y, n.x, n.y);
  if (vN < 0) {
    ball.vel.x -= (1 + BALL.restitution) * vN * n.x;
    ball.vel.y -= (1 + BALL.restitution) * vN * n.y;
  }
}

function collideBallWithSlime(ball, slime) {
  const dx = ball.pos.x - slime.pos.x;
  const dy = ball.pos.y - slime.pos.y;
  const combined = ball.r + slime.r;
  const dist = Math.hypot(dx, dy);
  if (dist >= combined || dist <= 1e-9) return;

  const nx = dx / dist;
  const ny = dy / dist;

  // Push ball out
  const penetration = combined - dist;
  ball.pos.x += nx * penetration;
  ball.pos.y += ny * penetration;

  // Bounce with a bit of "hit" influence from slime velocity
  const vN = dot2(ball.vel.x, ball.vel.y, nx, ny);
  if (vN < 0) {
    ball.vel.x -= (1 + BALL.restitution) * vN * nx;
    ball.vel.y -= (1 + BALL.restitution) * vN * ny;
  }

  const hit = dot2(slime.vel.x, slime.vel.y, nx, ny);
  ball.vel.x += hit * 0.55 * nx;
  ball.vel.y += hit * 0.55 * ny;
}

export function step(state, input1, input2, dt) {
  // Players
  applyPlayerInput(state.p1, input1, dt);
  applyPlayerInput(state.p2, input2, dt);

  integrateBody(state.p1, dt, SLIME.gravity);
  integrateBody(state.p2, dt, SLIME.gravity);

  state.p1.grounded = collideWithGround(state.p1, 0);
  state.p2.grounded = collideWithGround(state.p2, 0);

  constrainPlayerToHalf(state.p1, true);
  constrainPlayerToHalf(state.p2, false);

  // Ball
  integrateBody(state.ball, dt, SLIME.gravity);
  collideBallWithWalls(state.ball);
  collideBallWithNet(state.ball);
  collideBallWithSlime(state.ball, state.p1);
  collideBallWithSlime(state.ball, state.p2);

  // Ground bounce last so ball doesn't get trapped in net corner
  collideWithGround(state.ball, BALL.restitution);
  clampBallSpeed(state.ball);
}

export function getPointWinner(state) {
  const touchingGround = state.ball.pos.y <= COURT.groundY + state.ball.r + 1e-6 && state.ball.vel.y <= 0.5;
  if (!touchingGround) return null;
  return state.ball.pos.x < 0 ? 'p2' : 'p1';
}

