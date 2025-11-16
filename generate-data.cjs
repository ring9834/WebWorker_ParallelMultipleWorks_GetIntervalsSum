// Run "node generate-data.js" to create intervals_100k.json with 100,000 intervals
const fs = require('fs');

// Creates a real array of 100,000 items
// Each item is an interval [start, end]
// () => { ... } is a function that returns the value for each item, and runs 100,000 times
const intervals = Array.from({ length: 100000 }, () => {
  const start = Math.floor(Math.random() * 2000000) - 1000000; // -1M to +1M
  const end = start + Math.floor(Math.random() * 1000);
  return [start, end];
});

fs.writeFileSync(
  'public/intervals_100k.json',
  // { intervals } - Wrap array in object → { "intervals": [...] }
  // null - No replacer function
  // 2 - Pretty-print with 2 spaces indentation
  JSON.stringify({ intervals }, null, 2)
);