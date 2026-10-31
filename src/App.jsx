import React, { useState, useEffect, useRef } from 'react';

// 語音氣泡元件（乾淨幾何 SVG 播放與暫停鍵）
const AudioBubble = ({ audioSrc, durationText = "0:04" }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(e => console.error("Audio error:", e));
      setIsPlaying(true);
    }
  };

  return (
    <div 
      onClick={togglePlay}
      className="flex items-center space-x-2.5 bg-white px-3.5 py-2.5 rounded-2xl rounded-tl-none shadow-sm cursor-pointer hover:bg-slate-50 transition min-w-[130px] border border-slate-100"
    >
      <audio ref={audioRef} src={audioSrc} onEnded={() => setIsPlaying(false)} preload="auto" />
      <button 
        type="button"
        className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm transition active:scale-90"
      >
        {isPlaying ? (
          <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
            <rect x="6" y="4" width="4" height="16" rx="1.5" />
            <rect x="14" y="4" width="4" height="16" rx="1.5" />
          </svg>
        ) : (
          <svg className="w-3 h-3 fill-current ml-0.5" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>
      <div className="flex flex-col">
        <div className="flex items-center space-x-0.5 h-3">
          {[40, 70, 100, 60, 85, 45, 90, 65, 30].map((h, i) => (
            <span 
              key={i} 
              className={`w-[2.5px] rounded-full transition-all duration-200 ${
                isPlaying ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'
              }`}
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
        <span className="text-[10px] text-slate-400 mt-1 font-mono">{durationText}</span>
      </div>
    </div>
  );
};

// 晨間劇本資料（依時間序發送）
const WAKEUP_VOICES = {
  1: { src: '/audio/1_get up_cozy.mp3', duration: '0:03', time: '08:00', notify: 'Soo: 起床囉...' },
  2: { src: '/audio/2_plz_get_up.mp3', duration: '0:04', time: '09:00', notify: 'Soo: 該起來了。' },
  3: { src: '/audio/3_can_u_get_up.mp3', duration: '0:04', time: '09:30', notify: 'Soo: 還在睡？' },
  4: { src: '/audio/4_time_to_get_up_now.mp3', duration: '0:03', time: '10:00', notify: 'Soo: 真的該起了。' },
  5: { src: '/audio/5_get_up_yell.mp3', duration: '0:04', time: '10:30', notify: 'Soo: 起床！' }
};

const SCRIPT_SCENARIOS = {
  carSelfie4: {
    label: '🚗',
    steps: [
      {
        delay: 400,
        type: 'grid4',
        images: [
          'https://i.pinimg.com/736x/17/b6/1e/17b61e7e3cfb485941687fb05647a3fe.jpg',
          'https://i.pinimg.com/1200x/59/67/d1/5967d1cd4f2c5523a27d5913a66271fa.jpg',
          'https://i.pinimg.com/736x/53/42/e7/5342e7ed2ea38ed256fe6c18438ff942.jpg',
          'https://i.pinimg.com/1200x/98/3d/57/983d579ed770c086cd7e39cf388ec5fe.jpg'
        ],
        time: '14:15',
        notify: 'Soo已傳送照片'
      },
      {
        delay: 1500,
        type: 'text',
        content: '哪張比較好？',
        time: '14:15',
        notify: '哪張比較好？'
      }
    ]
  },
  mirrorSelfie:
