const fs = require('fs');

const raw = fs.readFileSync('songs_data.csv', 'utf-8');

// Simple CSV parser supporting quotes and multiline headers
function parseCSV(text) {
  const lines = [];
  let row = [];
  let inQuotes = false;
  let current = '';

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(current);
      current = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') i++;
      row.push(current);
      lines.push(row);
      row = [];
      current = '';
    } else {
      current += char;
    }
  }
  if (current || row.length > 0) {
    row.push(current);
    lines.push(row);
  }
  return lines;
}

const allRows = parseCSV(raw);

// Find where header ends and data begins
// Line with "翠杜" (suito) is a data row
let dataStartIndex = 0;
for (let i = 0; i < allRows.length; i++) {
  if (allRows[i].length > 6 && (allRows[i][3] === 'suito' || allRows[i][5] === '翠杜')) {
    dataStartIndex = i;
    break;
  }
}

console.log(`Data starts at row index: ${dataStartIndex}`);

const songs = [];
for (let i = dataStartIndex; i < allRows.length; i++) {
  const row = allRows[i];
  if (!row || row.length < 10) continue;

  let pack = (row[0] || '').trim().replaceAll('∽', '~');
  const packNameMap = {
    'maimai  コラボ': 'maimai コラボ',
    'Miliセレクション': 'Mili セレクション',
    'Dynamix Universe  コラボ': 'Dynamix Universe コラボ',
    'KALPA: Cosmic Symphony  コラボ': 'KALPA: Cosmic Symphony コラボ',
    'Cytus II  コラボ': 'Cytus II コラボ',
    'Tanchikyセレクション': 'Tanchiky セレクション',
    'NOISZ SL + PK GODHAND  コラボ': 'NOISZ SL + PK GODHAND コラボ',
    'DEEMOII コラボ': 'DEEMO II コラボ',
    'Paradigm: Reboot コラボ': 'Paradigm: Rebootコラボ',
    'Livemania': 'LiveMania',
    'WACCA コラボ': 'WACCA コラボ I',
    'Ψ：脳波オーバーロード': 'Ψ: 脳波オーバーロード',
    'ROCK (Y)OUR WORLD': 'Rock (Y)our World'
  };
  if (packNameMap[pack]) {
    pack = packNameMap[pack];
  }
  const initId = parseInt(row[1]) || 0;
  const updateId = parseInt(row[2]) || 0;
  const songId = (row[3] || '').trim();
  const version = (row[4] || '').trim();
  const title = (row[5] || '').trim().replaceAll('∽', '~');
  const difficulty = (row[6] || '').trim(); // I, II, III, IV, IV-α
  const level = (row[7] || '').trim();
  const constant = parseFloat(row[8]) || 0;
  const notes = parseInt(row[9]) || 0;
  const initialScore = parseInt(row[15]) || null;
  let initialStatus = (row[16] || '').trim(); // AP, FC, etc.
  if (initialScore === 1010000) {
    initialStatus = 'AP+';
  }
  const endOfSale = parseInt(row[18]) || 0; // 販売終了

  if (!songId && !title) continue;

  songs.push({
    id: `${songId}_${difficulty}`,
    pack,
    initId,
    updateId,
    songId,
    version,
    title,
    difficulty,
    level,
    constant,
    notes,
    endOfSale,
    initialScore,
    initialStatus
  });
}

console.log(`Parsed ${songs.length} chart entries`);
fs.writeFileSync('songs_master.json', JSON.stringify(songs, null, 2), 'utf-8');
