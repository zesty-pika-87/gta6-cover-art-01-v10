// Neon Alley: a built-in backdrop the app draws itself, so a cover can have a
// neon street even with no photo. Every shape is procedural and deterministic —
// the same seed, the same street — and the sign is vector lettering, so its
// words stay razor sharp at any export size.
function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function drawPalm(ctx, x, y, s, lean) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(lean);
  ctx.scale(s, s);
  ctx.strokeStyle = '#12081f';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(8, -52, 2, -96);
  ctx.stroke();
  ctx.lineWidth = 5;
  for (let i = 0; i < 7; i++) {
    const a = -Math.PI * (0.12 + i * 0.11);
    ctx.beginPath();
    ctx.moveTo(2, -96);
    ctx.quadraticCurveTo(2 + Math.cos(a) * 34, -96 + Math.sin(a) * 26, 2 + Math.cos(a) * 62, -96 + Math.sin(a) * 52);
    ctx.stroke();
  }
  ctx.restore();
}

// Draws the alley inside the rectangle (x, y, w, h) on ctx.
export function drawNeonAlley(ctx, x, y, w, h) {
  const rand = mulberry32(20261120);
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.translate(x, y);
  const sky = ctx.createLinearGradient(0, 0, 0, h * 0.62);
  sky.addColorStop(0, '#1b0b3d');
  sky.addColorStop(0.55, '#7c1d5e');
  sky.addColorStop(1, '#ff7a18');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h * 0.62);
  const sunR = Math.min(w, h) * 0.2;
  const sunX = w * 0.5;
  const sunY = h * 0.52;
  const sun = ctx.createLinearGradient(0, sunY - sunR, 0, sunY + sunR);
  sun.addColorStop(0, '#ffe95e');
  sun.addColorStop(0.55, '#ff9a3d');
  sun.addColorStop(1, '#ff2e88');
  ctx.fillStyle = sun;
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#7c1d5e';
  let slitY = sunY + sunR * 0.08;
  let slitH = sunR * 0.05;
  while (slitY < sunY + sunR) {
    ctx.fillRect(sunX - sunR, slitY, sunR * 2, slitH);
    slitY += slitH + sunR * 0.13;
    slitH += sunR * 0.03;
  }
  const far = '#2a1145';
  const near = '#150826';
  let bx = 0;
  while (bx < w) {
    const bw = w * (0.07 + rand() * 0.09);
    const bh = h * (0.16 + rand() * 0.2);
    ctx.fillStyle = far;
    ctx.fillRect(bx, h * 0.62 - bh, bw, bh);
    bx += bw + w * 0.012;
  }
  bx = -w * 0.02;
  while (bx < w) {
    const bw = w * (0.09 + rand() * 0.11);
    const bh = h * (0.08 + rand() * 0.16);
    ctx.fillStyle = near;
    ctx.fillRect(bx, h * 0.62 - bh, bw, bh);
    ctx.fillStyle = 'rgba(255,214,106,0.85)';
    const cols = Math.floor(bw / (w * 0.03));
    const rows = Math.floor(bh / (h * 0.07));
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        if (rand() < 0.42) ctx.fillRect(bx + w * 0.012 + c * w * 0.03, h * 0.62 - bh + h * 0.02 + r * h * 0.07, w * 0.014, h * 0.03);
      }
    }
    bx += bw + w * 0.015;
  }
  const street = ctx.createLinearGradient(0, h * 0.62, 0, h);
  street.addColorStop(0, '#241536');
  street.addColorStop(1, '#0d0518');
  ctx.fillStyle = street;
  ctx.fillRect(0, h * 0.62, w, h * 0.38);
  const glow = ctx.createLinearGradient(0, h * 0.62, 0, h);
  glow.addColorStop(0, 'rgba(255,46,136,0.28)');
  glow.addColorStop(1, 'rgba(255,46,136,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(sunX - sunR * 1.1, h * 0.62, sunR * 2.2, h * 0.38);
  drawPalm(ctx, w * 0.06, h * 0.66, Math.min(w, h) * 0.0042, -0.1);
  drawPalm(ctx, w * 0.94, h * 0.64, Math.min(w, h) * 0.0038, 0.12);
  const signW = w * 0.52;
  const signH = h * 0.17;
  const signX = (w - signW) / 2;
  const signY = h * 0.2;
  ctx.save();
  ctx.shadowColor = '#00e5ff';
  ctx.shadowBlur = Math.min(w, h) * 0.03;
  ctx.fillStyle = '#0a0616';
  ctx.beginPath();
  ctx.roundRect(signX, signY, signW, signH, Math.min(w, h) * 0.02);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#00e5ff';
  ctx.lineWidth = Math.max(2, Math.min(w, h) * 0.005);
  ctx.beginPath();
  ctx.roundRect(signX, signY, signW, signH, Math.min(w, h) * 0.02);
  ctx.stroke();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const vicePx = signH * 0.52;
  ctx.font = `900 ${Math.round(vicePx)}px "Arial Black", system-ui, sans-serif`;
  ctx.shadowColor = '#ff2e88';
  ctx.shadowBlur = vicePx * 0.35;
  ctx.fillStyle = '#ffffff';
  ctx.fillText('VICE', w / 2, signY + signH * 0.34);
  ctx.shadowBlur = 0;
  ctx.font = `800 ${Math.round(signH * 0.2)}px system-ui, sans-serif`;
  try { ctx.letterSpacing = `${Math.round(signH * 0.06)}px`; } catch { /* ignore */ }
  ctx.fillStyle = '#7df3ff';
  ctx.fillText('NEON COAST', w / 2, signY + signH * 0.76);
  try { ctx.letterSpacing = '0px'; } catch { /* ignore */ }
  ctx.restore();
  ctx.restore();
}
