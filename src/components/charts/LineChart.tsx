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

interface ScatterPoint { x: number; y: number; label?: string; }

export function ScatterChart({ data, xLabel, yLabel, color = '#4ade80' }: { data: ScatterPoint[]; xLabel: string; yLabel: string; color?: string }) {
  const option = {
    grid: { left: 50, right: 16, top: 16, bottom: 32 },
    xAxis: { type: 'value', name: xLabel, nameTextStyle: { color: '#666', fontSize: 11 }, axisLine: { lineStyle: { color: '#333' } }, axisLabel: { color: '#666', fontSize: 11 }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.04)' } } },
    yAxis: { type: 'value', name: yLabel, nameTextStyle: { color: '#666', fontSize: 11 }, axisLine: { lineStyle: { color: '#333' } }, axisLabel: { color: '#666', fontSize: 11 }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.04)' } } },
    series: [{
      data: data.map(d => ({ value: [d.x, d.y], name: d.label ?? '' })), type: 'scatter',
      itemStyle: { color }, symbolSize: 10,
      emphasis: { scale: 1.5 },
    }],
    tooltip: {
      trigger: 'item',
      formatter: (p: { name: string; value: number[] }) => {
        const name = p.name ? `<b>${p.name}</b><br/>` : '';
        return `${name}${xLabel}: ${p.value[0].toFixed(1)}<br/>${yLabel}: ${Math.round(p.value[1])}`;
      },
    } as unknown,
    backgroundColor: 'transparent',
  };
  return <ReactEChartsCore option={option} style={{ height: 200 }} theme="dark" />;
}
