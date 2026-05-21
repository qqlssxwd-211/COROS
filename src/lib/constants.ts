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
