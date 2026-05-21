# COROS 运动数据分析看板 — 设计规格

## 项目概述

一个基于 Web 的 COROS 运动数据多维度分析看板，支持多用户各自登录 COROS 账号，展示所有运动类型的全量历史数据，并提供丰富的筛选、排序和详情查询功能。

## 架构

- **前端**：Vite + React 18 + TypeScript + Tailwind CSS
- **后端**：Cloudflare Pages Functions（Worker），作为 COROS API 的代理层
- **部署**：Cloudflare Pages
- **数据源**：COROS REST API（teamapi.coros.com / teameuapi.coros.com）
- **认证**：MD5 密码哈希 + accessToken，按用户维度隔离

### 为什么用 Pages Functions 而非 Workers

Pages Functions 与前端代码同仓库、同部署，无需管理两个独立服务。每个用户的 COROS 凭证由 Worker 代理转发，不存储任何用户数据，无状态、无数据库。

## 页面结构

### 导航

- 顶部固定导航栏，毛玻璃效果
- 左侧：品牌标识 "COROS Dashboard"
- 中间：胶囊 Tab 导航（概览 / 趋势 / 身体 / 睡眠 / 活动）
- 右侧：当前用户标识 + 同步数据按钮 + 轨迹视角按钮

### 默认页：概览（2026 年至今摘要）

- 左下角 Hero 区域：年份标签、标题、描述文案
- 右侧悬浮统计面板：活动次数、总距离、总时长、总消耗
- 右下角最近活动卡片列表，点击进入活动详情

### 标签页通用结构

- 从底部滑入的全屏面板（半透明遮罩 + 毛玻璃内容区）
- 顶部拖拽手柄可关闭
- 筛选栏：运动类型下拉、日期范围选择、排序方式
- 应用/重置按钮
- 数据图表区（ECharts）+ 数据表格

### 趋势标签页

- 按周/月汇总的图表：距离趋势、时长趋势、训练负荷趋势、VO₂max 变化
- 周汇总数据表格

### 身体标签页

- HRV 趋势（夜间）+ 基线区间
- 静息心率趋势（RHR + 7 日均线）
- 训练负荷比率
- 体力水平
- 每日指标数据表

### 睡眠标签页

- 睡眠阶段堆叠图（深睡/浅睡/REM/清醒）
- 质量评分趋势
- 睡眠心率区间图
- 阶段占比环形图
- 睡眠记录表

### 活动标签页

- 按类型、日期、排序筛选的全部活动列表
- 点击某条活动 → 打开活动详情底部抽屉

### 活动详情抽屉

- 活动基本信息头部（类型、日期、名称）
- 6 个指标卡片：距离、时长、爬升、心率、消耗、负荷
- 配速+海拔曲线（ECharts 双 Y 轴）
- 心率区间分布（环形图）
- 分段数据表格
- AI 摘要文本

## 背景：3D 地图

使用 **MapLibre GL JS** 渲染真实地形与卫星影像：

- **卫星影像**：高德卫星瓦片（国内访问快）
- **地形高程**：Mapzen Terrarium 瓦片（免费、全球覆盖）
- **展示区域**：四川贡嘎山（29.58°N, 101.9°E），海拔 7556m
- **交互**：支持拖拽平移、缩放、旋转，停止操作 5 秒后自动恢复环绕
- **轨迹**：2 条 GPS 路线（绿色登山 + 黄色骑行），带移动光点
- **视角复位**：导航栏按钮一键回到初始视角

## 视觉设计

- **配色**：全黑背景（#000），白色/灰色文字，绿色（#4ade80）仅用于按钮和关键强调元素
- **字体**：Neue Haas Grotesk Display Pro 55 Roman（标题）、Neue Haas Grotesk Text Pro（正文）
- **效果**：毛玻璃（backdrop-filter blur）、半透明暗色卡片（rgba(10,10,10,0.92)）、0.06 透明度白色边框
- **动效**：CSS transition/flyTo 动画，无 Framer Motion 依赖

## 数据流

```
用户浏览器 → Cloudflare Pages Function → COROS API
                ↑ 附加用户 accessToken
                ↓ 返回 JSON 数据
用户浏览器 ← React 组件渲染 ← ECharts 绑定
```

- 用户点击"同步数据"→ 触发 Worker 调用 COROS API 全量拉取
- Worker 不存储数据，透传响应
- 前端在内存中缓存当前会话数据

## 技术依赖

- React 18 + TypeScript
- Vite（构建工具）
- Tailwind CSS 3.4
- lucide-react（图标）
- ECharts（图表）
- MapLibre GL JS 4.5（3D 地图背景）
- Cloudflare Pages + Pages Functions

## 多用户支持

每位用户使用自己的 COROS 账号密码登录。Worker 为每个请求附加对应用户的 accessToken，不共享、不持久化。页面顶部显示当前登录用户名。
