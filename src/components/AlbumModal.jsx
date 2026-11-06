import React, { useState, useRef } from 'react';

export default function AlbumModal({ albumList = [] }) {
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [viewingPhotoIndex, setViewingPhotoIndex] = useState(null);

  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isSwiping = useRef(false);

  // 🌟 完全無延遲、即時更新 index 的環狀輪播（移除 setTimeout 造成的彈回假象）
  const handlePrevPhoto = (e) => {
    if (e) e.stopPropagation();
    if (!selectedAlbum?.images?.length) return;
    const len = selectedAlbum.images.length;
    setViewingPhotoIndex((prev) => (prev - 1 + len) % len);
  };

  const handleNextPhoto = (e) => {
    if (e) e.stopPropagation();
    if (!selectedAlbum?.images?.length) return;
    const len = selectedAlbum.images.length;
    setViewingPhotoIndex((prev) => (prev + 1) % len);
  };

  // 攔截並防止瀏覽器外層橡皮筋回彈
  const onViewerTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isSwiping.current = true;
  };

  const onViewerTouchMove = (e) => {
    if (!isSwiping.current) return;
    const deltaX = Math.abs(e.touches[0].clientX - touchStartX.current);
    const deltaY = Math.abs(e.touches[0].clientY - touchStartY.current);
    // 當以橫向滑動為主時，阻斷原生捲動回彈
    if (deltaX > deltaY) {
      e.preventDefault();
    }
  };

  const onViewerTouchEnd = (e) => {
    if (!isSwiping.current) return;
    isSwiping.current = false;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;

    // 水平滑動位移超過 35px 觸發換頁
    if (Math.abs(deltaX) > 35 && Math.abs(deltaY) < 60) {
      if (deltaX < 0) {
        handleNextPhoto();
      } else {
        handlePrevPhoto();
      }
    }
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
                setViewingPhotoIndex(null);
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
        <span className="text-xs text-teal-200/80 font-mono shrink-0">
          {selectedAlbum ? `${selectedAlbum.count} P` : `${albumList.length} ALBUMS`}
        </span>
      </div>

      {/* 🌟 全螢幕大圖瀏覽：增加 touch-action-none 與 overscroll-contain 阻止系統回彈 */}
      {viewingPhotoIndex !== null && selectedAlbum && (
        <div
          onClick={() => setViewingPhotoIndex(null)}
          onTouchStart={onViewerTouchStart}
          onTouchMove={onViewerTouchMove}
          onTouchEnd={onViewerTouchEnd}
          style={{ touchAction: 'none', overscrollBehavior: 'contain' }}
          className="fixed inset-0 bg-black/95 z-[60] flex flex-col justify-between items-center py-10 px-4 animate-fade-in"
        >
          <div className="w-full flex justify-between items-center text-xs font-mono text-slate-400 px-2 pointer-events-none">
            <span className="bg-white/10 px-2.5 py-0.5 rounded-full text-slate-200 font-mono">
              {viewingPhotoIndex + 1} / {selectedAlbum.images.length}
            </span>
            <span className="text-slate-400">點擊背景關閉</span>
          </div>

          {/* 圖片主體：利用 key 確保每一次圖片變換都是流暢的獨立載入，不產生位移彈跳 */}
          <div className="relative w-full flex-1 flex items-center justify-center my-4 overflow-hidden pointer-events-none">
            <img
              key={`photo_${viewingPhotoIndex}`}
              src={selectedAlbum.images[viewingPhotoIndex]}
              alt="Viewing"
              className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl select-none"
            />

            <button
              onClick={handlePrevPhoto}
              className="pointer-events-auto absolute left-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/15 active:scale-90 transition shadow-lg"
            >
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
              </svg>
            </button>

            <button
              onClick={handleNextPhoto}
              className="pointer-events-auto absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/15 active:scale-90 transition shadow-lg"
            >
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
              </svg>
            </button>
          </div>

          <div className="text-[11.5px] text-slate-400 font-mono tracking-wider line-clamp-1 px-4 text-center pointer-events-none">
            {selectedAlbum.title}
          </div>
        </div>
      )}

      {/* 主內容區：九宮格 vs 相簿目錄 */}
      <div className="flex-1 overflow-y-auto p-4">
        {selectedAlbum ? (
          <div className="grid grid-cols-3 gap-1.5">
            {selectedAlbum.images.map((imgUrl, idx) => (
              <div
                key={idx}
                onClick={() => setViewingPhotoIndex(idx)}
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
          <div className="grid grid-cols-2 gap-3.5">
            {albumList.map((album, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedAlbum(album)}
                className="bg-[#1E293B]/80 rounded-2xl border border-slate-700/60 p-2.5 flex flex-col justify-between space-y-2.5 shadow-sm hover:border-[#81D4D2]/60 hover:bg-[#1E293B] cursor-pointer transition active:scale-[0.97]"
              >
                <div className="rounded-xl overflow-hidden aspect-[3/4] w-full bg-slate-800 shadow-inner relative">
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
                  <span className="absolute bottom-1.5 right-1.5 bg-black/75 backdrop-blur-sm text-[#81D4D2] text-[9px] font-mono px-1.5 py-0.5 rounded-full border border-white/10">
                    {album.count} P
                  </span>
                </div>

                <div className="px-0.5">
                  <h3 className="text-[12.5px] font-bold text-white leading-snug line-clamp-2">
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
