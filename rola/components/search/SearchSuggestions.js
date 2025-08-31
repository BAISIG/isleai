import { getIconForType, formatType } from '../../utils/icons.js';

export class SearchSuggestions {
    static render(results, containerElement) {
        if (results.length === 0) {
            containerElement.innerHTML = '<div class="no-results">No results found</div>';
            return;
        }

        const suggestions = results.slice(0, 5);
        let html = `
            <ul class="suggestion-list">
                ${suggestions.map(item => `
                    <li>
                        <button class="suggestion-item" data-id="${item.id}">
                            <div class="item-icon ${item.type}">
                                ${getIconForType(item.type)}
                            </div>
                            <div class="item-details">
                                <span class="item-title">${item.title}</span>
                                <span class="item-type">${formatType(item.type)}</span>
                            </div>
                        </button>
                    </li>
                `).join('')}
            </ul>
            ${results.length > 5 ? `<div class="more-results">+ ${results.length - 5} more results</div>` : ''}
            <button class="view-all">View all results</button>
        `;

        containerElement.innerHTML = html;
    }

    static setupEventListeners(container, searchResults, onResultClick, onViewAll) {
        container.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                const id = parseInt(item.dataset.id);
                const result = searchResults.find(r => r.id === id);
                onResultClick(result);
            });
        });

        const viewAllButton = container.querySelector('.view-all');
        if (viewAllButton) {
            viewAllButton.addEventListener('click', onViewAll);
        }
    }
}

