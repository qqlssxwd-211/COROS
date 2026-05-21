export type Region = 'cn' | 'eu' | 'us' | 'asia';

export interface CorosCredentials {
  email: string;
  password: string;
  region: Region;
}

export interface AuthState {
  accessToken: string | null;
  userId: string | null;
  userName: string | null;
  region: Region;
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
