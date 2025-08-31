import { SEARCH_CATEGORIES } from '../utils/constants.js';
import { SearchAPI } from '../utils/search-api.js';
import { SearchSuggestions } from './search/SearchSuggestions.js';

class SearchBar extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.searchResults = [];
        this.searchCategories = SEARCH_CATEGORIES;
        this.activeCategory = 'all';
        this.render();
    }

    connectedCallback() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        const searchInput = this.shadowRoot.querySelector('#search-input');
        const searchForm = this.shadowRoot.querySelector('#search-form');
        const clearButton = this.shadowRoot.querySelector('#clear-search');
        const categoryButtons = this.shadowRoot.querySelectorAll('.category-button');
        const advancedButton = this.shadowRoot.querySelector('#advanced-search-toggle');
        const advancedPanel = this.shadowRoot.querySelector('.advanced-search');

        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            this.handleSearch(query);
            clearButton.style.display = query ? 'block' : 'none';
        });

        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const query = searchInput.value.trim();
            if (query) {
                this.performSearch(query);
            }
        });

        clearButton.addEventListener('click', () => {
            searchInput.value = '';
            clearButton.style.display = 'none';
            this.clearResults();
        });

        categoryButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.activeCategory = button.dataset.category;
                this.updateCategoryButtons();
                this.performSearch(searchInput.value.trim());
            });
        });

        advancedButton.addEventListener('click', () => {
            advancedPanel.classList.toggle('open');
            advancedButton.textContent = advancedPanel.classList.contains('open') ? 'Hide Advanced' : 'Advanced Search';
        });

        const dateFromInput = this.shadowRoot.querySelector('#date-from');
        const dateToInput = this.shadowRoot.querySelector('#date-to');
        const sortSelect = this.shadowRoot.querySelector('#sort-by');

        [dateFromInput, dateToInput, sortSelect].forEach(element => {
            element.addEventListener('change', () => {
                this.performSearch(searchInput.value.trim());
            });
        });
    }

    updateCategoryButtons() {
        const categoryButtons = this.shadowRoot.querySelectorAll('.category-button');
        categoryButtons.forEach(button => {
            if (button.dataset.category === this.activeCategory) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    }

    handleSearch(query) {
        if (query.length < 2) {
            this.clearResults();
            return;
        }

        const resultsContainer = this.shadowRoot.querySelector('.search-suggestions');
        resultsContainer.style.display = 'block';
        resultsContainer.innerHTML = '<div class="loading">Searching...</div>';

        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.performSearch(query, true);
        }, 300);
    }

    performSearch(query, isSuggestion = false) {
        if (!query) {
            this.clearResults();
            return;
        }

        const dateFrom = this.shadowRoot.querySelector('#date-from').value;
        const dateTo = this.shadowRoot.querySelector('#date-to').value;
        const sortBy = this.shadowRoot.querySelector('#sort-by').value;

        SearchAPI.simulateSearchResults(query, this.activeCategory, dateFrom, dateTo, sortBy).then(results => {
            this.searchResults = results;

            if (isSuggestion) {
                this.renderSuggestions(results);
            } else {
                this.renderFullResults(results);
                this.dispatchEvent(new CustomEvent('search', {
                    bubbles: true,
                    composed: true,
                    detail: { results, query, category: this.activeCategory }
                }));
            }
        });
    }

    renderSuggestions(results) {
        const container = this.shadowRoot.querySelector('.search-suggestions');
        SearchSuggestions.render(results, container);
        
        SearchSuggestions.setupEventListeners(
            container,
            this.searchResults,
            (result) => this.handleResultClick(result),
            () => {
                this.renderFullResults(this.searchResults);
                this.shadowRoot.querySelector('.search-suggestions').style.display = 'none';
            }
        );
    }

    renderFullResults(results) {
        this.dispatchEvent(new CustomEvent('fullsearch', {
            bubbles: true,
            composed: true,
            detail: { results, query: this.shadowRoot.querySelector('#search-input').value }
        }));

        this.shadowRoot.querySelector('.search-suggestions').style.display = 'none';
    }

    handleResultClick(result) {
        this.shadowRoot.querySelector('.search-suggestions').style.display = 'none';

        this.dispatchEvent(new CustomEvent('resultselect', {
            bubbles: true,
            composed: true,
            detail: { result }
        }));
    }

    clearResults() {
        this.shadowRoot.querySelector('.search-suggestions').style.display = 'none';
        this.searchResults = [];
    }

    render() {
        const today = new Date().toISOString().split('T')[0];

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    --search-bg: var(--surface, white);
                    --search-text: var(--text-primary, #1e293b);
                    --search-border: var(--border, #e2e8f0);
                    --search-shadow: var(--shadow-md);
                    --suggestion-hover: var(--surface-hover, #f1f5f9);

                    display: block;
                    position: relative;
                    width: 100%;
                    max-width: 600px;
                }

                .search-container {
                    position: relative;
                }

                #search-form {
                    display: flex;
                    align-items: center;
                    width: 100%;
                }

                #search-input {
                    width: 100%;
                    padding: 12px 16px 12px 40px;
                    border: 1px solid var(--search-border);
                    border-radius: var(--radius, 12px);
                    background-color: var(--search-bg);
                    color: var(--search-text);
                    font-size: 16px;
                    transition: all 0.2s ease;
                }

                #search-input:focus {
                    outline: none;
                    border-color: var(--primary-color, #6366f1);
                    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
                }

                .search-icon {
                    position: absolute;
                    left: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--text-secondary, #64748b);
                    pointer-events: none;
                }

                .search-icon svg {
                    width: 18px;
                    height: 18px;
                }

                #clear-search {
                    position: absolute;
                    right: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    background: none;
                    border: none;
                    color: var(--text-secondary, #64748b);
                    cursor: pointer;
                    display: none;
                    padding: 4px;
                    border-radius: 50%;
                }

                #clear-search:hover {
                    background-color: var(--suggestion-hover);
                }

                #clear-search svg {
                    width: 16px;
                    height: 16px;
                }

                .search-suggestions {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    margin-top: 8px;
                    background-color: var(--search-bg);
                    border-radius: var(--radius, 12px);
                    border: 1px solid var(--search-border);
                    box-shadow: var(--search-shadow);
                    z-index: 10;
                    display: none;
                    overflow: hidden;
                }

                .loading, .no-results {
                    padding: 16px;
                    text-align: center;
                    color: var(--text-secondary, #64748b);
                    font-size: 14px;
                }

                .suggestion-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                    max-height: 350px;
                    overflow-y: auto;
                }

                .suggestion-item {
                    display: flex;
                    align-items: center;
                    padding: 12px 16px;
                    border: none;
                    background: none;
                    width: 100%;
                    text-align: left;
                    cursor: pointer;
                    color: var(--search-text);
                    transition: background-color 0.2s;
                }

                .suggestion-item:hover {
                    background-color: var(--suggestion-hover);
                }

                .item-icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 36px;
                    height: 36px;
                    border-radius: 8px;
                    margin-right: 12px;
                    flex-shrink: 0;
                }

                .item-icon svg {
                    width: 18px;
                    height: 18px;
                }

                .item-icon.courses {
                    background-color: rgba(99, 102, 241, 0.1);
                    color: var(--primary-color, #6366f1);
                }

                .item-icon.assignments {
                    background-color: rgba(245, 158, 11, 0.1);
                    color: var(--warning-color, #f59e0b);
                }

                .item-icon.resources {
                    background-color: rgba(16, 185, 129, 0.1);
                    color: var(--success-color, #10b981);
                }

                .item-icon.discussions {
                    background-color: rgba(139, 92, 246, 0.1);
                    color: var(--secondary-color, #8b5cf6);
                }

                .item-details {
                    display: flex;
                    flex-direction: column;
                }

                .item-title {
                    font-weight: 500;
                    margin-bottom: 4px;
                }

                .item-type {
                    font-size: 12px;
                    color: var(--text-secondary, #64748b);
                }

                .more-results {
                    padding: 8px 16px;
                    font-size: 12px;
                    color: var(--text-secondary, #64748b);
                    border-top: 1px solid var(--search-border);
                }

                .view-all {
                    width: 100%;
                    padding: 12px;
                    background-color: var(--primary-color, #6366f1);
                    color: white;
                    border: none;
                    font-weight: 500;
                    cursor: pointer;
                    transition: background-color 0.2s;
                }

                .view-all:hover {
                    background-color: var(--primary-dark, #4f46e5);
                }

                .search-categories {
                    display: flex;
                    gap: 8px;
                    margin-top: 16px;
                    overflow-x: auto;
                    padding-bottom: 8px;
                    scrollbar-width: thin;
                }

                .category-button {
                    background-color: var(--surface, white);
                    border: 1px solid var(--search-border);
                    border-radius: 20px;
                    padding: 6px 12px;
                    font-size: 14px;
                    cursor: pointer;
                    white-space: nowrap;
                    color: var(--text-secondary, #64748b);
                    transition: all 0.2s;
                }

                .category-button.active {
                    background-color: var(--primary-color, #6366f1);
                    color: white;
                    border-color: var(--primary-color, #6366f1);
                }

                .category-button:hover:not(.active) {
                    background-color: var(--suggestion-hover);
                }

                .advanced-search-container {
                    margin-top: 12px;
                }

                #advanced-search-toggle {
                    background: none;
                    border: none;
                    color: var(--primary-color, #6366f1);
                    font-size: 14px;
                    cursor: pointer;
                    padding: 4px 8px;
                    border-radius: var(--radius, 12px);
                }

                #advanced-search-toggle:hover {
                    background-color: rgba(99, 102, 241, 0.1);
                }

                .advanced-search {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                    margin-top: 12px;
                    padding: 16px;
                    border-radius: var(--radius, 12px);
                    border: 1px solid var(--search-border);
                    background-color: var(--search-bg);
                    max-height: 0;
                    overflow: hidden;
                    opacity: 0;
                    transition: all 0.3s ease;
                }

                .advanced-search.open {
                    max-height: 300px;
                    opacity: 1;
                }

                .filter-group {
                    display: flex;
                    flex-direction: column;
                }

                .filter-group label {
                    font-size: 14px;
                    font-weight: 500;
                    margin-bottom: 8px;
                    color: var(--text-secondary, #64748b);
                }

                .filter-group input, .filter-group select {
                    padding: 8px 12px;
                    border: 1px solid var(--search-border);
                    border-radius: var(--radius, 12px);
                    background-color: var(--search-bg);
                    color: var(--search-text);
                }

                .filter-group input:focus, .filter-group select:focus {
                    outline: none;
                    border-color: var(--primary-color, #6366f1);
                }

                @media (max-width: 640px) {
                    .advanced-search {
                        grid-template-columns: 1fr;
                    }
                }
            </style>

            <div class="search-container">
                <form id="search-form">
                    <div class="search-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </div>
                    <input type="text" id="search-input" placeholder="Search courses, assignments, resources..." autocomplete="off">
                    <button type="button" id="clear-search" aria-label="Clear search">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </form>

                <div class="search-suggestions"></div>

                <div class="search-categories">
                    <button type="button" class="category-button active" data-category="all">All</button>
                    <button type="button" class="category-button" data-category="courses">Courses</button>
                    <button type="button" class="category-button" data-category="assignments">Assignments</button>
                    <button type="button" class="category-button" data-category="resources">Resources</button>
                    <button type="button" class="category-button" data-category="discussions">Discussions</button>
                </div>

                <div class="advanced-search-container">
                    <button type="button" id="advanced-search-toggle">Advanced Search</button>

                    <div class="advanced-search">
                        <div class="filter-group">
                            <label for="date-from">Date From</label>
                            <input type="date" id="date-from" max="${today}">
                        </div>

                        <div class="filter-group">
                            <label for="date-to">Date To</label>
                            <input type="date" id="date-to" max="${today}">
                        </div>

                        <div class="filter-group" style="grid-column: span 2;">
                            <label for="sort-by">Sort By</label>
                            <select id="sort-by">
                                <option value="relevance">Relevance</option>
                                <option value="newest">Date (Newest First)</option>
                                <option value="oldest">Date (Oldest First)</option>
                                <option value="az">Name (A-Z)</option>
                                <option value="za">Name (Z-A)</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

customElements.define('search-bar', SearchBar);