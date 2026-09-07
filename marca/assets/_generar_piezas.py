#!/usr/bin/env python3
"""Arma las piezas listas para subir: perfiles, portadas y firma de correo.

Cada red pide un tamaño distinto y recorta distinto. Las de perfil van a
sangre completa —sin esquina redondeada— porque LinkedIn e Instagram recortan
en círculo por su cuenta; si el archivo ya trajera radio, quedaría un doble
redondeo sucio.

Se compone en el navegador con los SVG ya trazados y se captura al pixel
exacto. Correr _generar_logo.py antes, para que existan los SVG.

Uso:  python3 _generar_piezas.py
"""
from pathlib import Path
import base64

from playwright.sync_api import sync_playwright

AQUI = Path(__file__).resolve().parent
SALIDA = AQUI / "piezas"
TINTA = "#111112"
PAPEL = "#ffffff"
DESCRIPTOR = "INGENIERÍA EN INTELIGENCIA ARTIFICIAL"

FUENTES = ('<link rel="stylesheet" href="https://fonts.googleapis.com/css2?'
           'family=IBM+Plex+Mono:wght@400;500&display=swap">')


def dato(nombre):
    svg = (AQUI / nombre).read_text()
    return "data:image/svg+xml;base64," + base64.b64encode(svg.encode()).decode()


def marco(cuerpo, fondo, an, al):
    return f"""<!doctype html><meta charset="utf-8">{FUENTES}
<style>*{{margin:0;padding:0;box-sizing:border-box}}
html,body{{width:{an}px;height:{al}px;overflow:hidden}}
body{{background:{fondo};display:flex;font-family:"IBM Plex Mono",monospace}}
img{{display:block}}</style>{cuerpo}"""


def perfil(an, fondo, mono):
    """Cuadrado a sangre: el monograma centrado, ocupando el 46 % del lado."""
    return marco(f'<body style="align-items:center;justify-content:center">'
                 f'<img src="{dato(mono)}" style="width:{an*0.46:.0f}px">', fondo, an, an)


def portada(an, al, fondo, wm, con_descriptor=True, color_desc="#8d8b86", lado="derecha"):
    """Banner con la marca al costado seguro.

    LinkedIn y X montan la foto de perfil sobre la esquina inferior IZQUIERDA
    del banner, así que la marca va a la derecha o queda tapada.
    """
    alto_wm = al * 0.22
    margen = al * 0.20
    desc = (f'<div style="font-size:{max(9, al*0.032):.0f}px;letter-spacing:.22em;'
            f'color:{color_desc};margin-top:{al*0.055:.0f}px">{DESCRIPTOR}</div>'
            if con_descriptor else "")
    if lado == "derecha":
        caja = (f'<body style="align-items:center;justify-content:flex-end;'
                f'padding-right:{margen:.0f}px">')
        alineado = 'style="text-align:right"'
    else:
        caja = f'<body style="align-items:center;padding-left:{margen:.0f}px">'
        alineado = ""
    return marco(
        f'{caja}<div {alineado}><img src="{dato(wm)}" '
        f'style="height:{alto_wm:.0f}px;margin-left:auto">{desc}</div>',
        fondo, an, al)


def centrado(an, al, fondo, wm, proporcion=0.52):
    return marco(f'<body style="align-items:center;justify-content:center">'
                 f'<img src="{dato(wm)}" style="width:{an*proporcion:.0f}px">', fondo, an, al)


PIEZAS = [
    # perfiles: cuadrados a sangre, los recorta la red
    ("perfil-linkedin-400.png",      400, 400, lambda: perfil(400, TINTA, "steinmetz-monograma-sello.svg")),
    ("perfil-instagram-1000.png",   1000, 1000, lambda: perfil(1000, TINTA, "steinmetz-monograma-sello.svg")),
    ("perfil-whatsapp-500.png",      500, 500, lambda: perfil(500, TINTA, "steinmetz-monograma-sello.svg")),
    ("perfil-claro-1000.png",       1000, 1000, lambda: perfil(1000, PAPEL, "steinmetz-monograma-invertido.svg")),
    # portadas
    ("linkedin-portada-empresa-1128x191.png", 1128, 191,
     lambda: portada(1128, 191, TINTA, "steinmetz-wordmark-blanco.svg")),
    ("linkedin-banner-personal-1584x396.png", 1584, 396,
     lambda: portada(1584, 396, TINTA, "steinmetz-wordmark-blanco.svg")),
    ("x-header-1500x500.png", 1500, 500,
     lambda: portada(1500, 500, TINTA, "steinmetz-wordmark-blanco.svg")),
    # instagram
    ("instagram-post-1080.png", 1080, 1080,
     lambda: centrado(1080, 1080, PAPEL, "steinmetz-wordmark.svg", .62)),
    ("instagram-historia-1080x1920.png", 1080, 1920,
     lambda: centrado(1080, 1920, TINTA, "steinmetz-wordmark-blanco.svg", .68)),
    # firma de correo: se muestra a la mitad, para que se vea nítida en pantalla retina
    ("firma-correo-600.png", 600, 600,
     lambda: marco(f'<body style="align-items:flex-start"><img src="{dato("steinmetz-wordmark.svg")}" '
                   f'style="width:600px">', "rgba(0,0,0,0)", 600, 124)),
]


def firma_html():
    return """<!-- Firma de Gmail. Copiar todo esto y pegarlo en Configuración → Firma.
     Gmail conserva la tabla y el logo apuntando a steinmetz.cl. -->
<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,Helvetica,sans-serif;color:#111112">
  <tr>
    <td style="padding:0 0 10px">
      <img src="https://steinmetz.cl/marca/assets/piezas/firma-correo-600.png"
           alt="Steinmetz" width="150" style="display:block;border:0">
    </td>
  </tr>
  <tr>
    <td style="font-size:13px;line-height:1.7;color:#111112">
      <strong style="font-weight:700">Ian Berndt</strong><br>
      <span style="color:#6e6e73">Steinmetz SpA</span><br>
      <a href="mailto:ian@steinmetz.cl" style="color:#111112;text-decoration:none">ian@steinmetz.cl</a>
      &nbsp;&middot;&nbsp;
      <a href="tel:+56993215043" style="color:#111112;text-decoration:none">+56 9 9321 5043</a><br>
      <a href="https://steinmetz.cl" style="color:#6e6e73;text-decoration:none">steinmetz.cl</a>
    </td>
  </tr>
</table>
"""


if __name__ == "__main__":
    SALIDA.mkdir(exist_ok=True)
    with sync_playwright() as p:
        nav = p.chromium.launch(headless=True)
        for nombre, an, al, hacer in PIEZAS:
            pg = nav.new_page(viewport={"width": an, "height": al}, device_scale_factor=1)
            pg.set_content(hacer())
            pg.wait_for_timeout(500)
            transparente = nombre.startswith("firma")
            pg.screenshot(path=str(SALIDA / nombre), omit_background=transparente,
                          clip={"x": 0, "y": 0, "width": an,
                                "height": 124 if transparente else al})
            pg.close()
            print("escrito: piezas/" + nombre)
        nav.close()
    (SALIDA / "firma-gmail.html").write_text(firma_html())
    print("escrito: piezas/firma-gmail.html")
