import { getCurrentUser } from '@/lib/auth-service';
import { account } from '@/lib/appwrite';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

let cachedJwt: { token: string; expiresAt: number } | null = null;

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  try {
    const user = await getCurrentUser();
    if (user) {
      // Obtain verifiable Appwrite JWT from active session
      try {
        if (cachedJwt && cachedJwt.expiresAt > Date.now()) {
          headers['Authorization'] = `Bearer ${cachedJwt.token}`;
          headers['x-appwrite-jwt'] = cachedJwt.token;
        } else {
          const res = await account.createJWT();
          if (res && res.jwt) {
            cachedJwt = { token: res.jwt, expiresAt: Date.now() + 50_000 };
            headers['Authorization'] = `Bearer ${res.jwt}`;
            headers['x-appwrite-jwt'] = res.jwt;
          }
        }
      } catch {
        // In local development or testing mode, pass user ID for dev fallback
        if (import.meta.env.DEV) {
          headers['x-dev-user-id'] = user.$id;
          headers['x-appwrite-user-id'] = user.$id;
        }
      }
    }
  } catch {
    // Graceful fallback if no active session
  }

  return headers;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMsg = 'An error occurred';
    try {
      const errorData = await response.json();
      errorMsg = errorData.error || errorData.message || errorMsg;
    } catch {
      // Ignored
    }
    throw new ApiError(response.status, errorMsg);
  }
  return response.json() as Promise<T>;
}

export const api = {
  get: async <T>(endpoint: string): Promise<T> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers,
    });
    return handleResponse<T>(response);
  },

  post: async <T>(endpoint: string, body: any): Promise<T> => {
    const headers = await getAuthHeaders();
    let requestBody = body;

    if (body instanceof FormData) {
      delete headers['Content-Type'];
    } else {
      requestBody = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: requestBody,
    });
    return handleResponse<T>(response);
  },

  put: async <T>(endpoint: string, body: any): Promise<T> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    });
    return handleResponse<T>(response);
  },

  patch: async <T>(endpoint: string, body: any): Promise<T> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(body),
    });
    return handleResponse<T>(response);
  },

  delete: async <T>(endpoint: string): Promise<T> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers,
    });
    return handleResponse<T>(response);
  },
};
