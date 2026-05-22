# COROS API 接口数据文档

> 最后更新：2026-05-22  
> 本文档基于当前代码库自动生成，后续 API 变化请同步更新此文档。

---

## 一、系统架构概览

```
用户浏览器                        Cloudflare Pages            COROS 服务器
    │                                  │                          │
    │  POST /api/coros/{region}/...    │                          │
    ├─────────────────────────────────>│  fetch({region}api.coros.com)  │
    │                                  ├─────────────────────────>│
    │                                  │  <── JSON Response ────│
    │  <── CORS JSON Response ───────│                          │
```

- **开发环境**：Vite dev server 代理 `/api/coros/{region}/*` → `team{region}api.coros.com/*`
- **生产环境**：Cloudflare Pages Functions 代理，文件在 `functions/api/*.ts`
- **认证**：所有数据请求通过 Header 传递 `accessToken` 和可选的 `yfheader: {"userId":"..."}`

---

## 二、COROS 服务器区域

| 区域代码 | 区域名称 | API 地址 |
|---------|---------|---------|
| `cn` | 中国大陆 | `https://teamcnapi.coros.com` |
| `eu` | 欧洲 | `https://teameuapi.coros.com` |
| `us` | 美国 | `https://teamusapi.coros.com` |
| `asia` | 亚太 | `https://teamapapi.coros.com` |

> **注意**：登录请求始终使用用户所选区域的 API；登录后所有数据查询必须在对应区域进行。

---

## 三、API 接口清单

### 3.1 账号登录 `POST /account/login`

**状态**：✅ 正常可用（所有区域）

| 项目 | 说明 |
|------|------|
| 方法 | `POST` |
| 路径 | `/account/login` |
| Auth | 无需 Token |
| Content-Type | `application/json` |

**请求体**：
```json
{
  "account": "user@example.com",
  "pwd": "<MD5加密后的密码>",
  "accountType": 2
}
```

**密码加密**：使用 MD5 哈希（客户端 `blueimp-md5`，服务端自定义实现）。

**成功响应** （`result: "0000"`）：
```json
{
  "result": "0000",
  "message": "OK",
  "data": {
    "accessToken": "xxx",
    "userId": "123456",
    "nickname": "用户昵称"
  }
}
```

**返回字段**：

| 字段 | 类型 | 说明 |
|------|------|------|
| `accessToken` | string | 访问令牌，后续所有 API 请求必须携带 |
| `userId` | string | 用户唯一标识 |
| `nickname` | string | 用户昵称 |

**错误码**：
- 非 `0000` 的 result 均表示登录失败
- 常见错误：账号密码不匹配、网络异常

---

### 3.2 活动列表查询 `POST /activity/query`

**状态**：✅ 正常可用（CN 区域已验证）

| 项目 | 说明 |
|------|------|
| 方法 | `POST` |
| 路径 | `/activity/query` |
| Auth | Header: `accessToken` |
| Content-Type | `application/json` |

**请求 Headers**：
```
accessToken: <登录返回的token>
Content-Type: application/json
yfheader: {"userId":"<用户ID>"}   // 可选，CN 区域建议携带
```

**请求体**：
```json
{
  "size": 100,
  "pageNumber": 1
}
```

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `size` | number | 100 | 每页条数，建议 ≤1000 |
| `pageNumber` | number | 1 | 页码，从 1 开始 |

**成功响应**：
```json
{
  "result": "0000",
  "data": {
    "count": 250,
    "dataList": [
      {
        "labelId": "12345678",
        "name": "晨跑",
        "sportType": 100,
        "sportName": "跑步",
        "startTime": 1711234567,
        "endTime": 1711241767,
        "totalTime": 7200,
        "distance": 15000,
        "calorie": 650,
        "avgHr": 145,
        "ascent": 120,
        "descent": 115,
        "avgCadence": 175,
        "avgSpeed": 208,
        "maxSpeed": 350,
        "device": "COROS PACE 3",
        "step": 12000,
        "workoutTime": 6900,
        "trainingLoad": 85
      }
    ]
  }
}
```

### 3.3 活动原始字段 → 系统字段映射

> 以下为 `/activity/query` 返回的原始字段与前端 `ActivitySummary` 类型的映射关系。

| COROS API 字段 | 系统字段 | 类型 | 单位 | 说明 |
|---------------|---------|------|------|------|
| `labelId` | `id` | string | — | 活动唯一标识 |
| `name` | `name` | string | — | 活动名称（可自定义） |
| `sportType` | `sportType` | number | — | 运动类型代码（见 3.4） |
| `sportName` | `sportName` | string | — | 运动类型名称 |
| `startTime` | `startTime` | string(Unix秒) | — | 开始时间（Unix 时间戳） |
| `endTime` | `endTime` | string(Unix秒) | — | 结束时间（Unix 时间戳） |
| `totalTime` | `totalTime` | number | 秒 | 总活动时长 |
| `distance` | `totalDistance` | number | 米 | 总距离 |
| `calorie` | `totalCalories` | number | 千卡 | 总消耗热量 |
| `avgHr` | `avgHeartRate` | number | bpm | 平均心率 |
| — | `maxHeartRate` | number | bpm | _暂不可用（固定为 0）_ |
| — | `avgPace` | number | 秒/公里 | 平均配速（由 `totalTime / (distance/1000)` 计算） |
| `ascent` | `totalAscent` | number | 米 | 累计爬升 |
| `descent` | `descent` | number | 米 | 累计下降 |
| `avgCadence` | `avgCadence` | number | 步/分钟 | 平均步频 |
| `avgSpeed` | `avgSpeed` | number | cm/s(×100) | 平均速度（显示时 /100 转为 m/s） |
| `maxSpeed` | `maxSpeed` | number | cm/s(×100) | 最大速度（显示时 /100 转为 m/s） |
| `device` | `device` | string | — | 设备名称 |
| `step` | `step` | number | 步 | 总步数 |
| `workoutTime` | `workoutTime` | number | 秒 | 有效运动时长 |
| `trainingLoad` | `trainingLoad` | number | — | 训练负荷 |

### 3.4 运动类型对照表

| sportType 代码 | 运动名称 | 分类 | 颜色 |
|---------------|---------|------|------|
| `100` | 跑步 | `running` | 🟢 `#4ade80` |
| `102` | 越野跑 | `trailRunning` | 🟢 `#22c55e` |
| `104` | 登山 | `hiking` | 🟡 `#facc15` |
| `200` | 公路骑行 | `cycling` | 🔵 `#38bdf8` |
| `201` | 山地骑行 | `cycling` | 🔵 `#38bdf8` |
| `301` | 游泳 | `swimming` | 🟢 `#34d399` |
| `400` | 力量训练 | `strength` | 🟣 `#c084fc` |

### 3.5 数据分析 Dashboard `GET /analyse/dashboard`

**状态**：❌ **不可用**（CN 区域返回 500，端点在 CN API 上未开放）

| 项目 | 说明 |
|------|------|
| 方法 | `GET` |
| 路径 | `/analyse/dashboard` |
| Auth | Header: `accessToken`, `yfheader` |

> **当前替代方案**：前端通过聚合全部活动数据，自行计算概览统计。

### 3.6 活动详情查询 `POST /activity/detail/query`

**状态**：❌ **不可用**（CN 区域返回 1019 错误）

| 项目 | 说明 |
|------|------|
| 方法 | `POST` |
| 路径 | `/activity/detail/query` |
| Auth | Header: `accessToken`, `yfheader` |
| 请求体 | `{ "activityId": "xxx" }` |

> **当前替代方案**：点击活动直接展示 ActivitySummary 中已有的摘要数据，不请求详情接口。
> 详细分段数据（圈速 LapData、心率区间 HeartRateZone、海拔曲线 ElevationPoint、配速曲线 PacePoint）需 COROS 开放此接口后才能获取。

### 3.7 睡眠数据 `GET /sleep/list`

**状态**：❌ **不可用**（CN 区域返回 500）

| 项目 | 说明 |
|------|------|
| 方法 | `GET` |
| 路径 | `/sleep/list?size=365` |
| Auth | Header: `accessToken`, `yfheader` |

> **当前替代方案**：`sleepRecords` 返回空数组，睡眠页面无实际数据显示。

### 3.8 每日记录 / 身体数据

**状态**：⚠️ **部分可用**

| 项目 | 说明 |
|------|------|
| 原始接口 | 无独立 API 可获取 HRV/VO2max/体力等数据 |
| 替代方案 | 从活动数据按日期聚合计算 `dailyRecords` |

**聚合计算逻辑**（位于 `useCorosApi.ts:syncAll`）：
- 按日期分组活动，累加距离、时长、热量、训练负荷
- `trainingLoad` = 当日所有活动训练负荷之和
- `hrv` / `restingHeartRate` / `vo2max` / `stamina` = 无数据源，目前为 0
- `fatigue` = 简单估算值

---

## 四、TypeScript 类型定义速查

### ActivitySummary（活动摘要）
```typescript
{
  id: string;            // 活动ID
  name: string;          // 活动名称
  sportType: number;     // 运动类型代码
  sportName: string;     // 运动类型名称
  startTime: string;     // 开始时间（Unix秒）
  totalTime: number;     // 总时长（秒）
  totalDistance: number; // 总距离（米）
  totalCalories: number; // 消耗热量（千卡）
  avgHeartRate: number;  // 平均心率（bpm）
  maxHeartRate: number;  // 最大心率（不可用，=0）
  avgPace: number;       // 平均配速（秒/公里，计算值）
  totalAscent: number;   // 累计爬升（米）
  trainingLoad: number;  // 训练负荷
  // 扩展字段（可能为 undefined）
  endTime?: string;      // 结束时间
  descent?: number;      // 累计下降（米）
  avgCadence?: number;   // 平均步频
  avgSpeed?: number;     // 平均速度（cm/s）
  maxSpeed?: number;     // 最大速度（cm/s）
  device?: string;       // 设备名称
  step?: number;         // 步数
  workoutTime?: number;  // 有效运动时长（秒）
}
```

### DailyRecord（每日记录）
```typescript
{
  date: string;              // 日期 YYYY-MM-DD
  hrv: number;               // HRV（暂不可用，=0）
  hrvBaseline: number;       // HRV基线（暂不可用，=0）
  restingHeartRate: number;  // 静息心率（暂不可用，=0）
  trainingLoad: number;      // 训练负荷（聚合自活动）
  loadRatio: number;         // 负荷比率（暂不可用，=0）
  vo2max: number;            // VO2max（暂不可用，=0）
  stamina: number;           // 体力（暂不可用，=0）
  fatigue: number;           // 疲劳度（简单估算值）
}
```

### SleepRecord（睡眠记录）
```typescript
{
  date: string;              // 日期 YYYY-MM-DD
  totalDuration: number;     // 总时长（分钟）
  deepSleepDuration: number; // 深睡时长
  lightSleepDuration: number;// 浅睡时长
  remDuration: number;       // REM时长
  awakeDuration: number;     // 清醒时长
  avgHeartRate: number;      // 平均心率
  qualityScore: number;      // 质量评分
}
```
> **全部字段当前不可用**，API 未开放。

### ActivityDetail（活动详情）— 预留类型
```typescript
// 包含 ActivitySummary 所有字段，另增加：
{
  lapData: LapData[];              // 圈速数据（不可用）
  heartRateZones: HeartRateZone[]; // 心率区间（不可用）
  elevationData: ElevationPoint[]; // 海拔曲线（不可用）
  paceData: PacePoint[];           // 配速曲线（不可用）
}
```

### DashboardSummary（仪表盘概览）
```typescript
{
  year: number;              // 年份
  totalActivities: number;   // 活动总数
  totalDistance: number;     // 总距离（米）
  totalDuration: number;     // 总时长（秒）
  totalCalories: number;     // 总热量（千卡）
  activities: ActivitySummary[]; // 全部活动列表
}
```

---

## 五、数据可用性总结

| 数据类别 | 可用性 | 数据来源 | 说明 |
|---------|--------|---------|------|
| **活动列表** | ✅ 完整 | `/activity/query` | 包含全部字段，分页获取 |
| **活动详情** | ⚠️ 摘要 | ActivitySummary | 无圈速/心率区间/海拔数据 |
| **每日体能** | ⚠️ 部分 | 活动聚合计算 | HRV/VO2max/体力 无数据源 |
| **睡眠数据** | ❌ 无 | — | API 未开放 |
| **训练负荷** | ✅ 完整 | 活动数据 | 每次活动含 trainingLoad |
| **步数** | ⚠️ 部分 | 活动数据 | 仅部分活动含 step 字段 |
| **卡路里** | ✅ 完整 | 活动数据 | 每次活动含 calorie |

---

## 六、系统数据流

```
1. 用户登录 → POST /account/login (MD5密码) → 获取 accessToken + userId
                        │
2. 同步数据 → POST /activity/query (分页获取全部活动)
                        │
3. 前端处理：
   ├── 活动列表 (activities) — 直接映射
   ├── 每日记录 (dailyRecords) — 按日期聚合活动
   ├── 睡眠记录 (sleepRecords) — 空数组
   └── 概览统计 (summary) — 聚合计算
                        │
4. 页面展示：
   ├── 概览页 — Hero + StatsPanel + ActivityRail + 3D地图
   ├── 趋势页 — 周度聚合图表 + 筛选
   ├── 身体页 — 每日数据表格 + 图表 (缺HRV/VO2max)
   ├── 睡眠页 — 空数据占位
   └── 活动页 — 活动列表 + 筛选排序 + 活动详情
```

---

## 七、已知限制与后续增强方向

### 当前限制
1. **无睡眠数据** — `/sleep/list` 接口不可用
2. **无活动详情分段数据** — `/activity/detail/query` 返回 1019
3. **无 HRV/VO2max/体力** — 无对应接口
4. **无 Dashboard 聚合接口** — `/analyse/dashboard` 返回 500
5. **仅 CN 区域验证** — 其他区域接口可用性未知

### 可增强方向（待 API 开放后）
| 功能 | 所需接口 | 数据内容 |
|------|---------|---------|
| 睡眠分析 | `/sleep/list` | 睡眠阶段、质量趋势、深睡/REM 分布 |
| 活动深度分析 | `/activity/detail/query` | 圈速、心率区间分布、海拔剖面、配速曲线 |
| 身体状态 | 身体数据接口 | HRV 趋势、VO2max 变化、体力恢复、静息心率 |
| 训练建议 | 训练负荷接口 | 负荷比率、恢复状态、训练建议 |
| 路线可视化 | 活动轨迹接口 | GPS 轨迹坐标，匹配地图渲染 |

---

## 八、修改记录

| 日期 | 版本 | 修改内容 |
|------|------|---------|
| 2026-05-22 | v1.0 | 初始版本，完整梳理现有接口与数据 |
