/* ============================================
   MHPL Project - Main JavaScript
   ============================================ */

(function () {
  'use strict';

  // ── GSAP Registration ──
  gsap.registerPlugin(ScrollTrigger);

  // ── Window Load (Ensures all images/layouts are complete before ScrollTrigger checks positions) ──
  window.addEventListener('load', function () {
    // Add loaded class to body for initial CSS animations
    document.body.classList.add('loaded');

    initNavbar();
    initMobileMenu();
    initSmoothScroll();
    initHeroAnimations();
    initScrollAnimations();
    initCounterAnimation();
    initTestimonialCarousel();
    initFAQAccordion();
    initParallax();

    // Handle Preloader Fade-out (Premium Slide-up Transition)
    const preloader = document.getElementById('preloader');
    if (preloader) {
      // 1. Zoom out and fade out the preloader logo & progress line
      gsap.to('.preloader-logo, .preloader-line', {
        opacity: 0,
        scale: 0.9,
        y: -20,
        duration: 0.5,
        ease: 'power2.inOut',
        delay: 0.3
      });

      // 2. Slide the preloader screen completely up out of the viewport
      gsap.to(preloader, {
        yPercent: -100,
        duration: 0.9,
        ease: 'power3.inOut',
        delay: 0.6, // Starts as the logo finishes fading
        onComplete: function() {
          preloader.style.visibility = 'hidden';
          preloader.style.display = 'none';
        }
      });

      // 3. Smooth parallax reveal of the main website (slides up slightly into view)
      gsap.from('#header, .hero-section', {
        y: 60,
        opacity: 0.9,
        duration: 1.0,
        ease: 'power3.out',
        delay: 0.7
      });
    }

    // Force GSAP ScrollTrigger to recalculate exact scroll locations
    ScrollTrigger.refresh();
  });

  /* ──────────────────────────────────────────────
     1. NAVBAR SCROLL BEHAVIOR
     ────────────────────────────────────────────── */
  function initNavbar() {
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');

    if (!navbar) return;

    window.addEventListener('scroll', function () {
      // Add 'scrolled' class when page is scrolled past 100px
      if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }

      // Active section highlighting
      highlightActiveSection(sections, navLinks);
    });
  }

  function highlightActiveSection(sections, navLinks) {
    let currentSection = '';
    const scrollPos = window.scrollY + 120; // offset for navbar height

    sections.forEach(function (section) {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;

      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        currentSection = section.getAttribute('id');
      }
    });

    navLinks.forEach(function (link) {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + currentSection) {
        link.classList.add('active');
      }
    });
  }

  /* ──────────────────────────────────────────────
     2. MOBILE MENU TOGGLE
     ────────────────────────────────────────────── */
  function initMobileMenu() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (!navToggle || !navMenu) return;

    // Toggle menu on hamburger click
    navToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      navMenu.classList.toggle('active');
      navToggle.classList.toggle('active');
    });

    // Close menu when a nav link is clicked
    navLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function (e) {
      if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
      }
    });
  }

  /* ──────────────────────────────────────────────
     3. SMOOTH SCROLL
     ────────────────────────────────────────────── */
  function initSmoothScroll() {
    const navLinks = document.querySelectorAll('.nav-link');
    const NAVBAR_OFFSET = 80;

    navLinks.forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);

        if (targetSection) {
          const targetPosition = targetSection.offsetTop - NAVBAR_OFFSET;

          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  /* ──────────────────────────────────────────────
     4. HERO ANIMATIONS (Page Load) — Enhanced
     ────────────────────────────────────────────── */
  function initHeroAnimations() {
    const heroContent = document.querySelector('.hero-content');
    if (!heroContent) return;

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // Badge drops in
    tl.from('.hero-badge', {
      opacity: 0,
      y: -20,
      scale: 0.8,
      duration: 0.7,
      delay: 1.1
    })
    // Title lines stagger in one by one
    .from('.hero-title-line', {
      opacity: 0,
      y: 60,
      rotationX: -15,
      duration: 0.9,
      stagger: 0.2
    }, '-=0.3')
    // Subtitle fades up
    .from('.hero-subtitle', {
      opacity: 0,
      y: 40,
      duration: 0.7
    }, '-=0.4')
    // CTA buttons scale in
    .from('.hero-cta .btn', {
      opacity: 0,
      y: 30,
      scale: 0.9,
      duration: 0.6,
      stagger: 0.12
    }, '-=0.3')
    // Trust badges slide in
    .from('.hero-trust-badges', {
      opacity: 0,
      x: -30,
      duration: 0.6
    }, '-=0.2')
    // Stat cards pop in with scale
    .from('.hero-stats .stat-item', {
      opacity: 0,
      y: 40,
      scale: 0.85,
      duration: 0.6,
      stagger: 0.12,
      ease: 'back.out(1.5)'
    }, '-=0.3')
    // Scroll indicator fades in last
    .from('.hero-scroll-indicator', {
      opacity: 0,
      y: 20,
      duration: 0.5
    }, '-=0.1')
    // Floating shapes and particles
    .from('.hero-shapes .shape', {
      opacity: 0,
      scale: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: 'elastic.out(1, 0.5)'
    }, '-=0.8')
    .from('.hero-glow', {
      opacity: 0,
      scale: 0.5,
      duration: 1.2,
      stagger: 0.15
    }, '-=1')
    .from('.hero-glass-cards .glass-card', {
      opacity: 0,
      x: 50,
      scale: 0.9,
      duration: 1.0,
      stagger: 0.18,
      ease: 'back.out(1.4)'
    }, '-=0.8');
  }


  /* ──────────────────────────────────────────────
     5. GSAP SCROLL ANIMATIONS
     ────────────────────────────────────────────── */
  function initScrollAnimations() {
    // ── Fade Up animations ──
    const fadeUpElements = document.querySelectorAll('[data-animate="fade-up"]');
    fadeUpElements.forEach(function (el) {
      gsap.from(el, {
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          end: 'bottom 20%',
          toggleActions: 'play none none none'
        },
        opacity: 0,
        y: 60,
        duration: 0.8,
        ease: 'power3.out'
      });
    });

    // ── Slide Right animations ──
    const slideRightElements = document.querySelectorAll('[data-animate="slide-right"]');
    slideRightElements.forEach(function (el) {
      gsap.from(el, {
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        opacity: 0,
        x: -60,
        duration: 0.8,
        ease: 'power3.out'
      });
    });

    // ── Slide Left animations ──
    const slideLeftElements = document.querySelectorAll('[data-animate="slide-left"]');
    slideLeftElements.forEach(function (el) {
      gsap.from(el, {
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        opacity: 0,
        x: 60,
        duration: 0.8,
        ease: 'power3.out'
      });
    });

    // ── Section Headers ──
    const sectionHeaders = document.querySelectorAll('.section-header');
    sectionHeaders.forEach(function (header) {
      gsap.from(header, {
        scrollTrigger: {
          trigger: header,
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        opacity: 0,
        y: 40,
        duration: 0.7,
        ease: 'power3.out'
      });
    });

    // ── Project Cards (staggered) ──
    const projectCards = document.querySelectorAll('.projects-grid .project-card');
    if (projectCards.length > 0) {
      gsap.from(projectCards, {
        scrollTrigger: {
          trigger: '.projects-grid',
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        opacity: 0,
        y: 60,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
        clearProps: 'opacity,transform',
        onComplete: function () {
          projectCards.forEach(function (card) {
            card.classList.add('hover-active');
          });
        }
      });
    }

    // ── Amenity Cards (staggered) ──
    const amenityCards = document.querySelectorAll('.amenities-grid .amenity-card');
    if (amenityCards.length > 0) {
      gsap.from(amenityCards, {
        scrollTrigger: {
          trigger: '.amenities-grid',
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        opacity: 0,
        y: 60,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
        clearProps: 'opacity,transform',
        onComplete: function () {
          amenityCards.forEach(function (card) {
            card.classList.add('hover-active');
          });
        }
      });
    }

    // ── Service Cards (staggered) ──
    const serviceCards = document.querySelectorAll('.services-grid .service-card');
    if (serviceCards.length > 0) {
      gsap.from(serviceCards, {
        scrollTrigger: {
          trigger: '.services-grid',
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        opacity: 0,
        y: 60,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
        clearProps: 'opacity,transform',
        onComplete: function () {
          serviceCards.forEach(function (card) {
            card.classList.add('hover-active');
          });
        }
      });
    }
  }

  /* ──────────────────────────────────────────────
     6. COUNTER ANIMATION
     ────────────────────────────────────────────── */
  function initCounterAnimation() {
    const statNumbers = document.querySelectorAll('.stat-number');
    if (statNumbers.length === 0) return;

    const heroStats = document.querySelector('.hero-stats');
    if (!heroStats) return;

    let hasAnimated = false;

    ScrollTrigger.create({
      trigger: heroStats,
      start: 'top 80%',
      onEnter: function () {
        if (hasAnimated) return;
        hasAnimated = true;

        statNumbers.forEach(function (stat) {
          const target = parseInt(stat.getAttribute('data-count'), 10);
          const counter = { value: 0 };

          gsap.to(counter, {
            value: target,
            duration: 2,
            ease: 'power2.out',
            onUpdate: function () {
              stat.textContent = Math.round(counter.value);
            }
          });
        });
      }
    });
  }

  /* ──────────────────────────────────────────────
     7. TESTIMONIAL CAROUSEL
     ────────────────────────────────────────────── */
  function initTestimonialCarousel() {
    const carousel = document.getElementById('testimonialCarousel');
    const track = document.getElementById('testimonialTrack');
    const prevBtn = document.getElementById('carouselPrev');
    const nextBtn = document.getElementById('carouselNext');
    const dotsContainer = document.getElementById('carouselDots');

    if (!carousel || !track) return;

    const slides = track.querySelectorAll('.testimonial-slide');
    const slideCount = slides.length;

    if (slideCount === 0) return;

    let currentSlide = 0;
    let autoPlayInterval = null;
    const AUTO_PLAY_DELAY = 5000;

    // Touch/swipe variables
    let touchStartX = 0;
    let touchEndX = 0;
    let isDragging = false;

    // ── Create dot indicators ──
    if (dotsContainer) {
      dotsContainer.innerHTML = '';
      for (let i = 0; i < slideCount; i++) {
        const dot = document.createElement('button');
        dot.classList.add('carousel-dot');
        dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', function () {
          goToSlide(i);
        });
        dotsContainer.appendChild(dot);
      }
    }

    function updateCarousel() {
      track.style.transform = 'translateX(-' + (currentSlide * 100) + '%)';

      // Update dots
      if (dotsContainer) {
        var dots = dotsContainer.querySelectorAll('.carousel-dot');
        dots.forEach(function (dot, index) {
          dot.classList.toggle('active', index === currentSlide);
        });
      }
    }

    function goToSlide(index) {
      currentSlide = index;
      if (currentSlide < 0) currentSlide = slideCount - 1;
      if (currentSlide >= slideCount) currentSlide = 0;
      updateCarousel();
    }

    function nextSlide() {
      goToSlide(currentSlide + 1);
    }

    function prevSlide() {
      goToSlide(currentSlide - 1);
    }

    // ── Button controls ──
    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        nextSlide();
        resetAutoPlay();
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        prevSlide();
        resetAutoPlay();
      });
    }

    // ── Auto-play ──
    function startAutoPlay() {
      autoPlayInterval = setInterval(nextSlide, AUTO_PLAY_DELAY);
    }

    function stopAutoPlay() {
      if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
        autoPlayInterval = null;
      }
    }

    function resetAutoPlay() {
      stopAutoPlay();
      startAutoPlay();
    }

    // Pause on hover
    carousel.addEventListener('mouseenter', stopAutoPlay);
    carousel.addEventListener('mouseleave', startAutoPlay);

    // ── Touch/Swipe support ──
    track.addEventListener('touchstart', function (e) {
      touchStartX = e.changedTouches[0].screenX;
      isDragging = true;
      stopAutoPlay();
    }, { passive: true });

    track.addEventListener('touchmove', function (e) {
      if (!isDragging) return;
      touchEndX = e.changedTouches[0].screenX;
    }, { passive: true });

    track.addEventListener('touchend', function () {
      if (!isDragging) return;
      isDragging = false;

      const swipeDistance = touchStartX - touchEndX;
      const SWIPE_THRESHOLD = 50;

      if (Math.abs(swipeDistance) > SWIPE_THRESHOLD) {
        if (swipeDistance > 0) {
          nextSlide();
        } else {
          prevSlide();
        }
      }

      startAutoPlay();
    });

    // ── Initialize ──
    updateCarousel();
    startAutoPlay();
  }

  /* ──────────────────────────────────────────────
     8. FAQ ACCORDION
     ────────────────────────────────────────────── */
  function initFAQAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    if (faqItems.length === 0) return;

    faqItems.forEach(function (item) {
      const question = item.querySelector('.faq-question');
      const answer = item.querySelector('.faq-answer');
      const icon = item.querySelector('.faq-icon');

      if (!question || !answer) return;

      // Set initial state
      answer.style.maxHeight = '0';
      answer.style.overflow = 'hidden';
      answer.style.transition = 'max-height 0.4s ease, padding 0.4s ease';

      question.addEventListener('click', function () {
        const isOpen = question.getAttribute('aria-expanded') === 'true';

        // Close all other FAQ items
        faqItems.forEach(function (otherItem) {
          const otherQuestion = otherItem.querySelector('.faq-question');
          const otherAnswer = otherItem.querySelector('.faq-answer');
          const otherIcon = otherItem.querySelector('.faq-icon');

          if (otherItem !== item) {
            otherQuestion.setAttribute('aria-expanded', 'false');
            otherAnswer.style.maxHeight = '0';
            otherItem.classList.remove('active');
            if (otherIcon) {
              otherIcon.style.transform = 'rotate(0deg)';
            }
          }
        });

        // Toggle current item
        if (isOpen) {
          question.setAttribute('aria-expanded', 'false');
          answer.style.maxHeight = '0';
          item.classList.remove('active');
          if (icon) {
            icon.style.transform = 'rotate(0deg)';
          }
        } else {
          question.setAttribute('aria-expanded', 'true');
          answer.style.maxHeight = answer.scrollHeight + 'px';
          item.classList.add('active');
          if (icon) {
            icon.style.transform = 'rotate(45deg)';
          }
        }
      });
    });
  }

  /* ──────────────────────────────────────────────
     9. PARALLAX EFFECTS
     ────────────────────────────────────────────── */
  function initParallax() {
    const parallaxSections = document.querySelectorAll(
      '.hero-section, .about-section, .projects-section, .amenities-section, .services-section, .testimonials-section, .contact-section'
    );

    parallaxSections.forEach(function (section) {
      gsap.to(section, {
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1
        },
        backgroundPositionY: '30%',
        ease: 'none'
      });
    });
  }

})();
