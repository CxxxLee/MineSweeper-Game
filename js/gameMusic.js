// js/GameMusic.js
(() => {
  const K = {
    src: 'bgm_src',
    time: 'bgm_time',
    playing: 'bgm_playing',
    volume: 'bgm_volume',
    muted: 'bgm_muted',
    consent: 'bgm_consent', // optional: remember if user allowed audio
  };

  const DEFAULT_SRC = 'assets/Dearly_Beloved.mp3';

  let bgm = window.__bgm || new Audio();
  window.__bgm = bgm;

  // restore state
  const savedSrc = localStorage.getItem(K.src) || DEFAULT_SRC;
  const savedTime = parseFloat(localStorage.getItem(K.time) || '0');
  const savedPlaying = localStorage.getItem(K.playing) === 'true';
  const savedVol = localStorage.getItem(K.volume);
  const savedMuted = localStorage.getItem(K.muted) === 'true';
  const hadConsent = localStorage.getItem(K.consent) === 'true';

  bgm.src = savedSrc;
  bgm.loop = true;
  bgm.preload = 'auto';
  bgm.volume = savedVol != null ? Math.max(0, Math.min(1, parseFloat(savedVol))) : 0.5;
  bgm.muted = savedMuted;

  const setStartTime = () => {
    if (!Number.isNaN(savedTime) && savedTime > 0 && (isFinite(bgm.duration) ? savedTime < bgm.duration : true)) {
      try { bgm.currentTime = savedTime; } catch {}
    }
  };
  if (bgm.readyState >= 1) setStartTime();
  else bgm.addEventListener('loadedmetadata', setStartTime, { once: true });

  // Try autoplay on load (may succeed on some browsers / after prior engagement)
  const tryAutoPlay = async () => {
    if (!hadConsent && !savedPlaying) return; // be conservative on first visit
    try { await bgm.play(); } catch {}
  };

  // Start on first user gesture (always works)
  const startOnGesture = async () => {
    try {
      await bgm.play();
      localStorage.setItem(K.consent, 'true');
    } catch {}
    window.removeEventListener('pointerdown', startOnGesture, true);
    window.removeEventListener('keydown', startOnGesture, true);
  };

  document.addEventListener('DOMContentLoaded', tryAutoPlay);
  window.addEventListener('pointerdown', startOnGesture, true);
  window.addEventListener('keydown', startOnGesture, true);

  const persist = () => {
    try {
      localStorage.setItem(K.src, bgm.src);
      localStorage.setItem(K.time, String(bgm.currentTime || 0));
      localStorage.setItem(K.playing, String(!bgm.paused));
      localStorage.setItem(K.volume, String(bgm.volume));
      localStorage.setItem(K.muted, String(bgm.muted));
    } catch {}
  };

  // Save on page transitions / tab hide
  window.addEventListener('pagehide', persist);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') persist();
  });

  // Optional controls for your UI
  window.BGM = {
    play: () => bgm.play(),
    pause: () => bgm.pause(),
    toggle: () => (bgm.paused ? bgm.play() : bgm.pause()),
    mute: (m = true) => { bgm.muted = m; localStorage.setItem(K.muted, String(m)); },
    toggleMute: () => { bgm.muted = !bgm.muted; localStorage.setItem(K.muted, String(bgm.muted)); },
    setVolume: (v) => { bgm.volume = Math.max(0, Math.min(1, v)); localStorage.setItem(K.volume, String(bgm.volume)); },
    setSrc: (src) => { bgm.src = src; localStorage.setItem(K.src, src); /* optional: reset position */ bgm.currentTime = 0; },
  };
})();


document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('muteBtn');
    if (!btn) return;
    btn.addEventListener('click', () => {
        BGM.toggleMute();
        btn.textContent = window.__bgm?.muted ? '🔇' : '🔊';
    });
});