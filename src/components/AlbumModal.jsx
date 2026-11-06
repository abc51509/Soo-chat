import React, { useState, useRef, useEffect, useCallback } from 'react';

export default function AlbumModal({ albumList = [] }) {
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  // 滑動軌道狀態
  const [dragOffset, setDragOffset] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isDragging = useRef(false);

  const images = selectedAlbum?.images || [];
  const total = images.length;

  const openViewer = (idx) => {
    setCurrentIndex(idx);
    setIsViewerOpen(true);
    setDragOffset(0);
  };

  const closeViewer = () => {
    setIsViewerOpen(false);
    setDragOffset(0);
  };

  // 真正的無縫循環換頁
  const goNext = useCallback(() => {
    if (total <= 1 || isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total, isAnimating]);

  const goPrev = useCallback(() => {
    if (total <= 1 || isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total, isAnimating]);

  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => setIsAnimating(false), 220);
      return () => clearTimeout(timer);
    }
  }, [isAnimating]);

  // 手勢滑動處理（阻止外層滾動回彈）
  const onTouchStart = (e) => {
    if (total <= 1 || isAnimating) return;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isDragging.current = true;
  };

  const onTouchMove = (e) => {
    if (!isDragging.current) return;
    const diffX = e.touches[0].clientX - touchStartX.current;
    const diffY = e.touches[0].clientY - touchStartY.current;

    // 橫向滑動為主時，攔截原生事件防止橡皮筋
    if (Math.abs(diffX) > Math.abs(diffY)) {
      e.preventDefault();
      setDragOffset(diffX);
    }
  };

  const onTouchEnd = (e) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const diffX = e.changedTouches[0].clientX - touchStartX.current;

    if (diffX < -45) {
      // 往左滑 ➔ 下一張
      goNext();
    } else if (diffX > 45) {
      // 往右滑 ➔ 上一張
      goPrev();
    }
    setDragOffset(0);
  };

  // 取得虛擬三張軌道（前一張、當前張、下一張），實現無縫環狀輪播
  const prevIdx = (currentIndex - 1 + total) % total;
  const nextIdx = (currentIndex + 1) % total;

  return (
    <div className="absolute inset-0 bg-[#0B1120] z-50 flex flex-col text-slate-100 backdrop-blur-md animate-fade-in select-none">
      {/* 頂部導航列（已移除共幾本相簿計數，保持純淨） */}
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

      {/* 🌟 全螢幕大圖瀏覽器：真正無回彈的單向循環軌道 */}
      {isViewerOpen && selectedAlbum && (
        <div
          onClick={closeViewer}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          style={{ touchAction: 'none', overscrollBehavior: 'contain' }}
          className="fixed inset-0 bg-black/95 z-[60] flex flex-col justify-between items-center py-10 px-2 animate-fade-in"
        >
          {/* 頂部操作提示（已移除 1/N 頁碼） */}
          <div className="w-full flex justify-end items-center text-xs font-mono text-slate-400 px-4 pointer-events-none">
            <span className="text-slate-400/80">點擊背景關閉</span>
          </div>

          {/* 無縫滑動視窗核心 */}
          <div className="relative w-full flex-1 flex items-center justify-center overflow-hidden my-auto">
            {total > 1 ? (
              <div
                className="flex items-center justify-center w-full h-full transition-transform ease-out"
                style={{
                  transform: `translateX(${dragOffset}px)`,
                  transitionDuration: isDragging.current ? '0ms' : '200ms',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  key={`img-${currentIndex}`}
                  src={images[currentIndex]}
                  alt="Current"
                  className="max-w-[92vw] max-h-[72vh] object-contain rounded-lg shadow-2xl select-none"
                />
              </div>
            ) : (
              <img
                src={images[0]}
                alt="Single"
                onClick={(e) => e.stopPropagation()}
                className="max-w-[92vw] max-h-[72vh] object-contain rounded-lg shadow-2xl select-none"
              />
            )}

            {/* 左右切換按鈕（無限巡迴無阻力） */}
            {total > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goPrev();
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/15 active:scale-90 transition shadow-lg z-20"
                >
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                  </svg>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goNext();
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/15 active:scale-90 transition shadow-lg z-20"
                >
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                  </svg>
                </button>
              </>
            )}
          </div>

          {/* 底部相簿標題 */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="text-[12px] text-slate-300 font-mono tracking-wider line-clamp-1 px-4 text-center"
          >
            {selectedAlbum.title}
          </div>
        </div>
      )}

      {/* 主內容區 */}
      <div className="flex-1 overflow-y-auto p-4">
        {selectedAlbum ? (
          /* 點入後的照片列表 */
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
          /* 🌟 外層相簿卡片目錄：全面改為「橫向大圖」且高度齊平 (aspect-[16/10]) */
          <div className="flex flex-col space-y-4">
            {albumList.map((album, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedAlbum(album)}
                className="bg-[#1E293B]/80 rounded-2xl border border-slate-700/60 p-3 flex flex-col space-y-2.5 shadow-md hover:border-[#81D4D2]/60 hover:bg-[#1E293B] cursor-pointer transition active:scale-[0.98]"
              >
                {/* 🌟 橫向大圖封面：比例約 16:10，高度齊平裁切 */}
                <div className="rounded-xl overflow-hidden aspect-[16/10] w-full bg-slate-800 shadow-inner relative">
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
                  <span className="absolute bottom-2 right-2 bg-black/75 backdrop-blur-sm text-[#81D4D2] text-[10px] font-mono px-2 py-0.5 rounded-full border border-white/10">
                    {album.count} P
                  </span>
                </div>

                {/* 相簿完整組裝名稱 */}
                <div className="px-1">
                  <h3 className="text-[13.5px] font-bold text-white leading-snug line-clamp-2">
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
