// src/utils/authService.ts

export const getAuthToken = (): string | null => {
  return sessionStorage.getItem("authToken");
};

export const setAuthToken = (token: string) => {
  sessionStorage.setItem("authToken", token);
};

export const removeAuthToken = () => {
  sessionStorage.removeItem("authToken");
};

export const apiCall = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`http://localhost:4000${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    removeAuthToken();
    window.location.href = "/login";
  }

  return response;
};

export const getCurrentUser = async () => {
  try {
    const response = await apiCall("/api/auth/me");
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error("Error fetching current user:", error);
    return null;
  }
};
