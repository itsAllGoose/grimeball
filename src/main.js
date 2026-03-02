import { Game } from './game/Game.js';

const game = new Game({
  mount: document.body,
  hudRoot: document.getElementById('hud'),
});

game.start();

