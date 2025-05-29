// src/api.ts
import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:8080/api" });

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
