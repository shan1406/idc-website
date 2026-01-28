/**
 * IDC – Ideation & Design Consultancy
 * Main JavaScript File
 * Handles: Navigation, Animations, Form, Smooth Scroll
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all modules
    Navigation.init();
    ScrollAnimations.init();
    SmoothScroll.init();
    ContactForm.init();
    TestimonialCarousel.init();
});

/**
 * Testimonial Carousel Module
 * Handles testimonial slider functionality
 */
const TestimonialCarousel = {
    currentSlide: 0,
    totalSlides: 0,
    autoPlayInterval: null,
    
    init() {
        this.track = document.getElementById('testimonial-track');
        this.dotsContainer = document.getElementById('carousel-dots');
        this.prevBtn = document.getElementById('carousel-prev');
        this.nextBtn = document.getElementById('carousel-next');
        
        if (!this.track) return;
        
        this.slides = this.track.querySelectorAll('.testimonial-slide');
        this.totalSlides = this.slides.length;
        
        this.createDots();
        this.bindEvents();
        this.startAutoPlay();
    },
    
    createDots() {
        for (let i = 0; i < this.totalSlides; i++) {
            const dot = document.createElement('button');
            dot.className = `carousel-dot${i === 0 ? ' active' : ''}`;
            dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
            dot.addEventListener('click', () => this.goToSlide(i));
            this.dotsContainer.appendChild(dot);
        }
        this.dots = this.dotsContainer.querySelectorAll('.carousel-dot');
    },
    
    bindEvents() {
        this.prevBtn.addEventListener('click', () => this.prevSlide());
        this.nextBtn.addEventListener('click', () => this.nextSlide());
        
        // Pause on hover
        const carousel = document.getElementById('testimonial-carousel');
        carousel.addEventListener('mouseenter', () => this.stopAutoPlay());
        carousel.addEventListener('mouseleave', () => this.startAutoPlay());
        
        // Touch/swipe support
        let touchStartX = 0;
        let touchEndX = 0;
        
        this.track.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        this.track.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe(touchStartX, touchEndX);
        }, { passive: true });
    },
    
    handleSwipe(startX, endX) {
        const threshold = 50;
        const diff = startX - endX;
        
        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                this.nextSlide();
            } else {
                this.prevSlide();
            }
        }
    },
    
    goToSlide(index) {
        this.currentSlide = index;
        this.updateCarousel();
    },
    
    nextSlide() {
        this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
        this.updateCarousel();
    },
    
    prevSlide() {
        this.currentSlide = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
        this.updateCarousel();
    },
    
    updateCarousel() {
        // Move track
        const offset = -this.currentSlide * 100;
        this.track.style.transform = `translateX(${offset}%)`;
        
        // Update dots
        this.dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentSlide);
        });
    },
    
    startAutoPlay() {
        this.stopAutoPlay();
        this.autoPlayInterval = setInterval(() => this.nextSlide(), 5000);
    },
    
    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }
};

/**
 * Navigation Module
 * Handles navbar scroll effects and mobile menu toggle
 */
const Navigation = {
    init() {
        this.navbar = document.getElementById('navbar');
        this.navToggle = document.getElementById('nav-toggle');
        this.navMenu = document.getElementById('nav-menu');
        this.navLinks = document.querySelectorAll('.nav-link, .nav-cta');
        
        this.bindEvents();
        this.checkScroll();
    },
    
    bindEvents() {
        // Scroll effect
        window.addEventListener('scroll', () => this.checkScroll());
        
        // Mobile menu toggle
        if (this.navToggle) {
            this.navToggle.addEventListener('click', () => this.toggleMenu());
        }
        
        // Close mobile menu on link click
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => this.closeMenu());
        });
        
        // Close mobile menu on outside click
        document.addEventListener('click', (e) => {
            if (!this.navbar.contains(e.target) && this.navMenu.classList.contains('active')) {
                this.closeMenu();
            }
        });
    },
    
    checkScroll() {
        if (window.scrollY > 50) {
            this.navbar.classList.add('scrolled');
        } else {
            this.navbar.classList.remove('scrolled');
        }
    },
    
    toggleMenu() {
        this.navToggle.classList.toggle('active');
        this.navMenu.classList.toggle('active');
        document.body.style.overflow = this.navMenu.classList.contains('active') ? 'hidden' : '';
    },
    
    closeMenu() {
        this.navToggle.classList.remove('active');
        this.navMenu.classList.remove('active');
        document.body.style.overflow = '';
    }
};

/**
 * Scroll Animations Module
 * Handles intersection observer for scroll-triggered animations
 */
const ScrollAnimations = {
    init() {
        this.animatedElements = document.querySelectorAll(
            '.service-card, .value-card, .case-study, .why-card'
        );
        
        if ('IntersectionObserver' in window) {
            this.setupObserver();
        } else {
            // Fallback: show all elements immediately
            this.animatedElements.forEach(el => el.classList.add('visible'));
        }
    },
    
    setupObserver() {
        const options = {
            root: null,
            rootMargin: '0px 0px -50px 0px',
            threshold: 0.1
        };
        
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Add staggered delay based on index
                    const siblings = entry.target.parentElement.children;
                    const index = Array.from(siblings).indexOf(entry.target);
                    
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                    }, index * 100);
                    
                    this.observer.unobserve(entry.target);
                }
            });
        }, options);
        
        this.animatedElements.forEach(el => {
            el.classList.add('animate-on-scroll');
            this.observer.observe(el);
        });
    }
};

/**
 * Smooth Scroll Module
 * Handles smooth scrolling for anchor links
 */
const SmoothScroll = {
    init() {
        this.bindEvents();
    },
    
    bindEvents() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                
                // Skip if it's just "#"
                if (href === '#') return;
                
                const target = document.querySelector(href);
                
                if (target) {
                    e.preventDefault();
                    this.scrollTo(target);
                }
            });
        });
    },
    
    scrollTo(target) {
        const navHeight = document.getElementById('navbar').offsetHeight;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
};

/**
 * Contact Form Module
 * Handles form validation and submission
 */
const ContactForm = {
    init() {
        this.form = document.getElementById('contact-form');
        
        if (this.form) {
            this.bindEvents();
        }
    },
    
    bindEvents() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Real-time validation
        this.form.querySelectorAll('input, textarea').forEach(field => {
            field.addEventListener('blur', () => this.validateField(field));
            field.addEventListener('input', () => this.clearError(field));
        });
    },
    
    handleSubmit(e) {
        // Validate all fields before submission
        const fields = this.form.querySelectorAll('input[required], textarea[required]');
        let isValid = true;
        
        fields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });
        
        if (!isValid) {
            e.preventDefault();
            return;
        }
        
        // Show loading state
        const submitBtn = this.form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Sending...</span>';
        
        // Form will submit naturally to Web3Forms
    },
    
    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';
        
        // Check if required and empty
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'This field is required';
        }
        
        // Email validation
        if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }
        }
        
        if (!isValid) {
            this.showError(field, errorMessage);
        } else {
            this.clearError(field);
        }
        
        return isValid;
    },
    
    showError(field, message) {
        field.classList.add('error');
        
        // Remove existing error message
        const existingError = field.parentElement.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Add new error message
        const errorEl = document.createElement('span');
        errorEl.className = 'error-message';
        errorEl.textContent = message;
        errorEl.style.cssText = 'color: #e74c3c; font-size: 0.75rem; margin-top: 0.25rem; display: block;';
        field.parentElement.appendChild(errorEl);
    },
    
    clearError(field) {
        field.classList.remove('error');
        const existingError = field.parentElement.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
    },
    
    submitForm() {
        const submitBtn = this.form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Sending...</span>';
        
        // Simulate form submission (replace with actual form handling)
        setTimeout(() => {
            // Show success message
            this.showSuccess();
            
            // Reset form
            this.form.reset();
            
            // Reset button
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }, 1500);
    },
    
    showSuccess() {
        // Create success message
        const successEl = document.createElement('div');
        successEl.className = 'form-success';
        successEl.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 48px; height: 48px; color: #27ae60; margin-bottom: 1rem;">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <h3 style="font-family: 'Playfair Display', serif; margin-bottom: 0.5rem; color: #1a1a2e;">Thank You!</h3>
            <p style="color: #636e72;">We've received your message and will get back to you within 24-48 hours.</p>
        `;
        successEl.style.cssText = `
            text-align: center;
            padding: 2rem;
            background-color: #f0fff4;
            border-radius: 12px;
            margin-top: 1rem;
            animation: fadeIn 0.5s ease;
        `;
        
        // Insert after form
        this.form.parentElement.appendChild(successEl);
        
        // Remove after 5 seconds
        setTimeout(() => {
            successEl.style.opacity = '0';
            successEl.style.transition = 'opacity 0.3s ease';
            setTimeout(() => successEl.remove(), 300);
        }, 5000);
    }
};

/**
 * Utility: Debounce function
 * Limits the rate at which a function can fire
 */
function debounce(func, wait = 10) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Utility: Throttle function
 * Ensures a function is called at most once in a specified time period
 */
function throttle(func, limit = 100) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Add subtle parallax effect to hero section
 */
window.addEventListener('scroll', throttle(() => {
    const hero = document.querySelector('.hero');
    if (hero) {
        const scrolled = window.pageYOffset;
        const heroHeight = hero.offsetHeight;
        
        if (scrolled < heroHeight) {
            const graphic = hero.querySelector('.hero-graphic');
            if (graphic) {
                graphic.style.transform = `translateY(${scrolled * 0.1}px)`;
            }
        }
    }
}, 16));

/**
 * Active navigation link highlighting
 */
window.addEventListener('scroll', debounce(() => {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    const navHeight = document.getElementById('navbar').offsetHeight;
    
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - navHeight - 100;
        const sectionHeight = section.offsetHeight;
        
        if (window.pageYOffset >= sectionTop && window.pageYOffset < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}, 100));
