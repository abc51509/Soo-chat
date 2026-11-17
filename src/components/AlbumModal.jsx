import React, { useState, useEffect, useRef, useMemo } from 'react';

const getField = (obj, ...keys) => {
  if (!obj) return '';
  for (const k of keys) {
    const cleanKey = k.toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (obj[k]?.trim()) return obj[k].trim();
    if (obj[cleanKey]?.trim()) return obj[cleanKey].trim();
  }
  return '';
};

export default function AlbumModal({ mediaList = [] }) {
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [viewerIndex, setViewerIndex] = useState(null);

  // 相簿封面無縫迴圈捲動控制（絕對鎖死）
  const shelfRef = useRef(null);
  const isResettingRef = useRef(false);

  // 第 2 層相簿內頁邊緣滑動返回（先回 ALBUM 封面，再滑一次才回聊天室）
  const detailTouchStartRef = useRef({ x: 0, y: 0 });

  // 大圖檢視器純滑動與手勢下滑關閉控制（絕對鎖死）
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const gestureStartRef = useRef({ x: 0, y: 0 });
  const gestureAxisRef = useRef(null); // 'x' | 'y' | null
  const thumbListRef = useRef(null);

  // 互斥原則 + 嚴格命名公式：《news_source》issue-brand-album_name（絕對鎖死）
  const albums = useMemo(() => {
    const groupedMap = new Map();
    const loosePhotos = [];

    mediaList.forEach((item) => {
      const rawImgs = getField(item, 'images', 'image');
      if (!rawImgs) return;

      const imgs = rawImgs
        .split(/[\s,]+/)
        .map((u) => u.trim())
        .filter((u) => u.startsWith('http'));

      if (!imgs.length) return;

      const newsSource = getField(item, 'news_source', 'source');
      const issue = getField(item, 'issue');
      const brand = getField(item, 'brand');
      const albumName = getField(item, 'album_name');

      const bodyParts = [issue, brand, albumName].filter(Boolean);
      const hasAlbumMeta = Boolean(newsSource || bodyParts.length > 0);

      if (!hasAlbumMeta) {
        loosePhotos.push(...imgs);
        return;
      }

      const prefix = newsSource ? `《${newsSource}》` : '';
      const fullTitle = `${prefix}${bodyParts.join('-')}`;

      if (!groupedMap.has(fullTitle)) {
        groupedMap.set(fullTitle, {
          title: fullTitle,
          photos: [],
        });
      }
      groupedMap.get(fullTitle).photos.push(...imgs);
    });

    const formalAlbums = [];
    groupedMap.forEach((group) => {
      const uniquePhotos = Array.from(new Set(group.photos));
      if (uniquePhotos.length >= 3) {
        formalAlbums.push({
          title: group.title,
          cover: uniquePhotos[0],
          photos: uniquePhotos,
        });
      } else {
        loosePhotos.push(...uniquePhotos);
      }
    });

    const formalPhotoSet = new Set(formalAlbums.flatMap((a) => a.photos));
    const otherPhotos = Array.from(new Set(loosePhotos)).filter(
      (url) => !formalPhotoSet.has(url)
    );

    const result = [...formalAlbums];
    if (otherPhotos.length > 0) {
      result.push({
        title: '其他相片',
        cover: otherPhotos[0],
        photos: otherPhotos,
      });
    }

    return result;
  }, [mediaList]);

  // 偶數雙排垂直排列（2 列 × N 欄）（絕對鎖死）
  const columns = useMemo(() => {
    const cols = [];
    for (let i = 0; i < albums.length; i += 2) {
      cols.push(albums.slice(i, i + 2));
    }
    return cols;
  }, [albums]);

  // 三倍無縫循環軌道（絕對鎖死）
  const loopColumns = useMemo(() => {
    if (columns.length <= 1) return columns;
    return [...columns, ...columns, ...columns];
  }, [columns]);

  // 預設開啟停留在最左側最新相簿起點（絕對鎖死）
  useEffect(() => {
    if (selectedAlbum !== null) return;
    const el = shelfRef.current;
    if (!el || columns.length <= 1) return;

    const initPosition = () => {
      const singleSetWidth = el.scrollWidth / 3;
      if (singleSetWidth > 0) {
        isResettingRef.current = true;
        el.scrollLeft = singleSetWidth;
        requestAnimationFrame(() => {
          isResettingRef.current = false;
        });
      }
    };

    initPosition();
  }, [columns, selectedAlbum]);

  // 監聽橫向滑動，無縫穿梭於三倍軌道之間（絕對鎖死）
  const handleShelfScroll = () => {
    const el = shelfRef.current;
    if (!el || columns.length <= 1 || isResettingRef.current) return;

    const singleSetWidth = el.scrollWidth / 3;
    if (singleSetWidth <= 0) return;

    if (el.scrollLeft < singleSetWidth * 0.25) {
      isResettingRef.current = true;
      el.scrollLeft += singleSetWidth;
      requestAnimationFrame(() => {
        isResettingRef.current = false;
      });
    } else if (el.scrollLeft > singleSetWidth * 1.75) {
      isResettingRef.current = true;
      el.scrollLeft -= singleSetWidth;
      requestAnimationFrame(() => {
        isResettingRef.current = false;
      });
    }
  };

  // 第 2 層相簿內頁：左邊緣右滑返回第 1 層 ALBUM（攔截事件不穿透回聊天室）
  const handleDetailTouchStart = (e) => {
    detailTouchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const handleDetailTouchEnd = (e) => {
    const deltaX = e.changedTouches[0].clientX - detailTouchStartRef.current.x;
    const deltaY = e.changedTouches[0].clientY - detailTouchStartRef.current.y;

    const isEdgeSwipe = detailTouchStartRef.current.x < 45;
    const isHorizontalSwipe = deltaX > 75 && Math.abs(deltaY) < 40;

    if (isEdgeSwipe && isHorizontalSwipe) {
      e.stopPropagation();
      setSelectedAlbum(null);
      setViewerIndex(null);
    }
  };

  // 第 3 層大圖檢視器：縮圖列自動將當前高亮圖片置中
  useEffect(() => {
    if (viewerIndex === null || !thumbListRef.current) return;
    const container = thumbListRef.current;
    // 子元素包含前後置中墊片，因此實際縮圖索引為 viewerIndex + 1
    const activeThumb = container.children[viewerIndex + 1];
    if (activeThumb) {
      const targetLeft =
        activeThumb.offsetLeft - container.clientWidth / 2 + activeThumb.clientWidth / 2;
      container.scrollTo({ left: targetLeft, behavior: 'smooth' });
    }
  }, [viewerIndex]);

  // 大圖檢視器觸控手勢（左右無縫循環切換 + 大幅度下滑關閉）（絕對鎖死）
  const handleViewerTouchStart = (e) => {
    if (e.touches.length !== 1) return;
    gestureStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
    gestureAxisRef.current = null;
    setIsDragging(true);
  };

  const handleViewerTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - gestureStartRef.current.x;
    const dy = e.touches[0].clientY - gestureStartRef.current.y;

    if (!gestureAxisRef.current) {
      if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
        gestureAxisRef.current = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      }
    }

    if (gestureAxisRef.current === 'x') {
      setDragOffset({ x: dx, y: 0 });
    } else if (gestureAxisRef.current === 'y') {
      setDragOffset({ x: 0, y: Math.max(0, dy) });
    }
  };

  const handleViewerTouchEnd = () => {
    if (!isDragging || !selectedAlbum) return;
    const total = selectedAlbum.photos.length;
    const { x, y } = dragOffset;

    if (gestureAxisRef.current === 'y' && y > 95) {
      setViewerIndex(null);
    } else if (gestureAxisRef.current === 'x' && Math.abs(x) > 45 && total > 1) {
      if (x < 0) {
        setViewerIndex((prev) => (prev + 1) % total);
      } else {
        setViewerIndex((prev) => (prev - 1 + total) % total);
      }
    }

    setDragOffset({ x: 0, y: 0 });
    setIsDragging(false);
    gestureAxisRef.current = null;
  };

  const closeViewer = () => {
    setViewerIndex(null);
    setDragOffset({ x: 0, y: 0 });
    setIsDragging(false);
  };

  const viewerOpacity =
    gestureAxisRef.current === 'y' && dragOffset.y > 0
      ? Math.max(0.25, 1 - dragOffset.y / 320)
      : 1;

  return (
    <div className="absolute inset-0 bg-[#0B1120] z-30 flex flex-col overflow-hidden animate-fade-in select-none">
      {/* 🌟 頂部導航列（Header Bar）統一標準規格：h-[88px] px-5 bg-[#4E727A] pt-14 pb-2.5 flex items-end */}
      <div className="h-[88px] px-5 bg-[#4E727A] border-b border-[#3D5C63] shadow-md shrink-0 pt-14 pb-2.5 flex items-end justify-start">
        {selectedAlbum ? (
          /* 第 2️⃣ 層：不顯示左上返回相簿，相簿名稱直接往左靠齊 */
          <span className="font-bold text-base tracking-wide text-white leading-none truncate w-full text-left">
            {selectedAlbum.title}
          </span>
        ) : (
          /* 第 1️⃣ 層：固定標題字眼 ALBUM，移除總相本數目 */
          <span className="font-bold text-xl tracking-wider text-white leading-none">
            ALBUM
          </span>
        )}
      </div>

      {/* 主內容區 */}
      {!selectedAlbum ? (
        /* 第 1️⃣ 層：深色背景、移除下方白底標題方塊改為純白字換行顯示、兩排垂直空隙加倍 (space-y-8) */
        <div className="flex-1 flex flex-col justify-center overflow-hidden py-4">
          {albums.length === 0 ? (
            <div className="text-center text-slate-400 text-xs">尚無相簿資料</div>
          ) : (
            <div
              ref={shelfRef}
              onScroll={handleShelfScroll}
              className="w-full overflow-x-auto scrollbar-none px-4"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              <div className="inline-flex space-x-4 items-start">
                {loopColumns.map((col, colIdx) => (
                  <div
                    key={`col_${colIdx}`}
                    className="w-[158px] shrink-0 flex flex-col space-y-8"
                  >
                    {col.map((album) => (
                      <div
                        key={`${colIdx}_${album.title}`}
                        onClick={() => setSelectedAlbum(album)}
                        className="active:scale-95 transition cursor-pointer flex flex-col"
                      >
                        <div className="w-full aspect-[3/4] rounded-2xl bg-slate-800/80 overflow-hidden relative shadow-md border border-white/10">
                          <img
                            src={album.cover}
                            alt={album.title}
                            loading="lazy"
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded-full font-mono">
                            {album.photos.length}
                          </span>
                        </div>
                        <p className="mt-2 px-0.5 h-[50px] line-clamp-3 text-xs font-medium text-white leading-snug break-words">
                          {album.title}
                        </p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* 第 2️⃣ 層：相簿內頁（三欄網格 + 獨立邊緣滑動回第 1 層 ALBUM） */
        <div
          className="flex-1 overflow-y-auto p-1.5"
          onTouchStart={handleDetailTouchStart}
          onTouchEnd={handleDetailTouchEnd}
        >
          <div className="grid grid-cols-3 gap-1">
            {selectedAlbum.photos.map((photoUrl, idx) => (
              <div
                key={`${photoUrl}_${idx}`}
                onClick={() => setViewerIndex(idx)}
                className="aspect-[3/4] bg-slate-800 overflow-hidden cursor-pointer active:opacity-80 transition"
              >
                <img
                  src={photoUrl}
                  alt=""
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 第 3️⃣ 層：全螢幕大圖檢視器（移除上方張數、縮圖置中且滑動完全獨立不連動大圖） */}
      {selectedAlbum && viewerIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black flex flex-col justify-between select-none"
          style={{ backgroundColor: `rgba(0, 0, 0, ${viewerOpacity})` }}
          onTouchStart={handleViewerTouchStart}
          onTouchMove={handleViewerTouchMove}
          onTouchEnd={handleViewerTouchEnd}
        >
          {/* 頂部僅保留關閉按鈕，所有數字完全移除 */}
          <div className="pt-12 pb-2 px-4 flex items-center justify-start text-white z-10">
            <button
              onClick={closeViewer}
              className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center active:scale-90 transition"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>
          </div>

          {/* 中央大圖展示區 */}
          <div
            onClick={closeViewer}
            className="flex-1 flex items-center justify-center overflow-hidden px-2"
          >
            <img
              src={selectedAlbum.photos[viewerIndex]}
              alt=""
              onClick={(e) => e.stopPropagation()}
              style={{
                transform: `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0)`,
                transition: isDragging ? 'none' : 'transform 0.22s ease-out',
              }}
              className="max-w-full max-h-full object-contain pointer-events-auto"
            />
          </div>

          {/* 底部 iPhone 風格微型縮圖預覽列（置中對齊 + 事件獨立隔離，滑動小圖絕不連動上方大圖） */}
          <div
            className="pb-7 pt-3 bg-gradient-to-t from-black/90 to-transparent z-10"
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            <div
              ref={thumbListRef}
              className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none py-1"
            >
              {/* 左側置中墊片 */}
              <div className="shrink-0 w-[calc(50%-22px)]" />
              {selectedAlbum.photos.map((thumbUrl, idx) => {
                const isActive = idx === viewerIndex;
                return (
                  <button
                    key={`thumb_${idx}`}
                    type="button"
                    onClick={() => setViewerIndex(idx)}
                    className={`shrink-0 overflow-hidden rounded transition-all duration-200 ${
                      isActive
                        ? 'w-11 h-14 ring-2 ring-white scale-105 opacity-100 mx-1'
                        : 'w-8 h-11 opacity-45 hover:opacity-75'
                    }`}
                  >
                    <img
                      src={thumbUrl}
                      alt=""
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </button>
                );
              })}
              {/* 右側置中墊片 */}
              <div className="shrink-0 w-[calc(50%-22px)]" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
