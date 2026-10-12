/* Service worker de la app de inducción TMM (versión pública).
   - Guarda la app para usarla sin internet.
   - El contenido viaja cifrado (*.enc): aquí se descifra con la llave que el celular
     guardó al poner la clave (IndexedDB "tmm-acceso"). Sin llave responde 401. */
const CACHE = "induccion-tmm-7feb806115";
const ARCHIVOS = ["./", "index.html", "acceso.js", "llave.json", "acceso-logo.webp", "acceso-rino.webp", "manifest.webmanifest", "icon-192.png", "icon-512.png", "apple-touch-icon.png", "vendor/three.min.js", "content.js.enc", "juego.js.enc", "gran-tala.js.enc", "gran-tala-3d.js.enc", "app.js.enc", "img/almacen.webp.enc", "img/bodega.webp.enc", "img/bosque.webp.enc", "img/c_argentina.webp.enc", "img/c_asia.webp.enc", "img/c_brasil.webp.enc", "img/c_durax.webp.enc", "img/c_leonera.webp.enc", "img/camion.webp.enc", "img/carga.webp.enc", "img/cert_canainma.webp.enc", "img/cert_esr.webp.enc", "img/cert_hecho_mexico.webp.enc", "img/cert_imexfor.webp.enc", "img/chapas_a.webp.enc", "img/chapas_b.webp.enc", "img/e_birch.webp.enc", "img/e_birch_ficha.webp.enc", "img/e_mdo.webp.enc", "img/e_mdo_ficha.webp.enc", "img/e_tulsa.webp.enc", "img/esr_trofeo.webp.enc", "img/f_albasia1.webp.enc", "img/f_albasia2.webp.enc", "img/f_arbol.webp.enc", "img/f_arbol2.webp.enc", "img/f_dif1.webp.enc", "img/f_dif2.webp.enc", "img/f_dif3.webp.enc", "img/f_fancy1.webp.enc", "img/f_fancy2.webp.enc", "img/f_liston1.webp.enc", "img/f_liston2.webp.enc", "img/h68.webp.enc", "img/h69.webp.enc", "img/h70.webp.enc", "img/h71.webp.enc", "img/h72.webp.enc", "img/h73.webp.enc", "img/h74.webp.enc", "img/h75.webp.enc", "img/h76.webp.enc", "img/h77.webp.enc", "img/h78.webp.enc", "img/h79.webp.enc", "img/ie_corazones.webp.enc", "img/ie_espejo.webp.enc", "img/ie_herramientas.webp.enc", "img/ie_nutridor.webp.enc", "img/ie_potenciales.webp.enc", "img/ie_vampiros.webp.enc", "img/logo_color.webp.enc", "img/logo_white.webp.enc", "img/mdf_chapa.webp.enc", "img/mdf_chapa_portada.webp.enc", "img/mdf_crudo.webp.enc", "img/mdf_desventajas.webp.enc", "img/mdf_mr.webp.enc", "img/mdf_muebles.webp.enc", "img/mdf_origen.webp.enc", "img/mdf_origenes.webp.enc", "img/mdf_que_es.webp.enc", "img/mdf_tabla.webp.enc", "img/mdf_tipos_chapa.webp.enc", "img/mdf_tmm.webp.enc", "img/mdf_ventajas.webp.enc", "img/mdf_vs.webp.enc", "img/nv123.webp.enc", "img/nv124.webp.enc", "img/nv125.webp.enc", "img/nv126.webp.enc", "img/nv127.webp.enc", "img/nv128.webp.enc", "img/nv129.webp.enc", "img/nv130.webp.enc", "img/nv131.webp.enc", "img/nv132.webp.enc", "img/nv133.webp.enc", "img/nv134.webp.enc", "img/nv135.webp.enc", "img/nv136.webp.enc", "img/nv137.webp.enc", "img/nv138.webp.enc", "img/nv139.webp.enc", "img/nv140.webp.enc", "img/nv141.webp.enc", "img/nv142.webp.enc", "img/nv143.webp.enc", "img/nv144.webp.enc", "img/nv145.webp.enc", "img/nv146.webp.enc", "img/nv147.webp.enc", "img/p_asia.webp.enc", "img/p_cmpc.webp.enc", "img/p_eagon.webp.enc", "img/p_leonera.webp.enc", "img/p_uruply_bc.webp.enc", "img/p_uruply_bcx.webp.enc", "img/pnl_confianza.webp.enc", "img/pnl_hoy.webp.enc", "img/pnl_mental.webp.enc", "img/pnl_modelo.webp.enc", "img/pnl_palabras.webp.enc", "img/pnl_portada.webp.enc", "img/pnl_reencuadre.webp.enc", "img/pnl_senales.webp.enc", "img/pnl_vak.webp.enc", "img/prov_arauco.webp.enc", "img/prov_eagon.webp.enc", "img/prov_lumin.webp.enc", "img/prov_segezha.webp.enc", "img/puerto.webp.enc", "img/rino_corazon.webp.enc", "img/rino_fiesta.webp.enc", "img/rino_heroe.webp.enc", "img/rino_lupa.webp.enc", "img/rino_maestro.webp.enc", "img/rino_megafono.webp.enc", "img/rino_oops.webp.enc", "img/rino_pensando.webp.enc", "img/rino_saludo.webp.enc", "img/rino_triplay.webp.enc", "img/rino_trofeo.webp.enc", "img/taller.webp.enc", "img/u_altobrillo.webp.enc", "img/u_apple.webp.enc", "img/u_caja.webp.enc", "img/u_cliente.webp.enc", "img/u_cocina.webp.enc", "img/u_hg.webp.enc", "img/u_logo.webp.enc", "img/u_marcas.webp.enc", "img/u_marmol.webp.enc", "img/u_matt.webp.enc", "img/u_matt2.webp.enc", "img/u_matt3.webp.enc", "img/u_melamina.webp.enc", "img/u_mercado.webp.enc", "img/u_modelos.webp.enc", "img/u_pvc.webp.enc", "img/u_pvc_cat.webp.enc", "img/u_wpc.webp.enc", "img/u_wpc2.webp.enc", "img/u_wpc_cat.webp.enc", "img/u_wpc_muro.webp.enc"];
const CIFRADOS = new Set(["content.js", "juego.js", "gran-tala.js", "gran-tala-3d.js", "app.js", "img/almacen.webp", "img/bodega.webp", "img/bosque.webp", "img/c_argentina.webp", "img/c_asia.webp", "img/c_brasil.webp", "img/c_durax.webp", "img/c_leonera.webp", "img/camion.webp", "img/carga.webp", "img/cert_canainma.webp", "img/cert_esr.webp", "img/cert_hecho_mexico.webp", "img/cert_imexfor.webp", "img/chapas_a.webp", "img/chapas_b.webp", "img/e_birch.webp", "img/e_birch_ficha.webp", "img/e_mdo.webp", "img/e_mdo_ficha.webp", "img/e_tulsa.webp", "img/esr_trofeo.webp", "img/f_albasia1.webp", "img/f_albasia2.webp", "img/f_arbol.webp", "img/f_arbol2.webp", "img/f_dif1.webp", "img/f_dif2.webp", "img/f_dif3.webp", "img/f_fancy1.webp", "img/f_fancy2.webp", "img/f_liston1.webp", "img/f_liston2.webp", "img/h68.webp", "img/h69.webp", "img/h70.webp", "img/h71.webp", "img/h72.webp", "img/h73.webp", "img/h74.webp", "img/h75.webp", "img/h76.webp", "img/h77.webp", "img/h78.webp", "img/h79.webp", "img/ie_corazones.webp", "img/ie_espejo.webp", "img/ie_herramientas.webp", "img/ie_nutridor.webp", "img/ie_potenciales.webp", "img/ie_vampiros.webp", "img/logo_color.webp", "img/logo_white.webp", "img/mdf_chapa.webp", "img/mdf_chapa_portada.webp", "img/mdf_crudo.webp", "img/mdf_desventajas.webp", "img/mdf_mr.webp", "img/mdf_muebles.webp", "img/mdf_origen.webp", "img/mdf_origenes.webp", "img/mdf_que_es.webp", "img/mdf_tabla.webp", "img/mdf_tipos_chapa.webp", "img/mdf_tmm.webp", "img/mdf_ventajas.webp", "img/mdf_vs.webp", "img/nv123.webp", "img/nv124.webp", "img/nv125.webp", "img/nv126.webp", "img/nv127.webp", "img/nv128.webp", "img/nv129.webp", "img/nv130.webp", "img/nv131.webp", "img/nv132.webp", "img/nv133.webp", "img/nv134.webp", "img/nv135.webp", "img/nv136.webp", "img/nv137.webp", "img/nv138.webp", "img/nv139.webp", "img/nv140.webp", "img/nv141.webp", "img/nv142.webp", "img/nv143.webp", "img/nv144.webp", "img/nv145.webp", "img/nv146.webp", "img/nv147.webp", "img/p_asia.webp", "img/p_cmpc.webp", "img/p_eagon.webp", "img/p_leonera.webp", "img/p_uruply_bc.webp", "img/p_uruply_bcx.webp", "img/pnl_confianza.webp", "img/pnl_hoy.webp", "img/pnl_mental.webp", "img/pnl_modelo.webp", "img/pnl_palabras.webp", "img/pnl_portada.webp", "img/pnl_reencuadre.webp", "img/pnl_senales.webp", "img/pnl_vak.webp", "img/prov_arauco.webp", "img/prov_eagon.webp", "img/prov_lumin.webp", "img/prov_segezha.webp", "img/puerto.webp", "img/rino_corazon.webp", "img/rino_fiesta.webp", "img/rino_heroe.webp", "img/rino_lupa.webp", "img/rino_maestro.webp", "img/rino_megafono.webp", "img/rino_oops.webp", "img/rino_pensando.webp", "img/rino_saludo.webp", "img/rino_triplay.webp", "img/rino_trofeo.webp", "img/taller.webp", "img/u_altobrillo.webp", "img/u_apple.webp", "img/u_caja.webp", "img/u_cliente.webp", "img/u_cocina.webp", "img/u_hg.webp", "img/u_logo.webp", "img/u_marcas.webp", "img/u_marmol.webp", "img/u_matt.webp", "img/u_matt2.webp", "img/u_matt3.webp", "img/u_melamina.webp", "img/u_mercado.webp", "img/u_modelos.webp", "img/u_pvc.webp", "img/u_pvc_cat.webp", "img/u_wpc.webp", "img/u_wpc2.webp", "img/u_wpc_cat.webp", "img/u_wpc_muro.webp"]);
const TIPOS = { js: "text/javascript; charset=utf-8", webp: "image/webp", png: "image/png", jpg: "image/jpeg" };

/* Lo esencial se instala de golpe; imágenes y librerías van una por una y si alguna falla
   no tumba la actualización (en iPhone con datos, un solo archivo fallido la cancelaba). */
const pesado = (f) => f.startsWith("img/") || f.startsWith("vendor/");
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) =>
    c.addAll(ARCHIVOS.filter((f) => !pesado(f))).then(() => Promise.allSettled(ARCHIVOS.filter(pesado).map((f) => c.add(f))))
  ).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

/* --- Llave --- */
let llave = null;
function leerLlave() {
  return new Promise((res) => {
    const r = indexedDB.open("tmm-acceso", 1);
    r.onupgradeneeded = () => r.result.createObjectStore("llaves");
    r.onerror = () => res(null);
    r.onsuccess = () => {
      try {
        const q = r.result.transaction("llaves", "readonly").objectStore("llaves").get("llave");
        q.onsuccess = () => res(q.result || null);
        q.onerror = () => res(null);
      } catch (e) { res(null); }
    };
  });
}
async function obtenerLlave(fresca) {
  if (llave && !fresca) return llave;
  const bytes = await leerLlave();
  llave = bytes ? await crypto.subtle.importKey("raw", bytes, "AES-GCM", false, ["decrypt"]) : null;
  return llave;
}

/* --- Red y caché --- */
const base = () => new URL(self.registration.scope).pathname;
function rel(url) { const p = url.pathname; return p.startsWith(base()) ? p.slice(base().length) : p.replace(/^\//, ""); }
const delCache = (ruta) => caches.match(ruta, { ignoreSearch: true });
function deRed(ruta, guardarComo) {
  return fetch(ruta, { cache: "no-cache" }).then((res) => {
    if (res.ok) { const copia = res.clone(); caches.open(CACHE).then((c) => c.put(guardarComo || ruta, copia)); }
    return res;
  });
}
/* Página y código: de internet primero (así una versión nueva se ve luego luego); sin señal o
   si tarda más de 4 s, del caché. Imágenes y librerías: del caché primero (no cambian). */
function obtener(ruta, guardarComo) {
  if (pesado(ruta)) return delCache(ruta).then((r) => r || fetch(ruta));
  const red = deRed(ruta, guardarComo);
  return Promise.race([red, new Promise((_, no) => setTimeout(no, 4000))])
    .then((r) => (r.ok ? r : Promise.reject(r)))
    .catch(() => delCache(guardarComo || ruta).then((r) => r || red));
}

async function descifrada(ruta) {
  const res = await obtener(ruta + ".enc");
  if (!res.ok) return new Response("", { status: res.status });
  const datos = new Uint8Array(await res.arrayBuffer());
  for (const fresca of [false, true]) {
    const k = await obtenerLlave(fresca);
    if (!k) break;
    try {
      const plano = await crypto.subtle.decrypt({ name: "AES-GCM", iv: datos.slice(0, 12) }, k, datos.slice(12));
      return new Response(plano, { headers: { "Content-Type": TIPOS[ruta.split(".").pop()] || "application/octet-stream" } });
    } catch (e) { /* llave vieja: se relee una vez */ }
  }
  return new Response("", { status: 401 });
}

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) {
    e.respondWith(caches.open(CACHE).then((c) => c.match(e.request).then((r) => r || fetch(e.request).then((res) => { c.put(e.request, res.clone()); return res; }))));
    return;
  }
  const ruta = rel(url);
  if (CIFRADOS.has(ruta)) { e.respondWith(descifrada(ruta)); return; }
  if (e.request.mode === "navigate") { e.respondWith(obtener("./", "index.html").catch(() => delCache("index.html"))); return; }
  e.respondWith(obtener(ruta || "./").catch(() => fetch(e.request)));
});
