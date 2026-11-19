/* =========================================================
   PRODUCTOS Y PRECIOS
   Para cambiar un precio, cambia solo el número (sin puntos).
   Estos precios son de referencia: la página original no tenía
   precios. Ajústenlos con el curso.
   ========================================================= */
window.TIENDA = {
    negocio: 'El trío manatiense',
    municipio: 'Manatí',
    whatsapp: '573148807037',
    destacado: 'trio',
    productos: [
        { id: 'trio', nombre: 'Trío manatiense', precio: 7000, foto: 'img/bollo.jpg',
          fotos: ['img/bollo.jpg', 'img/suero.jpg', 'img/queso-costeno.jpg', 'img/bollo.jpg'],
          detalle: '1 bollo de angelito caliente, una porción de suero costeño y una tajada de queso costeño.' },
        { id: 'bollo', nombre: 'Bollo de angelito', precio: 2500, foto: 'img/bollo.jpg',
          detalle: 'Maíz blanco, queso costeño, panela, coco y anís, envuelto en hoja y cocido al vapor.' },
        { id: 'docena', nombre: 'Docena de bollos de angelito', precio: 27000, foto: 'img/bollo.jpg',
          detalle: 'Doce bollos para la familia o para la novena.' },
        { id: 'suero', nombre: 'Suero costeño (bolsa)', precio: 4000, foto: 'img/suero.jpg',
          detalle: 'Suero atollabuey, cremoso y un poco ácido, para bañar el bollo.' },
        { id: 'queso', nombre: 'Queso costeño (media libra)', precio: 6000, foto: 'img/queso-costeno.jpg',
          detalle: 'Queso fresco y salado, prensado en sereta de madera.' }
    ]
};
