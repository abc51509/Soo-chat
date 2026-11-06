const [appSettings, setAppSettings] = useState({
    name: 'Soo',
    avatar: 'https://images.plurk.com/6PooPJr1YbOhrMp5CCFdbl.jpg',
    typeEmojiMap: {}
  });

  useEffect(() => {
    Promise.all([
      fetchSheetData('media'),
      fetchSheetData('dialogues'),
      fetchSheetData('food_weights'),
      fetchSheetData('interviews'),
      fetchSheetData('settings') // 🌟 新增 settings
    ]).then(([mediaRows, diagRows, foodRows, interviewRows, settingRows]) => {
      if (mediaRows.length) setMasterMedia(mediaRows);
      if (diagRows.length) setDialogueList(diagRows);
      if (foodRows.length) setFoodWeights(foodRows);
      if (interviewRows.length) setInterviewData(interviewRows);

      // 🌟 解析 settings
      if (settingRows.length) {
        const conf = {};
        const emojiMap = {};

        settingRows.forEach(r => {
          // 抓取 key-value
          if (r.key) conf[r.key.toLowerCase()] = r.value;
          // 抓取 type 與 emojis
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

        // 動態更換網頁標題
        document.title = newName;

        // 動態更換網頁分頁 Icon (Favicon) 與書籤圖示
        const faviconUrl = conf.favicon_url || newAvatar;
        let link = document.querySelector("link[rel*='icon']");
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.head.appendChild(link);
        }
        link.href = faviconUrl;

        // 動態更新 PWA / Apple Touch Icon (加入主畫面桌面圖示)
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
