import React, { useMemo } from 'react';
import { UserStats } from '../../types';

interface ActivityHeatmapProps {
  stats: UserStats;
}

export const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({ stats }) => {
  const { weeks, monthLabels } = useMemo(() => {
    const today = new Date();
    const monthsData: { label: string; index: number }[] = [];
    const activityMap = stats.activityMap || {}; // Safety check
    
    // Generate last ~105 days
    const days = [];
    for (let i = 104; i >= 0; i--) { 
      const d = new Date();
      d.setDate(d.getDate() - i);
      
      // Use LOCAL date string to match StatsService logic (Fixes UTC mismatch bug)
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const dayStr = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${dayStr}`;

      const count = activityMap[dateStr] || 0;
      
      // Get intensity
      let intensity = 0; 
      if (count > 0) intensity = 1;
      if (count > 5) intensity = 2;
      if (count > 15) intensity = 3;
      if (count > 30) intensity = 4;

      days.push({ date: dateStr, count, intensity, obj: d });
    }

    // Organize into weeks (Grid)
    const gridWeeks: any[] = [];
    let currentWeek: any[] = new Array(7).fill(null);
    
    days.forEach((day) => {
      const dayIndex = day.obj.getDay(); // 0 = Sunday, 1 = Mon...
      
      currentWeek[dayIndex] = day;
      
      if (dayIndex === 6) { // Saturday, close week
        gridWeeks.push(currentWeek);
        currentWeek = new Array(7).fill(null);
      }
    });
    // Push last partial week
    if (currentWeek.some(d => d !== null)) {
      gridWeeks.push(currentWeek);
    }
    
    // Month labels logic
    let lastMonth = -1;
    gridWeeks.forEach((week, index) => {
        const firstDay = week.find((d: any) => d !== null);
        if (firstDay) {
            const m = firstDay.obj.getMonth();
            if (m !== lastMonth) {
                monthsData.push({ 
                    label: firstDay.obj.toLocaleString('sk-SK', { month: 'short' }), 
                    index 
                });
                lastMonth = m;
            }
        }
    });

    return { weeks: gridWeeks, monthLabels: monthsData };
  }, [stats]);

  const getColor = (intensity: number) => {
    switch (intensity) {
      case 0: return 'bg-neutral-800';
      case 1: return 'bg-red-900/60';
      case 2: return 'bg-red-700';
      case 3: return 'bg-red-600';
      case 4: return 'bg-red-500';
      default: return 'bg-neutral-800';
    }
  };

  return (
    <div className="w-full overflow-hidden">
      {/* Months Header */}
      <div className="flex text-[10px] text-gray-500 mb-1 relative h-4">
          {monthLabels.map((m, i) => (
             <span key={i} style={{ left: `${(m.index / weeks.length) * 100}%` }} className="absolute">
                 {m.label}
             </span>
          ))}
      </div>

      {/* Grid */}
      <div className="flex gap-[3px]">
        {weeks.map((week, wIndex) => (
          <div key={wIndex} className="flex flex-col gap-[3px]">
            {week.map((day: any, dIndex: number) => {
                if (!day) return <div key={dIndex} className="w-2.5 h-2.5" />; 
                
                return (
                    <div 
                        key={day.date}
                        className={`w-2.5 h-2.5 rounded-[2px] ${getColor(day.intensity)}`}
                        title={`${day.date}: ${day.count} akcií`}
                    />
                );
            })}
          </div>
        ))}
      </div>
      
      <div className="flex items-center justify-end mt-2 space-x-1 text-[9px] text-gray-600">
          <span>Menej</span>
          <div className="w-2 h-2 rounded-[1px] bg-neutral-800"></div>
          <div className="w-2 h-2 rounded-[1px] bg-red-900/60"></div>
          <div className="w-2 h-2 rounded-[1px] bg-red-700"></div>
          <div className="w-2 h-2 rounded-[1px] bg-red-500"></div>
          <span>Viac</span>
      </div>
    </div>
  );
};