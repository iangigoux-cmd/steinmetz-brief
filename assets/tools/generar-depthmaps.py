#!/usr/bin/env python3
"""Genera mapas de profundidad de las fotos industriales con Depth-Anything V2.

Uso:  python3 assets/tools/generar-depthmaps.py
Entrada:  assets/web/img/*-1920.webp
Salida:   assets/web/depth/<base>.png   (gris, blanco = cerca)

Corre local en CPU. No toca ninguna imagen existente: solo escribe en depth/.
"""
import re
import sys
from pathlib import Path

import numpy as np
import torch
from PIL import Image
from transformers import AutoImageProcessor, AutoModelForDepthEstimation

RAIZ = Path(__file__).resolve().parent.parent.parent
ENTRADA = RAIZ / "assets" / "web" / "img"
SALIDA = RAIZ / "assets" / "web" / "depth"
MODELO = "depth-anything/Depth-Anything-V2-Small-hf"
ANCHO_SALIDA = 960          # el mapa no necesita la resolución de la foto


def base_sin_ancho(nombre: str) -> str:
    """01-marca-tiza-acero-1920.webp -> 01-marca-tiza-acero"""
    return re.sub(r"-\d+$", "", Path(nombre).stem)


def main():
    fotos = sorted(ENTRADA.glob("*-1920.webp"))
    if not fotos:
        sys.exit(f"No hay fotos en {ENTRADA}")

    SALIDA.mkdir(parents=True, exist_ok=True)
    print(f"Cargando {MODELO} (la primera vez descarga ~100 MB)…")
    proc = AutoImageProcessor.from_pretrained(MODELO)
    modelo = AutoModelForDepthEstimation.from_pretrained(MODELO).eval()

    for foto in fotos:
        img = Image.open(foto).convert("RGB")
        with torch.no_grad():
            entradas = proc(images=img, return_tensors="pt")
            prof = modelo(**entradas).predicted_depth

        prof = torch.nn.functional.interpolate(
            prof.unsqueeze(1), size=img.size[::-1], mode="bicubic",
            align_corners=False).squeeze()

        a = prof.numpy()
        a = (a - a.min()) / max(a.max() - a.min(), 1e-6)     # 0..1, cerca = 1
        mapa = Image.fromarray((a * 255).astype(np.uint8), mode="L")

        alto = round(ANCHO_SALIDA * img.size[1] / img.size[0])
        mapa = mapa.resize((ANCHO_SALIDA, alto), Image.LANCZOS)

        destino = SALIDA / f"{base_sin_ancho(foto.name)}.png"
        mapa.save(destino, optimize=True)
        kb = destino.stat().st_size / 1024
        # El rango dinámico dice si el mapa sirve: uno plano no aporta volumen.
        rango = float(a.max() - a.min())
        desvio = float(a.std())
        print(f"  {foto.name}  ->  {destino.name}  ({kb:.0f} KB · "
              f"rango {rango:.2f} · desvío {desvio:.3f})")

    print(f"\nListo: {len(fotos)} mapa(s) en {SALIDA}")
    print("Un desvío bajo (< 0.12) indica un mapa casi plano: esa foto conviene "
          "servirla sin profundidad.")


if __name__ == "__main__":
    main()
