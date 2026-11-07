import React, { useState, useRef, useEffect, useCallback } from 'react';

export default function AlbumModal({ albumList = [] }) {
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  // 手勢座標與位移狀態
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

  // 無縫循環換頁
  const goNext = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const goPrev = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // 當 currentIndex 改變時，自動將底部 iPhone 風格縮圖置中
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

  // 大圖手勢滑動判定
  const onViewerTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isDragging.current = true;
  };

  const onViewerTouchMove = (e) => {
    if (!isDragging.current) return;
    const diffX = e.touches[0].clientX - touchStartX.current;
    const diffY = e.touches[0].clientY - touchStartY.current;

    // 若垂直位移較大且往下拖，阻斷原生滾動以支援下拉關閉
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

    // 🌟 判定大幅度下滑關閉（下拉超過 80px）
    if (diffY > 80 && Math.abs(diffX) < 100) {
      closeViewer();
      return;
    }

    // 🌟 判定左右滑動換頁（橫向超過 40px）
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

      {/* 🌟 全螢幕大圖瀏覽器：純滑動手勢＋下拉關閉＋iPhone 風格縮圖列 */}
      {isViewerOpen && selectedAlbum && (
        <div
          onTouchStart={onViewerTouchStart}
          onTouchMove={onViewerTouchMove}
          onTouchEnd={onViewerTouchEnd}
          style={{ touchAction: 'none', overscrollBehavior: 'contain' }}
          className="fixed inset-0 bg-black/95 z-[60] flex flex-col justify-between items-center py-6 px-3 animate-fade-in"
        >
          {/* 頂部操作提示 */}
          <div className="w-full flex justify-between items-center text-xs font-mono text-slate-400 px-3 pt-2">
            <span className="text-slate-500 text-[11px]">下滑關閉</span>
            <button
              onClick={closeViewer}
              className="w-7 h-7 rounded-full bg-white/10 active:scale-90 flex items-center justify-center text-slate-300"
            >
              ✕
            </button>
          </div>

          {/* 照片主體（支援手勢即時位移反饋，無任何箭頭按鈕） */}
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

          {/* 🌟 iPhone 風格下方微型縮圖列（點擊跳轉＋當前高亮） */}
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
      <div className="flex-1 overflow-y-auto p-3.5">
        {selectedAlbum ? (
          /* 點入後的照片九宮格瀑布流 */
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
        ) : (
          /* 🌟 外層相簿卡片目錄：改回雙排網格（grid-cols-2），封面為橫向 4:3 齊平 */
          <div className="grid grid-cols-2 gap-3">
            {albumList.map((album, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedAlbum(album)}
                className="bg-[#1E293B]/80 rounded-2xl border border-slate-700/60 p-2.5 flex flex-col justify-between space-y-2 shadow-sm hover:border-[#81D4D2]/60 hover:bg-[#1E293B] cursor-pointer transition active:scale-[0.97]"
              >
                {/* 封面照片：橫向比例 aspect-[4/3]，高度齊平 */}
                <div className="rounded-xl overflow-hidden aspect-[4/3] w-full bg-slate-800 shadow-inner relative">
                  {album.cover ? (
                    <img
                      src={album.cover}
                      alt={album.title}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs font-mono">
                      NO COVER
                    </div>
                  )}
                  {/* 照片張數標籤 */}
                  <span className="absolute bottom-1.5 right-1.5 bg-black/75 backdrop-blur-sm text-[#81D4D2] text-[9px] font-mono px-1.5 py-0.5 rounded-full border border-white/10">
                    {album.count} P
                  </span>
                </div>

                {/* 相簿完整組裝名稱 */}
                <div className="px-0.5">
                  <h3 className="text-[12px] font-bold text-white leading-snug line-clamp-2">
                    {album.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
