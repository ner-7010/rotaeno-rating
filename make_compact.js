const fs = require('fs');
const songs = JSON.parse(fs.readFileSync('songs_master.json', 'utf-8'));

const compact = songs.map(s => [
  s.id,                  // 0
  s.title,               // 1
  s.difficulty,          // 2
  s.level,               // 3
  s.constant,            // 4
  s.notes,               // 5
  s.pack,                // 6
  s.songId,              // 7
  s.endOfSale,           // 8
  0,                     // 9: initialScore (0: 未入力)
  '',                    // 10: initialStatus ('': 未クリア)
  s.version || '',       // 11
  s.initId || 0          // 12
]);

fs.writeFileSync('compact_songs.json', JSON.stringify(compact));
console.log('Compact size with version & initId:', (fs.statSync('compact_songs.json').size / 1024).toFixed(1), 'KB');
