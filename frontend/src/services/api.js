import axios from "axios";

export const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || "http://localhost:4000",
  timeout: 10000,
  headers: { "Content-Type": "application/json" }
});

export async function solveProblem(payload) {
  const res = await api.post("/api/math/solve", payload);
  return res.data;
}

export async function previewTemplate(payload) {
  const res = await api.post("/api/templates/preview", payload);
  return res.data;
}

export async function createTemplate(payload) {
  const res = await api.post("/api/templates", payload);
  return res.data;
}

export async function getStudentTemplate(templateId) {
  const res = await api.get(`/api/templates/${templateId}/student`);
  return res.data;
}

export async function submitTemplateAnswers(templateId, payload) {
  const res = await api.post(`/api/templates/${templateId}/submit`, payload);
  return res.data;
}
