export class SidebarManager {
    constructor() {
        this.sidebar = document.getElementById('sidebar');
        this.menuToggle = document.getElementById('menuToggle');
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Toggle sidebar visibility on mobile
        if (this.menuToggle && this.sidebar) {
            this.menuToggle.addEventListener('click', () => {
                this.sidebar.classList.toggle('visible');
            });
        }

        // Hide sidebar when clicking outside on mobile
        document.addEventListener('click', (event) => {
            if (this.sidebar.classList.contains('visible') &&
                !this.sidebar.contains(event.target) &&
                !this.menuToggle.contains(event.target)) {
                this.sidebar.classList.remove('visible');
            }
        });

        // Auto-hide sidebar on resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                this.sidebar.classList.remove('visible');
            }
        });
    }
}