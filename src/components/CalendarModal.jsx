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

// 🌟 行程標題專用：來源-品牌-相簿名稱（絕不重複顯示年月日）
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
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();

  const [viewYear, setViewYear] = useState(currentYear);
  const [viewMonth, setViewMonth] = useState(currentMonth);
  const [selectedDay, setSelectedDay] = useState(currentDay);

  // 星期標題
  const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  // 計算該月份天數與第一天星期幾
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

  const resetToToday = () => {
    setViewYear(currentYear);
    setViewMonth(currentMonth);
    setSelectedDay(currentDay);
  };

  // 選中日期的行程
  const selectedDayEvents = useMemo(() => {
    if (!selectedDay) return [];
    return allMediaEvents.filter(
      (e) => e.year === viewYear && e.month === viewMonth && e.day === selectedDay
    );
  }, [allMediaEvents, viewYear, viewMonth, selectedDay]);

  // 本月所有行程數量
  const currentMonthEventCount = useMemo(() => {
    return allMediaEvents.filter(
      (e) => e.year === viewYear && e.month === viewMonth
    ).length;
  }, [allMediaEvents, viewYear, viewMonth]);

  return (
    <div className="absolute inset-0 bg-[#0B1120] z-50 flex flex-col text-slate-100 backdrop-blur-md animate-fade-in select-none">
      {/* 頂部導航列：h-[88px] pt-14 pb-2.5 items-end 貼底 */}
      <div className="pt-14 pb-2.5 px-5 bg-[#4E727A] flex items-end justify-between border-b border-[#3D5C63] shadow-md shrink-0 h-[88px]">
        <div className="flex items-baseline space-x-2">
          <span className="font-bold text-xl tracking-wider text-white leading-none">
            CALENDAR
          </span>
          <span className="text-[11px] text-teal-200/80 font-mono leading-none">
            {currentMonthEventCount} EVENTS
          </span>
        </div>

        {/* 年月切換小膠囊 */}
        <div className="flex items-center space-x-1.5 bg-black/25 px-2 py-1 rounded-full border border-white/10 text-xs font-mono leading-none">
          <button 
            onClick={prevMonth} 
            className="w-5 h-5 rounded-full flex items-center justify-center text-white/70 hover:text-white active:scale-75 transition"
          >
            ◀
          </button>
          <span 
            onClick={resetToToday} 
            title="回到今天"
            className="text-[#81D4D2] font-bold px-1 tracking-wider cursor-pointer active:scale-95 transition"
          >
            {viewYear}.{String(viewMonth).padStart(2, '0')}
          </span>
          <button 
            onClick={nextMonth} 
            className="w-5 h-5 rounded-full flex items-center justify-center text-white/70 hover:text-white active:scale-75 transition"
          >
            ▶
          </button>
        </div>
      </div>

      {/* 內容滑動區 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* 月曆卡片本體 */}
        <div className="bg-[#1E293B]/85 rounded-3xl border border-slate-700/60 p-4 shadow-xl backdrop-blur-sm">
          {/* 星期抬頭 */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10.5px] font-mono font-semibold text-slate-400 mb-2.5">
            {weekDays.map((wd, i) => (
              <span key={i} className={i === 0 || i === 6 ? 'text-teal-300/70' : ''}>
                {wd}
              </span>
            ))}
          </div>

          {/* 7x6 月曆網格 */}
          <div className="grid grid-cols-7 gap-1.5">
            {/* 上月留白 */}
            {Array.from({ length: firstDayWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square rounded-xl opacity-0 pointer-events-none" />
            ))}

            {/* 本月每日 */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const isSelected = selectedDay === dayNum;
              const isToday = viewYear === currentYear && viewMonth === currentMonth && dayNum === currentDay;

              // 當日行程
              const dayEvents = allMediaEvents.filter(
                (e) => e.year === viewYear && e.month === viewMonth && e.day === dayNum
              );

              return (
                <div
                  key={dayNum}
                  onClick={() => setSelectedDay(dayNum)}
                  className={`aspect-square rounded-2xl p-1.5 flex flex-col justify-between cursor-pointer transition-all duration-150 active:scale-95 relative border ${
                    isSelected
                      ? 'bg-[#5FBDB9]/25 border-[#5FBDB9] shadow-md shadow-[#5FBDB9]/20 text-white'
                      : isToday
                      ? 'bg-slate-800/90 border-[#81D4D2]/60 text-teal-200'
                      : 'bg-[#0F172A]/50 border-slate-700/40 hover:border-slate-600/80 text-slate-300'
                  }`}
                >
                  {/* 日期數字 */}
                  <span className={`text-[11px] font-mono font-medium leading-none ${isToday ? 'text-[#81D4D2] font-bold' : ''}`}>
                    {dayNum}
                  </span>

                  {/* 當天 Emoji 標記列 */}
                  <div className="flex flex-wrap gap-0.5 justify-end items-end min-h-[14px]">
                    {dayEvents.slice(0, 3).map((ev, evIdx) => {
                      const ems = typeEmojiMap[ev.type?.toLowerCase()] || ['📅'];
                      return (
                        <span 
                          key={evIdx} 
                          className="text-[10.5px] leading-none transform transition-transform hover:scale-125"
                        >
                          {ems[0]}
                        </span>
                      );
                    })}
                    {dayEvents.length > 3 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#81D4D2] mb-0.5" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 下方選中日期的行程清單 */}
        <div className="space-y-3 pb-8">
          <div className="flex items-center justify-between px-1.5 pt-1">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#81D4D2] animate-pulse" />
              <span className="text-xs font-mono font-semibold text-slate-300 tracking-wider">
                {viewYear}.{String(viewMonth).padStart(2, '0')}.{selectedDay ? String(selectedDay).padStart(2, '0') : '--'}
              </span>
            </div>
            <span className="text-[11px] font-mono text-teal-300/80">
              {selectedDayEvents.length} SCHEDULED
            </span>
          </div>

          {selectedDayEvents.length > 0 ? (
            selectedDayEvents.map((ev, idx) => {
              const ems = typeEmojiMap[ev.type?.toLowerCase()] || ['📅'];
              const scheduleTitle = assembleScheduleTitle(ev);

              return (
                <div
                  key={idx}
                  className="bg-[#1E293B]/85 rounded-2xl border border-slate-700/60 p-3.5 flex items-start space-x-3.5 shadow-md transition-all hover:border-slate-600"
                >
                  {/* 大 Emoji 圖示 */}
                  <div className="w-11 h-11 rounded-2xl bg-slate-800/90 border border-white/10 flex items-center justify-center shrink-0 text-xl shadow-inner">
                    {ems[0]}
                  </div>

                  {/* 行程詳情 */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      {/* 🌟 只顯示來源-品牌-相簿名稱，不再重複出現年月日 */}
                      <h4 className="text-[13px] font-bold text-white leading-snug truncate">
                        {scheduleTitle}
                      </h4>
                      {ev.status && (
                        <span className="shrink-0 bg-teal-950/70 text-[#81D4D2] border border-teal-500/30 text-[9px] px-2 py-0.5 rounded-full font-mono">
                          {ev.status}
                        </span>
                      )}
                    </div>

                    {/* 照片縮圖（若有的話） */}
                    {ev.images && ev.images.length > 0 && (
                      <div className="flex space-x-1.5 pt-1 overflow-x-auto scrollbar-none">
                        {ev.images.slice(0, 4).map((imgUrl, imgIdx) => (
                          <div key={imgIdx} className="w-12 h-12 rounded-lg overflow-hidden bg-slate-800 border border-white/10 shrink-0">
                            <img src={imgUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 內文說明 / Caption */}
                    {ev.caption && (
                      <p className="text-[11.5px] text-slate-400 leading-relaxed whitespace-pre-wrap pt-0.5">
                        {ev.caption}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-10 text-center text-slate-500 text-xs font-mono bg-[#1E293B]/30 rounded-2xl border border-slate-800/80">
              NO SCHEDULE ON THIS DAY
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
