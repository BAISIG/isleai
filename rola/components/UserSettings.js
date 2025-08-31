import { SettingsManager } from '../utils/settings.js';

class UserSettings extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.isOpen = false;
        this.render();
    }

    connectedCallback() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        const closeButton = this.shadowRoot.querySelector('#close-settings');
        const overlay = this.shadowRoot.querySelector('.settings-overlay');
        const formElem = this.shadowRoot.querySelector('#settings-form');
        const notificationToggles = this.shadowRoot.querySelectorAll('.notification-toggle');
        const themeRadios = this.shadowRoot.querySelectorAll('input[name="theme"]');
        const fontSizeSelect = this.shadowRoot.querySelector('#font-size');
        const colorAccentSelect = this.shadowRoot.querySelector('#color-accent');
        const saveButton = this.shadowRoot.querySelector('#save-settings');
        const resetButton = this.shadowRoot.querySelector('#reset-settings');

        closeButton.addEventListener('click', () => this.close());
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.close();
            }
        });

        notificationToggles.forEach(toggle => {
            toggle.addEventListener('change', (e) => {
                const settingId = e.target.dataset.setting;
                const isEnabled = e.target.checked;
                this.updateNotificationSetting(settingId, isEnabled);
            });
        });

        themeRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.checked) {
                    const theme = e.target.value;
                    SettingsManager.applyTheme(theme);
                    this.updateSettings({ theme });
                }
            });
        });

        fontSizeSelect.addEventListener('change', (e) => {
            SettingsManager.applyFontSize(e.target.value);
            this.updateSettings({ fontSize: e.target.value });
        });

        colorAccentSelect.addEventListener('change', (e) => {
            SettingsManager.applyColorAccent(e.target.value);
            this.updateSettings({ colorAccent: e.target.value });
        });

        formElem.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveSettings();
        });

        resetButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.resetToDefaults();
        });
    }

    open() {
        this.isOpen = true;
        this.style.display = 'block';
        document.body.style.overflow = 'hidden';
        setTimeout(() => {
            this.shadowRoot.querySelector('.settings-overlay').classList.add('active');
            this.shadowRoot.querySelector('.settings-panel').classList.add('active');
        }, 10);

        this.loadCurrentSettings();
    }

    close() {
        const overlay = this.shadowRoot.querySelector('.settings-overlay');
        const panel = this.shadowRoot.querySelector('.settings-panel');

        overlay.classList.remove('active');
        panel.classList.remove('active');

        setTimeout(() => {
            this.style.display = 'none';
            document.body.style.overflow = '';
            this.isOpen = false;
        }, 300);
    }

    loadCurrentSettings() {
        const settings = SettingsManager.loadSettings();

        const notificationToggles = this.shadowRoot.querySelectorAll('.notification-toggle');
        notificationToggles.forEach(toggle => {
            const settingId = toggle.dataset.setting;
            toggle.checked = settings.notifications[settingId] || false;
        });

        const themeRadio = this.shadowRoot.querySelector(`input[name="theme"][value="${settings.theme}"]`);
        if (themeRadio) themeRadio.checked = true;

        const fontSizeSelect = this.shadowRoot.querySelector('#font-size');
        fontSizeSelect.value = settings.fontSize;

        const colorAccentSelect = this.shadowRoot.querySelector('#color-accent');
        colorAccentSelect.value = settings.colorAccent;
    }

    updateNotificationSetting(settingId, isEnabled) {
        const settings = SettingsManager.loadSettings();
        settings.notifications[settingId] = isEnabled;
        SettingsManager.saveSettings(settings);
    }

    updateSettings(updates) {
        const settings = SettingsManager.loadSettings();
        Object.assign(settings, updates);
        SettingsManager.saveSettings(settings);
    }

    saveSettings() {
        const saveButton = this.shadowRoot.querySelector('#save-settings');
        const originalText = saveButton.textContent;

        saveButton.disabled = true;
        saveButton.textContent = 'Saved!';

        setTimeout(() => {
            saveButton.disabled = false;
            saveButton.textContent = originalText;
            this.close();
        }, 1000);
    }

    resetToDefaults() {
        const defaultSettings = SettingsManager.getDefaultSettings();
        SettingsManager.saveSettings(defaultSettings);

        SettingsManager.applyTheme(defaultSettings.theme);
        SettingsManager.applyFontSize(defaultSettings.fontSize);
        SettingsManager.applyColorAccent(defaultSettings.colorAccent);

        this.loadCurrentSettings();

        const resetButton = this.shadowRoot.querySelector('#reset-settings');
        const originalText = resetButton.textContent;

        resetButton.disabled = true;
        resetButton.textContent = 'Defaults Restored';

        setTimeout(() => {
            resetButton.disabled = false;
            resetButton.textContent = originalText;
        }, 1000);
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    --settings-bg: var(--surface, white);
                    --settings-text: var(--text-primary, #1e293b);
                    --settings-border: var(--border, #e2e8f0);
                    --settings-shadow: var(--shadow-xl, 0 20px 25px -5px rgb(0 0 0 / 0.1));
                    --settings-hover: var(--surface-hover, #f1f5f9);
                    --settings-width: 480px;
                    
                    display: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 1000;
                }
                
                .settings-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(0, 0, 0, 0.5);
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }
                
                .settings-overlay.active {
                    opacity: 1;
                }
                
                .settings-panel {
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    right: 0;
                    width: var(--settings-width);
                    max-width: 100%;
                    background-color: var(--settings-bg);
                    box-shadow: var(--settings-shadow);
                    display: flex;
                    flex-direction: column;
                    transform: translateX(100%);
                    transition: transform 0.3s ease;
                }
                
                .settings-panel.active {
                    transform: translateX(0);
                }
                
                .settings-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 20px 24px;
                    border-bottom: 1px solid var(--settings-border);
                }
                
                .settings-title {
                    font-size: 20px;
                    font-weight: 600;
                    color: var(--settings-text);
                    margin: 0;
                }
                
                #close-settings {
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: var(--text-secondary, #64748b);
                    padding: 8px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: background-color 0.2s;
                }
                
                #close-settings:hover {
                    background-color: var(--settings-hover);
                }
                
                #close-settings svg {
                    width: 20px;
                    height: 20px;
                }
                
                .settings-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 24px;
                }
                
                .settings-section {
                    margin-bottom: 32px;
                }
                
                .settings-section:last-child {
                    margin-bottom: 0;
                }
                
                .section-title {
                    font-size: 16px;
                    font-weight: 600;
                    color: var(--settings-text);
                    margin: 0 0 16px 0;
                }
                
                .setting-group {
                    margin-bottom: 20px;
                }
                
                .setting-group:last-child {
                    margin-bottom: 0;
                }
                
                .setting-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px 0;
                    border-bottom: 1px solid var(--settings-border);
                }
                
                .setting-row:last-child {
                    border-bottom: none;
                }
                
                .setting-label {
                    font-size: 14px;
                    color: var(--settings-text);
                }
                
                /* Toggle Switch Styles */
                .toggle-switch {
                    position: relative;
                    display: inline-block;
                    width: 44px;
                    height: 24px;
                }
                
                .toggle-switch input {
                    opacity: 0;
                    width: 0;
                    height: 0;
                }
                
                .toggle-slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: #cbd5e1;
                    transition: .4s;
                    border-radius: 24px;
                }
                
                .toggle-slider:before {
                    position: absolute;
                    content: "";
                    height: 18px;
                    width: 18px;
                    left: 3px;
                    bottom: 3px;
                    background-color: white;
                    transition: .4s;
                    border-radius: 50%;
                }
                
                input:checked + .toggle-slider {
                    background-color: var(--primary-color, #6366f1);
                }
                
                input:focus + .toggle-slider {
                    box-shadow: 0 0 1px var(--primary-color, #6366f1);
                }
                
                input:checked + .toggle-slider:before {
                    transform: translateX(20px);
                }
                
                /* Radio Button Styles */
                .radio-group {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    margin-top: 12px;
                }
                
                .radio-option {
                    position: relative;
                }
                
                .radio-option input {
                    position: absolute;
                    opacity: 0;
                    cursor: pointer;
                }
                
                .radio-label {
                    display: inline-block;
                    padding: 8px 16px;
                    border: 1px solid var(--settings-border);
                    border-radius: 20px;
                    font-size: 14px;
                    color: var(--text-secondary, #64748b);
                    cursor: pointer;
                    transition: all 0.2s;
                }
                
                .radio-option input:checked + .radio-label {
                    background-color: var(--primary-color, #6366f1);
                    color: white;
                    border-color: var(--primary-color, #6366f1);
                }
                
                .radio-option:hover input:not(:checked) + .radio-label {
                    background-color: var(--settings-hover);
                }
                
                /* Select Styles */
                .select-wrapper {
                    margin-top: 12px;
                }
                
                select {
                    width: 100%;
                    padding: 10px 12px;
                    border: 1px solid var(--settings-border);
                    border-radius: var(--radius, 12px);
                    background-color: var(--settings-bg);
                    color: var(--settings-text);
                    font-size: 14px;
                    appearance: none;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
                    background-repeat: no-repeat;
                    background-position: right 12px center;
                    background-size: 16px;
                }
                
                select:focus {
                    outline: none;
                    border-color: var(--primary-color, #6366f1);
                }
                
                /* Color option styles */
                .color-options {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 12px;
                    margin-top: 12px;
                }
                
                .color-option {
                    position: relative;
                }
                
                .color-option input {
                    position: absolute;
                    opacity: 0;
                }
                
                .color-swatch {
                    display: block;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    cursor: pointer;
                    box-shadow: inset 0 0 0 2px white, 0 0 0 1px var(--settings-border);
                    transition: transform 0.2s;
                }
                
                .color-option input:checked + .color-swatch {
                    transform: scale(1.2);
                    box-shadow: inset 0 0 0 2px white, 0 0 0 2px var(--primary-color, #6366f1);
                }
                
                .color-indigo { background-color: #6366f1; }
                .color-blue { background-color: #3b82f6; }
                .color-green { background-color: #10b981; }
                .color-purple { background-color: #8b5cf6; }
                .color-pink { background-color: #ec4899; }
                .color-amber { background-color: #f59e0b; }
                
                /* Button styles */
                .settings-actions {
                    display: flex;
                    gap: 12px;
                    padding: 20px 24px;
                    border-top: 1px solid var(--settings-border);
                }
                
                button {
                    padding: 10px 20px;
                    border-radius: var(--radius, 12px);
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                
                #save-settings {
                    background-color: var(--primary-color, #6366f1);
                    color: white;
                    border: none;
                    flex: 1;
                }
                
                #save-settings:hover {
                    background-color: var(--primary-dark, #4f46e5);
                }
                
                #reset-settings {
                    background-color: transparent;
                    color: var(--text-secondary, #64748b);
                    border: 1px solid var(--settings-border);
                }
                
                #reset-settings:hover {
                    background-color: var(--settings-hover);
                }
                
                button:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }
                
                @media (max-width: 640px) {
                    .settings-panel {
                        width: 100%;
                    }
                }
            </style>
            
            <div class="settings-overlay">
                <div class="settings-panel">
                    <div class="settings-header">
                        <h2 class="settings-title">Settings</h2>
                        <button id="close-settings" aria-label="Close settings">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                    
                    <div class="settings-content">
                        <form id="settings-form">
                            <div class="settings-section">
                                <h3 class="section-title">Appearance</h3>
                                
                                <div class="setting-group">
                                    <div class="setting-row">
                                        <div class="setting-label">Theme</div>
                                    </div>
                                    <div class="radio-group">
                                        <label class="radio-option">
                                            <input type="radio" name="theme" value="light">
                                            <span class="radio-label">Light</span>
                                        </label>
                                        <label class="radio-option">
                                            <input type="radio" name="theme" value="dark">
                                            <span class="radio-label">Dark</span>
                                        </label>
                                        <label class="radio-option">
                                            <input type="radio" name="theme" value="system">
                                            <span class="radio-label">System</span>
                                        </label>
                                    </div>
                                </div>
                                
                                <div class="setting-group">
                                    <div class="setting-row">
                                        <div class="setting-label">Font Size</div>
                                    </div>
                                    <div class="select-wrapper">
                                        <select id="font-size" name="font-size">
                                            <option value="small">Small</option>
                                            <option value="medium">Medium</option>
                                            <option value="large">Large</option>
                                            <option value="x-large">Extra Large</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div class="setting-group">
                                    <div class="setting-row">
                                        <div class="setting-label">Accent Color</div>
                                    </div>
                                    <div class="color-options">
                                        <label class="color-option">
                                            <input type="radio" name="color-accent" value="indigo" id="color-accent">
                                            <span class="color-swatch color-indigo"></span>
                                        </label>
                                        <label class="color-option">
                                            <input type="radio" name="color-accent" value="blue">
                                            <span class="color-swatch color-blue"></span>
                                        </label>
                                        <label class="color-option">
                                            <input type="radio" name="color-accent" value="green">
                                            <span class="color-swatch color-green"></span>
                                        </label>
                                        <label class="color-option">
                                            <input type="radio" name="color-accent" value="purple">
                                            <span class="color-swatch color-purple"></span>
                                        </label>
                                        <label class="color-option">
                                            <input type="radio" name="color-accent" value="pink">
                                            <span class="color-swatch color-pink"></span>
                                        </label>
                                        <label class="color-option">
                                            <input type="radio" name="color-accent" value="amber">
                                            <span class="color-swatch color-amber"></span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="settings-section">
                                <h3 class="section-title">Notifications</h3>
                                
                                <div class="setting-group">
                                    <div class="setting-row">
                                        <div class="setting-label">Assignment Notifications</div>
                                        <label class="toggle-switch">
                                            <input type="checkbox" class="notification-toggle" data-setting="assignments">
                                            <span class="toggle-slider"></span>
                                        </label>
                                    </div>
                                    
                                    <div class="setting-row">
                                        <div class="setting-label">Announcement Notifications</div>
                                        <label class="toggle-switch">
                                            <input type="checkbox" class="notification-toggle" data-setting="announcements">
                                            <span class="toggle-slider"></span>
                                        </label>
                                    </div>
                                    
                                    <div class="setting-row">
                                        <div class="setting-label">Grade Notifications</div>
                                        <label class="toggle-switch">
                                            <input type="checkbox" class="notification-toggle" data-setting="grades">
                                            <span class="toggle-slider"></span>
                                        </label>
                                    </div>
                                    
                                    <div class="setting-row">
                                        <div class="setting-label">Message Notifications</div>
                                        <label class="toggle-switch">
                                            <input type="checkbox" class="notification-toggle" data-setting="messages">
                                            <span class="toggle-slider"></span>
                                        </label>
                                    </div>
                                    
                                    <div class="setting-row">
                                        <div class="setting-label">Reminder Notifications</div>
                                        <label class="toggle-switch">
                                            <input type="checkbox" class="notification-toggle" data-setting="reminders">
                                            <span class="toggle-slider"></span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                    
                    <div class="settings-actions">
                        <button id="reset-settings">Reset to Default</button>
                        <button id="save-settings" type="submit">Save Settings</button>
                    </div>
                </div>
            </div>
        `;
    }
}

customElements.define('user-settings', UserSettings);