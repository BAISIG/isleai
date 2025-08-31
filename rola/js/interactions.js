export class InteractionManager {
    constructor() {
        this.scheduleCards = document.querySelectorAll('.schedule-card');
        this.actionCards = document.querySelectorAll('.action-card');
        this.notificationIcon = document.querySelector('.notification-icon');
        this.buttons = document.querySelectorAll('button');
    }

    init() {
        this.setupScheduleCardHovers();
        this.setupActionCardClicks();
        this.setupNotificationHandler();
        this.setupButtonStates();
        this.setupSmoothScrolling();
    }

    setupScheduleCardHovers() {
        this.scheduleCards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-6px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
            });
        });
    }

    setupActionCardClicks() {
        this.actionCards.forEach(card => {
            card.addEventListener('click', function() {
                this.createRippleEffect(card);
            });
        });
    }

    createRippleEffect(element) {
        const ripple = document.createElement('div');
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(99, 102, 241, 0.3);
            transform: scale(0);
            animation: ripple 0.6s ease-out;
            pointer-events: none;
        `;
        
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = '50%';
        ripple.style.top = '50%';
        ripple.style.marginLeft = -size/2 + 'px';
        ripple.style.marginTop = -size/2 + 'px';
        
        element.style.position = 'relative';
        element.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    setupNotificationHandler() {
        if (this.notificationIcon) {
            this.notificationIcon.addEventListener('click', () => {
                const count = document.querySelector('.notification-count');
                if (count) {
                    count.style.animation = 'none';
                    count.textContent = '0';
                    setTimeout(() => {
                        count.style.display = 'none';
                    }, 300);
                }
            });
        }
    }

    setupButtonStates() {
        this.buttons.forEach(button => {
            button.addEventListener('click', function() {
                if (!this.classList.contains('loading')) {
                    const originalText = this.textContent;
                    this.classList.add('loading');
                    this.textContent = 'Loading...';
                    this.disabled = true;
                    
                    setTimeout(() => {
                        this.classList.remove('loading');
                        this.textContent = originalText;
                        this.disabled = false;
                    }, 1500);
                }
            });
        });
    }

    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
}

// Add CSS for ripple animation
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(2);
            opacity: 0;
        }
    }
    
    .loading {
        opacity: 0.6;
        cursor: not-allowed !important;
    }
`;
document.head.appendChild(style);