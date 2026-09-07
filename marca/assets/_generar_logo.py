#!/usr/bin/env python3
"""Traza el wordmark de Steinmetz a vector y exporta SVG y PNG.

El logo no tiene un peso único: cada letra pesa más que la anterior, de 300 en
la S a 900 en la z, con la curva acelerando al final. Acá esa rampa se congela
en contornos, para que el archivo no dependa de que cargue la fuente.

    peso(i) = 300 + (i/(n-1))^1.75 * 600      opsz fijo en 144

Requiere: fonttools, brotli, y la variable de Fraunces (se baja de Google Fonts).
Uso:  python3 _generar_logo.py
"""
from pathlib import Path
import subprocess
import sys

from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen

AQUI = Path(__file__).resolve().parent
FUENTE = AQUI / "_fraunces-var.ttf"
PALABRA = "Steinmetz"
OPSZ = 144
INTERLETRA = -0.03          # em, igual que en la web
TINTA = "#111112"
PAPEL = "#ffffff"


def peso(i, n):
    return 300 + (i / (n - 1)) ** 1.75 * 600


def bajar_fuente():
    if FUENTE.exists():
        return
    ua = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
          "(KHTML, like Gecko) Chrome/120.0 Safari/537.36")
    css = subprocess.run(
        ["curl", "-sA", ua,
         "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,100..900"],
        capture_output=True, text=True, check=True).stdout
    # Google trocea la fuente por alfabeto: hay que tomar el bloque latino,
    # no el primero, o el archivo no trae ni la S.
    url = None
    for bloque in css.split("@font-face"):
        if "U+0000-00FF" in bloque and "url(" in bloque:
            url = bloque.split("url(")[1].split(")")[0]
            break
    if not url:
        raise SystemExit("no encontré el subconjunto latino en el CSS de Google Fonts")
    woff2 = AQUI / "_fraunces-var.woff2"
    subprocess.run(["curl", "-sLo", str(woff2), url], check=True)
    f = TTFont(str(woff2)); f.flavor = None; f.save(str(FUENTE))
    woff2.unlink()


def trazar():
    """Devuelve (paths, ancho, alto, dy) en unidades de la fuente."""
    base = TTFont(str(FUENTE))
    upem = base["head"].unitsPerEm
    espacio = INTERLETRA * upem
    n = len(PALABRA)

    piezas, x = [], 0.0
    minx = miny = float("inf"); maxx = maxy = float("-inf")
    for i, ch in enumerate(PALABRA):
        inst = instantiateVariableFont(
            TTFont(str(FUENTE)), {"opsz": OPSZ, "wght": peso(i, n)}, inplace=False)
        glifo = inst.getBestCmap()[ord(ch)]
        gs = inst.getGlyphSet()
        pluma = SVGPathPen(gs)
        gs[glifo].draw(pluma)
        lim = BoundsPen(gs); gs[glifo].draw(lim)
        if lim.bounds:
            x0, y0, x1, y1 = lim.bounds
            minx = min(minx, x + x0); maxx = max(maxx, x + x1)
            miny = min(miny, y0);     maxy = max(maxy, y1)
        piezas.append((pluma.getCommands(), x))
        x += inst["hmtx"][glifo][0] + espacio
    return piezas, (minx, miny, maxx, maxy), upem


def svg(piezas, caja, upem, color, fondo=None):
    minx, miny, maxx, maxy = caja
    an, al = maxx - minx, maxy - miny
    cuerpo = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {an:.0f} {al:.0f}" '
              f'width="{an/upem*100:.1f}" height="{al/upem*100:.1f}" '
              f'role="img" aria-label="Steinmetz">',
              '<title>Steinmetz</title>']
    if fondo:
        cuerpo.append(f'<rect width="{an:.0f}" height="{al:.0f}" fill="{fondo}"/>')
    cuerpo.append(f'<g fill="{color}" transform="translate({-minx:.2f},{maxy:.2f}) scale(1,-1)">')
    for d, x in piezas:
        cuerpo.append(f'<path transform="translate({x:.2f},0)" d="{d}"/>')
    cuerpo.append("</g></svg>")
    return "\n".join(cuerpo)


def monograma(color, fondo, radio_pct=20):
    """La S sola, centrada en un cuadrado. Peso 800, como manda el manual."""
    base = TTFont(str(FUENTE))
    upem = base["head"].unitsPerEm
    inst = instantiateVariableFont(TTFont(str(FUENTE)),
                                   {"opsz": OPSZ, "wght": 800}, inplace=False)
    glifo = inst.getBestCmap()[ord("S")]
    gs = inst.getGlyphSet()
    pluma = SVGPathPen(gs); gs[glifo].draw(pluma)
    lim = BoundsPen(gs); gs[glifo].draw(lim)
    x0, y0, x1, y1 = lim.bounds
    lado = upem
    dx = (lado - (x1 - x0)) / 2 - x0
    dy = (lado - (y1 - y0)) / 2 - y0
    r = lado * radio_pct / 100
    piezas = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {lado} {lado}" '
              f'width="256" height="256" role="img" aria-label="Steinmetz">',
              "<title>Steinmetz</title>"]
    if fondo:
        piezas.append(f'<rect width="{lado}" height="{lado}" rx="{r:.0f}" fill="{fondo}"/>')
    piezas.append(f'<g fill="{color}" transform="translate({dx:.2f},{lado - dy:.2f}) scale(1,-1)">'
                  f'<path d="{pluma.getCommands()}"/></g></svg>')
    return "\n".join(piezas)


def exportar_png(svgs, ancho_px):
    """Rasteriza con el navegador: es el mismo motor que dibuja el sitio."""
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("sin playwright: me salto los PNG"); return
    import base64
    with sync_playwright() as p:
        nav = p.chromium.launch(headless=True)
        for nombre, alto_rel in svgs:
            svg = (AQUI / nombre).read_text()
            alto = round(ancho_px * alto_rel)
            pg = nav.new_page(viewport={"width": ancho_px, "height": alto},
                              device_scale_factor=1)
            b64 = base64.b64encode(svg.encode()).decode()
            pg.set_content(
                f'<body style="margin:0"><img src="data:image/svg+xml;base64,{b64}" '
                f'style="width:{ancho_px}px;height:{alto}px;display:block">')
            pg.wait_for_timeout(350)
            destino = AQUI / nombre.replace(".svg", f"-{ancho_px}.png")
            pg.screenshot(path=str(destino), omit_background=True)
            pg.close()
            print("escrito:", destino.name)
        nav.close()


if __name__ == "__main__":
    bajar_fuente()
    piezas, caja, upem = trazar()
    salidas = {
        "steinmetz-wordmark.svg":            (TINTA, None),
        "steinmetz-wordmark-blanco.svg":     (PAPEL, None),
        "steinmetz-wordmark-color.svg":      ("currentColor", None),
    }
    for nombre, (color, fondo) in salidas.items():
        (AQUI / nombre).write_text(svg(piezas, caja, upem, color, fondo))
        print("escrito:", nombre)
    (AQUI / "steinmetz-monograma.svg").write_text(monograma("#ffffff", "#111112"))
    (AQUI / "steinmetz-monograma-invertido.svg").write_text(monograma("#111112", "#ffffff"))
    (AQUI / "steinmetz-monograma-azul.svg").write_text(monograma("#ffffff", "#12439c"))
    print("escrito: steinmetz-monograma.svg (+ invertido, + azul)")

    an = caja[2] - caja[0]; al = caja[3] - caja[1]
    prop = al / an
    for ancho in (1200, 2400):
        exportar_png([("steinmetz-wordmark.svg", prop),
                      ("steinmetz-wordmark-blanco.svg", prop)], ancho)
    for lado in (512, 1024):
        exportar_png([("steinmetz-monograma.svg", 1.0)], lado)
    print(f"proporción del logo: {an/al:.3f} : 1  ({an:.0f} × {al:.0f} unidades)")
