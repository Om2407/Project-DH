import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://project-1xcrtglyh-decodechn-1922s-projects.vercel.app/api',
  headers: { 'Content-Type': 'application/json' }
});

// Attach JWT token
API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
API.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  me: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/update-profile', data),
  changePassword: (data) => API.put('/auth/change-password', data)
};

// Scores
export const scoresAPI = {
  getMy: () => API.get('/scores/my'),
  add: (data) => API.post('/scores/add', data),
  update: (id, data) => API.put(`/scores/${id}`, data),
  delete: (id) => API.delete(`/scores/${id}`)
};

// Payments (Razorpay)
export const paymentsAPI = {
  createOrder: (plan) => API.post('/payments/create-order', { plan }),
  verify: (data) => API.post('/payments/verify', data),
  createDonation: (data) => API.post('/payments/donate', data),
  history: () => API.get('/payments/history')
};

// Charities
export const charitiesAPI = {
  getAll: (params) => API.get('/charities', { params }),
  getFeatured: () => API.get('/charities/featured'),
  getById: (id) => API.get(`/charities/${id}`),
  create: (data) => API.post('/charities', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => API.put(`/charities/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => API.delete(`/charities/${id}`)
};

// Draws
export const drawsAPI = {
  getAll: () => API.get('/draws'),
  getLatest: () => API.get('/draws/latest'),
  getMyResults: () => API.get('/draws/my-results'),
  simulate: (data) => API.post('/draws/simulate', data),
  publish: (data) => API.post('/draws/publish', data)
};

// Winners
export const winnersAPI = {
  getMy: () => API.get('/winners/my'),
  uploadProof: (id, formData) => API.post(`/winners/${id}/upload-proof`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getAll: (params) => API.get('/winners', { params }),
  verify: (id, data) => API.put(`/winners/${id}/verify`, data),
  markPaid: (id) => API.put(`/winners/${id}/mark-paid`)
};

// Users
export const usersAPI = {
  dashboard: () => API.get('/users/dashboard')
};

// Subscriptions
export const subscriptionsAPI = {
  status: () => API.get('/subscriptions/status'),
  cancel: () => API.put('/subscriptions/cancel')
};

// Admin
export const adminAPI = {
  dashboard: () => API.get('/admin/dashboard'),
  getUsers: (params) => API.get('/admin/users', { params }),
  getUser: (id) => API.get(`/admin/users/${id}`),
  updateUser: (id, data) => API.put(`/admin/users/${id}`, data),
  updateUserScores: (id, data) => API.put(`/admin/users/${id}/scores`, data),
  deleteUser: (id) => API.delete(`/admin/users/${id}`),
  charityReport: () => API.get('/admin/reports/charity')
};

export default API;
// import axios from 'axios';

// const API = axios.create({
//   baseURL: 'http://localhost:5000/api',
//   headers: { 'Content-Type': 'application/json' }
// });

// // Attach JWT token
// API.interceptors.request.use(config => {
//   const token = localStorage.getItem('token');
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

// // Handle 401 globally
// API.interceptors.response.use(
//   res => res,
//   err => {
//     if (err.response?.status === 401) {
//       localStorage.removeItem('token');
//       localStorage.removeItem('user');
//       window.location.href = '/login';
//     }
//     return Promise.reject(err);
//   }
// );

// // Auth
// export const authAPI = {
//   register: (data) => API.post('/auth/register', data),
//   login: (data) => API.post('/auth/login', data),
//   me: () => API.get('/auth/me'),
//   updateProfile: (data) => API.put('/auth/update-profile', data),
//   changePassword: (data) => API.put('/auth/change-password', data)
// };

// // Scores
// export const scoresAPI = {
//   getMy: () => API.get('/scores/my'),
//   add: (data) => API.post('/scores/add', data),
//   update: (id, data) => API.put(`/scores/${id}`, data),
//   delete: (id) => API.delete(`/scores/${id}`)
// };

// // Payments (Razorpay)
// export const paymentsAPI = {
//   createOrder: (plan) => API.post('/payments/create-order', { plan }),
//   verify: (data) => API.post('/payments/verify', data),
//   createDonation: (data) => API.post('/payments/donate', data),
//   history: () => API.get('/payments/history')
// };

// // Charities
// export const charitiesAPI = {
//   getAll: (params) => API.get('/charities', { params }),
//   getFeatured: () => API.get('/charities/featured'),
//   getById: (id) => API.get(`/charities/${id}`),
//   create: (data) => API.post('/charities', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
//   update: (id, data) => API.put(`/charities/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
//   delete: (id) => API.delete(`/charities/${id}`)
// };

// // Draws
// export const drawsAPI = {
//   getAll: () => API.get('/draws'),
//   getLatest: () => API.get('/draws/latest'),
//   getMyResults: () => API.get('/draws/my-results'),
//   simulate: (data) => API.post('/draws/simulate', data),
//   publish: (data) => API.post('/draws/publish', data)
// };

// // Winners
// export const winnersAPI = {
//   getMy: () => API.get('/winners/my'),
//   uploadProof: (id, formData) => API.post(`/winners/${id}/upload-proof`, formData, {
//     headers: { 'Content-Type': 'multipart/form-data' }
//   }),
//   getAll: (params) => API.get('/winners', { params }),
//   verify: (id, data) => API.put(`/winners/${id}/verify`, data),
//   markPaid: (id) => API.put(`/winners/${id}/mark-paid`)
// };

// // Users
// export const usersAPI = {
//   dashboard: () => API.get('/users/dashboard')
// };

// // Subscriptions
// export const subscriptionsAPI = {
//   status: () => API.get('/subscriptions/status'),
//   cancel: () => API.put('/subscriptions/cancel')
// };

// // Admin
// export const adminAPI = {
//   dashboard: () => API.get('/admin/dashboard'),
//   getUsers: (params) => API.get('/admin/users', { params }),
//   getUser: (id) => API.get(`/admin/users/${id}`),
//   updateUser: (id, data) => API.put(`/admin/users/${id}`, data),
//   updateUserScores: (id, data) => API.put(`/admin/users/${id}/scores`, data),
//   deleteUser: (id) => API.delete(`/admin/users/${id}`),
//   charityReport: () => API.get('/admin/reports/charity')
// };

// export default API;
