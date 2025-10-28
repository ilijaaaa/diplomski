import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor za dodavanje JWT tokena
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor za refresh tokena
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/token/refresh/`, {
            refresh: refreshToken,
          });
          
          localStorage.setItem('access_token', response.data.access);
          apiClient.defaults.headers.common.Authorization = `Bearer ${response.data.access}`;
          
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export const authService = {
  // Registracija sudije
  registerSudija: (data) =>
    apiClient.post('/auth/register_sudija/', data),
  
  // Registracija organizatora
  registerOrganizator: (data) =>
    apiClient.post('/auth/register_organizator/', data),
  
  // Prijavljivanje
  login: (username, password) =>
    apiClient.post('/auth/login/', { username, password }),
  
  // Dobijanje korisnika
  getMe: () =>
    apiClient.get('/auth/me/'),
  
  // Ažuriranje profila
  updateProfile: (data) =>
    apiClient.put('/auth/update_profil/', data),
  
  // Logout
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
};

export const organizatorService = {
  // Dodavanje učesnika
  dodajUcesnika: (data) =>
    apiClient.post('/organizator/dodaj_ucesnika/', data),
  
  // Lista duosa
  listaduosa: () =>
    apiClient.get('/organizator/lista_duosa/'),
  
  // Lista grupa
  listaGrupa: () =>
    apiClient.get('/organizator/lista_grupa/'),
  
  // Kreiranje dua
  kreirajDuo: (data) =>
    apiClient.post('/organizator/kreiraj_duo/', data),
  
  // Kreiranje grupe
  kreirajGrupu: (data) =>
    apiClient.post('/organizator/kreiraj_grupu/', data),
  
  // Lista učesnika
  listaUcesnika: () =>
    apiClient.get('/organizator/lista_ucesnika/'),
};

export default apiClient;
