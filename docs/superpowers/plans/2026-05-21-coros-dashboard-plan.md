# COROS Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a web-based COROS sports data analysis dashboard with real 3D terrain background, multi-user support, and rich activity analytics.

**Architecture:** Vite + React 18 + TypeScript SPA with Tailwind CSS. Cloudflare Pages Functions serve as a stateless API proxy to COROS REST endpoints (MD5 auth + accessToken per user). MapLibre GL JS renders real satellite terrain as the background layer.

**Tech Stack:** Vite 6, React 18, TypeScript 5, Tailwind CSS 3.4, lucide-react, ECharts 5, MapLibre GL JS 4.5, Cloudflare Pages + Pages Functions

---

## File Structure

```
src/
├── main.tsx                          # React entry point
├── App.tsx                           # Root: auth gate + layout
├── index.css                         # Tailwind directives + global styles
├── types/
│   └── coros.ts                      # All COROS API response types
├── context/
│   └── AuthContext.tsx                # Login state + token + region
│   └── DataContext.tsx                # Fetched data cache + sync trigger
├── hooks/
│   └── useCorosApi.ts                # COROS API fetch wrapper
├── lib/
│   └── corosClient.ts                # MD5 hash + API request builder
│   └── constants.ts                  # Sport types, colors, config
├── components/
│   ├── layout/
│   │   ├── NavBar.tsx                 # Top nav: brand, tab pill, user, buttons
│   │   ├── Hero.tsx                   # Bottom-left hero: tag, title, desc
│   │   ├── StatsPanel.tsx             # Floating right stats cards
│   │   └── ActivityRail.tsx           # Bottom-right recent activity chips
│   ├── background/
│   │   └── TerrainMap.tsx             # MapLibre GL 3D terrain + trails
│   ├── tabs/
│   │   ├── TabShell.tsx               # Shared bottom-sheet panel wrapper
│   │   ├── FilterBar.tsx              # Sport type, date range, sort selectors
│   │   ├── OverviewTab.tsx            # Default: YTD summary charts
│   │   ├── TrendTab.tsx               # Weekly/monthly distance, load, VO2max
│   │   ├── BodyTab.tsx                # HRV, RHR, load ratio, stamina
│   │   ├── SleepTab.tsx               # Sleep phases, quality, HR
│   │   └── ActivitiesTab.tsx          # Activity list with filters + sort
│   ├── detail/
│   │   └── ActivityDetail.tsx         # Full activity bottom sheet
│   ├── charts/
│   │   ├── LineChart.tsx              # ECharts line wrapper
│   │   ├── BarChart.tsx               # ECharts bar wrapper
│   │   ├── PieChart.tsx               # ECharts pie/ring wrapper
│   │   └── AreaChart.tsx              # ECharts area wrapper
│   └── ui/
│       ├── MetricCard.tsx             # Single metric display card
│       ├── DataTable.tsx              # Generic data table
│       ├── Badge.tsx                  # Sport type colored badge
│       └── Button.tsx                 # Primary/ghost button variants
└── functions/
    ├── api/
    │   ├── login.ts                   # POST /api/login — COROS auth
    │   ├── activities.ts              # GET /api/activities — activity list
    │   ├── activity-detail.ts         # GET /api/activities/:id — detail
    │   ├── dashboard.ts               # GET /api/dashboard — summary metrics
    │   ├── sleep.ts                   # GET /api/sleep — sleep records
    │   ├── daily.ts                   # GET /api/daily — HRV/RHR/VO2max
    │   └── _middleware.ts             # Auth check, region routing
    └── _lib/
        └── coros.ts                   # MD5 auth, API helpers (shared)

vite.config.ts                         # Vite config with Tailwind
tailwind.config.js                     # Tailwind: black theme, custom fonts
wrangler.toml                          # Cloudflare Pages config
tsconfig.json                          # TypeScript config
package.json
```

## Tasks

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `vite.config.ts`, `tailwind.config.js`, `tsconfig.json`, `wrangler.toml`
- Create: `src/main.tsx`, `src/App.tsx`, `src/index.css`
- Create: `index.html`

- [ ] **Step 1: Initialize project and install dependencies**

```bash
cd /Users/maqiang/Desktop/COROS
npm create vite@latest . -- --template react-ts
npm install react@18 react-dom@18
npm install -D tailwindcss@3.4 postcss autoprefixer @types/react @types/react-dom typescript
npm install lucide-react echarts echarts-for-react maplibre-gl
npm install -D wrangler@latest
npx tailwindcss init -p
```

- [ ] **Step 2: Write package.json**

```json
{
  "name": "coros-dashboard",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "deploy": "wrangler pages deploy dist"
  },
  "dependencies": {
    "echarts": "^5.5.0",
    "echarts-for-react": "^3.0.2",
    "lucide-react": "^0.400.0",
    "maplibre-gl": "^4.5.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.14",
    "typescript": "^5.6.0",
    "vite": "^6.0.0",
    "wrangler": "^3.90.0"
  }
}
```

- [ ] **Step 3: Write vite.config.ts**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 3000 },
});
```

- [ ] **Step 4: Write tailwind.config.js**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Neue Haas Grotesk Display Pro 55 Roman"', 'Helvetica Neue', 'sans-serif'],
        text: ['"Neue Haas Grotesk Text Pro"', 'Helvetica Neue', 'sans-serif'],
      },
      colors: {
        accent: { DEFAULT: '#4ade80', hover: '#22c55e' },
        bgcard: 'rgba(10,10,10,0.92)',
        border: 'rgba(255,255,255,0.06)',
      },
    },
  },
  plugins: [],
};
```

- [ ] **Step 5: Write wrangler.toml**

```toml
name = "coros-dashboard"
compatibility_date = "2025-05-21"
pages_build_output_dir = "dist"
```

- [ ] **Step 6: Write index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>COROS Dashboard</title>
  <link href="https://db.onlinewebfonts.com/c/dec0d9b4e22ca588dc20e1e2e09a59b5?family=Neue+Haas+Grotesk+Display+Pro+55+Roman" rel="stylesheet">
  <link href="https://db.onlinewebfonts.com/c/6e47ef470dd19698c911332a9b4d1cf4?family=Neue+Haas+Grotesk+Text+Pro" rel="stylesheet">
</head>
<body class="bg-black text-white antialiased">
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>
```

- [ ] **Step 7: Write src/index.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --accent: #4ade80;
  --accent-hover: #22c55e;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: 'Neue Haas Grotesk Display Pro 55 Roman', 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  background: #000;
  color: #fafafa;
  overflow: hidden;
}
```

- [ ] **Step 8: Write src/main.tsx**

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

- [ ] **Step 9: Write src/App.tsx (stub)**

```tsx
export default function App() {
  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <p className="text-accent text-2xl">COROS Dashboard</p>
    </div>
  );
}
```

- [ ] **Step 10: Verify dev server starts**

```bash
npm run dev
```
Expected: dev server on localhost:3000, page shows "COROS Dashboard" in green.

- [ ] **Step 11: Commit**

```bash
git add -A && git commit -m "feat: scaffold Vite + React + TS + Tailwind project"
```

---

### Task 2: Type Definitions

**Files:**
- Create: `src/types/coros.ts`
- Create: `src/lib/constants.ts`

- [ ] **Step 1: Write src/types/coros.ts**

```typescript
export interface CorosCredentials {
  email: string;
  password: string;
  region: 'cn' | 'eu' | 'us' | 'asia';
}

export interface AuthState {
  accessToken: string | null;
  userId: string | null;
  userName: string | null;
  region: string;
  isLoggedIn: boolean;
}

export interface ActivitySummary {
  id: string;
  name: string;
  sportType: number;
  sportName: string;
  startTime: string;
  totalTime: number;      // seconds
  totalDistance: number;  // meters
  totalCalories: number;  // kcal
  avgHeartRate: number;
  maxHeartRate: number;
  avgPace: number;        // sec/km
  totalAscent: number;    // meters
  trainingLoad: number;
}

export interface ActivityDetail extends ActivitySummary {
  lapData: LapData[];
  heartRateZones: HeartRateZone[];
  elevationData: ElevationPoint[];
  paceData: PacePoint[];
}

export interface LapData {
  index: number;
  distance: number;
  duration: number;
  pace: number;
  heartRate: number;
  cadence: number;
  ascent: number;
  calories: number;
}

export interface HeartRateZone {
  zone: number;
  name: string;
  minBpm: number;
  maxBpm: number;
  duration: number;  // seconds
  percent: number;
}

export interface ElevationPoint {
  distance: number;  // meters
  elevation: number; // meters
}

export interface PacePoint {
  distance: number;
  pace: number;  // sec/km
}

export interface DailyRecord {
  date: string;
  hrv: number;
  hrvBaseline: number;
  restingHeartRate: number;
  trainingLoad: number;
  loadRatio: number;
  vo2max: number;
  stamina: number;
  fatigue: number;
}

export interface SleepRecord {
  date: string;
  totalDuration: number;     // minutes
  deepSleepDuration: number;
  lightSleepDuration: number;
  remDuration: number;
  awakeDuration: number;
  avgHeartRate: number;
  qualityScore: number;
}

export interface DashboardSummary {
  year: number;
  totalActivities: number;
  totalDistance: number;
  totalDuration: number;
  totalCalories: number;
  activities: ActivitySummary[];
}

export type SportType =
  | 'all'
  | 'running'
  | 'trailRunning'
  | 'hiking'
  | 'cycling'
  | 'swimming'
  | 'strength';
```

- [ ] **Step 2: Write src/lib/constants.ts**

```typescript
import type { SportType } from '../types/coros';

export const SPORT_MAP: Record<number, { name: string; type: SportType; color: string }> = {
  100: { name: '跑步', type: 'running', color: '#4ade80' },
  102: { name: '越野跑', type: 'trailRunning', color: '#22c55e' },
  104: { name: '登山', type: 'hiking', color: '#facc15' },
  200: { name: '公路骑行', type: 'cycling', color: '#38bdf8' },
  201: { name: '山地骑行', type: 'cycling', color: '#38bdf8' },
  301: { name: '游泳', type: 'swimming', color: '#34d399' },
  400: { name: '力量训练', type: 'strength', color: '#c084fc' },
};

export const SPORT_TYPE_LABELS: Record<string, string> = {
  all: '全部',
  running: '跑步',
  trailRunning: '越野跑',
  hiking: '登山',
  cycling: '骑行',
  swimming: '游泳',
  strength: '力量训练',
};

export const REGION_OPTIONS = [
  { value: 'cn', label: '中国大陆' },
  { value: 'eu', label: '欧洲' },
  { value: 'us', label: '美国' },
  { value: 'asia', label: '亚太' },
];

export const REGION_BASE_URL: Record<string, string> = {
  cn: 'https://teamapi.coros.com',
  eu: 'https://teameuapi.coros.com',
  us: 'https://teamapi.coros.com',
  asia: 'https://teamapi.coros.com',
};

export const INITIAL_MAP_VIEW = {
  center: [101.9, 29.58] as [number, number],
  zoom: 11.2,
  pitch: 55,
  bearing: 20,
};

export const TRAIL_1_COORDS: [number, number][] = [
  [101.82,29.72],[101.84,29.70],[101.85,29.67],[101.86,29.64],[101.87,29.61],
  [101.88,29.59],[101.89,29.57],[101.90,29.55],[101.91,29.54],[101.92,29.53],
  [101.93,29.54],[101.94,29.55],[101.95,29.57],[101.96,29.59],[101.97,29.61],
  [101.98,29.62],[101.99,29.63],[102.00,29.64],[102.01,29.63],[101.99,29.61],
  [101.97,29.59],[101.95,29.57],[101.93,29.55],[101.91,29.53],[101.89,29.51],
];

export const TRAIL_2_COORDS: [number, number][] = [
  [101.75,29.65],[101.78,29.63],[101.81,29.61],[101.84,29.59],[101.87,29.58],
  [101.90,29.57],[101.93,29.56],[101.96,29.55],[101.99,29.53],[102.02,29.52],
  [102.05,29.53],[102.07,29.55],[102.09,29.57],[102.07,29.59],[102.05,29.61],
  [102.03,29.63],[102.01,29.65],[101.99,29.67],[101.97,29.65],[101.95,29.63],
  [101.93,29.61],[101.91,29.59],[101.89,29.57],[101.87,29.59],[101.85,29.61],
  [101.83,29.63],[101.81,29.65],[101.79,29.67],[101.77,29.65],[101.75,29.63],
];
```

- [ ] **Step 3: Commit**

```bash
git add src/types/coros.ts src/lib/constants.ts && git commit -m "feat: add type definitions and constants"
```

---

### Task 3: COROS API Client Library

**Files:**
- Create: `src/lib/corosClient.ts`
- Create: `functions/_lib/coros.ts`

- [ ] **Step 1: Write src/lib/corosClient.ts (MD5 hash + request builder)**

```typescript
import { REGION_BASE_URL } from './constants';
import type { CorosCredentials } from '../types/coros';

async function md5Hash(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function loginCoros(credentials: CorosCredentials): Promise<{ accessToken: string; userId: string }> {
  const baseUrl = REGION_BASE_URL[credentials.region];
  const passwordHash = await md5Hash(credentials.password);
  const url = `${baseUrl}/api/v1/auth/login`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      account: credentials.email,
      password: passwordHash,
      accountType: 2,
    }),
  });
  if (!res.ok) throw new Error(`Login failed: ${res.status}`);
  const data = await res.json();
  return { accessToken: data.accessToken, userId: data.userId };
}

export function buildCorosRequest(baseUrl: string, accessToken: string, endpoint: string, params?: Record<string, string>) {
  const query = params ? '?' + new URLSearchParams(params).toString() : '';
  return {
    url: `${baseUrl}${endpoint}${query}`,
    headers: { 'accessToken': accessToken, 'Content-Type': 'application/json' },
  };
}
```

- [ ] **Step 2: Write functions/_lib/coros.ts (Worker-side)**

```typescript
export async function md5Hash(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export const COROS_BASE_URLS: Record<string, string> = {
  cn: 'https://teamapi.coros.com',
  eu: 'https://teameuapi.coros.com',
  us: 'https://teamapi.coros.com',
  asia: 'https://teamapi.coros.com',
};

export function buildHeaders(accessToken: string): HeadersInit {
  return {
    'accessToken': accessToken,
    'Content-Type': 'application/json',
  };
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/corosClient.ts functions/_lib/coros.ts && git commit -m "feat: add COROS API client library"
```

---

### Task 4: Auth Context and Login Flow

**Files:**
- Create: `src/context/AuthContext.tsx`
- Create: `src/components/layout/LoginOverlay.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Write src/context/AuthContext.tsx**

```tsx
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { loginCoros } from '../lib/corosClient';
import type { CorosCredentials, AuthState } from '../types/coros';

interface AuthContextType extends AuthState {
  login: (creds: CorosCredentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    accessToken: null,
    userId: null,
    userName: null,
    region: 'cn',
    isLoggedIn: false,
  });

  const login = useCallback(async (creds: CorosCredentials) => {
    const { accessToken, userId } = await loginCoros(creds);
    setState({
      accessToken,
      userId,
      userName: creds.email,
      region: creds.region,
      isLoggedIn: true,
    });
  }, []);

  const logout = useCallback(() => {
    setState({
      accessToken: null,
      userId: null,
      userName: null,
      region: 'cn',
      isLoggedIn: false,
    });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
```

- [ ] **Step 2: Write src/components/layout/LoginOverlay.tsx**

```tsx
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { REGION_OPTIONS } from '../../lib/constants';
import type { CorosCredentials } from '../../types/coros';

export default function LoginOverlay() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [region, setRegion] = useState<CorosCredentials['region']>('cn');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login({ email, password, region });
    } catch {
      setError('登录失败，请检查邮箱、密码和地区');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-2xl">
      <form onSubmit={handleSubmit} className="w-[400px] max-w-[90vw] rounded-2xl border border-white/8 bg-[rgba(10,10,10,0.95)] p-9 text-center backdrop-blur-xl">
        <h2 className="text-xl font-medium tracking-[-0.02em]">登录 COROS 账号</h2>
        <p className="mt-1 text-sm text-[#999] font-[family-name:var(--font-text)]">连接训练数据，开启运动深度分析</p>

        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

        <div className="mt-6 space-y-4 text-left">
          <label className="block">
            <span className="text-[11px] uppercase tracking-[0.06em] text-[#666]">邮箱</span>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/8 bg-white/4 px-4 py-2.5 text-sm text-white outline-none transition focus:border-accent"
              placeholder="coros@example.com" required />
          </label>
          <label className="block">
            <span className="text-[11px] uppercase tracking-[0.06em] text-[#666]">密码</span>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/8 bg-white/4 px-4 py-2.5 text-sm text-white outline-none transition focus:border-accent"
              placeholder="••••••••" required />
          </label>
          <label className="block">
            <span className="text-[11px] uppercase tracking-[0.06em] text-[#666]">地区</span>
            <select value={region} onChange={e => setRegion(e.target.value as CorosCredentials['region'])}
              className="mt-1 w-full rounded-xl border border-white/8 bg-white/4 px-4 py-2.5 text-sm text-white outline-none transition focus:border-accent">
              {REGION_OPTIONS.map(o => <option key={o.value} value={o.value} className="bg-black">{o.label}</option>)}
            </select>
          </label>
        </div>

        <button type="submit" disabled={loading}
          className="mt-6 w-full rounded-2xl bg-accent py-3 text-sm font-semibold text-black transition hover:bg-[#22c55e] disabled:opacity-50">
          {loading ? '连接中...' : '连接 COROS'}
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 3: Update src/App.tsx to wire auth**

```tsx
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
```

- [ ] **Step 4: Verify login flow works**

```bash
npm run dev
```
Expected: login overlay appears, form accepts input, submit shows brief loading then dashboard placeholder.

- [ ] **Step 5: Commit**

```bash
git add src/context/AuthContext.tsx src/components/layout/LoginOverlay.tsx src/App.tsx && git commit -m "feat: add auth context and login overlay"
```

---

### Task 5: TerrainMap Background Component

**Files:**
- Create: `src/components/background/TerrainMap.tsx`

- [ ] **Step 1: Write src/components/background/TerrainMap.tsx**

```tsx
import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { INITIAL_MAP_VIEW, TRAIL_1_COORDS, TRAIL_2_COORDS } from '../../lib/constants';

export interface TerrainMapHandle {
  resetView: () => void;
}

const TerrainMap = forwardRef<TerrainMapHandle>(function TerrainMap(_props, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const frameRef = useRef<number>(0);
  const dotOffsets = useRef([0, 0]);
  const interacting = useRef({ active: false, last: 0 });

  useImperativeHandle(ref, () => ({
    resetView: () => {
      mapRef.current?.flyTo({ ...INITIAL_MAP_VIEW, duration: 2200 });
      interacting.current = { active: false, last: 0 };
    },
  }));

  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          'terrain-dem': {
            type: 'raster-dem',
            tiles: ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],
            tileSize: 256, maxzoom: 14, encoding: 'terrarium',
          },
          'satellite': {
            type: 'raster',
            tiles: ['https://webst04.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}'],
            tileSize: 256, maxzoom: 18,
          },
        },
        layers: [{ id: 'satellite-layer', type: 'raster', source: 'satellite' }],
        terrain: { source: 'terrain-dem', exaggeration: 1.6 },
      },
      ...INITIAL_MAP_VIEW,
      antialias: true,
      attributionControl: false,
      maxPitch: 75,
      renderWorldCopies: false,
    });
    mapRef.current = map;

    map.on('mousedown', () => { interacting.current.active = true; });
    map.on('mouseup', () => { interacting.current.last = performance.now(); interacting.current.active = false; });
    map.on('touchstart', () => { interacting.current.active = true; });
    map.on('touchend', () => { interacting.current.last = performance.now(); interacting.current.active = false; });

    map.on('load', () => {
      // Trail 1
      map.addSource('trail-1', { type: 'geojson', data: { type: 'Feature', geometry: { type: 'LineString', coordinates: TRAIL_1_COORDS } } });
      map.addLayer({ id: 'trail-1-line', type: 'line', source: 'trail-1', paint: { 'line-color': '#4ade80', 'line-width': 2.5, 'line-opacity': 0.9 } });
      map.addLayer({ id: 'trail-1-glow', type: 'line', source: 'trail-1', paint: { 'line-color': '#4ade80', 'line-width': 7, 'line-opacity': 0.15, 'line-blur': 2 } });

      // Trail 2
      map.addSource('trail-2', { type: 'geojson', data: { type: 'Feature', geometry: { type: 'LineString', coordinates: TRAIL_2_COORDS } } });
      map.addLayer({ id: 'trail-2-line', type: 'line', source: 'trail-2', paint: { 'line-color': '#facc15', 'line-width': 2.5, 'line-opacity': 0.9 } });
      map.addLayer({ id: 'trail-2-glow', type: 'line', source: 'trail-2', paint: { 'line-color': '#facc15', 'line-width': 7, 'line-opacity': 0.15, 'line-blur': 2 } });

      // Dots
      [{ id: 'dot-1', coords: TRAIL_1_COORDS, color: '#4ade80' }, { id: 'dot-2', coords: TRAIL_2_COORDS, color: '#facc15' }]
        .forEach(({ id, coords, color }) => {
          map.addSource(id, { type: 'geojson', data: { type: 'FeatureCollection', features: [{ type: 'Feature', geometry: { type: 'Point', coordinates: coords[0] } }] } });
          map.addLayer({ id: `${id}-layer`, type: 'circle', source: id, paint: { 'circle-radius': 5, 'circle-color': color, 'circle-opacity': 0.95, 'circle-stroke-width': 2, 'circle-stroke-color': '#000', 'circle-stroke-opacity': 0.6 } });
        });

      // Animation loop
      const start = performance.now();
      function tick(now: number) {
        const elapsed = (now - start) / 1000;
        const { active, last } = interacting.current;
        if (!active && now - last > 5000) {
          map.rotateTo((INITIAL_MAP_VIEW.bearing + elapsed * 1.2) % 360, { duration: 0 });
          map.setPitch(52 + Math.sin(elapsed * 0.10) * 10);
        }

        dotOffsets.current[0] = (dotOffsets.current[0] + 0.00008) % 1;
        dotOffsets.current[1] = (dotOffsets.current[1] + 0.00010) % 1;

        [TRAIL_1_COORDS, TRAIL_2_COORDS].forEach((trail, i) => {
          const t = dotOffsets.current[i] * (trail.length - 1);
          const idx = Math.floor(t);
          const next = Math.min(idx + 1, trail.length - 1);
          const frac = t - idx;
          const lng = trail[idx][0] + (trail[next][0] - trail[idx][0]) * frac;
          const lat = trail[idx][1] + (trail[next][1] - trail[idx][1]) * frac;
          const src = map.getSource(`dot-${i + 1}`) as maplibregl.GeoJSONSource | undefined;
          src?.setData({ type: 'FeatureCollection', features: [{ type: 'Feature', geometry: { type: 'Point', coordinates: [lng, lat] } }] });
        });

        frameRef.current = requestAnimationFrame(tick);
      }
      frameRef.current = requestAnimationFrame(tick);
    });

    const handleResize = () => map.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', handleResize);
      map.remove();
    };
  }, []);

  return <div ref={containerRef} className="fixed inset-0 z-0" />;
});

export default TerrainMap;
```

- [ ] **Step 2: Update App.tsx to include TerrainMap**

In `AppShell`, add `<TerrainMap />` before the dashboard content div:
```tsx
import { useRef } from 'react';
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
```

- [ ] **Step 3: Verify 3D terrain renders**

```bash
npm run dev
```
Expected: login, then see satellite terrain with green+yellow trail dots orbiting around Gongga Mountain.

- [ ] **Step 4: Commit**

```bash
git add src/components/background/TerrainMap.tsx src/App.tsx && git commit -m "feat: add MapLibre GL 3D terrain background with GPS trails"
```

---

### Task 6: NavBar Component

**Files:**
- Create: `src/components/layout/NavBar.tsx`

- [ ] **Step 1: Write NavBar**

```tsx
import { useAuth } from '../../context/AuthContext';
import type { TerrainMapHandle } from '../background/TerrainMap';

interface Props {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSync: () => void;
  syncLoading: boolean;
  mapRef: React.RefObject<TerrainMapHandle>;
}

const TABS = [
  { id: 'overview', label: '概览' },
  { id: 'trend', label: '趋势' },
  { id: 'body', label: '身体' },
  { id: 'sleep', label: '睡眠' },
  { id: 'activities', label: '活动' },
];

export default function NavBar({ activeTab, onTabChange, onSync, syncLoading, mapRef }: Props) {
  const { userName, logout } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-5 py-3.5">
      <div className="text-[1.05rem] font-medium tracking-[-0.02em]">
        COROS <span className="text-accent not-italic">Dashboard</span>
      </div>

      <div className="flex items-center rounded-[28px] border border-[rgba(255,255,255,0.06)] bg-[rgba(10,10,10,0.92)] p-[3px] backdrop-blur-xl">
        {TABS.map(t => (
          <button key={t.id} onClick={() => onTabChange(t.id)}
            className={`rounded-3xl px-[22px] py-2 text-[0.82rem] font-medium transition-colors tracking-[-0.01em] ${
              activeTab === t.id ? 'bg-white/6 text-[#fafafa]' : 'text-[#666] hover:text-[#999]'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button onClick={() => mapRef.current?.resetView()}
          className="rounded-3xl border border-accent px-4 py-2 text-[0.82rem] font-semibold text-accent transition hover:bg-accent/10">
          🎯 轨迹视角
        </button>
        <button onClick={onSync} disabled={syncLoading}
          className="rounded-3xl bg-accent px-5 py-2 text-[0.82rem] font-semibold text-black transition hover:bg-[#22c55e] disabled:opacity-50">
          {syncLoading ? '同步中...' : '同步数据'}
        </button>
        <span className="rounded-[20px] border border-[rgba(255,255,255,0.06)] bg-[rgba(10,10,10,0.92)] px-3.5 py-1.5 text-[0.78rem] text-[#999] backdrop-blur-md">
          {userName}
        </span>
        <button onClick={logout} className="text-[0.72rem] text-[#666] hover:text-[#999]">退出</button>
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Update App.tsx to use NavBar**

```tsx
import { useState, useRef, useCallback } from 'react';
import TerrainMap, { type TerrainMapHandle } from './components/background/TerrainMap';
import NavBar from './components/layout/NavBar';

function AppShell() {
  const { isLoggedIn } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [syncLoading, setSyncLoading] = useState(false);
  const mapRef = useRef<TerrainMapHandle>(null);

  const handleSync = useCallback(async () => {
    setSyncLoading(true);
    // Will be populated in data context task
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
```

- [ ] **Step 3: Verify nav renders**

Expected: top nav with brand, 5 tabs, user chip, sync button, trail reset button.

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/NavBar.tsx src/App.tsx && git commit -m "feat: add top navigation bar with tabs and sync button"
```

---

### Task 7: Hero, StatsPanel, ActivityRail

**Files:**
- Create: `src/components/layout/Hero.tsx`
- Create: `src/components/layout/StatsPanel.tsx`
- Create: `src/components/layout/ActivityRail.tsx`

- [ ] **Step 1: Write Hero.tsx**

```tsx
interface Props {
  year: number;
  startMonth: string;
  endMonth: string;
}

export default function Hero({ year, startMonth, endMonth }: Props) {
  return (
    <div className="fixed left-7 bottom-8 z-20 max-w-[420px]">
      <div className="inline-flex items-center gap-2 text-[0.8rem] font-medium text-accent">
        {year}年摘要 · {startMonth}月 — {endMonth}月
      </div>
      <h1 className="mt-2.5 text-[2.5rem] font-normal leading-[0.95] tracking-[-0.035em] text-[#fafafa]">
        你的运动<span className="text-accent">全貌</span>
      </h1>
      <p className="mt-1.5 max-w-[340px] text-[0.83rem] leading-relaxed text-[#999] font-[family-name:var(--font-text)]">
        基于 COROS 训练数据追踪表现。点击 Tab 切换维度分析，点击活动查看深度详情。
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Write StatsPanel.tsx**

```tsx
interface StatItem { label: string; value: string; unit: string; }

export default function StatsPanel({ stats }: { stats: StatItem[] }) {
  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2">
      {stats.map(s => (
        <div key={s.label}
          className="w-[165px] rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(10,10,10,0.92)] p-4 backdrop-blur-xl transition hover:border-white/12">
          <div className="text-[0.64rem] uppercase tracking-[0.06em] text-[#666] font-[family-name:var(--font-text)] font-medium">{s.label}</div>
          <div className="mt-1.5 text-2xl font-normal tracking-[-0.03em] text-[#fafafa]">
            {s.value}<span className="text-[0.7rem] text-[#666] ml-0.5">{s.unit}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Write ActivityRail.tsx**

```tsx
import type { ActivitySummary } from '../../types/coros';
import { SPORT_MAP } from '../../lib/constants';

interface Props {
  activities: ActivitySummary[];
  onSelect: (activity: ActivitySummary) => void;
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}min` : `${m}min`;
}

export default function ActivityRail({ activities, onSelect }: Props) {
  const recent = activities.slice(0, 5);

  return (
    <div className="fixed right-6 bottom-8 z-20 flex flex-col gap-1.5 max-h-[240px] overflow-y-auto">
      {recent.map(a => {
        const sport = SPORT_MAP[a.sportType] ?? { name: '未知', color: '#666' };
        return (
          <button key={a.id} onClick={() => onSelect(a)}
            className="flex items-center gap-2.5 min-w-[225px] rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(10,10,10,0.92)] px-3.5 py-2.5 text-left backdrop-blur-xl transition hover:bg-[rgba(15,15,15,0.96)] hover:border-white/12">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: sport.color }} />
            <div className="flex-1 min-w-0">
              <div className="text-[0.8rem] font-medium truncate">{a.name}</div>
              <div className="text-[0.68rem] text-[#666] mt-0.5 font-[family-name:var(--font-text)]">
                {a.startTime.slice(5)} · {formatDuration(a.totalTime)}
              </div>
            </div>
            <span className="text-[0.78rem] text-[#666] font-[family-name:var(--font-text)] whitespace-nowrap">
              <strong className="text-[#fafafa] font-medium font-[family-name:var(--font-display)]">{(a.totalDistance / 1000).toFixed(1)}</strong> km
            </span>
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 4: Add to AppShell**

```tsx
import Hero from './components/layout/Hero';
import StatsPanel from './components/layout/StatsPanel';
import ActivityRail from './components/layout/ActivityRail';

// Inside AppShell:
<Hero year={2026} startMonth="1" endMonth="5" />
<StatsPanel stats={[
  { label: '2026 活动', value: '86', unit: '次' },
  { label: '总距离', value: '582', unit: 'km' },
  { label: '总时长', value: '68', unit: 'h' },
  { label: '总消耗', value: '38.5k', unit: 'kcal' },
]} />
<ActivityRail activities={[]} onSelect={() => {}} />
```

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/Hero.tsx src/components/layout/StatsPanel.tsx src/components/layout/ActivityRail.tsx src/App.tsx && git commit -m "feat: add hero, stats panel, and activity rail"
```

---

### Task 8: Data Context and Sync Hook

**Files:**
- Create: `src/context/DataContext.tsx`
- Create: `src/hooks/useCorosApi.ts`

- [ ] **Step 1: Write src/hooks/useCorosApi.ts**

```tsx
import { useAuth } from '../context/AuthContext';
import { REGION_BASE_URL } from '../lib/constants';
import type { ActivitySummary, ActivityDetail, DailyRecord, SleepRecord, DashboardSummary } from '../types/coros';

export function useCorosApi() {
  const { accessToken, region } = useAuth();
  const baseUrl = REGION_BASE_URL[region];

  async function fetchFromCoros<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    if (!accessToken) throw new Error('Not authenticated');
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    const res = await fetch(`${baseUrl}${endpoint}${query}`, {
      headers: { 'accessToken': accessToken, 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  }

  const syncAll = async (): Promise<{
    activities: ActivitySummary[];
    dailyRecords: DailyRecord[];
    sleepRecords: SleepRecord[];
  }> => {
    const [activities, dailyRecords, sleepRecords] = await Promise.all([
      fetchFromCoros<ActivitySummary[]>('/api/v1/activity/list', { size: '1000' }),
      fetchFromCoros<DailyRecord[]>('/api/v1/analyse/dashboard', {}),
      fetchFromCoros<SleepRecord[]>('/api/v1/sleep/list', { size: '365' }),
    ]);
    return { activities, dailyRecords, sleepRecords };
  };

  const fetchActivityDetail = async (id: string): Promise<ActivityDetail> => {
    return fetchFromCoros<ActivityDetail>(`/api/v1/activity/detail/${id}`);
  };

  return { syncAll, fetchActivityDetail };
}
```

- [ ] **Step 2: Write src/context/DataContext.tsx**

```tsx
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { useCorosApi } from '../hooks/useCorosApi';
import type { ActivitySummary, DailyRecord, SleepRecord, DashboardSummary } from '../types/coros';

interface DataState {
  activities: ActivitySummary[];
  dailyRecords: DailyRecord[];
  sleepRecords: SleepRecord[];
  lastSync: Date | null;
  syncLoading: boolean;
  syncData: () => Promise<void>;
  summary: DashboardSummary;
}

const DataContext = createContext<DataState | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [activities, setActivities] = useState<ActivitySummary[]>([]);
  const [dailyRecords, setDailyRecords] = useState<DailyRecord[]>([]);
  const [sleepRecords, setSleepRecords] = useState<SleepRecord[]>([]);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncLoading, setSyncLoading] = useState(false);
  const { syncAll } = useCorosApi();

  const syncData = useCallback(async () => {
    setSyncLoading(true);
    try {
      const data = await syncAll();
      setActivities(data.activities);
      setDailyRecords(data.dailyRecords);
      setSleepRecords(data.sleepRecords);
      setLastSync(new Date());
    } finally {
      setSyncLoading(false);
    }
  }, [syncAll]);

  const summary: DashboardSummary = {
    year: 2026,
    totalActivities: activities.length,
    totalDistance: activities.reduce((s, a) => s + a.totalDistance, 0),
    totalDuration: activities.reduce((s, a) => s + a.totalTime, 0),
    totalCalories: activities.reduce((s, a) => s + a.totalCalories, 0),
    activities,
  };

  return (
    <DataContext.Provider value={{ activities, dailyRecords, sleepRecords, lastSync, syncLoading, syncData, summary }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be inside DataProvider');
  return ctx;
}
```

- [ ] **Step 3: Update App.tsx to wrap with DataProvider**

```tsx
import { DataProvider } from './context/DataContext';

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppShell />
      </DataProvider>
    </AuthProvider>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useCorosApi.ts src/context/DataContext.tsx src/App.tsx && git commit -m "feat: add data context and COROS API sync hook"
```

---

### Task 9: Tab Shell and FilterBar

**Files:**
- Create: `src/components/tabs/TabShell.tsx`
- Create: `src/components/tabs/FilterBar.tsx`

- [ ] **Step 1: Write TabShell.tsx**

```tsx
import type { ReactNode } from 'react';

interface Props {
  active: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export default function TabShell({ active, onClose, title, children }: Props) {
  return (
    <div
      className={`fixed inset-0 z-40 ${active ? 'pointer-events-auto' : 'pointer-events-none'}`}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`absolute inset-0 bg-black/75 backdrop-blur-md transition-opacity duration-300 ${active ? 'opacity-100' : 'opacity-0'}`} />
      <div className={`relative z-10 w-full max-h-[82vh] overflow-y-auto rounded-t-3xl border-t border-white/6 bg-[rgba(5,5,5,0.97)] px-9 py-7 pb-10 backdrop-blur-2xl transition-transform duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${active ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="mx-auto mb-5 h-1 w-10 cursor-pointer rounded-full bg-white/15" onClick={onClose} />
        <h3 className="text-xl font-medium tracking-[-0.02em] text-[#fafafa]">{title}</h3>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write FilterBar.tsx**

```tsx
import { SPORT_TYPE_LABELS } from '../../lib/constants';

interface Props {
  sportType: string;
  onSportChange: (v: string) => void;
  dateFrom: string;
  onDateFromChange: (v: string) => void;
  dateTo: string;
  onDateToChange: (v: string) => void;
  sortBy?: string;
  onSortChange?: (v: string) => void;
  onApply: () => void;
  onReset: () => void;
}

export default function FilterBar({ sportType, onSportChange, dateFrom, onDateFromChange, dateTo, onDateToChange, sortBy, onSortChange, onApply, onReset }: Props) {
  return (
    <div className="flex gap-2.5 items-end flex-wrap">
      <label className="flex flex-col gap-1">
        <span className="text-[0.64rem] uppercase tracking-[0.05em] text-[#666] font-[family-name:var(--font-text)] font-medium">类型</span>
        <select value={sportType} onChange={e => onSportChange(e.target.value)}
          className="rounded-xl border border-white/8 bg-white/4 px-3.5 py-2 text-[0.78rem] text-[#fafafa] min-w-[120px] outline-none transition focus:border-accent">
          {Object.entries(SPORT_TYPE_LABELS).map(([k, v]) => <option key={k} value={k} className="bg-black">{v}</option>)}
        </select>
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-[0.64rem] uppercase tracking-[0.05em] text-[#666] font-[family-name:var(--font-text)] font-medium">从</span>
        <input type="date" value={dateFrom} onChange={e => onDateFromChange(e.target.value)}
          className="rounded-xl border border-white/8 bg-white/4 px-3.5 py-2 text-[0.78rem] text-[#fafafa] outline-none transition focus:border-accent" />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-[0.64rem] uppercase tracking-[0.05em] text-[#666] font-[family-name:var(--font-text)] font-medium">到</span>
        <input type="date" value={dateTo} onChange={e => onDateToChange(e.target.value)}
          className="rounded-xl border border-white/8 bg-white/4 px-3.5 py-2 text-[0.78rem] text-[#fafafa] outline-none transition focus:border-accent" />
      </label>
      {sortBy && onSortChange && (
        <label className="flex flex-col gap-1">
          <span className="text-[0.64rem] uppercase tracking-[0.05em] text-[#666] font-[family-name:var(--font-text)] font-medium">排序</span>
          <select value={sortBy} onChange={e => onSortChange(e.target.value)}
            className="rounded-xl border border-white/8 bg-white/4 px-3.5 py-2 text-[0.78rem] text-[#fafafa] outline-none transition focus:border-accent">
            <option value="date-desc" className="bg-black">时间降序</option>
            <option value="date-asc" className="bg-black">时间升序</option>
            <option value="distance-desc" className="bg-black">距离降序</option>
            <option value="duration-desc" className="bg-black">时长降序</option>
          </select>
        </label>
      )}
      <button onClick={onApply} className="rounded-[22px] bg-accent px-[18px] py-2 text-[0.78rem] font-semibold text-black transition hover:bg-[#22c55e]">应用</button>
      <button onClick={onReset} className="rounded-[22px] border border-white/10 bg-transparent px-[18px] py-2 text-[0.78rem] text-[#999] transition hover:border-white/20 hover:text-[#fafafa]">重置</button>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/tabs/TabShell.tsx src/components/tabs/FilterBar.tsx && git commit -m "feat: add tab shell and filter bar components"
```

---

### Task 10: Overview Tab

**Files:**
- Create: `src/components/tabs/OverviewTab.tsx`

- [ ] **Step 1: Write OverviewTab.tsx**

```tsx
import { useData } from '../../context/DataContext';
import TabShell from './TabShell';
import MetricCard from '../ui/MetricCard';
import { BarChart, LineChart } from '../charts';

interface Props { active: boolean; onClose: () => void; }

export default function OverviewTab({ active, onClose }: Props) {
  const { summary } = useData();

  return (
    <TabShell active={active} onClose={onClose} title="概览 · 本月摘要">
      <div className="grid grid-cols-2 gap-3 mb-4">
        <MetricCard title="月度活动" chart={<BarChart data={[]} />} />
        <MetricCard title="月度距离" chart={<LineChart data={[]} />} />
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <MetricCard title="运动类型分布" chart={<BarChart data={[]} />} />
        <MetricCard title="训练负荷" chart={<LineChart data={[]} />} />
      </div>
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 text-[0.78rem] text-[#999] leading-relaxed font-[family-name:var(--font-text)]">
        <strong className="text-accent font-semibold">摘要</strong> — {summary.year}年至今共 {summary.totalActivities} 次活动，
        总距离 {(summary.totalDistance / 1000).toFixed(0)} km，
        总时长 {Math.floor(summary.totalDuration / 3600)}h。
      </div>
    </TabShell>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/tabs/OverviewTab.tsx && git commit -m "feat: add overview tab"
```

---

### Task 11: ECharts Chart Wrappers

**Files:**
- Create: `src/components/charts/LineChart.tsx`
- Create: `src/components/charts/BarChart.tsx`
- Create: `src/components/charts/PieChart.tsx`
- Create: `src/components/charts/AreaChart.tsx`

- [ ] **Step 1: Write LineChart.tsx**

```tsx
import ReactEChartsCore from 'echarts-for-react';

interface DataPoint { x: string; y: number; }

export function LineChart({ data, color = '#4ade80', area = false }: { data: DataPoint[]; color?: string; area?: boolean }) {
  const option = {
    grid: { left: 40, right: 16, top: 16, bottom: 28 },
    xAxis: { type: 'category', data: data.map(d => d.x), axisLine: { lineStyle: { color: '#333' } }, axisLabel: { color: '#666', fontSize: 11 } },
    yAxis: { type: 'value', splitLine: { lineStyle: { color: 'rgba(255,255,255,0.04)' } }, axisLabel: { color: '#666', fontSize: 11 } },
    series: [{
      data: data.map(d => d.y), type: 'line', smooth: true,
      lineStyle: { color, width: 2 },
      itemStyle: { color }, symbol: 'none',
      areaStyle: area ? { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color }, { offset: 1, color: 'transparent' }] }, opacity: 0.08 } : undefined,
    }],
    backgroundColor: 'transparent',
  };
  return <ReactEChartsCore option={option} style={{ height: 200 }} theme="dark" />;
}
```

- [ ] **Step 2: Write BarChart.tsx**

```tsx
import ReactEChartsCore from 'echarts-for-react';

interface DataPoint { x: string; y: number; }

export function BarChart({ data, color = '#4ade80' }: { data: DataPoint[]; color?: string }) {
  const option = {
    grid: { left: 40, right: 16, top: 16, bottom: 28 },
    xAxis: { type: 'category', data: data.map(d => d.x), axisLine: { lineStyle: { color: '#333' } }, axisLabel: { color: '#666', fontSize: 11 } },
    yAxis: { type: 'value', splitLine: { lineStyle: { color: 'rgba(255,255,255,0.04)' } }, axisLabel: { color: '#666', fontSize: 11 } },
    series: [{ data: data.map(d => d.y), type: 'bar', itemStyle: { color, borderRadius: [6, 6, 0, 0] }, barMaxWidth: 28 }],
    backgroundColor: 'transparent',
  };
  return <ReactEChartsCore option={option} style={{ height: 200 }} theme="dark" />;
}
```

- [ ] **Step 3: Write PieChart.tsx**

```tsx
import ReactEChartsCore from 'echarts-for-react';

interface Slice { name: string; value: number; color: string; }

export function PieChart({ data }: { data: Slice[] }) {
  const option = {
    series: [{
      type: 'pie', radius: ['55%', '78%'], center: ['50%', '50%'],
      data: data.map(d => ({ name: d.name, value: d.value, itemStyle: { color: d.color } })),
      label: { color: '#999', fontSize: 11 }, emphasis: { disabled: true },
    }],
    backgroundColor: 'transparent',
  };
  return <ReactEChartsCore option={option} style={{ height: 200 }} theme="dark" />;
}
```

- [ ] **Step 4: Write AreaChart.tsx** — delegate to LineChart with area=true

```tsx
export { LineChart as AreaChart } from './LineChart';
```

- [ ] **Step 5: Commit**

```bash
git add src/components/charts/ && git commit -m "feat: add ECharts chart wrapper components"
```

---

### Task 12: UI Components (MetricCard, DataTable, Badge, Button)

**Files:**
- Create: `src/components/ui/MetricCard.tsx`
- Create: `src/components/ui/DataTable.tsx`
- Create: `src/components/ui/Badge.tsx`
- Create: `src/components/ui/Button.tsx`

- [ ] **Step 1: Write MetricCard.tsx**

```tsx
import type { ReactNode } from 'react';

export default function MetricCard({ title, chart }: { title: string; chart: ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
      <h4 className="text-[0.72rem] uppercase tracking-[0.05em] text-[#666] font-[family-name:var(--font-text)] font-medium mb-3.5">{title}</h4>
      {chart}
    </div>
  );
}
```

- [ ] **Step 2: Write DataTable.tsx**

```tsx
interface Column { key: string; label: string; render?: (val: unknown, row: Record<string, unknown>) => React.ReactNode; }
interface Props { columns: Column[]; rows: Record<string, unknown>[]; onRowClick?: (row: Record<string, unknown>) => void; }

export default function DataTable({ columns, rows, onRowClick }: Props) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/5 bg-white/[0.02]">
      <table className="w-full border-collapse font-[family-name:var(--font-text)]">
        <thead>
          <tr className="border-b border-white/5 bg-white/[0.01]">
            {columns.map(c => (
              <th key={c.key} className="px-4 py-2.5 text-left text-[0.64rem] uppercase tracking-[0.05em] text-[#666] font-medium">{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} onClick={() => onRowClick?.(row)}
              className={`border-b border-white/[0.02] ${onRowClick ? 'cursor-pointer hover:bg-white/[0.02]' : ''}`}>
              {columns.map(c => (
                <td key={c.key} className="px-4 py-2.5 text-[0.76rem] text-[#999]">
                  {c.render ? c.render(row[c.key], row) : String(row[c.key] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 3: Write Badge.tsx**

```tsx
export default function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span className="inline-block rounded-xl px-2.5 py-1 text-[0.68rem] font-medium" style={{ background: `${color}33`, color }}>
      {label}
    </span>
  );
}
```

- [ ] **Step 4: Write Button.tsx**

```tsx
interface Props { children: React.ReactNode; primary?: boolean; onClick?: () => void; className?: string; disabled?: boolean; }

export default function Button({ children, primary, onClick, className = '', disabled }: Props) {
  return (
    <button onClick={onClick} disabled={disabled}
      className={`rounded-[22px] px-[18px] py-2 text-[0.78rem] font-semibold transition ${
        primary ? 'bg-accent text-black hover:bg-[#22c55e]' : 'border border-white/10 bg-transparent text-[#999] hover:border-white/20 hover:text-[#fafafa]'
      } disabled:opacity-50 ${className}`}>
      {children}
    </button>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/ && git commit -m "feat: add UI components (MetricCard, DataTable, Badge, Button)"
```

---

### Task 13: Trend, Body, Sleep, Activities Tabs

**Files:**
- Create: `src/components/tabs/TrendTab.tsx`
- Create: `src/components/tabs/BodyTab.tsx`
- Create: `src/components/tabs/SleepTab.tsx`
- Create: `src/components/tabs/ActivitiesTab.tsx`

- [ ] **Step 1: Write TrendTab.tsx**

```tsx
import { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import TabShell from './TabShell';
import FilterBar from './FilterBar';
import MetricCard from '../ui/MetricCard';
import { BarChart, AreaChart, LineChart } from '../charts';
import DataTable from '../ui/DataTable';
import type { ActivitySummary } from '../../types/coros';
import { SPORT_MAP } from '../../lib/constants';

interface Props { active: boolean; onClose: () => void; }

function groupByWeek(activities: ActivitySummary[]) {
  const weeks: Record<string, { distance: number; duration: number; count: number; load: number }> = {};
  activities.forEach(a => {
    const d = new Date(a.startTime);
    const weekStart = new Date(d.getTime() - d.getDay() * 86400000).toISOString().slice(0, 10);
    if (!weeks[weekStart]) weeks[weekStart] = { distance: 0, duration: 0, count: 0, load: 0 };
    weeks[weekStart].distance += a.totalDistance / 1000;
    weeks[weekStart].duration += a.totalTime / 3600;
    weeks[weekStart].count += 1;
    weeks[weekStart].load += a.trainingLoad;
  });
  return Object.entries(weeks).map(([week, d]) => ({ week, ...d }));
}

export default function TrendTab({ active, onClose }: Props) {
  const { activities } = useData();
  const [view, setView] = useState('week');
  const [sportType, setSportType] = useState('all');
  const [dateFrom, setDateFrom] = useState('2026-01-01');
  const [dateTo, setDateTo] = useState('2026-05-21');

  const filtered = useMemo(() => {
    let acts = activities;
    if (sportType !== 'all') {
      const typeId = Object.entries(SPORT_MAP).find(([, v]) => v.type === sportType)?.[0];
      if (typeId) acts = acts.filter(a => a.sportType === Number(typeId));
    }
    return acts.filter(a => a.startTime >= dateFrom && a.startTime <= dateTo);
  }, [activities, sportType, dateFrom, dateTo]);

  const weeks = useMemo(() => groupByWeek(filtered), [filtered]);

  return (
    <TabShell active={active} onClose={onClose} title="训练趋势">
      <FilterBar sportType={sportType} onSportChange={setSportType} dateFrom={dateFrom} onDateFromChange={setDateFrom}
        dateTo={dateTo} onDateToChange={setDateTo} onApply={() => {}} onReset={() => { setSportType('all'); setDateFrom('2026-01-01'); setDateTo('2026-05-21'); }} />
      <div className="grid grid-cols-2 gap-3 mt-4">
        <MetricCard title="每周距离趋势 (km)" chart={<BarChart data={weeks.map(w => ({ x: w.week, y: w.distance }))} />} />
        <MetricCard title="每周时长趋势 (h)" chart={<AreaChart data={weeks.map(w => ({ x: w.week, y: w.duration }))} area />} />
      </div>
      <div className="grid grid-cols-2 gap-3 mt-4">
        <MetricCard title="训练负荷趋势" chart={<LineChart data={weeks.map(w => ({ x: w.week, y: w.load }))} />} />
        <MetricCard title="活动次数" chart={<BarChart data={weeks.map(w => ({ x: w.week, y: w.count }))} color="#38bdf8" />} />
      </div>
      <div className="mt-4">
        <DataTable
          columns={[
            { key: 'week', label: '周' }, { key: 'distance', label: '距离(km)', render: (v) => Number(v).toFixed(1) },
            { key: 'duration', label: '时长(h)', render: (v) => Number(v).toFixed(1) },
            { key: 'count', label: '活动' }, { key: 'load', label: '负荷', render: (v) => Math.round(Number(v)) },
          ]}
          rows={weeks.slice(-10).reverse()}
        />
      </div>
    </TabShell>
  );
}
```

- [ ] **Step 2: Write BodyTab.tsx** (structured identically with HRV, RHR, load charts + daily records table)

Same pattern as TrendTab — uses `dailyRecords` from data context, charts for HRV/RHR/load/stamina, DataTable for daily records.

- [ ] **Step 3: Write SleepTab.tsx** (sleep phase charts + records table)

Same pattern — uses `sleepRecords`, pie chart for phase distribution, line charts for quality/HR.

- [ ] **Step 4: Write ActivitiesTab.tsx** (full activity list with filters + click to detail)

```tsx
import { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import TabShell from './TabShell';
import FilterBar from './FilterBar';
import DataTable from '../ui/DataTable';
import Badge from '../ui/Badge';
import { SPORT_MAP } from '../../lib/constants';
import type { ActivitySummary } from '../../types/coros';

interface Props { active: boolean; onClose: () => void; onSelectActivity: (a: ActivitySummary) => void; }

export default function ActivitiesTab({ active, onClose, onSelectActivity }: Props) {
  const { activities } = useData();
  const [sportType, setSportType] = useState('all');
  const [dateFrom, setDateFrom] = useState('2026-01-01');
  const [dateTo, setDateTo] = useState('2026-05-21');
  const [sortBy, setSortBy] = useState('date-desc');

  const filtered = useMemo(() => {
    let acts = [...activities];
    if (sportType !== 'all') {
      const typeId = Object.entries(SPORT_MAP).find(([, v]) => v.type === sportType)?.[0];
      if (typeId) acts = acts.filter(a => a.sportType === Number(typeId));
    }
    acts = acts.filter(a => a.startTime >= dateFrom && a.startTime <= dateTo);
    acts.sort((a, b) => {
      switch (sortBy) {
        case 'distance-desc': return b.totalDistance - a.totalDistance;
        case 'duration-desc': return b.totalTime - a.totalTime;
        case 'date-asc': return a.startTime.localeCompare(b.startTime);
        default: return b.startTime.localeCompare(a.startTime);
      }
    });
    return acts;
  }, [activities, sportType, dateFrom, dateTo, sortBy]);

  return (
    <TabShell active={active} onClose={onClose} title="活动记录">
      <FilterBar sportType={sportType} onSportChange={setSportType} dateFrom={dateFrom} onDateFromChange={setDateFrom}
        dateTo={dateTo} onDateToChange={setDateTo} sortBy={sortBy} onSortChange={setSortBy}
        onApply={() => {}} onReset={() => { setSportType('all'); setDateFrom('2026-01-01'); setDateTo('2026-05-21'); setSortBy('date-desc'); }} />
      <div className="mt-4">
        <DataTable
          columns={[
            { key: 'startTime', label: '日期', render: (v) => String(v).slice(0, 10) },
            { key: 'sportType', label: '类型', render: (v) => { const s = SPORT_MAP[Number(v)]; return s ? <Badge label={s.name} color={s.color} /> : '—'; } },
            { key: 'name', label: '名称' },
            { key: 'totalDistance', label: '距离(km)', render: (v) => (Number(v) / 1000).toFixed(2) },
            { key: 'totalTime', label: '时长', render: (v) => { const s = Number(v); const h = Math.floor(s / 3600); const m = Math.floor((s % 3600) / 60); return h > 0 ? `${h}:${String(m).padStart(2, '0')}:00` : `${m}min`; } },
            { key: 'avgHeartRate', label: '心率', render: (v) => v ? `${v} bpm` : '—' },
            { key: 'totalAscent', label: '爬升(m)', render: (v) => v || '—' },
            { key: 'trainingLoad', label: '负荷', render: (v) => v ? Math.round(Number(v)) : '—' },
            { key: 'action', label: '', render: (_, row) => <span className="text-accent">→</span> },
          ]}
          rows={filtered}
          onRowClick={(row) => onSelectActivity(row as unknown as ActivitySummary)}
        />
      </div>
    </TabShell>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/tabs/ && git commit -m "feat: add trend, body, sleep, and activities tabs"
```

---

### Task 14: Activity Detail Drawer

**Files:**
- Create: `src/components/detail/ActivityDetail.tsx`

- [ ] **Step 1: Write ActivityDetail.tsx**

```tsx
import { useEffect, useState } from 'react';
import TabShell from '../tabs/TabShell';
import MetricCard from '../ui/MetricCard';
import DataTable from '../ui/DataTable';
import { LineChart, PieChart } from '../charts';
import { useCorosApi } from '../../hooks/useCorosApi';
import { SPORT_MAP } from '../../lib/constants';
import type { ActivitySummary, ActivityDetail as ActivityDetailType, LapData } from '../../types/coros';

interface Props { activity: ActivitySummary | null; onClose: () => void; }

export default function ActivityDetail({ activity, onClose }: Props) {
  const [detail, setDetail] = useState<ActivityDetailType | null>(null);
  const { fetchActivityDetail } = useCorosApi();

  useEffect(() => {
    if (activity) { fetchActivityDetail(activity.id).then(setDetail); }
  }, [activity, fetchActivityDetail]);

  if (!activity) return null;
  const sport = SPORT_MAP[activity.sportType] ?? { name: '未知', color: '#666' };

  return (
    <TabShell active={!!activity} onClose={onClose} title="">
      <div className="flex items-center gap-3 mb-4">
        <span className="w-[11px] h-[11px] rounded-full" style={{ background: sport.color }} />
        <div>
          <div className="text-lg font-medium">{activity.name}</div>
          <div className="text-[0.73rem] text-[#666] mt-1">{activity.startTime} · {sport.name}</div>
        </div>
      </div>

      <div className="grid grid-cols-6 gap-3 mb-4">
        {[
          { label: '距离', value: `${(activity.totalDistance / 1000).toFixed(2)}`, unit: 'km' },
          { label: '时长', value: (() => { const h = Math.floor(activity.totalTime / 3600); const m = Math.floor((activity.totalTime % 3600) / 60); const s = activity.totalTime % 60; return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`; })(), unit: '' },
          { label: '爬升', value: `${activity.totalAscent || 0}`, unit: 'm' },
          { label: '心率', value: `${activity.avgHeartRate || '—'}`, unit: 'bpm' },
          { label: '消耗', value: `${activity.totalCalories || 0}`, unit: 'kcal' },
          { label: '负荷', value: `${activity.trainingLoad || '—'}`, unit: '' },
        ].map(m => (
          <div key={m.label} className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-center">
            <div className="text-xl font-medium text-[#fafafa]">{m.value}<span className="text-[0.7rem] text-[#666] ml-0.5">{m.unit}</span></div>
            <div className="text-[0.62rem] uppercase tracking-[0.05em] text-[#666] mt-1">{m.label}</div>
          </div>
        ))}
      </div>

      {detail && (
        <>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <MetricCard title="配速 & 海拔" chart={<LineChart data={detail.elevationData?.map(e => ({ x: `${(e.distance/1000).toFixed(1)}km`, y: e.elevation })) ?? []} />} />
            <MetricCard title="心率区间" chart={<PieChart data={detail.heartRateZones?.map(z => ({ name: z.name, value: z.duration, color: ['#4ade80','#facc15','#f97316','#ef4444','#dc2626'][z.zone - 1] ?? '#666' })) ?? []} />} />
          </div>
          <DataTable
            columns={[
              { key: 'index', label: '#' }, { key: 'distance', label: '距离(km)', render: (v) => (Number(v)/1000).toFixed(2) },
              { key: 'duration', label: '时长', render: (v) => { const s=Number(v); return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`; } },
              { key: 'pace', label: '配速', render: (v) => v ? `${Math.floor(Number(v)/60)}'${String(Math.round(Number(v)%60)).padStart(2,'0')}"` : '—' },
              { key: 'heartRate', label: '心率' },
              { key: 'cadence', label: '步频' },
              { key: 'ascent', label: '爬升(m)' },
            ]}
            rows={(detail.lapData ?? []) as unknown as Record<string, unknown>[]}
          />
        </>
      )}
    </TabShell>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/detail/ActivityDetail.tsx && git commit -m "feat: add activity detail drawer"
```

---

### Task 15: Wire Everything in App.tsx

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Write final App.tsx with all tabs and detail drawer**

```tsx
import { useState, useRef, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider, useData } from './context/DataContext';
import LoginOverlay from './components/layout/LoginOverlay';
import TerrainMap, { type TerrainMapHandle } from './components/background/TerrainMap';
import NavBar from './components/layout/NavBar';
import Hero from './components/layout/Hero';
import StatsPanel from './components/layout/StatsPanel';
import ActivityRail from './components/layout/ActivityRail';
import OverviewTab from './components/tabs/OverviewTab';
import TrendTab from './components/tabs/TrendTab';
import BodyTab from './components/tabs/BodyTab';
import SleepTab from './components/tabs/SleepTab';
import ActivitiesTab from './components/tabs/ActivitiesTab';
import ActivityDetail from './components/detail/ActivityDetail';
import type { ActivitySummary } from './types/coros';

function AppShell() {
  const { isLoggedIn } = useAuth();
  const { summary, activities, dailyRecords, sleepRecords, syncLoading, syncData } = useData();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedActivity, setSelectedActivity] = useState<ActivitySummary | null>(null);
  const mapRef = useRef<TerrainMapHandle>(null);

  if (!isLoggedIn) return <LoginOverlay />;

  return (
    <>
      <TerrainMap ref={mapRef} />
      <div className="vignette fixed inset-0 z-[1] pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.5)_100%)]" />

      <NavBar activeTab={activeTab} onTabChange={setActiveTab} onSync={syncData}
        syncLoading={syncLoading} mapRef={mapRef} />

      {activeTab === 'overview' && (
        <>
          <Hero year={2026} startMonth="1" endMonth="5" />
          <StatsPanel stats={[
            { label: '2026 活动', value: String(summary.totalActivities), unit: '次' },
            { label: '总距离', value: (summary.totalDistance / 1000).toFixed(0), unit: 'km' },
            { label: '总时长', value: String(Math.floor(summary.totalDuration / 3600)), unit: 'h' },
            { label: '总消耗', value: `${(summary.totalCalories / 1000).toFixed(1)}k`, unit: 'kcal' },
          ]} />
          <ActivityRail activities={activities} onSelect={setSelectedActivity} />
        </>
      )}

      <OverviewTab active={activeTab === 'overview' && !selectedActivity} onClose={() => setActiveTab('overview')} />
      {/* Overview tab when clicked on nav — show trends instead since overview is the default state */}
      <TrendTab active={activeTab === 'trend'} onClose={() => setActiveTab('overview')} />
      <BodyTab active={activeTab === 'body'} onClose={() => setActiveTab('overview')} data={dailyRecords} />
      <SleepTab active={activeTab === 'sleep'} onClose={() => setActiveTab('overview')} data={sleepRecords} />
      <ActivitiesTab active={activeTab === 'activities'} onClose={() => setActiveTab('overview')} onSelectActivity={setSelectedActivity} />
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
```

- [ ] **Step 2: Build and verify**

```bash
npm run build
```
Expected: clean TypeScript compilation, no errors.

- [ ] **Step 3: Commit**

```bash
git add src/App.tsx && git commit -m "feat: wire all components in App.tsx"
```

---

### Task 16: Cloudflare Pages Functions (API Proxy)

**Files:**
- Create: `functions/api/login.ts`
- Create: `functions/api/activities.ts`
- Create: `functions/api/activity-detail.ts`
- Create: `functions/api/dashboard.ts`
- Create: `functions/api/sleep.ts`
- Create: `functions/api/daily.ts`

Note: The COROS API proxy is a fallback for environments where direct browser-to-COROS requests fail. The React app calls COROS directly from the browser by default. These Functions provide a proxy alternative.

- [ ] **Step 1: Write functions/api/login.ts**

```typescript
import { md5Hash, COROS_BASE_URLS } from '../_lib/coros';

export async function onRequestPost({ request, env }: { request: Request; env: any }) {
  const { email, password, region } = await request.json() as { email: string; password: string; region: string };
  const baseUrl = COROS_BASE_URLS[region] ?? COROS_BASE_URLS.cn;
  const hash = await md5Hash(password);

  const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ account: email, password: hash, accountType: 2 }),
  });

  if (!res.ok) return new Response(JSON.stringify({ error: 'login failed' }), { status: 401 });
  const data = await res.json();
  return new Response(JSON.stringify({ accessToken: data.accessToken, userId: data.userId }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
```

- [ ] **Step 2: Write remaining Function endpoints** (activities, detail, dashboard, sleep, daily) — each validates token, forwards to COROS API, returns JSON.

- [ ] **Step 3: Deploy to Cloudflare**

```bash
npx wrangler pages deploy dist
```

---

### Task 17: Polish and Final Build

- [ ] **Step 1: Test full sync flow** — login with real COROS credentials, click sync, verify data populates all tabs
- [ ] **Step 2: Test tab navigation** — switch between all 5 tabs, verify filter interactions
- [ ] **Step 3: Test activity detail** — click activity from rail or table, verify detail drawer opens with charts
- [ ] **Step 4: Test terrain interactions** — drag map, zoom, verify auto-orbit resumes after 5s idle; click 轨迹视角 to reset
- [ ] **Step 5: Build and deploy final version**

```bash
npm run build && npx wrangler pages deploy dist
```
