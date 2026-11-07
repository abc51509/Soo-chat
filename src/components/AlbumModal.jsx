import React, { useState, useRef, useEffect } from 'react';

export default function AlbumModal({ albumList }) {
  const [selectedAlbumName, setSelectedAlbumName] = useState(null);
  const scrollContainerRef = useRef(null);

  // 1. 相簿排序：固定「所有相片」在第一本，其餘依最新 date 倒序排列
  const sortedAlbumList = React.useMemo(() => {
    if (!albumList || albumList.length === 0) return [];

    const allPhotosAlbum = albumList.find(
      (a) => a.title === '所有相片' || a.title === '未分類歸檔'
    ) || {
      title: '所有相片',
      cover: albumList[0]?.cover || null,
      images: Array.from(new Set(albumList.flatMap((a) => a.images || []))),
      count: 0,
      latestDate: '9999-99-99'
    };

    allPhotosAlbum.title = '所有相片';
    allPhotosAlbum.count = allPhotosAlbum.images.length;

    const restAlbums = albumList
      .filter((a) => a.title !== '所有相片' && a.title !== '未分類歸檔')
      .sort((a, b) => {
        const dateA = a.latestDate || a.date || '';
        const dateB = b.latestDate || b.date || '';
        return dateB.localeCompare(dateA);
      });

    return [allPhotosAlbum, ...restAlbums];
  }, [albumList]);

  // 2. 四宮格分頁（每頁 4 本，不足 4 本亦保證 top-aligned 垂直對齊）
  const pages = React.useMemo(() => {
    const p = [];
    for (let i = 0; i < sortedAlbumList.length; i += 4) {
      p.push(sortedAlbumList.slice(i, i + 4));
    }
    return p;
  }, [sortedAlbumList]);

  // 3. 無縫無限循環滾動處理（若只有 1 頁則無需循環，多頁時首尾串接 clones）
  const loopPages = React.useMemo(() => {
    if (pages.length <= 1) return pages;
    // [LastPageClone, ...Pages, FirstPageClone]
    return [pages[pages.length - 1], ...pages, pages[0]];
  }, [pages]);

  useEffect(() => {
    // 初始滾動至真實的第一頁
    if (pages.length > 1 && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      container.scrollLeft = container.clientWidth;
    }
  }, [pages.length]);

  const handleScroll = () => {
    if (pages.length <= 1 || !scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const { scrollLeft, clientWidth } = container;

    // 滑到最前面的 Clone 時，無痕跳回最後一頁
    if (scrollLeft <= 5) {
      container.scrollLeft = clientWidth * pages.length;
    }
    // 滑到最後面的 Clone 時，無痕跳回第一頁
    else if (scrollLeft >= clientWidth * (pages.length + 1) - 5) {
      container.scrollLeft = clientWidth;
    }
  };

  const activeAlbumDetail = selectedAlbumName
    ? sortedAlbumList.find((a) => a.title === selectedAlbumName) || null
    : null;

  return (
    <div className="absolute inset-0 bg-[#0B1120] z-50 flex flex-col text-white backdrop-blur-md animate-fade-in select-none">
      {selectedAlbumName && activeAlbumDetail ? (
        /* 三宮格內頁 */
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="pt-12 pb-5 px-5 bg-[#4E727A] flex items-center justify-start border-b border-[#3D5C63] shadow-md shrink-0">
            <span className="font-bold text-xl text-white truncate max-w-[320px]">
              {activeAlbumDetail.title}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            <div className="grid grid-cols-3 gap-1.5 rounded-xl overflow-hidden">
              {activeAlbumDetail.images.map((img, i) => (
                <a
                  key={i}
                  href={img}
                  target="_blank"
                  rel="noreferrer"
                  className="block aspect-[3/4] bg-slate-800 overflow-hidden rounded-md group"
                >
                  <img
                    src={img}
                    alt={`Shot ${i + 1}`}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                  />
                </a>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* 四宮格循環書架總覽 */
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="pt-12 pb-5 px-5 bg-[#4E727A] flex items-center justify-start border-b border-[#3D5C63] shadow-md shrink-0">
            <span className="font-bold text-xl tracking-wider text-white">ALBUM</span>
          </div>

          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex-1 flex overflow-x-auto snap-x snap-mandatory scrollbar-none items-start pt-6"
            style={{ scrollBehavior: 'smooth' }}
          >
            {loopPages.map((pageGroup, pIdx) => (
              <div
                key={pIdx}
                className="w-full shrink-0 snap-center px-4 self-start"
              >
                {/* 2x2 基準格位：嚴格垂直靠頂對齊 */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-5 items-start">
                  {pageGroup.map((alb) => (
                    <div
                      key={alb.title}
                      onClick={() => setSelectedAlbumName(alb.title)}
                      className="flex flex-col cursor-pointer group active:scale-[0.98] transition"
                    >
                      {/* 封面相框 (固定 4:5 比例與對齊基準線) */}
                      <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-slate-800 shadow-md border border-white/10 relative group-hover:border-[#81D4D2]/60 transition">
                        {alb.cover ? (
                          <img
                            src={alb.cover}
                            alt={alb.title}
                            loading="lazy"
                            className="w-full h-full object-cover object-[center_20%]"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs font-mono">
                            NO COVER
                          </div>
                        )}
                        <span className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[9px] px-2 py-0.5 rounded-md font-mono">
                          {alb.count}P
                        </span>
                      </div>

                      {/* 相簿名稱：固定高度 (h-10) 與頂部對齊，確保不論單行或雙行都不影響格位齊平 */}
                      <div className="mt-2.5 px-0.5 h-10 flex items-start">
                        <h4 className="text-[12.5px] font-medium text-slate-200 group-hover:text-[#81D4D2] leading-tight line-clamp-2 break-words">
                          {alb.title}
                        </h4>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
