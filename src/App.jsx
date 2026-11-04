import React, { useState, useEffect, useRef } from 'react';

// Google 試算表設定 (綁定 Soo_Master_Database)
const SPREADSHEET_ID = '11P8tG-MhZiwrBcGf9TyFirQNwPxKC2YPVbv4XHMEV-A';

// 通用 Google Visualization JSON 讀取解析器 (鎖定 headers=1 防跨行吞噬)
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
      const cleanLabel = (col.label || '').trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
      return cleanLabel || `col_${idx}`;
    });

    return table.rows.map(r => {
      const entry = {};
      colKeys.forEach((key, idx) => {
        const cell = r.c && r.c[idx];
        const val = cell ? (cell.v ?? cell.f) : null;
        entry[key] = val !== null && val !== undefined ? String(val).trim() : '';
      });
      return entry;
    });
  } catch (err) {
    console.error(`讀取試算表 [${sheetName}] 失敗:`, err);
    return [];
  }
};

// 日期格式化：2026-10-12 或 2026/10/12 -> 2026, 10, 12
const formatDateClean = (rawDate) => {
  if (!rawDate) return '';
  const parts = rawDate.replace(/[^\d]/g, ' ').trim().split(/\s+/);
  if (parts.length >= 3) {
    return `${parts[0]}, ${parts[1]}, ${parts[2]}`;
  }
  return rawDate;
};

// YouTube 嵌入網址轉換工具
const getYouTubeEmbedUrl = (rawUrl) => {
  if (!rawUrl) return null;
  const match = rawUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:shorts\/|embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (!match) return null;
  const videoId = match[1];
  return `https://www.youtube.com/embed/${videoId}?autoplay=0&controls=1&playsinline=1&modestbranding=1`;
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

// 原始語音檔列表
const RAW_AUDIO_FILES = [
  '1_get up_cozy.mp3',
  '2_plz_get_up.mp3',
  '3_can_u_get_up.mp3',
  '4_time_to_get_up_now.mp3',
  '5_get_up_yell.mp3',
  'Can_u_b_my_gf.mp3',
  'Do_u_like_it.mp3',
  'eat.mp3',
  'How_is_it_Do_u_like_it.mp3',
  'How_is_it.mp3',
  "Let's_get_engaged.mp3",
  'i_miss_u.mp3',
  'i_miss_u_longer.mp3',
  'shall_i_go_now.mp3',
  'lets_date.mp3',
  'love_u.mp3',
  'good_night_normal.mp3'
];

const RAW_VOICE_LIST = RAW_AUDIO_FILES.map((filename, idx) => ({
  id: `v_${idx}`,
  title: filename.replace(/\.(mp3|wav|m4a)$/i, '').replace(/_/g, ' '),
  src: `/audio/${filename}`,
  duration: '0:04'
}));

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
  const [activeAlbumTab, setActiveAlbumTab] = useState('all');
  
  // FEED 詳情頁狀態
  const [selectedFeedItem, setSelectedFeedItem] = useState(null);

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
        sendVoiceMessage({ src: finalAudio, duration: '0:03' });
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

  // 來電觸發 (8 秒)
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

  // 晨喚階梯排程
  useEffect(() => {
    const checkWakeupSchedule = () => {
      const todayStr = getTodayDateStr();
      if (awokenDate === todayStr) return;

      const now = new Date();
      const currentVal = now.getHours() * 60 + now.getMinutes();

      const storageKey = `soo_wakeup_done_${todayStr}`;
      const triggeredSteps = JSON.parse(localStorage.getItem(storageKey) || '[]');

      let stepToRun = null;
      let voiceToPlay = null;

      if (currentVal >= 510 && currentVal < 570 && !triggeredSteps.includes('s1')) {
        stepToRun = 's1';
        voiceToPlay = { src: '/audio/1_get up_cozy.mp3', duration: '0:03' };
      } else if (currentVal >= 570 && currentVal < 630 && !triggeredSteps.includes('s2')) {
        stepToRun = 's2';
        voiceToPlay = { src: '/audio/2_plz_get_up.mp3', duration: '0:04' };
      } else if (currentVal >= 630 && currentVal < 690 && !triggeredSteps.includes('s3')) {
        stepToRun = 's3';
        voiceToPlay = { src: '/audio/4_time_to_get_up_now.mp3', duration: '0:03' };
      } else if (currentVal >= 690 && !triggeredSteps.includes(`s4_${Math.floor(currentVal / 30)}`)) {
        stepToRun = `s4_${Math.floor(currentVal / 30)}`;
        voiceToPlay = { src: '/audio/5_get_up_yell.mp3', duration: '0:04' };
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

  const handleClearMessages = () => {
    if (window.confirm(`目前共有 ${messages.length} 則訊息，確定要清空所有紀錄嗎？`)) {
      setMessages([{ id: Date.now(), role: 'assistant', type: 'text', content: '今天有好好吃飯嗎？', time: getCurrentTime() }]);
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

  // Master Media 分流：相簿
  const albumGroups = React.useMemo(() => {
    const groups = {};
    masterMedia.forEach(m => {
      const albumKey = m.album_name ? m.album_name.trim() : '未分類歸檔';
      if (!groups[albumKey]) groups[albumKey] = [];
      const raw = (m.images || '').trim();
      const imgs = raw.split(/[\s,]+/).filter(u => u.startsWith('http'));
      groups[albumKey].push(...imgs);
    });
    return groups;
  }, [masterMedia]);

  // Master Media 分流：行事曆
  const eventItems = React.useMemo(() => {
    return masterMedia.filter(m => (m.date || '').trim().length > 0).map(m => ({
      date: m.date,
      end_date: m.end_date || m.date,
      title: m.album_name || m.caption || '行程',
      status: m.sub_type || ''
    }));
  }, [masterMedia]);

  // Master Media 分流：FEED (同 album_name 多列自動合併整合引擎)
  const feedItems = React.useMemo(() => {
    // 依據 album_name 進行群組聚合
    const grouped = {};

    masterMedia.forEach(m => {
      // 判斷是否屬於 FEED (有 news_title, news_summary, 或 interview_id)
      const hasFeedContent = (m.news_title || m.news_summary || m.interview_id || '').trim().length > 0;
      if (!hasFeedContent) return;

      const groupKey = (m.album_name || m.news_title || m.id).trim();

      if (!grouped[groupKey]) {
        grouped[groupKey] = {
          groupKey,
          id: m.id,
          interview_id: (m.interview_id || '').trim(),
          time_text: formatDateClean(m.date),
          main_title: m.news_title || m.album_name,
          sub_title: m.news_subtitle || '',
          summary: m.news_summary || '',
          video_url: m.video_url || '',
          main_images: [],
          layout_images: []
        };
      }

      // 如果其他列有補齊 interview_id 或 news_subtitle，同步覆蓋更新
      if (m.interview_id && !grouped[groupKey].interview_id) grouped[groupKey].interview_id = m.interview_id.trim();
      if (m.news_subtitle && !grouped[groupKey].sub_title) grouped[groupKey].sub_title = m.news_subtitle.trim();
      if (m.news_summary && !grouped[groupKey].summary) grouped[groupKey].summary = m.news_summary.trim();
      if (m.video_url && !grouped[groupKey].video_url) grouped[groupKey].video_url = m.video_url.trim();

      // 解析該列圖片
      const raw = (m.images || '').trim();
      const imgs = raw.split(/[\s,]+/).filter(u => u.startsWith('http'));

      const isLayout = (m.sub_type || '').toLowerCase().trim() === 'layout';
      if (isLayout) {
        grouped[groupKey].layout_images.push(...imgs);
      } else {
        grouped[groupKey].main_images.push(...imgs);
      }
    });

    return Object.values(grouped).map(item => {
      // 去重
      const allMainImgs = Array.from(new Set(item.main_images));
      const allLayoutImgs = Array.from(new Set(item.layout_images));

      return {
        ...item,
        hero_image: allMainImgs[0] || allLayoutImgs[0] || null,
        remaining_images: allMainImgs.slice(1),
        layout_images: allLayoutImgs
      };
    });
  }, [masterMedia]);

  // 訪談分組（依 interview_id 完全獨立分組）
  const interviewGroups = React.useMemo(() => {
    const groups = {};
    interviewData.forEach(row => {
      const idKey = (row.interview_id || '').trim();
      if (!idKey) return;
      if (!groups[idKey]) groups[idKey] = [];
      groups[idKey].push(row);
    });
    return groups;
  }, [interviewData]);

  // 當前選中項目的訪談紀錄（比對 interview_id）
  const currentInterviewDialogue = selectedFeedItem?.interview_id 
    ? (interviewGroups[selectedFeedItem.interview_id] || []) 
    : [];

  return (
    <div className="flex h-[100dvh] w-screen bg-slate-900 justify-center items-center select-none overflow-hidden sm:p-3">
      {/* 鈴聲與音檔 */}
      <audio ref={ringAudioRef} src="/audio/telepathy 2025.mp3" loop preload="auto" />
      <audio ref={phoneCallAudioRef} src="/audio/phone_call.mp3" onEnded={handleEndCall} preload="auto" />

      {/* 主聊天容器 */}
      <div className="w-full sm:max-w-[420px] h-[100dvh] sm:h-[92vh] sm:max-h-[880px] bg-[#ECEEF1] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden relative border-0 sm:border sm:border-slate-700">
        
        {/* 全螢幕來電介面 (8秒超時) */}
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
                <button onClick={handleEndCall} title="拒接" className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 active:scale-95 transition flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 fill-white rotate-[135deg]" viewBox="0 0 24 24"><path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24 11.72 11.72 0 003.68.59 1 1 0 011 1v3.5a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.48.59 3.68a1 1 0 01-.24 1.02l-2.23 2.09z" /></svg>
                </button>
                <button onClick={handleAcceptCall} title="接聽" className="w-16 h-16 rounded-full bg-[#5FBDB9] hover:bg-[#52ada9] active:scale-95 transition flex items-center justify-center shadow-lg animate-bounce">
                  <svg className="w-7 h-7 fill-white" viewBox="0 0 24 24"><path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24 11.72 11.72 0 003.68.59 1 1 0 011 1v3.5a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.48.59 3.68a1 1 0 01-.24 1.02l-2.23 2.09z" /></svg>
                </button>
              </div>
            ) : (
              <div className="w-full flex justify-center items-center mb-8">
                <button onClick={handleEndCall} title="掛斷" className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 active:scale-95 transition flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 fill-white rotate-[135deg]" viewBox="0 0 24 24"><path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24 11.72 11.72 0 003.68.59 1 1 0 011 1v3.5a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.48.59 3.68a1 1 0 01-.24 1.02l-2.23 2.09z" /></svg>
                </button>
              </div>
            )}
          </div>
        )}

        {/* 📹 全螢幕視訊通話 */}
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

                {/* 通話記錄：圖示完全一致，未接/取消用紅色呈現 */}
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
          <button onClick={() => triggerCategoryRandom('gym')} title="健身" className="text-[12px] whitespace-nowrap bg-white hover:bg-slate-50 text-slate-800 font-medium px-3 py-1.5 rounded-full shadow-sm border border-slate-200 transition shrink-0 active:scale-95">
            🏋️
          </button>
          <button onClick={() => triggerCategoryRandom('car')} title="車內自拍" className="text-[12px] whitespace-nowrap bg-white hover:bg-slate-50 text-slate-800 font-medium px-3 py-1.5 rounded-full shadow-sm border border-slate-200 transition shrink-0 active:scale-95">
            🚘
          </button>
          <button onClick={() => triggerCategoryRandom('selfie')} title="自拍" className="text-[12px] whitespace-nowrap bg-white hover:bg-slate-50 text-slate-800 font-medium px-3 py-1.5 rounded-full shadow-sm border border-slate-200 transition shrink-0 active:scale-95">
            📷
          </button>
          <button onClick={() => triggerCategoryRandom('gd')} title="志龍同遊" className="text-[12px] whitespace-nowrap bg-white hover:bg-slate-50 text-slate-800 font-medium px-3 py-1.5 rounded-full shadow-sm border border-slate-200 transition shrink-0 active:scale-95">
            🐲
          </button>
          <button onClick={() => triggerCategoryRandom('outing')} title="出門玩" className="text-[12px] whitespace-nowrap bg-white hover:bg-slate-50 text-slate-800 font-medium px-3 py-1.5 rounded-full shadow-sm border border-slate-200 transition shrink-0 active:scale-95">
            🎡
          </button>
          <button onClick={() => triggerCategoryRandom('magazine')} title="雜誌畫報" className="text-[12px] whitespace-nowrap bg-white hover:bg-slate-50 text-slate-800 font-medium px-3 py-1.5 rounded-full shadow-sm border border-slate-200 transition shrink-0 active:scale-95">
            🐈‍⬛
          </button>
          <button onClick={() => triggerCategoryRandom('official')} title="出席活動" className="text-[12px] whitespace-nowrap bg-white hover:bg-slate-50 text-slate-800 font-medium px-3 py-1.5 rounded-full shadow-sm border border-slate-200 transition shrink-0 active:scale-95">
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
            <button onClick={() => { setActiveModal('feed'); setIsPlusMenuOpen(false); }} className="flex flex-col items-center space-y-1 text-white active:scale-90 transition">
              <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center text-lg shadow-sm">📰</div>
              <span className="text-[11px] text-teal-100">FEED</span>
            </button>
            <button onClick={() => { setActiveModal('voices'); setIsPlusMenuOpen(false); }} className="flex flex-col items-center space-y-1 text-white active:scale-90 transition">
              <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center text-lg shadow-sm">📼</div>
              <span className="text-[11px] text-teal-100">語音庫</span>
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
                    const matchedEvents = eventItems.filter(ev => {
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

              <div className="bg-white/5 rounded-2xl p-3.5 space-y-1.5 border border-white/10 mt-4 max-h-48 overflow-y-auto">
                <span className="text-xs font-semibold text-[#81D4D2]">近期重點行程</span>
                {eventItems.length > 0 ? (
                  eventItems.map((ev, idx) => (
                    <p key={idx} className="text-[11px] text-slate-300">
                      {ev.date} {ev.title} {ev.status ? `(${ev.status})` : ''}
                    </p>
                  ))
                ) : (
                  <p className="text-[11px] text-slate-500">暫無行程，請在 media 表格填入 date。</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 彈出視窗 3️⃣：FEED (純粹直排美學，無多餘 tag 與 bar) */}
        {activeModal === 'feed' && (
          <div className="absolute inset-0 bg-[#0B1120] z-50 flex flex-col text-slate-100 backdrop-blur-md animate-fade-in">
            
            {/* 詳情內頁 View */}
            {selectedFeedItem ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="pt-12 pb-3 px-4 bg-[#4E727A] flex items-center justify-between border-b border-[#3D5C63] shadow shrink-0">
                  <button 
                    onClick={() => setSelectedFeedItem(null)}
                    className="flex items-center space-x-1 text-xs text-teal-100 hover:text-white px-2 py-1 rounded bg-white/10"
                  >
                    <span>‹ 返回</span>
                  </button>
                  <span className="text-xs font-medium text-teal-50 truncate max-w-[200px]">
                    {selectedFeedItem.main_title}
                  </span>
                  <button onClick={() => { setSelectedFeedItem(null); setActiveModal(null); }} className="text-xs text-teal-100 hover:text-white px-2 py-1">
                    關閉
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-5">
                  {/* 1. Title, Subtitle, Date */}
                  <div className="space-y-1">
                    <h2 className="text-xl font-bold text-white tracking-tight leading-snug">
                      {selectedFeedItem.main_title}
                    </h2>
                    {selectedFeedItem.sub_title && (
                      <h4 className="text-[13px] font-medium text-[#81D4D2]">
                        {selectedFeedItem.sub_title}
                      </h4>
                    )}
                    {selectedFeedItem.time_text && (
                      <p className="text-[11px] font-mono text-slate-400 pt-0.5">
                        {selectedFeedItem.time_text}
                      </p>
                    )}
                  </div>

                  {/* 2. 第一張圖 (Hero Image) */}
                  {selectedFeedItem.hero_image && (
                    <div className="rounded-2xl overflow-hidden bg-slate-800 shadow-xl border border-white/5">
                      <img 
                        src={selectedFeedItem.hero_image} 
                        alt="Hero" 
                        className="w-full h-auto object-cover" 
                      />
                    </div>
                  )}

                  {/* 3. Summary 摘要內文 */}
                  {selectedFeedItem.summary && (
                    <div className="bg-slate-800/40 p-4 rounded-2xl border border-white/5 text-[13px] leading-relaxed text-slate-300 font-light whitespace-pre-wrap">
                      {selectedFeedItem.summary}
                    </div>
                  )}

                  {/* 4. Video 串接預留區 (YouTube Embed) */}
                  {selectedFeedItem.video_url && getYouTubeEmbedUrl(selectedFeedItem.video_url) && (
                    <div className="rounded-2xl overflow-hidden aspect-video w-full bg-black shadow-lg border border-white/10">
                      <iframe 
                        src={getYouTubeEmbedUrl(selectedFeedItem.video_url)} 
                        title="Video Player"
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}

                  {/* 5. Layout Design 排版圖片區 (sub_type === 'layout') */}
                  {selectedFeedItem.layout_images && selectedFeedItem.layout_images.length > 0 && (
                    <div className="space-y-3">
                      {selectedFeedItem.layout_images.map((layoutImg, lIdx) => (
                        <div key={lIdx} className="rounded-2xl overflow-hidden bg-slate-900 shadow-lg border border-white/10">
                          <img src={layoutImg} alt={`Layout ${lIdx + 1}`} loading="lazy" className="w-full h-auto object-cover" />
                        </div>
                      ))}
                    </div>
                  )}

                 {/* 6. Interview 左右對話泡泡 (含 Editorial 居中側寫) */}
                  {currentInterviewDialogue.length > 0 && (
                    <div className="space-y-3.5 pt-4 border-t border-white/10">
                      {currentInterviewDialogue.map((row, idx) => {
                        const secType = (row.section_type || '').toLowerCase().trim();
                        const isIntro = secType === 'intro';
                        const isCredit = secType === 'credit';
                        const speakerRaw = (row.speaker || '').trim().toLowerCase();
                        const isEditorial = speakerRaw === 'editorial';
                        const isSoo = speakerRaw === 'soo' || speakerRaw.includes('lee');

                        // 置頂引言 Intro
                        if (isIntro) {
                          return (
                            <div key={idx} className="bg-slate-900/90 p-4 rounded-2xl border border-[#81D4D2]/20 text-[12px] leading-relaxed text-slate-300">
                              <span className="text-[#81D4D2] font-mono text-[10px] block mb-1">EDITORIAL INTRO</span>
                              <p className="whitespace-pre-wrap">{row.content}</p>
                            </div>
                          );
                        }

                        // 文末名單 Credit
                        if (isCredit) {
                          return (
                            <div key={idx} className="bg-black/50 p-4 rounded-2xl border border-white/10 text-[10px] text-slate-400 leading-relaxed font-mono mt-4">
                              <span className="text-[#81D4D2] font-semibold block mb-1">CREDITS</span>
                              <p className="whitespace-pre-wrap">{row.content}</p>
                            </div>
                          );
                        }

                        // 🌟 新增：Editorial 編輯旁白／側寫（無氣泡、置中純文字）
                        if (isEditorial) {
                          return (
                            <div key={idx} className="my-5 px-6 text-center">
                              <p className="text-[12px] leading-relaxed text-slate-400 font-serif italic tracking-wide whitespace-pre-wrap">
                                {row.content}
                              </p>
                              <div className="w-8 h-[1px] bg-white/20 mx-auto mt-3"></div>
                            </div>
                          );
                        }

                        // Q (靠左) 與 Soo (靠右) 氣泡
                        return (
                          <div 
                            key={idx} 
                            className={`w-full flex items-end ${isSoo ? 'justify-end' : 'justify-start'} space-x-2`}
                          >
                            {/* 採訪者 Q 靠左 */}
                            {!isSoo && (
                              <div className="w-7 h-7 rounded-full bg-slate-700/80 flex items-center justify-center text-[10px] font-bold text-slate-200 shrink-0 mb-1 border border-slate-600">
                                Q
                              </div>
                            )}

                            <div className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-[12.5px] leading-relaxed shadow-sm ${
                              isSoo 
                                ? 'bg-[#1E293B] text-teal-50 border border-teal-500/40 rounded-tr-none' 
                                : 'bg-white/15 text-slate-100 border border-white/10 rounded-tl-none'
                            }`}>
                              <div className="text-[9px] font-mono text-slate-400 mb-1">
                                {isSoo ? 'Lee Soo-hyuk' : (row.speaker || 'Interviewer')}
                              </div>
                              <p className="whitespace-pre-wrap">{row.content}</p>
                            </div>

                            {/* 洙赫 Soo 頭像靠右 */}
                            {isSoo && (
                              <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 mb-1 ring-1 ring-[#81D4D2]/40">
                                <img src="https://images.plurk.com/6PooPJr1YbOhrMp5CCFdbl.jpg" alt="Soo" className="w-full h-full object-cover" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* 7. 剩下的圖片 (Remaining Images 直排瀑布流，無 bar) */}
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
                </div>
              </div>
            ) : (
              /* FEED 列表 View (無 Tag，純淨日期) */
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="pt-12 pb-3 px-4 bg-[#4E727A] flex items-center justify-between border-b border-[#3D5C63] shadow shrink-0">
                  <div className="flex flex-col">
                    <span className="font-semibold text-base tracking-wide text-white">FEED</span>
                  </div>
                  <button onClick={() => setActiveModal(null)} className="text-xs text-teal-100 hover:text-white px-2.5 py-1 rounded-md bg-white/10">
                    關閉
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {feedItems.length > 0 ? (
                    feedItems.map((item, idx) => (
                      <article 
                        key={idx} 
                        onClick={() => setSelectedFeedItem(item)}
                        className="bg-[#1E293B]/70 rounded-2xl border border-slate-700/50 p-4 space-y-2.5 shadow-sm hover:border-[#81D4D2]/50 hover:bg-[#1E293B] cursor-pointer transition active:scale-[0.98]"
                      >
                        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                          <span>{item.time_text}</span>
                        </div>

                        <div className="space-y-1">
                          <h3 className="text-[14px] font-bold text-white leading-snug tracking-tight">
                            {item.main_title}
                          </h3>
                          {item.sub_title && (
                            <h4 className="text-[12px] font-medium text-[#81D4D2] leading-normal">
                              {item.sub_title}
                            </h4>
                          )}
                        </div>

                        {item.summary && (
                          <p className="text-[11.5px] text-slate-400 leading-relaxed font-light line-clamp-2">
                            {item.summary}
                          </p>
                        )}

                        {item.hero_image && (
                          <div className="rounded-xl overflow-hidden aspect-[16/9] w-full bg-slate-800 shadow-inner mt-2">
                            <img src={item.hero_image} alt="Hero" loading="lazy" className="w-full h-full object-cover" />
                          </div>
                        )}

                        <div className="pt-1 flex items-center justify-end text-[11px] text-[#81D4D2] font-medium">
                          <span>查看詳情 ➔</span>
                        </div>
                      </article>
                    ))
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

        {/* 彈出視窗 4️⃣：語音原聲帶庫 */}
        {activeModal === 'voices' && (
          <div className="absolute inset-0 bg-slate-950/95 z-50 flex flex-col text-white backdrop-blur-md animate-fade-in">
            <div className="pt-12 pb-3 px-4 bg-[#4E727A] flex items-center justify-between shadow border-b border-[#3D5C63]">
              <span className="font-medium text-base tracking-wide">原聲音訊庫 (Audio Files)</span>
              <button onClick={() => setActiveModal(null)} className="text-sm text-teal-100 hover:text-white px-2 py-1">關閉</button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
              {RAW_VOICE_LIST.map((item) => (
                <div key={item.id} className="bg-slate-900/80 p-3 rounded-2xl border border-white/5 flex items-center justify-between">
                  <div className="flex flex-col space-y-0.5 max-w-[55%]">
                    <span className="text-xs font-mono font-medium text-slate-200 truncate">{item.title}</span>
                    <span className="text-[10px] text-slate-500 font-mono">/audio/{item.title}.mp3</span>
                  </div>
                  <AudioBubble audioSrc={item.src} durationText={item.duration} />
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
