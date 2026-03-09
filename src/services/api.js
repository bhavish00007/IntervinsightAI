import axios from "axios";

const BASE = "http://localhost:5001/api";

// Auth API
const authAPI = axios.create({
  baseURL: `${BASE}/auth`,
});

// Interview API
const interviewAPI = axios.create({
  baseURL: `${BASE}/interview`,
});

// Attach JWT token to interview requests
interviewAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const loginUser = (data) => authAPI.post("/login", data);
export const signupUser = (data) => authAPI.post("/signup", data);

// Interview
export const generateQuestion = (data) => interviewAPI.post("/generate", data);
export const submitAnswer = (data) => interviewAPI.post("/generate", data);
export const getSkillReport = (data) => interviewAPI.post("/skill-report", data);
export const saveInterview = (data) => interviewAPI.post("/saveInterview", data);
export const getHistory = () => interviewAPI.get("/history");

// Live Interview API
const liveAPI = axios.create({
  baseURL: `${BASE}/live`,
});

liveAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const startLiveInterview = (data) => liveAPI.post("/start", data);
export const sendLiveAnswer = (data) => liveAPI.post("/next", data);
export const finishLiveInterview = (data) => liveAPI.post("/finish", data);
export const getLiveHistory = () => liveAPI.get("/history");