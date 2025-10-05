// DOM Elements
const carousel = document.getElementById('recipesCarousel');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const recipeCards = document.querySelectorAll('.recipe-card');

// Carousel State
let currentIndex = 0;
let currentCardsPerView = getCardsPerView();
const totalCards = recipeCards.length;
let isAnimating = false;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initializeCarousel();
    setupEventListeners();
    addExpandCollapseFunctionality();
    addIntersectionObserver();
    addParallaxEffect();
    addMouseEffects();
    startAutoSlide();
});

// Add expand/collapse functionality to all cards
function addExpandCollapseFunctionality() {
    recipeCards.forEach(card => {
        const expandBtn = card.querySelector('.expand-btn');
        const recipeInfo = card.querySelector('.recipe-info');
        
        expandBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleExpanded(card);
        });
    });
}

// Toggle expanded state for a card
function toggleExpanded(card) {
    const recipeInfo = card.querySelector('.recipe-info');
    const expandBtn = card.querySelector('.expand-btn');
    const expandText = expandBtn.querySelector('.expand-text');
    const expandIcon = expandBtn.querySelector('.expand-icon');
    
    const isExpanded = recipeInfo.classList.contains('expanded');
    
    if (isExpanded) {
        recipeInfo.classList.remove('expanded');
        expandText.textContent = 'Show More';
        expandIcon.textContent = '▼';
    } else {
        recipeInfo.classList.add('expanded');
        expandText.textContent = 'Show Less';
        expandIcon.textContent = '▲';
    }
}

// Get number of cards per view based on screen size
function getCardsPerView() {
    const screenWidth = window.innerWidth;
    if (screenWidth < 480) return 1; // full card on mobile
    if (screenWidth < 768) return 1.5;
    if (screenWidth < 1024) return 2;
    if (screenWidth < 1280) return 2.5; // tablet/medium screens
    return 3;
}

// Measure dynamic step (card width + gap)
function getCardStep() {
    const firstCard = recipeCards[0];
    if (!firstCard) return 380; // fallback
    const cardRect = firstCard.getBoundingClientRect();
    const styles = window.getComputedStyle(carousel);
    const gapPx = parseFloat(styles.gap || '30');
    return cardRect.width + gapPx;
}

function getMaxIndex() {
    const view = getCardsPerView();
    return Math.max(0, Math.floor(totalCards - view));
}

// Initialize carousel
function initializeCarousel() {
    updateCarouselPosition();
    addLoadingEffect();
}

// Add loading effect to cards
function addLoadingEffect() {
    recipeCards.forEach((card, index) => {
        card.classList.add('loading');
        setTimeout(() => {
            card.classList.remove('loading');
        }, 500 + (index * 100));
    });
}

// Update carousel position
function updateCarouselPosition() {
    const step = getCardStep();
    // clamp index in case viewport changed
    const maxIndex = getMaxIndex();
    if (currentIndex > maxIndex) currentIndex = maxIndex;
    const translateX = -currentIndex * step;
    carousel.style.transform = `translateX(${translateX}px)`;
    
    // Update button visibility
    currentCardsPerView = getCardsPerView();
    const noPagingNeeded = maxIndex <= 0;
    if (noPagingNeeded) {
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
    } else {
        prevBtn.style.display = currentIndex === 0 ? 'none' : 'flex';
        nextBtn.style.display = currentIndex >= maxIndex ? 'none' : 'flex';
    }
}

// Setup event listeners
function setupEventListeners() {
    // Navigation buttons
    prevBtn.addEventListener('click', () => slideTo('prev'));
    nextBtn.addEventListener('click', () => slideTo('next'));
    
    // Touch/swipe support
    let startX = 0;
    let endX = 0;
    
    carousel.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
    });
    
    carousel.addEventListener('touchend', (e) => {
        endX = e.changedTouches[0].clientX;
        handleSwipe();
    });
    
    // Mouse drag support
    let isDragging = false;
    let dragStartX = 0;
    let dragCurrentX = 0;
    
    carousel.addEventListener('mousedown', (e) => {
        isDragging = true;
        dragStartX = e.clientX;
        carousel.style.cursor = 'grabbing';
        e.preventDefault();
    });
    
    carousel.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        dragCurrentX = e.clientX;
        const dragDistance = dragCurrentX - dragStartX;
        const step = getCardStep();
        const currentTranslate = -currentIndex * step;
        carousel.style.transform = `translateX(${currentTranslate + dragDistance}px)`;
    });
    
    carousel.addEventListener('mouseup', () => {
        if (!isDragging) return;
        isDragging = false;
        carousel.style.cursor = 'grab';
        const dragDistance = dragCurrentX - dragStartX;
        
        if (Math.abs(dragDistance) > 50) {
            if (dragDistance > 0) {
                slideTo('prev');
            } else {
                slideTo('next');
            }
        } else {
            updateCarouselPosition();
        }
    });
    
    carousel.addEventListener('mouseleave', () => {
        if (isDragging) {
            isDragging = false;
            carousel.style.cursor = 'grab';
            updateCarouselPosition();
        }
    });
    
    function handleSwipe() {
        const swipeDistance = startX - endX;
        if (Math.abs(swipeDistance) > 50) {
            if (swipeDistance > 0) {
                slideTo('next');
            } else {
                slideTo('prev');
            }
        }
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') slideTo('prev');
        if (e.key === 'ArrowRight') slideTo('next');
    });
    
    // Window resize handled by debounced global listener below
}

// Slide carousel
function slideTo(direction) {
    if (isAnimating) return;
    
    isAnimating = true;
    
    if (direction === 'next' && currentIndex < getMaxIndex()) {
        currentIndex++;
    } else if (direction === 'prev' && currentIndex > 0) {
        currentIndex--;
    }
    
    updateCarouselPosition();
    
    setTimeout(() => {
        isAnimating = false;
    }, 800);
}

// Intersection Observer for animations
function addIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationPlayState = 'running';
                entry.target.classList.add('animate-in');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    recipeCards.forEach(card => {
        observer.observe(card);
    });
}

// Parallax effect for background
function addParallaxEffect() {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.recipe-card');
        
        parallaxElements.forEach((element, index) => {
            const speed = 0.5 + (index * 0.1);
            const yPos = -(scrolled * speed);
            element.style.transform += ` translateY(${yPos}px)`;
        });
    });
}

// Mouse effects
function addMouseEffects() {
    recipeCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            // Add glow effect
            card.style.boxShadow = '0 20px 40px rgba(220, 53, 69, 0.3)';
            
            // Tilt effect
            card.addEventListener('mousemove', handleCardTilt);
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
            card.style.transform = 'translateY(0) rotateX(0) rotateY(0)';
            card.removeEventListener('mousemove', handleCardTilt);
        });
    });
}

// Handle card tilt effect
function handleCardTilt(e) {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;
    
    card.style.transform = `translateY(-10px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
}

// Auto slide functionality
let autoSlideInterval;

function startAutoSlide() {
    autoSlideInterval = setInterval(() => {
        if (currentIndex < getMaxIndex()) {
            slideTo('next');
        } else {
            currentIndex = 0;
            updateCarouselPosition();
        }
    }, 6000);
    
    // Pause auto slide on hover
    carousel.addEventListener('mouseenter', () => {
        clearInterval(autoSlideInterval);
    });
    
    carousel.addEventListener('mouseleave', () => {
        startAutoSlide();
    });
}

// Add particle effect
function createParticleEffect() {
    const particleContainer = document.createElement('div');
    particleContainer.style.position = 'fixed';
    particleContainer.style.top = '0';
    particleContainer.style.left = '0';
    particleContainer.style.width = '100%';
    particleContainer.style.height = '100%';
    particleContainer.style.pointerEvents = 'none';
    particleContainer.style.zIndex = '1';
    document.body.appendChild(particleContainer);
    
    function createParticle() {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = '4px';
        particle.style.height = '4px';
        particle.style.background = '#dc3545';
        particle.style.borderRadius = '50%';
        particle.style.left = Math.random() * window.innerWidth + 'px';
        particle.style.top = '100vh';
        particle.style.opacity = '0.3';
        particle.style.animation = `particleFloat ${3 + Math.random() * 4}s linear forwards`;
        
        particleContainer.appendChild(particle);
        
        setTimeout(() => {
            particle.remove();
        }, 7000);
    }
    
    // Add particle animation CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes particleFloat {
            to {
                transform: translateY(-100vh) translateX(${Math.random() * 100 - 50}px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Create particles periodically
    setInterval(createParticle, 2000);
}

// Initialize particle effect
createParticleEffect();

// Add smooth scroll reveal animation
function addScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1
    });
    
    const elementsToReveal = document.querySelectorAll('.header, .recipes-container');
    elementsToReveal.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(el);
    });
}

// Initialize scroll reveal
addScrollReveal();

// Add click ripple effect
function addRippleEffect() {
    recipeCards.forEach(card => {
        card.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.style.position = 'absolute';
            ripple.style.borderRadius = '50%';
            ripple.style.background = 'rgba(220, 53, 69, 0.3)';
            ripple.style.transform = 'scale(0)';
            ripple.style.animation = 'ripple 0.6s linear';
            ripple.style.pointerEvents = 'none';
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
    
    // Add ripple animation CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// Initialize ripple effect
addRippleEffect();

// Performance optimization: Debounce resize events
function debounce(func, wait) {
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

// Optimized resize handler
const debouncedResize = debounce(() => {
    const newCardsPerView = getCardsPerView();
    if (newCardsPerView !== currentCardsPerView) {
        currentCardsPerView = newCardsPerView;
        updateCarouselPosition();
    } else {
        // still update to refresh arrow visibility when container size changes
        updateCarouselPosition();
    }
}, 250);

window.addEventListener('resize', debouncedResize);
