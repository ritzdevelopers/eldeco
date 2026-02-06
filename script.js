// Register GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Eldeco stats counter animation - runs when section scrolls into view
function initEldecoStatsCounter() {
  const section = document.getElementById('eldeco-group');
  const statEls = document.querySelectorAll('.eldeco-stat-num');
  if (!section || !statEls.length) return;

  statEls.forEach((el) => {
    const target = parseInt(el.getAttribute('data-count'), 10);
    const suffix = el.getAttribute('data-suffix') || '';
    const obj = { value: 0 };

    gsap.to(obj, {
      value: target,
      duration: 2,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: section,
        start: 'top 80%',
        once: true,
      },
      onUpdate: () => {
        el.textContent = Math.round(obj.value).toLocaleString('en-IN') + suffix;
      },
    });
  });
}

// Initialize Lenis smooth scroll
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  direction: 'vertical',
  gestureDirection: 'vertical',
  smooth: true,
  smoothTouch: false,
  touchMultiplier: 2,
});

// Lenis RAF loop
function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

document.addEventListener('DOMContentLoaded', () => {
  initEldecoStatsCounter();

  // Navbar Elements
  const navbar = document.getElementById('navbar');
  const mobileNavbar = document.getElementById('mobile-navbar');
  const mobileMenu = document.getElementById('mobile-menu');
  const menuToggle = document.getElementById('menu-toggle');
  const menuIcon = document.getElementById('menu-icon');
  const closeIcon = document.getElementById('close-icon');

  // Navbar Scroll Background Change - add bg-black when scrolled
  function handleNavbarScroll() {
    const scrollY = window.scrollY || window.pageYOffset;

    if (navbar) {
      if (scrollY > 0) {
        navbar.classList.add('bg-black');
        navbar.classList.remove('bg-transparent');
      } else {
        navbar.classList.remove('bg-black');
        navbar.classList.add('bg-transparent');
      }
    }

    if (mobileNavbar) {
      if (scrollY > 0) {
        mobileNavbar.classList.add('bg-black');
        mobileNavbar.classList.remove('bg-transparent');
      } else {
        mobileNavbar.classList.remove('bg-black');
        mobileNavbar.classList.add('bg-transparent');
      }
    }
  }

  lenis.on('scroll', (e) => {
    handleNavbarScroll();
    ScrollTrigger.update();
  });
  window.addEventListener('scroll', handleNavbarScroll);
  handleNavbarScroll();

  // Nav links - smooth scroll with Lenis
  document.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('data-nav');
      const targetSection = document.getElementById(targetId);
      if (targetSection) {
        lenis.scrollTo(targetSection, {
          offset: -80,
          duration: 1.2,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        });
      }
    });
  });

  // CTA buttons with data-scroll-to
  document.querySelectorAll('[data-scroll-to]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const targetId = btn.getAttribute('data-scroll-to');
      const targetSection = document.getElementById(targetId);
      if (targetSection) {
        e.preventDefault();
        lenis.scrollTo(targetSection, {
          offset: -80,
          duration: 1.2,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        });
      }
    });
  });

  // Mobile menu toggle
  menuToggle.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.contains('opacity-100');
    if (isOpen) {
      mobileMenu.classList.add('opacity-0', 'pointer-events-none');
      mobileMenu.classList.remove('opacity-100');
      menuIcon.classList.remove('hidden');
      closeIcon.classList.add('hidden');
      document.body.style.overflow = '';
    } else {
      mobileMenu.classList.remove('opacity-0', 'pointer-events-none');
      mobileMenu.classList.add('opacity-100');
      menuIcon.classList.add('hidden');
      closeIcon.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }
  });

  // Mobile menu links - smooth scroll + close menu
  document.querySelectorAll('.mobile-nav-link').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const href = link.getAttribute('href');
      const targetId = href === '#' ? null : href.slice(1);
      const targetSection = targetId ? document.getElementById(targetId) : null;

      if (targetSection) {
        lenis.scrollTo(targetSection, {
          offset: -80,
          duration: 1.2,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        });
      }

      mobileMenu.classList.add('opacity-0', 'pointer-events-none');
      mobileMenu.classList.remove('opacity-100');
      menuIcon.classList.remove('hidden');
      closeIcon.classList.add('hidden');
      document.body.style.overflow = '';
    });
  });

  // Banner Slider
  const sliderWrapper = document.querySelector('.banner-slider-wrapper');
  const paginationDots = document.querySelectorAll('.banner-pagination-dot');
  let currentSlide = 0;
  let slideInterval;

  function goToSlide(index) {
    currentSlide = Math.max(0, Math.min(index, 2));
    if (sliderWrapper) {
      sliderWrapper.style.transform = `translateX(-${currentSlide * 33.333}%)`;
    }
    paginationDots.forEach((dot, i) => {
      if (dot) {
        dot.classList.toggle('bg-white', i === currentSlide);
        dot.classList.toggle('bg-white/50', i !== currentSlide);
      }
    });
  }

  function startSlider() {
    slideInterval = setInterval(() => {
      goToSlide((currentSlide + 1) % 3);
    }, 4000);
  }

  if (paginationDots.length) {
    paginationDots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        goToSlide(i);
        clearInterval(slideInterval);
        startSlider();
      });
    });
    startSlider();
  }



  // Highlights Slider - left and right buttons, manual click, loop back to slide 1 from slide 3
const highlightsSlider = document.querySelector('.highlights-slider');
const highlightsTrack = document.querySelector('.highlights-track');
const highlightsSlides = document.querySelectorAll('.highlights-slide');
const highlightsNext = document.getElementById('highlights-next');
const highlightsPrev = document.getElementById('highlights-prev');

let highlightsIndex = 0;
let visibleCount = 3;
let gap = 24;

function getVisibleCount() {
  const containerWidth = highlightsSlider.offsetWidth;
  return containerWidth >= 1024 ? 3 : containerWidth >= 640 ? 2 : 1;
}

function setHighlightsSlideWidth() {
  if (!highlightsSlider || !highlightsSlides.length) return;

  visibleCount = getVisibleCount();
  
  // Set gap based on screen size
  const containerWidth = highlightsSlider.offsetWidth;
  if (containerWidth < 375) {
    gap = 12; // 0.75rem
  } else if (containerWidth < 640) {
    gap = 16; // 1rem
  } else if (containerWidth < 768) {
    gap = 20; // 1.25rem
  } else if (containerWidth < 1024) {
    gap = 24; // 1.5rem
  } else {
    gap = 24; // 1.5rem
  }

  const slideWidth = (containerWidth - (visibleCount - 1) * gap) / visibleCount;

  highlightsSlides.forEach((slide) => {
    slide.style.width = `${slideWidth}px`;
  });
}

function updateHighlightsSlider() {
  if (!highlightsTrack || !highlightsSlides.length) return;

  const slideWidth = highlightsSlides[0].offsetWidth + gap;
  highlightsTrack.style.transform = `translateX(-${highlightsIndex * slideWidth}px)`;
}

function nextHighlightsSlide() {
  const maxIndex = highlightsSlides.length - visibleCount;

  if (highlightsIndex >= maxIndex) {
    highlightsIndex = 0; // loop back
  } else {
    highlightsIndex++;
  }

  updateHighlightsSlider();
}

function prevHighlightsSlide() {
  const maxIndex = highlightsSlides.length - visibleCount;

  if (highlightsIndex <= 0) {
    highlightsIndex = maxIndex; // loop to end
  } else {
    highlightsIndex--;
  }

  updateHighlightsSlider();
}

if (highlightsNext) {
  highlightsNext.addEventListener('click', nextHighlightsSlide);
}

if (highlightsPrev) {
  highlightsPrev.addEventListener('click', prevHighlightsSlide);
}

if (highlightsTrack && highlightsSlides.length) {
  setHighlightsSlideWidth();
  updateHighlightsSlider();

  window.addEventListener('resize', () => {
    highlightsIndex = 0;
    setHighlightsSlideWidth();
    updateHighlightsSlider();
  });

}
});


