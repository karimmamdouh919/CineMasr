// Configure default Axios instance
const api = axios.create({
  baseURL: 'http://localhost:3000', // Hits http://localhost:3000/ seamlessly
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically inject JWT Token if available in localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);