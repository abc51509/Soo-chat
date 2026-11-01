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

// 雜誌相簿資料庫
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

// TIME HOMME 25FW
const TIME_HOMME_PART1 = [
  'https://images.plurk.com/1n6vKU2MA4NxmtkOg1q48K.jpg',
  'https://images.plurk.com/6qCqoOzKNxggR9jzsCGu3Q.jpg',
  'https://images.plurk.com/3QA3CyLsc2Ya5JkujHnBwI.jpg',
  'https://images.plurk.com/4bmcYO4fyt1MyaT5dmhePw.jpg',
  'https://images.plurk.com/4KnvP5RB2txpbFFCy3SYuY.jpg',
  'https://images.plurk.com/2sURoKoVeg7eMN0RAf1dFp.jpg',
  'https://images.plurk.com/610OFc2VxdE5mZ9aYRUt1q.jpg',
  'https://images.plurk.com/4hDKUxkzvLh3pvObvCk8mb.jpg',
  'https://images.plurk.com/2k5QTkrOMyknXC8xH1MooT.jpg',
  'https://images.plurk.com/4UR6PXZn03LAjKe1EuId7a.jpg'
];

const TIME_HOMME_PART2 = [
  'https://images.plurk.com/2KdI0bz3GM4UaZjzYhksHn.jpg',
  'https://images.plurk.com/XM84QxTG0o6ZC07Xw7WRh.jpg',
  'https://images.plurk.com/39eq7ySEDlwfAhkAAX4zMn.jpg',
  'https://images.plurk.com/2n2KyLjMwfSTaqJq810BPU.jpg',
  'https://images.plurk.com/2GDm3FPQsAwYpMggcS772e.jpg',
  'https://images.plurk.com/5V0Fy8hk3b4UVCeoZMwPUJ.jpg',
  'https://images.plurk.com/2oS7Ui3xFzMhcZw2pc6Fe.jpg'
];

// Delvaux Shanghai 2026
const DELVAUX_IMAGES = [
  'https://images.plurk.com/1iUVhhGyvxDlOOdGPw35pq.jpg',
  'https://images.plurk.com/4MWcEw44Ok0b1UBrEfxxpB.jpg',
  'https://images.plurk.com/3HzgKz3tQbYtp3pw8S6iog.jpg'
];

// 隨機資料集
const POOL_GYM = [
  'https://i.pinimg.com/736x/22/d8/f3/22d8f306275dfe7b64acd21ca98f9abd.jpg',
  'https://i.pinimg.com/1200x/0b/4a/6e/0b4a6e568ea37bf78bb7fd21d856e1fd.jpg',
  'https://i.pinimg.com/736x/b3/d2/1c/b3d21c7fbbe868dafddbb3f95aa8e776.jpg',
  'https://i.pinimg.com/736x/9b/3c/2b/9b3c2bd0c58cf554a825623936d16638.jpg',
  'https://images.plurk.com/2p8rnxDbpRf4qxx5Q6Q74S.png',
  'https://i.pinimg.com/736x/f5/b3/e3/f5b3e37f5e7bfb403891ae73bb3a11b0.jpg',
  'https://i.pinimg.com/1200x/e4/5c/ca/e45ccadfc78f9fa779732ad580470860.jpg',
  'https://i.pinimg.com/1200x/cc/bf/8f/ccbf8f5b46666abdd4c316143d423dc1.jpg',
  'https://i.pinimg.com/736x/b5/1d/0b/b51d0b03a1ba894c9664b1d2da2deb8f.jpg',
  'https://i.pinimg.com/736x/19/c9/b9/19c9b95b095ee9ebbcac9a55c1ab48fe.jpg',
  'https://i.pinimg.com/1200x/73/4a/f9/734af9ab80865c574b51f752c796e84f.jpg',
  'https://i.pinimg.com/1200x/38/30/68/3830689dd99141249fa198569dbea6e1.jpg',
  'https://i.pinimg.com/736x/12/33/6f/12336f1677a932a5512caa9feb450179.jpg',
  'https://i.pinimg.com/736x/44/56/8f/44568fb30bb68a862ada8623d740a10c.jpg',
  'https://i.pinimg.com/736x/c3/ae/cb/c3aecb385e6a49a5dc57999bd54c35b0.jpg',
  'https://i.pinimg.com/736x/12/9e/68/129e687df81f5b1c934dd61c2d9f7c32.jpg',
  'https://i.pinimg.com/736x/d8/66/e8/d866e889a4a11c83af260f0a4d2b99c6.jpg',
  'https://i.pinimg.com/736x/5f/9d/98/5f9d981fc34c45615750657144e7e46b.jpg',
  'https://i.pinimg.com/1200x/b5/51/c9/b551c94ebb578f6d7481403a2bba5f64.jpg',
  'https://i.pinimg.com/1200x/c7/73/69/c7736998719e9cab3729a016790571e5.jpg',
  'https://i.pinimg.com/1200x/ba/9f/12/ba9f1204756592f351dc364dea4e734c.jpg',
  'https://i.pinimg.com/736x/87/9d/84/879d84b1c94f5c7319271e4c93944c57.jpg',
  'https://i.pinimg.com/736x/88/11/56/8811564c9aa2a3ea84bed10bbac6c091.jpg'
];

const POOL_CAR = [
  'https://images.plurk.com/JlYgvQyCmqHHSDRSEvPQF.png',
  'https://images.plurk.com/3tpfXvohjEd9h3XvCGxN4G.png',
  'https://i.pinimg.com/1200x/73/bc/05/73bc05dddcfe4f6162d6f445d711d81b.jpg',
  'https://i.pinimg.com/736x/ff/86/9c/ff869c391d315875c4095373d5f3e4cd.jpg',
  'https://i.pinimg.com/1200x/e3/5b/f0/e35bf0b169899712eed25cc9675a1b77.jpg',
  'https://i.pinimg.com/736x/9a/8d/00/9a8d00a17c6882e8dfb4da86491e8492.jpg'
];

const POOL_SELFIE = [
  'https://i.pinimg.com/736x/e3/9b/f3/e39bf309ce2c32fc550fc18fc8676f91.jpg',
  'https://i.pinimg.com/736x/9d/02/1a/9d021a2727ba2d1214e66f0e45c260e3.jpg',
  'https://images.plurk.com/3xGyOx0iQu8GUt4h4CxqcJ.png',
  'https://i.pinimg.com/1200x/cb/16/15/cb161533e0b32facbcc86d9363cf8dad.jpg',
  'https://i.pinimg.com/736x/95/fd/0e/95fd0e349f6bd4346af7c83f4e868059.jpg',
  'https://i.pinimg.com/736x/e1/47/14/e14714b11cd95e420ef5704b52a21349.jpg',
  'https://i.pinimg.com/736x/71/ee/b9/71eeb999b41c87d8fdb7fda0383683fa.jpg',
  'https://i.pinimg.com/736x/4f/86/a6/4f86a6c2208965cc5e8d461bc91d42ff.jpg',
  'https://i.pinimg.com/736x/92/c9/1c/92c91c1d2c76af88aa27f2b3360ce0a4.jpg',
  'https://i.pinimg.com/736x/d6/3b/a9/d63ba955460dc7e8049ec82a13e53162.jpg'
];

const POOL_OUTING = [
  'https://i.pinimg.com/736x/c4/91/c0/c491c085bad5bdd087efcd5e0a95479d.jpg',
  'https://i.pinimg.com/736x/ca/29/91/ca29918efc16e3c1d6817af1604318c3.jpg',
  'https://images.plurk.com/6KBVwlFOZXbLrdcj7aRQaD.png',
  'https://imgs.plurk.com/QHV/cCK/Z2RQIJm1B4qkyJt9SiXrfKKnNZE_lg.jpg',
  'https://imgs.plurk.com/QHV/9bl/4ATkcvLXfnoUmF2MW7BNne0Fxfh_lg.jpg',
  'https://i.pinimg.com/736x/ba/0b/52/ba0b52dfde7b006a890f56746651a5de.jpg',
  'https://imgs.plurk.com/QHV/7BS/g1ToIODKXRxceDrzzP9sb8RRiGI_lg.jpg',
  'https://i.pinimg.com/736x/76/c8/27/76c82772ae34258891d024b856aa24f3.jpg'
];

// 志龍同遊分組資料
const POOL_GD = [
  {
    id: 'gd_g1',
    images: [
      'https://i.pinimg.com/736x/1e/fa/d3/1efad3e8d5aa375231ffe5f9014d6e35.jpg',
      'https://i.pinimg.com/736x/1e/fa/d3/1efad3e8d5aa375231ffe5f9014d6e35.jpg',
      'https://i.pinimg.com/736x/49/d4/94/49d49423f20a3fa2d8a81520fe9a6c2a.jpg'
    ]
  },
  {
    id: 'gd_g2',
    images: [
      'https://i.pinimg.com/736x/a5/3b/5b/a53b5b52c8ae1b0de0320e75fd37aebc.jpg',
      'https://i.pinimg.com/736x/17/f5/13/17f51330c76fd79471ff8ed6dfc5ef7f.jpg',
      'https://i.pinimg.com/736x/a7/70/5b/a7705be7828dacd5ff976bf807b7834b.jpg'
    ]
  },
  {
    id: 'gd_g3',
    images: [
      'https://i.pinimg.com/736x/ae/56/e0/ae56e0ef88ddde04f5d6d698be49355c.jpg',
      'https://i.pinimg.com/1200x/99/ed/d6/99edd6b5739e931b1960b1ff6e666e05.jpg'
    ]
  },
  {
    id: 'gd_g4',
    images: [
      'https://i.pinimg.com/736x/55/0d/2b/550d2b47e9139b41c524ec7b2faf8ebc.jpg',
      'https://i.pinimg.com/736x/f2/c5/93/f2c59399abac35f00ac18f40e7bd6ec0.jpg'
    ]
  },
  {
    id: 'gd_s1',
    images: ['https://i.pinimg.com/1200x/28/61/91/28619195b1de86e0f620af129de8ab4d.jpg']
  },
  {
    id: 'gd_s2',
    images: ['https://i.pinimg.com/736x/e8/23/93/e82393d794c32303acfd9ca18df7e2ca.jpg']
  },
  {
    id: 'gd_s3',
    images: ['https://i.pinimg.com/736x/8b/05/73/8b0573f4fe50e7566242f2a546b10e4b.jpg']
  },
  {
    id: 'gd_s4',
    images: ['https://i.pinimg.com/1200x/81/5c/31/815c319db1b5f892cf87c8b9d0b2c468.jpg']
  },
  {
    id: 'gd_s5',
    images: ['https://i.pinimg.com/1200x/9a/43/59/9a4359b9cfd642c7b391787dea7f06f2.jpg']
  },
  {
    id: 'gd_s6',
    images: ['https://i.pinimg.com/1200x/e4/da/b9/e4dab90f93cdf5839766272ccc810a4a.jpg']
  },
  {
    id: 'gd_s7',
    images: ['https://i.pinimg.com/736x/28/6f/ff/286fff7242db10e86b2157dd30b1e9f1.jpg']
  },
  {
    id: 'gd_g5',
    images: [
      'https://i.pinimg.com/1200x/95/09/8f/95098f7f3710bb7d4858c484e43dd31a.jpg',
      'https://i.pinimg.com/1200x/f0/ba/2d/f0ba2df432a7b181f02d9d228c921e8f.jpg'
    ]
  },
  {
    id: 'gd_g6',
    images: [
      'https://i.pinimg.com/1200x/53/46/3e/53463ec0ce10da160b6d4855991b26cf.jpg',
      'https://i.pinimg.com/736x/b5/cd/e0/b5cde0d20be19e8bc0a5fbeeafe42f7c.jpg'
    ]
  },
  {
    id: 'gd_s8',
    images: ['https://i.pinimg.com/1200x/71/54/a5/7154a58db9307c400333acc9301b1804.jpg']
  },
  {
    id: 'gd_s9',
    images: ['https://i.pinimg.com/1200x/33/69/b5/3369b5307ee11175fd73425a5c8cc783.jpg']
  },
  {
    id: 'gd_s10',
    images: ['https://i.pinimg.com/1200x/32/96/a0/3296a01436023518feeadf00bd8a3533.jpg']
  },
  {
    id: 'gd_s11',
    images: ['https://i.pinimg.com/736x/d7/e9/eb/d7e9eb96a59f04e0bb9b2fa75b15460f.jpg']
  },
  {
    id: 'gd_s12',
    images: ['https://i.pinimg.com/736x/0a/1a/f2/0a1af2b0140704432293f926822d7a32.jpg']
  },
  {
    id: 'gd_s13',
    images: ['https://i.pinimg.com/1200x/41/cb/e6/41cbe637a07d3374085068b09020cdae.jpg']
  },
  {
    id: 'gd_s14',
    images: ['https://i.pinimg.com/1200x/29/dd/19/29dd195b8feefb4110937f7e2e903116.jpg']
  },
  {
    id: 'gd_daesung',
    title: '與 GD、大聲聚會',
    images: [
      'https://i.pinimg.com/1200x/ce/19/98/ce1998cfa3a9dc21fdb78e0c837db446.jpg',
      'https://i.pinimg.com/736x/e8/9a/55/e89a55bf796e4dd858114af0f6bdcd8d.jpg',
      'https://i.pinimg.com/736x/54/81/51/548151a8258babe8f07110951a99115f.jpg',
      'https://i.pinimg.com/736x/01/14/78/0114789446cd08bb165d20cd9876b324.jpg'
    ]
  }
];

// 單次固定照片組
const CAR_SET_4 = [
  'https://i.pinimg.com/736x/30/56/19/30561968f3d25e9c83ff6f53e8d89400.jpg',
  'https://i.pinimg.com/736x/d7/dc/85/d7dc85b6c9f71061e24f4eacccfe4dd5.jpg',
  'https://i.pinimg.com/736x/cf/b4/16/cfb41643162490631069a14bb3786083.jpg',
  'https://i.pinimg.com/1200x/90/48/6a/90486a77fe1045938dc6015c98ccba61.jpg'
];

const EVENT_SET_3 = [
  'https://images.plurk.com/2sASb4CxbR73NlWSwXPnOf.png',
  'https://i.pinimg.com/736x/14/b6/61/14b661e6d91214935199aa98e199e393.jpg',
  'https://i.pinimg.com/1200x/a6/8d/72/a68d7219beb565eae760423ce41fb14b.jpg'
];

const EVENT_SET_7 = [
  'https://i.pinimg.com/736x/4a/c8/a7/4ac8a72f524b0d6ed5adee400c8d3078.jpg',
  'https://i.pinimg.com/736x/8e/83/08/8e830871ee8801fe8ebb1f4ae6ee85f6.jpg',
  'https://i.pinimg.com/736x/53/cf/48/53cf486c2550f5189b1e824cb47a1882.jpg',
  'https://i.pinimg.com/736x/45/a7/52/45a752155d2d06bc7d6d9b205f3b71df.jpg',
  'https://i.pinimg.com/736x/a8/f2/b4/a8f2b4ec19ae051eec8cfa7bc14565c3.jpg',
  'https://i.pinimg.com/1200x/58/da/cf/58dacf1ae4fec8e2940f08106cf7242f.jpg',
  'https://i.pinimg.com/736x/2e/76/2c/2e762c3bd3e8f30a6828663c3705a25b.jpg'
];

// 所有未分類匯總（相簿頁面 All 標籤）
const ALL_UNCATEGORIZED_PHOTOS = [
  ...POOL_GYM,
  ...POOL_CAR,
  ...POOL_SELFIE,
  ...POOL_OUTING,
  ...CAR_SET_4,
  ...EVENT_SET_3,
  ...EVENT_SET_7,
  ...POOL_GD.flatMap(item => item.images)
];

// 視訊通話預設片段
const VIDEO_STREAMS = [
  { id: 1, title: 'Studio Fitting', poster: 'https://images.plurk.com/wGRATa3N4kmnXq7NfNW5q.jpg' },
  { id: 2, title: 'In the Van', poster: 'https://i.pinimg.com/736x/17/b6/1e/17b61e7e3cfb485941687fb05647a3fe.jpg' },
  { id: 3, title: 'Waiting Room', poster: 'https://images.plurk.com/5pOLToEI89ynuGrE6eK9zq.jpg' },
  { id: 4, title: 'Hotel Rest', poster: 'https://images.plurk.com/2W5EnleU58XmoB8Eny9om4.jpg' },
  { id: 5, title: 'Night Walk', poster: 'https://i.pinimg.com/736x/c8/c3/e6/c8c3e646c47bd83dbeb285393405087a.jpg' }
];

// 情報頁面資料
const INTEL_FEED_DATA = [
  {
    id: 'n1',
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
    badge: '品牌動態',
    badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    source: 'VOGUE KOREA OFFICIAL',
    time: '昨日 22:30',
    mainTitle: '重塑經典：高級珠寶腕錶全球品牌大使全新冬季畫報釋出',
    subTitle: '在光影交錯間展現從容不迫的紳士氣場。',
    summary: '極簡剪裁襯衫搭配冷色調針織，將克制與禁慾感拿捏得淋漓盡致。',
    heroImage: 'https://images.plurk.com/wGRATa3N4kmnXq7NfNW5q.jpg'
  }
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

  // 晨喚與通話
  const [isAlarmActive, setIsAlarmActive] = useState(true);
  const [hasAwoken, setHasAwoken] = useState(false);
  const [callStatus, setCallStatus] = useState('idle');
  const [callDuration, setCallDuration] = useState(0);

  // 視訊通話
  const [isVideoCalling, setIsVideoCalling] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);

  // 模組面板 ('none' | 'album' | 'calendar' | 'voices' | 'news')
  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [activeAlbumTab, setActiveAlbumTab] = useState('arena');

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

  // 隨機不重複（消耗池）抽選函式
  const pickRandomUnspent = (poolKey, items) => {
    const storageKey = `soo_spent_${poolKey}`;
    let spentIds = JSON.parse(localStorage.getItem(storageKey) || '[]');

    let available = items.filter(item => {
      const id = typeof item === 'string' ? item : item.id;
      return !spentIds.includes(id);
    });

    if (available.length === 0) {
      spentIds = [];
      localStorage.removeItem(storageKey);
      available = items;
    }

    const chosen = available[Math.floor(Math.random() * available.length)];
    const chosenId = typeof chosen === 'string' ? chosen : chosen.id;
    spentIds.push(chosenId);
    localStorage.setItem(storageKey, JSON.stringify(spentIds));

    return chosen;
  };

  // 觸發隨機不重複單照發送
  const triggerRandomSinglePhoto = (poolKey, pool, promptText) => {
    const imgUrl = pickRandomUnspent(poolKey, pool);
    setMessages(prev => [
      ...prev,
      {
        id: Date.now(),
        role: 'assistant',
        type: 'photo',
        imageUrl: imgUrl,
        time: getCurrentTime()
      }
    ]);
    if (promptText) {
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now() + 1,
            role: 'assistant',
            type: 'text',
            content: promptText,
            time: getCurrentTime()
          }
        ]);
        sendPushNotification(`Soo: ${promptText}`);
      }, 800);
    } else {
      sendPushNotification('Soo 傳送了一張照片');
    }
  };

  // 觸發隨機不重複志龍同遊組
  const triggerRandomGD = () => {
    const item = pickRandomUnspent('gd', POOL_GD);
    if (item.images.length === 1) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now(),
          role: 'assistant',
          type: 'photo',
          imageUrl: item.images[0],
          time: getCurrentTime()
        }
      ]);
    } else {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now(),
          role: 'assistant',
          type: 'album_grid',
          title: item.title || '同遊活動花絮',
          images: item.images,
          time: getCurrentTime()
        }
      ]);
    }
    sendPushNotification('Soo 傳送了照片組');
  };

  // 發送自訂相簿照片組
  const sendAlbumBatch = (title, images, promptText) => {
    setMessages(prev => [
      ...prev,
      {
        id: Date.now(),
        role: 'assistant',
        type: 'album_grid',
        title: title,
        images: images,
        time: getCurrentTime()
      }
    ]);
    if (promptText) {
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now() + 1,
            role: 'assistant',
            type: 'text',
            content: promptText,
            time: getCurrentTime()
          }
        ]);
        sendPushNotification(`Soo: ${promptText}`);
      }, 900);
    } else {
      sendPushNotification(`Soo 已傳送照片相簿 (${images.length}張)`);
    }
  };

  // 晨喚與整點排程檢查
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

  // 通話音效控制
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

  const requestNotification = async () => {
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

      {/* 主聊天容器：20~30% 乾淨灰白底色 */}
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

        {/* 📹 全螢幕視訊通話介面 */}
        {isVideoCalling && (
          <div className="absolute inset-0 bg-black z-50 flex flex-col justify-between items-center py-12 px-6 text-white animate-fade-in">
            <div className="absolute inset-0 z-0 overflow-hidden">
              <img 
                src={VIDEO_STREAMS[selectedVideoIndex].poster} 
                alt="Video stream" 
                className="w-full h-full object-cover scale-105 filter brightness-95" 
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/85" />
            </div>

            <div className="z-10 flex flex-col items-center mt-4 space-y-1">
              <span className="text-xl font-medium tracking-wide">Soo</span>
              <span className="text-xs text-emerald-400 font-mono tracking-widest">{formatSeconds(videoDuration)}</span>
              
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

            <div className="z-10 absolute top-16 right-5 w-24 h-36 rounded-2xl overflow-hidden border-2 border-white/40 shadow-2xl bg-slate-800">
              <div className="w-full h-full bg-slate-700/80 flex items-center justify-center text-xs text-white/50">
                本機鏡頭
              </div>
            </div>

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
                  {isAlarmActive ? (hasAwoken ? '晨喚已解除・排程中' : '晨喚待命・08:00 起') : '晨喚已關閉'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={() => setCallStatus('ringing')}
              title="語音通話"
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center transition"
            >
              <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24 11.72 11.72 0 003.68.59 1 1 0 011 1v3.5a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.48.59 3.68a1 1 0 01-.24 1.02l-2.23 2.09z" />
              </svg>
            </button>

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

        {/* 劇本控制板（全白圓鈕，含畫報、自拍、活動與隨機不重複按鈕） */}
        <div className="bg-slate-900/10 px-2.5 py-2 flex space-x-2 overflow-x-auto border-t border-slate-200/80 z-10 scrollbar-none shrink-0">
          {/* 隨機不重複按鈕群 */}
          <button
            onClick={() => triggerRandomSinglePhoto('gym', POOL_GYM, '今天課表做完了。')}
            title="隨機不重複: 健身"
            className="text-[12px] whitespace-nowrap bg-white hover:bg-slate-50 text-slate-800 font-medium px-3 py-1.5 rounded-full shadow-sm border border-slate-200 transition shrink-0 active:scale-95"
          >
            🏋️
          </button>

          <button
            onClick={() => triggerRandomSinglePhoto('car', POOL_CAR, '在路上了。')}
            title="隨機不重複: 車內自拍"
            className="text-[12px] whitespace-nowrap bg-white hover:bg-slate-50 text-slate-800 font-medium px-3 py-1.5 rounded-full shadow-sm border border-slate-200 transition shrink-0 active:scale-95"
          >
            🚘
          </button>

          <button
            onClick={() => triggerRandomSinglePhoto('selfie', POOL_SELFIE, '隨手拍一張。')}
            title="隨機不重複: 其他自拍"
            className="text-[12px] whitespace-nowrap bg-white hover:bg-slate-50 text-slate-800 font-medium px-3 py-1.5 rounded-full shadow-sm border border-slate-200 transition shrink-0 active:scale-95"
          >
            📷
          </button>

          <button
            onClick={triggerRandomGD}
            title="隨機不重複: 志龍同遊/活動"
            className="text-[12px] whitespace-nowrap bg-white hover:bg-slate-50 text-slate-800 font-medium px-3 py-1.5 rounded-full shadow-sm border border-slate-200 transition shrink-0 active:scale-95"
          >
            🐲
          </button>

          <button
            onClick={() => triggerRandomSinglePhoto('outing', POOL_OUTING, '出來透透氣。')}
            title="隨機不重複: 出門玩"
            className="text-[12px] whitespace-nowrap bg-white hover:bg-slate-50 text-slate-800 font-medium px-3 py-1.5 rounded-full shadow-sm border border-slate-200 transition shrink-0 active:scale-95"
          >
            🎡
          </button>

          {/* 固定畫報相簿群 */}
          <button
            onClick={() => sendAlbumBatch('TIME HOMME 25FW 【Breeze from the touch】 - I', TIME_HOMME_PART1, 'TIME HOMME 新一季畫報出爐了。')}
            title="TIME HOMME Part 1"
            className="text-[12px] whitespace-nowrap bg-white hover:bg-slate-50 text-slate-800 font-medium px-3 py-1.5 rounded-full shadow-sm border border-slate-200 transition shrink-0 active:scale-95"
          >
            ⏳
          </button>

          <button
            onClick={() => sendAlbumBatch('TIME HOMME 25FW 【Breeze from the touch】 - II', TIME_HOMME_PART2, '這組質地稍微硬挺一點。')}
            title="TIME HOMME Part 2"
            className="text-[12px] whitespace-nowrap bg-white hover:bg-slate-50 text-slate-800 font-medium px-3 py-1.5 rounded-full shadow-sm border border-slate-200 transition shrink-0 active:scale-95"
          >
            🪨
          </button>

          <button
            onClick={() => sendAlbumBatch('Delvaux Shanghai - Tempête XL Waves 16/10/2026', DELVAUX_IMAGES, '上海 Delvaux 活動現場照。')}
            title="Delvaux Shanghai"
            className="text-[12px] whitespace-nowrap bg-white hover:bg-slate-50 text-slate-800 font-medium px-3 py-1.5 rounded-full shadow-sm border border-slate-200 transition shrink-0 active:scale-95"
          >
            💼
          </button>

          {/* 單次自拍與活動組 */}
          <button
            onClick={() => sendAlbumBatch('車內隨拍組', CAR_SET_4, '剛剛在車上隨便拍的。')}
            title="單次車內自拍組"
            className="text-[12px] whitespace-nowrap bg-white hover:bg-slate-50 text-slate-800 font-medium px-3 py-1.5 rounded-full shadow-sm border border-slate-200 transition shrink-0 active:scale-95"
          >
            🚗
          </button>

          <button
            onClick={() => sendAlbumBatch('出席活動照', EVENT_SET_3, '活動現場。')}
            title="單次出席活動組 (3張)"
            className="text-[12px] whitespace-nowrap bg-white hover:bg-slate-50 text-slate-800 font-medium px-3 py-1.5 rounded-full shadow-sm border border-slate-200 transition shrink-0 active:scale-95"
          >
            ✨
          </button>

          <button
            onClick={() => sendAlbumBatch('活動全記錄', EVENT_SET_7, '收工了，今天這套造型拍了幾張。')}
            title="單次出席活動 (7張)"
            className="text-[12px] whitespace-nowrap bg-white hover:bg-slate-50 text-slate-800 font-medium px-3 py-1.5 rounded-full shadow-sm border border-slate-200 transition shrink-0 active:scale-95"
          >
            🖤
          </button>

          {/* Arena 與日常台詞 */}
          <button
            onClick={() => sendAlbumBatch('Arena Homme+ Nov 2026 - Series A', ARENA_ALL_IMAGES.slice(0, 11), '《Arena Homme+》A cut 樣片出來了。')}
            className="text-[12px] whitespace-nowrap bg-white hover:bg-slate-50 text-slate-800 font-medium px-3 py-1.5 rounded-full shadow-sm border border-slate-200 transition shrink-0 active:scale-95"
          >
            🐈‍⬛
          </button>

          <button
            onClick={() => sendAlbumBatch('Arena Homme+ Nov 2026 - Series B', ARENA_ALL_IMAGES.slice(11, 20), 'B 組色調稍微暗一點。')}
            className="text-[12px] whitespace-nowrap bg-white hover:bg-slate-50 text-slate-800 font-medium px-3 py-1.5 rounded-full shadow-sm border border-slate-200 transition shrink-0 active:scale-95"
          >
            🐆
          </button>

          <button
            onClick={() => sendAlbumBatch('Arena Homme+ Nov 2026 - Series C', ARENA_ALL_IMAGES.slice(20, 30), 'C cut 拍得比較隨性。')}
            className="text-[12px] whitespace-nowrap bg-white hover:bg-slate-50 text-slate-800 font-medium px-3 py-1.5 rounded-full shadow-sm border border-slate-200 transition shrink-0 active:scale-95"
          >
            🪵
          </button>

          <button
            onClick={() => sendAlbumBatch('Arena Homme+ Nov 2026 - Series D', ARENA_ALL_IMAGES.slice(30, 36), '最後一組特寫。')}
            className="text-[12px] whitespace-nowrap bg-white hover:bg-slate-50 text-slate-800 font-medium px-3 py-1.5 rounded-full shadow-sm border border-slate-200 transition shrink-0 active:scale-95"
          >
            🐺
          </button>
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

        {/* 彈出視窗 1️⃣：相簿功能（Arena、TIME HOMME、Delvaux 與全未分類） */}
        {activeModal === 'album' && (
          <div className="absolute inset-0 bg-slate-950/95 z-50 flex flex-col text-white backdrop-blur-md animate-fade-in">
            <div className="pt-10 pb-3 px-4 bg-[#212E3E] flex items-center justify-between shadow">
              <span className="font-medium text-base tracking-wide">照片庫 (Albums)</span>
              <button onClick={() => setActiveModal(null)} className="text-sm text-slate-400 hover:text-white px-2 py-1">關閉</button>
            </div>

            {/* 相簿標籤分頁 */}
            <div className="flex border-b border-white/10 px-3 pt-2 bg-slate-900/60 overflow-x-auto scrollbar-none">
              <button
                onClick={() => setActiveAlbumTab('arena')}
                className={`pb-2 mr-3 text-xs whitespace-nowrap font-medium tracking-wide border-b-2 transition ${
                  activeAlbumTab === 'arena' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-slate-400'
                }`}
              >
                Arena Homme+ ({ARENA_ALL_IMAGES.length})
              </button>
              <button
                onClick={() => setActiveAlbumTab('time')}
                className={`pb-2 mr-3 text-xs whitespace-nowrap font-medium tracking-wide border-b-2 transition ${
                  activeAlbumTab === 'time' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-slate-400'
                }`}
              >
                TIME HOMME 25FW ({TIME_HOMME_PART1.length + TIME_HOMME_PART2.length})
              </button>
              <button
                onClick={() => setActiveAlbumTab('delvaux')}
                className={`pb-2 mr-3 text-xs whitespace-nowrap font-medium tracking-wide border-b-2 transition ${
                  activeAlbumTab === 'delvaux' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-slate-400'
                }`}
              >
                Delvaux 2026 ({DELVAUX_IMAGES.length})
              </button>
              <button
                onClick={() => setActiveAlbumTab('uncategorized')}
                className={`pb-2 text-xs whitespace-nowrap font-medium tracking-wide border-b-2 transition ${
                  activeAlbumTab === 'uncategorized' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-slate-400'
                }`}
              >
                未分類歸檔 ({ALL_UNCATEGORIZED_PHOTOS.length})
              </button>
            </div>

            {/* 無縫連續三排相片牆 */}
            <div className="flex-1 overflow-y-auto p-2">
              {activeAlbumTab === 'arena' && (
                <div className="grid grid-cols-3 gap-1 rounded-xl overflow-hidden">
                  {ARENA_ALL_IMAGES.map((img, i) => (
                    <a key={i} href={img} target="_blank" rel="noreferrer" className="block aspect-[3/4] bg-slate-800 overflow-hidden">
                      <img src={img} alt="Arena Cut" loading="lazy" className="w-full h-full object-cover hover:scale-105 transition" />
                    </a>
                  ))}
                </div>
              )}

              {activeAlbumTab === 'time' && (
                <div className="grid grid-cols-3 gap-1 rounded-xl overflow-hidden">
                  {[...TIME_HOMME_PART1, ...TIME_HOMME_PART2].map((img, i) => (
                    <a key={i} href={img} target="_blank" rel="noreferrer" className="block aspect-[3/4] bg-slate-800 overflow-hidden">
                      <img src={img} alt="TIME HOMME Cut" loading="lazy" className="w-full h-full object-cover hover:scale-105 transition" />
                    </a>
                  ))}
                </div>
              )}

              {activeAlbumTab === 'delvaux' && (
                <div className="grid grid-cols-3 gap-1 rounded-xl overflow-hidden">
                  {DELVAUX_IMAGES.map((img, i) => (
                    <a key={i} href={img} target="_blank" rel="noreferrer" className="block aspect-[3/4] bg-slate-800 overflow-hidden">
                      <img src={img} alt="Delvaux Cut" loading="lazy" className="w-full h-full object-cover hover:scale-105 transition" />
                    </a>
                  ))}
                </div>
              )}

              {activeAlbumTab === 'uncategorized' && (
                <div className="grid grid-cols-3 gap-1 rounded-xl overflow-hidden">
                  {ALL_UNCATEGORIZED_PHOTOS.map((img, i) => (
                    <a key={i} href={img} target="_blank" rel="noreferrer" className="block aspect-[3/4] bg-slate-800 overflow-hidden">
                      <img src={img} alt="snap" loading="lazy" className="w-full h-full object-cover hover:scale-105 transition" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 彈出視窗 2️⃣：行事曆功能 */}
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

        {/* 彈出視窗 4️⃣：情報與動態 */}
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

                  <p className="text-[11.5px] text-slate-400 leading-relaxed font-light">
                    {item.summary}
                  </p>

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
