const DEFAULT_AP_PLUS_RECORDS = []
;
    const STORAGE_KEY = 'rotaeno_user_scores_v1';
    const MASTER_SONGS_KEY = 'rotaeno_master_songs_v2';
    const OLD_CUSTOM_SONGS_KEY = 'rotaeno_custom_songs_v1';
    const PACK_ORDER_KEY = 'rotaeno_pack_order_v1';
    const AP_PLUS_KEY = 'rotaeno_ap_plus_records_v1';
    const SHOW_DATE_KEY = 'rotaeno_show_ap_plus_date_v1';
    const AUTO_RECORD_AP_PLUS_KEY = 'rotaeno_auto_record_ap_plus_v1';
    let savedApPlusRecords = [];
    let autoRecordApPlus = true;
    const STATS_SCOPE_KEY = 'rotaeno_stats_scope_v1';
    const USER_SHEET_URL_KEY = 'rotaeno_user_sheet_url_v1';
    const GAS_URL_KEY = 'rotaeno_gas_url_v1';
    const GAS_LAST_SYNC_KEY = 'rotaeno_gas_last_sync_v1';
    const AUTO_SYNC_KEY = 'rotaeno_auto_sync_v1';
    const THEME_PREF_KEY = 'rotaeno_theme_preference_v1';
    const POPUP_LAST_SEEN_ID_KEY = 'rotaeno_popup_last_seen_id_v1';
    const POPUP_LAST_FETCH_AT_KEY = 'rotaeno_popup_last_fetch_at_v1';
    const POPUP_SNOOZE_AT_KEY = 'rotaeno_popup_snooze_at_v1';
    const POPUP_CACHE_DATA_KEY = 'rotaeno_popup_cached_items_v1';
    const POPUP_RELOAD_COOLDOWN_MS = 15 * 60 * 1000;      // リロード時GAS通信クールダウン: 15分
    const POPUP_TAB_SWITCH_COOLDOWN_MS = 12 * 60 * 60 * 1000; // タブ切替時GAS通信クールダウン: 12時間(半日)
    const POPUP_SNOOZE_COOLDOWN_MS = 60 * 60 * 1000;      // 「後で確認する」再表示クールダウン: 1時間
    const DEFAULT_GAS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbw2W83eJjx1A2HbUH1XnKpBpjPuA66vEo9xoqQJFm2s2rMdqwyfepBCXuUpRMdmJbLV/exec';
    let userSheetUrl = localStorage.getItem(USER_SHEET_URL_KEY) || '';
    let gasAppUrl = localStorage.getItem(GAS_URL_KEY) || DEFAULT_GAS_ENDPOINT;
    let autoSyncEnabled = localStorage.getItem(AUTO_SYNC_KEY) === 'true';
    let currentThemePref = localStorage.getItem(THEME_PREF_KEY) || 'light';
    if (currentThemePref === 'auto') {
      currentThemePref = 'light';
    }

    // Core Constants
    const THEORY_SCORE = 1010000;
    const DEFAULT_VERSION = '(バージョン未設定)';
    const DEFAULT_PACK = '(パック未設定)';
    const DIFF_KEYS_ASC = ['I', 'II', 'III', 'IV', 'IV-α'];
    const DIFF_KEYS_DESC = ['IV-α', 'IV', 'III', 'II', 'I'];

    function getResolvedSongId(song, songInitId) {
      return (song && song.songId) ? String(song.songId) : ('song_' + songInitId);
    }

    let masterSongs = [];
    let savedMasterSongs = [];
    let userScores = {};
    let savedScores = {};
    let packOrder = [];
    let savedPackOrder = [];
    let apPlusRecords = [];
    let showApPlusDate = true;
    let currentStatsScope = localStorage.getItem(STATS_SCOPE_KEY) || 'ALL';
    let currentMypageSubView = 'stats';
    let apPlusSearchQuery = '';
    let apPlusSort = 'NO_ASC';

    // Game Official Song Pack Order (Matching in-game selection list)
    let GAME_PACK_ORDER = [
      '基本曲',
      '第1章 - 旅の始まり',
      '第2章 - 災難と希望',
      '第3章 - 水と油',
      '小さなしずくの大冒険',
      '永久の光、新たな命へ',
      '空、宇宙船、そして大切なもの――',
      '果てしなき夏の狂騒曲',
      'Rotaeno学園祭',
      '新時代',
      '二人の出会い',
      '軌跡：夢が芽生えた日',
      'maimai コラボ',
      'WACCA コラボ II',
      'Mili セレクション',
      'Cosmic Radio 2025',
      'Dynamix Universe コラボ',
      'KALPA: Cosmic Symphony コラボ',
      'Cytus II コラボ',
      'Tanchiky セレクション',
      'NOISZ SL + PK GODHAND コラボ',
      'Muse Dash コラボ',
      'DEEMO II コラボ',
      'Dynamix コラボ',
      'Rizline コラボ',
      'Paradigm: Rebootコラボ',
      'Arcaea コラボ',
      'LiveMania',
      'Lanota コラボ',
      'HARDCORE TANO*C コラボ II',
      'HARDCORE TANO*C コラボ I',
      'Phigros コラボ',
      'KALPA コラボ',
      'WACCA コラボ I',
      '明日へ響け',
      '次元を超える約束',
      'DECO*27 コラボ',
      'ピノキオピー コラボ',
      '未来の歌',
      '晩夏の夢',
      '風の向くまま',
      '迷いのルミナリウム',
      'ナニコア?!',
      '黄金時代',
      '雪の下の思い出',
      'Ψ: 脳波オーバーロード',
      '異世界物語：追憶',
      '音の継承',
      '熾熱の魂',
      'パープルレイヴ',
      'ファンキーパーティー',
      'オーブの声',
      '無色透明',
      'ピアノライフ',
      'ジオメトリーパルス',
      '街角のレストラン',
      '機械都市',
      'Rock (Y)our World',
      '星々の声',
      '星明りの秘蔵'
    ];

    function loadPackOrder() {
      const saved = localStorage.getItem(PACK_ORDER_KEY);
      if (saved) {
        try {
          packOrder = JSON.parse(saved);
          if (!Array.isArray(packOrder)) packOrder = [...GAME_PACK_ORDER];
        } catch (e) {
          packOrder = [...GAME_PACK_ORDER];
        }
      } else {
        packOrder = [...GAME_PACK_ORDER];
      }
      const existingPacks = [...new Set(masterSongs.map(s => s[6]))].filter(Boolean);
      existingPacks.forEach(p => {
        if (!packOrder.includes(p)) packOrder.push(p);
      });
      savedPackOrder = [...packOrder];
    }

    function savePackOrder() {
      localStorage.setItem(PACK_ORDER_KEY, JSON.stringify(packOrder));
      savedPackOrder = [...packOrder];
    }

    // Constant to Level Formula
    function calcLevelFromConstant(c) {
      if (c === null || c === undefined || isNaN(c) || c === '' || Number(c) <= 0) return '-';
      const num = Number(c);
      const floorVal = Math.floor(num);
      if (floorVal < 10) return String(floorVal);
      const frac = Math.round((num - floorVal) * 10) / 10;
      return frac >= 0.6 ? (floorVal + '+') : String(floorVal);
    }

    function calculateInitIdForDiff(diff, insertAfterTitle) {
      const diffTuples = masterSongs.filter(s => s[2] === diff);
      diffTuples.sort((a, b) => a[12] - b[12]);

      let refTuple = null;
      if (insertAfterTitle) {
        const lowerTitle = insertAfterTitle.toLowerCase();
        refTuple = diffTuples.find(s => s[1].toLowerCase() === lowerTitle);
        if (!refTuple) {
          const anyMatch = masterSongs.find(s => s[1].toLowerCase() === lowerTitle);
          if (anyMatch) {
            refTuple = diffTuples.find(s => s[7] === anyMatch[7]);
          }
        }
      }

      if (refTuple) {
        const prevInitId = refTuple[12];
        const nextTuple = diffTuples.find(s => s[12] > prevInitId);
        if (nextTuple) {
          return (prevInitId + nextTuple[12]) / 2;
        } else {
          return prevInitId + 0.5;
        }
      }

      if (diffTuples.length > 0) {
        return diffTuples[diffTuples.length - 1][12] + 0.5;
      }

      const defaultBases = { 'IV-α': 1, 'IV': 467, 'III': 900, 'II': 1333, 'I': 1766 };
      return (defaultBases[diff] || 1766) + 0.5;
    }

    function getLastSongOfPack(packName) {
      if (!packName) return '';
      const packSongs = masterSongs.filter(s => s[6] === packName && s[2] === 'IV');
      packSongs.sort((a, b) => a[12] - b[12]);
      if (packSongs.length > 0) {
        return packSongs[packSongs.length - 1][1];
      }
      const anyPackSongs = masterSongs.filter(s => s[6] === packName);
      anyPackSongs.sort((a, b) => a[12] - b[12]);
      return anyPackSongs.length > 0 ? anyPackSongs[anyPackSongs.length - 1][1] : '';
    }

    function getChartTitleFromSongObj(song, diff) {
      const baseTitle = safeSongTitle(song.title);
      if (diff === 'IV-α') {
        const dObj = song.diffs && song.diffs['IV-α'];
        const alphaTitle = safeSongTitle((dObj && dObj.title) ? dObj.title : (song.titleAlpha || ''));
        if (alphaTitle) return alphaTitle;
      }
      return baseTitle;
    }

    function songObjToTuples(song, insertAfterTitleOrBaseId) {
      const tuples = [];
      const diffKeys = ['I', 'II', 'III', 'IV'];
      if (song.diffs && song.diffs['IV-α']) diffKeys.push('IV-α');

      const isNumericBase = typeof insertAfterTitleOrBaseId === 'number';
      const insertAfterTitle = typeof insertAfterTitleOrBaseId === 'string' ? insertAfterTitleOrBaseId : '';

      diffKeys.forEach((diff, idx) => {
        const d = song.diffs[diff];
        if (!d || isNaN(d.constant)) return;
        const initId = isNumericBase
          ? (insertAfterTitleOrBaseId + idx)
          : calculateInitIdForDiff(diff, insertAfterTitle);

        tuples.push([
          song.songId + '_' + diff,
          getChartTitleFromSongObj(song, diff),
          diff,
          d.level || calcLevelFromConstant(d.constant),
          d.constant,
          0,
          song.pack || DEFAULT_PACK,
          song.songId,
          Number(song.endOfSale) || 0,
          0,
          '',
          song.version || DEFAULT_VERSION,
          initId
        ]);
      });
      return tuples;
    }

    // Unified Master Songs Management
    function getSongGroups(tuples) {
      const map = new Map();
      tuples.forEach(t => {
        const songId = t[7];
        const chartTitle = safeSongTitle(t[1]);
        if (!map.has(songId)) {
          map.set(songId, {
            songId: t[7],
            title: chartTitle,
            titleAlpha: '',
            pack: t[6],
            version: t[11],
            endOfSale: t[8] || 0,
            initId: (t[12] !== undefined && !isNaN(t[12])) ? Number(t[12]) : 999999,
            diffs: {}
          });
        }
        const group = map.get(songId);
        if (t[2] !== 'IV-α') {
          group.title = chartTitle;
        }
        if (t[2] === 'IV' && t[12] !== undefined && !isNaN(t[12])) {
          group.initId = Number(t[12]);
        }
        const diffEntry = {
          constant: t[4],
          level: t[3]
        };
        if (t[2] === 'IV-α') {
          diffEntry.title = chartTitle;
        }
        group.diffs[t[2]] = diffEntry;
      });
      const list = Array.from(map.values());
      list.forEach(s => {
        if (s.diffs['IV-α']) {
          const alphaT = s.diffs['IV-α'].title || '';
          if (alphaT && alphaT !== s.title) {
            s.titleAlpha = alphaT;
          } else {
            delete s.diffs['IV-α'].title;
          }
        }
      });
      // Sort by initId so songs are in true game default order
      list.sort((a, b) => (a.initId || 0) - (b.initId || 0));

      // Re-index consecutive integers 1, 2, 3...
      list.forEach((s, idx) => {
        s.initId = idx + 1;
      });
      return list;
    }

    function getAllSongs() {
      return masterSongs;
    }

    const DIFF_SORT_ORDER = { 'IV-α': 0, 'IV': 1, 'III': 2, 'II': 3, 'I': 4 };

    function compareDefaultOrder(a, b) {
      const diffA = a.diff !== undefined ? a.diff : a[2];
      const diffB = b.diff !== undefined ? b.diff : b[2];
      const dA = DIFF_SORT_ORDER[diffA] !== undefined ? DIFF_SORT_ORDER[diffA] : 99;
      const dB = DIFF_SORT_ORDER[diffB] !== undefined ? DIFF_SORT_ORDER[diffB] : 99;
      if (dA !== dB) return dA - dB;

      const oA = Number(a.initId !== undefined ? a.initId : (a[12] || 0));
      const oB = Number(b.initId !== undefined ? b.initId : (b[12] || 0));
      return oA - oB;
    }

    function safeSongTitle(val) {
      if (val === null || val === undefined) return '';
      if (typeof val === 'boolean') return val ? 'True' : 'False';
      const str = String(val).trim();
      if (str.toLowerCase() === 'true') return 'True';
      if (str.toLowerCase() === 'false') return 'False';
      return str;
    }

    function normalizeMasterSongOrders(tuples) {
      if (!Array.isArray(tuples) || tuples.length === 0) return tuples;
      const songGroups = getSongGroups(tuples);
      const songOrderMap = new Map();
      songGroups.forEach(s => songOrderMap.set(s.songId, s.initId));
      tuples.forEach(t => {
        t[1] = safeSongTitle(t[1]);
        if (songOrderMap.has(t[7])) {
          t[12] = songOrderMap.get(t[7]);
        }
      });
      tuples.sort((a, b) => compareDefaultOrder(a, b));
      return tuples;
    }

    function loadMasterSongs() {
      const saved = localStorage.getItem(MASTER_SONGS_KEY);
      if (saved) {
        try {
          masterSongs = JSON.parse(saved);
          if (Array.isArray(masterSongs) && masterSongs.length > 0) {
            masterSongs = normalizeMasterSongOrders(masterSongs);
            savedMasterSongs = JSON.parse(JSON.stringify(masterSongs));
            saveMasterSongs();
            return true;
          }
        } catch (e) {
          console.error('Error loading masterSongs from localStorage:', e);
        }
      }

      masterSongs = [];
      savedMasterSongs = [];
      return false;
    }

    function saveMasterSongs() {
      localStorage.setItem(MASTER_SONGS_KEY, JSON.stringify(masterSongs));
      savedMasterSongs = JSON.parse(JSON.stringify(masterSongs));
    }

    function formatApPlusDate(val) {
      if (!val) return '';
      const str = String(val).trim();
      if (!str || str === 'undefined' || str === 'null' || str === '-') return '';
      // 既に '2025/4/12' や '2025/04/12' のような短い形式
      if (/^d{4}[/-]d{1,2}[/-]d{1,2}$/.test(str)) {
        return str.replace(/-/g, '/');
      }
      const d = new Date(str);
      if (!isNaN(d.getTime())) {
        return d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate();
      }
      return str;
    }

    function normalizeApPlusRecord(r) {
      if (!r) return r;
      const title = (r.title || '').trim();
      const diff = (r.diff || '').trim();
      
      let match = null;
      if (r.chartId) {
        match = masterSongs.find(s => s[0] === r.chartId);
      }
      if (!match) {
        match = masterSongs.find(s => s[1].toLowerCase() === title.toLowerCase() && s[2] === diff);
      }
      if (!match && title) {
        const anySongMatch = masterSongs.find(s => s[1].toLowerCase() === title.toLowerCase());
        if (anySongMatch) {
          match = masterSongs.find(s => s[7] === anySongMatch[7] && s[2] === diff);
        }
      }
      const resolvedTitle = match ? match[1] : safeSongTitle(title);
      
      const level = (r.level && r.level !== 'undefined' && r.level !== 'null')
        ? String(r.level)
        : (match ? match[3] : '-');

      const constant = (r.constant !== undefined && r.constant !== null && !isNaN(r.constant) && Number(r.constant) > 0)
        ? Number(r.constant)
        : (match ? match[4] : 0);

      const chartId = r.chartId || (match ? match[0] : '');
      const date = formatApPlusDate(r.date);

      return {
        no: Number(r.no) || 0,
        title: resolvedTitle,
        diff: diff,
        level: level,
        constant: constant,
        chartId: chartId,
        date: date,
        note: r.note || ''
      };
    }

    function loadApPlusRecords() {
      const saved = localStorage.getItem(AP_PLUS_KEY);
      if (saved) {
        try {
          apPlusRecords = JSON.parse(saved);
        } catch (e) {
          console.error(e);
          apPlusRecords = [];
        }
      } else {
        apPlusRecords = [];
        localStorage.setItem(AP_PLUS_KEY, JSON.stringify(apPlusRecords));
      }

      if (Array.isArray(apPlusRecords) && apPlusRecords.length > 0) {
        apPlusRecords = apPlusRecords.map(normalizeApPlusRecord);
        localStorage.setItem(AP_PLUS_KEY, JSON.stringify(apPlusRecords));
      }

      savedApPlusRecords = JSON.parse(JSON.stringify(apPlusRecords));

      const savedDatePref = localStorage.getItem(SHOW_DATE_KEY);
      if (savedDatePref !== null) {
        showApPlusDate = savedDatePref === 'true';
      }
      const chk = document.getElementById('chkShowApPlusDate');
      if (chk) chk.checked = showApPlusDate;

      const savedAutoPref = localStorage.getItem(AUTO_RECORD_AP_PLUS_KEY);
      if (savedAutoPref !== null) {
        autoRecordApPlus = savedAutoPref === 'true';
      }
      const chkAuto = document.getElementById('chkAutoRecordApPlus');
      if (chkAuto) chkAuto.checked = autoRecordApPlus;

      applyApPlusDateVisibility();
      updateMypageBadges();
    }

    function saveApPlusRecords() {
      localStorage.setItem(AP_PLUS_KEY, JSON.stringify(apPlusRecords));
      savedApPlusRecords = JSON.parse(JSON.stringify(apPlusRecords));
      updateMypageBadges();
      checkUnsavedChanges();
    }

    function applyApPlusDateVisibility() {
      const table = document.getElementById('apPlusTable');
      if (table) {
        table.classList.toggle('hide-date', !showApPlusDate);
      }
    }

    function updateMypageBadges() {
      const badge = document.getElementById('mypageApPlusCountBadge');
      if (badge) {
        badge.textContent = apPlusRecords.length.toString();
      }
    }

    function setStatsScope(scope) {
      currentStatsScope = (scope === 'IV_PLUS') ? 'IV_PLUS' : 'ALL';
      localStorage.setItem(STATS_SCOPE_KEY, currentStatsScope);
      updateStatsScopeUI();
      renderMypageStats();
    }

    function updateStatsScopeUI() {
      const btnAll = document.getElementById('btnScopeAll');
      const btnIv = document.getElementById('btnScopeIv');
      if (btnAll && btnIv) {
        if (currentStatsScope === 'IV_PLUS') {
          btnAll.classList.remove('active');
          btnIv.classList.add('active');
        } else {
          btnAll.classList.add('active');
          btnIv.classList.remove('active');
        }
      }
    }

    function switchMypageSubView(subview, options = {}) {
      currentMypageSubView = subview;
      const navStats = document.getElementById('mypageNavStats');
      const navB40 = document.getElementById('mypageNavB40');
      const navApPlus = document.getElementById('mypageNavApPlus');
      if (navStats) navStats.classList.toggle('active', subview === 'stats');
      if (navB40) navB40.classList.toggle('active', subview === 'b40');
      if (navApPlus) navApPlus.classList.toggle('active', subview === 'applus');

      const subStats = document.getElementById('mypageSubStats');
      const subB40 = document.getElementById('mypageSubB40');
      const subApPlus = document.getElementById('mypageSubApPlus');
      if (subStats) subStats.style.display = subview === 'stats' ? 'block' : 'none';
      if (subB40) subB40.style.display = subview === 'b40' ? 'block' : 'none';
      if (subApPlus) subApPlus.style.display = subview === 'applus' ? 'block' : 'none';

      if (options.scroll !== false) {
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
      if (options.save !== false) {
        saveFilterState();
      }
    }

    function loadInitialScores() {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          userScores = JSON.parse(saved);
          let updated = false;
          Object.keys(userScores).forEach(id => {
            if (userScores[id] && userScores[id].score === THEORY_SCORE && userScores[id].status !== 'AP+') {
              userScores[id].status = 'AP+';
              updated = true;
            }
          });
          if (updated) localStorage.setItem(STORAGE_KEY, JSON.stringify(userScores));
          savedScores = JSON.parse(JSON.stringify(userScores));
          return;
        } catch (e) {
          console.error(e);
        }
      }
      userScores = {};
      savedScores = {};
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userScores));
    }

    function saveScores() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userScores));
      savedScores = JSON.parse(JSON.stringify(userScores));
      checkUnsavedChanges();
      showSaveToast();
    }

    function checkUnsavedChanges() {
      const unsavedBar = document.getElementById('unsavedBar');
      const countEl = document.getElementById('unsavedCountText');
      if (!unsavedBar) return;

      const allIds = new Set([...Object.keys(userScores), ...Object.keys(savedScores)]);
      let scoreDiffCount = 0;
      for (const id of allIds) {
        const u = userScores[id] || { score: 0, status: '' };
        const s = savedScores[id] || { score: 0, status: '' };
        if (u.score !== s.score || u.status !== s.status) {
          scoreDiffCount++;
        }
      }

      const isSongsChanged = JSON.stringify(masterSongs) !== JSON.stringify(savedMasterSongs);
      const isPackOrderChanged = JSON.stringify(packOrder) !== JSON.stringify(savedPackOrder);
      const isApPlusChanged = JSON.stringify(apPlusRecords) !== JSON.stringify(savedApPlusRecords);
      let apPlusDiffCount = 0;
      if (isApPlusChanged) {
        apPlusDiffCount = Math.abs(apPlusRecords.length - savedApPlusRecords.length);
        if (apPlusDiffCount === 0) apPlusDiffCount = 1;
      }

      const currentSongIds = new Set(masterSongs.map(s => s[7]));
      const savedSongIds = new Set(savedMasterSongs.map(s => s[7]));
      let newSongsCount = 0;
      currentSongIds.forEach(id => {
        if (!savedSongIds.has(id)) newSongsCount++;
      });
      let removedSongsCount = 0;
      savedSongIds.forEach(id => {
        if (!currentSongIds.has(id)) removedSongsCount++;
      });

      const hasUnsaved = scoreDiffCount > 0 || isSongsChanged || isPackOrderChanged || isApPlusChanged;

      if (hasUnsaved) {
        const details = [];
        if (newSongsCount > 0) details.push('追加 ' + newSongsCount + '曲');
        if (removedSongsCount > 0) details.push('削除 ' + removedSongsCount + '曲');
        if (isSongsChanged && newSongsCount === 0 && removedSongsCount === 0) details.push('楽曲マスター更新');
        if (scoreDiffCount > 0) details.push('スコア ' + scoreDiffCount + '件');
        if (isPackOrderChanged) details.push('パック順序');
        if (apPlusDiffCount > 0) details.push('理論値記録 ' + apPlusDiffCount + '件');
        if (countEl) countEl.textContent = details.length ? ('(' + details.join(' / ') + ')') : '';
        unsavedBar.classList.add('visible');
      } else {
        if (countEl) countEl.textContent = '';
        unsavedBar.classList.remove('visible');
      }

      renderStagedCards();
    }

    function showSaveToast(msg) {
      const toast = document.getElementById('saveToast');
      if (!toast) return;
      toast.textContent = msg || '💾 保存しました';
      toast.classList.add('show');
      setTimeout(() => {
        toast.classList.remove('show');
      }, 2200);
    }

    // Rating Formula
    function calcSingleRating(score, constant, endOfSale) {
      if (endOfSale === 1 || !score || score <= 0) return 0;
      if (score >= 1008000) {
        return constant + 3.4 + (score - 1008000) / 10000;
      } else if (score >= 1004000) {
        return constant + 2.4 + (score - 1004000) / 4000;
      } else if (score >= 1000000) {
        return constant + 2.0 + (score - 1000000) / 10000;
      } else if (score >= 980000) {
        return constant + 1.0 + (score - 980000) / 20000;
      } else if (score >= 950000) {
        return constant + 0.0 + (score - 950000) / 30000;
      } else if (score >= 900000) {
        return constant - 1.0 + (score - 900000) / 50000;
      } else if (score >= 500000) {
        return constant - 5.0 + (score - 500000) / 100000;
      } else {
        return Math.max(constant - 9999 + score * (4997 / 250000), 0);
      }
    }

    // Completion AD Formula
    function calcCompletionAD(score, constant, difficulty, status, endOfSale) {
      const w = calcSingleRating(score, constant, endOfSale);
      if (w <= 0 || endOfSale === 1) return { ad: 0, diffJudge: 0 };

      const basic = (w / (constant + 3.6)) * 0.925;
      let exPlus = 0;
      if (score >= 1009900) exPlus = 0.04 + (score - 1009900) * 0.0001;
      else if (score >= 1009750) exPlus = 0.0325 + (score - 1009750) * 0.00005;
      else if (score >= 1009500) exPlus = 0.0225 + (score - 1009500) * 0.00004;
      else if (score >= 1009250) exPlus = 0.015 + (score - 1009250) * 0.00003;
      else if (score >= 1009000) exPlus = 0.01 + (score - 1009000) * 0.00002;
      else if (score >= 1008000) exPlus = (score - 1008000) * 0.00001;

      let clearBonus = 0;
      if (score === THEORY_SCORE || status === 'AP+') clearBonus = 0.025;
      else if (status === 'AP') clearBonus = 0.02;
      else if (status === 'FC') clearBonus = 0.01;

      let diffJudge = 0;
      if (difficulty === 'I') diffJudge = 0.7;
      else if (difficulty === 'II') diffJudge = 0.8;
      else if (difficulty === 'III') diffJudge = 0.9;
      else if (difficulty === 'IV') diffJudge = 1.0;
      else if (difficulty === 'IV-α') diffJudge = 666;

      const raw = Math.min(1.0, basic + exPlus + clearBonus);
      let ad = 0;
      if (diffJudge === 666) {
        ad = Math.round(raw * 1000) / 1000;
      } else {
        ad = Math.round(diffJudge * raw * 1000) / 1000;
      }
      return { ad, diffJudge };
    }

    // Inverse Rating Formula: Calculate minimum score required to achieve targetRating
    function calcScoreFromRating(targetRating, constant) {
      const diff = targetRating - constant;
      let targetScore = 0;
      if (diff >= 3.4) {
        targetScore = 1008000 + (diff - 3.4) * 10000;
      } else if (diff >= 2.4) {
        targetScore = 1004000 + (diff - 2.4) * 4000;
      } else if (diff >= 2.0) {
        targetScore = 1000000 + (diff - 2.0) * 10000;
      } else if (diff >= 1.0) {
        targetScore = 980000 + (diff - 1.0) * 20000;
      } else if (diff >= 0.0) {
        targetScore = 950000 + (diff - 0.0) * 30000;
      } else if (diff >= -1.0) {
        targetScore = 900000 + (diff + 1.0) * 50000;
      } else if (diff >= -5.0) {
        targetScore = 500000 + (diff + 5.0) * 100000;
      } else {
        targetScore = Math.max(0, 250000 * (diff + 9999) / 4997);
      }
      return Math.ceil(targetScore);
    }

    // Rate +0.001 Target Score Engine
    function computeRateUpTargets(calcResult) {
      const { chartMap, b10, b20, b40, totalRating } = calcResult;
      const allCharts = Object.values(chartMap);

      // Borders from B40 ranks
      const b10Border = (b10 && b10.length >= 10) ? (b10[9].effectiveRating || 0) : 0;
      const b20Border = (b20 && b20.length >= 10) ? (b20[9].effectiveRating || 0) : 0;
      const b40Border = (b40 && b40.length >= 20) ? (b40[19].effectiveRating || 0) : 0;

      // Delta total needed to advance totalRating to next 0.001 boundary
      const floor3 = Math.floor((totalRating + 1e-9) * 1000) / 1000;
      let deltaTotal = (floor3 + 0.001) - totalRating;
      if (deltaTotal <= 0.00001 || deltaTotal > 0.0010001) {
        deltaTotal = 0.001;
      }

      // Step 1: Calculate raw needed rating (RatingNoAlphaNEED) for all charts
      const noAlphaNeedMap = {};

      allCharts.forEach(c => {
        if (c.endOfSale === 1) {
          noAlphaNeedMap[c.id] = null;
          return;
        }

        const U = c.effectiveRating || 0;
        const rank = c.b40Rank || 999;
        let needDelta = 0;

        if (rank <= 10) {
          needDelta = deltaTotal / 0.06;
        } else if (rank <= 20) {
          const optA = deltaTotal / 0.02;
          const optB = (deltaTotal + 0.04 * (b10Border - U)) / 0.06;
          needDelta = Math.min(optA, optB);
        } else if (rank <= 40) {
          const optA = deltaTotal / 0.01;
          const optB = (deltaTotal + 0.01 * (b20Border - U)) / 0.02;
          const optC = (deltaTotal + 0.04 * (b10Border - U) + 0.01 * (b20Border - U)) / 0.06;
          needDelta = Math.min(optA, optB, optC);
        } else {
          // Out of B40 (Rank > 40 or not played)
          const optA = deltaTotal / 0.01;
          const optB = (deltaTotal + 0.01 * (b20Border - b40Border)) / 0.02;
          const optC = (deltaTotal + 0.04 * (b10Border - b40Border) + 0.01 * (b20Border - b40Border)) / 0.06;
          needDelta = (b40Border - U) + Math.min(optA, optB, optC);
        }

        if (needDelta <= 0 || !isFinite(needDelta)) {
          noAlphaNeedMap[c.id] = null;
          return;
        }

        // AO3 = U + (INT(10000 * needDelta)) / 10000
        const needRatingNoAlpha = U + (Math.floor(needDelta * 10000 + 1e-9)) / 10000;
        noAlphaNeedMap[c.id] = needRatingNoAlpha;
      });

      // Step 2: Apply exclusivity (RatingNEED) and determine targetScore
      allCharts.forEach(c => {
        c.rateUp = null;

        if (c.endOfSale === 1 || c.score >= THEORY_SCORE) return;
        const rawNeed = noAlphaNeedMap[c.id];
        if (rawNeed === null || rawNeed === undefined) return;

        let targetRating = rawNeed;

        // IV & IV-alpha exclusivity
        if (c.diff === 'IV' || c.diff === 'IV-α') {
          const partnerDiff = (c.diff === 'IV') ? 'IV-α' : 'IV';
          const partner = allCharts.find(x => x.songId === c.songId && x.diff === partnerDiff);
          if (partner) {
            const partnerNeed = noAlphaNeedMap[partner.id] || 0;
            targetRating = Math.max(targetRating, partnerNeed);
          }
        }

        // Theoretical maximum check: constant + 3.6
        // If targetRating > constant + 3.6, cannot raise rate even with AP+
        if (targetRating > (c.constant + 3.6 + 1e-9)) {
          return;
        }

        const targetScore = calcScoreFromRating(targetRating, c.constant);
        if (targetScore > THEORY_SCORE || targetScore <= (c.score || 0)) {
          return;
        }

        const ptsNeeded = targetScore - (c.score || 0);
        if (ptsNeeded <= 0) return;

        c.rateUp = {
          targetRating: targetRating,
          targetScore: targetScore,
          ptsNeeded: ptsNeeded
        };
      });
    }

    // Theoretical Max Rating Calculation (Top 40 with IV & IV-alpha exclusivity)
    function calcTheoreticalMaxRating() {
      const eligible = [];
      const grouped = {};
      const allSongs = getAllSongs();
      allSongs.forEach(s => {
        if (s[8] === 1) return; // endOfSale
        const songId = s[7];
        if (!grouped[songId]) grouped[songId] = [];
        grouped[songId].push(s);
      });

      for (const [songId, list] of Object.entries(grouped)) {
        const iv = list.find(c => c[2] === 'IV');
        const ivAlpha = list.find(c => c[2] === 'IV-α');

        list.forEach(c => {
          let isEx = false;
          if (iv && ivAlpha) {
            if (c[2] === 'IV' && iv[4] <= ivAlpha[4]) isEx = true;
            if (c[2] === 'IV-α' && ivAlpha[4] < iv[4]) isEx = true;
          }
          if (!isEx) {
            eligible.push({
              maxRate: c[4] + 3.6
            });
          }
        });
      }

      eligible.sort((a, b) => b.maxRate - a.maxRate);
      const top40 = eligible.slice(0, 40);
      const b10Sum = top40.slice(0, 10).reduce((acc, c) => acc + c.maxRate, 0);
      const b20Sum = top40.slice(10, 20).reduce((acc, c) => acc + c.maxRate, 0);
      const b40Sum = top40.slice(20, 40).reduce((acc, c) => acc + c.maxRate, 0);
      return (b10Sum * 0.06) + (b20Sum * 0.02) + (b40Sum * 0.01);
    }

    function getMaxCompletionCount() {
      return getAllSongs().filter(s => (s[2] === 'IV' || s[2] === 'IV-α') && s[8] === 0).length;
    }

    function computeAllRatings() {
      const chartMap = {};
      const songDiffMap = {};
      const songGrouping = {};

      const allSongs = getAllSongs();
      allSongs.forEach(s => {
        const id = s[0];
        const title = s[1];
        const diff = s[2];
        const level = s[3];
        const constant = s[4];
        const notes = s[5];
        const pack = s[6];
        const songId = s[7];
        const endOfSale = s[8];
        const version = s[11];
        const initId = s[12];

        const record = userScores[id] || { score: 0, status: '' };
        const score = record.score || 0;
        const status = record.status || '';

        const rawRating = calcSingleRating(score, constant, endOfSale);
        const { ad, diffJudge } = calcCompletionAD(score, constant, diff, status, endOfSale);

        const chart = {
          id, title, diff, level, constant, notes, pack, songId, endOfSale,
          version, initId,
          score, status, rawRating,
          effectiveRating: rawRating,
          isExcluded: false,
          ad, diffJudge, af: 0
        };

        chartMap[id] = chart;

        if (!songGrouping[songId]) songGrouping[songId] = [];
        songGrouping[songId].push(chart);

        if (diff === 'IV' || diff === 'IV-α') {
          if (!songDiffMap[songId]) songDiffMap[songId] = {};
          songDiffMap[songId][diff] = { id, rawRating };
        }
      });

      // Exclusivity rule for Rating
      for (const [songId, diffs] of Object.entries(songDiffMap)) {
        if (diffs['IV'] && diffs['IV-α']) {
          const ivRate = diffs['IV'].rawRating;
          const ivAlphaRate = diffs['IV-α'].rawRating;

          if (ivRate <= ivAlphaRate) {
            chartMap[diffs['IV'].id].effectiveRating = 0;
            chartMap[diffs['IV'].id].isExcluded = true;
          } else {
            chartMap[diffs['IV-α'].id].effectiveRating = 0;
            chartMap[diffs['IV-α'].id].isExcluded = true;
          }
        }
      }

      // Completion AF Calculation (Per Song logic)
      let totalCompletionSum = 0;
      for (const [songId, chartList] of Object.entries(songGrouping)) {
        const non666 = chartList.filter(c => c.diffJudge !== 666);
        const maxNon666Ad = non666.length ? Math.max(...non666.map(c => c.ad)) : 0;

        chartList.forEach(c => {
          if (c.diffJudge === 666) {
            c.af = c.ad;
          } else {
            if (c.ad === maxNon666Ad && c.ad > 0) {
              const ties = non666.filter(x => x.ad === maxNon666Ad);
              const maxJudge = Math.max(...ties.map(x => x.diffJudge));
              c.af = (c.diffJudge === maxJudge) ? c.ad : 0;
            } else {
              c.af = 0;
            }
          }
          totalCompletionSum += c.af;
        });
      }

      const activeCharts = Object.values(chartMap).filter(c => c.effectiveRating > 0);
      activeCharts.sort((a, b) => b.effectiveRating - a.effectiveRating);

      const b40Set = new Set();
      const b10 = activeCharts.slice(0, 10);
      const b20 = activeCharts.slice(10, 20);
      const b40 = activeCharts.slice(20, 40);

      activeCharts.slice(0, 40).forEach((c, idx) => {
        c.b40Rank = idx + 1;
        b40Set.add(c.id);
      });

      const b10Sum = b10.reduce((acc, c) => acc + c.effectiveRating, 0);
      const b20Sum = b20.reduce((acc, c) => acc + c.effectiveRating, 0);
      const b40Sum = b40.reduce((acc, c) => acc + c.effectiveRating, 0);

      const totalRating = (b10Sum * 0.06) + (b20Sum * 0.02) + (b40Sum * 0.01);

      const calcResult = {
        chartMap,
        activeCharts,
        b10, b20, b40,
        b10Sum, b20Sum, b40Sum,
        totalRating,
        b40Set,
        totalCompletionSum
      };

      computeRateUpTargets(calcResult);

      return calcResult;
    }

    let currentCalc = null;
    let selectedChart = null;
    let currentInputScore = 0;
    let currentInputStatus = '';

    const FILTER_AUTOSAVE_KEY = 'rotaeno_filter_autosave_enabled';
    const FILTER_STATE_KEY = 'rotaeno_saved_filter_state_v1';
    let currentMainTab = 'songs';
    let songsScrollY = 0;

    let currentSort = 'DEFAULT';
    let filterDiffs = new Set();
    let filterConst = 'ALL';
    let filterStatus = 'ALL';
    let searchQuery = '';
    let showDeleted = true;

    function isFilterAutoSaveEnabled() {
      const saved = localStorage.getItem(FILTER_AUTOSAVE_KEY);
      return saved === null || saved === 'true';
    }

    function setFilterAutoSaveEnabled(enabled) {
      localStorage.setItem(FILTER_AUTOSAVE_KEY, String(enabled));
      if (!enabled) {
        localStorage.removeItem(FILTER_STATE_KEY);
      } else {
        saveFilterState();
      }
    }

    function getActiveFilterCount() {
      let count = 0;
      if (searchQuery && searchQuery.trim().length > 0) count++;
      if (currentSort && currentSort !== 'DEFAULT') count++;
      if (!showDeleted) count++;
      if (filterDiffs && filterDiffs.size > 0) count++;
      if (filterConst && filterConst !== 'ALL') count++;
      if (filterStatus && filterStatus !== 'ALL') count++;
      if (filterScoreMin !== null || filterScoreMax !== null) count++;
      if (excludeApPlus) count++;
      if (excludeAp) count++;
      if (excludeFc) count++;
      if (excludeEx) count++;
      if (excludePlayed) count++;
      if (filterConstMin !== null || filterConstMax !== null || filterConstExact !== null) count++;
      if (filterLevelMin || filterLevelMax || filterLevelExact) count++;
      return count;
    }

    function saveFilterState(overrideTab = null) {
      if (!isFilterAutoSaveEnabled()) return;
      try {
        const state = {
          activeTab: overrideTab || currentMainTab || 'songs',
          currentMypageSubView: typeof currentMypageSubView !== 'undefined' ? currentMypageSubView : 'stats',
          currentSort: currentSort || 'DEFAULT',
          searchQuery: searchQuery || '',
          showDeleted: !!showDeleted,
          filterDiffs: Array.from(filterDiffs || []),
          filterConst: filterConst || 'ALL',
          filterStatus: filterStatus || 'ALL',
          filterScoreMin: filterScoreMin,
          filterScoreMax: filterScoreMax,
          excludeApPlus: !!excludeApPlus,
          excludeAp: !!excludeAp,
          excludeFc: !!excludeFc,
          excludeEx: !!excludeEx,
          excludePlayed: !!excludePlayed,
          filterConstMin: filterConstMin,
          filterConstMax: filterConstMax,
          filterConstExact: filterConstExact,
          filterLevelMin: filterLevelMin || '',
          filterLevelMax: filterLevelMax || '',
          filterLevelExact: filterLevelExact || ''
        };
        localStorage.setItem(FILTER_STATE_KEY, JSON.stringify(state));
      } catch (e) {
        console.warn('Failed to save filter state:', e);
      }
    }

    function switchMainTab(tab, options = {}) {
      const prevTab = currentMainTab;

      // 楽曲一覧から離れる場合、現在のスクロール位置を記憶
      if (prevTab === 'songs') {
        songsScrollY = window.scrollY || window.pageYOffset || 0;
      }

      currentMainTab = tab;
      document.querySelectorAll('.tab-item').forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-tab') === tab);
      });

      const viewSongs = document.getElementById('viewSongs');
      const viewMypage = document.getElementById('viewMypage');
      const viewSettings = document.getElementById('viewSettings');
      if (viewSongs) viewSongs.style.display = tab === 'songs' ? 'block' : 'none';
      if (viewMypage) viewMypage.style.display = tab === 'mypage' ? 'block' : 'none';
      if (viewSettings) viewSettings.style.display = tab === 'settings' ? 'block' : 'none';

      const fabGroup = document.getElementById('floatingBtnGroup');
      if (fabGroup) fabGroup.style.display = tab === 'songs' ? 'flex' : 'none';

      // スクロール制御: 楽曲一覧は元の位置を復元、他タブは即座に最上部へリセット
      if (options.scroll !== false) {
        if (tab === 'songs') {
          window.scrollTo({ top: songsScrollY, behavior: 'instant' });
        } else {
          window.scrollTo({ top: 0, behavior: 'instant' });
        }
      }

      if (options.save !== false) {
        saveFilterState();
      }
    }

    function restoreFilterState() {
      const chkAutoSave = document.getElementById('chkAutoSaveFilters');
      const autoSaveEnabled = isFilterAutoSaveEnabled();
      if (chkAutoSave) chkAutoSave.checked = autoSaveEnabled;

      if (!autoSaveEnabled) return;

      const raw = localStorage.getItem(FILTER_STATE_KEY);
      if (!raw) return;

      try {
        const state = JSON.parse(raw);
        if (!state || typeof state !== 'object') return;

        // Restore Search Query
        if (typeof state.searchQuery === 'string') {
          searchQuery = state.searchQuery;
          const searchInput = document.getElementById('searchInput');
          if (searchInput) searchInput.value = searchQuery;
          if (searchInputClearCtrl) searchInputClearCtrl.updateVisibility();
        }

        // Restore Sort
        if (typeof state.currentSort === 'string') {
          currentSort = state.currentSort;
          const sortSelect = document.getElementById('sortSelect');
          if (sortSelect) sortSelect.value = currentSort;
        }

        // Restore Show Deleted
        if (typeof state.showDeleted === 'boolean') {
          showDeleted = state.showDeleted;
          const chkDeleted = document.getElementById('chkShowDeleted');
          if (chkDeleted) chkDeleted.checked = showDeleted;
        }

        // Restore Filter Diffs
        if (Array.isArray(state.filterDiffs)) {
          filterDiffs = new Set(state.filterDiffs);
          document.querySelectorAll('#diffFilters .filter-btn').forEach(btn => {
            const val = btn.getAttribute('data-val');
            if (val === 'ALL') {
              btn.classList.toggle('active', filterDiffs.size === 0);
            } else {
              btn.classList.toggle('active', filterDiffs.has(val));
            }
          });
        }

        // Restore Filter Const
        if (typeof state.filterConst === 'string') {
          filterConst = state.filterConst;
          document.querySelectorAll('#constFilters .filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-val') === filterConst);
          });
        }

        // Restore Filter Status
        if (typeof state.filterStatus === 'string') {
          filterStatus = state.filterStatus;
          document.querySelectorAll('#statusFilters .filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-val') === filterStatus);
          });
        }

        // Restore Score Min/Max
        filterScoreMin = (typeof state.filterScoreMin === 'number' && !isNaN(state.filterScoreMin)) ? state.filterScoreMin : null;
        const scoreMinInput = document.getElementById('filterScoreMin');
        if (scoreMinInput) scoreMinInput.value = filterScoreMin !== null ? String(filterScoreMin) : '';

        filterScoreMax = (typeof state.filterScoreMax === 'number' && !isNaN(state.filterScoreMax)) ? state.filterScoreMax : null;
        const scoreMaxInput = document.getElementById('filterScoreMax');
        if (scoreMaxInput) scoreMaxInput.value = filterScoreMax !== null ? String(filterScoreMax) : '';

        // Restore Exclude Checkboxes
        excludeApPlus = !!state.excludeApPlus;
        const chkApPlus = document.getElementById('chkExcludeApPlus');
        if (chkApPlus) chkApPlus.checked = excludeApPlus;

        excludeAp = !!state.excludeAp;
        const chkAp = document.getElementById('chkExcludeAp');
        if (chkAp) chkAp.checked = excludeAp;

        excludeFc = !!state.excludeFc;
        const chkFc = document.getElementById('chkExcludeFc');
        if (chkFc) chkFc.checked = excludeFc;

        excludeEx = !!state.excludeEx;
        const chkEx = document.getElementById('chkExcludeEx');
        if (chkEx) chkEx.checked = excludeEx;

        excludePlayed = !!state.excludePlayed;
        const chkPlayed = document.getElementById('chkExcludePlayed');
        if (chkPlayed) chkPlayed.checked = excludePlayed;

        // Restore Const Range / Exact
        filterConstMin = (typeof state.filterConstMin === 'number' && !isNaN(state.filterConstMin)) ? state.filterConstMin : null;
        const constMinInput = document.getElementById('filterConstMin');
        if (constMinInput) constMinInput.value = filterConstMin !== null ? String(filterConstMin) : '';

        filterConstMax = (typeof state.filterConstMax === 'number' && !isNaN(state.filterConstMax)) ? state.filterConstMax : null;
        const constMaxInput = document.getElementById('filterConstMax');
        if (constMaxInput) constMaxInput.value = filterConstMax !== null ? String(filterConstMax) : '';

        filterConstExact = (typeof state.filterConstExact === 'number' && !isNaN(state.filterConstExact)) ? state.filterConstExact : null;
        const constExactInput = document.getElementById('filterConstExact');
        if (constExactInput) constExactInput.value = filterConstExact !== null ? String(filterConstExact) : '';

        // Restore Level Range / Exact
        filterLevelMin = typeof state.filterLevelMin === 'string' ? state.filterLevelMin : '';
        const levelMinInput = document.getElementById('filterLevelMin');
        if (levelMinInput) levelMinInput.value = filterLevelMin;

        filterLevelMax = typeof state.filterLevelMax === 'string' ? state.filterLevelMax : '';
        const levelMaxInput = document.getElementById('filterLevelMax');
        if (levelMaxInput) levelMaxInput.value = filterLevelMax;

        filterLevelExact = typeof state.filterLevelExact === 'string' ? state.filterLevelExact : '';
        const levelExactInput = document.getElementById('filterLevelExact');
        if (levelExactInput) levelExactInput.value = filterLevelExact;

        // Restore Mypage Subview
        if (['stats', 'b40', 'applus'].includes(state.currentMypageSubView)) {
          if (typeof switchMypageSubView === 'function') {
            switchMypageSubView(state.currentMypageSubView, { scroll: false, save: false });
          }
        }

        // Restore Main Tab
        if (['songs', 'mypage', 'settings'].includes(state.activeTab)) {
          switchMainTab(state.activeTab, { scroll: false, save: false });
        }
      } catch (e) {
        console.warn('Failed to restore filter state:', e);
      }
    }

    let filterScoreMin = null;
    let filterScoreMax = null;
    let excludeApPlus = false;
    let excludeAp = false;
    let excludeFc = false;
    let excludeEx = false;
    let excludePlayed = false;
    let filterConstMin = null;
    let filterConstMax = null;
    let filterConstExact = null;
    let filterLevelMin = '';
    let filterLevelMax = '';
    let filterLevelExact = '';

    function levelToValue(lvl) {
      if (!lvl) return 0;
      const str = String(lvl).trim();
      const isPlus = str.endsWith('+');
      const base = parseFloat(str.replace('+', '')) || 0;
      return isPlus ? base + 0.5 : base;
    }

    const totalRatingEl = document.getElementById('totalRating');
    const theoMaxRatingEl = document.getElementById('theoMaxRating');
    const completionSumEl = document.getElementById('completionSum');
    const completionMaxEl = document.getElementById('completionMax');
    const completionRateEl = document.getElementById('completionRate');

    const b10SumEl = document.getElementById('b10Sum');
    const b20SumEl = document.getElementById('b20Sum');
    const b40SumEl = document.getElementById('b40Sum');
    const scoreCountEl = document.getElementById('scoreCount');
    const songListContainer = document.getElementById('songListContainer');

    function adjustHeaderOffset() {
      const header = document.querySelector('header');
      if (header) {
        const h = header.offsetHeight;
        document.documentElement.style.setProperty('--header-height', h + 'px');
      }
    }
    window.addEventListener('resize', adjustHeaderOffset);

    function refresh() {
      adjustHeaderOffset();
      currentCalc = computeAllRatings();
      const allSongs = getAllSongs();

      totalRatingEl.textContent = currentCalc.totalRating.toFixed(4);
      theoMaxRatingEl.textContent = calcTheoreticalMaxRating().toFixed(4);

      const maxComp = getMaxCompletionCount();
      completionSumEl.textContent = currentCalc.totalCompletionSum.toFixed(3);
      completionMaxEl.textContent = maxComp;
      const ratePct = maxComp > 0 ? ((currentCalc.totalCompletionSum / maxComp) * 100).toFixed(2) : '0.00';
      completionRateEl.textContent = `(${ratePct}%)`;

      b10SumEl.textContent = (currentCalc.b10Sum * 0.06).toFixed(3);
      b20SumEl.textContent = (currentCalc.b20Sum * 0.02).toFixed(3);
      b40SumEl.textContent = (currentCalc.b40Sum * 0.01).toFixed(3);

      const filledCount = Object.values(userScores).filter(v => v.score > 0).length;
      scoreCountEl.textContent = `${filledCount} / ${allSongs.length} 登録`;

      renderSongList();
      renderMypage();
    }

    function getDiffClass(diff) {
      if (diff === 'IV-α' || diff === 'IV-alpha') return 'diff-IV-alpha';
      return 'diff-' + diff;
    }

    function compareVersions(vA, vB) {
      const partsA = (vA || '').split('.').map(x => parseInt(x) || 0);
      const partsB = (vB || '').split('.').map(x => parseInt(x) || 0);
      for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
        const a = partsA[i] || 0;
        const b = partsB[i] || 0;
        if (a !== b) return b - a; // Descending (newer first)
      }
      return 0;
    }

    // Collapsible Song Groups State & Categorization
    const collapsedGroupIds = new Set();

    const TITLE_CATEGORY_ORDER = [
      'あ行', 'か行', 'さ行', 'た行', 'な行', 'は行', 'ま行', 'や行', 'ら行', 'わ行',
      'A - E', 'F - J', 'K - O', 'P - T', 'U - Z',
      '数字',
      '記号',
      '漢字, その他'
    ];

    const TITLE_CATEGORY_OVERRIDES = {
      // 特殊文字・非ASCIIアルファベット
      'Äventyr': 'A - E',
      'Ēvocator': 'A - E',
      'βinαrΨ // Re:Coded': 'A - E',
      'βinαrΨ': 'A - E',
      'εxceζ': 'A - E',
      'ЯUBY:LINTe': 'P - T',

      // 記号始まり
      '!@@k at m[ f@r[\[r': '記号',
      '^/7(L|?[_(L+#<>+&|^(o)': '記号',
      '《爱立刻2000》': '記号',
      '-ish': '記号',
      '[C]ENti:mentAL': '記号'
    };

    function getTitleCategory(title) {
      if (TITLE_CATEGORY_OVERRIDES[title]) return TITLE_CATEGORY_OVERRIDES[title];
      const ch = (title || '').trim().charAt(0);
      if (!ch) return '記号';
      const code = ch.charCodeAt(0);

      // ひらがな・カタカナ (あ行〜わ行)
      if ((code >= 0x3041 && code <= 0x3096) || (code >= 0x30A1 && code <= 0x30FA)) {
        const kCode = (code >= 0x3041 && code <= 0x3096) ? code + 0x60 : code;
        if (kCode >= 0x30A1 && kCode <= 0x30AA) return 'あ行';
        if (kCode >= 0x30AB && kCode <= 0x30B4) return 'か行';
        if (kCode >= 0x30B5 && kCode <= 0x30BE) return 'さ行';
        if (kCode >= 0x30BF && kCode <= 0x30C9) return 'た行';
        if (kCode >= 0x30CA && kCode <= 0x30CE) return 'な行';
        if (kCode >= 0x30CF && kCode <= 0x30DD) return 'は行';
        if (kCode >= 0x30DE && kCode <= 0x30E2) return 'ま行';
        if (kCode >= 0x30E3 && kCode <= 0x30E8) return 'や行';
        if (kCode >= 0x30E9 && kCode <= 0x30ED) return 'ら行';
        if (kCode >= 0x30EF && kCode <= 0x30F6) return 'わ行';
      }

      // 英字 (A-Z)
      const upper = ch.toUpperCase();
      if (upper >= 'A' && upper <= 'Z') {
        if (upper <= 'E') return 'A - E';
        if (upper <= 'J') return 'F - J';
        if (upper <= 'O') return 'K - O';
        if (upper <= 'T') return 'P - T';
        return 'U - Z';
      }

      // 数字 (0-9)
      if (ch >= '0' && ch <= '9') return '数字';

      // 漢字 (CJK統合漢字・拡張・互換) & ハングル
      if (
        (code >= 0x4E00 && code <= 0x9FFF) ||
        (code >= 0x3400 && code <= 0x4DBF) ||
        (code >= 0xF900 && code <= 0xFAFF) ||
        (code >= 0xAC00 && code <= 0xD7AF) ||
        (code >= 0x1100 && code <= 0x11FF)
      ) {
        return '漢字, その他';
      }

      return '記号';
    }

    const SCORE_GRADE_TIERS = [
      { id: 'applus', label: '1,010,000点 (理論値)', grade: '虹Ex+虹ゲージ', badgeClass: 'badge-tier-applus', match: c => c.score >= THEORY_SCORE || c.status === 'AP+' },
      { id: 'ex_rainbow', label: '1,008,000 ~ 1,009,999', grade: '虹Ex', badgeClass: 'badge-tier-ex-rainbow', match: c => c.score >= 1008000 && c.score < THEORY_SCORE },
      { id: 'ex_orange', label: '1,000,000 ~ 1,007,999', grade: '橙Ex', badgeClass: 'badge-tier-ex-orange', match: c => c.score >= 1000000 && c.score < 1008000 },
      { id: 's_plus', label: '980,000 ~ 999,999', grade: 'S+', badgeClass: 'badge-tier-s-plus', match: c => c.score >= 980000 && c.score < 1000000 },
      { id: 's', label: '950,000 ~ 979,999', grade: 'S', badgeClass: 'badge-tier-s', match: c => c.score >= 950000 && c.score < 980000 },
      { id: 'a_plus', label: '900,000 ~ 949,999', grade: 'A+', badgeClass: 'badge-tier-a-plus', match: c => c.score >= 900000 && c.score < 950000 },
      { id: 'a', label: '850,000 ~ 899,999', grade: 'A', badgeClass: 'badge-tier-a', match: c => c.score >= 850000 && c.score < 900000 },
      { id: 'b', label: '800,000 ~ 849,999', grade: 'B', badgeClass: 'badge-tier-b', match: c => c.score >= 800000 && c.score < 850000 },
      { id: 'c', label: '700,000 ~ 799,999', grade: 'C', badgeClass: 'badge-tier-c', match: c => c.score >= 700000 && c.score < 800000 },
      { id: 'd', label: '600,000 ~ 699,999', grade: 'D', badgeClass: 'badge-tier-d', match: c => c.score >= 600000 && c.score < 700000 },
      { id: 'e', label: '500,000 ~ 599,999', grade: 'E', badgeClass: 'badge-tier-e', match: c => c.score >= 500000 && c.score < 600000 },
      { id: 'f', label: '0 ~ 499,999 (未プレイ含む)', grade: 'F', badgeClass: 'badge-tier-f', match: c => c.score < 500000 }
    ];

    function getScoreGradeTier(chart) {
      for (let i = 0; i < SCORE_GRADE_TIERS.length; i++) {
        if (SCORE_GRADE_TIERS[i].match(chart)) return SCORE_GRADE_TIERS[i];
      }
      return SCORE_GRADE_TIERS[SCORE_GRADE_TIERS.length - 1];
    }

    function renderSongRow(c) {
      const inB40 = currentCalc && currentCalc.b40Set ? currentCalc.b40Set.has(c.id) : false;
      const diffClass = getDiffClass(c.diff);
      const statusHtml = c.status ? ('<span class="lamp-tag lamp-' + c.status.replace('+', '-plus') + '">' + c.status + '</span>') : '';
      const scoreDisplay = c.score > 0 ? c.score.toLocaleString() : '-';
      let ratingDisplay = '-';
      if (c.endOfSale === 1) {
        ratingDisplay = '<span style="color:#dc2626; font-size:11px; font-weight:700;">(販売終了)</span>';
      } else if (c.isExcluded) {
        ratingDisplay = '<span style="color:#dc2626; font-size:11px; font-weight:700;">(' + c.diff + '除外)</span>';
      } else if (c.effectiveRating > 0) {
        ratingDisplay = c.effectiveRating.toFixed(4);
      }

      let rateUpHtml = '';
      if (c.rateUp) {
        rateUpHtml = 
          '<div class="rate-up-info" title="レート+0.001の目標スコア: ' + c.rateUp.targetScore.toLocaleString() + ' (あと ' + c.rateUp.ptsNeeded.toLocaleString() + ' 点)">' +
            '<span class="rate-up-badge">+0.001まで +' + c.rateUp.ptsNeeded.toLocaleString() + '</span>' +
            '<span class="rate-up-score">目標 ' + c.rateUp.targetScore.toLocaleString() + '</span>' +
          '</div>';
      }

      return (
        '<div class="song-row ' + (inB40 ? 'in-b40' : '') + '" onclick="openInputModal(\'' + c.id + '\')">' +
          '<div class="song-left-col">' +
            '<div class="diff-badge ' + diffClass + '">' +
              '<div>' + c.diff + '</div>' +
              '<div class="const-val">' + c.constant.toFixed(1) + '</div>' +
            '</div>' +
            '<div class="song-meta">' +
              '<div class="song-title-text">' + escapeHtml(c.title) + '</div>' +
              '<div class="song-sub-text">' +
                '<span class="ver-tag">v' + c.version + '</span>' +
                '<span>Lv.' + c.level + '</span>' +
                '<span>' + escapeHtml(c.pack) + '</span>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div class="song-right-col">' +
            '<div class="score-display-text">' + scoreDisplay + ' ' + (c.status ? '<span class="lamp-tag lamp-' + c.status.replace('+', '-plus') + '">' + c.status + '</span>' : '') + '</div>' +
            '<div class="rating-display-text">' + ratingDisplay + '</div>' +
            rateUpHtml +
          '</div>' +
        '</div>'
      );
    }

    function renderSongList() {
      const q = searchQuery.toLowerCase().trim();
      const list = Object.values(currentCalc.chartMap).filter(c => {
        if (!showDeleted && c.endOfSale === 1) return false;
        if (q) {
          const matchTitle = c.title.toLowerCase().includes(q);
          const matchId = c.songId.toLowerCase().includes(q);
          const matchPack = c.pack.toLowerCase().includes(q);
          const matchVer = c.version.toLowerCase().includes(q);
          if (!matchTitle && !matchId && !matchPack && !matchVer) return false;
        }
        if (filterDiffs.size > 0 && !filterDiffs.has(c.diff)) return false;

        // Level filters
        if (filterLevelExact !== '' && String(c.level) !== filterLevelExact) return false;
        if (filterLevelMin !== '' && levelToValue(c.level) < levelToValue(filterLevelMin)) return false;
        if (filterLevelMax !== '' && levelToValue(c.level) > levelToValue(filterLevelMax)) return false;

        // Constant filters
        if (filterConstExact !== null && Math.round(c.constant * 10) !== Math.round(filterConstExact * 10)) return false;
        if (filterConstMin !== null && Math.round(c.constant * 10) < Math.round(filterConstMin * 10)) return false;
        if (filterConstMax !== null && Math.round(c.constant * 10) > Math.round(filterConstMax * 10)) return false;
        if (filterConst === '14' && c.constant < 14.0) return false;
        if (filterConst === '13' && c.constant < 13.0) return false;

        // Score & Status exclusion filters (埋め作業用)
        if (excludeApPlus && (c.score >= THEORY_SCORE || c.status === 'AP+')) return false;
        if (excludeAp && (c.status === 'AP' || c.status === 'AP+' || c.score >= THEORY_SCORE)) return false;
        if (excludeFc && (c.status === 'FC' || c.status === 'AP' || c.status === 'AP+' || c.score >= THEORY_SCORE)) return false;
        if (excludeEx && c.score >= 1000000) return false;
        if (excludePlayed && (c.score > 0 || !!c.status)) return false;
        if (filterScoreMin !== null && c.score < filterScoreMin) return false;
        if (filterScoreMax !== null && (c.score <= 0 || c.score > filterScoreMax)) return false;
        if (filterStatus === 'FILLED' && c.score <= 0) return false;
        if (filterStatus === 'B40' && !currentCalc.b40Set.has(c.id)) return false;

        return true;
      });

      const isGroupedSort = ['PACK', 'TITLE', 'VERSION', 'CONST', 'SCORE'].includes(currentSort);
      const toolbarEl = document.getElementById('songGroupToolbar');
      if (toolbarEl) {
        toolbarEl.style.display = (isGroupedSort && list.length > 0) ? 'flex' : 'none';
      }

      if (!isGroupedSort || list.length === 0) {
        // Flat sort for DEFAULT, RATING, or RATE_UP
        list.sort((a, b) => {
          if (currentSort === 'RATE_UP') {
            const aHas = !!a.rateUp;
            const bHas = !!b.rateUp;
            if (aHas && !bHas) return -1;
            if (!aHas && bHas) return 1;
            if (aHas && bHas) {
              if (a.rateUp.ptsNeeded !== b.rateUp.ptsNeeded) {
                return a.rateUp.ptsNeeded - b.rateUp.ptsNeeded;
              }
              return b.constant - a.constant;
            }
            return compareDefaultOrder(a, b);
          }
          if (currentSort === 'RATING') {
            const rateA = a.effectiveRating || 0;
            const rateB = b.effectiveRating || 0;
            if (rateB !== rateA) return rateB - rateA;
            if (b.score !== a.score) return b.score - a.score;
            return compareDefaultOrder(a, b);
          }
          return compareDefaultOrder(a, b);
        });

        songListContainer.innerHTML = list.length > 0
          ? list.map(renderSongRow).join('')
          : '<div style="text-align:center; padding: 40px; color: var(--color-text-muted);">該当する楽曲がありません</div>';
        updateFilterSummary(list.length);
        return;
      }

      // Grouped Sort
      let groups = [];
      if (currentSort === 'PACK') {
        const packMap = new Map();
        list.forEach(c => {
          if (!packMap.has(c.pack)) packMap.set(c.pack, []);
          packMap.get(c.pack).push(c);
        });
        packMap.forEach(items => items.sort((a, b) => compareDefaultOrder(a, b)));
        const orderedPacks = [];
        packOrder.forEach(p => {
          if (packMap.has(p)) orderedPacks.push(p);
        });
        packMap.forEach((_, p) => {
          if (!orderedPacks.includes(p)) orderedPacks.push(p);
        });
        groups = orderedPacks.map(p => ({
          id: 'pack_' + encodeURIComponent(p),
          titleHtml: escapeHtml(p),
          badgeHtml: '',
          items: packMap.get(p) || []
        }));
      } else if (currentSort === 'TITLE') {
        const titleCatMap = new Map();
        list.forEach(c => {
          const cat = getTitleCategory(c.title);
          if (!titleCatMap.has(cat)) titleCatMap.set(cat, []);
          titleCatMap.get(cat).push(c);
        });
        titleCatMap.forEach(items => items.sort((a, b) => {
          const tComp = a.title.localeCompare(b.title, 'ja', { numeric: true, sensitivity: 'base' });
          if (tComp !== 0) return tComp;
          return compareDefaultOrder(a, b);
        }));
        groups = TITLE_CATEGORY_ORDER
          .filter(cat => titleCatMap.has(cat) && titleCatMap.get(cat).length > 0)
          .map(cat => ({
            id: 'title_' + encodeURIComponent(cat),
            titleHtml: escapeHtml(cat),
            badgeHtml: '',
            items: titleCatMap.get(cat)
          }));
      } else if (currentSort === 'VERSION') {
        const verMap = new Map();
        list.forEach(c => {
          if (!verMap.has(c.version)) verMap.set(c.version, []);
          verMap.get(c.version).push(c);
        });
        verMap.forEach(items => items.sort((a, b) => compareDefaultOrder(a, b)));
        const sortedVers = Array.from(verMap.keys()).sort((a, b) => compareVersions(a, b));
        groups = sortedVers.map(v => ({
          id: 'ver_' + encodeURIComponent(v),
          titleHtml: 'Ver ' + escapeHtml(v),
          badgeHtml: '',
          items: verMap.get(v) || []
        }));
      } else if (currentSort === 'CONST') {
        const lvlMap = new Map();
        list.forEach(c => {
          const lvl = String(c.level);
          if (!lvlMap.has(lvl)) lvlMap.set(lvl, []);
          lvlMap.get(lvl).push(c);
        });
        lvlMap.forEach(items => items.sort((a, b) => {
          if (b.constant !== a.constant) return b.constant - a.constant;
          if (b.score !== a.score) return b.score - a.score;
          return compareDefaultOrder(a, b);
        }));
        const sortedLvls = Array.from(lvlMap.keys()).sort((a, b) => levelToValue(b) - levelToValue(a));
        groups = sortedLvls.map(lvl => ({
          id: 'lvl_' + encodeURIComponent(lvl),
          titleHtml: 'Lv.' + escapeHtml(lvl),
          badgeHtml: '',
          items: lvlMap.get(lvl) || []
        }));
      } else if (currentSort === 'SCORE') {
        const tierMap = new Map();
        SCORE_GRADE_TIERS.forEach(t => tierMap.set(t.id, []));
        list.forEach(c => {
          const t = getScoreGradeTier(c);
          tierMap.get(t.id).push(c);
        });
        tierMap.forEach(items => items.sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          return compareDefaultOrder(a, b);
        }));
        groups = SCORE_GRADE_TIERS
          .filter(t => (tierMap.get(t.id) || []).length > 0)
          .map(t => ({
            id: 'tier_' + t.id,
            titleHtml: escapeHtml(t.label),
            badgeHtml: '<span class="score-tier-badge ' + t.badgeClass + '">' + escapeHtml(t.grade) + '</span>',
            items: tierMap.get(t.id)
          }));
      }

      let groupsHtml = '';
      let activeGroupCount = 0;
      groups.forEach(g => {
        if (!g.items || g.items.length === 0) return;
        activeGroupCount++;
        const isCollapsed = collapsedGroupIds.has(g.id);
        groupsHtml += 
          '<div class="song-group-section" data-group-id="' + g.id + '">' +
            '<div class="song-group-header ' + (isCollapsed ? 'collapsed' : '') + '" data-group-id="' + g.id + '">' +
              '<div class="song-group-left">' +
                '<span class="song-group-arrow">▼</span>' +
                '<span class="song-group-title">' + g.titleHtml + '</span>' +
              '</div>' +
              '<div class="song-group-right">' +
                g.badgeHtml +
                '<span class="song-group-count">' + g.items.length + '件</span>' +
              '</div>' +
            '</div>' +
            '<div class="song-group-body ' + (isCollapsed ? 'collapsed' : '') + '" id="body-' + g.id + '">' +
              g.items.map(renderSongRow).join('') +
            '</div>' +
          '</div>';
      });

      const toolbarCountEl = document.getElementById('songGroupToolbarCount');
      if (toolbarCountEl) toolbarCountEl.textContent = activeGroupCount + ' グループ (' + list.length + ' 件)';

      songListContainer.innerHTML = groupsHtml || '<div style="text-align:center; padding: 40px; color: var(--color-text-muted);">該当する楽曲がありません</div>';
      updateFilterSummary(list.length);
    }

    function updateFilterSummary(count) {
      const modalCountEl = document.getElementById('modalFilteredCount');
      if (modalCountEl) modalCountEl.textContent = `(${count.toLocaleString()}件)`;

      const activeCount = getActiveFilterCount();
      const isFiltered = activeCount > 0;

      // Update Floating FAB badge
      const dotEl = document.getElementById('filterBadgeDot');
      if (dotEl) {
        if (isFiltered) {
          dotEl.textContent = activeCount > 99 ? '99+' : String(activeCount);
          dotEl.classList.add('has-count');
          dotEl.style.display = 'inline-flex';
        } else {
          dotEl.textContent = '';
          dotEl.classList.remove('has-count');
          dotEl.style.display = 'none';
        }
      }

      // Update Notice Bar in Songs View
      const noticeBar = document.getElementById('activeFilterNoticeBar');
      const noticeText = document.getElementById('activeFilterNoticeText');
      if (noticeBar && noticeText) {
        if (isFiltered) {
          const totalCharts = (typeof chartTuples !== 'undefined' && chartTuples) ? chartTuples.length : count;
          noticeText.textContent = `絞り込み適用中 (${activeCount}件の条件): 全 ${totalCharts.toLocaleString()}曲中 ${count.toLocaleString()}曲 表示`;
          noticeBar.style.display = 'flex';
        } else {
          noticeBar.style.display = 'none';
        }
      }

      // Auto save filter state on update
      saveFilterState();
    }

    function openFilterModal() {
      document.getElementById('filterModal').classList.add('open');
    }

    function closeFilterModal() {
      document.getElementById('filterModal').classList.remove('open');
    }

    function renderB40() {
      const renderGrid = (items, startRank) => {
        return items.map((c, i) => {
          const rank = startRank + i;
          const statusHtml = c.status ? `<span class="lamp-tag lamp-${c.status.replace('+', '-plus')}">${c.status}</span>` : '';
          const isB10 = rank <= 10;
          return `
            <div class="b40-card" onclick="openInputModal('${c.id}')">
              <div class="b40-rank-num ${isB10 ? 'b10-rank' : ''}">#${rank}</div>
              <div style="flex: 1; min-width: 0;">
                <div style="font-size: 13px; font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--color-text-main);">
                  ${escapeHtml(c.title)}
                </div>
                <div style="font-size: 11px; color: var(--color-text-sub); font-weight:600;">
                  <span class="ver-tag">v${c.version}</span> ${c.diff} ${c.constant.toFixed(1)} | ${c.score.toLocaleString()} ${statusHtml}
                </div>
              </div>
              <div style="text-align: right;">
                <div style="font-size: 13px; font-weight: 800; color: var(--color-primary-dark);">
                  ${c.effectiveRating.toFixed(4)}
                </div>
                ${c.rateUp ? `<div class="b40-rate-up" title="目標: ${c.rateUp.targetScore.toLocaleString()} (あと +${c.rateUp.ptsNeeded.toLocaleString()} 点)">+${c.rateUp.ptsNeeded.toLocaleString()}</div>` : ''}
              </div>
            </div>
          `;
        }).join('');
      };

      document.getElementById('b10Grid').innerHTML = renderGrid(currentCalc.b10, 1) || '<div style="color:var(--text-muted); padding:10px;">なし</div>';
      document.getElementById('b20Grid').innerHTML = renderGrid(currentCalc.b20, 11) || '<div style="color:var(--text-muted); padding:10px;">なし</div>';
      document.getElementById('b40Grid').innerHTML = renderGrid(currentCalc.b40, 21) || '<div style="color:var(--text-muted); padding:10px;">なし</div>';

      const b10Avg = currentCalc.b10.length ? (currentCalc.b10Sum / currentCalc.b10.length).toFixed(3) : '0.000';
      const b20Avg = currentCalc.b20.length ? (currentCalc.b20Sum / currentCalc.b20.length).toFixed(3) : '0.000';
      const b40Avg = currentCalc.b40.length ? (currentCalc.b40Sum / currentCalc.b40.length).toFixed(3) : '0.000';

      document.getElementById('b10Avg').textContent = `平均: ${b10Avg}`;
      document.getElementById('b20Avg').textContent = `平均: ${b20Avg}`;
      document.getElementById('b40Avg').textContent = `平均: ${b40Avg}`;
    }

    function renderMypage() {
      renderB40();
      renderMypageStats();
      renderApPlusTable();
      updateMypageBadges();
    }

    function parseDateVal(dStr) {
      if (!dStr) return 0;
      const formatted = formatApPlusDate(dStr);
      if (!formatted) return 0;
      const parts = formatted.split('/').map(x => parseInt(x, 10) || 0);
      if (parts.length < 3) return 0;
      return parts[0] * 10000 + parts[1] * 100 + parts[2];
    }

    function renderMypageStats() {
      if (!currentCalc) return;
      const allCharts = Object.values(currentCalc.chartMap);
      const isIvOnly = currentStatsScope === 'IV_PLUS';
      const targetCharts = isIvOnly ? allCharts.filter(c => c.diff === 'IV' || c.diff === 'IV-α') : allCharts;
      const totalCount = targetCharts.length;
      const filled = targetCharts.filter(c => c.score > 0);

      const apPlusCount = targetCharts.filter(c => c.status === 'AP+').length;
      const apTotalCount = targetCharts.filter(c => c.status === 'AP' || c.status === 'AP+').length;
      const apOnlyCount = apTotalCount - apPlusCount;
      const fcOnlyCount = targetCharts.filter(c => c.status === 'FC').length;
      const fcTotalCount = targetCharts.filter(c => c.status === 'FC' || c.status === 'AP' || c.status === 'AP+').length;
      const exCount = targetCharts.filter(c => c.score >= 1000000).length;
      const clearCount = filled.length - apTotalCount - fcOnlyCount;
      const unplayedCount = totalCount - filled.length;

      const registeredPct = totalCount > 0 ? ((filled.length / totalCount) * 100).toFixed(1) : '0.0';

      const progressLabelEl = document.getElementById('statOverallRegisteredLabel');
      if (progressLabelEl) {
        progressLabelEl.textContent = isIvOnly ? 'IV / IV-α 登録進捗' : '全難易度 登録進捗';
      }

      const progressEl = document.getElementById('statOverallRegisteredProgress');
      if (progressEl) {
        progressEl.textContent = filled.length.toLocaleString() + ' / ' + totalCount.toLocaleString() + ' (' + registeredPct + '%)';
      }

      // Progress bar segments
      const barApPlus = document.getElementById('statOverallBarApplus');
      const barAp = document.getElementById('statOverallBarAp');
      const barFc = document.getElementById('statOverallBarFc');
      const barClear = document.getElementById('statOverallBarClear');
      if (barApPlus && totalCount > 0) {
        barApPlus.style.width = ((apPlusCount / totalCount) * 100) + '%';
        barAp.style.width = ((apOnlyCount / totalCount) * 100) + '%';
        barFc.style.width = ((fcOnlyCount / totalCount) * 100) + '%';
        barClear.style.width = ((clearCount / totalCount) * 100) + '%';
      }

      // Lamp breakdown cells
      const lampGrid = document.getElementById('statLampGrid');
      if (lampGrid) {
        const pct = (cnt) => totalCount > 0 ? ((cnt / totalCount) * 100).toFixed(1) + '%' : '0.0%';
        lampGrid.innerHTML = 
          '<div class="lamp-stat-cell cell-applus">' +
            '<span class="lamp-stat-lbl">🌟 AP+ (理論値)</span>' +
            '<span class="lamp-stat-val">' + apPlusCount.toLocaleString() + '</span>' +
            '<span class="lamp-stat-pct">' + pct(apPlusCount) + '</span>' +
          '</div>' +
          '<div class="lamp-stat-cell cell-ap">' +
            '<span class="lamp-stat-lbl">🔶 AP</span>' +
            '<span class="lamp-stat-val">' + apTotalCount.toLocaleString() + '</span>' +
            '<span class="lamp-stat-pct">' + pct(apTotalCount) + '</span>' +
          '</div>' +
          '<div class="lamp-stat-cell cell-fc">' +
            '<span class="lamp-stat-lbl">🔷 FC (フルコン)</span>' +
            '<span class="lamp-stat-val">' + fcTotalCount.toLocaleString() + '</span>' +
            '<span class="lamp-stat-pct">' + pct(fcTotalCount) + '</span>' +
          '</div>' +
          '<div class="lamp-stat-cell cell-ex">' +
            '<span class="lamp-stat-lbl">🟢 EX (100万+)</span>' +
            '<span class="lamp-stat-val">' + exCount.toLocaleString() + '</span>' +
            '<span class="lamp-stat-pct">' + pct(exCount) + '</span>' +
          '</div>' +
          '<div class="lamp-stat-cell cell-clear">' +
            '<span class="lamp-stat-lbl">⚪ CLEAR</span>' +
            '<span class="lamp-stat-val">' + clearCount.toLocaleString() + '</span>' +
            '<span class="lamp-stat-pct">' + pct(clearCount) + '</span>' +
          '</div>' +
          '<div class="lamp-stat-cell cell-unplayed">' +
            '<span class="lamp-stat-lbl">🔒 未プレイ</span>' +
            '<span class="lamp-stat-val">' + unplayedCount.toLocaleString() + '</span>' +
            '<span class="lamp-stat-pct">' + pct(unplayedCount) + '</span>' +
          '</div>';
      }

      // Meta averages
      const avgScore = filled.length ? Math.round(filled.reduce((sum, c) => sum + c.score, 0) / filled.length) : 0;
      const ivCharts = allCharts.filter(c => c.diff === 'IV' || c.diff === 'IV-α');
      const ivFilled = ivCharts.filter(c => c.score > 0);
      const ivAvgScore = ivFilled.length ? Math.round(ivFilled.reduce((sum, c) => sum + c.score, 0) / ivFilled.length) : 0;
      const ivApCount = ivCharts.filter(c => c.status === 'AP' || c.status === 'AP+').length;
      const ivUnApRemaining = ivCharts.length - ivApCount;
      const ivRemaining = ivCharts.length - apPlusRecords.length;

      const statAvgScoreLbl = document.getElementById('statAvgScoreLbl');
      const statAvgScoreEl = document.getElementById('statAvgScore');
      if (statAvgScoreLbl && statAvgScoreEl) {
        statAvgScoreLbl.textContent = isIvOnly ? 'IV登録 平均スコア' : '登録全譜面 平均スコア';
        statAvgScoreEl.textContent = avgScore > 0 ? avgScore.toLocaleString() : '-';
      }

      const statIvAvgScoreBox = document.getElementById('statIvAvgScoreBox');
      const statIvAvgScoreEl = document.getElementById('statIvAvgScore');
      if (statIvAvgScoreBox && statIvAvgScoreEl) {
        if (isIvOnly) {
          statIvAvgScoreBox.style.display = 'none';
        } else {
          statIvAvgScoreBox.style.display = 'flex';
          statIvAvgScoreEl.textContent = ivAvgScore > 0 ? ivAvgScore.toLocaleString() : '-';
        }
      }

      const statIvUnApEl = document.getElementById('statIvUnAp');
      if (statIvUnApEl) {
        statIvUnApEl.textContent = ivUnApRemaining > 0 ? (ivUnApRemaining + ' 曲') : '全AP達成！🌟';
      }

      const statIvRemainingEl = document.getElementById('statIvRemaining');
      if (statIvRemainingEl) {
        statIvRemainingEl.textContent = ivRemaining > 0 ? (ivRemaining + ' 曲') : '全曲達成！👑';
      }

      // Quick Jump Previews
      const prevRating = document.getElementById('statPreviewRating');
      if (prevRating) prevRating.textContent = '総合 ' + currentCalc.totalRating.toFixed(4);

      const prevB40 = document.getElementById('statPreviewB40Avg');
      if (prevB40) {
        const b10Avg = currentCalc.b10.length ? (currentCalc.b10Sum / currentCalc.b10.length).toFixed(2) : '-';
        const b20Avg = currentCalc.b20.length ? (currentCalc.b20Sum / currentCalc.b20.length).toFixed(2) : '-';
        prevB40.textContent = 'B10平均: ' + b10Avg + ' | B20平均: ' + b20Avg;
      }

      const prevApCount = document.getElementById('statPreviewApCount');
      if (prevApCount) {
        const apPct = ivCharts.length > 0 ? ((apPlusRecords.length / ivCharts.length) * 100).toFixed(1) : '0.0';
        prevApCount.textContent = apPlusRecords.length + ' / ' + ivCharts.length + ' 曲 (' + apPct + '%)';
      }

      const prevLatestAp = document.getElementById('statPreviewLatestAp');
      if (prevLatestAp) {
        if (apPlusRecords.length > 0) {
          const sortedByNo = [...apPlusRecords].sort((a, b) => (b.no || 0) - (a.no || 0));
          const latest = sortedByNo[0];
          prevLatestAp.textContent = '最新: No.' + latest.no + ' ' + latest.title + (latest.date ? ' (' + latest.date + ')' : '');
        } else {
          prevLatestAp.textContent = '記録を追加して達成度を管理';
        }
      }

      // Difficulty Table
      const diffStatTitle = document.getElementById('diffStatTitle');
      if (diffStatTitle) {
        diffStatTitle.innerHTML = isIvOnly
          ? '<span>🎯</span> 難易度別クリアランプ・達成状況 (IV / IV-α のみ)'
          : '<span>🎯</span> 難易度別クリアランプ・達成状況';
      }
      const diffTableBody = document.getElementById('diffStatTableBody');
      if (diffTableBody) {
        const diffs = isIvOnly ? ['IV-α', 'IV'] : ['IV-α', 'IV', 'III', 'II', 'I'];
        let diffHtml = '';
        diffs.forEach(d => {
          const dCharts = allCharts.filter(c => c.diff === d);
          if (dCharts.length === 0) return;
          const dFilled = dCharts.filter(c => c.score > 0);
          const dApPlus = dCharts.filter(c => c.status === 'AP+').length;
          const dApTotal = dCharts.filter(c => c.status === 'AP' || c.status === 'AP+').length;
          const dApOnly = dApTotal - dApPlus;
          const dFcOnly = dCharts.filter(c => c.status === 'FC').length;
          const dFcTotal = dCharts.filter(c => c.status === 'FC' || c.status === 'AP' || c.status === 'AP+').length;
          const dAvg = dFilled.length ? Math.round(dFilled.reduce((sum, c) => sum + c.score, 0) / dFilled.length) : 0;
          const dPct = ((dFilled.length / dCharts.length) * 100).toFixed(1);
          const diffClass = getDiffClass(d);

          diffHtml += 
            '<tr>' +
              '<td><span class="diff-badge ' + diffClass + '" style="display:inline-block; font-size:11px; padding:2px 8px;">' + d + '</span></td>' +
              '<td style="font-weight:700;">' + dFilled.length + ' / ' + dCharts.length + '</td>' +
              '<td>' +
                '<div style="font-weight:800; color:var(--color-primary-dark); font-size:11px;">' + dPct + '%</div>' +
                '<div class="stacked-bar-wrap" style="height:6px; width:70px; margin:0 auto;">' +
                  '<div class="bar-seg-applus" style="width:' + ((dApPlus/dCharts.length)*100) + '%;"></div>' +
                  '<div class="bar-seg-ap" style="width:' + ((dApOnly/dCharts.length)*100) + '%;"></div>' +
                  '<div class="bar-seg-fc" style="width:' + ((dFcOnly/dCharts.length)*100) + '%;"></div>' +
                '</div>' +
              '</td>' +
              '<td class="text-lamp-applus" style="font-weight:800;">' + dApPlus + '</td>' +
              '<td class="text-lamp-ap" style="font-weight:800;">' + dApTotal + '</td>' +
              '<td class="text-lamp-fc" style="font-weight:800;">' + dFcTotal + '</td>' +
              '<td style="font-weight:700;">' + (dAvg > 0 ? dAvg.toLocaleString() : '-') + '</td>' +
            '</tr>';
        });
        diffTableBody.innerHTML = diffHtml;
      }

      // Level Breakdown (Gamified multi-color bar)
      const levelStatTitle = document.getElementById('levelStatTitle');
      if (levelStatTitle) {
        levelStatTitle.innerHTML = isIvOnly
          ? '<span>📈</span> レベル別 埋まり状況 (IV / IV-α のみ)'
          : '<span>📈</span> レベル別 埋まり状況 (Lv.1 〜 Lv.14+)';
      }
      const levelStatNote = document.getElementById('levelStatNote');
      if (levelStatNote) {
        levelStatNote.textContent = isIvOnly
          ? 'IV / IV-α 譜面を対象としたレベル別達成度（金: AP+ / 橙: AP / 青: FC / 緑: CLEAR）'
          : '全難易度を対象としたレベル別達成度（金: AP+ / 橙: AP / 青: FC / 緑: CLEAR）';
      }
      const levelContainer = document.getElementById('levelStatContainer');
      if (levelContainer) {
        const orderLevels = ['14+', '14', '13+', '13', '12+', '12', '11+', '11', '10+', '10', '9', '8', '7', '6', '5', '4', '3', '2', '1'];
        let lvlHtml = '';
        orderLevels.forEach(lvl => {
          const lCharts = targetCharts.filter(c => String(c.level) === lvl);
          if (lCharts.length === 0) return;
          const lFilled = lCharts.filter(c => c.score > 0);
          const lApPlus = lCharts.filter(c => c.status === 'AP+').length;
          const lApTotal = lCharts.filter(c => c.status === 'AP' || c.status === 'AP+').length;
          const lApOnly = lApTotal - lApPlus;
          const lFc = lCharts.filter(c => c.status === 'FC').length;
          const lClear = lFilled.length - lApTotal - lFc;
          const lTotal = lCharts.length;

          const pApPlus = (lApPlus / lTotal) * 100;
          const pAp = (lApOnly / lTotal) * 100;
          const pFc = (lFc / lTotal) * 100;
          const pClear = (lClear / lTotal) * 100;

          lvlHtml += 
            '<div class="level-stat-row">' +
              '<div class="level-stat-badge">Lv.' + lvl + '</div>' +
              '<div class="level-stat-progress">' +
                '<div class="level-stat-meta">' +
                  '<span>進捗 ' + lFilled.length + ' / ' + lTotal + ' (' + (((lFilled.length/lTotal)*100).toFixed(1)) + '%)</span>' +
                  '<span>' +
                    '<span class="text-lamp-applus" style="font-weight:800;">AP+:' + lApPlus + '</span>' +
                    '<span class="text-lamp-ap" style="font-weight:800; margin-left:4px;">AP:' + lApTotal + '</span>' +
                    '<span class="text-lamp-fc" style="font-weight:800; margin-left:4px;">FC:' + lFc + '</span>' +
                  '</span>' +
                '</div>' +
                '<div class="stacked-bar-wrap">' +
                  '<div class="bar-seg-applus" style="width:' + pApPlus + '%;"></div>' +
                  '<div class="bar-seg-ap" style="width:' + pAp + '%;"></div>' +
                  '<div class="bar-seg-fc" style="width:' + pFc + '%;"></div>' +
                  '<div class="bar-seg-clear" style="width:' + pClear + '%;"></div>' +
                '</div>' +
              '</div>' +
            '</div>';
        });
        levelContainer.innerHTML = lvlHtml;
      }

      // Song Pack Breakdown
      renderPackStats();
    }

    function renderPackStats() {
      const container = document.getElementById('packStatContainer');
      if (!container || !currentCalc) return;
      const allCharts = Object.values(currentCalc.chartMap);
      const isIvOnly = currentStatsScope === 'IV_PLUS';
      const targetCharts = isIvOnly ? allCharts.filter(c => c.diff === 'IV' || c.diff === 'IV-α') : allCharts;
      const query = (document.getElementById('packStatSearch')?.value || '').toLowerCase().trim();

      const packTitleEl = document.getElementById('packStatHeaderTitle');
      if (packTitleEl) {
        packTitleEl.innerHTML = isIvOnly
          ? '<span>🎵</span> ソングパック別 進捗一覧 (IV / IV-α のみ)'
          : '<span>🎵</span> ソングパック別 進捗一覧 (全パック)';
      }

      let html = '';
      packOrder.forEach(packName => {
        if (query && !packName.toLowerCase().includes(query)) return;
        const pCharts = targetCharts.filter(c => c.pack === packName);
        if (pCharts.length === 0) return;
        const pFilled = pCharts.filter(c => c.score > 0);
        const pApPlus = pCharts.filter(c => c.status === 'AP+').length;
        const pApTotal = pCharts.filter(c => c.status === 'AP' || c.status === 'AP+').length;
        const pApOnly = pApTotal - pApPlus;
        const pFc = pCharts.filter(c => c.status === 'FC').length;
        const pAvg = pFilled.length ? Math.round(pFilled.reduce((sum, c) => sum + c.score, 0) / pFilled.length) : 0;
        const pPct = ((pFilled.length / pCharts.length) * 100).toFixed(1);

        let badgeHtml = '';
        if (pApPlus === pCharts.length && pCharts.length > 0) {
          badgeHtml = '<span class="pack-badge-pill badge-ap-plus">👑 全AP+コンプリート！</span>';
        } else if (pApTotal === pCharts.length && pCharts.length > 0) {
          badgeHtml = '<span class="pack-badge-pill badge-ap">🌟 全APコンプリート！</span>';
        } else if ((pApTotal + pFc) === pCharts.length && pCharts.length > 0) {
          badgeHtml = '<span class="pack-badge-pill badge-fc">🔷 全FCコンプリート！</span>';
        } else if (pFilled.length === pCharts.length && pCharts.length > 0) {
          badgeHtml = '<span class="pack-badge-pill badge-clear">✅ 全曲クリア！</span>';
        }

        html += 
          '<div class="pack-stat-card">' +
            '<div class="pack-stat-header">' +
              '<div class="pack-stat-title">' +
                '<span>' + escapeHtml(packName) + '</span>' +
                badgeHtml +
              '</div>' +
              '<button class="btn-pack-jump" type="button" data-pack="' + escapeHtml(packName) + '">曲一覧へ 🔍</button>' +
            '</div>' +
            '<div class="stacked-bar-wrap" style="height:6px; margin: 4px 0 6px 0;">' +
              '<div class="bar-seg-applus" style="width:' + ((pApPlus/pCharts.length)*100) + '%;"></div>' +
              '<div class="bar-seg-ap" style="width:' + ((pApOnly/pCharts.length)*100) + '%;"></div>' +
              '<div class="bar-seg-fc" style="width:' + ((pFc/pCharts.length)*100) + '%;"></div>' +
              '<div class="bar-seg-clear" style="width:' + (((pFilled.length - pApTotal - pFc)/pCharts.length)*100) + '%;"></div>' +
            '</div>' +
            '<div class="pack-stat-meta">' +
              '<span>進捗: ' + pFilled.length + '/' + pCharts.length + ' (' + pPct + '%)</span>' +
              '<span>🌟AP+:' + pApPlus + ' &nbsp; 🔶AP:' + pApTotal + ' &nbsp; 🔷FC:' + pFc + '</span>' +
              '<span>平均: ' + (pAvg > 0 ? pAvg.toLocaleString() : '-') + '</span>' +
            '</div>' +
          '</div>';
      });

      container.innerHTML = html || '<div style="color:var(--color-text-muted); text-align:center; padding:20px;">該当するソングパックがありません</div>';

      container.querySelectorAll('.btn-pack-jump').forEach(btn => {
        btn.addEventListener('click', () => {
          const p = btn.getAttribute('data-pack');
          if (p) viewPackInSongs(p);
        });
      });
    }

    window.viewPackInSongs = function(packName) {
      document.querySelectorAll('.tab-item').forEach(b => b.classList.remove('active'));
      const songsTab = document.querySelector('.tab-item[data-tab="songs"]');
      if (songsTab) songsTab.classList.add('active');

      document.getElementById('viewSongs').style.display = 'block';
      document.getElementById('viewMypage').style.display = 'none';
      document.getElementById('viewSettings').style.display = 'none';
      const fabGroup = document.getElementById('floatingBtnGroup');
      if (fabGroup) fabGroup.style.display = 'flex';

      searchQuery = packName;
      const searchInput = document.getElementById('searchInput');
      if (searchInput) searchInput.value = packName;
      if (searchInputClearCtrl) searchInputClearCtrl.updateVisibility();

      if (currentStatsScope === 'IV_PLUS') {
        filterDiffs.clear();
        filterDiffs.add('IV');
        filterDiffs.add('IV-α');
        document.querySelectorAll('#diffFilters .filter-btn').forEach(p => {
          const val = p.getAttribute('data-val');
          p.classList.toggle('active', val === 'IV' || val === 'IV-α');
        });
      }

      renderSongList();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    function renderApPlusTable() {
      const tbody = document.getElementById('apPlusTableBody');
      if (!tbody) return;

      const allSongs = getAllSongs();
      const ivCharts = allSongs.filter(c => c[2] === 'IV' || c[2] === 'IV-α');

      const summaryBadge = document.getElementById('apPlusSummaryBadge');
      if (summaryBadge) {
        const pct = ivCharts.length > 0 ? ((apPlusRecords.length / ivCharts.length) * 100).toFixed(1) : '0.0';
        summaryBadge.textContent = '達成数: ' + apPlusRecords.length + ' / ' + ivCharts.length + ' 曲 (' + pct + '%)';
      }

      const q = apPlusSearchQuery.toLowerCase().trim();
      let list = apPlusRecords.filter(r => {
        if (!q) return true;
        const matchTitle = (r.title || '').toLowerCase().includes(q);
        const matchNo = String(r.no || '').includes(q);
        const matchDate = (r.date || '').toLowerCase().includes(q);
        return matchTitle || matchNo || matchDate;
      });

      list.sort((a, b) => {
        if (apPlusSort === 'NO_ASC') return (a.no || 0) - (b.no || 0);
        if (apPlusSort === 'NO_DESC') return (b.no || 0) - (a.no || 0);
        if (apPlusSort === 'DATE_DESC') {
          const dComp = parseDateVal(b.date) - parseDateVal(a.date);
          if (dComp !== 0) return dComp;
          return (b.no || 0) - (a.no || 0);
        }
        if (apPlusSort === 'DATE_ASC') {
          const dComp = parseDateVal(a.date) - parseDateVal(b.date);
          if (dComp !== 0) return dComp;
          return (a.no || 0) - (b.no || 0);
        }
        if (apPlusSort === 'CONST_DESC') {
          const cB = (b.constant !== undefined && b.constant !== null && !isNaN(b.constant)) ? b.constant : 0;
          const cA = (a.constant !== undefined && a.constant !== null && !isNaN(a.constant)) ? a.constant : 0;
          if (cB !== cA) return cB - cA;
          return (a.no || 0) - (b.no || 0);
        }
        if (apPlusSort === 'CONST_ASC') {
          const cB = (b.constant !== undefined && b.constant !== null && !isNaN(b.constant)) ? b.constant : 0;
          const cA = (a.constant !== undefined && a.constant !== null && !isNaN(a.constant)) ? a.constant : 0;
          if (cA !== cB) return cA - cB;
          return (a.no || 0) - (b.no || 0);
        }
        if (apPlusSort === 'TITLE') {
          return (a.title || '').localeCompare(b.title || '', 'ja');
        }
        return (a.no || 0) - (b.no || 0);
      });

      let html = '';
      list.forEach(r => {
        const origIndex = apPlusRecords.indexOf(r);
        const diffClass = getDiffClass(r.diff);

        // Master chart fallback for level and constant
        const match = masterSongs.find(s => s[1].toLowerCase() === (r.title || '').toLowerCase() && s[2] === r.diff);
        const level = (r.level && r.level !== 'undefined' && r.level !== 'null') ? r.level : (match ? match[3] : '-');
        const constantVal = (r.constant !== undefined && r.constant !== null && !isNaN(r.constant) && Number(r.constant) > 0)
          ? Number(r.constant)
          : (match ? match[4] : 0);
        const chartId = r.chartId || (match ? match[0] : '');
        const dateStr = formatApPlusDate(r.date);

        html += 
          '<tr>' +
            '<td class="ap-no-cell">' + r.no + '</td>' +
            '<td class="ap-title-cell" data-chart-id="' + escapeHtml(chartId) + '" title="クリックしてスコアを確認・編集">' +
              escapeHtml(r.title) +
            '</td>' +
            '<td style="text-align:center;">' +
              '<span class="diff-badge ' + diffClass + '" style="display:inline-block; font-size:11px; padding:2px 6px;">' + r.diff + '</span>' +
            '</td>' +
            '<td style="text-align:center; font-weight:800;">' + escapeHtml(level) + '</td>' +
            '<td class="ap-const-cell">' + constantVal.toFixed(1) + '</td>' +
            '<td class="col-date ap-date-cell">' + escapeHtml(dateStr || '-') + '</td>' +
            '<td class="ap-action-cell">' +
              '<button class="btn-table-action" type="button" title="編集" data-action="edit" data-idx="' + origIndex + '">✎</button>' +
              '<button class="btn-table-action del" type="button" title="削除" data-action="del" data-idx="' + origIndex + '">🗑</button>' +
            '</td>' +
          '</tr>';
      });

      tbody.innerHTML = html || '<tr><td colspan="7" style="text-align:center; padding:30px; color:var(--color-text-muted);">該当する記録がありません</td></tr>';

      tbody.querySelectorAll('.ap-title-cell').forEach(td => {
        td.addEventListener('click', () => {
          const id = td.getAttribute('data-chart-id');
          if (id) openInputModal(id);
        });
      });

      tbody.querySelectorAll('.btn-table-action').forEach(btn => {
        btn.addEventListener('click', () => {
          const act = btn.getAttribute('data-action');
          const idx = parseInt(btn.getAttribute('data-idx'), 10);
          if (act === 'edit') openAddApPlusModal(idx);
          else if (act === 'del') deleteApPlusRecord(idx);
        });
      });

      applyApPlusDateVisibility();
    }

    function populateApPlusChartOptions(editingChartId = null) {
      const select = document.getElementById('apPlusChartSelect');
      if (!select) return;

      const allSongs = getAllSongs();
      const ivCharts = allSongs.filter(c => c[2] === 'IV' || c[2] === 'IV-α');

      const recordedChartIds = new Set(
        apPlusRecords
          .map(r => r.chartId)
          .filter(id => id && id !== editingChartId)
      );

      // 理論値(1010000点 or AP+)達成済み かつ 未登録（または編集中譜面）のみを抽出
      const eligibleCharts = ivCharts.filter(c => {
        const id = c[0];
        if (id === editingChartId) return true;
        if (recordedChartIds.has(id)) return false;
        const s = userScores[id];
        return s && (s.score === THEORY_SCORE || s.status === 'AP+');
      });

      eligibleCharts.sort((a, b) => {
        if (b[4] !== a[4]) return b[4] - a[4];
        return a[1].localeCompare(b[1], 'ja');
      });

      if (eligibleCharts.length === 0) {
        select.innerHTML = '<option value="">-- 理論値達成済みの未登録譜面がありません --</option>';
        select.disabled = true;
        return;
      }

      select.disabled = false;
      let opts = '<option value="">-- 譜面を選択してください (' + eligibleCharts.length + '曲) --</option>';
      eligibleCharts.forEach(c => {
        opts += '<option value="' + c[0] + '" data-title="' + escapeHtml(c[1]) + '" data-diff="' + c[2] + '" data-level="' + c[3] + '" data-const="' + c[4] + '" data-pack="' + escapeHtml(c[6]) + '">[' + c[2] + ' Lv.' + c[3] + ' 定数' + c[4].toFixed(1) + '] ' + escapeHtml(c[1]) + ' (' + escapeHtml(c[6]) + ')</option>';
      });
      select.innerHTML = opts;
    }

    function initApPlusForm() {
      const select = document.getElementById('apPlusChartSelect');
      if (!select) return;

      select.addEventListener('change', () => {
        const opt = select.selectedOptions[0];
        if (opt && opt.value) {
          document.getElementById('apPlusPreviewTitle').textContent = opt.getAttribute('data-title') || '曲名';
          document.getElementById('apPlusPreviewPack').textContent = opt.getAttribute('data-pack') || 'パック名';
          const diff = opt.getAttribute('data-diff') || 'IV';
          const diffBadge = document.getElementById('apPlusPreviewDiff');
          diffBadge.textContent = diff;
          diffBadge.className = 'diff-badge ' + getDiffClass(diff);
          document.getElementById('apPlusPreviewConst').textContent = parseFloat(opt.getAttribute('data-const') || 0).toFixed(1);
        } else {
          document.getElementById('apPlusPreviewTitle').textContent = '曲名';
          document.getElementById('apPlusPreviewPack').textContent = 'パック名';
          document.getElementById('apPlusPreviewConst').textContent = '-';
        }
      });
    }

    window.openAddApPlusModal = function(editIndex = -1) {
      document.getElementById('apPlusEditIndex').value = editIndex;
      const titleEl = document.getElementById('apPlusModalTitle');
      const select = document.getElementById('apPlusChartSelect');
      const noInput = document.getElementById('apPlusNoInput');
      const dateInput = document.getElementById('apPlusDateInput');

      let currentEditingChartId = null;
      if (editIndex >= 0 && apPlusRecords[editIndex]) {
        currentEditingChartId = apPlusRecords[editIndex].chartId || null;
      }
      populateApPlusChartOptions(currentEditingChartId);

      if (editIndex >= 0 && apPlusRecords[editIndex]) {
        const r = apPlusRecords[editIndex];
        titleEl.textContent = '✎ 理論値(AP+)記録の編集';
        noInput.value = r.no || '';
        dateInput.value = r.date || '';
        select.value = r.chartId || '';
        select.dispatchEvent(new Event('change'));
      } else {
        titleEl.textContent = '🌟 理論値(AP+)記録の追加';
        const nextNo = apPlusRecords.reduce((max, r) => Math.max(max, r.no || 0), 0) + 1;
        noInput.value = nextNo;
        const d = new Date();
        dateInput.value = d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate();
        select.value = '';
        select.dispatchEvent(new Event('change'));
      }

      document.getElementById('apPlusModal').classList.add('open');
    };

    function closeAddApPlusModal() {
      document.getElementById('apPlusModal').classList.remove('open');
    }

    function saveApPlusModal() {
      const editIndex = parseInt(document.getElementById('apPlusEditIndex').value, 10);
      const select = document.getElementById('apPlusChartSelect');
      const opt = select.selectedOptions[0];
      if (!opt || !opt.value) {
        alert('譜面を選択してください。');
        return;
      }

      const noVal = parseInt(document.getElementById('apPlusNoInput').value, 10) || 1;
      const dateVal = document.getElementById('apPlusDateInput').value.trim();
      const chartId = opt.value;
      const title = opt.getAttribute('data-title');
      const diff = opt.getAttribute('data-diff');
      const level = opt.getAttribute('data-level');
      const constant = parseFloat(opt.getAttribute('data-const')) || 0;

      const record = {
        no: noVal,
        title: title,
        diff: diff,
        level: level,
        constant: constant,
        date: dateVal,
        chartId: chartId
      };

      if (editIndex >= 0 && editIndex < apPlusRecords.length) {
        apPlusRecords[editIndex] = record;
      } else {
        apPlusRecords.push(record);
      }

      renderApPlusTable();
      renderMypageStats();
      updateMypageBadges();
      closeAddApPlusModal();
      checkUnsavedChanges();
    }

    window.deleteApPlusRecord = function(index) {
      if (index < 0 || index >= apPlusRecords.length) return;
      const r = apPlusRecords[index];
      if (confirm('No.' + r.no + ' 「' + r.title + '」 のAP+記録を削除しますか？')) {
        apPlusRecords.splice(index, 1);
        renderApPlusTable();
        renderMypageStats();
        updateMypageBadges();
        checkUnsavedChanges();
      }
    };

    function autoSyncApPlusRecords() {
      const allSongs = getAllSongs();
      const ivCharts = allSongs.filter(c => c[2] === 'IV' || c[2] === 'IV-α');

      const completed = ivCharts.filter(c => {
        const s = userScores[c[0]];
        return s && (s.score === THEORY_SCORE || s.status === 'AP+');
      });

      const existingChartIds = new Set(apPlusRecords.map(r => r.chartId));
      const newToAdd = completed.filter(c => !existingChartIds.has(c[0]));

      if (newToAdd.length === 0) {
        alert('現在、記録一覧に含まれていない新しいAP+譜面（IV / IV-α）はありません。');
        return;
      }

      const d = new Date();
      const todayStr = d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate();

      if (confirm(newToAdd.length + '件の未記録AP+譜面が見つかりました。\n本日の日付（' + todayStr + '）で記録に追加しますか？')) {
        let nextNo = apPlusRecords.reduce((max, r) => Math.max(max, r.no || 0), 0) + 1;
        newToAdd.forEach(c => {
          apPlusRecords.push({
            no: nextNo++,
            title: c[1],
            diff: c[2],
            level: c[3],
            constant: c[4],
            date: todayStr,
            chartId: c[0]
          });
        });
        renderApPlusTable();
        renderMypageStats();
        updateMypageBadges();
        checkUnsavedChanges();
        alert(newToAdd.length + '件の譜面を記録に追加しました！\n※下部の「💾 保存する」で確定してください。');
      }
    }

    function escapeHtml(str) {
      return (str || '').replace(/[&<>"']/g, m => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
      }[m]));
    }

    window.openInputModal = function(id) {
      selectedChart = currentCalc.chartMap[id];
      if (!selectedChart) return;

      currentInputScore = selectedChart.score || 0;
      currentInputStatus = selectedChart.status || '';

      const delLabel = selectedChart.endOfSale === 1 ? ' [販売終了]' : '';
      document.getElementById('modalSongTitle').textContent = `${selectedChart.title}${delLabel} [v${selectedChart.version} ${selectedChart.diff} ${selectedChart.constant.toFixed(1)}]`;
      
      const scoreInput = document.getElementById('modalScoreInput');
      scoreInput.value = currentInputScore > 0 ? currentInputScore.toString() : '';
      updateModalDisplay(false);

      document.getElementById('inputModal').classList.add('open');

      setTimeout(() => {
        scoreInput.focus();
        scoreInput.select();
      }, 50);
    };

    function closeModal() {
      document.getElementById('inputModal').classList.remove('open');
      selectedChart = null;
    }

    function updateModalDisplay(syncInput = true) {
      if (syncInput) {
        document.getElementById('modalScoreInput').value = currentInputScore > 0 ? currentInputScore.toString() : '';
      }

      document.querySelectorAll('.lamp-choice').forEach(el => {
        el.classList.toggle('selected', el.getAttribute('data-status') === currentInputStatus);
      });

      if (selectedChart && selectedChart.endOfSale === 1) {
        document.getElementById('modalPreviewRating').textContent = 'Rating 0.0000 (販売終了)';
      } else if (selectedChart) {
        const rate = calcSingleRating(currentInputScore, selectedChart.constant, selectedChart.endOfSale);
        document.getElementById('modalPreviewRating').textContent = `Rating ${rate.toFixed(4)}`;
      }
    }

    const modalScoreInputEl = document.getElementById('modalScoreInput');
    modalScoreInputEl.addEventListener('input', (e) => {
      const raw = e.target.value.replace(/[^0-9]/g, '');
      let val = parseInt(raw) || 0;
      if (val > THEORY_SCORE) {
        val = THEORY_SCORE;
        e.target.value = String(THEORY_SCORE);
      } else if (raw !== e.target.value) {
        e.target.value = raw;
      }
      currentInputScore = val;
      if (currentInputScore === THEORY_SCORE) {
        currentInputStatus = 'AP+';
      } else if (currentInputStatus === 'AP+') {
        currentInputStatus = 'AP';
      }
      updateModalDisplay(false);
    });

    modalScoreInputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('btnModalSave').click();
      }
    });

    document.querySelectorAll('.key-cell').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-key');
        if (key === 'C') {
          currentInputScore = 0;
          currentInputStatus = '';
        } else if (key === 'BS') {
          const s = currentInputScore.toString();
          currentInputScore = s.length > 1 ? parseInt(s.slice(0, -1)) : 0;
          if (currentInputStatus === 'AP+' && currentInputScore < THEORY_SCORE) {
            currentInputStatus = 'AP';
          }
        } else {
          const s = currentInputScore === 0 ? key : currentInputScore.toString() + key;
          const val = parseInt(s);
          if (val <= THEORY_SCORE) {
            currentInputScore = val;
            if (currentInputScore === THEORY_SCORE) {
              currentInputStatus = 'AP+';
            } else if (currentInputStatus === 'AP+') {
              currentInputStatus = 'AP';
            }
          }
        }
        updateModalDisplay();
      });
    });

    document.querySelectorAll('.quick-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = parseInt(btn.getAttribute('data-quick'));
        currentInputScore = val;
        const st = btn.getAttribute('data-status');
        if (st) {
          currentInputStatus = st;
        } else if (val === THEORY_SCORE) {
          currentInputStatus = 'AP+';
        } else if (currentInputStatus === 'AP+') {
          currentInputStatus = 'AP';
        }
        updateModalDisplay();
      });
    });

    document.querySelectorAll('.lamp-choice').forEach(opt => {
      opt.addEventListener('click', () => {
        const st = opt.getAttribute('data-status');
        if (currentInputStatus === st) {
          currentInputStatus = '';
        } else {
          currentInputStatus = st;
          if (st === 'AP+') {
            currentInputScore = THEORY_SCORE;
          }
        }
        updateModalDisplay();
      });
    });

    document.getElementById('btnModalSave').addEventListener('click', () => {
      if (selectedChart) {
        const isApPlus = (currentInputScore === THEORY_SCORE || currentInputStatus === 'AP+');
        if (currentInputScore === THEORY_SCORE) {
          currentInputStatus = 'AP+';
        }
        userScores[selectedChart.id] = {
          score: currentInputScore,
          status: currentInputStatus
        };

        // 自動記録処理 (IV / IV-α かつ 1010000/AP+ 達成時)
        if (autoRecordApPlus && isApPlus && (selectedChart.diff === 'IV' || selectedChart.diff === 'IV-α')) {
          const alreadyExists = apPlusRecords.some(r => r.chartId === selectedChart.id);
          if (!alreadyExists) {
            const d = new Date();
            const todayStr = d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate();
            const nextNo = apPlusRecords.reduce((max, r) => Math.max(max, r.no || 0), 0) + 1;
            apPlusRecords.push({
              no: nextNo,
              title: safeSongTitle(selectedChart.title),
              diff: selectedChart.diff,
              level: selectedChart.level || calcLevelFromConstant(selectedChart.constant),
              constant: selectedChart.constant || 0,
              date: todayStr,
              chartId: selectedChart.id
            });
            renderApPlusTable();
            renderMypageStats();
            updateMypageBadges();
            showSaveToast('🌟 理論値(AP+)記録に自動追加しました！');
          }
        }

        closeModal();
        refresh();
        checkUnsavedChanges();
      }
    });

    document.getElementById('btnModalClose').addEventListener('click', closeModal);
    document.getElementById('inputModal').addEventListener('click', (e) => {
      if (e.target.id === 'inputModal') closeModal();
    });

    // Reusable Clear Button Controller for Search Inputs (Twitter-like clear button)
    function setupSearchClearButton(inputId, clearBtnId, onClearCallback) {
      const input = document.getElementById(inputId);
      const btn = document.getElementById(clearBtnId);
      if (!input || !btn) return null;

      const updateVisibility = () => {
        if (input.value && input.value.trim().length > 0) {
          btn.classList.add('visible');
        } else {
          btn.classList.remove('visible');
        }
      };

      input.addEventListener('input', updateVisibility);
      input.addEventListener('change', updateVisibility);

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        input.value = '';
        updateVisibility();
        input.focus();
        if (typeof onClearCallback === 'function') {
          onClearCallback();
        } else {
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
      });

      updateVisibility();
      return { updateVisibility };
    }

    let searchInputClearCtrl = null;
    let apPlusSearchClearCtrl = null;
    let packStatSearchClearCtrl = null;
    let editSongSearchClearCtrl = null;

    function initSearchClearButtons() {
      searchInputClearCtrl = setupSearchClearButton('searchInput', 'searchInputClear', () => {
        searchQuery = '';
        renderSongList();
      });

      apPlusSearchClearCtrl = setupSearchClearButton('apPlusSearchInput', 'apPlusSearchInputClear', () => {
        apPlusSearchQuery = '';
        renderApPlusTable();
      });

      packStatSearchClearCtrl = setupSearchClearButton('packStatSearch', 'packStatSearchClear', () => {
        renderPackStats();
      });

      editSongSearchClearCtrl = setupSearchClearButton('editSongSearchInput', 'editSongSearchClear', () => {
        renderEditSongSearchResult();
      });
    }

    document.getElementById('searchInput').addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderSongList();
    });

    document.getElementById('sortSelect').addEventListener('change', (e) => {
      currentSort = e.target.value;
      collapsedGroupIds.clear();
      renderSongList();
    });

    // Collapsible Song Groups Interaction
    songListContainer.addEventListener('click', (e) => {
      const header = e.target.closest('.song-group-header');
      if (!header) return;
      e.stopPropagation();
      const gid = header.getAttribute('data-group-id');
      if (!gid) return;
      const body = document.getElementById('body-' + gid);
      if (collapsedGroupIds.has(gid)) {
        collapsedGroupIds.delete(gid);
        header.classList.remove('collapsed');
        if (body) body.classList.remove('collapsed');
      } else {
        collapsedGroupIds.add(gid);
        header.classList.add('collapsed');
        if (body) body.classList.add('collapsed');
      }
    });

    document.getElementById('btnExpandAllGroups')?.addEventListener('click', () => {
      collapsedGroupIds.clear();
      document.querySelectorAll('.song-group-header').forEach(h => h.classList.remove('collapsed'));
      document.querySelectorAll('.song-group-body').forEach(b => b.classList.remove('collapsed'));
    });

    document.getElementById('btnCollapseAllGroups')?.addEventListener('click', () => {
      document.querySelectorAll('.song-group-section').forEach(sec => {
        const gid = sec.getAttribute('data-group-id');
        if (gid) collapsedGroupIds.add(gid);
      });
      document.querySelectorAll('.song-group-header').forEach(h => h.classList.add('collapsed'));
      document.querySelectorAll('.song-group-body').forEach(b => b.classList.add('collapsed'));
    });

    document.getElementById('chkShowDeleted').addEventListener('change', (e) => {
      showDeleted = e.target.checked;
      renderSongList();
    });

    document.querySelectorAll('#diffFilters .filter-btn').forEach(pill => {
      pill.addEventListener('click', () => {
        const val = pill.getAttribute('data-val');
        const allBtn = document.querySelector('#diffFilters .filter-btn[data-val="ALL"]');
        const specificBtns = document.querySelectorAll('#diffFilters .filter-btn:not([data-val="ALL"])');

        if (val === 'ALL') {
          filterDiffs.clear();
          specificBtns.forEach(p => p.classList.remove('active'));
          allBtn.classList.add('active');
        } else {
          if (filterDiffs.has(val)) {
            filterDiffs.delete(val);
            pill.classList.remove('active');
          } else {
            filterDiffs.add(val);
            pill.classList.add('active');
          }

          if (filterDiffs.size === 0) {
            allBtn.classList.add('active');
          } else if (filterDiffs.size === specificBtns.length) {
            filterDiffs.clear();
            specificBtns.forEach(p => p.classList.remove('active'));
            allBtn.classList.add('active');
          } else {
            allBtn.classList.remove('active');
          }
        }
        renderSongList();
      });
    });

    document.querySelectorAll('#constFilters .filter-btn, #statusFilters .filter-btn').forEach(pill => {
      pill.addEventListener('click', () => {
        const type = pill.getAttribute('data-filter');
        const val = pill.getAttribute('data-val');

        if (type === 'const') {
          document.querySelectorAll('#constFilters .filter-btn[data-filter="const"]').forEach(p => p.classList.remove('active'));
          pill.classList.add('active');
          filterConst = val;
        } else if (type === 'status') {
          if (pill.classList.contains('active')) {
            pill.classList.remove('active');
            filterStatus = 'ALL';
          } else {
            document.querySelectorAll('#statusFilters .filter-btn[data-filter="status"]').forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            filterStatus = val;
          }
        }
        renderSongList();
      });
    });

    function syncFilterInputs() {
      const sMinVal = document.getElementById('filterScoreMin').value.trim();
      filterScoreMin = sMinVal !== '' ? parseInt(sMinVal, 10) : null;
      if (isNaN(filterScoreMin)) filterScoreMin = null;

      const sMaxVal = document.getElementById('filterScoreMax').value.trim();
      filterScoreMax = sMaxVal !== '' ? parseInt(sMaxVal, 10) : null;
      if (isNaN(filterScoreMax)) filterScoreMax = null;

      excludeApPlus = document.getElementById('chkExcludeApPlus').checked;
      excludeAp = document.getElementById('chkExcludeAp').checked;
      excludeFc = document.getElementById('chkExcludeFc').checked;
      excludeEx = document.getElementById('chkExcludeEx').checked;
      excludePlayed = document.getElementById('chkExcludePlayed').checked;

      const cMinVal = document.getElementById('filterConstMin').value.trim();
      filterConstMin = cMinVal !== '' ? parseFloat(cMinVal) : null;
      if (isNaN(filterConstMin)) filterConstMin = null;

      const cMaxVal = document.getElementById('filterConstMax').value.trim();
      filterConstMax = cMaxVal !== '' ? parseFloat(cMaxVal) : null;
      if (isNaN(filterConstMax)) filterConstMax = null;

      const cExactVal = document.getElementById('filterConstExact').value.trim();
      filterConstExact = cExactVal !== '' ? parseFloat(cExactVal) : null;
      if (isNaN(filterConstExact)) filterConstExact = null;

      filterLevelMin = document.getElementById('filterLevelMin').value;
      filterLevelMax = document.getElementById('filterLevelMax').value;
      filterLevelExact = document.getElementById('filterLevelExact').value;

      renderSongList();
    }

    ['filterScoreMin', 'filterScoreMax', 'filterConstMin', 'filterConstMax', 'filterConstExact'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', syncFilterInputs);
        el.addEventListener('change', syncFilterInputs);
      }
    });

    ['chkExcludeApPlus', 'chkExcludeAp', 'chkExcludeFc', 'chkExcludeEx', 'chkExcludePlayed', 'filterLevelMin', 'filterLevelMax', 'filterLevelExact'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('change', syncFilterInputs);
      }
    });

    document.querySelectorAll('.tab-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        switchMainTab(tab);
      });
    });

    document.getElementById('btnClearActiveFilter')?.addEventListener('click', () => {
      const resetBtn = document.getElementById('btnFilterReset');
      if (resetBtn) resetBtn.click();
    });

    document.getElementById('chkAutoSaveFilters')?.addEventListener('change', (e) => {
      setFilterAutoSaveEnabled(e.target.checked);
    });

    // MyPage Sub-Navigation & Event Listeners
    document.getElementById('mypageNavStats')?.addEventListener('click', () => switchMypageSubView('stats'));
    document.getElementById('mypageNavB40')?.addEventListener('click', () => switchMypageSubView('b40'));
    document.getElementById('mypageNavApPlus')?.addEventListener('click', () => switchMypageSubView('applus'));

    document.getElementById('jumpCardToB40')?.addEventListener('click', () => switchMypageSubView('b40'));
    document.getElementById('jumpCardToApPlus')?.addEventListener('click', () => switchMypageSubView('applus'));

    document.getElementById('btnBackToStatsFromB40')?.addEventListener('click', () => switchMypageSubView('stats'));
    document.getElementById('btnBackToStatsFromApPlus')?.addEventListener('click', () => switchMypageSubView('stats'));

    document.getElementById('chkShowApPlusDate')?.addEventListener('change', (e) => {
      showApPlusDate = e.target.checked;
      localStorage.setItem(SHOW_DATE_KEY, String(showApPlusDate));
      applyApPlusDateVisibility();
    });

    document.getElementById('chkAutoRecordApPlus')?.addEventListener('change', (e) => {
      autoRecordApPlus = e.target.checked;
      localStorage.setItem(AUTO_RECORD_AP_PLUS_KEY, String(autoRecordApPlus));
    });

    document.getElementById('btnScopeAll')?.addEventListener('click', () => setStatsScope('ALL'));
    document.getElementById('btnScopeIv')?.addEventListener('click', () => setStatsScope('IV_PLUS'));
    updateStatsScopeUI();

    document.getElementById('btnOpenAddApPlusModal')?.addEventListener('click', () => openAddApPlusModal(-1));
    document.getElementById('btnApPlusModalClose')?.addEventListener('click', closeAddApPlusModal);
    document.getElementById('btnApPlusModalCancel')?.addEventListener('click', closeAddApPlusModal);
    document.getElementById('btnApPlusModalSave')?.addEventListener('click', saveApPlusModal);
    document.getElementById('btnAutoSyncApPlus')?.addEventListener('click', autoSyncApPlusRecords);
    document.getElementById('apPlusModal')?.addEventListener('click', (e) => {
      if (e.target.id === 'apPlusModal') closeAddApPlusModal();
    });

    document.getElementById('apPlusSearchInput')?.addEventListener('input', (e) => {
      apPlusSearchQuery = e.target.value;
      renderApPlusTable();
    });

    document.getElementById('apPlusSortSelect')?.addEventListener('change', (e) => {
      apPlusSort = e.target.value;
      renderApPlusTable();
    });

    document.getElementById('packStatSearch')?.addEventListener('input', () => {
      renderPackStats();
    });

    document.getElementById('btnScrollTop')?.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    document.getElementById('btnOpenFilterModal').addEventListener('click', openFilterModal);
    document.getElementById('btnFilterModalClose').addEventListener('click', closeFilterModal);
    document.getElementById('btnFilterApply').addEventListener('click', closeFilterModal);
    document.getElementById('filterModal').addEventListener('click', (e) => {
      if (e.target.id === 'filterModal') closeFilterModal();
    });

    document.getElementById('btnFilterReset').addEventListener('click', () => {
      collapsedGroupIds.clear();
      searchQuery = '';
      document.getElementById('searchInput').value = '';
      if (searchInputClearCtrl) searchInputClearCtrl.updateVisibility();
      currentSort = 'DEFAULT';
      document.getElementById('sortSelect').value = 'DEFAULT';
      showDeleted = true;
      document.getElementById('chkShowDeleted').checked = true;
      filterDiffs.clear();
      document.querySelectorAll('#diffFilters .filter-btn').forEach(p => {
        p.classList.toggle('active', p.getAttribute('data-val') === 'ALL');
      });
      filterConst = 'ALL';
      filterStatus = 'ALL';
      document.querySelectorAll('#constFilters .filter-btn, #statusFilters .filter-btn').forEach(p => {
        p.classList.toggle('active', p.getAttribute('data-val') === 'ALL');
      });

      filterScoreMin = null;
      document.getElementById('filterScoreMin').value = '';
      filterScoreMax = null;
      document.getElementById('filterScoreMax').value = '';
      excludeApPlus = false;
      document.getElementById('chkExcludeApPlus').checked = false;
      excludeAp = false;
      document.getElementById('chkExcludeAp').checked = false;
      excludeFc = false;
      document.getElementById('chkExcludeFc').checked = false;
      excludeEx = false;
      document.getElementById('chkExcludeEx').checked = false;
      excludePlayed = false;
      document.getElementById('chkExcludePlayed').checked = false;

      filterConstMin = null;
      document.getElementById('filterConstMin').value = '';
      filterConstMax = null;
      document.getElementById('filterConstMax').value = '';
      filterConstExact = null;
      document.getElementById('filterConstExact').value = '';

      filterLevelMin = '';
      document.getElementById('filterLevelMin').value = '';
      filterLevelMax = '';
      document.getElementById('filterLevelMax').value = '';
      filterLevelExact = '';
      document.getElementById('filterLevelExact').value = '';

      renderSongList();
    });

    // Escape HTML helper
    function escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }

    // Staged Cards and Saved Custom Songs UI Rendering
    function renderStagedCards() {
      const section = document.getElementById('stagedCardsSection');
      const listEl = document.getElementById('stagedCardsList');
      const countEl = document.getElementById('stagedCardsCount');
      if (!section || !listEl) return;

      const currentGroups = getSongGroups(masterSongs);
      const savedGroups = getSongGroups(savedMasterSongs);
      const savedSongIds = new Set(savedGroups.map(g => g.songId));

      const stagedList = currentGroups.filter(g => !savedSongIds.has(g.songId));
      if (stagedList.length === 0) {
        section.style.display = 'none';
        listEl.innerHTML = '';
        if (countEl) countEl.textContent = '0';
        return;
      }

      section.style.display = 'block';
      if (countEl) countEl.textContent = stagedList.length;

      let html = '';
      stagedList.forEach(song => {
        const diffChips = [];
        DIFF_KEYS_ASC.forEach(diff => {
          if (song.diffs && song.diffs[diff]) {
            const d = song.diffs[diff];
            const chipClass = diff === 'IV-α' ? 'chip-IV-alpha' : 'chip-' + diff;
            const constStr = isNaN(d.constant) ? '-' : Number(d.constant).toFixed(1);
            diffChips.push('<span class="custom-diff-chip ' + chipClass + '">' + diff + ': ' + constStr + ' (Lv.' + d.level + ')</span>');
          }
        });

        const alphaTitle = getChartTitleFromSongObj(song, 'IV-α');
        const titleHtml = (alphaTitle && alphaTitle !== song.title && song.diffs && song.diffs['IV-α'])
          ? (escapeHtml(song.title) + ' <span style="font-size:11px; color:var(--color-primary);">/ IV-α: ' + escapeHtml(alphaTitle) + '</span>')
          : escapeHtml(song.title);

        html += '<div class="staged-song-card">' +
          '<div class="custom-card-main">' +
            '<div class="custom-card-title">' + titleHtml + '</div>' +
            '<div class="custom-card-meta">' +
              '<span class="ver-tag">' + escapeHtml(song.version) + '</span>' +
              '<span>' + escapeHtml(song.pack) + '</span>' +
            '</div>' +
            '<div class="custom-diffs-chips">' + diffChips.join('') + '</div>' +
          '</div>' +
          '<button type="button" class="btn-card-action" data-action="remove-staged" data-id="' + song.songId + '">✕ 取消</button>' +
        '</div>';
      });
      listEl.innerHTML = html;

      listEl.querySelectorAll('[data-action="remove-staged"]').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          masterSongs = masterSongs.filter(s => s[7] !== id);
          checkUnsavedChanges();
          refresh();
        });
      });
    }



    // Level preview updates when constant inputs change
    function updateLevelPreviews() {
      const cI = document.getElementById('newConstI').value;
      const cII = document.getElementById('newConstII').value;
      const cIII = document.getElementById('newConstIII').value;
      const cIV = document.getElementById('newConstIV').value;
      const cIVAlpha = document.getElementById('newConstIVAlpha').value;

      document.getElementById('previewLevelI').textContent = cI ? 'Lv.' + calcLevelFromConstant(cI) : 'Lv.-';
      document.getElementById('previewLevelII').textContent = cII ? 'Lv.' + calcLevelFromConstant(cII) : 'Lv.-';
      document.getElementById('previewLevelIII').textContent = cIII ? 'Lv.' + calcLevelFromConstant(cIII) : 'Lv.-';
      document.getElementById('previewLevelIV').textContent = cIV ? 'Lv.' + calcLevelFromConstant(cIV) : 'Lv.-';
      document.getElementById('previewLevelIVAlpha').textContent = cIVAlpha ? 'Lv.' + calcLevelFromConstant(cIVAlpha) : '任意';
    }

    ['newConstI', 'newConstII', 'newConstIII', 'newConstIV', 'newConstIVAlpha'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', updateLevelPreviews);
    });

    // Populate Pack, Version, and Song Datalists
    function initFormDatalists() {
      const packDatalist = document.getElementById('packDatalist');
      const verDatalist = document.getElementById('versionDatalist');
      const songDatalist = document.getElementById('songDatalist');

      if (packDatalist) {
        packDatalist.innerHTML = packOrder.map(p => '<option value="' + escapeHtml(p) + '">').join('');
      }
      if (verDatalist) {
        const versions = [...new Set(masterSongs.map(s => s[11]))].filter(Boolean);
        versions.sort(compareVersions);
        verDatalist.innerHTML = versions.map(v => '<option value="' + escapeHtml(v) + '">').join('');
        const verInput = document.getElementById('newSongVersion');
        if (verInput && !verInput.value && versions.length > 0) {
          verInput.value = versions[0];
        }
      }
      if (songDatalist) {
        const ivSongs = masterSongs.filter(s => s[2] === 'IV');
        ivSongs.sort((a, b) => a[12] - b[12]);
        const seenTitles = new Set();
        const titles = [];
        ivSongs.forEach(s => {
          if (!seenTitles.has(s[1])) {
            seenTitles.add(s[1]);
            titles.push(s[1]);
          }
        });
        masterSongs.forEach(s => {
          if (!seenTitles.has(s[1])) {
            seenTitles.add(s[1]);
            titles.push(s[1]);
          }
        });
        songDatalist.innerHTML = titles.map(t => '<option value="' + escapeHtml(t) + '">').join('');
      }
    }

    // Render Song Pack Order Manager List
    function renderPackOrderList() {
      const listEl = document.getElementById('packOrderList');
      const countEl = document.getElementById('packListCount');
      if (!listEl) return;
      if (countEl) countEl.textContent = packOrder.length;

      let html = '';
      packOrder.forEach((packName, idx) => {
        const isFirst = idx === 0;
        const isLast = idx === packOrder.length - 1;

        html += '<div class="pack-order-item" draggable="true" data-idx="' + idx + '">' +
          '<div class="pack-item-left">' +
            '<span class="pack-drag-handle" data-drag-handle="true" title="ドラッグして並び替え">☰</span>' +
            '<span class="pack-order-num">' + (idx + 1) + '.</span>' +
            '<span class="pack-order-name" title="' + escapeHtml(packName) + '">' + escapeHtml(packName) + '</span>' +
          '</div>' +
          '<div class="pack-item-actions">' +
            '<button type="button" class="btn-pack-order" data-action="up" data-idx="' + idx + '"' + (isFirst ? ' disabled' : '') + ' title="1つ上に移動">▲</button>' +
            '<button type="button" class="btn-pack-order" data-action="down" data-idx="' + idx + '"' + (isLast ? ' disabled' : '') + ' title="1つ下に移動">▼</button>' +
            '<button type="button" class="btn-pack-delete" data-action="delete" data-idx="' + idx + '" title="このパックを削除">🗑️</button>' +
          '</div>' +
        '</div>';
      });
      listEl.innerHTML = html;

      // Button handlers (Up / Down / Delete)
      listEl.querySelectorAll('.btn-pack-order').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const action = btn.getAttribute('data-action');
          const idx = parseInt(btn.getAttribute('data-idx'), 10);
          if (action === 'up' && idx > 0) {
            const temp = packOrder[idx];
            packOrder[idx] = packOrder[idx - 1];
            packOrder[idx - 1] = temp;
          } else if (action === 'down' && idx < packOrder.length - 1) {
            const temp = packOrder[idx];
            packOrder[idx] = packOrder[idx + 1];
            packOrder[idx + 1] = temp;
          }
          renderPackOrderList();
          initFormDatalists();
          checkUnsavedChanges();
          if (currentSort === 'PACK') renderSongList();
        });
      });

      listEl.querySelectorAll('.btn-pack-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const idx = parseInt(btn.getAttribute('data-idx'), 10);
          packOrder.splice(idx, 1);
          renderPackOrderList();
          initFormDatalists();
          checkUnsavedChanges();
          if (currentSort === 'PACK') renderSongList();
        });
      });

      // HTML5 Drag & Drop (Desktop)
      let draggedIdx = null;
      const items = listEl.querySelectorAll('.pack-order-item');
      items.forEach(item => {
        item.addEventListener('dragstart', (e) => {
          draggedIdx = parseInt(item.getAttribute('data-idx'), 10);
          item.classList.add('dragging');
          e.dataTransfer.effectAllowed = 'move';
        });

        item.addEventListener('dragover', (e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
          items.forEach(i => i.classList.remove('drag-over'));
          item.classList.add('drag-over');
        });

        item.addEventListener('dragleave', () => {
          item.classList.remove('drag-over');
        });

        item.addEventListener('drop', (e) => {
          e.preventDefault();
          item.classList.remove('drag-over');
          const targetIdx = parseInt(item.getAttribute('data-idx'), 10);
          if (draggedIdx !== null && draggedIdx !== targetIdx) {
            const [moved] = packOrder.splice(draggedIdx, 1);
            packOrder.splice(targetIdx, 0, moved);
            renderPackOrderList();
            initFormDatalists();
            checkUnsavedChanges();
          }
        });

        item.addEventListener('dragend', () => {
          items.forEach(i => {
            i.classList.remove('dragging');
            i.classList.remove('drag-over');
          });
          draggedIdx = null;
        });

        // Touch Drag & Drop (Mobile: iPhone, iPad, Android)
        const handle = item.querySelector('.pack-drag-handle');
        if (handle) {
          handle.addEventListener('touchstart', (e) => {
            draggedIdx = parseInt(item.getAttribute('data-idx'), 10);
            item.classList.add('dragging');
          }, { passive: true });

          handle.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const elem = document.elementFromPoint(touch.clientX, touch.clientY);
            const targetItem = elem ? elem.closest('.pack-order-item') : null;
            if (targetItem) {
              items.forEach(i => i.classList.remove('drag-over'));
              targetItem.classList.add('drag-over');
            }
          }, { passive: false });

          handle.addEventListener('touchend', (e) => {
            const touch = e.changedTouches[0];
            const elem = document.elementFromPoint(touch.clientX, touch.clientY);
            const targetItem = elem ? elem.closest('.pack-order-item') : null;
            items.forEach(i => {
              i.classList.remove('dragging');
              i.classList.remove('drag-over');
            });
            if (targetItem && draggedIdx !== null) {
              const targetIdx = parseInt(targetItem.getAttribute('data-idx'), 10);
              if (draggedIdx !== targetIdx) {
                const [moved] = packOrder.splice(draggedIdx, 1);
                packOrder.splice(targetIdx, 0, moved);
                renderPackOrderList();
                initFormDatalists();
                checkUnsavedChanges();
                if (currentSort === 'PACK') renderSongList();
              }
            }
            draggedIdx = null;
          }, { passive: true });
        }
      });
    }

    // Add Song Pack Button
    document.getElementById('btnAddPackBtn').addEventListener('click', () => {
      const input = document.getElementById('newPackNameInput');
      const name = (input.value || '').trim();
      if (!name) {
        alert('ソングパック名を入力してください');
        input.focus();
        return;
      }
      if (packOrder.includes(name)) {
        alert('「' + name + '」は既にリストに存在します');
        input.focus();
        return;
      }
      packOrder.push(name);
      input.value = '';
      renderPackOrderList();
      initFormDatalists();
      checkUnsavedChanges();
      if (currentSort === 'PACK') renderSongList();

      const listEl = document.getElementById('packOrderList');
      if (listEl) {
        listEl.scrollTop = listEl.scrollHeight;
      }
    });

    // Reset Song Pack Order Button
    document.getElementById('btnResetPackOrder').addEventListener('click', () => {
      if (confirm('ソングパックの並び順をゲーム公式の初期順序に戻しますか？')) {
        packOrder = [...GAME_PACK_ORDER];
        const existingPacks = [...new Set(masterSongs.map(s => s[6]))].filter(Boolean);
        existingPacks.forEach(p => {
          if (!packOrder.includes(p)) packOrder.push(p);
        });
        renderPackOrderList();
        initFormDatalists();
        checkUnsavedChanges();
        if (currentSort === 'PACK') renderSongList();
      }
    });

    // Auto-fill insertAfterSong when newSongPack changes
    const newSongPackEl = document.getElementById('newSongPack');
    if (newSongPackEl) {
      const updateInsertAfterFromPack = () => {
        const packName = (newSongPackEl.value || '').trim();
        const lastSong = getLastSongOfPack(packName);
        const insertAfterEl = document.getElementById('insertAfterSong');
        if (insertAfterEl) {
          insertAfterEl.value = lastSong;
        }
      };
      newSongPackEl.addEventListener('input', updateInsertAfterFromPack);
      newSongPackEl.addEventListener('change', updateInsertAfterFromPack);
    }

    // Add Song Card Event
    document.getElementById('btnAddSongCard').addEventListener('click', () => {
      const title = document.getElementById('newSongTitle').value.trim();
      const titleAlphaEl = document.getElementById('newSongTitleAlpha');
      const titleAlpha = titleAlphaEl ? titleAlphaEl.value.trim() : '';
      const pack = document.getElementById('newSongPack').value.trim() || DEFAULT_PACK;
      const version = document.getElementById('newSongVersion').value.trim() || DEFAULT_VERSION;
      const insertAfterInput = (document.getElementById('insertAfterSong').value || '').trim();
      const insertAfterTitle = insertAfterInput || getLastSongOfPack(pack);

      const constI = parseFloat(document.getElementById('newConstI').value);
      const constII = parseFloat(document.getElementById('newConstII').value);
      const constIII = parseFloat(document.getElementById('newConstIII').value);
      const constIV = parseFloat(document.getElementById('newConstIV').value);
      const constIVAlphaVal = document.getElementById('newConstIVAlpha').value.trim();
      const constIVAlpha = constIVAlphaVal !== '' ? parseFloat(constIVAlphaVal) : null;

      if (!title) {
        alert('曲名を入力してください');
        document.getElementById('newSongTitle').focus();
        return;
      }

      if (isNaN(constI) || isNaN(constII) || isNaN(constIII) || isNaN(constIV)) {
        alert('難易度 I, II, III, IV の定数をすべて入力してください');
        return;
      }

      if (constIVAlphaVal !== '' && isNaN(constIVAlpha)) {
        alert('IV-α の定数を正しく入力してください');
        return;
      }

      const diffs = {
        'I': { constant: constI, level: calcLevelFromConstant(constI) },
        'II': { constant: constII, level: calcLevelFromConstant(constII) },
        'III': { constant: constIII, level: calcLevelFromConstant(constIII) },
        'IV': { constant: constIV, level: calcLevelFromConstant(constIV) }
      };
      if (constIVAlpha !== null && !isNaN(constIVAlpha)) {
        const ivAlphaObj = { constant: constIVAlpha, level: calcLevelFromConstant(constIVAlpha) };
        if (titleAlpha && titleAlpha !== title) {
          ivAlphaObj.title = titleAlpha;
        }
        diffs['IV-α'] = ivAlphaObj;
      }

      const songId = 'song_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
      const newSong = {
        songId,
        title,
        titleAlpha: (titleAlpha && titleAlpha !== title) ? titleAlpha : '',
        pack,
        version,
        diffs
      };

      const tuples = songObjToTuples(newSong, insertAfterTitle);
      masterSongs.push(...tuples);

      // Clear song title and constant inputs (keep pack and version for fast batch entry)
      document.getElementById('newSongTitle').value = '';
      if (titleAlphaEl) titleAlphaEl.value = '';
      document.getElementById('newConstI').value = '';
      document.getElementById('newConstII').value = '';
      document.getElementById('newConstIII').value = '';
      document.getElementById('newConstIV').value = '';
      document.getElementById('newConstIVAlpha').value = '';
      const insertAfterEl = document.getElementById('insertAfterSong');
      if (insertAfterEl) insertAfterEl.value = title;
      updateLevelPreviews();

      initFormDatalists();
      renderEditSongSearchResult();
      checkUnsavedChanges();
      refresh();
    });

    // Master Song Data Editing (Constant Revision, Packs, Titles)
    function renderEditSongSearchResult() {
      const inputEl = document.getElementById('editSongSearchInput');
      const resultEl = document.getElementById('editSongSearchResult');
      if (!resultEl) return;
      const query = (inputEl ? inputEl.value : '').trim().toLowerCase();

      if (!query) {
        resultEl.innerHTML = '<div style="font-size: 11px; color: var(--color-text-muted); text-align: center; padding: 12px;">曲名を入力して検索してください</div>';
        return;
      }

      const groups = getSongGroups(masterSongs);
      const matched = groups.filter(g => {
        const alphaTitle = getChartTitleFromSongObj(g, 'IV-α');
        return g.title.toLowerCase().includes(query) ||
          alphaTitle.toLowerCase().includes(query) ||
          (g.pack && g.pack.toLowerCase().includes(query));
      });

      if (matched.length === 0) {
        resultEl.innerHTML = '<div style="font-size: 11px; color: var(--color-text-muted); text-align: center; padding: 12px;">該当する楽曲が見つかりませんでした</div>';
        return;
      }

      const displayList = matched.slice(0, 30);
      let html = '';
      displayList.forEach(song => {
        const diffChips = [];
        DIFF_KEYS_ASC.forEach(diff => {
          if (song.diffs && song.diffs[diff]) {
            const d = song.diffs[diff];
            const chipClass = diff === 'IV-α' ? 'chip-IV-alpha' : 'chip-' + diff;
            const constStr = isNaN(d.constant) ? '-' : Number(d.constant).toFixed(1);
            diffChips.push('<span class="custom-diff-chip ' + chipClass + '">' + diff + ': ' + constStr + ' (Lv.' + d.level + ')</span>');
          }
        });

        const endOfSaleBadge = song.endOfSale === 1 ? ' <span style="color:#dc2626; font-size:11px; font-weight:800;">(販売終了)</span>' : '';
        const alphaTitle = getChartTitleFromSongObj(song, 'IV-α');
        const titleDisplay = (alphaTitle && alphaTitle !== song.title && song.diffs && song.diffs['IV-α'])
          ? (escapeHtml(song.title) + ' <span style="font-size:11px; color:var(--color-primary);">/ IV-α: ' + escapeHtml(alphaTitle) + '</span>')
          : escapeHtml(song.title);

        html += '<div class="custom-card-item" style="display:flex; justify-content:space-between; align-items:center; background:var(--color-bg-subtle, #f8fafc); border:1px solid var(--color-border); border-radius:8px; padding:8px 12px;">' +
          '<div style="flex:1; min-width:0; margin-right:10px;">' +
            '<div style="font-weight:700; font-size:13px; color:var(--color-text); margin-bottom:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">' + titleDisplay + endOfSaleBadge + '</div>' +
            '<div style="font-size:11px; color:var(--color-text-muted); margin-bottom:4px;">' +
              '<span class="ver-tag" style="background:#e2e8f0; color:#475569; border-radius:4px; padding:1px 5px; margin-right:4px;">' + escapeHtml(song.version || DEFAULT_VERSION) + '</span>' +
              '<span>' + escapeHtml(song.pack || DEFAULT_PACK) + '</span>' +
            '</div>' +
            '<div style="display:flex; flex-wrap:wrap; gap:4px;">' + diffChips.join('') + '</div>' +
          '</div>' +
          '<button type="button" class="btn-edit-master-song panel-btn" data-song-id="' + escapeHtml(song.songId) + '" style="color:var(--color-primary-dark); font-weight:800; padding:6px 14px; cursor:pointer; white-space:nowrap;">✏️ 編集</button>' +
        '</div>';
      });

      if (matched.length > 30) {
        html += '<div style="font-size: 11px; color: var(--color-text-muted); text-align: center; padding: 6px;">他 ' + (matched.length - 30) + ' 件（さらに絞り込んでください）</div>';
      }

      resultEl.innerHTML = html;

      resultEl.querySelectorAll('.btn-edit-master-song').forEach(btn => {
        btn.addEventListener('click', () => {
          const sid = btn.getAttribute('data-song-id');
          openEditSongModal(sid);
        });
      });
    }

    function updateEditModalLevelPreviews() {
      const cI = document.getElementById('editConstI').value;
      const cII = document.getElementById('editConstII').value;
      const cIII = document.getElementById('editConstIII').value;
      const cIV = document.getElementById('editConstIV').value;
      const cIVAlpha = document.getElementById('editConstIVAlpha').value;

      document.getElementById('editPreviewLevelI').textContent = cI ? 'Lv.' + calcLevelFromConstant(cI) : 'Lv.-';
      document.getElementById('editPreviewLevelII').textContent = cII ? 'Lv.' + calcLevelFromConstant(cII) : 'Lv.-';
      document.getElementById('editPreviewLevelIII').textContent = cIII ? 'Lv.' + calcLevelFromConstant(cIII) : 'Lv.-';
      document.getElementById('editPreviewLevelIV').textContent = cIV ? 'Lv.' + calcLevelFromConstant(cIV) : 'Lv.-';
      document.getElementById('editPreviewLevelIVAlpha').textContent = cIVAlpha ? 'Lv.' + calcLevelFromConstant(cIVAlpha) : 'なし';
    }

    ['editConstI', 'editConstII', 'editConstIII', 'editConstIV', 'editConstIVAlpha'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', updateEditModalLevelPreviews);
    });

    let currentEditSongPrevTitle = '';

    function openEditSongModal(songId) {
      const tuples = masterSongs.filter(s => s[7] === songId);
      if (tuples.length === 0) return;

      const first = tuples[0];
      const baseTuple = tuples.find(s => s[2] !== 'IV-α') || first;
      const alphaTuple = tuples.find(s => s[2] === 'IV-α');
      const baseTitle = safeSongTitle(baseTuple[1]);
      const alphaTitle = alphaTuple ? safeSongTitle(alphaTuple[1]) : '';
      const diffMap = {};
      tuples.forEach(t => {
        diffMap[t[2]] = t[4];
      });

      document.getElementById('editTargetSongId').value = songId;
      document.getElementById('editSongTitleInput').value = baseTitle;
      const editTitleAlphaEl = document.getElementById('editSongTitleAlphaInput');
      if (editTitleAlphaEl) {
        editTitleAlphaEl.value = (alphaTitle && alphaTitle !== baseTitle) ? alphaTitle : '';
      }
      document.getElementById('editSongPackInput').value = first[6] || '';
      document.getElementById('editSongVersionInput').value = first[11] || '';

      // Determine current previous song in default order (based on IV chart initId)
      const ivTuple = tuples.find(s => s[2] === 'IV');
      currentEditSongPrevTitle = '';
      if (ivTuple) {
        const curInitId = ivTuple[12];
        const ivCharts = masterSongs.filter(s => s[2] === 'IV' && s[7] !== songId && s[12] < curInitId);
        ivCharts.sort((a, b) => b[12] - a[12]);
        if (ivCharts.length > 0) {
          currentEditSongPrevTitle = ivCharts[0][1];
        }
      }
      const editInsertAfterEl = document.getElementById('editInsertAfterSong');
      if (editInsertAfterEl) {
        editInsertAfterEl.value = currentEditSongPrevTitle;
      }

      // End of sale checkbox
      const endOfSaleChk = document.getElementById('editSongEndOfSale');
      if (endOfSaleChk) {
        endOfSaleChk.checked = (first[8] === 1);
      }

      document.getElementById('editConstI').value = diffMap['I'] !== undefined ? diffMap['I'] : '';
      document.getElementById('editConstII').value = diffMap['II'] !== undefined ? diffMap['II'] : '';
      document.getElementById('editConstIII').value = diffMap['III'] !== undefined ? diffMap['III'] : '';
      document.getElementById('editConstIV').value = diffMap['IV'] !== undefined ? diffMap['IV'] : '';
      document.getElementById('editConstIVAlpha').value = diffMap['IV-α'] !== undefined ? diffMap['IV-α'] : '';

      updateEditModalLevelPreviews();

      const modal = document.getElementById('editSongModal');
      if (modal) modal.classList.add('open');
    }

    function closeEditSongModal() {
      const modal = document.getElementById('editSongModal');
      if (modal) modal.classList.remove('open');
    }

    // ==========================================================
    // Official Song Updates & Staging Diff Engine
    // ==========================================================
    let officialUpdatesState = {
      detectedNew: [],
      detectedMod: []
    };

    function openOfficialUpdateModal() {
      const modal = document.getElementById('officialUpdateModal');
      if (!modal) return;
      modal.style.display = 'flex';
      modal.classList.add('open');

      const elLoading = document.getElementById('officialUpdateLoading');
      const elSummary = document.getElementById('officialUpdateSummary');
      const elError = document.getElementById('officialUpdateError');
      const elEmpty = document.getElementById('officialUpdateEmpty');
      const elContent = document.getElementById('officialUpdateDiffContent');
      const btnApply = document.getElementById('btnOfficialUpdateApply');

      if (elLoading) elLoading.style.display = 'block';
      if (elSummary) elSummary.style.display = 'none';
      if (elError) elError.style.display = 'none';
      if (elEmpty) elEmpty.style.display = 'none';
      if (elContent) elContent.style.display = 'none';
      if (btnApply) {
        btnApply.style.display = 'inline-block';
        btnApply.disabled = true;
        btnApply.textContent = '✓ 反映する (計 0曲)';
      }

      fetchOfficialSongUpdates();
    }

    function closeOfficialUpdateModal() {
      const modal = document.getElementById('officialUpdateModal');
      if (modal) {
        modal.classList.remove('open');
        modal.style.display = 'none';
      }
    }

    async function fetchOfficialSongUpdates() {
      const endpoint = getActiveGasEndpoint();
      const elLoading = document.getElementById('officialUpdateLoading');
      const elSummary = document.getElementById('officialUpdateSummary');
      const elError = document.getElementById('officialUpdateError');
      const elEmpty = document.getElementById('officialUpdateEmpty');

      try {
        let officialSongs = [];
        let officialPackOrder = [];
        let fetchErrorDetail = null;

        // 1. Try fetching from Central Official DB (no url parameter)
        try {
          const centralRes = await fetch(endpoint + '?t=' + Date.now(), { method: 'GET' });
          const centralJson = await centralRes.json();
          if (centralJson.status === 'success' && centralJson.data) {
            if (Array.isArray(centralJson.data.songs) && centralJson.data.songs.length > 0) {
              officialSongs = centralJson.data.songs;
            }
            if (centralJson.data.config && Array.isArray(centralJson.data.config.packOrder) && centralJson.data.config.packOrder.length > 0) {
              officialPackOrder = centralJson.data.config.packOrder;
            }
            if (Array.isArray(centralJson.data.popups)) {
              saveCachedPopupItems(centralJson.data.popups);
            }
          } else if (centralJson.status === 'error') {
            fetchErrorDetail = centralJson.message;
          }
        } catch (e) {
          fetchErrorDetail = e.message;
        }

        // 2. Fallback to userSheetUrl if central sheet Songs is empty or errored
        if (officialSongs.length === 0 && userSheetUrl) {
          try {
            const userRes = await fetch(endpoint + '?url=' + encodeURIComponent(userSheetUrl) + '&t=' + Date.now(), { method: 'GET' });
            const userJson = await userRes.json();
            if (userJson.status === 'success' && userJson.data) {
              if (Array.isArray(userJson.data.songs) && userJson.data.songs.length > 0) {
                officialSongs = userJson.data.songs;
              }
              if (officialPackOrder.length === 0 && userJson.data.config && Array.isArray(userJson.data.config.packOrder)) {
                officialPackOrder = userJson.data.config.packOrder;
              }
              fetchErrorDetail = null;
            } else if (userJson.status === 'error') {
              fetchErrorDetail = userJson.message;
            }
          } catch (e) {
            fetchErrorDetail = e.message;
          }
        }

        if (elLoading) elLoading.style.display = 'none';

        if (!Array.isArray(officialSongs) || officialSongs.length === 0) {
          if (elError) {
            elError.style.display = 'block';
            let errMsg = '親スプレッドシート（または設定済みスプシ）から楽曲データを取得できませんでした。';
            if (fetchErrorDetail) {
              errMsg += '\n\n【詳細】: ' + fetchErrorDetail;
            } else {
              errMsg += '\n\n楽曲データが0件です。管理者は設定画面から「☁️ スプシへ保存 (同期)」を行って管理スプシへ楽曲データを初期保存してください。';
            }
            document.getElementById('officialUpdateErrorMsg').textContent = errMsg;
          }
          return;
        }

        // 2. Run Diff Engine
        diffOfficialSongs(officialSongs, officialPackOrder);

      } catch (err) {
        console.error('fetchOfficialSongUpdates error:', err);
        if (elLoading) elLoading.style.display = 'none';
        if (elError) {
          elError.style.display = 'block';
          document.getElementById('officialUpdateErrorMsg').textContent = '通信エラーが発生しました: ' + (err.message || '');
        }
      }
    }

    function diffOfficialSongs(officialSongs, officialPackOrder = []) {
      const elSummary = document.getElementById('officialUpdateSummary');
      const elEmpty = document.getElementById('officialUpdateEmpty');
      const elContent = document.getElementById('officialUpdateDiffContent');
      const newListEl = document.getElementById('officialUpdateNewList');
      const modListEl = document.getElementById('officialUpdateModList');
      const newSec = document.getElementById('officialUpdateNewSection');
      const modSec = document.getElementById('officialUpdateModSection');
      const summaryText = document.getElementById('officialUpdateSummaryText');

      // Map local songs by normalized title and songId
      const localByTitle = new Map();
      const localById = new Map();
      masterSongs.forEach(t => {
        const idKey = String(t[7] || '').trim().toLowerCase();
        if (idKey) {
          if (!localById.has(idKey)) localById.set(idKey, []);
          localById.get(idKey).push(t);
        }
      });
      masterSongs.forEach(t => {
        const idKey = String(t[7] || '').trim().toLowerCase();
        const groupTuples = (idKey && localById.get(idKey)) ? localById.get(idKey) : [t];
        const tKey = safeSongTitle(t[1]).toLowerCase();
        if (tKey && !localByTitle.has(tKey)) localByTitle.set(tKey, groupTuples);
      });

      const detectedNew = [];
      const detectedMod = [];

      officialSongs.forEach(song => {
        const titleKey = getChartTitleFromSongObj(song, 'IV').toLowerCase();
        const alphaTitleKey = getChartTitleFromSongObj(song, 'IV-α').toLowerCase();
        const idKey = String(song.songId || '').trim().toLowerCase();

        // Match existing tuples: prefer idKey, then titleKey or alphaTitleKey
        let existingTuples = (idKey && localById.get(idKey)) ||
          (titleKey && localByTitle.get(titleKey)) ||
          (alphaTitleKey && localByTitle.get(alphaTitleKey));

        if (!existingTuples || existingTuples.length === 0) {
          // New Song
          detectedNew.push(song);
        } else {
          // Existing Song: Check for differences
          const firstTuple = existingTuples[0];
          const baseTuple = existingTuples.find(t => t[2] !== 'IV-α') || firstTuple;
          const alphaTuple = existingTuples.find(t => t[2] === 'IV-α');
          const curPack = String(firstTuple[6] || DEFAULT_PACK).trim();
          const curVer = String(firstTuple[11] || DEFAULT_VERSION).trim();
          const curTitle = safeSongTitle(baseTuple[1]);
          const curAlphaTitle = alphaTuple ? safeSongTitle(alphaTuple[1]) : '';
          const offPack = String(song.pack || DEFAULT_PACK).trim();
          const offVer = String(song.version || DEFAULT_VERSION).trim();
          const offTitle = getChartTitleFromSongObj(song, 'IV');
          const offAlphaTitle = getChartTitleFromSongObj(song, 'IV-α');

          const changes = [];

          if (offTitle && curTitle !== offTitle) {
            changes.push({
              field: 'title',
              label: '曲名 (I〜IV)',
              oldVal: curTitle,
              newVal: offTitle
            });
          }

          if (alphaTuple && offAlphaTitle && curAlphaTitle !== offAlphaTitle) {
            changes.push({
              field: 'titleAlpha',
              label: 'IV-α 曲名',
              oldVal: curAlphaTitle,
              newVal: offAlphaTitle
            });
          }

          if (curPack !== offPack) {
            changes.push({
              field: 'pack',
              label: 'パック',
              oldVal: curPack,
              newVal: offPack
            });
          }

          if (curVer !== offVer) {
            changes.push({
              field: 'version',
              label: 'Ver',
              oldVal: curVer,
              newVal: offVer
            });
          }

          const curEndOfSale = Number(firstTuple[8]) || 0;
          const offEndOfSale = Number(song.endOfSale) || 0;
          if (curEndOfSale !== offEndOfSale) {
            changes.push({
              field: 'endOfSale',
              label: '販売状態',
              oldVal: curEndOfSale === 1 ? '販売終了' : '通常販売',
              newVal: offEndOfSale === 1 ? '販売終了' : '通常販売'
            });
          }

          // Check Difficulties & Constants
          const existingDiffMap = new Map();
          existingTuples.forEach(t => existingDiffMap.set(t[2], t));

          const offDiffs = song.diffs || {};
          DIFF_KEYS_ASC.forEach(diff => {
            const offD = offDiffs[diff];
            const exT = existingDiffMap.get(diff);

            if (offD && !isNaN(offD.constant) && Number(offD.constant) > 0) {
              const offConst = Number(offD.constant);
              const offLv = String(offD.level || calcLevelFromConstant(offConst)).trim();

              if (!exT) {
                changes.push({
                  field: 'diff_add',
                  diff: diff,
                  label: diff + ' 追加',
                  oldVal: '未収録',
                  newVal: 'Lv.' + offLv + ' (' + offConst + ')',
                  newConst: offConst,
                  newLevel: offLv
                });
              } else {
                const exConst = Number(exT[4]) || 0;
                const exLv = String(exT[3] || '').trim();

                const constDiff = Math.abs(exConst - offConst) > 0.001;
                const lvDiff = offD.level && exLv !== offLv;

                if (constDiff || lvDiff) {
                  changes.push({
                    field: 'const_revision',
                    diff: diff,
                    label: diff + ' 定数',
                    oldVal: exConst + (exLv ? ' (Lv.' + exLv + ')' : ''),
                    newVal: offConst + (offLv ? ' (Lv.' + offLv + ')' : ''),
                    newConst: offConst,
                    newLevel: offLv
                  });
                }
              }
            }
          });

          if (changes.length > 0) {
            detectedMod.push({
              song: song,
              existingTuples: existingTuples,
              changes: changes
            });
          }
        }
      });

      officialUpdatesState = { detectedNew, detectedMod, officialSongs, officialPackOrder };

      if (detectedNew.length === 0 && detectedMod.length === 0) {
        markNoticePopupAsRead();
        if (elEmpty) elEmpty.style.display = 'block';
        if (elContent) elContent.style.display = 'none';
        if (elSummary) elSummary.style.display = 'none';
        const btnApply = document.getElementById('btnOfficialUpdateApply');
        if (btnApply) btnApply.style.display = 'none';
        return;
      }

      if (elEmpty) elEmpty.style.display = 'none';
      if (elContent) elContent.style.display = 'block';
      if (elSummary) elSummary.style.display = 'flex';
      const btnApply = document.getElementById('btnOfficialUpdateApply');
      if (btnApply) btnApply.style.display = 'inline-block';

      // Detect newly introduced packs
      const existingPacks = new Set(packOrder);
      const newPacksFound = [];
      if (Array.isArray(officialPackOrder)) {
        officialPackOrder.forEach(p => {
          if (p && !existingPacks.has(p) && !newPacksFound.includes(p)) newPacksFound.push(p);
        });
      }
      detectedNew.forEach(s => {
        if (s.pack && !existingPacks.has(s.pack) && !newPacksFound.includes(s.pack)) newPacksFound.push(s.pack);
      });

      // Summary text
      if (summaryText) {
        let txt = '最新アプデ情報: （新規 ' + detectedNew.length + '曲 / 更新 ' + detectedMod.length + '曲';
        if (newPacksFound.length > 0) {
          txt += ' / 新パック: ' + newPacksFound.join(', ');
        }
        txt += '）';
        summaryText.textContent = txt;
      }

      // 1. Render New Songs
      if (newSec) newSec.style.display = detectedNew.length > 0 ? 'block' : 'none';
      const newCountEl = document.getElementById('officialUpdateNewCount');
      if (newCountEl) newCountEl.textContent = detectedNew.length;

      if (newListEl) {
        newListEl.innerHTML = '';
        detectedNew.forEach((s, idx) => {
          const card = document.createElement('div');
          card.className = 'update-card update-card-new';

          const d = s.diffs || {};
          let diffPillsHtml = '';
          DIFF_KEYS_ASC.forEach(k => {
            if (d[k] && !isNaN(d[k].constant)) {
              diffPillsHtml += '<span class="update-diff-pill">' + k + ': Lv.' + (d[k].level || calcLevelFromConstant(d[k].constant)) + ' (' + d[k].constant + ')</span>';
            }
          });

          card.innerHTML = 
            '<div class="update-card-header">' +
              '<label class="update-card-title-wrap">' +
                '<input type="checkbox" class="chk-official-update-item" data-type="new" data-index="' + idx + '" checked>' +
                '<span>' + escapeHtml(s.title) + '</span>' +
              '</label>' +
              '<span class="update-badge update-badge-new">新規</span>' +
            '</div>' +
            '<div class="update-card-meta">' +
              '<span>パック: <b>' + escapeHtml(s.pack || DEFAULT_PACK) + '</b></span>' +
              '<span>Ver: <b>' + escapeHtml(s.version || DEFAULT_VERSION) + '</b></span>' +
            '</div>' +
            '<div class="update-diffs-pills">' + diffPillsHtml + '</div>';
          newListEl.appendChild(card);
        });
      }

      // 2. Render Modified Songs
      if (modSec) modSec.style.display = detectedMod.length > 0 ? 'block' : 'none';
      const modCountEl = document.getElementById('officialUpdateModCount');
      if (modCountEl) modCountEl.textContent = detectedMod.length;

      if (modListEl) {
        modListEl.innerHTML = '';
        detectedMod.forEach((m, idx) => {
          const card = document.createElement('div');
          card.className = 'update-card update-card-mod';

          let changesHtml = '';
          m.changes.forEach(c => {
            changesHtml += 
              '<div class="update-change-row">' +
                '<span class="update-change-label">' + escapeHtml(c.label) + '</span>' +
                '<span class="update-change-val-old">' + escapeHtml(String(c.oldVal)) + '</span>' +
                '<span class="update-change-arrow">→</span>' +
                '<span class="update-change-val-new">' + escapeHtml(String(c.newVal)) + '</span>' +
              '</div>';
          });

          card.innerHTML = 
            '<div class="update-card-header">' +
              '<label class="update-card-title-wrap">' +
                '<input type="checkbox" class="chk-official-update-item" data-type="mod" data-index="' + idx + '" checked>' +
                '<span>' + escapeHtml(m.song.title) + '</span>' +
              '</label>' +
              '<span class="update-badge update-badge-mod">更新</span>' +
            '</div>' +
            '<div class="update-changes-list">' +
              changesHtml +
            '</div>' +
            '<div class="update-card-score-notice">' +
              '<span>✓ 入力済みのスコア・クリアランプ・理論値記録はそのまま維持されます</span>' +
            '</div>';
          modListEl.appendChild(card);
        });
      }

      // Attach checkbox listeners to recalculate total
      document.querySelectorAll('.chk-official-update-item').forEach(chk => {
        chk.addEventListener('change', updateOfficialUpdateApplyButton);
      });

      updateOfficialUpdateApplyButton();
    }

    function updateOfficialUpdateApplyButton() {
      const chks = document.querySelectorAll('.chk-official-update-item:checked');
      const count = chks.length;
      const btn = document.getElementById('btnOfficialUpdateApply');
      if (btn) {
        btn.textContent = '✓ 反映する (計 ' + count + '曲)';
        btn.disabled = count === 0;
      }
    }

    function mergeOfficialPackOrder(currentPackOrder, officialPackOrder, newPacks = []) {
      const merged = [...currentPackOrder];
      if (!Array.isArray(officialPackOrder) || officialPackOrder.length === 0) {
        newPacks.forEach(p => {
          if (p && !merged.includes(p)) merged.push(p);
        });
        return merged;
      }

      const packsToAdd = [];
      officialPackOrder.forEach(p => {
        if (p && !merged.includes(p) && !packsToAdd.includes(p)) {
          packsToAdd.push(p);
        }
      });
      newPacks.forEach(p => {
        if (p && !merged.includes(p) && !packsToAdd.includes(p)) {
          packsToAdd.push(p);
        }
      });

      packsToAdd.forEach(p => {
        const offIdx = officialPackOrder.indexOf(p);
        if (offIdx === -1) {
          merged.push(p);
          return;
        }

        let insertIdx = -1;
        // Search backwards in officialPackOrder for an existing predecessor in merged
        for (let i = offIdx - 1; i >= 0; i--) {
          const prev = officialPackOrder[i];
          const pos = merged.indexOf(prev);
          if (pos !== -1) {
            insertIdx = pos + 1;
            break;
          }
        }

        // If no predecessor found in merged, search forwards for an existing successor
        if (insertIdx === -1) {
          for (let i = offIdx + 1; i < officialPackOrder.length; i++) {
            const next = officialPackOrder[i];
            const pos = merged.indexOf(next);
            if (pos !== -1) {
              insertIdx = pos;
              break;
            }
          }
        }

        if (insertIdx !== -1) {
          merged.splice(insertIdx, 0, p);
        } else {
          merged.push(p);
        }
      });

      return merged;
    }

    function applyOfficialUpdates() {
      const chks = document.querySelectorAll('.chk-official-update-item:checked');
      if (chks.length === 0) return;

      const { detectedNew, detectedMod, officialSongs, officialPackOrder } = officialUpdatesState;
      let appliedCount = 0;
      const newPacks = [];

      // 1. Process Checked New Songs
      let maxInitId = masterSongs.length;
      chks.forEach(chk => {
        const type = chk.getAttribute('data-type');
        const idx = parseInt(chk.getAttribute('data-index'), 10);

        if (type === 'new' && detectedNew[idx]) {
          const song = detectedNew[idx];
          const songInitId = (song.initId !== undefined && !isNaN(song.initId))
            ? Number(song.initId)
            : (++maxInitId);

          const diffKeys = DIFF_KEYS_DESC;

          diffKeys.forEach(diff => {
            const dObj = song.diffs && song.diffs[diff];
            if (!dObj || isNaN(dObj.constant)) return;
            masterSongs.push([
              song.songId + '_' + diff,
              getChartTitleFromSongObj(song, diff),
              diff,
              dObj.level || calcLevelFromConstant(dObj.constant),
              dObj.constant,
              0,
              song.pack || DEFAULT_PACK,
              song.songId,
              Number(song.endOfSale) || 0,
              0,
              '',
              song.version || DEFAULT_VERSION,
              songInitId
            ]);
          });

          if (song.pack && !newPacks.includes(song.pack)) {
            newPacks.push(song.pack);
          }
          appliedCount++;
        }
      });

      // 2. Process Checked Modified Songs
      chks.forEach(chk => {
        const type = chk.getAttribute('data-type');
        const idx = parseInt(chk.getAttribute('data-index'), 10);

        if (type === 'mod' && detectedMod[idx]) {
          const m = detectedMod[idx];
          const officialSong = m.song;
          const existingTuples = m.existingTuples;

          // Update common metadata
          existingTuples.forEach(s => {
            s[1] = getChartTitleFromSongObj(officialSong, s[2]) || s[1];
            s[6] = officialSong.pack || s[6];
            s[11] = officialSong.version || s[11];
            if (officialSong.endOfSale !== undefined) {
              s[8] = Number(officialSong.endOfSale) || 0;
            }

            // Update constants / levels if revised
            if (officialSong.diffs && officialSong.diffs[s[2]]) {
              const d = officialSong.diffs[s[2]];
              if (!isNaN(d.constant) && Number(d.constant) > 0) {
                s[4] = Number(d.constant);
                s[3] = d.level || calcLevelFromConstant(s[4]);
              }
            }
          });

          // Check for newly added difficulty (e.g. IV-alpha added)
          DIFF_KEYS_ASC.forEach(diff => {
            const d = officialSong.diffs && officialSong.diffs[diff];
            const exists = existingTuples.some(t => t[2] === diff);
            if (d && !isNaN(d.constant) && Number(d.constant) > 0 && !exists) {
              const baseTuple = existingTuples[0];
              const newTuple = [
                baseTuple[7] + '_' + diff,
                getChartTitleFromSongObj(officialSong, diff) || baseTuple[1],
                diff,
                d.level || calcLevelFromConstant(d.constant),
                Number(d.constant),
                0,
                officialSong.pack || baseTuple[6],
                baseTuple[7],
                officialSong.endOfSale !== undefined ? (Number(officialSong.endOfSale) || 0) : (baseTuple[8] || 0),
                0,
                '',
                officialSong.version || baseTuple[11],
                (baseTuple[12] || 0)
              ];
              masterSongs.push(newTuple);
            }
          });

          if (officialSong.pack && !newPacks.includes(officialSong.pack)) {
            newPacks.push(officialSong.pack);
          }
          appliedCount++;
        }
      });

      // Synchronize packOrder relative position using officialPackOrder
      packOrder = mergeOfficialPackOrder(packOrder, officialPackOrder, newPacks);
      if (Array.isArray(officialPackOrder) && officialPackOrder.length > 0) {
        GAME_PACK_ORDER = [...officialPackOrder];
      }

      // Synchronize default order (songInitId) with official spreadsheet
      if (Array.isArray(officialSongs) && officialSongs.length > 0) {
        const officialInitIdMap = new Map();
        officialSongs.forEach((song, idx) => {
          const normTitle = getChartTitleFromSongObj(song, 'IV').toLowerCase();
          const normAlphaTitle = getChartTitleFromSongObj(song, 'IV-α').toLowerCase();
          const normId = String(song.songId || '').trim().toLowerCase();
          const initId = (song.initId !== undefined && !isNaN(song.initId)) ? Number(song.initId) : (idx + 1);
          if (normId) officialInitIdMap.set(normId, initId);
          if (normTitle) officialInitIdMap.set(normTitle, initId);
          if (normAlphaTitle) officialInitIdMap.set(normAlphaTitle, initId);
        });

        masterSongs.forEach(s => {
          const normId = String(s[7] || '').trim().toLowerCase();
          const normTitle = safeSongTitle(s[1]).toLowerCase();
          if (officialInitIdMap.has(normId)) {
            s[12] = officialInitIdMap.get(normId);
          } else if (officialInitIdMap.has(normTitle)) {
            s[12] = officialInitIdMap.get(normTitle);
          }
        });
      }

      masterSongs.sort((a, b) => compareDefaultOrder(a, b));
      saveMasterSongs();
      savePackOrder();
      if (Array.isArray(apPlusRecords) && apPlusRecords.length > 0) {
        apPlusRecords = apPlusRecords.map(normalizeApPlusRecord);
        saveApPlusRecords();
      }

      markNoticePopupAsRead();
      closeOfficialUpdateModal();
      initFormDatalists();
      initApPlusForm();
      renderPackOrderList();
      renderEditSongSearchResult();
      refresh();

      if (autoSyncEnabled && userSheetUrl) {
        triggerAutoSync();
      }

      showSaveToast('✨ 計 ' + appliedCount + '曲 のアプデ情報を反映・保存しました！');
      alert('✨ 計 ' + appliedCount + '曲 のアプデ情報を反映・保存しました！');
    }

    const btnEditClose = document.getElementById('btnEditSongModalClose');
    if (btnEditClose) btnEditClose.addEventListener('click', closeEditSongModal);
    const btnEditCancel = document.getElementById('btnEditSongModalCancel');
    if (btnEditCancel) btnEditCancel.addEventListener('click', closeEditSongModal);
    const editModalOverlay = document.getElementById('editSongModal');
    if (editModalOverlay) {
      editModalOverlay.addEventListener('click', (e) => {
        if (e.target.id === 'editSongModal') closeEditSongModal();
      });
    }

    const editSongSearchInput = document.getElementById('editSongSearchInput');
    if (editSongSearchInput) {
      editSongSearchInput.addEventListener('input', renderEditSongSearchResult);
    }

    const btnEditDelete = document.getElementById('btnEditSongModalDelete');
    if (btnEditDelete) {
      btnEditDelete.addEventListener('click', () => {
        const songId = document.getElementById('editTargetSongId').value;
        const songTitle = document.getElementById('editSongTitleInput').value.trim();
        if (!confirm('楽曲「' + songTitle + '」をマスターから削除しますか？\n※下部の「💾 保存する」で確定するまで完全には削除されません。')) {
          return;
        }

        masterSongs = masterSongs.filter(s => s[7] !== songId);
        closeEditSongModal();
        initFormDatalists();
        renderEditSongSearchResult();
        checkUnsavedChanges();
        refresh();
      });
    }

    const btnEditSave = document.getElementById('btnEditSongModalSave');
    if (btnEditSave) {
      btnEditSave.addEventListener('click', () => {
        const songId = document.getElementById('editTargetSongId').value;
        const newTitle = document.getElementById('editSongTitleInput').value.trim();
        const editTitleAlphaEl = document.getElementById('editSongTitleAlphaInput');
        const newTitleAlpha = editTitleAlphaEl ? editTitleAlphaEl.value.trim() : '';
        const newPack = document.getElementById('editSongPackInput').value.trim() || DEFAULT_PACK;
        const newVersion = document.getElementById('editSongVersionInput').value.trim() || DEFAULT_VERSION;

        const constI = parseFloat(document.getElementById('editConstI').value);
        const constII = parseFloat(document.getElementById('editConstII').value);
        const constIII = parseFloat(document.getElementById('editConstIII').value);
        const constIV = parseFloat(document.getElementById('editConstIV').value);
        const constIVAlphaVal = document.getElementById('editConstIVAlpha').value.trim();
        const constIVAlpha = constIVAlphaVal !== '' ? parseFloat(constIVAlphaVal) : null;

        if (!newTitle) {
          alert('曲名を入力してください');
          return;
        }

        if (isNaN(constI) || isNaN(constII) || isNaN(constIII) || isNaN(constIV)) {
          alert('難易度 I, II, III, IV の定数をすべて入力してください');
          return;
        }

        if (constIVAlphaVal !== '' && isNaN(constIVAlpha)) {
          alert('IV-α の定数を正しく入力してください');
          return;
        }

        const isEndOfSale = (document.getElementById('editSongEndOfSale') && document.getElementById('editSongEndOfSale').checked) ? 1 : 0;
        const newInsertAfterSong = (document.getElementById('editInsertAfterSong').value || '').trim();
        const needReorder = (newInsertAfterSong !== '' && newInsertAfterSong.toLowerCase() !== currentEditSongPrevTitle.toLowerCase());

        const currentTuples = masterSongs.filter(s => s[7] === songId);
        if (currentTuples.length === 0) return;

        const newDiffs = {
          'I': constI,
          'II': constII,
          'III': constIII,
          'IV': constIV
        };
        if (constIVAlpha !== null) {
          newDiffs['IV-α'] = constIVAlpha;
        }

        const resolvedBaseTitle = safeSongTitle(newTitle);
        const resolvedAlphaTitle = safeSongTitle(newTitleAlpha || newTitle);

        // I〜IVの更新
        ['I', 'II', 'III', 'IV'].forEach(diff => {
          let t = currentTuples.find(s => s[2] === diff);
          const c = newDiffs[diff];
          const lvl = calcLevelFromConstant(c);
          if (t) {
            t[1] = resolvedBaseTitle;
            t[3] = lvl;
            t[4] = c;
            t[6] = newPack;
            t[8] = isEndOfSale;
            t[11] = newVersion;
            if (needReorder) {
              t[12] = calculateInitIdForDiff(diff, newInsertAfterSong);
            }
          } else {
            const newInitId = calculateInitIdForDiff(diff, newInsertAfterSong || resolvedBaseTitle);
            masterSongs.push([
              songId + '_' + diff,
              resolvedBaseTitle,
              diff,
              lvl,
              c,
              0,
              newPack,
              songId,
              isEndOfSale,
              0,
              '',
              newVersion,
              newInitId
            ]);
          }
        });

        // IV-αの更新または削除
        let ivAlphaTuple = currentTuples.find(s => s[2] === 'IV-α');
        if (constIVAlpha !== null) {
          const lvl = calcLevelFromConstant(constIVAlpha);
          if (ivAlphaTuple) {
            ivAlphaTuple[1] = resolvedAlphaTitle;
            ivAlphaTuple[3] = lvl;
            ivAlphaTuple[4] = constIVAlpha;
            ivAlphaTuple[6] = newPack;
            ivAlphaTuple[8] = isEndOfSale;
            ivAlphaTuple[11] = newVersion;
            if (needReorder) {
              ivAlphaTuple[12] = calculateInitIdForDiff('IV-α', newInsertAfterSong);
            }
          } else {
            const newInitId = calculateInitIdForDiff('IV-α', newInsertAfterSong || resolvedBaseTitle);
            masterSongs.push([
              songId + '_IV-α',
              resolvedAlphaTitle,
              'IV-α',
              lvl,
              constIVAlpha,
              0,
              newPack,
              songId,
              isEndOfSale,
              0,
              '',
              newVersion,
              newInitId
            ]);
          }
        } else if (ivAlphaTuple) {
          masterSongs = masterSongs.filter(s => s !== ivAlphaTuple);
        }

        masterSongs.forEach(s => {
          if (s[7] === songId) {
            s[1] = (s[2] === 'IV-α') ? resolvedAlphaTitle : resolvedBaseTitle;
            s[6] = newPack;
            s[8] = isEndOfSale;
            s[11] = newVersion;
          }
        });

        if (Array.isArray(apPlusRecords) && apPlusRecords.length > 0) {
          apPlusRecords = apPlusRecords.map(normalizeApPlusRecord);
          saveApPlusRecords();
        }

        closeEditSongModal();
        initFormDatalists();
        initApPlusForm();
        renderEditSongSearchResult();
        checkUnsavedChanges();
        refresh();
      });
    }

    document.getElementById('btnExportJson').addEventListener('click', () => {
      const data = {
        songs: masterSongs,
        scores: userScores,
        packOrder: packOrder,
        apPlusRecords: apPlusRecords
      };
      const json = JSON.stringify(data, null, 2);
      navigator.clipboard.writeText(json).then(() => {
        alert('楽曲マスター、スコア、ソングパック順序、および理論値(AP+)記録データをクリップボードにコピーしました！');
      });
    });

    document.getElementById('btnDownloadJson').addEventListener('click', () => {
      const data = {
        songs: masterSongs,
        scores: userScores,
        packOrder: packOrder,
        apPlusRecords: apPlusRecords
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'rotaeno_data_' + new Date().toISOString().slice(0, 10) + '.json';
      a.click();
      URL.revokeObjectURL(url);
    });

    document.getElementById('btnImportJson').addEventListener('click', () => {
      const text = prompt('バックアップしたJSONテキストを貼り付けてください:');
      if (!text) return;
      try {
        const imported = JSON.parse(text);
        if (typeof imported === 'object' && imported !== null) {
          if (imported.scores && typeof imported.scores === 'object') {
            userScores = imported.scores;
            if (Array.isArray(imported.songs)) {
              masterSongs = imported.songs;
            } else if (Array.isArray(imported.customSongs)) {
              // Legacy customSongs format migration
              let maxId = masterSongs.length;
              imported.customSongs.forEach(song => {
                const tuples = songObjToTuples(song, maxId + 1);
                maxId += tuples.length;
                masterSongs.push(...tuples);
              });
            }
            if (Array.isArray(imported.packOrder)) {
              packOrder = imported.packOrder;
            }
            if (Array.isArray(imported.apPlusRecords)) {
              apPlusRecords = imported.apPlusRecords;
              saveApPlusRecords();
            }
          } else {
            // Legacy scores-only format
            userScores = imported;
          }

          Object.keys(userScores).forEach(id => {
            if (userScores[id] && userScores[id].score === THEORY_SCORE && userScores[id].status !== 'AP+') {
              userScores[id].status = 'AP+';
            }
          });
          saveScores();
          saveMasterSongs();
          savePackOrder();
          renderPackOrderList();
          initFormDatalists();
          checkUnsavedChanges();
          if (currentSort === 'PACK') renderSongList();
          refresh();
          alert('データを正常に復元しました！');
        }
      } catch (e) {
        alert('JSONの解析に失敗しました。正しいフォーマットか確認してください。');
      }
    });

    document.getElementById('btnExportCsv').addEventListener('click', () => {
      const rows = ['楽曲ID,難易度,曲名,スコア,クリア状況'];
      getAllSongs().forEach(s => {
        const rec = userScores[s[0]] || { score: '', status: '' };
        rows.push(`${s[7]},${s[2]},"${s[1]}",${rec.score || ''},${rec.status || ''}`);
      });
      const csv = rows.join('\n');
      navigator.clipboard.writeText(csv).then(() => {
        alert('CSVデータをクリップボードにコピーしました！');
      });
    });

    document.getElementById('btnResetData').addEventListener('click', () => {
      const step1 = confirm('すべての入力済みスコア、設定、理論値記録をリセットし、初期状態に戻しますか？\nこの操作は取り消せません。');
      if (!step1) return;

      const step2 = confirm('【最終確認】\nスプレッドシート連携やJSON保存等でバックアップを行っていない場合、データを元に戻すことは一切できません。\n\n本当にすべてのデータを初期化してよろしいですか？');
      if (!step2) return;

      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(MASTER_SONGS_KEY);
      localStorage.removeItem(PACK_ORDER_KEY);
      localStorage.removeItem(AP_PLUS_KEY);
      localStorage.removeItem(GAS_LAST_SYNC_KEY);
      location.reload();
    });

    document.getElementById('btnCommitChanges').addEventListener('click', () => {
      saveScores();
      saveMasterSongs();
      savePackOrder();
      saveApPlusRecords();
      checkUnsavedChanges();
      refresh();
      showSaveToast();
      if (autoSyncEnabled && userSheetUrl) {
        triggerAutoSync();
      }
    });

    document.getElementById('btnDiscardChanges').addEventListener('click', () => {
      userScores = JSON.parse(JSON.stringify(savedScores));
      masterSongs = JSON.parse(JSON.stringify(savedMasterSongs));
      packOrder = JSON.parse(JSON.stringify(savedPackOrder));
      apPlusRecords = JSON.parse(JSON.stringify(savedApPlusRecords));
      renderPackOrderList();
      initFormDatalists();
      renderEditSongSearchResult();
      renderApPlusTable();
      renderMypageStats();
      updateMypageBadges();
      checkUnsavedChanges();
      refresh();
    });

    // Collapsible Settings Panels Logic
    function initCollapsiblePanels() {
      // 1. Google Spreadsheet Sync details toggle
      const btnGasToggle = document.getElementById('btnToggleGasDetails');
      const gasBody = document.getElementById('gasSyncDetailsBody');
      const gasText = document.getElementById('gasToggleText');
      const gasArrow = document.getElementById('gasToggleArrow');
      if (btnGasToggle && gasBody) {
        btnGasToggle.addEventListener('click', () => {
          const isOpen = gasBody.style.display !== 'none';
          gasBody.style.display = isOpen ? 'none' : 'block';
          btnGasToggle.setAttribute('aria-expanded', String(!isOpen));
          if (gasText) gasText.textContent = isOpen ? '⚙️ 設定・詳細を展開' : '▲ 設定・詳細を閉じる';
          if (gasArrow) gasArrow.textContent = isOpen ? '▼' : '▲';
        });
      }

      // 2. Add song card toggle
      const headerAddSong = document.getElementById('headerAddSong');
      const contentAddSong = document.getElementById('contentAddSong');
      const badgeAddSong = document.getElementById('badgeAddSong');
      if (headerAddSong && contentAddSong) {
        headerAddSong.addEventListener('click', () => {
          const isOpen = contentAddSong.style.display !== 'none';
          contentAddSong.style.display = isOpen ? 'none' : 'block';
          if (badgeAddSong) badgeAddSong.textContent = isOpen ? '展開する ▼' : '閉じる ▲';
        });
      }

      // 3. Pack order card toggle
      const headerPackOrder = document.getElementById('headerPackOrder');
      const contentPackOrder = document.getElementById('contentPackOrder');
      const badgePackOrder = document.getElementById('badgePackOrder');
      if (headerPackOrder && contentPackOrder) {
        headerPackOrder.addEventListener('click', () => {
          const isOpen = contentPackOrder.style.display !== 'none';
          contentPackOrder.style.display = isOpen ? 'none' : 'block';
          if (badgePackOrder) badgePackOrder.textContent = isOpen ? '展開する ▼' : '閉じる ▲';
        });
      }

      // 4. Reset data card toggle
      const headerResetData = document.getElementById('headerResetData');
      const contentResetData = document.getElementById('contentResetData');
      const badgeResetData = document.getElementById('badgeResetData');
      if (headerResetData && contentResetData) {
        headerResetData.addEventListener('click', () => {
          const isOpen = contentResetData.style.display !== 'none';
          contentResetData.style.display = isOpen ? 'none' : 'block';
          if (badgeResetData) badgeResetData.textContent = isOpen ? '展開する ▼' : '閉じる ▲';
        });
      }
    }

    // Google Spreadsheet Sync Functions
    function updateGasSyncUI() {
      const sheetInput = document.getElementById('userSheetUrlInput');
      const gasInput = document.getElementById('gasAppUrlInput');
      const badge = document.getElementById('gasSyncBadge');
      const statusText = document.getElementById('gasLastSyncText');
      const autoToggle = document.getElementById('autoSyncToggle');
      const autoLabel = document.getElementById('autoSyncStateLabel');

      if (sheetInput) sheetInput.value = userSheetUrl;
      if (gasInput) gasInput.value = gasAppUrl;
      const lastSync = localStorage.getItem(GAS_LAST_SYNC_KEY);
      if (statusText) statusText.textContent = lastSync || '未同期';

      if (autoToggle) autoToggle.checked = autoSyncEnabled;
      if (autoLabel) {
        if (autoSyncEnabled) {
          autoLabel.textContent = 'ON (自動同期有効)';
          autoLabel.style.background = '#dcfce7';
          autoLabel.style.color = '#15803d';
        } else {
          autoLabel.textContent = 'OFF (手動同期)';
          autoLabel.style.background = '#ffe4e6';
          autoLabel.style.color = '#be123c';
        }
      }

      if (badge) {
        if (userSheetUrl) {
          badge.textContent = '連携設定済み';
          badge.classList.add('connected');
        } else {
          badge.textContent = '未接続';
          badge.classList.remove('connected');
        }
      }
    }

    function saveUserSheetUrl() {
      const input = document.getElementById('userSheetUrlInput');
      const url = (input.value || '').trim();
      if (!url) {
        localStorage.removeItem(USER_SHEET_URL_KEY);
        userSheetUrl = '';
        updateGasSyncUI();
        alert('スプレッドシートURLを解除しました');
        return;
      }
      if (!url.includes('docs.google.com/spreadsheets/d/')) {
        alert('正しいGoogleスプレッドシートのURLを入力してください\n(例: https://docs.google.com/spreadsheets/d/.../edit)');
        return;
      }
      userSheetUrl = url;
      localStorage.setItem(USER_SHEET_URL_KEY, userSheetUrl);
      updateGasSyncUI();
      alert('スプレッドシートURLを保存しました！\n「スプシへ保存」または「接続テスト」を実行してください。');
    }

    function saveGasAppUrl() {
      const input = document.getElementById('gasAppUrlInput');
      const url = (input.value || '').trim();
      if (!url) {
        localStorage.removeItem(GAS_URL_KEY);
        gasAppUrl = '';
        updateGasSyncUI();
        alert('GAS WebアプリURLを解除しました');
        return;
      }
      if (!url.startsWith('https://script.google.com/')) {
        alert('Google Apps Script のウェブアプリURL (https://script.google.com/macros/s/.../exec) を入力してください');
        return;
      }
      gasAppUrl = url;
      localStorage.setItem(GAS_URL_KEY, gasAppUrl);
      updateGasSyncUI();
      alert('GAS WebアプリURLを保存しました！');
    }

    function getActiveGasEndpoint() {
      return gasAppUrl || DEFAULT_GAS_ENDPOINT;
    }

    async function testGasConnection() {
      if (!userSheetUrl) {
        alert('先にスプレッドシートのURLを入力・保存してください');
        return;
      }
      const endpoint = getActiveGasEndpoint();
      if (!endpoint) {
        alert('API接続先URLが未設定です。詳細設定を開いてGAS WebアプリURLを入力してください。');
        return;
      }
      const btn = document.getElementById('btnGasTest');
      if (btn) btn.textContent = '⌛ 接続テスト中...';
      try {
        const query = '?url=' + encodeURIComponent(userSheetUrl) + '&t=' + Date.now();
        const res = await fetch(endpoint + query, { method: 'GET' });
        const json = await res.json();
        if (json.status === 'success') {
          alert('✅ スプレッドシートとの通信に成功しました！\n正常に読み書き可能です。');
        } else {
          alert('⚠️ スプレッドシートからエラーが返されました:\n' + (json.message || ''));
        }
      } catch (err) {
        console.error(err);
        alert('❌ 接続に失敗しました。スプレッドシートの共有設定が「リンクを知っている全員（編集者）」になっているか確認してください。\n\n詳細: ' + err.message);
      } finally {
        if (btn) btn.textContent = '🔗 接続テスト';
      }
    }

    async function uploadToGas() {
      if (!userSheetUrl) {
        alert('先にスプレッドシートのURLを入力・保存してください');
        return;
      }
      const endpoint = getActiveGasEndpoint();
      if (!endpoint) {
        alert('API接続先URLが未設定です。詳細設定を開いてGAS WebアプリURLを入力してください。');
        return;
      }

      if (!confirm('現在のすべての楽曲マスター、入力済みスコア、理論値記録、および設定をGoogleスプレッドシートへ保存しますか？')) {
        return;
      }

      const btn = document.getElementById('btnGasUpload');
      const origText = btn ? btn.textContent : '';
      if (btn) {
        btn.disabled = true;
        btn.textContent = '⏳ スプシへ送信中...';
      }

      const songGroups = getSongGroups(masterSongs);
      const songOrderMap = new Map();
      songGroups.forEach(s => songOrderMap.set(s.songId, s.initId));
      masterSongs.forEach(t => {
        if (songOrderMap.has(t[7])) {
          t[12] = songOrderMap.get(t[7]);
        }
      });
      masterSongs.sort((a, b) => compareDefaultOrder(a, b));
      saveMasterSongs();

      const payload = {
        sheetUrl: userSheetUrl,
        songs: songGroups,
        scores: userScores,
        apPlusRecords: apPlusRecords,
        config: {
          packOrder: packOrder,
          statsScope: currentStatsScope,
          showApPlusDate: showApPlusDate
        }
      };

      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload)
        });
        const json = await res.json();
        if (json.status === 'success') {
          const nowStr = json.syncedAt || new Date().toLocaleString('ja-JP');
          localStorage.setItem(GAS_LAST_SYNC_KEY, nowStr);
          updateGasSyncUI();
          showSaveToast();
          alert('✅ Googleスプレッドシートへの保存が完了しました！\n(' + nowStr + ')');
        } else {
          alert('⚠️ 保存に失敗しました:\n' + (json.message || ''));
        }
      } catch (err) {
        console.error(err);
        alert('❌ 通信エラーが発生しました。スプレッドシートの共有設定が「リンクを知っている全員（編集者）」になっているか確認してください。\n\n' + err.message);
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.textContent = origText;
        }
      }
    }

    async function downloadFromGas() {
      if (!userSheetUrl) {
        alert('先にスプレッドシートのURLを入力・保存してください');
        return;
      }
      const endpoint = getActiveGasEndpoint();
      if (!endpoint) {
        alert('API接続先URLが未設定です。詳細設定を開いてGAS WebアプリURLを入力してください。');
        return;
      }

      if (!confirm('Googleスプレッドシートからデータを取得し、アプリ内のデータを復元・上書きしますか？')) {
        return;
      }

      const btn = document.getElementById('btnGasDownload');
      const origText = btn ? btn.textContent : '';
      if (btn) {
        btn.disabled = true;
        btn.textContent = '⏳ スプシから取得中...';
      }

      try {
        const query = '?url=' + encodeURIComponent(userSheetUrl) + '&t=' + Date.now();
        const res = await fetch(endpoint + query, { method: 'GET' });
        const json = await res.json();
        if (json.status === 'success' && json.data) {
          const d = json.data;

          // 1. Restore Songs
          if (Array.isArray(d.songs) && d.songs.length > 0) {
            const restoredMaster = [];
            d.songs.forEach((song, idx) => {
              const songInitId = (song.initId !== undefined && !isNaN(song.initId)) ? Number(song.initId) : (idx + 1);
              const diffKeys = DIFF_KEYS_DESC;
              diffKeys.forEach(diff => {
                const diffObj = song.diffs && song.diffs[diff];
                if (!diffObj || isNaN(diffObj.constant) || Number(diffObj.constant) <= 0) return;
                restoredMaster.push([
                  getResolvedSongId(song, songInitId) + '_' + diff,
                  getChartTitleFromSongObj(song, diff),
                  diff,
                  diffObj.level || calcLevelFromConstant(diffObj.constant),
                  Number(diffObj.constant),
                  0,
                  song.pack || DEFAULT_PACK,
                  song.songId || ('song_' + songInitId),
                  Number(song.endOfSale) || 0,
                  0,
                  '',
                  song.version || DEFAULT_VERSION,
                  songInitId
                ]);
              });
            });

            if (restoredMaster.length > 0) {
              restoredMaster.sort((a, b) => compareDefaultOrder(a, b));
              masterSongs = restoredMaster;
              savedMasterSongs = JSON.parse(JSON.stringify(masterSongs));
              saveMasterSongs();
            }
          }

          // 2. Restore Scores
          if (d.scores && typeof d.scores === 'object') {
            userScores = d.scores;
            Object.keys(userScores).forEach(id => {
              if (userScores[id] && userScores[id].score === THEORY_SCORE && userScores[id].status !== 'AP+') {
                userScores[id].status = 'AP+';
              }
            });
            saveScores();
          }

          // 3. Restore Theory Records
          if (Array.isArray(d.apPlusRecords) && d.apPlusRecords.length > 0) {
            apPlusRecords = d.apPlusRecords.map(normalizeApPlusRecord);
            saveApPlusRecords();
          }

          // 4. Restore Config
          if (d.config && typeof d.config === 'object') {
            if (Array.isArray(d.config.packOrder) && d.config.packOrder.length > 0) {
              packOrder = d.config.packOrder;
              savePackOrder();
            }
            if (d.config.statsScope) {
              currentStatsScope = d.config.statsScope;
              localStorage.setItem(STATS_SCOPE_KEY, currentStatsScope);
              updateStatsScopeUI();
            }
            if (d.config.showApPlusDate !== undefined) {
              showApPlusDate = !!d.config.showApPlusDate;
              localStorage.setItem(SHOW_DATE_KEY, String(showApPlusDate));
            }
          }

          const nowStr = new Date().toLocaleString('ja-JP');
          localStorage.setItem(GAS_LAST_SYNC_KEY, nowStr);
          updateGasSyncUI();
          renderPackOrderList();
          initFormDatalists();
          initApPlusForm();
          checkUnsavedChanges();
          if (currentSort === 'PACK') renderSongList();
          refresh();

          alert('✅ Googleスプレッドシートからデータを正常に復元しました！');
        } else {
          alert('⚠️ 復元に失敗しました:\n' + (json.message || 'データが見つかりません'));
        }
      } catch (err) {
        console.error(err);
        alert('❌ 通信エラーが発生しました。スプレッドシートの共有設定が「リンクを知っている全員（編集者）」になっているか確認してください。\n\n' + err.message);
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.textContent = origText;
        }
      }
    }

    async function triggerAutoSync() {
      if (!autoSyncEnabled || !userSheetUrl) return;
      const endpoint = getActiveGasEndpoint();
      if (!endpoint) return;

      showSaveToast('☁️ スプシへ自動同期中...');

      const songGroups = getSongGroups(masterSongs);
      const songOrderMap = new Map();
      songGroups.forEach(s => songOrderMap.set(s.songId, s.initId));
      masterSongs.forEach(t => {
        if (songOrderMap.has(t[7])) {
          t[12] = songOrderMap.get(t[7]);
        }
      });
      masterSongs.sort((a, b) => compareDefaultOrder(a, b));
      saveMasterSongs();

      const payload = {
        sheetUrl: userSheetUrl,
        songs: songGroups,
        scores: userScores,
        apPlusRecords: apPlusRecords,
        config: {
          packOrder: packOrder,
          statsScope: currentStatsScope,
          showApPlusDate: showApPlusDate
        }
      };

      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload)
        });
        const json = await res.json();
        if (json.status === 'success') {
          const nowStr = json.syncedAt || new Date().toLocaleString('ja-JP');
          localStorage.setItem(GAS_LAST_SYNC_KEY, nowStr);
          updateGasSyncUI();
          showSaveToast('✅ スプシ自動保存完了！');
        } else {
          console.warn('Auto sync warning:', json.message);
          showSaveToast('⚠️ スプシ自動同期エラー');
        }
      } catch (err) {
        console.error('Auto sync error:', err);
        showSaveToast('⚠️ スプシ自動同期に失敗しました');
      }
    }

    async function copyGasScriptCode() {
      try {
        const res = await fetch('./gas_sync.js');
        if (!res.ok) {
          throw new Error('HTTP ' + res.status);
        }
        const code = await res.text();
        try {
          await navigator.clipboard.writeText(code);
          alert('📋 GASスクリプトをクリップボードにコピーしました！\n\nスプレッドシートの「拡張機能」>「Apps Script」に貼り付けてデプロイしてください。');
        } catch (clipErr) {
          prompt('以下のコードをすべてコピーしてください:', code);
        }
      } catch (err) {
        console.error('GASスクリプト取得失敗:', err);
        alert('⚠️ GASスクリプトの取得に失敗しました。\nGitHubリポジトリの gas_sync.js を直接ご確認ください。');
      }
    }

    // Attach GAS Event Listeners
    const autoSyncToggle = document.getElementById('autoSyncToggle');
    if (autoSyncToggle) {
      autoSyncToggle.addEventListener('change', (e) => {
        autoSyncEnabled = e.target.checked;
        localStorage.setItem(AUTO_SYNC_KEY, String(autoSyncEnabled));
        updateGasSyncUI();
        if (autoSyncEnabled) {
          showSaveToast('✅ スプシ自動同期をONにしました');
        } else {
          showSaveToast('スプシ自動同期をOFFにしました');
        }
      });
    }

    const btnSaveSheetUrl = document.getElementById('btnSaveSheetUrl');
    if (btnSaveSheetUrl) btnSaveSheetUrl.addEventListener('click', saveUserSheetUrl);
    const btnSaveGasUrl = document.getElementById('btnSaveGasUrl');
    if (btnSaveGasUrl) btnSaveGasUrl.addEventListener('click', saveGasAppUrl);
    const btnGasTest = document.getElementById('btnGasTest');
    if (btnGasTest) btnGasTest.addEventListener('click', testGasConnection);
    const btnGasUpload = document.getElementById('btnGasUpload');
    if (btnGasUpload) btnGasUpload.addEventListener('click', uploadToGas);
    const btnGasDownload = document.getElementById('btnGasDownload');
    if (btnGasDownload) btnGasDownload.addEventListener('click', downloadFromGas);
    const btnCopyGasCode = document.getElementById('btnCopyGasCode');
    if (btnCopyGasCode) btnCopyGasCode.addEventListener('click', copyGasScriptCode);

    const btnCheckUpdates = document.getElementById('btnCheckOfficialUpdates');
    if (btnCheckUpdates) btnCheckUpdates.addEventListener('click', openOfficialUpdateModal);
    const btnOfficialClose = document.getElementById('btnOfficialUpdateModalClose');
    if (btnOfficialClose) btnOfficialClose.addEventListener('click', closeOfficialUpdateModal);
    const btnOfficialCancel = document.getElementById('btnOfficialUpdateCancel');
    if (btnOfficialCancel) btnOfficialCancel.addEventListener('click', closeOfficialUpdateModal);
    const btnOfficialApply = document.getElementById('btnOfficialUpdateApply');
    if (btnOfficialApply) btnOfficialApply.addEventListener('click', applyOfficialUpdates);
    const officialModalOverlay = document.getElementById('officialUpdateModal');
    if (officialModalOverlay) {
      officialModalOverlay.addEventListener('click', (e) => {
        if (e.target.id === 'officialUpdateModal') closeOfficialUpdateModal();
      });
    }

    /* ==========================================================
     * B40 Image Generator (5x8 Canvas Renderer)
     * ========================================================== */
    function roundRect(ctx, x, y, width, height, radius) {
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      ctx.lineTo(x + radius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
    }

    function truncateCanvasText(ctx, text, maxWidth) {
      if (!text) return '';
      if (ctx.measureText(text).width <= maxWidth) return text;
      let low = 0;
      let high = text.length;
      let fit = '';
      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        const sub = text.substring(0, mid) + '…';
        if (ctx.measureText(sub).width <= maxWidth) {
          fit = sub;
          low = mid + 1;
        } else {
          high = mid - 1;
        }
      }
      return fit || (text[0] + '…');
    }

    let generatedB40Blob = null;

    function generateB40Canvas() {
      const W = 1600;
      const H = 2040;
      const canvas = document.createElement('canvas');
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d');

      // 1. Background (Cosmic Deep Space Gradient)
      const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
      bgGrad.addColorStop(0, '#060b13');
      bgGrad.addColorStop(0.3, '#0b1422');
      bgGrad.addColorStop(0.7, '#08111e');
      bgGrad.addColorStop(1, '#050911');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // Subtle celestial particles
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      for (let p = 0; p < 80; p++) {
        const px = (p * 7919) % W;
        const py = (p * 6397) % H;
        const pr = ((p % 3) + 1) * 0.8;
        ctx.beginPath();
        ctx.arc(px, py, pr, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Header Box (Y: 0 - 200px)
      const headY = 40;
      ctx.fillStyle = '#38bdf8';
      ctx.font = '800 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText('ROTAENO RATING TRACKER', 45, headY + 16);

      // Total Rating
      const trStr = currentCalc ? currentCalc.totalRating.toFixed(4) : '0.0000';
      ctx.fillStyle = '#fbbf24';
      ctx.font = '900 60px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText(trStr, 45, headY + 80);

      // Theo Rating & Completion
      const theoRate = calcTheoreticalMaxRating();
      const trWidth = ctx.measureText(trStr).width;
      ctx.fillStyle = '#94a3b8';
      ctx.font = '700 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText('/ 理論値 ' + theoRate.toFixed(4), 45 + trWidth + 14, headY + 68);

      const compSum = currentCalc ? currentCalc.totalCompletionSum.toFixed(3) : '0.000';
      const maxComp = getMaxCompletionCount();
      const compPct = maxComp > 0 ? ((parseFloat(compSum) / maxComp) * 100).toFixed(2) : '0.00';
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '700 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText('完成度: ' + compSum + ' / ' + maxComp + ' (' + compPct + '%)', 45, headY + 115);

      // Right Header Breakdown Panels
      const rBoxX = W - 45 - 474;
      const b10Sum = currentCalc ? currentCalc.b10Sum.toFixed(4) : '0.0000';
      const b20Sum = currentCalc ? currentCalc.b20Sum.toFixed(4) : '0.0000';
      const b40Sum = currentCalc ? currentCalc.b40Sum.toFixed(4) : '0.0000';
      const b10Cont = (parseFloat(b10Sum) * 0.06).toFixed(4);
      const b20Cont = (parseFloat(b20Sum) * 0.02).toFixed(4);
      const b40Cont = (parseFloat(b40Sum) * 0.01).toFixed(4);

      const pills = [
        { label: 'BEST 1-10 (×0.06)', sum: b10Sum, cont: b10Cont, bg: 'rgba(251, 191, 36, 0.12)', border: '#f59e0b', color: '#fbbf24' },
        { label: 'BEST 11-20 (×0.02)', sum: b20Sum, cont: b20Cont, bg: 'rgba(56, 189, 248, 0.12)', border: '#0284c7', color: '#38bdf8' },
        { label: 'BEST 21-40 (×0.01)', sum: b40Sum, cont: b40Cont, bg: 'rgba(148, 163, 184, 0.12)', border: '#475569', color: '#cbd5e1' }
      ];

      pills.forEach((p, idx) => {
        const px = rBoxX + idx * 162;
        const py = headY + 10;
        ctx.fillStyle = p.bg;
        ctx.strokeStyle = p.border;
        ctx.lineWidth = 1.5;
        roundRect(ctx, px, py, 150, 85, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = p.color;
        ctx.font = '800 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillText(p.label, px + 8, py + 22);

        ctx.fillStyle = '#ffffff';
        ctx.font = '800 17px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillText(p.sum, px + 8, py + 48);

        ctx.fillStyle = p.color;
        ctx.font = '700 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillText('+' + p.cont, px + 8, py + 72);
      });

      // Date in Header
      const now = new Date();
      const dateStr = now.getFullYear() + '.' + String(now.getMonth() + 1).padStart(2, '0') + '.' + String(now.getDate()).padStart(2, '0');
      ctx.fillStyle = '#64748b';
      ctx.font = '700 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('DATE: ' + dateStr, W - 45, headY + 125);
      ctx.textAlign = 'left';

      // Header Separator Line
      const sepGrad = ctx.createLinearGradient(45, 175, W - 45, 175);
      sepGrad.addColorStop(0, 'rgba(56, 189, 248, 0.5)');
      sepGrad.addColorStop(0.5, 'rgba(251, 191, 36, 0.6)');
      sepGrad.addColorStop(1, 'rgba(148, 163, 184, 0.3)');
      ctx.strokeStyle = sepGrad;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(45, 175);
      ctx.lineTo(W - 45, 175);
      ctx.stroke();

      // 3. Grid (5 columns x 8 rows = 40 charts)
      const top40 = currentCalc ? currentCalc.activeCharts.slice(0, 40) : [];
      const gridStartX = 45;
      const gridStartY = 195;
      const cardW = 288;
      const cardH = 200;
      const gapX = 17;
      const gapY = 18;

      for (let i = 0; i < 40; i++) {
        const col = i % 5;
        const row = Math.floor(i / 5);
        const x = gridStartX + col * (cardW + gapX);
        const y = gridStartY + row * (cardH + gapY);
        const rank = i + 1;
        const c = top40[i];

        const isB10 = rank <= 10;
        const isB20 = rank > 10 && rank <= 20;

        let borderColor = '#253549';
        let cardBgGrad = ctx.createLinearGradient(x, y, x, y + cardH);
        if (isB10) {
          borderColor = '#f59e0b';
          cardBgGrad.addColorStop(0, '#172233');
          cardBgGrad.addColorStop(1, '#0e1826');
        } else if (isB20) {
          borderColor = '#0284c7';
          cardBgGrad.addColorStop(0, '#131e2e');
          cardBgGrad.addColorStop(1, '#0c1522');
        } else {
          borderColor = '#1e293b';
          cardBgGrad.addColorStop(0, '#0f1724');
          cardBgGrad.addColorStop(1, '#090e17');
        }

        ctx.fillStyle = cardBgGrad;
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = isB10 ? 2 : (isB20 ? 1.8 : 1.2);
        roundRect(ctx, x, y, cardW, cardH, 10);
        ctx.fill();
        ctx.stroke();

        if (isB10) {
          ctx.fillStyle = '#f59e0b';
          roundRect(ctx, x + 1, y + 1, cardW - 2, 3, 2);
          ctx.fill();
        } else if (isB20) {
          ctx.fillStyle = '#0284c7';
          roundRect(ctx, x + 1, y + 1, cardW - 2, 3, 2);
          ctx.fill();
        }

        if (!c) {
          ctx.fillStyle = '#475569';
          ctx.font = '800 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          ctx.fillText('#' + rank, x + 14, y + 36);
          ctx.fillStyle = '#334155';
          ctx.font = '700 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          ctx.fillText('NO RECORD', x + 14, y + 70);
          continue;
        }

        // Rank Number
        ctx.fillStyle = isB10 ? '#fbbf24' : (isB20 ? '#38bdf8' : '#94a3b8');
        ctx.font = '900 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillText('#' + rank, x + 12, y + 34);

        // Difficulty Pill
        let diffBg = '#0284c7';
        let diffBorder = '#38bdf8';
        if (c.diff === 'IV-α') {
          diffBg = '#b91c1c';
          diffBorder = '#fbbf24';
        } else if (c.diff === 'IV') {
          diffBg = '#7c3aed';
          diffBorder = '#c084fc';
        } else if (c.diff === 'III') {
          diffBg = '#0369a1';
          diffBorder = '#38bdf8';
        } else if (c.diff === 'II') {
          diffBg = '#15803d';
          diffBorder = '#4ade80';
        } else if (c.diff === 'I') {
          diffBg = '#0e7490';
          diffBorder = '#22d3ee';
        }

        const diffStr = c.diff + ' ' + c.constant.toFixed(1);
        ctx.font = '800 11.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        const dStrW = ctx.measureText(diffStr).width;
        const dPillW = dStrW + 14;
        const dPillX = x + cardW - dPillW - 10;
        const dPillY = y + 14;

        ctx.fillStyle = diffBg;
        ctx.strokeStyle = diffBorder;
        ctx.lineWidth = 1.2;
        roundRect(ctx, dPillX, dPillY, dPillW, 22, 5);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.fillText(diffStr, dPillX + 7, dPillY + 16);

        // Song Title
        ctx.fillStyle = '#f8fafc';
        ctx.font = '800 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Hiragino Kaku Gothic ProN", "Meiryo", sans-serif';
        const maxTitleW = cardW - 24;
        const fitTitle = truncateCanvasText(ctx, c.title, maxTitleW);
        ctx.fillText(fitTitle, x + 12, y + 68);

        // Pack & Version
        ctx.fillStyle = '#94a3b8';
        ctx.font = '600 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Hiragino Kaku Gothic ProN", "Meiryo", sans-serif';
        const metaStr = 'v' + c.version + ' | ' + c.pack;
        const fitMeta = truncateCanvasText(ctx, metaStr, maxTitleW);
        ctx.fillText(fitMeta, x + 12, y + 90);

        // Score (Large)
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 23px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        const scoreStr = (c.score || 0).toLocaleString();
        ctx.fillText(scoreStr, x + 12, y + 128);

        // Lamp Badge
        if (c.status) {
          const lampX = x + 12;
          const lampY = y + 142;
          let lampBg = '#334155';
          let lampColor = '#ffffff';
          if (c.status === 'AP+') {
            lampBg = '#ec4899';
            lampColor = '#ffffff';
          } else if (c.status === 'AP') {
            lampBg = '#ea580c';
            lampColor = '#ffffff';
          } else if (c.status === 'FC') {
            lampBg = '#0284c7';
            lampColor = '#ffffff';
          } else if (c.status === 'CLEAR') {
            lampBg = '#16a34a';
            lampColor = '#ffffff';
          }
          ctx.font = '800 10.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          const lampW = ctx.measureText(c.status).width + 10;
          ctx.fillStyle = lampBg;
          roundRect(ctx, lampX, lampY, lampW, 18, 4);
          ctx.fill();
          ctx.fillStyle = lampColor;
          ctx.fillText(c.status, lampX + 5, lampY + 13);
        }

        // Single Rating (Right Bottom)
        const rateValStr = c.effectiveRating.toFixed(4);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#64748b';
        ctx.font = '700 10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillText('RATING', x + cardW - 12, y + 158);

        ctx.fillStyle = isB10 ? '#fbbf24' : (isB20 ? '#38bdf8' : '#7dd3fc');
        ctx.font = '900 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillText(rateValStr, x + cardW - 12, y + 180);
        ctx.textAlign = 'left';
      }

      // 4. Footer Line & Credits
      ctx.fillStyle = '#64748b';
      ctx.font = '700 12.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Rotaeno Rating Tracker (Unofficial Fan Tool)   |   Feedback / Bug Report: X @omu2298_rhythm', W / 2, H - 24);
      ctx.textAlign = 'left';

      return canvas;
    }

    function openB40ImageModal() {
      const modal = document.getElementById('b40ImageModal');
      const img = document.getElementById('b40ImageResult');
      const loading = document.getElementById('b40ImageLoading');
      const btnDownload = document.getElementById('btnB40ImageDownload');
      const btnShare = document.getElementById('btnB40ImageShare');

      if (!modal) return;
      modal.classList.add('open');

      if (img) img.style.display = 'none';
      if (loading) loading.style.display = 'block';

      setTimeout(() => {
        try {
          const canvas = generateB40Canvas();
          const dataUrl = canvas.toDataURL('image/png');

          if (img) {
            img.src = dataUrl;
            img.style.display = 'block';
          }
          if (loading) loading.style.display = 'none';

          const filename = 'rotaeno_b40_' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '.png';
          if (btnDownload) {
            btnDownload.href = dataUrl;
            btnDownload.download = filename;
          }

          canvas.toBlob(blob => {
            generatedB40Blob = blob;
            if (navigator.canShare && blob) {
              const file = new File([blob], filename, { type: 'image/png' });
              if (navigator.canShare({ files: [file] })) {
                if (btnShare) btnShare.style.display = 'inline-flex';
              }
            }
          }, 'image/png');

        } catch (err) {
          console.error('B40 image generation failed:', err);
          if (loading) loading.textContent = '画像の生成に失敗しました: ' + err.message;
        }
      }, 80);
    }

    function closeB40ImageModal() {
      const modal = document.getElementById('b40ImageModal');
      if (modal) modal.classList.remove('open');
    }

    const btnOpenB40Image = document.getElementById('btnOpenB40Image');
    if (btnOpenB40Image) btnOpenB40Image.addEventListener('click', openB40ImageModal);

    const btnB40Close = document.getElementById('btnB40ImageModalClose');
    if (btnB40Close) btnB40Close.addEventListener('click', closeB40ImageModal);

    const btnB40Cancel = document.getElementById('btnB40ImageModalCancel');
    if (btnB40Cancel) btnB40Cancel.addEventListener('click', closeB40ImageModal);

    const modalB40Overlay = document.getElementById('b40ImageModal');
    if (modalB40Overlay) {
      modalB40Overlay.addEventListener('click', (e) => {
        if (e.target.id === 'b40ImageModal') closeB40ImageModal();
      });
    }

    const btnB40Share = document.getElementById('btnB40ImageShare');
    if (btnB40Share) {
      btnB40Share.addEventListener('click', async () => {
        if (!generatedB40Blob) return;
        try {
          const filename = 'rotaeno_b40_' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '.png';
          const file = new File([generatedB40Blob], filename, { type: 'image/png' });
          await navigator.share({
            title: 'Rotaeno BEST 40',
            text: '私の Rotaeno BEST 40 (Rating: ' + (currentCalc ? currentCalc.totalRating.toFixed(4) : '') + ') #Rotaeno',
            files: [file]
          });
        } catch (err) {
          if (err.name !== 'AbortError') console.error('Share error:', err);
        }
      });
    }

    window.addEventListener('beforeunload', (e) => {
      const allIds = new Set([...Object.keys(userScores), ...Object.keys(savedScores)]);
      let hasScoreChange = false;
      for (const id of allIds) {
        const u = userScores[id] || { score: 0, status: '' };
        const s = savedScores[id] || { score: 0, status: '' };
        if (u.score !== s.score || u.status !== s.status) {
          hasScoreChange = true;
          break;
        }
      }
      const hasSongChange = JSON.stringify(masterSongs) !== JSON.stringify(savedMasterSongs);
      const hasPackOrderChange = JSON.stringify(packOrder) !== JSON.stringify(savedPackOrder);
      if (hasScoreChange || hasSongChange || hasPackOrderChange) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    });

    async function startFirstBootFetch() {
      const overlay = document.getElementById('firstBootLoadingOverlay');
      const errorWrap = document.getElementById('firstBootErrorWrap');
      const errorMsg = document.getElementById('firstBootErrorMsg');
      const progressWrap = document.getElementById('firstBootProgressWrap');

      if (overlay) overlay.style.display = 'flex';
      if (errorWrap) errorWrap.style.display = 'none';
      if (progressWrap) progressWrap.style.display = 'block';

      const endpoint = getActiveGasEndpoint();
      if (!endpoint) {
        if (errorWrap) errorWrap.style.display = 'flex';
        if (progressWrap) progressWrap.style.display = 'none';
        if (errorMsg) errorMsg.textContent = '中央連携APIエンドポイントが未設定です。';
        return;
      }

      try {
        const res = await fetch(endpoint + '?t=' + Date.now(), { method: 'GET' });
        const json = await res.json();
        if (json.status === 'success' && json.data) {
          const liveSongs = json.data.songs;
          const liveConfig = json.data.config;

          if (Array.isArray(liveSongs) && liveSongs.length > 0) {
            const builtTuples = [];
            liveSongs.forEach((song, idx) => {
              const songInitId = (song.initId !== undefined && !isNaN(song.initId)) ? Number(song.initId) : (idx + 1);
              const diffKeys = DIFF_KEYS_DESC;
              diffKeys.forEach(diff => {
                const d = song.diffs && song.diffs[diff];
                if (!d || isNaN(d.constant) || Number(d.constant) <= 0) return;
                builtTuples.push([
                  getResolvedSongId(song, songInitId) + '_' + diff,
                  getChartTitleFromSongObj(song, diff),
                  diff,
                  d.level || calcLevelFromConstant(d.constant),
                  Number(d.constant),
                  0,
                  song.pack || DEFAULT_PACK,
                  song.songId || ('song_' + songInitId),
                  Number(song.endOfSale) || 0,
                  0,
                  '',
                  song.version || DEFAULT_VERSION,
                  songInitId
                ]);
              });
            });

            if (builtTuples.length > 0) {
              builtTuples.sort((a, b) => compareDefaultOrder(a, b));
              masterSongs = builtTuples;
              savedMasterSongs = JSON.parse(JSON.stringify(masterSongs));
              saveMasterSongs();

              if (liveConfig && Array.isArray(liveConfig.packOrder) && liveConfig.packOrder.length > 0) {
                packOrder = [...liveConfig.packOrder];
                savedPackOrder = [...packOrder];
                GAME_PACK_ORDER = [...liveConfig.packOrder];
                savePackOrder();
              }

              if (Array.isArray(json.data.popups)) {
                saveCachedPopupItems(json.data.popups);
                localStorage.setItem(POPUP_LAST_FETCH_AT_KEY, String(Date.now()));
                const maxInitPopupNo = json.data.popups.reduce((max, item) => Math.max(max, Number(item.no) || 0), 0);
                if (maxInitPopupNo > 0) {
                  setLastSeenPopupId(maxInitPopupNo);
                }
              }

              initFormDatalists();
              initApPlusForm();
              renderPackOrderList();
              renderEditSongSearchResult();
              refresh();

              if (overlay) overlay.style.display = 'none';
              showSaveToast('✨ 管理スプシから最新楽曲データ（計 ' + liveSongs.length + '曲）をロードしました！');
              return;
            }
          }
        }

        const msg = (json && json.message) ? json.message : '管理スプレッドシートの楽曲データが空です。管理スプシの「Songs」シートを確認してください。';
        throw new Error(msg);
      } catch (err) {
        console.error('First boot fetch failed:', err);
        if (progressWrap) progressWrap.style.display = 'none';
        if (errorWrap) errorWrap.style.display = 'flex';
        if (errorMsg) errorMsg.textContent = '楽曲データの取得に失敗しました:\n' + (err.message || err);
      }
    }

    const btnFirstBootRetry = document.getElementById('btnFirstBootRetry');
    if (btnFirstBootRetry) btnFirstBootRetry.addEventListener('click', startFirstBootFetch);

    // ==========================================================
    // Notice / Update Popup Engine (popup sheet)
    // ==========================================================
    let currentUnreadPopups = [];
    let isCheckingPopup = false;

    function getLastSeenPopupId() {
      const val = parseInt(localStorage.getItem(POPUP_LAST_SEEN_ID_KEY) || '0', 10);
      return isNaN(val) ? 0 : val;
    }

    function setLastSeenPopupId(no) {
      const cur = getLastSeenPopupId();
      if (no > cur) {
        localStorage.setItem(POPUP_LAST_SEEN_ID_KEY, String(no));
      }
      localStorage.removeItem(POPUP_SNOOZE_AT_KEY);
    }

    function getCachedPopupItems() {
      try {
        const raw = localStorage.getItem(POPUP_CACHE_DATA_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return [];
      }
    }

    function saveCachedPopupItems(items) {
      if (!Array.isArray(items)) return;
      try {
        localStorage.setItem(POPUP_CACHE_DATA_KEY, JSON.stringify(items));
      } catch (e) {}
    }

    function isAnyBlockingModalOpen() {
      const noticeModal = document.getElementById('noticePopupModal');
      const officialModal = document.getElementById('officialUpdateModal');
      const firstBoot = document.getElementById('firstBootLoadingOverlay');
      if (noticeModal && noticeModal.classList.contains('open')) return true;
      if (officialModal && officialModal.classList.contains('open')) return true;
      if (firstBoot && firstBoot.style.display === 'flex') return true;
      return false;
    }

    function renderAndOpenNoticePopup(unreadList) {
      if (!Array.isArray(unreadList) || unreadList.length === 0) return;
      if (isAnyBlockingModalOpen()) return;

      currentUnreadPopups = unreadList;
      const modal = document.getElementById('noticePopupModal');
      const listEl = document.getElementById('noticePopupList');
      const btnGoUpdate = document.getElementById('btnNoticePopupGoUpdate');
      const btnConfirm = document.getElementById('btnNoticePopupConfirm');
      const btnMarkRead = document.getElementById('btnNoticePopupMarkRead');
      if (!modal || !listEl) return;

      const sorted = [...unreadList].sort((a, b) => (Number(b.no) || 0) - (Number(a.no) || 0));
      const hasUpdateGuide = sorted.some(item => Number(item.guideUpdate) === 1);

      let html = '';
      sorted.forEach(item => {
        const isUpd = Number(item.guideUpdate) === 1;
        const cardClass = isUpd ? 'notice-item-card has-update' : 'notice-item-card';
        const badgeClass = isUpd ? 'notice-item-badge badge-update' : 'notice-item-badge';
        const badgeLabel = isUpd ? '⚡ 楽曲・データ更新' : '📢 お知らせ';
        const dateStr = item.date ? escapeHtml(String(item.date)) : '';

        html +=
          '<div class="' + cardClass + '">' +
            '<div class="notice-item-meta">' +
              '<span class="' + badgeClass + '">' + badgeLabel + ' (No.' + escapeHtml(String(item.no)) + ')</span>' +
              '<span>' + dateStr + '</span>' +
            '</div>' +
            '<div class="notice-item-text">' + escapeHtml(String(item.message || '')) + '</div>' +
          '</div>';
      });
      listEl.innerHTML = html;

      if (hasUpdateGuide) {
        if (btnGoUpdate) btnGoUpdate.style.display = 'inline-flex';
        if (btnConfirm) btnConfirm.style.display = 'none';
        if (btnMarkRead) btnMarkRead.style.display = 'inline-block';
      } else {
        if (btnGoUpdate) btnGoUpdate.style.display = 'none';
        if (btnConfirm) btnConfirm.style.display = 'inline-flex';
        if (btnMarkRead) btnMarkRead.style.display = 'none';
      }

      modal.style.display = 'flex';
      modal.classList.add('open');
    }

    function closeNoticePopupElement() {
      const modal = document.getElementById('noticePopupModal');
      if (modal) {
        modal.classList.remove('open');
        modal.style.display = 'none';
      }
    }

    function markNoticePopupAsRead() {
      const cached = getCachedPopupItems();
      const allItems = [...cached, ...currentUnreadPopups];
      const maxNo = allItems.reduce((max, item) => Math.max(max, Number(item.no) || 0), getLastSeenPopupId());
      if (maxNo > 0) {
        setLastSeenPopupId(maxNo);
      }
      currentUnreadPopups = [];
      closeNoticePopupElement();
    }

    function deferNoticePopup() {
      localStorage.setItem(POPUP_SNOOZE_AT_KEY, String(Date.now()));
      closeNoticePopupElement();
    }

    async function checkPopupNotifications(triggerType = 'load') {
      if (isCheckingPopup) return;
      if (isAnyBlockingModalOpen()) return;

      const now = Date.now();
      const lastFetchAt = parseInt(localStorage.getItem(POPUP_LAST_FETCH_AT_KEY) || '0', 10) || 0;
      const snoozeAt = parseInt(localStorage.getItem(POPUP_SNOOZE_AT_KEY) || '0', 10) || 0;
      const lastSeenId = getLastSeenPopupId();

      const shouldFetchGas = (triggerType === 'load')
        ? (now - lastFetchAt >= POPUP_RELOAD_COOLDOWN_MS)
        : (now - lastFetchAt >= POPUP_TAB_SWITCH_COOLDOWN_MS);

      if (shouldFetchGas) {
        const endpoint = getActiveGasEndpoint();
        if (endpoint) {
          isCheckingPopup = true;
          try {
            localStorage.setItem(POPUP_LAST_FETCH_AT_KEY, String(now));
            const res = await fetch(endpoint + '?mode=popup&t=' + now, { method: 'GET' });
            const json = await res.json();
            if (json && json.status === 'success' && json.data && Array.isArray(json.data.popups)) {
              saveCachedPopupItems(json.data.popups);
            }
          } catch (err) {
            console.warn('Popup check skipped:', err);
          } finally {
            isCheckingPopup = false;
          }
        }
      }

      const cachedItems = getCachedPopupItems();
      const unread = cachedItems.filter(item => (Number(item.no) || 0) > getLastSeenPopupId());
      if (unread.length === 0) return;

      if (triggerType !== 'load' && snoozeAt > 0 && (now - snoozeAt < POPUP_SNOOZE_COOLDOWN_MS)) {
        return;
      }

      renderAndOpenNoticePopup(unread);
    }

    const btnNoticeClose = document.getElementById('btnNoticePopupClose');
    if (btnNoticeClose) btnNoticeClose.addEventListener('click', deferNoticePopup);
    const btnNoticeLater = document.getElementById('btnNoticePopupLater');
    if (btnNoticeLater) btnNoticeLater.addEventListener('click', deferNoticePopup);
    const btnNoticeConfirm = document.getElementById('btnNoticePopupConfirm');
    if (btnNoticeConfirm) btnNoticeConfirm.addEventListener('click', markNoticePopupAsRead);
    const btnNoticeMarkRead = document.getElementById('btnNoticePopupMarkRead');
    if (btnNoticeMarkRead) btnNoticeMarkRead.addEventListener('click', markNoticePopupAsRead);
    const btnNoticeGoUpdate = document.getElementById('btnNoticePopupGoUpdate');
    if (btnNoticeGoUpdate) {
      btnNoticeGoUpdate.addEventListener('click', () => {
        markNoticePopupAsRead();
        openOfficialUpdateModal();
      });
    }

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        checkPopupNotifications('visibility');
      }
    });
    window.addEventListener('focus', () => {
      checkPopupNotifications('visibility');
    });

    function applyTheme(pref) {
      currentThemePref = pref;
      localStorage.setItem(THEME_PREF_KEY, pref);

      const isDark = (pref === 'dark') || (pref === 'auto' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
      if (isDark) {
        document.documentElement.setAttribute('data-theme', 'dark');
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.setAttribute('content', '#101c2b');
      } else {
        document.documentElement.removeAttribute('data-theme');
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.setAttribute('content', '#144973');
      }

      // Update Header Toggle Icon
      const toggleIcon = document.getElementById('themeToggleIcon');
      if (toggleIcon) {
        toggleIcon.textContent = isDark ? '☀️' : '🌙';
      }
      const toggleBtn = document.getElementById('btnThemeToggle');
      if (toggleBtn) {
        toggleBtn.title = isDark ? 'ライトモードに切り替え' : 'ダークモードに切り替え';
      }

      // Update Settings Choice Buttons
      document.querySelectorAll('.theme-choice-btn').forEach(btn => {
        const choice = btn.getAttribute('data-theme');
        if (choice === pref) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }

    function initTheme() {
      applyTheme(currentThemePref);

      // Listen for OS color scheme change when set to auto
      if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
          if (currentThemePref === 'auto') {
            applyTheme('auto');
          }
        });
      }

      // Header button toggles between light and dark
      const btnToggle = document.getElementById('btnThemeToggle');
      if (btnToggle) {
        btnToggle.addEventListener('click', () => {
          const isCurrentlyDark = document.documentElement.getAttribute('data-theme') === 'dark';
          applyTheme(isCurrentlyDark ? 'light' : 'dark');
        });
      }

      // Settings panel choice buttons
      document.querySelectorAll('.theme-choice-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const choice = btn.getAttribute('data-theme') || 'auto';
          applyTheme(choice);
        });
      });
    }

    initTheme();
    loadPackOrder();
    const hasCachedMaster = loadMasterSongs();
    loadInitialScores();
    loadApPlusRecords();
    initFormDatalists();
    initApPlusForm();
    initCollapsiblePanels();
    initSearchClearButtons();
    renderPackOrderList();
    renderEditSongSearchResult();
    restoreFilterState();
    refresh();
    checkUnsavedChanges();
    updateGasSyncUI();

    if (!hasCachedMaster) {
      startFirstBootFetch();
    } else {
      checkPopupNotifications('load');
    }
