import React, { useState, useMemo } from 'react';

const getField = (obj, ...keys) => {
  if (!obj) return '';
  for (const k of keys) {
    const cleanKey = k.toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (obj[k]?.trim()) return obj[k].trim();
    if (obj[cleanKey]?.trim()) return obj[cleanKey].trim();
  }
  return '';
};

const getYouTubeEmbedUrl = (rawUrl) => {
  if (!rawUrl) return null;
  const match = rawUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:shorts\/|embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=0&controls=1&playsinline=1` : null;
};

const formatVideoSource = (raw) => {
  if (!raw?.trim()) return { type: 'none', url: '' };
  const clean = raw.trim();
  const ytUrl = getYouTubeEmbedUrl(clean);
  if (ytUrl) return { type: 'youtube', url: ytUrl };

  let finalPath = clean;
  if (!finalPath.startsWith('http') && !finalPath.startsWith('/')) {
    finalPath = finalPath.startsWith('video/') ? `/${finalPath}` : `/video/${finalPath}`;
  }
  return { type: 'direct', url: finalPath };
};

export default function FeedModal({ mediaData = [], interviewData = [] }) {
  const [selectedFeedItem, setSelectedFeedItem] = useState(null);

  // 🌟 FEED 自治資料處理：只認 news_title，多列同名自動合併照片/影片
  const feedItems = useMemo(() => {
    const grouped = {};

    mediaData.forEach(m => {
      const title = (m.news_title || '').trim();
      if (!title) return;

      const videoUrl = getField(m, 'video_url', 'videourl', 'video');
      const eventId = getField(m, 'event_id', 'interview_id', 'id');

      if (!grouped[title]) {
        grouped[title] = {
          main_title: title,
          sub_title: getField(m, 'news_subtitle', 'subtitle'),
          source: getField(m, 'news_source', 'source'),
          time_text: getField(m, 'date'),
          summary: getField(m, 'news_summary', 'summary'),
          interview_id: eventId,
          videos: [],
          credits: getField(m, 'credits', 'credit'),
          main_images: [],
          layout_images: []
        };
      }

      if (eventId && !grouped[title].interview_id) {
        grouped[title].interview_id = eventId;
      }

      if (videoUrl) {
        const urls = videoUrl.split(/;|\n{2,}/).map(s => s.trim()).filter(Boolean);
        const rawCaption = getField(m, 'video_caption', 'videocaption', 'video_desc');
        let caps = urls.length <= 1 ? [rawCaption] : rawCaption.split(';').map(s => s.trim());

        urls.forEach((u, i) => {
          if (!grouped[title].videos.some(v => v.url === u)) {
            grouped[title].videos.push({
              url: u,
              caption: caps[i] !== undefined ? caps[i] : (caps[0] || '')
            });
          }
        });
      }

      const rawImgs = getField(m, 'images', 'image');
      const imgs = rawImgs.split(/[\s,]+/).map(u => u.trim()).filter(u => u.startsWith('http'));
      const subType = getField(m, 'sub_type', 'subtype').toLowerCase();
      if (subType === 'layout') {
        grouped[title].layout_images.push(...imgs);
      } else {
        grouped[title].main_images.push(...imgs);
      }
    });

    return Object.values(grouped).map(item => ({
      ...item,
      hero_image: item.main_images[0] || item.layout_images[0] || null,
      remaining_images: item.main_images.slice(1)
    }));
  }, [mediaData]);

  // 訪談配對
  const currentInterviewDialogue = useMemo(() => {
    if (!selectedFeedItem?.interview_id) return [];
    const targetId = selectedFeedItem.interview_id.trim().toLowerCase();

    return interviewData
      .filter(row => {
        const rowId = getField(row, 'event_id', 'interview_id', 'interviewid', 'id', 'col_0').trim().toLowerCase();
        return rowId && rowId === targetId;
      })
      .map(row => ({
        speaker: getField(row, 'speaker', 'role', 'name', 'col_1') || 'Q',
        content: getField(row, 'content', 'text', 'dialogue', 'answer', 'col_2') || ''
      }))
      .filter(item => item.content.length > 0);
  }, [selectedFeedItem, interviewData]);

  return (
    <div className="absolute inset-0 bg-[#0B1120] z-50 flex flex-col text-slate-100 backdrop-blur-md animate-fade-in select-none">
      {/* 🌟 頂部導航列：pt-14 pb-2.5 items-end，文字完全靠近 bar 底部 */}
      <div className="pt-14 pb-2.5 px-5 bg-[#4E727A] flex items-end justify-between border-b border-[#3D5C63] shadow-md shrink-0 h-[88px]">
        <div className="flex items-center space-x-2 min-w-0 pr-2">
          {selectedFeedItem && (
            <button
              onClick={() => setSelectedFeedItem(null)}
              className="mr-1 text-white/80 hover:text-white p-0.5 active:scale-90 transition shrink-0"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
              </svg>
            </button>
          )}
          <span className="font-bold text-xl tracking-wider text-white truncate leading-none">
            {selectedFeedItem ? (selectedFeedItem.source || 'ARTICLE') : 'FEED'}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {selectedFeedItem ? (
          /* 新聞詳情頁 */
          <div className="bg-[#1E293B]/85 rounded-2xl border border-slate-700/60 p-4 space-y-4">
            <h2 className="text-base font-bold text-white leading-snug">{selectedFeedItem.main_title}</h2>
            {selectedFeedItem.sub_title && (
              <h3 className="text-xs text-teal-300 font-medium">{selectedFeedItem.sub_title}</h3>
            )}
            {selectedFeedItem.hero_image && (
              <div className="rounded-xl overflow-hidden border border-white/10 aspect-[16/10]">
                <img src={selectedFeedItem.hero_image} alt="Hero" className="w-full h-full object-cover" />
              </div>
            )}
            {selectedFeedItem.summary && (
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{selectedFeedItem.summary}</p>
            )}

            {/* 訪談 Q&A */}
            {currentInterviewDialogue.length > 0 && (
              <div className="pt-2 border-t border-white/10 space-y-3">
                {currentInterviewDialogue.map((d, i) => (
                  <div key={i} className="text-xs leading-relaxed space-y-1">
                    <span className="font-bold text-[#81D4D2] block">{d.speaker}</span>
                    <p className="text-slate-300 pl-2 border-l border-teal-500/40">{d.content}</p>
                  </div>
                ))}
              </div>
            )}

            {/* 影片播放 */}
            {selectedFeedItem.videos.map((vid, idx) => {
              const src = formatVideoSource(vid.url);
              return (
                <div key={idx} className="space-y-1.5 pt-2">
                  <div className="rounded-xl overflow-hidden aspect-video bg-black">
                    {src.type === 'youtube' ? (
                      <iframe src={src.url} title="Video" className="w-full h-full border-0" allowFullScreen />
                    ) : src.type === 'direct' ? (
                      <video src={src.url} controls className="w-full h-full object-cover" />
                    ) : null}
                  </div>
                  {vid.caption && <span className="text-[11px] text-slate-400 block">{vid.caption}</span>}
                </div>
              );
            })}
          </div>
        ) : (
          /* 新聞列表 */
          feedItems.map((item, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedFeedItem(item)}
              className="bg-[#1E293B]/80 rounded-2xl border border-slate-700/60 p-3.5 space-y-2.5 cursor-pointer hover:border-[#81D4D2]/60 hover:bg-[#1E293B] transition active:scale-[0.98]"
            >
              {item.hero_image && (
                <div className="rounded-xl overflow-hidden aspect-[16/10] bg-slate-800">
                  <img src={item.hero_image} alt={item.main_title} loading="lazy" className="w-full h-full object-cover" />
                </div>
              )}
              <h3 className="text-xs font-bold text-white line-clamp-2 leading-snug">{item.main_title}</h3>
              {item.summary && <p className="text-[11px] text-slate-400 line-clamp-2">{item.summary}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
