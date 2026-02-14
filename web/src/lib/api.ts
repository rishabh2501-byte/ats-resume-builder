const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || '';

export const api = {
  getUrl: (path: string) => {
    // In production, use full URL. In dev, proxy handles it.
    if (API_BASE_URL) {
      return `${API_BASE_URL}${path}`;
    }
    return path;
  },

  fetch: async (path: string, options?: RequestInit) => {
    const url = api.getUrl(path);
    return fetch(url, options);
  },
};

export default api;
