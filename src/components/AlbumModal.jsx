import React, { useState } from 'react';

export default function AlbumModal({ albumList = [] }) {
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [viewingPhotoIndex, setViewingPhotoIndex] = useState(null);

  // 左右切換照片（支援無限循環）
  const handlePrevPhoto = (e) => {
    e.stopPropagation();
    if (!selectedAlbum?.images?.length) return;
    setViewingPhotoIndex((prev) =>
      prev === 0 ? selectedAlbum.images.length - 1 : prev - 1
    );
  };

  const handleNextPhoto = (e) => {
    e.stopPropagation();
    if (!selectedAlbum?.images?.length) return;
    setViewingPhotoIndex((prev) =>
      prev === selectedAlbum.images.length - 1 ? 0 : prev + 1
    );
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
              className="mr-1 text-white/80 hover:text-white p-1"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
              </svg>
            </button>
          )}
          <span className="font-bold text-xl tracking-wider text-white">
            {selectedAlbum ? selectedAlbum.title : 'ALBUMS'}
          </span>
        </div>
        <span className="text-xs text-teal-200/80 font-mono">
          {selectedAlbum ? `${selectedAlbum.count} P` : `${albumList.length} ALBUMS`}
        </span>
      </div>

      {/* 單張照片大圖瀏覽模式（支援左右翻頁） */}
      {viewingPhotoIndex !== null && selectedAlbum && (
        <div
          onClick={() => setViewingPhotoIndex(null)}
          className="fixed inset-0 bg-black/95 z-[60] flex flex-col justify-between items-center py-10 px-4 animate-fade-in"
        >
          <div className="w-full flex justify-between items-center text-xs font-mono text-slate-400 px-2">
            <span>
              {viewingPhotoIndex + 1} / {selectedAlbum.images.length}
            </span>
            <span className="text-white">點擊背景關閉</span>
          </div>

          <div className="relative w-full flex-1 flex items-center justify-center my-4 overflow-hidden">
            <img
              src={selectedAlbum.images[viewingPhotoIndex]}
              alt="Viewing"
              className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl select-none"
            />

            {/* 左切換按鈕 */}
            <button
              onClick={handlePrevPhoto}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center border border-white/10 active:scale-95 transition"
            >
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
              </svg>
            </button>

            {/* 右切換按鈕 */}
            <button
              onClick={handleNextPhoto}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center border border-white/10 active:scale-95 transition"
            >
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
              </svg>
            </button>
          </div>

          <div className="text-[11px] text-slate-400 font-mono tracking-wider line-clamp-1">
            {selectedAlbum.title}
          </div>
        </div>
      )}

      {/* 主內容區：相簿九宮格 vs 相簿目錄卡片 */}
      <div className="flex-1 overflow-y-auto p-4">
        {selectedAlbum ? (
          /* 點入相簿後的照片九宮格瀑布流 */
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
          /* 相簿外層目錄卡片列表（完整顯示組裝後的動態名稱） */
          <div className="grid grid-cols-2 gap-3.5">
            {albumList.map((album, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedAlbum(album)}
                className="bg-[#1E293B]/80 rounded-2xl border border-slate-700/60 p-2.5 flex flex-col justify-between space-y-2.5 shadow-sm hover:border-[#81D4D2]/60 hover:bg-[#1E293B] cursor-pointer transition active:scale-[0.97]"
              >
                {/* 封面照片 (比例齊平為 3:4) */}
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
                  {/* 照片數量浮水印標籤 */}
                  <span className="absolute bottom-1.5 right-1.5 bg-black/75 backdrop-blur-sm text-[#81D4D2] text-[9px] font-mono px-1.5 py-0.5 rounded-full border border-white/10">
                    {album.count} P
                  </span>
                </div>

                {/* 🌟 相簿完整組裝名稱（兩行自然截斷） */}
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
