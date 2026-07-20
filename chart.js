// chart.js
function renderDashboardCharts(stats) {
  const ctx = document.getElementById('pieChart').getContext('2d');
  new Chart(ctx, { type: 'pie', data: { ... } });
  // Semua carta lain
}