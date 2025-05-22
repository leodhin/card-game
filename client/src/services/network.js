import axios from 'axios';
import useSessionStore from '../stores/sessionStore';

// Base URL for your API
const BASE_URL = `${import.meta.env.VITE_SERVER_URL}/api/`;

// Axios instance with default configuration
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor to add the Authorization token
axiosInstance.interceptors.request.use(
  (config) => {
    // Retrieve the token from the Zustand store using its getter
    const token = useSessionStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Function to handle Axios errors
const handleAxiosError = (error) => {
  if (error.response?.status === 401 || error.response?.status === 403) {
    console.error('Unauthorized access - redirecting to login');
    useSessionStore.getState().logout();
    // Redirect to the login page
    window.location.href = '/login';
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error('Error:', error.message);
  }
};

// Generic request function
const request = async (method, url, body) => {
  try {
    const response = await axiosInstance.request({
      method,
      url,
      data: body,
    });

    // Simulating delay in development mode
    if (process.env.NODE_ENV === 'development') {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    return response.data;
  } catch (error) {
    console.log('Error in request:', error);
    handleAxiosError(error);
    throw error;
  }
};

// Functions to make GET, POST, PUT, and DELETE requests
export const get = (url) => request('get', url);
export const post = (url, body) => request('post', url, body);
export const put = (url, body) => request('put', url, body);
export const del = (url) => request('delete', url);

// Function to make multipart POST requests
export const postMultipart = async (url, body) => {
  try {
    const response = await axiosInstance.post(url, body, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    handleAxiosError(error);
    throw error;
  }
};

// Function to make multipart PUT requests
export const putMultipart = async (url, body) => {
  try {
    const response = await axiosInstance.put(url, body, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    handleAxiosError(error);
    throw error;
  }
};