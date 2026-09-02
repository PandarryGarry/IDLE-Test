#!/usr/bin/env python3
"""Нарезка полных комплектов на послотовые слои манекена.

Идея: полный комплект уже лежит в каноне 384 и совмещён с телом, поэтому
режем сразу в конечном размере — без уменьшения. Уменьшение RGBA без
учёта альфы (как было раньше) давало тёмную бахрому по краям и щели
между слоями; здесь этой операции просто нет.

Границы зон берутся из самого тела (самые узкие места), а не проводятся
«примерно по поясу»: шея, талия, запястье, лодыжка.

Запуск:
    pip install numpy scipy
    python3 slice_sets.py                  # обычный прогон
    python3 slice_sets.py --scan           # подобрать порог маски
    python3 slice_sets.py --threshold 0.12
"""
import argparse
import os
import subprocess
import sys

import numpy as np
from scipy import ndimage

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from doll_lib import (ROOT, read_rgba, write_rgba, dilate, fill_holes, components,
                      row_runs, over)

REPO = "/home/user/IDLE-Test/artifacts/my-app/public"
BODY = f"{REPO}/assets/icons/characters/paper_dolls/bodies/human_male_01.png"
FULL = {"cloth": f"{REPO}/_review/sets_full/cloth.png",
        "leather": f"{REPO}/_review/sets_full/leather.png",
        "plate": f"{REPO}/_review/sets_full/plate-r1.png"}
SETS_DIR = f"{REPO}/assets/icons/characters/paper_dolls/sets"
ICON_DIR = f"{REPO}/assets/icons/armor"
WORK = f"{REPO}/_review/work"
OUT_REVIEW = f"{REPO}/_review"

SLOTS = ["helmet", "chest", "gloves", "pants", "boots"]
SLOT_RU = dict(helmet="шлем", chest="грудь", gloves="руки", pants="штаны", boots="сапоги")
RU = dict(cloth="ткань", leather="кожа", plate="латы")
# кожа утверждена владельцем тёмной — к светлой иконке её не тянем
TARGET_OVERRIDE = {"leather": (105, 67, 34)}
DRAW_ORDER = ["chest", "pants", "boots", "gloves", "helmet"]


def sh(*a):
    r = subprocess.run(a, capture_output=True)
    if r.returncode:
        print("FAIL", a[:6], r.stderr.decode()[:200])
    return r


def out(*a):
    return sh(*a).stdout.decode().strip()


# ---------------------------------------------------------------- ориентиры
def landmarks(sil, verbose=False):
    rows = np.where(sil.any(axis=1))[0]
    cols = np.where(sil.any(axis=0))[0]
    top, bot = int(rows.min()), int(rows.max())
    x0, x1 = int(cols.min()), int(cols.max())
    H, FW = bot - top, x1 - x0
    cx = (x0 + x1) // 2

    def width_at(y, lo=0, hi=1):
        a = x0 + int(lo * FW)
        b = x0 + int(hi * FW)
        return int(sil[y, a:b + 1].sum())

    # шея: самая узкая строка над плечами
    neck = min(range(top + int(0.07 * H), top + int(0.24 * H)), key=width_at)
    neck_w = width_at(neck)
    # низ шеи: первая строка ниже, где силуэт резко шире (пошли плечи)
    neck_bottom = neck
    for y in range(neck, top + int(0.30 * H)):
        if width_at(y) > 1.7 * neck_w:
            neck_bottom = y
            break
    # талия: самая узкая строка торса (руки исключены полосой по центру)
    waist = min(range(top + int(0.32 * H), top + int(0.52 * H)),
                key=lambda y: width_at(y, 0.30, 0.70))
    # запястья: самая узкая строка в полосе руки
    wl = min(range(top + int(0.36 * H), top + int(0.56 * H)),
             key=lambda y: width_at(y, 0.0, 0.36))
    wr = min(range(top + int(0.36 * H), top + int(0.56 * H)),
             key=lambda y: width_at(y, 0.64, 1.0))
    # лодыжки: самая узкая строка в полосе каждой ноги
    al = min(range(top + int(0.80 * H), top + int(0.95 * H)),
             key=lambda y: width_at(y, 0.18, 0.48))
    ar = min(range(top + int(0.80 * H), top + int(0.95 * H)),
             key=lambda y: width_at(y, 0.52, 0.82))
    L = dict(top=top, bot=bot, H=H, FW=FW, x0=x0, x1=x1, cx=cx, neck=neck,
             neck_bottom=neck_bottom, waist=waist, wrist_l=wl, wrist_r=wr,
             ankle_l=al, ankle_r=ar)
    if verbose:
        print("ориентиры (доля высоты фигуры):")
        for k in ("neck", "neck_bottom", "waist", "wrist_l", "wrist_r", "ankle_l", "ankle_r"):
            print(f"  {k:12s} y={L[k]:4d}  {(L[k]-top)/H:.3f}")
    return L


# ------------------------------------------------------------------- маска
def armor_mask(base, full, T):
    ba, fa = base[..., 3], full[..., 3]
    d = np.abs(base[..., :3] - full[..., :3]).max(axis=2)
    both = (ba > 0.9) & (fa > 0.9)
    m = (fa > 0.5) & (((d > T) & both) | (ba < 0.5))
    return m, d


def clean_mask(m, min_area=120, close_r=1):
    m = fill_holes(m)
    if close_r:
        m = ndimage.binary_closing(m, iterations=close_r)
    m = components(m, min_area=min_area)
    return fill_holes(m)


# -------------------------------------------------------------------- зоны
def build_zones(m, L, corridor=0.30):
    H, top, cx, FW = L["H"], L["top"], L["cx"], L["FW"]
    ys, xs = np.mgrid[0:m.shape[0], 0:m.shape[1]]
    half = corridor * FW
    center = np.abs(xs - cx) <= half          # коридор: торс и ноги
    left = xs < cx
    z = {}

    z["helmet"] = m & (ys < L["neck_bottom"])
    z["gloves"] = m & ~center & (((ys > L["wrist_l"]) & left) | ((ys > L["wrist_r"]) & ~left))
    below_ankle = ((ys > L["ankle_l"]) & left) | ((ys > L["ankle_r"]) & ~left)
    z["boots"] = m & center & below_ankle
    z["pants"] = m & center & (ys > L["waist"]) & ~below_ankle
    z["chest"] = m & ~z["helmet"] & ~z["gloves"] & ~z["boots"] & ~z["pants"]
    return z


# ------------------------------------------------------------------ размеры
def layer_from(full, zm):
    im = full.copy()
    im[..., 3] *= zm
    return im


def defringe(im, alpha_hi=0.95):
    """Убрать тёмную/светлую кайму по краю слоя.

    В сгенерированном кадре полупрозрачные пиксели контура несут цвет,
    смешанный с фоном: при наложении такого слоя на тело по краю
    проступает грязь. Лечим как в фотошоповском Defringe: цвет каждого
    полупрозрачного пикселя берём у ближайшего плотного.
    """
    a = im[..., 3]
    opaque = a >= alpha_hi
    if not opaque.any():
        return im
    _, (iy, ix) = ndimage.distance_transform_edt(~opaque, return_indices=True)
    near = im[..., :3][iy, ix]
    soft = (a < alpha_hi) & (a > 0.02)
    out = im.copy()
    out[..., :3] = np.where(soft[..., None], near, im[..., :3])
    return out


def drop_specks(im, min_px=15):
    """Убрать крошечные обрывки по контуру (антиалиасинг исходника)."""
    a = im[..., 3] > 0.5
    keep = components(a, min_area=min_px)
    out = im.copy()
    out[..., 3] = np.where(keep, im[..., 3], 0.0)
    return out


def stats(name, im, body_sil):
    a = im[..., 3]
    dense = a > 0.85
    edge = (a > 0.15) & (a < 0.85) & dilate(dense, 1) & ~dense
    outside = (a > 0.5) & ~dilate(body_sil, 3)
    lum = (im[..., :3] * a[..., None]).sum(axis=2) / np.maximum(a, 1e-6)
    fringe = (lum[edge].mean() / max(lum[dense].mean(), 1e-6)) if dense.sum() > 50 else 1.0
    rgb = im[..., :3][dense].mean(axis=0) * 255 if dense.sum() > 50 else np.zeros(3)
    return dict(name=name, area=float(a.sum()), dense=int(dense.sum()),
                outside=float(outside.sum()), fringe=float(fringe),
                rgb="#%02x%02x%02x" % tuple(int(v) for v in np.clip(rgb, 0, 255)))


def icon_mean(path):
    r = sh("convert", path, "-background", "white", "-flatten", "-colors", "8",
           "-format", "%c", "histogram:info:")
    tot, ws = np.zeros(3), 0
    for ln in r.stdout.decode().splitlines():
        parts = ln.strip().split()
        if not parts or ":" not in parts[0]:
            continue
        n = int(parts[0].rstrip(":"))
        rgb = ln[ln.find("(") + 1:ln.find(")")].split(",")
        v = np.array([float(t) for t in rgb[:3]])
        if v.max() > 255:
            v = v / 257.0
        if v.min() > 235:      # белый фон иконки не считаем
            continue
        tot += n * v
        ws += n
    return tot / max(ws, 1)


def dist(a, b):
    return float(np.linalg.norm(np.array(a) - np.array(b)))


def to_hex(v):
    return "#%02x%02x%02x" % tuple(int(x) for x in np.clip(v, 0, 255))


# ------------------------------------------------------------------- отчёт
def tile(path, label, idx, w=228):
    n = f"{WORK}/t{idx}.png"
    sh("convert", path, "-background", "#202028", "-gravity", "north", "-splice", "0x42",
       "-resize", f"{w}x{w}", "-gravity", "north", "-fill", "#f2e7d5",
       "-font", "DejaVu-Sans", "-pointsize", "17", "-annotate", "+0+8", label,
       "-extent", f"{w}x{w+42}", n)
    return n


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--threshold", type=float, default=0.10)
    ap.add_argument("--min-area", type=int, default=120)
    ap.add_argument("--scan", action="store_true")
    ap.add_argument("--no-tint", action="store_true")
    ap.add_argument("--write", action="store_true", help="записать слои в ассеты")
    args = ap.parse_args()

    os.makedirs(WORK, exist_ok=True)
    base = read_rgba(BODY)
    bsil = base[..., 3] > 0.5
    L = landmarks(bsil, verbose=True)
    print(f"тело: {int(bsil.sum())} px, коридор ±{0.30*L['FW']:.0f} px от оси x={L['cx']}")

    if args.scan:
        print("\n=== подбор порога маски: сколько доспеха ловим и сколько мусора ===")
        print(f"{'порог':>6} {'доспех':>8} {'вне тела':>9} {'от figure':>10}")
        for T in (0.04, 0.06, 0.08, 0.10, 0.14, 0.18, 0.25):
            row = []
            for mat in FULL:
                full = read_rgba(FULL[mat])
                m, _ = armor_mask(base, full, T)
                m = clean_mask(m, args.min_area)
                row.append((m, m.sum(), (m & ~dilate(bsil, 3)).sum()))
            print(f"{T:6.2f} " + "  ".join(
                f"{RU[mat]}:{int(a):6d}/{int(o):5d}" for mat, a, o in
                zip(FULL, [r[1] for r in row], [r[2] for r in row])))
        return

    report = []
    for mat in ("cloth", "leather", "plate"):
        full = read_rgba(FULL[mat])
        m, d = armor_mask(base, full, args.threshold)
        m = clean_mask(m, args.min_area)
        z = build_zones(m, L)

        print(f"\n=== {RU[mat]}: доспех {int(m.sum())} px ===")
        layers, rows = {}, []
        for s in SLOTS:
            zm = z[s]
            if zm.sum() < 30:
                print(f"  {SLOT_RU[s]:6s} — пусто")
                continue
            lay = drop_specks(defringe(layer_from(full, zm)))
            st = stats(s, lay, bsil)
            icon = icon_mean(f"{ICON_DIR}/{mat}/t01/{s}.png")
            st["icon"] = to_hex(icon)
            st["delta"] = dist(np.array([int(st["rgb"][i:i + 2], 16) for i in (1, 3, 5)]), icon)
            st["cover"] = 100 * zm.sum() / max(m.sum(), 1)
            rows.append(st)
            layers[s] = lay
            write_rgba(f"{WORK}/{mat}-{s}-raw.png", lay)

        # общий привод цвета: один коэффициент на комплект, чтобы между
        # слоями не было цветовых ступенек
        cur = np.zeros(3)
        wsum = 0
        for st, s in zip(rows, [r["name"] for r in rows]):
            rgb = np.array([int(st["rgb"][i:i + 2], 16) for i in (1, 3, 5)], np.float32)
            cur += rgb * st["dense"]
            wsum += st["dense"]
        cur /= max(wsum, 1)
        if mat in TARGET_OVERRIDE:
            tgt = np.array(TARGET_OVERRIDE[mat], np.float32)
        else:
            tg = [icon_mean(f"{ICON_DIR}/{mat}/t01/{s}.png") for s in SLOTS]
            tgt = np.mean(np.array(tg), axis=0)
        gain = np.clip(tgt / np.maximum(cur, 1), 0.4, 2.0) if not args.no_tint else np.ones(3)

        for st in rows:
            s = st["name"]
            lay = layers[s].copy()
            lay[..., :3] = np.clip(lay[..., :3] * gain, 0, 1)
            layers[s] = lay
            icon = icon_mean(f"{ICON_DIR}/{mat}/t01/{s}.png")
            rgb = lay[..., :3][lay[..., 3] > 0.85].mean(axis=0) * 255
            st["tinted"] = to_hex(rgb)
            st["delta2"] = dist(rgb, icon)
            write_rgba(f"{WORK}/{mat}-{s}.png", lay)
            print(f"  {SLOT_RU[s]:6s} {st['area']:7.0f} px ({st['cover']:4.1f}% доспеха)  "
                  f"вне тела {st['outside']:5.0f}  бахрома {st['fringe']:.2f}  "
                  f"{st['rgb']}->{st['tinted']}  иконка {st['icon']}  Δ{st['delta']:.0f}->{st['delta2']:.0f}")
        print(f"  привод цвета: ×{gain[0]:.2f} {gain[1]:.2f} {gain[2]:.2f} "
              f"(цель {to_hex(tgt)})")

        # карта зон: видно, где именно проходят резы
        pal = {"helmet": (240, 80, 80), "chest": (80, 200, 120),
               "gloves": (80, 140, 240), "pants": (240, 200, 60),
               "boots": (200, 80, 220)}
        canvas = np.zeros(m.shape + (3,), np.float32)
        canvas[..., :] = np.array([0.13, 0.13, 0.16])
        canvas[bsil] = np.array([0.55, 0.55, 0.60])
        for sl, c in pal.items():
            canvas[z[sl]] = np.array(c) / 255.0
        write_rgba(f"{WORK}/zonemap-{mat}.png", np.dstack([canvas, np.ones(m.shape)]))

        # проверка сборки — по слоям до привода цвета, иначе в разницу
        # попадает сам привод
        raw = {s: read_rgba(f"{WORK}/{mat}-{s}-raw.png") for s in layers}
        cols = [base[..., :3]] + [raw[s][..., :3] for s in DRAW_ORDER if s in raw]
        als = [base[..., 3]] + [raw[s][..., 3] for s in DRAW_ORDER if s in raw]
        crgb, calpha = over(cols, als)
        want = full.copy()
        want_rgb = want[..., :3]
        resid = (np.abs(crgb - want_rgb).max(axis=2) > 0.08) & (want[..., 3] > 0.5)
        gap = (want[..., 3] > 0.9) & (calpha < 0.9)
        print(f"  сборка: не совпало {int(resid.sum()):5d} px "
              f"({100*resid.sum()/max(int(bsil.sum()),1):.1f}% фигуры), щелей {int(gap.sum())} px")
        write_rgba(f"{WORK}/{mat}-composed.png", np.dstack([crgb, calpha]))
        report.append((mat, rows, int(resid.sum()), int(gap.sum())))

    # лист для просмотра
    seq, i = [], 0
    for mat in ("cloth", "leather", "plate"):
        seq.append(tile(FULL[mat], f"{RU[mat]}: оригинал", i)); i += 1
        seq.append(tile(f"{WORK}/{mat}-composed.png", f"{RU[mat]}: из слоёв", i)); i += 1
        for s in SLOTS:
            p = f"{WORK}/{mat}-{s}.png"
            seq.append(tile(p, f"{RU[mat]}: {SLOT_RU[s]}", i)); i += 1
    sh("montage", *seq, "-tile", "7x3", "-geometry", "+8+8", "-background", "#14141a",
       f"{OUT_REVIEW}/review-18-layers-v2.jpg")
    print(f"\nлист: {OUT_REVIEW}/review-18-layers-v2.jpg")
    print("слои (до записи в ассеты):", WORK)
    if args.write:
        for mat in ("cloth", "leather", "plate"):
            for s in SLOTS:
                p = f"{WORK}/{mat}-{s}.png"
                if os.path.exists(p):
                    os.makedirs(f"{SETS_DIR}/{mat}", exist_ok=True)
                    sh("cp", p, f"{SETS_DIR}/{mat}/{s}.png")
        print("записано в", SETS_DIR)


if __name__ == "__main__":
    main()
