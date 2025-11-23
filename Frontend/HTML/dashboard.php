<?php include("../Reusables/head.php"); ?>
<?php include("../Reusables/headBody.php"); ?>

<style>
    /* Alice Blue, Light Yellow, Orange Theme */
    :root {
        --alice-blue: #F0F8FF;
        --light-yellow: #FFFFE0;
        --soft-yellow: #FFF9E6;
        --orange: #FF8C42;
        --dark-orange: #FF6B1A;
        --light-orange: #FFB380;
        --text-dark: #2C3E50;
    }



    /* Stats Cards */
    .card-stats {
        background: linear-gradient(135deg, #FFFFFF 0%, var(--alice-blue) 100%);
        border: none;
        border-radius: 16px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        transition: all 0.3s ease;
        border-left: 4px solid var(--orange);
        overflow: hidden;
        position: relative;
    }

    .card-stats::before {
        content: '';
        position: absolute;
        top: 0;
        right: 0;
        width: 100px;
        height: 100px;
        background: radial-gradient(circle, rgba(255, 140, 66, 0.1) 0%, transparent 70%);
        border-radius: 50%;
        transform: translate(30%, -30%);
    }

    .card-stats:active {
        transform: scale(0.97);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
    }

    .card-stats i {
        font-size: 2.5rem !important;
    }

    .card-stats h5 {
        font-size: 2rem;
        color: var(--text-dark);
        margin: 0.5rem 0;
    }

    .card-stats small {
        font-size: 0.8rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    /* Color variations */
    .card-stats.primary {
        border-left-color: #2196F3;
    }
    .card-stats.primary i {
        color: #2196F3;
    }

    .card-stats.success {
        border-left-color: #4caf50;
    }
    .card-stats.success i {
        color: #4caf50;
    }

    .card-stats.warning {
        border-left-color: var(--orange);
    }
    .card-stats.warning i {
        color: var(--orange);
    }

    .card-stats.secondary {
        border-left-color: #6c757d;
    }
    .card-stats.secondary i {
        color: #6c757d;
    }

    /* Chart Cards */
    .chart-card {
        background: white;
        border: none;
        border-radius: 16px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        padding: 1.5rem !important;
        margin-bottom: 1rem;
    }

    .chart-card canvas {
        max-height: 300px;
    }

    /* Section Heading */
    .section-heading {
        color: var(--text-dark);
        font-weight: 700;
        font-size: 1.2rem;
        margin-bottom: 1rem;
        padding-left: 0.5rem;
        border-left: 4px solid var(--orange);
    }

    /* Responsive Grid */
    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 1rem;
        margin-bottom: 2rem;
    }

    .charts-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1rem;
    }

    /* Mobile Optimizations */
    @media (max-width: 576px) {
        .dashboard-container {
            padding: 0.75rem;
        }

        .card-stats {
            padding: 1rem !important;
        }

        .card-stats h5 {
            font-size: 1.5rem;
        }

        .card-stats i {
            font-size: 2rem !important;
        }

        .card-stats small {
            font-size: 0.7rem;
        }

        .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.75rem;
        }

        .charts-grid {
            grid-template-columns: 1fr;
        }

        .chart-card {
            padding: 1rem !important;
        }

        .chart-card canvas {
            max-height: 250px;
        }

        .section-heading {
            font-size: 1rem;
        }
    }

    /* Loading Animation */
    @keyframes countUp {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .card-stats h5 {
        animation: countUp 0.6s ease-out;
    }

    /* Hover effect for desktop */
    @media (min-width: 768px) {
        .card-stats:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 20px rgba(255, 140, 66, 0.2);
        }
    }
</style>

<div class="dashboard-container">

    <!-- Stats Section -->
    <h4 class="section-heading">📊 Overview</h4>
    <div class="stats-grid">
        <div class="card card-stats primary text-center">
            <i class="ri-todo-fill"></i>
            <h5 class="fw-bold" id="totalTasks">0</h5>
            <small class="text-muted">Total</small>
        </div>
        <div class="card card-stats success text-center">
            <i class="ri-checkbox-circle-fill"></i>
            <h5 class="fw-bold" id="completedTasks">0</h5>
            <small class="text-muted">Done</small>
        </div>
        <div class="card card-stats warning text-center">
            <i class="ri-time-fill"></i>
            <h5 class="fw-bold" id="pendingTasks">0</h5>
            <small class="text-muted">Pending</small>
        </div>
        <div class="card card-stats secondary text-center">
            <i class="ri-archive-fill"></i>
            <h5 class="fw-bold" id="archivedTasks">0</h5>
            <small class="text-muted">Archived</small>
        </div>
    </div>

    <!-- Charts Section -->
    <h4 class="section-heading">📈 Analytics</h4>
    <div class="charts-grid">
        <div class="card chart-card">
            <h6 class="fw-bold mb-3" style="color: var(--text-dark);">
                <i class="ri-pie-chart-2-fill me-2" style="color: var(--orange);"></i>
                Tasks by Category
            </h6>
            <canvas id="categoryChart"></canvas>
        </div>
        <div class="card chart-card">
            <h6 class="fw-bold mb-3" style="color: var(--text-dark);">
                <i class="ri-bar-chart-fill me-2" style="color: var(--orange);"></i>
                Completion Status
            </h6>
            <canvas id="completionChart"></canvas>
        </div>
    </div>

</div>

<!-- Chart.js CDN -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

<script>
document.addEventListener('DOMContentLoaded', function() {
    // Sample task data
    const tasks = [
        {title:"Buy Groceries", category:"Personal", status:"pending", archived: false},
        {title:"Project Report", category:"Work", status:"completed", archived: false},
        {title:"Gym Workout", category:"Health", status:"completed", archived: false},
        {title:"Team Meeting", category:"Work", status:"pending", archived: false},
        {title:"Pay Electricity Bill", category:"Bills", status:"pending", archived: true},
        {title:"Call Parents", category:"Family", status:"completed", archived: false},
        {title:"Backup Laptop Files", category:"Maintenance", status:"pending", archived: false}
    ];

    // Filter out archived tasks for stats and charts
    const activeTasks = tasks.filter(t => !t.archived);

    // Animate count-up effect
    function animateValue(id, end) {
        const element = document.getElementById(id);
        let start = 0;
        const duration = 800;
        const increment = end / (duration / 16);
        
        const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
                element.textContent = end;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(start);
            }
        }, 16);
    }

    // Update stats with animation
    const totalCount = activeTasks.length;
    const completedCount = activeTasks.filter(t => t.status === 'completed').length;
    const pendingCount = activeTasks.filter(t => t.status === 'pending').length;
    const archivedCount = tasks.filter(t => t.archived).length;

    animateValue('totalTasks', totalCount);
    animateValue('completedTasks', completedCount);
    animateValue('pendingTasks', pendingCount);
    animateValue('archivedTasks', archivedCount);

    // Category chart
    const categoryCounts = activeTasks.reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + 1;
        return acc;
    }, {});

    const categoryCtx = document.getElementById('categoryChart').getContext('2d');
    new Chart(categoryCtx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(categoryCounts),
            datasets: [{
                data: Object.values(categoryCounts),
                backgroundColor: [
                    '#FF8C42', // Orange
                    '#4caf50', // Green
                    '#2196F3', // Blue
                    '#ffc107', // Yellow
                    '#9c27b0', // Purple
                    '#ff5722', // Deep Orange
                    '#00bcd4'  // Cyan
                ],
                borderWidth: 3,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { 
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: { size: 12, weight: '600' },
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                title: { display: false }
            }
        }
    });

    // Completion chart
    const completionCtx = document.getElementById('completionChart').getContext('2d');
    new Chart(completionCtx, {
        type: 'bar',
        data: {
            labels: ['✅ Completed', '⏳ Pending'],
            datasets: [{
                label: 'Tasks',
                data: [completedCount, pendingCount],
                backgroundColor: [
                    'rgba(76, 175, 80, 0.8)',
                    'rgba(255, 140, 66, 0.8)'
                ],
                borderColor: [
                    '#4caf50',
                    '#FF8C42'
                ],
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: { 
                legend: { display: false }
            },
            scales: {
                y: { 
                    beginAtZero: true, 
                    ticks: { 
                        stepSize: 1,
                        font: { weight: '600' }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: { display: false },
                    ticks: {
                        font: { size: 13, weight: '600' }
                    }
                }
            }
        }
    });
});
</script>

<?php include("../Reusables/foot.php"); ?>