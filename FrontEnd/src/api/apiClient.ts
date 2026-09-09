import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? 'http://localhost:8080' : '');

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && error.config?.url?.includes('/users/me')) {
            localStorage.removeItem('authToken');
        }
        return Promise.reject(error);
    }
);

const FASTAPI_BASE_URL = import.meta.env.VITE_FASTAPI_URL ?? (import.meta.env.DEV ? 'http://localhost:8000' : '');

export const fastApiClient = axios.create({
    baseURL: FASTAPI_BASE_URL,
    withCredentials: false,
});

