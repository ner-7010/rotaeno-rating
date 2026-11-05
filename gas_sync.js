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
    '曲名', 'ソングパック', 'バージョン', 'songId',
    'I_定数', 'I_Lv', 'II_定数', 'II_Lv',
    'III_定数', 'III_Lv', 'IV_定数', 'IV_Lv',
    'IV-α_定数', 'IV-α_Lv'
  ];
  const rows = [headers];

  songs.forEach(s => {
    const d = s.diffs || {};
    rows.push([
      s.title || '',
      s.pack || '',
      s.version || '',
      s.songId || '',
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

  sheet.getRange(1, 1, rows.length, headers.length).setValues(rows);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#e0f2fe');
  sheet.setFrozenRows(1);
}

function readSongsSheet(ss) {
  const sheet = ss.getSheetByName(SHEET_NAMES.SONGS);
  if (!sheet) return [];
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];

  const songs = [];
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    if (!row[0]) continue;
    const diffs = {};
    if (row[4] !== '') diffs['I'] = { constant: Number(row[4]), level: String(row[5] || '') };
    if (row[6] !== '') diffs['II'] = { constant: Number(row[6]), level: String(row[7] || '') };
    if (row[8] !== '') diffs['III'] = { constant: Number(row[8]), level: String(row[9] || '') };
    if (row[10] !== '') diffs['IV'] = { constant: Number(row[10]), level: String(row[11] || '') };
    if (row[12] !== '') diffs['IV-α'] = { constant: Number(row[12]), level: String(row[13] || '') };

    songs.push({
      title: String(row[0]),
      pack: String(row[1] || '基本曲'),
      version: String(row[2] || 'v5.6.0'),
      songId: String(row[3] || ('song_' + i)),
      diffs: diffs
    });
  }
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
