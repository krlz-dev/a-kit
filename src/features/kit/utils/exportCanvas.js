import html2canvas from 'html2canvas-pro';
import fixWebmDuration from 'fix-webm-duration';
import GIF from 'gif.js';
import gifWorkerUrl from 'gif.js/dist/gif.worker.js?url';

/**
 * Get the pannable canvas DOM element
 */
function getCanvasElement() {
  return document.querySelector('[data-canvas-content]');
}

/**
 * Freeze SVG SMIL animations into static attributes so html2canvas can capture them.
 * Returns a restore function that re-enables the animations.
 */
function freezeFrame(containerEl) {
  const svgs = containerEl.querySelectorAll('svg');
  const saved = [];

  for (const svg of svgs) {
    let svgTime;
    try { svgTime = svg.getCurrentTime(); } catch { continue; }
    svg.pauseAnimations();

    const circles = svg.querySelectorAll('circle');
    for (const circle of circles) {
      const am = circle.querySelector('animateMotion');
      if (!am) continue;
      const mpath = am.querySelector('mpath');
      const href = mpath?.getAttribute('href');
      if (!href) continue;
      const pathEl = svg.querySelector(href);
      if (!pathEl) continue;

      const dur = parseFloat(am.getAttribute('dur'));
      const begin = parseFloat(am.getAttribute('begin')) || 0;
      const totalLength = pathEl.getTotalLength();
      const elapsed = svgTime - begin;
      const progress = elapsed < 0 ? 0 : (((elapsed % dur) + dur) % dur) / dur;
      const point = pathEl.getPointAtLength(progress * totalLength);

      // Save and detach all animation children
      const children = [...circle.children];
      children.forEach(c => circle.removeChild(c));

      // Set static position (r and opacity revert to the JSX defaults on the element)
      circle.setAttribute('cx', point.x);
      circle.setAttribute('cy', point.y);

      saved.push({ svg, circle, children });
    }
  }

  return function restore() {
    const svgs = new Set();
    for (const { svg, circle, children } of saved) {
      circle.removeAttribute('cx');
      circle.removeAttribute('cy');
      children.forEach(c => circle.appendChild(c));
      svgs.add(svg);
    }
    for (const svg of svgs) svg.unpauseAnimations();
  };
}

/**
 * Capture the canvas element as an HTMLCanvasElement via html2canvas-pro
 */
async function captureCanvas() {
  const el = getCanvasElement();
  if (!el) throw new Error('Canvas element not found');
  await document.fonts.ready;
  return html2canvas(el, {
    backgroundColor: '#141414',
    scale: 2,
    useCORS: true,
    logging: false,
  });
}

/**
 * Capture a single animated frame: freeze SVG animations → html2canvas → restore
 */
async function captureAnimatedFrame(el, scale = 2) {
  const restore = freezeFrame(el);
  try {
    return await html2canvas(el, {
      backgroundColor: '#141414',
      scale,
      useCORS: true,
      logging: false,
    });
  } finally {
    restore();
  }
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

/**
 * Detect a supported video MIME type for MediaRecorder
 */
function getSupportedMimeType() {
  const candidates = [
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
    'video/mp4',
  ];
  for (const mime of candidates) {
    if (MediaRecorder.isTypeSupported(mime)) return mime;
  }
  return '';
}

/* ── PNG ── */

export async function exportAsPNG({ scale = 2 } = {}) {
  const el = getCanvasElement();
  if (!el) throw new Error('Canvas element not found');
  const canvas = await captureAnimatedFrame(el, scale);
  canvas.toBlob((blob) => {
    downloadBlob(blob, 'architecture.png');
  }, 'image/png');
}

/* ── JPG ── */

export async function exportAsJPG({ scale = 2 } = {}) {
  const el = getCanvasElement();
  if (!el) throw new Error('Canvas element not found');
  const canvas = await captureAnimatedFrame(el, scale);
  canvas.toBlob((blob) => {
    downloadBlob(blob, 'architecture.jpg');
  }, 'image/jpeg', 0.92);
}

/* ── GIF (animated, ~2s at 10fps) ── */

export async function exportAsGIF({ scale = 1, onProgress } = {}) {
  const el = getCanvasElement();
  if (!el) throw new Error('Canvas element not found');

  await document.fonts.ready;

  const FRAMES = 18;
  const FRAME_DELAY = 80; // ms between frames in the output GIF
  const CAPTURE_WAIT = 60; // ms to let animation advance between captures

  const gif = new GIF({
    workers: 2,
    quality: 5,
    workerScript: gifWorkerUrl,
    width: el.offsetWidth * scale,
    height: el.offsetHeight * scale,
  });

  for (let i = 0; i < FRAMES; i++) {
    const currentEl = getCanvasElement();
    if (!currentEl) break;

    const frame = await captureAnimatedFrame(currentEl, scale);
    gif.addFrame(frame, { delay: FRAME_DELAY });
    if (onProgress) onProgress(Math.round(((i + 1) / FRAMES) * 80));
    await new Promise(r => setTimeout(r, CAPTURE_WAIT));
  }

  return new Promise((resolve, reject) => {
    gif.on('finished', (blob) => {
      downloadBlob(blob, 'architecture.gif');
      if (onProgress) onProgress(100);
      resolve();
    });
    gif.on('progress', (p) => {
      if (onProgress) onProgress(80 + Math.round(p * 20));
    });
    gif.render();
  });
}

/* ── PDF ── */

export async function exportAsPDF({ scale = 2 } = {}) {
  const el = getCanvasElement();
  if (!el) throw new Error('Canvas element not found');
  const canvas = await captureAnimatedFrame(el, scale);
  const imgData = canvas.toDataURL('image/png');
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF({
    orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
    unit: 'px',
    format: [canvas.width, canvas.height],
  });
  pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
  pdf.save('architecture.pdf');
}

/* ── WebM / MP4 Video ── */

export async function exportAsWebM(onProgress) {
  const el = getCanvasElement();
  if (!el) throw new Error('Canvas element not found');

  if (typeof MediaRecorder === 'undefined') {
    throw new Error('MediaRecorder is not supported in this browser');
  }

  await document.fonts.ready;

  const FRAMES = 24;
  const FPS = 15;
  const CAPTURE_WAIT = 60; // ms to let animation advance between captures

  const offscreen = document.createElement('canvas');
  offscreen.width = el.offsetWidth * 2;
  offscreen.height = el.offsetHeight * 2;
  const ctx = offscreen.getContext('2d');

  // captureStream(FPS) auto-generates frames at FPS rate for smooth playback
  const stream = offscreen.captureStream(FPS);

  const mimeType = getSupportedMimeType();
  if (!mimeType) throw new Error('No supported video format found');

  const isMP4 = mimeType.startsWith('video/mp4');
  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: 5_000_000,
  });

  const chunks = [];
  recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

  const recordingStart = Date.now();
  recorder.start();

  for (let i = 0; i < FRAMES; i++) {
    const currentEl = getCanvasElement();
    if (!currentEl) break;

    const frame = await captureAnimatedFrame(currentEl, 2);
    ctx.clearRect(0, 0, offscreen.width, offscreen.height);
    ctx.drawImage(frame, 0, 0, offscreen.width, offscreen.height);

    if (onProgress) onProgress(Math.round(((i + 1) / FRAMES) * 90));
    await new Promise(r => setTimeout(r, CAPTURE_WAIT));
  }

  return new Promise((resolve) => {
    recorder.onstop = async () => {
      const duration = Date.now() - recordingStart;
      const rawBlob = new Blob(chunks, { type: mimeType });

      if (isMP4) {
        downloadBlob(rawBlob, 'architecture.mp4');
        if (onProgress) onProgress(100);
        resolve();
        return;
      }

      try {
        const fixedBlob = await fixWebmDuration(rawBlob, duration, { logger: false });
        downloadBlob(fixedBlob, 'architecture.webm');
      } catch {
        downloadBlob(rawBlob, 'architecture.webm');
      }
      if (onProgress) onProgress(100);
      resolve();
    };
    recorder.stop();
  });
}
