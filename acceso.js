/* Acceso con clave a la app de inducción TMM (versión pública en GitHub Pages).
   El contenido viaja cifrado (AES-GCM, llave derivada de la clave con PBKDF2). Aquí se
   pide la clave, se guarda la llave en este celular (IndexedDB) y el service worker
   descifra cada archivo al vuelo. Sin la clave, lo publicado es ilegible. */
(() => {
  "use strict";
  const SCRIPTS = ["content.js", "juego.js", "gran-tala.js", "app.js"];
  const $ = (id) => document.getElementById(id);
  const caja = $("acceso");
  const estado = $("acceso-estado");
  const form = $("acceso-form");
  const campo = $("acceso-clave");
  const boton = $("acceso-entrar");

  /* --- IndexedDB: una sola tienda con la llave en bytes --- */
  const abrir = () => new Promise((res, rej) => {
    const r = indexedDB.open("tmm-acceso", 1);
    r.onupgradeneeded = () => r.result.createObjectStore("llaves");
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
  async function idb(modo, fn) {
    const db = await abrir();
    return new Promise((res, rej) => {
      const tx = db.transaction("llaves", modo);
      const req = fn(tx.objectStore("llaves"));
      tx.oncomplete = () => res(req && req.result);
      tx.onerror = () => rej(tx.error);
    });
  }
  const leerLlave = () => idb("readonly", (s) => s.get("llave")).catch(() => null);
  const guardarLlave = (bytes) => idb("readwrite", (s) => s.put(bytes, "llave"));
  const borrarLlave = () => idb("readwrite", (s) => s.delete("llave")).catch(() => {});

  /* --- Cripto --- */
  const b64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
  const normaliza = (t) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, "");
  async function derivar(clave, info) {
    const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(normaliza(clave)), "PBKDF2", false, ["deriveBits"]);
    const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: b64(info.sal), iterations: info.iter, hash: "SHA-256" }, base, 256);
    return new Uint8Array(bits);
  }
  async function abre(bytes, info) {
    try {
      const llave = await crypto.subtle.importKey("raw", bytes, "AES-GCM", false, ["decrypt"]);
      const d = b64(info.prueba);
      const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: d.slice(0, 12) }, llave, d.slice(12));
      return new TextDecoder().decode(pt) === "TMM-OK";
    } catch (e) {
      return false;
    }
  }

  /* --- Service worker: tiene que estar al mando antes de pedir los archivos cifrados --- */
  async function swListo() {
    if (!("serviceWorker" in navigator) || !window.crypto || !crypto.subtle) throw new Error("navegador");
    const reg = await navigator.serviceWorker.register("sw.js");
    document.addEventListener("visibilitychange", () => { if (!document.hidden) reg.update().catch(() => {}); });
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) {
      await new Promise((res) => {
        navigator.serviceWorker.addEventListener("controllerchange", res, { once: true });
        setTimeout(res, 4000);
      });
    }
    if (!navigator.serviceWorker.controller) {
      /* Recarga una sola vez para que el service worker tome el control; si aun así no, avisa. */
      let ya = false;
      try { ya = sessionStorage.getItem("tmm-recargado") === "1"; sessionStorage.setItem("tmm-recargado", "1"); } catch (e) { ya = true; }
      if (ya) throw new Error("navegador");
      location.reload();
      await new Promise(() => {});
    }
    try { sessionStorage.removeItem("tmm-recargado"); } catch (e) { /* nada */ }
    /* Si llega una versión nueva con la app abierta, recarga una vez (salvo a media lección o juego). */
    let recargando = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (recargando || document.querySelector(".player, .juego, .gta")) return;
      recargando = true;
      location.reload();
    });
  }

  const cargar = (src) => new Promise((res, rej) => {
    const s = document.createElement("script");
    s.src = src;
    s.onload = res;
    s.onerror = () => rej(new Error(src));
    document.body.append(s);
  });

  async function arranca() {
    caja.hidden = true;
    for (const s of SCRIPTS) await cargar(s);
  }

  function muestraFormulario(msg) {
    estado.textContent = msg || "";
    form.hidden = false;
    caja.classList.add("listo");
    setTimeout(() => campo.focus(), 60);
  }

  async function inicio() {
    try {
      await swListo();
      const info = await (await fetch("llave.json", { cache: "no-cache" })).json();
      const guardada = await leerLlave();
      if (guardada && (await abre(guardada, info))) return await arranca();
      if (guardada) await borrarLlave();
      muestraFormulario("");
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!campo.value.trim()) { campo.focus(); return; }
        boton.disabled = true;
        estado.textContent = "Revisando…";
        const bytes = await derivar(campo.value, info);
        if (!(await abre(bytes, info))) {
          boton.disabled = false;
          estado.textContent = "Esa clave no es correcta. Revísala con tu jefe de área.";
          campo.select();
          form.classList.remove("sacude"); void form.offsetWidth; form.classList.add("sacude");
          return;
        }
        await guardarLlave(bytes);
        estado.textContent = "";
        try { await arranca(); } catch (err) { location.reload(); }
      });
    } catch (e) {
      muestraFormulario(e && e.message === "navegador"
        ? "Este navegador no puede abrir la app. Ábrela en Chrome (Android) o Safari (iPhone)."
        : "No se pudo cargar la app. Revisa tu conexión y vuelve a intentar.");
    }
  }

  /* Salir: borra la llave de este celular y vuelve a pedir la clave. */
  window.tmmCerrarSesion = async () => { await borrarLlave(); location.reload(); };

  inicio();
})();
