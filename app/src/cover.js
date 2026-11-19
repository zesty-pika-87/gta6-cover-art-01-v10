// Neon Coast cover renderer: panels, colour grades, caption lettering and the
// star score pill, all drawn on one canvas so the preview and the exported PNG
// are the same picture. Photos stay on the machine; nothing here fetches.
import { drawNeonAlley } from './backdrop.js';

export const LAYOUTS = ['solo', 'duo', 'trio', 'quad', 'mosaic', 'stack'];
export const GRADES = ['sunset', 'neon', 'gold', 'dusk', 'bubble', 'noir'];
export const LETTERINGS = ['block', 'glow', 'gradient'];

// Panel maps: fractions of the cover, each panel fed by one photo slot (A, B or C).
export function layoutPanels(layout) {
  const third = 1 / 3;
  switch (layout) {
    case 'duo': return [
      { x: 0, y: 0, w: 0.5, h: 1, slot: 'A' },
      { x: 0.5, y: 0, w: 0.5, h: 1, slot: 'B' },
    ];
    case 'trio': return [
      { x: 0, y: 0, w: third, h: 1, slot: 'A' },
      { x: third, y: 0, w: third, h: 1, slot: 'B' },
      { x: 2 * third, y: 0, w: third, h: 1, slot: 'C' },
    ];
    case 'quad': return [
      { x: 0, y: 0, w: 0.5, h: 0.5, slot: 'A' },
      { x: 0.5, y: 0, w: 0.5, h: 0.5, slot: 'B' },
      { x: 0, y: 0.5, w: 0.5, h: 0.5, slot: 'C' },
      { x: 0.5, y: 0.5, w: 0.5, h: 0.5, slot: 'A' },
    ];
    case 'mosaic': return [
      { x: 0, y: 0, w: third, h: third, slot: 'A' },
      { x: third, y: 0, w: third, h: third, slot: 'B' },
      { x: 2 * third, y: 0, w: third, h: third, slot: 'C' },
      { x: 0, y: third, w: third, h: third, slot: 'B' },
      { x: third, y: third, w: third, h: third, slot: 'C' },
      { x: 2 * third, y: third, w: third, h: third, slot: 'A' },
      { x: 0, y: 2 * third, w: third, h: third, slot: 'C' },
      { x: third, y: 2 * third, w: third, h: third, slot: 'A' },
      { x: 2 * third, y: 2 * third, w: third, h: third, slot: 'B' },
    ];
    case 'stack': return [
      { x: 0, y: 0, w: 1, h: 0.62, slot: 'A' },
      { x: 0, y: 0.62, w: 0.5, h: 0.38, slot: 'B' },
      { x: 0.5, y: 0.62, w: 0.5, h: 0.38, slot: 'C' },
    ];
    default: return [{ x: 0, y: 0, w: 1, h: 1, slot: 'A' }];
  }
}

// How much the cover earns on its star meter: filled photo slots, a title and a
// tagline, and a multi-panel layout each lift it; the meter tops out at 10.
export function coverScore(state) {
  const filled = ['A', 'B', 'C'].filter((s) => state.photos[s] && state.photos[s].kind !== 'empty').length;
  const panels = layoutPanels(state.layout).length;
  let score = 5 + 0.8 * filled + (state.title.trim() ? 1 : 0) + (state.tagline.trim() ? 0.7 : 0) + (panels >= 4 ? 0.5 : 0);
  return Math.min(10, Math.round(score * 10) / 10);
}

function gradeFilter(grade) {
  switch (grade) {
    case 'neon': return 'saturate(1.5) contrast(1.12) brightness(0.96)';
    case 'gold': return 'sepia(0.25) saturate(1.3) contrast(1.05)';
    case 'dusk': return 'saturate(1.2) hue-rotate(-12deg) contrast(1.08)';
    case 'bubble': return 'saturate(1.6) contrast(1.05)';
    case 'noir': return 'grayscale(1) contrast(1.25) brightness(1.05)';
    default: return 'saturate(1.25) contrast(1.05)';
  }
}

function paintGradeWash(ctx, grade, w, h) {
  const bottom = ctx.createLinearGradient(0, h * 0.3, 0, h);
  const top = ctx.createLinearGradient(0, 0, 0, h * 0.4);
  const washes = {
    sunset: [['rgba(255,120,40,0)', 'rgba(232,62,140,0.38)'], ['rgba(255,170,60,0.12)', 'rgba(255,170,60,0)']],
    neon: [['rgba(0,229,255,0.08)', 'rgba(255,46,136,0.30)'], ['rgba(0,229,255,0.14)', 'rgba(0,229,255,0)']],
    gold: [['rgba(255,180,60,0.10)', 'rgba(255,122,24,0.24)'], ['rgba(255,214,106,0.18)', 'rgba(255,214,106,0)']],
    dusk: [['rgba(45,212,191,0.05)', 'rgba(124,58,237,0.30)'], ['rgba(45,212,191,0.16)', 'rgba(45,212,191,0)']],
    bubble: [['rgba(255,122,217,0.10)', 'rgba(34,211,238,0.22)'], ['rgba(255,122,217,0.20)', 'rgba(255,122,217,0)']],
    noir: [['rgba(0,0,0,0.05)', 'rgba(0,0,0,0.28)'], ['rgba(255,255,255,0.07)', 'rgba(255,255,255,0)']],
  };
  const wash = washes[grade] ?? washes.sunset;
  const [b0, b1] = wash[0];
  const [t0, t1] = wash[1];
  bottom.addColorStop(0, b0);
  bottom.addColorStop(1, b1);
  ctx.fillStyle = bottom;
  ctx.fillRect(0, 0, w, h);
  top.addColorStop(0, t0);
  top.addColorStop(1, t1);
  ctx.fillStyle = top;
  ctx.fillRect(0, 0, w, h);
  const vignette = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.75);
  vignette.addColorStop(0, 'rgba(10,4,24,0)');
  vignette.addColorStop(1, 'rgba(10,4,24,0.34)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);
}

function drawPhotoInto(ctx, photo, x, y, pw, ph, filter) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, pw, ph);
  ctx.clip();
  if (photo.kind === 'neon') {
    drawNeonAlley(ctx, x, y, pw, ph);
    ctx.restore();
    return;
  }
  if (!photo.img) {
    const g = ctx.createLinearGradient(x, y, x + pw, y + ph);
    g.addColorStop(0, '#3a2358');
    g.addColorStop(1, '#1c1030');
    ctx.fillStyle = g;
    ctx.fillRect(x, y, pw, ph);
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.font = `900 ${Math.round(Math.min(pw, ph) * 0.32)}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(photo.slot, x + pw / 2, y + ph / 2 - Math.min(pw, ph) * 0.08);
    ctx.font = `700 ${Math.max(10, Math.round(Math.min(pw, ph) * 0.07))}px system-ui, sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.fillText('ADD PHOTO', x + pw / 2, y + ph / 2 + Math.min(pw, ph) * 0.14);
    ctx.restore();
    return;
  }
  ctx.filter = filter;
  const iw = photo.img.naturalWidth;
  const ih = photo.img.naturalHeight;
  const zoom = photo.zoom || 1;
  const base = Math.max(pw / iw, ph / ih) * zoom;
  const dw = iw * base;
  const dh = ih * base;
  const dx = x + (pw - dw) / 2 + ((photo.ox || 0) / 100) * pw;
  // When a photo is cropped top and bottom, favour the top third, where faces
  // usually sit, instead of the dead centre.
  const vBias = dh > ph ? (ph - dh) * 0.15 : 0;
  const dy = y + (ph - dh) / 2 + vBias + ((photo.oy || 0) / 100) * ph;
  ctx.drawImage(photo.img, dx, dy, dw, dh);
  ctx.restore();
  ctx.filter = 'none';
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawStarPill(ctx, state, w, h, bandH) {
  const score = coverScore(state);
  const filled = Math.round(score / 2);
  const unit = Math.min(w, h);
  const starPx = Math.max(16, Math.round(unit * 0.028));
  const pad = Math.round(starPx * 0.55);
  ctx.font = `${starPx}px system-ui, sans-serif`;
  let starsW = 0;
  for (let i = 0; i < 5; i++) starsW += ctx.measureText('★').width + starPx * 0.08;
  ctx.font = `900 ${Math.round(starPx * 1.05)}px system-ui, sans-serif`;
  const scoreText = score.toFixed(1);
  const scoreW = ctx.measureText(scoreText).width;
  ctx.font = `800 ${Math.round(starPx * 0.52)}px system-ui, sans-serif`;
  const labelW = ctx.measureText('COVER SCORE').width;
  const pillW = pad * 2 + starsW + starPx * 0.35 + scoreW + starPx * 0.35 + labelW;
  const pillH = Math.round(starPx * 2.1);
  const px = Math.round(w * 0.03);
  const py = state.captionPos === 'top' ? Math.round(bandH + h * 0.025) : Math.round(h * 0.03);
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur = Math.round(starPx * 0.5);
  ctx.shadowOffsetY = Math.round(starPx * 0.12);
  ctx.fillStyle = '#ffffff';
  roundRect(ctx, px, py, pillW, pillH, pillH / 2);
  ctx.fill();
  ctx.restore();
  let cx = px + pad;
  const midY = py + pillH / 2;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.font = `${starPx}px system-ui, sans-serif`;
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = i < filled ? '#f5b301' : '#d9d3e8';
    const sw = ctx.measureText('★').width;
    ctx.fillText('★', cx, midY + starPx * 0.04);
    cx += sw + starPx * 0.08;
  }
  cx += starPx * 0.28;
  ctx.fillStyle = '#17102a';
  ctx.font = `900 ${Math.round(starPx * 1.05)}px system-ui, sans-serif`;
  ctx.fillText(scoreText, cx, midY + starPx * 0.04);
  cx += scoreW + starPx * 0.3;
  ctx.fillStyle = '#6d6484';
  ctx.font = `800 ${Math.round(starPx * 0.52)}px system-ui, sans-serif`;
  ctx.fillText('COVER SCORE', cx, midY + starPx * 0.04);
}

function drawCaption(ctx, state, w, h) {
  const unit = Math.min(w, h);
  const title = state.title.trim().toUpperCase();
  const tagline = state.tagline.trim().toUpperCase();
  if (!title && !tagline) return { bandH: 0 };
  let titlePx = unit * 0.095 * (state.titleScale || 1);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  if (title) {
    ctx.font = `900 ${Math.round(titlePx)}px "Arial Black", system-ui, sans-serif`;
    try { ctx.letterSpacing = '2px'; } catch { /* older canvas: ignore */ }
    while (ctx.measureText(title).width > w * 0.9 && titlePx > 14) {
      titlePx -= 2;
      ctx.font = `900 ${Math.round(titlePx)}px "Arial Black", system-ui, sans-serif`;
    }
  }
  const tagPx = Math.max(12, Math.round(titlePx * 0.26));
  const bandH = Math.round(titlePx * 1.15 + (tagline ? tagPx * 1.7 : titlePx * 0.35) + unit * 0.03);
  const bandY = state.captionPos === 'top' ? 0 : h - bandH;
  const scrim = ctx.createLinearGradient(0, bandY, 0, bandY + bandH);
  scrim.addColorStop(0, 'rgba(10,3,24,0.88)');
  scrim.addColorStop(1, 'rgba(10,3,24,0.72)');
  ctx.fillStyle = scrim;
  ctx.fillRect(0, bandY, w, bandH);
  const edgeY = state.captionPos === 'top' ? bandY + bandH : bandY;
  const edge = ctx.createLinearGradient(0, 0, w, 0);
  edge.addColorStop(0, '#ffb347');
  edge.addColorStop(0.5, '#ff2e88');
  edge.addColorStop(1, '#00e5ff');
  ctx.fillStyle = edge;
  ctx.fillRect(0, edgeY, w, Math.max(3, Math.round(unit * 0.006)));
  if (title) {
    const ty = bandY + bandH / 2 - (tagline ? tagPx * 0.55 : 0);
    ctx.font = `900 ${Math.round(titlePx)}px "Arial Black", system-ui, sans-serif`;
    ctx.lineJoin = 'round';
    if (state.lettering === 'glow') {
      ctx.shadowColor = '#ff2e88';
      ctx.shadowBlur = titlePx * 0.4;
      ctx.fillStyle = '#ffffff';
      ctx.fillText(title, w / 2, ty);
      ctx.shadowColor = '#00e5ff';
      ctx.shadowBlur = titlePx * 0.18;
      ctx.fillText(title, w / 2, ty);
      ctx.shadowBlur = 0;
    } else if (state.lettering === 'gradient') {
      const grad = ctx.createLinearGradient(0, ty - titlePx * 0.5, 0, ty + titlePx * 0.5);
      grad.addColorStop(0, '#ffd76a');
      grad.addColorStop(0.45, '#ff7a18');
      grad.addColorStop(0.75, '#ff2e88');
      grad.addColorStop(1, '#b967ff');
      ctx.strokeStyle = '#14060f';
      ctx.lineWidth = Math.max(2, titlePx * 0.06);
      ctx.strokeText(title, w / 2, ty);
      ctx.fillStyle = grad;
      ctx.fillText(title, w / 2, ty);
    } else {
      ctx.strokeStyle = '#14060f';
      ctx.lineWidth = Math.max(3, titlePx * 0.16);
      ctx.strokeText(title, w / 2, ty);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(title, w / 2, ty);
    }
  }
  if (tagline) {
    ctx.font = `700 ${tagPx}px system-ui, sans-serif`;
    try { ctx.letterSpacing = `${Math.max(2, tagPx * 0.28)}px`; } catch { /* ignore */ }
    ctx.fillStyle = '#ffe9f4';
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = tagPx * 0.3;
    ctx.fillText(tagline, w / 2, bandY + bandH - tagPx * 0.95);
    ctx.shadowBlur = 0;
  }
  try { ctx.letterSpacing = '0px'; } catch { /* ignore */ }
  return { bandH };
}

// Draws the whole cover onto `canvas` at its own pixel size. `opts.highlight`
// outlines the selected panel (preview only, never the export).
export function drawCover(canvas, state, opts = {}) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  ctx.filter = 'none';
  ctx.fillStyle = '#1a0f2e';
  ctx.fillRect(0, 0, w, h);
  const gutter = Math.max(2, Math.round(Math.min(w, h) * 0.008));
  const panels = layoutPanels(state.layout);
  const filter = gradeFilter(state.grade);
  panels.forEach((p) => {
    const x = Math.round(p.x * w) + (p.x > 0 ? gutter / 2 : 0);
    const y = Math.round(p.y * h) + (p.y > 0 ? gutter / 2 : 0);
    const pw = Math.round(p.w * w) - (p.x > 0 ? gutter / 2 : 0) - (p.x + p.w < 1 ? gutter / 2 : 0);
    const ph = Math.round(p.h * h) - (p.y > 0 ? gutter / 2 : 0) - (p.y + p.h < 1 ? gutter / 2 : 0);
    const photo = state.photos[p.slot] || { kind: 'empty', slot: p.slot };
    drawPhotoInto(ctx, { ...photo, slot: p.slot }, x, y, pw, ph, filter);
  });
  paintGradeWash(ctx, state.grade, w, h);
  const { bandH } = drawCaption(ctx, state, w, h);
  if (state.showScore !== false) drawStarPill(ctx, state, w, h, bandH);
  const frame = Math.max(3, Math.round(Math.min(w, h) * 0.006));
  ctx.strokeStyle = 'rgba(255,255,255,0.92)';
  ctx.lineWidth = frame;
  ctx.strokeRect(frame / 2, frame / 2, w - frame, h - frame);
  if (opts.highlight && state.selected != null) {
    const p = panels[state.selected];
    if (p) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = Math.max(3, Math.round(Math.min(w, h) * 0.008));
      ctx.setLineDash([Math.round(w * 0.02), Math.round(w * 0.012)]);
      ctx.strokeRect(p.x * w + 2, p.y * h + 2, p.w * w - 4, p.h * h - 4);
      ctx.setLineDash([]);
    }
  }
}
