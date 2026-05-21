import { useState, useMemo, useCallback } from 'react';
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

  // Draft filter state (UI)
  const [sportType, setSportType] = useState<SportType>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');

  // Applied filter state
  const [appliedSport, setAppliedSport] = useState<SportType>('all');
  const [appliedFrom, setAppliedFrom] = useState('');
  const [appliedTo, setAppliedTo] = useState('');
  const [appliedSort, setAppliedSort] = useState('date-desc');

  const handleSearch = useCallback(() => {
    setAppliedSport(sportType);
    setAppliedFrom(dateFrom);
    setAppliedTo(dateTo);
    setAppliedSort(sortBy);
  }, [sportType, dateFrom, dateTo, sortBy]);

  const handleReset = useCallback(() => {
    setSportType('all'); setDateFrom(''); setDateTo(''); setSortBy('date-desc');
    setAppliedSport('all'); setAppliedFrom(''); setAppliedTo(''); setAppliedSort('date-desc');
  }, []);

  const filtered = useMemo(() => {
    let acts = [...activities];
    if (appliedSport !== 'all') {
      const typeId = Object.entries(SPORT_MAP).find(([, v]) => v.type === appliedSport)?.[0];
      if (typeId) acts = acts.filter(a => a.sportType === Number(typeId));
    }
    if (appliedFrom || appliedTo) {
      const fromTs = appliedFrom ? new Date(appliedFrom).getTime() / 1000 : 0;
      const toTs = appliedTo ? new Date(appliedTo).getTime() / 1000 + 86400 : Infinity;
      acts = acts.filter(a => {
        const ts = Number(a.startTime);
        return ts >= fromTs && ts < toTs;
      });
    }
    acts.sort((a, b) => {
      switch (appliedSort) {
        case 'distance-desc': return b.totalDistance - a.totalDistance;
        case 'duration-desc': return b.totalTime - a.totalTime;
        case 'date-asc': return a.startTime.localeCompare(b.startTime);
        default: return b.startTime.localeCompare(a.startTime);
      }
    });
    return acts;
  }, [activities, appliedSport, appliedFrom, appliedTo, appliedSort]);

  return (
    <TabShell active={active} onClose={onClose} title="活动记录">
      <FilterBar sportType={sportType} onSportChange={setSportType} dateFrom={dateFrom} onDateFromChange={setDateFrom}
        dateTo={dateTo} onDateToChange={setDateTo} sortBy={sortBy} onSortChange={setSortBy}
        onSearch={handleSearch} onReset={handleReset} />
      <div className="mt-1 text-[0.68rem] text-[#555]">显示 {filtered.length} 条活动</div>
      <div className="mt-3">
        <DataTable
          columns={[
            { key: 'startTime', label: '日期', render: (v) => { const ts = Number(v); return ts > 0 ? new Date(ts * 1000).toISOString().slice(0, 10) : '—'; } },
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
