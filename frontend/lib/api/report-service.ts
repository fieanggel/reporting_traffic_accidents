export type AccidentReportPayload = {
  reporterName: string;
  location: string;
  description: string;
  occurredAt: string;
  latitude: number;
  longitude: number;
  photoUrl?: string;
};

type SimulatedReportRecord = {
  reportId: string;
  storedAt: string;
  payload: AccidentReportPayload;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000/api";
const SIMULATED_STORAGE_KEY = "simulated-rds-reports";

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function createAccidentReport(payload: AccidentReportPayload) {
  const response = await fetch(`${API_BASE_URL}/reports`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Gagal mengirim laporan kecelakaan.");
  }

  return response.json();
}

export async function simulateReportInsertToRds(
  payload: AccidentReportPayload,
) {
  await wait(900);

  const reportId = `RPT-${Date.now().toString().slice(-8)}`;
  const storedAt = new Date().toISOString();
  const record: SimulatedReportRecord = {
    reportId,
    storedAt,
    payload,
  };

  if (typeof window !== "undefined") {
    try {
      const previousRaw = localStorage.getItem(SIMULATED_STORAGE_KEY);
      const previous = previousRaw
        ? (JSON.parse(previousRaw) as SimulatedReportRecord[])
        : [];

      previous.unshift(record);
      localStorage.setItem(
        SIMULATED_STORAGE_KEY,
        JSON.stringify(previous.slice(0, 40)),
      );
    } catch {
      // Ignore localStorage errors in private browsing modes.
    }
  }

  return {
    reportId,
    storedAt,
  };
}
