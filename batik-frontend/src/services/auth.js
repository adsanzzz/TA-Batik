const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const login = async (username, password) => {
  const formData = new URLSearchParams();
  formData.append("username", username);
  formData.append("password", password);

  const res = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Login gagal");
  }

  const data = await res.json();
  localStorage.setItem("token", data.access_token);
  localStorage.setItem("role", data.role);
  return data;
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  window.location.href = "/login";
};

export const getRole = () => {
  return localStorage.getItem("role");
};

export const getToken = () => {
  return localStorage.getItem("token");
};

export const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    // Decode JWT payload locally to check exp
    const payloadBase64 = token.split(".")[1];
    if (!payloadBase64) return false;
    
    const payloadDecoded = JSON.parse(atob(payloadBase64));
    if (payloadDecoded.exp) {
      const isExpired = Date.now() >= payloadDecoded.exp * 1000;
      if (isExpired) {
        // Token has expired, auto-clear session
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        return false;
      }
    }
  } catch (e) {
    // Invalid token format
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    return false;
  }

  return true;
};
