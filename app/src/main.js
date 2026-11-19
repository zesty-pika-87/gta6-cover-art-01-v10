// Neon Coast wiring: photos, layout, grade, lettering, panel tuning and PNG
// export. The preview canvas and the exported file are drawn by the same
// renderer, so what you see is what the PNG holds.
import { drawCover, layoutPanels, coverScore } from './cover.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('cover');
const status = document.getElementById('status');
const panelLabel = document.getElementById('panel-label');
const zoomInput = document.getElementById('zoom');
const panXInput = document.getElementById('pan-x');
const panYInput = document.getElementById('pan-y');

function emptyPhoto(slot) {
  return { kind: 'empty', slot, img: null, name: 'Empty', zoom: 1, ox: 0, oy: 0 };
}

const state = {
  layout: 'mosaic',
  grade: 'sunset',
  lettering: 'block',
  title: 'NEON COAST',
  tagline: 'VICE CITY · EST. 2026',
  titleScale: 1,
  captionPos: 'bottom',
  selected: 0,
  showScore: true,
  photos: { A: emptyPhoto('A'), B: emptyPhoto('B'), C: emptyPhoto('C') },
};

/** Loads an image from a URL, resolving once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function slotName(slot) {
  return state.photos[slot].name;
}

function refreshSlotNames() {
  document.querySelectorAll('[data-name]').forEach((el) => {
    el.textContent = slotName(el.dataset.name);
  });
}

function selectedSlot() {
  const panels = layoutPanels(state.layout);
  const panel = panels[state.selected] || panels[0];
  return panel.slot;
}

function refreshPanelControls() {
  const slot = selectedSlot();
  const photo = state.photos[slot];
  panelLabel.textContent = `Panel ${state.selected + 1} — photo ${slot} (${photo.name})`;
  zoomInput.value = Math.round((photo.zoom || 1) * 100);
  panXInput.value = photo.ox || 0;
  panYInput.value = photo.oy || 0;
}

function redraw() {
  drawCover(canvas, state, { highlight: true });
  refreshPanelControls();
}

function markActive(containerId, attr, value) {
  document.querySelectorAll(`#${containerId} [data-${attr}]`).forEach((b) => {
    b.classList.toggle('active', b.dataset[attr] === value);
  });
}

function setLayout(layout) {
  state.layout = layout;
  state.selected = 0;
  markActive('layouts', 'layout', layout);
  redraw();
}

function setGrade(grade) {
  state.grade = grade;
  markActive('grades', 'grade', grade);
  redraw();
}

function setLettering(lettering) {
  state.lettering = lettering;
  markActive('letterings', 'lettering', lettering);
  redraw();
}

async function setSample(slot, sample) {
  if (sample === 'neon') {
    state.photos[slot] = { kind: 'neon', slot, img: null, name: 'Neon Alley scene', zoom: 1, ox: 0, oy: 0 };
  } else {
    const img = await loadImage(`samples/${sample}.jpg`);
    state.photos[slot] = { kind: 'image', slot, img, name: `${sample}.jpg`, zoom: 1, ox: 0, oy: 0 };
  }
  refreshSlotNames();
  redraw();
}

document.querySelectorAll('input[data-photo]').forEach((input) => {
  input.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const slot = e.target.dataset.photo;
    const img = await loadImage(URL.createObjectURL(file));
    state.photos[slot] = { kind: 'image', slot, img, name: file.name, zoom: 1, ox: 0, oy: 0 };
    refreshSlotNames();
    redraw();
    status.textContent = `${file.name} is in slot ${slot} — score ${coverScore(state).toFixed(1)}.`;
  });
});

document.querySelectorAll('[data-sample]').forEach((button) => {
  button.addEventListener('click', () => {
    setSample(button.dataset.slot, button.dataset.sample);
    status.textContent = `Slot ${button.dataset.slot} now shows the ${button.dataset.sample} scene.`;
  });
});

document.querySelectorAll('#layouts [data-layout]').forEach((b) => {
  b.addEventListener('click', () => setLayout(b.dataset.layout));
});
document.querySelectorAll('#grades [data-grade]').forEach((b) => {
  b.addEventListener('click', () => setGrade(b.dataset.grade));
});
document.querySelectorAll('#letterings [data-lettering]').forEach((b) => {
  b.addEventListener('click', () => setLettering(b.dataset.lettering));
});

document.getElementById('title').addEventListener('input', (e) => {
  state.title = e.target.value;
  redraw();
});
document.getElementById('tagline').addEventListener('input', (e) => {
  state.tagline = e.target.value;
  redraw();
});
document.getElementById('title-size').addEventListener('input', (e) => {
  state.titleScale = Number(e.target.value) / 100;
  redraw();
});
document.getElementById('caption-pos').addEventListener('change', (e) => {
  state.captionPos = e.target.value;
  redraw();
});

function tuneSelected() {
  const slot = selectedSlot();
  const photo = state.photos[slot];
  photo.zoom = Number(zoomInput.value) / 100;
  photo.ox = Number(panXInput.value);
  photo.oy = Number(panYInput.value);
  redraw();
}
zoomInput.addEventListener('input', tuneSelected);
panXInput.addEventListener('input', tuneSelected);
panYInput.addEventListener('input', tuneSelected);

canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const fx = (e.clientX - rect.left) / rect.width;
  const fy = (e.clientY - rect.top) / rect.height;
  const panels = layoutPanels(state.layout);
  const hit = panels.findIndex((p) => fx >= p.x && fx < p.x + p.w && fy >= p.y && fy < p.y + p.h);
  if (hit >= 0) {
    state.selected = hit;
    redraw();
  }
});

function parseSize(text) {
  const [w, h] = text.split('x').map(Number);
  return { w, h };
}

function exportPng(w, h, filename) {
  const off = document.createElement('canvas');
  off.width = w;
  off.height = h;
  drawCover(off, state, { highlight: false });
  off.toBlob((blob) => {
    if (!blob) {
      status.textContent = 'Export failed — try again.';
      return;
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    status.textContent = `Saved ${filename} (${w} × ${h}).`;
  }, 'image/png');
}

document.getElementById('export-square').addEventListener('click', () => exportPng(1080, 1080, 'neon-coast-1080x1080.png'));
document.getElementById('export-portrait').addEventListener('click', () => exportPng(1080, 1350, 'neon-coast-1080x1350.png'));
document.getElementById('export-wide').addEventListener('click', () => exportPng(1920, 1080, 'neon-coast-1920x1080.png'));

document.getElementById('preview-size').addEventListener('change', (e) => {
  const { w, h } = parseSize(e.target.value);
  canvas.width = w;
  canvas.height = h;
  redraw();
});

const shot = new URLSearchParams(location.search).get('shot');
if (shot) {
  runShot(shot, new URLSearchParams(location.search), state, { loadImage, setSample, setLayout, setGrade, setLettering, redraw, markActive });
} else {
  markActive('layouts', 'layout', state.layout);
  markActive('grades', 'grade', state.grade);
  markActive('letterings', 'lettering', state.lettering);
  Promise.all([setSample('A', 'pier'), setSample('B', 'boulevard'), setSample('C', 'neon')])
    .then(() => { status.textContent = 'Three scenes loaded — pick a layout and export.'; })
    .catch(() => { redraw(); });
  redraw();
}
