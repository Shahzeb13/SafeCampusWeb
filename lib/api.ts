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
  getAll: () => {
    return apiRequest<any>("/admin/users", "GET");
  },
  create: (userData: any) => {
    // Requires admin role in JWT
    return apiRequest<any>("/admin/users", "POST", userData);
  }
};

// Organizations
export const organizations = {
  getAll: () => {
    return apiRequest<any>("/organizations", "GET");
  },
  getBySlug: (slug: string) => {
    return apiRequest<any>(`/organizations/${slug}`, "GET");
  },
  create: (data: any) => {
    return apiRequest<any>("/organizations", "POST", data);
  },
  update: (id: string, data: any) => {
    return apiRequest<any>(`/organizations/${id}`, "PUT", data);
  },
  delete: (id: string) => {
    return apiRequest<any>(`/organizations/${id}`, "DELETE");
  }
};

// Campuses
export const campuses = {
  getAll: () => {
    return apiRequest<any>("/campuses", "GET");
  },
  getById: (id: string) => {
    return apiRequest<any>(`/campuses/${id}`, "GET");
  },
  create: (data: any) => {
    return apiRequest<any>("/campuses", "POST", data);
  },
  update: (id: string, data: any) => {
    return apiRequest<any>(`/campuses/${id}`, "PATCH", data);
  },
  delete: (id: string) => {
    return apiRequest<any>(`/campuses/${id}`, "DELETE");
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
  updateStatus: (id: string, status: string, rejectionReason?: string) => {
    return apiRequest<any>(`/sos/${id}/status`, "PATCH", { status, rejectionReason });
  },
  getById: (id: string) => {
    return apiRequest<any>(`/sos/${id}`, "GET");
  },
  assignGuard: (sosId: string, guardId: string) => {
    return apiRequest<any>("/sos/assign", "POST", { sosId, guardId });
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
  },
  updateStatus: (incidentId: string, status: string, rejectionReason?: string) => {
    return apiRequest<any>("/incidents/update-status", "POST", { incidentId, status, rejectionReason });
  }
};

// Emergency Contacts (Admin management)
export const emergencyContacts = {
  getAll: () => {
    return apiRequest<any>("/emergency-contacts", "GET");
  },
  create: (data: any) => {
    return apiRequest<any>("/emergency-contacts", "POST", data);
  },
  update: (id: string, data: any) => {
    return apiRequest<any>(`/emergency-contacts/${id}`, "PUT", data);
  },
  delete: (id: string) => {
    return apiRequest<any>(`/emergency-contacts/${id}`, "DELETE");
  }
};

// Security Personnel Management
export const securityGuards = {
  getAll: () => {
    return apiRequest<any>("/admin/security-personnel", "GET");
  },
};

// Incident Assignment
export const incidentAssignment = {
  assign: (incidentId: string, guardId: string) => {
    return apiRequest<any>("/incidents/assign", "POST", { incidentId, guardId });
  },
};

// Landing Page Leads
export const landing = {
  submitContact: (data: { name: string; email: string; institution: string; message: string }) => {
    return apiRequest<any>("/landing/contact", "POST", data);
  }
};
