#!/usr/bin/env python3
"""Quita el sparkle de Gemini/Veo de un video, cuadro por cuadro.

Que NO funciono, por si alguien quiere reintentarlo:

- `delogo` de ffmpeg interpola desde los bordes de una caja. Sobre fondo negro
  es invisible, pero cuando aparece textura estira las sombras y deja vetas
  verticales.
- Pegar un parche cuadrado tomado de otra parte del mismo cuadro. La caja de
  76x76 es diez veces mas grande que el rombo, y como las bandas de sombra de
  estas tomas son diagonales, cualquier parche corrido deja un escalon en el
  borde de la banda.

Lo que si funciona: el rombo ocupa solo ~10% de su caja contenedora, asi que se
detecta su forma exacta y se rellena unicamente esa silueta con Navier-Stokes,
que continua bordes mejor que TELEA. Queda poco que reconstruir y el resultado
no se distingue.

Uso:
    python3 limpiar-watermark-video.py entrada.mp4 salida.mp4
"""
import subprocess
import sys
from pathlib import Path

import cv2
import numpy as np

MARGEN = 96      # distancia del watermark a la esquina inferior derecha
LADO = 48        # tamano del rombo
HOLGURA = 20     # margen de busqueda alrededor
DILATA = 4       # crece la mascara para tapar el antialias del borde
RADIO = 6        # radio de reconstruccion
CRF = "16"


def detectar_rombo(cap, x1, y1, x2, y2, muestras=60):
    """Saca la silueta del sparkle del cuadro con el fondo mas oscuro."""
    mejor_roi, mejor_fondo = None, np.inf
    for i in range(muestras):
        ok, f = cap.read()
        if not ok:
            break
        roi = cv2.cvtColor(f[y1:y2, x1:x2], cv2.COLOR_BGR2GRAY)
        fondo = float(np.median(roi))       # el rombo es minoria: la mediana es el fondo
        if fondo < mejor_fondo:
            mejor_fondo, mejor_roi = fondo, roi
    cap.set(cv2.CAP_PROP_POS_FRAMES, 0)

    if mejor_roi is None:
        return None
    umbral = (float(mejor_roi.max()) + mejor_fondo) / 2
    _, m = cv2.threshold(mejor_roi, umbral, 255, cv2.THRESH_BINARY)
    n, lab, stats, _ = cv2.connectedComponentsWithStats(m, 8)
    if n < 2:
        return None
    grande = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
    m = (lab == grande).astype(np.uint8) * 255
    return cv2.dilate(m, np.ones((DILATA * 2 + 1,) * 2, np.uint8))


def limpiar(entrada: Path, salida: Path) -> None:
    cap = cv2.VideoCapture(str(entrada))
    if not cap.isOpened():
        raise SystemExit(f"no se pudo abrir {entrada}")

    w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = cap.get(cv2.CAP_PROP_FPS) or 24

    x2, y2 = w - MARGEN + HOLGURA, h - MARGEN + HOLGURA
    x1, y1 = w - MARGEN - LADO - HOLGURA, h - MARGEN - LADO - HOLGURA

    rombo = detectar_rombo(cap, x1, y1, x2, y2)
    if rombo is None:
        raise SystemExit("no se detecto el sparkle; revisa MARGEN y LADO")
    area = int(rombo.sum() // 255)

    mask = np.zeros((h, w), np.uint8)
    mask[y1:y2, x1:x2] = rombo

    ffmpeg = subprocess.Popen(
        ["ffmpeg", "-v", "error", "-y",
         "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{w}x{h}", "-r", str(fps), "-i", "-",
         "-i", str(entrada),
         "-map", "0:v:0", "-map", "1:a:0?",
         "-c:v", "libx264", "-crf", CRF, "-preset", "slow", "-pix_fmt", "yuv420p",
         "-c:a", "copy", "-movflags", "+faststart", "-shortest",
         str(salida)],
        stdin=subprocess.PIPE)

    n = 0
    while True:
        ok, frame = cap.read()
        if not ok:
            break
        ffmpeg.stdin.write(cv2.inpaint(frame, mask, RADIO, cv2.INPAINT_NS).tobytes())
        n += 1

    cap.release()
    ffmpeg.stdin.close()
    ffmpeg.wait()
    print(f"{salida.name}  {n} cuadros  {w}x{h} @ {fps:g}fps  mascara {area}px")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit(__doc__)
    limpiar(Path(sys.argv[1]), Path(sys.argv[2]))
