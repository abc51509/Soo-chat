import React, { useState, useRef, useEffect, useCallback } from 'react';

export default function AlbumModal({ albumList = [] }) {
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  // 大圖手勢位移狀態
  const [dragX, setDragX] = useState(0);
  const [dragY, setDragY] = useState(0);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isDragging = useRef(false);
  const thumbnailScrollRef = useRef(null);

  const images = selectedAlbum?.images || [];
  const total = images.length;

  const openViewer = (idx) => {
    setCurrentIndex(idx);
    setIsViewerOpen(true);
    setDragX(0);
    setDragY(0);
  };

  const closeViewer = () => {
    setIsViewerOpen(false);
    setDragX(0);
    setDragY(0);
  };

  const goNext = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const goPrev = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  useEffect(() => {
    if (thumbnailScrollRef.current && isViewerOpen) {
      const activeThumb = thumbnailScrollRef.current.children[currentIndex];
      if (activeThumb) {
        activeThumb.scrollIntoView({
          behavior: 'smooth',
          inline: 'center',
          block: 'nearest',
        });
      }
    }
  }, [currentIndex, isViewerOpen]);

  // 大圖手勢滑動
  const onViewerTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isDragging.current = true;
  };

  const onViewerTouchMove = (e) => {
    if (!isDragging.current) return;
    const diffX = e.touches[0].clientX - touchStartX.current;
    const diffY = e.touches[0].clientY - touchStartY.current;

    if (Math.abs(diffY) > Math.abs(diffX) && diffY > 0) {
      e.preventDefault();
      setDragY(diffY);
    } else if (Math.abs(diffX) > Math.abs(diffY)) {
      e.preventDefault();
      setDragX(diffX);
    }
  };

  const onViewerTouchEnd = (e) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const diffX = e.changedTouches[0].clientX - touchStartX.current;
    const diffY = e.changedTouches[0].clientY - touchStartY.current;

    // 下滑關閉
    if (diffY > 80 && Math.abs(diffX) < 100) {
      closeViewer();
      return;
    }

    // 左右滑動切換
    if (Math.abs(diffX) > 40 && Math.abs(diffY) < 70) {
      if (diffX < 0) {
        goNext();
      } else {
        goPrev();
      }
    }

    setDragX(0);
    setDragY(0);
  };

  return (
    <div className="absolute inset-0 bg-[#0B1120] z-50 flex flex-col text-slate-100 backdrop-blur-md animate-fade-in select-none">
      {/* 頂部導航列 */}
      <div className="pt-12 pb-5 px-5 bg-[#4E727A] flex items-center justify-between border-b border-[#3D5C63] shadow-md shrink-0">
        <div className="flex items-center space-x-2 min-w-0 pr-2">
          {selectedAlbum && (
            <button
              onClick={() => {
                setSelectedAlbum(null);
                closeViewer();
              }}
              className="mr-1 text-white/80 hover:text-white p-1 active:scale-90 transition shrink-0"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
              </svg>
            </button>
          )}
          <span className="font-bold text-xl tracking-wider text-white truncate">
            {selectedAlbum ? selectedAlbum.title : 'ALBUMS'}
          </span>
        </div>
      </div>

      {/* 全螢幕大圖瀏覽器 */}
      {isViewerOpen && selectedAlbum && (
        <div
          onTouchStart={onViewerTouchStart}
          onTouchMove={onViewerTouchMove}
          onTouchEnd={onViewerTouchEnd}
          style={{ touchAction: 'none', overscrollBehavior: 'contain' }}
          className="fixed inset-0 bg-black/95 z-[60] flex flex-col justify-between items-center py-6 px-3 animate-fade-in"
        >
          <div className="w-full flex justify-between items-center text-xs font-mono text-slate-400 px-3 pt-2">
            <span className="text-slate-500 text-[11px]">下滑關閉</span>
            <button
              onClick={closeViewer}
              className="w-7 h-7 rounded-full bg-white/10 active:scale-90 flex items-center justify-center text-slate-300"
            >
              ✕
            </button>
          </div>

          <div
            onClick={closeViewer}
            className="relative w-full flex-1 flex items-center justify-center overflow-hidden my-auto"
          >
            <div
              className="flex items-center justify-center w-full h-full transition-transform ease-out"
              style={{
                transform: `translate(${dragX}px, ${dragY}px)`,
                transitionDuration: isDragging.current ? '0ms' : '180ms',
                opacity: dragY > 0 ? Math.max(0.3, 1 - dragY / 250) : 1,
              }}
            >
              <img
                key={`photo-${currentIndex}`}
                src={images[currentIndex]}
                alt="Current"
                className="max-w-[94vw] max-h-[70vh] object-contain rounded-lg shadow-2xl select-none"
              />
            </div>
          </div>

          {/* iPhone 風格縮圖列 */}
          {total > 1 && (
            <div
              ref={thumbnailScrollRef}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[380px] h-12 flex items-center space-x-1.5 overflow-x-auto scrollbar-none px-4 py-1 bg-black/40 rounded-xl backdrop-blur-md border border-white/10 shrink-0 mb-2"
            >
              {images.map((imgUrl, thumbIdx) => {
                const isActive = thumbIdx === currentIndex;
                return (
                  <button
                    key={thumbIdx}
                    onClick={() => setCurrentIndex(thumbIdx)}
                    className={`h-9 aspect-[3/4] rounded-md overflow-hidden shrink-0 transition-all ${
                      isActive
                        ? 'ring-2 ring-[#81D4D2] scale-105 opacity-100'
                        : 'opacity-40 hover:opacity-75'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`Thumb ${thumbIdx}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 主內容區 */}
      {selectedAlbum ? (
        /* 點入後的相簿照片瀑布流 */
        <div className="flex-1 overflow-y-auto p-3.5">
          <div className="grid grid-cols-3 gap-1.5">
            {selectedAlbum.images.map((imgUrl, idx) => (
              <div
                key={idx}
                onClick={() => openViewer(idx)}
                className="aspect-[3/4] rounded-lg overflow-hidden bg-slate-900 border border-white/5 cursor-pointer hover:opacity-90 active:scale-[0.98] transition shadow-sm"
              >
                <img
                  src={imgUrl}
                  alt={`Photo ${idx + 1}`}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* 🌟 重新撰寫：兩排、橫向滑動軌道（grid-rows-2 + grid-flow-col）、對齊橫向中線、直式封面 */
        <div className="flex-1 flex items-center overflow-x-auto overflow-y-hidden px-4 py-3 scrollbar-none snap-x snap-mandatory">
          <div className="grid grid-rows-2 grid-flow-col gap-3 my-auto auto-cols-[150px] sm:auto-cols-[165px]">
            {albumList.map((album, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedAlbum(album)}
                className="snap-start flex flex-col bg-[#1E293B]/85 rounded-xl border border-slate-700/60 p-2 shadow-md hover:border-[#81D4D2]/60 hover:bg-[#1E293B] cursor-pointer transition-all active:scale-[0.96]"
              >
                {/* 🌟 封面：直式海報比例 (aspect-[3/4]) */}
                <div className="rounded-lg overflow-hidden aspect-[3/4] w-full bg-slate-800 shadow-inner relative shrink-0">
                  {album.cover ? (
                    <img
                      src={album.cover}
                      alt={album.title}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600 text-[10px] font-mono">
                      NO COVER
                    </div>
                  )}
                  {/* 照片張數標籤 */}
                  <span className="absolute bottom-1 right-1 bg-black/75 backdrop-blur-sm text-[#81D4D2] text-[8.5px] font-mono px-1.5 py-0.2 rounded-full border border-white/10">
                    {album.count} P
                  </span>
                </div>

                {/* 相簿組裝名稱：來源-時間-品牌-相簿名稱 */}
                <div className="pt-1.5 px-0.5 min-h-[32px] flex items-center">
                  <h3 className="text-[11px] font-medium text-slate-100 leading-snug line-clamp-2">
                    {album.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
