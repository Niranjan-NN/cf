import axios from 'axios';

const api = import.meta.env.VITE_API_URL;

const adminAxiosInstance = axios.create({
  baseURL: api,
  withCredentials: true,
});

adminAxiosInstance.interceptors.response.use(
  res => res,
  async err => {
    const originalRequest = err.config;

    if (
      err.response?.status === 403 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        const response = await axios.post(`${api}/api/admin-refresh-token`, {}, {
          withCredentials: true,
        });

        const newToken = response.data.token;
        localStorage.setItem("adminToken", newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axios(originalRequest);
      } catch{
        localStorage.removeItem("adminToken");
        window.location.href = "/adminloginpage";
      }
    }

    return Promise.reject(err);
  }
);

export default adminAxiosInstance;
