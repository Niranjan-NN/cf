import axios from 'axios';

const api = import.meta.env.VITE_API_URL;

const axiosInstance = axios.create({
  baseURL: api,
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  res => res,
  async err => {
    const originalRequest = err.config;

    if (
      (err.response?.status === 401 || err.response?.status === 403) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        const response = await axios.post(`${api}/api/refresh-token`, {}, {
          withCredentials: true,
        });

        const newToken = response.data.token;
        localStorage.setItem("token", newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axios(originalRequest);
      } catch{
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    }

    return Promise.reject(err);
  }
);

export default axiosInstance;
