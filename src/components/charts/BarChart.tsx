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
