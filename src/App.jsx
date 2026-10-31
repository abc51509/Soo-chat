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
  arenaA: {
    label: '📖 A',
    steps: [
      {
        delay: 300,
        type: 'text',
        content: '《Arena Homme+》A cut 樣片出來了。',
        time: '15:20',
        notify: 'Soo: 《Arena Homme+》A cut 樣片出來了。'
      },
      {
        delay: 1200,
        type: 'album_grid',
        title: 'Arena Homme+ Nov 2026 - Series A',
        images: [
          'https://images.plurk.com/wGRATa3N4kmnXq7NfNW5q.jpg',
          'https://images.plurk.com/5pOLToEI89ynuGrE6eK9zq.jpg',
          'https://images.plurk.com/5DIYnEc7OkB0r2uZrbzqMG.jpg',
          'https://images.plurk.com/58Nq6HrxGPCmyZzHktHoFy.jpg',
          'https://images.plurk.com/64jHhSpoLD822nCyYCljBy.jpg',
          'https://images.plurk.com/4CxfUdZPwicx2nAexupmmO.jpg',
          'https://images.plurk.com/3ON8QsrUTo2pikbQyzu2eg.jpg',
          'https://images.plurk.com/6VnlsUSawBjpCsBIydEfrF.jpg',
          'https://images.plurk.com/1UfiKKHq4ERIEZL71Y6F1V.jpg',
          'https://images.plurk.com/3ItocRDa26XftRnU4T6uXG.jpg',
          'https://images.plurk.com/2wjClatGTHOUvkarLndUdd.jpg'
        ],
        time: '15:20',
        notify: 'Soo 已傳送照片相簿 (11張)'
      }
    ]
  },
  arenaB: {
    label: '📖 B',
    steps: [
      {
        delay: 300,
        type: 'text',
        content: 'B 組色調稍微暗一點，看合不合你胃口。',
        time: '15:22',
        notify: 'Soo: B 組色調稍微暗一點...'
      },
      {
        delay: 1200,
        type: 'album_grid',
        title: 'Arena Homme+ Nov 2026 - Series B',
        images: [
          'https://images.plurk.com/1bnwQH13WysGOJEtJx6mYe.jpg',
          'https://images.plurk.com/2AlpC6TZhdoHNFdJP3lT0S.jpg',
          'https://images.plurk.com/715OD2VMRcb4WZjU7de0gJ.jpg',
          'https://images.plurk.com/6KKkGCEc3PzRdbNJUTMOQX.jpg',
          'https://images.plurk.com/58TqJuM6A29M9Cq5zixonR.jpg',
          'https://images.plurk.com/5fThm7mB8H6dZrhuYDrFPi.jpg',
          'https://images.plurk.com/104j819u68SShG4KXnyzqq.jpg',
          'https://images.plurk.com/5QiSNfu8ZKCUehIl6wdvNc.jpg',
          'https://images.plurk.com/40N6r4TAKpFI2OAm9vBEhN.jpg'
        ],
        time: '15:22',
        notify: 'Soo 已傳送照片相簿 (9張)'
      }
    ]
  },
  arenaC: {
    label: '📖 C',
    steps: [
      {
        delay: 300,
        type: 'text',
        content: 'C cut 拍得比較隨性。',
        time: '15:25',
        notify: 'Soo: C cut 拍得比較隨性。'
      },
      {
        delay: 1200,
        type: 'album_grid',
        title: 'Arena Homme+ Nov 2026 - Series C',
        images: [
          'https://images.plurk.com/5rm10dsKniWoBb2PkZN4Uu.jpg',
          'https://images.plurk.com/AWRZm7cRQCYhfdF7bjt6b.jpg',
          'https://images.plurk.com/3Fz6oSG8e9DFFfGD9DNyad.jpg',
          'https://images.plurk.com/1Vym7DK4MQRXZmDh99U7XF.jpg',
          'https://images.plurk.com/7j84ubGTuTntVQeYaetFPb.jpg',
          'https://images.plurk.com/5DiLSX3e07URHIMiOBGI2O.jpg',
          'https://images.plurk.com/58TvjYyco5RWn1g6T6Wgj6.jpg',
          'https://images.plurk.com/3wMYWsQ2JWVUmrhN2kLJsC.jpg',
          'https://images.plurk.com/5i8mACDd9E43FW8mw9yeGS.jpg',
          'https://images.plurk.com/TmHDiq3he1rBiBW8boa2R.jpg'
        ],
        time: '15:25',
        notify: 'Soo 已傳送照片相簿 (10張)'
      }
    ]
  },
  arenaD: {
    label: '📖 D',
    steps: [
      {
        delay: 300,
        type: 'text',
        content: '最後一組特寫。',
        time: '15:28',
        notify: 'Soo: 最後一組特寫。'
      },
      {
        delay: 1200,
        type: 'album_grid',
        title: 'Arena Homme+ Nov 2026 - Series D',
        images: [
          'https://images.plurk.com/2W5EnleU58XmoB8Eny9om4.jpg',
          'https://images.plurk.com/1tZohQJKEcdPUP6pAvGETA.jpg',
          'https://images.plurk.com/3WG7SIMPNqk6oCZMzzEvP9.jpg',
          'https://images.plurk.com/5CGlBr6dT7HZPuY7LZTLjo.jpg',
          'https://images.plurk.com/WsElSvRJRnnJy4u0HiQ4J.jpg',
          'https://images.plurk.com/6F2dPLa67VN6EhGBoaR1MN.jpg'
        ],
        time: '15:28',
        notify: 'Soo 已傳送照片相簿 (6張)'
      }
    ]
  },
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

  // 晨喚與通話狀態
  const [isAlarmActive, setIsAlarmActive] = useState(true);
  const [hasAwoken, setHasAwoken] = useState(false);
  const [callStatus, setCallStatus] = useState('idle');
  const [callDuration, setCallDuration] = useState(0);

  // 音訊參照
  const ringAudioRef = useRef(null);
  const voice5AudioRef = useRef(null);
  const voiceIntervalTimerRef = useRef(null);

  const triggeredSlots = useRef(new Set());
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

  const formatSeconds = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const sendPushNotification = async (text) => {
    if (!('Notification' in window) || Notification.permission !== 'granted' || !text) return;
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      if (reg && reg.showNotification) {
        reg.showNotification('Soo', {
          body: text,
          icon: 'https://images.plurk.com/6PooPJr1YbOhrMp5CCFdbl.jpg',
          badge: 'https://images.plurk.com/6PooPJr1YbOhrMp5CCFdbl.jpg'
        });
        return;
      }
    }
    new Notification('Soo', {
      body: text,
      icon: 'https://images.plurk.com/6PooPJr1YbOhrMp5CCFdbl.jpg'
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

  // 晨喚定時檢查
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const h = now.getHours();
      const m = now.getMinutes();
      const timeKey = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

      if (h === 0 && m === 0) {
        triggeredSlots.current.clear();
        setHasAwoken(false);
      }

      if (!isAlarmActive || hasAwoken) return;

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

      const callSlots = ['11:00', '11:30', '12:00', '12:30', '13:00'];
      if (callSlots.includes(timeKey) && !triggeredSlots.current.has(timeKey)) {
        triggeredSlots.current.add(timeKey);
        setCallStatus('ringing');
        sendPushNotification('Soo 正在來電...');
      }
    }, 10000);

    return () => clearInterval(timer);
  }, [isAlarmActive, hasAwoken]);

  // 來電鈴聲控制
  useEffect(() => {
    if (callStatus === 'ringing') {
      if (ringAudioRef.current) {
        ringAudioRef.current.currentTime = 64;
        ringAudioRef.current.play().catch(e => console.log('Ring audio play prevented:', e));
      }
    } else {
      if (ringAudioRef.current) {
        ringAudioRef.current.pause();
      }
    }
  }, [callStatus]);

  // 通話中計時與語音循環
  useEffect(() => {
    let durationTimer = null;

    if (callStatus === 'connected') {
      setCallDuration(0);
      durationTimer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);

      if (voice5AudioRef.current) {
        voice5AudioRef.current.currentTime = 0;
        voice5AudioRef.current.play().catch(e => console.log('Voice5 play prevented:', e));
      }
    } else {
      clearInterval(durationTimer);
      clearTimeout(voiceIntervalTimerRef.current);
      if (voice5AudioRef.current) {
        voice5AudioRef.current.pause();
      }
    }

    return () => {
      clearInterval(durationTimer);
      clearTimeout(voiceIntervalTimerRef.current);
    };
  }, [callStatus]);

  const handleVoice5Ended = () => {
    if (callStatus !== 'connected') return;
    voiceIntervalTimerRef.current = setTimeout(() => {
      if (voice5AudioRef.current && callStatus === 'connected') {
        voice5AudioRef.current.currentTime = 0;
        voice5AudioRef.current.play().catch(e => console.log('Voice5 replay error:', e));
      }
    }, 2000);
  };

  const handleEndCall = () => {
    const isConnected = (callStatus === 'connected');
    const finalSeconds = callDuration;
    const finalDurationText = formatSeconds(finalSeconds);

    setCallStatus('idle');

    setMessages(prev => [
      ...prev,
      {
        id: Date.now(),
        role: 'assistant',
        type: 'call_record',
        durationText: isConnected ? finalDurationText : null,
        statusText: isConnected ? `通話時間 ${finalDurationText}` : '未接來電',
        time: getCurrentTime()
      }
    ]);
  };

  const handleAcceptCall = () => {
    if (ringAudioRef.current) ringAudioRef.current.pause();
    setCallStatus('connected');
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

    if (currentInput.includes('起床')) {
      setHasAwoken(true);
      setCallStatus('idle');
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
      {/* 來電鈴聲 */}
      <audio ref={ringAudioRef} src="/audio/telepathy 2025.mp3" loop preload="auto" />
      {/* 通話中語音 */}
      <audio ref={voice5AudioRef} src="/audio/5_get_up_yell.mp3" onEnded={handleVoice5Ended} preload="auto" />

      <div className="w-full sm:max-w-[420px] h-[100dvh] sm:h-[92vh] sm:max-h-[880px] bg-[#849EB9] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden relative border-0 sm:border sm:border-slate-700">
        
        {/* 全螢幕通話介面 */}
        {callStatus !== 'idle' && (
          <div className="absolute inset-0 bg-slate-950/95 z-50 flex flex-col justify-between items-center py-16 px-6 text-white backdrop-blur-md animate-fade-in">
            <div className="flex flex-col items-center mt-10 space-y-4">
              <div className="w-40 h-40 rounded-full overflow-hidden ring-4 ring-emerald-400/40 shadow-2xl animate-pulse">
