// ============ MOBİL MENÜ ============
const mobilMenuBtn = document.getElementById('mobilMenuBtn');
const navMenu = document.getElementById('navMenu');

if (mobilMenuBtn) {
  mobilMenuBtn.addEventListener('click', () => {
    navMenu.classList.toggle('aktif');
    mobilMenuBtn.classList.toggle('aktif');
  });
}

document.querySelectorAll('.nav-menu a').forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('aktif');
    if (mobilMenuBtn) mobilMenuBtn.classList.remove('aktif');
  });
});

// ============ NAVBAR SCROLL ============
const navbar = document.getElementById('navbar');
let sonScroll = 0;

window.addEventListener('scroll', () => {
  const sy = window.pageYOffset;
  
  if (navbar) {
    if (sy > 50) {
      navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
    } else {
      navbar.style.boxShadow = 'none';
    }
  }
  sonScroll = sy;
});

// ============ YUMUŞAK KAYDIRMA ============
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const hedef = this.getAttribute('href');
    if (hedef === '#' || hedef === '') return;
    
    const element = document.querySelector(hedef);
    if (element) {
      e.preventDefault();
      const offset = 80;
      const pos = element.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: pos, behavior: 'smooth' });
    }
  });
});

// ============ FADE-IN ANİMASYONU ============
const gozlemci = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('gorunur');
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

document.addEventListener('DOMContentLoaded', () => {
  const animasyonlu = document.querySelectorAll('.arac-karti, .neden-kart, .iletisim-kart, .ozellik-satir, .kolon-resim');
  animasyonlu.forEach((el, i) => {
    el.classList.add('fade-in');
    el.style.transitionDelay = `${(i % 6) * 0.08}s`;
    gozlemci.observe(el);
  });
});

console.log('🚗 Uzel Prestij Garaj — Lüks tasarım hazır!');