const BASE_URL = "http://localhost:8000";

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
  return !!localStorage.getItem("token");
};
