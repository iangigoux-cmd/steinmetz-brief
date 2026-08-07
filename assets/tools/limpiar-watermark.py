#!/usr/bin/env python3
"""Quita el sparkle de Gemini de las imagenes de la biblioteca Steinmetz.

Gemini estampa el watermark en una posicion fija: un rombo de ~88x95 px cuyo
borde inferior-derecho queda a 195 px de la esquina inferior-derecha.

El relleno automatico de OpenCV (inpaint) deja manchones sobre textura con
contraste, asi que en vez de inventar pixeles buscamos dentro de la MISMA
imagen el parche mas parecido y lo pegamos con los bordes difuminados.

Uso:
    python3 limpiar-watermark.py                    # usa el mapa de abajo
    python3 limpiar-watermark.py entrada.png salida.png
"""
import sys
import cv2
import numpy as np
from pathlib import Path

SRC = Path.home() / "Downloads"
DST = Path(__file__).resolve().parent.parent / "img"

# archivo de Gemini -> nombre en la biblioteca
BIBLIOTECA = {
    "Gemini_Generated_Image_jtbnawjtbnawjtbn.png": "01-marca-tiza-acero.png",
    "Gemini_Generated_Image_465xe7465xe7465x.png": "02-nave-estanques.png",
    "Gemini_Generated_Image_374vx4374vx4374v.png": "03-tiza-bodegon.png",
    "Gemini_Generated_Image_jw89j4jw89j4jw89.png": "04-polvo-contraluz.png",
    "Gemini_Generated_Image_13s49y13s49y13s4.png": "05-cenital-placa-x.png",
    "Gemini_Generated_Image_bu4gezbu4gezbu4g.png": "06-testigos-sondaje.png",
    "Gemini_Generated_Image_1h0euj1h0euj1h0e.png": "07-neumatico-minero.png",
    "Gemini_Generated_Image_dleeerdleeerdlee.png": "08-marcas-en-roca.png",
}

MARGEN, ANCHO, ALTO = 195, 88, 95   # geometria medida del watermark
PAD = 20                             # margen extra alrededor del hueco
ANILLO = 24                          # grosor del borde que se compara


def caja(w, h):
    """Devuelve la caja a reparar, con padding."""
    x2, y2 = w - MARGEN + PAD, h - MARGEN + PAD
    x1, y1 = w - MARGEN - ANCHO - PAD, h - MARGEN - ALTO - PAD
    return x1, y1, x2, y2


def mejor_offset(img, x1, y1, x2, y2):
    """Busca el desplazamiento cuyo borde calza mejor con el borde del hueco."""
    h, w = img.shape[:2]
    hh, hw = y2 - y1, x2 - x1
    ring = img[y1 - ANILLO:y2 + ANILLO, x1 - ANILLO:x2 + ANILLO].astype(np.float32)

    mejor, mejor_d = None, np.inf
    for dy in range(-320, 321, 16):
        for dx in range(-460, 461, 16):
            if abs(dx) < hw + ANILLO and abs(dy) < hh + ANILLO:
                continue  # se solapa con el hueco
            sy1, sx1 = y1 + dy - ANILLO, x1 + dx - ANILLO
            sy2, sx2 = y2 + dy + ANILLO, x2 + dx + ANILLO
            if sy1 < 0 or sx1 < 0 or sy2 > h or sx2 > w:
                continue
            cand = img[sy1:sy2, sx1:sx2].astype(np.float32)
            if cand.shape != ring.shape:
                continue
            d = (np.mean(np.abs(cand[:ANILLO] - ring[:ANILLO]))
                 + np.mean(np.abs(cand[-ANILLO:] - ring[-ANILLO:]))
                 + np.mean(np.abs(cand[:, :ANILLO] - ring[:, :ANILLO]))
                 + np.mean(np.abs(cand[:, -ANILLO:] - ring[:, -ANILLO:])))
            if d < mejor_d:
                mejor_d, mejor = d, (dx, dy)
    return mejor, mejor_d


def limpiar(entrada: Path, salida: Path) -> str:
    img = cv2.imread(str(entrada), cv2.IMREAD_COLOR)
    if img is None:
        return f"no se pudo leer {entrada.name}"
    h, w = img.shape[:2]
    x1, y1, x2, y2 = caja(w, h)

    off, dist = mejor_offset(img, x1, y1, x2, y2)
    if off is None:
        return f"{salida.name}: sin parche candidato, se dejo igual"
    dx, dy = off

    parche = img[y1 + dy:y2 + dy, x1 + dx:x2 + dx].astype(np.float32)
    original = img[y1:y2, x1:x2].astype(np.float32)

    # mascara opaca al centro, transparente en los bordes
    m = np.zeros((y2 - y1, x2 - x1), np.float32)
    m[PAD // 2:-PAD // 2, PAD // 2:-PAD // 2] = 1.0
    m = cv2.GaussianBlur(m, (0, 0), PAD / 2.2)[..., None]

    img[y1:y2, x1:x2] = (parche * m + original * (1 - m)).astype(np.uint8)
    salida.parent.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(str(salida), img, [cv2.IMWRITE_PNG_COMPRESSION, 6])
    return f"{salida.name}  ({w}x{h})  offset ({dx:+d},{dy:+d})  dif {dist:.1f}"


if __name__ == "__main__":
    if len(sys.argv) == 3:
        print(limpiar(Path(sys.argv[1]), Path(sys.argv[2])))
    else:
        for origen, destino in BIBLIOTECA.items():
            ruta = SRC / origen
            if ruta.exists():
                print(limpiar(ruta, DST / destino))
            else:
                print(f"falta en Downloads: {origen}")
