/**
 * GlycoTrack — background.js
 * Animated canvas background: floating RBC images, sugar cubes, blood drops.
 * The RBC image (assets/blood-cell.png) is loaded at runtime.
 */

(function () {
  const canvas = document.getElementById('bgCanvas');
  const ctx    = canvas.getContext('2d');
  let W, H;

  /* ── Resize to viewport ─────────────────────────── */
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  /* ── Pre-load RBC image ─────────────────────────── */
  const rbcImg  = new Image();
  let rbcLoaded = false;
  rbcImg.src    = 'assets/blood-cell.png';
  rbcImg.onload = () => { rbcLoaded = true; };

  /* ── Sugar cube (isometric 3-D) ─────────────────── */
  function drawSugarCube(ctx, s, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;

    const h  = s;
    const sk = h * 0.38;   // skew depth for top/right face

    // Front face
    ctx.beginPath();
    ctx.rect(-h / 2, -h / 2, h, h);
    ctx.fillStyle   = '#EDD9B8';
    ctx.fill();
    ctx.strokeStyle = '#C0A070';
    ctx.lineWidth   = 0.9;
    ctx.stroke();

    // Top face
    ctx.beginPath();
    ctx.moveTo(-h / 2,      -h / 2);
    ctx.lineTo(-h / 2 + sk, -h / 2 - sk);
    ctx.lineTo( h / 2 + sk, -h / 2 - sk);
    ctx.lineTo( h / 2,      -h / 2);
    ctx.closePath();
    ctx.fillStyle   = '#F5EDD0';
    ctx.fill();
    ctx.strokeStyle = '#C0A070';
    ctx.stroke();

    // Right face
    ctx.beginPath();
    ctx.moveTo( h / 2,      -h / 2);
    ctx.lineTo( h / 2 + sk, -h / 2 - sk);
    ctx.lineTo( h / 2 + sk,  h / 2 - sk);
    ctx.lineTo( h / 2,       h / 2);
    ctx.closePath();
    ctx.fillStyle   = '#D4B88A';
    ctx.fill();
    ctx.strokeStyle = '#C0A070';
    ctx.stroke();

    // Sugar grain dots on front face
    for (let i = 0; i < 4; i++) {
      const dx = -h / 2 + (i + 0.5) * h / 4;
      const dy = -h / 2 + h * 0.3;
      ctx.beginPath();
      ctx.arc(dx, dy, 0.9, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(192,160,112,0.55)';
      ctx.fill();
    }

    ctx.restore();
  }

  /* ── Mini blood drop ────────────────────────────── */
  function drawMiniDrop(ctx, r, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;

    ctx.beginPath();
    ctx.moveTo(0, -r * 1.2);
    ctx.bezierCurveTo( r * 0.7, -r * 0.4,  r * 0.85, r * 0.4, 0, r);
    ctx.bezierCurveTo(-r * 0.85, r * 0.4, -r * 0.7, -r * 0.4, 0, -r * 1.2);
    ctx.fillStyle = 'rgba(192,49,10,0.85)';
    ctx.fill();

    // Shine highlight
    ctx.beginPath();
    ctx.ellipse(-r * 0.24, -r * 0.22, r * 0.17, r * 0.27, -0.4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.22)';
    ctx.fill();

    ctx.restore();
  }

  /* ── Particle class ─────────────────────────────── */
  class Particle {
    constructor(init) {
      this.reset(init);
    }

    reset(init) {
      this.x = Math.random() * W;
      this.y = init ? Math.random() * H : H + 80;

      // 60 % RBCs, 40 % sugar cubes
      const r = Math.random();
      this.type = r < 0.60 ? 'rbc' : 'sugar';

      if (this.type === 'rbc') {
        this.size  = 22 + Math.random() * 22;
        this.alpha = 0.16 + Math.random() * 0.18;
      } else if (this.type === 'sugar') {
        this.size  = 13 + Math.random() * 12;
        this.alpha = 0.32 + Math.random() * 0.24;
      } else {
        this.size  = 7  + Math.random() * 8;
        this.alpha = 0.14 + Math.random() * 0.16;
      }

      this.vx     = (Math.random() - 0.5) * 0.3;
      this.vy     = -(0.18 + Math.random() * 0.4);
      this.rot    = Math.random() * Math.PI * 2;
      this.vrot   = (Math.random() - 0.5) * 0.008;
      this.wobble = Math.random() * Math.PI * 2;
      this.wSpeed = 0.013 + Math.random() * 0.014;
    }

    update() {
      this.wobble += this.wSpeed;
      this.x      += this.vx + Math.sin(this.wobble) * 0.25;
      this.y      += this.vy;
      this.rot    += this.vrot;
      if (this.y < -90) this.reset(false);
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rot);

      if (this.type === 'rbc' && rbcLoaded) {
        ctx.globalAlpha = this.alpha;
        const s = this.size;
        // Draw the real RBC PNG with a natural aspect ratio
        ctx.drawImage(rbcImg, -s, -s * 0.75, s * 2, s * 1.5);

      } else if (this.type === 'sugar') {
        drawSugarCube(ctx, this.size, this.alpha);
      }

      ctx.restore();
    }
  }

  /* ── Spawn particles & run loop ─────────────────── */
  const particles = Array.from({ length: 18 }, (_, i) => new Particle(true));

  (function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(loop);
  })();

})();
