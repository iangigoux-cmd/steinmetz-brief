#!/usr/bin/env python3
"""Genera el favicon de Steinmetz desde Fraunces.

Por qué existe este script y no un archivo suelto: el icono es la S del
nombre en la tipografía de la marca, así que si algún día cambia el peso o la
tipografía, esto se vuelve a correr y sale todo coherente.

Google **no acepta favicons en data: URI** —por eso el sitio salía con el
globo genérico en los resultados—, así que hacen falta archivos servidos
desde una URL propia, y un /favicon.ico en la raíz como respaldo.

    python3 herramientas/icono.py
"""
import pathlib
import urllib.request

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.ttLib import TTFont
from PIL import Image, ImageDraw, ImageFont

AQUI = pathlib.Path(__file__).resolve().parent
RAIZ = AQUI.parent
FUENTE = AQUI / "fraunces-600.ttf"
# Fraunces 144pt SemiBold: el mismo peso óptico con que se dibuja el nombre.
CSS = "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@144,600&display=swap"

TINTA = (17, 17, 18, 255)
PAPEL = (255, 255, 255, 255)
LETRA = "S"      # una sola: «SZ» a 16 píxeles es una mancha, la S se lee.
RADIO = 0.2
MARGEN = 0.13


def bajar_fuente():
    if FUENTE.exists():
        return
    pedir = urllib.request.Request(CSS, headers={"User-Agent": "Mozilla/5.0"})
    css = urllib.request.urlopen(pedir).read().decode()
    url = css.split("url(")[1].split(")")[0]
    FUENTE.write_bytes(urllib.request.urlopen(url).read())


def cuadro(lado):
    """El icono como mapa de bits.

    Se dibuja a 8× y se reduce: el suavizado al reducir es mucho mejor que el
    que hace el rasterizador con una letra chica, y en una serifa de alto
    contraste esa diferencia es que se lea o sea una mancha gris.
    """
    E, g = 8, lado * 8
    im = Image.new("RGBA", (g, g), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle([0, 0, g - 1, g - 1], radius=int(g * RADIO), fill=TINTA)
    caja = g * (1 - MARGEN * 2)
    tam = int(caja)
    while tam > 4:
        f = ImageFont.truetype(str(FUENTE), tam)
        x0, y0, x1, y1 = d.textbbox((0, 0), LETRA, font=f)
        if (x1 - x0) <= caja and (y1 - y0) <= caja:
            break
        tam -= 4
    f = ImageFont.truetype(str(FUENTE), tam)
    x0, y0, x1, y1 = d.textbbox((0, 0), LETRA, font=f)
    d.text(((g - (x1 + x0)) / 2, (g - (y1 + y0)) / 2), LETRA, font=f, fill=PAPEL)
    return im.resize((lado, lado), Image.LANCZOS)


def svg():
    """El icono como vector, con la letra convertida a trazo.

    Va como trazo y no como <text>: un <text> depende de que quien lo dibuje
    tenga Fraunces instalada, y nadie la tiene. Era el otro defecto del icono
    anterior, que pedía Georgia y salía distinto en cada máquina.
    """
    f = TTFont(FUENTE)
    upm = f["head"].unitsPerEm
    glifo = f.getGlyphSet()[f.getBestCmap()[ord(LETRA)]]
    pluma = SVGPathPen(f.getGlyphSet())
    glifo.draw(pluma)

    caja = 100 * (1 - MARGEN * 2)
    escala = caja / upm
    # El alto real de la letra, para centrarla por lo que se ve y no por su
    # caja tipográfica —que incluye el espacio de acentos y la deja alta.
    xmin, ymin, xmax, ymax = f["glyf"][f.getBestCmap()[ord(LETRA)]].xMin, \
        f["glyf"][f.getBestCmap()[ord(LETRA)]].yMin, \
        f["glyf"][f.getBestCmap()[ord(LETRA)]].xMax, \
        f["glyf"][f.getBestCmap()[ord(LETRA)]].yMax
    k = caja / max(xmax - xmin, ymax - ymin)
    dx = (100 - (xmax - xmin) * k) / 2 - xmin * k
    dy = (100 + (ymax - ymin) * k) / 2 + ymin * k
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">'
        f'<rect width="100" height="100" rx="{RADIO * 100:g}" fill="#111112"/>'
        f'<path transform="translate({dx:.2f} {dy:.2f}) scale({k:.5f} -{k:.5f})" '
        f'fill="#ffffff" d="{pluma.getCommands()}"/></svg>\n'
    )


if __name__ == "__main__":
    bajar_fuente()
    (RAIZ / "assets/icono.svg").write_text(svg(), encoding="utf-8")
    for lado, nombre in ((512, "icono-512.png"), (192, "icono-192.png"),
                         (180, "apple-touch-icon.png")):
        cuadro(lado).save(RAIZ / "assets" / nombre)
    # El .ico lleva los tres tamaños adentro: Google pide 48, los navegadores
    # viejos piden 16 y 32, y un solo archivo los sirve a todos.
    cuadro(48).save(RAIZ / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
    print("icono.svg · icono-512.png · icono-192.png · apple-touch-icon.png · favicon.ico")
