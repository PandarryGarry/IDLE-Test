"""Точечная правка кистей: вырезать, перерисовать, вклеить обратно.

Правка всего кадра не годится — модель растаскивает руки в стороны
(на orc_male_01 ширина фигуры выросла со 173 до 221 px), хотя менять
нужно только кисть. Поэтому режем по кисти и вклеиваем обратно с
мягким краем. Всё считаем в координатах исходника 1024².
"""
import os, subprocess, sys
import numpy as np
from scipy import ndimage

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from make_body import WORK
from doll_lib import read_rgba, write_rgba

PAD_SIDE, PAD_UP, PAD_DOWN = 0.55, 1.30, 0.35   # доли высоты кисти


def segs(a):
    out, s = [], None
    for i, v in enumerate(a):
        if v and s is None:
            s = i
        if not v and s is not None:
            out.append((s, i - 1)); s = None
    if s is not None:
        out.append((s, len(a) - 1))
    return out


def hand_box(sil, side):
    """Прямоугольник кисти в координатах исходника."""
    ys, xs = np.where(sil)
    y0, H = ys.min(), ys.max() - ys.min() + 1
    y50 = y0 + int(0.50 * H)
    sg = segs(sil[y50])
    if len(sg) < 3:
        return None
    a, b = sg[0] if side == "L" else sg[-1]
    win = np.zeros_like(sil, bool)
    xa, xb = max(0, a - 12), min(sil.shape[1], b + 12)
    lo, hi = y0 + int(0.42 * H), y0 + int(0.78 * H)
    win[lo:hi, xa:xb] = sil[lo:hi, xa:xb]
    lab, _ = ndimage.label(win)
    comp = lab == lab[y50, (a + b) // 2]
    cy, cx = np.where(comp)
    if len(cy) < 20:
        return None
    tip = cy.max()
    hand_h = int(0.11 * H)
    m = np.zeros_like(sil, bool)
    m[max(cy.min(), tip - hand_h):tip + 1, xa:xb] = comp[max(cy.min(), tip - hand_h):tip + 1, xa:xb]
    hy, hx = np.where(m)
    if len(hy) < 10:
        return None
    return (int(hx.min()), int(hy.min()), int(hx.max()), int(hy.max()))


def crop_box(box, shape):
    """Расширить прямоугольник кисти: вверх берём с запасом, чтобы
    захватить запястье и часть предплечья — по нему клей ложится ровно."""
    x0, y0, x1, y1 = box
    h = y1 - y0 + 1
    w = x1 - x0 + 1
    cx = (x0 + x1) / 2
    side = int(h * PAD_SIDE)
    return (max(0, int(cx - w / 2 - side)), max(0, int(y0 - h * PAD_UP)),
            min(shape[1], int(cx + w / 2 + side)), min(shape[0], int(y1 + h * PAD_DOWN)))


def silhouette(img):
    """Фигура по исходнику: альфы в сгенерированных кадрах нет,
    поэтому определяем фигуру как «всё, что не белый фон»."""
    a = img[..., 3]
    if a.min() > 0.99:
        return img[..., :3].max(axis=2) < 0.94
    return a > 0.5


def hands_of(raw_path):
    """Оба прямоугольника кисти по исходнику."""
    img = read_rgba(raw_path)
    sil = silhouette(img)
    out = {}
    for side in ("L", "R"):
        b = hand_box(sil, side)
        out[side] = crop_box(b, img.shape) if b else None
    return img, out


def make_pair(name, out_path, cell=512):
    """Склеить обе кисти в один кадр для правки: одна генерация на манекен."""
    img, boxes = hands_of(f"{WORK}/raw-{name}.png")
    if not boxes["L"] or not boxes["R"]:
        raise RuntimeError(f"{name}: кисть не найдена")
    crops = []
    hand = {}
    for side in ("L", "R"):
        x0, y0, x1, y1 = boxes[side]
        hb = hand_box(silhouette(img), side)
        hand[side] = dict(x0=hb[0], y0=hb[1], x1=hb[2], y1=hb[3],
                          w=hb[2]-hb[0]+1, h=hb[3]-hb[1]+1)
        c = f"{WORK}/hc-{name}-{side}.png"
        subprocess.run(["convert", f"{WORK}/raw-{name}.png", "-crop",
                        f"{x1-x0}x{y1-y0}+{x0}+{y0}", "+repage",
                        "-background", "white", "-flatten",
                        "-resize", f"{cell}x{cell}", c], check=True)
        crops.append(c)
    subprocess.run(["convert", *crops, "+append", out_path], check=True)
    json_path = out_path.replace(".png", ".txt")
    open(json_path, "w").write(repr({"boxes": boxes, "hand": hand, "size": img.shape[:2]}))
    return boxes


def _ink_bbox(path):
    """Прямоугольник кисти в отрисованном кадре: всё, что не белый фон."""
    im = read_rgba(path)
    ink = im[..., :3].max(axis=2) < 0.93
    if not ink.any():
        return None
    ys, xs = np.where(ink)
    return (int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max()))


def splice_scaled(name, fixed_path, backup=True):
    """Вклеить кисти по маске, подогнав размер и место.

    Три грабли, из-за которых первые попытки уезжали:
    1. модель возвращает кадр своего размера (1024x1044 вместо
       1024x512) — резать надо по фактической высоте, иначе отрезается
       низ кисти;
    2. в вырез попадало предплечье, и масштаб считался по руке, а не
       по кисти — кисть приезжала крупнее;
    3. маску надёжнее считать в numpy: в цепочках ImageMagick с
       -negate и -threshold легко перевернуть полярность, и тогда
       вклеивается весь прямоугольник (на dwarf_male_01 так приехало
       +44 px ширины фигуры).
    """
    meta = eval(open(fixed_path.replace(".png", ".txt").replace("-fix", "")).read())
    (H, W) = meta["size"]
    raw = f"{WORK}/raw-{name}.png"
    if backup and not os.path.exists(f"{WORK}/raw-{name}-orig.png"):
        subprocess.run(["cp", raw, f"{WORK}/raw-{name}-orig.png"], check=True)
    wh = subprocess.run(["identify", "-format", "%w %h", fixed_path],
                        capture_output=True, text=True).stdout.split()
    tw, th = int(wh[0]), int(wh[1])
    half = tw // 2
    for i, side in enumerate(("L", "R")):
        hb = meta["hand"][side]
        cell = f"{WORK}/hc2-{name}-{side}.png"
        subprocess.run(["convert", fixed_path, "-crop", f"{half}x{th}+{i*half}+0",
                        "+repage", "-background", "white", "-flatten", cell], check=True)
        gb = _ink_bbox(cell)
        if gb is None:
            print(f"  {name} {side}: в кадре нет кисти, пропуск"); continue
        gx0, gy0, gx1, gy1 = gb
        gw, gh = gx1 - gx0 + 1, gy1 - gy0 + 1
        scale = hb["h"] / gh                       # только по высоте кисти
        nw, nh = max(1, int(round(gw * scale))), max(1, int(round(gh * scale)))
        part = f"{WORK}/hp2-{name}-{side}.png"
        subprocess.run(["convert", cell, "-crop", f"{gw}x{gh}+{gx0}+{gy0}", "+repage",
                        "-background", "white", "-flatten",
                        "-resize", f"{nw}x{nh}!", part], check=True)
        over = read_rgba(part)
        ink = (over[..., :3].max(axis=2) < 0.94).astype(np.float32)
        ink = ndimage.uniform_filter(ink, 3)       # мягкий край
        dx = int(hb["x0"] + hb["w"] / 2 - nw / 2)  # по центру прежней кисти
        dy = int(hb["y0"])                         # запястьем туда же
        base = read_rgba(raw)
        res = base.copy()
        by0, by1 = max(0, dy), min(H, dy + nh)
        bx0, bx1 = max(0, dx), min(W, dx + nw)
        if by1 <= by0 or bx1 <= bx0:
            print(f"  {name} {side}: кисть не попала в кадр"); continue
        m = ink[by0 - dy:by1 - dy, bx0 - dx:bx1 - dx][..., None]
        res[by0:by1, bx0:bx1, :3] = (base[by0:by1, bx0:bx1, :3] * (1 - m)
                                     + over[by0 - dy:by1 - dy, bx0 - dx:bx1 - dx, :3] * m)
        write_rgba(raw, res)
        os.remove(cell); os.remove(part)
    return True


def splice_back(name, fixed_path, backup=True):
    """Вклеить исправленные кисти обратно в исходник с мягким краем."""
    meta = eval(open(fixed_path.replace(".png", ".txt").replace("-fix", "")).read())
    boxes, (H, W) = meta["boxes"], meta["size"]
    raw = f"{WORK}/raw-{name}.png"
    if backup and not os.path.exists(f"{WORK}/raw-{name}-orig.png"):
        subprocess.run(["cp", raw, f"{WORK}/raw-{name}-orig.png"], check=True)
    W2 = subprocess.run(["identify", "-format", "%w", fixed_path],
                        capture_output=True, text=True).stdout
    half = int(W2) // 2
    for i, side in enumerate(("L", "R")):
        x0, y0, x1, y1 = boxes[side]
        w, h = x1 - x0, y1 - y0
        part = f"{WORK}/hp-{name}-{side}.png"
        subprocess.run(["convert", fixed_path, "-crop", f"{half}x{half}+{i*half}+0",
                        "+repage", "-resize", f"{w}x{h}!", part], check=True)
        layer = f"{WORK}/hl-{name}-{side}.png"
        subprocess.run(["convert", "-size", f"{W}x{H}", "xc:none", part,
                        "-geometry", f"+{x0}+{y0}", "-composite", layer], check=True)
        mask = f"{WORK}/hm-{name}-{side}.png"
        subprocess.run(["convert", layer, "-alpha", "extract", "-blur", "0x3", mask], check=True)
        subprocess.run(["convert", raw, layer, "-alpha", "off", mask, "-composite", raw], check=True)
        os.remove(part); os.remove(layer); os.remove(mask)


if __name__ == "__main__":
    for n in sys.argv[1:]:
        b = make_pair(n, f"{WORK}/hands-{n}.png")
        print(f"{n}: Л {b['L']}  П {b['R']}")
