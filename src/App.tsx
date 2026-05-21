import { useState, useRef, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginOverlay from './components/layout/LoginOverlay';
import TerrainMap, { type TerrainMapHandle } from './components/background/TerrainMap';
import NavBar from './components/layout/NavBar';
import Hero from './components/layout/Hero';
import StatsPanel from './components/layout/StatsPanel';
import ActivityRail from './components/layout/ActivityRail';

function AppShell() {
  const { isLoggedIn } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [syncLoading, setSyncLoading] = useState(false);
  const mapRef = useRef<TerrainMapHandle>(null);

  const handleSync = useCallback(async () => {
    setSyncLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setSyncLoading(false);
  }, []);

  if (!isLoggedIn) return <LoginOverlay />;

  return (
    <>
      <TerrainMap ref={mapRef} />
      <NavBar activeTab={activeTab} onTabChange={setActiveTab} onSync={handleSync}
        syncLoading={syncLoading} mapRef={mapRef} />
      <Hero year={2026} startMonth="1" endMonth="5" />
      <StatsPanel stats={[
        { label: '2026 活动', value: '86', unit: '次' },
        { label: '总距离', value: '582', unit: 'km' },
        { label: '总时长', value: '68', unit: 'h' },
        { label: '总消耗', value: '38.5k', unit: 'kcal' },
      ]} />
      <ActivityRail activities={[]} onSelect={() => {}} />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
