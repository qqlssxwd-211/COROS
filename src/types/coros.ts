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
  // Extended fields from API
  endTime?: string;
  descent?: number;
  avgCadence?: number;
  avgSpeed?: number;
  maxSpeed?: number;
  device?: string;
  step?: number;
  workoutTime?: number;
  // New fields from API analysis
  imageUrl?: string;       // 活动路线截图 URL（COROS CDN）
  maxSlope?: number;       // 最大坡度
  bestKm?: number;         // 最佳公里配速
  best?: number;           // 最佳速度
  avgPower?: number;       // 平均功率（骑行）
  np?: number;             // 标准化功率（骑行）
  avgStrkRate?: number;    // 平均划水频率（游泳）
  swolf?: number;          // SWOLF 指数（游泳）
  lengths?: number;        // 趟数（游泳）
  sets?: number;           // 组数（力量训练）
  totalReps?: number;      // 总次数（力量训练）
  downhillDist?: number;   // 下坡距离
  downhillTime?: number;   // 下坡时间
  totalDescent?: number;   // 总下降
  bodyTemperature?: number; // 体温
  waterTemperature?: number;// 水温（x100，游泳）
  mode?: number;            // 运动子模式
  cadence?: number;         // 步频/踏频
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
