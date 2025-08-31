import { MOCK_SEARCH_DATA } from './constants.js';

export class SearchAPI {
    static simulateSearchResults(query, category, dateFrom, dateTo, sortBy) {
        return new Promise((resolve) => {
            setTimeout(() => {
                let results = MOCK_SEARCH_DATA.filter(item => 
                    item.title.toLowerCase().includes(query.toLowerCase()));

                // Filter by category
                if (category !== 'all') {
                    results = results.filter(item => item.type === category);
                }

                // Filter by date range
                if (dateFrom) {
                    results = results.filter(item => new Date(item.date) >= new Date(dateFrom));
                }

                if (dateTo) {
                    results = results.filter(item => new Date(item.date) <= new Date(dateTo));
                }

                // Sort results
                results = this.sortResults(results, sortBy);

                resolve(results);
            }, 300);
        });
    }

    static sortResults(results, sortBy) {
        const sortMap = {
            newest: (a, b) => new Date(b.date) - new Date(a.date),
            oldest: (a, b) => new Date(a.date) - new Date(b.date),
            az: (a, b) => a.title.localeCompare(b.title),
            za: (a, b) => b.title.localeCompare(a.title)
        };

        return sortMap[sortBy] ? results.sort(sortMap[sortBy]) : results;
    }
}

