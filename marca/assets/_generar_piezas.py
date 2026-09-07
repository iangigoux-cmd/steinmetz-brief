#!/usr/bin/env python3
"""Arma las piezas listas para subir: perfiles, portadas y firmas de correo.

Cada red pide un tamaño distinto y recorta distinto. Las de perfil van a
sangre completa —sin esquina redondeada— porque LinkedIn e Instagram recortan
en círculo por su cuenta; si el archivo ya trajera radio, quedaría un doble
redondeo sucio.

Se compone en el navegador con los SVG ya trazados y se captura al pixel
exacto. Correr _generar_logo.py antes, para que existan los SVG.

Las firmas de correo siguen tres reglas, y las tres nacen de lo mismo: un
cliente de correo puede tener el fondo oscuro, puede bloquear las imágenes y
nunca carga una webfont.

  1. El fondo blanco va horneado en el PNG del wordmark, no transparente. Con
     transparencia, la tinta negra desaparece sobre el fondo oscuro de Gmail,
     Outlook o Apple Mail. Feo es mejor que invisible.
  2. Cada <img> lleva alt y width/height como atributos HTML, no sólo en CSS:
     si la imagen no carga, el bloque conserva su tamaño y sigue diciendo el
     nombre.
  3. Toda la información real viaja en texto, en Arial/Helvetica. La marca la
     carga la imagen; el texto no intenta imitar Fraunces.

Y una cuarta, que es la que las salva en modo oscuro: el bloque declara su
propio fondo blanco (bgcolor + background-color en cada celda). Un cliente en
modo oscuro invierte lo que no tiene fondo propio; lo que sí lo tiene, lo
respeta. Así la plancha blanca del PNG deja de ser un parche flotante y pasa a
ser el borde de la firma.

Uso:  python3 _generar_piezas.py
"""
from pathlib import Path
import base64

from playwright.sync_api import sync_playwright

AQUI = Path(__file__).resolve().parent
SALIDA = AQUI / "piezas"
TINTA = "#111112"
PAPEL = "#ffffff"
MEDIO = "#6e6e73"
SUAVE = "#75757a"
LINEA = "#dedede"          # --linea, rgba(17,17,18,.14), resuelto sobre blanco
DESCRIPTOR = "INGENIERÍA EN INTELIGENCIA ARTIFICIAL"

FUENTES = ('<link rel="stylesheet" href="https://fonts.googleapis.com/css2?'
           'family=IBM+Plex+Mono:wght@400;500&display=swap">')

# piezas que se capturan sin fondo. El resto sale opaco a propósito.
TRANSPARENTES = {
    "organizacion-320x132-transparente.png",
    "firma-sz-120.png",     # sólo las esquinas del radio; la plancha es opaca
}


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


def organizacion(an, al, fondo, wm, ancho_rel=0.72, descriptor=False,
                 color_desc="#6e6e73"):
    """Logo de organización a medida exacta (Google Workspace pide 320x132).

    Se despliega al pixel, sin escalar, así que el archivo va a ese tamaño y
    el contenido se queda dentro del 75 % del lienzo: varias plataformas
    recortan unos pixeles de borde.
    """
    desc = (f'<div style="font-size:8px;letter-spacing:.18em;color:{color_desc};'
            f'margin-top:9px;text-align:center">{DESCRIPTOR}</div>'
            if descriptor else "")
    return marco(
        f'<body style="align-items:center;justify-content:center">'
        f'<div><img src="{dato(wm)}" style="width:{an*ancho_rel:.0f}px;display:block">{desc}</div>',
        fondo, an, al)


def firma_wordmark(an, al, ancho_wm):
    """El wordmark sobre plancha blanca opaca, centrado, para la firma.

    Sale al doble del tamaño en que se muestra (600 px para mostrarlo a 300),
    para que se vea nítido en pantalla retina.
    """
    return marco(f'<body style="align-items:center;justify-content:center">'
                 f'<img src="{dato("steinmetz-wordmark.svg")}" style="width:{ancho_wm}px">',
                 PAPEL, an, al)


def firma_monograma(lado):
    """El monograma SZ a sangre, para la firma compacta.

    Trae su propia plancha #111112 con las letras en blanco, así que se lee
    igual sobre fondo claro y sobre fondo oscuro. Lo único transparente son
    las cuatro esquinas del radio.
    """
    return marco(f'<body><img src="{dato("steinmetz-monograma.svg")}" '
                 f'style="width:{lado}px;height:{lado}px">', "rgba(0,0,0,0)", lado, lado)


PIEZAS = [
    # logo de organización: Google Workspace, exacto a 320x132
    ("organizacion-320x132.png", 320, 132,
     lambda: organizacion(320, 132, PAPEL, "steinmetz-wordmark.svg")),
    ("organizacion-320x132-descriptor.png", 320, 132,
     lambda: organizacion(320, 132, PAPEL, "steinmetz-wordmark.svg", .68, True)),
    ("organizacion-320x132-oscuro.png", 320, 132,
     lambda: organizacion(320, 132, TINTA, "steinmetz-wordmark-blanco.svg")),
    ("organizacion-320x132-transparente.png", 320, 132,
     lambda: organizacion(320, 132, "rgba(0,0,0,0)", "steinmetz-wordmark.svg")),
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
    # firmas de correo: salen al doble y se muestran a la mitad
    ("firma-logo-600.png", 600, 140, lambda: firma_wordmark(600, 140, 560)),
    ("firma-sz-120.png",   120, 120, lambda: firma_monograma(120)),
]


# ── las firmas de correo ────────────────────────────────────────────────────
# Todo el estilo va en línea: Gmail descarta el <style>. La maqueta es de
# tablas: Gmail y Outlook manejan mal flex y grid. Nada de background-image,
# nada de position.

BASE = "https://steinmetz.cl/marca/assets/piezas/"
TIPO = "Arial,Helvetica,sans-serif"
AVISO = ("Configuraci&oacute;n → Firma. Abrir este archivo en el navegador, "
         "seleccionar todo (⌘A), copiar (⌘C) y pegar en la caja de la firma. "
         "No pegar el código: pegar lo que el navegador muestra.")


def cabecera(titulo, cuando):
    return (f"<!-- Firma de correo de Steinmetz SpA — {titulo}.\n"
            f"     Cuándo: {cuando}\n"
            f"     Cómo: {AVISO}\n"
            f"     Se regenera con assets/_generar_piezas.py. No editar a mano. -->\n"
            f'<meta charset="utf-8">\n')


def identidad(tamano=15, con_descriptor=True):
    """Nombre, sociedad y descriptor. Todo texto: ninguna imagen lo sostiene.

    El descriptor se apaga cuando el encabezado del bloque ya lo trae; decirlo
    dos veces en la misma firma no agrega nada.
    """
    desc = (f'<br>\n      <span style="font-family:{TIPO};font-size:10px;'
            f'letter-spacing:1.1px;color:{SUAVE}">'
            f'INGENIER&Iacute;A EN INTELIGENCIA ARTIFICIAL</span>'
            if con_descriptor else "")
    return (f'<span style="font-family:{TIPO};font-size:{tamano}px;font-weight:bold;'
            f'color:{TINTA}">Ian Berndt</span><br>\n'
            f'      <span style="font-family:{TIPO};font-size:13px;color:{MEDIO}">'
            f'Steinmetz SpA</span>{desc}')


def contacto():
    """Correo, teléfono y sitio.

    El color va dos veces en cada enlace —en el <a> y en un <span> adentro—
    porque Gmail pinta de azul lo que no trae color propio, y iOS vuelve a
    pintar el teléfono cuando lo autodetecta.
    """
    return (f'<a href="mailto:ian@steinmetz.cl" style="color:{TINTA};text-decoration:none">'
            f'<span style="color:{TINTA};text-decoration:none">ian@steinmetz.cl</span></a>'
            f'&nbsp;&middot;&nbsp;'
            f'<a href="tel:+56993215043" style="color:{TINTA};text-decoration:none">'
            f'<span style="color:{TINTA};text-decoration:none">+56 9 9321 5043</span></a><br>\n'
            f'      <a href="https://steinmetz.cl" style="color:{MEDIO};text-decoration:none">'
            f'<span style="color:{MEDIO};text-decoration:none">steinmetz.cl</span></a>')


def legal():
    return (f'<span style="font-family:{TIPO};font-size:11px;color:{SUAVE}">'
            f'RUT 78.484.226-6&nbsp;&middot;&nbsp;Santiago de Chile</span>')


def firma_principal():
    """Wordmark arriba, filete, datos abajo. La que se usa por defecto."""
    return cabecera(
        "versión principal",
        "por defecto, en cualquier correo") + f"""<table cellpadding="0" cellspacing="0" border="0" role="presentation" bgcolor="{PAPEL}"
       style="border-collapse:collapse;background-color:{PAPEL};font-family:{TIPO};color:{TINTA}">
  <tr>
    <td bgcolor="{PAPEL}" style="background-color:{PAPEL};padding:16px 18px 12px 18px">
      <img src="{BASE}firma-logo-600.png" alt="Steinmetz" width="300" height="70" border="0"
           style="display:block;width:300px;height:70px;border:0;outline:none;
                  font-family:{TIPO};font-size:19px;font-weight:bold;letter-spacing:1px;color:{TINTA}">
    </td>
  </tr>
  <tr>
    <td bgcolor="{PAPEL}" style="background-color:{PAPEL};padding:12px 18px 0 18px;
        border-top:1px solid {LINEA};font-family:{TIPO};font-size:13px;line-height:20px;color:{TINTA}">
      {identidad()}
    </td>
  </tr>
  <tr>
    <td bgcolor="{PAPEL}" style="background-color:{PAPEL};padding:10px 18px 0 18px;
        font-family:{TIPO};font-size:13px;line-height:20px;color:{TINTA}">
      {contacto()}
    </td>
  </tr>
  <tr>
    <td bgcolor="{PAPEL}" style="background-color:{PAPEL};padding:10px 18px 16px 18px;
        font-family:{TIPO};font-size:11px;line-height:16px;color:{SUAVE}">
      {legal()}
    </td>
  </tr>
</table>
"""


def firma_compacta():
    """Monograma al lado del texto. Para hilos largos y respuestas."""
    return cabecera(
        "variante compacta",
        "hilos largos, respuestas, cuando la firma completa pesa demasiado"
    ) + f"""<table cellpadding="0" cellspacing="0" border="0" role="presentation" bgcolor="{PAPEL}"
       style="border-collapse:collapse;background-color:{PAPEL};font-family:{TIPO};color:{TINTA}">
  <tr>
    <td bgcolor="{PAPEL}" valign="top" width="60"
        style="background-color:{PAPEL};padding:14px 0 14px 16px;width:60px">
      <img src="{BASE}firma-sz-120.png" alt="Steinmetz" width="60" height="60" border="0"
           style="display:block;width:60px;height:60px;border:0;outline:none;
                  font-family:{TIPO};font-size:11px;font-weight:bold;color:{TINTA}">
    </td>
    <td bgcolor="{PAPEL}" valign="top"
        style="background-color:{PAPEL};padding:14px 18px 14px 14px;
               font-family:{TIPO};font-size:13px;line-height:19px;color:{TINTA}">
      {identidad(14)}
      <div style="padding-top:6px;font-family:{TIPO};font-size:13px;line-height:19px;color:{TINTA}">{contacto()}</div>
    </td>
  </tr>
</table>
"""


def firma_sin_imagen():
    """Sólo texto. Para cuando la política del destinatario bloquea imágenes.

    El nombre va en Arial versales con interletra: es un sustituto declarado,
    no un intento de imitar Fraunces. La marca de verdad la carga la imagen.
    """
    return cabecera(
        "variante sin imágenes",
        "clientes o políticas que bloquean imágenes; listas de correo; texto plano"
    ) + f"""<table cellpadding="0" cellspacing="0" border="0" role="presentation" bgcolor="{PAPEL}"
       style="border-collapse:collapse;background-color:{PAPEL};font-family:{TIPO};color:{TINTA}">
  <tr>
    <td bgcolor="{PAPEL}" style="background-color:{PAPEL};padding:14px 18px 12px 18px;
        font-family:{TIPO};color:{TINTA}">
      <span style="font-family:{TIPO};font-size:20px;font-weight:bold;letter-spacing:2px;
        color:{TINTA}">STEINMETZ</span><br>
      <span style="font-family:{TIPO};font-size:10px;letter-spacing:1.1px;color:{SUAVE}">
        INGENIER&Iacute;A EN INTELIGENCIA ARTIFICIAL</span>
    </td>
  </tr>
  <tr>
    <td bgcolor="{PAPEL}" style="background-color:{PAPEL};padding:12px 18px 0 18px;
        border-top:1px solid {LINEA};font-family:{TIPO};font-size:13px;line-height:20px;color:{TINTA}">
      {identidad(con_descriptor=False)}
    </td>
  </tr>
  <tr>
    <td bgcolor="{PAPEL}" style="background-color:{PAPEL};padding:10px 18px 0 18px;
        font-family:{TIPO};font-size:13px;line-height:20px;color:{TINTA}">
      {contacto()}
    </td>
  </tr>
  <tr>
    <td bgcolor="{PAPEL}" style="background-color:{PAPEL};padding:10px 18px 16px 18px;
        font-family:{TIPO};font-size:11px;line-height:16px;color:{SUAVE}">
      {legal()}
    </td>
  </tr>
</table>
"""


FIRMAS = [
    ("firma-gmail.html", firma_principal),
    ("firma-gmail-compacta.html", firma_compacta),
    ("firma-gmail-sin-imagen.html", firma_sin_imagen),
]


if __name__ == "__main__":
    SALIDA.mkdir(exist_ok=True)
    with sync_playwright() as p:
        nav = p.chromium.launch(headless=True)
        for nombre, an, al, hacer in PIEZAS:
            pg = nav.new_page(viewport={"width": an, "height": al}, device_scale_factor=1)
            pg.set_content(hacer())
            pg.wait_for_timeout(500)
            pg.screenshot(path=str(SALIDA / nombre),
                          omit_background=nombre in TRANSPARENTES,
                          clip={"x": 0, "y": 0, "width": an, "height": al})
            pg.close()
            print("escrito: piezas/" + nombre)
        nav.close()
    for nombre, hacer in FIRMAS:
        (SALIDA / nombre).write_text(hacer(), encoding="utf-8")
        print("escrito: piezas/" + nombre)
