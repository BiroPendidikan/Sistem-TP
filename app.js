// app.js
document.addEventListener('DOMContentLoaded', () => {
  const loginPage = document.getElementById('login-page');
  const mainApp = document.getElementById('main-app');

  // Jika sudah ada sesi, terus ke dashboard
  if (API.token) {
    showMainApp();
  }

  document.getElementById('login-btn').addEventListener('click', async () => {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    if (!username || !password) {
      Swal.fire('Ralat', 'Sila isi username dan password', 'warning');
      return;
    }
    try {
      const res = await API.login(username, password);
      if (res.success) {
        Swal.fire('Berjaya', 'Log masuk berjaya!', 'success');
        showMainApp();
      } else {
        Swal.fire('Gagal', res.message, 'error');
      }
    } catch (error) {
      Swal.fire('Ralat', 'Tidak dapat menyambung ke pelayan. Semak sambungan internet.', 'error');
      console.error(error);
    }
  });

  function showMainApp() {
    loginPage.classList.add('hidden');
    mainApp.classList.remove('hidden');
    renderLayout();
    loadDashboard();
  }

  function renderLayout() {
    mainApp.innerHTML = `
      <nav class="bg-white/80 backdrop-blur-md shadow-lg p-4 flex justify-between items-center dark:bg-gray-800">
        <h1 class="text-xl font-bold text-gray-800 dark:text-white">${CONFIG.APP_NAME}</h1>
        <div class="flex items-center gap-4">
          <span class="text-sm text-gray-600 dark:text-gray-300">${API.user.nama} (${API.user.role})</span>
          <button id="logout-btn" class="text-red-500"><i class="fas fa-sign-out-alt"></i></button>
        </div>
      </nav>
      <div class="flex flex-col md:flex-row">
        <aside class="w-full md:w-64 bg-white/50 dark:bg-gray-700 p-4 space-y-2">
          <a href="#" class="nav-link block p-2 rounded hover:bg-blue-100" data-page="dashboard"><i class="fas fa-tachometer-alt mr-2"></i>Dashboard</a>
          <a href="#" class="nav-link block p-2 rounded hover:bg-blue-100" data-page="murid"><i class="fas fa-users mr-2"></i>Murid</a>
          <a href="#" class="nav-link block p-2 rounded hover:bg-blue-100" data-page="tp"><i class="fas fa-clipboard-check mr-2"></i>Kemaskini TP</a>
          <a href="#" class="nav-link block p-2 rounded hover:bg-blue-100" data-page="analisis"><i class="fas fa-chart-pie mr-2"></i>Analisis</a>
          <a href="#" class="nav-link block p-2 rounded hover:bg-blue-100" data-page="laporan"><i class="fas fa-file-alt mr-2"></i>Laporan</a>
          <a href="#" class="nav-link block p-2 rounded hover:bg-blue-100" data-page="tetapan"><i class="fas fa-cog mr-2"></i>Tetapan</a>
        </aside>
        <main id="content-area" class="flex-1 p-4 md:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
          <!-- Kandungan halaman akan dimuatkan di sini -->
        </main>
      </div>
    `;
    document.getElementById('logout-btn').addEventListener('click', API.logout);
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = link.dataset.page;
        navigateTo(page);
      });
    });
  }

  function navigateTo(page) {
    const content = document.getElementById('content-area');
    switch(page) {
      case 'dashboard': loadDashboard(); break;
      case 'murid': loadMurid(); break;
      case 'tp': loadTPPage(); break;
      case 'analisis': loadAnalisis(); break;
      case 'laporan': loadLaporan(); break;
      case 'tetapan': loadTetapan(); break;
      default: loadDashboard();
    }
  }

  // ========== DEFINISI FUNGSI HALAMAN ==========
  async function loadDashboard() {
    const content = document.getElementById('content-area');
    content.innerHTML = `<h2 class="text-2xl font-bold mb-4">Dashboard</h2><p>Memuatkan...</p>`;
    try {
      const res = await API.getDashboardStats();
      const stats = res.stats;
      content.innerHTML = `
        <h2 class="text-2xl font-bold mb-4">Dashboard</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div class="bg-white p-4 rounded-xl shadow"><p class="text-gray-500">Jumlah Murid</p><h3 class="text-3xl font-bold">${stats.totalMurid}</h3></div>
          <div class="bg-white p-4 rounded-xl shadow"><p class="text-gray-500">Tahun 4</p><h3 class="text-2xl">${stats.tahun4}</h3></div>
          <div class="bg-white p-4 rounded-xl shadow"><p class="text-gray-500">Tahun 5</p><h3 class="text-2xl">${stats.tahun5}</h3></div>
          <div class="bg-white p-4 rounded-xl shadow"><p class="text-gray-500">Tahun 6</p><h3 class="text-2xl">${stats.tahun6}</h3></div>
          <div class="bg-white p-4 rounded-xl shadow"><p class="text-gray-500">Lelaki</p><h3 class="text-2xl">${stats.lelaki}</h3></div>
          <div class="bg-white p-4 rounded-xl shadow"><p class="text-gray-500">Perempuan</p><h3 class="text-2xl">${stats.perempuan}</h3></div>
          <div class="bg-white p-4 rounded-xl shadow"><p class="text-gray-500">Purata TP Keseluruhan</p><h3 class="text-2xl">${stats.avgTP}</h3></div>
          <div class="bg-white p-4 rounded-xl shadow"><p class="text-gray-500">Kemaskini Terakhir</p><h3 class="text-sm">${stats.lastUpdate || '-'}</h3><p class="text-xs text-gray-400">${stats.lastDate || '-'}</p></div>
        </div>
        <p class="text-gray-500">Carta akan ditambah kemudian.</p>
      `;
    } catch (err) {
      content.innerHTML = `<p class="text-red-500">Gagal memuat dashboard: ${err.message}</p>`;
    }
  }

  function loadMurid() {
    const content = document.getElementById('content-area');
    content.innerHTML = `
      <h2 class="text-2xl font-bold mb-4">Senarai Murid</h2>
      <div class="bg-white p-4 rounded-xl shadow">
        <p class="text-gray-500">Fungsi carian dan senarai murid akan datang.</p>
        <button class="mt-2 bg-blue-500 text-white px-4 py-2 rounded" onclick="alert('Fungsi tambah murid belum tersedia')">Tambah Murid</button>
      </div>
    `;
  }

  function loadTPPage() {
    const content = document.getElementById('content-area');
    content.innerHTML = `
      <h2 class="text-2xl font-bold mb-4">Kemaskini Tahap Penguasaan</h2>
      <div class="bg-white p-4 rounded-xl shadow">
        <p class="text-gray-500">Antara muka kemaskini TP akan datang.</p>
      </div>
    `;
  }

  function loadAnalisis() {
    const content = document.getElementById('content-area');
    content.innerHTML = `
      <h2 class="text-2xl font-bold mb-4">Analisis</h2>
      <div class="bg-white p-4 rounded-xl shadow">
        <p class="text-gray-500">Carta dan analisis terperinci akan dipaparkan di sini.</p>
      </div>
    `;
  }

  function loadLaporan() {
    const content = document.getElementById('content-area');
    content.innerHTML = `
      <h2 class="text-2xl font-bold mb-4">Laporan</h2>
      <div class="bg-white p-4 rounded-xl shadow">
        <p class="text-gray-500">Penjanaan laporan PDF/Excel akan datang.</p>
      </div>
    `;
  }

  function loadTetapan() {
    const content = document.getElementById('content-area');
    content.innerHTML = `
      <h2 class="text-2xl font-bold mb-4">Tetapan</h2>
      <div class="bg-white p-4 rounded-xl shadow">
        <p class="text-gray-500">Konfigurasi nama sekolah, logo, dan tema akan datang.</p>
      </div>
    `;
  }
});
