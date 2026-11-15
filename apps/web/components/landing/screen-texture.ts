import { CanvasTexture, SRGBColorSpace } from "three";

// Draws the 3D phone's screen (a store's WhatsApp-style message) onto a canvas texture.
// Mirrors components/landing/phone-screen.tsx, which is the flat/no-WebGL version.
export const SCREEN = { w: 600, h: 1272, radius: 76 };
const FONT = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif';
const C = { bg: "#F4F1F8", ink: "#1D1842", muted: "#5E5A78", red: "#D7261E", wine: "#8E0D3C", pink: "#FDA1A2", white: "#FFFFFF" };

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number | number[]) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

/** Splits text into lines that fit maxWidth at the current font. */
export function wrap(ctx: Pick<CanvasRenderingContext2D, "measureText">, text: string, maxWidth: number) {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(" ")) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

/** step: 0 empty, 1 typing, 2 store message, 3 customer reply. */
export function drawScreen(canvas: HTMLCanvasElement, step: number) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const { w, h, radius } = SCREEN;
  ctx.clearRect(0, 0, w, h);

  // Screen shape and background
  ctx.save();
  roundRect(ctx, 0, 0, w, h, radius);
  ctx.clip();
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, w, h);

  // Status bar
  ctx.fillStyle = C.ink;
  ctx.font = `600 27px ${FONT}`;
  ctx.fillText("9:41", 62, 62);
  roundRect(ctx, w - 108, 42, 48, 24, 6);
  ctx.lineWidth = 2;
  ctx.strokeStyle = C.ink;
  ctx.stroke();
  roundRect(ctx, w - 104, 46, 32, 16, 3);
  ctx.fill();

  // Dynamic Island
  ctx.fillStyle = "#000";
  roundRect(ctx, w / 2 - 92, 22, 184, 54, 27);
  ctx.fill();

  // Chat header
  ctx.fillStyle = C.white;
  ctx.fillRect(0, 100, w, 108);
  ctx.fillStyle = "rgba(29,24,66,0.1)";
  ctx.fillRect(0, 207, w, 2);
  ctx.fillStyle = C.ink;
  ctx.beginPath();
  ctx.arc(92, 154, 34, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = C.pink;
  ctx.font = `700 30px ${FONT}`;
  ctx.textAlign = "center";
  ctx.fillText("G", 92, 165);
  ctx.textAlign = "left";
  ctx.fillStyle = C.ink;
  ctx.font = `600 31px ${FONT}`;
  ctx.fillText("Glow Store", 144, 148);
  ctx.fillStyle = C.muted;
  ctx.font = `400 23px ${FONT}`;
  ctx.fillText("Business account", 144, 180);
  ctx.strokeStyle = C.red;
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(42, 138);
  ctx.lineTo(28, 154);
  ctx.lineTo(42, 170);
  ctx.stroke();

  // "Today" pill
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  roundRect(ctx, w / 2 - 54, 244, 108, 40, 20);
  ctx.fill();
  ctx.fillStyle = C.muted;
  ctx.font = `400 22px ${FONT}`;
  ctx.textAlign = "center";
  ctx.fillText("Today", w / 2, 271);
  ctx.textAlign = "left";

  const pad = 26;
  const bubbleW = w * 0.8;
  const textW = bubbleW - 56;
  let bottom = h - 70;

  // Customer reply (drawn bottom-up)
  if (step >= 3) {
    ctx.font = `400 29px ${FONT}`;
    const reply = "Ordered two, thank you!";
    const rw = ctx.measureText(reply).width + 56;
    ctx.fillStyle = C.ink;
    roundRect(ctx, w - pad - rw, bottom - 72, rw, 72, [30, 30, 8, 30]);
    ctx.fill();
    ctx.fillStyle = C.white;
    ctx.fillText(reply, w - pad - rw + 28, bottom - 26);
    bottom -= 92;
  }

  if (step >= 2) {
    // Button under the message
    ctx.fillStyle = C.white;
    roundRect(ctx, pad, bottom - 76, bubbleW, 76, 30);
    ctx.fill();
    ctx.fillStyle = C.red;
    ctx.font = `600 29px ${FONT}`;
    ctx.textAlign = "center";
    ctx.fillText("See what’s new", pad + bubbleW / 2, bottom - 28);
    ctx.textAlign = "left";
    bottom -= 88;

    ctx.font = `400 29px ${FONT}`;
    const body = wrap(ctx, "Your favourites are back in stock, and delivery is free this week. Take a look before they go.", textW);
    const bh = 70 + 42 + body.length * 40 + 30;
    ctx.fillStyle = C.white;
    roundRect(ctx, pad, bottom - bh, bubbleW, bh, [30, 30, 30, 8]);
    ctx.fill();
    ctx.fillStyle = C.wine;
    ctx.font = `600 29px ${FONT}`;
    ctx.fillText("Hi Aarav, it’s been a while", pad + 28, bottom - bh + 56);
    ctx.fillStyle = C.ink;
    ctx.font = `400 29px ${FONT}`;
    body.forEach((line, index) => ctx.fillText(line, pad + 28, bottom - bh + 104 + index * 40));
    ctx.fillStyle = C.muted;
    ctx.font = `400 20px ${FONT}`;
    ctx.textAlign = "right";
    ctx.fillText("10:24  ✓", pad + bubbleW - 24, bottom - 22);
    ctx.textAlign = "left";
  } else if (step === 1) {
    ctx.fillStyle = C.white;
    roundRect(ctx, pad, bottom - 72, 130, 72, [30, 30, 30, 8]);
    ctx.fill();
    ctx.fillStyle = "rgba(94,90,120,0.6)";
    [0, 1, 2].forEach((dot) => {
      ctx.beginPath();
      ctx.arc(pad + 38 + dot * 27, bottom - 36, 7, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  ctx.restore();
}

export function createScreenTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = SCREEN.w;
  canvas.height = SCREEN.h;
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 8;
  return { canvas, texture };
}
