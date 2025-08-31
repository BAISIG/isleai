export class AnimationManager {
    constructor() {
        this.progressBars = document.querySelectorAll('.progress-bar[data-progress]');
    }

    init() {
        this.setupProgressBarAnimations();
    }

    setupProgressBarAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const progressBar = entry.target;
                    const progress = progressBar.getAttribute('data-progress');
                    setTimeout(() => {
                        progressBar.style.width = progress + '%';
                    }, 500);
                    observer.unobserve(progressBar);
                }
            });
        }, { threshold: 0.5 });

        this.progressBars.forEach(bar => {
            observer.observe(bar);
        });
    }
}

