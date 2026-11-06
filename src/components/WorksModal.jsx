import React, { useState, useMemo, useEffect } from 'react';

const TABS = [
  { key: 'ALL', label: 'ALL' },
  { key: 'DRAMA', label: 'DRAMA' },
  { key: 'MOVIE', label: 'MOVIE' },
  { key: 'VARIETY', label: 'VARIETY' },
  { key: 'MV', label: 'MV' },
  { key: 'SHOW', label: 'SHOW' },
];

export default function WorksModal({ worksData = [] }) {
  const [activeTab, setActiveTab] = useState('ALL');

  // 本地儲存已看過（打勾）的作品清單，以「分類_年份_作品名稱」作為唯一 key
  const [watchedList, setWatchedList] = useState(() => {
    try {
      const saved = localStorage.getItem('soo_watched_works');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('soo_watched_works', JSON.stringify(watchedList));
  }, [watchedList]);

  // 切換打勾狀態
  const toggleWatched = (workKey) => {
    setWatchedList((prev) =>
      prev.includes(workKey) ? prev.filter((k) => k !== workKey) : [...prev, workKey]
    );
  };

  // 格式化資料並依年份倒序（最新的排最上面）
  const formattedWorks = useMemo(() => {
    return worksData
      .map((item, idx) => {
        const typeRaw = (item.type || '').trim().toUpperCase();
        const year = (item.year || '').trim();
        const title = (item.title || item.name || '').trim();
        const role = (item.role || item.character || '').trim();
        const coverImage = (item.cover_image || item.image || item.cover || '').trim();
        const uniqueKey = `${typeRaw}_${year}_${title || idx}`;

        return {
          id: uniqueKey,
          type: typeRaw,
          year,
          title,
          role,
          coverImage,
        };
      })
      .filter((w) => w.title.length > 0)
      .sort((a, b) => b.year.localeCompare(a.year));
  }, [worksData]);

  // 依照當前選中的 Tab 過濾
  const displayedWorks = useMemo(() => {
    if (activeTab === 'ALL') return formattedWorks;
    return formattedWorks.filter((w) => w.type === activeTab);
  }, [formattedWorks, activeTab]);

  // 計算目前完成度
  const watchedCount = displayedWorks.filter((w) => watchedList.includes(w.id)).length;
  const totalCount = displayedWorks.length;
  const percent = totalCount > 0 ? Math.round((watchedCount / totalCount) * 100) : 0;

  return (
    <div className="absolute inset-0 bg-[#0B1120] z-50 flex flex-col text-slate-100 backdrop-blur-md animate-fade-in select-none">
      {/* 頂部導航列 */}
      <div className="pt-12 pb-4 px-5 bg-[#4E727A] flex items-center justify-between border-b border-[#3D5C63] shadow-md shrink-0">
        <div>
          <span className="font-bold text-xl tracking-wider text-white">WORKS</span>
          <span className="text-[11px] text-teal-200/80 font-mono ml-2">Filmography</span>
        </div>
        {/* 打勾進度計數 */}
        <div className="flex items-center space-x-1.5 bg-black/25 px-2.5 py-1 rounded-full border border-white/10 text-[11px] font-mono">
          <span className="text-[#81D4D2] font-semibold">{watchedCount}</span>
          <span className="text-slate-400">/</span>
          <span className="text-slate-300">{totalCount}</span>
          <span className="text-[9px] text-teal-300/80 ml-1">({percent}%)</span>
        </div>
      </div>

      {/* 分類 Tab 橫向滾動列 */}
      <div className="bg-slate-900/90 px-4 py-2.5 flex space-x-2 overflow-x-auto scrollbar-none border-b border-white/5 shrink-0">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3.5 py-1 rounded-full text-xs font-semibold tracking-wider transition shrink-0 ${
                isActive
                  ? 'bg-[#81D4D2] text-[#0F3332] shadow-sm shadow-[#81D4D2]/20'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 作品卡片清單 */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5">
        {displayedWorks.length > 0 ? (
          displayedWorks.map((work) => {
            const isChecked = watchedList.includes(work.id);

            return (
              <div
                key={work.id}
                onClick={() => toggleWatched(work.id)}
                className={`flex items-center p-2.5 rounded-2xl border transition cursor-pointer select-none ${
                  isChecked
                    ? 'bg-[#1E293B]/40 border-teal-500/30'
                    : 'bg-[#1E293B]/80 border-slate-700/60 hover:border-slate-600'
                }`}
              >
                {/* 左側打勾框 */}
                <div className="pr-3 pl-1 shrink-0">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition border ${
                      isChecked
                        ? 'bg-[#5FBDB9] border-[#5FBDB9] text-white shadow-sm'
                        : 'border-slate-500 bg-slate-800/60 text-transparent'
                    }`}
                  >
                    <svg className="w-3.5 h-3.5 fill-current stroke-current stroke-1" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                  </div>
                </div>

                {/* 劇照小縮圖 (直式海報比例 3:4) */}
                <div className="w-14 h-[72px] rounded-xl overflow-hidden bg-slate-800 border border-white/10 shrink-0 mr-3 relative shadow-inner">
                  {work.coverImage ? (
                    <img
                      src={work.coverImage}
                      alt={work.title}
                      loading="lazy"
                      className={`w-full h-full object-cover transition ${
                        isChecked ? 'opacity-70 grayscale-[20%]' : 'opacity-100'
                      }`}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 text-[9px] font-mono p-1 text-center leading-none">
                      <span>NO</span>
                      <span>POSTER</span>
                    </div>
                  )}
                  {/* 分類標籤 */}
                  <span className="absolute bottom-1 right-1 bg-black/75 backdrop-blur-sm text-[#81D4D2] text-[8px] font-mono px-1 rounded">
                    {work.type}
                  </span>
                </div>

                {/* 文字詳情 */}
                <div className="flex-1 min-w-0 pr-1 space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-mono text-[#81D4D2] font-semibold">
                      {work.year}
                    </span>
                  </div>

                  <h3
                    className={`text-[13.5px] font-bold leading-snug truncate transition ${
                      isChecked ? 'text-slate-400 line-through decoration-slate-500' : 'text-white'
                    }`}
                  >
                    {work.title}
                  </h3>

                  {work.role && (
                    <p className="text-[11.5px] text-slate-400 font-light truncate">
                      <span className="text-slate-500 text-[10.5px] mr-1">飾演</span>
                      {work.role}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-16 text-center text-slate-500 text-xs font-mono">
            NO WORKS FOUND
          </div>
        )}
      </div>
    </div>
  );
}
