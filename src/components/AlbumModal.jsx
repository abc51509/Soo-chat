import React, { useState, useMemo, useRef, useEffect } from 'react';

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
  const [selectedAlbumId, setSelectedAlbumId] = useState(null);
  const [viewerIndex, setViewerIndex] = useState(null);

  // 封面列表無縫迴圈捲動參考
  const shelfRef = useRef(null);
  const isAdjustingScroll = useRef(false);

  // 相簿內頁左右切換滑動參考
  const innerTouchStartX = useRef(0);
  const innerTouchStartY = useRef(0);

  // 大圖檢視器手勢滑動與下滑關閉狀態
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const viewerTouchStart = useRef({ x: 0, y: 0 });
  const thumbStripRef = useRef(null);

  // 4️⃣ & 5️⃣ 相簿分組、嚴格命名公式與互斥原則
  const albums = useMemo(() => {
    const groupedMap = new Map();
    const ungroupedPhotos = [];

    mediaList.forEach((row) => {
      const rawImgs = getField(row, 'images', 'image');
      if (!rawImgs) return;

      const imgs = rawImgs
        .split(/[\s,]+/)
        .map((u) => u.trim())
        .filter((u) => u.startsWith('http'));

      if (!imgs.length) return;

      const newsSource = getField(row, 'news_source', 'newssource', 'source');
      const issue = getField(row, 'issue');
      const brand = getField(row, 'brand');
      const albumName = getField(row, 'album_name', 'albumname');

      // 命名公式：嚴格組裝為 《news_source》issue-brand-album_name（以 - 連接，未填欄位自動跳過）
      const bodyParts = [issue, brand, albumName].filter(Boolean);
      const bodyStr = bodyParts.join('-');
      const sourcePrefix = newsSource ? `《${newsSource}》` : '';
      const fullTitle = `${sourcePrefix}${bodyStr}`.trim();

      // 僅當有填寫相簿相關識別欄位（issue / brand / album_name）時才嘗試歸入獨立相簿
      if (bodyParts.length > 0 && fullTitle) {
        if (!groupedMap.has(fullTitle)) {
          groupedMap.set(fullTitle, {
            id: `album_${groupedMap.size}`,
            title: fullTitle,
            photos: []
          });
        }
        const target = groupedMap.get(fullTitle);
        imgs.forEach((url) => {
          if (!target.photos.includes(url)) {
            target.photos.push(url);
          }
        });
      } else {
        imgs.forEach((url) => {
          if (!ungroupedPhotos.includes(url)) {
            ungroupedPhotos.push(url);
          }
        });
      }
    });

    const validAlbums = [];
    const usedPhotoSet = new Set();

    // 篩選張數 >= 3 張成立為獨立相簿，並記錄已成冊照片
    groupedMap.forEach((album) => {
      if (album.photos.length >= 3) {
        validAlbums.push(album);
        album.photos.forEach((url) => usedPhotoSet.add(url));
      } else {
        // 不足 3 張的併入未歸類池
        album.photos.forEach((url) => {
          if (!ungroupedPhotos.includes(url)) {
            ungroupedPhotos.push(url);
          }
        });
      }
    });

    // 互斥原則：已成相簿的照片絕對不會重複進入「其他相片」
    const exclusiveOthers = ungroupedPhotos.filter((url) => !usedPhotoSet.has(url));

    if (exclusiveOthers.length > 0) {
      validAlbums.push({
        id: 'album_others',
        title: '其他相片',
        photos: exclusiveOthers
      });
    }

    return validAlbums;
  }, [mediaList]);

  // 1️⃣ 將相簿清單排成「2 列（垂直雙排）× N 欄」以確保首尾無縫接續
  const columns = useMemo(() => {
    if (!albums.length) return [];
    const cols = [];
    for (let i = 0; i < albums.length; i += 2) {
      cols.push(albums.slice(i, i + 2));
    }
    return cols;
  }, [albums]);

  // 建立 3 組鏡像軌道（左緩衝 + 正式起點 + 右緩衝）實現無限迴圈與任意停留
  const loopedColumns = useMemo(() => {
    if (columns.length <= 1) return columns.map((col, idx) => ({ col, key: `single_${idx}` }));
    return [
      ...columns.map((col, idx) => ({ col, key: `pre_${idx}` })),
      ...columns.map((col, idx) => ({ col, key: `main_${idx}` })),
      ...columns.map((col, idx) => ({ col, key: `post_${idx}` }))
    ];
  }, [columns]);

  // 2️⃣ 開啟相簿時精準定位在中間組（正式第 1 欄，最左側最新相簿起點）
  useEffect(() => {
    if (selectedAlbumId !== null) return;
    const el = shelfRef.current;
    if (!el || columns.length <= 1) return;

    const initScroll = () => {
      const singleSetWidth = el.scrollWidth / 3;
      if (singleSetWidth > 0) {
        isAdjustingScroll.current = true;
        el.scrollLeft = singleSetWidth;
        requestAnimationFrame(() => {
          isAdjustingScroll.current = false;
        });
      }
    };

    initScroll();
    const timer = setTimeout(initScroll, 50);
    return () => clearTimeout(timer);
  }, [columns.length, selectedAlbumId]);

  // 1️⃣ 橫向無縫迴圈捲動監聽（自由停留，不鎖死單頁）
  const handleShelfScroll = () => {
    const el = shelfRef.current;
    if (!el || isAdjustingScroll.current || columns.length <= 1) return;

    const singleSetWidth = el.scrollWidth / 3;
    if (singleSetWidth <= 0) return;

    if (el.scrollLeft < singleSetWidth * 0.35) {
      isAdjustingScroll.current = true;
      el.scrollLeft += singleSetWidth;
      requestAnimationFrame(() => {
        isAdjustingScroll.current = false;
      });
    } else if (el.scrollLeft > singleSetWidth * 1.65) {
      isAdjustingScroll.current = true;
      el.scrollLeft -= singleSetWidth;
      requestAnimationFrame(() => {
        isAdjustingScroll.current = false;
      });
    }
  };

  const currentAlbum = useMemo(
    () => albums.find((a) => a.id === selectedAlbumId) || null,
    [albums, selectedAlbumId]
  );

  const currentAlbumIndex = useMemo(
    () => albums.findIndex((a) => a.id === selectedAlbumId),
    [albums, selectedAlbumId]
  );

  // 3️⃣ 相簿內頁左右手勢切換相簿（首尾循環）
  const handleInnerTouchStart = (e) => {
    innerTouchStartX.current = e.touches[0].clientX;
    innerTouchStartY.current = e.touches[0].clientY;
  };

  const handleInnerTouchEnd = (e) => {
    if (viewerIndex !== null || albums.length <= 1) return;
    const dx = e.changedTouches[0].clientX - innerTouchStartX.current;
    const dy = e.changedTouches[0].clientY - innerTouchStartY.current;

    // 避開最左側系統返回手勢區 (x < 45)
    if (innerTouchStartX.current < 45) return;

    if (Math.abs(dx) > 65 && Math.abs(dx) > Math.abs(dy) * 1.3) {
      if (dx < 0) {
        const nextIdx = (currentAlbumIndex + 1) % albums.length;
        setSelectedAlbumId(albums[nextIdx].id);
      } else {
        const prevIdx = (currentAlbumIndex - 1 + albums.length) % albums.length;
        setSelectedAlbumId(albums[prevIdx].id);
      }
    }
  };

  // 3️⃣ 大圖檢視器：無縫循環切換（首尾相連）
  const stepPhoto = (dir) => {
    if (!currentAlbum || !currentAlbum.photos.length) return;
    const total = currentAlbum.photos.length;
    setViewerIndex((prev) => (prev + dir + total) % total);
  };

  // 大圖檢視器手勢控制（左右滑動無縫輪播 + 大幅度下滑關閉）
  const handleViewerTouchStart = (e) => {
    e.stopPropagation();
    const touch = e.touches[0];
    viewerTouchStart.current = { x: touch.clientX, y: touch.clientY };
    setIsDragging(true);
  };

  const handleViewerTouchMove = (e) => {
    e.stopPropagation();
    if (!isDragging) return;
    const touch = e.touches[0];
    const dx = touch.clientX - viewerTouchStart.current.x;
    const dy = touch.clientY - viewerTouchStart.current.y;
    setDragOffset({ x: dx, y: dy });
  };

  const handleViewerTouchEnd = (e) => {
    e.stopPropagation();
    setIsDragging(false);
    const { x: dx, y: dy } = dragOffset;

    // 大幅度手勢下滑關閉（解決直向滿版照片點不到背景的問題）
    if (dy > 90 && Math.abs(dy) > Math.abs(dx) * 1.2) {
      setDragOffset({ x: 0, y: 0 });
      setViewerIndex(null);
      return;
    }

    // 純手勢左右無縫循環切換
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) {
        stepPhoto(1);
      } else {
        stepPhoto(-1);
      }
    }

    setDragOffset({ x: 0, y: 0 });
  };

  // 底部 iPhone 風格微型縮圖預覽列自動置中當前照片
  useEffect(() => {
    if (viewerIndex === null || !thumbStripRef.current) return;
    const activeThumb = thumbStripRef.current.children[viewerIndex];
    if (activeThumb) {
      activeThumb.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest'
      });
    }
  }, [viewerIndex]);

  return (
    <div className="bg-[#4E727A]/95 backdrop-blur-md border-t border-[#3D5C63] z-20 animate-fade-in shadow-xl shrink-0">
      {/* 模式 A：相簿封面雙排橫向無縫迴圈列表 */}
      {!currentAlbum ? (
        <div className="py-3.5">
          {albums.length === 0 ? (
            <div className="text-center text-white/70 text-xs py-8">尚無相簿資料</div>
          ) : (
            <div
              ref={shelfRef}
              onScroll={handleShelfScroll}
              className="flex overflow-x-auto space-x-3 px-3.5 scrollbar-none"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {loopedColumns.map(({ col, key }) => (
                <div key={key} className="flex flex-col space-y-2.5 shrink-0 w-[136px]">
                  {col.map((album) => (
                    <button
                      key={`${key}_${album.id}`}
                      type="button"
                      onClick={() => {
                        setSelectedAlbumId(album.id);
                        setViewerIndex(null);
                      }}
                      className="group text-left active:scale-95 transition flex flex-col"
                    >
                      <div className="w-[136px] h-[96px] rounded-xl overflow-hidden bg-slate-800/50 border border-white/20 relative shadow-sm">
                        <img
                          src={album.photos[0]}
                          alt={album.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                        <span className="absolute bottom-1.5 right-1.5 bg-black/60 backdrop-blur-sm text-white text-[10px] font-mono px-1.5 py-0.5 rounded-md">
                          {album.photos.length}
                        </span>
                      </div>
                      <span className="mt-1 text-[11px] text-white/95 font-medium truncate w-[136px] leading-tight">
                        {album.title}
                      </span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* 模式 B：單本相簿內頁（可左右滑動切換相簿、點擊開啟大圖） */
        <div
          onTouchStart={handleInnerTouchStart}
          onTouchEnd={handleInnerTouchEnd}
          className="flex flex-col max-h-[46vh]"
        >
          <div className="px-4 py-2.5 flex items-center justify-between border-b border-white/10 shrink-0">
            <button
              type="button"
              onClick={() => {
                setSelectedAlbumId(null);
                setViewerIndex(null);
              }}
              className="flex items-center space-x-1 text-white/90 text-xs font-medium active:scale-95 transition"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
              </svg>
              <span>相簿</span>
            </button>
            <span className="text-xs font-semibold text-white truncate max-w-[65%]">
              {currentAlbum.title}
            </span>
            <span className="text-[10.5px] text-white/70 font-mono">
              {currentAlbum.photos.length} 張
            </span>
          </div>

          <div className="p-2.5 overflow-y-auto grid grid-cols-4 gap-1.5">
            {currentAlbum.photos.map((photoUrl, idx) => (
              <button
                key={`${currentAlbum.id}_p_${idx}`}
                type="button"
                onClick={() => setViewerIndex(idx)}
                className="aspect-square rounded-lg overflow-hidden bg-slate-800/40 active:scale-95 transition"
              >
                <img
                  src={photoUrl}
                  alt=""
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3️⃣ 全螢幕大圖檢視器：無箭頭純滑動、首尾無縫迴圈、大幅下滑關閉、無相簿名稱、底部 iPhone 微型縮圖預覽列 */}
      {currentAlbum && viewerIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between select-none"
          onClick={() => setViewerIndex(null)}
          onTouchStart={handleViewerTouchStart}
          onTouchMove={handleViewerTouchMove}
          onTouchEnd={handleViewerTouchEnd}
        >
          {/* 頂部僅保留極簡張數指示與關閉按鈕 */}
          <div
            className="pt-12 pb-3 px-5 flex items-center justify-between text-white/80 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-xs font-mono tracking-wider">
              {viewerIndex + 1} / {currentAlbum.photos.length}
            </span>
            <button
              type="button"
              onClick={() => setViewerIndex(null)}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white active:scale-90 transition"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>
          </div>

          {/* 中央大圖區（純手勢左右無縫輪播 + 下滑跟隨位移關閉） */}
          <div className="flex-1 flex items-center justify-center overflow-hidden px-2">
            <img
              src={currentAlbum.photos[viewerIndex]}
              alt=""
              onClick={(e) => e.stopPropagation()}
              className="max-w-full max-h-[72vh] object-contain rounded-lg transition-transform duration-150 ease-out"
              style={{
                transform: `translate3d(${dragOffset.x * 0.45}px, ${Math.max(0, dragOffset.y) * 0.85}px, 0)`,
                opacity: dragOffset.y > 0 ? Math.max(0.35, 1 - dragOffset.y / 260) : 1
              }}
            />
          </div>

          {/* 底部 iPhone 風格微型縮圖預覽列（無相簿名稱、當前高亮、點擊跳轉） */}
          <div
            className="pb-8 pt-3 px-3 bg-gradient-to-t from-black via-black/80 to-transparent z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              ref={thumbStripRef}
              className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none py-1 px-4"
            >
              {currentAlbum.photos.map((thumbUrl, tIdx) => {
                const isActive = tIdx === viewerIndex;
                return (
                  <button
                    key={`thumb_${tIdx}`}
                    type="button"
                    onClick={() => setViewerIndex(tIdx)}
                    className={`shrink-0 rounded-md overflow-hidden transition-all duration-200 ${
                      isActive
                        ? 'w-11 h-14 ring-2 ring-[#81D4D2] scale-105 opacity-100 mx-1.5'
                        : 'w-8 h-11 opacity-45 hover:opacity-80'
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
