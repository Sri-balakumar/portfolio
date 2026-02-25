// ==================== UTILITIES ====================
function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
function throttle(func, limit) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// ==================== DOM ELEMENTS ====================
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const backToTopBtn = document.querySelector('.back-to-top');
const navbar = document.querySelector('.navbar');
const modal = document.getElementById('certificateModal');
const modalImg = document.getElementById('modalImage');
const modalClose = document.querySelector('.modal-close');
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('theme-icon');
const progressBar = document.querySelector('.reading-progress-bar');
const cursorDot = document.getElementById('cursorDot');
const cursorRing = document.getElementById('cursorRing');

// ==================== DISABLE DEV TOOLS ====================
(function () {
  document.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  document.addEventListener('keydown', function (e) {
    if (e.keyCode === 123) { e.preventDefault(); return false; }
    if (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) { e.preventDefault(); return false; }
    if (e.ctrlKey && (e.keyCode === 85 || e.keyCode === 83)) { e.preventDefault(); return false; }
  });
  document.addEventListener('dragstart', function (e) { e.preventDefault(); });
})();

// ==================== PAGE LOADER ====================
window.addEventListener('load', function () {
  const loader = document.getElementById('pageLoader');
  if (loader) {
    setTimeout(function () {
      loader.classList.add('hidden');
    }, 1200);
  }
  // Set dynamic year
  var yearEl = document.getElementById('currentYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});

// ==================== THEME MANAGEMENT ====================
class ThemeManager {
  constructor() {
    this.currentTheme = this.getStoredTheme() || 'dark';
    this.applyTheme(this.currentTheme);
    this.setupEventListeners();
  }
  getStoredTheme() { try { return localStorage.getItem('theme'); } catch (e) { return null; } }
  setStoredTheme(theme) { try { localStorage.setItem('theme', theme); } catch (e) {} }
  getPreferredTheme() { return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; }
  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (themeIcon) themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    this.currentTheme = theme;
    this.setStoredTheme(theme);
  }
  toggleTheme() {
    this.applyTheme(this.currentTheme === 'dark' ? 'light' : 'dark');
    if (themeToggle) {
      themeToggle.style.transform = 'scale(0.9)';
      setTimeout(() => { themeToggle.style.transform = 'scale(1)'; }, 150);
    }
  }
  setupEventListeners() {
    if (themeToggle) themeToggle.addEventListener('click', () => this.toggleTheme());
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!this.getStoredTheme()) this.applyTheme(e.matches ? 'dark' : 'light');
    });
  }
}
const themeManager = new ThemeManager();

// ==================== CUSTOM CURSOR ====================
(function () {
  if (!cursorDot || !cursorRing) return;
  let mouseX = -100, mouseY = -100;
  let ringX = -100, ringY = -100;

  document.addEventListener('mousemove', function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorDot.style.left = mouseX + 'px';
    cursorDot.style.top = mouseY + 'px';
  });

  function animateRing() {
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;
    cursorRing.style.left = ringX + 'px';
    cursorRing.style.top = ringY + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  // Hover effect on interactive elements
  var hoverTargets = document.querySelectorAll('a, button, .btn, .project-card, .skill-item, .certificate-card, .contact-item, .social-link, .filter-btn');
  hoverTargets.forEach(function (el) {
    el.addEventListener('mouseenter', function () { cursorRing.classList.add('hover'); });
    el.addEventListener('mouseleave', function () { cursorRing.classList.remove('hover'); });
  });
})();

// ==================== READING PROGRESS ====================
function updateReadingProgress() {
  var scrollTop = window.pageYOffset;
  var docHeight = document.documentElement.scrollHeight - window.innerHeight;
  if (progressBar && docHeight > 0) {
    progressBar.style.width = Math.min((scrollTop / docHeight) * 100, 100) + '%';
  }
}

// ==================== SMOOTH SCROLL ====================
document.querySelectorAll('a[href^="#"]').forEach(function (link) {
  link.addEventListener('click', function (e) {
    e.preventDefault();
    var target = document.querySelector(link.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// ==================== MOBILE NAV ====================
if (hamburger) {
  hamburger.addEventListener('click', function () {
    hamburger.classList.toggle('active');
    if (navMenu) navMenu.classList.toggle('active');
  });
}
navLinks.forEach(function (link) {
  link.addEventListener('click', function () {
    if (hamburger) hamburger.classList.remove('active');
    if (navMenu) navMenu.classList.remove('active');
  });
});

// ==================== ACTIVE NAV LINK ====================
function setActiveNavLink() {
  var sections = document.querySelectorAll('section[id]');
  var scrollY = window.pageYOffset;
  sections.forEach(function (section) {
    var top = section.offsetTop - 100;
    var height = section.offsetHeight;
    var id = section.getAttribute('id');
    var navLink = document.querySelector('.nav-link[href="#' + id + '"]');
    if (scrollY > top && scrollY <= top + height) {
      navLinks.forEach(function (l) { l.classList.remove('active'); });
      if (navLink) navLink.classList.add('active');
    }
  });
}

// ==================== NAVBAR SCROLL ====================
function handleNavbarScroll() {
  if (!navbar) return;
  if (window.scrollY > 100) {
    navbar.style.boxShadow = themeManager.currentTheme === 'dark'
      ? '0 2px 30px rgba(0,0,0,0.4)' : '0 2px 30px rgba(0,0,0,0.1)';
  } else {
    navbar.style.boxShadow = 'none';
  }
}

// ==================== BACK TO TOP ====================
function handleBackToTop() {
  if (backToTopBtn) {
    if (window.pageYOffset > 300) backToTopBtn.classList.add('show');
    else backToTopBtn.classList.remove('show');
  }
}
if (backToTopBtn) {
  backToTopBtn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// Reading progress runs on every frame for smooth bar
window.addEventListener('scroll', updateReadingProgress, { passive: true });

// Other scroll handlers are debounced
var handleScroll = debounce(function () {
  setActiveNavLink();
  handleNavbarScroll();
  handleBackToTop();
}, 10);
window.addEventListener('scroll', handleScroll, { passive: true });

// ==================== TYPING ANIMATION ====================
document.addEventListener('DOMContentLoaded', function () {
  var typingEl = document.querySelector('.typing-text');
  if (typingEl && typeof Typed !== 'undefined') {
    new Typed('.typing-text', {
      strings: ['Junior Software Developer'],
      typeSpeed: 80,
      backSpeed: 50,
      backDelay: 1500,
      startDelay: 2200,
      loop: true,
      showCursor: true,
      cursorChar: '|',
      smartBackspace: true,
    });
  }
});

// ==================== CERTIFICATE MODAL ====================
function openCertificate(src) {
  if (modal && modalImg) {
    modal.style.display = 'block';
    modalImg.src = src;
    document.body.style.overflow = 'hidden';
  }
}
function closeCertificate() {
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
}
if (modalClose) modalClose.addEventListener('click', closeCertificate);
if (modal) modal.addEventListener('click', function (e) { if (e.target === modal) closeCertificate(); });
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && modal && modal.style.display === 'block') closeCertificate();
});

// ==================== ANIMATED COUNTERS ====================
function initCounters() {
  var counters = document.querySelectorAll('.stat-number[data-target]');
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var el = entry.target;
        var target = parseInt(el.getAttribute('data-target'), 10);
        var duration = 1500;
        var start = 0;
        var startTime = null;

        function step(timestamp) {
          if (!startTime) startTime = timestamp;
          var progress = Math.min((timestamp - startTime) / duration, 1);
          // Ease out cubic
          var eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.floor(eased * target);
          if (progress < 1) {
            requestAnimationFrame(step);
          } else {
            el.textContent = target;
          }
        }
        requestAnimationFrame(step);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(function (c) { observer.observe(c); });
}

// ==================== SCROLL ANIMATIONS ====================
function initScrollAnimations() {
  var elements = document.querySelectorAll(
    '.project-card, .skill-item, .certificate-card, .timeline-item, .contact-card, .stat-card'
  );
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry, idx) {
      if (entry.isIntersecting) {
        setTimeout(function () {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, idx * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

  elements.forEach(function (el) {
    el.style.opacity = '0';
    el.style.transform = 'translateY(40px)';
    el.style.transition = 'all 0.7s cubic-bezier(0.4, 0, 0.2, 1)';
    observer.observe(el);
  });
}

// ==================== SECTION TITLE REVEAL ====================
function initTitleReveal() {
  var titles = document.querySelectorAll('.reveal-text');
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  titles.forEach(function (t) { observer.observe(t); });
}


// ==================== 3D TILT EFFECT ====================
function initTiltEffect() {
  var cards = document.querySelectorAll('.tilt-card');
  cards.forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var rect = card.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      var centerX = rect.width / 2;
      var centerY = rect.height / 2;
      var rotateX = ((y - centerY) / centerY) * -8;
      var rotateY = ((x - centerX) / centerX) * 8;
      card.style.transform = 'perspective(800px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) scale3d(1.02, 1.02, 1.02)';
    });
    card.addEventListener('mouseleave', function () {
      card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    });
  });
}

// ==================== MAGNETIC BUTTONS ====================
function initMagneticButtons() {
  var btns = document.querySelectorAll('.magnetic');
  btns.forEach(function (btn) {
    btn.addEventListener('mousemove', function (e) {
      var rect = btn.getBoundingClientRect();
      var x = e.clientX - rect.left - rect.width / 2;
      var y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = 'translate(' + (x * 0.2) + 'px, ' + (y * 0.2) + 'px)';
    });
    btn.addEventListener('mouseleave', function () {
      btn.style.transform = 'translate(0, 0)';
    });
  });
}

// ==================== PROJECT FILTERS ====================
function initProjectFilters() {
  var filterBtns = document.querySelectorAll('.filter-btn');
  var projectCards = document.querySelectorAll('.project-card');
  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var filter = btn.getAttribute('data-filter');
      projectCards.forEach(function (card) {
        if (filter === 'all' || card.getAttribute('data-category') === filter) {
          card.classList.remove('filter-hidden');
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          setTimeout(function () {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 50);
        } else {
          card.classList.add('filter-hidden');
        }
      });
    });
  });
}


// ==================== PARALLAX BG ELEMENTS ====================
function initParallax() {
  var els = document.querySelectorAll('.bg-element');
  var handler = throttle(function () {
    var scrolled = window.pageYOffset;
    els.forEach(function (el, i) {
      el.style.transform = 'translateY(' + (scrolled * -0.5 * (i + 1) * 0.2) + 'px)';
    });
  }, 16);
  window.addEventListener('scroll', handler, { passive: true });
}

// ==================== SECTION ENTRANCE ANIMATION ====================
function initSectionEntrance() {
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  document.querySelectorAll('section:not(.hero)').forEach(function (section) {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
    observer.observe(section);
  });
}

// ==================== INIT ALL ====================
document.addEventListener('DOMContentLoaded', function () {
  initScrollAnimations();
  initTitleReveal();
  initTiltEffect();
  initMagneticButtons();
  initProjectFilters();
  initParallax();
  initSectionEntrance();
  initCounters();
});

// Pause animations when tab hidden
document.addEventListener('visibilitychange', function () {
  document.body.style.animationPlayState = document.hidden ? 'paused' : 'running';
});

// Export
window.portfolioTheme = themeManager;
window.openCertificate = openCertificate;
window.closeCertificate = closeCertificate;
