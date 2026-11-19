/* =========================================================
   PEDIDO: carrito y envío del pedido por WhatsApp.
   Los productos y los precios se cambian en js/productos.js
   ========================================================= */
(function () {
    'use strict';

    var T = window.TIENDA;
    if (!T || !T.productos) return;

    var CLAVE = 'pedido-' + T.municipio;
    var MAXIMO = 50;
    var formato = new Intl.NumberFormat('es-CO');
    function pesos(v) { return '$' + formato.format(v); }
    function buscar(id) { return T.productos.find(function (p) { return p.id === id; }); }

    /* ---------- Estado del pedido ---------- */
    var carrito = {};
    try { carrito = JSON.parse(localStorage.getItem(CLAVE)) || {}; } catch (e) { carrito = {}; }
    Object.keys(carrito).forEach(function (id) { if (!buscar(id) || !(carrito[id] > 0)) delete carrito[id]; });
    function guardar() { try { localStorage.setItem(CLAVE, JSON.stringify(carrito)); } catch (e) { /* sin almacenamiento */ } }

    function unidades() { return Object.keys(carrito).reduce(function (s, id) { return s + carrito[id]; }, 0); }
    function total() { return Object.keys(carrito).reduce(function (s, id) { return s + buscar(id).precio * carrito[id]; }, 0); }

    /* ---------- Lista de productos con contador ---------- */
    var lista = document.getElementById('lista-productos');
    if (lista) {
        lista.innerHTML = T.productos.map(function (p) {
            var imagen = p.fotos
                ? '<div class="mini-bandeja" role="img" aria-label="' + p.nombre + '">' + p.fotos.slice(0, 4).map(function (f) { return '<img src="' + f + '" alt="" loading="lazy">'; }).join('') + '</div>'
                : '<img src="' + p.foto + '" alt="' + p.nombre + '" loading="lazy" width="120" height="120">';
            return '<article class="producto" data-id="' + p.id + '">' + imagen +
                '<div><h3>' + p.nombre + '</h3><p>' + p.detalle + '</p>' +
                '<div class="producto__pie"><span class="producto__precio">' + pesos(p.precio) + '</span>' +
                '<div class="contador" role="group" aria-label="Cantidad de ' + p.nombre + '">' +
                '<button type="button" data-cambio="-1" aria-label="Quitar uno">&minus;</button>' +
                '<span class="contador__valor" aria-live="polite"><span>0</span></span>' +
                '<button type="button" data-cambio="1" aria-label="Agregar uno">+</button>' +
                '</div></div></div></article>';
        }).join('');

        lista.addEventListener('click', function (e) {
            var b = e.target.closest('button[data-cambio]');
            if (!b) return;
            var id = b.closest('.producto').dataset.id;
            cambiar(id, parseInt(b.dataset.cambio, 10));
        });
    }

    function pintarContador(id, direccion) {
        var tarjeta = lista && lista.querySelector('.producto[data-id="' + id + '"]');
        if (!tarjeta) return;
        var n = carrito[id] || 0;
        var caja = tarjeta.querySelector('.contador__valor');
        var viejo = caja.querySelector('span:last-child');
        if (viejo.textContent !== String(n)) {
            var nuevo = document.createElement('span');
            nuevo.textContent = n;
            nuevo.className = direccion > 0 ? 'entra-abajo' : 'entra-arriba';
            caja.appendChild(nuevo);
            void nuevo.offsetWidth;
            nuevo.className = '';
            viejo.className = direccion > 0 ? 'sale-arriba' : 'sale-abajo';
            setTimeout(function () { if (viejo.parentNode) viejo.parentNode.removeChild(viejo); }, 300);
        }
        tarjeta.querySelector('[data-cambio="-1"]').disabled = n === 0;
        tarjeta.classList.toggle('elegido', n > 0);
    }

    function cambiar(id, delta) {
        var actual = carrito[id] || 0;
        var nuevo = Math.min(MAXIMO, Math.max(0, actual + delta));
        if (nuevo === actual) {
            var c = lista && lista.querySelector('.producto[data-id="' + id + '"] .contador');
            if (c) { c.classList.remove('tiembla'); void c.offsetWidth; c.classList.add('tiembla'); }
            return;
        }
        if (nuevo === 0) delete carrito[id]; else carrito[id] = nuevo;
        guardar();
        pintarContador(id, delta);
        pintarResumen();
    }

    /* Botones "Agregar" repartidos por el relato */
    document.addEventListener('click', function (e) {
        var b = e.target.closest('[data-agregar]');
        if (b) {
            e.preventDefault();
            var p = buscar(b.dataset.agregar);
            cambiar(p.id, 1);
            avisar(p.nombre + ' agregado a tu pedido');
            return;
        }
        var pedir = e.target.closest('[data-pedir]');
        if (pedir) {
            var id = pedir.dataset.pedir || T.destacado;
            if (id && !carrito[id]) cambiar(id, 1);
        }
    });

    /* ---------- Resumen ---------- */
    var lineas = document.getElementById('resumen-lineas');
    var totalEl = document.getElementById('resumen-total');
    var cuentas = Array.prototype.slice.call(document.querySelectorAll('[data-cuenta]'));
    var barra = document.querySelector('.barra-pedido');
    var barraTexto = barra && barra.querySelector('span');
    var seccionPedido = document.getElementById('pedido');

    function pintarResumen() {
        var ids = Object.keys(carrito);
        if (lineas) {
            lineas.innerHTML = ids.length === 0
                ? '<li class="vacio">Todavía no has elegido productos. Usa el botón + de cada uno.</li>'
                : ids.map(function (id) {
                    var p = buscar(id);
                    return '<li><span>' + carrito[id] + ' &times; ' + p.nombre + '</span><span>' + pesos(p.precio * carrito[id]) + '</span></li>';
                }).join('');
        }
        if (totalEl) totalEl.textContent = pesos(total());
        var n = unidades();
        cuentas.forEach(function (c) { c.textContent = n; c.dataset.vacio = n === 0 ? 'true' : 'false'; });
        if (barraTexto) barraTexto.textContent = n + (n === 1 ? ' producto' : ' productos') + ', ' + pesos(total());
        actualizarBarra();
    }

    var pedidoVisible = false;
    function actualizarBarra() {
        if (!barra) return;
        var mostrar = unidades() > 0 && !pedidoVisible && window.scrollY > window.innerHeight * .6;
        barra.classList.toggle('visible', mostrar);
    }
    /* La barra se esconde solo cuando el resumen (total y formulario) ya está a la vista */
    var resumen = document.querySelector('.resumen') || seccionPedido;
    if (resumen && 'IntersectionObserver' in window) {
        new IntersectionObserver(function (en) { pedidoVisible = en[0].isIntersecting; actualizarBarra(); }, { threshold: .2 }).observe(resumen);
    }
    if (barra && resumen) {
        barra.querySelector('a').addEventListener('click', function (e) {
            e.preventDefault();
            resumen.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }
    window.addEventListener('scroll', actualizarBarra, { passive: true });

    /* ---------- Aviso corto ---------- */
    var aviso = document.createElement('div');
    aviso.className = 'aviso-flotante'; aviso.setAttribute('role', 'status');
    document.body.appendChild(aviso);
    var temporizador;
    function avisar(texto) {
        aviso.textContent = texto; aviso.classList.add('visible');
        clearTimeout(temporizador);
        temporizador = setTimeout(function () { aviso.classList.remove('visible'); }, 2000);
    }

    /* ---------- Formulario y WhatsApp ---------- */
    var form = document.getElementById('form-pedido');
    var avisoEnvio = document.getElementById('aviso-envio');

    function marcarError(campo, mensaje) {
        var caja = campo.closest('.campo');
        var err = caja.querySelector('.error');
        if (!err) { err = document.createElement('span'); err.className = 'error'; caja.appendChild(err); }
        err.textContent = mensaje || '';
        err.hidden = !mensaje;
        campo.setAttribute('aria-invalid', mensaje ? 'true' : 'false');
    }

    function armarMensaje(datos) {
        var ids = Object.keys(carrito);
        var partes = [
            'Hola, quiero hacer un pedido.',
            '*' + T.negocio + ' - ' + T.municipio + ', Atlántico*',
            '',
            '*Nombre:* ' + datos.nombre,
            '*Teléfono:* ' + datos.telefono
        ];
        if (datos.direccion) partes.push('*Dirección:* ' + datos.direccion);
        partes.push('', '*Pedido:*');
        ids.forEach(function (id) {
            var p = buscar(id);
            partes.push('- ' + carrito[id] + ' x ' + p.nombre + ' (' + pesos(p.precio) + ' c/u) = ' + pesos(p.precio * carrito[id]));
        });
        partes.push('', '*Valor total: ' + pesos(total()) + '*');
        if (datos.nota) partes.push('', '*Nota:* ' + datos.nota);
        return partes.join('\n');
    }

    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var nombre = form.elements.nombre, telefono = form.elements.telefono;
            var ok = true;
            if (unidades() === 0) {
                avisar('Elige al menos un producto antes de enviar');
                if (lista) lista.scrollIntoView({ behavior: 'smooth', block: 'start' });
                return;
            }
            if (nombre.value.trim().length < 2) { marcarError(nombre, 'Escribe tu nombre.'); ok = false; } else marcarError(nombre, '');
            var digitos = telefono.value.replace(/\D/g, '');
            if (digitos.length < 7) { marcarError(telefono, 'Escribe un teléfono de al menos 7 números.'); ok = false; } else marcarError(telefono, '');
            if (!ok) { form.querySelector('[aria-invalid="true"]').focus(); return; }

            var mensaje = armarMensaje({
                nombre: nombre.value.trim(),
                telefono: telefono.value.trim(),
                direccion: form.elements.direccion ? form.elements.direccion.value.trim() : '',
                nota: form.elements.nota ? form.elements.nota.value.trim() : ''
            });
            var url = 'https://wa.me/' + T.whatsapp + '?text=' + encodeURIComponent(mensaje);
            var ventana = window.open(url, '_blank');
            if (avisoEnvio) {
                avisoEnvio.hidden = false;
                avisoEnvio.querySelector('a').href = url;
            }
            if (!ventana) window.location.href = url;
        });
    }

    /* Pintar todo al cargar */
    T.productos.forEach(function (p) { pintarContador(p.id, 1); });
    pintarResumen();

    /* Para revisar desde la consola del navegador */
    window.PEDIDO = { carrito: carrito, total: total, mensaje: function () { return armarMensaje({ nombre: 'Prueba', telefono: '3000000000' }); } };
})();
