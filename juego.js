/* Tala y Siembra — advergame TMM (artifact b656cc7e) adaptado para vivir dentro de la app:
   se monta en un contenedor y abrirJuego() devuelve una función que lo desmonta. */
(function () {
  "use strict";

  const CSS = `
  .juego{--j-paper:var(--fondo);--j-ink:var(--tinta);--j-muted:var(--tenue);--j-line:var(--linea);--j-blue:#0079C1;--j-blue-deep:#005E97;--j-green-deep:#00A400;
    position:fixed;inset:0;z-index:30;background:var(--j-paper);color:var(--j-ink);display:flex;flex-direction:column;align-items:center;gap:12px;
    padding:calc(env(safe-area-inset-top,0px) + 10px) 16px calc(env(safe-area-inset-bottom,0px) + 12px);overflow-y:auto;font-family:var(--texto)}
  .juego .j-top{width:100%;max-width:400px;display:flex;align-items:center;gap:12px}
  .juego .j-top h2{flex:1;font-size:26px;color:var(--j-blue)}
  .juego .j-dek{margin:0;font-size:12.5px;color:var(--j-muted);max-width:40ch;text-align:center;line-height:1.45}
  .juego .board{position:relative;width:max(200px,min(92vw,calc((100dvh - 290px)*380/620),400px));aspect-ratio:380/620;container-type:inline-size;border-radius:10px;overflow:hidden;background:#CFE9F7;border:1px solid var(--j-line);box-shadow:0 18px 44px -26px rgba(18,50,70,.55);touch-action:manipulation;user-select:none;-webkit-user-select:none;flex:none}
  .juego canvas{display:block;width:100%;height:100%}
  .juego .overlay{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3.5cqw;text-align:center;padding:6cqw;background:rgba(10,32,46,.62);backdrop-filter:blur(2px);color:#fff}
  .juego .otitle{font-family:var(--display);font-style:italic;font-weight:900;font-size:9cqw;line-height:1;margin:0;color:#fff}
  .juego .otitle.bad{color:#FFC9C0}
  .juego .ohint{margin:0;font-size:3.6cqw;line-height:1.55;color:#DCEBF3;max-width:34ch}
  .juego .ohint b{color:#7BF07E;font-weight:600}
  .juego .tally{display:grid;grid-template-columns:repeat(2,auto);gap:2cqw 7cqw;padding:4cqw 6cqw;border-radius:6px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.22)}
  .juego .tally div{display:flex;flex-direction:column;align-items:flex-start;gap:.3cqw}
  .juego .tally span{font-size:2.5cqw;letter-spacing:.14em;text-transform:uppercase;color:#A9C9D9}
  .juego .tally strong{font-family:var(--display);font-style:italic;font-weight:800;font-size:6cqw;line-height:1;color:#fff;font-variant-numeric:tabular-nums}
  .juego .tally strong.hl{color:#7BF07E}
  .juego .controls{display:grid;grid-template-columns:1fr 1.15fr 1fr;gap:8px;width:max(200px,min(92vw,calc((100dvh - 290px)*380/620),400px));flex:none}
  .juego .jb{font-family:var(--display);font-style:italic;font-weight:800;font-size:14px;color:#fff;background:var(--j-blue);border:none;border-radius:7px;padding:13px 6px 15px;cursor:pointer;box-shadow:0 3px 0 0 var(--j-blue-deep);transition:transform .07s}
  .juego .jb.plant,.juego .jb.again{background:var(--j-green-deep);box-shadow:0 3px 0 0 #007A00}
  .juego .jb:active{transform:translateY(3px);box-shadow:none}
  .juego .jb small{display:block;font-family:var(--texto);font-style:normal;font-weight:600;font-size:9.5px;opacity:.82;letter-spacing:.1em;margin-top:2px}
  .juego .jb.again{font-size:4cqw;padding:3cqw 7cqw 3.6cqw}
  .juego .scoreline{font-size:11.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--j-muted)}
  .juego .scoreline b{font-family:var(--display);font-style:italic;font-weight:800;font-size:15px;color:var(--j-ink)}
  @media (max-height:700px){.juego .j-dek{display:none}}`;

  window.abrirJuego = function (alCerrar) {
    if (!document.getElementById("juego-css")) {
      const st = document.createElement("style");
      st.id = "juego-css";
      st.textContent = CSS;
      document.head.append(st);
    }
    const ac = new AbortController();
    const sig = { signal: ac.signal };
    const raiz = document.createElement("div");
    raiz.className = "juego";
    raiz.setAttribute("role", "dialog");
    raiz.setAttribute("aria-label", "Juego Tala y Siembra");
    raiz.innerHTML = `
      <div class="j-top"><h2>Tala y Siembra</h2>
        <button class="icono" data-j="cerrar" aria-label="Cerrar el juego"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>
      <p class="j-dek">Corta troncos por el lado libre de ramas. Cada corte gasta bosque: si no siembras a tiempo, se acaba la madera.</p>
      <div class="board" data-j="board">
        <canvas data-j="game" role="img" aria-label="Tablero del juego Tala y Siembra"></canvas>
        <div class="overlay" data-j="ready">
          <p class="otitle">Tala y Siembra</p>
          <p class="ohint">Corta por el lado <b>sin rama</b>. Cada corte consume bosque: siembra antes de quedarte sin árboles. Toca el lado izquierdo o derecho del tablero para cortar.</p>
        </div>
        <div class="overlay" data-j="over" hidden>
          <p class="otitle bad" data-j="overTitle">Se acabó</p>
          <p class="ohint" data-j="overWhy"></p>
          <div class="tally">
            <div><span>Troncos</span><strong data-j="tTroncos">0</strong></div>
            <div><span>Sembrados</span><strong class="hl" data-j="tArboles">0</strong></div>
            <div><span>Hojas de triplay</span><strong data-j="tHojas">0</strong></div>
            <div><span>Mejor</span><strong data-j="tMejor">0</strong></div>
          </div>
          <button class="jb again" data-j="again" type="button">Otra vez</button>
        </div>
      </div>
      <div class="controls">
        <button class="jb" data-j="bLeft" type="button">Cortar &#9664;<small>FLECHA IZQ.</small></button>
        <button class="jb plant" data-j="bPlant" type="button">Sembrar<small>ESPACIO</small></button>
        <button class="jb" data-j="bRight" type="button">&#9654; Cortar<small>FLECHA DER.</small></button>
      </div>
      <p class="scoreline">Mejor marca <b data-j="best">0</b> troncos</p>`;
    document.body.append(raiz);
    document.body.style.overflow = "hidden";
    const $ = (k) => raiz.querySelector(`[data-j="${k}"]`);

    const W = 380, H = 620;
    const GROUND_Y = 540, SEG_H = 82, TRUNK_W = 84, CX = 190;
    const VISIBLE = 8;
    const MAX_BOSQUE = 12, START_BOSQUE = 9;
    const CHOP_COST = 0.55, PLANT_GAIN = 3.2, PLANT_TIME = 0.45;
    const TIME_CHOP = 0.045, TIME_PLANT = 0.06;
    const P = {
      sky1: "#CFE9F7", sky2: "#EAF6FD", far: "#BFE4C6", mid: "#8FD3A0",
      ground: "#C6E9CC", groundDark: "#A8D9B2", soil: "#8A6A3E",
      bark: "#B5813F", barkDark: "#8A5B27", barkLine: "#7A4E20",
      cut: "#E8C48A", cutRing: "#C79A5C", leaf: "#00D200", leafDark: "#00A400",
      ink: "#123246", blue: "#0079C1", skin: "#E8B98A", helmet: "#F2A007", helmetDark: "#C97F04",
      steel: "#C7D2DA", steelDark: "#8FA1AD", amber: "#F2A007", danger: "#D64027",
    };

    const cvs = $("game");
    const ctx = cvs.getContext("2d");
    function fit() {
      const r = cvs.getBoundingClientRect();
      if (!r.width) return;
      const scale = Math.min(3, (r.width / W) * (window.devicePixelRatio || 1));
      cvs.width = Math.round(W * scale);
      cvs.height = Math.round(H * scale);
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
    }
    addEventListener("resize", fit, sig);

    const LISTO = 0, JUGANDO = 1, FIN = 2;
    let state = LISTO;
    const segs = [];
    let side = "left", troncos = 0, arboles = 0, best = 0;
    let bosque = START_BOSQUE, tiempo = 1;
    let shift = 0, swing = 0, planting = 0, hurt = 0, shake = 0, tTotal = 0;
    const chips = [], logs = [], floats = [], saplings = [];
    const elReady = $("ready"), elOver = $("over"), elBest = $("best");

    function store(k, v) {
      try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { /* sin almacenamiento */ }
      return null;
    }
    best = parseInt(store("talaysiembra.best") || "0", 10) || 0;
    elBest.textContent = best;

    let actx = null;
    function blip(type, f0, f1, dur, vol) {
      try {
        if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
        if (actx.state === "suspended") actx.resume();
        const o = actx.createOscillator(), g = actx.createGain(), t = actx.currentTime;
        o.type = type;
        o.frequency.setValueAtTime(f0, t);
        o.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t + dur);
        g.gain.setValueAtTime(vol, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(g); g.connect(actx.destination);
        o.start(t); o.stop(t + dur + 0.02);
      } catch (e) { /* sin audio */ }
    }
    const sfx = {
      chop: () => blip("square", 190, 90, 0.07, 0.05),
      plant: () => blip("sine", 620, 940, 0.14, 0.05),
      hit: () => blip("sawtooth", 260, 60, 0.22, 0.08),
    };

    const FAR = [];
    for (let i = 0; i < 11; i++) FAR.push({ x: i * 38 + (i % 2) * 9, h: 62 + ((i * 37) % 40) });

    /* Una rama nunca queda del lado contrario a la de abajo: siempre hay un lado seguro. */
    function makeSeg(allowBranch, below) {
      let b = "none";
      if (allowBranch) {
        const p = Math.min(0.62, 0.26 + troncos * 0.006);
        if (Math.random() < p) b = below === "left" || below === "right" ? below : Math.random() < 0.5 ? "left" : "right";
      }
      return { branch: b, seed: Math.random() };
    }

    function reset() {
      segs.length = 0;
      for (let i = 0; i < VISIBLE + 2; i++) segs.push(makeSeg(i > 2, i ? segs[i - 1].branch : "none"));
      side = "left"; troncos = 0; arboles = 0;
      bosque = START_BOSQUE; tiempo = 1;
      shift = swing = planting = hurt = shake = 0;
      chips.length = logs.length = floats.length = saplings.length = 0;
      state = LISTO;
      elReady.hidden = false;
      elOver.hidden = true;
    }
    const floater = (text, x, y, color) => floats.push({ text, x, y, color, life: 1 });
    function burstChips(x, y, dir) {
      for (let i = 0; i < 12; i++) {
        chips.push({ x, y, vx: dir * (40 + Math.random() * 190), vy: -60 - Math.random() * 210, rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 16, size: 3 + Math.random() * 5, life: 1 });
      }
    }

    function chop(dir) {
      if (state === FIN) return;
      if (state === LISTO) { state = JUGANDO; elReady.hidden = true; }
      if (planting > 0) return;
      side = dir;
      if (segs[0].branch === dir) return die("rama");
      const edge = dir === "left" ? CX - TRUNK_W / 2 : CX + TRUNK_W / 2;
      burstChips(edge, GROUND_Y - SEG_H * 0.5, dir === "left" ? -1 : 1);
      logs.push({ x: CX, y: GROUND_Y - SEG_H / 2, vx: (dir === "left" ? 1 : -1) * (170 + Math.random() * 70), vy: -230 - Math.random() * 70, rot: 0, vr: (dir === "left" ? 1 : -1) * 7, life: 1 });
      segs.shift();
      segs.push(makeSeg(true, segs[segs.length - 1].branch));
      shift = 1; swing = 1;
      sfx.chop();
      troncos++;
      tiempo = Math.min(1, tiempo + TIME_CHOP);
      bosque = Math.max(0, bosque - CHOP_COST);
      if (segs[0].branch === dir) return die("rama");
      if (bosque <= 0) return die("bosque");
    }

    function plant() {
      if (state === FIN) return;
      if (state === LISTO) { state = JUGANDO; elReady.hidden = true; }
      if (planting > 0) return;
      if (bosque >= MAX_BOSQUE - 0.01) { floater("Bosque lleno", CX, GROUND_Y - 120, P.blue); return; }
      planting = PLANT_TIME;
      arboles++;
      bosque = Math.min(MAX_BOSQUE, bosque + PLANT_GAIN);
      tiempo = Math.min(1, tiempo + TIME_PLANT);
      sfx.plant();
      floater("+1 árbol", side === "left" ? 96 : 284, GROUND_Y - 96, P.leafDark);
      const px = side === "left" ? 40 + Math.random() * 46 : 296 + Math.random() * 46;
      saplings.push({ x: px, y: GROUND_Y + 16 + Math.random() * 34, grow: 0 });
      if (saplings.length > 16) saplings.shift();
    }

    function die(reason) {
      if (state === FIN) return;
      state = FIN;
      hurt = 1; shake = 8;
      sfx.hit();
      if (troncos > best) { best = troncos; store("talaysiembra.best", String(best)); }
      elBest.textContent = best;
      const titles = { rama: "¡Te dio la rama!", tiempo: "Se acabó el tiempo", bosque: "Se acabó el bosque" };
      const whys = {
        rama: "Ese tronco traía rama de tu lado. Cámbiate antes de tirar el hacha.",
        tiempo: "Cada corte te devuelve segundos: sin ritmo, se agota la barra.",
        bosque: "Cortaste más de lo que sembraste. Sin árboles no hay madera.",
      };
      $("overTitle").textContent = titles[reason];
      $("overWhy").textContent = whys[reason];
      $("tTroncos").textContent = troncos;
      $("tArboles").textContent = arboles;
      $("tHojas").textContent = Math.floor(troncos / 8);
      $("tMejor").textContent = best;
      elOver.hidden = false;
    }

    function step(dt) {
      tTotal += dt;
      if (shift > 0) shift = Math.max(0, shift - dt * 11);
      if (swing > 0) swing = Math.max(0, swing - dt * 7.5);
      if (hurt > 0) hurt = Math.max(0, hurt - dt * 2);
      if (shake > 0) shake = Math.max(0, shake - dt * 26);
      if (planting > 0) planting = Math.max(0, planting - dt);
      for (let i = chips.length - 1; i >= 0; i--) {
        const c = chips[i];
        c.vy += 900 * dt; c.x += c.vx * dt; c.y += c.vy * dt; c.rot += c.vr * dt; c.life -= dt * 1.3;
        if (c.life <= 0) chips.splice(i, 1);
      }
      for (let j = logs.length - 1; j >= 0; j--) {
        const l = logs[j];
        l.vy += 780 * dt; l.x += l.vx * dt; l.y += l.vy * dt; l.rot += l.vr * dt; l.life -= dt * 0.75;
        if (l.life <= 0) logs.splice(j, 1);
      }
      for (let k = floats.length - 1; k >= 0; k--) {
        floats[k].y -= 34 * dt; floats[k].life -= dt * 1.15;
        if (floats[k].life <= 0) floats.splice(k, 1);
      }
      for (const s of saplings) if (s.grow < 1) s.grow = Math.min(1, s.grow + dt * 3);
      if (state !== JUGANDO) return;
      const drain = Math.min(0.42, 0.135 + troncos * 0.0016);
      tiempo -= drain * dt;
      if (tiempo <= 0) { tiempo = 0; die("tiempo"); }
    }

    /* El triángulo de la marca, apilado como pino. */
    function pine(x, y, w, h, c1, c2) {
      const tiers = 3, th = h / (tiers + 0.6);
      for (let i = 0; i < tiers; i++) {
        const t = i / (tiers - 1), tw = w * (1 - t * 0.42), ty = y - i * th * 0.78;
        ctx.fillStyle = i === tiers - 1 ? c2 : c1;
        ctx.beginPath(); ctx.moveTo(x, ty - th * 1.35); ctx.lineTo(x + tw / 2, ty); ctx.lineTo(x - tw / 2, ty); ctx.closePath(); ctx.fill();
      }
    }
    function drawBack() {
      const g = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
      g.addColorStop(0, P.sky1); g.addColorStop(1, P.sky2);
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, GROUND_Y);
      ctx.fillStyle = "rgba(225,250,225,.85)";
      ctx.beginPath(); ctx.moveTo(-30, GROUND_Y); ctx.lineTo(150, GROUND_Y); ctx.lineTo(-30, 150); ctx.closePath(); ctx.fill();
      for (const f of FAR) pine(f.x, GROUND_Y + 2, 52, f.h, P.far, P.mid);
      ctx.fillStyle = P.ground; ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
      ctx.fillStyle = P.groundDark; ctx.fillRect(0, GROUND_Y, W, 5);
      ctx.fillStyle = P.soil; ctx.fillRect(0, GROUND_Y + 62, W, H - GROUND_Y - 62);
      for (const sp of saplings) {
        pine(sp.x, sp.y, 16 * sp.grow, 26 * sp.grow, P.leaf, P.leafDark);
        ctx.fillStyle = P.barkDark; ctx.fillRect(sp.x - 1.5, sp.y, 3, 6 * sp.grow);
      }
    }
    function drawBranch(dir, x, y) {
      const s = dir === "left" ? -1 : 1, x0 = x + s * (TRUNK_W / 2 - 2);
      ctx.fillStyle = P.barkDark;
      ctx.beginPath(); ctx.moveTo(x0, y - 9); ctx.lineTo(x0 + s * 54, y - 16); ctx.lineTo(x0 + s * 54, y - 4); ctx.lineTo(x0, y + 9); ctx.closePath(); ctx.fill();
      pine(x0 + s * 62, y + 12, 54, 46, P.leaf, P.leafDark);
    }
    function drawTrunk() {
      const dy = shift * SEG_H;
      for (let i = segs.length - 1; i >= 0; i--) {
        const top = GROUND_Y - (i + 1) * SEG_H + dy;
        if (top > GROUND_Y) continue;
        const x = CX - TRUNK_W / 2;
        ctx.fillStyle = P.bark; ctx.fillRect(x, top, TRUNK_W, SEG_H);
        ctx.fillStyle = P.barkDark; ctx.fillRect(x, top, 13, SEG_H); ctx.fillRect(x + TRUNK_W - 9, top, 9, SEG_H);
        ctx.fillStyle = P.barkLine;
        const sd = segs[i].seed;
        ctx.fillRect(x + 22, top + 8 + sd * 20, 3, SEG_H * 0.42);
        ctx.fillRect(x + 46, top + 26 + sd * 16, 3, SEG_H * 0.34);
        ctx.fillRect(x + 34, top + 4, 2, SEG_H * 0.2);
        ctx.fillStyle = P.cutRing; ctx.fillRect(x, top, TRUNK_W, 3);
        if (segs[i].branch !== "none") drawBranch(segs[i].branch, CX, top + SEG_H * 0.42);
      }
      ctx.fillStyle = P.cut; ctx.fillRect(CX - TRUNK_W / 2, GROUND_Y - 6, TRUNK_W, 6);
      ctx.fillStyle = P.cutRing; ctx.fillRect(CX - TRUNK_W / 2 + 18, GROUND_Y - 4, 48, 2);
    }
    function drawLenador() {
      const x = side === "left" ? 104 : 276, face = side === "left" ? 1 : -1;
      const crouch = planting > 0 ? Math.sin((1 - planting / PLANT_TIME) * Math.PI) * 12 : 0;
      ctx.save(); ctx.translate(x, GROUND_Y - crouch); ctx.scale(face, 1);
      ctx.fillStyle = P.ink; ctx.fillRect(-13, -20, 11, 20); ctx.fillRect(2, -20, 11, 20);
      ctx.fillStyle = "#4A3117"; ctx.fillRect(-15, -6, 15, 6); ctx.fillRect(2, -6, 15, 6);
      ctx.fillStyle = P.blue; ctx.fillRect(-15, -50, 30, 31);
      ctx.fillStyle = P.leaf; ctx.beginPath(); ctx.moveTo(0, -46); ctx.lineTo(8, -31); ctx.lineTo(-8, -31); ctx.closePath(); ctx.fill();
      ctx.fillStyle = P.skin; ctx.fillRect(-9, -68, 18, 18);
      ctx.fillStyle = P.ink; ctx.fillRect(3, -63, 3, 3);
      ctx.fillStyle = P.helmet; ctx.fillRect(-12, -74, 24, 7);
      ctx.fillStyle = P.helmetDark; ctx.fillRect(2, -74, 14, 4);
      if (planting > 0) {
        ctx.fillStyle = P.skin; ctx.fillRect(10, -46, 8, 20);
        pine(20, -22, 15, 24, P.leaf, P.leafDark);
        ctx.fillStyle = P.barkDark; ctx.fillRect(19, -22, 3, 7);
      } else {
        ctx.save(); ctx.translate(10, -44); ctx.rotate(-0.35 - swing * 1.15);
        ctx.fillStyle = P.skin; ctx.fillRect(-2, -3, 10, 8);
        ctx.fillStyle = "#8A5B27"; ctx.fillRect(4, -3, 44, 6);
        ctx.fillStyle = P.steel; ctx.beginPath(); ctx.moveTo(44, -14); ctx.lineTo(60, -8); ctx.lineTo(60, 10); ctx.lineTo(44, 16); ctx.closePath(); ctx.fill();
        ctx.fillStyle = P.steelDark; ctx.fillRect(42, -12, 6, 26);
        ctx.restore();
      }
      ctx.restore();
    }
    function drawParticles() {
      chips.forEach((c, i) => {
        ctx.save(); ctx.globalAlpha = Math.max(0, Math.min(1, c.life)); ctx.translate(c.x, c.y); ctx.rotate(c.rot);
        ctx.fillStyle = i % 3 === 0 ? P.cut : P.bark; ctx.fillRect(-c.size / 2, -c.size / 3, c.size, c.size * 0.66); ctx.restore();
      });
      for (const l of logs) {
        ctx.save(); ctx.globalAlpha = Math.max(0, Math.min(1, l.life)); ctx.translate(l.x, l.y); ctx.rotate(l.rot);
        ctx.fillStyle = P.bark; ctx.fillRect(-34, -13, 68, 26);
        ctx.fillStyle = P.cut; ctx.fillRect(-34, -13, 9, 26);
        ctx.fillStyle = P.barkDark; ctx.fillRect(-20, -13, 4, 26); ctx.fillRect(4, -13, 4, 26);
        ctx.restore();
      }
      ctx.textAlign = "center";
      for (const f of floats) {
        ctx.globalAlpha = Math.max(0, Math.min(1, f.life)); ctx.fillStyle = f.color;
        ctx.font = "italic 800 18px 'Exo 2', sans-serif"; ctx.fillText(f.text, f.x, f.y); ctx.globalAlpha = 1;
      }
    }
    function drawHUD() {
      const scrim = ctx.createLinearGradient(0, 0, 0, 200);
      scrim.addColorStop(0, "rgba(240,249,254,.94)"); scrim.addColorStop(0.68, "rgba(240,249,254,.80)"); scrim.addColorStop(1, "rgba(240,249,254,0)");
      ctx.fillStyle = scrim; ctx.fillRect(0, 0, W, 200);
      const bx = 22, by = 22, bw = W - 44, bh = 13;
      ctx.fillStyle = "rgba(18,50,70,.14)"; ctx.fillRect(bx, by, bw, bh);
      const t = Math.max(0, Math.min(1, tiempo));
      ctx.fillStyle = t < 0.25 ? P.danger : t < 0.5 ? P.amber : P.blue; ctx.fillRect(bx, by, bw * t, bh);
      ctx.fillStyle = "rgba(255,255,255,.55)";
      for (let i = 1; i < 8; i++) ctx.fillRect(bx + (bw / 8) * i, by, 1.5, bh);
      ctx.textAlign = "center"; ctx.fillStyle = P.ink; ctx.font = "italic 900 54px 'Exo 2', sans-serif"; ctx.fillText(String(troncos), CX, 100);
      ctx.font = "600 10px Montserrat, sans-serif"; ctx.fillStyle = "rgba(18,50,70,.62)"; ctx.fillText("TRONCOS", CX, 116);
      const ux = 22, uy = 148;
      ctx.textAlign = "left"; ctx.fillText("BOSQUE", ux, uy - 12);
      for (let u = 0; u < MAX_BOSQUE; u++) {
        const full = bosque - u, a = full >= 1 ? 1 : full > 0 ? full : 0;
        ctx.globalAlpha = a > 0 ? 0.25 + a * 0.75 : 0.16;
        ctx.fillStyle = a > 0 ? (bosque <= 3 ? P.danger : P.leafDark) : P.ink;
        const tx = ux + u * 15;
        ctx.beginPath(); ctx.moveTo(tx + 5.5, uy - 11); ctx.lineTo(tx + 11, uy); ctx.lineTo(tx, uy); ctx.closePath(); ctx.fill();
        ctx.globalAlpha = 1;
      }
      ctx.textAlign = "right"; ctx.font = "600 10px Montserrat, sans-serif"; ctx.fillStyle = "rgba(18,50,70,.62)"; ctx.fillText("HOJAS DE TRIPLAY", W - 22, uy - 12);
      ctx.font = "italic 800 20px 'Exo 2', sans-serif"; ctx.fillStyle = P.blue; ctx.fillText(String(Math.floor(troncos / 8)), W - 22, uy + 2);
      if (bosque <= 3 && state === JUGANDO) {
        ctx.globalAlpha = 0.55 + Math.sin(tTotal * 7) * 0.35;
        ctx.textAlign = "center"; ctx.font = "italic 800 15px 'Exo 2', sans-serif"; ctx.fillStyle = P.danger; ctx.fillText("¡SIEMBRA!", CX, 186);
        ctx.globalAlpha = 1;
      }
    }
    function render() {
      ctx.save();
      if (shake > 0) ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
      drawBack(); drawTrunk(); drawLenador(); drawParticles();
      ctx.restore();
      drawHUD();
      if (hurt > 0) { ctx.globalAlpha = hurt * 0.4; ctx.fillStyle = P.danger; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
    }

    let last = 0, acc = 0, raf = 0;
    const FIXED = 1 / 120;
    function frame(now) {
      if (ac.signal.aborted) return;
      if (!last) last = now;
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now; acc += dt;
      while (acc >= FIXED) { step(FIXED); acc -= FIXED; }
      render();
      raf = requestAnimationFrame(frame);
    }

    const board = $("board");
    board.addEventListener("pointerdown", (e) => {
      if (state === FIN || e.target.closest("button")) return;
      e.preventDefault();
      const r = board.getBoundingClientRect();
      chop(e.clientX - r.left < r.width / 2 ? "left" : "right");
    }, sig);
    const wire = (k, fn) => { const el = $(k); el.addEventListener("click", () => { fn(); el.blur(); }, sig); };
    wire("bLeft", () => chop("left"));
    wire("bRight", () => chop("right"));
    wire("bPlant", plant);
    $("again").addEventListener("click", reset, sig);

    function cerrar() {
      ac.abort();
      cancelAnimationFrame(raf);
      try { if (actx) actx.close(); } catch (e) { /* nada */ }
      raiz.remove();
      document.body.style.overflow = "";
      if (alCerrar) alCerrar(best);
    }
    $("cerrar").addEventListener("click", cerrar, sig);

    addEventListener("keydown", (e) => {
      const k = e.code;
      if (k === "Escape") { e.preventDefault(); cerrar(); return; }
      if (k === "ArrowLeft" || k === "KeyA") { e.preventDefault(); if (!e.repeat) chop("left"); }
      else if (k === "ArrowRight" || k === "KeyD") { e.preventDefault(); if (!e.repeat) chop("right"); }
      else if (k === "Space" || k === "ArrowDown" || k === "KeyS") {
        e.preventDefault();
        if (e.repeat) return;
        if (state === FIN) reset(); else plant();
      } else if (k === "Enter" && state === FIN) { e.preventDefault(); reset(); }
    }, { signal: ac.signal, capture: true });
    document.addEventListener("visibilitychange", () => { if (document.hidden) last = 0; }, sig);

    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (!ac.signal.aborted) fit(); });
    fit();
    reset();
    raf = requestAnimationFrame(frame);
    $("cerrar").focus();
    return cerrar;
  };
})();
