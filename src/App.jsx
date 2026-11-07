import React, { useState, useEffect, useRef, useMemo } from 'react';
import AlbumModal from './components/AlbumModal';
import CalendarModal from './components/CalendarModal';
import FeedModal from './components/FeedModal';
import FileModal from './components/FileModal';

const SPREADSHEET_ID = '11P8tG-MhZiwrBcGf9TyFirQNwPxKC2YPVbv4XHMEV-A';

// 通用 GViz 資料讀取器
const fetchSheetData = async (sheetName) => {
  try {
    const url = `https://docs.google.com/spreadsheets/d/SPREADSHEETID/gviz/tq?tqx=out:json&headers=1&sheet={encodeURIComponent(sheetName)}&t=${Date.now()}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const text = await res.text();

    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    if (jsonStart === -1 || jsonEnd === -1) return [];

    const json = JSON.parse(text.substring(jsonStart, jsonEnd + 1));
    const table = json.table;
    if (!table?.rows?.length) return [];

    const colKeys = table.cols.map((col, idx) => {
      const raw = (col.label || '').trim();
      const clean = raw.toLowerCase().replace(/[^a-z0-9_]/g, '');
      return {
        raw,
        clean: clean || `col_${idx}`,
        idx
      };
    });

    return table.rows.map(r => {
      const entry = {};
      colKeys.forEach(({ raw, clean, idx }) => {
        const cell = r.c?.[idx];
        const val = cell?.v != null ? String(cell.v).trim() : (cell?.f != null ? String(cell.f).trim() : '');
        entry[clean] = val;
        if (raw) entry[raw] = val;
        entry[`col_${idx}`] = val;
      });
      return entry;
    });
  } catch (err) {
    console.error(`讀取試算表 [${sheetName}] 失敗:`, err);
    return [];
  }
};

const getField = (obj, ...keys) => {
  if (!obj) return '';
  for (const k of keys) {
    const cleanKey = k.toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (obj[k]?.trim()) return obj[k].trim();
    if (obj[cleanKey]?.trim()) return obj[cleanKey].trim();
  }
  return '';
};

const getYouTubeEmbedUrl = (rawUrl) => {
  if (!rawUrl) return null;
  const match = rawUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:shorts\/|embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=0&controls=1&playsinline=1` : null;
};

const formatVideoSource = (raw) => {
  if (!raw?.trim()) return { type: 'none', url: '' };
  const clean = raw.trim();
  const ytUrl = getYouTubeEmbedUrl(clean);
  if (ytUrl) return { type: 'youtube', url: ytUrl };

  let finalPath = clean;
  if (!finalPath.startsWith('http') && !finalPath.startsWith('/')) {
    finalPath = finalPath.startsWith('video/') ? `/finalPath`:`/video/{finalPath}`;
  }
  return { type: 'direct', url: finalPath };
};

const formatAudioUrl = (raw) => {
  if (!raw?.trim()) return '';
  let clean = raw.trim().replace(/^["']|["']$/g, '');
  if (!clean.endsWith('.mp3') && !clean.endsWith('.wav') && !clean.endsWith('.m4a')) {
    clean += '.mp3';
  }
  if (clean.startsWith('http')) return clean;
  clean = clean.replace(/^\/+/, '');
  return clean.startsWith('audio/') ? `/clean`:`/audio/{clean}`;
};

// 語音氣泡組件
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
      className="flex items-center space-x-3 bg-white px-4 py-2.5 rounded-2xl rounded-tl-none shadow-sm cursor-pointer hover:bg-slate-50 transition w-full max-w-[200px] border border-slate-200/60"
    >
      <audio ref={audioRef} src={audioSrc} onEnded={() => setIsPlaying(false)} preload="auto" />
      <button type="button" className="w-7 h-7 rounded-full bg-[#5FBDB9] text-white flex items-center justify-center shrink-0 shadow-sm">
        {isPlaying ? (
          <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" rx="1.5" /><rect x="14" y="4" width="4" height="16" rx="1.5" /></svg>
        ) : (
          <svg className="w-3 h-3 fill-current ml-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
        )}
      </button>
      <div className="flex-1 flex items-center justify-between space-x-1 h-3 pr-1">
        {[40, 70, 100, 60, 85, 45, 90, 65, 80, 50, 95, 30].map((h, i) => (
          <span key={i} className={`w-[2.5px] rounded-full transition-all duration-200 ${isPlaying ? 'bg-[#5FBDB9] animate-pulse' : 'bg-slate-300'}`} style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  );
};

export default function App() {
  const getCurrentTime = () => {
    const now = new Date();
    return `String(now.getHours()).padStart(2,'0'):{String(now.getMinutes()).padStart(2, '0')}`;
  };

  const getTodayDateStr = () => {
    const now = new Date();
    return `now.getFullYear()-{String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  };

  // 🌟 動態設定檔 State
  const [appSettings, setAppSettings] = useState({
    name: 'Soo',
    avatar: 'https://images.plurk.com/6PooPJr1YbOhrMp5CCFdbl.jpg',
    typeEmojiMap: {}
  });

  const sendNotification = (title, body) => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: appSettings.avatar
        });
      } catch (e) {
        console.log('通知失敗:', e);
      }
    }
  };

  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('soo_chat_messages');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const [masterMedia, setMasterMedia] = useState([]);
  const [dialogueList, setDialogueList] = useState([]);
  const [foodWeights, setFoodWeights] = useState([]);
  const [interviewData, setInterviewData] = useState([]);

  const [followUpQueue, setFollowUpQueue] = useState(() => {
    try {
      const saved = localStorage.getItem('soo_follow_up_queue_v2');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [awokenDate, setAwokenDate] = useState(() => localStorage.getItem('soo_awoken_date') || '');

  const [callStatus, setCallStatus] = useState('idle');
  const [callType, setCallType] = useState('audio');
  const [callDuration, setCallDuration] = useState(0);
  const [isVideoCalling, setIsVideoCalling] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);

  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [selectedFeedItem, setSelectedFeedItem] = useState(null);
  const [feedScrollPosition, setFeedScrollPosition] = useState(0);

  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const ringAudioRef = useRef(null);
  const phoneCallAudioRef = useRef(null);
  const videoPlayerRef = useRef(null);
  const ringingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('soo_chat_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('soo_follow_up_queue_v2', JSON.stringify(followUpQueue));
  }, [followUpQueue]);

  // 🌟 資料載入（包含 settings 表）
  useEffect(() => {
    Promise.all([
      fetchSheetData('media'),
      fetchSheetData('dialogues'),
      fetchSheetData('food_weights'),
      fetchSheetData('interviews'),
      fetchSheetData('settings')
    ]).then(([mediaRows, diagRows, foodRows, interviewRows, settingRows]) => {
      if (mediaRows.length) setMasterMedia(mediaRows);
      if (diagRows.length) setDialogueList(diagRows);
      if (foodRows.length) setFoodWeights(foodRows);
      if (interviewRows.length) setInterviewData(interviewRows);

      if (settingRows.length) {
        const conf = {};
        const emojiMap = {};

        settingRows.forEach(r => {
          if (r.key) conf[r.key.toLowerCase().trim()] = r.value;
          if (r.type_code && r.emojis) {
            emojiMap[r.type_code.trim().toLowerCase()] = r.emojis
              .split(/[,，]/)
              .map(e => e.trim())
              .filter(Boolean);
          }
        });

        const newAvatar = conf.avatar_url || 'https://images.plurk.com/6PooPJr1YbOhrMp5CCFdbl.jpg';
        const newName = conf.app_name || 'Soo';

        setAppSettings({
          name: newName,
          avatar: newAvatar,
          typeEmojiMap: emojiMap
        });

        document.title = newName;

        const faviconUrl = conf.favicon_url || newAvatar;
        let link = document.querySelector("link[rel*='icon']");
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.head.appendChild(link);
        }
        link.href = faviconUrl;

        let appleIcon = document.querySelector("link[rel='apple-touch-icon']");
        if (!appleIcon) {
          appleIcon = document.createElement('link');
          appleIcon.rel = 'apple-touch-icon';
          document.head.appendChild(appleIcon);
        }
        appleIcon.href = conf.pwa_icon_url || newAvatar;
      }
    });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const dynamicVoiceList = useMemo(() => {
    return dialogueList
      .filter(d => (d.type || '').trim().toLowerCase() === 'audio')
      .map((d, idx) => ({
        id: `voice_${idx}`,
        title: (d.trigger_content || `音訊 ${idx + 1}`).trim(),
        src: formatAudioUrl(d.audio_after || d.trigger_content)
      }));
  }, [dialogueList]);

  // 左側邊緣滑動返回防誤觸
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;

    const isEdgeSwipe = touchStartX.current < 45;
    const isHorizontalSwipe = deltaX > 75 && Math.abs(deltaY) < 40;

    if (isEdgeSwipe && isHorizontalSwipe) {
      if (selectedFeedItem) {
        setSelectedFeedItem(null);
      } else if (activeModal) {
        setActiveModal(null);
      }
    }
  };

  const formatSeconds = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `String(m).padStart(2,'0'):{String(s).padStart(2, '0')}`;
  };

  const sendStaggeredMessages = async (textBlock, options = {}) => {
    if (!textBlock) return;
    const bubbles = textBlock.split(/;|\n/).map(s => s.trim()).filter(Boolean);
    if (!bubbles.length) return;

    for (let i = 0; i < bubbles.length; i++) {
      setIsTyping(true);
      await new Promise(r => setTimeout(r, Math.floor(Math.random() * 350) + 450));
      setIsTyping(false);

      setMessages(prev => [
        ...prev,
        {
          id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          role: 'assistant',
          type: 'text',
          content: bubbles[i],
          replyTo: (i === 0 && options.replyTo) ? options.replyTo : null,
          time: getCurrentTime()
        }
      ]);

      if (i === 0 && document.hidden) {
        sendNotification(`${appSettings.name} 傳來了新訊息`, bubbles[i]);
      }
      if (i < bubbles.length - 1) await new Promise(r => setTimeout(r, 300));
    }

    if (options.audioAfter) {
      setTimeout(() => sendVoiceMessage({ src: formatAudioUrl(options.audioAfter) }), 600);
    }
  };

  const sendVoiceMessage = (voiceData) => {
    setMessages(prev => [
      ...prev,
      {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        role: 'assistant',
        type: 'audio',
        audioSrc: voiceData.src,
        time: getCurrentTime()
      }
    ]);
    if (document.hidden) sendNotification(`${appSettings.name} 傳送了一則語音訊息`, '點擊開啟查看');
  };

  const addCallRecord = (statusText = '未接來電', role = 'assistant', durationText = null) => {
    setMessages(prev => [
      ...prev,
      {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        role,
        type: 'call_record',
        durationText,
        statusText,
        time: getCurrentTime()
      }
    ]);
  };

  const pickDialogue = (typeKey) => {
    const pool = dialogueList.filter(d => (d.type || '').trim().toLowerCase() === typeKey.toLowerCase());
    return pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
  };

  const triggerFoodRoulette = () => {
    if (!foodWeights.length) {
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
    sendStaggeredMessages(selected.soo_comment || `去吃${selected.food_name}如何？;我來訂位`);
  };

  const extractAllFollowUps = (item, baseTitle = '') => {
    const list = [];
    if (item.follow_ups) list.push(...item.follow_ups.split(/;|\n/).map(s => s.trim()).filter(Boolean));
    if (item.follow_up_1?.trim()) list.push(item.follow_up_1.trim());
    if (item.follow_up_2?.trim()) list.push(item.follow_up_2.trim());
    if (item.follow_up_3?.trim()) list.push(item.follow_up_3.trim());

    return list.map(text => ({
      replyText: text,
      replyTo: baseTitle || item.caption || item.trigger_content || ''
    }));
  };

  const triggerIncomingCall = (type = 'audio') => {
    setCallType(type);
    setCallStatus('ringing');
    if (document.hidden) sendNotification(`${appSettings.name} 正在來電...`, '請開啟畫面接聽');

    clearTimeout(ringingTimeoutRef.current);
    ringingTimeoutRef.current = setTimeout(() => {
      setCallStatus(current => {
        if (current === 'ringing') {
          addCallRecord(type === 'video' ? '未接視訊' : '未接來電', 'assistant');
          sendNotification('未接來電', `${appSettings.name} 剛剛嘗試撥打電話給您`);
          setTimeout(() => {
            const diag = pickDialogue('missed_call');
            if (diag) {
              sendStaggeredMessages(diag.trigger_content, { audioAfter: diag.audio_after });
              const newQueue = extractAllFollowUps(diag, diag.trigger_content);
              if (newQueue.length) setFollowUpQueue(prev => [...prev, ...newQueue]);
            } else {
              sendStaggeredMessages('看到打回來。');
            }
          }, 800);
          return 'idle';
        }
        return current;
      });
    }, 8000);
  };

  const handleAcceptCall = () => {
    clearTimeout(ringingTimeoutRef.current);
    ringAudioRef.current?.pause();
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
    } else if (isConnected) {
      addCallRecord(`通話時間 ${finalDurationText}`, 'user', finalDurationText);
    }
  };

  const triggerManualText = () => {
    const textDiags = dialogueList.filter(d => (d.type || '').trim().toLowerCase() === 'text');
    const picked = textDiags.length ? textDiags[Math.floor(Math.random() * textDiags.length)] : null;
    if (picked) {
      sendStaggeredMessages(picked.trigger_content, { audioAfter: picked.audio_after });
      const newQueue = extractAllFollowUps(picked, picked.trigger_content);
      if (newQueue.length) setFollowUpQueue(newQueue);
    }
  };

  const triggerManualVoice = () => {
    if (!dynamicVoiceList.length) return;
    const picked = dynamicVoiceList[Math.floor(Math.random() * dynamicVoiceList.length)];
    sendVoiceMessage({ src: picked.src });
  };

  const triggerCategoryRandom = (catKey) => {
    const pool = masterMedia.filter(m => (m.category || m.type || '').toLowerCase().trim() === catKey && (m.images || '').trim());
    if (!pool.length) return;
    const item = pool[Math.floor(Math.random() * pool.length)];
    const imgList = (item.images || '').trim().split(/[\s,]+/).filter(url => url.startsWith('http'));

    if (imgList.length === 1) {
      setMessages(prev => [...prev, { id: `${Date.now()}_photo`, role: 'assistant', type: 'photo', imageUrl: imgList[0], time: getCurrentTime() }]);
    } else if (imgList.length > 1) {
      setMessages(prev => [...prev, { id: `${Date.now()}_grid`, role: 'assistant', type: 'album_grid', images: imgList, time: getCurrentTime() }]);
    }

    if (item.caption) {
      setTimeout(() => sendStaggeredMessages(item.caption, { audioAfter: item.audio_after }), 700);
    }
  };

  useEffect(() => {
    const checkWakeup = () => {
      const todayStr = getTodayDateStr();
      if (awokenDate === todayStr) return;

      const now = new Date();
      const val = now.getHours() * 60 + now.getMinutes();
      if (val < 420 || val > 780) return;

      const storageKey = `soo_wakeup_done_${todayStr}`;
      const doneSteps = JSON.parse(localStorage.getItem(storageKey) || '[]');
      let step = null;
      let audio = null;

      if (val >= 420 && val < 480 && !doneSteps.includes('s1')) {
        step = 's1'; audio = '/audio/1_get up_cozy.mp3';
      } else if (val >= 480 && val < 570 && !doneSteps.includes('s2')) {
        step = 's2'; audio = '/audio/2_plz_get_up.mp3';
      } else if (val >= 570 && val < 690 && !doneSteps.includes('s3')) {
        step = 's3'; audio = '/audio/3_can_u_get_up.mp3';
      } else if (val >= 690 && val < 720 && !doneSteps.includes('s4')) {
        step = 's4'; audio = '/audio/4_time_to_get_up_now.mp3';
      } else if (val >= 720 && val <= 780 && !doneSteps.includes('s5')) {
        step = 's5'; audio = '/audio/5_get_up_yell.mp3';
      }

      if (step && audio) {
        doneSteps.push(step);
        localStorage.setItem(storageKey, JSON.stringify(doneSteps));
        addCallRecord('未接來電', 'assistant');
        sendNotification(`未接來電 (${appSettings.name})`, '快起床囉！');
        setTimeout(() => sendVoiceMessage({ src: audio }), 1000);
      }
    };

    checkWakeup();
    const timer = setInterval(checkWakeup, 60000);
    return () => clearInterval(timer);
  }, [awokenDate, appSettings.name]);

  const handleSend = () => {
    if (!inputText.trim() || isTyping) return;
    const currentInput = inputText.trim();

    setMessages(prev => [...prev, { id: `${Date.now()}_user`, role: 'user', type: 'text', content: currentInput, time: getCurrentTime() }]);
    setInputText('');

    if (currentInput.includes('起床')) {
      const todayStr = getTodayDateStr();
      setAwokenDate(todayStr);
      localStorage.setItem('soo_awoken_date', todayStr);
      setCallStatus('idle');
      const awakeDiag = pickDialogue('system_awake');
      sendStaggeredMessages(awakeDiag?.trigger_content || '終於醒了？;水喝了嗎？');
      return;
    }

    if (/吃什麼|想吃|晚餐|午餐|宵夜|吃啥/.test(currentInput)) {
      triggerFoodRoulette();
      return;
    }

    if (followUpQueue.length > 0) {
      const [nextItem, ...remaining] = followUpQueue;
      setFollowUpQueue(remaining);
      setTimeout(() => sendStaggeredMessages(nextItem.replyText, { replyTo: nextItem.replyTo }), 700);
      return;
    }

    const textDiags = dialogueList.filter(d => (d.type || '').trim().toLowerCase() === 'text');
    const picked = textDiags.length ? textDiags[Math.floor(Math.random() * textDiags.length)] : null;
    setTimeout(() => {
      if (picked) {
        sendStaggeredMessages(picked.trigger_content, { audioAfter: picked.audio_after });
        const newQueue = extractAllFollowUps(picked, picked.trigger_content);
        if (newQueue.length) setFollowUpQueue(newQueue);
      }
    }, 800);
  };

  useEffect(() => {
    if (callStatus === 'ringing') {
      if (ringAudioRef.current) {
        ringAudioRef.current.currentTime = 73;
        ringAudioRef.current.play().catch(() => {});
      }
    } else {
      ringAudioRef.current?.pause();
    }
  }, [callStatus]);

  useEffect(() => {
    let t = null;
    if (callStatus === 'connected') {
      setCallDuration(0);
      t = setInterval(() => setCallDuration(p => p + 1), 1000);
      phoneCallAudioRef.current?.play().catch(() => {});
    } else {
      clearInterval(t);
      phoneCallAudioRef.current?.pause();
    }
    return () => clearInterval(t);
  }, [callStatus]);

  useEffect(() => {
    let t = null;
    if (isVideoCalling) {
      setVideoDuration(0);
      t = setInterval(() => setVideoDuration(p => p + 1), 1000);
      videoPlayerRef.current?.play().catch(() => {});
    } else {
      clearInterval(t);
      videoPlayerRef.current?.pause();
    }
    return () => clearInterval(t);
  }, [isVideoCalling]);

  // 相簿分組（擷取每本相簿最新日期，供時間倒序排列使用）
  const albumList = useMemo(() => {
    const groups = {};
    masterMedia.forEach((m) => {
      let albumKey = m.album_name?.trim() || '所有相片';
      if (albumKey === '未分類歸檔') albumKey = '所有相片';

      if (!groups[albumKey]) {
        groups[albumKey] = {
          title: albumKey,
          images: [],
          latestDate: ''
        };
      }

      const imgs = (m.images || '')
        .trim()
        .split(/[\s,]+/)
        .filter((u) => u.startsWith('http'));
      groups[albumKey].images.push(...imgs);

      const d = (m.date || '').trim();
      if (d && d > groups[albumKey].latestDate) {
        groups[albumKey].latestDate = d;
      }
    });

    return Object.values(groups)
      .map((g) => {
        const unique = Array.from(new Set(g.images));
        return {
          title: g.title,
          cover: unique[0] || null,
          images: unique,
          count: unique.length,
          latestDate: g.latestDate
        };
      })
      .filter((g) => g.count > 0);
  }, [masterMedia]);

  // 🌟 針對 YYYY,MM,DD 格式的精準逗號切割解析
  const allMediaEvents = useMemo(() => {
    return masterMedia
      .map(m => {
        const rawDate = (m.date || '').trim();
        if (!rawDate) return null;

        const parts = rawDate.split(',');
        if (parts.length < 3) return null;

        const year = parseInt(parts[0].trim(), 10);
        const month = parseInt(parts[1].trim(), 10);
        const day = parseInt(parts[2].trim(), 10);

        if (isNaN(year) || isNaN(month) || isNaN(day)) return null;

        return {
          rawDate,
          year,
          month,
          day,
          title: m.album_name || m.news_title || m.caption || '行程',
          status: m.sub_type || m.status || '',
          type: m.type || m.category || ''
        };
      })
      .filter(Boolean);
  }, [masterMedia]);

  // FEED 聚合解析
  const feedItems = useMemo(() => {
    const grouped = {};
    masterMedia.forEach(m => {
      const mainTitle = getField(m, 'news_title', 'album_name', 'title');
      const eventId = getField(m, 'event_id', 'interview_id', 'id');
      const videoUrl = getField(m, 'video_url', 'videourl', 'video');

      if (!mainTitle && !videoUrl && !eventId && !m.images) return;
      const key = mainTitle || m.album_name || m.id || 'feed_item';

      if (!grouped[key]) {
        grouped[key] = {
          main_title: mainTitle || m.album_name,
          sub_title: getField(m, 'news_subtitle', 'subtitle'),
          source: getField(m, 'news_source', 'source'),
          time_text: getField(m, 'date'),
          summary: getField(m, 'news_summary', 'summary'),
          interview_id: eventId,
          videos: [],
          credits: getField(m, 'credits', 'credit'),
          main_images: [],
          layout_images: []
        };
      }

      if (eventId && !grouped[key].interview_id) {
        grouped[key].interview_id = eventId;
      }

      if (videoUrl) {
        const urls = videoUrl.split(/;|\n{2,}/).map(s => s.trim()).filter(Boolean);
        const rawCaption = getField(m, 'video_caption', 'videocaption', 'video_desc');
        let caps = [];
        if (urls.length <= 1) {
          caps = [rawCaption];
        } else {
          caps = rawCaption.split(';').map(s => s.trim());
        }

        urls.forEach((u, i) => {
          if (!grouped[key].videos.some(v => v.url === u)) {
            grouped[key].videos.push({
              url: u,
              caption: caps[i] !== undefined ? caps[i] : (caps[0] || '')
            });
          }
        });
      }

      const rawImgs = getField(m, 'images', 'image');
      const imgs = rawImgs.split(/[\s,]+/).map(u => u.trim()).filter(u => u.startsWith('http'));
      const subType = getField(m, 'sub_type', 'subtype').toLowerCase();
      if (subType === 'layout') {
        grouped[key].layout_images.push(...imgs);
      } else {
        grouped[key].main_images.push(...imgs);
      }
    });

    return Object.values(grouped).map(item => ({
      ...item,
      hero_image: item.main_images[0] || item.layout_images[0] || null,
      remaining_images: item.main_images.slice(1)
    }));
  }, [masterMedia]);

  // 訪談資料關聯比對
  const currentInterviewDialogue = useMemo(() => {
    if (!selectedFeedItem?.interview_id) return [];
    const targetId = selectedFeedItem.interview_id.trim().toLowerCase();

    return interviewData
      .filter(row => {
        const rowId = getField(row, 'event_id', 'interview_id', 'interviewid', 'id', 'col_0').trim().toLowerCase();
        return rowId && rowId === targetId;
      })
      .map(row => ({
        speaker: getField(row, 'speaker', 'role', 'name', 'col_1') || 'Q',
        content: getField(row, 'content', 'text', 'dialogue', 'answer', 'col_2') || ''
      }))
      .filter(item => item.content.length > 0);
  }, [selectedFeedItem, interviewData]);

  return (
    <div 
      className="flex h-[100dvh] w-screen bg-slate-900 justify-center items-center select-none overflow-hidden sm:p-3"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <audio ref={ringAudioRef} src="/audio/telepathy 2025.mp3" loop preload="auto" />
      <audio ref={phoneCallAudioRef} src="/audio/phone_call.mp3" onEnded={handleEndCall} preload="auto" />

      <div className="w-full sm:max-w-[420px] h-[100dvh] sm:h-[92vh] sm:max-h-[880px] bg-[#ECEEF1] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden relative border-0 sm:border sm:border-slate-700">
        
        {/* 全螢幕來電介面 */}
        {callStatus !== 'idle' && (
          <div className="absolute inset-0 bg-slate-950/95 z-50 flex flex-col justify-between items-center py-16 px-6 text-white backdrop-blur-md animate-fade-in">
            <div className="flex flex-col items-center mt-10 space-y-4">
              <div className="w-40 h-40 rounded-full overflow-hidden ring-4 ring-[#81D4D2]/40 shadow-2xl animate-pulse">
                <img src={appSettings.avatar} alt="avatar" className="w-full h-full object-cover" />
              </div>
              <span className="text-2xl font-semibold tracking-wider">{appSettings.name}</span>
              <span className="text-xs text-slate-400 font-light tracking-wide">
                {callStatus === 'ringing' ? (callType === 'video' ? '視訊來電...' : '語音來電...') : formatSeconds(callDuration)}
              </span>
            </div>
            {callStatus === 'ringing' ? (
              <div className="w-full flex justify-around items-center px-6 mb-8">
                <button onClick={handleEndCall} className="w-16 h-16 rounded-full bg-rose-600 active:scale-95 transition flex items-center justify-center">
                  <svg className="w-7 h-7 fill-white rotate-[135deg]" viewBox="0 0 24 24"><path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24 11.72 11.72 0 003.68.59 1 1 0 011 1v3.5a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.48.59 3.68a1 1 0 01-.24 1.02l-2.23 2.09z" /></svg>
                </button>
                <button onClick={handleAcceptCall} className="w-16 h-16 rounded-full bg-[#5FBDB9] active:scale-95 transition flex items-center justify-center animate-bounce">
                  <svg className="w-7 h-7 fill-white" viewBox="0 0 24 24"><path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24 11.72 11.72 0 003.68.59 1 1 0 011 1v3.5a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.48.59 3.68a1 1 0 01-.24 1.02l-2.23 2.09z" /></svg>
                </button>
              </div>
            ) : (
              <button onClick={handleEndCall} className="w-16 h-16 rounded-full bg-rose-600 active:scale-95 transition flex items-center justify-center mb-8">
                <svg className="w-7 h-7 fill-white rotate-[135deg]" viewBox="0 0 24 24"><path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24 11.72 11.72 0 003.68.59 1 1 0 011 1v3.5a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.48.59 3.68a1 1 0 01-.24 1.02l-2.23 2.09z" /></svg>
              </button>
            )}
          </div>
        )}

        {/* 全螢幕視訊通話 */}
        {isVideoCalling && (
          <div className="absolute inset-0 bg-black z-50 flex flex-col justify-between items-center py-12 px-6 text-white animate-fade-in">
            <video
              ref={videoPlayerRef}
              src="/video/video_call.mp4"
              playsInline
              autoPlay
              onEnded={() => {
                setIsVideoCalling(false);
                addCallRecord(`視訊通話 ${formatSeconds(videoDuration)}`, 'user', formatSeconds(videoDuration));
              }}
              className="absolute inset-0 w-full h-full object-cover scale-105"
            />
            <div className="z-10 flex flex-col items-center mt-4 space-y-1">
              <span className="text-xl font-medium tracking-wide">{appSettings.name}</span>
              <span className="text-xs text-[#81D4D2] font-mono tracking-widest">{formatSeconds(videoDuration)}</span>
            </div>
            <button
              onClick={() => {
                setIsVideoCalling(false);
                addCallRecord(`視訊通話 ${formatSeconds(videoDuration)}`, 'user', formatSeconds(videoDuration));
              }}
              className="z-10 w-16 h-16 rounded-full bg-rose-600 active:scale-95 transition flex items-center justify-center mb-6"
            >
              <svg className="w-7 h-7 fill-white rotate-[135deg]" viewBox="0 0 24 24"><path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24 11.72 11.72 0 003.68.59 1 1 0 011 1v3.5a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.48.59 3.68a1 1 0 01-.24 1.02l-2.23 2.09z" /></svg>
            </button>
          </div>
        )}

        {/* 主頂部導航列 */}
        <div className="pt-12 pb-5 bg-[#4E727A] text-white flex items-center justify-between px-5 z-20 shrink-0 shadow-md border-b border-[#3D5C63]">
          <div className="flex items-center space-x-3.5">
            <div className="w-14 h-14 rounded-full bg-slate-800/30 overflow-hidden ring-2 ring-white/30 shadow-md shrink-0">
              <img src={appSettings.avatar} alt="avatar" className="w-full h-full object-cover" />
            </div>
            <span className="font-bold text-lg text-white tracking-wide">{appSettings.name}</span>
          </div>

          <div className="flex items-center space-x-2.5">
            <button onClick={() => setMessages([])} className="bg-black/25 active:scale-95 text-white/95 text-[11.5px] px-3 py-1.5 rounded-full border border-white/15">
              <span>清空</span>
              <span className="bg-[#81D4D2] text-[#0F3332] font-bold text-[10.5px] px-1.5 py-0.2 rounded-full font-mono ml-1.5">{messages.length}</span>
            </button>
            <button onClick={() => triggerIncomingCall('audio')} className="w-9 h-9 rounded-full bg-white/15 active:scale-95 flex items-center justify-center">
              <svg className="w-4.5 h-4.5 fill-white" viewBox="0 0 24 24"><path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24 11.72 11.72 0 003.68.59 1 1 0 011 1v3.5a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.48.59 3.68a1 1 0 01-.24 1.02l-2.23 2.09z" /></svg>
            </button>
            <button onClick={() => setIsVideoCalling(true)} className="w-9 h-9 rounded-full bg-white/15 active:scale-95 flex items-center justify-center">
              <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" /></svg>
            </button>
          </div>
        </div>

        {/* 聊天區 */}
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
                    <img src={appSettings.avatar} alt="avatar" className="w-full h-full object-cover" />
                  </div>
                )}
                {isUser && <span className="text-[9px] text-teal-800/80 pr-1 leading-tight font-light"><strong className="block text-teal-700">已讀</strong>{msg.time}</span>}

                {msg.type === 'call_record' ? (
                  <div className="flex items-center space-x-2.5 bg-white px-3.5 py-2.5 rounded-2xl shadow-sm border border-slate-200">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.durationText ? 'bg-teal-50 text-[#4E727A]' : 'bg-rose-50 text-rose-500'}`}>
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24 11.72 11.72 0 003.68.59 1 1 0 011 1v3.5a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.48.59 3.68a1 1 0 01-.24 1.02l-2.23 2.09z" /></svg>
                    </div>
                    <span className={`text-xs font-medium ${msg.durationText ? 'text-slate-800' : 'text-rose-600'}`}>{msg.statusText}</span>
                  </div>
                ) : msg.type === 'audio' ? (
                  <AudioBubble audioSrc={msg.audioSrc} />
                ) : msg.type === 'album_grid' ? (
                  <div className="grid grid-cols-3 gap-1 rounded-xl overflow-hidden bg-white p-1.5 border border-slate-200">
                    {msg.images.map((img, i) => (
                      <a key={i} href={img} target="_blank" rel="noreferrer" className="block aspect-[3/4] overflow-hidden bg-slate-100">
                        <img src={img} alt="Cut" loading="lazy" className="w-full h-full object-cover" />
                      </a>
                    ))}
                  </div>
                ) : msg.type === 'photo' ? (
                  <img src={msg.imageUrl} alt="selfie" className="max-w-[70%] max-h-72 object-cover rounded-2xl shadow-md border border-slate-200" />
                ) : (
                  <div className={`max-w-[72%] rounded-2xl px-3.5 py-2 text-[13.5px] leading-relaxed shadow-sm ${isUser ? 'bg-[#81D4D2] text-[#0F3332] rounded-tr-none' : 'bg-white text-slate-900 rounded-tl-none border border-slate-200/60'}`}>
                    {msg.replyTo && <div className="mb-1.5 px-2 py-1 bg-slate-100/90 rounded border-l-2 border-[#5FBDB9] text-[11px] text-slate-500 line-clamp-1">回覆: {msg.replyTo}</div>}
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                )}
                {!isUser && <span className="text-[9px] text-slate-400 pl-1 leading-tight font-light">{msg.time}</span>}
              </div>
            );
          })}
          {isTyping && (
            <div className="flex items-center space-x-1.5">
              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 ring-1 ring-slate-300">
                <img src={appSettings.avatar} alt="avatar" className="w-full h-full object-cover" />
              </div>
              <div className="bg-white px-3 py-2.5 rounded-2xl rounded-tl-none shadow-sm border border-slate-200 flex space-x-1">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 測試控制板 */}
        <div className="bg-slate-900/10 px-2.5 py-2 flex space-x-2 overflow-x-auto border-t border-slate-200/80 z-10 scrollbar-none shrink-0">
          <button onClick={() => triggerIncomingCall('audio')} className="text-[12px] bg-teal-50 text-teal-800 font-semibold px-3 py-1.5 rounded-full border border-teal-300/80 shrink-0">📞</button>
          <button onClick={triggerManualText} className="text-[12px] bg-teal-50 text-teal-800 font-semibold px-3 py-1.5 rounded-full border border-teal-300/80 shrink-0">💬</button>
          <button onClick={triggerManualVoice} className="text-[12px] bg-teal-50 text-teal-800 font-semibold px-3 py-1.5 rounded-full border border-teal-300/80 shrink-0">📼</button>
          <div className="w-[1px] h-6 bg-slate-300/80 my-auto shrink-0" />
          <button onClick={() => triggerCategoryRandom('gym')} className="text-[12px] bg-white text-slate-800 font-medium px-3 py-1.5 rounded-full border border-slate-200 shrink-0">🏋️</button>
          <button onClick={() => triggerCategoryRandom('car')} className="text-[12px] bg-white text-slate-800 font-medium px-3 py-1.5 rounded-full border border-slate-200 shrink-0">🚘</button>
          <button onClick={() => triggerCategoryRandom('selfie')} className="text-[12px] bg-white text-slate-800 font-medium px-3 py-1.5 rounded-full border border-slate-200 shrink-0">📷</button>
          <button onClick={() => triggerCategoryRandom('gd')} className="text-[12px] bg-white text-slate-800 font-medium px-3 py-1.5 rounded-full border border-slate-200 shrink-0">🐲</button>
          <button onClick={() => triggerCategoryRandom('outing')} className="text-[12px] bg-white text-slate-800 font-medium px-3 py-1.5 rounded-full border border-slate-200 shrink-0">🎡</button>
          <button onClick={() => triggerCategoryRandom('magazine')} className="text-[12px] bg-white text-slate-800 font-medium px-3 py-1.5 rounded-full border border-slate-200 shrink-0">🐈‍⬛</button>
          <button onClick={() => triggerCategoryRandom('official')} className="text-[12px] bg-white text-slate-800 font-medium px-3 py-1.5 rounded-full border border-slate-200 shrink-0">✨</button>
        </div>

        {/* ＋號選單 */}
        {isPlusMenuOpen && (
          <div className="bg-[#4E727A]/95 backdrop-blur-md px-6 py-4 flex justify-around items-center border-t border-[#3D5C63] z-20 animate-fade-in shadow-xl">
            <button onClick={() => { setActiveModal('album'); setIsPlusMenuOpen(false); }} className="p-2 active:scale-75 transition">
              <svg className="w-7 h-7 fill-white" viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
            </button>
            <button onClick={() => { setActiveModal('voices'); setIsPlusMenuOpen(false); }} className="p-2 active:scale-75 transition">
              <svg className="w-7 h-7 fill-white" viewBox="0 0 24 24"><path d="M19 4H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-1 12H6c-.55 0-1-.45-1-1V9c0-.55.45-1 1-1h12c.55 0 1 .45 1 1v6c0 .55-.45 1-1 1zM7.5 11c-.83 0-1.5.67-1.5 1.5S6.67 14 7.5 14s1.5-.67 1.5-1.5S8.33 11 7.5 11zm9 0c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z"/></svg>
            </button>
            <button onClick={() => { setActiveModal('calendar'); setIsPlusMenuOpen(false); }} className="p-2 active:scale-75 transition">
              <svg className="w-7 h-7 fill-white" viewBox="0 0 24 24"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zm-7 5h5v5h-5z"/></svg>
            </button>
            <button onClick={() => { setActiveModal('feed'); setIsPlusMenuOpen(false); }} className="p-2 active:scale-75 transition">
              <svg className="w-7 h-7 fill-white" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
            </button>
          </div>
        )}

        {/* 底部輸入列 */}
        <div className="bg-[#4E727A] p-2.5 flex items-center space-x-2 border-t border-[#3D5C63] z-20 shrink-0 pb-6">
          <button onClick={() => setIsPlusMenuOpen(!isPlusMenuOpen)} className={`w-9 h-9 rounded-full flex items-center justify-center transition shrink-0 ${isPlusMenuOpen ? 'bg-white text-[#4E727A] rotate-45' : 'bg-white/15 text-white'}`}>
            <span className="text-xl font-light leading-none">＋</span>
          </button>
          <input
            type="text"
            className="flex-1 bg-white/95 rounded-full px-4 py-2 text-sm text-slate-900 focus:outline-none"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.nativeEvent.isComposing && handleSend()}
          />
          <button onClick={handleSend} className="bg-[#37545B] active:scale-95 text-white text-xs font-medium px-4 py-2 rounded-full shadow-sm">傳送</button>
        </div>

        {/* 抽屜模組調用 */}
        {activeModal === 'album' && (
          <AlbumModal albumList={albumList} />
        )}

        {/* 🌟 Calendar 傳入完整的 allMediaEvents 與 typeEmojiMap */}
        {activeModal === 'calendar' && (
          <CalendarModal 
            allMediaEvents={allMediaEvents} 
            typeEmojiMap={appSettings.typeEmojiMap}
          />
        )}

        {activeModal === 'feed' && (
          <FeedModal
            feedItems={feedItems}
            selectedFeedItem={selectedFeedItem}
            setSelectedFeedItem={setSelectedFeedItem}
            currentInterviewDialogue={currentInterviewDialogue}
            formatVideoSource={formatVideoSource}
            feedScrollPosition={feedScrollPosition}
            setFeedScrollPosition={setFeedScrollPosition}
          />
        )}

        {activeModal === 'voices' && (
          <FileModal dynamicVoiceList={dynamicVoiceList} AudioBubble={AudioBubble} />
        )}

      </div>
    </div>
  );
}

