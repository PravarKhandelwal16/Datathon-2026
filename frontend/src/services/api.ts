const BASE_URL = 'http://127.0.0.1:8000';

async function fetchJson<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, options);
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

export const api = {
  // Dashboard Endpoints
  getDashboardStats: async (district: string) => {
    return fetchJson<{
      incidents: string;
      riskZones: string;
      repeatOffenders: string;
      clearance: string;
      trend: { name: string; crimes: number; clearance: number }[];
      categories: { name: string; count: number; color: string }[];
    }>(`/api/dashboard/stats?district=${district}`);
  },
  getDashboardAlerts: async () => {
    return fetchJson<{ id: string; time: string; district: string; msg: string; severity: string }[]>(
      '/api/dashboard/alerts'
    );
  },
  getDashboardDispatches: async () => {
    return fetchJson<{ id: string; unit: string; status: string; destination: string; eta: string }[]>(
      '/api/dashboard/dispatches'
    );
  },

  // Map Endpoints
  getMapDistricts: async (category: string, hour: number | null) => {
    const hourQuery = hour !== null ? `&hour=${hour}` : '';
    return fetchJson<{
      name: string;
      lat: number;
      lng: number;
      firs: number;
      severity: string;
      alerts: boolean;
      stations: number;
      patrols: number;
      trend: number;
    }[]>(`/api/map/districts?category=${category}${hourQuery}`);
  },
  getMapDrilldown: async (district: string) => {
    return fetchJson<{
      district: string;
      firs: number;
      delta: string;
      topCategory: string;
      stations: number;
      patrols: number;
      hours: { hour: string; count: number }[];
      trend: { day: string; firs: number }[];
      categories: { category: string; pct: number }[];
    }>(`/api/map/drilldown/${encodeURIComponent(district)}`);
  },

  // Network Endpoints
  getNetworkGraph: async (groups: string[], links: string[]) => {
    const groupsQuery = groups.map(g => `groups=${g}`).join('&');
    const linksQuery = links.map(l => `links=${l}`).join('&');
    return fetchJson<{
      nodes: any[];
      links: any[];
    }>(`/api/network/graph?${groupsQuery}&${linksQuery}`);
  },
  getOffenders: async () => {
    return fetchJson<any[]>('/api/network/offenders');
  },
  getAssociations: async () => {
    return fetchJson<any[]>('/api/network/associations');
  },

  // Predictive Endpoints
  getPredictiveSocio: async () => {
    return fetchJson<{
      districts: any[];
      overlay: any[];
    }>('/api/predictive/socio');
  },
  getPredictiveForecast: async () => {
    return fetchJson<{
      forecast: any[];
      districts: any[];
      categories: any[];
    }>('/api/predictive/forecast');
  },
  getPredictiveAnomalies: async () => {
    return fetchJson<{
      timeseries: any[];
      events: any[];
    }>('/api/predictive/anomalies');
  },
  getPredictivePatterns: async () => {
    return fetchJson<{
      heatmap: any[];
      trends: any[];
      gaps: any[];
    }>('/api/predictive/patterns');
  },
  getPredictiveBehavioral: async () => {
    return fetchJson<{
      moTrend: any[];
      radar: any[];
      networks: any[];
      matrix: any[];
    }>('/api/predictive/behavioral');
  }
};
export default api;
