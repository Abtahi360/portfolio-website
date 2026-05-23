(function () {
  const defaultConfig = {
    effectType: "particles",
    colors: ["#22d3ee", "#2563eb"],
    particleCount: 140,
    particleSize: { min: 2, max: 6 },
    lifeSpan: 900,
    trailLength: 0.25,
    blendMode: "lighter"
  };

  const userConfig = window.CURSOR_EFFECT_CONFIG || {};
  const config = {
    ...defaultConfig,
    ...userConfig,
    particleSize: {
      ...defaultConfig.particleSize,
      ...(userConfig.particleSize || {})
    }
  };

  let canvas;
  let ctx;
  let width = 0;
  let height = 0;
  let dpr = 1;
  let particles = [];
  let particlePoolSize = config.particleCount | 0;
  let lastPointer = null;
  let running = false;
  let reducedMotion = false;
  let animationFrameId = null;
  let lastFrameTime = 0;

  function createCanvas() {
    const c = document.createElement("canvas");
    c.className = "cursor-effect-canvas";
    c.setAttribute("aria-hidden", "true");
    c.setAttribute("role", "presentation");
    document.body.appendChild(c);
    return c;
  }

  function readCssColorVariable(name, fallback) {
    const value = getComputedStyle(document.documentElement).getPropertyValue(
      name
    );
    const trimmed = value.trim();
    return trimmed || fallback;
  }

  function initColors() {
    const c1 = readCssColorVariable("--cursor-effect-color-1", config.colors[0]);
    const c2 =
      readCssColorVariable("--cursor-effect-color-2", config.colors[1]) ||
      c1 ||
      "#ffffff";
    if (!Array.isArray(config.colors) || config.colors.length === 0) {
      config.colors = [c1, c2];
    } else {
      config.colors = config.colors.map((c) => c || c1);
    }
  }

  function resize() {
    if (!canvas) return;
    dpr = window.devicePixelRatio || 1;
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function pickColor() {
    const arr = config.colors;
    if (!arr || arr.length === 0) return "#ffffff";
    if (arr.length === 1) return arr[0];
    const i = Math.floor(Math.random() * arr.length);
    return arr[i];
  }

  function initParticles() {
    particles = new Array(particlePoolSize);
    for (let i = 0; i < particlePoolSize; i++) {
      particles[i] = {
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        size: 0,
        life: 0,
        maxLife: 0,
        active: false,
        color: "#ffffff"
      };
    }
  }

  function spawnBurst(x, y, intensity) {
    if (reducedMotion || !particles.length) return;
    const count = intensity | 0;
    for (let i = 0; i < count; i++) {
      const p = getInactiveParticle();
      if (!p) return;
      const angle = Math.random() * Math.PI * 2;
      const speed =
        config.effectType === "trail"
          ? randomBetween(0.02, 0.12)
          : randomBetween(0.05, 0.25);
      p.x = x;
      p.y = y;
      p.vx = Math.cos(angle) * speed * width;
      p.vy = Math.sin(angle) * speed * height;
      const minSize = config.particleSize.min;
      const maxSize = config.particleSize.max;
      p.size = randomBetween(minSize, maxSize);
      const baseLife = config.lifeSpan;
      const jitter = baseLife * 0.3;
      p.maxLife = baseLife + randomBetween(-jitter, jitter);
      p.life = p.maxLife;
      p.color = pickColor();
      p.active = true;
    }
  }

  function spawnRipple(x, y) {
    if (reducedMotion || !particles.length) return;
    const ringCount = 12;
    const radiusBase = Math.min(width, height) * 0.08;
    for (let i = 0; i < ringCount; i++) {
      const p = getInactiveParticle();
      if (!p) return;
      const angle = (i / ringCount) * Math.PI * 2;
      const speed = radiusBase / config.lifeSpan;
      p.x = x;
      p.y = y;
      p.vx = Math.cos(angle) * speed * 1000;
      p.vy = Math.sin(angle) * speed * 1000;
      p.size = randomBetween(config.particleSize.min, config.particleSize.max);
      p.maxLife = config.lifeSpan;
      p.life = p.maxLife;
      p.color = pickColor();
      p.active = true;
    }
  }

  function getInactiveParticle() {
    for (let i = 0; i < particlePoolSize; i++) {
      const p = particles[i];
      if (!p.active) return p;
    }
    return null;
  }

  function handlePointerMove(event) {
    if (reducedMotion || !running) return;
    const isMouse = event.pointerType === "mouse" || event.type === "mousemove";
    if (!isMouse) return;
    const x = event.clientX;
    const y = event.clientY;
    if (!lastPointer) {
      lastPointer = { x, y };
    }
    const dx = x - lastPointer.x;
    const dy = y - lastPointer.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const baseIntensity =
      config.effectType === "trail" ? 2 : config.effectType === "ripple" ? 8 : 4;
    const distanceFactor = Math.min(distance / 12, 4);
    const intensity = baseIntensity + distanceFactor * config.trailLength * 6;
    spawnBurst(x, y, intensity);
    lastPointer.x = x;
    lastPointer.y = y;
  }

  function handlePointerDown(event) {
    if (reducedMotion || !running) return;
    const x = event.clientX;
    const y = event.clientY;
    if (config.effectType === "ripple") {
      spawnRipple(x, y);
    } else {
      spawnBurst(x, y, 12);
    }
  }

  function animate(timestamp) {
    if (!running || reducedMotion) return;
    animationFrameId = requestAnimationFrame(animate);
    if (!ctx) return;
    if (!lastFrameTime) lastFrameTime = timestamp;
    const delta = timestamp - lastFrameTime;
    lastFrameTime = timestamp;
    const dt = delta;
    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = config.blendMode || "lighter";
    for (let i = 0; i < particlePoolSize; i++) {
      const p = particles[i];
      if (!p.active) continue;
      p.life -= dt;
      if (p.life <= 0) {
        p.active = false;
        continue;
      }
      const lifeRatio = p.life / p.maxLife;
      const ease = lifeRatio * lifeRatio;
      p.x += p.vx * (dt / 1000);
      p.y += p.vy * (dt / 1000);
      if (p.x < -50 || p.x > width + 50 || p.y < -50 || p.y > height + 50) {
        p.active = false;
        continue;
      }
      const alpha = ease;
      const size = p.size * (0.5 + 0.5 * ease);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function enableEffect() {
    if (!canvas || reducedMotion) return;
    if (running) return;
    running = true;
    lastFrameTime = 0;
    animationFrameId = requestAnimationFrame(animate);
  }

  function disableEffect() {
    running = false;
    lastPointer = null;
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
    if (ctx) {
      ctx.clearRect(0, 0, width, height);
    }
  }

  function init() {
    if (canvas || typeof document === "undefined") return;
    const mediaQuery = window.matchMedia
      ? window.matchMedia("(prefers-reduced-motion: reduce)")
      : null;
    reducedMotion = mediaQuery ? mediaQuery.matches : false;
    canvas = createCanvas();
    ctx = canvas.getContext("2d", { alpha: true });
    initColors();
    resize();
    initParticles();
    if (mediaQuery) {
      mediaQuery.addEventListener("change", (event) => {
        reducedMotion = event.matches;
        if (reducedMotion) {
          canvas.setAttribute("aria-hidden", "true");
          disableEffect();
        } else {
          canvas.removeAttribute("aria-hidden");
          enableEffect();
        }
      });
    }
    if (reducedMotion) {
      canvas.setAttribute("aria-hidden", "true");
      return;
    }
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handlePointerMove, { passive: true });
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown, { passive: true });
    enableEffect();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.disableCursorEffect = disableEffect;
  window.enableCursorEffect = enableEffect;
})();

