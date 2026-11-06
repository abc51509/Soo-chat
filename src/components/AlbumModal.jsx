import React, { useState, useRef } from 'react';

export default function AlbumModal({ albumList = [] }) {
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [viewingPhotoIndex, setViewingPhotoIndex] = useState(null);
  const [isFading, setIsFading] = useState(false);

  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  // 🌟 真正無縫環狀輪播（加短暫淡入，滑順切換消除回彈感）
  const triggerChange = (nextIndex) => {
    setIsFading(true);
    setTimeout(() => {
      setViewingPhotoIndex(nextIndex);
      setIsFading(false);
    }, 120);
  };

  const handlePrevPhoto = (e) => {
    if (e) e.stopPropagation();
    if (!selectedAlbum?.images?.length) return;
    const len = selectedAlbum.images.length;
    // (index - 1 + len) % len 實現 0 ➔ len-1 環狀迴圈
    const nextIdx = (viewingPhotoIndex - 1 + len) % len;
    triggerChange(nextIdx);
  };

  const handleNextPhoto = (e) => {
    if (e) e.stopPropagation();
    if (!selectedAlbum?.images?.length) return;
    const len = selectedAlbum.images.length;
    // (index + 1) % len 實現 len-1 ➔ 0 環狀迴圈
    const nextIdx = (viewingPhotoIndex + 1) % len;
    triggerChange(nextIdx);
  };

  // 支援大圖手勢滑動
  const onViewerTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const onViewerTouchEnd = (e) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;

    // 水平滑動大於 40px 且垂直位移小於 50px
    if (Math.abs(deltaX) > 40 && Math.abs(deltaY) < 50) {
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
        <div className="flex items-center space-x-2">
          {selectedAlbum && (
            <button
              onClick={() => {
                setSelectedAlbum(null);
                setViewingPhotoIndex(null);
              }}
              className="mr-1 text-white/80 hover:text-white p-1 active:scale-90 transition"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
              </svg>
            </button>
          )}
          <span className="font-bold text-xl tracking-wider text-white line-clamp-1">
            {selectedAlbum ? selectedAlbum.title : 'ALBUMS'}
          </span>
        </div>
        <span className="text-xs text-teal-200/80 font-mono shrink-0 ml-2">
          {selectedAlbum ? `${selectedAlbum.count} P` : `${albumList.length} ALBUMS`}
        </span>
      </div>

      {/* 單張照片大圖全螢幕瀏覽模式（支援左右滑動與平滑迴圈切換） */}
      {viewingPhotoIndex !== null && selectedAlbum && (
        <div
          onClick={() => setViewingPhotoIndex(null)}
          onTouchStart={onViewerTouchStart}
          onTouchEnd={onViewerTouchEnd}
          className="fixed inset-0 bg-black/95 z-[60] flex flex-col justify-between items-center py-10 px-4 animate-fade-in"
        >
          {/* 上方頁數與關閉提示 */}
          <div className="w-full flex justify-between items-center text-xs font-mono text-slate-400 px-2">
            <span className="bg-white/10 px-2.5 py-0.5 rounded-full text-slate-200">
              {viewingPhotoIndex + 1} / {selectedAlbum.images.length}
            </span>
            <span className="text-slate-400">點擊背景關閉</span>
          </div>

          {/* 圖片展示主體（加入淡入過渡消除突兀感） */}
          <div className="relative w-full flex-1 flex items-center justify-center my-4 overflow-hidden">
            <img
              key={viewingPhotoIndex}
              src={selectedAlbum.images[viewingPhotoIndex]}
              alt="Viewing"
              className={`max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl select-none transition-opacity duration-150 ${
                isFading ? 'opacity-30 scale-98' : 'opacity-100 scale-100'
              }`}
            />

            {/* 左切換按鈕 */}
            <button
              onClick={handlePrevPhoto}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/15 active:scale-90 transition shadow-lg"
            >
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
              </svg>
            </button>

            {/* 右切換按鈕 */}
            <button
              onClick={handleNextPhoto}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/15 active:scale-90 transition shadow-lg"
            >
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
              </svg>
            </button>
          </div>

          {/* 底部相簿標題 */}
          <div className="text-[11.5px] text-slate-400 font-mono tracking-wider line-clamp-1 px-4 text-center">
            {selectedAlbum.title}
          </div>
        </div>
      )}

      {/* 主內容區：九宮格 vs 目錄列表 */}
      <div className="flex-1 overflow-y-auto p-4">
        {selectedAlbum ? (
          /* 相簿照片九宮格瀑布流 */
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
          /* 相簿外層目錄卡片列表 */
          <div className="grid grid-cols-2 gap-3.5">
            {albumList.map((album, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedAlbum(album)}
                className="bg-[#1E293B]/80 rounded-2xl border border-slate-700/60 p-2.5 flex flex-col justify-between space-y-2.5 shadow-sm hover:border-[#81D4D2]/60 hover:bg-[#1E293B] cursor-pointer transition active:scale-[0.97]"
              >
                {/* 封面照片 (比例 3:4) */}
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
                  {/* 照片張數標籤 */}
                  <span className="absolute bottom-1.5 right-1.5 bg-black/75 backdrop-blur-sm text-[#81D4D2] text-[9px] font-mono px-1.5 py-0.5 rounded-full border border-white/10">
                    {album.count} P
                  </span>
                </div>

                {/* 相簿完整組裝名稱 */}
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
