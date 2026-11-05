import React, { useState } from 'react';

export default function AlbumModal({ albumList, albumPages, onClose }) {
  const [selectedAlbumName, setSelectedAlbumName] = useState(null);

  const activeAlbumDetail = selectedAlbumName
    ? albumList.find((a) => a.title === selectedAlbumName) || null
    : null;

  return (
    <div className="absolute inset-0 bg-[#0B1120] z-50 flex flex-col text-white backdrop-blur-md animate-fade-in">
      {selectedAlbumName && activeAlbumDetail ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="pt-12 pb-5 px-5 bg-[#4E727A] flex items-center justify-start border-b border-[#3D5C63] shadow-md shrink-0">
            <span className="font-bold text-xl text-white truncate max-w-[320px]">
              {activeAlbumDetail.title}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            <div className="grid grid-cols-3 gap-1.5 rounded-xl overflow-hidden">
              {activeAlbumDetail.images.map((img, i) => (
                <a
                  key={i}
                  href={img}
                  target="_blank"
                  rel="noreferrer"
                  className="block aspect-[3/4] bg-slate-800 overflow-hidden rounded-md group"
                >
                  <img
                    src={img}
                    alt={`Shot ${i + 1}`}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                  />
                </a>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="pt-12 pb-5 px-5 bg-[#4E727A] flex items-center justify-start border-b border-[#3D5C63] shadow-md shrink-0">
            <span className="font-bold text-xl tracking-wider text-white">ALBUM</span>
          </div>

          <div className="flex-1 flex overflow-x-auto snap-x snap-mandatory scrollbar-none p-4 items-start pt-6">
            {albumPages.map((pageGroup, pIdx) => (
              <div
                key={pIdx}
                className="w-full shrink-0 snap-center grid grid-cols-2 gap-4 px-1 self-start"
              >
                {pageGroup.map((alb) => (
                  <div
                    key={alb.title}
                    onClick={() => setSelectedAlbumName(alb.title)}
                    className="flex flex-col cursor-pointer group active:scale-[0.97] transition"
                  >
                    <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-slate-800 shadow-md border border-white/10 relative group-hover:border-[#81D4D2]/60 transition">
                      <img
                        src={alb.cover}
                        alt={alb.title}
                        loading="lazy"
                        className="w-full h-full object-cover object-[center_20%]"
                      />
                      <span className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[9px] px-2 py-0.5 rounded-md font-mono">
                        {alb.count}P
                      </span>
                    </div>

                    <div className="mt-2 px-1">
                      <h4 className="text-[12px] font-medium text-slate-200 group-hover:text-[#81D4D2] leading-snug break-words whitespace-normal line-clamp-2">
                        {alb.title}
                      </h4>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
