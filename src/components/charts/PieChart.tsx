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
