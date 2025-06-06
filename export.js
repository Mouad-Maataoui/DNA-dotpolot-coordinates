import { getUrlParams } from './url.js';

export function exportToSvg() {
  const urlParams = getUrlParams();
  // on récupère le HTML complet du plot (axes + svg)
  const container = document.getElementById('dotplot');
  const plotHTML  = container.innerHTML;

  const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Dotplot export</title>
  <style>
    body { 
      margin:0; 
      font-family:"Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
      background:#fafafa; 
      color:#1a1a1a; 
    }
    body.dark {
      background: #121212;
      color: #e0e0e0;
    }
    h1 { 
      text-align:center; 
      margin:1rem 0; 
    }
    .full-container {
      display:flex; 
      flex-direction:column;
      align-items:center; 
      justify-content:center;
      min-height:100vh; 
      padding:1rem;
      background:#f0f0f0;
    }
    body.dark .full-container {
      background:#1e1e1e;
    }

    .plot-container {
      position: relative;
      width: 860px; 
      max-width:90vw;
      margin:0 auto;
      padding:2rem;
      background:#fff; 
      border:1px solid #ddd;
      border-radius:8px; 
      box-shadow:0 4px 16px rgba(0,0,0,0.05);
    }
    body.dark .plot-container {
      background: #1e1e1e;
      border-color: #333;
      box-shadow: 0 4px 16px rgba(0,0,0,0.4);
    }
    #downloadBtn {
      position:absolute; 
      top:1rem; 
      right:1rem;
      padding:0.5rem 1rem; 
      background:transparent;
      border:1px solid #ddd; 
      border-radius:6px;
      cursor:pointer; 
      transition:background 0.2s,border-color 0.2s;
    }
    #downloadBtn:hover {
      background:#888; 
      border-color:#888; 
      color:#fff;
    }
    body.dark #downloadBtn {
      border-color: #333;
      color: #e0e0e0;
    }
    
    /* Styles pour les axes - identiques à dotplot.css */
    .wrapper {
      justify-content: center;
    }
    .axis-horizontal {
      display: block;
      margin: 0rem auto 0;  
    }
    svg {
      background: transparent;
      overflow: visible;
    }
    .axis-vertical line,
    .axis-horizontal line,
    .tick {
      stroke: #888;
    }
    .axis-vertical text,
    .axis-horizontal text {
      fill: #1a1a1a;
      font-size: 0.8rem;
    }
    body.dark .axis-vertical text,
    body.dark .axis-horizontal text {
      fill: #e0e0e0;
    }
    
    /* Variables CSS pour la cohérence */
    :root {
      --axis-text: #1a1a1a;
    }
    body.dark {
      --axis-text: #e0e0e0;
    }
  </style>
</head>
<body class="${urlParams.theme||'light'}">
  <h1>Dotplot</h1>
  <div class="full-container">
    <button id="downloadBtn">Télécharger le SVG</button>
    <div class="plot-container">
      ${plotHTML}
    </div>
  </div>
  <script>
    document.getElementById('downloadBtn').addEventListener('click', () => {
      // we pick the first three SVGs in the wrapper <svg> (axes+plot) in plot-container
      const wrapper = document.querySelector('.plot-container .wrapper');
      if (!wrapper) {
        alert('Erreur: structure du plot non trouvée');
        return;
      }
      
      const svgs = Array.from(wrapper.querySelectorAll('svg'));
      if (svgs.length < 3) {
        alert('Erreur: axes ou plot manquants');
        return;
      }
      
      // we pick the first three SVGs: Y axis, plot, X axis
      const yAxisSvg = svgs[0]; // axe Y
      const plotSvg = svgs[1];  // plot principal
      const xAxisSvg = svgs[2]; // axe X
      
      const yAxisWidth = parseFloat(yAxisSvg.getAttribute('width'));
      const yAxisHeight = parseFloat(yAxisSvg.getAttribute('height'));
      const plotWidth = parseFloat(plotSvg.getAttribute('width'));
      const plotHeight = parseFloat(plotSvg.getAttribute('height'));
      const xAxisWidth = parseFloat(xAxisSvg.getAttribute('width'));
      const xAxisHeight = parseFloat(xAxisSvg.getAttribute('height'));
      
      //we create a new SVG element that will contain the combined plot
      const combined = document.createElementNS('http://www.w3.org/2000/svg','svg');
      const totalWidth = Math.max(yAxisWidth + plotWidth, xAxisWidth);
      const totalHeight = Math.max(yAxisHeight, plotHeight) + xAxisHeight;
      
      combined.setAttribute('width', totalWidth);
      combined.setAttribute('height', totalHeight);
      combined.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      
      // we add the defs from all SVGs to the combined SVG
      svgs.forEach(svg => {
        const defs = svg.querySelector('defs');
        if (defs) {
          combined.appendChild(defs.cloneNode(true));
        }
      });
      
      // we create a group for the Y axis and position it at the left
      const yAxisGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      yAxisGroup.setAttribute('transform', 'translate(0, 0)');
      // Copie du contenu de l'axe Y (sans les defs)
      Array.from(yAxisSvg.children).forEach(child => {
        if (child.tagName !== 'defs') {
          yAxisGroup.appendChild(child.cloneNode(true));
        }
      });
      combined.appendChild(yAxisGroup);
      
      // we position the plot to the right of the Y axis
      const plotGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      plotGroup.setAttribute('transform', \`translate(\${yAxisWidth}, 0)\`);
      // Copie du contenu du plot (sans les defs)
      Array.from(plotSvg.children).forEach(child => {
        if (child.tagName !== 'defs') {
          plotGroup.appendChild(child.cloneNode(true));
        }
      });
      combined.appendChild(plotGroup);
      
      // we position the X axis at the bottom of the plot
      const xAxisGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      xAxisGroup.setAttribute('transform', \`translate(0, \${Math.max(yAxisHeight, plotHeight)})\`);
      // Copie du contenu de l'axe X (sans les defs)
      Array.from(xAxisSvg.children).forEach(child => {
        if (child.tagName !== 'defs') {
          xAxisGroup.appendChild(child.cloneNode(true));
        }
      });
      combined.appendChild(xAxisGroup);

      // we create the download link
      const svgData = new XMLSerializer().serializeToString(combined);
      const a = document.createElement('a');
      a.href = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgData);
      a.download = 'dotplot.svg';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  </script>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url  = URL.createObjectURL(blob);
  const newTab = window.open(url, '_blank');
  if (newTab) {
    newTab.focus();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } else {
    alert('Impossible d\'ouvrir le nouvel onglet. Veuillez autoriser les pop-ups pour ce site.');
  }
}