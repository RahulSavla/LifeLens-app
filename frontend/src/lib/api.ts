/**
 * API client for the Healthcare Risk Prediction backend.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

function extractErrorMessage(body: any, fallback: string): string {
  if (!body) return fallback;
  const detail = body.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((d: any) => (typeof d === "string" ? d : d?.msg || JSON.stringify(d)))
      .join("; ");
  }
  return fallback;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...options.headers as Record<string, string> },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(extractErrorMessage(body, `Request failed: ${res.status}`));
  }
  return res.json();
}

// ── Data endpoints ──────────────────────────────────────────────────────────

export async function generateData(numRecords: number = 1500, seed: number = 42) {
  return request("/generate-data", {
    method: "POST",
    body: JSON.stringify({ num_records: numRecords, seed }),
  });
}

export async function uploadCSV(file: File) {
  const form = new FormData();
  form.append("file", file);
  const url = `${API_BASE}/upload-csv`;
  const res = await fetch(url, { method: "POST", body: form });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(extractErrorMessage(body, "Upload failed"));
  }
  return res.json();
}

export async function previewData(rows: number = 20) {
  return request(`/data/preview?rows=${rows}`);
}

// ── Model endpoints ─────────────────────────────────────────────────────────

export async function trainModels(testSize: number = 0.2) {
  return request("/train-models", {
    method: "POST",
    body: JSON.stringify({ test_size: testSize, random_state: 42 }),
  });
}

export async function getMetrics() {
  return request("/metrics");
}

export async function getFeatureImportance() {
  return request("/feature-importance");
}

export async function getTreeVisualization() {
  return request<{ tree_text: string; tree_structure: any }>("/tree-visualization");
}

// ── Prediction endpoints ────────────────────────────────────────────────────

export interface PatientInput {
  age: number;
  gender: string;
  bmi: number;
  blood_pressure: number;
  cholesterol_level: number;
  glucose_level: number;
  smoking_habit: boolean;
  physical_activity_level: string;
  family_medical_history: boolean;
  previous_hospital_visits: number;
}

export async function predict(patient: PatientInput) {
  return request("/predict", {
    method: "POST",
    body: JSON.stringify(patient),
  });
}

export async function predictAndReport(patient: PatientInput): Promise<Blob> {
  const url = `${API_BASE}/predict/report`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patient),
  });
  if (!res.ok) throw new Error("Report generation failed");
  return res.blob();
}

// ── Cluster endpoints ───────────────────────────────────────────────────────

export async function getClusters() {
  return request("/clusters");
}

// ── Health ───────────────────────────────────────────────────────────────────

export async function healthCheck() {
  const url = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + "/health";
  const res = await fetch(url);
  return res.json();
}
