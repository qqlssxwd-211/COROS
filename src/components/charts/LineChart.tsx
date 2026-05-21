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

export { LineChart as AreaChart };
