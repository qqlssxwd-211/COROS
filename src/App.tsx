import { useState, useRef } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider, useData } from './context/DataContext';
import LoginOverlay from './components/layout/LoginOverlay';
import TerrainMap, { type TerrainMapHandle } from './components/background/TerrainMap';
import NavBar from './components/layout/NavBar';
import Hero from './components/layout/Hero';
import StatsPanel from './components/layout/StatsPanel';
import ActivityRail from './components/layout/ActivityRail';

function AppShell() {
  const { isLoggedIn } = useAuth();
  const { summary, activities, syncLoading, syncData } = useData();
  const [activeTab, setActiveTab] = useState('overview');
  const mapRef = useRef<TerrainMapHandle>(null);

  if (!isLoggedIn) return <LoginOverlay />;

  return (
    <>
      <TerrainMap ref={mapRef} />
      <NavBar activeTab={activeTab} onTabChange={setActiveTab} onSync={syncData}
        syncLoading={syncLoading} mapRef={mapRef} />
      <Hero year={2026} startMonth="1" endMonth="5" />
      <StatsPanel stats={[
        { label: '2026 活动', value: String(summary.totalActivities), unit: '次' },
        { label: '总距离', value: (summary.totalDistance / 1000).toFixed(0), unit: 'km' },
        { label: '总时长', value: String(Math.floor(summary.totalDuration / 3600)), unit: 'h' },
        { label: '总消耗', value: `${(summary.totalCalories / 1000).toFixed(1)}k`, unit: 'kcal' },
      ]} />
      <ActivityRail activities={activities} onSelect={() => {}} />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppShell />
      </DataProvider>
    </AuthProvider>
  );
}
