import axios from "axios";

const SESSION_STORAGE_KEY = "debugmind_session_id";

export const getSessionId = () => {
  try {
    let sid = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!sid || typeof sid !== "string" || !/^[a-zA-Z0-9_-]{10,100}$/.test(sid)) {
      const randomPart =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID().replace(/-/g, "")
          : Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
      sid = `sess_${randomPart}`.slice(0, 48);
      localStorage.setItem(SESSION_STORAGE_KEY, sid);
    }
    return sid;
  } catch (_) {
    return "sess_default_fallback_session_id";
  }
};

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1")
    ? "http://localhost:5000"
    : "https://debugmind-backend.onrender.com");

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 35000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically inject session ID in headers for all requests
api.interceptors.request.use((config) => {
  const sid = getSessionId();
  if (sid) {
    config.headers["x-session-id"] = sid;
  }
  return config;
});

export const analyzeCode = async ({ language, code, error, userPrompt }) => {
  const sessionId = getSessionId();
  const response = await api.post("/api/bugs/analyze", {
    sessionId,
    language,
    code,
    error,
    userPrompt,
  });
  return response.data;
};

export const fetchHistory = async (limit = 25) => {
  const sessionId = getSessionId();
  const response = await api.get(
    `/api/bugs/history?sessionId=${encodeURIComponent(sessionId)}&limit=${limit}`
  );
  return response.data;
};

export const fetchHistoryItem = async (id) => {
  const sessionId = getSessionId();
  const response = await api.get(
    `/api/bugs/history/${id}?sessionId=${encodeURIComponent(sessionId)}`
  );
  return response.data;
};

export default api;
