/**
 * Rotaeno Rating Tracker - Google スプレッドシート連携スクリプト (中央連携・個人スプシ両対応)
 * 
 * 【仕組み】
 * 管理者がデプロイした単一のWebアプリAPIを経由して、各ユーザーのGoogleスプレッドシート
 * （共有設定: リンクを知っている全員が編集可）に対して安全に読み書きを行います。
 * 一般ユーザーは Apps Script のデプロイ作業を一切行う必要がありません！
 */

const SHEET_NAMES = {
  SONGS: 'Songs',
  SCORES: 'Scores',
  THEORY: 'TheoryRecords',
  CONFIG: 'Config'
};

function getOrCreateSheet(ss, name) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}

function resolveSpreadsheet(target) {
  if (!target) {
    return SpreadsheetApp.getActiveSpreadsheet();
  }
  target = String(target).trim();
  try {
    if (target.startsWith('http://') || target.startsWith('https://')) {
      return SpreadsheetApp.openByUrl(target);
    } else {
      return SpreadsheetApp.openById(target);
    }
  } catch (err) {
    throw new Error('スプレッドシートを開けませんでした。スプレッドシートの共有設定が「リンクを知っている全員（編集者）」になっているか確認してください。(詳細: ' + err.message + ')');
  }
}

function doGet(e) {
  try {
    const target = (e && e.parameter) ? (e.parameter.url || e.parameter.id) : null;
    const ss = resolveSpreadsheet(target);

    const data = {
      songs: readSongsSheet(ss),
      scores: readScoresSheet(ss),
      apPlusRecords: readTheorySheet(ss),
      config: readConfigSheet(ss)
    };

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      data: data
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.message || err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    let payload = null;
    if (e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    } else {
      throw new Error('No post data received');
    }

    const target = payload.sheetUrl || payload.sheetId;
    const ss = resolveSpreadsheet(target);
    const nowStr = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy/MM/dd HH:mm:ss');

    if (payload.songs && Array.isArray(payload.songs)) {
      writeSongsSheet(ss, payload.songs);
    }
    if (payload.scores && typeof payload.scores === 'object') {
      writeScoresSheet(ss, payload.scores, nowStr);
    }
    if (payload.apPlusRecords && Array.isArray(payload.apPlusRecords)) {
      writeTheorySheet(ss, payload.apPlusRecords);
    }
    if (payload.config && typeof payload.config === 'object') {
      payload.config.lastSyncedAt = nowStr;
      writeConfigSheet(ss, payload.config);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: '同期が正常に完了しました',
      syncedAt: nowStr
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.message || err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/* ==========================================================
 * Sheet I/O Helpers
 * ========================================================== */

// 1. Songs Sheet (楽曲マスター: 1曲1行)
function writeSongsSheet(ss, songs) {
  const sheet = getOrCreateSheet(ss, SHEET_NAMES.SONGS);
  sheet.clear();
  const headers = [
    'デフォルト順', '曲名', 'ソングパック', 'バージョン', 'songId', '販売終了',
    'I_定数', 'I_Lv', 'II_定数', 'II_Lv',
    'III_定数', 'III_Lv', 'IV_定数', 'IV_Lv',
    'IV-α_定数', 'IV-α_Lv'
  ];
  const rows = [headers];

  songs.forEach((s, idx) => {
    const d = s.diffs || {};
    const orderNo = (s.initId !== undefined && !isNaN(s.initId)) ? Number(s.initId) : (idx + 1);
    const titleStr = String(s.title || '');
    const isEndOfSale = (s.endOfSale === 1 || s.endOfSale === true || String(s.endOfSale) === '1') ? 1 : 0;
    rows.push([
      orderNo,
      titleStr,
      s.pack || '',
      s.version || '',
      s.songId || '',
      isEndOfSale,
      d['I'] ? d['I'].constant : '',
      d['I'] ? d['I'].level : '',
      d['II'] ? d['II'].constant : '',
      d['II'] ? d['II'].level : '',
      d['III'] ? d['III'].constant : '',
      d['III'] ? d['III'].level : '',
      d['IV'] ? d['IV'].constant : '',
      d['IV'] ? d['IV'].level : '',
      d['IV-α'] ? d['IV-α'].constant : '',
      d['IV-α'] ? d['IV-α'].level : ''
    ]);
  });

  if (rows.length > 1) {
    sheet.getRange(2, 2, rows.length - 1, 4).setNumberFormat('@');
    sheet.getRange(1, 1, rows.length, headers.length).setValues(rows);
    sheet.getRange(1, 1, rows.length, 1).setHorizontalAlignment('center');
    sheet.getRange(1, 6, rows.length, 1).setHorizontalAlignment('center');
  } else {
    sheet.getRange(1, 1, 1, headers.length).setValues(rows);
  }
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#e0f2fe');
  sheet.setFrozenRows(1);
}

function readSongsSheet(ss) {
  const sheet = ss.getSheetByName(SHEET_NAMES.SONGS);
  if (!sheet) return [];
  const range = sheet.getDataRange();
  const values = range.getValues();
  const displayValues = range.getDisplayValues();
  if (values.length <= 1) return [];

  // Match columns dynamically by header names
  const headers = displayValues[0].map(h => String(h || '').trim());
  const colOrder = headers.findIndex(h => /^(デフォルト順|No|順序|ID)$/i.test(h));
  const colTitle = headers.indexOf('曲名');
  const colPack = headers.indexOf('ソングパック');
  const colVer = headers.indexOf('バージョン');
  const colSongId = headers.indexOf('songId');
  const colEndOfSale = headers.findIndex(h => /^(販売終了|endOfSale|削除フラグ)$/i.test(h));
  const colConstI = headers.indexOf('I_定数');
  const colLvI = headers.indexOf('I_Lv');
  const colConstII = headers.indexOf('II_定数');
  const colLvII = headers.indexOf('II_Lv');
  const colConstIII = headers.indexOf('III_定数');
  const colLvIII = headers.indexOf('III_Lv');
  const colConstIV = headers.indexOf('IV_定数');
  const colLvIV = headers.indexOf('IV_Lv');
  const colConstIVAlpha = headers.findIndex(h => /^(IV-α_定数|IV-a_定数)$/i.test(h));
  const colLvIVAlpha = headers.findIndex(h => /^(IV-α_Lv|IV-a_Lv)$/i.test(h));

  const hasOrderCol = colOrder !== -1;
  const idxTitle = colTitle !== -1 ? colTitle : (hasOrderCol ? 1 : 0);
  const idxPack = colPack !== -1 ? colPack : (hasOrderCol ? 2 : 1);
  const idxVer = colVer !== -1 ? colVer : (hasOrderCol ? 3 : 2);
  const idxSongId = colSongId !== -1 ? colSongId : (hasOrderCol ? 4 : 3);

  const songs = [];
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const disp = displayValues[i];

    const title = (disp && disp[idxTitle] !== '') ? disp[idxTitle] : String(row[idxTitle] || '');
    if (!title) continue;

    const initId = (hasOrderCol && row[colOrder] !== '' && !isNaN(row[colOrder])) ? Number(row[colOrder]) : i;

    let endOfSale = 0;
    if (colEndOfSale !== -1) {
      const val = row[colEndOfSale];
      if (val === 1 || String(val).trim() === '1' || String(val).toUpperCase() === 'TRUE') {
        endOfSale = 1;
      }
    }

    const diffs = {};
    function parseDiff(cIdx, lIdx, key) {
      if (cIdx !== -1 && row[cIdx] !== '' && !isNaN(row[cIdx])) {
        diffs[key] = {
          constant: Number(row[cIdx]),
          level: String((lIdx !== -1 && disp && disp[lIdx]) || (lIdx !== -1 && row[lIdx]) || '')
        };
      }
    }

    if (colConstI !== -1) {
      parseDiff(colConstI, colLvI, 'I');
      parseDiff(colConstII, colLvII, 'II');
      parseDiff(colConstIII, colLvIII, 'III');
      parseDiff(colConstIV, colLvIV, 'IV');
      parseDiff(colConstIVAlpha, colLvIVAlpha, 'IV-α');
    } else {
      // Legacy positional layout fallback
      const baseDiffIdx = (colEndOfSale !== -1 && colEndOfSale < 6) ? 6 : (hasOrderCol ? 5 : 4);
      parseDiff(baseDiffIdx, baseDiffIdx + 1, 'I');
      parseDiff(baseDiffIdx + 2, baseDiffIdx + 3, 'II');
      parseDiff(baseDiffIdx + 4, baseDiffIdx + 5, 'III');
      parseDiff(baseDiffIdx + 6, baseDiffIdx + 7, 'IV');
      parseDiff(baseDiffIdx + 8, baseDiffIdx + 9, 'IV-α');
    }

    songs.push({
      initId: initId,
      title: title,
      pack: String((disp && disp[idxPack]) || row[idxPack] || '基本曲'),
      version: String((disp && disp[idxVer]) || row[idxVer] || 'v5.6.0'),
      songId: String((disp && disp[idxSongId]) || row[idxSongId] || ('song_' + i)),
      endOfSale: endOfSale,
      diffs: diffs
    });
  }
  songs.sort((a, b) => (a.initId || 0) - (b.initId || 0));
  return songs;
}

// 2. Scores Sheet (プレイ成績)
function writeScoresSheet(ss, scores, nowStr) {
  const sheet = getOrCreateSheet(ss, SHEET_NAMES.SCORES);
  sheet.clear();
  const headers = ['チャートID', 'スコア', 'クリアランプ', '最終更新日時'];
  const rows = [headers];

  Object.keys(scores).forEach(chartId => {
    const item = scores[chartId];
    if (item && (item.score > 0 || item.status)) {
      rows.push([
        chartId,
        item.score || 0,
        item.status || '',
        nowStr
      ]);
    }
  });

  if (rows.length > 1) {
    sheet.getRange(1, 1, rows.length, headers.length).setValues(rows);
  } else {
    sheet.getRange(1, 1, 1, headers.length).setValues(rows);
  }
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#fef3c7');
  sheet.setFrozenRows(1);
}

function readScoresSheet(ss) {
  const sheet = ss.getSheetByName(SHEET_NAMES.SCORES);
  if (!sheet) return {};
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return {};

  const scores = {};
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const chartId = String(row[0]);
    if (!chartId) continue;
    scores[chartId] = {
      score: Number(row[1]) || 0,
      status: String(row[2] || '')
    };
  }
  return scores;
}

// 3. TheoryRecords Sheet (理論値記録)
function writeTheorySheet(ss, records) {
  const sheet = getOrCreateSheet(ss, SHEET_NAMES.THEORY);
  sheet.clear();
  const headers = ['No', '曲名', '難易度', '達成日', '備考'];
  const rows = [headers];

  records.forEach(r => {
    rows.push([
      r.no || '',
      r.title || '',
      r.diff || '',
      r.date || '',
      r.note || ''
    ]);
  });

  if (rows.length > 1) {
    sheet.getRange(1, 1, rows.length, headers.length).setValues(rows);
  } else {
    sheet.getRange(1, 1, 1, headers.length).setValues(rows);
  }
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#e0e7ff');
  sheet.setFrozenRows(1);
}

function readTheorySheet(ss) {
  const sheet = ss.getSheetByName(SHEET_NAMES.THEORY);
  if (!sheet) return [];
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];

  const records = [];
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    if (row[0] === '' && !row[1]) continue;

    let dateStr = '';
    const dateVal = row[3];
    if (dateVal instanceof Date) {
      dateStr = Utilities.formatDate(dateVal, 'Asia/Tokyo', 'yyyy/M/d');
    } else if (dateVal) {
      dateStr = String(dateVal);
    }

    records.push({
      no: Number(row[0]) || (i),
      title: String(row[1] || ''),
      diff: String(row[2] || ''),
      date: dateStr,
      note: String(row[4] || '')
    });
  }
  return records;
}

// 4. Config Sheet (設定データ)
function writeConfigSheet(ss, config) {
  const sheet = getOrCreateSheet(ss, SHEET_NAMES.CONFIG);
  sheet.clear();
  const headers = ['キー', '設定値', '説明'];
  const rows = [
    headers,
    ['packOrder', JSON.stringify(config.packOrder || []), 'ソングパック表示順序 (JSON)'],
    ['statsScope', String(config.statsScope || 'ALL'), 'マイページ統計対象スコープ (ALL / IN_GAME)'],
    ['showApPlusDate', String(config.showApPlusDate !== false), '理論値一覧の日付列表示設定 (true / false)'],
    ['lastSyncedAt', String(config.lastSyncedAt || ''), '最終同期日時 (自動更新)']
  ];

  sheet.getRange(1, 1, rows.length, headers.length).setValues(rows);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#f1f5f9');
  sheet.setFrozenRows(1);
}

function readConfigSheet(ss) {
  const sheet = ss.getSheetByName(SHEET_NAMES.CONFIG);
  if (!sheet) return {};
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return {};

  const config = {};
  for (let i = 1; i < values.length; i++) {
    const key = String(values[i][0]);
    const val = values[i][1];
    if (key === 'packOrder') {
      try { config.packOrder = JSON.parse(val); } catch (e) { config.packOrder = []; }
    } else if (key === 'statsScope') {
      config.statsScope = String(val);
    } else if (key === 'showApPlusDate') {
      config.showApPlusDate = (val === 'true' || val === true);
    } else if (key === 'lastSyncedAt') {
      config.lastSyncedAt = String(val);
    }
  }
  return config;
}
