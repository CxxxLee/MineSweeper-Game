(function () {
  const vid = document.getElementById('bgVideo');
  if (!vid) return;

  const keyBase = 'resume_video_';
  const resumeId = vid.dataset.resumeId || 'default';
  const key = keyBase + resumeId;

  // Try to resume after metadata is loaded (so duration is known)
  const saved = JSON.parse(localStorage.getItem(key) || '{}'); // {src,time,muted}
  const setStart = () => {
    try {
      if (saved.src && saved.src === currentSrc() && Number.isFinite(saved.time)) {
        // Clamp to duration just in case
        const target = Math.min(saved.time, (vid.duration || saved.time));
        vid.currentTime = Math.max(0, target - 0.1); // nudge back a hair
      }
    } catch {}
  };

  const currentSrc = () =>
    (vid.currentSrc || (vid.querySelector('source')?.src) || vid.src || '').toString();

  if (vid.readyState >= 1) setStart();
  else vid.addEventListener('loadedmetadata', setStart, { once: true });

  // Persist occasionally while playing (throttled)
  let lastSave = 0;
  const save = () => {
    const now = performance.now();
    if (now - lastSave < 500) return; // save at most twice per second
    lastSave = now;
    try {
      localStorage.setItem(key, JSON.stringify({
        src: currentSrc(),
        time: vid.currentTime || 0,
        muted: vid.muted
      }));
    } catch {}
  };
  vid.addEventListener('timeupdate', save);
  vid.addEventListener('volumechange', save);

  // Ensure we save on page transitions / tab hide
  const saveNow = () => save();
  window.addEventListener('pagehide', saveNow);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') saveNow();
  });

  // Try to autoplay (muted should pass policies)
  const tryPlay = () => vid.play().catch(() => {});
  if (vid.autoplay) tryPlay();
})();
