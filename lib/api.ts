const BASE_URL = "http://localhost:4000/api";

/**
 * A simple helper to call your backend APIs.
 */
async function apiRequest<T>(endpoint: string, method: string = "GET", data?: any): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  
  const options: RequestInit = {
    method: method,
    headers: {
      "Content-Type": "application/json",
    },
    // This allows cookies to work
    credentials: "include",
  };

  // If we have data, add it to the body
  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Api Error");
  }

  return result as T;
}

// Simple Auth Functions
export const auth = {
  login: (credentials: any) => {
    return apiRequest<any>("/auth/login", "POST", credentials);
  },
  
  logout: () => {
    return apiRequest<any>("/auth/logout", "POST");
  },
  
  getProfile: () => {
    return apiRequest<any>("/auth/profile", "GET");
  }
};

// Admin Users
export const users = {
  create: (userData: any) => {
    // Requires admin role in JWT
    return apiRequest<any>("/admin/users", "POST", userData);
  }
};

// SOS System
export const sos = {
  getAll: () => {
    return apiRequest<any>("/sos/", "GET");
  },
  getActive: () => {
    return apiRequest<any>("/sos/active", "GET");
  },
  updateStatus: (id: string, status: string) => {
    return apiRequest<any>(`/sos/${id}/status`, "PATCH", { status });
  },
  getById: (id: string) => {
    return apiRequest<any>(`/sos/${id}`, "GET");
  }
};

// Incidents (We just added an admin global getAllIncidents route!)
export const incidents = {
  getAll: (type?: string) => {
    return apiRequest<any>(`/incidents${type ? `?type=${type}` : ''}`, "GET");
  },
  getMyIncidents: () => {
    return apiRequest<any>("/incidents/myIncidents", "GET");
  },
  getById: (id: string) => {
    return apiRequest<any>(`/incidents/${id}`, "GET");
  }
};
