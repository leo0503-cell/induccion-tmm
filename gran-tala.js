/* Gran Tala Ags — mundo abierto del Rino TMM para la app de inducción.
   El Rino maneja el camión TMM: tala en el bosque (y siembra cada tocón), lleva la madera
   al almacén y entrega pedidos por la ciudad. Al entregar, el cliente hace una pregunta
   real del curso (window.CURSO). Si deja tocones sin sembrar, lo sigue el inspector forestal.
   window.abrirGranTala(alCerrar) monta el juego y devuelve una función que lo cierra. */
(function () {
  "use strict";

  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const lerp = (a, b, t) => a + (b - a) * t;
  const dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);
  const angDif = (a, b) => {
    let d = (a - b) % TAU;
    if (d > Math.PI) d -= TAU;
    if (d < -Math.PI) d += TAU;
    return d;
  };
  const dentro = (x, y, r) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
  const choca = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  function semilla(s) {
    return () => {
      s = (s + 0x6d2b79f5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function matiz(hex, k) {
    const n = parseInt(hex.slice(1), 16);
    const f = (c) => Math.round(k < 0 ? c * (1 + k) : c + (255 - c) * k);
    return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`;
  }
  // Empuja un círculo fuera de un rectángulo; devuelve [dx, dy] o null.
  function empuja(px, py, rad, b) {
    const cx = clamp(px, b.x, b.x + b.w),
      cy = clamp(py, b.y, b.y + b.h);
    const dx = px - cx,
      dy = py - cy,
      d2 = dx * dx + dy * dy;
    if (d2 >= rad * rad) return null;
    if (d2 > 1e-4) {
      const d = Math.sqrt(d2),
        k = (rad - d) / d;
      return [dx * k, dy * k];
    }
    const izq = px - b.x,
      der = b.x + b.w - px,
      arr = py - b.y,
      aba = b.y + b.h - py;
    const m = Math.min(izq, der, arr, aba);
    if (m === izq) return [-(izq + rad), 0];
    if (m === der) return [der + rad, 0];
    if (m === arr) return [0, -(arr + rad)];
    return [0, aba + rad];
  }
  function rr(c, x, y, w, h, r) {
    c.beginPath();
    if (c.roundRect) c.roundRect(x, y, w, h, r);
    else c.rect(x, y, w, h);
  }

  /* ───────── Mundo ───────── */
  const WW = 3400,
    WH = 2520,
    RW = 150,
    HR = 75;
  const VX = [820, 1800, 2760],
    HY = [520, 1340, 2080];
  const CAP = 12,
    CARGA_RINO = 3,
    CRECE = 35;
  const ABRE = 510,
    CIERRA = 1110,
    RITMO = 600 / 420; // 8:30 a 18:30 en 7 minutos
  const FUENTE = "'Exo 2', Montserrat, system-ui, sans-serif";

  function construyeMundo() {
    const R = semilla(20261002);
    const M = {
      calles: [],
      tierra: [],
      manzanas: [],
      edificios: [],
      pinos: [],
      deco: [],
      clientes: [],
      matas: [],
      rayas: [],
      cebras: [],
      cruces: [],
      banquetas: [],
    };
    for (const x of VX) M.calles.push({ x: x - HR, y: 0, w: RW, h: WH, v: true, c: x, a: 0, b: WH });
    M.calles.push({ x: VX[0] - HR, y: HY[0] - HR, w: WW - VX[0] + HR, h: RW, v: false, c: HY[0], a: VX[0] - HR, b: WW });
    M.calles.push({ x: 0, y: HY[1] - HR, w: WW, h: RW, v: false, c: HY[1], a: 0, b: WW });
    M.calles.push({ x: 0, y: HY[2] - HR, w: WW, h: RW, v: false, c: HY[2], a: 0, b: WW });
    M.bosque = { x: 0, y: 0, w: VX[0] - HR, h: HY[1] - HR };
    M.tierra.push({ x: 30, y: 800, w: VX[0] - HR - 30, h: 120 }, { x: 320, y: 90, w: 120, h: HY[1] - HR - 90 });
    M.entrada = { x: 600, y: 860 };

    for (const v of M.calles.filter((c) => c.v))
      for (const h of M.calles.filter((c) => !c.v)) if (v.c + HR > h.a && v.c - HR < h.b) M.cruces.push({ x: v.c, y: h.c });
    const enOtra = (x, y, yo) => M.calles.some((c) => c !== yo && dentro(x, y, c));
    for (const k of M.calles) {
      for (let s = k.a + 20; s < k.b - 20; s += 56) {
        const x = k.v ? k.c : s + 14,
          y = k.v ? s + 14 : k.c;
        if (enOtra(x, y, k)) continue;
        M.rayas.push(k.v ? { x: k.c - 2, y: s, w: 4, h: 28 } : { x: s, y: k.c - 2, w: 28, h: 4 });
      }
    }
    const enVertical = (x, y) => M.calles.some((c) => c.v && dentro(x, y, c));
    const enHorizontal = (x, y) => M.calles.some((c) => !c.v && dentro(x, y, c));
    for (const q of M.cruces) {
      for (const s of [-1, 1]) {
        const yy = q.y + s * (HR + 18);
        if (yy > 0 && yy < WH && enVertical(q.x, yy))
          for (let x = q.x - HR + 10; x < q.x + HR - 14; x += 18) M.cebras.push({ x, y: s < 0 ? q.y - HR - 26 : q.y + HR + 4, w: 10, h: 22 });
        const xx = q.x + s * (HR + 18);
        if (xx > 0 && xx < WW && enHorizontal(xx, q.y))
          for (let y = q.y - HR + 10; y < q.y + HR - 14; y += 18) M.cebras.push({ x: s < 0 ? q.x - HR - 26 : q.x + HR + 4, y, w: 22, h: 10 });
      }
    }

    const TECHOS = ["#d8cfc0", "#c9b79c", "#b9c3c9", "#e2c7a3", "#c46b4e", "#a8b39a", "#d6d9dc", "#bfa58a", "#9fb0bd", "#d9b48f"];
    const pide = (a) => a[Math.floor(R() * a.length)];
    const edificio = (b) => {
      b.techo = b.techo || pide(TECHOS);
      b.muro = b.muro || matiz(b.techo, -0.3);
      b.ventanas = b.ventanas == null ? R() < 0.75 : b.ventanas;
      b.extra = Math.floor(R() * 4);
      M.edificios.push(b);
      return b;
    };
    const xs = [
      [0, VX[0] - HR],
      [VX[0] + HR, VX[1] - HR],
      [VX[1] + HR, VX[2] - HR],
      [VX[2] + HR, WW],
    ];
    const ys = [
      [0, HY[0] - HR],
      [HY[0] + HR, HY[1] - HR],
      [HY[1] + HR, HY[2] - HR],
      [HY[2] + HR, WH],
    ];
    const CLI = {
      "0,2": { nombre: "Carpintería Don Chuy", corto: "Carpintería", lado: "N", color: "#c7792f" },
      "2,0": { nombre: "Constructora Altavista", corto: "Constructora", lado: "S", color: "#d8981e" },
      "3,1": { nombre: "Mueblería El Roble", corto: "Mueblería", lado: "O", color: "#9c5b3b" },
      "2,2": { nombre: "Cocinas Integrales Sofi", corto: "Cocinas", lado: "N", color: "#c2412d" },
      "1,3": { nombre: "Obra Torre Centro", corto: "Obra", lado: "N", color: "#5f6f7c", obra: true },
      "3,3": { nombre: "Estudio Nogal Interiorismo", corto: "Interiorismo", lado: "N", color: "#6b4f8a" },
      "3,0": { nombre: "Ferretería La Llave", corto: "Ferretería", lado: "S", color: "#1f8f7a" },
    };

    function cliente(m, cli) {
      const W = 280,
        D = 190,
        Y = 130;
      const cx = m.x + m.w / 2,
        cy = m.y + m.h / 2;
      let b, mk, hueco;
      if (cli.lado === "N") {
        b = { x: cx - W / 2, y: m.y + Y, w: W, h: D };
        mk = { x: cx, y: m.y + 62 };
        hueco = { x: b.x - 24, y: m.y, w: W + 48, h: Y + D + 24 };
      } else if (cli.lado === "S") {
        b = { x: cx - W / 2, y: m.y + m.h - Y - D, w: W, h: D };
        mk = { x: cx, y: m.y + m.h - 62 };
        hueco = { x: b.x - 24, y: b.y - 24, w: W + 48, h: D + Y + 24 };
      } else {
        b = { x: m.x + Y, y: cy - W / 2, w: D, h: W };
        mk = { x: m.x + 62, y: cy };
        hueco = { x: m.x, y: b.y - 24, w: Y + D + 24, h: W + 48 };
      }
      Object.assign(b, { alt: cli.obra ? 40 : 54, tipo: cli.obra ? "obra" : "cliente", cli, ventanas: true });
      if (cli.obra) Object.assign(b, { techo: "#c9c6bf", muro: "#8d9095" });
      else Object.assign(b, { techo: "#e9e3d6", muro: matiz(cli.color, -0.15) });
      edificio(b);
      M.clientes.push(Object.assign({}, cli, { x: mk.x, y: mk.y, ed: b }));
      return hueco;
    }

    function llena(m, hueco) {
      const pad = 26,
        ix = m.x + pad,
        iy = m.y + pad,
        iw = m.w - pad * 2,
        ih = m.h - pad * 2;
      const filas = ih > 420 ? 2 : 1;
      const fh = (ih - (filas - 1) * 30) / filas;
      for (let f = 0; f < filas; f++) {
        const y = iy + f * (fh + 30);
        let x = ix;
        while (x < ix + iw - 110) {
          let w = 170 + R() * 150;
          if (ix + iw - (x + w) < 140) w = ix + iw - x;
          const ins = 6 + R() * 12;
          const prof = fh * (0.6 + R() * 0.4);
          const by = filas === 2 && f === 1 ? y + fh - prof : y;
          const b = { x: x + ins, y: by + (f === 0 ? 0 : ins), w: w - ins * 2, h: prof - ins, alt: 30 + Math.round(R() * 42), tipo: "casa" };
          if (!hueco || !choca(b, hueco)) edificio(b);
          else if (R() < 0.6) M.deco.push({ x: b.x + b.w / 2, y: b.y + b.h / 2, r: 26 + R() * 8, tipo: "arbol" });
          x += w;
        }
      }
    }

    for (let i = 0; i < 4; i++)
      for (let j = 0; j < 4; j++) {
        if (i === 0 && j <= 1) continue;
        const m = { x: xs[i][0], y: ys[j][0], w: xs[i][1] - xs[i][0], h: ys[j][1] - ys[j][0], i, j };
        m.suelo = R() < 0.5 ? "#a6cb86" : "#d3cdbd";
        M.manzanas.push(m);
        M.banquetas.push({ x: m.x + 8, y: m.y + 8, w: m.w - 16, h: m.h - 16 });
        if (i === 1 && j === 1) {
          m.suelo = "#5a636b";
          const b = edificio({ x: m.x + 34, y: m.y + 30, w: m.w - 68, h: 360, alt: 76, tipo: "almacen", techo: "#0079C1", muro: "#005E97", ventanas: false });
          M.almacen = b;
          M.muelle = { x: m.x + m.w / 2 - 210, y: b.y + b.h + 30, w: 420, h: 160 };
          continue;
        }
        if (i === 3 && j === 2) {
          m.suelo = "#8cc46a";
          m.parque = true;
          M.fuente = { x: m.x + m.w / 2, y: m.y + m.h / 2, r: 48 };
          for (let k = 0; k < 22; k++) {
            const x = m.x + 50 + R() * (m.w - 100),
              y = m.y + 50 + R() * (m.h - 100);
            if (dist(x, y, M.fuente.x, M.fuente.y) < 120) continue;
            if (Math.abs(x - M.fuente.x) < 26 || Math.abs(y - M.fuente.y) < 26) continue;
            M.deco.push({ x, y, r: 24 + R() * 12, tipo: "arbol" });
          }
          continue;
        }
        const cli = CLI[`${i},${j}`];
        llena(m, cli ? cliente(m, cli) : null);
      }

    for (let y = 70; y < M.bosque.h - 20; y += 66)
      for (let x = 40; x < M.bosque.w - 36; x += 66) {
        const px = x + (R() - 0.5) * 30,
          py = y + (R() - 0.5) * 30;
        if (M.tierra.some((t) => px > t.x - 34 && px < t.x + t.w + 34 && py > t.y - 26 && py < t.y + t.h + 44)) continue;
        M.pinos.push({ x: px, y: py, s: 0.85 + R() * 0.3, estado: "arbol", hp: 3, crece: 0, shake: 0 });
      }
    for (let k = 0; k < 1300; k++) {
      const x = R() * WW,
        y = R() * WH;
      if (M.calles.some((c) => dentro(x, y, c))) continue;
      const enBosque = dentro(x, y, M.bosque);
      M.matas.push({ x, y, b: enBosque, t: R() });
    }
    M.matas = M.matas.filter((t) => t.b || !M.manzanas.some((m) => dentro(t.x, t.y, m) && !m.parque));
    M.solidos = M.edificios;
    M.circulos = M.deco.map((d) => ({ x: d.x, y: d.y, r: 11 })).concat(M.fuente ? [{ x: M.fuente.x, y: M.fuente.y, r: M.fuente.r }] : []);
    return M;
  }

  function preguntasCurso() {
    const out = [];
    const mods = (window.CURSO && window.CURSO.modulos) || [];
    for (const m of mods)
      for (const p of m.pasos || []) {
        if (p.t === "pregunta" && p.ops) out.push({ q: p.q, ops: p.ops, ok: p.ok, exp: p.exp || "", mod: m.titulo });
        if (p.t === "vf") out.push({ q: p.q, ops: ["Verdadero", "Falso"], ok: p.ok ? 0 : 1, exp: p.exp || "", mod: m.titulo, vf: true });
      }
    return out;
  }
  function productosCurso() {
    const n = new Set();
    const mods = (window.CURSO && window.CURSO.modulos) || [];
    for (const m of mods) for (const p of m.pasos || []) if (p.t === "productos") for (const it of p.items || []) if (it.nombre) n.add(it.nombre);
    return n.size ? [...n] : ["Triplay de pino", "MDF", "Triplay para cimbra"];
  }

  /* ───────── Estilos ───────── */
  const CSS = `
  .gta{--g-azul:#0079C1;--g-azul-h:#005E97;--g-verde:#00A400;--g-verde-h:#007A00;--g-panel:rgba(6,25,38,.74);
    position:fixed;inset:0;z-index:30;background:#22301f;color:#fff;font-family:var(--texto,Montserrat,system-ui,sans-serif);overflow:hidden;
    touch-action:none;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;-webkit-tap-highlight-color:transparent}
  .gta canvas.g-cv,.gta canvas.g-3d{position:absolute;inset:0;width:100%;height:100%;display:block}
  .gta .g-ico.vista{width:auto;padding:0 10px 0 8px;gap:5px;display:flex;align-items:center;font:700 11px/1 var(--texto,system-ui)}
  .gta .g-ico.vista span{white-space:nowrap}
  .gta .g-cargando{position:absolute;left:50%;top:calc(env(safe-area-inset-top,0px) + 12px);transform:translateX(-50%);background:var(--g-panel);border-radius:99px;padding:6px 12px;font-size:12px;font-weight:600}
  .gta .g-hud{position:absolute;inset:0;pointer-events:none}
  .gta .g-tl{position:absolute;left:12px;top:calc(env(safe-area-inset-top,0px) + 10px);display:flex;flex-direction:column;gap:6px;align-items:flex-start;max-width:min(58vw,240px)}
  .gta .g-fila{display:flex;gap:6px;align-items:stretch}
  .gta button{touch-action:manipulation}
  .gta .g-ico{pointer-events:auto;width:40px;min-height:40px;border-radius:10px;border:none;background:var(--g-panel);color:#fff;display:grid;place-items:center;cursor:pointer;padding:0}
  .gta .g-ico svg{width:20px;height:20px}
  .gta .g-panel{background:var(--g-panel);border-radius:10px;padding:5px 10px 6px;line-height:1.05;min-width:86px}
  .gta .g-reloj{font-family:var(--display,${FUENTE});font-style:italic;font-weight:800;font-size:20px;font-variant-numeric:tabular-nums;letter-spacing:.02em}
  .gta .g-pts{font-family:var(--display,${FUENTE});font-weight:800;font-style:italic;font-size:15px;color:#7BF07E;font-variant-numeric:tabular-nums}
  .gta .g-carga{background:var(--g-panel);border-radius:8px;padding:5px 9px;font-size:11.5px;font-weight:600;line-height:1.35}
  .gta .g-carga b{color:#ffd27a;font-weight:700}
  .gta .g-carga i{font-style:normal;color:#9fc3d6}
  .gta .g-pedidos{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:5px;width:100%}
  .gta .g-pedidos li{background:var(--g-panel);border-radius:8px;padding:5px 8px 6px 7px;font-size:11.5px;line-height:1.3;border-left:4px solid #ffd27a;display:grid;grid-template-columns:auto 1fr;gap:0 7px;align-items:center}
  .gta .g-pedidos .n{grid-row:span 2;width:20px;height:20px;border-radius:50%;background:#ffd27a;color:#062f4d;font-weight:800;font-size:11px;display:grid;place-items:center}
  .gta .g-pedidos li.ok{border-left-color:#00D200}.gta .g-pedidos li.ok .n{background:#00D200}
  .gta .g-pedidos li.urge{border-left-color:#ff7b5c}.gta .g-pedidos li.urge .n{background:#ff7b5c}
  .gta .g-pedidos small{display:block;color:#b7cfdc;font-size:10.5px}
  .gta .g-tr{position:absolute;right:12px;top:calc(env(safe-area-inset-top,0px) + 10px);display:flex;flex-direction:column;align-items:flex-end;gap:6px}
  .gta .g-mini{width:112px;height:112px;border-radius:16px;border:2px solid rgba(255,255,255,.9);background:#2d3a2f;box-shadow:0 4px 14px rgba(0,0,0,.35);display:block}
  .gta .g-estrellas{display:flex;gap:1px;background:var(--g-panel);border-radius:8px;padding:3px 6px;align-items:center}
  .gta .g-estrellas svg{width:15px;height:15px;fill:rgba(255,255,255,.22)}
  .gta .g-estrellas svg.on{fill:#ffb020}
  .gta .g-estrellas.caza svg.on{animation:g-parpadeo .5s steps(2) infinite}
  .gta .g-estrellas span{font-size:9.5px;letter-spacing:.08em;text-transform:uppercase;color:#b7cfdc;margin-right:4px}
  @keyframes g-parpadeo{50%{fill:#fff}}
  @media (max-width:420px){.gta .g-estrellas span{display:none}.gta .g-tl{max-width:min(56vw,230px)}}
  .gta .g-mision{position:absolute;left:50%;transform:translateX(-50%);bottom:calc(env(safe-area-inset-bottom,0px) + 132px);background:var(--g-panel);padding:7px 14px 7px 8px;border-radius:12px;font-size:13.5px;line-height:1.35;width:max-content;max-width:min(92vw,540px);display:flex;gap:9px;align-items:center}
  .gta .g-mision img{height:40px;width:auto;flex:none}
  .gta .g-mision b{color:#7BF07E;font-weight:700}
  .gta .g-mision:empty{display:none}
  .gta .g-toast{position:absolute;left:50%;top:34%;transform:translate(-50%,-50%) scale(.96);text-align:center;opacity:0;transition:opacity .25s,transform .25s;width:min(92vw,560px)}
  .gta .g-toast.on{opacity:1;transform:translate(-50%,-50%) scale(1)}
  .gta .g-toast strong{display:block;font-family:var(--display,${FUENTE});font-style:italic;font-weight:900;font-size:clamp(24px,6.4vw,38px);line-height:1.05;color:#fff;text-shadow:0 3px 0 rgba(0,0,0,.4),0 0 18px rgba(0,0,0,.35)}
  .gta .g-toast span{display:inline-block;margin-top:6px;font-size:13.5px;font-weight:600;background:var(--g-panel);padding:5px 10px;border-radius:8px}
  .gta .g-btn{position:absolute;pointer-events:auto;border:none;border-radius:50%;color:#fff;font-family:var(--display,${FUENTE});font-style:italic;font-weight:800;cursor:pointer;display:grid;place-items:center;padding:0;line-height:1;transition:transform .06s,opacity .2s}
  .gta .g-btn small{display:block;font-family:var(--texto,system-ui);font-style:normal;font-weight:600;font-size:9px;opacity:.8;letter-spacing:.08em;margin-top:3px}
  .gta .g-btn:active{transform:translateY(3px)}
  .gta .g-btn.off{opacity:.42}
  .gta .g-accion{right:18px;bottom:calc(env(safe-area-inset-bottom,0px) + 22px);width:88px;height:88px;font-size:16px;background:var(--g-verde);box-shadow:0 4px 0 var(--g-verde-h),0 8px 18px rgba(0,0,0,.3)}
  .gta .g-subir{right:118px;bottom:calc(env(safe-area-inset-bottom,0px) + 34px);width:66px;height:66px;font-size:14px;background:var(--g-azul);box-shadow:0 4px 0 var(--g-azul-h),0 8px 18px rgba(0,0,0,.3)}
  .gta .g-stick{position:absolute;width:124px;height:124px;margin:-62px 0 0 -62px;border-radius:50%;border:2px solid rgba(255,255,255,.55);background:rgba(255,255,255,.08);pointer-events:none;display:none}
  .gta .g-stick i{position:absolute;left:50%;top:50%;width:54px;height:54px;margin:-27px 0 0 -27px;border-radius:50%;background:rgba(255,255,255,.85);box-shadow:0 2px 8px rgba(0,0,0,.3)}
  .gta .g-stick.ver{display:block}
  .gta .g-stick.guia{display:block;opacity:.45}
  .gta .g-ov{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:calc(env(safe-area-inset-top,0px) + 16px) 16px calc(env(safe-area-inset-bottom,0px) + 16px);background:rgba(6,25,38,.55);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);z-index:2}
  .gta [hidden]{display:none!important}
  .gta .g-card{position:relative;background:var(--sup,#fff);color:var(--tinta,#10202c);border-radius:18px;max-width:440px;width:100%;padding:20px 20px 18px;box-shadow:0 24px 60px -20px rgba(0,0,0,.6);max-height:100%;overflow:auto;overscroll-behavior:contain;user-select:text;-webkit-user-select:text;touch-action:pan-y}
  .gta .g-eyebrow{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--tenue,#566876);font-weight:700}
  .gta .g-titulo{font-family:var(--display,${FUENTE});font-style:italic;font-weight:900;font-size:44px;line-height:.92;margin:4px 0 10px;color:var(--azul,#0079C1)}
  .gta .g-titulo em{color:#00B800;font-style:italic}
  .gta .g-card p{margin:0 0 10px;font-size:14px;line-height:1.5}
  .gta .g-rino{float:right;height:150px;margin:-6px -6px 0 6px;shape-outside:margin-box}
  .gta .g-reglas{margin:0 0 10px;padding-left:18px;font-size:13.5px;line-height:1.45}
  .gta .g-reglas li{margin-bottom:5px}
  .gta .g-teclas{font-size:12px!important;color:var(--tenue,#566876)}
  .gta .g-acc{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;clear:both}
  .gta .g-b{flex:1;min-width:140px;border:none;border-radius:12px;padding:13px 14px;font-family:var(--display,${FUENTE});font-style:italic;font-weight:800;font-size:16px;color:#fff;background:var(--g-azul);box-shadow:0 3px 0 var(--g-azul-h);cursor:pointer}
  .gta .g-b.verde{background:var(--g-verde);box-shadow:0 3px 0 var(--g-verde-h)}
  .gta .g-b.sec{background:var(--sup-2,#e9f0f4);color:var(--tinta,#10202c);box-shadow:none}
  .gta .g-b:active{transform:translateY(2px)}
  .gta .g-mejor{margin-top:12px!important;font-size:12.5px!important;color:var(--tenue,#566876);text-align:center}
  .gta .g-cli{display:flex;gap:12px;align-items:center;margin-bottom:12px}
  .gta .g-av{width:46px;height:46px;border-radius:12px;display:grid;place-items:center;color:#fff;font-family:var(--display,${FUENTE});font-weight:900;font-style:italic;font-size:20px;flex:none}
  .gta .g-cli b{display:block;font-size:15px}
  .gta .g-cli small{display:block;color:var(--tenue,#566876);font-size:12.5px}
  .gta .g-q{font-weight:700;font-size:16px!important;line-height:1.4!important}
  .gta .g-ops{display:flex;flex-direction:column;gap:8px}
  .gta .g-op{text-align:left;border:2px solid var(--linea,#d3dee5);background:var(--sup,#fff);color:var(--tinta,#10202c);border-radius:12px;padding:11px 13px;font:600 14px/1.35 var(--texto,system-ui);cursor:pointer}
  .gta .g-op:disabled{cursor:default}
  .gta .g-op.bien{border-color:#1e8e3e;background:var(--ok-suave,#e3f6e7)}
  .gta .g-op.mal{border-color:#c2412d;background:var(--malo-suave,#fbe6e1)}
  .gta .g-fb{margin-top:12px;padding:12px 13px;border-radius:12px;background:var(--sup-2,#e9f0f4)}
  .gta .g-fb h4{margin:0 0 4px;font-family:var(--display,${FUENTE});font-style:italic;font-weight:900;font-size:22px}
  .gta .g-fb h4.bien{color:#1e8e3e}.gta .g-fb h4.mal{color:#c2412d}
  .gta .g-fb p{font-size:13.5px!important;margin-bottom:6px!important}
  .gta .g-desglose{font-size:12.5px!important;color:var(--tenue,#566876)}
  .gta .g-stats{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:6px 0 4px}
  .gta .g-stats div{background:var(--sup-2,#e9f0f4);border-radius:12px;padding:9px 11px}
  .gta .g-stats span{display:block;font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--tenue,#566876);font-weight:700}
  .gta .g-stats strong{font-family:var(--display,${FUENTE});font-style:italic;font-weight:900;font-size:24px;color:var(--azul,#0079C1);font-variant-numeric:tabular-nums}
  .gta .g-stats .total{grid-column:span 2;background:var(--azul,#0079C1)}
  .gta .g-stats .total span{color:#cfe6f5}.gta .g-stats .total strong{color:#fff;font-size:32px}
  .gta .g-record{color:#1e8e3e;font-weight:700;text-align:center}
  @media (max-height:640px){.gta .g-mision{bottom:calc(env(safe-area-inset-bottom,0px) + 116px);font-size:12.5px}.gta .g-mision img{height:32px}.gta .g-rino{height:110px}.gta .g-titulo{font-size:36px}}
  @media (pointer:coarse){.gta .g-mision{bottom:calc(env(safe-area-inset-bottom,0px) + 196px)}}
  @media (pointer:fine) and (min-width:900px){.gta .g-mision{bottom:22px}}`;

  const ICO_X = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  const ICO_SON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/></svg>';
  const ICO_MUDO =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M17 9l5 6M22 9l-5 6"/></svg>';
  const ICO_CAM =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8h3l2-3h8l2 3h3v11H3z"/><circle cx="12" cy="13" r="3.6"/></svg>';
  const ESTRELLA = '<svg viewBox="0 0 24 24"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6L2.5 9.4l6.6-.8z"/></svg>';

  const lee = (k, d) => {
    try {
      const v = localStorage.getItem(k);
      return v == null ? d : v;
    } catch (e) {
      return d;
    }
  };
  const guarda = (k, v) => {
    try {
      localStorage.setItem(k, String(v));
    } catch (e) {
      /* sin almacenamiento */
    }
  };

  window.abrirGranTala = function (alCerrar) {
    if (!document.getElementById("gta-css")) {
      const st = document.createElement("style");
      st.id = "gta-css";
      st.textContent = CSS;
      document.head.append(st);
    }
    const M = construyeMundo();
    const PREG = preguntasCurso(),
      PROD = productosCurso();
    const R = semilla((Date.now() & 0xffffff) + 7);

    const raiz = document.createElement("div");
    raiz.className = "gta";
    raiz.setAttribute("role", "dialog");
    raiz.setAttribute("aria-label", "Juego Gran Tala Ags");
    raiz.innerHTML = `
      <canvas class="g-cv" data-g="cv" role="img" aria-label="Ciudad, bosque y almacén TMM vistos desde arriba"></canvas>
      <div class="g-hud">
        <div class="g-tl">
          <div class="g-fila">
            <button class="g-ico" data-g="cerrar" aria-label="Pausa o salir">${ICO_X}</button>
            <div class="g-panel"><div class="g-reloj" data-g="reloj">8:30</div><div class="g-pts" data-g="pts">0 pts</div></div>
            <button class="g-ico vista" data-g="vista" aria-label="Cambiar cámara">${ICO_CAM}<span data-g="vistaTxt"></span></button>
          </div>
          <div class="g-carga" data-g="carga"></div>
          <ol class="g-pedidos" data-g="pedidos"></ol>
        </div>
        <div class="g-tr">
          <canvas class="g-mini" data-g="mini" aria-hidden="true"></canvas>
          <div class="g-estrellas" data-g="estrellas" aria-label="Nivel del inspector forestal"><span>Inspector</span>${ESTRELLA.repeat(5)}</div>
          <button class="g-ico" data-g="mudo" aria-label="Sonido"></button>
        </div>
        <div class="g-toast" data-g="toast" aria-live="polite"><strong></strong><span hidden></span></div>
        <div class="g-mision" data-g="mision"></div>
        <div class="g-cargando" data-g="cargando" hidden>Cargando vista 3D…</div>
      </div>
      <div class="g-stick" data-g="stick"><i></i></div>
      <button class="g-btn g-subir" data-g="subir" type="button">Subir<small>E</small></button>
      <button class="g-btn g-accion" data-g="accion" type="button">Talar<small>ESPACIO</small></button>
      <div class="g-ov" data-g="inicio">
        <div class="g-card">
          <img class="g-rino" src="img/rino_heroe.webp" alt="">
          <span class="g-eyebrow">Las aventuras del Rino TMM</span>
          <h2 class="g-titulo">Gran Tala<br><em>Ags</em></h2>
          <p>Maneja el camión TMM por la ciudad: tala en el bosque, lleva la madera al almacén y entrega los pedidos antes de que cierre la jornada (8:30 a 18:30).</p>
          <ul class="g-reglas">
            <li><b>Por cada árbol que talas, siembra uno.</b> Si dejas tocones, te sigue el inspector forestal.</li>
            <li>Al entregar, el cliente te hace una <b>pregunta del curso</b>: si aciertas, cierras la venta completa.</li>
          </ul>
          <p class="g-teclas">Celular: arrastra el dedo en la mitad izquierda para moverte; botones a la derecha. Teclado: flechas o WASD, Espacio para talar o sembrar, E para subir o bajar del camión. Con el botón de cámara (tecla C) cambias entre vista clásica, aérea 3D, tercera y primera persona.</p>
          <div class="g-acc">
            <button class="g-b verde" data-g="jugar" type="button">Empezar jornada</button>
            <button class="g-b sec" data-g="libre" type="button" hidden>Saltar tutorial</button>
          </div>
          <p class="g-mejor">Mejor jornada: <b data-g="mejor">0</b> pts</p>
        </div>
      </div>
      <div class="g-ov" data-g="venta" hidden><div class="g-card" data-g="ventaCard"></div></div>
      <div class="g-ov" data-g="pausa" hidden>
        <div class="g-card">
          <span class="g-eyebrow">Pausa</span>
          <h2 class="g-titulo" style="font-size:34px">¿Sigues en la jornada?</h2>
          <p>Si sales ahora, esta jornada no cuenta para tu mejor marca.</p>
          <div class="g-acc"><button class="g-b verde" data-g="seguir" type="button">Seguir</button><button class="g-b sec" data-g="salir" type="button">Salir del juego</button></div>
        </div>
      </div>
      <div class="g-ov" data-g="fin" hidden><div class="g-card" data-g="finCard"></div></div>`;
    document.body.append(raiz);
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const $ = (k) => raiz.querySelector(`[data-g="${k}"]`);
    const cv = $("cv"),
      ctx = cv.getContext("2d");
    const mini = $("mini"),
      mc = mini.getContext("2d");
    const ac = new AbortController();
    const sig = { signal: ac.signal };

    // En el celular la pantalla no debe moverse ni hacer zoom mientras se juega:
    // se fija la escala, se apaga el rebote de la página y se cancelan pellizcos y doble toque.
    const vp = document.querySelector('meta[name="viewport"]');
    const vpPrevio = vp ? vp.getAttribute("content") : null;
    if (vp) vp.setAttribute("content", "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover");
    const rebotePrevio = [document.documentElement.style.overscrollBehavior, document.body.style.overscrollBehavior];
    document.documentElement.style.overscrollBehavior = document.body.style.overscrollBehavior = "none";
    const enTarjeta = (e) => e.target && e.target.closest && e.target.closest(".g-card");
    const sinGesto = (e) => e.preventDefault();
    for (const ev of ["gesturestart", "gesturechange", "gestureend"]) document.addEventListener(ev, sinGesto, { signal: ac.signal, passive: false });
    raiz.addEventListener("touchmove", (e) => !enTarjeta(e) && e.preventDefault(), { signal: ac.signal, passive: false });
    raiz.addEventListener("touchstart", (e) => e.touches.length > 1 && !enTarjeta(e) && e.preventDefault(), { signal: ac.signal, passive: false });
    let ultimoToque = 0;
    raiz.addEventListener(
      "touchend",
      (e) => {
        if (enTarjeta(e) || (e.target.closest && e.target.closest("button"))) return;
        const ahora = Date.now();
        if (ahora - ultimoToque < 350) e.preventDefault();
        ultimoToque = ahora;
      },
      { signal: ac.signal, passive: false },
    );
    raiz.addEventListener("dblclick", (e) => e.preventDefault(), sig);
    window.scrollTo(0, 0);
    let cw = 1,
      ch = 1,
      dpr = 1;
    const ESC_MAPA = 0.07;
    const mapa = pintaMapa();

    /* ───────── Audio ───────── */
    const A = { c: null, mudo: lee("grantala.mudo", "0") === "1" };
    function audioInicia() {
      if (A.c) {
        if (A.c.state === "suspended") A.c.resume();
        return;
      }
      const C = window.AudioContext || window.webkitAudioContext;
      if (!C) return;
      try {
        A.c = new C();
      } catch (e) {
        return;
      }
      A.master = A.c.createGain();
      A.master.gain.value = A.mudo ? 0 : 0.55;
      A.master.connect(A.c.destination);
      A.motor = A.c.createOscillator();
      A.motor.type = "sawtooth";
      A.motor.frequency.value = 48;
      const lp = A.c.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 340;
      A.mg = A.c.createGain();
      A.mg.gain.value = 0;
      A.motor.connect(lp).connect(A.mg).connect(A.master);
      A.motor.start();
      A.sir = A.c.createOscillator();
      A.sir.type = "triangle";
      A.sir.frequency.value = 700;
      A.sg = A.c.createGain();
      A.sg.gain.value = 0;
      A.sir.connect(A.sg).connect(A.master);
      A.sir.start();
      const n = A.c.sampleRate;
      A.ruido = A.c.createBuffer(1, n, n);
      const d = A.ruido.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    }
    function nota(f, dur, tipo, vol, f2, retraso) {
      if (!A.c) return;
      const t0 = A.c.currentTime + (retraso || 0);
      const o = A.c.createOscillator(),
        g = A.c.createGain();
      o.type = tipo || "sine";
      o.frequency.setValueAtTime(f, t0);
      if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + dur);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(vol || 0.2, t0 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g).connect(A.master);
      o.start(t0);
      o.stop(t0 + dur + 0.05);
    }
    function ruido(dur, vol, frec, tipo) {
      if (!A.c) return;
      const t0 = A.c.currentTime;
      const s = A.c.createBufferSource(),
        f = A.c.createBiquadFilter(),
        g = A.c.createGain();
      s.buffer = A.ruido;
      f.type = tipo || "lowpass";
      f.frequency.value = frec;
      g.gain.setValueAtTime(vol, t0);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      s.connect(f).connect(g).connect(A.master);
      s.start(t0);
      s.stop(t0 + dur + 0.05);
    }
    function sonido(t) {
      if (!A.c || A.mudo) return;
      if (t === "golpe") {
        ruido(0.09, 0.5, 900);
        nota(150, 0.1, "triangle", 0.25, 70);
      } else if (t === "caida") {
        ruido(0.45, 0.45, 420);
        nota(90, 0.4, "sine", 0.3, 40);
      } else if (t === "sembrar") {
        nota(523, 0.12, "sine", 0.18);
        nota(784, 0.18, "sine", 0.16, null, 0.09);
      } else if (t === "carga") nota(660, 0.07, "square", 0.05);
      else if (t === "caja") {
        ruido(0.08, 0.25, 1600, "bandpass");
        nota(220, 0.08, "triangle", 0.12);
      } else if (t === "venta") {
        nota(784, 0.12, "sine", 0.2);
        nota(988, 0.12, "sine", 0.2, null, 0.1);
        nota(1319, 0.3, "sine", 0.2, null, 0.2);
      } else if (t === "error") nota(180, 0.25, "square", 0.08, 140);
      else if (t === "pedido") {
        nota(880, 0.1, "sine", 0.16);
        nota(880, 0.1, "sine", 0.16, null, 0.16);
      } else if (t === "choque") {
        ruido(0.25, 0.6, 700);
        nota(80, 0.2, "sawtooth", 0.15, 40);
      } else if (t === "puerta") {
        ruido(0.06, 0.3, 2000, "bandpass");
        nota(300, 0.05, "square", 0.05);
      } else if (t === "claxon") {
        nota(392, 0.32, "square", 0.08);
        nota(494, 0.32, "square", 0.06);
      } else if (t === "multa") {
        nota(440, 0.2, "sawtooth", 0.1, 220);
        nota(330, 0.35, "sawtooth", 0.1, 160, 0.18);
      } else if (t === "ey") nota(620, 0.12, "triangle", 0.1, 820);
    }
    function pintaMudo() {
      $("mudo").innerHTML = A.mudo ? ICO_MUDO : ICO_SON;
      $("mudo").setAttribute("aria-label", A.mudo ? "Activar sonido" : "Silenciar");
      if (A.master) A.master.gain.value = A.mudo ? 0 : 0.55;
    }
    pintaMudo();

    /* ───────── Cámaras ───────── */
    const VISTAS = ["clasica", "aerea", "tercera", "primera"];
    const NOMBRE_VISTA = { clasica: "Clásica", aerea: "Aérea 3D", tercera: "3ª persona", primera: "1ª persona" };
    let vista = lee("grantala.vista", "tercera");
    if (!VISTAS.includes(vista)) vista = "tercera";
    let R3 = null,
      estado3D = "nada",
      cerrado = false;
    const vistaActiva = () => (R3 && vista !== "clasica" ? vista : "clasica");
    const relativa = () => vistaActiva() === "tercera" || vistaActiva() === "primera";
    function cargaScript(src) {
      return new Promise((ok, mal) => {
        const s = document.createElement("script");
        s.src = src;
        s.onload = ok;
        s.onerror = mal;
        document.head.append(s);
      });
    }
    async function activa3D() {
      if (R3 || estado3D === "cargando" || estado3D === "error") return;
      estado3D = "cargando";
      $("cargando").hidden = false;
      try {
        if (!window.THREE) await cargaScript("vendor/three.min.js");
        if (!window.GranTala3D) await cargaScript("gran-tala-3d.js");
        if (cerrado) return;
        const r3 = window.GranTala3D.crea(window.THREE, M, { WW, WH, movil: tactil });
        if (cerrado) return r3.destruye();
        R3 = r3;
        raiz.insertBefore(R3.lienzo, cv);
        R3.ajusta(cw, ch);
        estado3D = "listo";
      } catch (e) {
        console.warn("Gran Tala: sin 3D", e);
        estado3D = "error";
        R3 = null;
        vista = "clasica";
        aviso("Vista 3D no disponible", "Este dispositivo no la soporta; seguimos en la vista clásica.");
      }
      if (!cerrado) {
        $("cargando").hidden = true;
        pintaVista();
      }
    }
    function pintaVista() {
      $("vistaTxt").textContent = NOMBRE_VISTA[vista];
      if (R3) R3.lienzo.style.display = vistaActiva() === "clasica" ? "none" : "block";
    }
    function ciclaVista() {
      audioInicia();
      vista = VISTAS[(VISTAS.indexOf(vista) + 1) % VISTAS.length];
      if (vista !== "clasica" && estado3D === "error") vista = "clasica";
      guarda("grantala.vista", vista);
      if (vista !== "clasica") activa3D();
      pintaVista();
      const rel = vista === "tercera" || vista === "primera";
      if (G && G.modo !== "inicio")
        aviso(NOMBRE_VISTA[vista], rel ? "Palanca arriba para avanzar; a los lados para girar." : "La palanca mueve hacia donde apuntas en la pantalla.");
    }

    /* ───────── Estado ───────── */
    let G = null;
    let tAnim = 0;
    const inp = { teclas: new Set(), sx: 0, sy: 0, accion: false, toque: false, stick: null };
    const CEL = 40,
      GW = Math.ceil(WW / CEL),
      GH = Math.ceil(WH / CEL);
    const fijo = new Uint8Array(GW * GH),
      movil = new Uint8Array(GW * GH),
      campo = new Int16Array(GW * GH),
      cola = new Int32Array(GW * GH);
    for (let gy = 0; gy < GH; gy++)
      for (let gx = 0; gx < GW; gx++) {
        const x = gx * CEL + CEL / 2,
          y = gy * CEL + CEL / 2;
        if (M.solidos.some((b) => x > b.x - 22 && x < b.x + b.w + 22 && y > b.y - 22 && y < b.y + b.h + 22)) fijo[gy * GW + gx] = 1;
        else if (M.circulos.some((c) => dist(x, y, c.x, c.y) < c.r + 22)) fijo[gy * GW + gx] = 1;
      }
    function gridPinos() {
      movil.fill(0);
      for (const p of M.pinos) {
        if (p.estado !== "arbol") continue;
        for (let gy = Math.floor((p.y - 30) / CEL); gy <= Math.floor((p.y + 30) / CEL); gy++)
          for (let gx = Math.floor((p.x - 30) / CEL); gx <= Math.floor((p.x + 30) / CEL); gx++) {
            if (gx < 0 || gy < 0 || gx >= GW || gy >= GH) continue;
            if (dist(gx * CEL + CEL / 2, gy * CEL + CEL / 2, p.x, p.y) < 32) movil[gy * GW + gx] = 1;
          }
      }
    }
    const libreCel = (i) => !fijo[i] && !movil[i];

    function nuevaPartida(modo) {
      for (const p of M.pinos) Object.assign(p, { estado: "arbol", hp: 3, crece: 0, shake: 0 });
      gridPinos();
      G = {
        modo,
        paso: 0,
        tiempo: 0,
        reloj: ABRE,
        pts: 0,
        rino: { x: 960, y: 1120, a: -Math.PI / 2, f: 1, fase: 0, carga: 0, chop: 0, cd: 0, enCamion: false },
        camion: { x: 1010, y: 1192, a: 0, v: 0, troncos: 0, paq: 0, golpe: 0 },
        cam: { x: 1100, y: 1050, z: 1 },
        stock: 0,
        pedidos: [],
        sigPedido: 3,
        num: 0,
        entregados: 0,
        correctas: 0,
        preguntas: 0,
        talados: 0,
        sembrados: 0,
        multas: 0,
        perdidos: 0,
        tocones: 0,
        insp: [],
        estrellas: 0,
        cdInsp: 0,
        cdCampo: 0,
        congela: 0,
        pausa: false,
        cdMuelle: 0,
        cdCarga: 0,
        shake: 0,
        caidas: [],
        parts: [],
        pops: [],
        meta: null,
        usadas: [],
        avisoInsp: false,
        carros: creaTrafico(),
        peatones: creaPeatones(),
      };
      ajusta();
      G.cam.z = zoomBase();
    }

    function creaTrafico() {
      const COLS = ["#d94b3b", "#f2c14e", "#3b7dd8", "#e8e8e8", "#3a3a3a", "#6ab04c", "#9b59b6", "#e67e22", "#7f8c8d", "#1abc9c"];
      const carros = [];
      for (const k of M.calles) {
        if (!k.v && k.a > 0) continue; // la calle que termina en T no lleva tráfico
        const carriles = k.v
          ? [
              { v: true, f: k.c - 38, dir: 1 },
              { v: true, f: k.c + 38, dir: -1 },
            ]
          : [
              { v: false, f: k.c + 38, dir: 1 },
              { v: false, f: k.c - 38, dir: -1 },
            ];
        for (const cl of carriles) {
          cl.a = k.a;
          cl.b = k.b;
          for (let j = 0; j < 2; j++)
            carros.push({
              cl,
              s: cl.a + (j + R() * 0.6) * ((cl.b - cl.a) / 2),
              vel: 0,
              max: 130 + R() * 70,
              color: COLS[Math.floor(R() * COLS.length)],
              x: 0,
              y: 0,
              a: 0,
              pita: 0,
            });
        }
      }
      for (const c of carros) ubicaCarro(c);
      return carros;
    }
    function ubicaCarro(c) {
      const cl = c.cl;
      if (cl.v) {
        c.x = cl.f;
        c.y = c.s;
        c.a = cl.dir > 0 ? Math.PI / 2 : -Math.PI / 2;
      } else {
        c.x = c.s;
        c.y = cl.f;
        c.a = cl.dir > 0 ? 0 : Math.PI;
      }
    }
    function creaPeatones() {
      const PIEL = ["#f1c27d", "#e0ac69", "#c68642", "#8d5524"];
      const ROPA = ["#e74c3c", "#3498db", "#f1c40f", "#9b59b6", "#ecf0f1", "#2ecc71", "#e67e22", "#34495e"];
      const ps = [];
      M.banquetas.forEach((b, i) => {
        const n = i % 2 ? 1 : 2;
        for (let k = 0; k < n; k++)
          ps.push({
            b,
            s: R() * 2 * (b.w + b.h),
            dir: R() < 0.5 ? 1 : -1,
            vel: 34 + R() * 22,
            piel: PIEL[Math.floor(R() * 4)],
            ropa: ROPA[Math.floor(R() * ROPA.length)],
            fase: R() * 6,
            salto: 0,
            ox: 0,
            oy: 0,
            x: 0,
            y: 0,
            f: 1,
          });
      });
      return ps;
    }
    function ubicaPeaton(p) {
      const b = p.b,
        P = 2 * (b.w + b.h);
      let s = ((p.s % P) + P) % P;
      let x, y;
      if (s < b.w) {
        x = b.x + s;
        y = b.y;
      } else if ((s -= b.w) < b.h) {
        x = b.x + b.w;
        y = b.y + s;
      } else if ((s -= b.h) < b.w) {
        x = b.x + b.w - s;
        y = b.y + b.h;
      } else {
        s -= b.w;
        x = b.x;
        y = b.y + b.h - s;
      }
      if (Math.abs(x - p.x) > 0.01) p.f = x > p.x ? 1 : -1;
      p.x = x;
      p.y = y;
    }

    /* ───────── Entrada ───────── */
    function entrada() {
      const t = inp.teclas;
      let x = 0,
        y = 0;
      if (t.has("arrowleft") || t.has("a")) x -= 1;
      if (t.has("arrowright") || t.has("d")) x += 1;
      if (t.has("arrowup") || t.has("w")) y -= 1;
      if (t.has("arrowdown") || t.has("s")) y += 1;
      if (x || y) {
        const m = Math.hypot(x, y);
        return [x / m, y / m, 1];
      }
      const m = Math.hypot(inp.sx, inp.sy);
      return [inp.sx, inp.sy, m];
    }
    const hayOverlay = () => ["inicio", "venta", "pausa", "fin"].some((k) => !$(k).hidden);
    window.addEventListener(
      "keydown",
      (e) => {
        if (hayOverlay()) {
          if (e.key === "Escape" && !$("pausa").hidden) cierraPausa();
          return;
        }
        const k = e.key.toLowerCase();
        if (["arrowleft", "arrowright", "arrowup", "arrowdown", " "].includes(k)) e.preventDefault();
        if (k === " " || k === "j") {
          if (!inp.accion) inp.toque = true;
          inp.accion = true;
        } else if (k === "e" || k === "enter") alternaCamion();
        else if (k === "c" || k === "v") ciclaVista();
        else if (k === "escape") abrePausa();
        else inp.teclas.add(k);
      },
      sig,
    );
    window.addEventListener(
      "keyup",
      (e) => {
        const k = e.key.toLowerCase();
        if (k === " " || k === "j") inp.accion = false;
        inp.teclas.delete(k);
      },
      sig,
    );
    window.addEventListener(
      "blur",
      () => {
        inp.teclas.clear();
        inp.accion = false;
      },
      sig,
    );

    const stick = $("stick");
    raiz.addEventListener(
      "pointerdown",
      (e) => {
        if (e.target.closest("button") || hayOverlay()) return;
        if (e.clientX > cw * 0.62 || inp.stick) return;
        audioInicia();
        inp.stick = { id: e.pointerId, x: e.clientX, y: e.clientY };
        stick.style.left = e.clientX + "px";
        stick.style.top = e.clientY + "px";
        stick.className = "g-stick ver";
        stick.firstChild.style.transform = "";
        try {
          raiz.setPointerCapture(e.pointerId);
        } catch (er) {
          /* nada */
        }
      },
      sig,
    );
    raiz.addEventListener(
      "pointermove",
      (e) => {
        if (!inp.stick || e.pointerId !== inp.stick.id) return;
        let dx = e.clientX - inp.stick.x,
          dy = e.clientY - inp.stick.y;
        const m = Math.hypot(dx, dy),
          max = 52;
        if (m > max) {
          dx *= max / m;
          dy *= max / m;
        }
        inp.sx = dx / max;
        inp.sy = dy / max;
        stick.firstChild.style.transform = `translate(${dx}px,${dy}px)`;
      },
      sig,
    );
    const suelta = (e) => {
      if (!inp.stick || e.pointerId !== inp.stick.id) return;
      inp.stick = null;
      inp.sx = inp.sy = 0;
      stick.className = "g-stick";
      guiaStick();
    };
    raiz.addEventListener("pointerup", suelta, sig);
    raiz.addEventListener("pointercancel", suelta, sig);
    const tactil = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
    function guiaStick() {
      if (!tactil || inp.stick || !G || G.modo === "inicio") return;
      stick.style.left = "86px";
      stick.style.top = ch - 120 + "px";
      stick.className = "g-stick guia";
      stick.firstChild.style.transform = "";
    }

    const bAcc = $("accion"),
      bSub = $("subir");
    bAcc.addEventListener(
      "pointerdown",
      (e) => {
        e.preventDefault();
        audioInicia();
        inp.accion = true;
        inp.toque = true;
      },
      sig,
    );
    for (const ev of ["pointerup", "pointerleave", "pointercancel"])
      bAcc.addEventListener(
        ev,
        () => {
          inp.accion = false;
        },
        sig,
      );
    bSub.addEventListener(
      "pointerdown",
      (e) => {
        e.preventDefault();
        audioInicia();
        alternaCamion();
      },
      sig,
    );
    bAcc.addEventListener("contextmenu", (e) => e.preventDefault(), sig);
    bSub.addEventListener("contextmenu", (e) => e.preventDefault(), sig);

    $("vista").addEventListener("click", ciclaVista, sig);
    $("mudo").addEventListener(
      "click",
      () => {
        A.mudo = !A.mudo;
        guarda("grantala.mudo", A.mudo ? "1" : "0");
        audioInicia();
        pintaMudo();
      },
      sig,
    );
    $("cerrar").addEventListener(
      "click",
      () => {
        if (G && (G.modo === "tuto" || G.modo === "libre")) abrePausa();
        else cerrar();
      },
      sig,
    );
    $("seguir").addEventListener("click", cierraPausa, sig);
    $("salir").addEventListener("click", () => cerrar(), sig);
    const tutoHecho = lee("grantala.tuto", "0") === "1";
    $("jugar").textContent = tutoHecho ? "Empezar jornada" : "Empezar con tutorial";
    $("libre").textContent = tutoHecho ? "Repetir tutorial" : "Saltar tutorial";
    $("libre").hidden = false;
    $("jugar").addEventListener("click", () => empieza(tutoHecho ? "libre" : "tuto"), sig);
    $("libre").addEventListener("click", () => empieza(tutoHecho ? "tuto" : "libre"), sig);
    $("mejor").textContent = parseInt(lee("grantala.best", "0"), 10) || 0;

    function abrePausa() {
      if (!G || G.modo === "inicio" || G.modo === "fin" || !$("venta").hidden) return;
      G.pausa = true;
      $("pausa").hidden = false;
    }
    function cierraPausa() {
      $("pausa").hidden = true;
      if (G && $("venta").hidden) G.pausa = false;
    }
    document.addEventListener(
      "visibilitychange",
      () => {
        if (document.hidden) abrePausa();
      },
      sig,
    );

    function empieza(modo) {
      audioInicia();
      nuevaPartida(modo);
      $("inicio").hidden = true;
      $("fin").hidden = true;
      if (modo === "libre") arrancaJornada();
      else aviso("Tutorial", "Aprende a talar, sembrar y entregar.");
      guiaStick();
    }
    function arrancaJornada() {
      G.modo = "libre";
      G.reloj = ABRE;
      guarda("grantala.tuto", "1");
      aviso("¡Empieza la jornada!", "8:30 · Atiende los pedidos antes de las 18:30.");
      nuevoPedido(true);
      G.sigPedido = 14;
    }

    /* ───────── Avisos ───────── */
    let toastT = null;
    function aviso(t, sub) {
      const el = $("toast");
      el.firstChild.textContent = t;
      const s = el.lastChild;
      s.hidden = !sub;
      s.textContent = sub || "";
      el.classList.add("on");
      clearTimeout(toastT);
      toastT = setTimeout(() => el.classList.remove("on"), 2600);
    }
    function pop(x, y, txt, color, alto) {
      G.pops.push({ x, y, txt, color: color || "#fff", t: 0, alto: alto || 40 });
    }
    function astillas(x, y, color, n, alto) {
      const y0 = y;
      y -= alto || 0;
      for (let i = 0; i < (n || 7); i++) {
        const a = -Math.PI / 2 + (R() - 0.5) * 2.4;
        const v = 80 + R() * 140;
        G.parts.push({
          x,
          y,
          y0,
          vx: Math.cos(a) * v,
          vy: Math.sin(a) * v,
          g: 420,
          vida: 0.5 + R() * 0.4,
          t: 0,
          c: color || (R() < 0.5 ? "#d9b07a" : "#8b5a2b"),
          s: 2 + R() * 3,
        });
      }
    }
    function brillos(x, y, alto) {
      const y0 = y;
      y -= alto || 0;
      for (let i = 0; i < 12; i++) {
        const a = R() * TAU,
          v = 30 + R() * 70;
        G.parts.push({
          x,
          y,
          y0,
          vx: Math.cos(a) * v,
          vy: Math.sin(a) * v - 40,
          g: -20,
          vida: 0.7 + R() * 0.4,
          t: 0,
          c: R() < 0.5 ? "#7BF07E" : "#00D200",
          s: 2 + R() * 2.5,
        });
      }
    }

    /* ───────── Lógica ───────── */
    const jugador = () => (G.rino.enCamion ? G.camion : G.rino);
    function libre(x, y, rad) {
      if (x < rad || y < rad || x > WW - rad || y > WH - rad) return false;
      for (const b of M.solidos) if (empuja(x, y, rad, b)) return false;
      for (const p of M.pinos) if (p.estado === "arbol" && dist(x, y, p.x, p.y) < rad + 10) return false;
      return true;
    }
    function alternaCamion() {
      if (!G || G.pausa || G.congela > 0 || G.modo === "inicio" || G.modo === "fin") return;
      const r = G.rino,
        k = G.camion;
      if (r.enCamion) {
        const lados = [k.a - Math.PI / 2, k.a + Math.PI / 2, k.a + Math.PI, k.a];
        let ok = false;
        for (const la of lados) {
          const x = k.x + Math.cos(la) * 44,
            y = k.y + Math.sin(la) * 44;
          if (libre(x, y, 10)) {
            r.x = x;
            r.y = y;
            ok = true;
            break;
          }
        }
        if (!ok) {
          r.x = k.x;
          r.y = k.y + 44;
        }
        r.enCamion = false;
        r.a = k.a;
        k.v *= 0.3;
        sonido("puerta");
      } else if (dist(r.x, r.y, k.x, k.y) < 92) {
        r.enCamion = true;
        while (r.carga > 0 && k.troncos + k.paq < CAP) {
          r.carga--;
          k.troncos++;
        }
        sonido("puerta");
      }
    }

    function contexto() {
      const r = G.rino;
      G.ctx = null;
      G.ctxP = null;
      if (r.enCamion) return;
      let mejor = null,
        md = 1e9;
      const rel = relativa();
      for (const p of M.pinos) {
        if (p.estado === "brote") continue;
        const d = dist(r.x, r.y, p.x, p.y);
        if (d > (rel ? 62 : 50)) continue;
        let puntos = d;
        if (rel) {
          // en primera y tercera persona manda el pino que tienes enfrente
          const ang = Math.abs(angDif(Math.atan2(p.y - r.y, p.x - r.x), r.a));
          if (ang > 1.3 && d > 24) continue;
          puntos += ang * 25;
        }
        if (puntos < md) {
          md = puntos;
          mejor = p;
        }
      }
      if (!mejor) return;
      G.ctxP = mejor;
      G.ctx = mejor.estado === "tocon" ? "sembrar" : r.carga >= CARGA_RINO ? "lleno" : "talar";
    }

    function accion() {
      const r = G.rino,
        p = G.ctxP;
      if (r.enCamion) {
        sonido("claxon");
        r.cd = 0.6;
        for (const pe of G.peatones) if (dist(pe.x, pe.y, G.camion.x, G.camion.y) < 160 && pe.salto <= 0) pe.salto = 0.45;
        return;
      }
      if (G.ctx === "talar") {
        r.f = p.x >= r.x ? 1 : -1;
        if (!relativa()) r.a = Math.atan2(p.y - r.y, p.x - r.x);
        r.chop = 0.26;
        r.cd = 0.3;
        p.hp--;
        p.shake = 0.25;
        astillas(p.x - r.f * 6, p.y, null, 0, 14);
        sonido("golpe");
        if (p.hp <= 0) {
          p.estado = "tocon";
          p.hp = 3;
          G.tocones++;
          G.talados++;
          r.carga++;
          G.caidas.push({ x: p.x, y: p.y, s: p.s, dir: r.f, t: 0 });
          pop(p.x, p.y, "+1 tronco", "#ffd27a", 64);
          sonido("caida");
          G.shake = 0.12;
          gridPinos();
        }
      } else if (G.ctx === "sembrar") {
        p.estado = "brote";
        p.crece = 0;
        G.tocones = Math.max(0, G.tocones - 1);
        G.sembrados++;
        r.cd = 0.4;
        brillos(p.x, p.y, 10);
        pop(p.x, p.y, "¡Sembrado!", "#7BF07E", 40);
        sonido("sembrar");
      } else if (G.ctx === "lleno") {
        r.cd = 0.5;
        if (G.tiempo > (G.avisoLleno || 0)) {
          G.avisoLleno = G.tiempo + 3;
          aviso("Ya no cabe otro tronco", "El Rino carga 3: llévalos al camión.");
          sonido("error");
        }
      } else r.cd = 0.15;
    }

    function colisionRino(r) {
      const rad = 9;
      for (const b of M.solidos) {
        const e = empuja(r.x, r.y, rad, b);
        if (e) {
          r.x += e[0];
          r.y += e[1];
        }
      }
      for (const c of M.circulos) {
        const d = dist(r.x, r.y, c.x, c.y),
          m = c.r + rad;
        if (d < m && d > 0) {
          r.x += ((r.x - c.x) / d) * (m - d);
          r.y += ((r.y - c.y) / d) * (m - d);
        }
      }
      for (const p of M.pinos) {
        if (p.estado !== "arbol") continue;
        const d = dist(r.x, r.y, p.x, p.y),
          m = 8 + rad;
        if (d < m && d > 0) {
          r.x += ((r.x - p.x) / d) * (m - d);
          r.y += ((r.y - p.y) / d) * (m - d);
        }
      }
      const k = G.camion;
      for (const o of [-24, 24]) {
        const cx = k.x + Math.cos(k.a) * o,
          cy = k.y + Math.sin(k.a) * o;
        const d = dist(r.x, r.y, cx, cy),
          m = 22 + rad;
        if (d < m && d > 0) {
          r.x += ((r.x - cx) / d) * (m - d);
          r.y += ((r.y - cy) / d) * (m - d);
        }
      }
      r.x = clamp(r.x, rad, WW - rad);
      r.y = clamp(r.y, rad, WH - rad);
    }

    function mueveRino(dt) {
      const r = G.rino,
        k = G.camion;
      const [ix, iy, m] = entrada();
      if (m > 0.12 && G.congela <= 0) {
        if (relativa()) {
          // Tercera y primera persona: arriba avanza, los lados giran
          r.a += ix * 3 * dt;
          const av = -iy,
            v = av > 0 ? 180 * av : 100 * av;
          r.x += Math.cos(r.a) * v * dt;
          r.y += Math.sin(r.a) * v * dt;
          r.fase += dt * 12 * Math.min(1, Math.abs(av) + Math.abs(ix) * 0.4);
        } else {
          const v = 180 * Math.min(1, m);
          const n = Math.max(m, 1e-6);
          r.x += (ix / n) * v * dt;
          r.y += (iy / n) * v * dt;
          if (r.chop <= 0) r.a = Math.atan2(iy, ix);
          r.fase += dt * 12 * Math.min(1, m);
        }
        if (Math.abs(Math.cos(r.a)) > 0.1 && r.chop <= 0) r.f = Math.cos(r.a) > 0 ? 1 : -1;
      } else r.fase = 0;
      colisionRino(r);
      r.chop = Math.max(0, r.chop - dt);
      r.cd -= dt;
      contexto();
      if ((inp.accion || inp.toque) && r.cd <= 0 && G.congela <= 0) accion();
      inp.toque = false;
      const dk = dist(r.x, r.y, k.x, k.y);
      if (r.carga > 0 && dk < 100) {
        if (k.troncos + k.paq < CAP) {
          G.cdCarga -= dt;
          if (G.cdCarga <= 0) {
            G.cdCarga = 0.2;
            r.carga--;
            k.troncos++;
            pop(k.x, k.y, "+1 tronco al camión", "#ffd27a", 34);
            sonido("carga");
          }
        } else if (G.tiempo > (G.avisoLleno || 0)) {
          G.avisoLleno = G.tiempo + 4;
          aviso("Camión lleno", `Caben ${CAP}: entrega o descarga en el almacén.`);
        }
      }
    }

    function superficie(x, y) {
      if (M.calles.some((c) => dentro(x, y, c))) return 1;
      if (M.tierra.some((t) => dentro(x, y, t))) return 0.85;
      if (dentro(x, y, M.bosque)) return 0.55;
      return 0.8;
    }

    function mueveCamion(dt) {
      const k = G.camion;
      const [ix, iy, m] = entrada();
      let steer = 0;
      const sup = superficie(k.x, k.y);
      const MAXV = 440 * sup,
        MAXR = -170,
        ACC = 520,
        FRENO = 950;
      const rel = relativa();
      if (rel && m > 0.15 && G.congela <= 0) {
        const thr = -iy;
        steer = clamp(ix * 1.25, -1, 1);
        if (thr > 0.1) {
          const lim = MAXV * Math.min(1, thr);
          if (k.v < -5) k.v += FRENO * dt;
          else k.v = k.v < lim ? Math.min(lim, k.v + ACC * dt) : Math.max(lim, k.v - 300 * dt);
        } else if (thr < -0.1) {
          if (k.v > 5) k.v -= FRENO * dt;
          else k.v = Math.max(MAXR * Math.min(1, -thr), k.v - ACC * 0.6 * dt);
        } else k.v *= Math.pow(0.35, dt);
      } else if (!rel && m > 0.2 && G.congela <= 0) {
        const tgt = Math.atan2(iy, ix);
        const d = angDif(tgt, k.a);
        if (Math.abs(d) > 2.4 && k.v > 60) {
          k.v = Math.max(0, k.v - FRENO * dt);
          steer = clamp(d * 2, -1, 1) * 0.5;
        } else if (Math.abs(d) < 2.0 || k.v > 40) {
          steer = clamp(d * 2.4, -1, 1);
          const lim = MAXV * Math.min(1, m) * (Math.abs(d) > 1.2 ? 0.55 : 1);
          if (k.v < -5) k.v += FRENO * dt;
          else if (k.v < lim) k.v = Math.min(lim, k.v + ACC * dt);
          else k.v = Math.max(lim, k.v - 300 * dt);
        } else {
          steer = clamp(angDif(tgt, k.a + Math.PI) * 2.4, -1, 1);
          if (k.v > 5) k.v -= FRENO * dt;
          else k.v = Math.max(MAXR * Math.min(1, m), k.v - ACC * 0.6 * dt);
        }
      } else {
        k.v *= Math.pow(0.18, dt);
        if (Math.abs(k.v) < 6) k.v = 0;
      }
      if (k.v > MAXV) k.v = Math.max(MAXV, k.v - 600 * dt);
      // en relativa la reversa gira como un coche de verdad
      k.a += steer * (rel ? 2.5 * clamp(k.v / 130, -1, 1) : 2.7 * clamp(Math.abs(k.v) / 130, 0, 1)) * dt;
      k.x += Math.cos(k.a) * k.v * dt;
      k.y += Math.sin(k.a) * k.v * dt;
      colisionCamion(k, dt);
      if (sup < 1 && Math.abs(k.v) > 120 && R() < 0.5)
        G.parts.push({
          x: k.x - Math.cos(k.a) * 44,
          y: k.y - Math.sin(k.a) * 44,
          y0: k.y - Math.sin(k.a) * 44,
          vx: (R() - 0.5) * 40,
          vy: -20 - R() * 30,
          g: 0,
          vida: 0.6,
          t: 0,
          c: "rgba(190,150,100,.55)",
          s: 5 + R() * 5,
          polvo: true,
        });
      if ((inp.accion || inp.toque) && G.rino.cd <= 0) accion();
      inp.toque = false;
      G.rino.cd -= dt;
    }

    function colisionCamion(k) {
      let golpe = false;
      for (let it = 0; it < 2; it++)
        for (const o of [-26, 26]) {
          const px = k.x + Math.cos(k.a) * o,
            py = k.y + Math.sin(k.a) * o,
            rad = 21;
          for (const b of M.solidos) {
            const e = empuja(px, py, rad, b);
            if (e) {
              k.x += e[0];
              k.y += e[1];
              golpe = true;
            }
          }
          for (const c of M.circulos) {
            const d = dist(px, py, c.x, c.y),
              mm = c.r + rad;
            if (d < mm && d > 0) {
              k.x += ((px - c.x) / d) * (mm - d);
              k.y += ((py - c.y) / d) * (mm - d);
              golpe = true;
            }
          }
          for (const p of M.pinos) {
            if (p.estado !== "arbol") continue;
            const d = dist(px, py, p.x, p.y),
              mm = 12 + rad;
            if (d < mm && d > 0) {
              k.x += ((px - p.x) / d) * (mm - d);
              k.y += ((py - p.y) / d) * (mm - d);
              golpe = true;
              p.shake = Math.max(p.shake, 0.15);
            }
          }
          for (const c of G.carros) {
            for (const oc of [-14, 14]) {
              const cx = c.x + Math.cos(c.a) * oc,
                cy = c.y + Math.sin(c.a) * oc;
              const d = dist(px, py, cx, cy),
                mm = 14 + rad;
              if (d < mm && d > 0) {
                k.x += ((px - cx) / d) * (mm - d);
                k.y += ((py - cy) / d) * (mm - d);
                golpe = true;
                if (c.pita <= 0) {
                  c.pita = 1.2;
                  sonido("claxon");
                }
              }
            }
          }
          if (px < rad) {
            k.x += rad - px;
            golpe = true;
          }
          if (py < rad) {
            k.y += rad - py;
            golpe = true;
          }
          if (px > WW - rad) {
            k.x -= px - (WW - rad);
            golpe = true;
          }
          if (py > WH - rad) {
            k.y -= py - (WH - rad);
            golpe = true;
          }
        }
      if (golpe) {
        const imp = Math.abs(k.v);
        if (imp > 230 && G.tiempo > k.golpe) {
          k.golpe = G.tiempo + 1;
          G.shake = 0.3;
          sonido("choque");
          astillas(k.x + Math.cos(k.a) * 50, k.y + Math.sin(k.a) * 50, "#cfd8dc", 8, 20);
          if (G.modo === "libre") {
            G.pts = Math.max(0, G.pts - 5);
            pop(k.x, k.y, "-5 ¡Cuidado!", "#ff9b85", 40);
          }
        }
        k.v *= imp > 120 ? -0.25 : 0.6;
      }
    }

    function mueveTrafico(dt) {
      const k = G.camion,
        r = G.rino;
      for (const c of G.carros) {
        const cs = Math.cos(c.a),
          sn = Math.sin(c.a);
        const delante = (x, y, largo, ancho) => {
          const dx = x - c.x,
            dy = y - c.y;
          const lon = dx * cs + dy * sn,
            lat = -dx * sn + dy * cs;
          return lon > 10 && lon < largo && Math.abs(lat) < ancho;
        };
        let alto = delante(k.x, k.y, 110, 40) || (!r.enCamion && delante(r.x, r.y, 75, 22));
        if (!alto)
          for (const o of G.carros)
            if (o !== c && o.cl === c.cl && delante(o.x, o.y, 78, 12)) {
              alto = true;
              break;
            }
        if (!alto)
          for (const o of G.insp)
            if (delante(o.x, o.y, 90, 30)) {
              alto = true;
              break;
            }
        if (!alto)
          for (const p of G.peatones)
            if (delante(p.x, p.y, 60, 18)) {
              alto = true;
              break;
            }
        const obj = alto ? 0 : c.max;
        c.vel = c.vel < obj ? Math.min(obj, c.vel + 160 * dt) : Math.max(obj, c.vel - 520 * dt);
        c.s += c.cl.dir * c.vel * dt;
        if (c.s > c.cl.b + 60) c.s = c.cl.a - 60;
        if (c.s < c.cl.a - 60) c.s = c.cl.b + 60;
        if (c.pita > 0) c.pita -= dt;
        ubicaCarro(c);
      }
      for (const p of G.peatones) {
        p.s += p.dir * p.vel * dt * (p.salto > 0 ? 0 : 1);
        p.fase += dt * 9;
        if (R() < dt * 0.05) p.dir *= -1;
        ubicaPeaton(p);
        if (p.salto > 0) p.salto -= dt;
        p.ox *= Math.pow(0.05, dt);
        p.oy *= Math.pow(0.05, dt);
        const px = p.x + p.ox,
          py = p.y + p.oy;
        if (r.enCamion && Math.abs(k.v) > 70 && p.salto <= 0 && dist(px, py, k.x, k.y) < 46) {
          const a = Math.atan2(py - k.y, px - k.x);
          p.ox += Math.cos(a) * 42;
          p.oy += Math.sin(a) * 42;
          p.salto = 0.8;
          sonido("ey");
          pop(px, py, "¡Ey!", "#fff", 40);
          if (G.modo === "libre") G.pts = Math.max(0, G.pts - 5);
        }
      }
    }

    function estrellas() {
      const n = G.tocones;
      return n >= 4 ? Math.min(5, 1 + Math.floor((n - 4) / 3)) : 0;
    }
    function calculaCampo() {
      campo.fill(-1);
      const P = jugador();
      const pcx = Math.floor(P.x / CEL),
        pcy = Math.floor(P.y / CEL);
      let h = 0,
        t = 0;
      for (let rad = 1; rad <= 4 && t === 0; rad++)
        for (let dy = -rad; dy <= rad; dy++)
          for (let dx = -rad; dx <= rad; dx++) {
            const gx = pcx + dx,
              gy = pcy + dy;
            if (gx < 0 || gy < 0 || gx >= GW || gy >= GH) continue;
            const i = gy * GW + gx;
            if (libreCel(i) && campo[i] < 0) {
              campo[i] = 0;
              cola[t++] = i;
            }
          }
      while (h < t) {
        const i = cola[h++],
          gx = i % GW,
          gy = (i - gx) / GW,
          d = campo[i] + 1;
        if (gx > 0 && campo[i - 1] < 0 && libreCel(i - 1)) {
          campo[i - 1] = d;
          cola[t++] = i - 1;
        }
        if (gx < GW - 1 && campo[i + 1] < 0 && libreCel(i + 1)) {
          campo[i + 1] = d;
          cola[t++] = i + 1;
        }
        if (gy > 0 && campo[i - GW] < 0 && libreCel(i - GW)) {
          campo[i - GW] = d;
          cola[t++] = i - GW;
        }
        if (gy < GH - 1 && campo[i + GW] < 0 && libreCel(i + GW)) {
          campo[i + GW] = d;
          cola[t++] = i + GW;
        }
      }
    }
    function atrapado() {
      const n = G.tocones,
        multa = n * 15;
      G.pts = Math.max(0, G.pts - multa);
      G.multas++;
      for (const p of M.pinos)
        if (p.estado === "tocon") {
          p.estado = "brote";
          p.crece = 0;
        }
      G.tocones = 0;
      G.congela = 1.4;
      G.camion.v = 0;
      G.shake = 0.4;
      for (const i of G.insp) i.vete = true;
      aviso("¡Multa forestal!", `−${multa} pts. El inspector sembró ${n} pinos por ti.`);
      sonido("multa");
    }
    function mueveInspector(dt) {
      const est = G.modo === "libre" ? estrellas() : 0;
      G.estrellas = est;
      const quiere = est === 0 ? 0 : est < 3 ? 1 : 2;
      if (est > 0 && !G.avisoInsp) {
        G.avisoInsp = true;
        aviso("¡Te busca el inspector forestal!", "Dejaste tocones sin sembrar. Siémbralos para que se vaya.");
        sonido("multa");
        G.cdInsp = Math.max(G.cdInsp, 5);
      }
      if (est === 0) {
        G.avisoInsp = false;
        for (const i of G.insp) i.vete = true;
      }
      G.cdInsp -= dt;
      if (G.insp.filter((i) => !i.vete).length < quiere && G.cdInsp <= 0) {
        const P = jugador();
        const cands = M.cruces
          .map((c) => ({ x: c.x, y: c.y, d: dist(c.x, c.y, P.x, P.y) }))
          .filter((c) => c.d > 1050)
          .sort((a, b) => a.d - b.d);
        const c = cands[0] || M.cruces[0];
        G.insp.push({ x: c.x, y: c.y, a: Math.atan2(P.y - c.y, P.x - c.x), v: 0, alfa: 1, vete: false });
        G.cdInsp = 5;
      }
      if (!G.insp.length) return;
      G.cdCampo -= dt;
      if (G.cdCampo <= 0) {
        G.cdCampo = 0.4;
        calculaCampo();
      }
      const P = jugador();
      for (const s of G.insp) {
        if (s.vete) {
          s.alfa -= dt * 0.7;
          s.v = lerp(s.v, 180, 1 - Math.exp(-2 * dt));
          s.x += Math.cos(s.a) * s.v * dt;
          s.y += Math.sin(s.a) * s.v * dt;
          continue;
        }
        let tx = P.x,
          ty = P.y;
        const dP = dist(s.x, s.y, P.x, P.y);
        const gx = Math.floor(s.x / CEL),
          gy = Math.floor(s.y / CEL),
          i0 = gy * GW + gx;
        if (dP > 140 && gx >= 0 && gy >= 0 && gx < GW && gy < GH && campo[i0] >= 0) {
          let best = campo[i0],
            bi = -1;
          for (let dy = -1; dy <= 1; dy++)
            for (let dx = -1; dx <= 1; dx++) {
              if (!dx && !dy) continue;
              const nx = gx + dx,
                ny = gy + dy;
              if (nx < 0 || ny < 0 || nx >= GW || ny >= GH) continue;
              const j = ny * GW + nx;
              if (campo[j] < 0) continue;
              if (dx && dy && (!libreCel(gy * GW + nx) || !libreCel(ny * GW + gx))) continue;
              const c = campo[j] + (dx && dy ? 0.4 : 0);
              if (c < best) {
                best = c;
                bi = j;
              }
            }
          if (bi >= 0) {
            const bx = bi % GW,
              by = (bi - bx) / GW;
            tx = bx * CEL + CEL / 2;
            ty = by * CEL + CEL / 2;
          }
        }
        const d = angDif(Math.atan2(ty - s.y, tx - s.x), s.a);
        s.a += clamp(d, -4.2 * dt, 4.2 * dt);
        const vmax = 270 * (Math.abs(d) > 1.1 ? 0.45 : 1);
        s.v = lerp(s.v, vmax, 1 - Math.exp(-2.2 * dt));
        s.x += Math.cos(s.a) * s.v * dt;
        s.y += Math.sin(s.a) * s.v * dt;
        for (const b of M.solidos) {
          const e = empuja(s.x, s.y, 20, b);
          if (e) {
            s.x += e[0];
            s.y += e[1];
          }
        }
        for (const p of M.pinos) {
          if (p.estado !== "arbol") continue;
          const dd = dist(s.x, s.y, p.x, p.y);
          if (dd < 30 && dd > 0) {
            s.x += ((s.x - p.x) / dd) * (30 - dd);
            s.y += ((s.y - p.y) / dd) * (30 - dd);
          }
        }
        s.x = clamp(s.x, 20, WW - 20);
        s.y = clamp(s.y, 20, WH - 20);
        if (dP < (G.rino.enCamion ? 60 : 40) && G.congela <= 0) {
          atrapado();
          break;
        }
      }
      G.insp = G.insp.filter((s) => s.alfa > 0);
    }

    const centroMuelle = () => ({ x: M.muelle.x + M.muelle.w / 2, y: M.muelle.y + M.muelle.h / 2 });
    function logicaAlmacen(dt) {
      const k = G.camion,
        en = G.rino.enCamion;
      const P = jugador();
      if (!dentro(P.x, P.y, M.muelle)) {
        G.cdMuelle = 0.25;
        return;
      }
      if (en && Math.abs(k.v) > 120) return;
      G.cdMuelle -= dt;
      if (G.cdMuelle > 0) return;
      G.cdMuelle = 0.26;
      if (!en && G.rino.carga > 0) {
        G.rino.carga--;
        G.stock++;
        pop(P.x, P.y, "Tronco → paquete", "#ffd27a", 56);
        sonido("caja");
        return;
      }
      if (!en) return;
      if (k.troncos > 0) {
        k.troncos--;
        G.stock++;
        pop(k.x, k.y, "Tronco → paquete", "#ffd27a", 40);
        sonido("caja");
        return;
      }
      const falta = G.pedidos.reduce((s, p) => s + p.cant, 0) - k.paq;
      if (falta > 0 && G.stock > 0 && k.troncos + k.paq < CAP) {
        G.stock--;
        k.paq++;
        pop(k.x, k.y, "+1 paquete", "#7BF07E", 40);
        sonido("carga");
      }
    }

    function logicaEntregas() {
      const k = G.camion;
      for (const p of G.pedidos) {
        const dk = dist(k.x, k.y, p.c.x, p.c.y);
        if (!G.rino.enCamion) {
          if (dist(G.rino.x, G.rino.y, p.c.x, p.c.y) < 60 && dk > 120 && G.tiempo > (p.aviso || 0)) {
            p.aviso = G.tiempo + 5;
            aviso("Trae el camión", "Los paquetes van en la caja del camión.");
          }
          continue;
        }
        if (dk > 72 || Math.abs(k.v) > 170) continue;
        if (k.paq >= p.cant) {
          abreVenta(p);
          return;
        }
        if (G.tiempo > (p.aviso || 0)) {
          p.aviso = G.tiempo + 5;
          aviso(`Te faltan ${p.cant - k.paq} paquetes`, "Pasa al patio de carga del almacén TMM.");
          sonido("error");
        }
      }
    }

    function nuevoPedido(primero) {
      const libres = M.clientes.filter((c) => !G.pedidos.some((p) => p.c === c) && c !== G.ultimo);
      if (!libres.length) return;
      const m = centroMuelle();
      const c = primero ? libres.sort((a, b) => dist(a.x, a.y, m.x, m.y) - dist(b.x, b.y, m.x, m.y))[0] : libres[Math.floor(R() * libres.length)];
      const cant = primero ? 2 : 2 + Math.floor(R() * 4);
      const d = dist(c.x, c.y, m.x, m.y);
      const plazo = Math.round(85 + d / 18 + cant * 16);
      G.num = (G.num % 9) + 1;
      const p = { c, cant, prod: PROD[Math.floor(R() * PROD.length)], limite: G.reloj + plazo, plazo, pago: 20 * cant + Math.round(d / 60), n: G.num };
      G.pedidos.push(p);
      aviso("Nuevo pedido", `${c.nombre}: ${cant} paquetes de ${p.prod}`);
      sonido("pedido");
    }
    function logicaPedidos(dt) {
      for (const p of G.pedidos.slice())
        if (G.reloj > p.limite) {
          G.pedidos.splice(G.pedidos.indexOf(p), 1);
          G.perdidos++;
          aviso("Se te fue un cliente", `${p.c.nombre} ya no pudo esperar.`);
          sonido("error");
        }
      if (G.reloj > CIERRA - 40) return;
      if (!G.pedidos.length) G.sigPedido = Math.min(G.sigPedido, 3);
      G.sigPedido -= dt;
      if (G.pedidos.length < 3 && G.sigPedido <= 0) {
        nuevoPedido(false);
        G.sigPedido = 15 + R() * 12;
      }
    }

    function tomaPregunta() {
      if (!PREG.length)
        return {
          q: "¿Cuál es el lema de TMM?",
          ops: ["¡Tenemos la madera!", "Madera para todos", "Sin madera no hay obra"],
          ok: 0,
          exp: "¡Tenemos la madera!",
        };
      if (G.usadas.length >= PREG.length) G.usadas = [];
      let i;
      do i = Math.floor(R() * PREG.length);
      while (G.usadas.includes(i));
      G.usadas.push(i);
      return PREG[i];
    }
    const el = (tag, cls, txt) => {
      const e = document.createElement(tag);
      if (cls) e.className = cls;
      if (txt != null) e.textContent = txt;
      return e;
    };
    function abreVenta(p) {
      G.pausa = true;
      G.camion.v = 0;
      inp.accion = false;
      const q = tomaPregunta();
      const card = $("ventaCard");
      card.replaceChildren();
      const cab = el("div", "g-cli");
      const av = el("span", "g-av", p.c.corto.charAt(0));
      av.style.background = p.c.color;
      const tx = el("div");
      tx.append(el("b", null, p.c.nombre), el("small", null, `${p.cant} paquetes de ${p.prod}`));
      cab.append(av, tx);
      card.append(el("span", "g-eyebrow", "Antes de firmar, el cliente pregunta"), cab, el("p", "g-q", q.q));
      const ops = el("div", "g-ops");
      const orden = q.ops.map((t, i) => ({ t, i }));
      if (!q.vf)
        for (let i = orden.length - 1; i > 0; i--) {
          const j = Math.floor(R() * (i + 1));
          [orden[i], orden[j]] = [orden[j], orden[i]];
        }
      const botones = orden.map((o) => {
        const b = el("button", "g-op", o.t);
        b.type = "button";
        b.addEventListener("click", () => responde(o.i));
        ops.append(b);
        return { b, i: o.i };
      });
      card.append(ops);
      $("venta").hidden = false;
      setTimeout(() => botones[0] && botones[0].b.focus({ preventScroll: true }), 50);

      function responde(i) {
        const bien = i === q.ok;
        for (const o of botones) {
          o.b.disabled = true;
          if (o.i === q.ok) o.b.classList.add("bien");
          else if (o.i === i) o.b.classList.add("mal");
        }
        const aTiempo = p.limite - G.reloj > p.plazo * 0.4;
        let pago = bien ? p.pago : Math.round(p.pago * 0.5);
        const partes = [`Pedido +${pago}`];
        if (bien) {
          pago += 20;
          partes.push("Cierre +20");
        }
        if (aTiempo) {
          pago += 15;
          partes.push("A tiempo +15");
        }
        G.pts += pago;
        G.entregados++;
        G.preguntas++;
        if (bien) G.correctas++;
        G.camion.paq -= p.cant;
        G.pedidos.splice(G.pedidos.indexOf(p), 1);
        G.ultimo = p.c;
        G.sigPedido = Math.min(G.sigPedido, 6);
        sonido(bien ? "venta" : "error");
        const fb = el("div", "g-fb");
        fb.append(el("h4", bien ? "bien" : "mal", bien ? `¡Venta cerrada! +${pago}` : `Venta a medias +${pago}`));
        fb.append(el("p", null, bien ? q.exp || "Respuesta correcta." : `La respuesta era: ${q.ops[q.ok]}. ${q.exp}`));
        fb.append(el("p", "g-desglose", partes.join(" · ") + " pts" + (q.mod ? ` · Tema: ${q.mod}` : "")));
        const seguir = el("button", "g-b verde", "Seguir manejando");
        seguir.type = "button";
        seguir.style.width = "100%";
        seguir.style.marginTop = "6px";
        seguir.addEventListener("click", () => {
          $("venta").hidden = true;
          G.pausa = false;
          pop(G.camion.x, G.camion.y, `+${pago} pts`, "#7BF07E", 50);
        });
        fb.append(seguir);
        card.append(fb);
        seguir.focus({ preventScroll: true });
      }
    }

    function finJornada() {
      G.modo = "fin";
      G.pausa = true;
      const previo = parseInt(lee("grantala.best", "0"), 10) || 0;
      const record = G.pts > previo;
      if (record) guarda("grantala.best", G.pts);
      const card = $("finCard");
      card.replaceChildren();
      const img = el("img", "g-rino");
      img.src = record ? "img/rino_trofeo.webp" : "img/rino_fiesta.webp";
      img.alt = "";
      card.append(img, el("span", "g-eyebrow", "18:30 · Cierre de jornada"), el("h2", "g-titulo", "¡Jornada terminada!"));
      card.lastChild.style.fontSize = "34px";
      const st = el("div", "g-stats");
      const dato = (k, v, cls) => {
        const d = el("div", cls);
        d.append(el("span", null, k), el("strong", null, String(v)));
        st.append(d);
      };
      dato("Puntos de la jornada", G.pts, "total");
      dato("Pedidos entregados", G.entregados);
      dato("Respuestas correctas", `${G.correctas}/${G.preguntas}`);
      dato("Pinos talados", G.talados);
      dato("Pinos sembrados", G.sembrados);
      dato("Multas forestales", G.multas);
      dato("Clientes perdidos", G.perdidos);
      card.append(st);
      if (record) card.append(el("p", "g-record", "¡Nueva mejor jornada!"));
      else card.append(el("p", "g-mejor", `Tu mejor jornada: ${previo} pts`));
      const acc = el("div", "g-acc");
      const otra = el("button", "g-b verde", "Otra jornada");
      otra.type = "button";
      otra.addEventListener("click", () => empieza("libre"));
      const salir = el("button", "g-b sec", "Salir");
      salir.type = "button";
      salir.addEventListener("click", () => cerrar());
      acc.append(otra, salir);
      card.append(acc);
      $("fin").hidden = false;
      $("mejor").textContent = Math.max(previo, G.pts);
    }

    /* ───────── Tutorial y guía ───────── */
    function toconCercano() {
      const r = jugador();
      let mejor = null,
        md = 1e9;
      for (const p of M.pinos)
        if (p.estado === "tocon") {
          const d = dist(r.x, r.y, p.x, p.y);
          if (d < md) {
            md = d;
            mejor = p;
          }
        }
      return mejor;
    }
    const TUTO = [
      {
        rino: "rino_saludo",
        txt: () => "Súbete al <b>camión TMM</b>: acércate y toca <b>Subir</b> (tecla E).",
        listo: () => G.rino.enCamion,
        meta: () => G.camion,
      },
      {
        rino: "rino_heroe",
        txt: () => "Maneja al <b>bosque</b>: sigue la flecha hasta el camino de terracería.",
        listo: () => dist(jugador().x, jugador().y, M.entrada.x, M.entrada.y) < 180,
        meta: () => M.entrada,
      },
      {
        rino: "rino_triplay",
        txt: () => `Toca <b>Bajar</b> y <b>tala 3 pinos</b>: junto a un pino, toca <b>Talar</b> varias veces. (${Math.min(3, G.talados)}/3)`,
        listo: () => G.talados >= 3,
        meta: () => null,
      },
      {
        rino: "rino_corazon",
        txt: () => `Por cada árbol que talas, <b>siembra uno</b>: toca <b>Sembrar</b> junto a cada tocón. (${Math.min(3, G.sembrados)}/3)`,
        listo: () => G.tocones === 0 && G.sembrados >= 3,
        meta: () => toconCercano(),
      },
      {
        rino: "rino_maestro",
        txt: () => "Sube los troncos al <b>camión</b>: acércate y se cargan solos.",
        listo: () => G.rino.carga === 0 && G.camion.troncos > 0,
        meta: () => (G.rino.enCamion ? null : G.camion),
      },
      {
        rino: "rino_megafono",
        txt: () => "Llévalos al <b>almacén TMM</b> y entra al <b>patio de carga</b> (rayas amarillas).",
        listo: () => G.stock > 0 && G.camion.troncos === 0 && G.rino.carga === 0,
        meta: () => centroMuelle(),
      },
    ];
    function guiaLibre() {
      const k = G.camion,
        r = G.rino;
      if (G.estrellas > 0) {
        const t = toconCercano();
        return { rino: "rino_oops", txt: `¡Te sigue el inspector! <b>Siembra los ${G.tocones} tocones</b> que dejaste.`, meta: t, color: "#ffb020" };
      }
      if (!r.enCamion && r.carga >= CARGA_RINO)
        return { rino: "rino_triplay", txt: "Ya cargas 3 troncos: llévalos al <b>camión</b>.", meta: k, color: "#4fb3ff" };
      if (!G.pedidos.length)
        return { rino: "rino_pensando", txt: "Espera el siguiente pedido. Mientras, <b>tala</b> y junta madera en el almacén.", meta: null };
      const orden = G.pedidos.slice().sort((a, b) => a.limite - b.limite);
      const lista = orden.find((p) => k.paq >= p.cant);
      const ir = (meta, txt, rino, color) =>
        !r.enCamion && dist(r.x, r.y, k.x, k.y) > 260
          ? { rino: "rino_saludo", txt: "Regresa al <b>camión</b>.", meta: k, color: "#4fb3ff" }
          : { rino, txt, meta, color };
      if (lista) return ir(lista.c, `Entrega <b>${lista.cant} paquetes</b> en <b>${lista.c.nombre}</b>.`, "rino_heroe", "#00D200");
      const p = orden[0];
      const falta = p.cant - k.paq;
      const madera = G.stock + k.troncos + r.carga;
      if (madera >= falta)
        return ir(centroMuelle(), `Pasa al <b>almacén TMM</b> a cargar paquetes para ${p.c.corto.toLowerCase()}.`, "rino_megafono", "#4fb3ff");
      if (dentro(r.x, r.y, M.bosque) && !r.enCamion)
        return { rino: "rino_triplay", txt: `<b>Tala</b> pinos y súbelos al camión: faltan ${falta - madera} troncos. ¡Siembra cada tocón!`, meta: null };
      return ir(M.entrada, `Faltan ${falta - madera} troncos: ve al <b>bosque</b> a talar.`, "rino_triplay", "#ffd27a");
    }

    function logicaGuia() {
      if (G.modo === "tuto") {
        const paso = TUTO[G.paso];
        if (paso.listo()) {
          G.paso++;
          sonido("venta");
          if (G.paso >= TUTO.length) {
            aviso("¡Muy bien!", "El aserradero convierte cada tronco en un paquete.");
            setTimeout(() => G && G.modo === "tuto-fin" && arrancaJornada(), 1800);
            G.paso = TUTO.length - 1;
            G.modo = "tuto-fin";
          }
          return;
        }
        const m = paso.meta();
        G.guia = { rino: paso.rino, txt: paso.txt(), meta: m, color: "#ffd27a" };
      } else if (G.modo === "libre") G.guia = guiaLibre();
      else if (G.modo === "tuto-fin") G.guia = { rino: "rino_fiesta", txt: "¡Listo! Ya sabes talar, sembrar y llevar madera al almacén.", meta: null };
      else G.guia = null;
    }

    /* ───────── Bucle ───────── */
    function actualiza(dt) {
      G.tiempo += dt;
      tAnim += dt;
      const jugando = G.modo === "tuto" || G.modo === "libre" || G.modo === "tuto-fin";
      if (G.modo === "libre") {
        G.reloj += dt * RITMO;
        if (G.reloj >= CIERRA) {
          G.reloj = CIERRA;
          finJornada();
          return;
        }
      }
      if (jugando) {
        G.congela = Math.max(0, G.congela - dt);
        if (G.rino.enCamion) {
          mueveCamion(dt);
          G.rino.x = G.camion.x;
          G.rino.y = G.camion.y;
        } else {
          mueveRino(dt);
          G.camion.v *= Math.pow(0.05, dt);
          if (Math.abs(G.camion.v) > 2) {
            G.camion.x += Math.cos(G.camion.a) * G.camion.v * dt;
            G.camion.y += Math.sin(G.camion.a) * G.camion.v * dt;
            colisionCamion(G.camion);
          } else G.camion.v = 0;
        }
        logicaAlmacen(dt);
        if (G.modo === "libre") {
          logicaEntregas();
          logicaPedidos(dt);
        }
        mueveInspector(dt);
        logicaGuia();
      }
      mueveTrafico(dt);
      for (const p of M.pinos) {
        if (p.shake > 0) p.shake = Math.max(0, p.shake - dt);
        if (p.estado === "brote") {
          p.crece += dt;
          if (p.crece >= CRECE) {
            p.estado = "arbol";
            p.hp = 3;
            gridPinos();
          }
        }
      }
      for (const c of G.caidas) c.t += dt;
      for (const c of G.caidas)
        if (c.t > 0.62 && !c.polvo) {
          c.polvo = true;
          astillas(c.x + c.dir * 50, c.y, "#2f9e44", 10, 6);
        }
      G.caidas = G.caidas.filter((c) => c.t < 1.2);
      for (const p of G.parts) {
        p.t += dt;
        p.vy += p.g * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
      }
      G.parts = G.parts.filter((p) => p.t < p.vida);
      for (const p of G.pops) p.t += dt;
      G.pops = G.pops.filter((p) => p.t < 1.3);
      G.shake = Math.max(0, G.shake - dt);
      camara(dt);
    }

    function zoomBase() {
      return clamp(Math.min(cw, ch) / 470, 0.7, 1.35);
    }
    function camara(dt) {
      const P = jugador(),
        k = G.camion,
        en = G.rino.enCamion;
      let tx = P.x,
        ty = P.y;
      let z = zoomBase();
      if (en) {
        tx += Math.cos(k.a) * k.v * 0.32;
        ty += Math.sin(k.a) * k.v * 0.32;
        z *= lerp(1, 0.76, clamp(Math.abs(k.v) / 440, 0, 1));
      }
      if (G.modo === "inicio") {
        tx = 1300 + Math.sin(tAnim * 0.08) * 160;
        ty = 1100;
        z = zoomBase() * 0.85;
      }
      const f = 1 - Math.exp(-5 * dt);
      G.cam.x = lerp(G.cam.x, tx, f);
      G.cam.y = lerp(G.cam.y, ty, f);
      G.cam.z = lerp(G.cam.z, z, 1 - Math.exp(-2.5 * dt));
      const hw = cw / 2 / G.cam.z,
        hh = ch / 2 / G.cam.z;
      G.cam.x = clamp(G.cam.x, hw, Math.max(hw, WW - hw));
      G.cam.y = clamp(G.cam.y, hh, Math.max(hh, WH - hh));
    }

    /* ───────── Dibujo ───────── */
    function pintaMapa() {
      const c = document.createElement("canvas");
      const K = ESC_MAPA;
      c.width = Math.ceil(WW * K);
      c.height = Math.ceil(WH * K);
      const x = c.getContext("2d");
      x.scale(K, K);
      x.fillStyle = "#7fae5f";
      x.fillRect(0, 0, WW, WH);
      x.fillStyle = "#2f6b2a";
      x.fillRect(M.bosque.x, M.bosque.y, M.bosque.w, M.bosque.h);
      for (const m of M.manzanas) {
        x.fillStyle = m.parque ? "#7cc35a" : "#c9cdc6";
        x.fillRect(m.x, m.y, m.w, m.h);
      }
      x.fillStyle = "#a9adaa";
      for (const b of M.edificios) if (b.tipo === "casa") x.fillRect(b.x, b.y, b.w, b.h);
      for (const b of M.edificios) {
        if (b.tipo === "almacen") {
          x.fillStyle = "#0079C1";
          x.fillRect(b.x, b.y, b.w, b.h);
        }
        if (b.cli) {
          x.fillStyle = b.cli.color;
          x.fillRect(b.x, b.y, b.w, b.h);
        }
      }
      x.fillStyle = "#b98c5a";
      for (const t of M.tierra) x.fillRect(t.x, t.y, t.w, t.h);
      x.fillStyle = "#4b545b";
      for (const k of M.calles) x.fillRect(k.x, k.y, k.w, k.h);
      return c;
    }

    // Texturas de ruido para el suelo de la vista clásica
    function patron(base, colores, n) {
      const c = document.createElement("canvas");
      c.width = c.height = 128;
      const x = c.getContext("2d");
      x.fillStyle = base;
      x.fillRect(0, 0, 128, 128);
      for (let i = 0; i < n; i++) {
        x.fillStyle = colores[i % colores.length];
        const t = 1 + R() * 2.5;
        x.fillRect(R() * 128, R() * 128, t, t);
      }
      return ctx.createPattern(c, "repeat");
    }
    const PAT = {
      pasto: patron("#86b866", ["rgba(52,100,36,.3)", "rgba(170,215,120,.35)", "rgba(100,150,70,.35)"], 700),
      bosque: patron("#5e8e46", ["rgba(40,60,25,.45)", "rgba(120,90,50,.3)", "rgba(90,130,60,.4)"], 800),
      asfalto: patron("#3e464d", ["rgba(255,255,255,.05)", "rgba(0,0,0,.18)", "rgba(120,120,120,.12)"], 1000),
      banqueta: patron("#d4d6cf", ["rgba(0,0,0,.06)", "rgba(255,255,255,.3)"], 400),
      tierra: patron("#b98c5a", ["rgba(90,60,30,.3)", "rgba(220,190,140,.35)", "rgba(140,110,80,.35)"], 700),
      "#a6cb86": patron("#a6cb86", ["rgba(60,110,40,.28)", "rgba(200,230,160,.35)"], 600),
      "#d3cdbd": patron("#d3cdbd", ["rgba(0,0,0,.05)", "rgba(255,255,255,.25)"], 400),
      "#5a636b": patron("#5a636b", ["rgba(255,255,255,.05)", "rgba(0,0,0,.15)"], 800),
      "#8cc46a": patron("#8cc46a", ["rgba(60,120,40,.28)", "rgba(200,235,150,.35)"], 600),
    };
    function dibujaSuelo(c, v) {
      c.fillStyle = PAT.pasto;
      c.fillRect(v.x0, v.y0, v.x1 - v.x0, v.y1 - v.y0);
      c.fillStyle = PAT.bosque;
      c.fillRect(M.bosque.x, M.bosque.y, M.bosque.w, M.bosque.h);
      for (const m of M.manzanas) {
        if (m.x > v.x1 || m.x + m.w < v.x0 || m.y > v.y1 || m.y + m.h < v.y0) continue;
        c.fillStyle = PAT.banqueta;
        c.fillRect(m.x, m.y, m.w, m.h);
        c.fillStyle = "rgba(0,0,0,.16)";
        c.fillRect(m.x, m.y, m.w, 3);
        c.fillRect(m.x, m.y + m.h - 3, m.w, 3);
        c.fillRect(m.x, m.y, 3, m.h);
        c.fillRect(m.x + m.w - 3, m.y, 3, m.h);
        c.fillStyle = PAT[m.suelo] || m.suelo;
        c.fillRect(m.x + 16, m.y + 16, m.w - 32, m.h - 32);
        if (m.parque) {
          c.fillStyle = "#e3d9b8";
          c.fillRect(m.x + 16, M.fuente.y - 14, m.w - 32, 28);
          c.fillRect(M.fuente.x - 14, m.y + 16, 28, m.h - 32);
        }
      }
      for (const t of M.matas) {
        if (t.x < v.x0 || t.x > v.x1 || t.y < v.y0 || t.y > v.y1) continue;
        c.strokeStyle = t.b ? "#4d7a39" : "#6f9f52";
        c.lineWidth = 2;
        c.beginPath();
        c.moveTo(t.x - 4, t.y);
        c.lineTo(t.x - 2, t.y - 6);
        c.moveTo(t.x, t.y);
        c.lineTo(t.x + 1, t.y - 8);
        c.moveTo(t.x + 4, t.y);
        c.lineTo(t.x + 4, t.y - 5);
        c.stroke();
      }
      for (const t of M.tierra) {
        c.fillStyle = PAT.tierra;
        c.fillRect(t.x, t.y, t.w, t.h);
        c.fillStyle = "rgba(120,80,40,.45)";
        if (t.w > t.h) {
          c.fillRect(t.x, t.y + t.h * 0.3, t.w, 6);
          c.fillRect(t.x, t.y + t.h * 0.66, t.w, 6);
        } else {
          c.fillRect(t.x + t.w * 0.3, t.y, 6, t.h);
          c.fillRect(t.x + t.w * 0.66, t.y, 6, t.h);
        }
      }
      c.fillStyle = PAT.asfalto;
      for (const k of M.calles) c.fillRect(k.x, k.y, k.w, k.h);
      c.fillStyle = "rgba(0,0,0,.14)";
      for (const k of M.calles) {
        if (k.v) {
          c.fillRect(k.c - 45, k.y, 14, k.h);
          c.fillRect(k.c + 31, k.y, 14, k.h);
        } else {
          c.fillRect(k.x, k.c - 45, k.w, 14);
          c.fillRect(k.x, k.c + 31, k.w, 14);
        }
      }
      c.fillStyle = "#f2c94c";
      for (const r of M.rayas) if (r.x < v.x1 && r.x + r.w > v.x0 && r.y < v.y1 && r.y + r.h > v.y0) c.fillRect(r.x, r.y, r.w, r.h);
      c.fillStyle = "rgba(240,240,240,.85)";
      for (const r of M.cebras) if (r.x < v.x1 && r.x + r.w > v.x0 && r.y < v.y1 && r.y + r.h > v.y0) c.fillRect(r.x, r.y, r.w, r.h);
      // patio de carga del almacén
      const mu = M.muelle;
      const activo = G.modo !== "inicio" && (G.rino.carga > 0 || G.camion.troncos > 0 || G.pedidos.length > 0 || G.modo === "tuto");
      c.fillStyle = activo ? `rgba(0,121,193,${0.2 + 0.12 * Math.sin(tAnim * 4)})` : "rgba(0,121,193,.16)";
      c.fillRect(mu.x, mu.y, mu.w, mu.h);
      c.strokeStyle = "#f2c94c";
      c.lineWidth = 5;
      c.setLineDash([22, 14]);
      c.strokeRect(mu.x, mu.y, mu.w, mu.h);
      c.setLineDash([]);
      c.save();
      c.beginPath();
      c.rect(mu.x, mu.y, mu.w, mu.h);
      c.clip();
      c.strokeStyle = "rgba(242,201,76,.35)";
      c.lineWidth = 8;
      for (let x = mu.x - mu.h; x < mu.x + mu.w; x += 34) {
        c.beginPath();
        c.moveTo(x, mu.y + mu.h);
        c.lineTo(x + mu.h, mu.y);
        c.stroke();
      }
      c.restore();
      c.fillStyle = "#fff";
      c.font = `italic 800 22px ${FUENTE}`;
      c.textAlign = "center";
      c.fillText("PATIO DE CARGA", mu.x + mu.w / 2, mu.y + mu.h / 2 - 4);
      c.font = `600 16px ${FUENTE}`;
      c.fillText(`Almacén: ${G.stock} paquete${G.stock === 1 ? "" : "s"}`, mu.x + mu.w / 2, mu.y + mu.h / 2 + 20);
      // fuente del parque
      if (M.fuente) {
        const f = M.fuente;
        c.fillStyle = "#cfd3cc";
        c.beginPath();
        c.arc(f.x, f.y, f.r, 0, TAU);
        c.fill();
        c.fillStyle = "#5bb8e6";
        c.beginPath();
        c.arc(f.x, f.y, f.r - 9, 0, TAU);
        c.fill();
        c.fillStyle = "rgba(255,255,255,.7)";
        c.beginPath();
        c.arc(f.x, f.y, 8 + Math.sin(tAnim * 3) * 2, 0, TAU);
        c.fill();
      }
    }

    function dibujaEdificio(c, b) {
      const top = b.y - b.alt;
      c.fillStyle = "rgba(0,0,0,.08)";
      c.fillRect(b.x + 16, b.y + 4, b.w, b.h + 8);
      c.fillStyle = "rgba(0,0,0,.12)";
      c.fillRect(b.x + 8, b.y + 4, b.w, b.h + 2);
      c.fillStyle = b.muro;
      c.fillRect(b.x, b.y + b.h - b.alt, b.w, b.alt);
      if (b.tipo === "almacen") {
        c.fillStyle = "#d6dde2";
        const n = 5,
          gw = 74;
        for (let i = 0; i < n; i++) {
          const x = b.x + 60 + i * ((b.w - 120 - gw) / (n - 1));
          c.fillRect(x, b.y + b.h - b.alt + 18, gw, b.alt - 18);
          c.fillStyle = "#b9c2c9";
          for (let y = b.y + b.h - b.alt + 24; y < b.y + b.h; y += 8) c.fillRect(x, y, gw, 2);
          c.fillStyle = "#d6dde2";
        }
      } else if (b.tipo === "obra") {
        c.fillStyle = "#6d7176";
        for (let x = b.x + 10; x < b.x + b.w - 10; x += 46) c.fillRect(x, b.y + b.h - b.alt, 12, b.alt);
      } else if (b.ventanas) {
        c.fillStyle = "rgba(190,225,245,.85)";
        for (let y = b.y + b.h - b.alt + 8; y < b.y + b.h - 14; y += 22) for (let x = b.x + 10; x < b.x + b.w - 20; x += 26) c.fillRect(x, y, 14, 11);
        if (b.cli) {
          c.fillStyle = b.cli.color;
          c.fillRect(b.x, b.y + b.h - b.alt, b.w, 10);
          c.fillStyle = "#3b2a1d";
          c.fillRect(b.x + b.w / 2 - 16, b.y + b.h - 26, 32, 26);
        }
      }
      c.fillStyle = b.techo;
      c.fillRect(b.x, top, b.w, b.h);
      if (!b.grad) {
        b.grad = c.createLinearGradient(b.x, top, b.x + b.w * 0.6, top + b.h);
        b.grad.addColorStop(0, "rgba(255,255,255,.22)");
        b.grad.addColorStop(1, "rgba(0,0,0,.12)");
      }
      c.fillStyle = b.grad;
      c.fillRect(b.x, top, b.w, b.h);
      c.fillStyle = "rgba(255,255,255,.35)";
      c.fillRect(b.x, top, b.w, 3);
      c.fillRect(b.x, top, 3, b.h);
      c.strokeStyle = "rgba(0,0,0,.22)";
      c.lineWidth = 2;
      c.strokeRect(b.x + 1, top + 1, b.w - 2, b.h - 2);
      if (b.tipo === "almacen") {
        c.fillStyle = "rgba(255,255,255,.08)";
        for (let x = b.x + 8; x < b.x + b.w; x += 28) c.fillRect(x, top, 12, b.h);
        const cx = b.x + b.w / 2,
          cy = top + b.h / 2;
        c.fillStyle = "#fff";
        c.font = `italic 900 120px ${FUENTE}`;
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.fillText("TMM", cx - 30, cy - 18);
        c.fillStyle = "#00D200";
        c.beginPath();
        c.moveTo(cx + 120, cy + 26);
        c.lineTo(cx + 172, cy - 62);
        c.lineTo(cx + 196, cy + 26);
        c.closePath();
        c.fill();
        c.fillStyle = "#fff";
        c.font = `700 24px ${FUENTE}`;
        c.fillText("TRIPLAY Y MADERAS DE MAYOREO", cx, cy + 70);
        c.textBaseline = "alphabetic";
      } else if (b.tipo === "obra") {
        c.fillStyle = "#d9b07a";
        for (let y = top + 8; y < top + b.h - 20; y += 34)
          for (let x = b.x + 8; x < b.x + b.w - 30; x += 64) {
            c.fillRect(x, y, 58, 28);
            c.strokeStyle = "#b98a55";
            c.strokeRect(x, y, 58, 28);
          }
        c.fillStyle = "#e0a526";
        c.fillRect(b.x + b.w - 30, top, 8, b.h);
        c.fillRect(b.x + b.w - 70, top + 10, 70, 6);
      } else {
        if (b.extra === 1) {
          c.fillStyle = "rgba(0,0,0,.12)";
          c.fillRect(b.x + b.w * 0.6, top + 12, 26, 20);
        }
        if (b.extra === 2) {
          c.fillStyle = "#7aa7c7";
          c.fillRect(b.x + 14, top + 14, 32, 22);
        }
        if (b.extra === 3) {
          c.fillStyle = "rgba(255,255,255,.35)";
          c.fillRect(b.x + 10, top + b.h - 18, b.w - 20, 6);
        }
      }
      if (b.cli) {
        const cx = b.x + b.w / 2,
          cy = top + b.h / 2;
        c.fillStyle = b.cli.color;
        rr(c, cx - b.w / 2 + 14, cy - 26, b.w - 28, 52, 8);
        c.fill();
        c.fillStyle = "#fff";
        c.textAlign = "center";
        c.textBaseline = "middle";
        let fs = 22;
        c.font = `italic 800 ${fs}px ${FUENTE}`;
        const palabras = b.cli.nombre.split(" ");
        const l1 = palabras[0],
          l2 = palabras.slice(1).join(" ");
        while (fs > 11 && Math.max(c.measureText(l1).width, c.measureText(l2).width) > b.w - 40) {
          fs--;
          c.font = `italic 800 ${fs}px ${FUENTE}`;
        }
        c.fillText(l1, cx, cy - fs * 0.55);
        c.fillText(l2, cx, cy + fs * 0.55);
        c.textBaseline = "alphabetic";
      }
    }

    function triangulo(c, x1, y1, x2, y2, x3, y3) {
      c.beginPath();
      c.moveTo(x1, y1);
      c.lineTo(x2, y2);
      c.lineTo(x3, y3);
      c.closePath();
      c.fill();
    }
    function copaPino(c, x, y, s) {
      c.fillStyle = "#6b4528";
      c.fillRect(x - 4 * s, y - 16 * s, 8 * s, 16 * s);
      for (let k = 0; k < 3; k++) {
        const base = y - (10 + k * 18) * s,
          w = (50 - k * 11) * s,
          h = (36 - k * 4) * s;
        c.fillStyle = "#0b7f2b";
        triangulo(c, x - w / 2, base, x, base, x, base - h);
        c.fillStyle = "#14a33a";
        triangulo(c, x, base, x + w / 2, base, x, base - h);
        c.fillStyle = "#00D200";
        triangulo(c, x + w * 0.18, base - h * 0.36, x + w / 2, base, x + w * 0.32, base);
      }
    }
    function dibujaPino(c, p) {
      const x = p.x + (p.shake > 0 ? Math.sin(tAnim * 70) * p.shake * 12 : 0),
        y = p.y,
        s = p.s;
      c.fillStyle = "rgba(0,0,0,.2)";
      c.beginPath();
      c.ellipse(x + 5, y, 22 * s, 7 * s, 0, 0, TAU);
      c.fill();
      if (p.estado === "tocon") {
        c.fillStyle = "#7a5232";
        c.fillRect(x - 7, y - 9, 14, 9);
        c.fillStyle = "#e1bd86";
        c.beginPath();
        c.ellipse(x, y - 9, 7, 3.5, 0, 0, TAU);
        c.fill();
        c.strokeStyle = "#b78b55";
        c.lineWidth = 1;
        c.beginPath();
        c.ellipse(x, y - 9, 3.5, 1.7, 0, 0, TAU);
        c.stroke();
        return;
      }
      if (p.estado === "brote") {
        const g = clamp(p.crece / CRECE, 0, 1);
        copaPino(c, x, y, 0.22 + g * 0.55);
        return;
      }
      copaPino(c, x, y, s);
    }
    function dibujaCaida(c, k) {
      const t = clamp(k.t / 0.6, 0, 1);
      c.save();
      c.globalAlpha = k.t > 0.7 ? clamp(1 - (k.t - 0.7) / 0.5, 0, 1) : 1;
      c.translate(k.x, k.y - 2);
      c.rotate(k.dir * t * t * 1.45);
      copaPino(c, 0, 0, k.s);
      c.restore();
    }
    function dibujaArbolRedondo(c, d) {
      c.fillStyle = "rgba(0,0,0,.18)";
      c.beginPath();
      c.ellipse(d.x + 6, d.y, d.r * 0.9, d.r * 0.35, 0, 0, TAU);
      c.fill();
      c.fillStyle = "#6b4528";
      c.fillRect(d.x - 4, d.y - 20, 8, 20);
      c.fillStyle = "#3f8f3a";
      c.beginPath();
      c.arc(d.x, d.y - 20 - d.r * 0.7, d.r, 0, TAU);
      c.fill();
      c.fillStyle = "#5cb24a";
      c.beginPath();
      c.arc(d.x + d.r * 0.3, d.y - 24 - d.r * 0.85, d.r * 0.55, 0, TAU);
      c.fill();
    }

    function dibujaRino(c, x, y, f, fase, chop, carga) {
      c.save();
      c.translate(x, y);
      c.fillStyle = "rgba(0,0,0,.22)";
      c.beginPath();
      c.ellipse(0, 0, 13, 4.5, 0, 0, TAU);
      c.fill();
      c.scale(f, 1);
      const paso = Math.sin(fase) * 3.2,
        bob = fase ? Math.abs(Math.cos(fase)) * 1.6 : 0;
      c.lineWidth = 1.6;
      c.strokeStyle = "#1d1d1d";
      c.lineJoin = "round";
      const pierna = (dx, lev) => {
        c.fillStyle = "#2f62b5";
        c.fillRect(dx - 3.5, -15 - lev, 7, 10);
        c.strokeRect(dx - 3.5, -15 - lev, 7, 10);
        c.fillStyle = "#2a2a2a";
        rr(c, dx - 4.5, -6 - lev, 10, 6, 2);
        c.fill();
        c.stroke();
      };
      pierna(-4, Math.max(0, paso) * 0.7);
      pierna(4, Math.max(0, -paso) * 0.7);
      c.translate(0, -bob);
      for (let i = 0; i < carga; i++) {
        c.fillStyle = "#8b5a2b";
        rr(c, -22, -33 - i * 7, 16, 7, 3);
        c.fill();
        c.stroke();
        c.fillStyle = "#e1bd86";
        c.beginPath();
        c.ellipse(-22, -29.5 - i * 7, 2.5, 3.5, 0, 0, TAU);
        c.fill();
      }
      c.fillStyle = "#a59d90";
      c.beginPath();
      c.ellipse(-9, -23 + paso * 0.4, 3.5, 6, 0.3, 0, TAU);
      c.fill();
      c.stroke();
      c.fillStyle = "#226b62";
      rr(c, -10, -31, 20, 18, 5);
      c.fill();
      c.stroke();
      c.fillStyle = "#d07a2c";
      c.fillRect(-10, -16, 20, 3.5);
      c.fillStyle = "#3fb6e8";
      c.fillRect(-6, -26, 8, 2.5);
      c.fillStyle = "#00D200";
      triangulo(c, 3, -23.5, 6, -28.5, 7.5, -23.5);
      c.fillStyle = "#b3ab9d";
      c.beginPath();
      c.ellipse(3, -40, 11, 9.5, 0, 0, TAU);
      c.fill();
      c.stroke();
      c.beginPath();
      c.ellipse(12, -37, 7.5, 6, -0.2, 0, TAU);
      c.fill();
      c.stroke();
      c.fillStyle = "#f2c9a0";
      c.beginPath();
      c.moveTo(12, -42);
      c.quadraticCurveTo(15, -50, 20, -55);
      c.lineTo(17.5, -42);
      c.closePath();
      c.fill();
      c.stroke();
      c.beginPath();
      c.moveTo(5.5, -47.5);
      c.lineTo(8, -53);
      c.lineTo(10.5, -47);
      c.closePath();
      c.fill();
      c.stroke();
      c.fillStyle = "#b3ab9d";
      c.beginPath();
      c.ellipse(-6, -47, 3.5, 5.5, -0.5, 0, TAU);
      c.fill();
      c.stroke();
      c.fillStyle = "#1d1d1d";
      c.beginPath();
      c.arc(7.5, -42, 1.7, 0, TAU);
      c.fill();
      c.beginPath();
      c.arc(16.5, -36, 0.9, 0, TAU);
      c.fill();
      c.beginPath();
      c.moveTo(9, -33.5);
      c.quadraticCurveTo(12, -31.5, 15, -33);
      c.stroke();
      c.save();
      c.translate(4, -26);
      const g = chop > 0 ? 1 - chop / 0.26 : -1;
      c.rotate(g >= 0 ? lerp(-2.2, 0.8, g * g) : 0.5 + Math.sin(fase) * 0.35);
      c.fillStyle = "#6b4528";
      c.fillRect(8, -1.5, 18, 3);
      c.fillStyle = "#c9d1d6";
      c.beginPath();
      c.moveTo(22, -2);
      c.lineTo(29, -8);
      c.lineTo(30, 4);
      c.lineTo(22, 2);
      c.closePath();
      c.fill();
      c.stroke();
      c.fillStyle = "#b3ab9d";
      c.beginPath();
      c.ellipse(5, 0, 7, 3.6, 0, 0, TAU);
      c.fill();
      c.stroke();
      c.beginPath();
      c.arc(11, 0, 3.6, 0, TAU);
      c.fill();
      c.stroke();
      c.restore();
      c.restore();
    }

    function dibujaPeaton(c, p) {
      const x = p.x + p.ox,
        y = p.y + p.oy,
        salto = p.salto > 0 ? Math.sin((p.salto / 0.8) * Math.PI) * 10 : 0;
      c.fillStyle = "rgba(0,0,0,.18)";
      c.beginPath();
      c.ellipse(x, y, 8, 3, 0, 0, TAU);
      c.fill();
      const pa = Math.sin(p.fase) * 2.5;
      c.fillStyle = "#34495e";
      c.fillRect(x - 4, y - 10 - salto + Math.max(0, pa), 3, 9);
      c.fillRect(x + 1, y - 10 - salto + Math.max(0, -pa), 3, 9);
      c.fillStyle = p.ropa;
      rr(c, x - 6, y - 22 - salto, 12, 13, 4);
      c.fill();
      c.fillStyle = p.piel;
      c.beginPath();
      c.arc(x, y - 27 - salto, 5.5, 0, TAU);
      c.fill();
      c.fillStyle = "#2c2c2c";
      c.beginPath();
      c.arc(x - p.f * 1, y - 29 - salto, 5.5, Math.PI, TAU);
      c.fill();
    }

    function dibujaCamion(c, k) {
      c.save();
      c.translate(k.x, k.y);
      c.rotate(k.a);
      c.fillStyle = "rgba(0,0,0,.25)";
      rr(c, -46, -17, 100, 46, 7);
      c.fill();
      c.fillStyle = "#1b1b1b";
      for (const [lx, ly] of [
        [-36, -25],
        [-36, 19],
        [24, -25],
        [24, 19],
      ])
        c.fillRect(lx, ly, 16, 6);
      c.fillStyle = "#6e5236";
      rr(c, -50, -22, 68, 44, 3);
      c.fill();
      c.fillStyle = "#b8905f";
      c.fillRect(-47, -19, 62, 38);
      c.strokeStyle = "rgba(90,60,30,.4)";
      c.lineWidth = 1;
      for (let y = -12; y < 19; y += 7) {
        c.beginPath();
        c.moveTo(-47, y);
        c.lineTo(15, y);
        c.stroke();
      }
      let n = 0;
      const slot = (i) => [-46 + (i % 6) * 10.2, i < 6 ? -18 : 0.5];
      for (let i = 0; i < k.troncos && n < CAP; i++, n++) {
        const [sx, sy] = slot(n);
        c.fillStyle = "#8b5a2b";
        rr(c, sx, sy, 9.5, 17.5, 3);
        c.fill();
        c.fillStyle = "#e1bd86";
        c.beginPath();
        c.ellipse(sx + 4.75, sy + 2.5, 3.6, 2.2, 0, 0, TAU);
        c.fill();
      }
      for (let i = 0; i < k.paq && n < CAP; i++, n++) {
        const [sx, sy] = slot(n);
        c.fillStyle = "#e7cf9c";
        c.fillRect(sx, sy, 9.5, 17.5);
        c.fillStyle = "#b8925a";
        for (let yy = sy + 3; yy < sy + 17; yy += 4) c.fillRect(sx, yy, 9.5, 1.2);
        c.fillStyle = "#0079C1";
        c.fillRect(sx + 3.5, sy, 2.5, 17.5);
      }
      c.fillStyle = "#0079C1";
      rr(c, 18, -22, 33, 44, 7);
      c.fill();
      c.fillStyle = "#005E97";
      c.fillRect(18, -22, 5, 44);
      c.fillStyle = "#0b2a40";
      rr(c, 38, -18, 10, 36, 3);
      c.fill();
      c.fillStyle = "#00D200";
      triangulo(c, 24, 9, 30, -10, 35, 9);
      c.fillStyle = "#fff6c8";
      c.fillRect(49, -19, 3, 8);
      c.fillRect(49, 11, 3, 8);
      c.fillStyle = "#e0402a";
      c.fillRect(-51, -20, 2.5, 7);
      c.fillRect(-51, 13, 2.5, 7);
      c.restore();
    }
    function dibujaCarro(c, x, y, a, color, inspector) {
      c.save();
      c.translate(x, y);
      c.rotate(a);
      c.fillStyle = "rgba(0,0,0,.25)";
      rr(c, -25, -9, 56, 28, 7);
      c.fill();
      c.fillStyle = "#1b1b1b";
      for (const [lx, ly] of [
        [-20, -15],
        [-20, 11],
        [10, -15],
        [10, 11],
      ])
        c.fillRect(lx, ly, 11, 4);
      c.fillStyle = color;
      rr(c, -28, -13, 56, 26, 8);
      c.fill();
      if (inspector) {
        c.fillStyle = "#1e8e3e";
        c.fillRect(-28, -3, 56, 6);
      }
      c.fillStyle = "#1c3344";
      rr(c, 6, -10, 11, 20, 3);
      c.fill();
      rr(c, -20, -9, 8, 18, 3);
      c.fill();
      c.fillStyle = inspector ? "#f4f4f4" : matiz(color.startsWith("#") ? color : "#888888", 0.18);
      rr(c, -12, -10, 18, 20, 3);
      c.fill();
      if (inspector) {
        const on = Math.floor(tAnim * 8) % 2;
        c.fillStyle = on ? "#ffb020" : "#00D200";
        c.fillRect(-6, -9, 6, 8);
        c.fillStyle = on ? "#00D200" : "#ffb020";
        c.fillRect(-6, 1, 6, 8);
      }
      c.fillStyle = "#fff6c8";
      c.fillRect(27, -11, 2, 5);
      c.fillRect(27, 6, 2, 5);
      c.restore();
    }

    function dibujaMarca(c, x, y, color, n) {
      const p = (Math.sin(tAnim * 4) + 1) / 2;
      c.save();
      c.globalAlpha = 0.22;
      c.fillStyle = color;
      c.beginPath();
      c.arc(x, y, 64, 0, TAU);
      c.fill();
      c.globalAlpha = 0.9;
      c.strokeStyle = color;
      c.lineWidth = 5;
      c.beginPath();
      c.arc(x, y, 54 + p * 8, 0, TAU);
      c.stroke();
      c.restore();
      if (n) {
        c.fillStyle = "#fff";
        c.font = `italic 900 26px ${FUENTE}`;
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.fillText(String(n), x, y);
        c.textBaseline = "alphabetic";
      }
    }
    function chevron(c, x, y, color) {
      const b = Math.sin(tAnim * 5) * 6;
      c.fillStyle = color;
      c.strokeStyle = "rgba(0,0,0,.45)";
      c.lineWidth = 3;
      c.beginPath();
      c.moveTo(x - 16, y - 30 + b);
      c.lineTo(x + 16, y - 30 + b);
      c.lineTo(x, y - 8 + b);
      c.closePath();
      c.stroke();
      c.fill();
    }

    function dibuja() {
      const z = G.cam.z;
      let sx = 0,
        sy = 0;
      if (G.shake > 0) {
        sx = (Math.random() - 0.5) * 14 * G.shake;
        sy = (Math.random() - 0.5) * 14 * G.shake;
      }
      const ox = cw / 2 - G.cam.x * z + sx,
        oy = ch / 2 - G.cam.y * z + sy;
      ctx.setTransform(dpr * z, 0, 0, dpr * z, dpr * ox, dpr * oy);
      const v = { x0: G.cam.x - cw / 2 / z - 140, x1: G.cam.x + cw / 2 / z + 140, y0: G.cam.y - ch / 2 / z - 60, y1: G.cam.y + ch / 2 / z + 160 };
      const ver = (x, y) => x > v.x0 && x < v.x1 && y > v.y0 && y < v.y1;
      dibujaSuelo(ctx, v);

      const jugando = G.modo !== "inicio";
      if (jugando) {
        for (const p of G.pedidos) if (ver(p.c.x, p.c.y)) dibujaMarca(ctx, p.c.x, p.c.y, G.camion.paq >= p.cant ? "#00D200" : "#ffd27a", p.n);
        const m = G.guia && G.guia.meta;
        if (m && G.modo === "tuto" && m === M.entrada) dibujaMarca(ctx, m.x, m.y, "#ffd27a");
      }

      const lista = [];
      for (const b of M.edificios)
        if (b.x < v.x1 && b.x + b.w > v.x0 && b.y - b.alt < v.y1 && b.y + b.h > v.y0) lista.push({ y: b.y + b.h, f: () => dibujaEdificio(ctx, b) });
      for (const p of M.pinos) if (ver(p.x, p.y)) lista.push({ y: p.y, f: () => dibujaPino(ctx, p) });
      for (const d of M.deco) if (ver(d.x, d.y)) lista.push({ y: d.y, f: () => dibujaArbolRedondo(ctx, d) });
      for (const k of G.caidas) lista.push({ y: k.y + 1, f: () => dibujaCaida(ctx, k) });
      for (const p of G.peatones) if (ver(p.x, p.y)) lista.push({ y: p.y + p.oy, f: () => dibujaPeaton(ctx, p) });
      for (const c of G.carros) if (ver(c.x, c.y)) lista.push({ y: c.y + 14, f: () => dibujaCarro(ctx, c.x, c.y, c.a, c.color) });
      for (const s of G.insp)
        if (ver(s.x, s.y))
          lista.push({
            y: s.y + 14,
            f: () => {
              ctx.globalAlpha = clamp(s.alfa, 0, 1);
              dibujaCarro(ctx, s.x, s.y, s.a, "#f4f4f4", true);
              ctx.globalAlpha = 1;
            },
          });
      const k = G.camion;
      lista.push({ y: k.y + 22, f: () => dibujaCamion(ctx, k) });
      const r = G.rino;
      if (!r.enCamion) lista.push({ y: r.y, f: () => dibujaRino(ctx, r.x, r.y, r.f, r.fase, r.chop, r.carga) });
      lista.sort((a, b) => a.y - b.y);
      for (const it of lista) it.f();
      const noche = G.modo === "libre" || G.modo === "fin" ? clamp((G.reloj - 1040) / 70, 0, 1) : 0;
      if (noche > 0) {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        const faro = (x, y, a, largo) => {
          const g = ctx.createRadialGradient(x, y, 4, x, y, largo);
          g.addColorStop(0, `rgba(255,240,190,${0.38 * noche})`);
          g.addColorStop(1, "rgba(255,240,190,0)");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.arc(x, y, largo, a - 0.42, a + 0.42);
          ctx.closePath();
          ctx.fill();
        };
        faro(k.x + Math.cos(k.a) * 50, k.y + Math.sin(k.a) * 50, k.a, 240);
        for (const c of G.carros) if (ver(c.x, c.y)) faro(c.x + Math.cos(c.a) * 28, c.y + Math.sin(c.a) * 28, c.a, 150);
        ctx.restore();
      }

      for (const p of G.parts) {
        const a = 1 - p.t / p.vida;
        ctx.globalAlpha = clamp(a, 0, 1);
        ctx.fillStyle = p.c;
        if (p.polvo) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.s * (1 + p.t * 2), 0, TAU);
          ctx.fill();
        } else ctx.fillRect(p.x - p.s / 2, p.y - p.s / 2, p.s, p.s);
      }
      ctx.globalAlpha = 1;

      if (jugando && !r.enCamion && G.ctxP && (G.ctx === "talar" || G.ctx === "sembrar")) {
        const p = G.ctxP;
        ctx.strokeStyle = G.ctx === "talar" ? "rgba(255,255,255,.85)" : "rgba(123,240,126,.95)";
        ctx.lineWidth = 3;
        ctx.setLineDash([6, 5]);
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, 24, 9, 0, 0, TAU);
        ctx.stroke();
        ctx.setLineDash([]);
        if (G.ctx === "talar") {
          for (let i = 0; i < 3; i++) {
            ctx.fillStyle = i < p.hp ? "#ffd27a" : "rgba(255,255,255,.25)";
            ctx.fillRect(p.x - 16 + i * 11, p.y + 10, 9, 4);
          }
        }
      }
      const meta = G.guia && G.guia.meta;
      if (jugando && meta && ver(meta.x, meta.y) && !(meta === k && r.enCamion))
        chevron(ctx, meta.x, meta.y - (meta === k ? 34 : 70), G.guia.color || "#ffd27a");
      else if (jugando && !r.enCamion && dist(r.x, r.y, k.x, k.y) < 92) chevron(ctx, k.x, k.y - 34, "#4fb3ff");

      ctx.textAlign = "center";
      for (const p of G.pops) {
        const a = 1 - p.t / 1.3;
        ctx.globalAlpha = clamp(a * 1.6, 0, 1);
        ctx.font = `italic 800 17px ${FUENTE}`;
        ctx.lineWidth = 4;
        ctx.strokeStyle = "rgba(0,0,0,.55)";
        ctx.strokeText(p.txt, p.x, p.y - p.alto - p.t * 40);
        ctx.fillStyle = p.color;
        ctx.fillText(p.txt, p.x, p.y - p.alto - p.t * 40);
      }
      ctx.globalAlpha = 1;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (G.modo === "libre" && G.reloj > 1010) {
        const a = clamp((G.reloj - 1010) / 100, 0, 1);
        ctx.fillStyle = `rgba(255,140,60,${0.12 * a})`;
        ctx.fillRect(0, 0, cw, ch);
        ctx.fillStyle = `rgba(20,30,80,${0.2 * a})`;
        ctx.fillRect(0, 0, cw, ch);
      }
      if (jugando && meta) flechaBorde(ox + meta.x * z, oy + (meta.y - 30) * z, false);
      viñeta();
    }

    function flechaBorde(mx, my, detras) {
      const m = 44;
      if (!detras && mx >= m && mx <= cw - m && my >= m + 60 && my <= ch - m - 60) return;
      const cx = cw / 2,
        cy = ch / 2;
      let dx = mx - cx,
        dy = my - cy;
      if (detras) {
        dx = -dx;
        dy = Math.abs(dy) + ch * 0.25;
      }
      const ang = Math.atan2(dy, dx);
      const kx = (cw / 2 - m) / Math.abs(Math.cos(ang) || 1e-6),
        ky = (ch / 2 - m - 70) / Math.abs(Math.sin(ang) || 1e-6);
      const rad = Math.min(kx, ky);
      ctx.save();
      ctx.translate(cx + Math.cos(ang) * rad, cy + Math.sin(ang) * rad);
      ctx.rotate(ang);
      ctx.fillStyle = (G.guia && G.guia.color) || "#ffd27a";
      ctx.strokeStyle = "rgba(0,0,0,.5)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(18, 0);
      ctx.lineTo(-12, -14);
      ctx.lineTo(-5, 0);
      ctx.lineTo(-12, 14);
      ctx.closePath();
      ctx.stroke();
      ctx.fill();
      ctx.restore();
    }

    // Viñeta suave en las orillas de la pantalla
    let viñetaCache = null;
    function viñeta() {
      if (!viñetaCache || viñetaCache.w !== cw || viñetaCache.h !== ch) {
        const g = ctx.createRadialGradient(cw / 2, ch / 2, Math.min(cw, ch) * 0.35, cw / 2, ch / 2, Math.hypot(cw, ch) * 0.62);
        g.addColorStop(0, "rgba(0,0,0,0)");
        g.addColorStop(1, "rgba(6,20,30,.32)");
        viñetaCache = { w: cw, h: ch, g };
      }
      ctx.fillStyle = viñetaCache.g;
      ctx.fillRect(0, 0, cw, ch);
    }

    // Capa 2D sobre el 3D: chispas, textos flotantes, vida del pino y flecha al objetivo
    function dibujaEncima() {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cw, ch);
      const jugando = G.modo !== "inicio";
      for (const p of G.parts) {
        const y0 = p.y0 != null ? p.y0 : p.y;
        const s = R3.proyecta(p.x, Math.max(0, y0 - p.y) + (p.polvo ? 4 : 0), y0);
        if (s.detras) continue;
        ctx.globalAlpha = clamp(1 - p.t / p.vida, 0, 1);
        ctx.fillStyle = p.c;
        const t = p.polvo ? p.s * (1 + p.t * 2) * 1.4 : p.s * 1.5;
        if (p.polvo) {
          ctx.beginPath();
          ctx.arc(s.x, s.y, t, 0, TAU);
          ctx.fill();
        } else ctx.fillRect(s.x - t / 2, s.y - t / 2, t, t);
      }
      ctx.globalAlpha = 1;
      const r = G.rino;
      if (jugando && !r.enCamion && G.ctxP && G.ctx === "talar") {
        const p = G.ctxP,
          s = R3.proyecta(p.x, 6, p.y);
        if (!s.detras)
          for (let i = 0; i < 3; i++) {
            ctx.fillStyle = i < p.hp ? "#ffd27a" : "rgba(255,255,255,.35)";
            ctx.fillRect(s.x - 17 + i * 12, s.y + 6, 10, 5);
          }
      }
      ctx.textAlign = "center";
      for (const p of G.pops) {
        const s = R3.proyecta(p.x, p.alto + 20 + p.t * 40, p.y);
        if (s.detras) continue;
        ctx.globalAlpha = clamp((1 - p.t / 1.3) * 1.6, 0, 1);
        ctx.font = `italic 800 18px ${FUENTE}`;
        ctx.lineWidth = 4;
        ctx.strokeStyle = "rgba(0,0,0,.55)";
        ctx.strokeText(p.txt, s.x, s.y);
        ctx.fillStyle = p.color;
        ctx.fillText(p.txt, s.x, s.y);
      }
      ctx.globalAlpha = 1;
      const meta = G.guia && G.guia.meta;
      if (jugando && meta && !(meta === G.camion && r.enCamion)) {
        const s = R3.proyecta(meta.x, 40, meta.y);
        flechaBorde(s.x, s.y, s.detras);
      }
      if (vistaActiva() === "primera" && jugando && !r.enCamion) {
        ctx.fillStyle = "rgba(255,255,255,.75)";
        ctx.beginPath();
        ctx.arc(cw / 2, ch / 2, 2.5, 0, TAU);
        ctx.fill();
      }
      viñeta();
    }

    function dibujaMini() {
      const s = 112 * dpr,
        K = ESC_MAPA * 0.9;
      mini.width !== s && (mini.width = mini.height = s);
      mc.setTransform(dpr, 0, 0, dpr, 0, 0);
      mc.fillStyle = "#22301f";
      mc.fillRect(0, 0, 112, 112);
      const P = jugador();
      const ox = 56 - P.x * K,
        oy = 56 - P.y * K;
      mc.drawImage(mapa, ox, oy, mapa.width * 0.9, mapa.height * 0.9);
      const punto = (x, y, color, rad, texto, borde) => {
        let px = ox + x * K,
          py = oy + y * K;
        px = clamp(px, 7, 105);
        py = clamp(py, 7, 105);
        mc.fillStyle = color;
        mc.beginPath();
        mc.arc(px, py, rad, 0, TAU);
        mc.fill();
        if (borde) {
          mc.strokeStyle = "#fff";
          mc.lineWidth = 1.5;
          mc.stroke();
        }
        if (texto) {
          mc.fillStyle = "#062f4d";
          mc.font = `800 8px ${FUENTE}`;
          mc.textAlign = "center";
          mc.textBaseline = "middle";
          mc.fillText(texto, px, py + 0.5);
        }
      };
      const mu = centroMuelle();
      punto(mu.x, mu.y, "#4fb3ff", 5.5, "A", true);
      for (const p of G.pedidos) punto(p.c.x, p.c.y, G.camion.paq >= p.cant ? "#00D200" : "#ffd27a", 5.5, String(p.n), true);
      if (G.guia && G.guia.meta === M.entrada) punto(M.entrada.x, M.entrada.y, "#ffd27a", 4, null, true);
      for (const s2 of G.insp) if (!s2.vete) punto(s2.x, s2.y, Math.floor(tAnim * 6) % 2 ? "#ffb020" : "#fff", 3.5);
      if (!G.rino.enCamion) punto(G.camion.x, G.camion.y, "#0079C1", 3.5, null, true);
      mc.save();
      mc.translate(56, 56);
      mc.rotate(G.rino.enCamion ? G.camion.a : G.rino.f > 0 ? 0 : Math.PI);
      mc.fillStyle = "#fff";
      mc.strokeStyle = "#062f4d";
      mc.lineWidth = 1.5;
      mc.beginPath();
      mc.moveTo(7, 0);
      mc.lineTo(-5, -5);
      mc.lineTo(-2, 0);
      mc.lineTo(-5, 5);
      mc.closePath();
      mc.fill();
      mc.stroke();
      mc.restore();
    }

    /* ───────── HUD ───────── */
    const hud = { t: 0, mision: "", pedidos: "", carga: "", est: -1, acc: "", sub: "" };
    const hora = (m) => `${Math.floor(m / 60)}:${String(Math.floor(m % 60)).padStart(2, "0")}`;
    function pintaHud(dt) {
      hud.t -= dt;
      if (hud.t > 0) return;
      hud.t = 0.1;
      const jugando = G.modo !== "inicio";
      $("reloj").textContent = G.modo === "libre" || G.modo === "fin" ? hora(G.reloj) : G.modo === "inicio" ? "8:30" : "Tutorial";
      $("pts").textContent = `${G.pts} pts`;
      const k = G.camion,
        r = G.rino;
      const carga = jugando
        ? `Camión: <b>${k.troncos}</b> troncos · <b>${k.paq}</b> paquetes <i>(${k.troncos + k.paq}/${CAP})</i>${!r.enCamion && r.carga ? `<br>En la espalda: <b>${r.carga}</b>/${CARGA_RINO}` : ""}`
        : "";
      if (carga !== hud.carga) {
        hud.carga = carga;
        $("carga").innerHTML = carga;
        $("carga").hidden = !carga;
      }
      const ped = G.pedidos
        .map((p) => {
          const resta = Math.max(0, p.limite - G.reloj);
          const cls = k.paq >= p.cant ? "ok" : resta < p.plazo * 0.3 ? "urge" : "";
          const h = Math.floor(resta / 60),
            mi = Math.floor(resta % 60);
          return `<li class="${cls}"><span class="n">${p.n}</span><b>${p.c.corto} · ${p.cant} paq.</b><small>${p.prod} · ${h ? `${h} h ` : ""}${mi} min</small></li>`;
        })
        .join("");
      if (ped !== hud.pedidos) {
        hud.pedidos = ped;
        $("pedidos").innerHTML = ped;
      }
      if (G.estrellas !== hud.est) {
        hud.est = G.estrellas;
        const cont = $("estrellas");
        cont.querySelectorAll("svg").forEach((s, i) => s.classList.toggle("on", i < G.estrellas));
        cont.classList.toggle("caza", G.estrellas > 0);
      }
      const g = G.guia;
      const mis = jugando && g ? `<img src="img/${g.rino}.webp" alt=""><span>${g.txt}</span>` : "";
      if (mis !== hud.mision) {
        hud.mision = mis;
        $("mision").innerHTML = mis;
      }
      let acc, off;
      if (r.enCamion) {
        acc = "Claxon";
        off = false;
      } else if (G.ctx === "talar") {
        acc = "Talar";
        off = false;
      } else if (G.ctx === "sembrar") {
        acc = "Sembrar";
        off = false;
      } else if (G.ctx === "lleno") {
        acc = "Lleno";
        off = true;
      } else {
        acc = "Talar";
        off = true;
      }
      const sub = r.enCamion ? "Bajar" : "Subir";
      const subOff = !r.enCamion && dist(r.x, r.y, k.x, k.y) >= 92;
      const firma = acc + off + sub + subOff;
      if (firma !== hud.acc) {
        hud.acc = firma;
        bAcc.innerHTML = `${acc}<small>${tactil ? "" : "ESPACIO"}</small>`;
        bAcc.classList.toggle("off", off);
        bSub.innerHTML = `${sub}<small>${tactil ? "" : "E"}</small>`;
        bSub.classList.toggle("off", subOff);
      }
      bAcc.hidden = bSub.hidden = !jugando || G.modo === "fin";
      dibujaMini();
    }

    function sonidoContinuo() {
      if (!A.c || !A.mg) return;
      const t = A.c.currentTime;
      const en = G && G.rino.enCamion && !G.pausa && G.modo !== "inicio";
      const v = en ? Math.abs(G.camion.v) : 0;
      A.mg.gain.setTargetAtTime(en ? 0.05 + (v / 440) * 0.07 : 0, t, 0.1);
      A.motor.frequency.setTargetAtTime(42 + v * 0.17, t, 0.1);
      const caza = G && G.insp.some((s) => !s.vete) && !G.pausa;
      A.sg.gain.setTargetAtTime(caza ? 0.022 : 0, t, 0.15);
      A.sir.frequency.setTargetAtTime(640 + Math.sin(tAnim * 5) * 160, t, 0.05);
    }

    function ajusta() {
      cw = Math.max(1, raiz.clientWidth);
      ch = Math.max(1, raiz.clientHeight);
      dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = Math.round(cw * dpr);
      cv.height = Math.round(ch * dpr);
      if (R3) R3.ajusta(cw, ch);
      guiaStick();
    }
    window.addEventListener("resize", ajusta, sig);

    let raf = 0,
      ultimo = performance.now();
    function cuadro(t) {
      raf = requestAnimationFrame(cuadro);
      const dt = Math.min(0.05, Math.max(0, (t - ultimo) / 1000));
      ultimo = t;
      if (!G.pausa) actualiza(dt);
      else tAnim += dt * 0.2;
      const va = vistaActiva();
      if (va === "clasica") dibuja();
      else {
        R3.render(G, va, dt, tAnim);
        dibujaEncima();
      }
      pintaHud(dt);
      sonidoContinuo();
    }

    function cerrar() {
      cerrado = true;
      cancelAnimationFrame(raf);
      if (R3) R3.destruye();
      R3 = null;
      ac.abort();
      clearTimeout(toastT);
      if (A.c) A.c.close().catch(() => {});
      raiz.remove();
      document.body.style.overflow = overflowPrevio;
      if (vp && vpPrevio != null) vp.setAttribute("content", vpPrevio);
      [document.documentElement.style.overscrollBehavior, document.body.style.overscrollBehavior] = rebotePrevio;
      G = null;
      if (alCerrar) alCerrar();
    }

    nuevaPartida("inicio");
    pintaVista();
    if (vista !== "clasica") activa3D();
    if (/[?&]debug\b/.test(location.search))
      window.__granTala = {
        get G() {
          return G;
        },
        M,
        get R3() {
          return R3;
        },
        vista: (v) => {
          vista = v;
          if (v !== "clasica") activa3D();
          pintaVista();
        },
        avanza: (n, dt) => {
          for (let i = 0; i < n && G && !G.pausa; i++) actualiza(dt || 1 / 30);
          if (vistaActiva() === "clasica") dibuja();
          else {
            R3.render(G, vistaActiva(), dt || 1 / 30, tAnim);
            dibujaEncima();
          }
          hud.t = 0;
          pintaHud(0);
        },
      };
    raf = requestAnimationFrame(cuadro);
    setTimeout(() => $("jugar").focus({ preventScroll: true }), 50);
    return cerrar;
  };
})();
