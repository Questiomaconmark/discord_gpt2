function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function randomDelay(minMs, maxMs) {
  return Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
}

async function fetchWithRetry(fn, retries = 3, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (err.status === 429 && i < retries - 1) {
        console.warn(`Rate limited. Retrying in ${delay / 1000}s...`);
        await sleep(delay);
        delay *= 2;
      } else {
        throw err;
      }
    }
  }
}

module.exports = { sleep, randomDelay, fetchWithRetry };
