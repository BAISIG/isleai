import { getIconForType, formatType } from '../utils/icons.js';

class SearchResults extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.results = [];
        this.query = '';
        this.render();
    }

    connectedCallback() {
        document.addEventListener('fullsearch', (e) => {
            this.results = e.detail.results;
            this.query = e.detail.query;
            this.render();
            this.style.display = 'block';
        });
        
        this.shadowRoot.querySelector('.close-button').addEventListener('click', () => {
            this.style.display = 'none';
        });
    }

    render() {
        const counts = {
            courses: this.results.filter(r => r.type === 'courses').length,
            assignments: this.results.filter(r => r.type === 'assignments').length,
            resources: this.results.filter(r => r.type === 'resources').length,
            discussions: this.results.filter(r => r.type === 'discussions').length
        };
        
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    --results-bg: var(--surface, white);
                    --results-text: var(--text-primary, #1e293b);
                    --results-border: var(--border, #e2e8f0);
                    --results-shadow: var(--shadow-lg);
                    --result-hover: var(--surface-hover, #f1f5f9);
                    
                    display: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 100;
                    background-color: rgba(0, 0, 0, 0.5);
                    padding: 20px;
                    overflow-y: auto;
                    animation: fadeIn 0.3s ease;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                .results-container {
                    background-color: var(--results-bg);
                    border-radius: var(--radius-lg, 16px);
                    box-shadow: var(--results-shadow);
                    max-width: 900px;
                    margin: 40px auto;
                    overflow: hidden;
                    animation: slideDown 0.3s ease;
                }
                
                @keyframes slideDown {
                    from { transform: translateY(-20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                
                .results-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 20px 24px;
                    border-bottom: 1px solid var(--results-border);
                }
                
                .results-title {
                    font-size: 20px;
                    font-weight: 600;
                    color: var(--results-text);
                    margin: 0;
                }
                
                .results-count {
                    color: var(--text-secondary, #64748b);
                    font-size: 14px;
                    margin-top: 4px;
                }
                
                .close-button {
                    background: none;
                    border: none;
                    color: var(--text-secondary, #64748b);
                    cursor: pointer;
                    padding: 8px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: background-color 0.2s;
                }
                
                .close-button:hover {
                    background-color: var(--result-hover);
                }
                
                .close-button svg {
                    width: 20px;
                    height: 20px;
                }
                
                .results-categories {
                    display: flex;
                    padding: 0 24px;
                    border-bottom: 1px solid var(--results-border);
                    overflow-x: auto;
                    scrollbar-width: thin;
                }
                
                .category-tab {
                    padding: 16px 20px;
                    font-size: 14px;
                    font-weight: 500;
                    color: var(--text-secondary, #64748b);
                    border-bottom: 2px solid transparent;
                    cursor: pointer;
                    white-space: nowrap;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .category-tab.active {
                    color: var(--primary-color, #6366f1);
                    border-bottom-color: var(--primary-color, #6366f1);
                }
                
                .category-tab:hover:not(.active) {
                    color: var(--results-text);
                    background-color: var(--result-hover);
                }
                
                .category-count {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    background-color: rgba(99, 102, 241, 0.1);
                    color: var(--primary-color, #6366f1);
                    border-radius: 20px;
                    padding: 2px 8px;
                    font-size: 12px;
                    min-width: 24px;
                }
                
                .results-list {
                    padding: 16px 24px;
                }
                
                .result-item {
                    display: flex;
                    align-items: center;
                    padding: 16px;
                    border-radius: var(--radius, 12px);
                    transition: background-color 0.2s;
                    cursor: pointer;
                    animation: fadeIn 0.3s ease;
                }
                
                .result-item:hover {
                    background-color: var(--result-hover);
                }
                
                .result-icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    margin-right: 16px;
                    flex-shrink: 0;
                }
                
                .result-icon svg {
                    width: 24px;
                    height: 24px;
                }
                
                .result-icon.courses {
                    background-color: rgba(99, 102, 241, 0.1);
                    color: var(--primary-color, #6366f1);
                }
                
                .result-icon.assignments {
                    background-color: rgba(245, 158, 11, 0.1);
                    color: var(--warning-color, #f59e0b);
                }
                
                .result-icon.resources {
                    background-color: rgba(16, 185, 129, 0.1);
                    color: var(--success-color, #10b981);
                }
                
                .result-icon.discussions {
                    background-color: rgba(139, 92, 246, 0.1);
                    color: var(--secondary-color, #8b5cf6);
                }
                
                .result-details {
                    flex: 1;
                }
                
                .result-title {
                    font-weight: 500;
                    color: var(--results-text);
                    margin-bottom: 4px;
                }
                
                .result-meta {
                    display: flex;
                    align-items: center;
                    font-size: 14px;
                    color: var(--text-secondary, #64748b);
                }
                
                .result-type {
                    margin-right: 12px;
                    display: flex;
                    align-items: center;
                }
                
                .result-type::before {
                    content: '';
                    display: inline-block;
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    margin-right: 6px;
                }
                
                .result-type.courses::before {
                    background-color: var(--primary-color, #6366f1);
                }
                
                .result-type.assignments::before {
                    background-color: var(--warning-color, #f59e0b);
                }
                
                .result-type.resources::before {
                    background-color: var(--success-color, #10b981);
                }
                
                .result-type.discussions::before {
                    background-color: var(--secondary-color, #8b5cf6);
                }
                
                .result-date {
                    display: flex;
                    align-items: center;
                }
                
                .result-date svg {
                    width: 14px;
                    height: 14px;
                    margin-right: 4px;
                }
                
                .no-results {
                    padding: 40px 0;
                    text-align: center;
                    color: var(--text-secondary, #64748b);
                }
                
                .no-results-icon {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 64px;
                    height: 64px;
                    background-color: var(--result-hover);
                    border-radius: 50%;
                    margin-bottom: 16px;
                }
                
                .no-results-icon svg {
                    width: 32px;
                    height: 32px;
                    color: var(--text-secondary, #64748b);
                }
                
                .no-results-title {
                    font-size: 18px;
                    font-weight: 500;
                    margin-bottom: 8px;
                    color: var(--results-text);
                }
                
                .no-results-text {
                    font-size: 14px;
                    max-width: 400px;
                    margin: 0 auto;
                }
                
                @media (max-width: 640px) {
                    :host {
                        padding: 0;
                    }
                    
                    .results-container {
                        margin: 0;
                        max-width: 100%;
                        height: 100%;
                        border-radius: 0;
                    }
                }
            </style>
            
            <div class="results-container">
                <div class="results-header">
                    <div>
                        <h2 class="results-title">Search Results</h2>
                        <div class="results-count">${this.results.length} results for "${this.query}"</div>
                    </div>
                    <button class="close-button" aria-label="Close search results">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                
                <div class="results-categories">
                    <div class="category-tab active" data-category="all">
                        All
                        <span class="category-count">${this.results.length}</span>
                    </div>
                    <div class="category-tab" data-category="courses">
                        Courses
                        <span class="category-count">${counts.courses}</span>
                    </div>
                    <div class="category-tab" data-category="assignments">
                        Assignments
                        <span class="category-count">${counts.assignments}</span>
                    </div>
                    <div class="category-tab" data-category="resources">
                        Resources
                        <span class="category-count">${counts.resources}</span>
                    </div>
                    <div class="category-tab" data-category="discussions">
                        Discussions
                        <span class="category-count">${counts.discussions}</span>
                    </div>
                </div>
                
                <div class="results-list">
                    ${this.renderResultsList()}
                </div>
            </div>
        `;
        
        const tabs = this.shadowRoot.querySelectorAll('.category-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                const category = tab.dataset.category;
                this.renderFilteredResults(category);
            });
        });
    }

    renderResultsList() {
        if (this.results.length === 0) {
            return this.renderNoResults();
        }
        
        return this.results.map(result => this.renderResultItem(result)).join('');
    }

    renderFilteredResults(category) {
        const resultsContainer = this.shadowRoot.querySelector('.results-list');
        
        let filteredResults = this.results;
        if (category !== 'all') {
            filteredResults = this.results.filter(result => result.type === category);
        }
        
        if (filteredResults.length === 0) {
            resultsContainer.innerHTML = this.renderNoResults();
            return;
        }
        
        resultsContainer.innerHTML = filteredResults.map(result => this.renderResultItem(result)).join('');
    }

    renderResultItem(result) {
        const icon = getIconForType(result.type);
        const date = new Date(result.date).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
        
        return `
            <div class="result-item" data-id="${result.id}">
                <div class="result-icon ${result.type}">
                    ${icon}
                </div>
                <div class="result-details">
                    <div class="result-title">${result.title}</div>
                    <div class="result-meta">
                        <div class="result-type ${result.type}">${formatType(result.type)}</div>
                        <div class="result-date">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                            ${date}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderNoResults() {
        return `
            <div class="no-results">
                <div class="no-results-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                </div>
                <div class="no-results-title">No results found</div>
                <div class="no-results-text">We couldn't find any matches for "${this.query}". Try adjusting your search terms or filters.</div>
            </div>
        `;
    }
}

customElements.define('search-results', SearchResults);