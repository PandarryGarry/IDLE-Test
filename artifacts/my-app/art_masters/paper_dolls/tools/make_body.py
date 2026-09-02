#!/usr/bin/env python3
"""Сборка манекена из сгенерированного кадра: снять фон, привести к канону,
проверить.

Канон манекена 384:
  холст 384×384, фигура высотой 341, верх на y=21, по горизонтали по
  центру (центр фигуры x=192).

Запуск:
    python3 make_body.py --check            # прогнать эталон и сверить
    python3 make_body.py кадр.png [ещё.png] # обработать кадры
"""
import argparse
import os
import subprocess
import sys

import numpy as np
from scipy import ndimage

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from doll_lib import read_rgba, write_rgba, row_runs

REPO = "/home/user/IDLE-Test/artifacts/my-app/public"
MASTERS = "/home/user/IDLE-Test/artifacts/my-app/art_masters/paper_dolls"
WORK = f"{REPO}/_review/bodies2"

CANON = 384
FIG_H = 341          # высота фигуры в каноне
FIG_TOP = 21         # верх фигуры
FIG_CX = 192         # центр фигуры по горизонтали
WHITE = 235          # порог «это белый фон»


def _run(args):
    r = subprocess.run(args, capture_output=True)
    if r.returncode:
        raise RuntimeError(f"{args[:4]} -> {r.stderr.decode()[:200]}")
    return r.stdout


def strip_background(img, white=WHITE):
    """Снять белый фон заливкой от краёв.

    Заливка (а не просто порог) нужна, чтобы белые блики внутри фигуры
    не превратились в дыры.
    """
    rgb = img[..., :3]
    h, w = rgb.shape[:2]
    bg = (rgb.min(axis=2) * 255) > white
    # заливка от рамки
    lab, n = ndimage.label(bg)
    border = set(lab[0].tolist()) | set(lab[-1].tolist()) | \
        set(lab[:, 0].tolist()) | set(lab[:, -1].tolist())
    border.discard(0)
    mask_bg = np.isin(lab, list(border))
    a = (~mask_bg).astype(np.float32)
    # убрать одинокие дыры внутри фигуры
    a = ndimage.binary_fill_holes(a > 0.5)
    # и пиксельный мусор от сглаживания: одиночные пиксели по контуру
    lab, n = ndimage.label(a)
    if n:
        sizes = ndimage.sum(np.ones_like(lab, np.float32), lab, range(1, n + 1))
        keep = [i + 1 for i, sz in enumerate(sizes) if sz >= 20]
        a = np.isin(lab, keep)
    return np.dstack([rgb, a.astype(np.float32)])


def resize_rgba(img, scale):
    """Масштаб с предумножением: иначе цвет прозрачных пикселей затекает
    в край и по контуру выступает белая кайма."""
    if abs(scale - 1.0) < 1e-4:
        return img
    prem = img[..., :3] * img[..., 3:4]
    zoom = (scale, scale, 1)
    new_rgb = ndimage.zoom(prem, zoom, order=1)
    new_a = ndimage.zoom(img[..., 3], (scale, scale), order=1)
    out_rgb = new_rgb / np.maximum(new_a[..., None], 1e-6)
    return np.dstack([out_rgb, new_a])


def to_canon(img):
    a = img[..., 3]
    solid = a > 0.5
    if not solid.any():
        raise RuntimeError("после снятия фона ничего не осталось")
    ys, xs = np.where(solid)
    y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max()
    fh, fw = y1 - y0 + 1, x1 - x0 + 1
    scale = FIG_H / fh
    if fh < fw * 1.2:
        raise RuntimeError(f"кадр не в полный рост: {fw}×{fh}")
    # кроп по рамке фигуры, затем масштаб ровно в 341 по высоте; ширина
    # идёт своей (иначе широкого гнома сплющит). Для эталонного человека
    # это даёт ровно 200×341, как в утверждённом мастере.
    crop = img[y0:y1 + 1, x0:x1 + 1]
    tw = int(round(fw * scale))
    zoom = (FIG_H / fh, tw / fw, 1)
    prem = crop[..., :3] * crop[..., 3:4]
    new_rgb = ndimage.zoom(prem, zoom, order=1)
    new_a = ndimage.zoom(crop[..., 3], zoom[:2], order=1)
    small = np.dstack([new_rgb / np.maximum(new_a[..., None], 1e-6), new_a])
    ny0, ny1, nx0, nx1 = 0, small.shape[0] - 1, 0, small.shape[1] - 1
    cx = (nx0 + nx1) / 2
    out = np.zeros((CANON, CANON, 4), np.float32)
    tx = round(FIG_CX - cx)
    ty = FIG_TOP - ny0
    # аккуратно вставляем
    for dy in range(ny0, ny1 + 1):
        Y = dy + ty
        if not (0 <= Y < CANON):
            continue
        for dx in range(nx0, nx1 + 1):
            X = dx + tx
            if 0 <= X < CANON:
                out[Y, X] = small[dy, dx]
    return out, dict(scale=scale, src_box=(x0, y0, x1, y1), fig=(fw, fh))


def report(name, img, avatar=None):
    a = img[..., 3]
    solid = a > 0.5
    ys, xs = np.where(solid)
    y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max()
    lab, n = ndimage.label(solid)
    sizes = ndimage.sum(np.ones_like(lab, np.float32), lab, range(1, n + 1))
    biggest = int(sizes.max()) if n else 0
    # симметрия
    cx = (x0 + x1) / 2
    left = int(solid[:, :int(cx)].sum())
    right = int(solid[:, int(cx):].sum())
    asym = abs(left - right) / max(left + right, 1) * 200
    # голова: сужение силуэта ниже макушки. Волосы могут закрывать шею —
    # тогда сужения нет вовсе, и метрика не имеет смысла.
    H = y1 - y0 + 1
    prof = [int(solid[y].sum()) for y in range(y0, y0 + int(0.30 * H))]
    lo, hi = int(0.07 * H), int(0.24 * H)
    neck = lo + min(range(hi - lo), key=lambda i: prof[lo + i])
    head_px = neck - y0 + 1
    top_w = max(prof[:max(int(0.05 * H), 1)] or [1])
    neck_clear = prof[neck] < 0.75 * max(prof[:hi] or [1])
    head_ratio = H / max(head_px, 1) if neck_clear else float("nan")
    # цвет кожи: медиана по торсу
    band = solid.copy()
    band[:y0 + int(0.30 * H), :] = False
    band[y0 + int(0.62 * H):, :] = False
    cols = img[..., :3][band]
    med = np.median(cols, axis=0) * 255 if len(cols) else np.zeros(3)
    line = (f"{name:22s} фигура {x1-x0+1:3d}×{y1-y0+1:3d} @({x0},{y0})  "
            f"кусков {n:2d} (главный {biggest:6d} px)  асимметрия {asym:4.1f}%  "
            f"высота/ширина {H/max(x1-x0+1,1):4.2f}  кожа #{int(med[0]):02x}{int(med[1]):02x}{int(med[2]):02x}")
    if avatar is not None:
        line += f"  аватар #{int(avatar[0]):02x}{int(avatar[1]):02x}{int(avatar[2]):02x}"
    print(line, flush=True)
    return dict(pieces=n, biggest=biggest, asym=asym, head=head_ratio,
                box=(x0, y0, x1, y1), skin=med)


# ------------------------------------------------------------------- поза
def pose_points(sil):
    """Точки скелета в долях высоты фигуры (для сравнения поз)."""
    ys, xs = np.where(sil)
    y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max()
    H, W = y1 - y0 + 1, x1 - x0 + 1
    cx = (x0 + x1) / 2

    def frac_y(y):
        return (y - y0) / H

    def frac_x(x):
        return (x - cx) / W

    neck = min(range(y0 + int(0.07 * H), y0 + int(0.24 * H)),
               key=lambda y: int(sil[y].sum()))
    head = (frac_x(np.mean(xs[ys < neck])), frac_y(np.mean(ys[ys < neck])))
    sh_y = max(range(y0 + int(0.13 * H), y0 + int(0.34 * H)),
               key=lambda y: int(sil[y].sum()))
    row = np.where(sil[sh_y])[0]
    shoulder = (row.max() - row.min()) / W

    def hand_center(side):
        """Центр кисти, а не крайняя точка.

        Крайняя точка зависит от длины пальцев и даёт ложные 5%
        расхождения на одинаковой позе — берём центр предплечья с
        кистью ниже локтя.
        """
        m = np.zeros_like(sil, bool)
        lo, hi = y0 + int(0.42 * H), y0 + int(0.75 * H)
        if side == "L":
            m[lo:hi, :x0 + int(0.22 * W)] = sil[lo:hi, :x0 + int(0.22 * W)]
        else:
            m[lo:hi, x0 + int(0.78 * W):] = sil[lo:hi, x0 + int(0.78 * W):]
        ys2, xs2 = np.where(m)
        if not len(ys2):
            return (0.0, 0.0)
        return (frac_x(xs2.mean()), frac_y(ys2.mean()))

    hand_l = hand_center("L")
    hand_r = hand_center("R")

    def foot(side):
        m = sil[y0 + int(0.92 * H):y1 + 1]
        if not m.any():
            return (0, 0)
        cols = np.where(m.any(axis=0))[0]
        lo, hi = cols.min(), cols.max()
        mid = (lo + hi) / 2
        band = sil.copy()
        band[:, :] = False
        if side == "L":
            band[y0 + int(0.92 * H):y1 + 1, lo:int(mid)] = \
                sil[y0 + int(0.92 * H):y1 + 1, lo:int(mid)]
        else:
            band[y0 + int(0.92 * H):y1 + 1, int(mid):hi + 1] = \
                sil[y0 + int(0.92 * H):y1 + 1, int(mid):hi + 1]
        ys2, xs2 = np.where(band)
        if not len(ys2):
            return (0, 0)
        return (frac_x(np.mean(xs2)), frac_y(np.mean(ys2)))

    return dict(head=head, shoulder=shoulder, hand_l=hand_l, hand_r=hand_r,
                foot_l=foot("L"), foot_r=foot("R"))


def pose_delta(a, b):
    keys = ("head", "hand_l", "hand_r", "foot_l", "foot_r")
    ds = [((a[k][0] - b[k][0]) ** 2 + (a[k][1] - b[k][1]) ** 2) ** 0.5 * 100
          for k in keys]
    ds.append(abs(a["shoulder"] - b["shoulder"]) * 100)
    return ds, sum(ds[:5]) / 5


def de_purple(img, hue_lo=245, hue_hi=345, factor=0.25):
    """Приглушить фиолетовый отлив, не трогая остальные тона.

    Модель любит подмешивать сиреневое в холодную серую кожу: на
    elf_female_03 вышло 14% таких пикселей при 6% на аватаре. Гасим
    насыщенность только у пикселей с фиолетовым тоном.
    """
    out = img.copy()
    rgb = img[..., :3]
    mx = rgb.max(axis=2)
    mn = rgb.min(axis=2)
    d = mx - mn
    sat = np.where(mx > 1e-6, d / np.maximum(mx, 1e-6), 0)
    h = np.zeros_like(mx)
    m = d > 1e-6
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    idx = m & (mx == r)
    h[idx] = (60 * ((g[idx] - b[idx]) / d[idx]) + 360) % 360
    idx = m & (mx == g)
    h[idx] = 60 * ((b[idx] - r[idx]) / d[idx]) + 120
    idx = m & (mx == b)
    h[idx] = 60 * ((r[idx] - g[idx]) / d[idx]) + 240
    bad = (h >= hue_lo) & (h <= hue_hi) & (sat > 0.02)
    k = np.where(bad, factor, 1.0)[..., None]
    gray = mx[..., None]
    out[..., :3] = np.clip(gray - (gray - rgb) * k, 0, 1)
    return out


# кому и насколько приглушать фиолетовый отлив (см. de_purple).
# Модель подмешивает сиреневое в холодную серую кожу: у elf_female_03
# вышло 14% таких пикселей при 0.0–0.4% у остальных.
PURPLE_FIX = {"elf_female_03": 0.10}

RACE_FOLDER = {"human": "humans", "elf": "elves", "dwarf": "dwarves",
               "orc": "orcs", "beastfolk": "beastfolk"}


def face_skin(av_path):
    """Медианный цвет области лица аватара (волосы и фон не мешают)."""
    r = subprocess.run(["identify", "-format", "%w %h", av_path], capture_output=True)
    W, H = map(int, r.stdout.split())
    r = subprocess.run(["convert", av_path,
                        "-crop", f"{int(W*0.16)}x{int(H*0.10)}+{int(W*0.42)}+{int(H*0.30)}",
                        "+repage", "-colors", "6", "-format", "%c", "histogram:info:"],
                       capture_output=True)
    cols = []
    for ln in r.stdout.decode().splitlines():
        m = ln.strip().split()
        if not m or ":" not in m[0]:
            continue
        n = int(m[0].rstrip(":"))
        rgb = [float(v) for v in ln[ln.find("(")+1:ln.find(")")].split(",")[:3]]
        cols.append((n, rgb))
    tot = sum(n for n, _ in cols)
    acc = 0
    for n, rgb in cols:
        acc += n
        if acc >= tot * 0.5:
            return np.array(rgb)
    return np.zeros(3)


def batch(race_key):
    import glob
    folder = RACE_FOLDER[race_key]
    ref = read_rgba(f"{REPO}/assets/icons/characters/paper_dolls/bodies/human_male_01.png")
    ref_pose = pose_points(ref[..., 3] > 0.5)
    rows = []
    for f in sorted(glob.glob(f"{WORK}/raw-{race_key}_*.png")):
        name = os.path.basename(f)[4:-4]
        try:
            img = strip_background(read_rgba(f))
            canon, info = to_canon(img)
        except RuntimeError as e:
            print(f"{name}: ОТБРАКОВАН — {e}")
            continue
        if name in PURPLE_FIX:
            canon = de_purple(canon, factor=PURPLE_FIX[name])
            print(f"  (приглушён фиолетовый отлив ×{PURPLE_FIX[name]})")
        write_rgba(f"{WORK}/canon-{name}.png", canon)
        av = f"{REPO}/assets/icons/characters/avatars/{folder}/{name}.png"
        st = report(name, canon, face_skin(av) if os.path.exists(av) else None)
        p = pose_points(canon[..., 3] > 0.5)
        ds, _ = pose_delta(p, ref_pose)
        body = (ds[1] + ds[2] + ds[3] + ds[4]) / 4
        print(f"    поза тела {body:.2f} (руки {ds[1]:.2f}/{ds[2]:.2f}, "
              f"стопы {ds[3]:.2f}/{ds[4]:.2f}, голова {ds[0]:.2f}, плечи {ds[5]:.2f})")
        rows.append((name, canon, st, body))
    # листы
    W = 252
    def cell(src, label, idx):
        out = f"{WORK}/c{idx}.png"
        subprocess.run(["convert", src, "-background", "#202028", "-gravity", "north",
                        "-splice", "0x44", "-resize", f"{W}x{W}", "-gravity", "north",
                        "-fill", "#f2e7d5", "-font", "DejaVu-Sans", "-pointsize", "18",
                        "-annotate", "+0+8", label, "-extent", f"{W}x{W+44}", out], check=True)
        return out
    seq, i = [], 0
    for name, canon, st, body in rows:
        av = f"{REPO}/assets/icons/characters/avatars/{folder}/{name}.png"
        seq.append(cell(av, name, i)); i += 1
        seq.append(cell(f"{WORK}/canon-{name}.png", "манекен", i)); i += 1
    n = len(rows)
    subprocess.run(["montage", *seq, "-tile", f"2x{n}", "-geometry", "+10+10",
                    "-background", "#14141a",
                    f"{REPO}/_review/review-24-{race_key}s-avatar-vs-body.jpg"], check=True)
    seq, i = [], 0
    for name, canon, st, body in rows:
        seq.append(cell(f"{WORK}/canon-{name}.png", name.replace(race_key + "_", ""), i)); i += 1
    subprocess.run(["montage", *seq, "-tile", f"{n}x1", "-geometry", "+10+10",
                    "-background", "#14141a",
                    f"{REPO}/_review/review-25-{race_key}s-lineup.jpg"], check=True)
    print(f"\nлисты: review-24-{race_key}s-avatar-vs-body.jpg, "
          f"review-25-{race_key}s-lineup.jpg")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("files", nargs="*")
    ap.add_argument("--check", action="store_true")
    ap.add_argument("--avatar", default=None, help="путь к аватару для сверки тона кожи")
    ap.add_argument("--race", default=None,
                    help="обработать все raw-кадры расы: human|elf|dwarf|orc|beastfolk")
    args = ap.parse_args()
    os.makedirs(WORK, exist_ok=True)

    if args.check:
        src = f"{MASTERS}/human_male_01_source_1024.png"
        approved = f"{REPO}/assets/icons/characters/paper_dolls/bodies/human_male_01.png"
        img = read_rgba(src)
        img = strip_background(img)
        canon, info = to_canon(img)
        write_rgba(f"{WORK}/canon-from-source.png", canon)
        ref = read_rgba(approved)
        print(f"масштаб {info['scale']:.4f}, исходная рамка {info['src_box']}, "
              f"фигура {info['fig']}")
        print("--- эталон из исходника ---")
        report("из исходника", canon)
        print("--- утверждённый в ассетах ---")
        report("утверждённый", ref)
        d = np.abs(canon - ref)
        diff = (d.max(axis=2) > 0.08).sum()
        print(f"расхождение: {diff} px из {int((ref[...,3]>0.5).sum())} "
              f"({100*diff/max(int((ref[...,3]>0.5).sum()),1):.2f}%)")
        return

    if args.race:
        batch(args.race)
        return

    av_med = None
    if args.avatar:
        av = read_rgba(args.avatar)
        a = av[..., 3] > 0.5
        av_med = np.median(av[..., :3][a], axis=0) * 255

    for f in args.files:
        img = strip_background(read_rgba(f))
        try:
            canon, info = to_canon(img)
        except RuntimeError as e:
            print(f"{os.path.basename(f)}: ОТБРАКОВАН — {e}")
            continue
        name = os.path.splitext(os.path.basename(f))[0]
        write_rgba(f"{WORK}/canon-{name}.png", canon)
        report(name, canon, av_med)


if __name__ == "__main__":
    main()
