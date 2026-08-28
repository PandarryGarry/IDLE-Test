/**
 * artEngine — чистая логика «оживления» картинки на 2D-контексте.
 *
 * Специально не знает про React: принимает ctx, размеры, время и рисует кадр.
 * Благодаря этому движок можно прогнать в любом Canvas-окружении (в т.ч. headless).
 */

export type ArtMode = 'scene' | 'cutout' | 'sign' | 'sigil';

/** Конфигурация «рунного круга»: центр и радиус маски вращения (доли ширины/высоты). */
export interface SigilConfig {
  cx: number;
  cy: number;
  r: number;
}

export interface ArtTint {
  r: number;
  g: number;
  b: number;
}

export interface Pointer {
  /** -1..1 по X */
  x: number;
  /** -1..1 по Y */
  y: number;
}

/** Минимально необходимая фабрика канвасов (offscreen-слои свечения и блика). */
export type CanvasFactory = () => HTMLCanvasElement;

/** Похожий на картинку источник для drawImage. */
export interface ImageLike {
  width: number;
  height: number;
}

export const DEFAULT_TINT: ArtTint = { r: 245, g: 158, b: 11 }; // amber-500

export const defaultCanvasFactory: CanvasFactory = () => document.createElement('canvas');

interface Mote {
  x: number;
  y: number;
  r: number;
  vy: number;
  drift: number;
  phase: number;
  alpha: number;
}

/** Доля «прозрачных» пикселей, при которой картинка считается вырезанным силуэтом. */
export const CUTOUT_ALPHA_RATIO = 0.04;
const PROBE_SIZE = 48;

/**
 * Определяет режим по альфа-каналу: много прозрачного — значит силуэт ('cutout'),
 * иначе считаем картинку сплошной иллюстрацией ('scene').
 */
export function detectMode(img: ImageLike, createCanvas: CanvasFactory = defaultCanvasFactory): ArtMode {
  const probe = createCanvas();
  probe.width = PROBE_SIZE;
  probe.height = PROBE_SIZE;
  const pctx = probe.getContext('2d', { willReadFrequently: true });
  if (!pctx) return 'scene';
  try {
    pctx.drawImage(img as CanvasImageSource, 0, 0, PROBE_SIZE, PROBE_SIZE);
    const { data } = pctx.getImageData(0, 0, PROBE_SIZE, PROBE_SIZE);
    let transparent = 0;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 16) transparent += 1;
    }
    return transparent / (PROBE_SIZE * PROBE_SIZE) > CUTOUT_ALPHA_RATIO ? 'cutout' : 'scene';
  } catch {
    // tainted canvas / CORS — безопасный дефолт
    return 'scene';
  }
}

export interface ArtEngineOptions {
  mode: ArtMode;
  tint?: ArtTint;
  intensity?: number;
  sigil?: SigilConfig;
  createCanvas?: CanvasFactory;
}

export class ArtEngine {
  readonly mode: ArtMode;

  private readonly img: ImageLike;
  private readonly createCanvas: CanvasFactory;

  private width = 0;
  private height = 0;
  private motes: Mote[] = [];
  private glow: HTMLCanvasElement | null = null;
  private glowPad = 0;
  private sweep: HTMLCanvasElement | null = null;
  private backdrop: HTMLCanvasElement | null = null;
  private signLayer: HTMLCanvasElement | null = null;
  private signMask: HTMLCanvasElement | null = null;
  private sigil: SigilConfig;

  /** Живые параметры — можно менять между кадрами. */
  tint: ArtTint;
  intensity: number;

  constructor(img: ImageLike, options: ArtEngineOptions) {
    this.img = img;
    this.mode = options.mode;
    this.tint = options.tint ?? DEFAULT_TINT;
    this.intensity = options.intensity ?? 1;
    this.createCanvas = options.createCanvas ?? defaultCanvasFactory;
    this.sigil = options.sigil ?? { cx: 0.5, cy: 0.42, r: 0.34 };
  }

  /** Пересчёт под новый размер области (вызывается на resize и при старте). */
  resize(width: number, height: number): void {
    this.width = Math.max(1, width);
    this.height = Math.max(1, height);
    this.seedMotes();
    if (this.mode === 'sign' || this.mode === 'sigil') this.buildBackdrop();
    if (this.mode === 'sign') this.buildSignLayer();
    if (this.mode === 'cutout') {
      this.buildGlow();
      const { dw, dh } = this.fit(1);
      const sweep = this.createCanvas();
      sweep.width = Math.max(1, Math.round(dw));
      sweep.height = Math.max(1, Math.round(dh));
      this.sweep = sweep;
    }
  }

  /** Один кадр. t — время в мс, dt — дельта в мс. */
  render(ctx: CanvasRenderingContext2D, t: number, dt: number, pointer: Pointer): void {
    ctx.clearRect(0, 0, this.width, this.height);
    if (this.mode === 'scene') this.drawScene(ctx, t, dt, pointer);
    else if (this.mode === 'cutout') this.drawCutout(ctx, t, dt, pointer);
    else if (this.mode === 'sign') this.drawSign(ctx, t, dt, pointer);
    else this.drawSigil(ctx, t, dt, pointer);
  }

  /* ---------------- геометрия ---------------- */

  private fit(zoom: number) {
    const cover = Math.max(this.width / this.img.width, this.height / this.img.height);
    const contain = Math.min(this.width / this.img.width, this.height / this.img.height);
    const scale = (this.mode === 'scene' ? cover : contain * 0.86) * zoom;
    return { dw: this.img.width * scale, dh: this.img.height * scale };
  }

  private seedMotes(): void {
    const target = Math.round(
      Math.min(160, Math.max(24, (this.width * this.height) / 8000)) * this.intensity,
    );
    this.motes = Array.from({ length: target }, () => ({
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      r: 0.6 + Math.random() * 2.2,
      vy: 4 + Math.random() * 14,
      drift: 6 + Math.random() * 22,
      phase: Math.random() * Math.PI * 2,
      alpha: 0.15 + Math.random() * 0.55,
    }));
  }

  /** Окрашенная размытая копия силуэта — дешёвое пульсирующее свечение. */
  private buildGlow(): void {
    const { dw, dh } = this.fit(1);
    if (dw < 4 || dh < 4) return;
    const pad = Math.round(Math.min(dw, dh) * 0.28) + 8;
    const g = this.createCanvas();
    g.width = Math.ceil(dw + pad * 2);
    g.height = Math.ceil(dh + pad * 2);
    const gctx = g.getContext('2d');
    if (!gctx) return;

    // blur() через ctx.filter есть не везде (нет в Safari < 16.4) — тогда псевдоблюр проходами.
    let supportsFilter = false;
    try {
      gctx.filter = 'blur(4px)';
      supportsFilter = gctx.filter === 'blur(4px)';
      gctx.filter = 'none';
    } catch {
      supportsFilter = false;
    }

    if (supportsFilter) {
      gctx.filter = `blur(${Math.max(6, Math.round(Math.min(dw, dh) * 0.06))}px)`;
      gctx.drawImage(this.img as CanvasImageSource, pad, pad, dw, dh);
      gctx.filter = 'none';
    } else {
      const step = Math.max(2, Math.round(Math.min(dw, dh) * 0.012));
      gctx.globalAlpha = 0.3;
      for (let ox = -2; ox <= 2; ox++) {
        for (let oy = -2; oy <= 2; oy++) {
          gctx.drawImage(this.img as CanvasImageSource, pad + ox * step, pad + oy * step, dw, dh);
        }
      }
      gctx.globalAlpha = 1;
    }

    gctx.globalCompositeOperation = 'source-in';
    gctx.fillStyle = `rgb(${this.tint.r}, ${this.tint.g}, ${this.tint.b})`;
    gctx.fillRect(0, 0, g.width, g.height);
    this.glow = g;
    this.glowPad = pad;
  }

  /* ---------------- слои ---------------- */

  private drawRays(ctx: CanvasRenderingContext2D, t: number): void {
    const { r, g, b } = this.tint;
    const count = 7;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const ox = this.width * 0.5;
    const oy = -this.height * 0.1;
    for (let i = 0; i < count; i++) {
      const base = (i / (count - 1) - 0.5) * 0.55;
      const wobble = Math.sin(t / 9000 + i * 1.7) * 0.02;
      const angle = Math.PI / 2 + base + wobble;
      const len = Math.hypot(this.width, this.height) * 1.1;
      const halfWidth = 0.035 + 0.02 * Math.sin(t / 4200 + i);
      const peak = Math.max(0, (0.05 + 0.045 * Math.sin(t / 3100 + i * 0.9)) * this.intensity);
      const grad = ctx.createLinearGradient(
        ox,
        oy,
        ox + Math.cos(angle) * len,
        oy + Math.sin(angle) * len,
      );
      grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${peak})`);
      grad.addColorStop(0.55, `rgba(${r}, ${g}, ${b}, ${peak * 0.35})`);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(ox + Math.cos(angle - halfWidth) * len, oy + Math.sin(angle - halfWidth) * len);
      ctx.lineTo(ox + Math.cos(angle + halfWidth) * len, oy + Math.sin(angle + halfWidth) * len);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  private drawMotes(ctx: CanvasRenderingContext2D, t: number, dt: number): void {
    const { r, g, b } = this.tint;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const m of this.motes) {
      m.y -= (m.vy * dt) / 1000;
      m.x += (Math.sin(t / 2600 + m.phase) * m.drift * dt) / 1000;
      if (m.y < -10) {
        m.y = this.height + 10;
        m.x = Math.random() * this.width;
      }
      if (m.x < -10) m.x = this.width + 10;
      if (m.x > this.width + 10) m.x = -10;

      const twinkle = 0.55 + 0.45 * Math.sin(t / 900 + m.phase * 3);
      const alpha = m.alpha * twinkle * this.intensity;
      const rad = m.r * (1 + 0.25 * twinkle) * 3.2;
      const grad = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, rad);
      grad.addColorStop(0, `rgba(255, 236, 190, ${alpha})`);
      grad.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, ${alpha * 0.55})`);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(m.x, m.y, rad, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  private drawVignette(ctx: CanvasRenderingContext2D): void {
    const grad = ctx.createRadialGradient(
      this.width / 2,
      this.height / 2,
      Math.min(this.width, this.height) * 0.25,
      this.width / 2,
      this.height / 2,
      Math.max(this.width, this.height) * 0.75,
    );
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(3, 3, 6, 0.72)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.width, this.height);
  }

  private drawScene(
    ctx: CanvasRenderingContext2D,
    t: number,
    dt: number,
    pointer: Pointer,
  ): void {
    const cycle = (t % 26000) / 26000;
    const zoom = 1.07 + 0.05 * Math.sin(cycle * Math.PI * 2);
    const { dw, dh } = this.fit(zoom);
    const dx = (this.width - dw) / 2 + Math.cos(cycle * Math.PI * 2) * this.width * 0.018 + pointer.x * 14;
    const dy = (this.height - dh) / 2 + Math.sin(cycle * Math.PI) * this.height * 0.014 + pointer.y * 10;
    ctx.drawImage(this.img as CanvasImageSource, dx, dy, dw, dh);
    this.drawRays(ctx, t);
    this.drawMotes(ctx, t, dt);
    this.drawVignette(ctx);
  }

  /** Размытая затемнённая копия арта — фон для режимов sign/sigil. */
  private buildBackdrop(): void {
    const bd = this.createCanvas();
    bd.width = Math.max(1, Math.round(this.width));
    bd.height = Math.max(1, Math.round(this.height));
    const bctx = bd.getContext('2d');
    if (!bctx) return;

    // cover-fit
    const scale = Math.max(bd.width / this.img.width, bd.height / this.img.height) * 1.15;
    const dw = this.img.width * scale;
    const dh = this.img.height * scale;
    const dx = (bd.width - dw) / 2;
    const dy = (bd.height - dh) / 2;

    let supportsFilter = false;
    try {
      bctx.filter = 'blur(4px)';
      supportsFilter = bctx.filter === 'blur(4px)';
      bctx.filter = 'none';
    } catch {
      supportsFilter = false;
    }
    if (supportsFilter) {
      bctx.filter = `blur(${Math.max(14, Math.round(Math.min(bd.width, bd.height) * 0.03))}px)`;
      bctx.drawImage(this.img as CanvasImageSource, dx, dy, dw, dh);
      bctx.filter = 'none';
    } else {
      const step = Math.max(3, Math.round(Math.min(bd.width, bd.height) * 0.01));
      bctx.globalAlpha = 0.25;
      for (let ox = -2; ox <= 2; ox++) {
        for (let oy = -2; oy <= 2; oy++) {
          bctx.drawImage(this.img as CanvasImageSource, dx + ox * step, dy + oy * step, dw, dh);
        }
      }
      bctx.globalAlpha = 1;
    }

    // затемнение, чтобы передний план читался
    bctx.globalCompositeOperation = 'source-over';
    bctx.fillStyle = 'rgba(5, 4, 3, 0.62)';
    bctx.fillRect(0, 0, bd.width, bd.height);
    this.backdrop = bd;
  }

  private drawBackdrop(ctx: CanvasRenderingContext2D, pointer: Pointer, scale = 1.06): void {
    if (!this.backdrop) return;
    const dw = this.width * scale;
    const dh = this.height * scale;
    const dx = (this.width - dw) / 2 + pointer.x * -10;
    const dy = (this.height - dh) / 2 + pointer.y * -8;
    ctx.drawImage(this.backdrop, dx, dy, dw, dh);
  }

  /** «Вывеска на цепях»: покачивание-маятник вокруг верхней точки + мерцание света. */
  /** Слой вывески с «пером» по краям — чтобы резкий арт бесшовно растворялся в блюре. */
  private buildSignLayer(): void {
    const { dw, dh } = this.fitContain();
    const w = Math.max(1, Math.round(dw));
    const h = Math.max(1, Math.round(dh));
    const layer = this.createCanvas();
    layer.width = w;
    layer.height = h;
    const mask = this.createCanvas();
    mask.width = w;
    mask.height = h;
    const mctx = mask.getContext('2d');
    if (!mctx) return;

    mctx.fillStyle = '#fff';
    mctx.fillRect(0, 0, w, h);
    mctx.globalCompositeOperation = 'destination-out';
    const f = Math.max(8, Math.round(Math.min(w, h) * 0.07));

    const edge = (x0: number, y0: number, x1: number, y1: number, rx: number, ry: number, rw: number, rh: number) => {
      const g = mctx.createLinearGradient(x0, y0, x1, y1);
      g.addColorStop(0, 'rgba(0,0,0,1)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      mctx.fillStyle = g;
      mctx.fillRect(rx, ry, rw, rh);
    };
    edge(0, 0, f, 0, 0, 0, f, h); // left
    edge(w, 0, w - f, 0, w - f, 0, f, h); // right
    edge(0, 0, 0, f, 0, 0, w, f); // top
    edge(0, h, 0, h - f, 0, h - f, w, f); // bottom

    this.signLayer = layer;
    this.signMask = mask;
  }

  private drawSign(ctx: CanvasRenderingContext2D, t: number, dt: number, pointer: Pointer): void {
    this.drawBackdrop(ctx, pointer);

    const { dw, dh } = this.fitContain();
    const cx = this.width / 2;
    const dx = cx - dw / 2 + pointer.x * 8;
    const dy = (this.height - dh) / 2 + pointer.y * 6;

    // маятник: медленное затухающее покачивание + лёгкий отклик на курсор
    const sway =
      Math.sin(t / 2400) * 0.016 * (0.6 + 0.4 * Math.sin(t / 9000)) +
      Math.sin(t / 5300) * 0.006 +
      pointer.x * 0.012;

    // собираем резкий слой с пером и кладём его с покачиванием
    const layer = this.signLayer;
    const mask = this.signMask;
    if (layer && mask) {
      const lctx = layer.getContext('2d');
      if (lctx) {
        lctx.setTransform(1, 0, 0, 1, 0, 0);
        lctx.clearRect(0, 0, layer.width, layer.height);
        lctx.drawImage(this.img as CanvasImageSource, 0, 0, layer.width, layer.height);
        lctx.globalCompositeOperation = 'destination-in';
        lctx.drawImage(mask, 0, 0);
        lctx.globalCompositeOperation = 'source-over';
      }
    }

    ctx.save();
    const pivotY = dy - dh * 0.06; // точка подвеса чуть выше верхнего края
    ctx.translate(cx, pivotY);
    ctx.rotate(sway);
    ctx.translate(-cx, -pivotY);
    if (layer) ctx.drawImage(layer, dx, dy, dw, dh);
    else ctx.drawImage(this.img as CanvasImageSource, dx, dy, dw, dh);
    ctx.restore();

    this.drawFlicker(ctx, t);
    this.drawMotes(ctx, t, dt);
    this.drawVignette(ctx);
  }

  /** «Рунный круг»: текст стоит, круг медленно вращается внутри круговой маски. */
  private drawSigil(ctx: CanvasRenderingContext2D, t: number, dt: number, pointer: Pointer): void {
    this.drawBackdrop(ctx, pointer);

    const { dw, dh } = this.fitContain();
    const dx = (this.width - dw) / 2 + pointer.x * 6;
    const dy = (this.height - dh) / 2 + pointer.y * 5;

    // база: арт с «выкрашенной» областью круга (фон чёрный — маска незаметна)
    ctx.drawImage(this.img as CanvasImageSource, dx, dy, dw, dh);
    const ccx = dx + dw * this.sigil.cx;
    const ccy = dy + dh * this.sigil.cy;
    const rr = dw * this.sigil.r;
    ctx.save();
    ctx.beginPath();
    ctx.arc(ccx, ccy, rr, 0, Math.PI * 2);
    ctx.clip();
    if (this.backdrop) {
      const bw = this.width * 1.06;
      const bh = this.height * 1.06;
      ctx.drawImage(this.backdrop, (this.width - bw) / 2, (this.height - bh) / 2, bw, bh);
    } else {
      ctx.fillStyle = '#060504';
      ctx.fillRect(dx, dy, dw, dh);
    }
    ctx.restore();

    // вращающийся круг строго внутри маски
    const omega = (Math.PI * 2) / 90000;
    const theta = t * omega + pointer.x * 0.05;
    ctx.save();
    ctx.beginPath();
    ctx.arc(ccx, ccy, rr, 0, Math.PI * 2);
    ctx.clip();
    ctx.translate(ccx, ccy);
    ctx.rotate(theta);
    ctx.translate(-ccx, -ccy);
    ctx.drawImage(this.img as CanvasImageSource, dx, dy, dw, dh);
    ctx.restore();

    // пульс свечения в центре
    const pulse = 0.5 + 0.5 * Math.sin(t / 1700);
    const { r, g, b } = this.tint;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const grad = ctx.createRadialGradient(ccx, ccy, 0, ccx, ccy, rr * (0.9 + 0.12 * pulse));
    grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${0.16 * this.intensity * (0.5 + 0.5 * pulse)})`);
    grad.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, ${0.05 * this.intensity})`);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(ccx, ccy, rr * 1.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    this.drawMotes(ctx, t, dt);
    this.drawVignette(ctx);
  }

  /** Мерцание тёплого света (факелы/свечи) — лёгкий шум по синусоиде. */
  private drawFlicker(ctx: CanvasRenderingContext2D, t: number): void {
    const { r, g, b } = this.tint;
    const n =
      Math.sin(t / 130) * 0.4 + Math.sin(t / 331 + 1.7) * 0.35 + Math.sin(t / 761 + 0.4) * 0.25;
    const alpha = Math.max(0, (0.05 + n * 0.028) * this.intensity);
    if (alpha <= 0.001) return;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const grad = ctx.createRadialGradient(
      this.width * 0.5,
      this.height * 0.45,
      0,
      this.width * 0.5,
      this.height * 0.45,
      Math.max(this.width, this.height) * 0.7,
    );
    grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha})`);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.restore();
  }

  /** contain-fit с небольшим отступом — для sign/sigil показываем арт целиком. */
  private fitContain() {
    const contain = Math.min(this.width / this.img.width, this.height / this.img.height);
    const scale = contain * 0.92;
    return { dw: this.img.width * scale, dh: this.img.height * scale };
  }

  private drawCutout(
    ctx: CanvasRenderingContext2D,
    t: number,
    dt: number,
    pointer: Pointer,
  ): void {
    const { dw, dh } = this.fit(1);
    const bob = Math.sin(t / 1900) * Math.min(10, dh * 0.02);
    const breathe = 1 + 0.012 * Math.sin(t / 2600);
    const dwB = dw * breathe;
    const dhB = dh * breathe;
    const dx = (this.width - dwB) / 2 + pointer.x * 10;
    const dy = (this.height - dhB) / 2 + bob + pointer.y * 8;

    // искры позади силуэта
    this.drawMotes(ctx, t, dt);

    // пульсирующее свечение
    if (this.glow) {
      const pulse = 0.35 + 0.3 * (0.5 + 0.5 * Math.sin(t / 1500));
      const grow = 1 + 0.03 * Math.sin(t / 1500);
      const gw = dwB + this.glowPad * 2 * grow;
      const gh = dhB + this.glowPad * 2 * grow;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = Math.min(0.95, pulse * this.intensity);
      ctx.drawImage(this.glow, dx - (gw - dwB) / 2, dy - (gh - dhB) / 2, gw, gh);
      ctx.restore();
    }

    ctx.drawImage(this.img as CanvasImageSource, dx, dy, dwB, dhB);

    // блик-развёртка строго по силуэту
    const sweep = this.sweep;
    if (sweep) {
      const sctx = sweep.getContext('2d');
      if (sctx) {
        const sw = sweep.width;
        const sh = sweep.height;
        sctx.setTransform(1, 0, 0, 1, 0, 0);
        sctx.clearRect(0, 0, sw, sh);
        sctx.drawImage(this.img as CanvasImageSource, 0, 0, sw, sh);
        sctx.globalCompositeOperation = 'source-atop';
        const p = (t % 5200) / 5200;
        const sweepX = -sw * 0.35 + p * sw * 1.7;
        const bandW = sw * 0.22;
        const grad = sctx.createLinearGradient(sweepX - bandW, 0, sweepX + bandW, 0);
        grad.addColorStop(0, 'rgba(255,255,255,0)');
        grad.addColorStop(0.5, `rgba(255, 244, 214, ${0.42 * this.intensity})`);
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        sctx.fillStyle = grad;
        sctx.fillRect(0, 0, sw, sh);
        sctx.globalCompositeOperation = 'source-over';

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.drawImage(sweep, dx, dy, dwB, dhB);
        ctx.restore();
      }
    }
  }
}
