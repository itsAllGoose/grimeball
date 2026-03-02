export const COURT = {
  halfWidth: 10,
  groundY: 0,
  wallRestitution: 0.9,
};

export const NET = {
  x: 0,
  thickness: 0.35,
  height: 3.25,
};

export const BALL = {
  radius: 0.45,
  restitution: 0.9,
  maxSpeed: 18,
};

export const SLIME = {
  radius: 1.65,
  moveAccel: 45,
  moveFriction: 14,
  maxSpeed: 8.5,
  jumpSpeed: 11.5,
  gravity: 26,
};

export const GAME = {
  fixedDt: 1 / 120,
  maxSubSteps: 8,
  pointsToWin: 7,
  serveDelaySeconds: 0.7,
};

