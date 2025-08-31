import { ChartManager } from './analytics/ChartManager.js';

class AnalyticsDashboard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.chartManager = new ChartManager();
        this.render();
    }

    connectedCallback() {
        this.initCharts();
        
        window.addEventListener('themechange', (e) => {
            this.chartManager.updateChartsTheme(e.detail.theme);
        });
        
        const tabs = this.shadowRoot.querySelectorAll('.tab-item');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                this.switchTab(tab.dataset.tab);
            });
        });
        
        const rangeSelector = this.shadowRoot.querySelector('#time-range');
        rangeSelector.addEventListener('change', () => {
            this.chartManager.updateChartData(rangeSelector.value);
        });
    }

    switchTab(tabId) {
        const tabs = this.shadowRoot.querySelectorAll('.tab-item');
        tabs.forEach(tab => {
            if (tab.dataset.tab === tabId) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
        
        const contents = this.shadowRoot.querySelectorAll('.tab-content');
        contents.forEach(content => {
            if (content.id === `tab-${tabId}`) {
                content.style.display = 'block';
            } else {
                content.style.display = 'none';
            }
        });
    }

    initCharts() {
        this.chartManager.initCharts(this.shadowRoot);
        
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        this.chartManager.updateChartsTheme(currentTheme);
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    --analytics-bg: var(--surface, white);
                    --analytics-text: var(--text-primary, #1e293b);
                    --analytics-border: var(--border, #e2e8f0);
                    --analytics-shadow: var(--shadow-md);
                    --tab-hover: var(--surface-hover, #f1f5f9);
                    
                    display: block;
                    padding: 16px;
                }
                
                .analytics-container {
                    background-color: var(--analytics-bg);
                    border-radius: var(--radius, 12px);
                    box-shadow: var(--analytics-shadow);
                    overflow: hidden;
                }
                
                .analytics-header {
                    padding: 20px 24px;
                    border-bottom: 1px solid var(--analytics-border);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 16px;
                }
                
                .analytics-title {
                    font-size: 20px;
                    font-weight: 600;
                    color: var(--analytics-text);
                    margin: 0;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .analytics-title svg {
                    width: 24px;
                    height: 24px;
                    color: var(--primary-color, #6366f1);
                }
                
                .time-range-selector {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .time-range-selector label {
                    font-size: 14px;
                    color: var(--text-secondary, #64748b);
                }
                
                .time-range-selector select {
                    padding: 8px 12px;
                    border: 1px solid var(--analytics-border);
                    border-radius: var(--radius, 12px);
                    background-color: var(--analytics-bg);
                    color: var(--analytics-text);
                    font-size: 14px;
                }
                
                .analytics-tabs {
                    display: flex;
                    overflow-x: auto;
                    scrollbar-width: thin;
                    border-bottom: 1px solid var(--analytics-border);
                }
                
                .tab-item {
                    padding: 16px 24px;
                    font-size: 14px;
                    font-weight: 500;
                    color: var(--text-secondary, #64748b);
                    cursor: pointer;
                    white-space: nowrap;
                    border-bottom: 2px solid transparent;
                    transition: all 0.2s;
                }
                
                .tab-item.active {
                    color: var(--primary-color, #6366f1);
                    border-bottom-color: var(--primary-color, #6366f1);
                }
                
                .tab-item:hover:not(.active) {
                    color: var(--analytics-text);
                    background-color: var(--tab-hover);
                }
                
                .tab-content {
                    padding: 24px;
                    display: none;
                }
                
                .tab-content.active {
                    display: block;
                }
                
                .chart-container {
                    position: relative;
                    height: 300px;
                    width: 100%;
                    margin-bottom: 24px;
                }
                
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 16px;
                    margin-bottom: 24px;
                }
                
                .stat-card {
                    background-color: var(--analytics-bg);
                    border: 1px solid var(--analytics-border);
                    border-radius: var(--radius, 12px);
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                }
                
                .stat-value {
                    font-size: 32px;
                    font-weight: 700;
                    margin-bottom: 8px;
                    color: var(--analytics-text);
                }
                
                .stat-label {
                    font-size: 14px;
                    color: var(--text-secondary, #64748b);
                }
                
                .stat-change {
                    margin-top: 8px;
                    font-size: 14px;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }
                
                .stat-change.positive {
                    color: var(--success-color, #10b981);
                }
                
                .stat-change.negative {
                    color: var(--error-color, #ef4444);
                }
                
                .stat-change svg {
                    width: 16px;
                    height: 16px;
                }
                
                .grades-overview {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 16px;
                    margin-bottom: 24px;
                }
                
                .grade-item {
                    background-color: var(--analytics-bg);
                    border: 1px solid var(--analytics-border);
                    border-radius: var(--radius, 12px);
                    padding: 16px;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }
                
                .grade-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .grade-icon.excellent {
                    background-color: rgba(16, 185, 129, 0.1);
                    color: var(--success-color, #10b981);
                }
                
                .grade-icon.good {
                    background-color: rgba(99, 102, 241, 0.1);
                    color: var(--primary-color, #6366f1);
                }
                
                .grade-icon.average {
                    background-color: rgba(245, 158, 11, 0.1);
                    color: var(--warning-color, #f59e0b);
                }
                
                .grade-icon.poor {
                    background-color: rgba(239, 68, 68, 0.1);
                    color: var(--error-color, #ef4444);
                }
                
                .grade-icon svg {
                    width: 24px;
                    height: 24px;
                }
                
                .grade-details {
                    flex: 1;
                }
                
                .grade-subject {
                    font-weight: 500;
                    margin-bottom: 4px;
                    color: var(--analytics-text);
                }
                
                .grade-value {
                    font-size: 14px;
                    color: var(--text-secondary, #64748b);
                }
                
                .todo-list {
                    border: 1px solid var(--analytics-border);
                    border-radius: var(--radius, 12px);
                    overflow: hidden;
                }
                
                .todo-header {
                    padding: 16px;
                    border-bottom: 1px solid var(--analytics-border);
                    font-weight: 600;
                    color: var(--analytics-text);
                }
                
                .todo-item {
                    display: flex;
                    align-items: center;
                    padding: 12px 16px;
                    border-bottom: 1px solid var(--analytics-border);
                }
                
                .todo-item:last-child {
                    border-bottom: none;
                }
                
                .todo-checkbox {
                    margin-right: 12px;
                }
                
                .todo-title {
                    flex: 1;
                    font-size: 14px;
                    color: var(--analytics-text);
                }
                
                .todo-date {
                    font-size: 12px;
                    color: var(--text-secondary, #64748b);
                }
                
                @media (max-width: 768px) {
                    .analytics-header {
                        flex-direction: column;
                        align-items: flex-start;
                    }
                    
                    .stats-grid {
                        grid-template-columns: 1fr;
                    }
                }
            </style>
            
            <!-- Chart.js Library -->
            <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
            
            <div class="analytics-container">
                <div class="analytics-header">
                    <h2 class="analytics-title">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="20" x2="18" y2="10"></line>
                            <line x1="12" y1="20" x2="12" y2="4"></line>
                            <line x1="6" y1="20" x2="6" y2="14"></line>
                        </svg>
                        Learning Analytics
                    </h2>
                    <div class="time-range-selector">
                        <label for="time-range">Time Period:</label>
                        <select id="time-range">
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                            <option value="semester">This Semester</option>
                        </select>
                    </div>
                </div>
                
                <div class="analytics-tabs">
                    <div class="tab-item active" data-tab="overview">Overview</div>
                    <div class="tab-item" data-tab="progress">Progress</div>
                    <div class="tab-item" data-tab="grades">Grades</div>
                    <div class="tab-item" data-tab="time">Time Management</div>
                </div>
                
                <div id="tab-overview" class="tab-content" style="display: block;">
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-value">87%</div>
                            <div class="stat-label">Average Grade</div>
                            <div class="stat-change positive">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="18 15 12 9 6 15"></polyline>
                                </svg>
                                3.2% from last period
                            </div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-value">25</div>
                            <div class="stat-label">Completed Assignments</div>
                            <div class="stat-change positive">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="18 15 12 9 6 15"></polyline>
                                </svg>
                                5 more than last period
                            </div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-value">18.3</div>
                            <div class="stat-label">Study Hours This Week</div>
                            <div class="stat-change negative">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="6 9 12 15 18 9"></polyline>
                                </svg>
                                2.5 less than last week
                            </div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-value">5</div>
                            <div class="stat-label">Upcoming Deadlines</div>
                            <div class="stat-change positive">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="18 15 12 9 6 15"></polyline>
                                </svg>
                                On track
                            </div>
                        </div>
                    </div>
                    
                    <div class="chart-container">
                        <canvas id="progress-chart"></canvas>
                    </div>
                    
                    <div class="todo-list">
                        <div class="todo-header">Upcoming Tasks</div>
                        <div class="todo-item">
                            <input type="checkbox" class="todo-checkbox">
                            <div class="todo-title">Complete Psychology Research Paper</div>
                            <div class="todo-date">Due in 3 days</div>
                        </div>
                        <div class="todo-item">
                            <input type="checkbox" class="todo-checkbox">
                            <div class="todo-title">Math Problem Set #5</div>
                            <div class="todo-date">Due tomorrow</div>
                        </div>
                        <div class="todo-item">
                            <input type="checkbox" class="todo-checkbox">
                            <div class="todo-title">History Discussion Post</div>
                            <div class="todo-date">Due in 5 days</div>
                        </div>
                        <div class="todo-item">
                            <input type="checkbox" class="todo-checkbox">
                            <div class="todo-title">Science Lab Report</div>
                            <div class="todo-date">Due in 1 week</div>
                        </div>
                        <div class="todo-item">
                            <input type="checkbox" class="todo-checkbox">
                            <div class="todo-title">Language Presentation</div>
                            <div class="todo-date">Due in 2 weeks</div>
                        </div>
                    </div>
                </div>
                
                <div id="tab-progress" class="tab-content">
                    <div class="chart-container">
                        <canvas id="progress-chart-detail"></canvas>
                    </div>
                    
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-value">83%</div>
                            <div class="stat-label">Overall Completion Rate</div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-value">92%</div>
                            <div class="stat-label">On-time Submission Rate</div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-value">5</div>
                            <div class="stat-label">Days Average Completion Time</div>
                        </div>
                    </div>
                </div>
                
                <div id="tab-grades" class="tab-content">
                    <div class="chart-container">
                        <canvas id="grades-chart"></canvas>
                    </div>
                    
                    <div class="grades-overview">
                        <div class="grade-item">
                            <div class="grade-icon excellent">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                </svg>
                            </div>
                            <div class="grade-details">
                                <div class="grade-subject">Science</div>
                                <div class="grade-value">A (92%)</div>
                            </div>
                        </div>
                        
                        <div class="grade-item">
                            <div class="grade-icon good">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                </svg>
                            </div>
                            <div class="grade-details">
                                <div class="grade-subject">Math</div>
                                <div class="grade-value">B+ (85%)</div>
                            </div>
                        </div>
                        
                        <div class="grade-item">
                            <div class="grade-icon average">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="8" x2="12" y2="12"></line>
                                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                </svg>
                            </div>
                            <div class="grade-details">
                                <div class="grade-subject">History</div>
                                <div class="grade-value">C+ (78%)</div>
                            </div>
                        </div>
                        
                        <div class="grade-item">
                            <div class="grade-icon excellent">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                </svg>
                            </div>
                            <div class="grade-details">
                                <div class="grade-subject">Art</div>
                                <div class="grade-value">A (95%)</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div id="tab-time" class="tab-content">
                    <div class="chart-container">
                        <canvas id="time-chart"></canvas>
                    </div>
                    
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-value">18.3</div>
                            <div class="stat-label">Total Hours This Week</div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-value">2.6</div>
                            <div class="stat-label">Daily Average (hours)</div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-value">4.0</div>
                            <div class="stat-label">Most Productive Day (hours)</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

customElements.define('analytics-dashboard', AnalyticsDashboard);