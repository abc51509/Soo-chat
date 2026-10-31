import React, { useState, useEffect, useRef } from 'react';

// 語音氣泡元件（使用乾淨的幾何 SVG 播放與暫停圖示，不使用 Emoji）
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
          // 雙豎線暫停圖示
          <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
            <rect x="6" y="4" width="4" height="16" rx="1.5" />
            <rect x="14" y="4" width="4" height="16" rx="1.5" />
          </svg>
        ) : (
          // 右箭頭播放圖示
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
  mirrorSelfie: {
    label: '🪞',
    steps: [
      {
        delay: 400,
        type: 'photo',
        imageUrl: 'https://i.pinimg.com/736x/c8/c3/e6/c8c3e646c47bd83dbeb285393405087a.jpg',
        time: '16:40',
        notify: 'Soo已傳送照片'
      },
      {
        delay: 1200,
        type: 'text',
        content: '剛換完造型。',
        time: '16:41',
        notify: '剛換完造型。'
      }
    ]
  },
  dailySeries: {
    label: '💬',
    steps: [
      {
        delay: 400,
        type: 'audio',
        audioSrc: '/audio/i_miss_u.mp3',
        durationText: '0:03',
        time: '18:20',
        notify: 'Soo傳送了語音訊息'
      },
      {
        delay: 3500,
        type: 'audio',
        audioSrc: '/audio/i_miss_u_longer.mp3',
        durationText: '0:05',
        time: '18:20',
        notify: 'Soo傳送了語音訊息'
      },
      {
        delay: 7000,
        type: 'audio',
        audioSrc: '/audio/shall_i_go_now.mp3',
        durationText: '0:04',
        time: '18:21',
        notify: 'Soo傳送了語音訊息'
      }
    ]
  },
  plotDate: {
    label: '🎬',
    steps: [
      {
        delay: 400,
        type: 'audio',
        audioSrc: '/audio/lets_date.mp3',
        durationText: '0:04',
        time: '20:10',
        notify: 'Soo傳送了語音訊息'
      }
    ]
  },
  plotLove: {
    label: '❤️',
    steps: [
      {
        delay: 400,
        type: 'audio',
        audioSrc: '/audio/love_u.mp3',
        durationText: '0:03',
        time: '21:00',
        notify: 'Soo傳送了語音訊息'
      }
    ]
  },
  goodNight: {
    label: '🌙💤',
    steps: [
      {
        delay: 400,
        type: 'audio',
        audioSrc: '/audio/good_night_normal.mp3',
        durationText: '0:05',
        time: '23:30',
        notify: 'Soo傳送了語音訊息'
      }
    ]
  }
};

const USER_MOCK_REPLIES = [
  '好，我聽到了～',
  '吃飯了嗎？',
  '有點想你了！',
  '待會見～'
];

export default function App() {
  const [messages, setMessages] = useState([
    { id: 1, role: 'assistant', type: 'text', content: '今天有好好吃飯嗎？', time: '12:00' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasNotifPermission, setHasNotifPermission] = useState(false);

  // 晨喚開關與排程狀態
  const [isAlarmActive, setIsAlarmActive] = useState(true);
  const [hasAwoken, setHasAwoken] = useState(false); // 是否已回覆「起床了」
  const [isCalling, setIsCalling] = useState(false); // 來電畫面開關
  const callAudioRef = useRef(null);
  const triggeredSlots = useRef(new Set()); // 紀錄當天已觸發的時間點

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW Reg failed:', err));
    }
    if ('Notification' in window && Notification.permission === 'granted') {
      setHasNotifPermission(true);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const getCurrentTime = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  };

  const sendPushNotification = async (text) => {
    if (!('Notification' in window) || Notification.permission !== 'granted' || !text) return;
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      if (reg && reg.showNotification) {
        reg.showNotification('Soo', {
          body: text,
          icon: 'https://images.plurk.com/7lPN93L87TwPEfErIseop9.jpg',
          badge: 'https://images.plurk.com/7lPN93L87TwPEfErIseop9.jpg'
        });
        return;
      }
    }
    new Notification('Soo', {
      body: text,
      icon: 'https://images.plurk.com/7lPN93L87TwPEfErIseop9.jpg'
    });
  };

  const sendVoiceMessage = (voiceData) => {
    setMessages(prev => [
      ...prev,
      {
        id: Date.now(),
        role: 'assistant',
        type: 'audio',
        audioSrc: voiceData.src,
        durationText: voiceData.duration,
        time: getCurrentTime()
      }
    ]);
    sendPushNotification(voiceData.notify);
  };

  // 晨喚核心定時檢查（每 10 秒檢查一次）
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const h = now.getHours();
      const m = now.getMinutes();
      const timeKey = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

      // 午夜 00:00 重置當日狀態
      if (h === 0 && m === 0) {
        triggeredSlots.current.clear();
        setHasAwoken(false);
      }

      // 開關關閉，或已收到起床回覆，則不執行
      if (!isAlarmActive || hasAwoken) return;

      // 階段 1：各時間點單獨發送語音
      if (timeKey === '08:00' && !triggeredSlots.current.has('08:00')) {
        triggeredSlots.current.add('08:00');
        sendVoiceMessage(WAKEUP_VOICES[1]);
      } else if (timeKey === '09:00' && !triggeredSlots.current.has('09:00')) {
        triggeredSlots.current.add('09:00');
        sendVoiceMessage(WAKEUP_VOICES[2]);
      } else if (timeKey === '09:30' && !triggeredSlots.current.has('09:30')) {
        triggeredSlots.current.add('09:30');
        sendVoiceMessage(WAKEUP_VOICES[3]);
      } else if (timeKey === '10:00' && !triggeredSlots.current.has('10:00')) {
        triggeredSlots.current.add('10:00');
        sendVoiceMessage(WAKEUP_VOICES[4]);
      } else if (timeKey === '10:30' && !triggeredSlots.current.has('10:30')) {
        triggeredSlots.current.add('10:30');
        sendVoiceMessage(WAKEUP_VOICES[5]);
      }

      // 階段 2：11:00 至 13:00 每半小時打一次電話（11:00, 11:30, 12:00, 12:30, 13:00）
      const callSlots = ['11:00', '11:30', '12:00', '12:30', '13:00'];
      if (callSlots.includes(timeKey) && !triggeredSlots.current.has(timeKey)) {
        triggeredSlots.current.add(timeKey);
        setIsCalling(true);
        sendPushNotification('Soo 正在來電...');
      }
    }, 10000);

    return () => clearInterval(timer);
  }, [isAlarmActive, hasAwoken]);

  // 控制來電重複播放五號音訊
  useEffect(() => {
    if (isCalling) {
      if (callAudioRef.current) {
        callAudioRef.current.currentTime = 0;
        callAudioRef.current.play().catch(e => console.log('Audio auto-play prevented:', e));
      }
    } else {
      if (callAudioRef.current) {
        callAudioRef.current.pause();
      }
    }
  }, [isCalling]);

  const requestNotification = async () => {
    const isStandalone = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    if (isIOS && !isStandalone) {
      alert('【重要提醒】\niPhone 必須先點擊 Safari 底部的「分享」按鈕，選擇「加入主畫面」，然後「從桌面打開 App」才能開啟通知喔！');
      return;
    }

    if (!('Notification' in window)) {
      alert('此環境不支援通知，請確認已加入主畫面並從桌面開啟。');
      return;
    }

    try {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        setHasNotifPermission(true);
        sendPushNotification('晨喚排程通知已授權成功！');
      } else {
        alert('尚未取得通知授權');
      }
    } catch (e) {
      alert('請求通知授權失敗: ' + e.message);
    }
  };

  const playScript = (key) => {
    const scenario = SCRIPT_SCENARIOS[key];
    if (!scenario) return;

    scenario.steps.forEach((step, idx) => {
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now() + idx,
            role: 'assistant',
            ...step,
            time: step.time || getCurrentTime()
          }
        ]);
        if (step.notify) {
          sendPushNotification(step.notify);
        }
      }, step.delay);
    });
  };

  const handleSend = () => {
    if (!inputText.trim() || isTyping) return;
    const currentInput = inputText.trim();
    const userMsg = {
      id: Date.now(),
      role: 'user',
      type: 'text',
      content: currentInput,
      time: getCurrentTime()
    };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // 核心判定：只要訊息包含「起床」即解除晨喚警報
    if (currentInput.includes('起床')) {
      setHasAwoken(true);
      setIsCalling(false);
      setTimeout(() => {
        const awakeReply = '終於醒了？聽話，去喝杯溫水。';
        setMessages(prev => [
          ...prev,
          { id: Date.now() + 1, role: 'assistant', type: 'text', content: awakeReply, time: getCurrentTime() }
        ]);
        sendPushNotification(awakeReply);
        setIsTyping(false);
      }, 1000);
      return;
    }

    setTimeout(() => {
      const reply = USER_MOCK_REPLIES[Math.floor(Math.random() * USER_MOCK_REPLIES.length)];
      setMessages(prev => [
        ...prev,
        { id: Date.now() + 1, role: 'assistant', type: 'text', content: reply, time: getCurrentTime() }
      ]);
      sendPushNotification(reply);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="flex h-[100dvh] w-screen bg-slate-900 justify-center items-center select-none overflow-hidden sm:p-3">
      {/* 隱藏的來電音訊：重複播放五號音檔 */}
      <audio ref={callAudioRef} src="/audio/5_get_up_yell.mp3" loop preload="auto" />

      <div className="w-full sm:max-w-[420px] h-[100dvh] sm:h-[92vh] sm:max-h-[880px] bg-[#849EB9] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden relative border-0 sm:border sm:border-slate-700">
        
        {/* 全螢幕電話來電畫面（11:00~13:00 未回覆時觸發） */}
        {isCalling && (
          <div className="absolute inset-0 bg-slate-950/95 z-50 flex flex-col justify-between items-center py-16 px-6 text-white backdrop-blur-md animate-fade-in">
            <div className="flex flex-col items-center mt-8 space-y-4">
              <div className="w-28 h-28 rounded-full overflow-hidden ring-4 ring-emerald-400/40 shadow-2xl animate-pulse">
                <img 
                  src="https://images.plurk.com/7lPN93L87TwPEfErIseop9.jpg" 
                  alt="avatar" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <span className="text-2xl font-semibold tracking-wider">Soo</span>
              <span className="text-xs text-slate-400 font-light">晨喚語音電話來電中...</span>
            </div>

            <div className="w-full flex justify-around items-center px-4 mb-4">
              {/* 掛斷按鈕 */}
              <button 
                onClick={() => setIsCalling(false)}
                className="flex flex-col items-center space-y-2 group active:scale-95 transition"
              >
                <div className="w-16 h-16 rounded-full bg-rose-600 flex items-center justify-center shadow-lg group-hover:bg-rose-500">
                  <svg className="w-7 h-7 fill-white rotate-[135deg]" viewBox="0 0 24 24">
                    <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24 11.72 11.72 0 003.68.59 1 1 0 011 1v3.5a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.48.59 3.68a1 1 0 01-.24 1.02l-2.23 2.09z" />
                  </svg>
                </div>
                <span className="text-xs text-slate-300">稍後</span>
              </button>

              {/* 接聽並確認起床 */}
              <button 
                onClick={() => {
                  setIsCalling(false);
                  setHasAwoken(true);
                  setMessages(prev => [
                    ...prev,
                    { id: Date.now(), role: 'user', type: 'text', content: '我起床了！', time: getCurrentTime() },
                    { id: Date.now() + 1, role: 'assistant', type: 'text', content: '終於接了。醒了就快去梳洗。', time: getCurrentTime() }
                  ]);
                }}
                className="flex flex-col items-center space-y-2 group active:scale-95 transition"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg group-hover:bg-emerald-400 animate-bounce">
                  <svg className="w-7 h-7 fill-white" viewBox="0 0 24 24">
                    <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24 11.72 11.72 0 003.68.59 1 1 0 011 1v3.5a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.48.59 3.68a1 1 0 01-.24 1.02l-2.23 2.09z" />
                  </svg>
                </div>
                <span className="text-xs text-emerald-300 font-medium">接聽（我起了）</span>
              </button>
            </div>
          </div>
        )}

        {/* 頂部導航列 */}
        <div className="pt-10 pb-3 bg-[#212E3E] text-white flex items-center justify-between px-4 z-20 shrink-0 shadow-sm">
          <div className="flex items-center space-x-3">
            <span className="text-xl opacity-70">‹</span>
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-full bg-slate-700 overflow-hidden ring-1 ring-white/20">
                <img 
                  src="https://images.plurk.com/7lPN93L87TwPEfErIseop9.jpg" 
                  alt="avatar" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-sm leading-tight text-white tracking-wide">Soo</span>
                <span className="text-[10px] text-emerald-400 font-mono">
                  {isAlarmActive 
                    ? (hasAwoken ? '晨喚已解除・在線上' : '晨喚待命・08:00 起') 
                    : '晨喚已關閉'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* 晨喚總開關按鈕 */}
            <button
              onClick={() => setIsAlarmActive(!isAlarmActive)}
              title="晨喚開關"
              className={`text-[11px] px-2.5 py-1 rounded-full font-medium transition flex items-center space-x-1 ${
                isAlarmActive ? 'bg-emerald-600/90 text-white' : 'bg-slate-700 text-slate-400'
              }`}
            >
              <span>鬧鐘</span>
              <span>{isAlarmActive ? 'ON' : 'OFF'}</span>
            </button>

            <button 
              onClick={() => setMessages([])} 
              className="text-[11px] bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-md text-slate-300 transition"
            >
              清空
            </button>
          </div>
        </div>

        {/* 🔔 通知按鈕橫幅 */}
        {!hasNotifPermission && (
          <div className="bg-emerald-600/95 text-white px-4 py-2.5 flex items-center justify-between shadow-md z-10">
            <div className="flex items-center space-x-2">
              <span className="text-base">🔔</span>
              <span className="text-xs font-medium tracking-wide">開啟通知接收 08:00 起床提醒</span>
            </div>
            <button
              onClick={requestNotification}
              className="bg-white text-emerald-800 text-xs font-semibold px-3 py-1.5 rounded-full shadow active:scale-95 transition"
            >
              允許推播
            </button>
          </div>
        )}

        {/* 對話區 */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-3.5 scroll-smooth">
          <div className="text-center my-1">
            <span className="bg-black/20 text-white/90 text-[10px] px-2.5 py-0.5 rounded-full font-light">
              今天
            </span>
          </div>

          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div key={msg.id} className={`flex items-end ${isUser ? 'justify-end' : 'justify-start'} space-x-1.5`}>
                {!isUser && (
                  <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 mb-1 ring-1 ring-black/10">
                    <img 
                      src="https://images.plurk.com/7lPN93L87TwPEfErIseop9.jpg" 
                      alt="avatar" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                )}

                {isUser && (
                  <div className="flex flex-col items-end text-[9px] text-white/80 pr-1 leading-tight font-light">
                    <span className="text-emerald-200">已讀</span>
                    <span>{msg.time}</span>
                  </div>
                )}

                {msg.type === 'audio' ? (
                  <div className="flex flex-col space-y-1">
                    <AudioBubble audioSrc={msg.audioSrc} durationText={msg.durationText} />
                    {msg.content && (
                      <span className="text-[11px] text-white/90 pl-1 font-light italic">
                        {msg.content}
                      </span>
                    )}
                  </div>
                ) : msg.type === 'grid4' ? (
                  <div className="grid grid-cols-2 gap-1 max-w-[240px] rounded-2xl overflow-hidden p-1 bg-white/20 backdrop-blur-sm shadow-sm">
                    {msg.images.map((img, i) => (
                      <img 
                        key={i} 
                        src={img} 
                        alt="car selfie" 
                        className="w-full h-28 object-cover rounded-lg hover:opacity-95 transition cursor-pointer" 
                      />
                    ))}
                  </div>
                ) : msg.type === 'photo' ? (
                  <div className="max-w-[70%] rounded-2xl overflow-hidden shadow-md">
                    <img src={msg.imageUrl} alt="selfie" className="w-full max-h-72 object-cover" />
                  </div>
                ) : (
                  <div className={`max-w-[72%] rounded-2xl px-3.5 py-2 text-[13.5px] leading-relaxed shadow-sm ${
                    isUser ? 'bg-[#58D68D] text-slate-950 rounded-tr-none' : 'bg-white text-slate-900 rounded-tl-none'
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                )}

                {!isUser && (
                  <span className="text-[9px] text-white/80 pl-1 leading-tight font-light">
                    {msg.time}
                  </span>
                )}
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center space-x-1.5 justify-start">
              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 ring-1 ring-black/10">
                <img 
                  src="https://images.plurk.com/7lPN93L87TwPEfErIseop9.jpg" 
                  alt="avatar" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="bg-white/95 px-3 py-2.5 rounded-2xl rounded-tl-none shadow-sm flex space-x-1 items-center">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 劇本控制板 */}
        <div className="bg-slate-950/60 backdrop-blur-md px-2.5 py-2 flex space-x-2 overflow-x-auto border-t border-white/10 z-10 scrollbar-none shrink-0">
          {/* 測試按鈕：模擬觸發 11:00 來電畫面 */}
          <button
            onClick={() => setIsCalling(true)}
            className="text-[11px] whitespace-nowrap bg-rose-600 hover:bg-rose-500 text-white font-medium px-3 py-1.5 rounded-full shadow transition shrink-0 active:scale-95"
          >
            📞 測試來電
          </button>

          {Object.entries(SCRIPT_SCENARIOS).map(([key, item]) => (
            <button
              key={key}
              onClick={() => playScript(key)}
              className="text-[11px] whitespace-nowrap bg-white/90 hover:bg-white text-slate-900 font-medium px-3 py-1.5 rounded-full shadow transition shrink-0 active:scale-95"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* 底部輸入列 */}
        <div className="bg-white p-2.5 flex items-center space-x-2 border-t border-slate-200 z-20 shrink-0 pb-6">
          <input
            type="text"
            className="flex-1 bg-slate-100 rounded-full px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-400"
            placeholder="輸入「我起床了」解除晨喚..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                handleSend();
              }
            }}
          />
          <button
            onClick={handleSend}
            className="bg-[#212E3E] hover:bg-slate-800 active:scale-95 text-white text-xs font-medium px-4 py-2 rounded-full transition"
          >
            傳送
          </button>
        </div>

      </div>
    </div>
  );
}
