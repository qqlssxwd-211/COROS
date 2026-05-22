import { useState, useRef, useMemo } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider, useData } from './context/DataContext';
import LoginOverlay from './components/layout/LoginOverlay';
import TerrainMap, { type TerrainMapHandle } from './components/background/TerrainMap';
import NavBar from './components/layout/NavBar';
import Hero from './components/layout/Hero';
import StatsPanel from './components/layout/StatsPanel';
import ActivityRail from './components/layout/ActivityRail';
import TrendTab from './components/tabs/TrendTab';
import BodyTab from './components/tabs/BodyTab';
import SleepTab from './components/tabs/SleepTab';
import ActivitiesTab from './components/tabs/ActivitiesTab';
import ActivityDetail from './components/detail/ActivityDetail';
import type { ActivitySummary } from './types/coros';

function AppShell() {
  const { isLoggedIn } = useAuth();
  const { summary, activities, syncLoading, syncError, syncData } = useData();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedActivity, setSelectedActivity] = useState<ActivitySummary | null>(null);
  const mapRef = useRef<TerrainMapHandle>(null);

  const todayStats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    let calories = 0;
    let steps = 0;
    for (const a of activities) {
      const d = new Date(Number(a.startTime) * 1000).toISOString().slice(0, 10);
      if (d === today) {
        calories += a.totalCalories;
        steps += a.step ?? 0;
      }
    }
    return { calories, steps };
  }, [activities]);

  if (!isLoggedIn) return <LoginOverlay />;

  const showOverlay = selectedActivity
    ? 'detail'
    : activeTab === 'overview' ? '' : activeTab;

  const stats = [
    { label: '2026 活动', value: String(summary.totalActivities), unit: '次' },
    { label: '总距离', value: (summary.totalDistance / 1000).toFixed(0), unit: 'km' },
    { label: '总时长', value: String(Math.floor(summary.totalDuration / 3600)), unit: 'h' },
    { label: '今日消耗', value: todayStats.calories > 0 ? String(todayStats.calories) : '—', unit: 'kcal' },
    { label: '今日步数', value: todayStats.steps > 0 ? String(todayStats.steps) : '—', unit: '步' },
  ];

  return (
    <>
      <TerrainMap ref={mapRef} />

      <NavBar activeTab={activeTab} onTabChange={(tab) => { setActiveTab(tab); setSelectedActivity(null); }}
        onSync={syncData} syncLoading={syncLoading} syncError={syncError} mapRef={mapRef} />

      {!showOverlay && (
        <>
          {/* Desktop layout */}
          <div className="hidden md:block">
            <Hero year={2026} startMonth="1" endMonth="5" />
            <StatsPanel stats={stats} />
            <ActivityRail activities={activities} onSelect={setSelectedActivity} />
          </div>

          {/* Mobile layout */}
          <div className="md:hidden fixed top-24 left-0 right-0 bottom-0 z-20 flex flex-col pointer-events-none">
            <div className="pointer-events-auto px-4 pt-1.5">
              <Hero year={2026} startMonth="1" endMonth="5" mobile />
            </div>
            <div className="pointer-events-auto px-4 mt-auto pb-4">
              <StatsPanel stats={stats} mobile />
              <ActivityRail activities={activities} onSelect={setSelectedActivity} mobile />
            </div>
          </div>
        </>
      )}

      <TrendTab active={showOverlay === 'trend'} onClose={() => setActiveTab('overview')} />
      <BodyTab active={showOverlay === 'body'} onClose={() => setActiveTab('overview')} />
      <SleepTab active={showOverlay === 'sleep'} onClose={() => setActiveTab('overview')} />
      <ActivitiesTab active={showOverlay === 'activities'} onClose={() => setActiveTab('overview')} onSelectActivity={setSelectedActivity} />
      <ActivityDetail activity={selectedActivity} onClose={() => setSelectedActivity(null)} />
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
