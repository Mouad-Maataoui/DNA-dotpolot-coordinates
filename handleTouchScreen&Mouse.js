import { getSVGCoords, render, rect, setViewBox } from './dotplot.js';
import { updateSelectionInputs } from './tools.js';

let selection = null;

export function handlePointerStart(e) {
  console.log('handlePointerStart', e);
  e.preventDefault();
  
  const clientX = e.clientX || (e.touches && e.touches[0].clientX);
  const clientY = e.clientY || (e.touches && e.touches[0].clientY);
  
  if (!clientX || !clientY) return;
  
  const { x: startX, y: startY } = getSVGCoords({ clientX, clientY });
  selection = { startX, startY, endX: startX, endY: startY };
  rect.setAttribute('x', startX);
  rect.setAttribute('y', startY);
  rect.setAttribute('width', 0);
  rect.setAttribute('height', 0);
  rect.style.display = 'block';
  updateSelectionInputs(startX, startY, 0, 0);
}

export function handlePointerMove(e) {
  e.preventDefault();
  
  if (!selection) return;
  
  const clientX = e.clientX || (e.touches && e.touches[0].clientX);
  const clientY = e.clientY || (e.touches && e.touches[0].clientY);
  
  if (!clientX || !clientY) return;
  
  const { x: endX, y: endY } = getSVGCoords({ clientX, clientY });
  const x = Math.min(selection.startX, endX);
  const y = Math.min(selection.startY, endY);
  const width = Math.abs(endX - selection.startX);
  const height = Math.abs(endY - selection.startY);
  rect.setAttribute('x', x);
  rect.setAttribute('y', y);
  rect.setAttribute('width', width);
  rect.setAttribute('height', height);
  selection.endX = endX;
  selection.endY = endY;
  updateSelectionInputs(x, y, width, height);
}

export function handlePointerEnd(e) {
  e.preventDefault();
  
  if (!selection) return;
  
  rect.style.display = 'none';
  const { startX, startY, endX, endY } = selection;
  const newX = Math.min(startX, endX);
  const newY = Math.min(startY, endY);
  const newW = Math.abs(endX - startX);
  const newH = Math.abs(endY - startY);
  if (newW > 0 && newH > 0) {
    setViewBox({ x: newX, y: newY, width: newW, height: newH });
    render();
  }
  selection = null;
}

// Configuration unifiée pour souris et tactile
export function setupUnifiedEvents(svgElement) {
  // Événements souris
  svgElement.addEventListener('mousedown', handlePointerStart);
  svgElement.addEventListener('mousemove', handlePointerMove);
  svgElement.addEventListener('mouseup', handlePointerEnd);
  
  // Événements tactiles
  svgElement.addEventListener('touchstart', handlePointerStart, { passive: false });
  svgElement.addEventListener('touchmove', handlePointerMove, { passive: false });
  svgElement.addEventListener('touchend', handlePointerEnd, { passive: false });
  svgElement.addEventListener('touchcancel', handlePointerEnd, { passive: false });
}