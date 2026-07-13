import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { GeoMap } from './pages/GeoMap';
import { NetworkAnalysis } from './pages/NetworkAnalysis';
import { PredictiveInsights } from './pages/PredictiveInsights';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="map" element={<GeoMap />} />
            <Route path="network" element={<NetworkAnalysis />} />
            <Route path="predictive" element={<PredictiveInsights />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
