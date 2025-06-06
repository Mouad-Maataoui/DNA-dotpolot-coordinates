import { createYAxis, createXAxis } from './axis.js';
import { setupControls, resetZoom } from './tools.js';
import { exportToSvg } from './export.js';
import { getUrlParams, updateUrlParams, setupUrlSync } from './url.js';
import { makeLine, clickableLine } from './lines.js';
import { setupUnifiedEvents } from './handleTouchScreen_Mouse.js';


// declaring variables to store the points and the original viewBox (without zoom)
let points = [];
export let viewBox = { x: 0, y: 0, width: 0, height: 0 };
export let isZoomAllowed = true; // boolean to check if zoom is allowed

// variables to manipulate the viewBox in order to zoom in and out
export let initialViewBox = null;
export let svg, rect, selection = null;

// initial colors for the svg
export let colors = { f: 'green', r: 'red' };
export const urlParams = getUrlParams();

function fetchData() {
  // beforehand, apply the url parameters
  if (urlParams.colors) {
    colors = { ...colors, ...urlParams.colors };
  }
  
  if (urlParams.theme === 'dark') {
    document.body.classList.add('dark');
    document.body.classList.remove('light');
  } else {
    document.body.classList.add('light');
    document.body.classList.remove('dark');
  }
  
  
  //fetch('coordonnees.txt')
  fetch('/yass/tmp/coordonnees.' + urlParams.id +'.txt') // use the local file for testing
    .then(res => res.text())
    .then(data => {
      const lines = data.split('\n');
      let maxX = 0, maxY = 0;
      const lineDictionary = {}; // dictionary to store unique lines with their IDs
      let currentId = 1; // unique id for each set of points

      // we assume that the file is (correctly) formated like this:
      // x1 \n x2 \n y1 \n y2 \n direction \n
      for (let i = 0; i < lines.length; i += 5) {
        // x1, y1, x2, y2 are integers, direction is a string (f or r)
        const x1 = parseInt(lines[i], 10);
        const x2 = parseInt(lines[i + 1], 10);
        const y1 = parseInt(lines[i + 2], 10);
        const y2 = parseInt(lines[i + 3], 10);
        const direction = lines[i + 4]?.trim();
        // quick check to see if the values are valid
        if (!isNaN(x1) && !isNaN(x2) && !isNaN(y1) && !isNaN(y2) && (direction === 'f' || direction === 'r')) {
          const lineKey = `${x1},${y1},${x2},${y2}`; 
          if (!lineDictionary[lineKey]) {
            lineDictionary[lineKey] = currentId++;
          }
          const id = lineDictionary[lineKey];
          // we push the points, the direction and the id in the array
          points.push({ x1, x2, y1, y2, direction, id });
          maxX = Math.max(maxX, x1, x2);
          maxY = Math.max(maxY, y1, y2);
        }
      }
      
      // define the default viewBox 
      const defaultViewBox = { x: 0, y: 0, width: maxX, height: maxY };
      
      // apply url's viewBox parameters if they exist, otherwise use the default
      if (urlParams.viewBox) {
        viewBox = { ...urlParams.viewBox };
        initialViewBox = { ...defaultViewBox }; // store the initial viewBox in the case we reset the zoom
      } else {
        viewBox = { ...defaultViewBox };
        initialViewBox = { ...defaultViewBox };
      }
      
      render();
      // render the buttons and color inputs
    });
}

// function to render the dotplot
// this function creates the SVG elements and appends them to the DOM
export function render() {
  let currPoints = []; // points to be displayed in the current viewBox
  const container = document.getElementById('dotplot');
  container.innerHTML = '';
  // Layout constants
  const axisMargin = 60; // space for axes
  const svgSize = 800;
  const plotSize = svgSize - axisMargin;

  // calculate the viewBox based on the current viewBox and axisMargin
  const dataRatio = viewBox.width / viewBox.height;
  let svgW = plotSize, svgH = plotSize;
  if (dataRatio > 1) {
    // area is wider than larger → we reduce the axis height
    svgH = plotSize / dataRatio;
  } else {
    // area is larger than wider → we reduce the axis width
    svgW = plotSize * dataRatio;
  }

  // Wrapper for axes and plot
  const wrapper = document.createElement('div');
  wrapper.className = 'wrapper';

  // Create and append Y axis avec la dimension dynamique (svgH)
  const yAxisSvg = createYAxis(viewBox, svgH, axisMargin);
  wrapper.appendChild(yAxisSvg);

  // Main plot SVG
  svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width',  svgW);
  svg.setAttribute('height', svgH);
  svg.setAttribute('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`);
  svg.style.border = '1px solid black';
  svg.setAttribute('pointer-events', 'all'); // allow clicks on the svg (for clickable areas)

  // groups points and lines together
  const plotGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');


  if (initialViewBox.width === viewBox.width && initialViewBox.height === viewBox.height) {
    currPoints = [...points]; // Reset currPoints to include all points
  } else {
    currPoints = points.map(point => {
      const xMin = viewBox.x;
      const xMax = viewBox.x + viewBox.width;
      const yMin = viewBox.y;
      const yMax = viewBox.y + viewBox.height;

      // Toujours créer une copie pour ne jamais modifier l'original
      const { x1, x2, y1, y2, direction } = point;
      let clippedPoint = { ...point };

      if (x1 !== 0 && x2 !== 0 && x2 - x1 !== 0 && y2 - y1 !== 0) {
        const slope = (y2 - y1) / (x2 - x1);

        if (direction === 'f' && x2 > xMin && x1 < xMax && y2 > yMin && y1 < yMax) {
          if (x1 < xMin) {
            clippedPoint.x1 = xMin;
            clippedPoint.y1 = y2 - ((x2 - xMin) * slope);
          }
          if (clippedPoint.y1 < yMin) {
            clippedPoint.y1 = yMin;
            clippedPoint.x1 = x2 - ((y2 - yMin) / slope);
          }
          if (x2 > xMax) {
            clippedPoint.x2 = xMax;
            clippedPoint.y2 = clippedPoint.y1 + ((xMax - clippedPoint.x1) * slope);
          }
          if (clippedPoint.y2 > yMax) {
            clippedPoint.y2 = yMax;
            clippedPoint.x2 = clippedPoint.x1 + ((yMax - clippedPoint.y1) / slope);
          }

          return clippedPoint.x1 >= xMin && clippedPoint.x2 <= xMax && 
                clippedPoint.y1 >= yMin && clippedPoint.y2 <= yMax && 
                clippedPoint.x1 < clippedPoint.x2 && clippedPoint.y1 < clippedPoint.y2 ? clippedPoint : null;
                
        } else if (direction === 'r' && x1 > xMin && x2 < xMax && y2 > yMin && y1 < yMax) {
          if (x1 > xMax) {
            clippedPoint.x1 = xMax;
            clippedPoint.y1 = y2 - ((x2 - xMax) * slope);
          }
          if (clippedPoint.y1 < yMin) {
            clippedPoint.y1 = yMin;
            clippedPoint.x1 = x2 - ((y2 - yMin) / slope);
          }
          if (x2 < xMin) {
            clippedPoint.x2 = xMin;
            clippedPoint.y2 = clippedPoint.y1 + ((xMin - clippedPoint.x1) * slope);
          }
          if (clippedPoint.y2 > yMax) {
            clippedPoint.y2 = yMax;
            clippedPoint.x2 = clippedPoint.x1 + ((yMax - clippedPoint.y1) / slope);
          }

          return clippedPoint.x2 >= xMin && clippedPoint.x1 <= xMax && 
                clippedPoint.y1 >= yMin && clippedPoint.y2 <= yMax && 
                clippedPoint.x2 < clippedPoint.x1 && clippedPoint.y1 < clippedPoint.y2 ? clippedPoint : null;
        }
      }
      return null;
    }).filter(point => point !== null);
  }

  currPoints.forEach(point => { 
    const { x1, x2, y1, y2, direction, id } = point;
    if (initialViewBox.width === viewBox.width && initialViewBox.height === viewBox.height) {
      // Always include the point with id 1
      if (id === 1) {
    } else if (initialViewBox.width === viewBox.width && initialViewBox.height === viewBox.height) {
      if (urlParams.alignments && id > urlParams.alignments) {
        return;
      }
    }
    }
    else{
      // checks if the viewBox is the initial one and if the id is less than 2000 (we only make the clickable area for the first 2000 lines)
      if(viewBox.width === initialViewBox.width && viewBox.height === initialViewBox.height && id < 2000){ 
        const clickableLineConst = clickableLine(1000,100000,x1, y1, x2, y2,id); // create a clickable line with a large stroke width
        plotGroup.appendChild(clickableLineConst);
      }
      else {
        if (x1 !== x2 || y1 !== y2) { // verifiy that the lines are valid
          const dynamicStrokeWidth = 1000 * (viewBox.width / initialViewBox.width) + 200;
          const clickableLineConst = clickableLine(2, dynamicStrokeWidth,x1, y1, x2, y2,id);
          plotGroup.appendChild(clickableLineConst);
        }
      }
  }

    // add the real line with the dynamic stroke width
    const line = makeLine(x1, y1, x2, y2, direction === 'f' ? colors.f : colors.r);
    plotGroup.appendChild(line);
  });
  svg.appendChild(plotGroup);

  // select a rectangular section
  rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('fill', 'rgba(0,0,255,0.2)');
  rect.setAttribute('stroke', 'blue');
  rect.setAttribute('stroke-width', '5');
  rect.style.display = 'none';
  svg.appendChild(rect);

  setupUnifiedEvents(svg); // add mouse and touch screen handlers

  wrapper.appendChild(svg);
  container.appendChild(wrapper);

  // create and append X axis en passant la largeur dynamique (svgW)
  const xAxisSvg = createXAxis(viewBox, svgW, axisMargin);
  wrapper.appendChild(xAxisSvg);
  
  // add the wrapper to the container
  container.appendChild(wrapper);
  
  // update url after rendering the svg
  updateUrlParams();
}

// Function to enable zoom mode
export function onZoom() {
    isZoomAllowed = true;
    updateUrlParams();
}

// Function to enable map mode
export function onMap() {
    isZoomAllowed = false;
    updateUrlParams();
}

//allows to modify the viewBox from outside the module
export function setViewBox(newViewBox) {
  viewBox = { ...newViewBox };
  render();
}

//traduce screen coordinates to SVG coordinates
export function getSVGCoords(e) {
  const pt = svg.createSVGPoint();
  pt.x = e.clientX;
  pt.y = e.clientY;
  const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
  return { x: svgP.x, y: svgP.y };
}

// manual zoom input binding via the tool box
function bindInputZoom() {
  const qMin = document.getElementById('qMin');
  const qMax = document.getElementById('qMax');
  const tMin = document.getElementById('tMin');
  const tMax = document.getElementById('tMax');
  // make sure the inputs are not read-only
  [qMin, qMax, tMin, tMax].forEach(input => input.readOnly = false);
  // listening on the apply button to apply the zoom
  const applyBtn = document.getElementById('applyZoom');
  if (!applyBtn) return;
  applyBtn.addEventListener('click', () => {
    const x1 = parseFloat(qMin.value);
    const x2 = parseFloat(qMax.value);
    const y1 = parseFloat(tMin.value);
    const y2 = parseFloat(tMax.value);
    // verify the values
    if (!isNaN(x1) && !isNaN(x2) && !isNaN(y1) && !isNaN(y2) && x2 > x1 && y2 > y1) {
      viewBox = { x: x1, y: y1, width: x2 - x1, height: y2 - y1 };
      render();
    }
  });
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('light');
  setupControls(resetZoom, (dir, c) => colors[dir] = c, render, onZoom, onMap, exportToSvg);
  bindInputZoom(); // enable manual zoom
  setupUrlSync(); // sync URL with zoom and map buttons
  fetchData(); // fetch the data and render the plot
});