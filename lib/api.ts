const BASE_URL = "http://localhost:4000/api";

/**
 * A simple helper to call your backend APIs.
 * <T> is a generic. It tells TypeScript: "Whatever the 'type' of data we get back is, use that."
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

  // If we have data (like login info), add it to the body
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
    return apiRequest("/auth/login", "POST", credentials);
  },
  
  logout: () => {
    return apiRequest("/auth/logout", "POST");
  },
  
  getProfile: () => {
    return apiRequest("/auth/profile", "GET");
  }
};
