import React from 'react';

export default function FileModal({ dynamicVoiceList = [], AudioBubble }) {
  return (
    <div className="absolute inset-0 bg-[#0B1120] z-50 flex flex-col text-slate-100 backdrop-blur-md animate-fade-in select-none">
      {/* 頂部導航列：h-[88px] pt-14 pb-2.5 items-end 下沉貼底 */}
      <div className="pt-14 pb-2.5 px-5 bg-[#4E727A] flex items-end justify-between border-b border-[#3D5C63] shadow-md shrink-0 h-[88px]">
        <span className="font-bold text-xl tracking-wider text-white leading-none">FILE</span>
        <span className="text-xs text-teal-200/80 font-mono leading-none">{dynamicVoiceList.length} AUDIO</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {dynamicVoiceList.length > 0 ? (
          dynamicVoiceList.map((item) => (
            <div key={item.id} className="bg-[#1E293B]/80 p-3.5 rounded-2xl border border-slate-700/60 shadow-sm space-y-2">
              <span className="text-xs font-semibold text-slate-200 block truncate">{item.title}</span>
              {AudioBubble && <AudioBubble audioSrc={item.src} />}
            </div>
          ))
        ) : (
          <div className="py-20 text-center text-slate-500 text-xs font-mono">NO AUDIO FILES</div>
        )}
      </div>
    </div>
  );
}
