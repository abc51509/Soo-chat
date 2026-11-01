import React, { useState, useEffect, useRef } from 'react';

// Google 試算表設定 (綁定 Soo_Master_Database)
const SPREADSHEET_ID = '11P8tG-MhZiwrBcGf9TyFirQNwPxKC2YPVbv4XHMEV-A';

// 標準健全的 CSV 狀態機解析：嚴格分行，不再讓引號跨行吞噬幾十列
const parseCsvRobust = (text) => {
  const rows = [];
  let currentRow = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentField += '"';
        i++; // 跳過轉義雙引號
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentField.trim());
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentField.trim());
      if (currentRow.some(c => c.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some(c => c.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
};

// 治本讀取：固定 A-L 欄索引映射，不再動態受標題污染影響
const fetchSheetData = async (sheetName) => {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}&t=${Date.now()}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const text = await res.text();
    
    const rows = parseCsvRobust(text);
    if (rows.length <= 1) return [];

    // 固定 A 到 L 欄順序：
    // 0: id, 1: event_id, 2: date, 3: category, 4: sub_type, 5: album_name,
    // 6: images, 7: caption, 8: audio_after, 9: follow_up_1, 10: follow_up_2, 11: follow_up_3
    return rows.slice(1).map(row => {
      const getVal = (idx) => (row[idx] ? row[idx].trim().replace(/^"|"$/g, '') : '');
      return {
        id: getVal(0),
        event_id: getVal(1),
        date: getVal(2),
        category: getVal(3),
        sub_type: getVal(4),
        album_name: getVal(5),
        images: getVal(6),
        caption: getVal(7),
        audio_after: getVal(8),
        follow_up_1: getVal(9),
        follow_up_2: getVal(10),
        follow_up_3: getVal(11)
      };
    });
  } catch (err) {
    console.error(`讀取試算表 [${sheetName}] 失敗:`, err);
    return [];
  }
};

// 音訊解析
const formatAudioUrl = (raw) => {
  if (!raw) return '';
  let clean = raw.trim().replace(/^["']|["']$/g, '');
  if (!clean) return '';

  const lower = clean.toLowerCase();

  if (lower === 'random_like' || lower.includes('random')) {
    const likeOptions = [
      '/audio/Do_u_like_it.mp3',
      '/audio/How_is_it.mp3',
      '/audio/How_is_it_Do_u_like_it.mp3'
    ];
    return likeOptions[Math.floor(Math.random() * likeOptions.length)];
  }

  if (lower === 'do_u_like_it' || lower === 'do_u_like_it.mp3') return '/audio/Do_u_like_it.mp3';
  if (lower === 'how_is_it' || lower === 'how_is_it.mp3') return '/audio/How_is_it.mp3';
  if (lower === 'how_is_it_do_u_like_it' || lower === 'how_is_it_do_u_like_it.mp3') return '/audio/How_is_it_Do_u_like_it.mp3';
  if (lower === 'can_u_b_my_gf' || lower === 'can_u_b_my_gf.mp3') return '/audio/Can_u_b_my_gf.mp3';
  if (lower === 'eat' || lower === 'eat.mp3') return '/audio/eat.mp3';
  if (lower === 'lets_get_engaged' || lower === "let's_get_engaged.mp3") return "/audio/Let's_get_engaged.mp3";

  if (!clean.endsWith('.mp3') && !clean.endsWith('.wav') && !clean.endsWith('.m4a')) {
    clean += '.mp3';
  }
  if (clean.startsWith('http')) return clean;
  clean = clean.replace(/^\/+/, '');
  if (!clean.startsWith('audio/')) {
    clean = 'audio/' + clean;
  }
  return '/' + clean;
};

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
        className="w-7 h-7 rounded-full bg-[#5FBDB9] text-white flex items-center justify-center shrink-0 shadow-sm transition active:scale-90"
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
                isPlaying ? 'bg-[#5FBDB9] animate-pulse' : 'bg-slate-300'
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

// 晨間劇本語音
const WAKEUP_VOICES = {
  1: { src: '/audio/1_get up_cozy.mp3', duration: '0:03', notify: 'Soo: 起床囉...' },
  5: { src: '/audio/5_get_up_yell.mp3', duration: '0:04', notify: 'Soo: 起床！' }
};

// 整點隨機純文字台詞
const HOURLY_TEXT_MESSAGES = [
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

// 整點隨機語音台詞
const HOURLY_VOICE_MESSAGES = [
  { type: 'audio', src: '/audio/i_miss_u.mp3', duration: '0:03', notify: 'Soo: 我想你。' },
  { type: 'audio', src: '/audio/i_miss_u_longer.mp3', duration: '0:05', notify: 'Soo: 真的好想你...' },
  { type: 'audio', src: '/audio/love_u.mp3', duration: '0:03', notify: 'Soo: 我愛你。' },
  { type: 'audio', src: '/audio/shall_i_go_now.mp3', duration: '0:04', notify: 'Soo: 我現在過去？' },
  { type: 'audio', src: '/audio/lets_date.mp3', duration: '0:04', notify: 'Soo: 吃飽飯我們去約會吧。' }
];

// 語音列表全集
const ALL_VOICE_LIST = [
  { id: 'v1', title: '晨喚 1: 輕柔喚醒', src: '/audio/1_get up_cozy.mp3', duration: '0:03' },
  { id: 'v2', title: '晨喚 2: 該起來了', src: '/audio/2_plz_get_up.mp3', duration: '0:04' },
  { id: 'v3', title: '晨喚 3: 還在睡？', src: '/audio/3_can_u_get_up.mp3', duration: '0:04' },
  { id: 'v4', title: '晨喚 4: 真的該起了', src: '/audio/4_time_to_get_up_now.mp3', duration: '0:03' },
  { id: 'v5', title: '晨喚 5: 低音威脅', src: '/audio/5_get_up_yell.mp3', duration: '0:04' },
  { id: 'v6', title: '告白: Can you be my girlfriend', src: '/audio/Can_u_b_my_gf.mp3', duration: '0:04' },
  { id: 'v7', title: '喜歡嗎: Do you like it?', src: '/audio/Do_u_like_it.mp3', duration: '0:03' },
  { id: 'v8', title: '日常: 吃飯了嗎？', src: '/audio/eat.mp3', duration: '0:03' },
  { id: 'v9', title: '詢問: 覺得如何？喜歡嗎？', src: '/audio/How_is_it_Do_u_like_it.mp3', duration: '0:04' },
  { id: 'v10', title: '詢問: 覺得怎麼樣？', src: '/audio/How_is_it.mp3', duration: '0:03' },
  { id: 'v11', title: '求婚: Let’s get engaged', src: "/audio/Let's_get_engaged.mp3", duration: '0:04' },
  { id: 'v12', title: '日常: 有點想你', src: '/audio/i_miss_u.mp3', duration: '0:03' },
  { id: 'v13', title: '日常: 真的很想你', src: '/audio/i_miss_u_longer.mp3', duration: '0:05' },
  { id: 'v14', title: '日常: 我現在過去？', src: '/audio/shall_i_go_now.mp3', duration: '0:04' },
  { id: 'v15', title: '約會: 吃飽飯我們去約會吧', src: '/audio/lets_date.mp3', duration: '0:04' },
  { id: 'v16', title: '心意: 我愛你', src: '/audio/love_u.mp3', duration: '0:03' },
  { id: 'v17', title: '夜間: 晚安', src: '/audio/good_night_normal.mp3', duration: '0:05' }
];

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

  const getTodayDateStr = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  };

  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('soo_chat_messages');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [{ id: 1, role: 'assistant', type: 'text', content: '今天有好好吃飯嗎？', time: getCurrentTime() }];
  });

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const [sheetMedia, setSheetMedia] = useState([]);
  const [sheetEvents, setSheetEvents] = useState([]);
  const [sheetNews, setSheetNews] = useState([]);

  const [followUpQueue, setFollowUpQueue] = useState(() => {
    try {
      const saved = localStorage.getItem('soo_follow_up_queue');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [awokenDate, setAwokenDate] = useState(() => {
    return localStorage.getItem('soo_awoken_date') || '';
  });

  const [callStatus, setCallStatus] = useState('idle');
  const [callDuration, setCallDuration] = useState(0);
  const [isVideoCalling, setIsVideoCalling] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);

  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [activeAlbumTab, setActiveAlbumTab] = useState('all');

  const ringAudioRef = useRef(null);
  const phoneCallAudioRef = useRef(null);
  const videoPlayerRef = useRef(null);
  const triggeredSlots = useRef(new Set());
  const messagesEndRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem('soo_chat_messages', JSON.stringify(messages));
    } catch (e) {
      console.error('儲存訊息失敗:', e);
    }
  }, [messages]);

  useEffect(() => {
    try {
      localStorage.setItem('soo_follow_up_queue', JSON.stringify(followUpQueue));
    } catch (e) {
      console.error('儲存追問隊列失敗:', e);
    }
  }, [followUpQueue]);

  const loadAllSheets = async () => {
    const [eventsData, mediaData, newsData] = await Promise.all([
      fetchSheetData('events'),
      fetchSheetData('media'),
      fetchSheetData('news')
    ]);
    if (eventsData && eventsData.length > 0) setSheetEvents(eventsData);
    if (mediaData && mediaData.length > 0) setSheetMedia(mediaData);
    if (newsData && newsData.length > 0) setSheetNews(newsData);
  };

  useEffect(() => {
    loadAllSheets();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const formatSeconds = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const sendVoiceMessage = (voiceData) => {
    let cleanSrc = voiceData.src || '';
    if (!cleanSrc.startsWith('http') && !cleanSrc.startsWith('/')) {
      cleanSrc = '/' + cleanSrc;
    }
    setMessages(prev => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        role: 'assistant',
        type: 'audio',
        audioSrc: cleanSrc,
        durationText: voiceData.duration || '0:04',
        time: getCurrentTime()
      }
    ]);
  };

  const addCallRecord = (statusText = '未接來電', role = 'assistant', durationText = null) => {
    setMessages(prev => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        role: role,
        type: 'call_record',
        durationText: durationText,
        statusText: statusText,
        time: getCurrentTime()
      }
    ]);
  };

  const pickRandomUnspent = (poolKey, items) => {
    if (!items || items.length === 0) return null;
    const storageKey = `soo_spent_${poolKey}`;
    let spentIds = JSON.parse(localStorage.getItem(storageKey) || '[]');

    let available = items.filter(item => {
      const id = item.id || item.images || JSON.stringify(item);
      return !spentIds.includes(id);
    });

    if (available.length === 0) {
      spentIds = [];
      localStorage.removeItem(storageKey);
      available = items;
    }

    const chosen = available[Math.floor(Math.random() * available.length)];
    const chosenId = chosen.id || chosen.images || JSON.stringify(chosen);
    spentIds.push(chosenId);
    localStorage.setItem(storageKey, JSON.stringify(spentIds));

    return chosen;
  };

  // 正常點擊分類觸發
  const triggerCategoryRandom = (catKey) => {
    const target = catKey.toLowerCase().trim();
    const pool = sheetMedia.filter(m => (m.category || '').toLowerCase().trim() === target);

    if (pool.length === 0) {
      alert(`試算表 media 標籤中尚未找到分類為 "${catKey}" 的資料`);
      return;
    }

    const item = pickRandomUnspent(catKey, pool);
    if (!item) return;

    const rawImgs = (item.images || '').trim();
    const imgList = rawImgs.split(/[\s,]+/).filter(url => url.startsWith('http'));

    if (imgList.length === 1) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          role: 'assistant',
          type: 'photo',
          imageUrl: imgList[0],
          time: getCurrentTime()
        }
      ]);
    } else if (imgList.length > 1) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          role: 'assistant',
          type: 'album_grid',
          title: '',
          images: imgList,
          time: getCurrentTime()
        }
      ]);
    }

    const textToSend = (item.caption || '').trim();
    if (textToSend) {
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            role: 'assistant',
            type: 'text',
            content: textToSend,
            time: getCurrentTime()
          }
        ]);
      }, 700);
    }

    const audioAfter = (item.audio_after || '').trim();
    if (audioAfter) {
      let finalAudio = formatAudioUrl(audioAfter);
      setTimeout(() => {
        sendVoiceMessage({
          src: finalAudio,
          duration: '0:03'
        });
      }, textToSend ? 1400 : 800);
    }

    const newFollowUps = [];
    if (item.follow_up_1 && item.follow_up_1.trim()) newFollowUps.push(item.follow_up_1.trim());
    if (item.follow_up_2 && item.follow_up_2.trim()) newFollowUps.push(item.follow_up_2.trim());
    if (item.follow_up_3 && item.follow_up_3.trim()) newFollowUps.push(item.follow_up_3.trim());

    if (newFollowUps.length > 0) {
      setFollowUpQueue(newFollowUps);
    }
  };

  // 1. 上方通話按鈕：我主動打給他
  const handleUserOutgoingCall = () => {
    const isBusy = Math.random() < 0.25;

    if (isBusy) {
      addCallRecord('取消通話', 'user');

      const busyReplies = ['在忙', '晚點回你'];
      const chosenReply = busyReplies[Math.floor(Math.random() * busyReplies.length)];
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now(),
            role: 'assistant',
            type: 'text',
            content: chosenReply,
            time: getCurrentTime()
          }
        ]);
      }, 800);
      return;
    }

    setCallStatus('connected');
  };

  // 2. 上方視訊按鈕：我主動打視訊給他
  const handleUserOutgoingVideo = () => {
    const isBusy = Math.random() < 0.25;

    if (isBusy) {
      addCallRecord('取消視訊', 'user');

      const busyReplies = ['在忙', '晚點回你'];
      const chosenReply = busyReplies[Math.floor(Math.random() * busyReplies.length)];
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now(),
            role: 'assistant',
            type: 'text',
            content: chosenReply,
            time: getCurrentTime()
          }
        ]);
      }, 800);
      return;
    }

    setIsVideoCalling(true);
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
      const todayStr = getTodayDateStr();
      setAwokenDate(todayStr);
      localStorage.setItem('soo_awoken_date', todayStr);
      setCallStatus('idle');

      setTimeout(() => {
        const awakeReply = '終於醒了？';
        setMessages(prev => [
          ...prev,
          { id: Date.now() + 1, role: 'assistant', type: 'text', content: awakeReply, time: getCurrentTime() }
        ]);
        setIsTyping(false);
      }, 1000);
      return;
    }

    if (followUpQueue.length > 0) {
      const [nextReply, ...remaining] = followUpQueue;
      setFollowUpQueue(remaining);

      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          { id: Date.now() + 1, role: 'assistant', type: 'text', content: nextReply, time: getCurrentTime() }
        ]);
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
      setIsTyping(false);
    }, 1000);
  };

  const handleClearMessages = () => {
    if (window.confirm(`目前共有 ${messages.length} 則訊息，確定要清空所有紀錄嗎？`)) {
      const initMsg = [{ id: Date.now(), role: 'assistant', type: 'text', content: '今天有好好吃飯嗎？', time: getCurrentTime() }];
      setMessages(initMsg);
      setFollowUpQueue([]);
      localStorage.removeItem('soo_chat_messages');
      localStorage.removeItem('soo_follow_up_queue');
    }
  };

  useEffect(() => {
    if (callStatus === 'ringing') {
      if (ringAudioRef.current) {
        ringAudioRef.current.currentTime = 73;
        ringAudioRef.current.play().catch(e => console.log('Ring error:', e));
      }
    } else {
      if (ringAudioRef.current) ringAudioRef.current.pause();
    }
  }, [callStatus]);

  useEffect(() => {
    let durationTimer = null;
    if (callStatus === 'connected') {
      setCallDuration(0);
      durationTimer = setInterval(() => setCallDuration(prev => prev + 1), 1000);
      if (phoneCallAudioRef.current) {
        phoneCallAudioRef.current.currentTime = 0;
        phoneCallAudioRef.current.play().catch(e => console.log('phone_call play error:', e));
      }
    } else {
      clearInterval(durationTimer);
      if (phoneCallAudioRef.current) phoneCallAudioRef.current.pause();
    }
    return () => clearInterval(durationTimer);
  }, [callStatus]);

  useEffect(() => {
    let videoTimer = null;
    if (isVideoCalling) {
      setVideoDuration(0);
      videoTimer = setInterval(() => setVideoDuration(prev => prev + 1), 1000);
      if (videoPlayerRef.current) {
        videoPlayerRef.current.currentTime = 0;
        videoPlayerRef.current.play().catch(e => console.log('video_call play error:', e));
      }
    } else {
      clearInterval(videoTimer);
      if (videoPlayerRef.current) videoPlayerRef.current.pause();
    }
    return () => clearInterval(videoTimer);
  }, [isVideoCalling]);

  const handleEndCall = () => {
    const isConnected = (callStatus === 'connected');
    const finalDurationText = formatSeconds(callDuration);
    setCallStatus('idle');

    setMessages(prev => [
      ...prev,
      {
        id: Date.now(),
        role: 'user',
        type: 'call_record',
        durationText: isConnected ? finalDurationText : null,
        statusText: isConnected ? `通話時間 ${finalDurationText}` : '未接來電',
        time: getCurrentTime()
      }
    ]);
  };

  const albumGroups = React.useMemo(() => {
    const groups = {};
    sheetMedia.forEach(m => {
      const albumKey = m.album_name ? m.album_name.trim() : '未分類歸檔 (Uncategorized)';
      if (!groups[albumKey]) groups[albumKey] = [];
      const raw = (m.images || '').trim();
      const imgs = raw.split(/[\s,]+/).filter(u => u.startsWith('http'));
      groups[albumKey].push(...imgs);
    });
    return groups;
  }, [sheetMedia]);

  return (
    <div className="flex h-[100dvh] w-screen bg-slate-900 justify-center items-center select-none overflow-hidden sm:p-3">
      {/* 鈴聲與音檔 */}
      <audio ref={ringAudioRef} src="/audio/telepathy 2025.mp3" loop preload="auto" />
      <audio ref={phoneCallAudioRef} src="/audio/phone_call.mp3" onEnded={handleEndCall} preload="auto" />

      {/* 主聊天容器 */}
      <div className="w-full sm:max-w-[420px] h-[100dvh] sm:h-[92vh] sm:max-h-[880px] bg-[#ECEEF1] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden relative border-0 sm:border sm:border-slate-700">
        
        {/* 全螢幕語音通話介面 */}
        {callStatus !== 'idle' && (
          <div className="absolute inset-0 bg-slate-950/95 z-50 flex flex-col justify-between items-center py-16 px-6 text-white backdrop-blur-md animate-fade-in">
            <div className="flex flex-col items-center mt-10 space-y-4">
              <div className="w-40 h-40 rounded-full overflow-hidden ring-4 ring-[#81D4D2]/40 shadow-2xl animate-pulse">
                <img src="https://images.plurk.com/6PooPJr1YbOhrMp5CCFdbl.jpg" alt="avatar" className="w-full h-full object-cover" />
              </div>
              <span className="text-2xl font-semibold tracking-wider">Soo</span>
              <span className="text-sm text-[#81D4D2] font-mono tracking-wider">{formatSeconds(callDuration)}</span>
            </div>

            <div className="w-full flex justify-center items-center mb-8">
              <button onClick={handleEndCall} title="掛斷" className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 active:scale-95 transition flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 fill-white rotate-[135deg]" viewBox="0 0 24 24"><path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24 11.72 11.72 0 003.68.59 1 1 0 011 1v3.5a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.48.59 3.68a1 1 0 01-.24 1.02l-2.23 2.09z" /></svg>
              </button>
            </div>
          </div>
        )}

        {/* 📹 全螢幕視訊通話介面 */}
        {isVideoCalling && (
          <div className="absolute inset-0 bg-black z-50 flex flex-col justify-between items-center py-12 px-6 text-white animate-fade-in">
            <div className="absolute inset-0 z-0 overflow-hidden">
              <video
                ref={videoPlayerRef}
                src="/video/video_call.mp4"
                playsInline
                autoPlay
                onEnded={() => {
                  setIsVideoCalling(false);
                  setMessages(prev => [
                    ...prev,
                    {
                      id: Date.now(),
                      role: 'user',
                      type: 'call_record',
                      durationText: formatSeconds(videoDuration),
                      statusText: `視訊通話 ${formatSeconds(videoDuration)}`,
                      time: getCurrentTime()
                    }
                  ]);
                }}
                className="w-full h-full object-cover scale-105 filter brightness-95"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/85 pointer-events-none" />
            </div>

            <div className="z-10 flex flex-col items-center mt-4 space-y-1">
              <span className="text-xl font-medium tracking-wide">Soo</span>
              <span className="text-xs text-[#81D4D2] font-mono tracking-widest">{formatSeconds(videoDuration)}</span>
            </div>

            <div className="z-10 mb-6">
              <button
                onClick={() => {
                  setIsVideoCalling(false);
                  setMessages(prev => [
                    ...prev,
                    {
                      id: Date.now(),
                      role: 'user',
                      type: 'call_record',
                      durationText: formatSeconds(videoDuration),
                      statusText: `視訊通話 ${formatSeconds(videoDuration)}`,
                      time: getCurrentTime()
                    }
                  ]);
                }}
                title="提前掛斷"
                className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 active:scale-95 transition flex items-center justify-center shadow-2xl"
              >
                <svg className="w-7 h-7 fill-white rotate-[135deg]" viewBox="0 0 24 24"><path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24 11.72 11.72 0 003.68.59 1 1 0 011 1v3.5a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.48.59 3.68a1 1 0 01-.24 1.02l-2.23 2.09z" /></svg>
              </button>
            </div>
          </div>
        )}

        {/* 頂部導航列 */}
        <div className="pt-12 pb-3.5 bg-[#4E727A] text-white flex items-center justify-between px-4 z-20 shrink-0 shadow-sm border-b border-[#3D5C63]">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-slate-800/30 overflow-hidden ring-2 ring-white/25 shadow-inner shrink-0">
              <img src="https://images.plurk.com/6PooPJr1YbOhrMp5CCFdbl.jpg" alt="avatar" className="w-full h-full object-cover" />
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="font-semibold text-base leading-none text-white tracking-wide">Soo</span>
              <span className={`w-2 h-2 rounded-full ${awokenDate === getTodayDateStr() ? 'bg-[#81D4D2]' : 'bg-amber-400'}`}></span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleClearMessages}
              title="清空聊天記錄"
              className="bg-black/20 hover:bg-black/30 active:scale-95 text-white/90 text-[11px] px-2.5 py-1 rounded-full transition flex items-center space-x-1 border border-white/10"
            >
              <span>清空</span>
              <span className="bg-[#81D4D2] text-[#0F3332] font-semibold text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                {messages.length}
              </span>
            </button>

            <button onClick={handleUserOutgoingCall} title="通話" className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center transition">
              <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24"><path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24 11.72 11.72 0 003.68.59 1 1 0 011 1v3.5a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.48.59 3.68a1 1 0 01-.24 1.02l-2.23 2.09z" /></svg>
            </button>
            <button onClick={handleUserOutgoingVideo} title="視訊通話" className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center transition">
              <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" /></svg>
            </button>
          </div>
        </div>

        {/* 對話區 */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-3.5 scroll-smooth">
          <div className="text-center my-1">
            <span className="bg-slate-300/60 text-slate-600 text-[10px] px-2.5 py-0.5 rounded-full font-medium">今天</span>
          </div>

          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div key={msg.id} className={`flex items-end ${isUser ? 'justify-end' : 'justify-start'} space-x-1.5`}>
                {!isUser && (
                  <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 mb-1 ring-1 ring-slate-300">
                    <img src="https://images.plurk.com/6PooPJr1YbOhrMp5CCFdbl.jpg" alt="avatar" className="w-full h-full object-cover" />
                  </div>
                )}

                {isUser && (
                  <div className="flex flex-col items-end text-[9px] text-teal-800/80 pr-1 leading-tight font-light">
                    <span className="text-teal-700 font-medium">已讀</span>
                    <span>{msg.time}</span>
                  </div>
                )}

                {msg.type === 'call_record' ? (
                  <div className="flex items-center space-x-2.5 bg-white px-3.5 py-2.5 rounded-2xl shadow-sm border border-slate-200">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                      msg.durationText ? 'bg-teal-50 text-teal-700' : 'bg-rose-100 text-rose-600'
                    }`}>
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24 11.72 11.72 0 003.68.59 1 1 0 011 1v3.5a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.48.59 3.68a1 1 0 01-.24 1.02l-2.23 2.09z" /></svg>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-slate-800">{msg.statusText}</span>
                      <span className="text-[9px] text-slate-400">通話紀錄</span>
                    </div>
                  </div>
                ) : msg.type === 'audio' ? (
                  <div className="flex flex-col space-y-1">
                    <AudioBubble audioSrc={msg.audioSrc} durationText={msg.durationText} />
                    {msg.content && <span className="text-[11px] text-slate-600 pl-1 font-light italic">{msg.content}</span>}
                  </div>
                ) : msg.type === 'album_grid' ? (
                  <div className="flex flex-col bg-white p-1.5 rounded-2xl max-w-[280px] shadow-sm border border-slate-200/80">
                    <div className="grid grid-cols-3 gap-1 rounded-xl overflow-hidden">
                      {msg.images.map((img, i) => (
                        <a key={i} href={img} target="_blank" rel="noreferrer" className="block aspect-[3/4] overflow-hidden bg-slate-100">
                          <img src={img} alt="Cut" loading="lazy" className="w-full h-full object-cover hover:scale-105 transition duration-200" />
                        </a>
                      ))}
                    </div>
                  </div>
                ) : msg.type === 'photo' ? (
                  <div className="max-w-[70%] rounded-2xl overflow-hidden shadow-md border border-slate-200">
                    <img src={msg.imageUrl} alt="selfie" className="w-full max-h-72 object-cover" />
                  </div>
                ) : (
                  <div className={`max-w-[72%] rounded-2xl px-3.5 py-2 text-[13.5px] leading-relaxed shadow-sm ${
                    isUser ? 'bg-[#81D4D2] text-[#0F3332] rounded-tr-none' : 'bg-white text-slate-900 rounded-tl-none border border-slate-200/60'
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                )}

                {!isUser && <span className="text-[9px] text-slate-400 pl-1 leading-tight font-light">{msg.time}</span>}
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center space-x-1.5 justify-start">
              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 ring-1 ring-slate-300">
                <img src="https://images.plurk.com/6PooPJr1YbOhrMp5CCFdbl.jpg" alt="avatar" className="w-full h-full object-cover" />
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
          <button onClick={() => triggerCategoryRandom('gym')} title="試算表類別: 健身" className="text-[12px] whitespace-nowrap bg-white hover:bg-slate-50 text-slate-800 font-medium px-3 py-1.5 rounded-full shadow-sm border border-slate-200 transition shrink-0 active:scale-95">
            🏋️
          </button>
          <button onClick={() => triggerCategoryRandom('car')} title="試算表類別: 車內自拍" className="text-[12px] whitespace-nowrap bg-white hover:bg-slate-50 text-slate-800 font-medium px-3 py-1.5 rounded-full shadow-sm border border-slate-200 transition shrink-0 active:scale-95">
            🚘
          </button>
          <button onClick={() => triggerCategoryRandom('selfie')} title="試算表類別: 自拍" className="text-[12px] whitespace-nowrap bg-white hover:bg-slate-50 text-slate-800 font-medium px-3 py-1.5 rounded-full shadow-sm border border-slate-200 transition shrink-0 active:scale-95">
            📷
          </button>
          <button onClick={() => triggerCategoryRandom('gd')} title="試算表類別: 志龍同遊" className="text-[12px] whitespace-nowrap bg-white hover:bg-slate-50 text-slate-800 font-medium px-3 py-1.5 rounded-full shadow-sm border border-slate-200 transition shrink-0 active:scale-95">
            🐲
          </button>
          <button onClick={() => triggerCategoryRandom('outing')} title="試算表類別: 出門玩" className="text-[12px] whitespace-nowrap bg-white hover:bg-slate-50 text-slate-800 font-medium px-3 py-1.5 rounded-full shadow-sm border border-slate-200 transition shrink-0 active:scale-95">
            🎡
          </button>
          <button onClick={() => triggerCategoryRandom('magazine')} title="試算表類別: 雜誌畫報" className="text-[12px] whitespace-nowrap bg-white hover:bg-slate-50 text-slate-800 font-medium px-3 py-1.5 rounded-full shadow-sm border border-slate-200 transition shrink-0 active:scale-95">
            🐈‍⬛
          </button>
          <button onClick={() => triggerCategoryRandom('official')} title="試算表類別: 出席活動" className="text-[12px] whitespace-nowrap bg-white hover:bg-slate-50 text-slate-800 font-medium px-3 py-1.5 rounded-full shadow-sm border border-slate-200 transition shrink-0 active:scale-95">
            ✨
          </button>
        </div>

        {/* ➕ 彈出擴充選單面板 */}
        {isPlusMenuOpen && (
          <div className="bg-[#4E727A]/95 backdrop-blur-md px-4 py-3 flex justify-around border-t border-[#3D5C63] z-20 animate-fade-in shadow-xl">
            <button onClick={() => { setActiveModal('album'); setIsPlusMenuOpen(false); }} className="flex flex-col items-center space-y-1 text-white active:scale-90 transition">
              <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center text-lg shadow-sm">🖼️</div>
              <span className="text-[11px] text-teal-100">相簿</span>
            </button>
            <button onClick={() => { setActiveModal('calendar'); setIsPlusMenuOpen(false); }} className="flex flex-col items-center space-y-1 text-white active:scale-90 transition">
              <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center text-lg shadow-sm">📅</div>
              <span className="text-[11px] text-teal-100">行事曆</span>
            </button>
            <button onClick={() => { setActiveModal('voices'); setIsPlusMenuOpen(false); }} className="flex flex-col items-center space-y-1 text-white active:scale-90 transition">
              <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center text-lg shadow-sm">🎙️</div>
              <span className="text-[11px] text-teal-100">語音列表</span>
            </button>
            <button onClick={() => { setActiveModal('news'); setIsPlusMenuOpen(false); }} className="flex flex-col items-center space-y-1 text-white active:scale-90 transition">
              <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center text-lg shadow-sm">📰</div>
              <span className="text-[11px] text-teal-100">情報</span>
            </button>
          </div>
        )}

        {/* 底部輸入列 */}
        <div className="bg-[#4E727A] p-2.5 flex items-center space-x-2 border-t border-[#3D5C63] z-20 shrink-0 pb-6">
          <button
            onClick={() => setIsPlusMenuOpen(!isPlusMenuOpen)}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition shrink-0 ${
              isPlusMenuOpen ? 'bg-white text-[#4E727A] rotate-45' : 'bg-white/15 text-white hover:bg-white/25'
            }`}
          >
            <span className="text-xl font-light leading-none">＋</span>
          </button>
          <input
            type="text"
            className="flex-1 bg-white/95 rounded-full px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#81D4D2]"
            placeholder="輸入..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.nativeEvent.isComposing) handleSend();
            }}
          />
          <button onClick={handleSend} className="bg-[#37545B] hover:bg-[#2C444A] active:scale-95 text-white text-xs font-medium px-4 py-2 rounded-full transition shadow-sm">
            傳送
          </button>
        </div>

        {/* 彈出視窗 1️⃣：相簿功能 */}
        {activeModal === 'album' && (
          <div className="absolute inset-0 bg-slate-950/95 z-50 flex flex-col text-white backdrop-blur-md animate-fade-in">
            <div className="pt-12 pb-3 px-4 bg-[#4E727A] flex items-center justify-between shadow border-b border-[#3D5C63]">
              <span className="font-medium text-base tracking-wide">照片庫 (Albums)</span>
              <button onClick={() => setActiveModal(null)} className="text-sm text-teal-100 hover:text-white px-2 py-1">關閉</button>
            </div>

            <div className="flex border-b border-white/10 px-3 pt-2 bg-slate-900/60 overflow-x-auto scrollbar-none">
              {Object.keys(albumGroups).map(name => (
                <button
                  key={name}
                  onClick={() => setActiveAlbumTab(name)}
                  className={`pb-2 mr-3 text-xs whitespace-nowrap font-medium tracking-wide border-b-2 transition ${
                    activeAlbumTab === name || (activeAlbumTab === 'all' && name === Object.keys(albumGroups)[0])
                      ? 'border-[#81D4D2] text-[#81D4D2]'
                      : 'border-transparent text-slate-400'
                  }`}
                >
                  {name} ({albumGroups[name]?.length || 0})
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              <div className="grid grid-cols-3 gap-1 rounded-xl overflow-hidden">
                {(albumGroups[activeAlbumTab === 'all' ? Object.keys(albumGroups)[0] : activeAlbumTab] || []).map((img, i) => (
                  <a key={i} href={img} target="_blank" rel="noreferrer" className="block aspect-[3/4] bg-slate-800 overflow-hidden">
                    <img src={img} alt="album snap" loading="lazy" className="w-full h-full object-cover hover:scale-105 transition" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 彈出視窗 2️⃣：行事曆功能 */}
        {activeModal === 'calendar' && (
          <div className="absolute inset-0 bg-slate-950/95 z-50 flex flex-col text-white backdrop-blur-md animate-fade-in">
            <div className="pt-12 pb-3 px-4 bg-[#4E727A] flex items-center justify-between shadow border-b border-[#3D5C63]">
              <span className="font-medium text-base tracking-wide">行程日曆 (Calendar)</span>
              <button onClick={() => setActiveModal(null)} className="text-sm text-teal-100 hover:text-white px-2 py-1">關閉</button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-between">
              <div>
                <div className="text-center mb-4">
                  <span className="text-sm font-semibold tracking-widest text-[#81D4D2]">NOVEMBER 2026</span>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-slate-400 mb-2">
                  <span>SUN</span><span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span>
                </div>
                <div className="grid grid-cols-7 gap-1.5">
                  {Array.from({ length: 35 }).map((_, i) => {
                    const dayNum = i + 1;
                    const matchedEvents = sheetEvents.filter(ev => {
                      if (!ev.date) return false;
                      const parts = ev.date.split('-');
                      return parseInt(parts[2], 10) === dayNum;
                    });
                    const hasSchedule = matchedEvents.length > 0;

                    return (
                      <div 
                        key={i} 
                        className={`aspect-square rounded-lg p-1.5 flex flex-col justify-between border ${
                          dayNum <= 30 
                            ? 'bg-slate-900/60 border-white/5 hover:border-[#81D4D2]/40 transition' 
                            : 'bg-transparent border-transparent opacity-10'
                        }`}
                      >
                        <span className="text-[10px] font-mono text-slate-400">{dayNum <= 30 ? dayNum : ''}</span>
                        {hasSchedule && dayNum <= 30 && (
                          <div className="w-1.5 h-1.5 rounded-full bg-[#81D4D2] self-end"></div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white/5 rounded-2xl p-3.5 space-y-1.5 border border-white/10 mt-4">
                <span className="text-xs font-semibold text-[#81D4D2]">近期重點行程 (來自試算表)</span>
                {sheetEvents.length > 0 ? (
                  sheetEvents.map((ev, idx) => (
                    <p key={idx} className="text-[11px] text-slate-300">
                      {ev.date} {ev.title} {ev.status ? `(${ev.status})` : ''}
                    </p>
                  ))
                ) : (
                  <p className="text-[11px] text-slate-500">暫無行程，請在試算表 events 分頁填入。</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 彈出視窗 3️⃣：語音列表全集 */}
        {activeModal === 'voices' && (
          <div className="absolute inset-0 bg-slate-950/95 z-50 flex flex-col text-white backdrop-blur-md animate-fade-in">
            <div className="pt-12 pb-3 px-4 bg-[#4E727A] flex items-center justify-between shadow border-b border-[#3D5C63]">
              <span className="font-medium text-base tracking-wide">語音原聲帶 (Voice Memos)</span>
              <button onClick={() => setActiveModal(null)} className="text-sm text-teal-100 hover:text-white px-2 py-1">關閉</button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
              {ALL_VOICE_LIST.map((item) => (
                <div key={item.id} className="bg-slate-900/80 p-3 rounded-2xl border border-white/5 flex items-center justify-between">
                  <div className="flex flex-col space-y-0.5">
                    <span className="text-xs font-medium text-slate-200">{item.title}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{item.duration}</span>
                  </div>
                  <AudioBubble audioSrc={formatAudioUrl(item.src)} durationText={item.duration} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 彈出視窗 4️⃣：情報與動態 */}
        {activeModal === 'news' && (
          <div className="absolute inset-0 bg-[#0F172A] z-50 flex flex-col text-slate-100 backdrop-blur-md animate-fade-in">
            <div className="pt-12 pb-3 px-4 bg-[#4E727A] flex items-center justify-between border-b border-[#3D5C63] shadow">
              <div className="flex flex-col">
                <span className="font-semibold text-base tracking-wide text-white">情報專區 (News & Intel)</span>
                <span className="text-[10px] text-teal-100/70">官方通告・媒體新聞・站姐高清預覽</span>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-xs text-teal-100 hover:text-white px-2.5 py-1 rounded-md bg-white/10">
                關閉
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {sheetNews.length > 0 ? (
                sheetNews.map((item, idx) => (
                  <article key={idx} className="bg-[#1E293B]/70 rounded-2xl border border-slate-700/50 p-4 space-y-2.5 shadow-sm hover:border-slate-500/50 transition">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="px-2 py-0.5 rounded-full font-semibold bg-[#81D4D2]/20 text-[#81D4D2] border border-[#81D4D2]/30">
                        {item.badge || '最新情報'}
                      </span>
                      <div className="flex items-center space-x-1.5 text-slate-400 font-mono">
                        <span>{item.source || 'OFFICIAL'}</span>
                        <span>•</span>
                        <span>{item.time_text || '近期'}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-[14px] font-bold text-white leading-snug tracking-tight">
                        {item.main_title}
                      </h3>
                      {item.sub_title && (
                        <h4 className="text-[12px] font-medium text-slate-300 leading-normal">
                          {item.sub_title}
                        </h4>
                      )}
                    </div>

                    {item.summary && (
                      <p className="text-[11.5px] text-slate-400 leading-relaxed font-light">
                        {item.summary}
                      </p>
                    )}

                    {item.hero_image && (
                      <div className="rounded-xl overflow-hidden aspect-[16/9] w-full bg-slate-800 shadow-inner mt-2">
                        <img src={item.hero_image} alt="News preview" loading="lazy" className="w-full h-full object-cover hover:scale-102 transition duration-300" />
                      </div>
                    )}
                  </article>
                ))
              ) : (
                <div className="text-center py-12 text-slate-500 text-xs">
                  試算表 news 分頁目前無資料，填寫後重新整理即可顯示。
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
