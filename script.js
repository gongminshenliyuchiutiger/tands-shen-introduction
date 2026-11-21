/* ==========================================================================
   時空學園：大型素養解題卡片遊戲 — 互動腳本
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initStarfield();
  initNavbar();
  initTabs();
  initKnowledgeCards();
  initAchievementFilter();
  initRevealAnimations();
  initDraggableMascot();
});

/* --------------------------------------------------------------------------
   1. 動態深空星軌畫布
   -------------------------------------------------------------------------- */
function initStarfield() {
  const canvas = document.getElementById('starfield');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let stars = [];
  let width = 0;
  let height = 0;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    const count = Math.min(130, Math.floor((width * height) / 14000));
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.6 + 0.4,
      vy: Math.random() * 0.25 + 0.08,
      alpha: Math.random() * 0.7 + 0.25,
      twinkle: Math.random() * 0.02 + 0.005,
      phase: Math.random() * Math.PI * 2,
      color: ['#00f0ff', '#a855f7', '#ffffff', '#fbbf24'][Math.floor(Math.random() * 4)]
    }));
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    for (const s of stars) {
      s.y -= s.vy;
      if (s.y < -4) {
        s.y = height + 4;
        s.x = Math.random() * width;
      }
      s.phase += s.twinkle;
      const opacity = Math.max(0.15, Math.min(1, s.alpha + Math.sin(s.phase) * 0.28));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = s.color;
      ctx.globalAlpha = opacity;
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(animate);
  }

  resize();
  window.addEventListener('resize', resize);
  animate();
}

/* --------------------------------------------------------------------------
   2. 頂部導覽列、手機版選單與回到頂部按鈕
   -------------------------------------------------------------------------- */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');
  const backToTop = document.getElementById('backToTop');
  const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (navbar) {
      navbar.classList.toggle('scrolled', scrollY > 40);
    }
    if (backToTop) {
      backToTop.classList.toggle('visible', scrollY > 420);
    }

    // 同步高亮當前章節連結
    let currentId = '';
    document.querySelectorAll('section[id]').forEach((sec) => {
      const top = sec.offsetTop - 130;
      if (scrollY >= top) {
        currentId = sec.getAttribute('id');
      }
    });
    navAnchors.forEach((a) => {
      a.classList.toggle('active', a.getAttribute('href') === `#${currentId}`);
    });
  });

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
      menuToggle.innerHTML = isOpen
        ? '<i class="fa-solid fa-xmark"></i>'
        : '<i class="fa-solid fa-bars"></i>';
    });

    navAnchors.forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
      });
    });
  }

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

/* --------------------------------------------------------------------------
   3. 通用互動分頁切換（支援頁面上多個獨立分頁群組）
   -------------------------------------------------------------------------- */
function initTabs() {
  const tabGroups = document.querySelectorAll('[data-tab-group]');
  tabGroups.forEach((group) => {
    const buttons = group.querySelectorAll('.tab-btn');
    const panels = group.querySelectorAll('.tab-panel');

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-tab');
        buttons.forEach((b) => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        panels.forEach((p) => {
          p.classList.toggle('active', p.getAttribute('data-panel') === target);
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
      });
    });
  });
}

/* --------------------------------------------------------------------------
   4. 10 大知識卡互動圖鑑切換
   -------------------------------------------------------------------------- */
function initKnowledgeCards() {
  const cardsData = [
    {
      key: 'person',
      name: '人物卡',
      en: 'PERSON CARD',
      icon: 'fa-solid fa-user-astronaut',
      desc: '收錄古今中外歷史名人、科學家、文學家與故事核心人物，協助戰士快速釐清文本中的人物關係、動機與貢獻。',
      tip: '閱讀人物卡時，留意人物所處朝代、代表成就與關鍵事件，常與「事件卡」「時間卡」聯動出題。',
      subjects: ['國語', '社會', '跨領域']
    },
    {
      key: 'event',
      name: '事件卡',
      en: 'EVENT CARD',
      icon: 'fa-solid fa-bolt',
      desc: '聚焦重要歷史戰役、文化運動、科學發現或情境轉折點，訓練戰士掌握前因後果與脈絡推論能力。',
      tip: '解題時可先鎖定題幹中的「起因」或「結果」，再對應事件卡上的核心關鍵詞。',
      subjects: ['社會', '國語', '自然']
    },
    {
      key: 'time',
      name: '時間卡',
      en: 'TIME CARD',
      icon: 'fa-solid fa-hourglass-half',
      desc: '標記時代背景、朝代年分、節氣時序或事件先後順序，是破解跨時代情境題與時序排序題的核心鑰匙。',
      tip: '遇到多段時間描述的長文題組，善用時間卡建立時間軸，即可大幅縮短判斷時間。',
      subjects: ['社會', '自然', '跨領域']
    },
    {
      key: 'object',
      name: '物件卡',
      en: 'OBJECT CARD',
      icon: 'fa-solid fa-cube',
      desc: '涵蓋文物古蹟、實驗器材、日常工具、特色飲食與科技裝置，幫助戰士從實物線索連結文化與科學原理。',
      tip: '留意物件的材質、用途與產地特徵，常出現在「臺灣行腳」與「飲食文化」等在地情境關卡中。',
      subjects: ['自然', '社會', '跨領域']
    },
    {
      key: 'place',
      name: '地點卡',
      en: 'LOCATION CARD',
      icon: 'fa-solid fa-map-location-dot',
      desc: '精準對應臺灣各縣市鄉鎮（如瑞芳、臺北、桃園、新北、基隆、宜蘭）與世界地理區域，強化空間概念與人文地景連結。',
      tip: '搭配「小倫遊臺灣」與「臺灣篇」戰役，熟悉各地氣候、地形與文化地標能輕鬆拿下高正確率。',
      subjects: ['社會', '跨領域']
    },
    {
      key: 'language',
      name: '語文卡',
      en: 'LANGUAGE CARD',
      icon: 'fa-solid fa-book-open',
      desc: '整合詞彙修辭、成語典故、英文單字句型與篇章主旨，直接強化語意理解與跨語言文本判讀實力。',
      tip: '搭配國語小劍士或英語小術士導師，以及戰寵「快讚」的關鍵字提示，讀長文更得心應手。',
      subjects: ['國語', '英語']
    },
    {
      key: 'math',
      name: '數學卡',
      en: 'MATH CARD',
      icon: 'fa-solid fa-square-root-variable',
      desc: '封裝數量關係、比例換算、幾何性質、機率統計與邏輯公式，將生活情境轉譯為精準的數學模型。',
      tip: '面對圖表與數據文字題時，先確認單位與條件限制，再將對應數學卡拖曳至答案格。',
      subjects: ['數學', '自然']
    },
    {
      key: 'symbol',
      name: '符號卡',
      en: 'SYMBOL CARD',
      icon: 'fa-solid fa-icons',
      desc: '解析地圖圖例、標誌意涵、化學元素符號、樂譜或文化象徵，培養跨模態的資訊解讀與轉換能力。',
      tip: '符號卡常隱藏精簡卻關鍵的線索，點擊卡片上的迴紋針外部連結可快速補足背景知識。',
      subjects: ['數學', '自然', '跨領域']
    },
    {
      key: 'concept',
      name: '概念卡',
      en: 'CONCEPT CARD',
      icon: 'fa-solid fa-lightbulb',
      desc: '歸納學科核心定義、科學定律、社會制度與抽象原則，訓練高層次的摘要分析與概念遷移應用。',
      tip: '概念卡最考驗「舉一反三」，在穿梭階段先預讀手牌概念卡能有效提升出擊命中率。',
      subjects: ['自然', '社會', '數學']
    },
    {
      key: 'phenomenon',
      name: '現象卡',
      en: 'PHENOMENON CARD',
      icon: 'fa-solid fa-cloud-bolt',
      desc: '記錄自然界物理化學反應、天文氣象變化、生態互動與社會趨勢現象，引導戰士從觀察走向科學推論。',
      tip: '結合「概念卡」與「現象卡」思考因果機制，就能輕鬆看穿高難度跨科素養題組。',
      subjects: ['自然', '社會', '跨領域']
    }
  ];

  const items = document.querySelectorAll('.kcard-item');
  const titleEl = document.getElementById('kcardDetailTitle');
  const enEl = document.getElementById('kcardDetailEn');
  const iconEl = document.getElementById('kcardDetailIcon');
  const descEl = document.getElementById('kcardDetailDesc');
  const tipEl = document.getElementById('kcardDetailTip');
  const tagsEl = document.getElementById('kcardDetailTags');

  if (!items.length || !titleEl) return;

  function renderCard(key) {
    const data = cardsData.find((c) => c.key === key) || cardsData[0];
    titleEl.textContent = data.name;
    enEl.textContent = data.en;
    iconEl.className = data.icon;
    descEl.textContent = data.desc;
    tipEl.textContent = data.tip;
    tagsEl.innerHTML = data.subjects
      .map((s) => `<span class="pill cyan"><i class="fa-solid fa-tag"></i> ${s}</span>`)
      .join('');
  }

  items.forEach((item) => {
    item.addEventListener('click', () => {
      items.forEach((i) => i.classList.remove('active'));
      item.classList.add('active');
      renderCard(item.getAttribute('data-kcard'));
    });
  });

  renderCard('person');
}

/* --------------------------------------------------------------------------
   5. 璀璨成就系統分類篩選
   -------------------------------------------------------------------------- */
function initAchievementFilter() {
  const chips = document.querySelectorAll('.filter-chip[data-ach-filter]');
  const cards = document.querySelectorAll('.achievement-card[data-ach-cat]');
  if (!chips.length) return;

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const filter = chip.getAttribute('data-ach-filter');
      chips.forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');

      cards.forEach((card) => {
        const cat = card.getAttribute('data-ach-cat');
        const show = filter === 'all' || cat === filter;
        card.style.display = show ? 'flex' : 'none';
      });
    });
  });
}

/* --------------------------------------------------------------------------
   6. 捲動進場動畫
   -------------------------------------------------------------------------- */
function initRevealAnimations() {
  const els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('in-view'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  els.forEach((el) => observer.observe(el));
}

/* --------------------------------------------------------------------------
   7. 左下角吉祥物：自由拖曳至畫面任意處（支援滑鼠與觸控 Pointer Events）
   -------------------------------------------------------------------------- */
function initDraggableMascot() {
  const mascot = document.getElementById('mascotWidget');
  if (!mascot) return;

  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  function clampPosition(left, top) {
    const rect = mascot.getBoundingClientRect();
    const maxLeft = Math.max(0, window.innerWidth - rect.width);
    const maxTop = Math.max(0, window.innerHeight - rect.height);
    return {
      left: Math.min(Math.max(0, left), maxLeft),
      top: Math.min(Math.max(0, top), maxTop)
    };
  }

  mascot.addEventListener('pointerdown', (e) => {
    isDragging = true;
    const rect = mascot.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;

    // 首次拖曳時切換為 left/top 絕對視窗座標定位，方便移動到任何角落
    mascot.style.left = `${rect.left}px`;
    mascot.style.top = `${rect.top}px`;
    mascot.style.bottom = 'auto';
    mascot.style.right = 'auto';

    mascot.classList.add('dragging');
    if (mascot.setPointerCapture) {
      mascot.setPointerCapture(e.pointerId);
    }
    e.preventDefault();
  });

  mascot.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    const pos = clampPosition(e.clientX - offsetX, e.clientY - offsetY);
    mascot.style.left = `${pos.left}px`;
    mascot.style.top = `${pos.top}px`;
  });

  function stopDrag(e) {
    if (!isDragging) return;
    isDragging = false;
    mascot.classList.remove('dragging');
    if (e && mascot.releasePointerCapture) {
      try {
        mascot.releasePointerCapture(e.pointerId);
      } catch (_) {
        // 忽略未捕獲指標的例外
      }
    }
  }

  mascot.addEventListener('pointerup', stopDrag);
  mascot.addEventListener('pointercancel', stopDrag);

  // 視窗縮放時確保吉祥物仍保持在可視畫面範圍內
  window.addEventListener('resize', () => {
    if (mascot.style.top && mascot.style.top !== 'auto') {
      const rect = mascot.getBoundingClientRect();
      const pos = clampPosition(rect.left, rect.top);
      mascot.style.left = `${pos.left}px`;
      mascot.style.top = `${pos.top}px`;
    }
  });
}
