import React, { useState, useRef, useMemo } from 'react';

const MONTH_NAMES = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
];

const MONTH_ABBR = [
  'Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'Jun.',
  'Jul.', 'Aug.', 'Sep.', 'Oct.', 'Nov.', 'Dec.'
];

export default function CalendarModal({ allMediaEvents = [], typeEmojiMap = {} }) {
  const today = useMemo(() => new Date(), []);
  const maxYear = today.getFullYear();
  const maxMonth = today.getMonth(); // 0-based
  const minYear = 2006;
  const minMonth = 0; // 2006 年 1 月

  const [viewYear, setViewYear] = useState(maxYear);
  const [viewMonth, setViewMonth] = useState(maxMonth);

  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const canGoPrev = viewYear > minYear || (viewYear === minYear && viewMonth > minMonth);
  const canGoNext = viewYear < maxYear || (viewYear === maxYear && viewMonth < maxMonth);

  const handlePrevMonth = () => {
    if (!canGoPrev) return;
    if (viewMonth === 0) {
      setViewYear(prev => prev - 1);
      setViewMonth(11);
    } else {
      setViewMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (!canGoNext) return;
    if (viewMonth === 11) {
      setViewYear(prev => prev + 1);
      setViewMonth(0);
    } else {
      setViewMonth(prev => prev + 1);
    }
  };

  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const onTouchEnd = (e) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;

    if (Math.abs(deltaX) > 50 && Math.abs(deltaY) < 50) {
      if (deltaX < 0) {
        handleNextMonth();
      } else if (deltaX > 0 && touchStartX.current > 60) {
        handlePrevMonth();
      }
    }
  };

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  // 🌟 依年、月純數字比對當前月份行程，並優先依 settings 中的 typeEmojiMap 分配 Emoji
  const currentMonthNum = viewMonth + 1;
  const activeMonthEvents = useMemo(() => {
    return (allMediaEvents || [])
      .filter(ev => ev.year === viewYear && ev.month === currentMonthNum)
      .map(ev => {
        const typeKey = (ev.type || ev.status || '').toLowerCase().trim();
        // 優先從 settings 試算表對應，沒有的話預設 ✨
        const emojiPool = typeEmojiMap[typeKey] || ['✨'];
        const randomEmoji = emojiPool[Math.floor(Math.random() * emojiPool.length)];

        return {
          ...ev,
          emoji: randomEmoji
        };
      })
      .sort((a, b) => a.day - b.day);
  }, [allMediaEvents, viewYear, currentMonthNum, typeEmojiMap]);

  return (
    <div
      className="absolute inset-0 bg-slate-950/95 z-50 flex flex-col text-white backdrop-blur-md animate-fade-in select-none"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* 頂部標題列 */}
      <div className="pt-12 pb-5 px-5 bg-[#4E727A] flex items-center justify-start shadow-md border-b border-[#3D5C63] shrink-0">
        <span className="font-bold text-xl tracking-wider text-white">CALENDAR</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-between">
        <div>
          {/* 月份切換列 */}
          <div className="flex items-center justify-between px-2 mb-4">
            <button
              onClick={handlePrevMonth}
              disabled={!canGoPrev}
              className={`p-1.5 rounded-full transition active:scale-90 ${
                canGoPrev ? 'text-slate-300 hover:text-white hover:bg-white/10' : 'text-slate-600 opacity-30 cursor-not-allowed'
              }`}
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
              </svg>
            </button>

            <div className="text-center">
              <span className="text-sm font-semibold tracking-widest text-[#81D4D2]">
                {MONTH_NAMES[viewMonth]} {viewYear}
              </span>
            </div>

            <button
              onClick={handleNextMonth}
              disabled={!canGoNext}
              className={`p-1.5 rounded-full transition active:scale-90 ${
                canGoNext ? 'text-slate-300 hover:text-white hover:bg-white/10' : 'text-slate-600 opacity-30 cursor-not-allowed'
              }`}
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
              </svg>
            </button>
          </div>

          {/* 星期標頭 */}
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-slate-400 mb-2 font-mono">
            <span>SUN</span><span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span>
          </div>

          {/* 日曆格子 (純數字比對 ev.day === dayNum) */}
          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square bg-transparent" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dayEvents = activeMonthEvents.filter(ev => ev.day === dayNum);

              return (
                <div
                  key={`day-${dayNum}`}
                  className="aspect-square rounded-lg p-1.5 flex flex-col justify-between border bg-slate-900/60 border-white/5 hover:border-[#81D4D2]/40 transition relative overflow-hidden"
                >
                  <span className="text-[10px] font-mono text-slate-400 leading-none">{dayNum}</span>
                  
                  {dayEvents.length > 0 && (
                    <div className="flex items-center justify-end self-end">
                      <span className="text-sm select-none leading-none filter drop-shadow">
                        {dayEvents[0].emoji}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 下方重點行程條列 */}
        <div className="bg-white/5 rounded-2xl p-4 space-y-2 border border-white/10 mt-4 max-h-52 overflow-y-auto">
          <span className="text-xs font-semibold text-[#81D4D2] tracking-wider block font-mono">
            {MONTH_ABBR[viewMonth]} Schedule
          </span>
          {activeMonthEvents.length > 0 ? (
            activeMonthEvents.map((ev, idx) => (
              <div key={idx} className="flex items-start space-x-2 text-[11.5px] text-slate-300">
                <span className="text-xs shrink-0 select-none">{ev.emoji}</span>
                <span className="leading-snug">
                  <strong className="text-white font-mono mr-1.5">{ev.rawDate}</strong>
                  <span>{ev.title}</span>
                  {ev.status && <span className="text-slate-400 ml-1 text-[10.5px]">({ev.status})</span>}
                </span>
              </div>
            ))
          ) : (
            <p className="text-[11px] text-slate-500 font-light">無排定行程</p>
          )}
        </div>
      </div>
    </div>
  );
}
