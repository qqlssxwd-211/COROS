import { useRef } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginOverlay from './components/layout/LoginOverlay';
import TerrainMap, { type TerrainMapHandle } from './components/background/TerrainMap';

function AppShell() {
  const { isLoggedIn } = useAuth();
  const mapRef = useRef<TerrainMapHandle>(null);
  if (!isLoggedIn) return <LoginOverlay />;
  return (
    <>
      <TerrainMap ref={mapRef} />
      <div className="h-screen w-screen relative z-10 flex items-center justify-center">
        <p className="text-accent text-2xl">Dashboard - logged in</p>
      </div>
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
