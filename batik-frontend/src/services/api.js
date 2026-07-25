export const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const createBatik = async (formData) => {
  const res = await fetch(`${BASE_URL}/admin/batik`, {
    method: "POST",
    body: formData, // multipart/form-data, jangan set Content-Type manual
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.detail || `HTTP Error ${res.status}`);
  }

  return res.json();
};

export const getBatik = async () => {
  const res = await fetch(`${BASE_URL}/batik`);
  if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
  return res.json();
};

export const updateBatik = async (id, formData, token) => {
  const res = await fetch(`${BASE_URL}/admin/batik/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.detail || `HTTP Error ${res.status}`);
  }

  return res.json();
};

export const deleteBatik = async (id, token) => {
  const res = await fetch(`${BASE_URL}/admin/batik/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.detail || `HTTP Error ${res.status}`);
  }

  return res.json();
};

// --- MITRA API SERVICE ---

export const registerMitra = async (formData) => {
  const res = await fetch(`${BASE_URL}/register/mitra`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.detail || `HTTP Error ${res.status}`);
  }

  return res.json();
};

export const getPendingMitras = async (token) => {
  const res = await fetch(`${BASE_URL}/admin/mitra/pending`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.detail || `HTTP Error ${res.status}`);
  }

  return res.json();
};

export const updateMitraStatus = async (id, action, token) => {
  const res = await fetch(`${BASE_URL}/admin/mitra/${id}/status?status_action=${action}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.detail || `HTTP Error ${res.status}`);
  }

  return res.json();
};

export const getMitraBatik = async (token) => {
  const res = await fetch(`${BASE_URL}/mitra/my-batik`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.detail || `HTTP Error ${res.status}`);
  }

  return res.json();
};

export const createBatikMitra = async (formData, token) => {
  const res = await fetch(`${BASE_URL}/mitra/batik`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.detail || `HTTP Error ${res.status}`);
  }

  return res.json();
};

export const updateBatikMitra = async (id, formData, token) => {
  const res = await fetch(`${BASE_URL}/mitra/batik/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.detail || `HTTP Error ${res.status}`);
  }

  return res.json();
};

export const deleteBatikMitra = async (id, token) => {
  const res = await fetch(`${BASE_URL}/mitra/batik/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.detail || `HTTP Error ${res.status}`);
  }

  return res.json();
};

// --- MODEL MANAGEMENT API SERVICE ---

export const getModels = async (token) => {
  const res = await fetch(`${BASE_URL}/admin/models`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.detail || `HTTP Error ${res.status}`);
  }

  return res.json();
};

export const uploadModel = async (formData, token) => {
  const res = await fetch(`${BASE_URL}/admin/models/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.detail || `HTTP Error ${res.status}`);
  }

  return res.json();
};

export const activateModel = async (id, token) => {
  const res = await fetch(`${BASE_URL}/admin/models/${id}/activate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.detail || `HTTP Error ${res.status}`);
  }

  return res.json();
};

export const deactivateAllModels = async (token) => {
  const res = await fetch(`${BASE_URL}/admin/models/deactivate-all`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.detail || `HTTP Error ${res.status}`);
  }

  return res.json();
};

export const deleteModel = async (id, token) => {
  const res = await fetch(`${BASE_URL}/admin/models/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.detail || `HTTP Error ${res.status}`);
  }

  return res.json();
};

// --- VTON API SERVICE ---

export const generateGarment = async (formData) => {
  const res = await fetch(`${BASE_URL}/vton/generate-garment`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.detail || `HTTP Error ${res.status}`);
  }

  return res.json();
};

export const executeVton = async (formData) => {
  const res = await fetch(`${BASE_URL}/vton/try-on`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.detail || `HTTP Error ${res.status}`);
  }

  return res.json();
};

