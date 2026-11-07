import React, { useState, useMemo } from 'react';

const getField = (obj, ...keys) => {
  if (!obj) return '';
  for (const k of keys) {
    const cleanKey = k.toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (obj[k]?.trim()) return obj[k].trim();
    if (obj[cleanKey]?.trim()) return obj[cleanKey].trim();
  }
  return '';
};

export default function CalendarModal({ mediaData = [], typeEmojiMap = {} }) {
  const currentYear = 2026;
  const currentMonth = 11;

  const [viewYear, setViewYear] = useState(currentYear);
  const [viewMonth, setViewMonth] = useState(currentMonth);

  // 🌟 日曆自給自足資料處理
  const allMediaEvents = useMemo(() => {
    return mediaData
      .map(m => {
        const rawDate = getField(m, 'date');
        if (!rawDate) return null;
        const parts = rawDate.split(',');
        if (parts.length < 3) return null;

        const year = parseInt(parts[0].trim(), 10);
        const month = parseInt(parts[1].trim(), 10);
        const day = parseInt(parts[2].trim(), 10);
        if (isNaN(year) || isNaN(month) || isNaN(day)) return null;

        return {
          year,
          month,
          day,
          title: m.album_name || m.news_title || m.caption || '日程',
          type: getField(m, 'type', 'sub_type', 'subtype', 'category')
        };
      })
      .filter(Boolean);
  }, [mediaData]);

  const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();
  const firstDayWeek = new Date(viewYear, viewMonth - 1, 1).getDay();

  const prevMonth = () => {
    if (viewMonth === 1) {
      setViewYear(y => y - 1);
      setViewMonth(12);
    } else {
      setViewMonth(m => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 12) {
      setViewYear(y => y + 1);
      setViewMonth(1);
    } else {
      setViewMonth(m => m + 1);
    }
  };

  return (
    <div className="absolute inset-0 bg-[#0B1120] z-50 flex flex-col text-slate-100 backdrop-blur-md animate-fade-in select-none">
      {/* 🌟 頂部導航列：pt-14 pb-2.5 items-end，文字完全靠近 bar 底部 */}
      <div className="pt-14 pb-2.5 px-5 bg-[#4E727A] flex items-end justify-between border-b border-[#3D5C63] shadow-md shrink-0 h-[88px]">
        <span className="font-bold text-xl tracking-wider text-white leading-none">CALENDAR</span>
        <div className="flex items-center space-x-2 text-xs font-mono">
          <button onClick={prevMonth} className="p-1 active:scale-90">◀</button>
          <span className="text-[#81D4D2] font-bold">{viewYear}.{String(viewMonth).padStart(2, '0')}</span>
          <button onClick={nextMonth} className="p-1 active:scale-90">▶</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* 星期抬頭 */}
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-mono text-slate-400 mb-2">
          <span>SUN</span><span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span>
        </div>

        {/* 月曆網格 */}
        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: firstDayWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const events = allMediaEvents.filter(
              e => e.year === viewYear && e.month === viewMonth && e.day === dayNum
            );
            return (
              <div
                key={dayNum}
                className="aspect-square bg-[#1E293B]/70 rounded-xl border border-slate-700/60 p-1 flex flex-col justify-between"
              >
                <span className="text-[10px] font-mono text-slate-300">{dayNum}</span>
                <div className="flex flex-wrap gap-0.5 justify-end">
                  {events.map((ev, evIdx) => {
                    const ems = typeEmojiMap[ev.type?.toLowerCase()] || ['📅'];
                    return <span key={evIdx} className="text-[10px]">{ems[0]}</span>;
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
