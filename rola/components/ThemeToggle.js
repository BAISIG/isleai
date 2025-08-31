class ThemeToggle extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.render();
    }

    connectedCallback() {
        this.setupEventListeners();
        this.applyCurrentTheme();
    }

    setupEventListeners() {
        const toggleButton = this.shadowRoot.querySelector('#theme-toggle');
        toggleButton.addEventListener('click', () => this.toggleTheme());
    }

    applyCurrentTheme() {
        // Get saved theme or use system preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
            this.updateToggleButton(savedTheme);
        } else {
            // Check system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const theme = prefersDark ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', theme);
            this.updateToggleButton(theme);
        }
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        this.updateToggleButton(newTheme);

        // Dispatch event so other components can react to theme change
        window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: newTheme } }));
    }

    updateToggleButton(theme) {
        const toggleButton = this.shadowRoot.querySelector('#theme-toggle');
        const moonIcon = this.shadowRoot.querySelector('.moon-icon');
        const sunIcon = this.shadowRoot.querySelector('.sun-icon');

        if (theme === 'dark') {
            moonIcon.style.display = 'none';
            sunIcon.style.display = 'block';
            toggleButton.setAttribute('aria-label', 'Switch to light mode');
            toggleButton.title = 'Switch to light mode';
        } else {
            moonIcon.style.display = 'block';
            sunIcon.style.display = 'none';
            toggleButton.setAttribute('aria-label', 'Switch to dark mode');
            toggleButton.title = 'Switch to dark mode';
        }
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: inline-block;
                }
                
                button {
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 8px;
                    border-radius: 50%;
                    color: var(--text-primary, #1e293b);
                    transition: background-color 0.2s;
                }
                
                button:hover {
                    background-color: var(--surface-hover, #f1f5f9);
                }
                
                svg {
                    width: 20px;
                    height: 20px;
                }
                
                .sun-icon {
                    display: none;
                }
            </style>
            
            <button id="theme-toggle" aria-label="Toggle theme" title="Toggle theme">
                <svg class="moon-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
                <svg class="sun-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            </button>
        `;
    }
}

customElements.define('theme-toggle', ThemeToggle);