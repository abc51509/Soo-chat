import React from 'react';

export default function CalendarModal({ currentMonthEvents }) {
  return (
    <div className="absolute inset-0 bg-slate-950/95 z-50 flex flex-col text-white backdrop-blur-md animate-fade-in">
      <div className="pt-12 pb-5 px-5 bg-[#4E727A] flex items-center justify-start shadow-md border-b border-[#3D5C63] shrink-0">
        <span className="font-bold text-xl tracking-wider text-white">CALENDAR</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-between">
        <div>
          <div className="text-center mb-4">
            <span className="text-sm font-semibold tracking-widest text-[#81D4D2]">
              NOVEMBER 2026
            </span>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-slate-400 mb-2">
            <span>SUN</span><span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span>
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: 35 }).map((_, i) => {
              const dayNum = i + 1;
              const matchedEvents = currentMonthEvents.filter((ev) => {
                if (!ev.date) return false;
                const parts = ev.date.replace(/[^\d]/g, ' ').trim().split(/\s+/);
                return parts.length >= 3 && parseInt(parts[2], 10) === dayNum;
              });
              const hasSchedule = matchedEvents.length > 0;

              return (
                <div
                  key={i}
                  className={`aspect-square rounded-lg p-1.5 flex flex-col justify-between border ${
                    dayNum <= 30
                      ? 'bg-slate-900/60 border-white/5 hover:border-[#81D4D2]/40 transition'
                      : 'bg-transparent border-transparent opacity-10'
                  }`}
                >
                  <span className="text-[10px] font-mono text-slate-400">
                    {dayNum <= 30 ? dayNum : ''}
                  </span>
                  {hasSchedule && dayNum <= 30 && (
                    <div className="w-1.5 h-1.5 rounded-full bg-[#81D4D2] self-end"></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white/5 rounded-2xl p-4 space-y-2 border border-white/10 mt-4 max-h-52 overflow-y-auto">
          <span className="text-xs font-semibold text-[#81D4D2] tracking-wider block">
            11 月重點行程
          </span>
          {currentMonthEvents.map((ev, idx) => (
            <div key={idx} className="flex items-start space-x-2 text-[11.5px] text-slate-300">
              <span className="text-teal-400 font-mono shrink-0">•</span>
              <span>
                {ev.title} {ev.status ? `(${ev.status})` : ''}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
