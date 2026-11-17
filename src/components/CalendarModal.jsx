import React, { useState, useRef, useMemo } from 'react';

const MONTH_NAMES = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
];

const MONTH_ABBR = [
  'Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'Jun.',
  'Jul.', 'Aug.', 'Sep.', 'Oct.', 'Nov.', 'Dec.'
];

const getField = (obj, ...keys) => {
  if (!obj) return '';
  for (const k of keys) {
    const cleanKey = k.toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (obj[k]?.trim()) return obj[k].trim();
    if (obj[cleanKey]?.trim()) return obj[cleanKey].trim();
  }
  return '';
};

const pad2 = (n) => String(n).padStart(2, '0');

const formatYMD = (y, m, d) => `${y},${pad2(m)},${pad2(d)}`;

// 解析 YYYY,MM,DD 或 YYYY/M/D 格式
const parseDateParts = (raw) => {
  if (!raw) return null;
  const parts = String(raw).split(/[,/\-.]+/).map(s => s.trim()).filter(Boolean);
  if (parts.length < 3) return null;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
  return { year, month, day };
};

// 往前推算 N 個月（自動處理月底天數邊界，例如 5/31 往前 3 個月 -> 2/28 或 2/29）
const subtractMonths = (year, month, day, monthsToSub) => {
  let targetMonth = month - monthsToSub;
  let targetYear = year;
  while (targetMonth <= 0) {
    targetMonth += 12;
    targetYear -= 1;
  }
  const maxDaysInTarget = new Date(targetYear, targetMonth, 0).getDate();
  const targetDay = Math.min(day, maxDaysInTarget);
  return { year: targetYear, month: targetMonth, day: targetDay };
};

// 英文序數後綴（1st, 2nd, 3rd, 38th）
const getOrdinalSuffix = (num) => {
  const mod100 = num % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${num}th`;
  switch (num % 10) {
    case 1: return `${num}st`;
    case 2: return `${num}nd`;
    case 3: return `${num}rd`;
    default: return `${num}th`;
  }
};

export default function CalendarModal({
  allMediaEvents = [],
  masterMedia = [],
  anniversaries = [],
  typeEmojiMap = {}
}) {
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

  // 從 settings 取得對應 type 的 emoji（固定穩定選取，避免重新渲染跳動）
  const resolveTypeEmoji = (typeKey, seed = 0, fallback = '✨') => {
    const cleanKey = (typeKey || '').toLowerCase().trim();
    const pool = typeEmojiMap[cleanKey];
    if (pool && pool.length > 0) {
      return pool[seed % pool.length];
    }
    return fallback;
  };

  // 🌟 整合處理：排除 selfie/gym/car、班機起降、mag/int 雙軌（發行＋往前3個月拍攝）、一般行程、以及每年固定重複紀念日
  const currentMonthNum = viewMonth + 1;
  const activeMonthEvents = useMemo(() => {
    const events = [];
    const seenKeys = new Set();

    // 1. 處理 settings 每年固定重複紀念日（優先用 D 欄 anniversary_emoji，未填則退回 typeEmojiMap['anniversary']，不設預設 icon）
    (anniversaries || []).forEach((ann, idx) => {
      const parsed = parseDateParts(ann.date);
      if (!parsed) return;
      if (parsed.month !== currentMonthNum) return;
      if (viewYear < parsed.year) return;

      const diffYears = viewYear - parsed.year;
      const ordinalPrefix = diffYears > 0 ? `${getOrdinalSuffix(diffYears)} ` : '';
      const displayTitle = `${ordinalPrefix}${ann.display || ann.name || ''}`.trim();
      const dateStr = formatYMD(viewYear, parsed.month, parsed.day);
      const dedupeKey = `ann_${dateStr}_${displayTitle}`;

      if (!seenKeys.has(dedupeKey)) {
        seenKeys.add(dedupeKey);
        const annEmoji = (ann.emoji || '').trim() || resolveTypeEmoji('anniversary', idx, '');
        events.push({
          year: viewYear,
          month: parsed.month,
          day: parsed.day,
          rawDate: dateStr,
          title: displayTitle,
          emoji: annEmoji
        });
      }
    });

    // 2. 處理 media 分頁行程（若無傳入 masterMedia 則安全退回 allMediaEvents）
    const sourceRows = (masterMedia && masterMedia.length > 0) ? masterMedia : allMediaEvents;

    sourceRows.forEach((m, idx) => {
      const rawDate = getField(m, 'date', 'rawDate');
      const parsed = parseDateParts(rawDate);
      if (!parsed) return;

      const rawType = getField(m, 'type', 'sub_type', 'subtype', 'category');
      const typeLower = rawType.toLowerCase().trim();

      // 排除自拍、健身、車子
      if (['selfie', 'gym', 'car'].includes(typeLower)) return;

      const newsSource = getField(m, 'news_source', 'source');
      const brand = getField(m, 'brand');
      const albumName = getField(m, 'album_name');
      const issue = getField(m, 'issue');
      const location = getField(m, 'location');

      // ♦️ 班機（起飛 / 降落，兼容 Flight / Filght 拼法與 emoji）
      const isDeparture =
        typeLower.includes('🛫') ||
        typeLower.includes('departure') ||
        typeLower.includes('takeoff');
      const isArrival =
        typeLower.includes('🛬') ||
        typeLower.includes('arrival') ||
        typeLower.includes('landing');

      if (isDeparture || isArrival) {
        if (parsed.year === viewYear && parsed.month === currentMonthNum) {
          const flightEmoji = isDeparture ? '🛫' : '🛬';
          const dateStr = formatYMD(parsed.year, parsed.month, parsed.day);
          const titleText = location || albumName || 'Flight';
          const dedupeKey = `flight_${flightEmoji}_${dateStr}_${titleText}`;

          if (!seenKeys.has(dedupeKey)) {
            seenKeys.add(dedupeKey);
            events.push({
              year: parsed.year,
              month: parsed.month,
              day: parsed.day,
              rawDate: dateStr,
              title: titleText,
              emoji: flightEmoji
            });
          }
        }
        return;
      }

      // ♦️ mag / int（一筆拆成兩個日曆行程：原日期 Release + 往前推三個月 Shooting）
      const isMagOrInt = ['mag', 'magazine', 'int', 'interview'].includes(typeLower);
      if (isMagOrInt) {
        // 第 1 種：符合原本日期的發行日
        if (parsed.year === viewYear && parsed.month === currentMonthNum) {
          const dateStr = formatYMD(parsed.year, parsed.month, parsed.day);
          const releaseParts = [newsSource, albumName, issue, 'Release'].filter(Boolean);
          const releaseTitle = releaseParts.join(' ');
          const dedupeKey = `mag_rel_${dateStr}_${releaseTitle}`;

          if (!seenKeys.has(dedupeKey)) {
            seenKeys.add(dedupeKey);
            events.push({
              year: parsed.year,
              month: parsed.month,
              day: parsed.day,
              rawDate: dateStr,
              title: releaseTitle,
              emoji: resolveTypeEmoji(typeLower, idx)
            });
          }
        }

        // 第 2 種：往前推三個月的拍攝日（優先抓 news_source，沒有才抓 brand）
        const shootDate = subtractMonths(parsed.year, parsed.month, parsed.day, 3);
        if (shootDate.year === viewYear && shootDate.month === currentMonthNum) {
          const shootDateStr = formatYMD(shootDate.year, shootDate.month, shootDate.day);
          const subject = newsSource || brand || albumName;
          const shootTitle = [subject, 'Shooting'].filter(Boolean).join(' ');
          const dedupeKey = `mag_shoot_${shootDateStr}_${shootTitle}`;

          if (!seenKeys.has(dedupeKey)) {
            seenKeys.add(dedupeKey);
            events.push({
              year: shootDate.year,
              month: shootDate.month,
              day: shootDate.day,
              rawDate: shootDateStr,
              title: shootTitle,
              emoji: '📷'
            });
          }
        }
        return;
      }

      // ♦️ 一般情況（show / official / award 等）：icon date brand album_name location
      if (parsed.year === viewYear && parsed.month === currentMonthNum) {
        const dateStr = formatYMD(parsed.year, parsed.month, parsed.day);
        const generalParts = [brand, albumName, location].filter(Boolean);
        const generalTitle = generalParts.length > 0
          ? generalParts.join(' ')
          : (getField(m, 'news_title', 'caption', 'title') || '行程');
        const dedupeKey = `gen_${typeLower}_${dateStr}_${generalTitle}`;

        if (!seenKeys.has(dedupeKey)) {
          seenKeys.add(dedupeKey);
          events.push({
            year: parsed.year,
            month: parsed.month,
            day: parsed.day,
            rawDate: dateStr,
            title: generalTitle,
            emoji: resolveTypeEmoji(typeLower, idx)
          });
        }
      }
    });

    return events.sort((a, b) => a.day - b.day);
  }, [masterMedia, allMediaEvents, anniversaries, viewYear, currentMonthNum, typeEmojiMap]);

  return (
    <div
      className="absolute inset-0 bg-slate-950/95 z-50 flex flex-col text-white backdrop-blur-md animate-fade-in select-none"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* 🌟 頂部導航列（Header Bar）統一標準規格：h-[88px] px-5 bg-[#4E727A] pt-14 pb-2.5 flex items-end */}
      <div className="h-[88px] px-5 bg-[#4E727A] border-b border-[#3D5C63] shadow-md shrink-0 pt-14 pb-2.5 flex items-end justify-start">
        <span className="font-bold text-xl tracking-wider text-white leading-none">CALENDAR</span>
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

          {/* 日曆格子（同日多行程並列顯示多個 emoji，不用顏色區分） */}
          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square bg-transparent" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dayEvents = activeMonthEvents.filter(ev => ev.day === dayNum);
              const dayEmojis = dayEvents.map(ev => ev.emoji).filter(Boolean);

              return (
                <div
                  key={`day-${dayNum}`}
                  className="aspect-square rounded-lg p-1.5 flex flex-col justify-between border bg-slate-900/60 border-white/5 hover:border-[#81D4D2]/40 transition relative overflow-hidden"
                >
                  <span className="text-[10px] font-mono text-slate-400 leading-none">{dayNum}</span>
                  
                  {dayEmojis.length > 0 && (
                    <div className="flex flex-wrap items-center justify-end gap-0.5 self-end max-w-full">
                      {dayEmojis.map((em, eIdx) => (
                        <span key={eIdx} className="text-xs select-none leading-none filter drop-shadow">
                          {em}
                        </span>
                      ))}
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
                {ev.emoji && <span className="text-xs shrink-0 select-none">{ev.emoji}</span>}
                <span className="leading-snug">
                  <strong className="text-white font-mono mr-1.5">{ev.rawDate}</strong>
                  <span>{ev.title}</span>
                </span>
              </div>
            ))
          ) : (
            <p className="text-[11px] text-slate-500 font-light">No scheduled events</p>
          )}
        </div>
      </div>
    </div>
  );
}
