/* =========================================================
   RELATO: efectos al desplazarse por la página.
   - La portada entra una sola vez al cargar.
   - Los capítulos dejan la foto fija mientras el texto pasa encima.
   - La mesa acerca las fotos de los platos (efecto "zoom").
   - El hilo de la izquierda marca en qué capítulo vas.
   ========================================================= */
(function () {
    'use strict';

    var reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    window.addEventListener('load', function () { document.body.classList.add('listo'); });
    setTimeout(function () { document.body.classList.add('listo'); }, 1200);

    /* Cabecera con fondo al salir de la portada */
    var cabecera = document.querySelector('.cabecera');
    var portada = document.querySelector('.portada');

    /* Escenas que reaccionan al scroll: guardan su avance (0 a 1) en la variable --p */
    var escenas = Array.prototype.slice.call(document.querySelectorAll('[data-escena]'));

    function avance(el) {
        var r = el.getBoundingClientRect();
        var recorrido = r.height - window.innerHeight;
        if (recorrido <= 0) return r.top < 0 ? 1 : 0;
        return Math.min(1, Math.max(0, -r.top / recorrido));
    }

    var pendiente = false;
    function actualizar() {
        pendiente = false;
        if (cabecera && portada) {
            cabecera.classList.toggle('con-fondo', portada.getBoundingClientRect().bottom < 80);
        }
        if (reducido) return;
        escenas.forEach(function (el) {
            var r = el.getBoundingClientRect();
            if (r.bottom < -200 || r.top > window.innerHeight + 200) return;
            el.style.setProperty('--p', avance(el).toFixed(4));
        });
    }
    function alDesplazar() {
        if (!pendiente) { pendiente = true; window.requestAnimationFrame(actualizar); }
    }
    window.addEventListener('scroll', alDesplazar, { passive: true });
    window.addEventListener('resize', alDesplazar);
    actualizar();

    /* Hilo de capítulos */
    var hilo = document.querySelector('.hilo');
    if (hilo && 'IntersectionObserver' in window) {
        var enlaces = Array.prototype.slice.call(hilo.querySelectorAll('a'));
        var secciones = enlaces.map(function (a) { return document.querySelector(a.getAttribute('href')); });
        var observador = new IntersectionObserver(function (entradas) {
            entradas.forEach(function (e) {
                if (!e.isIntersecting) return;
                var i = secciones.indexOf(e.target);
                enlaces.forEach(function (a, j) { a.classList.toggle('activo', i === j); });
                hilo.classList.toggle('sobre-oscuro', e.target.hasAttribute('data-oscuro'));
            });
        }, { rootMargin: '-45% 0px -50% 0px' });
        secciones.forEach(function (s) { if (s) observador.observe(s); });
    }
})();
