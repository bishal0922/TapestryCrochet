// src/lib/patternExporter.js
export function exportPattern(pattern, colorPalette, format) {
    switch (format) {
      case 'text':
        return exportAsText(pattern, colorPalette);
      case 'html':
        return exportAsHTML(pattern, colorPalette);
      case 'json':
        return exportAsJSON(pattern, colorPalette);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }
  
  function exportAsText(pattern, colorPalette) {
    let output = 'Tapestry Crochet Pattern\n';
    output += '=====================\n\n';
    
    // Color key
    output += 'Color Key:\n';
    colorPalette.forEach((color, index) => {
      output += `${index + 1}: ${color}\n`;
    });
    output += '\n';
  
    // Pattern grid
    pattern.forEach((row, rowIndex) => {
      output += `Row ${rowIndex + 1}: ${row.join(' ')}\n`;
      if ((rowIndex + 1) % 5 === 0) output += '\n';
    });
  
    return output;
  }
  
  function exportAsHTML(pattern, colorPalette) {
    let html = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Tapestry Crochet Pattern</title>
    <style>
      .grid { display: grid; grid-gap: 1px; background: #ccc; }
      .row { display: grid; grid-auto-flow: column; grid-gap: 1px; }
      .cell { width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 12px; }
      .color-key { margin-bottom: 20px; }
      .color-sample { width: 20px; height: 20px; display: inline-block; margin-right: 10px; }
    </style>
  </head>
  <body>
    <h1>Tapestry Crochet Pattern</h1>
    
    <div class="color-key">
      <h2>Color Key</h2>
      ${colorPalette.map((color, index) => `
        <div>
          <span class="color-sample" style="background: ${color}"></span>
          Color ${index + 1}: ${color}
        </div>
      `).join('')}
    </div>
  
    <div class="grid">
      ${pattern.map((row, rowIndex) => `
        <div class="row">
          ${row.map((cell, cellIndex) => `
            <div class="cell" style="background: ${colorPalette[cell - 1]}">${cell}</div>
          `).join('')}
        </div>
      `).join('')}
    </div>
  </body>
  </html>`;
  
    return html;
  }
  
  function exportAsJSON(pattern, colorPalette) {
    return JSON.stringify({
      pattern,
      colorPalette,
      version: '1.0',
      createdAt: new Date().toISOString(),
      metadata: {
        width: pattern[0].length,
        height: pattern.length,
        colors: colorPalette.length
      }
    }, null, 2);
  }
  
  export function downloadFile(content, filename, type = 'text/plain') {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }