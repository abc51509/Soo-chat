import React from 'react';

export default function FileModal({ dynamicVoiceList, AudioBubble }) {
  return (
    <div className="absolute inset-0 bg-slate-950/95 z-50 flex flex-col text-white backdrop-blur-md animate-fade-in">
      <div className="pt-12 pb-5 px-5 bg-[#4E727A] flex items-center justify-start shadow-md border-b border-[#3D5C63]">
        <span className="font-bold text-xl tracking-wider text-white">FILE</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {dynamicVoiceList.map((item) => (
          <div
            key={item.id}
            className="bg-slate-900/80 p-3.5 rounded-2xl border border-white/5 flex items-center justify-between space-x-3"
          >
            <span className="text-[13px] font-medium text-slate-200 truncate shrink-0 max-w-[40%]">
              {item.title}
            </span>
            <AudioBubble audioSrc={item.src} />
          </div>
        ))}
      </div>
    </div>
  );
}
