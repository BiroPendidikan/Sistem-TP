// ==================== MODUL MURID PENUH ====================
let muridState = {
  data: [],
  filtered: [],
  currentPage: 1,
  perPage: 10
};

async function loadMurid() {
  const content = document.getElementById('content-area');
  content.innerHTML = `
    <h2 class="text-2xl font-bold mb-4">📋 Senarai Murid</h2>
    <div class="bg-white rounded-xl shadow p-4 md:p-6">
      <!-- Bar Carian & Filter -->
      <div class="flex flex-col sm:flex-row gap-2 mb-6">
        <div class="relative flex-1">
          <i class="fas fa-search absolute left-3 top-3 text-gray-400"></i>
          <input id="search-murid" type="text" placeholder="Cari nama atau No MyKid..." 
                 class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
        </div>
        <select id="filter-tahun" class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
          <option value="">📚 Semua Tahun</option>
          <option value="4">Tahun 4</option>
          <option value="5">Tahun 5</option>
          <option value="6">Tahun 6</option>
        </select>
        <select id="filter-kelas" class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
          <option value="">🏫 Semua Kelas</option>
        </select>
        <button id="btn-tambah-murid" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition">
          <i class="fas fa-plus mr-1"></i> Tambah Murid
        </button>
      </div>

      <!-- Jadual Murid -->
      <div class="overflow-x-auto rounded-lg border">
        <table class="min-w-full table-auto">
          <thead class="bg-gray-100 text-gray-700">
            <tr>
              <th class="px-4 py-3 text-left">Nama</th>
              <th class="px-4 py-3 text-left hidden sm:table-cell">No MyKid</th>
              <th class="px-4 py-3 text-left hidden md:table-cell">Jantina</th>
              <th class="px-4 py-3 text-left">Kelas</th>
              <th class="px-4 py-3 text-left">Tahun</th>
              <th class="px-4 py-3 text-center">Tindakan</th>
            </tr>
          </thead>
          <tbody id="murid-table-body">
            <tr><td colspan="6" class="text-center py-8 text-gray-400">Memuatkan data...</td></tr>
          </tbody>
        </table>
      </div>

      <!-- Paginasi -->
      <div id="pagination" class="flex flex-col sm:flex-row justify-between items-center mt-4 gap-2">
        <span id="page-info" class="text-sm text-gray-600"></span>
        <div class="flex gap-2">
          <button id="prev-page" class="px-4 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed" disabled>⬅ Sebelum</button>
          <button id="next-page" class="px-4 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed" disabled>Seterusnya ➡</button>
        </div>
      </div>
    </div>
  `;

  // Event listeners
  document.getElementById('search-murid').addEventListener('input', applyFilters);
  document.getElementById('filter-tahun').addEventListener('change', applyFilters);
  document.getElementById('filter-kelas').addEventListener('change', applyFilters);
  document.getElementById('btn-tambah-murid').addEventListener('click', showAddMuridModal);
  document.getElementById('prev-page').addEventListener('click', () => changePage(-1));
  document.getElementById('next-page').addEventListener('click', () => changePage(1));

  // Muat data dari API
  try {
    const res = await API.call('getStudents');
    if (res.success) {
      muridState.data = res.data;
      populateKelasFilter();
      applyFilters();
    } else {
      Swal.fire('Ralat', res.message, 'error');
      document.getElementById('murid-table-body').innerHTML = '<tr><td colspan="6" class="text-center py-4 text-red-500">Gagal memuat data</td></tr>';
    }
  } catch (err) {
    Swal.fire('Ralat', 'Gagal menyambung ke pelayan', 'error');
    document.getElementById('murid-table-body').innerHTML = '<tr><td colspan="6" class="text-center py-4 text-red-500">Ralat sambungan</td></tr>';
  }
}

function populateKelasFilter() {
  const kelasSet = [...new Set(muridState.data.map(m => m.kelas).filter(Boolean))].sort();
  const filterKelas = document.getElementById('filter-kelas');
  filterKelas.innerHTML = '<option value="">🏫 Semua Kelas</option>';
  kelasSet.forEach(k => {
    const opt = document.createElement('option');
    opt.value = k;
    opt.textContent = k;
    filterKelas.appendChild(opt);
  });
}

function applyFilters() {
  const search = document.getElementById('search-murid')?.value.toLowerCase() || '';
  const tahun = document.getElementById('filter-tahun')?.value || '';
  const kelas = document.getElementById('filter-kelas')?.value || '';

  muridState.filtered = muridState.data.filter(m => {
    const matchSearch = !search || 
      m.nama.toLowerCase().includes(search) || 
      m.no_mykid.includes(search);
    const matchTahun = !tahun || m.tahun == tahun;
    const matchKelas = !kelas || m.kelas === kelas;
    return matchSearch && matchTahun && matchKelas;
  });

  muridState.currentPage = 1;
  renderTable();
}

function renderTable() {
  const tbody = document.getElementById('murid-table-body');
  const start = (muridState.currentPage - 1) * muridState.perPage;
  const pageData = muridState.filtered.slice(start, start + muridState.perPage);
  
  if (pageData.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-gray-400">Tiada rekod murid</td></tr>';
  } else {
    tbody.innerHTML = pageData.map(m => `
      <tr class="border-b hover:bg-blue-50 transition">
        <td class="px-4 py-3 font-medium">${m.nama}</td>
        <td class="px-4 py-3 hidden sm:table-cell">${m.no_mykid}</td>
        <td class="px-4 py-3 hidden md:table-cell">${m.jantina}</td>
        <td class="px-4 py-3">${m.kelas}</td>
        <td class="px-4 py-3">Tahun ${m.tahun}</td>
        <td class="px-4 py-3 text-center">
          <button onclick="editMurid('${m.id_murid}')" class="text-blue-600 hover:text-blue-800 mr-1" title="Edit">
            <i class="fas fa-edit"></i>
          </button>
          <button onclick="deleteMurid('${m.id_murid}')" class="text-red-500 hover:text-red-700" title="Padam">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `).join('');
  }

  const totalPages = Math.ceil(muridState.filtered.length / muridState.perPage) || 1;
  document.getElementById('page-info').textContent = 
    `Menunjukkan ${muridState.filtered.length} murid | Halaman ${muridState.currentPage} / ${totalPages}`;
  document.getElementById('prev-page').disabled = muridState.currentPage <= 1;
  document.getElementById('next-page').disabled = muridState.currentPage >= totalPages;
}

function changePage(delta) {
  const totalPages = Math.ceil(muridState.filtered.length / muridState.perPage);
  const newPage = muridState.currentPage + delta;
  if (newPage >= 1 && newPage <= totalPages) {
    muridState.currentPage = newPage;
    renderTable();
  }
}

// Fungsi Tambah Murid
function showAddMuridModal() {
  Swal.fire({
    title: '➕ Tambah Murid Baru',
    html: `
      <div class="text-left">
        <label class="block text-sm font-medium mb-1">Nama Penuh</label>
        <input id="swal-nama" class="swal2-input" placeholder="Contoh: Nurul Ain binti Ali" required>
        
        <label class="block text-sm font-medium mb-1 mt-3">No MyKid</label>
        <input id="swal-mykid" class="swal2-input" placeholder="Contoh: 080101-01-0001" required>
        
        <label class="block text-sm font-medium mb-1 mt-3">Jantina</label>
        <select id="swal-jantina" class="swal2-input">
          <option value="">-- Pilih --</option>
          <option value="Lelaki">Lelaki</option>
          <option value="Perempuan">Perempuan</option>
        </select>
        
        <label class="block text-sm font-medium mb-1 mt-3">Kelas</label>
        <input id="swal-kelas" class="swal2-input" placeholder="Contoh: 4A" required>
        
        <label class="block text-sm font-medium mb-1 mt-3">Tahun</label>
        <select id="swal-tahun" class="swal2-input">
          <option value="">-- Pilih --</option>
          <option value="4">Tahun 4</option>
          <option value="5">Tahun 5</option>
          <option value="6">Tahun 6</option>
        </select>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: '💾 Simpan',
    cancelButtonText: 'Batal',
    preConfirm: async () => {
      const nama = document.getElementById('swal-nama').value.trim();
      const no_mykid = document.getElementById('swal-mykid').value.trim();
      const jantina = document.getElementById('swal-jantina').value;
      const kelas = document.getElementById('swal-kelas').value.trim();
      const tahun = document.getElementById('swal-tahun').value;
      
      if (!nama || !no_mykid || !jantina || !kelas || !tahun) {
        Swal.showValidationMessage('Semua ruangan wajib diisi');
        return false;
      }
      
      try {
        const res = await API.call('addStudent', { nama, no_mykid, jantina, kelas, tahun });
        if (res.success) {
          Swal.fire('✅ Berjaya', 'Murid baharu ditambah', 'success');
          loadMurid(); // Muat semula senarai
        } else {
          Swal.fire('❌ Ralat', res.message, 'error');
        }
      } catch (err) {
        Swal.fire('❌ Ralat', 'Gagal menyimpan data', 'error');
      }
      return false; // Elakkan modal tertutup automatik
    }
  });
}

// Fungsi Edit Murid (global)
window.editMurid = async function(id_murid) {
  const murid = muridState.data.find(m => m.id_murid === id_murid);
  if (!murid) return;
  
  const { isConfirmed } = await Swal.fire({
    title: '✏️ Edit Murid',
    html: `
      <div class="text-left">
        <label class="block text-sm font-medium mb-1">Nama Penuh</label>
        <input id="swal-nama" class="swal2-input" value="${murid.nama}" required>
        
        <label class="block text-sm font-medium mb-1 mt-3">No MyKid</label>
        <input id="swal-mykid" class="swal2-input" value="${murid.no_mykid}" required>
        
        <label class="block text-sm font-medium mb-1 mt-3">Jantina</label>
        <select id="swal-jantina" class="swal2-input">
          <option value="Lelaki" ${murid.jantina === 'Lelaki' ? 'selected' : ''}>Lelaki</option>
          <option value="Perempuan" ${murid.jantina === 'Perempuan' ? 'selected' : ''}>Perempuan</option>
        </select>
        
        <label class="block text-sm font-medium mb-1 mt-3">Kelas</label>
        <input id="swal-kelas" class="swal2-input" value="${murid.kelas}" required>
        
        <label class="block text-sm font-medium mb-1 mt-3">Tahun</label>
        <select id="swal-tahun" class="swal2-input">
          <option value="4" ${murid.tahun == 4 ? 'selected' : ''}>Tahun 4</option>
          <option value="5" ${murid.tahun == 5 ? 'selected' : ''}>Tahun 5</option>
          <option value="6" ${murid.tahun == 6 ? 'selected' : ''}>Tahun 6</option>
        </select>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: '💾 Simpan',
    cancelButtonText: 'Batal',
    preConfirm: async () => {
      const nama = document.getElementById('swal-nama').value.trim();
      const no_mykid = document.getElementById('swal-mykid').value.trim();
      const jantina = document.getElementById('swal-jantina').value;
      const kelas = document.getElementById('swal-kelas').value.trim();
      const tahun = document.getElementById('swal-tahun').value;
      
      if (!nama || !no_mykid || !jantina || !kelas || !tahun) {
        Swal.showValidationMessage('Semua ruangan wajib diisi');
        return false;
      }
      
      try {
        const res = await API.call('updateStudent', { id_murid, nama, no_mykid, jantina, kelas, tahun });
        if (res.success) {
          Swal.fire('✅ Berjaya', 'Data murid dikemaskini', 'success');
          loadMurid();
        } else {
          Swal.fire('❌ Ralat', res.message, 'error');
        }
      } catch (err) {
        Swal.fire('❌ Ralat', 'Gagal mengemaskini data', 'error');
      }
      return false;
    }
  });
}

// Fungsi Delete Murid (global)
window.deleteMurid = async function(id_murid) {
  const result = await Swal.fire({
    title: '⚠️ Padam Murid?',
    text: 'Data yang dipadam tidak dapat dikembalikan.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Ya, padam!',
    cancelButtonText: 'Batal'
  });
  
  if (result.isConfirmed) {
    try {
      const res = await API.call('deleteStudent', { id_murid });
      if (res.success) {
        Swal.fire('🗑️ Dipadam!', 'Murid berjaya dipadam.', 'success');
        loadMurid();
      } else {
        Swal.fire('❌ Ralat', res.message, 'error');
      }
    } catch (err) {
      Swal.fire('❌ Ralat', 'Gagal memadam data', 'error');
    }
  }
}
