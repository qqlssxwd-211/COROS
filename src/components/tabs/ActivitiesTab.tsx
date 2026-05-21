import { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import TabShell from './TabShell';
import FilterBar from './FilterBar';
import DataTable from '../ui/DataTable';
import Badge from '../ui/Badge';
import { SPORT_MAP } from '../../lib/constants';
import type { ActivitySummary, SportType } from '../../types/coros';

interface Props { active: boolean; onClose: () => void; onSelectActivity: (a: ActivitySummary) => void; }

export default function ActivitiesTab({ active, onClose, onSelectActivity }: Props) {
  const { activities } = useData();
  const [sportType, setSportType] = useState<SportType>('all');
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
            { key: 'totalAscent', label: '爬升(m)', render: (v) => v != null ? String(v) : '—' },
            { key: 'trainingLoad', label: '负荷', render: (v) => v ? Math.round(Number(v)) : '—' },
          ]}
          rows={filtered as unknown as Record<string, unknown>[]}
          onRowClick={(row) => onSelectActivity(row as unknown as ActivitySummary)}
        />
      </div>
    </TabShell>
  );
}
