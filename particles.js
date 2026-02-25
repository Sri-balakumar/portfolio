(function () {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Theme-aware color palettes
  const themes = {
    dark: {
      lineColor: { r: 100, g: 180, b: 255 },
      dotColor: { r: 120, g: 200, b: 255 }
    },
    light: {
      lineColor: { r: 37, g: 99, b: 235 },
      dotColor: { r: 37, g: 99, b: 235 }
    }
  };

  function getThemeColors() {
    var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    return isDark ? themes.dark : themes.light;
  }

  // Configuration
  const config = {
    particleCount: 120,
    maxConnectionDist: 150,
    particleMinSize: 1,
    particleMaxSize: 3,
    speed: 0.4,
    mouseRadius: 200,
    clickBurst: 15,
    lineColor: getThemeColors().lineColor,
    dotColor: getThemeColors().dotColor,
    maxParticles: 350,
    clickParticleLife: 300
  };

  // Update colors when theme changes
  var themeObserver = new MutationObserver(function () {
    var colors = getThemeColors();
    config.lineColor = colors.lineColor;
    config.dotColor = colors.dotColor;
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  let particles = [];
  let mouse = { x: -1000, y: -1000 };
  let width, height;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  window.addEventListener('resize', resize);
  resize();

  // Particle class with 3D depth (z-axis)
  class Particle {
    constructor(x, y, isBurst) {
      this.x = x != null ? x : Math.random() * width;
      this.y = y != null ? y : Math.random() * height;
      this.z = Math.random(); // 0 (far) to 1 (close)

      const depthSpeed = 0.2 + this.z * 0.8;
      const angle = Math.random() * Math.PI * 2;
      const speed = (isBurst ? (2 + Math.random() * 3) : config.speed) * depthSpeed;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;

      this.baseSize = config.particleMinSize + this.z * (config.particleMaxSize - config.particleMinSize);
      this.size = this.baseSize;
      this.opacity = 0.3 + this.z * 0.7;

      this.life = isBurst ? config.clickParticleLife : 0;
      this.maxLife = this.life;
      this.isBurst = !!isBurst;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      // Slow down burst particles over time
      if (this.isBurst) {
        this.vx *= 0.993;
        this.vy *= 0.993;
        this.life--;
        this.opacity = Math.max(0, (this.life / this.maxLife) * (0.3 + this.z * 0.7));
      }

      // Mouse attraction/repulsion — particles gently drift toward cursor
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < config.mouseRadius && dist > 0) {
        const force = (1 - dist / config.mouseRadius) * 0.03 * this.z;
        this.vx += (dx / dist) * force;
        this.vy += (dy / dist) * force;
      }

      // Wrap around edges
      const pad = 50;
      if (this.x < -pad) this.x = width + pad;
      if (this.x > width + pad) this.x = -pad;
      if (this.y < -pad) this.y = height + pad;
      if (this.y > height + pad) this.y = -pad;
    }

    draw() {
      const { r, g, b } = config.dotColor;
      var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      var opacityMult = isDark ? 1 : 1.4;
      var drawOpacity = Math.min(this.opacity * opacityMult, 1);

      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + drawOpacity + ')';
      ctx.fill();

      // Glow for closer particles
      if (this.z > 0.5) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + (drawOpacity * (isDark ? 0.08 : 0.15)) + ')';
        ctx.fill();
      }
    }
  }

  // Initialize particles
  function init() {
    particles = [];
    for (let i = 0; i < config.particleCount; i++) {
      particles.push(new Particle());
    }
  }

  // Draw connection lines between nearby particles
  function drawConnections() {
    const { r, g, b } = config.lineColor;
    var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    var lineMult = isDark ? 0.6 : 1.0;
    var mouseMult = isDark ? 0.5 : 0.8;

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i];
        const p2 = particles[j];
        const dx = a.x - p2.x;
        const dy = a.y - p2.y;
        const distSq = dx * dx + dy * dy;

        // Connection distance scales with average depth
        const avgZ = (a.z + p2.z) / 2;
        const maxDist = config.maxConnectionDist * (0.5 + avgZ * 0.5);

        if (distSq < maxDist * maxDist) {
          const dist = Math.sqrt(distSq);
          const lineOpacity = (1 - dist / maxDist) * Math.min(a.opacity, p2.opacity) * lineMult;

          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + lineOpacity + ')';
          ctx.lineWidth = 0.3 + avgZ * 0.8;
          ctx.stroke();
        }
      }
    }

    // Draw lines from mouse to nearby particles
    if (mouse.x > 0 && mouse.y > 0) {
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < config.mouseRadius) {
          const lineOpacity = (1 - dist / config.mouseRadius) * p.opacity * mouseMult;
          ctx.beginPath();
          ctx.moveTo(mouse.x, mouse.y);
          ctx.lineTo(p.x, p.y);
          ctx.strokeStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + lineOpacity + ')';
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }
  }

  // Spawn burst particles on click
  function spawnBurst(x, y) {
    for (let i = 0; i < config.clickBurst; i++) {
      if (particles.length < config.maxParticles) {
        particles.push(new Particle(x, y, true));
      }
    }
  }

  // Animation loop
  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Remove dead burst particles
    particles = particles.filter(function (p) {
      return !p.isBurst || p.life > 0;
    });

    // Sort by depth (back to front) for 3D layering
    particles.sort(function (a, b) { return a.z - b.z; });

    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
    }

    drawConnections();

    for (let i = 0; i < particles.length; i++) {
      particles[i].draw();
    }

    requestAnimationFrame(animate);
  }

  // --- Event listeners on DOCUMENT so they work over all content ---
  document.addEventListener('mousemove', function (e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  document.addEventListener('mouseleave', function () {
    mouse.x = -1000;
    mouse.y = -1000;
  });

  document.addEventListener('click', function (e) {
    spawnBurst(e.clientX, e.clientY);
  });

  // Touch support
  document.addEventListener('touchstart', function (e) {
    if (e.touches.length > 0) {
      var touch = e.touches[0];
      mouse.x = touch.clientX;
      mouse.y = touch.clientY;
      spawnBurst(touch.clientX, touch.clientY);
    }
  }, { passive: true });

  document.addEventListener('touchmove', function (e) {
    if (e.touches.length > 0) {
      var touch = e.touches[0];
      mouse.x = touch.clientX;
      mouse.y = touch.clientY;
    }
  }, { passive: true });

  document.addEventListener('touchend', function () {
    mouse.x = -1000;
    mouse.y = -1000;
  });

  init();
  animate();
})();
