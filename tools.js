import { setViewBox, initialViewBox, render } from "./dotplot.js";

/**
 * Toggle between light and dark theme on the <body> element.
 */
export function toggleTheme() {
  document.body.classList.toggle('dark');
  document.body.classList.toggle('light');
}

// Function to reset the zoom to the initial viewBox
export function resetZoom() {
  if (initialViewBox) {
    setViewBox(initialViewBox);
  }
}


// function to update the selection inputs (qMin, qMax, tMin, tMax) in live time
export function updateSelectionInputs(x, y, width, height) {
  const qMinI = document.getElementById('qMin');
  if (!qMinI) return;
  document.getElementById('qMin').value = Math.round(x);
  document.getElementById('qMax').value = Math.round(x + width);
  document.getElementById('tMin').value = Math.round(y);
  document.getElementById('tMax').value = Math.round(y + height);
}

/**
 * Wire up control buttons and color inputs.
 * @param {Function} onResetZoom - callback to reset zoom
 * @param {Function} onColorChange - callback(dir, color)
 * @param {Function} renderFn - function to call after changes
 * @param {Function} onZoom - callback to activate zoom mode
 * @param {Function} onMap - callback to activate map mode
 */
export function setupControls(onResetZoom, onColorChange, renderFn, onZoom, onMap, exportToSvg) {
  document.getElementById('resetZoomBtn')
    .addEventListener('click', onResetZoom);
  document.getElementById('exportBtn')
    .addEventListener('click', exportToSvg);
  document.getElementById('toggleThemeBtn')
    .addEventListener('click', toggleTheme);

  // replace the button click listeners with radio button change listeners
  document.querySelectorAll('input[name="mode"]').forEach(input => {
    input.addEventListener('change', (e) => {
      if (e.target.value === 'zoom') {
        onZoom();
      } else {
        onMap();
      }
      renderFn();
    });
  });
  
  document.getElementById('colorF')
    .addEventListener('input', e => {
      onColorChange('f', e.target.value);
      renderFn();
    });
  document.getElementById('colorR')
    .addEventListener('input', e => {
      onColorChange('r', e.target.value);
      renderFn();
    });
}