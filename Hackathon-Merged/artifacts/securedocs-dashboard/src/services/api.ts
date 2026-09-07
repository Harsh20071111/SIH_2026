let rawBase = import.meta.env.VITE_API_URL || "/api";
rawBase = rawBase.replace(/\/+$/, "");
if (rawBase.startsWith("http") && !rawBase.endsWith("/api")) {
  rawBase = `${rawBase}/api`;
}
const API_BASE_URL = rawBase;

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMsg = `Request failed (${response.status})`;
    try {
      const errorData = await response.json();
      errorMsg = errorData.error || errorData.message || errorMsg;
    } catch {
      if (response.status === 404) {
        errorMsg = "Backend endpoint not found (404). Please verify your backend is running.";
      } else if (response.status === 502 || response.status === 503) {
        errorMsg = "Backend server is starting up. Please wait 30 seconds and retry.";
      } else if (response.status === 401) {
        errorMsg = "Invalid email/employee ID or password.";
      }
    }
    throw new ApiError(response.status, errorMsg);
  }
  return response.json() as Promise<T>;
}

export const api = {
  get: async <T>(endpoint: string, token?: string | null): Promise<T> => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    const authToken = token !== undefined ? token : localStorage.getItem('securedocs_token');
    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "GET",
      headers,
    });
    return handleResponse<T>(response);
  },

  post: async <T>(endpoint: string, body: any, token?: string | null): Promise<T> => {
    const headers: Record<string, string> = {};
    const authToken = token !== undefined ? token : localStorage.getItem('securedocs_token');
    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }

    let requestBody = body;

    // Handle FormData vs JSON
    if (body instanceof FormData) {
      // Browser automatically sets correct Content-Type with boundary for FormData
    } else {
      headers["Content-Type"] = "application/json";
      requestBody = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers,
      body: requestBody,
    });
    return handleResponse<T>(response);
  },

  patch: async <T>(endpoint: string, body: any, token?: string | null): Promise<T> => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    const authToken = token !== undefined ? token : localStorage.getItem('securedocs_token');
    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(body),
    });
    return handleResponse<T>(response);
  },

  delete: async <T>(endpoint: string, token?: string | null): Promise<T> => {
    const headers: Record<string, string> = {};
    const authToken = token !== undefined ? token : localStorage.getItem('securedocs_token');
    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "DELETE",
      headers,
    });
    return handleResponse<T>(response);
  },
};
