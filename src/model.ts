
// iife to start the service

(function keepProcessRunning() {
    setTimeout(keepProcessRunning, 1 << 30);
  })();