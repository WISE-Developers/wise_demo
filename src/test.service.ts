
// iife to start the keepalive process
(function keepProcessRunning() {
    setTimeout(keepProcessRunning, 1 << 30);
  })();