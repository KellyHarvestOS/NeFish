import { FishShape } from "@/data/fish";

export interface DrawParams {
  ctx: CanvasRenderingContext2D;
  len: number; // full body length in px
  wag: number; // tail wag -1..1
  t: number; // time seconds
  color: string;
  accent: string;
  accent2: string;
}

// All functions draw a fish facing +x, centred at origin.
// Caller applies translate / horizontal flip / rarity glow.

function eye(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#10202c";
  ctx.beginPath();
  ctx.arc(x + r * 0.25, y, r * 0.55, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.beginPath();
  ctx.arc(x + r * 0.05, y - r * 0.3, r * 0.18, 0, Math.PI * 2);
  ctx.fill();
}

function bodyGradient(
  ctx: CanvasRenderingContext2D,
  top: number,
  bottom: number,
  light: string,
  base: string,
) {
  const g = ctx.createLinearGradient(0, top, 0, bottom);
  g.addColorStop(0, light);
  g.addColorStop(0.55, base);
  g.addColorStop(1, base);
  return g;
}

// ---- streamlined slim (sardine) ----
function drawSardine(p: DrawParams) {
  const { ctx, len, wag, color, accent, accent2 } = p;
  const L = len / 2;
  const h = len * 0.2;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-L, 0);
  ctx.lineTo(-L - len * 0.18, -h * (0.9 + wag));
  ctx.lineTo(-L - len * 0.18, h * (0.9 - wag));
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = bodyGradient(ctx, -h, h, accent, color);
  ctx.beginPath();
  ctx.moveTo(L, 0);
  ctx.quadraticCurveTo(L * 0.2, -h, -L, 0);
  ctx.quadraticCurveTo(L * 0.2, h, L, 0);
  ctx.fill();
  ctx.strokeStyle = accent2;
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(L * 0.5, 0);
  ctx.lineTo(-L * 0.7, 0);
  ctx.stroke();
  ctx.globalAlpha = 1;
  eye(ctx, L * 0.55, -h * 0.1, h * 0.35);
}

// ---- clownfish: oval, rounded fins, 3 white bands ----
function drawClownfish(p: DrawParams) {
  const { ctx, len, wag, color, accent, accent2 } = p;
  const L = len / 2;
  const h = len * 0.42;
  // tail (rounded, fan)
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-L * 0.7, 0);
  ctx.quadraticCurveTo(-L * 1.25, -h * (0.9 + wag), -L * 1.15, -h * (0.3 + wag));
  ctx.quadraticCurveTo(-L * 1.05, 0, -L * 1.15, h * (0.3 - wag));
  ctx.quadraticCurveTo(-L * 1.25, h * (0.9 - wag), -L * 0.7, 0);
  ctx.fill();
  // pectoral fin
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(0, h * 0.45, h * 0.45, h * 0.28, 0.4, 0, Math.PI * 2);
  ctx.fill();
  // dorsal
  ctx.beginPath();
  ctx.moveTo(L * 0.1, -h);
  ctx.quadraticCurveTo(-L * 0.2, -h * 1.35, -L * 0.55, -h * 0.6);
  ctx.lineTo(-L * 0.2, -h * 0.6);
  ctx.fill();
  // body
  ctx.fillStyle = bodyGradient(ctx, -h, h, "#ffa94d", color);
  ctx.beginPath();
  ctx.ellipse(0, 0, L, h, 0, 0, Math.PI * 2);
  ctx.fill();
  // white bands with black trim
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(0, 0, L, h, 0, 0, Math.PI * 2);
  ctx.clip();
  const bands = [L * 0.55, -L * 0.05, -L * 0.6];
  bands.forEach((bx, i) => {
    ctx.fillStyle = accent2;
    ctx.fillRect(bx - h * 0.34, -h, h * 0.68, h * 2);
    ctx.fillStyle = accent;
    ctx.fillRect(bx - h * 0.24, -h, h * 0.48, h * 2);
  });
  ctx.restore();
  eye(ctx, L * 0.62, -h * 0.1, h * 0.22);
}

// ---- blue tang: disc, scalpel tail, yellow tail ----
function drawBlueTang(p: DrawParams) {
  const { ctx, len, wag, color, accent, accent2 } = p;
  const L = len / 2;
  const h = len * 0.5;
  // yellow tail
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.moveTo(-L * 0.7, 0);
  ctx.lineTo(-L * 1.15, -h * (0.6 + wag));
  ctx.lineTo(-L * 0.95, 0);
  ctx.lineTo(-L * 1.15, h * (0.6 - wag));
  ctx.closePath();
  ctx.fill();
  // body disc
  ctx.fillStyle = bodyGradient(ctx, -h, h, "#5a9bff", color);
  ctx.beginPath();
  ctx.moveTo(L * 0.95, 0);
  ctx.quadraticCurveTo(L * 0.2, -h, -L * 0.7, -h * 0.2);
  ctx.quadraticCurveTo(-L, 0, -L * 0.7, h * 0.2);
  ctx.quadraticCurveTo(L * 0.2, h, L * 0.95, 0);
  ctx.fill();
  // dorsal + anal fin edge (continuous)
  ctx.strokeStyle = accent2;
  ctx.lineWidth = h * 0.12;
  ctx.beginPath();
  ctx.moveTo(L * 0.6, -h * 0.78);
  ctx.quadraticCurveTo(-L * 0.4, -h * 1.05, -L * 0.7, -h * 0.2);
  ctx.stroke();
  // signature black "palette" mark
  ctx.fillStyle = accent2;
  ctx.beginPath();
  ctx.moveTo(L * 0.5, -h * 0.3);
  ctx.quadraticCurveTo(-L * 0.1, -h * 0.7, -L * 0.5, -h * 0.1);
  ctx.quadraticCurveTo(-L * 0.1, -h * 0.25, L * 0.5, h * 0.1);
  ctx.fill();
  eye(ctx, L * 0.6, -h * 0.18, h * 0.18);
}

// ---- butterflyfish: tall round disc, eyespot, pointed snout ----
function drawButterfly(p: DrawParams) {
  const { ctx, len, wag, color, accent, accent2 } = p;
  const L = len / 2;
  const h = len * 0.52;
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.moveTo(-L * 0.6, 0);
  ctx.lineTo(-L * 1.05, -h * (0.55 + wag));
  ctx.lineTo(-L * 1.05, h * (0.55 - wag));
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = bodyGradient(ctx, -h, h, "#fff0a0", color);
  ctx.beginPath();
  ctx.moveTo(L, 0); // pointed snout
  ctx.quadraticCurveTo(L * 0.4, -h, -L * 0.4, -h * 0.9);
  ctx.quadraticCurveTo(-L * 0.85, 0, -L * 0.4, h * 0.9);
  ctx.quadraticCurveTo(L * 0.4, h, L, 0);
  ctx.fill();
  // diagonal stripes
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(L, 0);
  ctx.quadraticCurveTo(L * 0.4, -h, -L * 0.4, -h * 0.9);
  ctx.quadraticCurveTo(-L * 0.85, 0, -L * 0.4, h * 0.9);
  ctx.quadraticCurveTo(L * 0.4, h, L, 0);
  ctx.clip();
  ctx.strokeStyle = "rgba(180,120,0,0.5)";
  ctx.lineWidth = 3;
  for (let i = -3; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(-L * 0.6 + i * h * 0.35, -h);
    ctx.lineTo(-L * 0.2 + i * h * 0.35, h);
    ctx.stroke();
  }
  ctx.restore();
  // eyespot near tail + dark eye band
  ctx.fillStyle = accent2;
  ctx.beginPath();
  ctx.arc(-L * 0.45, -h * 0.1, h * 0.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = h * 0.18;
  ctx.strokeStyle = accent2;
  ctx.beginPath();
  ctx.moveTo(L * 0.55, -h * 0.7);
  ctx.lineTo(L * 0.45, h * 0.7);
  ctx.stroke();
  eye(ctx, L * 0.62, -h * 0.05, h * 0.16);
}

// ---- angelfish: very tall, long trailing dorsal/anal fins ----
function drawAngelfish(p: DrawParams) {
  const { ctx, len, wag, t, color, accent, accent2 } = p;
  const L = len / 2;
  const h = len * 0.7;
  const flow = Math.sin(t * 3) * h * 0.12;
  // trailing fins
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.85;
  ctx.beginPath(); // dorsal
  ctx.moveTo(L * 0.1, -h * 0.6);
  ctx.quadraticCurveTo(-L * 0.2, -h * 1.5 + flow, -L * 0.9, -h * 1.2 + flow);
  ctx.quadraticCurveTo(-L * 0.3, -h * 0.7, L * 0.1, -h * 0.6);
  ctx.fill();
  ctx.beginPath(); // anal
  ctx.moveTo(L * 0.1, h * 0.6);
  ctx.quadraticCurveTo(-L * 0.2, h * 1.5 - flow, -L * 0.9, h * 1.2 - flow);
  ctx.quadraticCurveTo(-L * 0.3, h * 0.7, L * 0.1, h * 0.6);
  ctx.fill();
  ctx.globalAlpha = 1;
  // tail
  ctx.beginPath();
  ctx.moveTo(-L * 0.5, 0);
  ctx.lineTo(-L * 1.0, -h * (0.4 + wag));
  ctx.lineTo(-L * 1.0, h * (0.4 - wag));
  ctx.closePath();
  ctx.fill();
  // body diamond
  ctx.fillStyle = bodyGradient(ctx, -h * 0.6, h * 0.6, accent2, color);
  ctx.beginPath();
  ctx.moveTo(L * 0.85, 0);
  ctx.quadraticCurveTo(L * 0.2, -h * 0.65, -L * 0.5, 0);
  ctx.quadraticCurveTo(L * 0.2, h * 0.65, L * 0.85, 0);
  ctx.fill();
  // vertical bars
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(L * 0.85, 0);
  ctx.quadraticCurveTo(L * 0.2, -h * 0.65, -L * 0.5, 0);
  ctx.quadraticCurveTo(L * 0.2, h * 0.65, L * 0.85, 0);
  ctx.clip();
  ctx.fillStyle = accent2;
  [L * 0.45, L * 0.05, -L * 0.35].forEach((bx) => {
    ctx.fillRect(bx - h * 0.08, -h, h * 0.16, h * 2);
  });
  ctx.restore();
  eye(ctx, L * 0.55, -h * 0.08, h * 0.13);
}

// ---- seabass: classic bass, spiny dorsal ----
function drawSeabass(p: DrawParams) {
  const { ctx, len, wag, color, accent, accent2 } = p;
  const L = len / 2;
  const h = len * 0.32;
  // tail forked
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-L * 0.8, 0);
  ctx.lineTo(-L * 1.2, -h * (0.8 + wag));
  ctx.lineTo(-L * 0.95, 0);
  ctx.lineTo(-L * 1.2, h * (0.8 - wag));
  ctx.closePath();
  ctx.fill();
  // spiny dorsal fin
  ctx.fillStyle = accent2;
  ctx.beginPath();
  ctx.moveTo(L * 0.4, -h * 0.85);
  for (let i = 0; i <= 6; i++) {
    const x = L * 0.4 - (i / 6) * L * 0.9;
    ctx.lineTo(x, -h * (1.4 + (i % 2 ? 0.15 : 0)));
    ctx.lineTo(x - L * 0.07, -h * 0.85);
  }
  ctx.closePath();
  ctx.fill();
  // body
  ctx.fillStyle = bodyGradient(ctx, -h, h, accent, color);
  ctx.beginPath();
  ctx.moveTo(L, 0);
  ctx.quadraticCurveTo(L * 0.3, -h, -L * 0.8, -h * 0.25);
  ctx.quadraticCurveTo(-L, 0, -L * 0.8, h * 0.25);
  ctx.quadraticCurveTo(L * 0.3, h, L, 0);
  ctx.fill();
  // pectoral fin
  ctx.fillStyle = accent2;
  ctx.globalAlpha = 0.6;
  ctx.beginPath();
  ctx.ellipse(L * 0.2, h * 0.4, h * 0.4, h * 0.22, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  // gill line
  ctx.strokeStyle = accent2;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(L * 0.45, 0, h * 0.7, -1, 1);
  ctx.stroke();
  eye(ctx, L * 0.62, -h * 0.18, h * 0.24);
}

// ---- tuna: torpedo, crescent tail, finlets ----
function drawTuna(p: DrawParams) {
  const { ctx, len, wag, color, accent, accent2 } = p;
  const L = len / 2;
  const h = len * 0.26;
  // crescent tail
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-L * 0.85, 0);
  ctx.quadraticCurveTo(-L * 1.05, -h * (1.6 + wag), -L * 1.3, -h * (1.7 + wag));
  ctx.quadraticCurveTo(-L * 1.0, 0, -L * 1.3, h * (1.7 - wag));
  ctx.quadraticCurveTo(-L * 1.05, h * (1.6 - wag), -L * 0.85, 0);
  ctx.fill();
  // sickle dorsal + accent finlets
  ctx.fillStyle = accent2;
  ctx.beginPath();
  ctx.moveTo(L * 0.2, -h);
  ctx.quadraticCurveTo(-L * 0.1, -h * 2.1, -L * 0.3, -h * 0.9);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(L * 0.2, h);
  ctx.quadraticCurveTo(-L * 0.1, h * 1.8, -L * 0.3, h * 0.85);
  ctx.fill();
  for (let i = 0; i < 4; i++) {
    const x = -L * 0.45 - i * L * 0.12;
    ctx.beginPath();
    ctx.moveTo(x, -h * 0.6);
    ctx.lineTo(x - L * 0.06, -h * 0.95);
    ctx.lineTo(x - L * 0.1, -h * 0.6);
    ctx.fill();
  }
  // body
  ctx.fillStyle = bodyGradient(ctx, -h, h, accent, color);
  ctx.beginPath();
  ctx.moveTo(L, 0);
  ctx.quadraticCurveTo(L * 0.2, -h, -L * 0.85, 0);
  ctx.quadraticCurveTo(L * 0.2, h, L, 0);
  ctx.fill();
  // belly highlight
  ctx.fillStyle = "rgba(255,255,255,0.25)";
  ctx.beginPath();
  ctx.moveTo(L * 0.6, h * 0.2);
  ctx.quadraticCurveTo(-L * 0.2, h, -L * 0.7, h * 0.1);
  ctx.quadraticCurveTo(-L * 0.2, h * 0.5, L * 0.6, h * 0.2);
  ctx.fill();
  eye(ctx, L * 0.6, -h * 0.05, h * 0.3);
}

// ---- barracuda: long slender, underbite jaw ----
function drawBarracuda(p: DrawParams) {
  const { ctx, len, wag, color, accent, accent2 } = p;
  const L = len / 2;
  const h = len * 0.13;
  // forked tail
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-L * 0.9, 0);
  ctx.lineTo(-L * 1.15, -h * (1.6 + wag));
  ctx.lineTo(-L * 0.95, 0);
  ctx.lineTo(-L * 1.15, h * (1.6 - wag));
  ctx.closePath();
  ctx.fill();
  // two small dorsals
  ctx.fillStyle = accent2;
  ctx.beginPath();
  ctx.moveTo(L * 0.2, -h);
  ctx.lineTo(0, -h * 2.4);
  ctx.lineTo(-L * 0.1, -h);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-L * 0.4, -h);
  ctx.lineTo(-L * 0.55, -h * 2);
  ctx.lineTo(-L * 0.65, -h);
  ctx.fill();
  // body, elongated
  ctx.fillStyle = bodyGradient(ctx, -h * 1.4, h * 1.4, accent, color);
  ctx.beginPath();
  ctx.moveTo(L * 1.05, h * 0.5); // lower jaw protrudes
  ctx.lineTo(L * 1.1, -h * 0.2);
  ctx.quadraticCurveTo(L * 0.3, -h * 1.5, -L * 0.9, 0);
  ctx.quadraticCurveTo(L * 0.3, h * 1.5, L * 1.05, h * 0.5);
  ctx.fill();
  // jaw line with teeth
  ctx.strokeStyle = accent2;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(L * 1.08, h * 0.2);
  ctx.lineTo(L * 0.5, h * 0.1);
  ctx.stroke();
  ctx.fillStyle = "#fff";
  for (let i = 0; i < 4; i++) {
    ctx.fillRect(L * (0.95 - i * 0.12), h * 0.1, 2, 3);
  }
  // dark spots row
  ctx.fillStyle = accent2;
  ctx.globalAlpha = 0.5;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.arc(L * 0.2 - i * L * 0.25, h * 0.2, h * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  eye(ctx, L * 0.7, -h * 0.3, h * 0.5);
}

// ---- pufferfish: round spiky ball ----
function drawPuffer(p: DrawParams) {
  const { ctx, len, wag, color, accent, accent2 } = p;
  const R = len * 0.42;
  // tiny tail
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-R * 0.8, 0);
  ctx.quadraticCurveTo(-R * 1.3, -R * (0.4 + wag), -R * 1.1, 0);
  ctx.quadraticCurveTo(-R * 1.3, R * (0.4 - wag), -R * 0.8, 0);
  ctx.fill();
  // spikes
  ctx.fillStyle = accent2;
  for (let i = 0; i < 22; i++) {
    const a = (i / 22) * Math.PI * 2;
    const sx = Math.cos(a) * R;
    const sy = Math.sin(a) * R;
    ctx.beginPath();
    ctx.moveTo(sx * 0.9, sy * 0.9);
    ctx.lineTo(Math.cos(a) * R * 1.3, Math.sin(a) * R * 1.3);
    ctx.lineTo(Math.cos(a + 0.18) * R * 0.92, Math.sin(a + 0.18) * R * 0.92);
    ctx.fill();
  }
  // body sphere
  const g = ctx.createRadialGradient(R * 0.3, -R * 0.3, R * 0.2, 0, 0, R);
  g.addColorStop(0, accent);
  g.addColorStop(1, color);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, R, 0, Math.PI * 2);
  ctx.fill();
  // belly
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.beginPath();
  ctx.ellipse(R * 0.1, R * 0.45, R * 0.6, R * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();
  // dots
  ctx.fillStyle = accent2;
  for (let i = 0; i < 10; i++) {
    const a = Math.random();
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.arc(
      Math.cos(i * 2.3) * R * 0.5,
      Math.sin(i * 1.7) * R * 0.4 - R * 0.1,
      R * 0.07,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  eye(ctx, R * 0.5, -R * 0.25, R * 0.2);
}

// ---- hammerhead shark ----
function drawHammerhead(p: DrawParams) {
  const { ctx, len, wag, color, accent, accent2 } = p;
  const L = len / 2;
  const h = len * 0.16;
  // tall crescent tail (asymmetric)
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-L * 0.85, 0);
  ctx.lineTo(-L * 1.15, -h * (2.6 + wag));
  ctx.lineTo(-L * 0.92, -h * 0.3);
  ctx.lineTo(-L * 1.05, h * (1.1 - wag));
  ctx.closePath();
  ctx.fill();
  // dorsal fin (big triangle)
  ctx.beginPath();
  ctx.moveTo(L * 0.15, -h);
  ctx.lineTo(-L * 0.05, -h * 3.1);
  ctx.lineTo(-L * 0.35, -h);
  ctx.fill();
  // pectoral
  ctx.beginPath();
  ctx.moveTo(L * 0.2, h * 0.6);
  ctx.lineTo(L * 0.0, h * 2.4);
  ctx.lineTo(-L * 0.2, h * 0.6);
  ctx.fill();
  // body
  ctx.fillStyle = bodyGradient(ctx, -h * 1.4, h * 1.4, accent, color);
  ctx.beginPath();
  ctx.moveTo(L * 0.9, 0);
  ctx.quadraticCurveTo(L * 0.3, -h * 1.3, -L * 0.85, 0);
  ctx.quadraticCurveTo(L * 0.3, h * 1.3, L * 0.9, 0);
  ctx.fill();
  // hammer head
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(L * 0.92, 0, h * 0.5, h * 1.7, 0, 0, Math.PI * 2);
  ctx.fill();
  // eyes on the ends of the hammer
  eye(ctx, L * 0.95, -h * 1.5, h * 0.34);
  eye(ctx, L * 0.95, h * 1.5, h * 0.34);
  // gill slits
  ctx.strokeStyle = accent2;
  ctx.lineWidth = 1.4;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(L * 0.55 - i * h * 0.5, -h * 0.5);
    ctx.lineTo(L * 0.55 - i * h * 0.5, h * 0.5);
    ctx.stroke();
  }
}

// ---- manta ray: wide wings, flat (top view-ish) ----
function drawManta(p: DrawParams) {
  const { ctx, len, wag, t, color, accent, accent2 } = p;
  const L = len / 2;
  const flap = Math.sin(t * 2.4) * len * 0.18;
  // tail
  ctx.strokeStyle = color;
  ctx.lineWidth = len * 0.02;
  ctx.beginPath();
  ctx.moveTo(-L * 0.6, 0);
  ctx.lineTo(-L * 1.2, wag * len * 0.1);
  ctx.stroke();
  // wings
  ctx.fillStyle = bodyGradient(ctx, -len * 0.4, len * 0.4, accent, color);
  ctx.beginPath();
  ctx.moveTo(L * 0.5, 0);
  ctx.quadraticCurveTo(L * 0.1, -len * 0.5 - flap, -L * 0.9, -len * 0.12 - flap * 0.4);
  ctx.quadraticCurveTo(-L * 0.3, 0, -L * 0.9, len * 0.12 + flap * 0.4);
  ctx.quadraticCurveTo(L * 0.1, len * 0.5 + flap, L * 0.5, 0);
  ctx.fill();
  // cephalic fins (head horns)
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(L * 0.5, -len * 0.06);
  ctx.quadraticCurveTo(L * 0.85, -len * 0.12, L * 0.9, -len * 0.02);
  ctx.lineTo(L * 0.55, len * 0.02);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(L * 0.5, len * 0.06);
  ctx.quadraticCurveTo(L * 0.85, len * 0.12, L * 0.9, len * 0.02);
  ctx.lineTo(L * 0.55, -len * 0.02);
  ctx.fill();
  // top spots / shading
  ctx.fillStyle = accent2;
  ctx.globalAlpha = 0.4;
  ctx.beginPath();
  ctx.ellipse(0, 0, L * 0.45, len * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  eye(ctx, L * 0.55, -len * 0.05, len * 0.03);
}

// ---- whale shark: huge, spotted, wide mouth ----
function drawWhaleshark(p: DrawParams) {
  const { ctx, len, wag, color, accent, accent2 } = p;
  const L = len / 2;
  const h = len * 0.27;
  // tail
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-L * 0.85, 0);
  ctx.lineTo(-L * 1.2, -h * (1.8 + wag));
  ctx.lineTo(-L * 0.95, 0);
  ctx.lineTo(-L * 1.1, h * (1.0 - wag));
  ctx.closePath();
  ctx.fill();
  // dorsal + pectoral
  ctx.beginPath();
  ctx.moveTo(0, -h);
  ctx.lineTo(-L * 0.2, -h * 2.1);
  ctx.lineTo(-L * 0.45, -h);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(L * 0.1, h * 0.6);
  ctx.lineTo(-L * 0.1, h * 2.0);
  ctx.lineTo(-L * 0.35, h * 0.7);
  ctx.fill();
  // body — broad, flat head
  ctx.fillStyle = bodyGradient(ctx, -h, h, accent, color);
  ctx.beginPath();
  ctx.moveTo(L, h * 0.2);
  ctx.lineTo(L, -h * 0.7);
  ctx.quadraticCurveTo(L * 0.5, -h * 1.05, -L * 0.85, 0);
  ctx.quadraticCurveTo(L * 0.5, h * 1.05, L, h * 0.2);
  ctx.fill();
  // wide mouth
  ctx.strokeStyle = accent2;
  ctx.lineWidth = h * 0.12;
  ctx.beginPath();
  ctx.moveTo(L, -h * 0.1);
  ctx.lineTo(L * 0.78, -h * 0.05);
  ctx.stroke();
  // signature white spots in a grid
  ctx.fillStyle = accent;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(L, h * 0.2);
  ctx.lineTo(L, -h * 0.7);
  ctx.quadraticCurveTo(L * 0.5, -h * 1.05, -L * 0.85, 0);
  ctx.quadraticCurveTo(L * 0.5, h * 1.05, L, h * 0.2);
  ctx.clip();
  for (let yi = -2; yi <= 2; yi++) {
    for (let xi = -3; xi <= 3; xi++) {
      ctx.beginPath();
      ctx.arc(
        xi * L * 0.22 - L * 0.1 + (yi % 2) * L * 0.1,
        yi * h * 0.4,
        h * 0.1,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }
  ctx.restore();
  eye(ctx, L * 0.82, -h * 0.35, h * 0.16);
}

// ---- parrotfish: deep body, beak, bright bicolour ----
function drawParrot(p: DrawParams) {
  const { ctx, len, wag, color, accent, accent2 } = p;
  const L = len / 2;
  const h = len * 0.42;
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.moveTo(-L * 0.7, 0);
  ctx.quadraticCurveTo(-L * 1.2, -h * (0.9 + wag), -L * 1.05, 0);
  ctx.quadraticCurveTo(-L * 1.2, h * (0.9 - wag), -L * 0.7, 0);
  ctx.fill();
  ctx.fillStyle = bodyGradient(ctx, -h, h, accent, color);
  ctx.beginPath();
  ctx.ellipse(0, 0, L, h, 0, 0, Math.PI * 2);
  ctx.fill();
  // pink belly band
  ctx.fillStyle = accent;
  ctx.globalAlpha = 0.6;
  ctx.beginPath();
  ctx.ellipse(L * 0.2, h * 0.4, L * 0.7, h * 0.5, 0, 0, Math.PI);
  ctx.fill();
  ctx.globalAlpha = 1;
  // beak
  ctx.fillStyle = "#eef6f4";
  ctx.beginPath();
  ctx.moveTo(L * 0.92, -h * 0.18);
  ctx.quadraticCurveTo(L * 1.12, 0, L * 0.92, h * 0.18);
  ctx.lineTo(L * 0.8, 0);
  ctx.fill();
  ctx.strokeStyle = accent2;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(L * 0.8, 0);
  ctx.lineTo(L * 1.0, 0);
  ctx.stroke();
  eye(ctx, L * 0.55, -h * 0.2, h * 0.16);
}

// ---- lionfish: fan of venomous spines ----
function drawLionfish(p: DrawParams) {
  const { ctx, len, wag, color, accent, accent2 } = p;
  const L = len / 2;
  const h = len * 0.34;
  // spines radiating
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2;
  for (let i = -5; i <= 5; i++) {
    const a = (i / 5) * 1.2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(a - Math.PI / 2) * len * 0.7, Math.sin(a - Math.PI / 2) * len * 0.7);
    ctx.stroke();
  }
  for (let i = -4; i <= 4; i++) {
    const a = (i / 4) * 1.0;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(a + Math.PI / 2) * len * 0.6, Math.sin(a + Math.PI / 2) * len * 0.6);
    ctx.stroke();
  }
  // tail
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-L * 0.6, 0);
  ctx.lineTo(-L * 1.05, -h * (0.8 + wag));
  ctx.lineTo(-L * 1.05, h * (0.8 - wag));
  ctx.closePath();
  ctx.fill();
  // body
  ctx.fillStyle = bodyGradient(ctx, -h, h, accent, color);
  ctx.beginPath();
  ctx.ellipse(0, 0, L * 0.85, h, 0, 0, Math.PI * 2);
  ctx.fill();
  // stripes
  ctx.strokeStyle = accent2;
  ctx.lineWidth = 3;
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(i * L * 0.25, -h);
    ctx.lineTo(i * L * 0.25 - L * 0.05, h);
    ctx.stroke();
  }
  eye(ctx, L * 0.55, -h * 0.1, h * 0.2);
}

// ---- mahi-mahi: high blunt forehead, long dorsal ----
function drawMahimahi(p: DrawParams) {
  const { ctx, len, wag, color, accent, accent2 } = p;
  const L = len / 2;
  const h = len * 0.3;
  // forked tail
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-L * 0.85, 0);
  ctx.lineTo(-L * 1.2, -h * (1.2 + wag));
  ctx.lineTo(-L * 0.95, 0);
  ctx.lineTo(-L * 1.2, h * (1.2 - wag));
  ctx.closePath();
  ctx.fill();
  // long dorsal fin
  ctx.fillStyle = accent2;
  ctx.beginPath();
  ctx.moveTo(L * 0.55, -h * 1.05);
  ctx.quadraticCurveTo(0, -h * 1.7, -L * 0.7, -h * 0.6);
  ctx.lineTo(-L * 0.6, -h * 0.4);
  ctx.quadraticCurveTo(0, -h * 1.0, L * 0.5, -h * 0.7);
  ctx.fill();
  // body with high forehead
  ctx.fillStyle = bodyGradient(ctx, -h, h, accent, color);
  ctx.beginPath();
  ctx.moveTo(L * 0.95, h * 0.1);
  ctx.quadraticCurveTo(L * 0.7, -h * 1.0, L * 0.2, -h * 0.95);
  ctx.quadraticCurveTo(-L * 0.7, -h * 0.6, -L * 0.85, 0);
  ctx.quadraticCurveTo(-L * 0.5, h, L * 0.4, h * 0.85);
  ctx.quadraticCurveTo(L * 0.85, h * 0.6, L * 0.95, h * 0.1);
  ctx.fill();
  // spots
  ctx.fillStyle = accent2;
  ctx.globalAlpha = 0.5;
  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    ctx.arc(L * 0.3 - i * L * 0.18, -h * 0.2 + Math.sin(i) * h * 0.3, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  eye(ctx, L * 0.6, -h * 0.25, h * 0.16);
}

// ---- yellowfin tuna: like tuna but yellow finlets ----
function drawYellowfin(p: DrawParams) {
  const { ctx, len, wag, color, accent, accent2 } = p;
  const L = len / 2;
  const h = len * 0.26;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-L * 0.85, 0);
  ctx.quadraticCurveTo(-L * 1.05, -h * (1.6 + wag), -L * 1.3, -h * (1.7 + wag));
  ctx.quadraticCurveTo(-L * 1.0, 0, -L * 1.3, h * (1.7 - wag));
  ctx.quadraticCurveTo(-L * 1.05, h * (1.6 - wag), -L * 0.85, 0);
  ctx.fill();
  // long yellow sickle fins
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.moveTo(L * 0.2, -h);
  ctx.quadraticCurveTo(-L * 0.2, -h * 2.6, -L * 0.5, -h * 0.9);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(L * 0.2, h);
  ctx.quadraticCurveTo(-L * 0.2, h * 2.2, -L * 0.5, h * 0.85);
  ctx.fill();
  for (let i = 0; i < 5; i++) {
    const x = -L * 0.5 - i * L * 0.12;
    ctx.beginPath();
    ctx.moveTo(x, -h * 0.6);
    ctx.lineTo(x - L * 0.05, -h * 0.95);
    ctx.lineTo(x - L * 0.09, -h * 0.6);
    ctx.fill();
  }
  ctx.fillStyle = bodyGradient(ctx, -h, h, accent2, color);
  ctx.beginPath();
  ctx.moveTo(L, 0);
  ctx.quadraticCurveTo(L * 0.2, -h, -L * 0.85, 0);
  ctx.quadraticCurveTo(L * 0.2, h, L, 0);
  ctx.fill();
  // yellow lateral stripe
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(L * 0.6, 0);
  ctx.lineTo(-L * 0.7, 0);
  ctx.stroke();
  eye(ctx, L * 0.6, -h * 0.05, h * 0.28);
}

// ---- tarpon: large silver scales, upturned mouth ----
function drawTarpon(p: DrawParams) {
  const { ctx, len, wag, color, accent, accent2 } = p;
  const L = len / 2;
  const h = len * 0.26;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-L * 0.8, 0);
  ctx.lineTo(-L * 1.2, -h * (1.4 + wag));
  ctx.lineTo(-L * 0.95, 0);
  ctx.lineTo(-L * 1.2, h * (1.4 - wag));
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = bodyGradient(ctx, -h, h, accent, color);
  ctx.beginPath();
  ctx.moveTo(L, -h * 0.1);
  ctx.quadraticCurveTo(L * 0.3, -h * 1.1, -L * 0.8, 0);
  ctx.quadraticCurveTo(L * 0.3, h * 1.1, L, h * 0.2);
  ctx.lineTo(L * 1.02, -h * 0.5); // upturned lower jaw
  ctx.fill();
  // scale shimmer
  ctx.strokeStyle = accent;
  ctx.lineWidth = 0.6;
  ctx.globalAlpha = 0.5;
  for (let xx = -L * 0.6; xx < L * 0.7; xx += 7) {
    ctx.beginPath();
    ctx.arc(xx, 0, h * 0.7, -1, 1);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  // long trailing dorsal ray
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-L * 0.1, -h * 0.9);
  ctx.lineTo(-L * 0.7, -h * 0.4);
  ctx.stroke();
  eye(ctx, L * 0.6, -h * 0.25, h * 0.3);
}

// ---- grouper: huge mouth, blotchy heavy body ----
function drawGrouper(p: DrawParams) {
  const { ctx, len, wag, color, accent, accent2 } = p;
  const L = len / 2;
  const h = len * 0.4;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-L * 0.8, 0);
  ctx.quadraticCurveTo(-L * 1.15, -h * (0.8 + wag), -L * 1.0, 0);
  ctx.quadraticCurveTo(-L * 1.15, h * (0.8 - wag), -L * 0.8, 0);
  ctx.fill();
  ctx.fillStyle = bodyGradient(ctx, -h, h, accent, color);
  ctx.beginPath();
  ctx.moveTo(L, h * 0.15);
  ctx.quadraticCurveTo(L * 0.6, -h * 0.95, -L * 0.3, -h * 0.85);
  ctx.quadraticCurveTo(-L * 0.95, 0, -L * 0.3, h * 0.85);
  ctx.quadraticCurveTo(L * 0.4, h, L, h * 0.15);
  ctx.fill();
  // big mouth
  ctx.strokeStyle = accent2;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(L, h * 0.15);
  ctx.quadraticCurveTo(L * 0.78, h * 0.45, L * 0.6, h * 0.25);
  ctx.stroke();
  // blotches
  ctx.fillStyle = accent2;
  ctx.globalAlpha = 0.4;
  for (let i = 0; i < 12; i++) {
    ctx.beginPath();
    ctx.arc(L * 0.4 - Math.random() * L * 1.2, (Math.random() - 0.5) * h * 1.4, h * 0.12, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  eye(ctx, L * 0.62, -h * 0.3, h * 0.18);
}

// ---- marlin: long bill, tall sail-like dorsal ----
function drawMarlin(p: DrawParams) {
  const { ctx, len, wag, color, accent, accent2 } = p;
  const L = len / 2;
  const h = len * 0.17;
  // crescent tail
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-L * 0.85, 0);
  ctx.quadraticCurveTo(-L * 1.05, -h * (2 + wag), -L * 1.25, -h * (2.2 + wag));
  ctx.quadraticCurveTo(-L * 1.0, 0, -L * 1.25, h * (2.2 - wag));
  ctx.quadraticCurveTo(-L * 1.05, h * (2 - wag), -L * 0.85, 0);
  ctx.fill();
  // sail dorsal
  ctx.fillStyle = accent2;
  ctx.beginPath();
  ctx.moveTo(L * 0.35, -h);
  ctx.quadraticCurveTo(0, -h * 4, -L * 0.5, -h);
  ctx.fill();
  // body
  ctx.fillStyle = bodyGradient(ctx, -h * 1.2, h * 1.2, accent, color);
  ctx.beginPath();
  ctx.moveTo(L * 0.7, -h * 0.2);
  ctx.quadraticCurveTo(L * 0.2, -h * 1.3, -L * 0.85, 0);
  ctx.quadraticCurveTo(L * 0.2, h * 1.3, L * 0.7, h * 0.2);
  ctx.fill();
  // long bill
  ctx.strokeStyle = color;
  ctx.lineWidth = h * 0.5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(L * 0.65, -h * 0.1);
  ctx.lineTo(L * 1.35, -h * 0.2);
  ctx.stroke();
  // blue stripes
  ctx.strokeStyle = accent;
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.arc(L * 0.1 - i * L * 0.18, 0, h * 1.0, -1, 1);
    ctx.stroke();
  }
  eye(ctx, L * 0.55, -h * 0.2, h * 0.4);
}

// ---- swordfish: flat broad sword, tall fins ----
function drawSwordfish(p: DrawParams) {
  const { ctx, len, wag, color, accent, accent2 } = p;
  const L = len / 2;
  const h = len * 0.15;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-L * 0.85, 0);
  ctx.quadraticCurveTo(-L * 1.05, -h * (2.4 + wag), -L * 1.3, -h * (2.6 + wag));
  ctx.quadraticCurveTo(-L * 1.0, 0, -L * 1.3, h * (2.6 - wag));
  ctx.quadraticCurveTo(-L * 1.05, h * (2.4 - wag), -L * 0.85, 0);
  ctx.fill();
  // tall stiff dorsal
  ctx.fillStyle = accent2;
  ctx.beginPath();
  ctx.moveTo(L * 0.2, -h);
  ctx.lineTo(L * 0.0, -h * 4.2);
  ctx.lineTo(-L * 0.2, -h);
  ctx.fill();
  ctx.fillStyle = bodyGradient(ctx, -h * 1.3, h * 1.3, accent, color);
  ctx.beginPath();
  ctx.moveTo(L * 0.6, -h * 0.2);
  ctx.quadraticCurveTo(L * 0.2, -h * 1.4, -L * 0.85, 0);
  ctx.quadraticCurveTo(L * 0.2, h * 1.4, L * 0.6, h * 0.2);
  ctx.fill();
  // broad flat sword
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(L * 0.55, -h * 0.45);
  ctx.lineTo(L * 1.5, -h * 0.15);
  ctx.lineTo(L * 1.5, h * 0.05);
  ctx.lineTo(L * 0.55, h * 0.35);
  ctx.fill();
  eye(ctx, L * 0.5, -h * 0.3, h * 0.45);
}

// ---- tiger shark: blunt snout, vertical bars ----
function drawTigershark(p: DrawParams) {
  const { ctx, len, wag, color, accent, accent2 } = p;
  const L = len / 2;
  const h = len * 0.2;
  // tail (asymmetric)
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-L * 0.85, 0);
  ctx.lineTo(-L * 1.2, -h * (2.4 + wag));
  ctx.lineTo(-L * 0.95, -h * 0.2);
  ctx.lineTo(-L * 1.05, h * (1.0 - wag));
  ctx.closePath();
  ctx.fill();
  // dorsal
  ctx.beginPath();
  ctx.moveTo(L * 0.1, -h);
  ctx.lineTo(-L * 0.1, -h * 2.8);
  ctx.lineTo(-L * 0.4, -h);
  ctx.fill();
  // pectoral
  ctx.beginPath();
  ctx.moveTo(L * 0.25, h * 0.6);
  ctx.lineTo(L * 0.05, h * 2.2);
  ctx.lineTo(-L * 0.2, h * 0.6);
  ctx.fill();
  // body, blunt nose
  ctx.fillStyle = bodyGradient(ctx, -h * 1.3, h * 1.3, accent, color);
  ctx.beginPath();
  ctx.moveTo(L * 0.98, -h * 0.1);
  ctx.quadraticCurveTo(L * 0.7, -h * 1.2, -L * 0.2, -h * 0.9);
  ctx.quadraticCurveTo(-L * 0.85, 0, -L * 0.2, h * 0.9);
  ctx.quadraticCurveTo(L * 0.7, h * 1.0, L * 0.98, h * 0.25);
  ctx.fill();
  // tiger bars
  ctx.strokeStyle = accent2;
  ctx.lineWidth = 3;
  ctx.globalAlpha = 0.5;
  for (let i = 0; i < 6; i++) {
    const x = L * 0.5 - i * L * 0.22;
    ctx.beginPath();
    ctx.moveTo(x, -h * 1.0);
    ctx.lineTo(x - 3, h * 1.0);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  // gill slits
  ctx.strokeStyle = accent2;
  ctx.lineWidth = 1.4;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(L * 0.55 - i * h * 0.4, -h * 0.5);
    ctx.lineTo(L * 0.55 - i * h * 0.4, h * 0.5);
    ctx.stroke();
  }
  eye(ctx, L * 0.78, -h * 0.35, h * 0.18);
}

// ---- anchovy: tiny, very slim, big eye, silver stripe ----
function drawAnchovy(p: DrawParams) {
  const { ctx, len, wag, color, accent, accent2 } = p;
  const L = len / 2, h = len * 0.16;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-L * 0.8, 0);
  ctx.lineTo(-L * 1.05, -h * (1.3 + wag));
  ctx.lineTo(-L * 0.9, 0);
  ctx.lineTo(-L * 1.05, h * (1.3 - wag));
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = bodyGradient(ctx, -h, h, accent, color);
  ctx.beginPath();
  ctx.moveTo(L, 0);
  ctx.quadraticCurveTo(0, -h, -L * 0.8, 0);
  ctx.quadraticCurveTo(0, h, L, 0);
  ctx.fill();
  ctx.strokeStyle = "#eaf6ff";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(L * 0.6, -h * 0.1);
  ctx.lineTo(-L * 0.7, -h * 0.1);
  ctx.stroke();
  eye(ctx, L * 0.6, -h * 0.1, h * 0.55);
}

// ---- herring: slim, blue back / silver belly ----
function drawHerring(p: DrawParams) {
  const { ctx, len, wag, color, accent, accent2 } = p;
  const L = len / 2, h = len * 0.22;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-L * 0.75, 0);
  ctx.lineTo(-L * 1.1, -h * (1.1 + wag));
  ctx.lineTo(-L * 0.92, 0);
  ctx.lineTo(-L * 1.1, h * (1.1 - wag));
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = bodyGradient(ctx, -h, h, accent, color);
  ctx.beginPath();
  ctx.ellipse(0, 0, L, h, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.beginPath();
  ctx.ellipse(0, h * 0.45, L * 0.8, h * 0.4, 0, 0, Math.PI);
  ctx.fill();
  ctx.fillStyle = accent2;
  ctx.beginPath();
  ctx.moveTo(L * 0.1, -h);
  ctx.lineTo(-L * 0.1, -h * 1.4);
  ctx.lineTo(-L * 0.3, -h);
  ctx.fill();
  eye(ctx, L * 0.6, -h * 0.1, h * 0.3);
}

// ---- goby: big-headed bottom dweller, large pectoral ----
function drawGoby(p: DrawParams) {
  const { ctx, len, wag, color, accent, accent2 } = p;
  const L = len / 2, h = len * 0.3;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-L * 0.7, 0);
  ctx.quadraticCurveTo(-L * 1.0, -h * (0.7 + wag), -L * 0.95, 0);
  ctx.quadraticCurveTo(-L * 1.0, h * (0.7 - wag), -L * 0.7, 0);
  ctx.fill();
  ctx.fillStyle = bodyGradient(ctx, -h, h, accent, color);
  ctx.beginPath();
  ctx.moveTo(L, h * 0.2); // blunt head
  ctx.quadraticCurveTo(L * 0.9, -h * 0.9, L * 0.3, -h * 0.85);
  ctx.quadraticCurveTo(-L * 0.6, -h * 0.4, -L * 0.7, 0);
  ctx.quadraticCurveTo(-L * 0.5, h * 0.7, L * 0.2, h * 0.7);
  ctx.quadraticCurveTo(L * 0.8, h * 0.6, L, h * 0.2);
  ctx.fill();
  ctx.fillStyle = accent2;
  ctx.beginPath();
  ctx.ellipse(L * 0.1, h * 0.55, h * 0.55, h * 0.3, -0.2, 0, Math.PI * 2);
  ctx.fill();
  // mottled dorsal
  ctx.fillStyle = accent2;
  ctx.beginPath();
  ctx.moveTo(L * 0.3, -h * 0.85);
  ctx.quadraticCurveTo(-L * 0.1, -h * 1.3, -L * 0.4, -h * 0.5);
  ctx.lineTo(-L * 0.2, -h * 0.5);
  ctx.fill();
  eye(ctx, L * 0.7, -h * 0.35, h * 0.26);
}

// ---- wrasse: elongated, pointed snout, continuous dorsal ----
function drawWrasse(p: DrawParams) {
  const { ctx, len, wag, color, accent, accent2 } = p;
  const L = len / 2, h = len * 0.24;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-L * 0.8, 0);
  ctx.quadraticCurveTo(-L * 1.1, -h * (0.9 + wag), -L * 1.0, 0);
  ctx.quadraticCurveTo(-L * 1.1, h * (0.9 - wag), -L * 0.8, 0);
  ctx.fill();
  ctx.fillStyle = bodyGradient(ctx, -h, h, accent, color);
  ctx.beginPath();
  ctx.moveTo(L * 1.05, 0); // pointed snout
  ctx.quadraticCurveTo(L * 0.3, -h, -L * 0.8, 0);
  ctx.quadraticCurveTo(L * 0.3, h, L * 1.05, 0);
  ctx.fill();
  ctx.fillStyle = accent2;
  ctx.beginPath();
  ctx.moveTo(L * 0.5, -h * 0.85);
  ctx.quadraticCurveTo(-L * 0.3, -h * 1.15, -L * 0.7, -h * 0.5);
  ctx.lineTo(-L * 0.5, -h * 0.55);
  ctx.quadraticCurveTo(-L * 0.1, -h * 0.85, L * 0.5, -h * 0.6);
  ctx.fill();
  // diagonal markings
  ctx.strokeStyle = accent2;
  ctx.globalAlpha = 0.4;
  ctx.lineWidth = 2;
  for (let i = -1; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(i * L * 0.3, -h);
    ctx.lineTo(i * L * 0.3 - L * 0.15, h);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  eye(ctx, L * 0.62, -h * 0.1, h * 0.22);
}

// ---- horse mackerel: streamlined with lateral scutes ----
function drawHorseMackerel(p: DrawParams) {
  const { ctx, len, wag, color, accent, accent2 } = p;
  const L = len / 2, h = len * 0.2;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-L * 0.8, 0);
  ctx.lineTo(-L * 1.15, -h * (1.4 + wag));
  ctx.lineTo(-L * 0.92, 0);
  ctx.lineTo(-L * 1.15, h * (1.4 - wag));
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = bodyGradient(ctx, -h, h, accent, color);
  ctx.beginPath();
  ctx.moveTo(L, 0);
  ctx.quadraticCurveTo(L * 0.2, -h, -L * 0.8, 0);
  ctx.quadraticCurveTo(L * 0.2, h, L, 0);
  ctx.fill();
  // scute line of dashes
  ctx.fillStyle = accent2;
  for (let xx = L * 0.5; xx > -L * 0.7; xx -= L * 0.12) {
    ctx.fillRect(xx, -1.5, 4, 3);
  }
  ctx.fillStyle = accent2;
  ctx.beginPath();
  ctx.moveTo(L * 0.2, -h);
  ctx.lineTo(-L * 0.1, -h * 1.5);
  ctx.lineTo(-L * 0.3, -h);
  ctx.fill();
  eye(ctx, L * 0.6, -h * 0.1, h * 0.32);
}

// ---- sea bream: deep oval, steep forehead ----
function drawSeabream(p: DrawParams) {
  const { ctx, len, wag, color, accent, accent2 } = p;
  const L = len / 2, h = len * 0.42;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-L * 0.7, 0);
  ctx.lineTo(-L * 1.05, -h * (0.7 + wag));
  ctx.lineTo(-L * 0.88, 0);
  ctx.lineTo(-L * 1.05, h * (0.7 - wag));
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = bodyGradient(ctx, -h, h, accent, color);
  ctx.beginPath();
  ctx.moveTo(L * 0.92, h * 0.1);
  ctx.quadraticCurveTo(L * 0.5, -h * 1.0, -L * 0.1, -h * 0.95);
  ctx.quadraticCurveTo(-L * 0.8, 0, -L * 0.1, h * 0.95);
  ctx.quadraticCurveTo(L * 0.5, h, L * 0.92, h * 0.1);
  ctx.fill();
  ctx.strokeStyle = accent2;
  ctx.lineWidth = h * 0.1;
  ctx.beginPath();
  ctx.moveTo(0, -h * 0.95);
  ctx.quadraticCurveTo(-L * 0.2, -h * 1.2, -L * 0.4, -h * 0.7);
  ctx.stroke();
  // golden cheek spot
  ctx.fillStyle = accent;
  ctx.globalAlpha = 0.6;
  ctx.beginPath();
  ctx.arc(L * 0.4, 0, h * 0.18, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  eye(ctx, L * 0.6, -h * 0.25, h * 0.16);
}

// ---- foxface: tall yellow body with black face mask ----
function drawFoxface(p: DrawParams) {
  const { ctx, len, wag, color, accent, accent2 } = p;
  const L = len / 2, h = len * 0.5;
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.moveTo(-L * 0.6, 0);
  ctx.lineTo(-L * 1.0, -h * (0.55 + wag));
  ctx.lineTo(-L * 1.0, h * (0.55 - wag));
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = bodyGradient(ctx, -h, h, accent, color);
  ctx.beginPath();
  ctx.moveTo(L, -h * 0.1);
  ctx.quadraticCurveTo(L * 0.5, -h, -L * 0.3, -h * 0.85);
  ctx.quadraticCurveTo(-L * 0.8, 0, -L * 0.3, h * 0.85);
  ctx.quadraticCurveTo(L * 0.5, h, L, h * 0.1);
  ctx.fill();
  // black pointed face mask
  ctx.fillStyle = accent2;
  ctx.beginPath();
  ctx.moveTo(L * 1.02, -h * 0.05);
  ctx.lineTo(L * 0.55, -h * 0.6);
  ctx.lineTo(L * 0.4, h * 0.1);
  ctx.lineTo(L * 0.85, h * 0.2);
  ctx.closePath();
  ctx.fill();
  // spiny dorsal hint
  ctx.strokeStyle = accent2;
  ctx.lineWidth = 2;
  for (let i = 0; i < 5; i++) {
    const x = L * 0.3 - i * L * 0.18;
    ctx.beginPath();
    ctx.moveTo(x, -h * 0.8);
    ctx.lineTo(x, -h * 1.05);
    ctx.stroke();
  }
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(L * 0.78, -h * 0.2, h * 0.1, 0, Math.PI * 2);
  ctx.fill();
}

// ---- snapper: sloped head, forked tail, reddish ----
function drawSnapper(p: DrawParams) {
  const { ctx, len, wag, color, accent, accent2 } = p;
  const L = len / 2, h = len * 0.34;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-L * 0.8, 0);
  ctx.lineTo(-L * 1.15, -h * (0.9 + wag));
  ctx.lineTo(-L * 0.92, 0);
  ctx.lineTo(-L * 1.15, h * (0.9 - wag));
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = bodyGradient(ctx, -h, h, accent, color);
  ctx.beginPath();
  ctx.moveTo(L, h * 0.05);
  ctx.lineTo(L * 0.78, -h * 0.55); // sloped forehead
  ctx.quadraticCurveTo(L * 0.2, -h, -L * 0.8, 0);
  ctx.quadraticCurveTo(L * 0.2, h, L, h * 0.3);
  ctx.fill();
  ctx.strokeStyle = accent2;
  ctx.lineWidth = h * 0.1;
  ctx.beginPath();
  ctx.moveTo(L * 0.55, -h * 0.6);
  ctx.quadraticCurveTo(-L * 0.2, -h * 1.0, -L * 0.7, -h * 0.4);
  ctx.stroke();
  eye(ctx, L * 0.62, -h * 0.2, h * 0.2);
}

// ---- triggerfish: compressed rhombus, twin dorsals ----
function drawTriggerfish(p: DrawParams) {
  const { ctx, len, wag, color, accent, accent2 } = p;
  const L = len / 2, h = len * 0.44;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-L * 0.7, 0);
  ctx.quadraticCurveTo(-L * 1.0, -h * (0.5 + wag), -L * 0.9, 0);
  ctx.quadraticCurveTo(-L * 1.0, h * (0.5 - wag), -L * 0.7, 0);
  ctx.fill();
  ctx.fillStyle = bodyGradient(ctx, -h, h, accent, color);
  ctx.beginPath();
  ctx.moveTo(L * 0.95, -h * 0.15);
  ctx.quadraticCurveTo(L * 0.4, -h * 0.95, -L * 0.4, -h * 0.6);
  ctx.quadraticCurveTo(-L * 0.75, 0, -L * 0.4, h * 0.6);
  ctx.quadraticCurveTo(L * 0.4, h * 0.95, L * 0.95, h * 0.2);
  ctx.fill();
  // trigger spine + second dorsal/anal
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.moveTo(L * 0.1, -h * 0.7);
  ctx.lineTo(L * 0.1, -h * 1.15);
  ctx.lineTo(-L * 0.05, -h * 0.7);
  ctx.fill();
  ctx.strokeStyle = accent;
  ctx.lineWidth = h * 0.18;
  ctx.beginPath();
  ctx.moveTo(-L * 0.4, -h * 0.6);
  ctx.quadraticCurveTo(-L * 0.6, 0, -L * 0.4, h * 0.6);
  ctx.stroke();
  // pattern dots
  ctx.fillStyle = accent2;
  ctx.globalAlpha = 0.4;
  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    ctx.arc((Math.random() - 0.6) * L, (Math.random() - 0.5) * h, h * 0.07, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  eye(ctx, L * 0.62, -h * 0.2, h * 0.14);
}

// ---- mola (sunfish): giant disc with clavus, top/bottom fins ----
function drawMola(p: DrawParams) {
  const { ctx, len, t, color, accent, accent2 } = p;
  const R = len * 0.46;
  const flap = Math.sin(t * 3) * R * 0.12;
  // tall dorsal + anal fins
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(R * 0.2, -R * 0.7);
  ctx.quadraticCurveTo(-R * 0.1, -R * 1.5 - flap, -R * 0.4, -R * 0.6);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(R * 0.2, R * 0.7);
  ctx.quadraticCurveTo(-R * 0.1, R * 1.5 + flap, -R * 0.4, R * 0.6);
  ctx.fill();
  // body disc + clavus
  ctx.fillStyle = bodyGradient(ctx, -R, R, accent, color);
  ctx.beginPath();
  ctx.moveTo(R, 0);
  ctx.quadraticCurveTo(R * 0.7, -R, 0, -R);
  ctx.quadraticCurveTo(-R * 0.9, -R * 0.7, -R * 0.95, 0);
  ctx.quadraticCurveTo(-R * 0.9, R * 0.7, 0, R);
  ctx.quadraticCurveTo(R * 0.7, R, R, 0);
  ctx.fill();
  // rough skin speckles
  ctx.fillStyle = accent2;
  ctx.globalAlpha = 0.25;
  for (let i = 0; i < 16; i++) {
    ctx.beginPath();
    ctx.arc((Math.random() - 0.5) * R * 1.4, (Math.random() - 0.5) * R * 1.6, R * 0.05, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  // small mouth
  ctx.strokeStyle = accent2;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(R * 0.85, R * 0.1, R * 0.08, 0, Math.PI);
  ctx.stroke();
  eye(ctx, R * 0.78, -R * 0.15, R * 0.1);
}

// ---- sailfish: huge sail, long bill ----
function drawSailfish(p: DrawParams) {
  const { ctx, len, wag, t, color, accent, accent2 } = p;
  const L = len / 2, h = len * 0.13;
  const ripple = Math.sin(t * 4) * h * 0.4;
  // crescent tail
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-L * 0.85, 0);
  ctx.quadraticCurveTo(-L * 1.05, -h * (2.4 + wag), -L * 1.3, -h * (2.6 + wag));
  ctx.quadraticCurveTo(-L * 1.0, 0, -L * 1.3, h * (2.6 - wag));
  ctx.quadraticCurveTo(-L * 1.05, h * (2.4 - wag), -L * 0.85, 0);
  ctx.fill();
  // giant sail
  ctx.fillStyle = accent2;
  ctx.beginPath();
  ctx.moveTo(L * 0.5, -h);
  ctx.quadraticCurveTo(L * 0.1, -h * 7 + ripple, -L * 0.3, -h * 6.5);
  ctx.quadraticCurveTo(-L * 0.45, -h * 2, -L * 0.6, -h);
  ctx.fill();
  ctx.fillStyle = accent;
  ctx.globalAlpha = 0.35;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.arc(L * 0.2 - i * L * 0.18, -h * 4, h * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  // body
  ctx.fillStyle = bodyGradient(ctx, -h * 1.2, h * 1.2, accent, color);
  ctx.beginPath();
  ctx.moveTo(L * 0.7, -h * 0.2);
  ctx.quadraticCurveTo(L * 0.2, -h * 1.2, -L * 0.85, 0);
  ctx.quadraticCurveTo(L * 0.2, h * 1.2, L * 0.7, h * 0.2);
  ctx.fill();
  // long bill
  ctx.strokeStyle = color;
  ctx.lineWidth = h * 0.45;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(L * 0.65, -h * 0.1);
  ctx.lineTo(L * 1.45, -h * 0.25);
  ctx.stroke();
  eye(ctx, L * 0.55, -h * 0.2, h * 0.4);
}

// ---- pompano: diamond body, deeply forked tail ----
function drawPompano(p: DrawParams) {
  const { ctx, len, wag, color, accent, accent2 } = p;
  const L = len / 2, h = len * 0.4;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-L * 0.7, 0);
  ctx.lineTo(-L * 1.15, -h * (1.1 + wag));
  ctx.lineTo(-L * 0.9, 0);
  ctx.lineTo(-L * 1.15, h * (1.1 - wag));
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = bodyGradient(ctx, -h, h, "#ffffff", color);
  ctx.beginPath();
  ctx.moveTo(L * 0.92, 0);
  ctx.quadraticCurveTo(L * 0.4, -h, -L * 0.2, -h * 0.5);
  ctx.quadraticCurveTo(-L * 0.7, 0, -L * 0.2, h * 0.5);
  ctx.quadraticCurveTo(L * 0.4, h, L * 0.92, 0);
  ctx.fill();
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.ellipse(L * 0.1, h * 0.4, L * 0.6, h * 0.4, 0, 0, Math.PI);
  ctx.fill();
  ctx.fillStyle = accent2;
  ctx.beginPath();
  ctx.moveTo(L * 0.1, -h * 0.55);
  ctx.quadraticCurveTo(-L * 0.2, -h * 0.9, -L * 0.3, -h * 0.4);
  ctx.fill();
  eye(ctx, L * 0.6, -h * 0.05, h * 0.16);
}

// ---- wahoo: very elongated, vertical bars ----
function drawWahoo(p: DrawParams) {
  const { ctx, len, wag, color, accent, accent2 } = p;
  const L = len / 2, h = len * 0.13;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-L * 0.85, 0);
  ctx.lineTo(-L * 1.1, -h * (1.7 + wag));
  ctx.lineTo(-L * 0.92, 0);
  ctx.lineTo(-L * 1.1, h * (1.7 - wag));
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = bodyGradient(ctx, -h * 1.3, h * 1.3, accent, color);
  ctx.beginPath();
  ctx.moveTo(L * 1.1, 0); // beak snout
  ctx.quadraticCurveTo(L * 0.2, -h * 1.4, -L * 0.85, 0);
  ctx.quadraticCurveTo(L * 0.2, h * 1.4, L * 1.1, 0);
  ctx.fill();
  // dorsal ridge
  ctx.strokeStyle = accent2;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(L * 0.4, -h * 1.1);
  ctx.lineTo(-L * 0.6, -h * 0.6);
  ctx.stroke();
  // tiger bars
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2.5;
  ctx.globalAlpha = 0.6;
  for (let i = 0; i < 9; i++) {
    const x = L * 0.5 - i * L * 0.16;
    ctx.beginPath();
    ctx.moveTo(x, -h * 1.2);
    ctx.lineTo(x, h * 1.2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  eye(ctx, L * 0.62, -h * 0.1, h * 0.5);
}

// ---- trevally (GT): deep jack body, steep blunt head ----
function drawTrevally(p: DrawParams) {
  const { ctx, len, wag, color, accent, accent2 } = p;
  const L = len / 2, h = len * 0.42;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-L * 0.75, 0);
  ctx.lineTo(-L * 1.2, -h * (1.0 + wag));
  ctx.lineTo(-L * 0.95, 0);
  ctx.lineTo(-L * 1.2, h * (1.0 - wag));
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = bodyGradient(ctx, -h, h, accent, color);
  ctx.beginPath();
  ctx.moveTo(L * 0.95, h * 0.15);
  ctx.lineTo(L * 0.82, -h * 0.5); // steep head
  ctx.quadraticCurveTo(L * 0.2, -h, -L * 0.75, 0);
  ctx.quadraticCurveTo(L * 0.2, h, L * 0.95, h * 0.15);
  ctx.fill();
  ctx.fillStyle = accent2;
  ctx.beginPath();
  ctx.moveTo(L * 0.4, -h * 0.85);
  ctx.quadraticCurveTo(-L * 0.2, -h * 1.1, -L * 0.6, -h * 0.4);
  ctx.lineTo(-L * 0.4, -h * 0.45);
  ctx.fill();
  // scute dashes near tail
  ctx.fillStyle = accent2;
  for (let xx = -L * 0.2; xx > -L * 0.7; xx -= L * 0.1) ctx.fillRect(xx, -1.5, 4, 3);
  eye(ctx, L * 0.66, -h * 0.2, h * 0.16);
}

// ---- napoleon (humphead) wrasse: bulbous forehead, thick lips ----
function drawNapoleon(p: DrawParams) {
  const { ctx, len, wag, color, accent, accent2 } = p;
  const L = len / 2, h = len * 0.44;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-L * 0.7, 0);
  ctx.quadraticCurveTo(-L * 1.05, -h * (0.8 + wag), -L * 0.92, 0);
  ctx.quadraticCurveTo(-L * 1.05, h * (0.8 - wag), -L * 0.7, 0);
  ctx.fill();
  ctx.fillStyle = bodyGradient(ctx, -h, h, accent, color);
  ctx.beginPath();
  ctx.moveTo(L * 0.78, h * 0.3); // thick lips
  ctx.quadraticCurveTo(L * 1.05, -h * 0.1, L * 0.8, -h * 0.45);
  ctx.quadraticCurveTo(L * 0.95, -h * 1.05, L * 0.45, -h * 0.95); // forehead hump
  ctx.quadraticCurveTo(-L * 0.4, -h * 0.6, -L * 0.7, 0);
  ctx.quadraticCurveTo(-L * 0.3, h * 0.9, L * 0.45, h * 0.9);
  ctx.quadraticCurveTo(L * 0.75, h * 0.7, L * 0.78, h * 0.3);
  ctx.fill();
  // maze pattern lines
  ctx.strokeStyle = accent2;
  ctx.globalAlpha = 0.4;
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.arc(L * 0.1 - i * L * 0.22, 0, h * 0.7, -1, 1);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  eye(ctx, L * 0.66, -h * 0.25, h * 0.13);
}

// ---- great white shark: conical snout, counter-shading, teeth ----
function drawGreatWhite(p: DrawParams) {
  const { ctx, len, wag, color, accent, accent2 } = p;
  const L = len / 2, h = len * 0.2;
  // crescent tail
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-L * 0.85, 0);
  ctx.lineTo(-L * 1.18, -h * (2.4 + wag));
  ctx.lineTo(-L * 0.95, -h * 0.2);
  ctx.lineTo(-L * 1.05, h * (1.4 - wag));
  ctx.closePath();
  ctx.fill();
  // big dorsal
  ctx.beginPath();
  ctx.moveTo(L * 0.15, -h);
  ctx.lineTo(-L * 0.05, -h * 3.2);
  ctx.lineTo(-L * 0.45, -h);
  ctx.fill();
  // pectoral
  ctx.beginPath();
  ctx.moveTo(L * 0.3, h * 0.6);
  ctx.lineTo(L * 0.05, h * 2.6);
  ctx.lineTo(-L * 0.25, h * 0.6);
  ctx.fill();
  // body
  ctx.fillStyle = bodyGradient(ctx, -h * 1.3, h * 1.3, accent, color);
  ctx.beginPath();
  ctx.moveTo(L * 1.02, -h * 0.05); // conical snout
  ctx.quadraticCurveTo(L * 0.7, -h * 1.25, -L * 0.2, -h * 0.95);
  ctx.quadraticCurveTo(-L * 0.85, 0, -L * 0.2, h * 0.95);
  ctx.quadraticCurveTo(L * 0.7, h * 1.0, L * 1.02, h * 0.25);
  ctx.fill();
  // white belly counter-shading
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.beginPath();
  ctx.moveTo(L * 0.95, h * 0.2);
  ctx.quadraticCurveTo(L * 0.2, h * 1.0, -L * 0.6, h * 0.4);
  ctx.quadraticCurveTo(L * 0.2, h * 0.55, L * 0.95, h * 0.2);
  ctx.fill();
  // mouth + teeth
  ctx.strokeStyle = accent2;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(L * 0.98, h * 0.2);
  ctx.quadraticCurveTo(L * 0.72, h * 0.5, L * 0.5, h * 0.3);
  ctx.stroke();
  ctx.fillStyle = "#fff";
  for (let i = 0; i < 6; i++) ctx.fillRect(L * (0.9 - i * 0.08), h * 0.32, 2, 4);
  // gills
  ctx.strokeStyle = accent2;
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(L * 0.5 - i * h * 0.4, -h * 0.4);
    ctx.lineTo(L * 0.5 - i * h * 0.4, h * 0.5);
    ctx.stroke();
  }
  eye(ctx, L * 0.8, -h * 0.3, h * 0.14);
}

// ---- mythic: diamond fish (faceted crystalline body) ----
function drawDiamond(p: DrawParams) {
  const { ctx, len, wag, t, color, accent, accent2 } = p;
  const L = len / 2, h = len * 0.34;
  // tail (crystal shards)
  ctx.fillStyle = accent2;
  ctx.beginPath();
  ctx.moveTo(-L * 0.7, 0);
  ctx.lineTo(-L * 1.1, -h * (1 + wag));
  ctx.lineTo(-L * 0.85, 0);
  ctx.lineTo(-L * 1.1, h * (1 - wag));
  ctx.closePath();
  ctx.fill();
  // faceted body via triangles
  const facets: [number, number][] = [
    [L, 0], [L * 0.4, -h], [-L * 0.2, -h * 0.7],
    [-L * 0.7, 0], [-L * 0.2, h * 0.7], [L * 0.4, h],
  ];
  const cx = 0, cy = 0;
  for (let i = 0; i < facets.length; i++) {
    const a = facets[i], b = facets[(i + 1) % facets.length];
    const shade = 0.5 + 0.5 * Math.sin(t * 2 + i);
    ctx.fillStyle = `rgba(${180 + shade * 60}, ${230 + shade * 25}, 255, 0.92)`;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(a[0], a[1]);
    ctx.lineTo(b[0], b[1]);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.8)";
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  // sparkle highlights
  ctx.fillStyle = "#ffffff";
  for (let i = 0; i < 5; i++) {
    const s = (Math.sin(t * 5 + i * 2) + 1) * 0.5;
    ctx.globalAlpha = s;
    ctx.beginPath();
    ctx.arc(facets[i][0] * 0.6, facets[i][1] * 0.6, 2 + s * 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  eye(ctx, L * 0.55, -h * 0.1, h * 0.16);
}

// ---- mythic: radioactive fish (green glow, mutated fins) ----
function drawRadioactive(p: DrawParams) {
  const { ctx, len, wag, t, color, accent, accent2 } = p;
  const L = len / 2, h = len * 0.3;
  ctx.save();
  ctx.shadowColor = "#aaff33";
  ctx.shadowBlur = 24 + Math.sin(t * 6) * 8;
  // mutated extra fins (trefoil-ish lobes)
  ctx.fillStyle = accent;
  for (const sgn of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(-L * 0.1, sgn * h * 0.6);
    ctx.quadraticCurveTo(-L * 0.3, sgn * h * 1.8, -L * 0.6, sgn * h * 1.2);
    ctx.quadraticCurveTo(-L * 0.4, sgn * h * 0.7, -L * 0.1, sgn * h * 0.6);
    ctx.fill();
  }
  // tail
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-L * 0.7, 0);
  ctx.lineTo(-L * 1.15, -h * (1.2 + wag));
  ctx.lineTo(-L * 0.9, 0);
  ctx.lineTo(-L * 1.15, h * (1.2 - wag));
  ctx.closePath();
  ctx.fill();
  // body
  ctx.fillStyle = bodyGradient(ctx, -h, h, accent, color);
  ctx.beginPath();
  ctx.moveTo(L, 0);
  ctx.quadraticCurveTo(L * 0.2, -h, -L * 0.75, 0);
  ctx.quadraticCurveTo(L * 0.2, h, L, 0);
  ctx.fill();
  ctx.restore();
  // radiation trefoil mark
  ctx.fillStyle = accent2;
  ctx.save();
  ctx.translate(0, 0);
  for (let i = 0; i < 3; i++) {
    ctx.rotate((Math.PI * 2) / 3);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, h * 0.5, -0.5, 0.5);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
  // glowing eye
  ctx.fillStyle = "#d6ff5a";
  ctx.shadowColor = "#d6ff5a";
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(L * 0.6, -h * 0.1, h * 0.18, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}

// ---- mythic: dark matter fish (void body, purple glow eyes) ----
function drawDarkMatter(p: DrawParams) {
  const { ctx, len, wag, t, accent } = p;
  const L = len / 2, h = len * 0.32;
  // distortion halo
  ctx.save();
  const halo = ctx.createRadialGradient(0, 0, L * 0.4, 0, 0, L * 1.3);
  halo.addColorStop(0, "rgba(120,40,200,0.0)");
  halo.addColorStop(0.7, "rgba(80,20,140,0.18)");
  halo.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(0, 0, L * 1.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // near-black body
  ctx.fillStyle = "#070310";
  ctx.beginPath();
  ctx.moveTo(-L * 0.7, 0);
  ctx.lineTo(-L * 1.1, -h * (1.2 + wag));
  ctx.lineTo(-L * 0.88, 0);
  ctx.lineTo(-L * 1.1, h * (1.2 - wag));
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(L, 0);
  ctx.quadraticCurveTo(L * 0.1, -h, -L * 0.75, 0);
  ctx.quadraticCurveTo(L * 0.1, h, L, 0);
  ctx.fill();
  // purple rim light
  ctx.strokeStyle = accent;
  ctx.shadowColor = accent;
  ctx.shadowBlur = 16 + Math.sin(t * 4) * 6;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(L, 0);
  ctx.quadraticCurveTo(L * 0.1, -h, -L * 0.75, 0);
  ctx.quadraticCurveTo(L * 0.1, h, L, 0);
  ctx.stroke();
  ctx.shadowBlur = 0;
  // glowing purple eye
  ctx.fillStyle = "#c98bff";
  ctx.shadowColor = "#c98bff";
  ctx.shadowBlur = 14;
  ctx.beginPath();
  ctx.arc(L * 0.55, -h * 0.1, h * 0.16, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}

export const FISH_RENDERERS: Record<FishShape, (p: DrawParams) => void> = {
  sardine: drawSardine,
  clownfish: drawClownfish,
  bluetang: drawBlueTang,
  butterfly: drawButterfly,
  angelfish: drawAngelfish,
  seabass: drawSeabass,
  tuna: drawTuna,
  barracuda: drawBarracuda,
  puffer: drawPuffer,
  hammerhead: drawHammerhead,
  manta: drawManta,
  whaleshark: drawWhaleshark,
  parrot: drawParrot,
  lionfish: drawLionfish,
  mahimahi: drawMahimahi,
  yellowfin: drawYellowfin,
  tarpon: drawTarpon,
  grouper: drawGrouper,
  marlin: drawMarlin,
  swordfish: drawSwordfish,
  tigershark: drawTigershark,
  anchovy: drawAnchovy,
  herring: drawHerring,
  goby: drawGoby,
  wrasse: drawWrasse,
  horsemackerel: drawHorseMackerel,
  seabream: drawSeabream,
  foxface: drawFoxface,
  snapper: drawSnapper,
  triggerfish: drawTriggerfish,
  mola: drawMola,
  sailfish: drawSailfish,
  pompano: drawPompano,
  wahoo: drawWahoo,
  trevally: drawTrevally,
  napoleon: drawNapoleon,
  greatwhite: drawGreatWhite,
  diamond: drawDiamond,
  radioactive: drawRadioactive,
  darkmatter: drawDarkMatter,
};
