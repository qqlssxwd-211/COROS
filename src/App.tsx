import { AuthProvider, useAuth } from './context/AuthContext';
import LoginOverlay from './components/layout/LoginOverlay';

function AppShell() {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) return <LoginOverlay />;
  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <p className="text-accent text-2xl">Dashboard - logged in</p>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
