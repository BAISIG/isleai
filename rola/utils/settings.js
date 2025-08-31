export class SettingsManager {
    static getDefaultSettings() {
        return {
            theme: document.documentElement.getAttribute('data-theme') || 'light',
            fontSize: 'medium',
            colorAccent: 'indigo',
            notifications: {
                assignments: true,
                announcements: true,
                grades: true,
                messages: true,
                reminders: true
            }
        };
    }

    static loadSettings() {
        try {
            const savedSettings = localStorage.getItem('userSettings');
            return savedSettings ? JSON.parse(savedSettings) : this.getDefaultSettings();
        } catch (e) {
            return this.getDefaultSettings();
        }
    }

    static saveSettings(settings) {
        localStorage.setItem('userSettings', JSON.stringify(settings));
    }

    static applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
    }

    static applyFontSize(size) {
        const sizeMappings = {
            'small': '14px',
            'medium': '16px',
            'large': '18px',
            'x-large': '20px'
        };
        document.documentElement.style.fontSize = sizeMappings[size] || '16px';
    }

    static applyColorAccent(color) {
        const colorMappings = {
            'indigo': { '--primary-color': '#6366f1', '--primary-dark': '#4f46e5', '--secondary-color': '#8b5cf6' },
            'blue': { '--primary-color': '#3b82f6', '--primary-dark': '#2563eb', '--secondary-color': '#60a5fa' },
            'green': { '--primary-color': '#10b981', '--primary-dark': '#059669', '--secondary-color': '#34d399' },
            'purple': { '--primary-color': '#8b5cf6', '--primary-dark': '#7c3aed', '--secondary-color': '#a78bfa' },
            'pink': { '--primary-color': '#ec4899', '--primary-dark': '#db2777', '--secondary-color': '#f472b6' },
            'amber': { '--primary-color': '#f59e0b', '--primary-dark': '#d97706', '--secondary-color': '#fbbf24' }
        };

        const colorVars = colorMappings[color] || colorMappings['indigo'];
        for (const [variable, value] of Object.entries(colorVars)) {
            document.documentElement.style.setProperty(variable, value);
        }
    }
}