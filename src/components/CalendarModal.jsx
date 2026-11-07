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

// 🌟 行程標題：來源-品牌-相簿名稱（不重複帶入日期）
const assembleScheduleTitle = (item) => {
  const parts = [];
  const source = getField(item, 'news_source', 'source');
  if (source) parts.push(source);

  const brand = getField(item, 'brand');
  if (brand) parts.push(brand);

  const albumName = (item.album_name || '').trim();
  if (albumName && albumName !== '所有相片' && albumName !== '未分類歸檔') {
    parts.push(albumName);
  }

  if (parts.length > 0) return parts.join('-');
  return (item.news_title || item.caption || '日程行程').trim();
};

export default function CalendarModal({ allMediaEvents = [], typeEmojiMap = {} }) {
  const currentYear = 2026;
  const currentMonth = 11;
  const currentDay = 7;

  const [viewYear, setViewYear] = useState(currentYear);
  const [viewMonth, setViewMonth] = useState(currentMonth);
  const [selectedDay, setSelectedDay] = useState(currentDay);

  const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();
  const firstDayWeek = new Date(viewYear, viewMonth - 1, 1).getDay();

  const prevMonth = () => {
    if (viewMonth === 1) {
      setViewYear((y) => y - 1);
      setViewMonth(12);
    } else {
      setViewMonth((m) => m - 1);
    }
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (viewMonth === 12) {
      setViewYear((y) => y + 1);
      setViewMonth(1);
    } else {
      setViewMonth((m) => m + 1);
    }
    setSelectedDay(null);
  };

  const selectedDayEvents = useMemo(() => {
    if (!selectedDay) return [];
    return allMediaEvents.filter(
      (e) => e.year === viewYear && e.month === viewMonth && e.day === selectedDay
    );
  }, [allMediaEvents, viewYear, viewMonth, selectedDay]);

  return (
    <div className="absolute inset-0 bg-[#0B1120] z-50 flex flex-col text-slate-100 backdrop-blur-md animate-fade-in select-none">
      {/* 頂部導航列：月份置中在 Bar 正中間下面 */}
      <div className="relative pt-14 pb-2.5 px-5 bg-[#4E727A] flex items-end justify-between border-b border-[#3D5C63] shadow-md shrink-0 h-[88px]">
        <span className="font-bold text-xl tracking-wider text-white leading-none z-10">
          CALENDAR
        </span>

        {/* 🌟 月份置中 */}
        <div className="absolute inset-x-0 bottom-2.5 flex items-center justify-center space-x-3 text-xs font-mono leading-none pointer-events-none">
          <button 
            onClick={prevMonth} 
            className="p-1 pointer-events-auto active:scale-90 text-white/80 hover:text-white"
          >
            ◀
          </button>
          <span className="text-[#81D4D2] font-bold text-sm tracking-wider">
            {viewYear}.{String(viewMonth).padStart(2, '0')}
          </span>
          <button 
            onClick={nextMonth} 
            className="p-1 pointer-events-auto active:scale-90 text-white/80 hover:text-white"
          >
            ▶
          </button>
        </div>

        <div className="w-8 z-10" />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* 月曆卡片本體 */}
        <div className="bg-[#1E293B]/80 rounded-2xl border border-slate-700/60 p-3.5 shadow-md">
          <div className="grid grid-cols-7 gap-1 text-center text-[10.5px] font-mono text-slate-400 mb-2">
            <span>SUN</span><span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: firstDayWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const isSelected = selectedDay === dayNum;
              const isToday = viewYear === currentYear && viewMonth === currentMonth && dayNum === currentDay;
              const dayEvents = allMediaEvents.filter(
                (e) => e.year === viewYear && e.month === viewMonth && e.day === dayNum
              );

              return (
                <div
                  key={dayNum}
                  onClick={() => setSelectedDay(dayNum)}
                  className={`aspect-square rounded-xl p-1 flex flex-col justify-between cursor-pointer transition active:scale-95 border ${
                    isSelected
                      ? 'bg-[#5FBDB9]/20 border-[#5FBDB9] text-white shadow-sm'
                      : isToday
                      ? 'bg-slate-800/90 border-[#81D4D2]/40 text-teal-200'
                      : 'bg-[#0F172A]/60 border-slate-700/40 hover:border-slate-600 text-slate-300'
                  }`}
                >
                  <span className={`text-[10.5px] font-mono font-medium ${isToday ? 'text-[#81D4D2] font-bold' : ''}`}>
                    {dayNum}
                  </span>
                  {/* 🌟 Emoji 標記 */}
                  <div className="flex flex-wrap gap-0.5 justify-end">
                    {dayEvents.slice(0, 3).map((ev, evIdx) => {
                      const ems = typeEmojiMap[ev.type?.toLowerCase()] || ['📅'];
                      return (
                        <span key={evIdx} className="text-[10px] leading-none">
                          {ems[0]}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 下方選取日期的行程顯示區 */}
        <div className="space-y-2.5 pb-6">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-mono text-teal-200 tracking-wider">
              {viewYear}.{String(viewMonth).padStart(2, '0')}.{selectedDay ? String(selectedDay).padStart(2, '0') : '--'} SCHEDULE
            </span>
            <span className="text-[10.5px] font-mono text-slate-400">
              {selectedDayEvents.length} EVENTS
            </span>
          </div>

          {selectedDayEvents.length > 0 ? (
            selectedDayEvents.map((ev, idx) => {
              const ems = typeEmojiMap[ev.type?.toLowerCase()] || ['📅'];
              return (
                <div
                  key={idx}
                  className="bg-[#1E293B]/80 rounded-2xl border border-slate-700/60 p-3.5 flex items-start space-x-3 shadow-sm"
                >
                  <span className="text-xl p-2 bg-slate-800/80 rounded-xl shrink-0 border border-white/5">
                    {ems[0]}
                  </span>
                  <div className="flex-1 min-w-0 space-y-1">
                    <h4 className="text-[13px] font-bold text-white leading-snug line-clamp-2">
                      {ev.title}
                    </h4>
                    {ev.status && (
                      <span className="inline-block bg-teal-950/60 text-[#81D4D2] border border-teal-500/30 text-[9.5px] px-2 py-0.5 rounded-full font-mono">
                        {ev.status}
                      </span>
                    )}
                    {ev.caption && (
                      <p className="text-[11px] text-slate-400 line-clamp-2 pt-0.5">
                        {ev.caption}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center text-slate-500 text-xs font-mono bg-[#1E293B]/30 rounded-2xl border border-slate-800">
              NO SCHEDULE ON THIS DAY
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
