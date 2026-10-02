/* Motor 3D de Gran Tala Ags (Three.js r160, archivo local en vendor/).
   Dibuja el mismo mundo (M) y estado (G) que la vista clásica 2D, con tres cámaras:
   aérea (norte arriba), tercera persona y primera persona. Las coordenadas del juego
   (x, y) se vuelven (x, z) en 3D; y es la altura.
   GranTala3D.crea(THREE, M, opc) → { lienzo, render, ajusta, proyecta, destruye }. */
(function () {
  "use strict";

  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const lerp = (a, b, t) => a + (b - a) * t;
  const angDif = (a, b) => {
    let d = (a - b) % TAU;
    if (d > Math.PI) d -= TAU;
    if (d < -Math.PI) d += TAU;
    return d;
  };
  const FUENTE = "'Exo 2', Montserrat, system-ui, sans-serif";
  function semilla(s) {
    return () => {
      s = (s + 0x6d2b79f5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function crea(THREE, M, opc) {
    const { WW, WH } = opc;
    const movil = !!opc.movil;
    const R = semilla(4242);
    const renderer = new THREE.WebGLRenderer({ antialias: !movil, powerPreference: "high-performance" });
    let calidad = movil ? 1 : 2;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, movil ? 1.5 : 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    const lienzo = renderer.domElement;
    lienzo.className = "g-3d";
    lienzo.setAttribute("aria-hidden", "true");

    const escena = new THREE.Scene();
    const camara = new THREE.PerspectiveCamera(60, 1, 2, 16000);
    escena.add(camara);
    const basura = [];
    const D = (o) => (basura.push(o), o);
    const C = (h) => new THREE.Color(h);
    const T = (x, y, z) => new THREE.Matrix4().makeTranslation(x, y, z);
    const TRS = (x, y, z, rx, ry, rz, sx, sy, sz) =>
      new THREE.Matrix4().compose(
        new THREE.Vector3(x, y, z),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(rx || 0, ry || 0, rz || 0)),
        new THREE.Vector3(sx || 1, sy || sx || 1, sz || sx || 1),
      );

    /* Acumulador de geometría no indexada con color por vértice (para fundir mallas estáticas). */
    class Malla {
      constructor() {
        this.p = [];
        this.n = [];
        this.u = [];
        this.c = [];
      }
      quad(a, b, c, d, n, uv, color) {
        const [u0, v0, u1, v1] = uv || [0, 0, 1, 1];
        const P = [a, b, c, a, c, d];
        const U = [
          [u0, v0],
          [u1, v0],
          [u1, v1],
          [u0, v0],
          [u1, v1],
          [u0, v1],
        ];
        for (let i = 0; i < 6; i++) {
          this.p.push(P[i][0], P[i][1], P[i][2]);
          this.n.push(n[0], n[1], n[2]);
          this.u.push(U[i][0], U[i][1]);
          this.c.push(color.r, color.g, color.b);
        }
      }
      geo(g, m, color, grad) {
        const gg = g.index ? g.toNonIndexed() : g.clone();
        g.dispose();
        if (m) gg.applyMatrix4(m);
        const pos = gg.attributes.position,
          nor = gg.attributes.normal,
          uv = gg.attributes.uv;
        for (let i = 0; i < pos.count; i++) {
          const x = pos.getX(i),
            y = pos.getY(i),
            z = pos.getZ(i);
          this.p.push(x, y, z);
          this.n.push(nor.getX(i), nor.getY(i), nor.getZ(i));
          this.u.push(uv ? uv.getX(i) : 0, uv ? uv.getY(i) : 0);
          const cc = grad ? grad(x, y, z) : color;
          this.c.push(cc.r, cc.g, cc.b);
        }
        gg.dispose();
      }
      caja(x, y, z, w, h, d, color, ry) {
        this.geo(new THREE.BoxGeometry(w, h, d), ry ? TRS(x, y, z, 0, ry, 0) : T(x, y, z), color);
      }
      build() {
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.Float32BufferAttribute(this.p, 3));
        g.setAttribute("normal", new THREE.Float32BufferAttribute(this.n, 3));
        g.setAttribute("uv", new THREE.Float32BufferAttribute(this.u, 2));
        g.setAttribute("color", new THREE.Float32BufferAttribute(this.c, 3));
        g.computeBoundingSphere();
        return D(g);
      }
    }

    function lienzoTex(w, h, pinta, repite) {
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      const x = c.getContext("2d");
      pinta(x, w, h);
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      if (repite) t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.lienzo = c;
      return D(t);
    }
    function mosaicoRuido(base, colores, n, tam) {
      const c = document.createElement("canvas");
      c.width = c.height = tam || 128;
      const x = c.getContext("2d");
      x.fillStyle = base;
      x.fillRect(0, 0, c.width, c.height);
      for (let i = 0; i < n; i++) {
        x.fillStyle = colores[i % colores.length];
        const s = 1 + R() * 2.5;
        x.fillRect(R() * c.width, R() * c.height, s, s);
      }
      return c;
    }
    const lambert = (o) => D(new THREE.MeshLambertMaterial(o));
    const basica = (o) => D(new THREE.MeshBasicMaterial(o));

    /* ───────── Cielo y luz ───────── */
    const cieloMat = D(
      new THREE.ShaderMaterial({
        uniforms: { arriba: { value: C("#5aa9e6") }, horizonte: { value: C("#d7ecf7") } },
        vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
        fragmentShader:
          "uniform vec3 arriba; uniform vec3 horizonte; varying vec3 vP; void main(){ float h = clamp(vP.y*1.6+0.08,0.0,1.0); gl_FragColor = vec4(mix(horizonte, arriba, pow(h,0.7)),1.0);\n#include <colorspace_fragment>\n}",
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
      }),
    );
    const cielo = new THREE.Mesh(D(new THREE.SphereGeometry(9000, 24, 12)), cieloMat);
    cielo.renderOrder = -10;
    escena.add(cielo);
    escena.fog = new THREE.Fog(0xd7ecf7, 900, 3400);
    const hemi = new THREE.HemisphereLight(0xd6ecff, 0x6b7a4a, 1.15);
    escena.add(hemi);
    const sol = new THREE.DirectionalLight(0xfff3dc, 2.3);
    sol.castShadow = true;
    sol.shadow.mapSize.set(movil ? 1024 : 2048, movil ? 1024 : 2048);
    sol.shadow.bias = -0.0004;
    sol.shadow.normalBias = 0.8;
    const sc = sol.shadow.camera;
    sc.near = 50;
    sc.far = 3500;
    escena.add(sol, sol.target);

    /* ───────── Suelo (una textura con calles, banquetas, terracería y patio) ───────── */
    const S = movil ? 0.55 : 0.95;
    const suelo = lienzoTex(Math.round(WW * S), Math.round(WH * S), (x) => {
      x.scale(S, S);
      const pat = (c) => x.createPattern(c, "repeat");
      x.fillStyle = pat(mosaicoRuido("#78ad57", ["rgba(52,100,36,.35)", "rgba(160,205,110,.35)", "rgba(90,140,60,.4)"], 900));
      x.fillRect(0, 0, WW, WH);
      const b = M.bosque;
      x.fillStyle = pat(mosaicoRuido("#4e7837", ["rgba(40,60,25,.5)", "rgba(120,90,50,.35)", "rgba(80,120,50,.45)"], 1100));
      x.fillRect(b.x, b.y, b.w, b.h);
      for (const p of M.pinos) {
        const g = x.createRadialGradient(p.x, p.y, 2, p.x, p.y, 34);
        g.addColorStop(0, "rgba(20,40,10,.45)");
        g.addColorStop(1, "rgba(20,40,10,0)");
        x.fillStyle = g;
        x.fillRect(p.x - 34, p.y - 34, 68, 68);
      }
      const banq = pat(mosaicoRuido("#cdd0c8", ["rgba(0,0,0,.06)", "rgba(255,255,255,.25)"], 500));
      const pasto = pat(mosaicoRuido("#9cc77a", ["rgba(60,110,40,.3)", "rgba(190,225,150,.35)"], 700));
      const piso = pat(mosaicoRuido("#d6d0c0", ["rgba(0,0,0,.05)", "rgba(255,255,255,.2)"], 500));
      const asfalto = pat(mosaicoRuido("#3c434a", ["rgba(255,255,255,.05)", "rgba(0,0,0,.18)", "rgba(120,120,120,.12)"], 1400));
      for (const m of M.manzanas) {
        x.fillStyle = banq;
        x.fillRect(m.x, m.y, m.w, m.h);
        x.strokeStyle = "rgba(0,0,0,.08)";
        x.lineWidth = 1.5;
        for (let s = m.x; s < m.x + m.w; s += 34) {
          x.beginPath();
          x.moveTo(s, m.y);
          x.lineTo(s, m.y + 16);
          x.moveTo(s, m.y + m.h - 16);
          x.lineTo(s, m.y + m.h);
          x.stroke();
        }
        x.fillStyle = "rgba(0,0,0,.18)";
        x.fillRect(m.x, m.y, m.w, 2.5);
        x.fillRect(m.x, m.y + m.h - 2.5, m.w, 2.5);
        x.fillRect(m.x, m.y, 2.5, m.h);
        x.fillRect(m.x + m.w - 2.5, m.y, 2.5, m.h);
        x.fillStyle = m.parque
          ? pat(mosaicoRuido("#86c063", ["rgba(60,120,40,.3)", "rgba(200,235,150,.35)"], 700))
          : m.suelo === "#5a636b"
            ? asfalto
            : m.suelo === "#a6cb86"
              ? pasto
              : piso;
        x.fillRect(m.x + 16, m.y + 16, m.w - 32, m.h - 32);
        if (m.parque) {
          x.fillStyle = "#e3d6b0";
          x.fillRect(m.x + 16, M.fuente.y - 15, m.w - 32, 30);
          x.fillRect(M.fuente.x - 15, m.y + 16, 30, m.h - 32);
        }
        if (m.suelo === "#5a636b") {
          x.strokeStyle = "rgba(255,255,255,.75)";
          x.lineWidth = 3;
          for (let s = m.x + 40; s < M.muelle.x - 30; s += 46) {
            x.beginPath();
            x.moveTo(s, m.y + m.h - 110);
            x.lineTo(s, m.y + m.h - 30);
            x.stroke();
          }
        }
      }
      for (const c of M.clientes) {
        x.fillStyle = c.obra ? "#b8956a" : "#e2ddd2";
        x.fillRect(c.x - 120, c.y - 50, 240, 100);
      }
      const tierra = pat(mosaicoRuido("#b38755", ["rgba(90,60,30,.35)", "rgba(220,190,140,.35)", "rgba(140,110,80,.4)"], 900));
      for (const t of M.tierra) {
        x.fillStyle = tierra;
        x.fillRect(t.x, t.y, t.w, t.h);
        x.fillStyle = "rgba(110,75,40,.35)";
        if (t.w > t.h) {
          x.fillRect(t.x, t.y + t.h * 0.3, t.w, 8);
          x.fillRect(t.x, t.y + t.h * 0.64, t.w, 8);
        } else {
          x.fillRect(t.x + t.w * 0.3, t.y, 8, t.h);
          x.fillRect(t.x + t.w * 0.64, t.y, 8, t.h);
        }
      }
      x.fillStyle = asfalto;
      for (const k of M.calles) x.fillRect(k.x, k.y, k.w, k.h);
      x.fillStyle = "rgba(0,0,0,.16)";
      for (const k of M.calles) {
        if (k.v) {
          x.fillRect(k.c - 38 - 7, k.y, 14, k.h);
          x.fillRect(k.c + 38 - 7, k.y, 14, k.h);
        } else {
          x.fillRect(k.x, k.c - 38 - 7, k.w, 14);
          x.fillRect(k.x, k.c + 38 - 7, k.w, 14);
        }
      }
      x.fillStyle = "#f2c94c";
      for (const r of M.rayas) x.fillRect(r.x, r.y, r.w, r.h);
      x.fillStyle = "#ececec";
      for (const r of M.cebras) x.fillRect(r.x, r.y, r.w, r.h);
      x.fillStyle = "#2c3238";
      for (const q of M.cruces) {
        x.beginPath();
        x.arc(q.x + 30, q.y - 30, 7, 0, TAU);
        x.fill();
      }
      const mu = M.muelle;
      x.fillStyle = "rgba(0,121,193,.28)";
      x.fillRect(mu.x, mu.y, mu.w, mu.h);
      x.save();
      x.beginPath();
      x.rect(mu.x, mu.y, mu.w, mu.h);
      x.clip();
      x.strokeStyle = "rgba(242,201,76,.45)";
      x.lineWidth = 9;
      for (let s = mu.x - mu.h; s < mu.x + mu.w; s += 34) {
        x.beginPath();
        x.moveTo(s, mu.y + mu.h);
        x.lineTo(s + mu.h, mu.y);
        x.stroke();
      }
      x.restore();
      x.strokeStyle = "#f2c94c";
      x.lineWidth = 6;
      x.setLineDash([24, 14]);
      x.strokeRect(mu.x, mu.y, mu.w, mu.h);
      x.setLineDash([]);
      x.fillStyle = "#fff";
      x.font = `italic 900 30px ${FUENTE}`;
      x.textAlign = "center";
      x.fillText("PATIO DE CARGA", mu.x + mu.w / 2, mu.y + mu.h / 2 + 10);
    });
    const sueloMesh = new THREE.Mesh(D(new THREE.PlaneGeometry(WW, WH)), lambert({ map: suelo }));
    sueloMesh.rotation.x = -Math.PI / 2;
    sueloMesh.position.set(WW / 2, 0, WH / 2);
    sueloMesh.receiveShadow = true;
    escena.add(sueloMesh);
    const afuera = new THREE.Mesh(D(new THREE.PlaneGeometry(30000, 30000)), lambert({ color: 0x5d8a43 }));
    afuera.rotation.x = -Math.PI / 2;
    afuera.position.set(WW / 2, -0.6, WH / 2);
    afuera.receiveShadow = true;
    escena.add(afuera);

    /* ───────── Edificios (fundidos en pocas mallas) ───────── */
    const MOD_W = 46,
      MOD_H = 38;
    const ventanas = (comercial) =>
      lienzoTex(
        128,
        128,
        (x, w, h) => {
          x.fillStyle = "#ffffff";
          x.fillRect(0, 0, w, h);
          x.fillStyle = "rgba(0,0,0,.05)";
          for (let i = 0; i < 300; i++) x.fillRect(R() * w, R() * h, 2, 2);
          x.fillStyle = "rgba(0,0,0,.12)";
          x.fillRect(0, h - 6, w, 6);
          const vw = comercial ? 96 : 64,
            vh = comercial ? 70 : 60;
          const vx = (w - vw) / 2,
            vy = (h - vh) / 2 - 6;
          x.fillStyle = "#e9e9e9";
          x.fillRect(vx - 6, vy - 6, vw + 12, vh + 14);
          const g = x.createLinearGradient(0, vy, 0, vy + vh);
          g.addColorStop(0, "#3d5a73");
          g.addColorStop(1, "#22364a");
          x.fillStyle = g;
          x.fillRect(vx, vy, vw, vh);
          x.fillStyle = "rgba(255,255,255,.22)";
          x.beginPath();
          x.moveTo(vx, vy + vh * 0.7);
          x.lineTo(vx + vw * 0.45, vy);
          x.lineTo(vx + vw * 0.62, vy);
          x.lineTo(vx, vy + vh);
          x.fill();
          x.fillStyle = "#e9e9e9";
          x.fillRect(vx + vw / 2 - 2, vy, 4, vh);
        },
        true,
      );
    const mascara = lienzoTex(
      128,
      128,
      (x, w, h) => {
        x.fillStyle = "#000";
        x.fillRect(0, 0, w, h);
        x.fillStyle = "#fff";
        x.fillRect((w - 80) / 2, (h - 64) / 2 - 6, 80, 64);
      },
      true,
    );
    const matCasa = lambert({ map: ventanas(false), vertexColors: true, emissiveMap: mascara, emissive: 0xffc56a, emissiveIntensity: 0 });
    const matComercio = lambert({ map: ventanas(true), vertexColors: true, emissiveMap: mascara, emissive: 0xffc56a, emissiveIntensity: 0 });
    const mCasa = new Malla(),
      mCom = new Malla(),
      mTecho = new Malla();
    function muros(m, x0, z0, w, d, H, color) {
      const x1 = x0 + w,
        z1 = z0 + d,
        u = (l) => l / MOD_W,
        v = H / MOD_H;
      m.quad([x0, 0, z1], [x1, 0, z1], [x1, H, z1], [x0, H, z1], [0, 0, 1], [0, 0, u(w), v], color);
      m.quad([x1, 0, z0], [x0, 0, z0], [x0, H, z0], [x1, H, z0], [0, 0, -1], [0, 0, u(w), v], color);
      m.quad([x1, 0, z1], [x1, 0, z0], [x1, H, z0], [x1, H, z1], [1, 0, 0], [0, 0, u(d), v], color);
      m.quad([x0, 0, z0], [x0, 0, z1], [x0, H, z1], [x0, H, z0], [-1, 0, 0], [0, 0, u(d), v], color);
    }
    function techo(x0, z0, w, d, H, color) {
      mTecho.quad([x0, H, z0 + d], [x0 + w, H, z0 + d], [x0 + w, H, z0], [x0, H, z0], [0, 1, 0], null, color);
      const pc = color.clone().multiplyScalar(1.12);
      mTecho.caja(x0 + w / 2, H + 3, z0 + 2, w, 6, 4, pc);
      mTecho.caja(x0 + w / 2, H + 3, z0 + d - 2, w, 6, 4, pc);
      mTecho.caja(x0 + 2, H + 3, z0 + d / 2, 4, 6, d - 8, pc);
      mTecho.caja(x0 + w - 2, H + 3, z0 + d / 2, 4, 6, d - 8, pc);
    }
    const NEGRO = C("#1f2326"),
      GRIS = C("#9aa1a6");
    const letreros = [];
    function letrero(texto, fondo, w, h, sub) {
      return lienzoTex(512, Math.round((512 * h) / w), (x, cw, chh) => {
        x.fillStyle = fondo;
        x.fillRect(0, 0, cw, chh);
        x.fillStyle = "rgba(255,255,255,.18)";
        x.fillRect(0, 0, cw, 6);
        x.fillStyle = "#fff";
        x.textAlign = "center";
        x.textBaseline = "middle";
        let fs = Math.round(chh * (sub ? 0.42 : 0.55));
        x.font = `italic 900 ${fs}px ${FUENTE}`;
        while (x.measureText(texto).width > cw - 30 && fs > 10) x.font = `italic 900 ${--fs}px ${FUENTE}`;
        x.fillText(texto, cw / 2, sub ? chh * 0.4 : chh / 2);
        if (sub) {
          x.font = `700 ${Math.round(chh * 0.2)}px ${FUENTE}`;
          x.fillText(sub, cw / 2, chh * 0.78);
        }
      });
    }

    for (const b of M.edificios) {
      if (b.tipo === "almacen") continue;
      if (b.tipo === "obra") {
        construyeObra(b);
        continue;
      }
      const H = b.tipo === "cliente" ? 104 : Math.round(56 + b.alt * 1.55);
      b.h3 = H;
      const color = C(b.techo);
      if (b.tipo === "cliente") {
        muros(mCom, b.x, b.y, b.w, b.h, H, color);
        techo(b.x, b.y, b.w, b.h, H, C("#bdb7ab"));
        const cli = b.cli,
          cc = C(cli.color);
        const cx = b.x + b.w / 2,
          cz = b.y + b.h / 2;
        const tex = letrero(cli.nombre, cli.color, 260, 46);
        const mat = lambert({ map: tex });
        const pl = new THREE.Mesh(D(new THREE.PlaneGeometry(240, 42)), mat);
        let ox = 0,
          oz = 0,
          ry = 0;
        if (cli.lado === "N") {
          pl.position.set(cx, 80, b.y - 1.5);
          ry = Math.PI;
          oz = -1;
        } else if (cli.lado === "S") {
          pl.position.set(cx, 80, b.y + b.h + 1.5);
          oz = 1;
        } else {
          pl.position.set(b.x - 1.5, 80, cz);
          ry = -Math.PI / 2;
          ox = -1;
        }
        pl.rotation.y = ry;
        escena.add(pl);
        letreros.push(pl);
        const fx = ox ? b.x - 10 : cx,
          fz = oz ? (oz < 0 ? b.y - 10 : b.y + b.h + 10) : cz;
        mTecho.caja(fx, 52, fz, ox ? 20 : 200, 4, ox ? 200 : 20, cc);
        const px = ox ? b.x - 0.6 : cx,
          pz = oz ? (oz < 0 ? b.y - 0.6 : b.y + b.h + 0.6) : cz;
        mTecho.caja(px, 22, pz, ox ? 2 : 34, 44, ox ? 34 : 2, C("#3b2a1d"));
      } else {
        muros(mCasa, b.x, b.y, b.w, b.h, H, color);
        techo(b.x, b.y, b.w, b.h, H, color.clone().multiplyScalar(0.78));
        if (R() < 0.6) {
          const tx = b.x + 18 + R() * Math.max(1, b.w - 36),
            tz = b.y + 18 + R() * Math.max(1, b.h - 36);
          mTecho.geo(new THREE.CylinderGeometry(8, 8, 16, 10), T(tx, H + 8, tz), NEGRO);
          mTecho.caja(tx, H + 1, tz, 18, 2, 18, GRIS);
        }
        if (R() < 0.5) mTecho.caja(b.x + b.w * (0.3 + R() * 0.4), H + 6, b.y + b.h * (0.3 + R() * 0.4), 18, 12, 14, C("#c5cbd0"));
      }
    }
    function construyeObra(b) {
      b.h3 = 120;
      const conc = C("#b9b6ae"),
        cim = C("#d9b07a"),
        amar = C("#e0a526");
      for (const y of [40, 80, 120]) mTecho.caja(b.x + b.w / 2, y - 3, b.y + b.h / 2, b.w - 8, 6, b.h - 8, conc);
      for (let x = b.x + 8; x <= b.x + b.w - 8; x += (b.w - 16) / 4)
        for (const z of [b.y + 8, b.y + b.h / 2, b.y + b.h - 8]) mTecho.caja(x, 60, z, 9, 120, 9, C("#a7a49c"));
      for (let x = b.x + 24; x < b.x + b.w - 30; x += 52) for (let z = b.y + 24; z < b.y + b.h - 30; z += 40) mTecho.caja(x + 20, 123, z + 15, 46, 3, 34, cim);
      mTecho.caja(b.x + b.w - 30, 132, b.y + 30, 10, 18, 10, cim);
      const gx = b.x + b.w - 20,
        gz = b.y + b.h - 20;
      mTecho.caja(gx, 140, gz, 14, 280, 14, amar);
      mTecho.caja(gx - 70, 284, gz, 260, 9, 9, amar);
      mTecho.caja(gx + 75, 280, gz, 34, 18, 16, C("#6d7176"));
      mTecho.caja(gx - 170, 230, gz, 2, 100, 2, NEGRO);
      mTecho.caja(gx - 170, 178, gz, 30, 6, 30, cim);
      const cli = b.cli;
      const pl = new THREE.Mesh(D(new THREE.PlaneGeometry(180, 50)), lambert({ map: letrero(cli.nombre, cli.color, 180, 50, "Cimbra y triplay TMM") }));
      pl.position.set(b.x + b.w / 2, 30, b.y - 30);
      pl.rotation.y = Math.PI;
      escena.add(pl);
      mTecho.caja(b.x + b.w / 2 - 80, 15, b.y - 30, 4, 30, 4, GRIS);
      mTecho.caja(b.x + b.w / 2 + 80, 15, b.y - 30, 4, 30, 4, GRIS);
    }

    // Almacén TMM
    const A = M.almacen;
    const AH = 150;
    const matAlm = lambert({
      map: lienzoTex(
        64,
        64,
        (x, w, h) => {
          x.fillStyle = "#0079C1";
          x.fillRect(0, 0, w, h);
          for (let i = 0; i < w; i += 8) {
            x.fillStyle = "rgba(255,255,255,.12)";
            x.fillRect(i, 0, 3, h);
            x.fillStyle = "rgba(0,0,0,.12)";
            x.fillRect(i + 5, 0, 2, h);
          }
        },
        true,
      ),
    });
    const mAlm = new Malla();
    muros(mAlm, A.x, A.y, A.w, A.h, AH, C("#ffffff"));
    for (let i = 0; i < mAlm.u.length; i += 2) mAlm.u[i] *= MOD_W / 24;
    const almMesh = new THREE.Mesh(mAlm.build(), matAlm);
    almMesh.castShadow = almMesh.receiveShadow = true;
    escena.add(almMesh);
    const texTechoAlm = lienzoTex(1024, 512, (x, w, h) => {
      x.fillStyle = "#0a6fb0";
      x.fillRect(0, 0, w, h);
      for (let i = 0; i < w; i += 22) {
        x.fillStyle = "rgba(255,255,255,.07)";
        x.fillRect(i, 0, 9, h);
      }
      x.fillStyle = "#fff";
      x.textAlign = "center";
      x.textBaseline = "middle";
      x.font = `italic 900 230px ${FUENTE}`;
      x.fillText("TMM", w / 2 - 70, h / 2 - 30);
      x.fillStyle = "#00D200";
      x.beginPath();
      x.moveTo(w / 2 + 170, h / 2 + 60);
      x.lineTo(w / 2 + 270, h / 2 - 120);
      x.lineTo(w / 2 + 310, h / 2 + 60);
      x.fill();
      x.fillStyle = "#fff";
      x.font = `700 44px ${FUENTE}`;
      x.fillText("TRIPLAY Y MADERAS DE MAYOREO", w / 2, h / 2 + 140);
    });
    const techoAlm = new THREE.Mesh(D(new THREE.PlaneGeometry(A.w, A.h)), lambert({ map: texTechoAlm }));
    techoAlm.rotation.x = -Math.PI / 2;
    techoAlm.position.set(A.x + A.w / 2, AH, A.y + A.h / 2);
    techoAlm.receiveShadow = true;
    escena.add(techoAlm);
    const texCortina = lienzoTex(
      64,
      64,
      (x, w, h) => {
        x.fillStyle = "#d9e0e5";
        x.fillRect(0, 0, w, h);
        for (let i = 0; i < h; i += 6) {
          x.fillStyle = "#aeb8c0";
          x.fillRect(0, i, w, 2);
        }
      },
      true,
    );
    const matCortina = lambert({ map: texCortina });
    for (let i = 0; i < 5; i++) {
      const x0 = A.x + 60 + i * ((A.w - 120 - 90) / 4);
      const pl = new THREE.Mesh(D(new THREE.PlaneGeometry(90, 78)), matCortina);
      pl.position.set(x0 + 45, 39, A.y + A.h + 0.8);
      escena.add(pl);
      mTecho.caja(x0 + 45, 82, A.y + A.h + 7, 100, 4, 14, C("#e8eef2"));
    }
    const texLetreroAlm = lienzoTex(1024, 220, (x, w, h) => {
      x.fillStyle = "#fff";
      x.fillRect(0, 0, w, h);
      x.fillStyle = "#0079C1";
      x.textAlign = "left";
      x.textBaseline = "middle";
      x.font = `italic 900 150px ${FUENTE}`;
      x.fillText("TMM", 40, h / 2 + 6);
      const tw = x.measureText("TMM").width;
      x.fillStyle = "#00D200";
      x.beginPath();
      x.moveTo(40 + tw + 4, h / 2 + 62);
      x.lineTo(40 + tw + 54, h / 2 - 66);
      x.lineTo(40 + tw + 74, h / 2 + 62);
      x.fill();
      x.fillStyle = "#0079C1";
      x.font = `700 50px ${FUENTE}`;
      x.fillText("TRIPLAY Y MADERAS", 420, h / 2 - 30);
      x.fillText("DE MAYOREO", 420, h / 2 + 34);
      x.fillStyle = "#00A400";
      x.font = `italic 800 34px ${FUENTE}`;
      x.fillText("¡Tenemos la madera!", 420, h / 2 + 86);
    });
    const letAlm = new THREE.Mesh(D(new THREE.PlaneGeometry(320, 69)), lambert({ map: texLetreroAlm }));
    letAlm.position.set(A.x + A.w / 2, 116, A.y + A.h + 1);
    escena.add(letAlm);

    // Parque: fuente
    if (M.fuente) {
      const f = M.fuente;
      mTecho.geo(new THREE.CylinderGeometry(f.r, f.r + 4, 14, 32), T(f.x, 7, f.y), C("#cfd3cc"));
      mTecho.geo(new THREE.CylinderGeometry(12, 16, 40, 16), T(f.x, 20, f.y), C("#cfd3cc"));
      const agua = new THREE.Mesh(D(new THREE.CylinderGeometry(f.r - 7, f.r - 7, 2, 32)), lambert({ color: 0x4fb3e6, emissive: 0x0b3a55 }));
      agua.position.set(f.x, 13, f.y);
      escena.add(agua);
      const chorro = new THREE.Mesh(D(new THREE.CylinderGeometry(2, 9, 34, 12, 1, true)), basica({ color: 0xdff4ff, transparent: true, opacity: 0.6 }));
      chorro.position.set(f.x, 56, f.y);
      escena.add(chorro);
    }

    const casaMesh = new THREE.Mesh(mCasa.build(), matCasa);
    const comMesh = new THREE.Mesh(mCom.build(), matComercio);
    const techoMesh = new THREE.Mesh(mTecho.build(), lambert({ vertexColors: true }));
    for (const m of [casaMesh, comMesh, techoMesh]) {
      m.castShadow = m.receiveShadow = true;
      escena.add(m);
    }
    A.h3 = AH;

    /* ───────── Pinos (instanciados) ───────── */
    const mp = new Malla();
    mp.geo(new THREE.CylinderGeometry(3.5, 5.5, 66, 6), T(0, 33, 0), C("#6b4528"));
    const capas = [
      [32, 64, 52],
      [26, 56, 84],
      [19, 48, 114],
    ];
    const oscuro = C("#0b5f22"),
      claro = C("#2cb34c"),
      punta = C("#00D200");
    capas.forEach(([rad, alto, base], k) =>
      mp.geo(new THREE.ConeGeometry(rad, alto, 8), T(0, base + alto / 2, 0), null, (x, y, z) => {
        const t = clamp((y - base) / alto, 0, 1);
        const c = oscuro.clone().lerp(claro, 0.25 + t * 0.6);
        if (x + z > rad * 0.4 && t < 0.6) c.lerp(punta, 0.25);
        return c.multiplyScalar(0.92 + k * 0.05);
      }),
    );
    const pinoGeo = mp.build();
    const matPino = lambert({ vertexColors: true, flatShading: true });
    const mt = new Malla();
    mt.geo(new THREE.CylinderGeometry(6.5, 8, 10, 9), T(0, 5, 0), null, (x, y) => (y > 9.9 ? C("#e1bd86") : C("#7a5232")));
    const toconGeo = mt.build();
    const N = M.pinos.length;
    const pinos = new THREE.InstancedMesh(pinoGeo, matPino, N);
    const tocones = new THREE.InstancedMesh(toconGeo, lambert({ vertexColors: true, flatShading: true }), N);
    pinos.castShadow = true;
    pinos.receiveShadow = true;
    tocones.castShadow = true;
    pinos.frustumCulled = tocones.frustumCulled = false;
    pinos.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    tocones.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    // Los pinos que tapan la cámara se dibujan aparte, semitransparentes
    const matFantasma = lambert({ vertexColors: true, flatShading: true, transparent: true, opacity: 0.22, depthWrite: false });
    const fantasmas = new THREE.InstancedMesh(pinoGeo, matFantasma, N);
    fantasmas.frustumCulled = false;
    fantasmas.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    escena.add(pinos, tocones, fantasmas);
    const mtx = new THREE.Matrix4(),
      q = new THREE.Quaternion(),
      e = new THREE.Euler(),
      vp = new THREE.Vector3(),
      vs = new THREE.Vector3();
    const CERO = new THREE.Matrix4().makeScale(0, 0, 0);

    // Bosque de fondo fuera del mapa y montañas lejanas
    const lejanos = [];
    for (let i = 0; i < 900 && lejanos.length < (movil ? 380 : 620); i++) {
      const x = -900 + R() * (WW + 1800),
        z = -900 + R() * (WH + 1800);
      if (x > -40 && x < WW + 40 && z > -40 && z < WH + 40) continue;
      lejanos.push([x, z, 0.9 + R() * 0.6]);
    }
    const fondo = new THREE.InstancedMesh(pinoGeo, matPino, lejanos.length);
    lejanos.forEach(([x, z, s], i) => fondo.setMatrixAt(i, TRS(x, 0, z, 0, R() * TAU, 0, s, s, s)));
    escena.add(fondo);
    const mMont = new Malla();
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * TAU + R() * 0.2,
        r = 5200 + R() * 1200;
      const h = 700 + R() * 900;
      mMont.geo(new THREE.ConeGeometry(1300 + R() * 700, h, 7), T(WW / 2 + Math.cos(a) * r, h / 2 - 40, WH / 2 + Math.sin(a) * r), null, (x, y) =>
        C(y > h * 0.25 ? "#7d9a86" : "#6f8a64"),
      );
    }
    const montMat = lambert({ vertexColors: true, flatShading: true });
    montMat.fog = false;
    const montanas = new THREE.Mesh(mMont.build(), montMat);
    escena.add(montanas);

    // Árboles redondos del parque y de los lotes
    const md = new Malla();
    md.geo(new THREE.CylinderGeometry(3.5, 5, 34, 6), T(0, 17, 0), C("#6b4528"));
    md.geo(new THREE.IcosahedronGeometry(28, 1), T(0, 52, 0), null, (x, y) => C(y > 60 ? "#5cb24a" : "#3f8f3a"));
    md.geo(new THREE.IcosahedronGeometry(17, 1), T(12, 70, 6), C("#6cc456"));
    const decoGeo = md.build();
    const deco = new THREE.InstancedMesh(decoGeo, matPino, Math.max(1, M.deco.length));
    M.deco.forEach((d, i) => deco.setMatrixAt(i, TRS(d.x, 0, d.y, 0, R() * TAU, 0, d.r / 28, d.r / 28, d.r / 28)));
    deco.castShadow = true;
    escena.add(deco);

    // Postes de luz sobre las banquetas
    const postes = [];
    for (const m of M.manzanas) {
      for (let x = m.x + 40; x < m.x + m.w - 30; x += 230) postes.push([x, m.y + 6, Math.PI / 2], [x, m.y + m.h - 6, -Math.PI / 2]);
      for (let z = m.y + 140; z < m.y + m.h - 60; z += 230) postes.push([m.x + 6, z, Math.PI], [m.x + m.w - 6, z, 0]);
    }
    const ml = new Malla();
    ml.geo(new THREE.CylinderGeometry(1.6, 2.2, 90, 6), T(0, 45, 0), C("#4b5257"));
    ml.caja(9, 89, 0, 20, 2.5, 3, C("#4b5257"));
    ml.caja(18, 86.5, 0, 10, 3, 7, C("#2f3438"));
    const posteMesh = new THREE.InstancedMesh(ml.build(), lambert({ vertexColors: true }), postes.length);
    // El brazo apunta hacia la calle (fuera de la manzana)
    postes.forEach(([x, z, a], i) => posteMesh.setMatrixAt(i, TRS(x, 0, z, 0, a, 0)));
    posteMesh.castShadow = true;
    escena.add(posteMesh);
    const focoMat = basica({ color: 0xd9d9d9 });
    const focos = new THREE.InstancedMesh(D(new THREE.BoxGeometry(8, 1.5, 5)), focoMat, postes.length);
    const halos = new THREE.InstancedMesh(
      D(new THREE.CircleGeometry(46, 20)),
      basica({ color: 0xffc56a, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }),
      postes.length,
    );
    postes.forEach(([x, z, ry], i) => {
      const dx = Math.cos(ry) * 18,
        dz = -Math.sin(ry) * 18;
      focos.setMatrixAt(i, TRS(x + dx, 84.5, z + dz, 0, ry, 0));
      halos.setMatrixAt(i, TRS(x + dx, 0.8, z + dz, -Math.PI / 2, 0, 0));
    });
    escena.add(focos, halos);

    /* ───────── Vehículos ───────── */
    function geoCarro(color, inspector) {
      const m = new Malla(),
        c = C(color),
        vidrio = C("#1f3140");
      m.caja(0, 11, 0, 56, 12, 26, c);
      m.caja(-3, 22.5, 0, 30, 11, 22, vidrio);
      m.caja(-3, 28.5, 0, 26, 2, 21, c);
      m.caja(28.5, 9, 0, 2, 6, 27, GRIS);
      m.caja(-28.5, 9, 0, 2, 6, 27, GRIS);
      for (const [x, z] of [
        [17, 12.5],
        [17, -12.5],
        [-17, 12.5],
        [-17, -12.5],
      ])
        m.geo(new THREE.CylinderGeometry(6.5, 6.5, 4, 12), TRS(x, 6.5, z, Math.PI / 2, 0, 0), NEGRO);
      m.caja(28.4, 13, 8, 1.4, 3.5, 6, C("#fff6c8"));
      m.caja(28.4, 13, -8, 1.4, 3.5, 6, C("#fff6c8"));
      m.caja(-28.4, 13, 8, 1.4, 3.5, 6, C("#d63a2a"));
      m.caja(-28.4, 13, -8, 1.4, 3.5, 6, C("#d63a2a"));
      if (inspector) m.caja(0, 14, 0, 57, 3.5, 27, C("#1e8e3e"));
      return m.build();
    }
    const matAuto = lambert({ vertexColors: true });
    const geosColor = new Map();
    const carros3 = [];
    const conoLuz = D(new THREE.ConeGeometry(70, 280, 18, 1, true));
    conoLuz.translate(0, -140, 0);
    conoLuz.rotateZ(Math.PI / 2);
    const matCono = basica({ color: 0xfff1c0, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
    function mallaCarro(c) {
      if (!geosColor.has(c.color)) geosColor.set(c.color, geoCarro(c.color));
      const g = new THREE.Group();
      const m = new THREE.Mesh(geosColor.get(c.color), matAuto);
      m.castShadow = true;
      g.add(m);
      const luz = new THREE.Mesh(conoLuz, matCono);
      luz.position.set(28, 12, 0);
      luz.rotation.z = -0.12;
      luz.scale.set(0.8, 0.8, 0.8);
      g.add(luz);
      escena.add(g);
      return g;
    }

    // Camión TMM
    const camion = new THREE.Group();
    const mc = new Malla();
    const AZUL = C("#0079C1"),
      AZUL_H = C("#005E97"),
      VIDRIO = C("#16293a"),
      MADERA = C("#9a7247"),
      MADERA_H = C("#6e5236");
    mc.caja(0, 11, 0, 100, 6, 38, C("#2b2f33"));
    for (const [x, z] of [
      [31, 19],
      [31, -19],
      [-24, 19],
      [-24, -19],
      [-37, 19],
      [-37, -19],
    ])
      mc.geo(new THREE.CylinderGeometry(9, 9, 7, 14), TRS(x, 9, z, Math.PI / 2, 0, 0), NEGRO);
    mc.caja(34.5, 38, 0, 33, 48, 44, AZUL);
    mc.caja(19, 38, 0, 3, 48, 44, AZUL_H);
    const mv = new Malla();
    mv.caja(51.2, 48, 0, 1.2, 20, 38, VIDRIO);
    mv.caja(40, 49, 22.2, 16, 15, 0.8, VIDRIO);
    mv.caja(40, 49, -22.2, 16, 15, 0.8, VIDRIO);
    mc.caja(51.2, 58.5, 0, 1.4, 3, 44, AZUL_H);
    mc.caja(51.2, 48, 20.5, 1.4, 20, 3, AZUL_H);
    mc.caja(51.2, 48, -20.5, 1.4, 20, 3, AZUL_H);
    mc.caja(52, 15, 0, 3, 9, 45, C("#c9d1d6"));
    mc.caja(51.6, 27, 0, 1, 12, 24, C("#22313d"));
    mc.caja(34.5, 63.5, 0, 26, 3, 40, AZUL_H);
    mc.caja(-16, 19, 0, 68, 4, 44, MADERA);
    mc.caja(-16, 26, 21, 68, 10, 2, MADERA_H);
    mc.caja(-16, 26, -21, 68, 10, 2, MADERA_H);
    mc.caja(-50, 26, 0, 2, 10, 44, MADERA_H);
    mc.caja(17.5, 32, 0, 2, 24, 44, C("#3a3f44"));
    mc.caja(-50.6, 16, 17, 1, 5, 6, C("#d63a2a"));
    mc.caja(-50.6, 16, -17, 1, 5, 6, C("#d63a2a"));
    const camionMesh = new THREE.Mesh(mc.build(), lambert({ vertexColors: true }));
    camionMesh.castShadow = true;
    camionMesh.receiveShadow = true;
    camion.add(camionMesh);
    const matVidrio = lambert({ vertexColors: true, transparent: true, opacity: 0.55, depthWrite: false });
    const vidrios = new THREE.Mesh(mv.build(), matVidrio);
    vidrios.renderOrder = 2;
    camion.add(vidrios);
    const texPuerta = lienzoTex(256, 160, (x, w, h) => {
      x.fillStyle = "#0079C1";
      x.fillRect(0, 0, w, h);
      x.fillStyle = "#fff";
      x.font = `italic 900 92px ${FUENTE}`;
      x.textAlign = "left";
      x.textBaseline = "middle";
      x.fillText("TMM", 18, h / 2 + 4);
      const tw = x.measureText("TMM").width;
      x.fillStyle = "#00D200";
      x.beginPath();
      x.moveTo(18 + tw + 2, h / 2 + 40);
      x.lineTo(18 + tw + 32, h / 2 - 42);
      x.lineTo(18 + tw + 44, h / 2 + 40);
      x.fill();
    });
    const matPuerta = lambert({ map: texPuerta });
    for (const s of [1, -1]) {
      const pl = new THREE.Mesh(D(new THREE.PlaneGeometry(26, 16)), matPuerta);
      pl.position.set(33, 33, s * 22.15);
      if (s < 0) pl.rotation.y = Math.PI;
      camion.add(pl);
    }
    const faroMat = basica({ color: 0xfff6c8 });
    for (const z of [16, -16]) {
      const f = new THREE.Mesh(D(new THREE.BoxGeometry(1.4, 5, 8)), faroMat);
      f.position.set(52.5, 20, z);
      camion.add(f);
    }
    const conoCamion = new THREE.Mesh(conoLuz, matCono);
    conoCamion.position.set(52, 20, 0);
    conoCamion.rotation.z = -0.1;
    camion.add(conoCamion);
    const foco = new THREE.SpotLight(0xfff1c0, 0, 900, 0.55, 0.6, 1);
    foco.position.set(50, 22, 0);
    foco.target.position.set(260, 0, 0);
    camion.add(foco, foco.target);
    // Tablero para la vista de primera persona
    const tablero = new THREE.Group();
    const mtab = new Malla();
    mtab.caja(46, 36, 0, 8, 6, 42, C("#25292d"));
    mtab.caja(49, 41, 0, 3, 2, 42, C("#1a1d20"));
    mtab.geo(new THREE.TorusGeometry(7, 1.2, 8, 24), TRS(42.5, 41, 9, 0, Math.PI / 2, 0.35), C("#15181a"));
    tablero.add(new THREE.Mesh(mtab.build(), lambert({ vertexColors: true })));
    tablero.visible = false;
    camion.add(tablero);
    // Carga: 12 lugares en la caja
    const mlog = new Malla();
    mlog.geo(new THREE.CylinderGeometry(4.8, 4.8, 18, 10), TRS(0, 0, 0, Math.PI / 2, 0, 0), null, (x, y, z) =>
      Math.abs(z) > 8.9 ? C("#e1bd86") : C("#7d4f26"),
    );
    const logGeo = mlog.build();
    const mpaq = new Malla();
    mpaq.caja(0, 0, 0, 9.5, 9, 18, C("#e7cf9c"));
    for (const y of [-2.5, 0.5, 3.5]) mpaq.caja(0, y, 0, 9.7, 0.6, 18.2, C("#b8925a"));
    mpaq.caja(0, 0, 0, 2.6, 9.4, 18.4, C("#0079C1"));
    const paqGeo = mpaq.build();
    const matCarga = lambert({ vertexColors: true });
    const slotsLog = [],
      slotsPaq = [];
    for (let i = 0; i < 12; i++) {
      const sx = -41.25 + (i % 6) * 10.2,
        sz = i < 6 ? -9.4 : 9.4;
      const l = new THREE.Mesh(logGeo, matCarga);
      l.position.set(sx, 26, sz);
      l.castShadow = true;
      const p = new THREE.Mesh(paqGeo, matCarga);
      p.position.set(sx, 25.5, sz);
      p.castShadow = true;
      camion.add(l, p);
      slotsLog.push(l);
      slotsPaq.push(p);
    }
    escena.add(camion);

    // Inspector forestal
    const geoInsp = geoCarro("#f4f4f4", true);
    const matInspBase = lambert({ vertexColors: true, transparent: true });
    const lucesA = basica({ color: 0xffb020 }),
      lucesB = basica({ color: 0x00d200 });
    const inspPool = [0, 1].map(() => {
      const g = new THREE.Group();
      const mat = matInspBase.clone();
      D(mat);
      const m = new THREE.Mesh(geoInsp, mat);
      m.castShadow = true;
      g.add(m);
      const l1 = new THREE.Mesh(D(new THREE.BoxGeometry(6, 4, 9)), lucesA);
      l1.position.set(-3, 32, 5);
      const l2 = new THREE.Mesh(D(new THREE.BoxGeometry(6, 4, 9)), lucesB);
      l2.position.set(-3, 32, -5);
      g.add(l1, l2);
      g.visible = false;
      escena.add(g);
      return { g, mat, l1, l2 };
    });

    /* ───────── El Rino ───────── */
    const matGris = lambert({ color: 0xb3ab9d, flatShading: true });
    const texPlayera = lienzoTex(128, 128, (x, w, h) => {
      x.fillStyle = "#226b62";
      x.fillRect(0, 0, w, h);
      x.fillStyle = "#3fb6e8";
      x.font = `italic 900 40px ${FUENTE}`;
      x.textAlign = "center";
      x.textBaseline = "middle";
      x.fillText("TMM", w / 2 - 8, h / 2 + 4);
      x.fillStyle = "#00D200";
      x.beginPath();
      x.moveTo(w / 2 + 34, h / 2 + 18);
      x.lineTo(w / 2 + 46, h / 2 - 18);
      x.lineTo(w / 2 + 52, h / 2 + 18);
      x.fill();
    });
    const matPlayera = lambert({ color: 0x226b62 });
    const matPlayeraFrente = lambert({ map: texPlayera });
    const matMezclilla = lambert({ color: 0x2f62b5 });
    const matBota = lambert({ color: 0x2a2a2a });
    const matCinto = lambert({ color: 0xd07a2c });
    const matCuerno = lambert({ color: 0xf2c9a0, flatShading: true });
    const matNegro = lambert({ color: 0x1d1d1d });
    const matMango = lambert({ color: 0x6b4528 });
    const matHoja = lambert({ color: 0xc9d1d6 });
    const rino = new THREE.Group();
    const cuerpo = new THREE.Group();
    rino.add(cuerpo);
    const mesh = (geo, mat, x, y, z, padre) => {
      const m = new THREE.Mesh(D(geo), mat);
      m.position.set(x, y, z);
      m.castShadow = true;
      (padre || cuerpo).add(m);
      return m;
    };
    const pierna = (z) => {
      const g = new THREE.Group();
      g.position.set(0, 16, z);
      mesh(new THREE.BoxGeometry(7, 11, 7), matMezclilla, 0, -5.5, 0, g);
      mesh(new THREE.BoxGeometry(11, 6, 8.5), matBota, 1.5, -13, 0, g);
      rino.add(g);
      return g;
    };
    const piernaI = pierna(-4.5),
      piernaD = pierna(4.5);
    mesh(new THREE.BoxGeometry(14, 18, 21), [matPlayeraFrente, matPlayera, matPlayera, matPlayera, matPlayera, matPlayera], 0, 25, 0);
    mesh(new THREE.BoxGeometry(15, 3.6, 22), matCinto, 0, 17, 0);
    const cabeza = mesh(new THREE.SphereGeometry(10, 12, 9), matGris, 2, 41, 0);
    cabeza.scale.set(1.15, 1, 1);
    mesh(new THREE.SphereGeometry(7, 10, 8), matGris, 11, 37, 0).scale.set(1.15, 0.85, 0.9);
    const cg = mesh(new THREE.ConeGeometry(3.4, 14, 8), matCuerno, 15.5, 46, 0);
    cg.rotation.z = -0.55;
    const cc2 = mesh(new THREE.ConeGeometry(2.2, 7, 7), matCuerno, 8, 50, 0);
    cc2.rotation.z = -0.3;
    for (const z of [-6, 6]) {
      mesh(new THREE.SphereGeometry(1.7, 6, 5), matNegro, 9.5, 43.5, z * 0.82);
      const o = mesh(new THREE.SphereGeometry(3.5, 7, 6), matGris, -5, 49, z);
      o.scale.set(0.6, 1.4, 0.8);
    }
    const brazo = (z) => {
      const g = new THREE.Group();
      g.position.set(0, 32, z);
      mesh(new THREE.BoxGeometry(6, 16, 6), matGris, 0, -8, 0, g);
      mesh(new THREE.SphereGeometry(3.8, 8, 6), matGris, 0, -17, 0, g);
      cuerpo.add(g);
      return g;
    };
    const brazoI = brazo(-13),
      brazoD = brazo(13);
    const hacha = new THREE.Group();
    hacha.position.set(0, -17, 0);
    mesh(new THREE.CylinderGeometry(1.4, 1.4, 22, 6), matMango, 0, -9, 0, hacha);
    const hoja = mesh(new THREE.BoxGeometry(9, 8, 1.6), matHoja, -4.5, -18, 0, hacha);
    hoja.castShadow = true;
    brazoD.add(hacha);
    const troncosEspalda = [0, 1, 2].map((i) => {
      const l = new THREE.Mesh(logGeo, matCarga);
      l.position.set(-12, 26 + i * 8.5, 0);
      l.castShadow = true;
      cuerpo.add(l);
      return l;
    });
    escena.add(rino);
    // Hacha en primera persona (pegada a la cámara)
    const vistaHacha = new THREE.Group();
    const brazoFP = new THREE.Group();
    const bm = (geo, mat, x, y, z) => {
      const m = new THREE.Mesh(D(geo), mat);
      m.position.set(x, y, z);
      brazoFP.add(m);
      return m;
    };
    bm(new THREE.BoxGeometry(5.5, 5.5, 20), matGris, 0, -2, 7);
    bm(new THREE.SphereGeometry(4, 8, 6), matGris, 0, -1, -2);
    bm(new THREE.CylinderGeometry(1.3, 1.5, 28, 6), matMango, 0, 11, -3).rotation.x = -0.22;
    bm(new THREE.BoxGeometry(1.8, 9, 12), matHoja, 0, 22, -8.5);
    vistaHacha.add(brazoFP);
    vistaHacha.position.set(13, -15, -24);
    vistaHacha.scale.setScalar(0.62);
    vistaHacha.visible = false;
    camara.add(vistaHacha);

    // Peatones
    const peat3 = [];
    function mallaPeaton(p) {
      const m = new Malla();
      m.caja(0, 7, -2.6, 5, 14, 4.5, C("#34495e"));
      m.caja(0, 7, 2.6, 5, 14, 4.5, C("#34495e"));
      m.caja(0, 21, 0, 8, 14, 12, C(p.ropa));
      m.caja(0, 20, -7.5, 4, 12, 3, C(p.ropa));
      m.caja(0, 20, 7.5, 4, 12, 3, C(p.ropa));
      m.geo(new THREE.SphereGeometry(5.5, 10, 8), T(0, 33, 0), C(p.piel));
      m.geo(new THREE.SphereGeometry(5.8, 10, 8, 0, TAU, 0, Math.PI / 2), T(-0.6, 34, 0), C("#2c2c2c"));
      const g = new THREE.Mesh(m.build(), matAuto);
      g.castShadow = true;
      escena.add(g);
      return { g, px: p.x, py: p.y, a: 0 };
    }

    /* ───────── Marcadores, caídas, letrero del patio ───────── */
    const columnaGeo = D(new THREE.CylinderGeometry(50, 50, 320, 32, 1, true));
    columnaGeo.translate(0, 160, 0);
    const anilloGeo = D(new THREE.RingGeometry(50, 62, 40));
    const numTex = new Map();
    function texNumero(n) {
      if (!numTex.has(n))
        numTex.set(
          n,
          lienzoTex(128, 128, (x, w, h) => {
            x.fillStyle = "#fff";
            x.beginPath();
            x.arc(w / 2, h / 2, 54, 0, TAU);
            x.fill();
            x.fillStyle = "#062f4d";
            x.font = `italic 900 80px ${FUENTE}`;
            x.textAlign = "center";
            x.textBaseline = "middle";
            x.fillText(String(n), w / 2, h / 2 + 4);
          }),
        );
      return numTex.get(n);
    }
    const marcas = [0, 1, 2, 3].map(() => {
      const g = new THREE.Group();
      const matC = basica({ transparent: true, opacity: 0.2, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
      const col = new THREE.Mesh(columnaGeo, matC);
      const matA = basica({ transparent: true, opacity: 0.85, depthWrite: false, side: THREE.DoubleSide });
      const an = new THREE.Mesh(anilloGeo, matA);
      an.rotation.x = -Math.PI / 2;
      an.position.y = 1.2;
      const sp = new THREE.Sprite(D(new THREE.SpriteMaterial({ map: texNumero(1), depthTest: false })));
      sp.scale.set(44, 44, 1);
      sp.position.y = 120;
      sp.renderOrder = 5;
      g.add(col, an, sp);
      g.visible = false;
      escena.add(g);
      return { g, matC, matA, sp };
    });
    const chevronMat = basica({ color: 0xffd27a });
    const chevron = new THREE.Mesh(D(new THREE.ConeGeometry(12, 24, 4)), chevronMat);
    chevron.rotation.x = Math.PI;
    chevron.visible = false;
    escena.add(chevron);
    const aro = new THREE.Mesh(D(new THREE.RingGeometry(20, 25, 28)), basica({ color: 0xffffff, transparent: true, opacity: 0.9, depthWrite: false }));
    aro.rotation.x = -Math.PI / 2;
    aro.visible = false;
    escena.add(aro);
    const caidas3 = [0, 1, 2, 3].map(() => {
      const m = new THREE.Mesh(pinoGeo, matPino);
      m.castShadow = true;
      m.visible = false;
      escena.add(m);
      return m;
    });
    let stockPintado = -1;
    const texPatio = lienzoTex(512, 160, () => {});
    const letreroPatio = new THREE.Sprite(D(new THREE.SpriteMaterial({ map: texPatio, depthWrite: false })));
    letreroPatio.scale.set(170, 53, 1);
    letreroPatio.position.set(M.muelle.x + M.muelle.w / 2, 70, M.muelle.y + M.muelle.h / 2);
    escena.add(letreroPatio);
    function pintaPatio(n) {
      const x = texPatio.lienzo.getContext("2d"),
        w = 512,
        h = 160;
      x.clearRect(0, 0, w, h);
      x.fillStyle = "rgba(6,47,77,.88)";
      x.beginPath();
      x.roundRect ? x.roundRect(6, 6, w - 12, h - 12, 26) : x.rect(6, 6, w - 12, h - 12);
      x.fill();
      x.fillStyle = "#ffd27a";
      x.font = `italic 900 50px ${FUENTE}`;
      x.textAlign = "center";
      x.textBaseline = "middle";
      x.fillText("PATIO DE CARGA", w / 2, 58);
      x.fillStyle = "#fff";
      x.font = `700 38px ${FUENTE}`;
      x.fillText(`Almacén: ${n} paquete${n === 1 ? "" : "s"}`, w / 2, 112);
      texPatio.needsUpdate = true;
    }

    /* ───────── Día y noche ───────── */
    const cieloArriba = C("#5aa9e6"),
      cieloHorizonte = C("#d7ecf7");
    const tmp = new THREE.Color(),
      tmp2 = new THREE.Color();
    let noche = 0;
    function dia(reloj) {
      const t = clamp((reloj - 510) / 600, 0, 1);
      const tarde = clamp((reloj - 960) / 130, 0, 1);
      noche = clamp((reloj - 1040) / 70, 0, 1);
      const az = lerp(0.35, 2.85, t),
        el = lerp(0.42, 1.05, Math.sin(Math.PI * Math.min(1, t * 1.15))) * (1 - tarde * 0.75) + 0.05;
      sol.userData.dir = new THREE.Vector3(Math.cos(az) * Math.cos(el), Math.sin(el), Math.sin(az) * Math.cos(el));
      sol.color.set("#fff3dc").lerp(tmp.set("#ff9c5a"), tarde);
      sol.intensity = 2.3 * (1 - 0.6 * noche);
      hemi.color
        .set("#d6ecff")
        .lerp(tmp.set("#ffc59a"), tarde * 0.7)
        .lerp(tmp2.set("#5a6aa0"), noche);
      hemi.intensity = lerp(1.15, 0.65, noche);
      cieloArriba.set("#5aa9e6").lerp(tmp.set("#5866a8"), tarde).lerp(tmp2.set("#1b2550"), noche);
      cieloHorizonte
        .set("#d7ecf7")
        .lerp(tmp.set("#ffb37a"), tarde)
        .lerp(tmp2.set("#e0805a"), noche * 0.6);
      cieloMat.uniforms.arriba.value.copy(cieloArriba);
      cieloMat.uniforms.horizonte.value.copy(cieloHorizonte);
      escena.fog.color.copy(cieloHorizonte);
      matCasa.emissiveIntensity = matComercio.emissiveIntensity = noche * 0.9;
      focoMat.color.set("#cfcfcf").lerp(tmp.set("#ffd98a"), noche);
      halos.material.opacity = noche * 0.35;
      matCono.opacity = noche * 0.16;
      foco.intensity = noche * 500;
      faroMat.color.set(noche > 0.3 ? "#fffbe0" : "#f3ecc8");
    }

    /* ───────── Cámara ───────── */
    const cam = { x: 1100, y: 300, z: 1500, lx: 1100, ly: 0, lz: 1100, yaw: 0, init: false };
    const W = { w: 1, h: 1 };
    function bloqueado(x, z, y) {
      for (const b of M.edificios) {
        const h = b.h3 || 100;
        if (y < h + 8 && x > b.x - 8 && x < b.x + b.w + 8 && z > b.y - 8 && z < b.y + b.h + 8) return true;
      }
      return false;
    }
    function ponCamara(G, vista, dt) {
      const r = G.rino,
        k = G.camion,
        en = r.enCamion;
      const P = en ? k : r;
      const a = en ? k.a : r.a || 0;
      const v = en ? k.v : 0;
      const f = 1 - Math.exp(-7 * dt);
      let px, py, pz, lx, ly, lz, fov;
      if (G.modo === "inicio") {
        const t = performance.now() / 1000;
        const ang = t * 0.06;
        lx = A.x + A.w / 2;
        lz = A.y + A.h + 120;
        ly = 40;
        px = lx + Math.cos(ang) * 620;
        pz = lz + Math.sin(ang) * 620;
        py = 300;
        fov = 50;
        vistaHacha.visible = false;
        tablero.visible = false;
      } else if (vista === "aerea") {
        const ad = (430 + Math.abs(v) * 0.55) * (W.w < W.h ? 1.2 : 1);
        lx = P.x + Math.cos(a) * v * 0.3;
        lz = P.y + Math.sin(a) * v * 0.3;
        ly = 0;
        px = lx;
        py = ad * 1.35;
        pz = lz + ad * 0.48;
        fov = 46;
      } else if (vista === "tercera") {
        cam.yaw = cam.init ? cam.yaw + angDif(a, cam.yaw) * (1 - Math.exp(-(en ? 3.2 : 5) * dt)) : a;
        const vert = W.w < W.h ? 1.35 : 1;
        const atras = (en ? 180 + Math.abs(v) * 0.08 : 130) * vert,
          alto = (en ? 92 : 72) * vert;
        lx = P.x + Math.cos(cam.yaw) * (en ? 70 : 34);
        lz = P.y + Math.sin(cam.yaw) * (en ? 70 : 34);
        ly = en ? 40 : 38;
        let d = atras;
        for (let s = 0.25; s <= 1.001; s += 0.25) {
          const tx = P.x - Math.cos(cam.yaw) * atras * s,
            tz = P.y - Math.sin(cam.yaw) * atras * s;
          if (bloqueado(tx, tz, alto * s + 10)) {
            d = Math.max(30, atras * (s - 0.25));
            break;
          }
        }
        px = P.x - Math.cos(cam.yaw) * d;
        pz = P.y - Math.sin(cam.yaw) * d;
        py = alto * (0.55 + 0.45 * (d / atras));
        fov = en ? 62 + Math.abs(v) * 0.02 : 60;
      } else {
        cam.yaw = a;
        const bob = en ? 0 : Math.sin(r.fase * 2) * 1.2;
        if (en) {
          px = k.x + Math.cos(a) * 30 - Math.cos(a + Math.PI / 2) * 9;
          pz = k.y + Math.sin(a) * 30 - Math.sin(a + Math.PI / 2) * 9;
          py = 50;
        } else {
          px = r.x + Math.cos(a) * 6;
          pz = r.y + Math.sin(a) * 6;
          py = 47 + bob;
        }
        lx = px + Math.cos(a) * 200;
        lz = pz + Math.sin(a) * 200;
        ly = py - (en ? 14 : 30);
        fov = 72;
      }
      const directo = vista === "primera" || !cam.init;
      cam.x = directo ? px : lerp(cam.x, px, f);
      cam.y = directo ? py : lerp(cam.y, py, f);
      cam.z = directo ? pz : lerp(cam.z, pz, f);
      cam.lx = directo ? lx : lerp(cam.lx, lx, f * 1.4);
      cam.ly = directo ? ly : lerp(cam.ly, ly, f * 1.4);
      cam.lz = directo ? lz : lerp(cam.lz, lz, f * 1.4);
      cam.init = true;
      let sx = 0,
        sy = 0;
      if (G.shake > 0) {
        sx = (Math.random() - 0.5) * 16 * G.shake;
        sy = (Math.random() - 0.5) * 16 * G.shake;
      }
      camara.position.set(cam.x + sx, cam.y + sy, cam.z);
      camara.lookAt(cam.lx, cam.ly, cam.lz);
      if (Math.abs(camara.fov - fov) > 0.1) {
        camara.fov = lerp(camara.fov, fov, Math.min(1, dt * 6));
        camara.updateProjectionMatrix();
      }
      const lejos = vista === "aerea" ? 1500 : 900;
      escena.fog.near = lejos;
      escena.fog.far = lejos + (vista === "aerea" ? 2600 : 2700);
      const tam = vista === "aerea" ? 780 : 520;
      if (sc.right !== tam) {
        sc.left = -tam;
        sc.right = tam;
        sc.top = tam;
        sc.bottom = -tam;
        sc.updateProjectionMatrix();
      }
      const objX = vista === "aerea" || G.modo === "inicio" ? cam.lx : P.x + Math.cos(cam.yaw) * 220,
        objZ = vista === "aerea" || G.modo === "inicio" ? cam.lz : P.y + Math.sin(cam.yaw) * 220;
      const dir = sol.userData.dir || new THREE.Vector3(0.3, 0.8, 0.5);
      sol.target.position.set(objX, 0, objZ);
      sol.position.set(objX + dir.x * 1600, dir.y * 1600, objZ + dir.z * 1600);
      cielo.position.copy(camara.position);
    }

    /* ───────── Cuadro ───────── */
    const pasado = { t: performance.now(), lentos: 0, cuadros: 0 };
    function render(G, vista, dt, tAnim) {
      dia(G.modo === "libre" || G.modo === "fin" ? G.reloj : 620);
      if (G.stock !== stockPintado) {
        stockPintado = G.stock;
        pintaPatio(G.stock);
      }
      const r = G.rino,
        k = G.camion;
      // pinos (antes de dibujar, ubica la cámara para saber cuáles la tapan)
      ponCamara(G, vista, dt);
      const P = r.enCamion ? k : r;
      const tapa = vista === "tercera" && G.modo !== "inicio";
      const cerca1P = vista === "primera" && G.modo !== "inicio";
      const sx = camara.position.x,
        sz = camara.position.z,
        ddx = P.x - sx,
        ddz = P.y - sz,
        dl2 = ddx * ddx + ddz * ddz || 1;
      for (let i = 0; i < N; i++) {
        const p = M.pinos[i];
        if (p.estado === "tocon") {
          pinos.setMatrixAt(i, CERO);
          fantasmas.setMatrixAt(i, CERO);
          mtx.makeTranslation(p.x, 0, p.y);
          tocones.setMatrixAt(i, mtx);
          continue;
        }
        tocones.setMatrixAt(i, CERO);
        const s = p.estado === "brote" ? (0.16 + 0.62 * clamp(p.crece / 35, 0, 1)) * p.s : p.s;
        const sh = p.shake > 0 ? Math.sin(tAnim * 60) * p.shake * 0.35 : 0;
        e.set(sh, i * 1.7, sh * 0.6);
        q.setFromEuler(e);
        vp.set(p.x, 0, p.y);
        vs.set(s, s, s);
        mtx.compose(vp, q, vs);
        let estorba = false;
        if (tapa && p !== G.ctxP) {
          const t = clamp(((p.x - sx) * ddx + (p.y - sz) * ddz) / dl2, 0, 1);
          const qx = sx + ddx * t - p.x,
            qz = sz + ddz * t - p.y;
          estorba = t < 0.97 && qx * qx + qz * qz < 34 * s * (34 * s);
        } else if (cerca1P && p !== G.ctxP) {
          const qx = p.x - sx,
            qz = p.y - sz;
          estorba = qx * qx + qz * qz < 30 * s * (30 * s);
        }
        pinos.setMatrixAt(i, estorba ? CERO : mtx);
        fantasmas.setMatrixAt(i, estorba ? mtx : CERO);
      }
      pinos.instanceMatrix.needsUpdate = true;
      fantasmas.instanceMatrix.needsUpdate = true;
      tocones.instanceMatrix.needsUpdate = true;
      caidas3.forEach((m, i) => {
        const c = G.caidas[i];
        m.visible = !!c;
        if (!c) return;
        const t = clamp(c.t / 0.6, 0, 1);
        m.position.set(c.x, 0, c.y);
        m.rotation.set(0, 0, -c.dir * t * t * 1.5);
        m.scale.setScalar(c.s * (c.t > 0.75 ? Math.max(0.01, 1 - (c.t - 0.75) * 2.2) : 1));
      });
      // camión
      camion.position.set(k.x, 0, k.y);
      camion.rotation.y = -k.a;
      camionMesh.rotation.x = 0;
      for (let i = 0; i < 12; i++) {
        slotsLog[i].visible = i < k.troncos;
        slotsPaq[i].visible = i >= k.troncos && i < k.troncos + k.paq;
      }
      const primera = vista === "primera" && G.modo !== "inicio";
      tablero.visible = primera && r.enCamion;
      matVidrio.opacity = tablero.visible ? 0.12 : 0.6;
      // rino
      rino.visible = !r.enCamion && !primera;
      vistaHacha.visible = !r.enCamion && primera;
      if (vistaHacha.visible) vistaHacha.position.set(W.w < W.h ? 5 : 12, W.w < W.h ? -11 : -13, -28);
      if (!r.enCamion) {
        rino.position.set(r.x, 0, r.y);
        rino.rotation.y = -(r.a || 0);
        const fase = r.fase;
        const anda = fase ? Math.sin(fase) : 0;
        piernaI.rotation.z = anda * 0.7;
        piernaD.rotation.z = -anda * 0.7;
        cuerpo.position.y = fase ? Math.abs(Math.cos(fase)) * 1.5 : 0;
        brazoI.rotation.z = -anda * 0.6;
        const g = r.chop > 0 ? 1 - r.chop / 0.26 : -1;
        brazoD.rotation.z = g >= 0 ? lerp(2.9, 1.15, g * g) : 0.45 + anda * 0.5;
        troncosEspalda.forEach((l, i) => (l.visible = i < r.carga));
        brazoFP.rotation.x = g >= 0 ? lerp(0.9, -1.25, g * g) : 0.12 + Math.sin(fase) * 0.06;
        brazoFP.position.y = fase ? Math.abs(Math.sin(fase)) * 1.2 : 0;
      }
      // tráfico
      while (carros3.length < G.carros.length) carros3.push(mallaCarro(G.carros[carros3.length]));
      G.carros.forEach((c, i) => {
        const g = carros3[i];
        g.position.set(c.x, 0, c.y);
        g.rotation.y = -c.a;
      });
      // peatones
      G.peatones.forEach((p, i) => {
        let o = peat3[i];
        if (!o) o = peat3[i] = mallaPeaton(p);
        const x = p.x + p.ox,
          y = p.y + p.oy;
        const dx = p.x - o.px,
          dy = p.y - o.py;
        if (dx * dx + dy * dy > 0.01) o.a = Math.atan2(dy, dx);
        o.px = p.x;
        o.py = p.y;
        const salto = p.salto > 0 ? Math.sin((p.salto / 0.8) * Math.PI) * 14 : 0;
        o.g.position.set(x, Math.abs(Math.sin(p.fase)) * 1.4 + salto, y);
        o.g.rotation.y = -o.a;
      });
      // inspectores
      inspPool.forEach((o, i) => {
        const s = G.insp[i];
        o.g.visible = !!s;
        if (!s) return;
        o.g.position.set(s.x, 0, s.y);
        o.g.rotation.y = -s.a;
        o.mat.opacity = clamp(s.alfa, 0, 1);
        const on = Math.floor(tAnim * 8) % 2;
        o.l1.material = on ? lucesA : lucesB;
        o.l2.material = on ? lucesB : lucesA;
      });
      // marcadores
      const lista = [];
      if (G.modo !== "inicio") {
        for (const p of G.pedidos) lista.push({ x: p.c.x, y: p.c.y, color: k.paq >= p.cant ? 0x00d200 : 0xffd27a, n: p.n });
        const m = G.guia && G.guia.meta;
        if (m && G.modo === "tuto" && m === M.entrada) lista.push({ x: m.x, y: m.y, color: 0xffd27a });
        const mu = M.muelle;
        const cargar = (k.troncos > 0 || r.carga > 0 || (G.pedidos.length && k.paq < G.pedidos.reduce((s, p) => s + p.cant, 0))) && G.modo !== "fin";
        if (cargar) lista.push({ x: mu.x + mu.w / 2, y: mu.y + mu.h / 2, color: 0x4fb3ff, ancho: true });
      }
      marcas.forEach((o, i) => {
        const d = lista[i];
        o.g.visible = !!d;
        if (!d) return;
        o.g.position.set(d.x, 0, d.y);
        const pulso = 0.94 + 0.06 * Math.sin(tAnim * 4);
        o.g.scale.set(d.ancho ? 3.6 * pulso : pulso, 1, d.ancho ? 1.4 * pulso : pulso);
        o.matC.color.setHex(d.color);
        o.matA.color.setHex(d.color);
        o.matC.opacity = vista === "primera" ? 0.14 : 0.22;
        o.sp.visible = !!d.n;
        if (d.n) o.sp.material.map = texNumero(d.n);
        o.sp.scale.set(d.ancho ? 12 : 44, 44, 1);
      });
      const meta = G.modo !== "inicio" && G.guia && G.guia.meta;
      chevron.visible = !!meta && !(meta === k && r.enCamion) && !(vista === "primera" && meta === r);
      if (chevron.visible) {
        chevron.position.set(meta.x, (meta === k ? 90 : 170) + Math.sin(tAnim * 5) * 8, meta.y);
        chevron.rotation.y = tAnim * 2;
        chevronMat.color.set(G.guia.color || "#ffd27a");
      }
      aro.visible = !r.enCamion && !!G.ctxP && (G.ctx === "talar" || G.ctx === "sembrar") && G.modo !== "inicio";
      if (aro.visible) {
        aro.position.set(G.ctxP.x, 1.5, G.ctxP.y);
        aro.material.color.set(G.ctx === "talar" ? "#ffffff" : "#7BF07E");
      }
      renderer.render(escena, camara);
      // calidad adaptable: si va lento, baja resolución y sombras
      pasado.cuadros++;
      if (dt > 1 / 28) pasado.lentos++;
      if (pasado.cuadros >= 150) {
        if (pasado.lentos > 75 && calidad > 0) {
          calidad--;
          renderer.setPixelRatio(calidad === 1 ? Math.min(1.25, window.devicePixelRatio || 1) : 1);
          if (calidad === 0) {
            renderer.shadowMap.enabled = false;
            escena.traverse((o) => o.material && (o.material.needsUpdate = true));
          }
          ajusta(W.w, W.h);
        }
        pasado.cuadros = pasado.lentos = 0;
      }
    }

    function ajusta(w, h) {
      W.w = w;
      W.h = h;
      renderer.setSize(w, h, false);
      camara.aspect = w / h;
      camara.updateProjectionMatrix();
    }
    const v3 = new THREE.Vector3();
    function proyecta(x, y, z) {
      v3.set(x, y, z).applyMatrix4(camara.matrixWorldInverse);
      const detras = v3.z > -1;
      v3.applyMatrix4(camara.projectionMatrix);
      return { x: (v3.x * 0.5 + 0.5) * W.w, y: (-v3.y * 0.5 + 0.5) * W.h, detras };
    }
    function destruye() {
      for (const o of basura) o.dispose && o.dispose();
      for (const m of [pinos, tocones, fantasmas, fondo, deco, posteMesh, focos, halos]) m.dispose();
      renderer.dispose();
      renderer.forceContextLoss && renderer.forceContextLoss();
      lienzo.remove();
    }
    return { lienzo, render, ajusta, proyecta, destruye, camara };
  }

  window.GranTala3D = { crea };
})();
