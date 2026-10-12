/* =========================================================
   EMPro Solutions — Service Tiles Enhancements
   - 3D tilt following the cursor
   - Spotlight glow position tracking
   - Skipped on touch devices and reduced-motion users
   ========================================================= */
(function () {
  'use strict';

  const tiles = document.querySelectorAll('.tile');
  const grid  = document.querySelector('.tile-grid');
  if (!tiles.length || !grid) return;

  // Respect user preferences
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canHover     = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (reduceMotion || !canHover) return;

  /* ---------- Spotlight across the grid ---------- */
  grid.addEventListener('pointermove', (e) => {
    const rect = grid.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width)  * 100;
    const y = ((e.clientY - rect.top)  / rect.height) * 100;
    grid.style.setProperty('--mx', x + '%');
    grid.style.setProperty('--my', y + '%');
  });

  /* ---------- 3D tilt per tile ---------- */
  const MAX_TILT = 6; // degrees

  tiles.forEach(tile => {
    let raf = null;

    function onMove(e) {
      const rect = tile.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;   // 0..1
      const py = (e.clientY - rect.top)  / rect.height;  // 0..1

      const rotY = (px - 0.5) * (MAX_TILT * 2);
      const rotX = (0.5 - py) * (MAX_TILT * 2);

      // Spotlight inside the tile
      tile.style.setProperty('--glow-x', (px * 100) + '%');
      tile.style.setProperty('--glow-y', (py * 100) + '%');

      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        tile.classList.add('tilting');
        tile.style.transform =
          `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-6px) scale(1.012)`;
      });
    }

    function onLeave() {
      if (raf) cancelAnimationFrame(raf);
      tile.classList.remove('tilting');
      tile.style.transform = '';
    }

    tile.addEventListener('pointermove',   onMove);
    tile.addEventListener('pointerleave',  onLeave);
    tile.addEventListener('pointercancel', onLeave);
  });
})();
