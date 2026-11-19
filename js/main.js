document.addEventListener("DOMContentLoaded", function () {
    if (typeof tizen !== "undefined" && tizen.tvinputdevice) {
        try {
            tizen.tvinputdevice.registerKey("Return");
            for (let i = 0; i <= 9; i++) {
                tizen.tvinputdevice.registerKey(String(i));
            }
        } catch (e) {}
    }

    const STORAGE_CONFIG_KEY = "juristv_config_v1";

    const configPorDefecto = {
        tema: "tema-oscuro",
        tamanoPx: "32px",
        tamanoEtiqueta: "Normal",
        modo: "modo-documento",
        modoEtiqueta: "Documento"
    };

    function cargarConfig() {
        try {
            const raw = localStorage.getItem(STORAGE_CONFIG_KEY);
            return raw ? Object.assign({}, configPorDefecto, JSON.parse(raw)) : Object.assign({}, configPorDefecto);
        } catch (e) {
            return Object.assign({}, configPorDefecto);
        }
    }

    function guardarConfig() {
        try {
            localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(config));
        } catch (e) {}
    }

    let config = cargarConfig();

    const vistaInicio = document.getElementById("vista-inicio");
    const vistaLector = document.getElementById("vista-lector");
    const gridNormas = document.getElementById("grid-normas");
    const btnConfigInicio = document.getElementById("btn-config-inicio");
    const btnVolverInicio = document.getElementById("btn-volver-inicio");
    const btnVolverInicioTop = document.getElementById("btn-volver-inicio-top");
    const btnConfigLector = document.getElementById("btn-config-lector");
    const btnConfigLectorTop = document.getElementById("btn-config-lector-top");
    const btnTopAnterior = document.getElementById("btn-top-anterior");
    const btnTopSiguiente = document.getElementById("btn-top-siguiente");
    const btnArtAnterior = document.getElementById("btn-art-anterior");
    const btnArtSiguiente = document.getElementById("btn-art-siguiente");
    const indicadorDiapositiva = document.getElementById("indicador-diapositiva");
    const topbarIndiceArt = document.getElementById("topbar-indice-art");
    const topbarModoBadge = document.getElementById("topbar-modo-badge");
    const topbarNormaNombre = document.getElementById("topbar-norma-nombre");

    const listaEl = document.getElementById("lista-articulos");
    const lectorEl = document.getElementById("lector");
    const rutaEl = document.getElementById("articulo-ruta");
    const tituloEl = document.getElementById("articulo-titulo");
    const contenidoEl = document.getElementById("articulo-contenido");
    const fontLabelEl = document.getElementById("font-label");
    const modoLabelEl = document.getElementById("modo-label");
    const numBufferEl = document.getElementById("num-buffer");
    const numBufferTopEl = document.getElementById("num-buffer-top");
    const normaTituloEl = document.getElementById("norma-titulo");

    const modalConfig = document.getElementById("modal-config");
    const btnCerrarConfig = document.getElementById("btn-cerrar-config");
    const botonesTema = Array.from(document.querySelectorAll("#grupo-tema .opcion-btn"));
    const botonesTamano = Array.from(document.querySelectorAll("#grupo-tamano .opcion-btn"));
    const botonesModo = Array.from(document.querySelectorAll("#grupo-modo .opcion-btn"));

    const iconosSVG = {
        balanza: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M32 10v42"/><path d="M20 52h24"/><path d="M16 18h32"/><path d="M16 18l-8 14h16l-8-14z"/><path d="M48 18l-8 14h16l-8-14z"/></svg>`,
        constitucion: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 12h28a6 6 0 0 1 6 6v34H20a6 6 0 0 0-6 6V12z"/><path d="M22 22h18"/><path d="M22 30h14"/></svg>`,
        penal: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M38 14l12 12-10 10-12-12 10-10z"/><path d="M28 24L14 38l8 8 14-14"/><path d="M12 52h24"/></svg>`
    };

    const respaldoCGP = [
        {
            numero: "1",
            titulo: "OBJETO",
            seccion: "Ley 1564 de 2012 • Código General del Proceso",
            html: "<p>Este código regula la actividad procesal en los asuntos civiles, comerciales, de familia y agrarios. Se aplica, además, a todos los asuntos de cualquier jurisdicción o especialidad y a las actuaciones de particulares y autoridades administrativas, cuando ejerzan funciones jurisdiccionales, en cuanto no estén regulados expresamente en otras leyes.</p>"
        },
        {
            numero: "2",
            titulo: "ACCESO A LA JUSTICIA",
            seccion: "Ley 1564 de 2012 • Código General del Proceso",
            html: "<p>Toda persona o grupo de personas tiene derecho a la tutela jurisdiccional efectiva para el ejercicio de sus derechos y la defensa de sus intereses, con sujeción a un debido proceso de duración razonable. Los términos procesales se observarán con diligencia y su incumplimiento injustificado será sancionado.</p>"
        }
    ];

    const obtenerDatosCGP = () => {
        if (Array.isArray(window.CGP_DATA) && window.CGP_DATA.length > 0) {
            return window.CGP_DATA;
        }
        return respaldoCGP;
    };

    const catalogoNormas = [
        {
            id: "cgp",
            icono: iconosSVG.balanza,
            subtitulo: "Ley 1564 de 2012 • Colombia",
            titulo: "Código General del Proceso",
            descripcion: "Regula la actividad procesal en asuntos civiles, comerciales, de familia y agrarios.",
            disponible: true,
            obtenerArticulos: obtenerDatosCGP
        },
        {
            id: "constitucion",
            icono: iconosSVG.constitucion,
            subtitulo: "Carta Política • 1991",
            titulo: "Constitución Política de Colombia",
            descripcion: "Norma fundamental del Estado colombiano, derechos y ramas del poder.",
            disponible: Array.isArray(window.CONSTITUCION_DATA) && window.CONSTITUCION_DATA.length > 0,
            obtenerArticulos: () => window.CONSTITUCION_DATA || []
        },
        {
            id: "penal",
            icono: iconosSVG.penal,
            subtitulo: "Ley 599 de 2000 • Colombia",
            titulo: "Código Penal Colombiano",
            descripcion: "Define delitos, penas y lineamientos sustanciales en materia penal.",
            disponible: Array.isArray(window.PENAL_DATA) && window.PENAL_DATA.length > 0,
            obtenerArticulos: () => window.PENAL_DATA || []
        }
    ];

    const todosTemas = ["tema-oscuro", "tema-sepia", "tema-claro", "tema-azul", "tema-contraste"];
    const todosModos = ["modo-documento", "modo-diapositiva", "modo-panoramico"];
    const tamanosCiclo = [
        { px: "28px", etiqueta: "Pequeño" },
        { px: "32px", etiqueta: "Normal" },
        { px: "38px", etiqueta: "Grande" },
        { px: "44px", etiqueta: "Extra Grande" }
    ];

    let pantallaActual = "inicio";
    let pantallaAnteriorConfig = "inicio";
    let focoInicioIdx = 0;
    let normaSeleccionadaIdx = 0;
    let articulosActivos = [];
    let indiceActual = 0;
    let diapositivaIdx = 0;
    let totalDiapositivasArt = 1;
    let modoFoco = "lista";
    let bufferNumero = "";
    let timerNumero = null;
    let controlesConfigFocus = [];
    let configFocusIdx = 0;

    function esModoSinMenu() {
        return config.modo === "modo-diapositiva" || config.modo === "modo-panoramico";
    }

    function construirEscenasHTML(htmlRaw, textoPlano) {
        const temp = document.createElement("div");
        temp.innerHTML = htmlRaw || (textoPlano ? `<p>${textoPlano}</p>` : "");
        const nodos = Array.from(temp.children).filter(el => el.textContent.trim().length > 0);

        if (nodos.length === 0) {
            const fallback = (textoPlano || htmlRaw || "").trim();
            return [`<div class="diapositiva-escena activa"><p>${fallback}</p></div>`];
        }

        return nodos.map((el, idx) => {
            el.classList.add("diapositiva-escena");
            if (idx === 0) el.classList.add("activa");
            return el.outerHTML;
        });
    }

    function renderizarEscenaDiapositiva() {
        const escenas = Array.from(contenidoEl.querySelectorAll(".diapositiva-escena"));
        if (escenas.length === 0) return;

        diapositivaIdx = Math.max(0, Math.min(diapositivaIdx, escenas.length - 1));
        escenas.forEach((esc, i) => {
            esc.classList.toggle("activa", i === diapositivaIdx);
        });

        const art = articulosActivos[indiceActual];
        indicadorDiapositiva.textContent = `Art. ${art.numero} (${indiceActual + 1}/${articulosActivos.length}) • Parte ${diapositivaIdx + 1} de ${escenas.length}`;
        topbarIndiceArt.textContent = `Art. ${art.numero} • ${diapositivaIdx + 1}/${escenas.length}`;
    }

    function aplicarConfiguracion() {
        todosTemas.forEach(t => document.body.classList.remove(t));
        document.body.classList.add(config.tema);

        todosModos.forEach(m => document.body.classList.remove(m));
        document.body.classList.add(config.modo);

        contenidoEl.style.fontSize = config.tamanoPx;
        fontLabelEl.textContent = config.tamanoEtiqueta;
        modoLabelEl.textContent = config.modoEtiqueta;
        topbarModoBadge.textContent = `Modo ${config.modoEtiqueta}`;

        botonesTema.forEach(btn => {
            btn.classList.toggle("activa", btn.dataset.tema === config.tema);
        });
        botonesTamano.forEach(btn => {
            btn.classList.toggle("activa", btn.dataset.tamano === config.tamanoPx);
        });
        botonesModo.forEach(btn => {
            btn.classList.toggle("activa", btn.dataset.modo === config.modo);
        });

        guardarConfig();

        if (pantallaActual === "lector") {
            if (config.modo === "modo-diapositiva") {
                renderizarEscenaDiapositiva();
            } else if (articulosActivos[indiceActual]) {
                const art = articulosActivos[indiceActual];
                indicadorDiapositiva.textContent = `Artículo ${indiceActual + 1} de ${articulosActivos.length}`;
                topbarIndiceArt.textContent = `Art. ${art.numero} (${indiceActual + 1}/${articulosActivos.length})`;
            }

            if (esModoSinMenu()) {
                modoFoco = "lector";
                lectorEl.focus();
            } else {
                modoFoco = "lista";
                listaEl.focus();
            }
        }
    }

    function abrirConfiguracion() {
        pantallaAnteriorConfig = pantallaActual;
        pantallaActual = "config";
        modalConfig.classList.add("abierto");
        controlesConfigFocus = [
            ...botonesTema,
            ...botonesTamano,
            ...botonesModo,
            btnCerrarConfig
        ];
        configFocusIdx = 0;
        if (controlesConfigFocus[0]) {
            controlesConfigFocus[0].focus();
        }
    }

    function cerrarConfiguracion() {
        modalConfig.classList.remove("abierto");
        pantallaActual = pantallaAnteriorConfig || "inicio";
        if (pantallaActual === "inicio") {
            renderizarInicio();
        } else if (pantallaActual === "lector") {
            if (esModoSinMenu()) {
                lectorEl.focus();
            } else {
                listaEl.focus();
            }
        }
    }

    botonesTema.forEach(btn => {
        btn.addEventListener("click", () => {
            config.tema = btn.dataset.tema;
            aplicarConfiguracion();
        });
    });

    botonesTamano.forEach(btn => {
        btn.addEventListener("click", () => {
            config.tamanoPx = btn.dataset.tamano;
            config.tamanoEtiqueta = btn.dataset.etiqueta;
            aplicarConfiguracion();
        });
    });

    botonesModo.forEach(btn => {
        btn.addEventListener("click", () => {
            config.modo = btn.dataset.modo;
            config.modoEtiqueta = btn.dataset.etiqueta;
            aplicarConfiguracion();
        });
    });

    btnConfigInicio.addEventListener("click", abrirConfiguracion);
    btnConfigLector.addEventListener("click", abrirConfiguracion);
    btnConfigLectorTop.addEventListener("click", abrirConfiguracion);
    btnCerrarConfig.addEventListener("click", cerrarConfiguracion);

    function renderizarInicio() {
        gridNormas.innerHTML = "";
        const seleccionEnTarjeta = focoInicioIdx < catalogoNormas.length;
        btnConfigInicio.classList.toggle("seleccionado", !seleccionEnTarjeta);

        catalogoNormas.forEach((norma, idx) => {
            const arts = norma.disponible ? norma.obtenerArticulos() : [];
            const card = document.createElement("div");
            card.className = "tarjeta-norma";
            if (seleccionEnTarjeta && idx === focoInicioIdx) {
                card.classList.add("seleccionada");
            }
            if (!norma.disponible) card.classList.add("no-disponible");

            const cantidadTexto = norma.disponible ? `${arts.length} arts. listos` : "Próximamente";
            const accionTexto = norma.disponible ? "Estudiar →" : "Sin datos";

            card.innerHTML = `
                <div class="tarjeta-icono-box" aria-hidden="true">${norma.icono}</div>
                <h3>${norma.titulo}</h3>
                <div class="tarjeta-sub">${norma.subtitulo}</div>
                <p class="tarjeta-desc">${norma.descripcion}</p>
                <div class="tarjeta-pie">
                    <span class="tarjeta-estado-pill">${cantidadTexto}</span>
                    <span>${accionTexto}</span>
                </div>
            `;

            card.addEventListener("click", () => {
                normaSeleccionadaIdx = idx;
                focoInicioIdx = idx;
                abrirNorma(idx);
            });

            gridNormas.appendChild(card);
        });
    }

    function irAInicio() {
        pantallaActual = "inicio";
        vistaLector.classList.remove("activa");
        vistaInicio.classList.add("activa");
        focoInicioIdx = normaSeleccionadaIdx;
        renderizarInicio();
        gridNormas.focus();
    }

    function abrirNorma(idx) {
        const norma = catalogoNormas[idx];
        if (!norma || !norma.disponible) return;

        normaSeleccionadaIdx = idx;
        articulosActivos = norma.obtenerArticulos();
        normaTituloEl.textContent = norma.titulo;
        topbarNormaNombre.textContent = norma.titulo;
        rutaEl.textContent = `${norma.subtitulo} • ${norma.titulo}`;

        const guardado = parseInt(localStorage.getItem(`juristv_${norma.id}_idx`) || "0", 10);
        indiceActual = (guardado >= 0 && guardado < articulosActivos.length) ? guardado : 0;

        pantallaActual = "lector";
        vistaInicio.classList.remove("activa");
        vistaLector.classList.add("activa");

        renderizarLista();
        mostrarArticulo(indiceActual, false);

        if (esModoSinMenu()) {
            modoFoco = "lector";
            lectorEl.focus();
        } else {
            modoFoco = "lista";
            listaEl.focus();
        }
    }

    function renderizarLista() {
        listaEl.innerHTML = "";
        articulosActivos.forEach((art, index) => {
            const li = document.createElement("li");
            li.textContent = `Art. ${art.numero} - ${art.titulo}`;
            if (index === indiceActual) li.classList.add("activo");
            listaEl.appendChild(li);
        });
    }

    function mostrarArticulo(index, irUltimaEscena = false) {
        if (index < 0 || index >= articulosActivos.length) return;
        const norma = catalogoNormas[normaSeleccionadaIdx];
        indiceActual = index;
        if (norma) {
            localStorage.setItem(`juristv_${norma.id}_idx`, index);
        }

        const art = articulosActivos[index];
        rutaEl.textContent = art.seccion || `${norma.subtitulo} • ${norma.titulo}`;
        tituloEl.textContent = `Artículo ${art.numero}. ${art.titulo}`;

        const escenasHTML = construirEscenasHTML(art.html, art.contenido);
        totalDiapositivasArt = escenasHTML.length;
        contenidoEl.innerHTML = escenasHTML.join("");

        diapositivaIdx = irUltimaEscena ? totalDiapositivasArt - 1 : 0;
        indicadorDiapositiva.textContent = `Artículo ${index + 1} de ${articulosActivos.length}`;
        topbarIndiceArt.textContent = `Art. ${art.numero} (${index + 1}/${articulosActivos.length})`;
        lectorEl.scrollTop = 0;

        if (config.modo === "modo-diapositiva") {
            renderizarEscenaDiapositiva();
        }

        const items = listaEl.querySelectorAll("li");
        items.forEach((item, i) => {
            item.classList.toggle("activo", i === index);
            if (i === index) {
                item.scrollIntoView({ block: "nearest" });
            }
        });
    }

    function avanzarDiapositiva() {
        if (config.modo !== "modo-diapositiva") {
            if (indiceActual < articulosActivos.length - 1) mostrarArticulo(indiceActual + 1, false);
            return;
        }
        if (diapositivaIdx < totalDiapositivasArt - 1) {
            diapositivaIdx++;
            renderizarEscenaDiapositiva();
        } else if (indiceActual < articulosActivos.length - 1) {
            mostrarArticulo(indiceActual + 1, false);
        }
    }

    function retrocederDiapositiva() {
        if (config.modo !== "modo-diapositiva") {
            if (indiceActual > 0) mostrarArticulo(indiceActual - 1, false);
            return;
        }
        if (diapositivaIdx > 0) {
            diapositivaIdx--;
            renderizarEscenaDiapositiva();
        } else if (indiceActual > 0) {
            mostrarArticulo(indiceActual - 1, true);
        }
    }

    function saltarAArticulo(numStr) {
        const idx = articulosActivos.findIndex(a => String(a.numero).toLowerCase() === numStr.toLowerCase());
        if (idx !== -1) {
            mostrarArticulo(idx, false);
        }
    }

    function actualizarBufferVisual(valor) {
        numBufferEl.textContent = valor;
        numBufferTopEl.textContent = valor;
    }

    btnVolverInicio.addEventListener("click", irAInicio);
    btnVolverInicioTop.addEventListener("click", irAInicio);
    btnArtAnterior.addEventListener("click", retrocederDiapositiva);
    btnArtSiguiente.addEventListener("click", avanzarDiapositiva);
    btnTopAnterior.addEventListener("click", retrocederDiapositiva);
    btnTopSiguiente.addEventListener("click", avanzarDiapositiva);

    document.addEventListener("keydown", function (e) {
        if (pantallaActual === "config") {
            const total = controlesConfigFocus.length;
            switch (e.keyCode) {
                case 39:
                case 40:
                    e.preventDefault();
                    configFocusIdx = (configFocusIdx + 1) % total;
                    controlesConfigFocus[configFocusIdx].focus();
                    break;
                case 37:
                case 38:
                    e.preventDefault();
                    configFocusIdx = (configFocusIdx - 1 + total) % total;
                    controlesConfigFocus[configFocusIdx].focus();
                    break;
                case 13:
                    e.preventDefault();
                    if (controlesConfigFocus[configFocusIdx]) {
                        controlesConfigFocus[configFocusIdx].click();
                    }
                    break;
                case 10009:
                case 27:
                    e.preventDefault();
                    cerrarConfiguracion();
                    break;
            }
            return;
        }

        if (pantallaActual === "inicio") {
            const totalItemsInicio = catalogoNormas.length + 1;
            switch (e.keyCode) {
                case 39:
                case 40:
                    e.preventDefault();
                    focoInicioIdx = (focoInicioIdx + 1) % totalItemsInicio;
                    renderizarInicio();
                    break;
                case 37:
                case 38:
                    e.preventDefault();
                    focoInicioIdx = (focoInicioIdx - 1 + totalItemsInicio) % totalItemsInicio;
                    renderizarInicio();
                    break;
                case 13:
                    e.preventDefault();
                    if (focoInicioIdx < catalogoNormas.length) {
                        normaSeleccionadaIdx = focoInicioIdx;
                        abrirNorma(focoInicioIdx);
                    } else {
                        abrirConfiguracion();
                    }
                    break;
            }
            return;
        }

        if (e.keyCode >= 48 && e.keyCode <= 57) {
            const digito = String(e.keyCode - 48);
            bufferNumero += digito;
            actualizarBufferVisual(bufferNumero);
            clearTimeout(timerNumero);
            timerNumero = setTimeout(() => {
                saltarAArticulo(bufferNumero);
                bufferNumero = "";
                actualizarBufferVisual("---");
            }, 1300);
            return;
        }

        switch (e.keyCode) {
            case 38: // ARRIBA
                e.preventDefault();
                if (!esModoSinMenu() && modoFoco === "lista") {
                    if (indiceActual > 0) mostrarArticulo(indiceActual - 1, false);
                } else if (config.modo !== "modo-diapositiva") {
                    lectorEl.scrollBy({ top: -220, behavior: "smooth" });
                }
                break;

            case 40: // ABAJO
                e.preventDefault();
                if (!esModoSinMenu() && modoFoco === "lista") {
                    if (indiceActual < articulosActivos.length - 1) mostrarArticulo(indiceActual + 1, false);
                } else if (config.modo !== "modo-diapositiva") {
                    lectorEl.scrollBy({ top: 220, behavior: "smooth" });
                }
                break;

            case 39: // DERECHA
                e.preventDefault();
                if (config.modo === "modo-diapositiva") {
                    avanzarDiapositiva();
                } else if (esModoSinMenu()) {
                    if (indiceActual < articulosActivos.length - 1) mostrarArticulo(indiceActual + 1, false);
                } else {
                    modoFoco = "lector";
                    lectorEl.focus();
                }
                break;

            case 37: // IZQUIERDA
                e.preventDefault();
                if (config.modo === "modo-diapositiva") {
                    retrocederDiapositiva();
                } else if (esModoSinMenu()) {
                    if (indiceActual > 0) mostrarArticulo(indiceActual - 1, false);
                } else {
                    modoFoco = "lista";
                    listaEl.focus();
                }
                break;

            case 13: // OK: cicla tamaño de texto rápido
                e.preventDefault();
                const idxActual = tamanosCiclo.findIndex(t => t.px === config.tamanoPx);
                const siguiente = tamanosCiclo[(idxActual + 1) % tamanosCiclo.length];
                config.tamanoPx = siguiente.px;
                config.tamanoEtiqueta = siguiente.etiqueta;
                aplicarConfiguracion();
                break;

            case 10009: // RETURN
                e.preventDefault();
                if (!esModoSinMenu() && modoFoco === "lector") {
                    modoFoco = "lista";
                    listaEl.focus();
                } else {
                    irAInicio();
                }
                break;
        }
    });

    aplicarConfiguracion();
    renderizarInicio();
    gridNormas.focus();
});