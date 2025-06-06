import { viewBox, colors } from './dotplot.js';

// fuction to read the URL parameters
export function getUrlParams() {
  const params = new URLSearchParams(window.location.search);
  let viewBoxParam = params.get('viewBox');
  let colorsParam = params.get('colors');
  
  // try to parse the viewBox parameters
  try {
    viewBoxParam = viewBoxParam ? JSON.parse(viewBoxParam) : null;
  } catch (e) {
    // if parsing fails, try decoding the URI component
    try {
      viewBoxParam = viewBoxParam ? JSON.parse(decodeURIComponent(viewBoxParam)) : null;
    } catch (e2) {
      viewBoxParam = null;
    }
  }

  //same thing with colors parameters
  try {
    colorsParam = colorsParam ? JSON.parse(colorsParam) : null;
  } catch (e) {
    try {
      colorsParam = colorsParam ? JSON.parse(decodeURIComponent(colorsParam)) : null;
    } catch (e2) {
      colorsParam = null;
    }
  }
  
  return {
    //return the parameters found in the URL
    viewBox: viewBoxParam,
    colors: colorsParam,
    theme: params.get('theme') || 'light',
    id: params.get('id') || null,
    alignments: params.get('alignments') || null,
    filename1: params.get('filename1') || null,
    filename2: params.get('filename2') || null
  };
}

// function to update the URL parameters based on the current state of the SVG
export function updateUrlParams() { 
  const params = [];
  params.push(`viewBox=${JSON.stringify(viewBox)}`);
  params.push(`colors=${JSON.stringify(colors)}`);
  params.push(`theme=${document.body.classList.contains('dark') ? 'dark' : 'light'}`);
  params.push(`id=${getUrlParams().id || ''}`);
  params.push(`alignments=${getUrlParams().alignments || ''}`);
  params.push(`filename1=${getUrlParams().filename1 || ''}`);
  params.push(`filename2=${getUrlParams().filename2 || ''}`);
  window.history.replaceState({}, '', `${window.location.pathname}?${params.join('&')}`);
}

// update the URL parameters when the zoom or map buttons are clicked
export function setupUrlSync() {
  // we want this function to be called after all DOM elements are loaded
  const zoomBtn = document.getElementById('onZoomBtn'); 
  if (zoomBtn) {
    zoomBtn.addEventListener('click', () => {
      setTimeout(updateUrlParams, 0); // delay to ensure the viewBox is updated
    });
  }

  // same for map button
  const mapBtn = document.getElementById('onMapBtn');
  if (mapBtn) {
    mapBtn.addEventListener('click', () => {
      setTimeout(updateUrlParams, 0);
    });
  }
}