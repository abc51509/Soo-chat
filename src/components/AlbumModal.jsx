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

  // 相簿封面無縫迴圈捲動控制
  const shelfRef = useRef(null);
  const isResettingRef = useRef(false);

  // 大圖檢視器純滑動與手勢下滑關閉控制
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const gestureStartRef = useRef({ x: 0, y: 0 });
  const gestureAxisRef = useRef(null); // 'x' | 'y' | null
  const thumbListRef = useRef(null);

  // 4️⃣ 互斥原則 + 5️⃣ 嚴格命名公式：《news_source》issue-brand-album_name
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
      // 去重同時維持原始順序
      const uniquePhotos = Array.from(new Set(group.photos));
      if (uniquePhotos.length >= 3) {
        formalAlbums.push({
          title: group.title,
          cover: uniquePhotos[0],
          photos: uniquePhotos,
        });
      } else {
        // 未滿 3 張歸入其他相片
        loosePhotos.push(...uniquePhotos);
      }
    });

    // 互斥原則：排除所有已成正式相簿的照片 URL
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

  // 1️⃣ 偶數雙排垂直排列（2 列 × N 欄），確保首尾銜接無空白斷層
  const columns = useMemo(() => {
    const cols = [];
    for (let i = 0; i < albums.length; i += 2) {
      cols.push(albums.slice(i, i + 2));
    }
    return cols;
  }, [albums]);

  // 建立三倍無縫循環軌道（左緩衝 + 主軌道 + 右緩衝），支援自由慣性滑動且永不撞牆回彈
  const loopColumns = useMemo(() => {
    if (columns.length <= 1) return columns;
    return [...columns, ...columns, ...columns];
  }, [columns]);

  // 2️⃣ 預設開啟停留在最左側（主軌道第 1 欄＝最新一本相簿起點）
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

  // 監聽橫向滑動，無縫穿梭於三倍軌道之間（自由停留、不鎖死單頁）
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

  // 3️⃣ 大圖檢視器：縮圖列自動將當前高亮圖片置中
  useEffect(() => {
    if (viewerIndex === null || !thumbListRef.current) return;
    const container = thumbListRef.current;
    const activeThumb = container.children[viewerIndex];
    if (activeThumb) {
      const targetLeft =
        activeThumb.offsetLeft - container.clientWidth / 2 + activeThumb.clientWidth / 2;
      container.scrollTo({ left: targetLeft, behavior: 'smooth' });
    }
  }, [viewerIndex]);

  // 大圖檢視器觸控手勢（左右無縫循環切換 + 大幅度下滑關閉）
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
      // 僅允許向下拖曳關閉
      setDragOffset({ x: 0, y: Math.max(0, dy) });
    }
  };

  const handleViewerTouchEnd = () => {
    if (!isDragging || !selectedAlbum) return;
    const total = selectedAlbum.photos.length;
    const { x, y } = dragOffset;

    if (gestureAxisRef.current === 'y' && y > 95) {
      // 大幅度下滑超過閾值直接關閉大圖
      setViewerIndex(null);
    } else if (gestureAxisRef.current === 'x' && Math.abs(x) > 45 && total > 1) {
      // 無縫首尾相連迴圈切換
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
    <div className="absolute inset-0 bg-[#ECEEF1] z-30 flex flex-col overflow-hidden animate-fade-in">
      {/* 頂部導航列（維持既有一致 UI） */}
      <div className="pt-12 pb-3 px-4 bg-[#4E727A] text-white flex items-center justify-between shrink-0 shadow-md border-b border-[#3D5C63]">
        {selectedAlbum ? (
          <button
            onClick={() => {
              setSelectedAlbum(null);
              setViewerIndex(null);
            }}
            className="flex items-center space-x-1 text-sm font-medium text-white/95 active:scale-95 transition"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
            </svg>
            <span>相簿</span>
          </button>
        ) : (
          <span className="font-bold text-base tracking-wide">相簿</span>
        )}

        <span className="text-xs font-medium text-white/90 truncate max-w-[60%]">
          {selectedAlbum ? selectedAlbum.title : `${albums.length} 本相簿`}
        </span>
      </div>

      {/* 主內容區 */}
      {!selectedAlbum ? (
        /* 1️⃣ & 2️⃣ 相簿封面列表：雙排垂直排列 + 無縫迴圈 + 自由慣性滑動（預設停在最左側最新相簿） */
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
              <div className="inline-flex space-x-3.5">
                {loopColumns.map((col, colIdx) => (
                  <div
                    key={`col_${colIdx}`}
                    className="w-[162px] shrink-0 flex flex-col space-y-3.5"
                  >
                    {col.map((album) => (
                      <div
                        key={`${colIdx}_${album.title}`}
                        onClick={() => setSelectedAlbum(album)}
                        className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200/80 active:scale-95 transition cursor-pointer flex flex-col"
                      >
                        <div className="w-full aspect-[3/4] bg-slate-200 overflow-hidden relative">
                          <img
                            src={album.cover}
                            alt={album.title}
                            loading="lazy"
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute bottom-2 right-2 bg-black/55 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded-full font-mono">
                            {album.photos.length}
                          </span>
                        </div>
                        <div className="px-2.5 py-2">
                          <p className="text-xs font-semibold text-slate-800 truncate">
                            {album.title}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* 相簿內頁：三欄照片網格 */
        <div className="flex-1 overflow-y-auto p-1.5">
          <div className="grid grid-cols-3 gap-1">
            {selectedAlbum.photos.map((photoUrl, idx) => (
              <div
                key={`${photoUrl}_${idx}`}
                onClick={() => setViewerIndex(idx)}
                className="aspect-[3/4] bg-slate-200 overflow-hidden cursor-pointer active:opacity-80 transition"
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

      {/* 3️⃣ 全螢幕大圖檢視器（無箭頭純滑動、無縫首尾循環、大幅度下滑關閉、無底部名稱、iPhone 風格縮圖列） */}
      {selectedAlbum && viewerIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black flex flex-col justify-between select-none"
          style={{ backgroundColor: `rgba(0, 0, 0, ${viewerOpacity})` }}
          onTouchStart={handleViewerTouchStart}
          onTouchMove={handleViewerTouchMove}
          onTouchEnd={handleViewerTouchEnd}
        >
          {/* 頂部僅保留關閉按鈕與張數計數 */}
          <div className="pt-12 pb-2 px-4 flex items-center justify-between text-white z-10">
            <button
              onClick={closeViewer}
              className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center active:scale-90 transition"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>
            <span className="text-xs font-mono text-white/80">
              {viewerIndex + 1} / {selectedAlbum.photos.length}
            </span>
            <div className="w-9" />
          </div>

          {/* 中央大圖展示區（純滑動切換、無左右箭頭、可點擊空白關閉或大幅度下滑關閉） */}
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

          {/* 底部 iPhone 風格微型縮圖預覽列（無相簿名稱，當前高亮、點擊跳轉） */}
          <div className="pb-7 pt-3 px-3 bg-gradient-to-t from-black/90 to-transparent z-10">
            <div
              ref={thumbListRef}
              className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none py-1 px-2"
            >
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
