# Web Worker for parallel jobs to improve efficiency of calculation

This code example is to domonstrate how to use Web Worker to apply parallel caculations on large quantity of data (in this case, data are arrays with like 100K or more elements). We use Web worker to divide data into specific share of chunks which can be dealt with in parallel like multi-threads.

## Main features

:two_hearts:Web Workers.

:gift_heart:React + vite.

## Worker.js code
```sh
function mergeIntervals(intervals) {
  if (intervals.length === 0) return [];

  // Sort by start
  intervals.sort((a, b) => a[0] - b[0]);

  const merged = [intervals[0]];

  for (let i = 1; i < intervals.length; i++) {
    const current = intervals[i];
    const last = merged[merged.length - 1];

    if (current[0] <= last[1]) {
      last[1] = Math.max(last[1], current[1]);
    } else {
      merged.push(current);
    }
  }

  return merged;
}

self.onmessage = function (e) {
  const { chunk, chunkIndex } = e.data;
  const merged = mergeIntervals(chunk);
  const partialSum = merged.reduce((sum, [low, high]) => sum + (high - low), 0);
  self.postMessage({ chunkIndex, partialSum, merged });
};
```
