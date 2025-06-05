import { svg} from './dotplot.js';
import { getUrlParams } from './url.js';

export function exportToSvg() {
  const urlParams = getUrlParams();
  const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Dotplot export</title>
  <style>
    /* reset & base */
    body { margin: 0; font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
           background: #fafafa; color: #1a1a1a; }
    h1 { text-align: center; margin: 1rem 0; }

    /* container SVG + controls */
    .full-container {
      display: flex; gap: 2rem; padding: 2rem;
      justify-content: center; align-items: flex-start;
    }
    .plot-container {
      flex: 1; max-width: 860px; padding: 2rem;
      background: #fff; border: 1px solid #ddd;
      border-radius: 8px; box-shadow: 0 4px 16px rgba(0,0,0,0.05);
      position: relative;
    }
    .controls-container {
      width: 240px; padding: 1rem;
      display: flex; justify-content: center; align-items: center;
      background: #fff; border: 1px solid #ddd;
      border-radius: 8px; box-shadow: 0 4px 16px rgba(0,0,0,0.05);
    }

    /* download button */
    #downloadBtn {
      padding: 0.5rem 1rem; border: 1px solid #ddd;
      border-radius: 6px; background: transparent;
      color: inherit; cursor: pointer;
      font-size: 0.9rem; transition: background 0.2s, border-color 0.2s;
    }
    #downloadBtn:hover {
      background: #888; border-color: #888; color: #fff;
    }

    /* SVG styling */
    svg { background: transparent; overflow: visible; display: block; margin: 0 auto; }

    /* filename labels */
    .filename-label {
      writing-mode: vertical-rl;
      text-orientation: mixed;
      font-size: 1rem;
      color: #333;
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
    }
    .filename-label-bottom {
      font-size: 1rem;
      color: #333;
      text-align: center;
      margin-top: 1rem;
    }
  </style>
</head>
<body>
  <h1>Dotplot</h1>
  <div class="full-container">
    <div class="plot-container">
      ${svg.outerHTML}
      <div class="filename-label">
        ${urlParams.filename2}
      </div>
      <div class="filename-label-bottom">
        ${urlParams.filename1}
      </div>
    </div>
    <div class="info-container">
      <div class="controls-container">
        <button id="downloadBtn">Télécharger le SVG</button>
      </div>
    </div>
  </div>
  <script>
    document.getElementById('downloadBtn').addEventListener('click', () => {
      const a = document.createElement('a');
      a.href = "data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.outerHTML)}";
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