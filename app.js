/* Motor de la app de inducción TMM: ruta de módulos, reproductor de pantallas,
   prácticas calificadas, examen final, constancia y tabla del equipo. */
(() => {
  "use strict";
  const C = window.CURSO;
  const MODS = C.modulos;
  const CALIFICA = new Set(["pregunta", "vf", "relaciona", "ordena", "clasifica", "gesto"]);
  const MOVIMIENTO = !matchMedia("(prefers-reduced-motion: reduce)").matches;
  const COLOR_HOJA = {
    conoce: "#e9d3a6", ultra: "#f3f1ec", pino: "#e6c58a", fancy: "#b9824f", mdf: "#c49a6c",
    cimbras: "#6b4a2e", heroe: "#dcb57d", emocional: "#d4a272", pnl: "#cfa46e", noverbal: "#e8cf9d", cierre: "#a8744a",
  };

  /* ---------- utilidades ---------- */
  function h(tag, props, ...kids) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(props || {})) {
      if (v == null || v === false) continue;
      if (k === "class") el.className = v;
      else if (k === "html") el.innerHTML = v;
      else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? "" : v);
    }
    for (const kid of kids.flat(Infinity)) {
      if (kid == null || kid === false) continue;
      el.append(kid.nodeType ? kid : String(kid));
    }
    return el;
  }
  const src = (k) => `img/${k}.webp`;
  const im = (k, cls, alt = "") => h("img", { src: src(k), class: cls, alt, loading: "lazy", decoding: "async" });
  const baraja = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const rango = (n) => Array.from({ length: n }, (_, i) => i);
  const azar = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const fmt = (n) => Number(n).toLocaleString("es-MX");
  const ICON = {
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    der: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    izq: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>',
    candado: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
    ok: '<svg viewBox="0 0 26 26"><circle cx="13" cy="13" r="13" fill="#1e8e3e"/><path d="M7.5 13.5l3.6 3.6 7.4-8" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  };
  const ico = (k) => h("span", { html: ICON[k], style: "display:inline-flex" });
  const EN_CLAUDE = !!(window.claude && window.claude.use);
  /* Fuera de Claude la app se instala como PWA (manifest + service worker). */
  let promptInstalar = null;
  const instalada = matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
  const esIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (!EN_CLAUDE && "serviceWorker" in navigator && location.protocol.startsWith("http")) {
    addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
  }
  addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); promptInstalar = e; if (!P) pintaInicio(); });
  addEventListener("appinstalled", () => { promptInstalar = null; if (!P) pintaInicio(); });
  function botonInstalar() {
    if (EN_CLAUDE || instalada) return null;
    if (promptInstalar) {
      return h("button", { class: "btn sec", style: "color:#fff;box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.4)", onclick: async () => {
        promptInstalar.prompt();
        try { await promptInstalar.userChoice; } catch (e) { /* nada */ }
        promptInstalar = null; pintaInicio();
      } }, "Instalar en mi celular");
    }
    if (esIOS) return h("p", { class: "nota-instalar" }, "Para tenerla en tu iPhone: toca Compartir y luego “Agregar a inicio”.");
    return null;
  }

  /* ---------- estado local ---------- */
  const KEY = "tmm-induccion-v1";
  let S = {};
  try { S = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { S = {}; }
  S.mods = S.mods || {};
  S.pt = S.pt || 0;
  const guarda = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* sin almacenamiento */ } };
  const hechos = () => MODS.filter((m) => S.mods[m.id] && S.mods[m.id].hecho).length;
  const todoHecho = () => hechos() === MODS.length;

  /* ---------- base compartida (avance del equipo) ---------- */
  let DB = null, UID = null, equipo = null, cadena = Promise.resolve();
  function mezcla(r) {
    if (!r) return;
    if (!S.nombre && r.nombre) S.nombre = r.nombre;
    if (!S.area && r.area) S.area = r.area;
    for (const [id, pct] of Object.entries(r.mods || {})) {
      const loc = S.mods[id];
      if (!loc || !loc.hecho) S.mods[id] = { hecho: true, pct, pt: 0 };
    }
    if (r.examen != null && (!S.examen || r.examen > S.examen.pct)) S.examen = { pct: r.examen, aprobado: !!r.aprobado };
    if ((r.pt || 0) > S.pt) S.pt = r.pt;
    guarda();
  }
  function sincroniza() {
    if (!DB || !UID || !S.nombre) return;
    const mods = {};
    for (const m of MODS) if (S.mods[m.id] && S.mods[m.id].hecho) mods[m.id] = S.mods[m.id].pct;
    const doc = {
      nombre: S.nombre.slice(0, 80), area: S.area || "", pt: S.pt, hechos: hechos(), total: MODS.length, mods,
      examen: S.examen ? S.examen.pct : null, aprobado: !!(S.examen && S.examen.aprobado), actualizado: Date.now(),
    };
    cadena = cadena.then(() => DB.doc("avance/" + UID).set(doc)).catch(() => {});
  }
  (async () => {
    try {
      if (!EN_CLAUDE) return;
      const [db, user] = await Promise.all([window.claude.use("db"), window.claude.use("user")]);
      if (!db || !user) return;
      const id = await user.id();
      if (!id) return;
      DB = db; UID = id;
      const snap = await db.doc("avance/" + id).get();
      if (snap.exists) mezcla(snap.data());
      db.collection("avance").orderBy("pt", "desc").limit(200).onSnapshot(
        (qs) => { equipo = qs.docs.map((d) => Object.assign({ id: d.id }, d.data())); pintaEquipo(); },
        () => { equipo = null; pintaEquipo(); }
      );
      if (!P) pintaInicio();
      sincroniza();
    } catch (e) { /* la app funciona sin base compartida */ }
  })();

  /* ---------- estiba (avance visual) ---------- */
  function estiba(n, nueva) {
    const total = MODS.length, grosor = 13, base = 194;
    let s = '<svg class="estiba" viewBox="0 0 240 240" role="img" aria-label="Estiba con ' + n + " de " + total + ' hojas">';
    for (let i = total - 1; i >= n; i--) {
      const y = base - (i + 1) * grosor;
      s += `<rect x="16" y="${y}" width="208" height="${grosor - 1}" rx="2" fill="none" stroke="rgba(255,255,255,.18)" stroke-dasharray="4 4"/>`;
    }
    for (let i = 0; i < n; i++) {
      const m = MODS[i] ? MODS[i].id : "conoce";
      const hecho = MODS.filter((x) => S.mods[x.id] && S.mods[x.id].hecho)[i];
      const color = COLOR_HOJA[hecho ? hecho.id : m] || "#e6c58a";
      const y = base - (i + 1) * grosor, dx = i % 2 ? 2 : -1;
      const cls = nueva && i === n - 1 ? ' class="hoja-nueva"' : "";
      s += `<g${cls}><rect x="${16 + dx}" y="${y}" width="208" height="${grosor - 1}" rx="1.5" fill="${color}"/>` +
        `<rect x="${16 + dx}" y="${y}" width="208" height="2" fill="rgba(255,255,255,.45)"/>` +
        `<path d="M${18 + dx} ${y + 5}h204M${18 + dx} ${y + 8.5}h204" stroke="rgba(60,35,10,.28)" stroke-width="1"/></g>`;
    }
    if (n >= 2) {
      const y = base - 2 * grosor + 3;
      s += `<rect x="150" y="${y}" width="58" height="20" rx="2" fill="#0079c1"/><text x="179" y="${y + 14}" text-anchor="middle" font-family="Exo 2, sans-serif" font-style="italic" font-weight="900" font-size="12" fill="#fff">TMM</text>`;
    }
    s += '<rect x="10" y="194" width="220" height="7" fill="#8a6239"/><rect x="18" y="201" width="28" height="15" fill="#6f4d2b"/><rect x="106" y="201" width="28" height="15" fill="#6f4d2b"/><rect x="194" y="201" width="28" height="15" fill="#6f4d2b"/><rect x="10" y="216" width="220" height="7" fill="#8a6239"/>';
    if (n === total) {
      const y = base - total * grosor;
      s += `<path class="hoja-nueva" d="M120 ${y - 40} L146 ${y - 4} L94 ${y - 4} Z" fill="#00d200"/>`;
    }
    return s + "</svg>";
  }

  /* ---------- inicio ---------- */
  const app = document.getElementById("app");
  let hojaNueva = false;

  function siguienteModulo() {
    if (S.sesion && S.sesion.tipo === "mod") return MODS.find((m) => m.id === S.sesion.id);
    return MODS.find((m) => !(S.mods[m.id] && S.mods[m.id].hecho));
  }

  function pintaInicio() {
    const n = hechos();
    const sig = siguienteModulo();
    const minutos = MODS.reduce((a, m) => a + m.minutos, 0);
    const saludo = h("div", { class: "saludo" });
    if (!S.nombre) {
      const nom = h("input", { id: "alta-nombre", autocomplete: "name", placeholder: "Nombre y apellido", maxlength: "60", required: true });
      const area = h("select", { id: "alta-area" },
        ["Ventas", "Almacén y logística", "Administración", "Compras", "Otra área"].map((a) => h("option", {}, a)));
      saludo.append(
        h("h1", {}, "Bienvenido a tu ", h("em", {}, "inducción")),
        h("p", {}, `${MODS.length} módulos cortos sobre la empresa, nuestros productos y la forma en que vendemos. Unos ${minutos} minutos en total, a tu ritmo.`),
        h("form", {
          class: "alta",
          onsubmit: (e) => {
            e.preventDefault();
            const v = nom.value.trim().replace(/\s+/g, " ");
            if (!v) { nom.focus(); return; }
            S.nombre = v; S.area = area.value; guarda(); sincroniza(); pintaInicio();
          },
        },
          h("div", { class: "dos" },
            h("label", { for: "alta-nombre" }, "¿Cómo te llamas?", nom),
            h("label", { for: "alta-area" }, "Tu área", area)),
          h("button", { class: "btn blanco", type: "submit" }, "Empezar mi recorrido", ico("der"))),
        h("div", { class: "acciones" }, botonInstalar())
      );
    } else {
      const pct = Math.round((n / MODS.length) * 100);
      saludo.append(
        h("h1", {}, "Hola, ", h("em", {}, S.nombre.split(" ")[0])),
        h("p", {}, n === 0 ? "Tu estiba está vacía. Cada módulo que termines le suma una hoja." :
          n < MODS.length ? `Llevas ${n} de ${MODS.length} módulos. Sigue sumando hojas a tu estiba.` :
          S.examen && S.examen.aprobado ? "Terminaste la inducción. Tu constancia está lista." : "Completaste todos los módulos. Te falta el examen final."),
        h("div", { class: "barra-total" },
          h("div", { class: "fila" }, h("span", {}, "Avance del curso"), h("span", { class: "num" }, pct + "%")),
          h("div", { class: "riel" }, h("i", { style: `width:${pct}%` }))),
        h("div", { class: "acciones" },
          sig ? h("button", { class: "btn blanco", onclick: () => abreModulo(sig.id) },
            S.sesion && S.sesion.id === sig.id ? "Continuar: " : n ? "Siguiente: " : "Empezar: ", sig.titulo, ico("der")) : null,
          !sig && !(S.examen && S.examen.aprobado) ? h("button", { class: "btn blanco", onclick: abreExamen }, "Presentar examen final", ico("der")) : null,
          S.examen && S.examen.aprobado ? h("button", { class: "btn blanco", onclick: abreConstancia }, "Ver mi constancia", ico("der")) : null,
          botonInstalar())
      );
    }

    const banda = h("header", { class: "banda" },
      h("div", { class: "banda-in" },
        h("div", { class: "topline" },
          h("img", { src: src("logo_white"), alt: "TMM Triplay y Maderas de Mayoreo" }),
          h("span", { class: "pt", title: "Puntos ganados: pies-tabla" }, h("b", { class: "num" }, fmt(S.pt)), h("small", {}, "pt"))),
        saludo,
        h("div", { class: "estiba-caja" },
          h("div", { html: estiba(n, hojaNueva) }),
          h("span", { class: "eyebrow" }, `Tu estiba · ${n} de ${MODS.length} hojas`))));
    hojaNueva = false;

    const ruta = h("section", {},
      h("div", { class: "sec-tit" }, h("h2", {}, "Tu ruta"), h("span", { class: "eyebrow" }, `${MODS.length} módulos · ${minutos} min aprox.`)),
      h("div", { class: "ruta" }, MODS.map((m, i) => tarjetaModulo(m, i))));

    const exOk = S.examen && S.examen.aprobado;
    const final = h("section", {},
      h("div", { class: "sec-tit" }, h("h2", {}, "Cierre del curso")),
      h("div", { class: "final" },
        h("div", { class: "tarjeta-final" },
          h("span", { class: "eyebrow" }, "Examen final"),
          h("h3", {}, `${C.examen.preguntas} preguntas de todo el curso`),
          h("p", {}, `Se aprueba con ${C.examen.aprobar}% o más. Puedes repetirlo las veces que quieras.`),
          S.examen ? h("p", { class: "num" }, `Mejor resultado: ${S.examen.pct}%`) : null,
          todoHecho() ? h("button", { class: "btn", onclick: abreExamen }, S.examen ? "Volver a presentarlo" : "Presentar examen")
            : h("span", { class: "candado" }, ico("candado"), `Se abre al terminar los ${MODS.length} módulos`),
          im("rino_pensando", "rino-esq")),
        h("div", { class: "tarjeta-final" },
          h("span", { class: "eyebrow" }, "Constancia"),
          h("h3", {}, "Constancia de inducción"),
          h("p", {}, "Con tu nombre, la fecha y tu calificación. Descárgala cuando apruebes el examen."),
          exOk ? h("button", { class: "btn verde", onclick: abreConstancia }, "Ver mi constancia")
            : h("span", { class: "candado" }, ico("candado"), "Se abre al aprobar el examen"),
          im("rino_trofeo", "rino-esq")),
        h("div", { class: "tarjeta-final" },
          h("span", { class: "eyebrow" }, "Para el descanso"),
          h("h3", {}, "Tala y Siembra"),
          h("p", {}, "Corta troncos por el lado sin rama y siembra antes de que se acabe el bosque. Cada 8 troncos son una hoja de triplay."),
          h("p", { class: "num" }, `Tu mejor marca: ${mejorJuego()} troncos`),
          h("button", { class: "btn", onclick: () => window.abrirJuego && window.abrirJuego(() => pintaInicio()) }, "Jugar"),
          im("rino_triplay", "rino-esq"))));

    const eq = h("section", { id: "sec-equipo", hidden: !DB });
    app.replaceChildren(banda, h("main", {}, ruta, final, eq));
    pintaEquipo();
  }

  function mejorJuego() {
    try { return parseInt(localStorage.getItem("talaysiembra.best") || "0", 10) || 0; } catch (e) { return 0; }
  }

  function tarjetaModulo(m, i) {
    const r = S.mods[m.id];
    const enCurso = S.sesion && S.sesion.id === m.id;
    let estado;
    if (r && r.hecho) estado = [h("span", { class: "pill ok" }, `Completado · ${r.pct}%`), h("span", { class: "mini-riel" }, h("i", { style: "width:100%" }))];
    else if (enCurso) {
      const p = Math.round((S.sesion.i / S.sesion.pasos.length) * 100);
      estado = [h("span", { class: "pill curso" }, "En curso"), h("span", { class: "mini-riel" }, h("i", { style: `width:${p}%` }))];
    } else estado = [h("span", { class: "pill" }, "Pendiente")];
    return h("button", { class: "mod" + (r && r.hecho ? " hecho" : ""), onclick: () => abreModulo(m.id) },
      h("span", { class: "foto", style: `background-image:url(${src(m.portada)})` }, h("b", {}, String(i + 1).padStart(2, "0"))),
      h("span", { class: "info" },
        h("span", { class: "etiqueta" }, h("span", {}, `${m.pasos.length} pantallas`), h("span", {}, `${m.minutos} min`)),
        h("h3", {}, m.titulo),
        h("span", { class: "sub" }, m.sub),
        h("span", { class: "estado" }, estado)),
      r && r.hecho ? h("span", { class: "sello", html: ICON.ok }) : null);
  }

  function pintaEquipo() {
    const sec = document.getElementById("sec-equipo");
    if (!sec) return;
    sec.hidden = !DB;
    if (!DB) return;
    const filas = (equipo || []).filter((r) => r.nombre);
    sec.replaceChildren(
      h("div", { class: "sec-tit" }, h("h2", {}, "Avance del equipo"), h("span", { class: "eyebrow" }, "Se actualiza en vivo")),
      h("div", { class: "equipo" },
        filas.length === 0
          ? h("p", { class: "vacio" }, equipo == null ? "Cargando el avance del equipo…" : "Todavía nadie ha registrado avance. Cuando alguien termine un módulo aparecerá aquí.")
          : h("div", { class: "scroll-x" }, h("table", {},
            h("thead", {}, h("tr", {}, ["Persona", "Área", "Módulos", "Examen", "pt"].map((t, j) => h("th", { class: j > 1 ? "n" : null }, t)))),
            h("tbody", {}, filas.map((r) => h("tr", { class: r.id === UID ? "yo" : null },
              h("td", {}, r.nombre + (r.id === UID ? " (tú)" : "")),
              h("td", {}, r.area || "—"),
              h("td", { class: "n" }, `${r.hechos || 0}/${r.total || MODS.length}`),
              h("td", { class: "n" }, r.examen == null ? "—" : `${r.examen}%${r.aprobado ? " ✓" : ""}`),
              h("td", { class: "n" }, fmt(r.pt || 0)))))))));
  }

  /* ---------- reproductor ---------- */
  let P = null, playerEl = null, dirAtras = false;

  function expande(pasos) {
    const out = [];
    for (const p of pasos) {
      if (p.t !== "gestos") { out.push(p); continue; }
      for (const g of baraja(C.gestos).slice(0, p.cantidad)) {
        const otros = baraja(C.gestos.filter((x) => x !== g)).slice(0, 2).map((x) => x.sig);
        const ops = baraja([g.sig, ...otros]);
        out.push({ t: "gesto", g, ops, ok: ops.indexOf(g.sig) });
      }
    }
    return out;
  }

  function abreModulo(id) {
    const m = MODS.find((x) => x.id === id);
    if (S.sesion && S.sesion.id === id) P = S.sesion;
    else P = { tipo: "mod", id, pasos: expande(m.pasos), i: 0, resp: {} };
    montaPlayer(m.titulo, !!m.oscuro);
  }

  function abreExamen() {
    const pool = [];
    MODS.forEach((m) => m.pasos.forEach((p) => { if (p.t === "pregunta" || p.t === "vf") pool.push(p); }));
    const intro = {
      t: "intro", titulo: "Examen final", sub: `${C.examen.preguntas} preguntas de todo el curso`,
      texto: `Necesitas ${C.examen.aprobar}% o más para obtener tu constancia. Las preguntas salen al azar cada vez.`, rino: "rino_pensando",
    };
    P = { tipo: "examen", pasos: [intro, ...baraja(pool).slice(0, C.examen.preguntas)], i: 0, resp: {} };
    montaPlayer("Examen final", false);
  }

  function montaPlayer(titulo, oscuro) {
    cierraPlayer(true);
    const segs = h("div", { class: "segs" });
    const cuenta = h("span", { class: "cuenta num" });
    const atras = h("button", { class: "btn sec", onclick: () => mueve(-1) }, ico("izq"), "Atrás");
    const sig = h("button", { class: "btn", onclick: () => mueve(1) }, "Siguiente", ico("der"));
    const cuerpo = h("div", { class: "p-cuerpo" });
    playerEl = h("div", { class: "player" + (oscuro ? " oscuro" : ""), role: "dialog", "aria-modal": "true", "aria-label": titulo },
      h("div", { class: "p-top" },
        h("div", { class: "fila" },
          h("button", { class: "icono", "aria-label": "Cerrar y volver a la ruta", onclick: () => cierraPlayer() , html: ICON.x }),
          h("span", { class: "titulo" }, titulo),
          cuenta),
        segs),
      cuerpo,
      h("div", { class: "p-pie" }, h("div", { class: "in" }, atras, sig)));
    playerEl._ = { segs, cuenta, atras, sig, cuerpo };
    document.body.append(playerEl);
    document.body.style.overflow = "hidden";
    pintaPaso(true);
  }

  function cierraPlayer(silencioso) {
    if (playerEl) { playerEl.remove(); playerEl = null; }
    document.body.style.overflow = "";
    if (!silencioso) { P = null; pintaInicio(); }
  }

  function listo(i) {
    const p = P.pasos[i];
    return !CALIFICA.has(p.t) || (P.resp[i] && P.resp[i].hecho);
  }

  function mueve(d) {
    if (d > 0 && !listo(P.i)) return;
    if (d > 0 && P.i === P.pasos.length - 1) return termina();
    if (d < 0 && P.i === 0) return;
    dirAtras = d < 0;
    P.i += d;
    persiste();
    pintaPaso(true);
  }

  function persiste() {
    if (P && P.tipo === "mod") { S.sesion = P; guarda(); }
  }

  function pintaPaso(anim) {
    const { segs, cuenta, atras, sig, cuerpo } = playerEl._;
    const p = P.pasos[P.i];
    const r = (P.resp[P.i] = P.resp[P.i] || {});
    const total = P.pasos.length;
    segs.replaceChildren(...rango(total).map((k) => h("i", { class: k < P.i ? "v" : k === P.i ? (anim ? "a" : "v") : null })));
    cuenta.textContent = `${P.i + 1}/${total}`;
    atras.disabled = P.i === 0;
    sig.disabled = !listo(P.i);
    sig.replaceChildren(P.i === total - 1 ? (P.tipo === "examen" ? "Ver resultado" : "Terminar módulo") : "Siguiente", ico("der"));
    const upd = () => { persiste(); pintaPaso(false); };
    const fn = R[p.t] || R.texto;
    const paso = h("div", { class: "paso" + (anim && MOVIMIENTO ? (dirAtras ? " entra-atras" : " entra") : "") }, fn(p, r, upd));
    cuerpo.replaceChildren(paso);
    if (anim) cuerpo.scrollTop = 0;
    playerEl.querySelector(".p-pie").hidden = false;
  }

  document.addEventListener("keydown", (e) => {
    if (!playerEl || (e.target.closest && e.target.closest("input, textarea, select"))) return;
    if (e.key === "ArrowRight") mueve(1);
    else if (e.key === "ArrowLeft") mueve(-1);
    else if (e.key === "Escape") { if (document.querySelector(".lightbox")) return; cierraPlayer(); }
  });

  /* ---------- final de módulo / examen ---------- */
  function cuentaAciertos() {
    let ok = 0, total = 0;
    P.pasos.forEach((p, i) => {
      if (!CALIFICA.has(p.t)) return;
      total++;
      if (P.resp[i] && P.resp[i].ok) ok++;
    });
    return { ok, total, pct: total ? Math.round((ok / total) * 100) : 100 };
  }

  function termina() {
    const { ok, total, pct } = cuentaAciertos();
    let ganados = 0, primera = false, aprobado = false;
    if (P.tipo === "mod") {
      const prev = S.mods[P.id] || {};
      primera = !prev.hecho;
      const ptMod = ok * 10 + 30;
      ganados = Math.max(0, ptMod - (prev.pt || 0));
      S.pt += ganados;
      S.mods[P.id] = { hecho: true, ok, total, pct: Math.max(pct, prev.pct || 0), pt: Math.max(ptMod, prev.pt || 0), fecha: Date.now() };
      S.sesion = null;
      hojaNueva = primera;
    } else {
      aprobado = pct >= C.examen.aprobar;
      const prev = S.examen || {};
      const ptEx = ok * 10 + (aprobado ? 100 : 0);
      ganados = Math.max(0, ptEx - (prev.ptEx || 0));
      S.pt += ganados;
      if (!prev.pct || pct >= prev.pct) S.examen = { pct, ok, total, aprobado: aprobado || !!prev.aprobado, fecha: Date.now(), ptEx: Math.max(ptEx, prev.ptEx || 0) };
      else S.examen.aprobado = S.examen.aprobado || aprobado;
      if (aprobado && (!S.examen.fechaAprobado)) S.examen.fechaAprobado = Date.now();
    }
    guarda();
    sincroniza();
    pintaResultado({ ok, total, pct, ganados, primera, aprobado });
  }

  function pintaResultado(x) {
    const { segs, cuenta, cuerpo } = playerEl._;
    segs.replaceChildren(...P.pasos.map(() => h("i", { class: "v" })));
    cuenta.textContent = "";
    playerEl.querySelector(".p-pie").hidden = true;
    const esMod = P.tipo === "mod";
    const idx = esMod ? MODS.findIndex((m) => m.id === P.id) : -1;
    const sigMod = esMod ? MODS.slice(idx + 1).find((m) => !(S.mods[m.id] && S.mods[m.id].hecho)) || MODS.find((m) => !(S.mods[m.id] && S.mods[m.id].hecho)) : null;
    const bueno = esMod ? x.pct >= 60 : x.aprobado;
    let titulo, texto;
    if (esMod) {
      titulo = x.pct >= 80 ? "¡Módulo dominado!" : x.pct >= 60 ? "¡Módulo completado!" : "Módulo completado";
      texto = x.primera ? "Se sumó una hoja nueva a tu estiba." : "Tu mejor resultado queda guardado.";
      if (x.pct < 60) texto += " Te conviene repasarlo: puedes repetirlo cuando quieras.";
    } else {
      titulo = x.aprobado ? "¡Aprobaste la inducción!" : "Casi lo logras";
      texto = x.aprobado ? "Tu constancia ya está lista." : `Necesitas ${C.examen.aprobar}% para aprobar. Repasa los módulos y vuelve a intentarlo.`;
    }
    const acciones = [];
    if (!esMod && x.aprobado) acciones.push(h("button", { class: "btn verde", onclick: abreConstancia }, "Ver mi constancia"));
    if (!esMod && !x.aprobado) acciones.push(h("button", { class: "btn", onclick: abreExamen }, "Intentar de nuevo"));
    if (esMod && sigMod) acciones.push(h("button", { class: "btn", onclick: () => abreModulo(sigMod.id) }, "Siguiente: ", sigMod.titulo));
    if (esMod && todoHecho() && !(S.examen && S.examen.aprobado)) acciones.push(h("button", { class: "btn verde", onclick: abreExamen }, "Presentar examen final"));
    if (esMod) acciones.push(h("button", { class: "btn sec", onclick: () => { const id = P.id; S.sesion = null; abreModulo(id); } }, "Repetir"));
    acciones.push(h("button", { class: "btn sec", onclick: () => cierraPlayer() }, "Volver a la ruta"));
    cuerpo.replaceChildren(h("div", { class: "paso" },
      h("div", { class: "resultado" },
        im(bueno ? C.rinos.meta : "rino_oops", "rino"),
        h("h2", {}, titulo),
        h("p", { class: "lead" }, texto),
        h("div", { class: "marcador" },
          h("div", {}, h("b", {}, x.pct + "%"), h("span", {}, `${x.ok} de ${x.total} aciertos`)),
          h("div", {}, h("b", {}, "+" + fmt(x.ganados)), h("span", {}, "pt ganados")),
          esMod ? h("div", {}, h("b", {}, `${hechos()}/${MODS.length}`), h("span", {}, "hojas en tu estiba")) : null),
        esMod ? h("div", { html: estiba(hechos(), x.primera), style: "background:#062f4d;border-radius:14px;padding:14px 18px 8px" }) : null,
        h("div", { class: "acciones" }, acciones))));
    cuerpo.scrollTop = 0;
    if (bueno) confeti();
  }

  /* ---------- confeti ---------- */
  function confeti() {
    if (!MOVIMIENTO) return;
    const cv = document.getElementById("confeti");
    cv.hidden = false;
    const ctx = cv.getContext("2d");
    const W = (cv.width = innerWidth), H = (cv.height = innerHeight);
    const cols = ["#0079c1", "#00d200", "#1e8e3e", "#e6c58a", "#ffffff"];
    const ps = rango(140).map(() => ({ x: W / 2 + (Math.random() - 0.5) * 160, y: H * 0.35, vx: (Math.random() - 0.5) * 12, vy: -Math.random() * 13 - 4, s: 5 + Math.random() * 6, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3, c: azar(cols), tri: Math.random() < 0.4 }));
    const t0 = performance.now();
    (function cuadro(t) {
      ctx.clearRect(0, 0, W, H);
      for (const p of ps) {
        p.vy += 0.32; p.x += p.vx; p.y += p.vy; p.vx *= 0.99; p.r += p.vr;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c;
        if (p.tri) { ctx.beginPath(); ctx.moveTo(0, -p.s); ctx.lineTo(p.s, p.s); ctx.lineTo(-p.s, p.s); ctx.fill(); } else ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
        ctx.restore();
      }
      if (t - t0 < 2600) requestAnimationFrame(cuadro);
      else { ctx.clearRect(0, 0, W, H); cv.hidden = true; }
    })(t0);
  }

  /* ---------- lightbox ---------- */
  function amplia(k) {
    const lb = h("div", { class: "lightbox", role: "dialog", "aria-label": "Imagen ampliada", tabindex: "0", onclick: () => lb.remove() }, h("img", { src: src(k), alt: "" }));
    const esc = (e) => { if (e.key === "Escape") { lb.remove(); document.removeEventListener("keydown", esc, true); e.stopPropagation(); } };
    document.addEventListener("keydown", esc, true);
    document.body.append(lb);
    lb.focus();
  }
  const imgZoom = (k, cls) => { const e = im(k, cls); e.addEventListener("click", () => amplia(k)); return e; };

  /* ---------- piezas comunes ---------- */
  const lista = (items) => h("ul", { class: "lista" }, items.map((t) => h("li", {}, t)));
  const retro = (ok, exp, extra) => h("div", { class: "retro " + (ok ? "bien" : "mal"), role: "status" },
    im(ok ? azar(C.rinos.bien) : azar(C.rinos.mal), ""),
    h("div", {}, h("b", {}, extra || (ok ? azar(["¡Correcto!", "¡Eso es!", "¡Muy bien!"]) : "No exactamente")), exp ? h("p", {}, exp) : null));
  function contar(el, fin) {
    if (!MOVIMIENTO) { el.textContent = fmt(fin); return; }
    const t0 = performance.now();
    (function f(t) {
      const k = Math.min(1, (t - t0) / 1200);
      el.textContent = fmt(Math.round(fin * (1 - Math.pow(1 - k, 3))));
      if (k < 1) requestAnimationFrame(f);
    })(t0);
  }
  function sacude(el) { if (!el) return; el.classList.remove("sacude"); void el.offsetWidth; el.classList.add("sacude"); }

  /* ---------- tipos de pantalla ---------- */
  const R = {
    intro(p, r, upd) {
      const izq = h("div", {},
        p.logo ? im(p.logo, "logo-mod") : null,
        h("span", { class: "eyebrow" }, p.sub),
        h("h2", { style: "margin-top:8px" }, p.titulo),
        h("p", { class: "lead" }, p.texto),
        p.revela ? h("div", { class: "revela" },
          r.v ? h("p", { class: "resp" }, p.revela) : h("button", { class: "btn sec", onclick: () => { r.v = true; upd(); } }, "Ver la respuesta")) : null);
      return h("div", { class: "intro" }, izq, im(p.rino, "rino"));
    },

    texto(p) {
      const pila = h("div", { class: "pila" },
        h("h2", {}, p.titulo),
        p.cuerpo ? h("p", { class: "lead" }, p.cuerpo) : null,
        p.dato ? h("div", { class: "dato" }, h("b", {}, p.dato.n, h("small", {}, p.dato.u)), h("span", {}, p.dato.txt)) : null,
        p.lista ? lista(p.lista) : null,
        p.bloques ? h("div", { class: "bloques" }, p.bloques.map((b) => h("div", { class: "bloque" }, h("b", {}, b.k), b.v))) : null,
        p.columnas ? h("div", { class: "cols" }, p.columnas.map((c) => h("div", { class: "col" }, h("h3", {}, c.titulo), lista(c.items)))) : null,
        p.grande ? h("p", { class: "grande" }, p.grande) : null,
        p.chips ? h("div", { class: "pila", style: "gap:8px" }, h("span", { class: "eyebrow" }, p.chipsTitulo), h("div", { class: "chips" }, p.chips.map((c) => h("span", { class: "chip" }, c)))) : null);
      if (!p.img) return pila;
      if (p.imgAlto) return h("div", { class: "dos-col" }, pila, imgZoom(p.img, "foto-alta"));
      return [imgZoom(p.img, "foto-banda"), pila];
    },

    cifras(p) {
      const tiles = p.items.map((c) => {
        const b = h("b", {}, c.pre || "", typeof c.n === "number" ? h("span", { class: "cn" }, "0") : c.n, h("small", {}, c.txt));
        if (typeof c.n === "number") requestAnimationFrame(() => contar(b.querySelector(".cn"), c.n));
        return h("div", { class: "cifra" }, b, h("span", {}, c.nota));
      });
      return [
        p.img ? imgZoom(p.img, "foto-banda") : null,
        h("h2", {}, p.titulo),
        p.texto ? h("p", { class: "lead" }, p.texto) : null,
        h("div", { class: "cifras" }, tiles),
        p.lista ? lista(p.lista) : null,
      ];
    },

    puntos(p, r, upd) {
      if (r.n == null) r.n = 1;
      const n = Math.min(r.n, p.items.length);
      return [
        p.img ? imgZoom(p.img, "foto-banda") : null,
        h("h2", {}, p.titulo),
        p.texto ? h("p", { class: "lead" }, p.texto) : null,
        h("div", { class: "puntos" + (p.grandes ? " grandes" : "") },
          p.items.slice(0, n).map((t) => h("div", { class: "punto" }, h("span", { class: "tri" }), h("span", {}, t))),
          n < p.items.length ? h("button", { class: "oculto-punto", onclick: () => { r.n = n + 1; upd(); } }, `Toca para descubrir el siguiente (${n} de ${p.items.length})`) : null),
        n < p.items.length ? h("button", { class: "btn sec", style: "justify-self:start", onclick: () => { r.n = p.items.length; upd(); } }, "Ver todos") : null,
      ];
    },

    escalera(p) {
      const ol = h("ol", { class: "escalera" }, p.pasos.map((s, i) => h("li", { style: `animation-delay:${i * 0.12}s` }, h("b", {}, s.k), h("span", {}, s.v))));
      const pila = h("div", { class: "pila" }, h("h2", {}, p.titulo), p.texto ? h("p", { class: "lead" }, p.texto) : null, ol);
      return p.img ? h("div", { class: "dos-col" }, pila, imgZoom(p.img, "foto-alta")) : pila;
    },

    voltea(p, r) {
      r.v = r.v || {};
      return [
        h("h2", {}, p.titulo),
        p.ayuda ? h("p", { class: "ayuda" }, p.ayuda) : null,
        p.img ? imgZoom(p.img, "foto-banda") : null,
        h("div", { class: "voltea" }, p.cartas.map((c, j) => {
          const el = h("button", { class: "carta" + (r.v[j] ? " v" : ""), "aria-pressed": r.v[j] ? "true" : "false" },
            h("span", { class: "in" }, h("span", { class: "cara frente" }, c.frente), h("span", { class: "cara reverso" }, c.reverso)));
          el.addEventListener("click", () => { r.v[j] = !r.v[j]; el.classList.toggle("v", r.v[j]); el.setAttribute("aria-pressed", r.v[j]); persiste(); });
          return el;
        })),
      ];
    },

    compara(p) {
      const lado = (x) => h("div", { class: "lado " + (x.tono || "") }, h("h3", {}, x.titulo), lista(x.items));
      return [
        h("h2", {}, p.titulo),
        p.imgs ? h("div", { class: "par-img" }, p.imgs.map((k) => imgZoom(k))) : p.img ? imgZoom(p.img, "foto-banda") : null,
        h("div", { class: "compara" }, lado(p.a), lado(p.b)),
        p.nota ? h("p", { class: "grande" }, p.nota) : null,
      ];
    },

    tabla(p) {
      return [
        h("h2", {}, p.titulo),
        p.nota ? h("p", { class: "nota" }, p.nota) : null,
        h("div", { class: "tabla-caja" + (p.primeraFija ? " fija" : "") },
          h("table", {},
            h("thead", {}, h("tr", {}, p.cols.map((c) => h("th", { scope: "col" }, c)))),
            h("tbody", {}, p.filas.map((f, i) => h("tr", { class: i === p.destacar ? "dest" : null }, f.map((c) => h("td", {}, c))))))),
        h("p", { class: "ayuda" }, "Desliza la tabla hacia los lados para ver todas las columnas."),
      ];
    },

    productos(p, r, upd) {
      const sel = r.sel != null ? p.items[r.sel] : null;
      return [
        h("h2", {}, p.titulo),
        h("p", { class: "ayuda" }, p.ayuda),
        sel ? h("div", { class: "ficha" }, imgZoom(sel.img),
          h("div", {}, h("span", { class: "eyebrow" }, sel.origen), h("h3", {}, sel.nombre), h("span", { class: "tag" }, sel.tag), h("p", {}, sel.txt))) : null,
        h("div", { class: "productos" }, p.items.map((it, j) =>
          h("button", { class: "prod" + (r.sel === j ? " activo" : ""), onclick: () => { r.sel = j; upd(); } },
            im(it.img), h("span", { class: "pi" }, h("b", {}, it.nombre), h("span", {}, it.origen))))),
      ];
    },

    galeria(p) {
      return [
        h("h2", {}, p.titulo),
        p.texto ? h("p", { class: "lead" }, p.texto) : null,
        h("div", { class: "galeria" }, p.imgs.map((g) => h("figure", {}, imgZoom(g.img), h("figcaption", {}, g.pie)))),
        h("p", { class: "ayuda" }, "Toca una imagen para ampliarla."),
      ];
    },

    comic(p) {
      return [
        h("div", { class: "comic" }, imgZoom(p.img)),
        h("h2", {}, p.titulo),
        h("p", { class: "tx" }, p.texto),
      ];
    },

    cita(p) {
      return [
        h("figure", { class: "cita", style: "margin:0" },
          h("q", { class: p.texto.length > 160 ? "larga" : null }, p.texto),
          p.autor ? h("cite", {}, "— " + p.autor) : null),
        p.img ? imgZoom(p.img, "cita-img") : null,
      ];
    },

    logos(p) {
      return [
        h("h2", {}, p.titulo),
        p.grupos.map((g) => h("div", { class: "pila", style: "gap:8px" }, h("span", { class: "eyebrow" }, g.titulo),
          h("div", { class: "logos" }, g.logos.map((k) => h("div", {}, im(k, null, k.replace(/^(prov|cert)_/, "").replace(/_/g, " "))))))),
        p.nota ? h("p", { class: "grande" }, p.nota) : null,
      ];
    },

    sucursales(p) {
      return [
        h("h2", {}, p.titulo),
        h("div", { class: "sucs" }, p.items.map((s) => h("div", { class: "suc" }, h("b", {}, s.k), h("span", {}, s.v)))),
        h("div", { class: "bloque" }, h("b", {}, "Horario"), p.horario),
        h("p", { class: "ayuda" }, p.contacto),
      ];
    },

    cocina(p, r, upd) {
      const z = p.zonas.find((x) => x.id === r.z);
      const puertas = (y, alto, n, relleno, extra) => rango(n).map((k) => {
        const w = (360 - (n - 1) * 4) / n, x = 20 + k * (w + 4);
        return `<rect x="${x}" y="${y}" width="${w}" height="${alto}" rx="3" fill="${relleno}" stroke="${extra}" stroke-width="1.2"/>` +
          `<rect x="${x + w / 2 - 14}" y="${y + (y < 100 ? alto - 12 : 8)}" width="28" height="3" rx="1.5" fill="#55606a"/>`;
      }).join("");
      const svg = `<svg viewBox="0 0 400 300" role="img" aria-label="Cocina: parte alta y parte baja">
        <defs>
          <linearGradient id="gloss" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#eef2f5"/><stop offset="1" stop-color="#d5dde3"/></linearGradient>
          <pattern id="veta" width="40" height="100" patternUnits="userSpaceOnUse"><rect width="40" height="100" fill="#c99b62"/><path d="M0 12 Q20 6 40 14 M0 38 Q20 30 40 40 M0 66 Q20 58 40 68 M0 88 Q20 84 40 90" stroke="#b07f49" stroke-width="2" fill="none"/></pattern>
          <clipPath id="clipAlta"><rect x="20" y="24" width="360" height="86"/></clipPath>
        </defs>
        <rect x="0" y="0" width="400" height="300" fill="#dfe7ec"/>
        <rect x="20" y="118" width="360" height="52" fill="#f6f8f9"/>
        <path d="M20 131h360M20 144h360M20 157h360" stroke="#e1e7eb"/>
        <g class="zona${r.z === "alta" ? " on" : ""}" data-z="alta" tabindex="0" role="button" aria-label="Parte alta">
          ${puertas(24, 86, 3, "url(#gloss)", "#b9c4cc")}
          <g clip-path="url(#clipAlta)"><rect class="brillo" x="0" y="10" width="40" height="120" fill="#ffffff" opacity=".7" transform="skewX(-20)"/></g>
        </g>
        <rect x="14" y="170" width="372" height="10" rx="2" fill="#4c565f"/>
        <g class="zona${r.z === "baja" ? " on" : ""}" data-z="baja" tabindex="0" role="button" aria-label="Parte baja">
          ${puertas(184, 100, 4, "url(#veta)", "#9a6c3c")}
        </g>
        <rect x="0" y="286" width="400" height="14" fill="#6d7780"/>
      </svg>`;
      const fig = h("div", { html: svg });
      fig.querySelectorAll(".zona").forEach((g) => {
        const act = () => { r.z = g.dataset.z; upd(); };
        g.addEventListener("click", act);
        g.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); act(); } });
      });
      return [
        h("h2", {}, p.titulo),
        h("p", { class: "ayuda" }, p.texto),
        h("div", { class: "cocina" }, fig,
          h("div", { class: "zona-info", "aria-live": "polite" },
            z ? [h("span", { class: "eyebrow" }, z.k), h("b", {}, z.v), h("p", {}, z.por)]
              : h("p", { class: "ayuda" }, "Toca la parte alta o la parte baja del mueble."))),
      ];
    },

    barras(p) {
      const max = Math.max(...p.items.map((x) => x.v));
      return [
        h("h2", {}, p.titulo),
        h("div", { class: "barras" }, p.items.map((x, i) =>
          h("div", { class: "barra" }, h("span", {}, x.k),
            h("span", { class: "riel2" }, h("i", { style: `width:${Math.max(1, (x.v / max) * 100)}%;animation-delay:${i * 0.1}s` })),
            h("span", { class: "v" }, x.nota || `${x.v} ${p.unidad}`)))),
        h("p", { class: "ayuda" }, "Barras a escala: el máximo es 100 usos."),
      ];
    },

    dona(p) {
      const R0 = 70, L = 2 * Math.PI * R0;
      const colores = ["var(--verde-ok)", "var(--azul)", "#e6a23c"];
      let acum = 0;
      const segs = p.partes.map((x, i) => {
        const largo = (x.v / 100) * L, off = acum;
        acum += largo;
        return `<circle class="seg" cx="90" cy="90" r="${R0}" fill="none" style="stroke:${colores[i]}" stroke-width="26" stroke-dasharray="${largo - 2} ${L}" stroke-dashoffset="${L}" data-off="${-off}" transform="rotate(-90 90 90)"/>`;
      }).join("");
      const fig = h("div", { html: `<svg viewBox="0 0 180 180" role="img" aria-label="${p.titulo}"><circle cx="90" cy="90" r="${R0}" fill="none" style="stroke:var(--sup-2)" stroke-width="26"/>${segs}<text x="90" y="86" text-anchor="middle" style="fill:var(--tinta)" font-family="Exo 2, sans-serif" font-style="italic" font-weight="900" font-size="30">50%</text><text x="90" y="106" text-anchor="middle" style="fill:var(--tenue)" font-family="Montserrat, sans-serif" font-size="10" font-weight="600">actitud</text></svg>` });
      requestAnimationFrame(() => requestAnimationFrame(() => fig.querySelectorAll(".seg").forEach((c) => c.setAttribute("stroke-dashoffset", c.dataset.off))));
      return [
        h("h2", {}, p.titulo),
        h("div", { class: "dona" }, fig,
          h("div", { class: "leyenda" }, p.partes.map((x, i) => h("div", {}, h("i", { style: `background:${colores[i]}` }), h("span", {}, x.k), h("b", {}, x.v + "%"))))),
        p.nota ? h("p", { class: "nota" }, p.nota) : null,
      ];
    },

    nube(p, r) {
      r.on = r.on || {};
      return [
        h("h2", {}, p.titulo),
        h("p", { class: "lead" }, p.texto),
        p.grupos.map((g, gi) => h("div", { class: "pila", style: "gap:8px" }, h("span", { class: "eyebrow" }, g.titulo),
          h("div", { class: "nube" }, g.items.map((w) => {
            const b = h("button", { class: "palabra" + (gi ? " conf" : "") + (r.on[w] ? " on" : ""), "aria-pressed": r.on[w] ? "true" : "false" }, w);
            b.addEventListener("click", () => { r.on[w] = !r.on[w]; b.classList.toggle("on", r.on[w]); b.setAttribute("aria-pressed", r.on[w]); persiste(); });
            return b;
          })))),
        p.img ? imgZoom(p.img, "foto-banda") : null,
      ];
    },

    respira(p, r, upd) {
      const circ = h("div", { class: "circulo", "aria-live": "polite" }, r.listo ? "Listo" : "Respira");
      const btn = h("button", { class: "btn verde" }, r.listo ? "Repetir" : "Empezar (10 s)");
      btn.addEventListener("click", () => {
        btn.disabled = true;
        const fases = [["Inhala", true, 4000], ["Sostén", true, 2000], ["Exhala", false, 4000]];
        let k = 0;
        (function sigFase() {
          if (!circ.isConnected) return;
          if (k === fases.length) { r.listo = true; upd(); return; }
          const [t, grande, ms] = fases[k++];
          circ.textContent = t;
          circ.classList.toggle("in", grande);
          setTimeout(sigFase, ms);
        })();
      });
      return [
        h("h2", {}, p.titulo),
        h("p", { class: "lead" }, p.texto),
        h("div", { class: "respira" }, circ, btn),
        r.listo ? h("div", { class: "pila" }, h("span", { class: "eyebrow" }, "¿Qué emoción observaste? Ponle nombre"),
          h("div", { class: "chips" }, p.emociones.map((e) => h("button", { class: "palabra" + (r.e === e ? " on" : ""), onclick: () => { r.e = e; upd(); } }, e))),
          r.e ? h("p", { class: "grande" }, `${r.e}. Nombrar la emoción ya es tomar distancia de ella.`) : null) : null,
      ];
    },

    ranking(p, r, upd) {
      const orden = (S.ranking && S.ranking.length ? S.ranking : r.orden) || [];
      r.orden = orden;
      const resto = p.items.filter((x) => !orden.includes(x));
      const pon = (x) => { r.orden = [...orden, x]; if (r.orden.length === p.items.length) { S.ranking = r.orden; guarda(); } upd(); };
      return [
        h("h2", {}, p.titulo),
        h("p", { class: "lead" }, p.texto),
        h("ol", { class: "ordenados" }, orden.map((x) => h("li", {}, x)), resto.map(() => h("li", { class: "hueco" }, "…"))),
        resto.length ? h("div", { class: "rank-items" }, resto.map((x) => h("button", { class: "ficha-r", onclick: () => pon(x) }, x)))
          : h("button", { class: "btn sec", style: "justify-self:start", onclick: () => { S.ranking = []; r.orden = []; guarda(); upd(); } }, "Volver a ordenar"),
      ];
    },

    reflexion(p) {
      let t;
      const ta = h("textarea", { id: "reflexion", placeholder: "Por ejemplo: en mi siguiente llamada voy a…", maxlength: "600" });
      ta.value = S.reflexion || "";
      const nota = h("p", { class: "ayuda", "aria-live": "polite" }, S.reflexion ? "Guardado en este dispositivo." : "Se guarda solo en este dispositivo.");
      ta.addEventListener("input", () => { clearTimeout(t); t = setTimeout(() => { S.reflexion = ta.value; guarda(); nota.textContent = "Guardado en este dispositivo."; }, 400); });
      return [h("h2", {}, p.titulo), h("p", { class: "lead" }, p.texto), h("label", { for: "reflexion", class: "eyebrow" }, "Mi compromiso"), ta, nota];
    },

    pregunta(p, r, upd) {
      return pregunta(p.q, p.ops, p.ok, p.exp, r, upd, p.rino || C.rinos.piensa);
    },

    vf(p, r, upd) {
      const ops = ["Verdadero", "Falso"];
      const ok = p.ok ? 0 : 1;
      const el = pregunta(p.q, ops, ok, p.exp, r, upd, C.rinos.piensa, true);
      return el;
    },

    gesto(p, r, upd) {
      const total = P.pasos.filter((x) => x.t === "gesto").length;
      const n = P.pasos.slice(0, P.i + 1).filter((x) => x.t === "gesto").length;
      return [
        h("span", { class: "eyebrow" }, `Señal ${n} de ${total}`),
        pregunta(p.g.gesto, p.ops, p.ok, null, r, upd, "rino_lupa", false, "¿Qué significa este gesto?"),
        r.hecho ? imgZoom(p.g.img, "gesto-img") : null,
      ];
    },

    relaciona(p, r, upd) {
      r.hechos = r.hechos || [];
      r.err = r.err || 0;
      r.ordenB = r.ordenB || baraja(rango(p.pares.length));
      const intenta = () => {
        if (r.selA == null || r.selB == null) return upd();
        if (r.selA === r.selB) r.hechos.push(r.selA);
        else { r.err++; r.shake = [r.selA, r.selB]; }
        r.selA = r.selB = null;
        if (r.hechos.length === p.pares.length) { r.hecho = true; r.ok = r.err === 0; }
        upd();
      };
      const num = (i) => r.hechos.indexOf(i) + 1;
      const colA = h("div", { class: "colr" }, p.pares.map((x, i) => {
        const hecha = r.hechos.includes(i);
        return h("button", { class: "ficha-r" + (hecha ? " hecha" : r.selA === i ? " sel" : ""), disabled: hecha, "data-a": i, onclick: () => { r.selA = i; intenta(); } },
          hecha ? h("span", { class: "par-n" }, num(i)) : null, x.a);
      }));
      const colB = h("div", { class: "colr" }, r.ordenB.map((i) => {
        const hecha = r.hechos.includes(i);
        return h("button", { class: "ficha-r" + (hecha ? " hecha" : r.selB === i ? " sel" : ""), disabled: hecha, "data-b": i, onclick: () => { r.selB = i; intenta(); } },
          hecha ? h("span", { class: "par-n" }, num(i)) : null, p.pares[i].b);
      }));
      if (r.shake) {
        const [a, b] = r.shake; r.shake = null;
        requestAnimationFrame(() => { sacude(colA.querySelector(`[data-a="${a}"]`)); sacude(colB.querySelector(`[data-b="${b}"]`)); });
      }
      return [
        h("h2", {}, p.titulo || "Relaciona"),
        p.img ? imgZoom(p.img, "foto-banda") : null,
        h("p", { class: "ayuda" }, "Toca un elemento de cada columna para formar la pareja."),
        h("div", { class: "relaciona" }, colA, colB),
        r.hecho ? retro(r.ok, r.ok ? "Todas las parejas a la primera." : `Lo completaste con ${r.err} ${r.err === 1 ? "error" : "errores"}.`, r.ok ? null : "¡Completado!") : null,
      ];
    },

    ordena(p, r, upd) {
      r.orden = r.orden || [];
      r.err = r.err || 0;
      r.pool = r.pool || baraja(rango(p.items.length));
      const pool = h("div", { class: "pool" }, r.pool.filter((i) => !r.orden.includes(i)).map((i) =>
        h("button", { class: "ficha-r", "data-i": i, onclick: () => {
          if (i === r.orden.length) r.orden.push(i);
          else { r.err++; r.shake = i; }
          if (r.orden.length === p.items.length) { r.hecho = true; r.ok = r.err === 0; }
          upd();
        } }, p.items[i])));
      if (r.shake != null) { const s = r.shake; r.shake = null; requestAnimationFrame(() => sacude(pool.querySelector(`[data-i="${s}"]`))); }
      return [
        h("h2", {}, p.titulo),
        p.img ? imgZoom(p.img, "foto-banda") : null,
        p.sigla ? h("div", { class: "sigla", "aria-hidden": "true" }, p.sigla.split("").map((l, i) => h("span", { class: i < r.orden.length ? "on" : null }, l))) : null,
        h("p", { class: "ayuda" }, p.ayuda),
        h("div", { class: "ordena" },
          h("ol", { class: "ordenados" }, r.orden.map((i) => h("li", {}, p.items[i])), rango(p.items.length - r.orden.length).map(() => h("li", { class: "hueco" }, "¿Qué sigue?"))),
          pool),
        r.hecho ? retro(r.ok, r.ok ? "Orden perfecto a la primera." : `Lo completaste con ${r.err} ${r.err === 1 ? "error" : "errores"}.`, r.ok ? null : "¡Completado!") : null,
      ];
    },

    clasifica(p, r, upd) {
      r.dest = r.dest || {};
      r.err = r.err || 0;
      r.pool = r.pool || baraja(rango(p.items.length));
      const libres = r.pool.filter((i) => r.dest[i] == null);
      const pool = h("div", { class: "pool" }, libres.map((i) =>
        h("button", { class: "ficha-r" + (r.sel === i ? " sel" : ""), "data-i": i, "aria-pressed": r.sel === i ? "true" : "false", onclick: () => { r.sel = i; upd(); } }, p.items[i].t)));
      const grupos = h("div", { class: "grupos" }, p.grupos.map((g, gi) =>
        h("button", { class: "grupo" + (r.sel != null ? " listo" : ""), onclick: () => {
          if (r.sel == null) return;
          if (p.items[r.sel].g === gi) r.dest[r.sel] = gi;
          else { r.err++; r.shake = r.sel; }
          r.sel = null;
          if (Object.keys(r.dest).length === p.items.length) { r.hecho = true; r.ok = r.err === 0; }
          upd();
        } }, h("b", {}, g),
          Object.keys(r.dest).filter((i) => r.dest[i] === gi).map((i) => h("span", { class: "ficha-r hecha" }, p.items[i].t)))));
      if (r.shake != null) { const s = r.shake; r.shake = null; requestAnimationFrame(() => sacude(pool.querySelector(`[data-i="${s}"]`))); }
      return [
        h("h2", {}, p.titulo),
        p.img ? imgZoom(p.img, "foto-banda") : null,
        h("p", { class: "ayuda" }, p.ayuda),
        libres.length ? pool : null,
        grupos,
        r.hecho ? retro(r.ok, r.ok ? "Todo en su lugar a la primera." : `Lo completaste con ${r.err} ${r.err === 1 ? "error" : "errores"}.`, r.ok ? null : "¡Completado!") : null,
      ];
    },

    tarjetero(p, r, upd) {
      r.k = r.k || 0;
      const g = C.gestos[r.k];
      const ir = (d) => { r.k = (r.k + d + C.gestos.length) % C.gestos.length; upd(); };
      const tj = h("div", { class: "tj" }, imgZoom(g.img),
        h("div", {}, h("span", { class: "eyebrow" }, `Señal ${r.k + 1} de ${C.gestos.length}`), h("h3", {}, g.gesto), h("p", { class: "lead" }, g.sig)));
      let x0 = null;
      tj.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; }, { passive: true });
      tj.addEventListener("touchend", (e) => { if (x0 == null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 50) ir(dx < 0 ? 1 : -1); x0 = null; });
      return [
        h("h2", {}, p.titulo),
        h("p", { class: "ayuda" }, p.ayuda),
        h("div", { class: "tarjetero" }, tj,
          h("div", { class: "tj-nav" },
            h("button", { class: "icono", "aria-label": "Señal anterior", onclick: () => ir(-1), html: ICON.izq }),
            h("span", { class: "num" }, `${r.k + 1} / ${C.gestos.length}`),
            h("button", { class: "icono", "aria-label": "Señal siguiente", onclick: () => ir(1), html: ICON.der }))),
      ];
    },
  };

  function pregunta(q, ops, ok, exp, r, upd, rino, esVF, eyebrow) {
    const letras = "ABCD";
    return h("div", { class: "pregunta" },
      h("div", { class: "q" }, h("div", {}, eyebrow ? h("span", { class: "eyebrow" }, eyebrow) : null, h("h2", { style: eyebrow ? "margin-top:6px" : null }, q)), im(rino, "")),
      h("div", { class: esVF ? "vf" : "ops" }, ops.map((o, j) => {
        let cls = "op";
        if (r.hecho && j === ok) cls += " bien";
        else if (r.hecho && j === r.sel) cls += " mal";
        return h("button", { class: cls, disabled: !!r.hecho, onclick: () => { r.sel = j; r.hecho = true; r.ok = j === ok; upd(); } },
          esVF ? null : h("span", { class: "letra" }, letras[j]), o);
      })),
      r.hecho ? retro(r.ok, exp || (r.ok ? null : `La respuesta es: ${ops[ok]}.`)) : null);
  }

  /* ---------- constancia ---------- */
  function carga(k) {
    return new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src(k); });
  }
  function envuelve(ctx, texto, x, y, ancho, alto) {
    const palabras = texto.split(" ");
    let linea = "";
    for (const w of palabras) {
      const prueba = linea ? linea + " " + w : w;
      if (ctx.measureText(prueba).width > ancho && linea) { ctx.fillText(linea, x, y); linea = w; y += alto; } else linea = prueba;
    }
    ctx.fillText(linea, x, y);
    return y;
  }
  async function dibujaConstancia() {
    try { await Promise.all(['italic 900 40px "Exo 2"', 'italic 800 40px "Exo 2"', '600 20px "Montserrat"', '400 20px "Montserrat"'].map((f) => document.fonts.load(f))); } catch (e) { /* fuentes del sistema */ }
    const [logo, rino] = await Promise.all([carga("logo_color"), carga("rino_trofeo")]);
    const W = 1600, H = 1131;
    const cv = document.createElement("canvas");
    cv.width = W; cv.height = H;
    const c = cv.getContext("2d");
    c.fillStyle = "#ffffff"; c.fillRect(0, 0, W, H);
    c.fillStyle = "#e1fae1"; c.beginPath(); c.moveTo(-120, H - 110); c.lineTo(330, 470); c.lineTo(780, H - 110); c.closePath(); c.fill();
    c.fillStyle = "#0079c1"; c.fillRect(0, H - 110, W, 110);
    c.fillStyle = "#ffffff"; c.font = 'italic 800 40px "Exo 2", sans-serif'; c.textAlign = "right"; c.fillText("¡Tenemos la madera!", W - 80, H - 42);
    c.textAlign = "left"; c.font = '500 24px "Montserrat", sans-serif'; c.fillText("www.triplayymaderas.com", 80, H - 46);
    if (logo) { const w = 330, hh = (logo.height / logo.width) * w; c.drawImage(logo, W - w - 80, 70, w, hh); }
    c.fillStyle = "#0079c1"; c.font = 'italic 900 112px "Exo 2", sans-serif'; c.fillText("Constancia", 80, 175);
    c.font = 'italic 800 46px "Exo 2", sans-serif';
    const tw = c.measureText("de inducción").width;
    c.beginPath(); c.roundRect ? c.roundRect(80, 205, tw + 56, 72, 36) : c.rect(80, 205, tw + 56, 72); c.fill();
    c.fillStyle = "#ffffff"; c.fillText("de inducción", 108, 257);
    c.fillStyle = "#566876"; c.font = '600 24px "Montserrat", sans-serif'; c.fillText("SE OTORGA A", 80, 380);
    c.fillStyle = "#10202c"; let tam = 84; c.font = `italic 800 ${tam}px "Exo 2", sans-serif`;
    while (c.measureText(S.nombre).width > 1000 && tam > 44) { tam -= 4; c.font = `italic 800 ${tam}px "Exo 2", sans-serif`; }
    c.fillText(S.nombre, 80, 470);
    c.fillStyle = "#00d200"; c.fillRect(80, 498, 220, 8);
    c.fillStyle = "#10202c"; c.font = '400 28px "Montserrat", sans-serif';
    const ex = S.examen || {};
    const y = envuelve(c, `por completar el Curso de Inducción TMM 2026: ${MODS.length} módulos de empresa, producto y ventas, con ${ex.pct}% en el examen final.`, 80, 570, 960, 42);
    c.fillStyle = "#566876"; c.font = '600 24px "Montserrat", sans-serif';
    const fecha = new Date(ex.fechaAprobado || ex.fecha || Date.now()).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });
    c.fillText((S.area ? S.area + " · " : "") + fecha, 80, y + 70);
    if (rino) { const hh = 470, w = (rino.width / rino.height) * hh; c.drawImage(rino, W - w - 120, H - 110 - hh + 10, w, hh); }
    return cv;
  }

  async function abreConstancia() {
    if (!(S.examen && S.examen.aprobado)) return;
    cierraPlayer(true);
    P = { tipo: "cert", pasos: [{}], i: 0, resp: {} };
    const cuerpo = h("div", { class: "p-cuerpo" });
    playerEl = h("div", { class: "player", role: "dialog", "aria-modal": "true", "aria-label": "Constancia" },
      h("div", { class: "p-top" }, h("div", { class: "fila" },
        h("button", { class: "icono", "aria-label": "Cerrar", onclick: () => cierraPlayer(), html: ICON.x }),
        h("span", { class: "titulo" }, "Tu constancia"))),
      cuerpo, h("div", { class: "p-pie", hidden: true }));
    playerEl._ = {};
    document.body.append(playerEl);
    document.body.style.overflow = "hidden";
    cuerpo.append(h("div", { class: "paso" }, h("p", { class: "ayuda" }, "Preparando tu constancia…")));
    const cv = await dibujaConstancia();
    const url = cv.toDataURL("image/png");
    const estado = h("p", { class: "ayuda", "aria-live": "polite" });
    const btn = h("button", { class: "btn verde" }, "Descargar PNG");
    const dl = EN_CLAUDE ? await window.claude.use("downloads").catch(() => null) : null;
    if (!dl && EN_CLAUDE) { btn.hidden = true; estado.textContent = "Para guardarla, mantén presionada la imagen (en celular) o haz clic derecho y elige Guardar imagen."; }
    btn.addEventListener("click", () => {
      cv.toBlob(async (blob) => {
        const nombre = `Constancia induccion TMM - ${S.nombre}.png`;
        if (!dl) {
          /* App instalada: en celular se comparte o guarda en Fotos; en compu se descarga. */
          const archivo = new File([blob], nombre, { type: "image/png" });
          if (navigator.canShare && navigator.canShare({ files: [archivo] })) {
            try { await navigator.share({ files: [archivo], title: "Constancia de inducción TMM" }); estado.textContent = "Listo."; return; } catch (e) { if (e && e.name === "AbortError") return; }
          }
          const a = h("a", { href: URL.createObjectURL(blob), download: nombre });
          document.body.append(a); a.click(); a.remove();
          estado.textContent = "Constancia descargada.";
          return;
        }
        try {
          await dl.save({ filename: `Constancia induccion TMM - ${S.nombre}.png`, data: blob });
          estado.textContent = "Constancia guardada.";
        } catch (e) {
          estado.textContent = e && e.code === "declined" ? "Descarga cancelada." : "No se pudo descargar aquí. Mantén presionada la imagen para guardarla.";
        }
      }, "image/png");
    });
    if (MOVIMIENTO) confeti();
    cuerpo.replaceChildren(h("div", { class: "paso", style: "justify-items:center;text-align:center" },
      h("h2", {}, `¡Felicidades, ${S.nombre.split(" ")[0]}!`),
      h("img", { src: url, class: "cert-img", alt: `Constancia de inducción TMM a nombre de ${S.nombre}` }),
      h("div", { class: "acciones", style: "display:flex;gap:10px;flex-wrap:wrap;justify-content:center" }, btn,
        h("button", { class: "btn sec", onclick: () => cierraPlayer() }, "Volver a la ruta")),
      estado));
  }

  pintaInicio();
})();
