import React, { useState, useEffect, useRef } from 'react';

// 語音氣泡元件
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
      className="flex items-center space-x-2.5 bg-white px-3.5 py-2.5 rounded-2xl rounded-tl-none shadow-sm cursor-pointer hover:bg-slate-50 transition min-w-[130px] border border-slate-200/60"
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

// 晨間劇本資料
const WAKEUP_VOICES = {
  1: { src: '/audio/1_get up_cozy.mp3', duration: '0:03', notify: 'Soo: 起床囉...' },
  2: { src: '/audio/2_plz_get_up.mp3', duration: '0:04', notify: 'Soo: 該起來了。' },
  3: { src: '/audio/3_can_u_get_up.mp3', duration: '0:04', notify: 'Soo: 還在睡？' },
  4: { src: '/audio/4_time_to_get_up_now.mp3', duration: '0:03', notify: 'Soo: 真的該起了。' },
  5: { src: '/audio/5_get_up_yell.mp3', duration: '0:04', notify: 'Soo: 起床！' }
};

// 整點隨機純文字台詞庫
const HOURLY_MESSAGES = [
  '吃飯了嗎？',
  '外面很冷，多穿點。',
  '收工了。',
  '剛才經過一家麵包店，買了起司吐司。',
  '在忙？',
  '明天首爾降溫，出門記得帶傘。',
  '看到有趣的布料，拍給你看。',
  '這幾天別熬夜。',
  '剛試完裝，這套你應該會喜歡。',
  '睡了嗎。',
  '忙完回我一聲就好。',
  '今天劇組的便當很難吃。',
  '路上小心。',
  '週末有空嗎？',
  '記得開暖氣。',
  '突然想到上次那個太陽蛋。',
  '下雪了。',
  '劇本讀完了，現在回程。',
  '脖子還酸嗎？別一直低頭剪布。',
  '剛到家。',
  '晚安。',
  '什麼時候有空量尺寸？',
  '又沒看手機？',
  '今天拍攝提早結束了。',
  '想喝上次那罐薑茶。'
];

// 語音列表全集
const ALL_VOICE_LIST = [
  { id: 'v1', title: '晨喚 1: 輕柔喚醒', src: '/audio/1_get up_cozy.mp3', duration: '0:03' },
  { id: 'v2', title: '晨喚 2: 該起來了', src: '/audio/2_plz_get_up.mp3', duration: '0:04' },
  { id: 'v3', title: '晨喚 3: 還在睡？', src: '/audio/3_can_u_get_up.mp3', duration: '0:04' },
  { id: 'v4', title: '晨喚 4: 真的該起了', src: '/audio/4_time_to_get_up_now.mp3', duration: '0:03' },
  { id: 'v5', title: '晨喚 5: 低音威脅', src: '/audio/5_get_up_yell.mp3', duration: '0:04' },
  { id: 'v6', title: '日常 1: 有點想你', src: '/audio/i_miss_u.mp3', duration: '0:03' },
  { id: 'v7', title: '日常 2: 真的很想你', src: '/audio/i_miss_u_longer.mp3', duration: '0:05' },
  { id: 'v8', title: '日常 3: 我現在過去？', src: '/audio/shall_i_go_now.mp3', duration: '0:04' },
  { id: 'v9', title: '約會: 我們去約會吧', src: '/audio/lets_date.mp3', duration: '0:04' },
  { id: 'v10', title: '心意: 我愛你', src: '/audio/love_u.mp3', duration: '0:03' },
  { id: 'v11', title: '夜間: 晚安', src: '/audio/good_night_normal.mp3', duration: '0:05' }
];

// 完整無縫 Arena 相簿圖庫（A~D 組融合，共 36 張）
const ARENA_ALL_IMAGES = [
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
  'https://images.plurk.com/2wjClatGTHOUvkarLndUdd.jpg',
  'https://images.plurk.com/1bnwQH13WysGOJEtJx6mYe.jpg',
  'https://images.plurk.com/2AlpC6TZhdoHNFdJP3lT0S.jpg',
  'https://images.plurk.com/715OD2VMRcb4WZjU7de0gJ.jpg',
  'https://images.plurk.com/6KKkGCEc3PzRdbNJUTMOQX.jpg',
  'https://images.plurk.com/58TqJuM6A29M9Cq5zixonR.jpg',
  'https://images.plurk.com/5fThm7mB8H6dZrhuYDrFPi.jpg',
  'https://images.plurk.com/104j819u68SShG4KXnyzqq.jpg',
  'https://images.plurk.com/5QiSNfu8ZKCUehIl6wdvNc.jpg',
  'https://images.plurk.com/40N6r4TAKpFI2OAm9vBEhN.jpg',
  'https://images.plurk.com/5rm10dsKniWoBb2PkZN4Uu.jpg',
  'https://images.plurk.com/AWRZm7cRQCYhfdF7bjt6b.jpg',
  'https://images.plurk.com/3Fz6oSG8e9DFFfGD9DNyad.jpg',
  'https://images.plurk.com/1Vym7DK4MQRXZmDh99U7XF.jpg',
  'https://images.plurk.com/7j84ubGTuTntVQeYaetFPb.jpg',
  'https://images.plurk.com/5DiLSX3e07URHIMiOBGI2O.jpg',
  'https://images.plurk.com/58TvjYyco5RWn1g6T6Wgj6.jpg',
  'https://images.plurk.com/3wMYWsQ2JWVUmrhN2kLJsC.jpg',
  'https://images.plurk.com/5i8mACDd9E43FW8mw9yeGS.jpg',
  'https://images.plurk.com/TmHDiq3he1rBiBW8boa2R.jpg',
  'https://images.plurk.com/2W5EnleU58XmoB8Eny9om4.jpg',
  'https://images.plurk.com/1tZohQJKEcdPUP6pAvGETA.jpg',
  'https://images.plurk.com/3WG7SIMPNqk6oCZMzzEvP9.jpg',
  'https://images.plurk.com/5CGlBr6dT7HZPuY7LZTLjo.jpg',
  'https://images.plurk.com/WsElSvRJRnnJy4u0HiQ4J.jpg',
  'https://images.plurk.com/6F2dPLa67VN6EhGBoaR1MN.jpg'
];

// 未分類照片歸檔
const UNCATEGORIZED_PHOTOS = [
  'https://i.pinimg.com/736x/17/b6/1e/17b61e7e3cfb485941687fb05647a3fe.jpg',
  'https://i.pinimg.com/1200x/59/67/d1/5967d1cd4f2c5523a27d5913a66271fa.jpg',
  'https://i.pinimg.com/736x/53/42/e7/5342e7ed2ea38ed256fe6c18438ff942.jpg',
  'https://i.pinimg.com/1200x/98/3d/57/983d579ed770c086cd7e39cf388ec5fe.jpg',
  'https://i.pinimg.com/736x/c8/c3/e6/c8c3e646c47bd83dbeb285393405087a.jpg'
];

// 視訊通話備選影片池（預設 5 個 slot，支援循環/切換）
const VIDEO_STREAMS = [
  { id: 1, title: 'Studio Fitting', poster: 'https://images.plurk.com/wGRATa3N4kmnXq7NfNW5q.jpg', src: '/video/call_1.mp4' },
  { id: 2, title: 'In the Van', poster: 'https://i.pinimg.com/736x/17/b6/1e/17b61e7e3cfb485941687fb05647a3fe.jpg', src: '/video/call_2.mp4' },
  { id: 3, title: 'Waiting Room', poster: 'https://images.plurk.com/5pOLToEI89ynuGrE6eK9zq.jpg', src: '/video/call_3.mp4' },
  { id: 4, title: 'Hotel Rest', poster: 'https://images.plurk.com/2W5EnleU58XmoB8Eny9om4.jpg', src: '/video/call_4.mp4' },
  { id: 5, title: 'Night Walk', poster: 'https://i.pinimg.com/736x/c8/c3/e6/c8c3e646c47bd83dbeb285393405087a.jpg', src: '/video/call_5.mp4' }
];

// 新聞與站姐情報資料（大小標排版、多層次顏色）
const INTEL_FEED_DATA = [
  {
    id: 'n1',
    type: 'official',
    badge: '獨家通稿',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    source: 'DISPATCH ENTERTAINMENT',
    time: '2 小時前',
    mainTitle: '李洙赫確認加盟跨國漫改大作，挑戰冷酷雙面角色',
    subTitle: '原著作者盛讚「神還原漫畫走出來的雕刻美男」，預計下月中旬開機赴歐取景。',
    summary: '製作方透露本次角色兼具高強度動作場面與深邃心理戲，目前演員已全面投入武打訓練與特殊體態管理中。',
    heroImage: 'https://images.plurk.com/3ItocRDa26XftRnU4T6uXG.jpg'
  },
  {
    id: 'n2',
    type: 'fansite',
    badge: '站姐大砲預覽',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
    source: 'BLACK VELVET 417 @fansite',
    time: '4 小時前',
    mainTitle: '261028 ICN 仁川出境｜今日黑大衣簡直殺瘋了...',
    subTitle: '耳機線隨意掛著，低頭看手機的瞬間眼神太蘇。',
    summary: '現場人潮非常擁擠，但他全程走得很穩，進海關前特地摘下口罩對鏡頭揮手。今天狀態神級。',
    heroImage: 'https://i.pinimg.com/1200x/59/67/d1/5967d1cd4f2c5523a27d5913a66271fa.jpg'
  },
  {
    id: 'n3',
    type: 'brand',
    badge: '品牌動態',
    badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    source: 'VOGUE KOREA OFFICIAL',
    time: '昨日 22:30',
    mainTitle: '重塑經典：高級珠寶腕錶全球品牌大使全新冬季畫報釋出',
    subTitle: '在光影交錯間展現從容不迫的紳士氣場。',
    summary: '極簡剪裁襯衫搭配冷色調針織，將克制與禁慾感拿捏得淋漓盡致。',
    heroImage: 'https://images.plurk.com/wGRATa3N4kmnXq7NfNW5q.jpg'
  },
  {
    id: 'n4',
    type: 'schedule',
    badge: '現場快訊',
    badgeColor: 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
    source: 'DAILY DRAMA REPORT',
    time: '2 天前',
    mainTitle: '夜間封街拍攝路透：黑色長風衣夜雨奔跑戲碼',
    subTitle: '零下低溫中連續拍攝四個小時，敬業精神獲劇組大讚。',
    summary: '現場工作人員透露，即使在休息帳篷內也一直在與導演討論走位，直到凌晨三點才正式收工撤場。',
    heroImage: null
  }
];

const SCRIPT_SCENARIOS = {
  arenaA: {
    label: '🐈‍⬛',
    steps: [
      {
        delay: 300,
        type: 'text',
        content: '《Arena Homme+》A cut 樣片出來了。',
        notify: 'Soo: 《Arena Homme+》A cut 樣片出來了。'
      },
      {
        delay: 1200,
        type: 'album_grid',
        title: 'Arena Homme+ Nov 2026 - Series A',
        images: ARENA_ALL_IMAGES.slice(0, 11),
        notify: 'Soo 已傳送照片相簿 (11張)'
      }
    ]
  },
  arenaB: {
    label: '🐆',
    steps: [
      {
        delay: 300,
        type: 'text',
        content: 'B 組色調稍微暗一點，看合不合你胃口。',
        notify: 'Soo: B 組色調稍微暗一點...'
      },
      {
        delay: 1200,
        type: 'album_grid',
        title: 'Arena Homme+ Nov 2026 - Series B',
        images: ARENA_ALL_IMAGES.slice(11, 20),
        notify: 'Soo 已傳送照片相簿 (9張)'
      }
    ]
  },
  arenaC: {
    label: '🪵',
    steps: [
      {
        delay: 300,
        type: 'text',
        content: 'C cut 拍得比較隨性。',
        notify: 'Soo: C cut 拍得比較隨性。'
      },
      {
        delay: 1200,
        type: 'album_grid',
        title: 'Arena Homme+ Nov 2026 - Series C',
        images: ARENA_ALL_IMAGES.slice(20, 30),
        notify: 'Soo 已傳送照片相簿 (10張)'
      }
    ]
  },
  arenaD: {
    label: '🐺',
    steps: [
      {
        delay: 300,
        type: 'text',
        content: '最後一組特寫。',
        notify: 'Soo: 最後一組特寫。'
      },
      {
        delay: 1200,
        type: 'album_grid',
        title: 'Arena Homme+ Nov 2026 - Series D',
        images: ARENA_ALL_IMAGES.slice(30, 36),
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
        notify: 'Soo已傳送照片'
      },
      {
        delay: 1500,
        type: 'text',
        content: '哪張比較好？',
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
        notify: 'Soo已傳送照片'
      },
      {
        delay: 1200,
        type: 'text',
        content: '剛換完造型。',
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
        notify: 'Soo傳送了語音訊息'
      },
      {
        delay: 3500,
        type: 'audio',
        audioSrc: '/audio/i_miss_u_longer.mp3',
        durationText: '0:05',
        notify: 'Soo傳送了語音訊息'
      },
      {
        delay: 7000,
        type: 'audio',
        audioSrc: '/audio/shall_i_go_now.mp3',
        durationText: '0:04',
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
        notify: 'Soo傳送了語音訊息'
      }
    ]
  },
  plotLove: {
    label: '♥️',
    steps: [
      {
        delay: 400,
        type: 'audio',
        audioSrc: '/audio/love_u.mp3',
        durationText: '0:03',
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
  const getCurrentTime = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  };

  const [messages, setMessages] = useState([
    { id: 1, role: 'assistant', type: 'text', content: '今天有好好吃飯嗎？', time: getCurrentTime() }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasNotifPermission, setHasNotifPermission] = useState(false);
  const [delayCountdown, setDelayCountdown] = useState(null);

  // 晨喚與通話狀態
  const [isAlarmActive, setIsAlarmActive] = useState(true);
  const [hasAwoken, setHasAwoken] = useState(false);
  const [callStatus, setCallStatus] = useState('idle');
  const [callDuration, setCallDuration] = useState(0);

  // 視訊通話狀態與影片切換
  const [isVideoCalling, setIsVideoCalling] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);

  // 彈出模組面板 ('none' | 'album' | 'calendar' | 'voices' | 'news')
  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [activeAlbumTab, setActiveAlbumTab] = useState('arena');

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

  const sendTextMessage = (text) => {
    setMessages(prev => [
      ...prev,
      {
        id: Date.now(),
        role: 'assistant',
        type: 'text',
        content: text,
        time: getCurrentTime()
      }
    ]);
    sendPushNotification(text);
  };

  // 晨喚與整點排程檢查（每 10 秒執行一次）
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

      const isTargetHour = (h >= 7 && h <= 23) || (h >= 0 && h <= 2);
      if (m === 0 && isTargetHour && !triggeredSlots.current.has(timeKey)) {
        triggeredSlots.current.add(timeKey);
        if (h !== 8 && h !== 9 && h !== 10) {
          const randomText = HOURLY_MESSAGES[Math.floor(Math.random() * HOURLY_MESSAGES.length)];
          sendTextMessage(randomText);
        }
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
        ringAudioRef.current.currentTime = 73;
        ringAudioRef.current.play().catch(e => console.log('Ring error:', e));
      }
    } else {
      if (ringAudioRef.current) {
        ringAudioRef.current.pause();
      }
    }
  }, [callStatus]);

  // 通話中計時
  useEffect(() => {
    let durationTimer = null;
    if (callStatus === 'connected') {
      setCallDuration(0);
      durationTimer = setInterval(() => setCallDuration(prev => prev + 1), 1000);
      if (voice5AudioRef.current) {
        voice5AudioRef.current.currentTime = 0;
        voice5AudioRef.current.play().catch(e => console.log('Voice5 error:', e));
      }
    } else {
      clearInterval(durationTimer);
      clearTimeout(voiceIntervalTimerRef.current);
      if (voice5AudioRef.current) voice5AudioRef.current.pause();
    }
    return () => {
      clearInterval(durationTimer);
      clearTimeout(voiceIntervalTimerRef.current);
    };
  }, [callStatus]);

  // 視訊通話計時
  useEffect(() => {
    let videoTimer = null;
    if (isVideoCalling) {
      setVideoDuration(0);
      videoTimer = setInterval(() => setVideoDuration(prev => prev + 1), 1000);
    } else {
      clearInterval(videoTimer);
    }
    return () => clearInterval(videoTimer);
  }, [isVideoCalling]);

  const handleVoice5Ended = () => {
    if (callStatus !== 'connected') return;
    voiceIntervalTimerRef.current = setTimeout(() => {
      if (voice5AudioRef.current && callStatus === 'connected') {
        voice5AudioRef.current.currentTime = 0;
        voice5AudioRef.current.play().catch(e => console.log('Voice5 replay:', e));
      }
    }, 2000);
  };

  const handleEndCall = () => {
    const isConnected = (callStatus === 'connected');
    const finalDurationText = formatSeconds(callDuration);
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
            time: getCurrentTime() // 一律採用當前時間
          }
        ]);
        if (step.notify) {
          sendPushNotification(step.notify);
        }
      }, step.delay);
    });
  };

  const startOneMinuteNotificationTest = async () => {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      alert('請先點擊上方綠色「允許推播」按鈕開啟通知權限！');
      return;
    }

    setDelayCountdown(60);

    const keys = Object.keys(SCRIPT_SCENARIOS);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    const chosenScenario = SCRIPT_SCENARIOS[randomKey];
    const previewText = chosenScenario?.steps[0]?.notify || 'Soo: 剛結束拍攝，你在幹嘛？';

    if ('serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.ready;
        if (reg.active) {
          reg.active.postMessage({
            type: 'SCHEDULE_NOTIFICATION',
            delay: 60000,
            title: 'Soo',
            options: {
              body: previewText,
              icon: 'https://images.plurk.com/7lPN93L87TwPEfErIseop9.jpg',
              badge: 'https://images.plurk.com/7lPN93L87TwPEfErIseop9.jpg'
            }
          });
        }
      } catch (e) {
        console.error('SW postMessage error:', e);
      }
    }

    setTimeout(() => {
      playScript(randomKey);
      setDelayCountdown(null);
    }, 60000);

    alert('⏱ 倒數 60 秒已交給背景！請現在關閉螢幕或退到主畫面測試。');
  };

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
        sendPushNotification('排程通知已授權成功！');
      } else {
        alert('尚未取得通知授權');
      }
    } catch (e) {
      alert('請求通知授權失敗: ' + e.message);
    }
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
        const awakeReply = '終於醒了？';
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

      {/* 主聊天容器：底色設定為 20~30% 乾淨白灰色 (#ECEEF1) */}
      <div className="w-full sm:max-w-[420px] h-[100dvh] sm:h-[92vh] sm:max-h-[880px] bg-[#ECEEF1] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden relative border-0 sm:border sm:border-slate-700">
        
        {/* 全螢幕語音通話介面 */}
        {callStatus !== 'idle' && (
          <div className="absolute inset-0 bg-slate-950/95 z-50 flex flex-col justify-between items-center py-16 px-6 text-white backdrop-blur-md animate-fade-in">
            <div className="flex flex-col items-center mt-10 space-y-4">
              <div className="w-40 h-40 rounded-full overflow-hidden ring-4 ring-emerald-400/40 shadow-2xl animate-pulse">
                <img 
                  src="https://images.plurk.com/6PooPJr1YbOhrMp5CCFdbl.jpg" 
                  alt="avatar" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <span className="text-2xl font-semibold tracking-wider">Soo</span>
              
              {callStatus === 'ringing' ? (
                <span className="text-xs text-slate-400 font-light tracking-wide">來電...</span>
              ) : (
                <span className="text-sm text-emerald-400 font-mono tracking-wider">{formatSeconds(callDuration)}</span>
              )}
            </div>

            {callStatus === 'ringing' ? (
              <div className="w-full flex justify-around items-center px-6 mb-8">
                <button 
                  onClick={handleEndCall}
                  className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 active:scale-95 transition flex items-center justify-center shadow-lg"
                >
                  <svg className="w-7 h-7 fill-white rotate-[135deg]" viewBox="0 0 24 24">
                    <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24 11.72 11.72 0 003.68.59 1 1 0 011 1v3.5a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.48.59 3.68a1 1 0 01-.24 1.02l-2.23 2.09z" />
                  </svg>
                </button>

                <button 
                  onClick={handleAcceptCall}
                  className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-400 active:scale-95 transition flex items-center justify-center shadow-lg animate-bounce"
                >
                  <svg className="w-7 h-7 fill-white" viewBox="0 0 24 24">
                    <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24 11.72 11.72 0 003.68.59 1 1 0 011 1v3.5a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.48.59 3.68a1 1 0 01-.24 1.02l-2.23 2.09z" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="w-full flex justify-center items-center mb-8">
                <button 
                  onClick={handleEndCall}
                  className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 active:scale-95 transition flex items-center justify-center shadow-lg"
                >
                  <svg className="w-7 h-7 fill-white rotate-[135deg]" viewBox="0 0 24 24">
                    <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24 11.72 11.72 0 003.68.59 1 1 0 011 1v3.5a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.48.59 3.68a1 1 0 01-.24 1.02l-2.23 2.09z" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}

        {/* 📹 全螢幕視訊通話介面（支援多段視訊影片切換） */}
        {isVideoCalling && (
          <div className="absolute inset-0 bg-black z-50 flex flex-col justify-between items-center py-12 px-6 text-white animate-fade-in">
            {/* 視訊畫面播放器 */}
            <div className="absolute inset-0 z-0 overflow-hidden">
              <img 
                src={VIDEO_STREAMS[selectedVideoIndex].poster} 
                alt="Video stream" 
                className="w-full h-full object-cover scale-105 filter brightness-95" 
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/85" />
            </div>

            {/* 頂部資訊與切換鏡頭按鈕 */}
            <div className="z-10 flex flex-col items-center mt-4 space-y-1">
              <span className="text-xl font-medium tracking-wide">Soo</span>
              <span className="text-xs text-emerald-400 font-mono tracking-widest">{formatSeconds(videoDuration)}</span>
              
              {/* 切換視訊影片小標籤 */}
              <div className="flex space-x-1.5 mt-2">
                {VIDEO_STREAMS.map((v, i) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVideoIndex(i)}
                    className={`text-[9px] px-2 py-0.5 rounded-full transition ${
                      selectedVideoIndex === i ? 'bg-white text-black font-semibold' : 'bg-white/20 text-white/70'
                    }`}
                  >
                    片段 {i + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* 右上角使用者自身鏡頭縮圖 */}
            <div className="z-10 absolute top-16 right-5 w-24 h-36 rounded-2xl overflow-hidden border-2 border-white/40 shadow-2xl bg-slate-800">
              <div className="w-full h-full bg-slate-700/80 flex items-center justify-center text-xs text-white/50">
                本機鏡頭
              </div>
            </div>

            {/* 底部掛斷按鈕 */}
            <div className="z-10 mb-6">
              <button
                onClick={() => {
                  setIsVideoCalling(false);
                  setMessages(prev => [
                    ...prev,
                    {
                      id: Date.now(),
                      role: 'assistant',
                      type: 'call_record',
                      durationText: formatSeconds(videoDuration),
                      statusText: `視訊通話 ${formatSeconds(videoDuration)}`,
                      time: getCurrentTime()
                    }
                  ]);
                }}
                className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 active:scale-95 transition flex items-center justify-center shadow-2xl"
              >
                <svg className="w-7 h-7 fill-white rotate-[135deg]" viewBox="0 0 24 24">
                  <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24 11.72 11.72 0 003.68.59 1 1 0 011 1v3.5a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.48.59 3.68a1 1 0 01-.24 1.02l-2.23 2.09z" />
                </svg>
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
                  src="https://images.plurk.com/6PooPJr1YbOhrMp5CCFdbl.jpg" 
                  alt="avatar" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-sm leading-tight text-white tracking-wide">Soo</span>
                <span className="text-[10px] text-emerald-400 font-mono">
                  {delayCountdown ? `倒數 ${delayCountdown}s 發送...` : (isAlarmActive ? (hasAwoken ? '晨喚已解除・排程中' : '晨喚待命・08:00 起') : '晨喚已關閉')}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            {/* 語音通話圖示 */}
            <button
              onClick={() => setCallStatus('ringing')}
              title="語音通話"
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center transition"
            >
              <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24 11.72 11.72 0 003.68.59 1 1 0 011 1v3.5a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.48.59 3.68a1 1 0 01-.24 1.02l-2.23 2.09z" />
              </svg>
            </button>

            {/* 視訊通話圖示 */}
            <button
              onClick={() => setIsVideoCalling(true)}
              title="視訊通話"
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center transition"
            >
              <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
              </svg>
            </button>

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
            <span className="bg-slate-300/60 text-slate-600 text-[10px] px-2.5 py-0.5 rounded-full font-medium">
              今天
            </span>
          </div>

          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div key={msg.id} className={`flex items-end ${isUser ? 'justify-end' : 'justify-start'} space-x-1.5`}>
                {!isUser && (
                  <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 mb-1 ring-1 ring-slate-300">
                    <img 
                      src="https://images.plurk.com/6PooPJr1YbOhrMp5CCFdbl.jpg" 
                      alt="avatar" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                )}

                {isUser && (
                  <div className="flex flex-col items-end text-[9px] text-slate-400 pr-1 leading-tight font-light">
                    <span className="text-emerald-600 font-medium">已讀</span>
                    <span>{msg.time}</span>
                  </div>
                )}

                {/* 通話記錄氣泡 */}
                {msg.type === 'call_record' ? (
                  <div className="flex items-center space-x-2.5 bg-white px-3.5 py-2.5 rounded-2xl rounded-tl-none shadow-sm border border-slate-200">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                      msg.durationText ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                    }`}>
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24 11.72 11.72 0 003.68.59 1 1 0 011 1v3.5a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.48.59 3.68a1 1 0 01-.24 1.02l-2.23 2.09z" />
                      </svg>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-slate-800">{msg.statusText}</span>
                      <span className="text-[9px] text-slate-400">通話紀錄</span>
                    </div>
                  </div>
                ) : msg.type === 'audio' ? (
                  <div className="flex flex-col space-y-1">
                    <AudioBubble audioSrc={msg.audioSrc} durationText={msg.durationText} />
                    {msg.content && (
                      <span className="text-[11px] text-slate-600 pl-1 font-light italic">
                        {msg.content}
                      </span>
                    )}
                  </div>
                ) : msg.type === 'album_grid' ? (
                  <div className="flex flex-col bg-white p-2 rounded-2xl max-w-[280px] shadow-sm border border-slate-200/80 space-y-1.5">
                    {msg.title && (
                      <span className="text-[11px] font-medium text-slate-800 px-1 truncate">
                        {msg.title}
                      </span>
                    )}
                    <div className="grid grid-cols-3 gap-1 rounded-xl overflow-hidden">
                      {msg.images.map((img, i) => (
                        <a key={i} href={img} target="_blank" rel="noreferrer" className="block aspect-[3/4] overflow-hidden bg-slate-100">
                          <img 
                            src={img} 
                            alt="Cut" 
                            loading="lazy"
                            className="w-full h-full object-cover hover:scale-105 transition duration-200" 
                          />
                        </a>
                      ))}
                    </div>
                    <span className="text-[9px] text-slate-400 px-1 text-right">
                      共 {msg.images.length} 張照片・點擊查看
                    </span>
                  </div>
                ) : msg.type === 'grid4' ? (
                  <div className="grid grid-cols-2 gap-1 max-w-[240px] rounded-2xl overflow-hidden p-1 bg-white shadow-sm border border-slate-200">
                    {msg.images.map((img, i) => (
                      <img 
                        key={i} 
                        src={img} 
                        alt="selfie" 
                        className="w-full h-28 object-cover rounded-lg hover:opacity-95 transition cursor-pointer" 
                      />
                    ))}
                  </div>
                ) : msg.type === 'photo' ? (
                  <div className="max-w-[70%] rounded-2xl overflow-hidden shadow-md border border-slate-200">
                    <img src={msg.imageUrl} alt="selfie" className="w-full max-h-72 object-cover" />
                  </div>
                ) : (
                  <div className={`max-w-[72%] rounded-2xl px-3.5 py-2 text-[13.5px] leading-relaxed shadow-sm ${
                    isUser ? 'bg-[#58D68D] text-slate-950 rounded-tr-none' : 'bg-white text-slate-900 rounded-tl-none border border-slate-200/60'
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                )}

                {!isUser && (
                  <span className="text-[9px] text-slate-400 pl-1 leading-tight font-light">
                    {msg.time}
                  </span>
                )}
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center space-x-1.5 justify-start">
              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 ring-1 ring-slate-300">
                <img 
                  src="https://images.plurk.com/6PooPJr1YbOhrMp5CCFdbl.jpg" 
                  alt="avatar" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="bg-white px-3 py-2.5 rounded-2xl rounded-tl-none shadow-sm border border-slate-200 flex space-x-1 items-center">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 劇本控制板 */}
        <div className="bg-slate-900/10 px-2.5 py-2 flex space-x-2 overflow-x-auto border-t border-slate-200/80 z-10 scrollbar-none shrink-0">
          <button
            onClick={startOneMinuteNotificationTest}
            className="text-[12px] whitespace-nowrap bg-white hover:bg-slate-50 text-slate-800 font-medium px-3 py-1.5 rounded-full shadow-sm border border-slate-200 transition shrink-0 active:scale-95"
          >
            🕰️
          </button>

          <button
            onClick={() => setCallStatus('ringing')}
            className="text-[12px] whitespace-nowrap bg-white hover:bg-slate-50 text-slate-800 font-medium px-3 py-1.5 rounded-full shadow-sm border border-slate-200 transition shrink-0 active:scale-95"
          >
            📞
          </button>

          {Object.entries(SCRIPT_SCENARIOS).map(([key, item]) => (
            <button
              key={key}
              onClick={() => playScript(key)}
              className="text-[12px] whitespace-nowrap bg-white hover:bg-slate-50 text-slate-800 font-medium px-3 py-1.5 rounded-full shadow-sm border border-slate-200 transition shrink-0 active:scale-95"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* ➕ 彈出擴充選單面板 */}
        {isPlusMenuOpen && (
          <div className="bg-[#212E3E]/95 backdrop-blur-md px-4 py-3 flex justify-around border-t border-white/10 z-20 animate-fade-in shadow-xl">
            <button
              onClick={() => { setActiveModal('album'); setIsPlusMenuOpen(false); }}
              className="flex flex-col items-center space-y-1 text-white active:scale-90 transition"
            >
              <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center text-lg shadow-sm">
                🖼️
              </div>
              <span className="text-[11px] text-slate-300">相簿</span>
            </button>

            <button
              onClick={() => { setActiveModal('calendar'); setIsPlusMenuOpen(false); }}
              className="flex flex-col items-center space-y-1 text-white active:scale-90 transition"
            >
              <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center text-lg shadow-sm">
                📅
              </div>
              <span className="text-[11px] text-slate-300">行事曆</span>
            </button>

            <button
              onClick={() => { setActiveModal('voices'); setIsPlusMenuOpen(false); }}
              className="flex flex-col items-center space-y-1 text-white active:scale-90 transition"
            >
              <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center text-lg shadow-sm">
                🎙️
              </div>
              <span className="text-[11px] text-slate-300">語音列表</span>
            </button>

            <button
              onClick={() => { setActiveModal('news'); setIsPlusMenuOpen(false); }}
              className="flex flex-col items-center space-y-1 text-white active:scale-90 transition"
            >
              <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center text-lg shadow-sm">
                📰
              </div>
              <span className="text-[11px] text-slate-300">情報</span>
            </button>
          </div>
        )}

        {/* 底部輸入列 */}
        <div className="bg-white p-2.5 flex items-center space-x-2 border-t border-slate-200 z-20 shrink-0 pb-6">
          <button
            onClick={() => setIsPlusMenuOpen(!isPlusMenuOpen)}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition shrink-0 ${
              isPlusMenuOpen ? 'bg-[#212E3E] text-white rotate-45' : 'bg-slate-100 text-[#212E3E] hover:bg-slate-200'
            }`}
          >
            <span className="text-xl font-light leading-none">＋</span>
          </button>

          <input
            type="text"
            className="flex-1 bg-slate-100 rounded-full px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-400"
            placeholder="輸入..."
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

        {/* 彈出視窗 1️⃣：相簿功能（無縫連續三排九宮格） */}
        {activeModal === 'album' && (
          <div className="absolute inset-0 bg-slate-950/95 z-50 flex flex-col text-white backdrop-blur-md animate-fade-in">
            <div className="pt-10 pb-3 px-4 bg-[#212E3E] flex items-center justify-between shadow">
              <span className="font-medium text-base tracking-wide">照片庫 (Albums)</span>
              <button onClick={() => setActiveModal(null)} className="text-sm text-slate-400 hover:text-white px-2 py-1">關閉</button>
            </div>

            {/* 相簿標籤分頁 */}
            <div className="flex border-b border-white/10 px-4 pt-2 bg-slate-900/60">
              <button
                onClick={() => setActiveAlbumTab('arena')}
                className={`pb-2 mr-4 text-xs font-medium tracking-wide border-b-2 transition ${
                  activeAlbumTab === 'arena' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-slate-400'
                }`}
              >
                Arena Homme+ Nov 2026 ({ARENA_ALL_IMAGES.length})
              </button>
              <button
                onClick={() => setActiveAlbumTab('uncategorized')}
                className={`pb-2 text-xs font-medium tracking-wide border-b-2 transition ${
                  activeAlbumTab === 'uncategorized' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-slate-400'
                }`}
              >
                未分類歸檔 ({UNCATEGORIZED_PHOTOS.length})
              </button>
            </div>

            {/* 無縫連續三排縮圖 */}
            <div className="flex-1 overflow-y-auto p-2">
              {activeAlbumTab === 'arena' ? (
                <div className="grid grid-cols-3 gap-1 rounded-xl overflow-hidden">
                  {ARENA_ALL_IMAGES.map((img, i) => (
                    <a key={i} href={img} target="_blank" rel="noreferrer" className="block aspect-[3/4] bg-slate-800 overflow-hidden">
                      <img src={img} alt="Arena Cut" loading="lazy" className="w-full h-full object-cover hover:scale-105 transition" />
                    </a>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-1 rounded-xl overflow-hidden">
                  {UNCATEGORIZED_PHOTOS.map((img, i) => (
                    <a key={i} href={img} target="_blank" rel="noreferrer" className="block aspect-[3/4] bg-slate-800 overflow-hidden">
                      <img src={img} alt="snap" loading="lazy" className="w-full h-full object-cover hover:scale-105 transition" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 彈出視窗 2️⃣：行事曆功能（7x5 格子框架） */}
        {activeModal === 'calendar' && (
          <div className="absolute inset-0 bg-slate-950/95 z-50 flex flex-col text-white backdrop-blur-md animate-fade-in">
            <div className="pt-10 pb-3 px-4 bg-[#212E3E] flex items-center justify-between shadow">
              <span className="font-medium text-base tracking-wide">行程日曆 (Calendar)</span>
              <button onClick={() => setActiveModal(null)} className="text-sm text-slate-400 hover:text-white px-2 py-1">關閉</button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-between">
              <div>
                <div className="text-center mb-4">
                  <span className="text-sm font-semibold tracking-widest text-emerald-400">NOVEMBER 2026</span>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-slate-400 mb-2">
                  <span>SUN</span><span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span>
                </div>

                <div className="grid grid-cols-7 gap-1.5">
                  {Array.from({ length: 35 }).map((_, i) => {
                    const dayNum = i + 1;
                    const isSchedule = [4, 11, 15, 20, 27].includes(dayNum);
                    return (
                      <div 
                        key={i} 
                        className={`aspect-square rounded-lg p-1.5 flex flex-col justify-between border ${
                          dayNum <= 30 
                            ? 'bg-slate-900/60 border-white/5 hover:border-emerald-400/40 transition' 
                            : 'bg-transparent border-transparent opacity-10'
                        }`}
                      >
                        <span className="text-[10px] font-mono text-slate-400">{dayNum <= 30 ? dayNum : ''}</span>
                        {isSchedule && dayNum <= 30 && (
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 self-end"></div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white/5 rounded-2xl p-3.5 space-y-1.5 border border-white/10 mt-4">
                <span className="text-xs font-semibold text-emerald-300">近期重點行程</span>
                <p className="text-[11px] text-slate-300">11/15 米蘭時裝週冬日特企拍攝</p>
                <p className="text-[11px] text-slate-300">11/20 新戲劇本二次圍讀會議</p>
              </div>
            </div>
          </div>
        )}

        {/* 彈出視窗 3️⃣：語音列表全集 */}
        {activeModal === 'voices' && (
          <div className="absolute inset-0 bg-slate-950/95 z-50 flex flex-col text-white backdrop-blur-md animate-fade-in">
            <div className="pt-10 pb-3 px-4 bg-[#212E3E] flex items-center justify-between shadow">
              <span className="font-medium text-base tracking-wide">語音原聲帶 (Voice Memos)</span>
              <button onClick={() => setActiveModal(null)} className="text-sm text-slate-400 hover:text-white px-2 py-1">關閉</button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
              {ALL_VOICE_LIST.map((item) => (
                <div key={item.id} className="bg-slate-900/80 p-3 rounded-2xl border border-white/5 flex items-center justify-between">
                  <div className="flex flex-col space-y-0.5">
                    <span className="text-xs font-medium text-slate-200">{item.title}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{item.duration}</span>
                  </div>
                  <AudioBubble audioSrc={item.src} durationText={item.duration} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 彈出視窗 4️⃣：情報與動態（真實新聞與站姐圖文混排頁面） */}
        {activeModal === 'news' && (
          <div className="absolute inset-0 bg-[#0F172A] z-50 flex flex-col text-slate-100 backdrop-blur-md animate-fade-in">
            <div className="pt-10 pb-3 px-4 bg-[#1E293B] flex items-center justify-between border-b border-slate-700/60 shadow">
              <div className="flex flex-col">
                <span className="font-semibold text-base tracking-wide text-white">情報專區 (News & Intel)</span>
                <span className="text-[10px] text-slate-400">官方通告・媒體新聞・站姐高清預覽</span>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-md bg-white/5">
                關閉
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {INTEL_FEED_DATA.map((item) => (
                <article key={item.id} className="bg-[#1E293B]/70 rounded-2xl border border-slate-700/50 p-4 space-y-2.5 shadow-sm hover:border-slate-500/50 transition">
                  {/* 標籤列 */}
                  <div className="flex items-center justify-between text-[10px]">
                    <span className={`px-2 py-0.5 rounded-full font-semibold ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                    <div className="flex items-center space-x-1.5 text-slate-400 font-mono">
                      <span>{item.source}</span>
                      <span>•</span>
                      <span>{item.time}</span>
                    </div>
                  </div>

                  {/* 大小標題層次 */}
                  <div className="space-y-1">
                    <h3 className="text-[14px] font-bold text-white leading-snug tracking-tight">
                      {item.mainTitle}
                    </h3>
                    {item.subTitle && (
                      <h4 className="text-[12px] font-medium text-slate-300 leading-normal">
                        {item.subTitle}
                      </h4>
                    )}
                  </div>

                  {/* 內文簡述 */}
                  <p className="text-[11.5px] text-slate-400 leading-relaxed font-light">
                    {item.summary}
                  </p>

                  {/* 附加預覽大圖 */}
                  {item.heroImage && (
                    <div className="rounded-xl overflow-hidden aspect-[16/9] w-full bg-slate-800 shadow-inner mt-2">
                      <img 
                        src={item.heroImage} 
                        alt="Intel preview" 
                        loading="lazy" 
                        className="w-full h-full object-cover hover:scale-102 transition duration-300" 
                      />
                    </div>
                  )}
                </article>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
