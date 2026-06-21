import { ParamValue } from "next/dist/server/request/params";
import axios from "axios";

const BASE_URL = "http://localhost:4000/api";

/**
 * A simple helper to call your backend APIs using Axios.
 */
async function apiRequest(endpoint: string, method: string = "GET", data?: any): Promise<any> {
  const url = `${BASE_URL}${endpoint}`;
  
  try {
    const response = await axios({
      url: url,
      method: method,
      data: data, // Axios automatically stringifies this to JSON
      withCredentials: true, // This allows cookies to work (like credentials: "include" in fetch)
      headers:{
        "x-client": "web"
      }
    });
    
    // Axios automatically parses the JSON response into response.data
    return response.data;
  } catch (error: any) {
    // Log the failed request details for easier debugging in the console
    console.error(`[API Error] ${method} ${url}:`, {
      status: error.response?.status,
      data: error.response?.data,
      message: error.response?.data?.message || error.message
    });
    throw new Error(error.response?.data?.message || error.message || "Api Error");
  }
}

// Simple Auth Functions
export const auth = {
  forgotPassword: (email: string) => {
    return apiRequest("/auth/forgot-password", "POST", { email });
  },
  resetPassword: (data: { email: string; otp: string; newPassword: string }) => {
    return apiRequest("/auth/reset-password", "POST", data);
  },
  
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

// Admin Users
export const users = {
  getAll: () => {
    return apiRequest("/admin/users", "GET");
  },
  create: (userData: any) => {
    // Requires admin role in JWT
    return apiRequest("/admin/users", "POST", userData);
  },
  // Milestone 1 Endpoints
  deleteOrgOwner: (data: any) => {
    return apiRequest("/admin/super/org-owner", "DELETE", data);
  },
  createOrgOwner: (userData: any) => {
    return apiRequest("/admin/super/org-owner", "POST", userData);
  },
  assignOrgOwner: (data: { userId: string, organizationId: string }) => {
    return apiRequest("/admin/super/assign-org-owner", "POST", data);
  },
  createOrgUser: (userData: any) => {
    return apiRequest("/admin/org/users", "POST", userData);
  },
  createCampusAdmin: (userData: any) => {
    return apiRequest("/admin/org-owner/create-campus-admin", "POST", userData);
  },
  assignCampusAdmin: (data: { userId: string; campusId: string }) => {
    return apiRequest("/admin/org-owner/assign-campus-admin", "POST", data);
  },
  getCampusAdmins: () => {
    return apiRequest("/admin/org-owner/get-campus-admins", "GET");
  },
  editCampusAdmin: (id: string, userData: any) => {
    return apiRequest(`/admin/org-owner/edit-campus-admin/${id}`, "PATCH", userData);
  },
  deleteCampusAdmin: (id: string) => {
    return apiRequest(`/admin/org-owner/delete-campus-admin/${id}`, "DELETE");
  }
};

// Organizations
export const organizations = {
  getAll: () => {
    return apiRequest("/organizations", "GET");
  },
  getBySlug: (slug: ParamValue) => {
    return apiRequest(`/organizations/${slug}`, "GET");
  },
  create: (data: any) => {
    return apiRequest("/organizations", "POST", data);
  },
  update: (id: string, data: any) => {
    return apiRequest(`/organizations/${id}`, "PUT", data);
  },
  delete: (id: string) => {
    return apiRequest(`/organizations/${id}`, "DELETE");
  }
};

// Campuses
export const campuses = {
  getAll: () => {
    return apiRequest("/campuses", "GET");
  },
  getById: (id: string) => {
    return apiRequest(`/campuses/${id}`, "GET");
  },
  create: (data: any) => {
    return apiRequest("/campuses", "POST", data);
  },
  update: (id: string, data: any) => {
    return apiRequest(`/campuses/${id}`, "PATCH", data);
  },
  delete: (id: string) => {
    return apiRequest(`/campuses/${id}`, "DELETE");
  },
  submitRequest: (data: any) => {
    return apiRequest("/admin/org-owner/campus-requests", "POST", data);
  },
  getOwnerRequests: () => {
    return apiRequest("/admin/org-owner/campus-requests", "GET");
  },
  getSuperRequests: () => {
    return apiRequest("/admin/super/campus-requests", "GET");
  },
  respondToRequest: (id: string, action: 'approve' | 'reject', rejectionReason?: string) => {
    return apiRequest(`/admin/super/campus-requests/${id}/respond`, "POST", { action, rejectionReason });
  }
};


// SOS System
export const sos = {
  getAll: () => {
    return apiRequest("/sos/", "GET");
  },
  getActive: () => {
    return apiRequest("/sos/active", "GET");
  },
  updateStatus: (id: string, status: string, rejectionReason?: string) => {
    return apiRequest(`/sos/${id}/status`, "PATCH", { status, rejectionReason });
  },
  getById: (id: string) => {
    return apiRequest(`/sos/${id}`, "GET");
  },
  assignGuard: (sosId: string, guardId: string) => {
    return apiRequest("/sos/assign", "POST", { sosId, guardId });
  }
};

// Incidents (We just added an admin global getAllIncidents route!)
export const incidents = {
  getAll: (type?: string) => {
    return apiRequest(`/incidents${type ? `?type=${type}` : ''}`, "GET");
  },
  getMyIncidents: () => {
    return apiRequest("/incidents/myIncidents", "GET");
  },
  getById: (id: string) => {
    return apiRequest(`/incidents/${id}`, "GET");
  },
  getAssignmentResponses: () => {
    return apiRequest(`/incidents/assignment-responses`, "GET");
  },
  updateStatus: (incidentId: string, status: string, rejectionReason?: string) => {
    return apiRequest("/incidents/update-status", "POST", { incidentId, status, rejectionReason });
  }
};

// Emergency Contacts (Admin management)
export const emergencyContacts = {
  getAll: () => {
    return apiRequest("/emergency-contacts", "GET");
  },
  create: (data: any) => {
    return apiRequest("/emergency-contacts", "POST", data);
  },
  update: (id: string, data: any) => {
    return apiRequest(`/emergency-contacts/${id}`, "PUT", data);
  },
  delete: (id: string) => {
    return apiRequest(`/emergency-contacts/${id}`, "DELETE");
  }
};

// Security Personnel Management
export const securityGuards = {
  getAll: () => {
    return apiRequest("/admin/security-personnel", "GET");
  },
};

// Incident Assignment
export const incidentAssignment = {
  assign: (incidentId: string, guardId: string) => {
    return apiRequest("/incidents/assign", "POST", { incidentId, guardId });
  },
};

// Landing Page Leads
export const landing = {
  submitContact: (data: { name: string; email: string; institution: string; message: string }) => {
    return apiRequest("/landing/contact", "POST", data);
  }
};

// Security Incharge Dashboard Data
export const securityIncharge = {
  getDashboard: () => {
    return apiRequest("/admin/security-incharge-dashboard", "GET");
  }
};

