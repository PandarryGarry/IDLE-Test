#!/usr/bin/env python3
"""Общие функции для работы с манекеном: чтение, морфология, ориентиры.

Зависимости: numpy, scipy (pip install numpy scipy).
Все пути — относительно репозитория, вход и выход лежат в нём же, чтобы
ничего не пропадало между сессиями.
"""
import os
import subprocess
import numpy as np
from scipy import ndimage

ROOT = "/home/user/IDLE-Test/artifacts/my-app/public"


def _run(args):
    r = subprocess.run(args, capture_output=True)
    if r.returncode:
        raise RuntimeError(f"{args[:5]} -> {r.stderr.decode()[:300]}")
    return r.stdout


def read_rgba(path):
    w, h = map(int, _run(["identify", "-format", "%w %h", path]).split())
    buf = _run(["convert", path, "-depth", "8", "rgba:-"])
    return np.frombuffer(buf, np.uint8).reshape(h, w, 4).astype(np.float32) / 255.0


def write_rgba(path, arr):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    h, w = arr.shape[:2]
    d = (np.clip(arr, 0, 1) * 255 + 0.5).astype(np.uint8).tobytes()
    p = subprocess.Popen(["convert", "-size", f"{w}x{h}", "-depth", "8", "rgba:-", path],
                         stdin=subprocess.PIPE)
    p.communicate(d)
    return path


def dilate(m, r=1):
    return ndimage.binary_dilation(m > 0.5, iterations=int(r)) if r else (m > 0.5)


def erode(m, r=1):
    return ndimage.binary_erosion(m > 0.5, iterations=int(r)) if r else (m > 0.5)


def fill_holes(m):
    return ndimage.binary_fill_holes(m > 0.5)


def components(m, min_area=0):
    """Оставить только связные куски не меньше min_area."""
    lab, n = ndimage.label(m > 0.5)
    if n == 0:
        return np.zeros_like(m, bool)
    sizes = ndimage.sum(np.ones_like(lab, np.float32), lab, range(1, n + 1))
    keep = [i + 1 for i, s in enumerate(sizes) if s >= min_area]
    return np.isin(lab, keep)


def row_runs(row):
    """Непрерывные отрезки True в строке: [(x0, x1), ...]."""
    out, start = [], None
    for x, v in enumerate(row):
        if v and start is None:
            start = x
        elif not v and start is not None:
            out.append((start, x - 1)); start = None
    if start is not None:
        out.append((start, len(row) - 1))
    return out


def narrowest(sil, y0, y1, x0=None, x1=None, mode="count"):
    """Строка с минимальной шириной силуэта в полосе.

    mode='count'  — считаем все пиксели строки в полосе;
    mode='center' — берём отрезок, содержащий центр полосы (для торса,
                    чтобы руки не мешали).
    """
    H, W = sil.shape
    cx = W // 2
    best = None
    for y in range(max(0, int(y0)), min(H, int(y1))):
        row = sil[y]
        lo = 0 if x0 is None else int(x0 * W)
        hi = W - 1 if x1 is None else int(x1 * W)
        if mode == "count":
            w = int(row[lo:hi + 1].sum())
        else:
            runs = [(a, b) for a, b in row_runs(row) if a <= cx <= b]
            w = sum(b - a + 1 for a, b in runs)
        if best is None or w < best[1]:
            best = (y, w)
    return best


def widest(sil, y0, y1, x0=None, x1=None):
    H, W = sil.shape
    best = None
    for y in range(max(0, int(y0)), min(H, int(y1))):
        lo = 0 if x0 is None else int(x0 * W)
        hi = W - 1 if x1 is None else int(x1 * W)
        w = int(sil[y][lo:hi + 1].sum())
        if best is None or w > best[1]:
            best = (y, w)
    return best


def landmarks(sil):
    """Ориентиры тела в абсолютных координатах канона 384."""
    rows = np.where(sil.any(axis=1))[0]
    top, bot = int(rows.min()), int(rows.max())
    H = bot - top
    cols = np.where(sil.any(axis=0))[0]
    W = int(cols.max()) - int(cols.min())
    cx = (int(cols.min()) + int(cols.max())) // 2

    neck_y = narrowest(sil, top + 0.08 * H, top + 0.24 * H)[0]
    sh_y = widest(sil, top + 0.13 * H, top + 0.34 * H)[0]
    waist_y = narrowest(sil, top + 0.40 * H, top + 0.62 * H,
                        x0=(int(cols.min()) + 0.16 * W) / sil.shape[1],
                        x1=(int(cols.min()) + 0.84 * W) / sil.shape[1])[0]
    # запястья: самая узкая строка в полосе руки
    wl = narrowest(sil, top + 0.42 * H, top + 0.70 * H,
                   x0=0, x1=(int(cols.min()) + 0.34 * W) / sil.shape[1])[0]
    wr = narrowest(sil, top + 0.42 * H, top + 0.70 * H,
                   x0=(int(cols.min()) + 0.66 * W) / sil.shape[1], x1=1)[0]
    # лодыжки: самая узкая строка в полосе каждой ноги
    al = narrowest(sil, top + 0.78 * H, top + 0.95 * H,
                   x0=(int(cols.min()) + 0.18 * W) / sil.shape[1],
                   x1=(int(cols.min()) + 0.48 * W) / sil.shape[1])[0]
    ar = narrowest(sil, top + 0.78 * H, top + 0.95 * H,
                   x0=(int(cols.min()) + 0.52 * W) / sil.shape[1],
                   x1=(int(cols.min()) + 0.82 * W) / sil.shape[1])[0]
    return dict(top=top, bot=bot, H=H, W=W, cx=cx, neck=neck_y, shoulder=sh_y,
                waist=waist_y, wrist_l=wl, wrist_r=wr, ankle_l=al, ankle_r=ar)


def over(colors, alphas):
    """Последовательная сборка слоёв снизу вверх."""
    out = np.zeros(colors[0].shape, np.float32)
    oa = np.zeros(colors[0].shape[:2], np.float32)
    for c, a in zip(colors, alphas):
        aa = a[..., None]
        out = c * aa + out * (1 - aa)
        oa = a + oa * (1 - a)
    return out, oa
