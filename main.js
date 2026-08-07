/* STEINMETZ — main.js
   Dos responsabilidades, nada más:
   1. El hero: 80 cuadros WebP dibujados en canvas, atados al scroll.
   2. Los fades de entrada del resto de la página (solo opacidad).   */

(function () {
  "use strict";

  var reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── fades de entrada ──────────────────────────────────────── */

  var fades = document.querySelectorAll(".fade");
  if (reducido || !("IntersectionObserver" in window)) {
    fades.forEach(function (el) { el.classList.add("visible"); });
  } else {
    var io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });
    fades.forEach(function (el) { io.observe(el); });
  }

  /* ── hero ──────────────────────────────────────────────────── */

  if (reducido) return;                       // el CSS ya dejó el hero estático

  var hero = document.getElementById("hero");
  var canvas = hero.querySelector(".hero-lienzo");
  var lineas = hero.querySelectorAll(".hline");
  var ctx = canvas.getContext("2d");

  var N = 80;
  var carpeta = window.innerWidth < 720 ? "640" : "1280";
  var ruta = function (i) {
    return "assets/web/frames/" + carpeta + "/f" + String(i).padStart(3, "0") + ".webp";
  };

  var cuadros = new Array(N);
  var cargados = 0;
  var fallos = 0;
  var cuadroActual = -1;
  var estatico = false;

  function medir() {
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(canvas.clientWidth * dpr);
    canvas.height = Math.round(canvas.clientHeight * dpr);
    cuadroActual = -1;                        // fuerza redibujo
  }

  function dibujar(i) {
    var img = cuadros[i];
    if (!img || !img.complete || !img.naturalWidth) return;
    var cw = canvas.width, ch = canvas.height;
    var s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
    var w = img.naturalWidth * s, h = img.naturalHeight * s;
    ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
    cuadroActual = i;
  }

  function progreso() {
    var alto = hero.offsetHeight - window.innerHeight;
    if (alto <= 0) return 1;
    var y = -hero.getBoundingClientRect().top;
    return Math.min(1, Math.max(0, y / alto));
  }

  function pintar() {
    if (estatico) return;
    var p = progreso();

    var i = Math.min(N - 1, Math.round(p * (N - 1)));
    // si el cuadro exacto no llegó todavía, usa el último cargado anterior
    while (i > 0 && (!cuadros[i] || !cuadros[i].complete)) i--;
    if (i !== cuadroActual) dibujar(i);

    lineas.forEach(function (el) {
      el.classList.toggle("on", p >= parseFloat(el.dataset.at));
    });
  }

  function modoEstatico() {
    // sin cuadros no hay scrub: poster visible, todo el texto en pantalla
    estatico = true;
    canvas.style.display = "none";
    hero.style.height = "100svh";
    lineas.forEach(function (el) { el.classList.add("on"); });
  }

  function cargar() {
    for (var i = 0; i < N; i++) {
      (function (i) {
        var img = new Image();
        img.decoding = "async";
        img.onload = function () {
          cargados++;
          if (i === 0) { medir(); pintar(); }
        };
        img.onerror = function () {
          fallos++;
          if (fallos > 6) modoEstatico();
        };
        img.src = ruta(i);
        cuadros[i] = img;
      })(i);
    }
  }

  var pendiente = false;
  function alScroll() {
    if (pendiente) return;
    pendiente = true;
    requestAnimationFrame(function () {
      pendiente = false;
      pintar();
    });
  }

  window.addEventListener("scroll", alScroll, { passive: true });
  window.addEventListener("resize", function () { medir(); pintar(); });

  medir();
  cargar();
  pintar();
})();
