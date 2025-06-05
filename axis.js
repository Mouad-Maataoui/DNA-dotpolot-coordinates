import { getUrlParams } from "./url.js";

const NS = 'http://www.w3.org/2000/svg';
const urlsParams = getUrlParams();

/**
 * Compute a "nice" step and number of sections for an axis giv
 *  its delta.
 * Ensures between minSections and maxSections graduations.
 */
function computeSections(delta, { target = 8, minSections = 6, maxSections = 11 } = {}) {
  const rawStep = delta / target;
  const mag = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const multiples = [1, 2, 5, 10];

  let step = multiples.find(m => m * mag >= rawStep) * mag;
  let sections = Math.ceil(delta / step);

  while (sections < minSections) {
    step /= 2;
    sections = Math.ceil(delta / step);
  }
  while (sections > maxSections) {
    step *= 2;
    sections = Math.ceil(delta / step);
  }

  return { step, sections };
}

/**
 * Format label to show only the largest order of magnitude, others as zeros.
 */
function formatLabel(value, step) {
  const mag = Math.pow(10, Math.floor(Math.log10(step)));
  const rounded = Math.round(value / mag) * mag;
  return rounded.toLocaleString('fr-FR');
}

/**
 * Create and return an SVG element representing the vertical (Y) axis with arrow.
 */
export function createYAxis(viewBox, plotSize, margin) {
  // On détermine dynamiquement le target en fonction de la taille réelle du graphe
  const dynamicTarget = plotSize < 300 ? 3 : 8;
  const { step, sections } = computeSections(viewBox.height, { target: dynamicTarget, minSections: 3, maxSections: 11 });
  const maxValueY = viewBox.y + viewBox.height;
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('width', margin);
  svg.setAttribute('height', plotSize);
  svg.classList.add('axis-vertical');

  // Définition du marker flèche, plus petit et aligné
  const defs = document.createElementNS(NS, 'svg:defs');
  const marker = document.createElementNS(NS, 'svg:marker');
  marker.setAttribute('id', 'arrowHeadY');
  marker.setAttribute('markerUnits', 'strokeWidth');
  marker.setAttribute('markerWidth', '6');
  marker.setAttribute('markerHeight', '6');
  marker.setAttribute('refX', '0');
  marker.setAttribute('refY', '3');
  marker.setAttribute('orient', 'auto');
  const path = document.createElementNS(NS, 'svg:path');
  path.setAttribute('d', 'M0,0 L6,3 L0,6 Z');
  path.setAttribute('fill', 'var(--axis-text)');
  marker.appendChild(path);
  defs.appendChild(marker);
  svg.appendChild(defs);

  // Axe Y: point de départ
  const startY = document.createElementNS(NS, 'circle');
  startY.setAttribute('cx', margin - 10);
  startY.setAttribute('cy', 0);
  startY.setAttribute('r', 4);
  startY.setAttribute('fill', 'var(--axis-text)');
  svg.appendChild(startY);

  // Ligne de l'axe avec flèche
  const yAxisLine = document.createElementNS(NS, 'line');
  yAxisLine.setAttribute('x1', margin - 10);
  yAxisLine.setAttribute('y1', -1);
  yAxisLine.setAttribute('x2', margin - 10);
  yAxisLine.setAttribute('y2', plotSize + 1);
  yAxisLine.setAttribute('stroke', 'var(--axis-text)');
  yAxisLine.setAttribute('stroke-width', 2);
  yAxisLine.setAttribute('marker-end', 'url(#arrowHeadY)');
  svg.appendChild(yAxisLine);

  // Ticks et labels : i=1 à sections-1
  for (let i = 1; i < sections; i++) {
    const rawValue = viewBox.y + i * step;
    if (rawValue >= maxValueY) break;

    const y = (i * plotSize) / sections;
    const tick = document.createElementNS(NS, 'line');
    tick.setAttribute('x1', margin - 20);
    tick.setAttribute('y1', y);
    tick.setAttribute('x2', margin - 10);
    tick.setAttribute('y2', y);
    tick.setAttribute('stroke', 'var(--axis-text)');
    svg.appendChild(tick);

    const label = document.createElementNS(NS, 'text');
    label.setAttribute('x', margin - 25);
    label.setAttribute('y', y + 4);
    label.setAttribute('fill', 'var(--axis-text)');
    label.setAttribute('font-size', 14);
    label.setAttribute('text-anchor', 'end');
    label.textContent = formatLabel(rawValue, step);
    svg.appendChild(label);
  }

  return svg;
}

/**
 * Create and return an SVG element representing the horizontal (X) axis with arrow.
 */
export function createXAxis(viewBox, plotSize, margin) {
  // On détermine dynamiquement le target en fonction de la taille réelle du graphe
  const dynamicTarget = plotSize < 300 ? 3 : 8;
  const { step, sections } = computeSections(viewBox.width, { target: dynamicTarget, minSections: 3, maxSections: 11 });
  const maxValueX = viewBox.x + viewBox.width;
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('width', plotSize + 2 * margin);
  svg.setAttribute('height', margin);
  svg.classList.add('axis-horizontal');

  // Définition du marker flèche, plus petit et aligné
  const defs = document.createElementNS(NS, 'svg:defs');
  const marker = document.createElementNS(NS, 'svg:marker');
  marker.setAttribute('id', 'arrowHeadX');
  marker.setAttribute('markerUnits', 'strokeWidth');
  marker.setAttribute('markerWidth', '6');
  marker.setAttribute('markerHeight', '6');
  marker.setAttribute('refX', '0');
  marker.setAttribute('refY', '2.6');
  marker.setAttribute('orient', 'auto');
  const path = document.createElementNS(NS, 'svg:path');
  path.setAttribute('d', 'M0,0 L6,3 L0,6 Z');
  path.setAttribute('fill', 'var(--axis-text)');
  marker.appendChild(path);
  defs.appendChild(marker);
  svg.appendChild(defs);

  // Axe X: point de départ
  const startX = document.createElementNS(NS, 'circle');
  startX.setAttribute('cx', margin + 0);
  startX.setAttribute('cy', 10);
  startX.setAttribute('r', 4);
  startX.setAttribute('fill', 'var(--axis-text)');
  svg.appendChild(startX);

  // Ligne de l'axe avec flèche
  const xAxisLine = document.createElementNS(NS, 'line');
  xAxisLine.setAttribute('x1', margin + 0);
  xAxisLine.setAttribute('y1', 10);
  xAxisLine.setAttribute('x2', plotSize + margin + 0);
  xAxisLine.setAttribute('y2', 10);
  xAxisLine.setAttribute('stroke', 'var(--axis-text)');
  xAxisLine.setAttribute('stroke-width', 2);
  xAxisLine.setAttribute('marker-end', 'url(#arrowHeadX)');
  svg.appendChild(xAxisLine);

  // Ticks et labels : i=1 à sections-1
  for (let i = 1; i < sections; i++) {
    const rawValue = viewBox.x + i * step;
    if (rawValue >= maxValueX) break;

    const x = margin + (i * plotSize) / sections;
    const tick = document.createElementNS(NS, 'line');
    tick.setAttribute('x1', x);
    tick.setAttribute('y1', 10);
    tick.setAttribute('x2', x);
    tick.setAttribute('y2', 25);
    tick.setAttribute('stroke', 'var(--axis-text)');
    svg.appendChild(tick);

    const label = document.createElementNS(NS, 'text');
    label.setAttribute('x', x);
    label.setAttribute('y', 45);
    label.setAttribute('fill', 'var(--axis-text)');
    label.setAttribute('font-size', 14);
    label.setAttribute('text-anchor', 'middle');
    label.textContent = formatLabel(rawValue, step);
    svg.appendChild(label);
  }

  return svg;
}