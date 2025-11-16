import { useState } from 'react';
import './App.css';

const NUM_WORKERS = 4; // Adjust based on CPU

function App() {
  const [sum, setSum] = useState(null);
  const [loading, setLoading] = useState(false);

  const calculateIntervalSum = async () => {
    setLoading(true);
    setSum(null);

    try {
      // Load data
      const response = await fetch('/intervals_100k.json');
      const { intervals } = await response.json();

      const chunkSize = Math.ceil(intervals.length / NUM_WORKERS);
      const workers = [];
      const results = [];

      // Launch workers
      for (let i = 0; i < NUM_WORKERS; i++) {
        const start = i * chunkSize;
        const end = start + chunkSize;
        const chunk = intervals.slice(start, end);

        if (chunk.length === 0) continue;

        // import.meta.url is Vite-specific way to get module URL; Start from where this file (App.jsx) is located
        // Because worker.js uses ES Modules syntax "self.onmessage = ...", we need to specify type: 'module', because Vite treats .js files as modules
        const worker = new Worker(new URL('./worker.js', import.meta.url), {
          type: 'module',
        });

        // Wait for this worker to finish and return its result — then move on.
        // Promise is resolved when worker.onmessage is called
        const promise = new Promise((resolve) => {
          worker.onmessage = (e) => {
            results[i] = e.data;
            worker.terminate();
            // Resolve the promise to indicate this worker is done--Tells the Promise: "I’m done!"
            resolve();
          };
        });

        // Sends data to the worker (like sending a text message)
        worker.postMessage({ chunk, chunkIndex: i });
        workers.push(promise);
      }

      // Wait for all workers to finish
      await Promise.all(workers);

      // Combine all merged intervals from workers
      const allMerged = results
        .filter(Boolean) // Remove null, undefined, 0, "", false
        .flatMap((r) => r.merged) // Extract merged + flatten one level
        .sort((a, b) => a[0] - b[0]);

      // Final merge across worker boundaries
      const finalMerged = [];
      for (const interval of allMerged) {
        if (finalMerged.length === 0) {
          finalMerged.push([...interval]);
        } else {
          const last = finalMerged[finalMerged.length - 1];
          if (interval[0] <= last[1]) {
            last[1] = Math.max(last[1], interval[1]);
          } else {
            finalMerged.push([...interval]);
          }
        }
      }

      // Compute total sum
      const totalSum = finalMerged.reduce((s, [low, high]) => s + (high - low), 0);
      setSum(totalSum);

    } catch (err) {
      console.error(err);
      setSum('Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Interval Sum Calculator</h1>
      <p>100,000 intervals → merged in parallel with {NUM_WORKERS} workers</p>

      <button onClick={calculateIntervalSum} disabled={loading}>
        {loading ? 'Calculating...' : 'Calculate Sum'}
      </button>

      {sum !== null && (
        <div className="result">
          <h2>Total Interval Sum: {sum.toLocaleString()}</h2>
        </div>
      )}
    </div>
  );
}

export default App;