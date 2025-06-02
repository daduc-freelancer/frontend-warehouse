// src/api.ts
import axios from "axios";

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  withCredentials: true,
});

// ✅ Interceptor bắt lỗi 401 chung
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = "/login"; // dùng window.location vì ở ngoài React component
    }
    return Promise.reject(error);
  }
);
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

//api mượn
export const fetchMuonData = async () => {
  const res = await API.get("/muon");
  return res.data.data;
};

// api trả
export const fetchTraData = async () => {
  const res = await API.get("/tra");
  return res.data.data;
};

// api lấy danh sách người dùng từ Google Sheets
export const fetchUsers = async () => {
  const res = await API.get("/users");
  return res.data.data; // [{ email: 'abc@gmail.com', name: 'Nguyễn Văn A' }, ...]
};
