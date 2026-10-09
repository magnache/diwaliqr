/**
 * DEEPAVALI • FESTIVAL OF LIGHTS
 * Interactive JavaScript Engine
 * Provides particle atmosphere, fireworks, Web Audio chimes, interactive lighting & QR handling
 */

document.addEventListener('DOMContentLoaded', () => {
  initAmbientParticles();
  initFireworksCanvas();
  initAudioEngine();
  initDiyaInteractions();
  initIlluminationSlider();
  initWishGenerator();
  initQrModal();
  initNavigation();
});

/* ==========================================================================
   1. AMBIENT GOLDEN SPARK PARTICLES CANVAS
   ========================================================================== */
function initAmbientParticles() {
  const canvas = document.getElementById('ambientCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = [];
  const particleCount = Math.min(65, Math.floor(width / 20));

  class SparkParticle {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : height + 10;
      this.size = Math.random() * 2.5 + 0.8;
      this.speedY = Math.random() * 0.7 + 0.2;
      this.speedX = (Math.random() - 0.5) * 0.4;
      this.opacity = Math.random() * 0.7 + 0.2;
      this.pulseSpeed = Math.random() * 0.03 + 0.01;
      this.hue = Math.random() > 0.3 ? 42 : 28; // Gold or warm saffron
    }

    update() {
      this.y -= this.speedY;
      this.x += this.speedX;
      this.opacity += Math.sin(Date.now() * this.pulseSpeed * 0.05) * 0.01;

      if (this.y < -10 || this.x < -10 || this.x > width + 10) {
        this.reset();
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${this.hue}, 95%, 65%, ${Math.max(0.1, Math.min(0.9, this.opacity))})`;
      ctx.shadowBlur = 10;
      ctx.shadowColor = `hsla(${this.hue}, 100%, 70%, 0.8)`;
      ctx.fill();
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new SparkParticle());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    for (const p of particles) {
      p.update();
      p.draw();
    }
    requestAnimationFrame(animate);
  }

  animate();
}

/* ==========================================================================
   2. INTERACTIVE FIREWORKS ENGINE
   ========================================================================== */
let launchFireworkBurst = null;

function initFireworksCanvas() {
  const canvas = document.getElementById('fireworksCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const fireworkParticles = [];
  const festiveColors = [
    '#f59e0b', '#fbbf24', '#fde047', '#ef4444', 
    '#ec4899', '#8b5cf6', '#10b981', '#06b6d4', '#ffffff'
  ];

  class FireworkParticle {
    constructor(x, y, color) {
      this.x = x;
      this.y = y;
      this.color = color;
      const angle = Math.random() * Math.PI * 2;
      const velocity = Math.random() * 6 + 2;
      this.vx = Math.cos(angle) * velocity;
      this.vy = Math.sin(angle) * velocity;
      this.friction = 0.94;
      this.gravity = 0.12;
      this.alpha = 1;
      this.decay = Math.random() * 0.02 + 0.015;
      this.size = Math.random() * 3 + 1.5;
    }

    update() {
      this.vx *= this.friction;
      this.vy *= this.friction;
      this.vy += this.gravity;
      this.x += this.vx;
      this.y += this.vy;
      this.alpha -= this.decay;
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = Math.max(0, this.alpha);
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.shadowBlur = 12;
      ctx.shadowColor = this.color;
      ctx.fill();
      ctx.restore();
    }
  }

  launchFireworkBurst = function(x, y, count = 45) {
    const color = festiveColors[Math.floor(Math.random() * festiveColors.length)];
    for (let i = 0; i < count; i++) {
      fireworkParticles.push(new FireworkParticle(x, y, color));
    }
    // Also trigger sound if audio enabled
    playFireworkSound();
  };

  function animate() {
    ctx.clearRect(0, 0, width, height);

    for (let i = fireworkParticles.length - 1; i >= 0; i--) {
      const p = fireworkParticles[i];
      p.update();
      p.draw();
      if (p.alpha <= 0) {
        fireworkParticles.splice(i, 1);
      }
    }
    requestAnimationFrame(animate);
  }

  animate();

  // Click anywhere in wishes section to burst fireworks
  const wishesSection = document.getElementById('wishes');
  if (wishesSection) {
    wishesSection.addEventListener('click', (e) => {
      // Don't trigger if clicked inside inputs or buttons
      if (['INPUT', 'BUTTON', 'A'].includes(e.target.tagName)) return;
      launchFireworkBurst(e.clientX, e.clientY, 50);
    });
  }

  // Burst Fireworks Button
  const burstBtn = document.getElementById('burstFireworksBtn');
  if (burstBtn) {
    burstBtn.addEventListener('click', () => {
      const btnRect = burstBtn.getBoundingClientRect();
      for (let i = 0; i < 4; i++) {
        setTimeout(() => {
          const rx = window.innerWidth * (0.2 + Math.random() * 0.6);
          const ry = window.innerHeight * (0.2 + Math.random() * 0.4);
          launchFireworkBurst(rx, ry, 60);
        }, i * 280);
      }
      showToast('🎆 Happy Diwali! Sparklers ignited!');
    });
  }
}

/* ==========================================================================
   3. WEB AUDIO FESTIVE CHIMES SYNTHESIZER (ZERO EXTERNAL ASSETS)
   ========================================================================== */
let audioCtx = null;
let isAudioPlaying = false;
let chimeInterval = null;

function initAudioEngine() {
  const audioBtn = document.getElementById('audioToggleBtn');
  if (!audioBtn) return;

  // Indian Pentatonic Raag Scale Frequencies (Mohanam / Bhupali: Sa, Ri, Ga, Pa, Dha)
  const raagScale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99];

  function playChimeNote(freq) {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.08, audioCtx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 2.5);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 2.6);
  }

  audioBtn.addEventListener('click', () => {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (isAudioPlaying) {
      clearInterval(chimeInterval);
      isAudioPlaying = false;
      audioBtn.classList.remove('active');
      audioBtn.querySelector('.btn-icon').textContent = '🔔';
      showToast('Festive chimes muted');
    } else {
      isAudioPlaying = true;
      audioBtn.classList.add('active');
      audioBtn.querySelector('.btn-icon').textContent = '🎶';
      showToast('🎵 Playing sacred festive chimes...');

      // Play immediate note
      playChimeNote(raagScale[2]);

      // Play soothing random notes in scale
      chimeInterval = setInterval(() => {
        const note = raagScale[Math.floor(Math.random() * raagScale.length)];
        playChimeNote(note);
      }, 1600);
    }
  });
}

function playFireworkSound() {
  if (!audioCtx || audioCtx.state !== 'running') return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.35);
  } catch (e) {
    // Audio context safe fallback
  }
}

/* ==========================================================================
   4. DIYA KINDLING & ILLUMINATION INTERACTIONS
   ========================================================================== */
function initDiyaInteractions() {
  // Hero Diya Click
  const heroDiya = document.getElementById('heroInteractiveDiya');
  if (heroDiya) {
    heroDiya.addEventListener('click', (e) => {
      const rect = heroDiya.getBoundingClientRect();
      if (launchFireworkBurst) {
        launchFireworkBurst(rect.left + rect.width / 2, rect.top + 20, 30);
      }
      showToast('🪔 Sacred Diya kindled! May your life be filled with radiant joy!');
    });
  }

  // Navbar Light All Diyas Button
  const lightAllBtn = document.getElementById('lightAllDiyasBtn');
  if (lightAllBtn) {
    let allLit = false;
    lightAllBtn.addEventListener('click', () => {
      allLit = !allLit;
      document.body.classList.toggle('fully-illuminated', allLit);
      lightAllBtn.classList.toggle('active', allLit);

      if (allLit) {
        showToast('✨ All Diyas across the realm are illuminated!');
        if (launchFireworkBurst) {
          launchFireworkBurst(window.innerWidth * 0.3, 200, 35);
          launchFireworkBurst(window.innerWidth * 0.7, 200, 35);
        }
      } else {
        showToast('Night returns to peaceful starlight.');
      }
    });
  }
}

// Global functions callable from inline buttons
window.kindleCardDiya = function(btn) {
  const card = btn.closest('.pillar-card');
  card.style.boxShadow = '0 0 45px rgba(245, 158, 11, 0.7), 0 20px 50px rgba(0,0,0,0.8)';
  setTimeout(() => {
    card.style.boxShadow = '';
  }, 2500);

  const rect = btn.getBoundingClientRect();
  if (launchFireworkBurst) {
    launchFireworkBurst(rect.left + rect.width / 2, rect.top, 25);
  }
  showToast('🪔 Diya kindled! Radiating purity and positivity.');
};

window.shimmerRangoli = function(btn) {
  const img = btn.closest('.pillar-card').querySelector('.pillar-img');
  img.style.filter = 'brightness(1.25) saturate(1.4)';
  setTimeout(() => {
    img.style.filter = '';
  }, 2000);

  const rect = btn.getBoundingClientRect();
  if (launchFireworkBurst) {
    launchFireworkBurst(rect.left + rect.width / 2, rect.top, 25);
  }
  showToast('🎨 Rangoli shimmering! Welcoming harmony and prosperity.');
};

window.showerFlowerPetals = function(btn) {
  const rect = btn.getBoundingClientRect();
  if (launchFireworkBurst) {
    launchFireworkBurst(rect.left + rect.width / 2, rect.top, 30);
  }
  showToast('🌸 Showers of fresh marigolds & jasmine blessings!');
};

window.shareSweetWish = function(btn) {
  const rect = btn.getBoundingClientRect();
  if (launchFireworkBurst) {
    launchFireworkBurst(rect.left + rect.width / 2, rect.top, 25);
  }
  showToast('🍬 Sweet Diwali delicacies shared with loved ones!');
};

/* ==========================================================================
   5. DARKNESS TO LIGHT ILLUMINATION SLIDER
   ========================================================================== */
function initIlluminationSlider() {
  const slider = document.getElementById('illuminationSlider');
  const virtues = document.querySelectorAll('.virtue-chip');
  if (!slider || !virtues.length) return;

  function updateIllumination(val) {
    virtues.forEach(chip => {
      const threshold = parseInt(chip.dataset.level, 10);
      if (val >= threshold) {
        chip.classList.add('active');
      } else {
        chip.classList.remove('active');
      }
    });

    const glowVal = (val / 100);
    document.documentElement.style.setProperty('--illumination-glow', glowVal);
  }

  slider.addEventListener('input', (e) => {
    updateIllumination(parseInt(e.target.value, 10));
  });

  // Initial trigger
  updateIllumination(parseInt(slider.value, 10));
}

/* ==========================================================================
   6. PERSONALIZED DIWALI WISH GENERATOR
   ========================================================================== */
function initWishGenerator() {
  const nameInput = document.getElementById('senderNameInput');
  const generateBtn = document.getElementById('generateWishBtn');
  const greetingEl = document.getElementById('previewGreetingText');
  const senderEl = document.getElementById('previewSenderText');
  const copyBtn = document.getElementById('copyWishBtn');
  const whatsappBtn = document.getElementById('whatsappWishBtn');

  if (!generateBtn) return;

  const greetings = [
    "Wishing you and your family a joyous, radiant, and prosperous Deepavali! May the divine lamps guide you toward success and endless blessings.",
    "May the golden light of diyas guide your footsteps and bring harmony, laughter, and wealth into your household. Happy Diwali!",
    "On this auspicious festival of lights, may your life be filled with sweet moments, bright beginnings, and supreme peace. Shubh Deepavali!"
  ];

  generateBtn.addEventListener('click', () => {
    const name = nameInput.value.trim() || 'Your Friend';
    const randomGreet = greetings[Math.floor(Math.random() * greetings.length)];
    
    greetingEl.textContent = `“${randomGreet}”`;
    senderEl.textContent = `— Warm wishes from ${name}`;
    
    showToast(`✨ Personalized wish created for ${name}!`);
    if (launchFireworkBurst) {
      const rect = generateBtn.getBoundingClientRect();
      launchFireworkBurst(rect.left + rect.width / 2, rect.top, 25);
    }
  });

  copyBtn.addEventListener('click', () => {
    const fullMessage = `${greetingEl.textContent}\n${senderEl.textContent}\n\nExperience Diwali Webpage: https://magnache.github.io/diwaliqr/`;
    navigator.clipboard.writeText(fullMessage).then(() => {
      showToast('📋 Wish copied to clipboard!');
    }).catch(() => {
      showToast('📋 Wish text copied!');
    });
  });

  whatsappBtn.addEventListener('click', () => {
    const fullMessage = encodeURIComponent(`${greetingEl.textContent}\n${senderEl.textContent}\n\n🪔 Visit Diwali Page & Scan QR: https://magnache.github.io/diwaliqr/`);
    window.open(`https://api.whatsapp.com/send?text=${fullMessage}`, '_blank');
  });
}

/* ==========================================================================
   7. QR CODE MODAL & DYNAMIC URL HANDLING
   ========================================================================== */
function initQrModal() {
  const openBtn = document.getElementById('openQrModalBtn');
  const closeBtn = document.getElementById('closeQrModalBtn');
  const backdrop = document.getElementById('qrModalBackdrop');
  const copyUrlBtn = document.getElementById('copyUrlBtn');
  const modalCopyBtn = document.getElementById('modalCopyBtn');
  const liveLink = document.getElementById('livePageUrlLink');
  const modalUrlCode = document.getElementById('modalUrlCode');

  // Determine current or target URL
  const targetUrl = 'https://magnache.github.io/diwaliqr/';

  function openModal() {
    backdrop.classList.add('open');
    backdrop.setAttribute('aria-hidden', 'false');
  }

  function closeModal() {
    backdrop.classList.remove('open');
    backdrop.setAttribute('aria-hidden', 'true');
  }

  if (openBtn) openBtn.addEventListener('click', openModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  if (backdrop) {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && backdrop && backdrop.classList.contains('open')) {
      closeModal();
    }
  });

  function copyLiveUrl() {
    navigator.clipboard.writeText(targetUrl).then(() => {
      showToast('📋 Live URL copied to clipboard!');
    }).catch(() => {
      showToast('📋 Copied: ' + targetUrl);
    });
  }

  if (copyUrlBtn) copyUrlBtn.addEventListener('click', copyLiveUrl);
  if (modalCopyBtn) modalCopyBtn.addEventListener('click', copyLiveUrl);
}

/* ==========================================================================
   8. NAVIGATION & MOBILE DRAWER
   ========================================================================== */
function initNavigation() {
  const menuBtn = document.getElementById('mobileMenuToggle');
  const drawer = document.getElementById('mobileDrawer');
  const drawerLinks = document.querySelectorAll('.drawer-link');

  if (menuBtn && drawer) {
    menuBtn.addEventListener('click', () => {
      drawer.classList.toggle('open');
    });

    drawerLinks.forEach(link => {
      link.addEventListener('click', () => {
        drawer.classList.remove('open');
      });
    });
  }
}

/* ==========================================================================
   9. TOAST NOTIFICATION UTILITY
   ========================================================================== */
let toastTimeout = null;
function showToast(message) {
  const toast = document.getElementById('toastNotification');
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add('show');

  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}
