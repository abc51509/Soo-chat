import React, { useRef, useEffect } from 'react';

export default function FeedModal({
  feedItems,
  selectedFeedItem,
  setSelectedFeedItem,
  currentInterviewDialogue,
  formatVideoSource,
  feedScrollPosition,
  setFeedScrollPosition
}) {
  const feedListScrollRef = useRef(null);
  const feedDetailScrollRef = useRef(null);

  // 當返回列表時，精準還原列表的滾動高度
  useEffect(() => {
    if (!selectedFeedItem && feedListScrollRef.current) {
      feedListScrollRef.current.scrollTop = feedScrollPosition;
    }
  }, [selectedFeedItem, feedScrollPosition]);

  // 點入詳情時，記錄當前列表高度，並將詳情滾輪歸零
  const handleOpenDetail = (item) => {
    if (feedListScrollRef.current) {
      setFeedScrollPosition(feedListScrollRef.current.scrollTop);
    }
    setSelectedFeedItem(item);
    if (feedDetailScrollRef.current) {
      feedDetailScrollRef.current.scrollTop = 0;
    }
  };

  return (
    <div className="absolute inset-0 bg-[#0B1120] z-50 flex flex-col text-slate-100 backdrop-blur-md animate-fade-in select-none">
      {selectedFeedItem ? (
        /* 🌟 個別新聞 / Interview 詳情頁：完全取消頂部 Bar，整面純色直通頂部 */
        <div
          ref={feedDetailScrollRef}
          className="flex-1 overflow-y-auto px-5 pt-14 pb-12 space-y-6"
        >
          {/* 標題與來源資訊 */}
          <div className="space-y-1.5">
            <h2 className="text-2xl font-bold text-white tracking-tight leading-snug">
              {selectedFeedItem.main_title}
            </h2>
            {selectedFeedItem.sub_title && (
              <h4 className="text-[13.5px] font-medium text-[#81D4D2]">
                {selectedFeedItem.sub_title}
              </h4>
            )}
            <div className="flex items-center space-x-1.5 text-[11px] font-mono text-slate-400 pt-1">
              {selectedFeedItem.source && (
                <>
                  <span className="text-slate-300">by {selectedFeedItem.source}</span>
                  {selectedFeedItem.time_text && <span>•</span>}
                </>
              )}
              {selectedFeedItem.time_text && <span>{selectedFeedItem.time_text}</span>}
            </div>
          </div>

          {/* 第一張主圖 (Hero Image，若無圖片則自然略過) */}
          {selectedFeedItem.hero_image && (
            <div className="rounded-2xl overflow-hidden bg-slate-900 shadow-xl border border-white/5">
              <img
                src={selectedFeedItem.hero_image}
                alt="Hero"
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          {/* 影片區塊（包含無圖情境下的 Caption 自動換行處理） */}
          {selectedFeedItem.videos?.length > 0 && (
            <div className="space-y-5">
              {selectedFeedItem.videos.map((vid, vIdx) => {
                const videoInfo = formatVideoSource(vid.url);
                if (videoInfo.type === 'none') return null;

                return (
                  <div key={vIdx} className="space-y-2.5">
                    <div className="rounded-2xl overflow-hidden aspect-video w-full bg-black shadow-lg border border-white/10 flex items-center justify-center">
                      {videoInfo.type === 'youtube' ? (
                        <iframe
                          src={videoInfo.url}
                          title={`Video Player ${vIdx + 1}`}
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <video
                          src={videoInfo.url}
                          controls
                          playsInline
                          className="w-full h-full object-contain bg-black"
                        />
                      )}
                    </div>
                    {/* 🌟 影片 Caption：支援 \n 與分號換行、自動斷詞 */}
                    {vid.caption && (
                      <p className="text-[12px] text-slate-400 font-light text-center leading-relaxed px-3 whitespace-pre-line break-words">
                        {vid.caption.replace(/;/g, '\n')}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* 摘要文字 */}
          {selectedFeedItem.summary && (
            <div className="bg-slate-900/60 p-4 rounded-2xl border border-white/5 text-[13px] leading-relaxed text-slate-300 font-light whitespace-pre-line break-words">
              {selectedFeedItem.summary}
            </div>
          )}

          {/* Layout 設計排版圖片 */}
          {selectedFeedItem.layout_images?.length > 0 && (
            <div className="space-y-3.5">
              {selectedFeedItem.layout_images.map((layoutImg, lIdx) => (
                <div
                  key={lIdx}
                  className="rounded-2xl overflow-hidden bg-slate-900 shadow-lg border border-white/10"
                >
                  <img
                    src={layoutImg}
                    alt={`Layout ${lIdx + 1}`}
                    loading="lazy"
                    className="w-full h-auto object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          {/* 訪談對話室 */}
          {currentInterviewDialogue.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-white/10">
              {currentInterviewDialogue.map((row, idx) => {
                const speakerRaw = (row.speaker || '').trim().toLowerCase();
                const isEditorial = speakerRaw === 'editorial';
                const isSoo = speakerRaw === 'soo' || speakerRaw.includes('lee');
                const contentText = row.content || '';

                if (!contentText) return null;

                if (isEditorial) {
                  return (
                    <div key={idx} className="my-6 px-4 text-center">
                      <p className="text-[12.5px] leading-relaxed text-slate-300 font-normal tracking-wide whitespace-pre-line">
                        {contentText}
                      </p>
                      <div className="w-8 h-[1px] bg-white/20 mx-auto mt-3"></div>
                    </div>
                  );
                }

                return (
                  <div
                    key={idx}
                    className={`w-full flex ${
                      isSoo ? 'justify-end items-start' : 'justify-start items-start'
                    } space-x-2`}
                  >
                    {!isSoo && (
                      <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-[11px] font-semibold text-slate-200 shrink-0 mt-0.5 border border-slate-700 shadow-sm">
                        Q
                      </div>
                    )}

                    <div
                      className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-[12.5px] leading-relaxed shadow-sm bg-white/10 text-slate-100 border border-white/10 ${
                        isSoo ? 'rounded-tr-none' : 'rounded-tl-none'
                      }`}
                    >
                      <p className="whitespace-pre-line break-words">{contentText}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 剩餘照片直排瀑布流 */}
          {selectedFeedItem.remaining_images?.length > 0 && (
            <div className="space-y-3 pt-2">
              {selectedFeedItem.remaining_images.map((imgUrl, rIdx) => (
                <div
                  key={rIdx}
                  className="rounded-2xl overflow-hidden bg-slate-900 shadow-lg border border-white/10"
                >
                  <img
                    src={imgUrl}
                    alt={`Photo ${rIdx + 2}`}
                    loading="lazy"
                    className="w-full h-auto object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Credits 名單 */}
          {selectedFeedItem.credits && (
            <div className="bg-black/60 p-4 rounded-2xl border border-white/10 text-[10.5px] text-slate-400 leading-relaxed font-mono mt-6">
              <span className="text-[#81D4D2] font-semibold block mb-1">CREDITS</span>
              <p className="whitespace-pre-line break-words">{selectedFeedItem.credits}</p>
            </div>
          )}
        </div>
      ) : (
        /* 🌟 FEED 主目錄列表（維持頂部 Bar，獨立滾動容器） */
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="pt-12 pb-5 px-5 bg-[#4E727A] flex items-center justify-start border-b border-[#3D5C63] shadow-md shrink-0">
            <span className="font-bold text-xl tracking-wider text-white">FEED</span>
          </div>

          <div ref={feedListScrollRef} className="flex-1 overflow-y-auto p-3">
            <div className="grid grid-cols-2 gap-2.5">
              {feedItems.map((item, idx) => (
                <article
                  key={idx}
                  onClick={() => handleOpenDetail(item)}
                  className="bg-[#1E293B]/75 rounded-2xl border border-slate-700/60 p-2.5 flex flex-col justify-between space-y-2 shadow-sm hover:border-[#81D4D2]/60 hover:bg-[#1E293B] cursor-pointer transition active:scale-[0.97]"
                >
                  <div>
                   {/* 🌟 Source：字距回調（移除 tracking），微調縮排避免長單字被裁切 */}
<div className="mb-2 h-7 flex items-center">
  <span
    className="font-black text-[17px] sm:text-lg tracking-tight truncate block leading-none text-transparent select-none uppercase"
    style={{
      WebkitTextStroke: '1px #81D4D2',
      textStroke: '1px #81D4D2'
    }}
  >
    {item.source || 'FEED'}
  </span>
</div>

                    {item.hero_image && (
                      <div className="rounded-xl overflow-hidden aspect-[4/3] w-full bg-slate-800 shadow-inner mb-2 relative">
                        <img
                          src={item.hero_image}
                          alt="Preview"
                          loading="lazy"
                          className="w-full h-full object-cover object-[center_20%]"
                        />
                      </div>
                    )}

                    <div className="space-y-0.5">
                      <h3 className="text-[12.5px] font-bold text-white leading-tight line-clamp-2">
                        {item.main_title}
                      </h3>
                      {item.sub_title && (
                        <h4 className="text-[10.5px] font-medium text-slate-300 line-clamp-1">
                          {item.sub_title}
                        </h4>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-[10px] border-t border-white/5">
                    <span className="text-slate-400 font-mono text-[9px] truncate mr-1">
                      {item.time_text}
                    </span>
                    <span className="text-[#81D4D2] font-semibold tracking-wide shrink-0">
                      Read More ➔
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
