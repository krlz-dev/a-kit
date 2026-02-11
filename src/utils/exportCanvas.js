import html2canvas from 'html2canvas';
import GIF from 'gif.js';
import gifWorkerUrl from 'gif.js/dist/gif.worker.js?url';

/**
 * Get the pannable canvas DOM element
 */
function getCanvasElement() {
  return document.querySelector('[data-canvas-content]');
}

/**
 * Capture the canvas element as an HTMLCanvasElement via html2canvas
 */
async function captureCanvas() {
  const el = getCanvasElement();
  if (!el) throw new Error('Canvas element not found');
  return html2canvas(el, {
    backgroundColor: '#141414',
    scale: 2,
    useCORS: true,
    logging: false,
  });
}

/**
 * Trigger a file download from a blob
 */
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/* ── PNG ── */

export async function exportAsPNG() {
  const canvas = await captureCanvas();
  canvas.toBlob((blob) => {
    downloadBlob(blob, 'architecture.png');
  }, 'image/png');
}

/* ── JPG ── */

export async function exportAsJPG() {
  const canvas = await captureCanvas();
  canvas.toBlob((blob) => {
    downloadBlob(blob, 'architecture.jpg');
  }, 'image/jpeg', 0.92);
}

/* ── GIF (animated, ~3s at 10fps) ── */

export async function exportAsGIF(onProgress) {
  const el = getCanvasElement();
  if (!el) throw new Error('Canvas element not found');

  const FRAMES = 30;
  const DELAY = 100; // ms between frames (10fps)

  const gif = new GIF({
    workers: 2,
    quality: 10,
    workerScript: gifWorkerUrl,
    width: el.offsetWidth,
    height: el.offsetHeight,
  });

  // Capture frames over time to catch CSS animations
  for (let i = 0; i < FRAMES; i++) {
    const frame = await html2canvas(el, {
      backgroundColor: '#141414',
      scale: 1,
      useCORS: true,
      logging: false,
    });
    gif.addFrame(frame, { delay: DELAY });
    if (onProgress) onProgress(Math.round(((i + 1) / FRAMES) * 80));
    // Wait before next frame so CSS animations advance
    await new Promise(r => setTimeout(r, DELAY));
  }

  return new Promise((resolve, reject) => {
    gif.on('finished', (blob) => {
      downloadBlob(blob, 'architecture.gif');
      resolve();
    });
    gif.on('progress', (p) => {
      if (onProgress) onProgress(80 + Math.round(p * 20));
    });
    gif.render();
  });
}

/* ── WebM Video (~4s at 15fps) ── */

export async function exportAsWebM(onProgress) {
  const el = getCanvasElement();
  if (!el) throw new Error('Canvas element not found');

  const FRAMES = 60;
  const DELAY = 67; // ~15fps
  const FPS = 15;

  // Create offscreen canvas for drawing frames
  const offscreen = document.createElement('canvas');
  offscreen.width = el.offsetWidth * 2;
  offscreen.height = el.offsetHeight * 2;
  const ctx = offscreen.getContext('2d');

  // Use canvas stream + MediaRecorder
  const stream = offscreen.captureStream(FPS);
  const recorder = new MediaRecorder(stream, {
    mimeType: 'video/webm;codecs=vp9',
    videoBitsPerSecond: 5_000_000,
  });

  const chunks = [];
  recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

  recorder.start();

  // Capture frames
  for (let i = 0; i < FRAMES; i++) {
    const frame = await html2canvas(el, {
      backgroundColor: '#141414',
      scale: 2,
      useCORS: true,
      logging: false,
    });
    ctx.clearRect(0, 0, offscreen.width, offscreen.height);
    ctx.drawImage(frame, 0, 0, offscreen.width, offscreen.height);
    if (onProgress) onProgress(Math.round(((i + 1) / FRAMES) * 90));
    await new Promise(r => setTimeout(r, DELAY));
  }

  return new Promise((resolve) => {
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      downloadBlob(blob, 'architecture.webm');
      if (onProgress) onProgress(100);
      resolve();
    };
    recorder.stop();
  });
}
