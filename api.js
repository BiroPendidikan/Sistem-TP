// api.js
const API = {
  token: localStorage.getItem('token') || null,
  user: JSON.parse(localStorage.getItem('user') || 'null'),

  async call(action, data = {}) {
    const params = new URLSearchParams({ action, ...data });
    if (this.token) params.append('token', this.token);
    const res = await fetch(CONFIG.API_URL + '?' + params.toString(), { method: 'GET' });
    const json = await res.json();
    if (!json.success && json.message.includes('Sesi tamat')) {
      this.logout();
      throw new Error(json.message);
    }
    return json;
  },

  async login(username, password) {
    const res = await this.call('login', { username, password });
    if (res.success) {
      this.token = res.token;
      this.user = res.user;
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
    }
    return res;
  },

  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
  },

  // Fungsi pembantu
  getDashboardStats: () => API.call('getDashboardStats'),
  getStudents: (filter = {}) => API.call('getStudents', filter),
  addStudent: (data) => API.call('addStudent', data),
  updateStudent: (data) => API.call('updateStudent', data),
  deleteStudent: (id_murid) => API.call('deleteStudent', { id_murid }),
  getTP: (filter = {}) => API.call('getTP', filter),
  saveTP: (data) => API.call('saveTP', data),
  getUnits: (filter = {}) => API.call('getUnits', filter),
  getAnalysis: (filter = {}) => API.call('getAnalysis', filter)
};