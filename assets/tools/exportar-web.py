#!/usr/bin/env python3
"""Exporta los assets crudos a formatos web optimizados.

Entrada:  assets/img/*.png  y  assets/video/V1-polvo-a-tiza.mp4  (crudos, no
se comitean ni se sirven).
Salida:   assets/web/  (esto SI se comitea y se sirve).

- Imagenes -> AVIF (principal) + WebP (fallback) en 1920 y 960 de ancho.
- og:image -> JPG 1200x630 para redes.
- Video    -> WebM VP9 + MP4 H.264, 1280w, sin audio (el hero va mudo).
- Frames   -> secuencia WebP para el scrubbing del hero: 80 cuadros en 1280w
              (desktop) y 640w (movil).

Uso:
    python3 exportar-web.py            # exporta todo
    python3 exportar-web.py --solo img # o: video, frames
"""
import subprocess
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent      # assets/
IMG = RAIZ / "img"
VID = RAIZ / "video" / "V1-polvo-a-tiza.mp4"
WEB = RAIZ / "web"

# imagenes que usa el landing (las demas quedan en biblioteca)
USADAS = [
    "01-marca-tiza-acero",     # og
    "02-nave-estanques",       # divisor método
    "05-cenital-placa-x",      # cierre
    "06-testigos-sondaje",     # 02 problema
    "07-neumatico-minero",     # divisor trabajo→quién
    "08-marcas-en-roca",       # 01 historia (columna)
]

# correcciones de grade medidas en la revisión de diseño:
# 06 estaba al doble de luminosidad del resto (L* 36 vs 19-26) y
# 02 era la única foto que se leía azul (sat 23% vs 4-12%)
AJUSTES = {
    "06-testigos-sondaje": ["-modulate", "75,100"],
    "02-nave-estanques": ["-modulate", "100,45"],
}

ANCHOS = [1920, 960]
CAL_AVIF = "50"
CAL_WEBP = "74"

N_FRAMES = 80          # de los 240 del video, 1 de cada 3
# Los cuadros del hero salen de masters upscaled con Real-ESRGAN x4plus
# (720p -> 2560p, assets/video/master-frames-2560/). Si los masters no
# existen, cae al video 720p con lanczos+unsharp.
MASTERS = RAIZ / "video" / "master-frames-2560"
FRAME_ANCHOS = {"2560": 70, "720": 62}   # ancho -> calidad webp


def run(cmd):
    subprocess.run(cmd, check=True)


def tam(path: Path) -> str:
    kb = path.stat().st_size / 1024
    return f"{kb/1024:.1f}MB" if kb > 1024 else f"{kb:.0f}KB"


def exportar_imagenes():
    destino = WEB / "img"
    destino.mkdir(parents=True, exist_ok=True)
    for nombre in USADAS:
        src = IMG / f"{nombre}.png"
        if not src.exists():
            print(f"  falta {src.name}, se salta")
            continue
        ajuste = AJUSTES.get(nombre, [])
        for ancho in ANCHOS:
            for ext, cal in (("avif", CAL_AVIF), ("webp", CAL_WEBP)):
                out = destino / f"{nombre}-{ancho}.{ext}"
                run(["magick", str(src), *ajuste, "-resize", f"{ancho}x",
                     "-strip", "-quality", cal, str(out)])
            print(f"  {nombre}-{ancho}  avif {tam(destino / f'{nombre}-{ancho}.avif')}"
                  f" / webp {tam(destino / f'{nombre}-{ancho}.webp')}")
    # og:image
    og = destino / "og.jpg"
    run(["magick", str(IMG / "01-marca-tiza-acero.png"),
         "-resize", "1200x630^", "-gravity", "center", "-extent", "1200x630",
         "-strip", "-quality", "82", str(og)])
    print(f"  og.jpg  {tam(og)}")


def exportar_video():
    destino = WEB / "video"
    destino.mkdir(parents=True, exist_ok=True)
    webm = destino / "hero.webm"
    mp4 = destino / "hero.mp4"
    run(["ffmpeg", "-v", "error", "-y", "-i", str(VID), "-an",
         "-c:v", "libvpx-vp9", "-crf", "36", "-b:v", "0",
         "-row-mt", "1", "-pix_fmt", "yuv420p", str(webm)])
    run(["ffmpeg", "-v", "error", "-y", "-i", str(VID), "-an",
         "-c:v", "libx264", "-crf", "25", "-preset", "slow",
         "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(mp4)])
    print(f"  hero.webm {tam(webm)} / hero.mp4 {tam(mp4)}")


def exportar_frames():
    import tempfile
    desde_masters = MASTERS.exists() and len(list(MASTERS.glob("f*.png"))) == N_FRAMES
    print(f"  fuente: {'masters 2560 (Real-ESRGAN)' if desde_masters else 'video 720p (lanczos)'}")
    paso = 240 // N_FRAMES  # 3
    for ancho, cal in FRAME_ANCHOS.items():
        destino = WEB / "frames" / ancho
        destino.mkdir(parents=True, exist_ok=True)
        if desde_masters:
            for png in sorted(MASTERS.glob("f*.png")):
                run(["magick", str(png), "-resize", f"{ancho}x",
                     "-strip", "-quality", str(cal),
                     str(destino / f"{png.stem}.webp")])
        else:
            # este ffmpeg no trae libwebp: PNG temporal y convierte magick
            with tempfile.TemporaryDirectory() as tmp:
                nitidez = ",unsharp=5:5:0.55:5:5:0.0" if int(ancho) > 1280 else ""
                run(["ffmpeg", "-v", "error", "-y", "-i", str(VID),
                     "-vf", f"select='not(mod(n\\,{paso}))',"
                            f"scale={ancho}:-2:flags=lanczos{nitidez}",
                     "-vsync", "vfr", "-frames:v", str(N_FRAMES),
                     "-start_number", "0",       # el JS pide f000..f079
                     str(Path(tmp) / "f%03d.png")])
                for png in sorted(Path(tmp).glob("f*.png")):
                    run(["magick", str(png), "-strip", "-quality", str(cal),
                         str(destino / f"{png.stem}.webp")])
        archivos = sorted(destino.glob("f*.webp"))
        total = sum(f.stat().st_size for f in archivos)
        print(f"  frames {ancho}w: {len(archivos)} cuadros, {total/1024/1024:.2f}MB total")


if __name__ == "__main__":
    solo = sys.argv[sys.argv.index("--solo") + 1] if "--solo" in sys.argv else None
    if solo in (None, "img"):
        print("imagenes:"); exportar_imagenes()
    if solo in (None, "video"):
        print("video:"); exportar_video()
    if solo in (None, "frames"):
        print("frames:"); exportar_frames()
