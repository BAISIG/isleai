// Search-related constants
export const SEARCH_CATEGORIES = ['courses', 'assignments', 'resources', 'discussions'];

export const SEARCH_TYPES = {
    COURSES: 'courses',
    ASSIGNMENTS: 'assignments',
    RESOURCES: 'resources',
    DISCUSSIONS: 'discussions'
};

export const MOCK_SEARCH_DATA = [
    { id: 1, title: 'Introduction to Psychology', type: 'courses', date: '2023-09-15' },
    { id: 2, title: 'Psychology 101 Assignment', type: 'assignments', date: '2023-10-05' },
    { id: 3, title: 'Research Methods in Psychology', type: 'courses', date: '2023-08-20' },
    { id: 4, title: 'Psychology Study Guide', type: 'resources', date: '2023-09-25' },
    { id: 5, title: 'Discussion: Cognitive Psychology', type: 'discussions', date: '2023-10-10' },
    { id: 6, title: 'Neuroscience Basics', type: 'courses', date: '2023-07-30' },
    { id: 7, title: 'Behavioral Psychology Case Study', type: 'assignments', date: '2023-09-18' },
    { id: 8, title: 'Psychology Department Announcement', type: 'resources', date: '2023-10-01' }
];

// Analytics constants
export const CHART_COLORS = {
    PRIMARY: 'rgb(99, 102, 241)',
    PRIMARY_ALPHA: 'rgba(99, 102, 241, 0.2)',
    WARNING: 'rgb(245, 158, 11)',
    WARNING_ALPHA: 'rgba(245, 158, 11, 0.1)',
    SUCCESS: 'rgb(16, 185, 129)',
    ERROR: 'rgb(239, 68, 68)'
};

export const TIME_RANGES = {
    WEEK: 'week',
    MONTH: 'month',
    SEMESTER: 'semester'
};