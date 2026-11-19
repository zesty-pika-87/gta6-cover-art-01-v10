// Fixed scenes for screenshots: ?shot=editor shows the page with photos loaded;
// ?shot=cover shows the cover alone. `photo` picks the hero scene, `layout`,
// `grade`, `lettering` and `size` pick the rest, `caption` the title.
// window.__shotReady is set once painted.
import { drawCover } from './cover.js';

function syncInputs(state) {
  const title = document.getElementById('title');
  if (title) title.value = state.title;
  const tagline = document.getElementById('tagline');
  if (tagline) tagline.value = state.tagline;
  const size = document.getElementById('preview-size');
  if (size) size.value = `${document.getElementById('cover').width}x${document.getElementById('cover').height}`;
}

export async function runShot(shot, query, state, api) {
  const canvas = document.getElementById('cover');
  const size = query.get('size') || (shot === 'cover' ? '1920x1080' : '1080x1080');
  const [w, h] = size.split('x').map(Number);
  canvas.width = w;
  canvas.height = h;
  if (query.get('layout')) api.setLayout(query.get('layout'));
  if (query.get('grade')) api.setGrade(query.get('grade'));
  if (query.get('lettering')) api.setLettering(query.get('lettering'));
  if (query.get('caption')) state.title = query.get('caption');
  if (query.get('tagline')) state.tagline = query.get('tagline');
  if (query.get('pos')) state.captionPos = query.get('pos');
  const hero = query.get('photo') || 'pier';
  if (shot === 'cover') {
    document.body.classList.add('shot-cover');
    await api.setSample('A', hero);
    await api.setSample('B', hero === 'pier' ? 'boulevard' : 'pier');
    await api.setSample('C', 'neon');
    syncInputs(state);
    drawCover(canvas, state, { highlight: false });
  } else {
    await api.setSample('A', 'pier');
    await api.setSample('B', 'boulevard');
    await api.setSample('C', 'neon');
    state.selected = 4;
    syncInputs(state);
    api.markActive('layouts', 'layout', state.layout);
    api.markActive('grades', 'grade', state.grade);
    api.markActive('letterings', 'lettering', state.lettering);
    api.redraw();
  }
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}
