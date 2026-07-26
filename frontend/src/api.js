import axios from "axios";

const API_BASE = "http://127.0.0.1:8000";

export const shortlistCandidates = async (formData, onUploadProgress) => {
  const res = await axios.post(`${API_BASE}/api/v1/shortlist`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress,
  });
  return res.data;
};

export const submitOverride = async (payload) => {
  const res = await axios.post(`${API_BASE}/api/v1/override`, payload);
  return res.data;
};

export const downloadPdfReport = async () => {
  const response = await axios.get(`${API_BASE}/api/v1/report/pdf`, { responseType: "blob" });
  return response.data;
};

export const downloadJsonReport = async () => {
  const response = await axios.get(`${API_BASE}/api/v1/report/json`, { responseType: "blob" });
  return response.data;
};

export const analyzeCandidateResume = async (formData) => {
  const res = await axios.post(`${API_BASE}/api/v1/candidate/analyze`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const getPreviewUrl = (candidateId) => `${API_BASE}/api/v1/resume-preview/${candidateId}`;
export const getDownloadUrl = (candidateId) => `${API_BASE}/api/v1/resume-download/${candidateId}`;
