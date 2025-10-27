document.addEventListener('DOMContentLoaded', () => {
  const container = document.body;
  const audio = document.getElementById('ButtonSounds');
  if (!container || !audio) return;

  audio.volume = 0.3;
  audio.muted = false;

  container.addEventListener('click', (e) => {
    const el = e.target.closest('a.btn, button.btn, a.nextbtn, button.nextbtn, a.regBtn, button.regBtn');
    if (!el) return;

    // choose sound from data attribute
    const soundFile = el.dataset.sound;
    if (soundFile) audio.src = `assets/${soundFile}`;

    audio.currentTime = 0;
    const playPromise = audio.play();

    // if it is an A tag, wait for the whole sound to play before navigating to next page
    if (el.tagName === 'A') {
      e.preventDefault();
      const href = el.href;
      const go = () => (window.location.href = href);
      const tid = setTimeout(go, 300);
      audio.addEventListener('ended', () => { clearTimeout(tid); go(); }, { once: true });
      playPromise?.catch(() => { clearTimeout(tid); go(); });
    }
  });
});

// button hovering sounds
const buttons = document.querySelectorAll('.btn.nextbtn, .regBtn');
const sound = document.getElementById('hoverSound');

buttons.forEach(button => {
  button.addEventListener('mouseenter', () => {
    sound.currentTime = 0; // rewind to start so it plays every time
    sound.volume=0.3;
    sound.play();
  });

});


// options click sound

const options = document.querySelectorAll('select');
const sounds = document.getElementById('clickSound');

options.forEach(option =>{
  option.addEventListener('change', () => {
    sounds.currentTime = 0;
    sounds.volume=0.3;
    sounds.play();
  })

});
