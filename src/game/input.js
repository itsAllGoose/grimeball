export function createInput() {
  const down = new Set();
  let restartPressed = false;

  function onKeyDown(e) {
    if (e.code === 'KeyR') restartPressed = true;
    down.add(e.code);
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
      e.preventDefault();
    }
  }

  function onKeyUp(e) {
    down.delete(e.code);
  }

  window.addEventListener('keydown', onKeyDown, { passive: false });
  window.addEventListener('keyup', onKeyUp);

  function isDown(code) {
    return down.has(code);
  }

  function getPlayer1() {
    const left = isDown('KeyA');
    const right = isDown('KeyD');
    const jump = isDown('KeyW');
    return { left, right, jump };
  }

  function getPlayer2() {
    const left = isDown('ArrowLeft');
    const right = isDown('ArrowRight');
    const jump = isDown('ArrowUp');
    return { left, right, jump };
  }

  function consumeRestart() {
    if (!restartPressed) return false;
    restartPressed = false;
    return true;
  }

  function dispose() {
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
    down.clear();
    restartPressed = false;
  }

  return { isDown, getPlayer1, getPlayer2, consumeRestart, dispose };
}

