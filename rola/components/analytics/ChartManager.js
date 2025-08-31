import { CHART_COLORS, TIME_RANGES } from '../../utils/constants.js';

export class ChartManager {
    constructor() {
        this.charts = {};
    }

    initCharts(shadowRoot) {
        const progressCtx = shadowRoot.querySelector('#progress-chart').getContext('2d');
        const gradesCtx = shadowRoot.querySelector('#grades-chart').getContext('2d');
        const timeCtx = shadowRoot.querySelector('#time-chart').getContext('2d');
        
        this.charts.progress = new Chart(progressCtx, {
            type: 'line',
            data: this.getProgressData(),
            options: this.getProgressChartOptions()
        });
        
        this.charts.grades = new Chart(gradesCtx, {
            type: 'bar',
            data: this.getGradesData(),
            options: this.getGradesChartOptions()
        });
        
        this.charts.time = new Chart(timeCtx, {
            type: 'bar',
            data: this.getTimeData(),
            options: this.getTimeChartOptions()
        });
    }

    getProgressData() {
        return {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
            datasets: [
                {
                    label: 'Completed',
                    data: [5, 8, 12, 15, 20, 25],
                    borderColor: CHART_COLORS.PRIMARY,
                    backgroundColor: CHART_COLORS.PRIMARY_ALPHA,
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Due',
                    data: [6, 10, 15, 18, 25, 30],
                    borderColor: CHART_COLORS.WARNING,
                    backgroundColor: CHART_COLORS.WARNING_ALPHA,
                    tension: 0.4,
                    fill: true
                }
            ]
        };
    }

    getGradesData() {
        return {
            labels: ['Math', 'Science', 'History', 'Language', 'Art', 'Physical Ed'],
            datasets: [{
                label: 'Average Grade',
                data: [85, 92, 78, 88, 95, 82],
                backgroundColor: [
                    'rgba(99, 102, 241, 0.7)',
                    'rgba(16, 185, 129, 0.7)',
                    'rgba(245, 158, 11, 0.7)',
                    'rgba(139, 92, 246, 0.7)',
                    'rgba(236, 72, 153, 0.7)',
                    'rgba(6, 182, 212, 0.7)'
                ],
                borderWidth: 1
            }]
        };
    }

    getTimeData() {
        return {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Hours Spent',
                data: [2.5, 3.2, 4.0, 2.8, 3.5, 1.5, 0.8],
                backgroundColor: 'rgba(99, 102, 241, 0.7)',
                borderColor: CHART_COLORS.PRIMARY,
                borderWidth: 1
            }]
        };
    }

    getProgressChartOptions() {
        return {
            responsive: true,
            plugins: {
                legend: { position: 'top' },
                title: { display: true, text: 'Assignment Progress' }
            },
            scales: {
                y: { beginAtZero: true, title: { display: true, text: 'Number of Assignments' } },
                x: { title: { display: true, text: 'Time Period' } }
            }
        };
    }

    getGradesChartOptions() {
        return {
            responsive: true,
            plugins: {
                legend: { display: false },
                title: { display: true, text: 'Average Grades by Subject' }
            },
            scales: {
                y: { beginAtZero: true, max: 100, title: { display: true, text: 'Grade (%)' } }
            }
        };
    }

    getTimeChartOptions() {
        return {
            responsive: true,
            plugins: {
                legend: { display: false },
                title: { display: true, text: 'Study Time Distribution' }
            },
            scales: {
                y: { beginAtZero: true, title: { display: true, text: 'Hours' } }
            }
        };
    }

    updateChartsTheme(theme) {
        const textColor = theme === 'dark' ? '#f8fafc' : '#1e293b';
        const gridColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
        
        Object.values(this.charts).forEach(chart => {
            if (chart) {
                this.updateChartTheme(chart, textColor, gridColor);
                chart.update();
            }
        });
    }

    updateChartTheme(chart, textColor, gridColor) {
        chart.options.scales.x.grid.color = gridColor;
        chart.options.scales.x.ticks.color = textColor;
        chart.options.scales.x.title.color = textColor;
        chart.options.scales.y.grid.color = gridColor;
        chart.options.scales.y.ticks.color = textColor;
        chart.options.scales.y.title.color = textColor;
        chart.options.plugins.title.color = textColor;
        
        if (chart.options.plugins.legend.display) {
            chart.options.plugins.legend.labels.color = textColor;
        }
    }

    updateChartData(timeRange) {
        const dataMap = this.getDataForTimeRange(timeRange);
        
        this.charts.progress.data.datasets[0].data = dataMap.progress;
        this.charts.grades.data.datasets[0].data = dataMap.grades;
        this.charts.time.data.datasets[0].data = dataMap.time;
        
        Object.values(this.charts).forEach(chart => chart.update());
    }

    getDataForTimeRange(timeRange) {
        const dataMap = {
            [TIME_RANGES.WEEK]: {
                progress: [5, 8, 12, 15, 20, 25],
                grades: [85, 92, 78, 88, 95, 82],
                time: [2.5, 3.2, 4.0, 2.8, 3.5, 1.5, 0.8]
            },
            [TIME_RANGES.MONTH]: {
                progress: [18, 25, 40, 52, 65, 78],
                grades: [82, 88, 75, 90, 93, 80],
                time: [12, 15, 18, 14, 16, 8, 5]
            },
            [TIME_RANGES.SEMESTER]: {
                progress: [45, 68, 95, 120, 150, 185],
                grades: [80, 85, 77, 92, 90, 83],
                time: [50, 55, 62, 48, 53, 30, 25]
            }
        };
        
        return dataMap[timeRange] || dataMap[TIME_RANGES.WEEK];
    }
}