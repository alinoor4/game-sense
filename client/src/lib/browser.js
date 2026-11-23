// Small browser-only helpers used by the tools and canvas demos.

// Reads a colour from styles.css so canvas drawings match the theme: cssVar('--accent')
export function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

// Makes the browser download `text` as a .txt file.
export function downloadText(filename, text) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

// Sizes a canvas for sharp drawing on high-density screens and returns its 2D context.
// After this call, draw using CSS pixels: the canvas is `width` x `height` units.
export function setupCanvas(canvas, width, height) {
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  canvas.style.aspectRatio = `${width} / ${height}`;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  return ctx;
}

// Converts a mouse or pointer event to canvas drawing coordinates (the same units setupCanvas uses).
export function canvasPoint(canvas, event, width, height) {
  const box = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - box.left) / box.width) * width,
    y: ((event.clientY - box.top) / box.height) * height,
  };
}
