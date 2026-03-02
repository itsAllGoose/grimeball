export function createHud(rootEl) {
  const el = rootEl ?? document.createElement('div');
  if (!rootEl) {
    el.id = 'hud';
    document.body.appendChild(el);
  }

  const scoreEl = document.createElement('div');
  scoreEl.className = 'score';
  el.appendChild(scoreEl);

  const helpEl = document.createElement('div');
  helpEl.className = 'help';
  helpEl.innerHTML =
    'P1: A/D move, W jump<br>' +
    'P2: \u2190/\u2192 move, \u2191 jump<br>' +
    'R: restart';
  el.appendChild(helpEl);

  const statusEl = document.createElement('div');
  statusEl.className = 'help';
  statusEl.style.marginTop = '10px';
  el.appendChild(statusEl);

  function setScore(left, right, target) {
    scoreEl.textContent = `${left}  -  ${right}   (to ${target})`;
  }

  function setStatus(text) {
    statusEl.textContent = text ?? '';
  }

  return { el, setScore, setStatus };
}

