import React, { useState, useEffect, useRef } from 'react';

// Google 試算表設定 (綁定 Soo_Master_Database)
const SPREADSHEET_ID = '11P8tG-MhZiwrBcGf9TyFirQNwPxKC2YPVbv4XHMEV-A';

// 通用 Google Visualization JSON 讀取解析器
const fetchSheetData = async (sheetName) => {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&headers=1&sheet=${encodeURIComponent(sheetName)}&t=${Date.now()}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const text = await res.text();

    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    if (jsonStart === -1 || jsonEnd === -1) return [];

    const json = JSON.parse(text.substring(jsonStart, jsonEnd + 1));
    const table = json.table;
    if (!table || !table.rows || table.rows.length === 0) return [];

    const colKeys = table.cols.map((col, idx) => {
      const rawLabel = (col.label || '').trim();
      const cleanLabel = rawLabel.toLowerCase().replace(/[^a-z0-9_]/g, '');
      return {
        raw: rawLabel,
        clean: cleanLabel || `col_${idx}`,
        idx
      };
    });

    return table.rows.map(r => {
      const entry = {};
      colKeys.forEach(({ raw, clean, idx }) => {
        const cell = r.c && r.c[idx];
        const val = cell ? (cell.v ?? cell.f) : null;
        const strVal = val !== null && val !== undefined ? String(val).trim() : '';
        entry[clean] = strVal;
        if (raw) entry[raw] = strVal;
        entry[`col_${idx}`] = strVal;
      });
      return entry;
    });
  } catch (err) {
    console.error(`讀取試算表 [${sheetName}] 失敗:`, err);
    return [];
  }
};

// 安全取值輔助器
const getField = (obj, ...keys) => {
  if (!obj) return '';
  for (const k of keys) {
    if (obj[k] !== undefined && String(obj[k]).trim() !== '') {
      return String(obj[k]).trim();
    }
  }
  return '';
};

// YouTube 嵌入網址轉換工具
const getYouTubeEmbedUrl = (rawUrl) => {
  if (!rawUrl) return null;
  const match = rawUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:shorts\/|embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (!match) return null;
  const videoId = match[1];
  return `https://www.youtube.com/embed/${videoId}?autoplay=0&controls=1&playsinline=1&modestbranding=1`;
};

// 影片來源格式化
const formatVideoSource = (raw) => {
  if (!raw) return { type: 'none', url: '' };
  const clean = raw.trim();
  const ytUrl = getYouTubeEmbedUrl(clean);
  if (ytUrl) {
    return { type: 'youtube', url: ytUrl };
  }

  let finalPath = clean;
  if (!finalPath.startsWith('http') && !finalPath.startsWith('/')) {
    if (!finalPath.startsWith('video/')) {
      finalPath = '/video/' + finalPath;
    } else {
      finalPath = '/' + finalPath;
    }
  }
  return { type: 'direct', url: finalPath };
};

// 音訊路徑安全解析補全
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

// 語音氣泡元件（無時間標籤）
const AudioBubble = ({ audioSrc }) => {
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
      className="flex items-center space-x-2.5 bg-white px-3.5 py-2.5 rounded-2xl rounded-tl-none shadow-sm cursor-pointer hover:bg-slate-50 transition min-w-[90px] border border-slate-200/60"
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
    </div>
  );
};

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
    return [];
  });

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // 試算表資料庫
  const [masterMedia, setMasterMedia] = useState([]);
  const [dialogueList, setDialogueList] = useState([]);
  const [foodWeights, setFoodWeights] = useState([]);
  const [interviewData, setInterviewData] = useState([]);

  // 追問對話隊列
  const [followUpQueue, setFollowUpQueue] = useState(() => {
    try {
      const saved = localStorage.getItem('soo_follow_up_queue_v2');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [awokenDate, setAwokenDate] = useState(() => {
    return localStorage.getItem('soo_awoken_date') || '';
  });

  const [callStatus, setCallStatus] = useState('idle');
  const [callType, setCallType] = useState('audio');
  const [callDuration, setCallDuration] = useState(0);
  const [isVideoCalling, setIsVideoCalling] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);

  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  
  // 相簿庫專用狀態
  const [selectedAlbumName, setSelectedAlbumName] = useState(null);
  
  // FEED 詳情頁狀態與滾動記憶
  const [selectedFeedItem, setSelectedFeedItem] = useState(null);
  const feedListScrollRef = useRef(null);
  const [feedScrollPosition, setFeedScrollPosition] = useState(0);

  // 手勢滑動（Swipe to Back）狀態
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const ringAudioRef = useRef(null);
  const phoneCallAudioRef = useRef(null);
  const videoPlayerRef = useRef(null);
  const ringingTimeoutRef = useRef(null);
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
      localStorage.setItem('soo_follow_up_queue_v2', JSON.stringify(followUpQueue));
    } catch (e) {
      console.error('儲存追問隊列失敗:', e);
    }
  }, [followUpQueue]);

  const loadDatabase = async () => {
    const [mediaRows, diagRows, foodRows, interviewRows] = await Promise.all([
      fetchSheetData('media'),
      fetchSheetData('dialogues'),
      fetchSheetData('food_weights'),
      fetchSheetData('interviews')
    ]);

    if (mediaRows && mediaRows.length > 0) setMasterMedia(mediaRows);
    if (diagRows && diagRows.length > 0) setDialogueList(diagRows);
    if (foodRows && foodRows.length > 0) setFoodWeights(foodRows);
    if (interviewRows && interviewRows.length > 0) setInterviewData(interviewRows);
  };

  useEffect(() => {
    loadDatabase();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // 動態音訊庫清單（嚴格只從 dialogues 的 trigger_content 抓名稱）
  const dynamicVoiceList = React.useMemo(() => {
    const audioDiags = dialogueList.filter(d => (d.type || '').trim().toLowerCase() === 'audio');

    return audioDiags.map((d, idx) => {
      const rawSrc = d.audio_after || d.trigger_content || '';
      const cleanSrc = formatAudioUrl(rawSrc);
      const titleText = d.trigger_content ? d.trigger_content.trim() : `音訊 ${idx + 1}`;

      return {
        id: `voice_${idx}`,
        title: titleText,
        src: cleanSrc
      };
    });
  }, [dialogueList]);

  // 返回列表時還原滾動位置
  useEffect(() => {
    if (!selectedFeedItem && feedListScrollRef.current && feedScrollPosition > 0) {
      feedListScrollRef.current.scrollTop = feedScrollPosition;
    }
  }, [selectedFeedItem]);

  const handleOpenFeedDetail = (item) => {
    if (feedListScrollRef.current) {
      setFeedScrollPosition(feedListScrollRef.current.scrollTop);
    }
    setSelectedFeedItem(item);
  };

  // 全域滑動返回判定
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;

    if (deltaX > 70 && Math.abs(deltaY) < 60) {
      if (selectedFeedItem) {
        setSelectedFeedItem(null);
      } else if (selectedAlbumName) {
        setSelectedAlbumName(null);
      } else if (activeModal) {
        setActiveModal(null);
      }
    }
  };

  const formatSeconds = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // 連發氣泡引擎
  const sendStaggeredMessages = async (textBlock, options = {}) => {
    if (!textBlock) return;
    const bubbles = textBlock.split(/;|\n/).map(s => s.trim()).filter(Boolean);
    if (bubbles.length === 0) return;

    for (let i = 0; i < bubbles.length; i++) {
      setIsTyping(true);
      const delay = Math.floor(Math.random() * 350) + 450;
      await new Promise(r => setTimeout(r, delay));

      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          role: 'assistant',
          type: 'text',
          content: bubbles[i],
          replyTo: (i === 0 && options.replyTo) ? options.replyTo : null,
          time: getCurrentTime()
        }
      ]);

      if (i < bubbles.length - 1) {
        await new Promise(r => setTimeout(r, 300));
      }
    }

    if (options.audioAfter) {
      const finalAudio = formatAudioUrl(options.audioAfter);
      setTimeout(() => {
        sendVoiceMessage({ src: finalAudio });
      }, 600);
    }
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

  const pickDialogue = (typeKey) => {
    const pool = dialogueList.filter(d => (d.type || '').trim().toLowerCase() === typeKey.toLowerCase());
    if (pool.length === 0) return null;
    return pool[Math.floor(Math.random() * pool.length)];
  };

  // 吃什麼權重輪盤
  const triggerFoodRoulette = () => {
    if (foodWeights.length === 0) {
      sendStaggeredMessages('今天吃什麼都好;只要跟你一起吃');
      return;
    }

    const totalWeight = foodWeights.reduce((sum, item) => sum + (parseInt(item.weight, 10) || 1), 0);
    let rand = Math.random() * totalWeight;
    let selected = foodWeights[0];

    for (const item of foodWeights) {
      const w = parseInt(item.weight, 10) || 1;
      if (rand < w) {
        selected = item;
        break;
      }
      rand -= w;
    }

    const comment = selected.soo_comment || `去吃${selected.food_name}如何？;我來訂位`;
    sendStaggeredMessages(comment);
  };

  const extractAllFollowUps = (item, baseTitle = '') => {
    const list = [];
    if (item.follow_ups) {
      list.push(...item.follow_ups.split(/;|\n/).map(s => s.trim()).filter(Boolean));
    }
    if (item.follow_up_1 && item.follow_up_1.trim()) list.push(item.follow_up_1.trim());
    if (item.follow_up_2 && item.follow_up_2.trim()) list.push(item.follow_up_2.trim());
    if (item.follow_up_3 && item.follow_up_3.trim()) list.push(item.follow_up_3.trim());

    return list.map(text => ({
      replyText: text,
      replyTo: baseTitle || item.caption || item.trigger_content || ''
    }));
  };

  // 未接來電補發
  const triggerMissedCallFollowUp = (urgent = false) => {
    setTimeout(() => {
      const diag = pickDialogue(urgent ? 'missed_urgent' : 'missed_call');
      if (diag) {
        sendStaggeredMessages(diag.trigger_content, { audioAfter: diag.audio_after });
        const newQueue = extractAllFollowUps(diag, diag.trigger_content);
        if (newQueue.length > 0) setFollowUpQueue(prev => [...prev, ...newQueue]);
      } else {
        sendStaggeredMessages(urgent ? '怎麼沒接？;看到立刻打回來' : '看到打回來。');
      }
    }, 800);
  };

  // 來電觸發 (8 秒超時掛斷)
  const triggerIncomingCall = (type = 'audio', scenario = 'normal') => {
    setCallType(type);
    setCallStatus('ringing');

    clearTimeout(ringingTimeoutRef.current);
    ringingTimeoutRef.current = setTimeout(() => {
      setCallStatus(current => {
        if (current === 'ringing') {
          addCallRecord(type === 'video' ? '未接視訊' : '未接來電', 'assistant');

          if (scenario === 'urgent_chain') {
            setTimeout(() => {
              triggerIncomingCall('video', 'urgent_second');
            }, 1500);
          } else if (scenario === 'urgent_second') {
            triggerMissedCallFollowUp(true);
          } else {
            triggerMissedCallFollowUp(false);
          }
          return 'idle';
        }
        return current;
      });
    }, 8000);
  };

  const handleAcceptCall = () => {
    clearTimeout(ringingTimeoutRef.current);
    if (ringAudioRef.current) ringAudioRef.current.pause();

    if (callType === 'video') {
      setCallStatus('idle');
      setIsVideoCalling(true);
    } else {
      setCallStatus('connected');
    }
  };

  const handleEndCall = () => {
    clearTimeout(ringingTimeoutRef.current);
    const wasRinging = (callStatus === 'ringing');
    const isConnected = (callStatus === 'connected');
    const finalDurationText = formatSeconds(callDuration);
    setCallStatus('idle');

    if (wasRinging) {
      addCallRecord(callType === 'video' ? '未接視訊' : '未接來電', 'assistant');
      triggerMissedCallFollowUp(false);
    } else if (isConnected) {
      addCallRecord(`通話時間 ${finalDurationText}`, 'user', finalDurationText);
    }
  };

  const handleUserOutgoingCall = () => {
    const isBusy = Math.random() < 0.25;

    if (isBusy) {
      addCallRecord('取消通話', 'user');
      const diag = pickDialogue('call_rejected');
      const replyText = diag ? diag.trigger_content : '在忙;晚點回你';
      setTimeout(() => {
        sendStaggeredMessages(replyText);
      }, 800);
      return;
    }

    setCallType('audio');
    setCallStatus('connected');
  };

  const handleUserOutgoingVideo = () => {
    const isBusy = Math.random() < 0.25;

    if (isBusy) {
      addCallRecord('取消視訊', 'user');
      const diag = pickDialogue('video_rejected');
      const replyText = diag ? diag.trigger_content : '在外面不方便接視訊;等我回家';
      setTimeout(() => {
        sendStaggeredMessages(replyText);
      }, 800);
      return;
    }

    setIsVideoCalling(true);
  };

  // 快捷主動觸發：文字訊息
  const triggerManualText = () => {
    const textDiags = dialogueList.filter(d => (d.type || '').trim().toLowerCase() === 'text');
    if (textDiags.length === 0) {
      sendStaggeredMessages('在幹嘛呢？;今天想你了');
      return;
    }
    const picked = textDiags[Math.floor(Math.random() * textDiags.length)];
    sendStaggeredMessages(picked.trigger_content, { audioAfter: picked.audio_after });
    const newQueue = extractAllFollowUps(picked, picked.trigger_content);
    if (newQueue.length > 0) setFollowUpQueue(newQueue);
  };

  // 快捷主動觸發：隨機語音
  const triggerManualVoice = () => {
    if (dynamicVoiceList.length === 0) return;
    const picked = dynamicVoiceList[Math.floor(Math.random() * dynamicVoiceList.length)];
    sendVoiceMessage({ src: picked.src });
  };

  // 晨喚機制：嚴格時間區間 + 13:00 嚴格截斷
  useEffect(() => {
    const checkWakeupSchedule = () => {
      const todayStr = getTodayDateStr();
      if (awokenDate === todayStr) return;

      const now = new Date();
      const currentVal = now.getHours() * 60 + now.getMinutes();

      if (currentVal < 420 || currentVal > 780) return;

      const storageKey = `soo_wakeup_done_${todayStr}`;
      const triggeredSteps = JSON.parse(localStorage.getItem(storageKey) || '[]');

      let stepToRun = null;
      let voiceToPlay = null;

      if (currentVal >= 420 && currentVal < 480 && !triggeredSteps.includes('s1')) {
        stepToRun = 's1';
        voiceToPlay = { src: '/audio/1_get up_cozy.mp3' };
      } else if (currentVal >= 480 && currentVal < 570 && !triggeredSteps.includes('s2')) {
        stepToRun = 's2';
        voiceToPlay = { src: '/audio/2_plz_get_up.mp3' };
      } else if (currentVal >= 570 && currentVal < 690 && !triggeredSteps.includes('s3')) {
        stepToRun = 's3';
        voiceToPlay = { src: '/audio/3_can_u_get_up.mp3' };
      } else if (currentVal >= 690 && currentVal < 720 && !triggeredSteps.includes('s4')) {
        stepToRun = 's4';
        voiceToPlay = { src: '/audio/4_time_to_get_up_now.mp3' };
      } else if (currentVal >= 720 && currentVal <= 780 && !triggeredSteps.includes('s5')) {
        stepToRun = 's5';
        voiceToPlay = { src: '/audio/5_get_up_yell.mp3' };
      }

      if (stepToRun && voiceToPlay) {
        triggeredSteps.push(stepToRun);
        localStorage.setItem(storageKey, JSON.stringify(triggeredSteps));

        addCallRecord('未接來電', 'assistant');
        setTimeout(() => {
          sendVoiceMessage(voiceToPlay);
        }, 1000);
      }
    };

    checkWakeupSchedule();
    const interval = setInterval(checkWakeupSchedule, 60000);
    return () => clearInterval(interval);
  }, [awokenDate]);

  // 使用者傳訊
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

    if (currentInput.includes('起床')) {
      const todayStr = getTodayDateStr();
      setAwokenDate(todayStr);
      localStorage.setItem('soo_awoken_date', todayStr);
      setCallStatus('idle');

      const awakeDiag = pickDialogue('system_awake');
      sendStaggeredMessages(awakeDiag ? awakeDiag.trigger_content : '終於醒了？;水喝了嗎？');
      return;
    }

    if (/吃什麼|想吃|晚餐|午餐|宵夜|吃啥/.test(currentInput)) {
      triggerFoodRoulette();
      return;
    }

    if (followUpQueue.length > 0) {
      const [nextItem, ...remaining] = followUpQueue;
      setFollowUpQueue(remaining);

      setTimeout(() => {
        sendStaggeredMessages(nextItem.replyText, { replyTo: nextItem.replyTo });
      }, 700);
      return;
    }

    const textDiags = dialogueList.filter(d => (d.type || '').trim().toLowerCase() === 'text');
    const picked = textDiags.length > 0
      ? textDiags[Math.floor(Math.random() * textDiags.length)]
      : null;

    setTimeout(() => {
      if (picked) {
        sendStaggeredMessages(picked.trigger_content, { audioAfter: picked.audio_after });
        const newQueue = extractAllFollowUps(picked, picked.trigger_content);
        if (newQueue.length > 0) setFollowUpQueue(newQueue);
      } else {
        const fallbacks = ['好，我聽到了～', '吃飯了嗎？', '忙完回我一聲', '待會見～'];
        sendStaggeredMessages(fallbacks[Math.floor(Math.random() * fallbacks.length)]);
      }
    }, 800);
  };

  // 清空對話
  const handleClearMessages = () => {
    if (window.confirm(`目前共有 ${messages.length} 則訊息，確定要清空所有紀錄嗎？`)) {
      setMessages([]);
      setFollowUpQueue([]);
      localStorage.removeItem('soo_chat_messages');
      localStorage.removeItem('soo_follow_up_queue_v2');
    }
  };

  // 分類抽卡
  const triggerCategoryRandom = (catKey) => {
    const target = catKey.toLowerCase().trim();
    const pool = masterMedia.filter(m => (m.category || '').toLowerCase().trim() === target && (m.images || '').trim().length > 0);

    if (pool.length === 0) {
      alert(`Master 表格中找不到分類為 "${catKey}" 的照片`);
      return;
    }

    const item = pool[Math.floor(Math.random() * pool.length)];
    if (!item) return;

    const rawImgs = (item.images || '').trim();
    const imgList = rawImgs.split(/[\s,]+/).filter(url => url.startsWith('http'));

    if (imgList.length === 1) {
      setMessages(prev => [
        ...prev,
        { id: Date.now() + Math.random(), role: 'assistant', type: 'photo', imageUrl: imgList[0], time: getCurrentTime() }
      ]);
    } else if (imgList.length > 1) {
      setMessages(prev => [
        ...prev,
        { id: Date.now() + Math.random(), role: 'assistant', type: 'album_grid', images: imgList, time: getCurrentTime() }
      ]);
    }

    if (item.caption) {
      setTimeout(() => {
        sendStaggeredMessages(item.caption, { audioAfter: item.audio_after });
      }, 700);
    }

    const itemFollowUps = extractAllFollowUps(item, item.caption || item.album_name || '照片分享');
    if (itemFollowUps.length > 0) {
      setFollowUpQueue(prev => [...prev, ...itemFollowUps]);
    }
  };

  // 通話與視訊管理
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

  // 相簿分組
  const albumList = React.useMemo(() => {
    const groups = {};
    masterMedia.forEach(m => {
      const albumKey = m.album_name ? m.album_name.trim() : '未分類歸檔';
      if (!groups[albumKey]) {
        groups[albumKey] = {
          title: albumKey,
          images: []
        };
      }
      const raw = (m.images || '').trim();
      const imgs = raw.split(/[\s,]+/).filter(u => u.startsWith('http'));
      groups[albumKey].images.push(...imgs);
    });

    return Object.values(groups).map(g => {
      const uniqueImgs = Array.from(new Set(g.images));
      return {
        title: g.title,
        cover: uniqueImgs[0] || null,
        images: uniqueImgs,
        count: uniqueImgs.length
      };
    }).filter(g => g.count > 0);
  }, [masterMedia]);

  const albumPages = React.useMemo(() => {
    const pages = [];
    for (let i = 0; i < albumList.length; i += 4) {
      pages.push(albumList.slice(i, i + 4));
    }
    return pages;
  }, [albumList]);

  // 當月行程過濾（精確過濾 2026 年 11 月）
  const currentMonthEvents = React.useMemo(() => {
    return masterMedia
      .filter(m => {
        const rawDate = (m.date || '').trim();
        return rawDate.startsWith('2026-11') || rawDate.startsWith('2026/11') || rawDate.startsWith('2026.11');
      })
      .map(m => ({
        date: m.date,
        title: m.album_name || m.caption || '行程',
        status: m.sub_type || ''
      }));
  }, [masterMedia]);

  // Master Media 分流：FEED
  const feedItems = React.useMemo(() => {
    const grouped = {};

    masterMedia.forEach(m => {
      const newsTitleVal = getField(m, 'news_title', 'newstitle', 'title');
      const newsSummaryVal = getField(m, 'news_summary', 'newssummary', 'summary');
      const rawVideoUrl = getField(m, 'video_url', 'videourl', 'video');
      const rawVideoCaption = getField(m, 'video_caption', 'videocaption', 'video_desc', 'videodesc', 'video_title');
      const albumNameVal = getField(m, 'album_name', 'albumname', 'album');
      const interviewIdVal = getField(m, 'interview_id', 'interviewid', 'interview');
      const newsSourceVal = getField(m, 'news_source', 'newssource', 'source');

      const hasFeedContent = (newsTitleVal || newsSummaryVal || rawVideoUrl || albumNameVal || interviewIdVal || '').length > 0;
      if (!hasFeedContent) return;

      const groupKey = albumNameVal || newsTitleVal || m.id || 'feed_item';

      if (!grouped[groupKey]) {
        grouped[groupKey] = {
          groupKey,
          id: m.id,
          interview_id: interviewIdVal,
          source: newsSourceVal,
          time_text: getField(m, 'date'),
          main_title: newsTitleVal || albumNameVal,
          sub_title: getField(m, 'news_subtitle', 'newssubtitle', 'subtitle'),
          summary: newsSummaryVal,
          videos: [],
          credits: getField(m, 'credits', 'credit'),
          main_images: [],
          layout_images: []
        };
      }

      if (interviewIdVal && !grouped[groupKey].interview_id) grouped[groupKey].interview_id = interviewIdVal;
      if (newsSourceVal && !grouped[groupKey].source) grouped[groupKey].source = newsSourceVal;
      if (getField(m, 'news_subtitle') && !grouped[groupKey].sub_title) grouped[groupKey].sub_title = getField(m, 'news_subtitle');
      if (newsSummaryVal && !grouped[groupKey].summary) grouped[groupKey].summary = newsSummaryVal;
      if (getField(m, 'credits') && !grouped[groupKey].credits) grouped[groupKey].credits = getField(m, 'credits');

      if (rawVideoUrl) {
        const urlList = rawVideoUrl.split(/;|\n/).map(s => s.trim()).filter(Boolean);
        const captionList = (rawVideoCaption || '').split(/;|\n/).map(s => s.trim());

        urlList.forEach((url, uIdx) => {
          if (!grouped[groupKey].videos.some(v => v.url === url)) {
            grouped[groupKey].videos.push({
              url: url,
              caption: captionList[uIdx] || ''
            });
          }
        });
      }

      const raw = getField(m, 'images', 'image');
      const imgs = raw.split(/[\s,]+/).map(u => u.trim()).filter(u => u.startsWith('http'));

      const isLayout = getField(m, 'sub_type', 'subtype').toLowerCase() === 'layout';
      if (isLayout) {
        grouped[groupKey].layout_images.push(...imgs);
      } else {
        grouped[groupKey].main_images.push(...imgs);
      }
    });

    return Object.values(grouped).map(item => {
      const uniqueMain = [];
      item.main_images.forEach(u => {
        if (!uniqueMain.includes(u)) uniqueMain.push(u);
      });

      const uniqueLayout = [];
      item.layout_images.forEach(u => {
        if (!uniqueLayout.includes(u)) uniqueLayout.push(u);
      });

      return {
        ...item,
        hero_image: uniqueMain[0] || uniqueLayout[0] || null,
        remaining_images: uniqueMain.slice(1),
        layout_images: uniqueLayout
      };
    });
  }, [masterMedia]);

  // 訪談分組
  const interviewGroups = React.useMemo(() => {
    const groups = {};
    interviewData.forEach((row, rowIdx) => {
      const idKey = getField(row, 'interview_id', 'interviewid', 'interview_key', 'id', 'col_0');
      if (!idKey) return;

      const content = getField(row, 'content', 'text', 'dialogue', 'answer', 'col_5', 'col_2');
      const speaker = getField(row, 'speaker', 'role', 'name', 'col_4', 'col_1') || 'Q';

      if (!groups[idKey]) groups[idKey] = [];
      groups[idKey].push({
        rowIdx,
        idKey,
        speaker,
        content
      });
    });
    return groups;
  }, [interviewData]);

  const currentInterviewDialogue = React.useMemo(() => {
    if (!selectedFeedItem?.interview_id) return [];
    const targetKey = selectedFeedItem.interview_id.trim();

    if (interviewGroups[targetKey]) return interviewGroups[targetKey];

    const matchedKey = Object.keys(interviewGroups).find(
      k => k.toLowerCase() === targetKey.toLowerCase()
    );
    return matchedKey ? interviewGroups[matchedKey] : [];
  }, [selectedFeedItem, interviewGroups]);

  const activeAlbumDetail = React.useMemo(() => {
    if (!selectedAlbumName) return null;
    return albumList.find(a => a.title === selectedAlbumName) || null;
  }, [selectedAlbumName, albumList]);

  return (
    <div className="flex h-[100dvh] w-screen bg-slate-900 justify-center items-center select-none overflow-hidden sm:p-3">
      {/* 鈴聲與音檔 */}
      <audio ref={ringAudioRef} src="/audio/telepathy 2025.mp3" loop preload="auto" />
      <audio ref={phoneCallAudioRef} src="/audio/phone_call.mp3" onEnded={handleEndCall} preload="auto" />

      {/* 主聊天容器 */}
      <div className="w-full sm:max-w-[420px] h-[100dvh] sm:h-[92vh] sm:max-h-[880px] bg-[#ECEEF1] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden relative border-0 sm:border sm:border-slate-700">
        
        {/* 全螢幕來電介面 */}
        {callStatus !== 'idle' && (
          <div className="absolute inset-0 bg-slate-950/95 z-50 flex flex-col justify-between items-center py-16 px-6 text-white backdrop-blur-md animate-fade-in">
            <div className="flex flex-col items-center mt-10 space-y-4">
              <div className="w-40 h-40 rounded-full overflow-hidden ring-4 ring-[#81D4D2]/40 shadow-2xl animate-pulse">
                <img src="https://images.plurk.com/6PooPJr1YbOhrMp5CCFdbl.jpg" alt="avatar" className="w-full h-full object-cover" />
              </div>
              <span className="text-2xl font-semibold tracking-wider">Soo</span>
              {callStatus === 'ringing' ? (
                <span className="text-xs text-slate-400 font-light tracking-wide">
                  {callType === 'video' ? '視訊來電...' : '語音來電...'}
                </span>
              ) : (
                <span className="text-sm text-[#81D4D2] font-mono tracking-wider">{formatSeconds(callDuration)}</span>
              )}
            </div>

            {callStatus === 'ringing' ? (
              <div className="w-full flex justify-around items-center px-6 mb-8">
                <button onClick={handleEndCall} className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 active:scale-95 transition flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 fill-white rotate-[135deg]" viewBox="0 0 24 24"><path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24 11.72 11.72 0 003.68.59 1 1 0 011 1v3.5a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.48.59 3.68a1 1 0 01-.24 1.02l-2.23 2.09z" /></svg>
                </button>
                <button onClick={handleAcceptCall} className="w-16 h-16 rounded-full bg-[#5FBDB9] hover:bg-[#52ada9] active:scale-95 transition flex items-center justify-center shadow-lg animate-bounce">
                  <svg className="w-7 h-7 fill-white" viewBox="0 0 24 24"><path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24 11.72 11.72 0 003.68.59 1 1 0 011 1v3.5a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.48.59 3.68a1 1 0 01-.24 1.02l-2.23 2.09z" /></svg>
                </button>
              </div>
            ) : (
              <div className="w-full flex justify-center items-center mb-8">
                <button onClick={handleEndCall} className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 active:scale-95 transition flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 fill-white rotate-[135deg]" viewBox="0 0 24 24"><path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24 11.72 11.72 0 003.68.59 1 1 0 011 1v3.5a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.48.59 3.68a1 1 0 01-.24 1.02l-2.23 2.09z" /></svg>
                </button>
              </div>
            )}
          </div>
        )}

        {/* 全螢幕視訊通話 */}
        {isVideoCalling && (
          <div className="absolute inset-0 bg-black z-50 flex flex-col justify-between items-center py-12 px-6 text-white animate-fade-in">
            <div className="absolute inset-0 z-0 overflow-hidden">
              <video
                ref={videoPlayerRef}
                src="/video/video_call.mp4"
                playsInline
                autoPlay
                preload="auto"
                onEnded={() => {
                  setIsVideoCalling(false);
                  addCallRecord(`視訊通話 ${formatSeconds(videoDuration)}`, 'user', formatSeconds(videoDuration));
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
                  addCallRecord(`視訊通話 ${formatSeconds(videoDuration)}`, 'user', formatSeconds(videoDuration));
                }}
                className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 active:scale-95 transition flex items-center justify-center shadow-2xl"
              >
                <svg className="w-7 h-7 fill-white rotate-[135deg]" viewBox="0 0 24 24"><path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24 11.72 11.72 0 003.68.59 1 1 0 011 1v3.5a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.48.59 3.68a1 1 0 01-.24 1.02l-2.23 2.09z" /></svg>
              </button>
            </div>
          </div>
        )}

        {/* 頂部導航列 (聊天主頁) */}
        <div className="pt-12 pb-5 bg-[#4E727A] text-white flex items-center justify-between px-5 z-20 shrink-0 shadow-md border-b border-[#3D5C63]">
          <div className="flex items-center space-x-3.5">
            <div className="w-14 h-14 rounded-full bg-slate-800/30 overflow-hidden ring-2 ring-white/30 shadow-md shrink-0">
              <img src="https://images.plurk.com/6PooPJr1YbOhrMp5CCFdbl.jpg" alt="avatar" className="w-full h-full object-cover" />
            </div>
            <div className="flex items-center">
              <span className="font-bold text-lg text-white tracking-wide">Soo</span>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={handleClearMessages}
              className="bg-black/25 hover:bg-black/35 active:scale-95 text-white/95 text-[11.5px] px-3 py-1.5 rounded-full transition flex items-center space-x-1.5 border border-white/15"
            >
              <span>清空</span>
              <span className="bg-[#81D4D2] text-[#0F3332] font-bold text-[10.5px] px-1.5 py-0.2 rounded-full font-mono">
                {messages.length}
              </span>
            </button>

            <button 
              onClick={handleUserOutgoingCall} 
              className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 flex items-center justify-center transition shadow-sm"
            >
              <svg className="w-4.5 h-4.5 fill-white" viewBox="0 0 24 24"><path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24 11.72 11.72 0 003.68.59 1 1 0 011 1v3.5a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.48.59 3.68a1 1 0 01-.24 1.02l-2.23 2.09z" /></svg>
            </button>
            <button 
              onClick={handleUserOutgoingVideo} 
              className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 flex items-center justify-center transition shadow-sm"
            >
              <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" /></svg>
            </button>
          </div>
        </div>

        {/* 對話區（無置中文字） */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-3.5 scroll-smooth">
          {messages.length > 0 && (
            <div className="text-center my-1">
              <span className="bg-slate-300/60 text-slate-600 text-[10px] px-2.5 py-0.5 rounded-full font-medium">今天</span>
            </div>
          )}

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
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      msg.durationText ? 'bg-teal-50 text-[#4E727A]' : 'bg-rose-50 text-rose-500'
                    }`}>
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24 11.72 11.72 0 003.68.59 1 1 0 011 1v3.5a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.48.59 3.68a1 1 0 01-.24 1.02l-2.23 2.09z" />
                      </svg>
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-xs font-medium ${msg.durationText ? 'text-slate-800' : 'text-rose-600'}`}>
                        {msg.statusText}
                      </span>
                      <span className="text-[9px] text-slate-400">
                        {msg.durationText ? '通話已結束' : '點擊回撥'}
                      </span>
                    </div>
                  </div>
                ) : msg.type === 'audio' ? (
                  <div className="flex flex-col space-y-1">
                    <AudioBubble audioSrc={msg.audioSrc} />
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
                    {msg.replyTo && (
                      <div className="mb-1.5 px-2 py-1 bg-slate-100/90 rounded-md border-l-2 border-[#5FBDB9] text-[11px] text-slate-500 line-clamp-1">
                        回覆: {msg.replyTo}
                      </div>
                    )}
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
          <button 
            onClick={() => triggerIncomingCall('audio', 'normal')} 
            className="text-[12px] whitespace-nowrap bg-teal-50 hover:bg-teal-100 text-teal-800 font-semibold px-3 py-1.5 rounded-full shadow-sm border border-teal-300/80 transition shrink-0 active:scale-95"
          >
            📞
          </button>
          <button 
            onClick={triggerManualText} 
            className="text-[12px] whitespace-nowrap bg-teal-50 hover:bg-teal-100 text-teal-800 font-semibold px-3 py-1.5 rounded-full shadow-sm border border-teal-300/80 transition shrink-0 active:scale-95"
          >
            💬
          </button>
          <button 
            onClick={triggerManualVoice} 
            className="text-[12px] whitespace-nowrap bg-teal-50 hover:bg-teal-100 text-teal-800 font-semibold px-3 py-1.5 rounded-full shadow-sm border border-teal-300/80 transition shrink-0 active:scale-95"
          >
            📼
          </button>

          <div className="w-[1px] h-6 bg-slate-300/80 my-auto shrink-0" />

          <button onClick={() => triggerCategoryRandom('gym')} className="text-[12px] whitespace-nowrap bg-white hover:bg-slate-50 text-slate-800 font-medium px-3 py-1.5 rounded-full shadow-sm border border-slate-200 transition shrink-0 active:scale-95">
            🏋️
          </button>
          <button onClick={() => triggerCategoryRandom('car')} className="text-[12px] whitespace-nowrap bg-white hover:bg-slate-50 text-slate-800 font-medium px-3 py-1.5 rounded-full shadow-sm border border-slate-200 transition shrink-0 active:scale-95">
            🚘
          </button>
          <button onClick={() => triggerCategoryRandom('selfie')} className="text-[12px] whitespace-nowrap bg-white hover:bg-slate-50 text-slate-800 font-medium px-3 py-1.5 rounded-full shadow-sm border border-slate-200 transition shrink-0 active:scale-95">
            📷
          </button>
          <button onClick={() => triggerCategoryRandom('gd')} className="text-[12px] whitespace-nowrap bg-white hover:bg-slate-50 text-slate-800 font-medium px-3 py-1.5 rounded-full shadow-sm border border-slate-200 transition shrink-0 active:scale-95">
            🐲
          </button>
          <button onClick={() => triggerCategoryRandom('outing')} className="text-[12px] whitespace-nowrap bg-white hover:bg-slate-50 text-slate-800 font-medium px-3 py-1.5 rounded-full shadow-sm border border-slate-200 transition shrink-0 active:scale-95">
            🎡
          </button>
          <button onClick={() => triggerCategoryRandom('magazine')} className="text-[12px] whitespace-nowrap bg-white hover:bg-slate-50 text-slate-800 font-medium px-3 py-1.5 rounded-full shadow-sm border border-slate-200 transition shrink-0 active:scale-95">
            🐈‍⬛
          </button>
          <button onClick={() => triggerCategoryRandom('official')} className="text-[12px] whitespace-nowrap bg-white hover:bg-slate-50 text-slate-800 font-medium px-3 py-1.5 rounded-full shadow-sm border border-slate-200 transition shrink-0 active:scale-95">
            ✨
          </button>
        </div>

        {/* ＋號選單 */}
        {isPlusMenuOpen && (
          <div className="bg-[#4E727A]/95 backdrop-blur-md px-6 py-4 flex justify-around items-center border-t border-[#3D5C63] z-20 animate-fade-in shadow-xl">
            <button 
              onClick={() => { setActiveModal('album'); setSelectedAlbumName(null); setIsPlusMenuOpen(false); }} 
              className="w-13 h-13 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-90 flex items-center justify-center transition border border-white/10 shadow-sm"
            >
              <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
              </svg>
            </button>

            <button 
              onClick={() => { setActiveModal('calendar'); setIsPlusMenuOpen(false); }} 
              className="w-13 h-13 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-90 flex items-center justify-center transition border border-white/10 shadow-sm"
            >
              <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
                <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zm-7 5h5v5h-5z"/>
              </svg>
            </button>

            <button 
              onClick={() => { setActiveModal('feed'); setIsPlusMenuOpen(false); }} 
              className="w-13 h-13 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-90 flex items-center justify-center transition border border-white/10 shadow-sm"
            >
              <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
              </svg>
            </button>

            <button 
              onClick={() => { setActiveModal('voices'); setIsPlusMenuOpen(false); }} 
              className="w-13 h-13 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-90 flex items-center justify-center transition border border-white/10 shadow-sm"
            >
              <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
                <path d="M19 4H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-1 12H6c-.55 0-1-.45-1-1V9c0-.55.45-1 1-1h12c.55 0 1 .45 1 1v6c0 .55-.45 1-1 1zM7.5 11c-.83 0-1.5.67-1.5 1.5S6.67 14 7.5 14s1.5-.67 1.5-1.5S8.33 11 7.5 11zm9 0c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z"/>
              </svg>
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
            placeholder=""
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

        {/* 彈出視窗 1️⃣：Albums (無按鈕，純滑動返回) */}
        {activeModal === 'album' && (
          <div 
            className="absolute inset-0 bg-[#0B1120] z-50 flex flex-col text-white backdrop-blur-md animate-fade-in"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {selectedAlbumName && activeAlbumDetail ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="pt-12 pb-5 px-5 bg-[#4E727A] flex items-center justify-center border-b border-[#3D5C63] shadow-md shrink-0">
                  <span className="font-bold text-lg text-white truncate max-w-[280px]">
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
                <div className="pt-12 pb-5 px-5 bg-[#4E727A] flex items-center justify-center border-b border-[#3D5C63] shadow-md shrink-0">
                  <div className="flex flex-col items-center">
                    <span className="font-bold text-lg tracking-wide text-white">Albums</span>
                    <span className="text-[11px] text-teal-100/75 mt-0.5 font-mono">共 {albumList.length} 本企劃畫報</span>
                  </div>
                </div>

                <div className="flex-1 flex overflow-x-auto snap-x snap-mandatory scrollbar-none p-4 items-center">
                  {albumPages.length > 0 ? (
                    albumPages.map((pageGroup, pIdx) => (
                      <div 
                        key={pIdx} 
                        className="w-full shrink-0 snap-center grid grid-cols-2 gap-4 px-1"
                      >
                        {pageGroup.map((alb) => (
                          <div
                            key={alb.title}
                            onClick={() => setSelectedAlbumName(alb.title)}
                            className="flex flex-col cursor-pointer group active:scale-[0.97] transition"
                          >
                            <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-slate-800 shadow-md border border-white/10 relative group-hover:border-[#81D4D2]/60 transition">
                              {alb.cover ? (
                                <img 
                                  src={alb.cover} 
                                  alt={alb.title} 
                                  loading="lazy" 
                                  className="w-full h-full object-cover object-[center_20%]" 
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs font-mono">
                                  NO COVER
                                </div>
                              )}
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
                    ))
                  ) : (
                    <div className="w-full text-center text-slate-500 text-xs py-12">
                      目前尚無相簿資料。
                    </div>
                  )}
                </div>

                {albumPages.length > 1 && (
                  <div className="pb-4 flex justify-center space-x-1.5">
                    {albumPages.map((_, dotIdx) => (
                      <span key={dotIdx} className="w-1.5 h-1.5 rounded-full bg-white/20"></span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 彈出視窗 2️⃣：Calendar (只列出當月行程，純滑動返回) */}
        {activeModal === 'calendar' && (
          <div 
            className="absolute inset-0 bg-slate-950/95 z-50 flex flex-col text-white backdrop-blur-md animate-fade-in"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div className="pt-12 pb-5 px-5 bg-[#4E727A] flex items-center justify-center shadow-md border-b border-[#3D5C63] shrink-0">
              <span className="font-bold text-lg tracking-wide text-white">Calendar</span>
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
                    const matchedEvents = currentMonthEvents.filter(ev => {
                      if (!ev.date) return false;
                      const parts = ev.date.replace(/[^\d]/g, ' ').trim().split(/\s+/);
                      return parts.length >= 3 && parseInt(parts[2], 10) === dayNum;
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

              {/* 只列出當月重點行程 */}
              <div className="bg-white/5 rounded-2xl p-4 space-y-2 border border-white/10 mt-4 max-h-52 overflow-y-auto">
                <span className="text-xs font-semibold text-[#81D4D2] tracking-wider block">11 月重點行程</span>
                {currentMonthEvents.length > 0 ? (
                  currentMonthEvents.map((ev, idx) => (
                    <div key={idx} className="flex items-start space-x-2 text-[11.5px] text-slate-300">
                      <span className="text-teal-400 font-mono shrink-0">•</span>
                      <span>
                        <strong className="text-white font-mono mr-1">{ev.date}</strong>
                        {ev.title} {ev.status ? `(${ev.status})` : ''}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-[11px] text-slate-500">本月尚無排定行程。</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 彈出視窗 3️⃣：FEED (純滑動返回) */}
        {activeModal === 'feed' && (
          <div 
            className="absolute inset-0 bg-[#0B1120] z-50 flex flex-col text-slate-100 backdrop-blur-md animate-fade-in"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {selectedFeedItem ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="pt-12 pb-5 px-5 bg-[#4E727A] flex items-center justify-center border-b border-[#3D5C63] shadow-md shrink-0">
                  <span className="font-bold text-lg text-white truncate max-w-[280px]">
                    {selectedFeedItem.main_title}
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-5">
                  <div className="space-y-1">
                    <h2 className="text-xl font-bold text-white tracking-tight leading-snug">
                      {selectedFeedItem.main_title}
                    </h2>
                    {selectedFeedItem.sub_title && (
                      <h4 className="text-[13px] font-medium text-[#81D4D2]">
                        {selectedFeedItem.sub_title}
                      </h4>
                    )}
                    <div className="flex items-center space-x-1.5 text-[11px] font-mono text-slate-400 pt-0.5">
                      {selectedFeedItem.source && (
                        <>
                          <span className="text-slate-300">by {selectedFeedItem.source}</span>
                          {selectedFeedItem.time_text && <span>•</span>}
                        </>
                      )}
                      {selectedFeedItem.time_text && (
                        <span>{selectedFeedItem.time_text}</span>
                      )}
                    </div>
                  </div>

                  {selectedFeedItem.hero_image && (
                    <div className="rounded-2xl overflow-hidden bg-slate-800 shadow-xl border border-white/5">
                      <img 
                        src={selectedFeedItem.hero_image} 
                        alt="Hero" 
                        className="w-full h-auto object-cover" 
                      />
                    </div>
                  )}

                  {selectedFeedItem.videos && selectedFeedItem.videos.length > 0 && (
                    <div className="space-y-4">
                      {selectedFeedItem.videos.map((vid, vIdx) => {
                        const videoInfo = formatVideoSource(vid.url);
                        if (videoInfo.type === 'none') return null;

                        return (
                          <div key={vIdx} className="space-y-2">
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

                            {vid.caption && (
                              <p className="text-[11.5px] text-slate-400 font-light text-center leading-relaxed px-4 whitespace-pre-wrap">
                                {vid.caption}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {selectedFeedItem.summary && (
                    <div className="bg-slate-800/40 p-4 rounded-2xl border border-white/5 text-[13px] leading-relaxed text-slate-300 font-light whitespace-pre-wrap">
                      {selectedFeedItem.summary}
                    </div>
                  )}

                  {selectedFeedItem.layout_images && selectedFeedItem.layout_images.length > 0 && (
                    <div className="space-y-3">
                      {selectedFeedItem.layout_images.map((layoutImg, lIdx) => (
                        <div key={lIdx} className="rounded-2xl overflow-hidden bg-slate-900 shadow-lg border border-white/10">
                          <img src={layoutImg} alt={`Layout ${lIdx + 1}`} loading="lazy" className="w-full h-auto object-cover" />
                        </div>
                      ))}
                    </div>
                  )}

                  {currentInterviewDialogue.length > 0 && (
                    <div className="space-y-3.5 pt-4 border-t border-white/10">
                      {currentInterviewDialogue.map((row, idx) => {
                        const speakerRaw = (row.speaker || '').trim().toLowerCase();
                        const isEditorial = speakerRaw === 'editorial';
                        const isSoo = speakerRaw === 'soo' || speakerRaw.includes('lee');
                        const contentText = row.content || '';

                        if (!contentText) return null;

                        if (isEditorial) {
                          return (
                            <div key={idx} className="my-6 px-4 text-center">
                              <p className="text-[12.5px] leading-relaxed text-slate-300 font-normal tracking-wide whitespace-pre-wrap">
                                {contentText}
                              </p>
                              <div className="w-8 h-[1px] bg-white/20 mx-auto mt-3"></div>
                            </div>
                          );
                        }

                        return (
                          <div 
                            key={idx} 
                            className={`w-full flex ${isSoo ? 'justify-end items-start' : 'justify-start items-start'} space-x-2`}
                          >
                            {!isSoo && (
                              <div className="w-7 h-7 rounded-full bg-slate-700/90 flex items-center justify-center text-[11px] font-semibold text-slate-200 shrink-0 mt-0.5 border border-slate-600 shadow-sm">
                                Q
                              </div>
                            )}

                            <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-[12.5px] leading-relaxed shadow-sm bg-white/10 text-slate-100 border border-white/10 ${
                              isSoo ? 'rounded-tr-none' : 'rounded-tl-none'
                            }`}>
                              <p className="whitespace-pre-wrap">{contentText}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {selectedFeedItem.remaining_images && selectedFeedItem.remaining_images.length > 0 && (
                    <div className="space-y-3 pt-2">
                      {selectedFeedItem.remaining_images.map((imgUrl, rIdx) => (
                        <div key={rIdx} className="rounded-2xl overflow-hidden bg-slate-900 shadow-lg border border-white/10">
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

                  {selectedFeedItem.credits && (
                    <div className="bg-black/50 p-4 rounded-2xl border border-white/10 text-[10.5px] text-slate-400 leading-relaxed font-mono mt-6">
                      <span className="text-[#81D4D2] font-semibold block mb-1">CREDITS</span>
                      <p className="whitespace-pre-wrap">{selectedFeedItem.credits}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="pt-12 pb-5 px-5 bg-[#4E727A] flex items-center justify-center border-b border-[#3D5C63] shadow-md shrink-0">
                  <span className="font-bold text-lg tracking-wide text-white">FEED</span>
                </div>

                <div 
                  ref={feedListScrollRef}
                  className="flex-1 overflow-y-auto p-3"
                >
                  {feedItems.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2.5">
                      {feedItems.map((item, idx) => (
                        <article 
                          key={idx} 
                          onClick={() => handleOpenFeedDetail(item)}
                          className="bg-[#1E293B]/75 rounded-2xl border border-slate-700/60 p-2.5 flex flex-col justify-between space-y-2 shadow-sm hover:border-[#81D4D2]/60 hover:bg-[#1E293B] cursor-pointer transition active:scale-[0.97]"
                        >
                          <div>
                            <div className="flex items-center justify-between text-[10px] mb-1.5">
                              <span className="font-bold text-xs text-[#81D4D2] tracking-wide truncate max-w-[55%]">
                                {item.source || 'FEED'}
                              </span>
                              <span className="text-slate-400 font-mono text-[9.5px]">
                                {item.time_text}
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

                          <div className="pt-1.5 flex items-center justify-end text-[10.5px] text-[#81D4D2] font-medium border-t border-white/5">
                            <span>繼續閱讀 ➔</span>
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-500 text-xs">
                      目前尚無動態資料。
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 彈出視窗 4️⃣：Files (原聲音訊庫，標題寫Files，名稱只抓trigger_content，純滑動返回) */}
        {activeModal === 'voices' && (
          <div 
            className="absolute inset-0 bg-slate-950/95 z-50 flex flex-col text-white backdrop-blur-md animate-fade-in"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div className="pt-12 pb-5 px-5 bg-[#4E727A] flex items-center justify-center shadow-md border-b border-[#3D5C63]">
              <span className="font-bold text-lg tracking-wide text-white">Files</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {dynamicVoiceList.map((item) => (
                <div key={item.id} className="bg-slate-900/80 p-3.5 rounded-2xl border border-white/5 flex items-center justify-between">
                  <span className="text-[13px] font-medium text-slate-200 truncate max-w-[65%]">
                    {item.title}
                  </span>
                  <AudioBubble audioSrc={item.src} />
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
