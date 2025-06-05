import { viewBox, initialViewBox, colors, isZoomAllowed, urlParams } from './dotplot.js';

export function makeLine(x1, y1, x2, y2, stroke) {
  const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  l.setAttribute('x1', x1);
  l.setAttribute('y1', y1);
  l.setAttribute('x2', x2);
  l.setAttribute('y2', y2);
  l.setAttribute('stroke', stroke);
  l.setAttribute('stroke-width', 1); // set the stroke width to 1 pixel
  l.setAttribute('vector-effect', 'non-scaling-stroke'); // ensure the stroke width remains constant regardless of zoom or scaling
  if((viewBox.width/initialViewBox.width) > 0.01 && (viewBox.height/initialViewBox.height) > 0.01){
    l.setAttribute('stroke-linejoin', 'round');
    l.setAttribute('stroke-linecap', 'round');
  }
  if (stroke === colors.f) {
    l.classList.add('forward');
  } else if (stroke === colors.r) {
    l.classList.add('reverse');
  }
  return l;
}

export function clickableLine(offset, width, x1, y1, x2, y2, id) { 
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line.setAttribute('x1', x1 - offset);
  line.setAttribute('y1', y1 - offset);
  line.setAttribute('x2', x2 + offset);
  line.setAttribute('y2', y2 + offset);
  line.setAttribute('stroke', 'transparent');
  line.setAttribute('stroke-width', width); // width of the clickable area
  line.setAttribute('cursor', 'pointer');
  line.setAttribute('pointer-events', 'stroke'); // checks if the clicks are captured on the stroke
  
  // add a click event listener to the clickable line
  line.addEventListener('click', () => {
    if (isZoomAllowed) return; // en mode zoom, on n'ouvre pas la fenêtre
    console.log(`Clicked on line ID: ${id}`);
    window.open(`https://bioinfo.univ-lille.fr/cgi-bin/yass/print_align-cgi?id=${urlParams.id}&noLine=${id}`, '_blank');
  });
  
  return line;
}