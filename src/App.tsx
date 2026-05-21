import { useState, useRef, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginOverlay from './components/layout/LoginOverlay';
import TerrainMap, { type TerrainMapHandle } from './components/background/TerrainMap';
import NavBar from './components/layout/NavBar';

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
