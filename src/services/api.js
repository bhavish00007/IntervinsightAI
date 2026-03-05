import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5001"
});

export const generateQuestion = (data) => API.post("/generate", data);
export const saveInterview = (data) => API.post("/saveInterview", data);
export const getHistory = () => API.get("/history");