(() => {
  'use strict';

  const scenes = [
    { id: 'welcome', label: 'Welcome', track: 'assets/music/welcome.mp3' },
    { id: 'gugu', label: 'Gu Gu Department', track: 'assets/music/gu-gu.mp3' },
    { id: 'report', label: 'Official Report Card', track: 'assets/music/report-card.mp3' },
    { id: 'museum', label: 'Photo Museum', track: 'assets/music/gallery.mp3' },
    { id: 'letter', label: 'Birthday Letter', track: 'assets/music/letter.mp3' },
    { id: 'cake', label: 'Cake Finale', track: 'assets/music/cake-finale.mp3' },
  ];

  const roasts = [
    'Welcome to the Gu Gu Department, jahan baatein kam aur Gu Gu ka production unlimited hai.',
    'Madam ki vocabulary mein Gu Gu ka contribution itna hai ki dictionary bhi resignation dene wali hai.',
    'Bauni.exe has stopped working. Reason: Excessive Gu Gu detected.',
    'National Gu Gu Queen Award goes to… BAUNI! 👑',
    'Agar Gu Gu bolne ke paise milte, toh madam aaj billionaire hoti.',
    'Warning: Bauni ke Gu Gu mode ko band karne ka button abhi tak invent nahi hua.',
  ];

  const roastStickers = [
    'BREAKING NEWS',
    'DICTIONARY ALERT',
    'SYSTEM REPORT',
    'CROWNED',
    'ECONOMICS',
    'SAFETY NOTICE',
  ];
  const roastIcons = ['📣', '📖', '💻', '👑', '💸', '⚠️'];

  const ratings = [
    ['Gu Gu Skills', '1000/10'],
    ['Bakbak', 'Unlimited'],
    ['Random Gyaan', 'Professor Level'],
    ['Confusion', 'Premium Edition'],
    ['Cuteness', 'Classified Information'],
    ['Pagalpan', 'No Competition'],
  ];

  const letterText = `Dear Bauni,

Sabse pehle toh Happy Birthday, Gu Gu ki Brand Ambassador! 🎂🐣

Teri personality ko words mein explain karne ke liye dictionary nahi, poora research paper likhna padega.

Kabhi tu gyaan ki dukaan ban jaati hai, kabhi aisi baatein karti hai ki Google bhi bole, 'Bhai, mujhe ismein mat ghaseeto.' Aur jab tera Gu Gu mode ON hota hai, tab lagta hai duniya ki saari serious problems ek taraf aur madam ki bakbak ek taraf.

Lekin ek baat sach hai—teri ye ajeeb si harkatein, faltu ki baatein aur random pagalpan hi tujhe alag banate hain. Tujhe roast karna alag baat hai, par teri friendship apni jagah special hai.

Bas birthday par itni si wish hai ki tu hamesha khush rahe, tere saare dreams poore hon aur tere dimaag mein kabhi-kabhi sensible thoughts bhi aaya karein. 😂❤️

Aur haan, gift ke badle thank you bolne ki zaroorat nahi… bas apna Gu Gu volume thoda kam kar dena. Mere kaan bhi insaan ke hi hain!

Happy Birthday, Bauni! 🎀❤️`;

  const confettiColors = ['#ed76a1', '#a97ed0', '#ffd86f', '#fff6fa', '#e89cae'];
  const confettiSymbols = ['✦', '♥', '•', '✧'];
  const audio = document.getElementById('scene-audio');
  const musicStatus = document.getElementById('music-status');
  const musicLabel = document.getElementById('music-label');
  const musicIcon = document.getElementById('music-icon');
  const muteIcon = document.getElementById('mute-icon');
  const musicButton = document.getElementById('music-toggle');
  const muteButton = document.getElementById('mute-toggle');

  let activeScene = 'welcome';
  let activePhoto = 0;
  let roastIndex = -1;
  let musicStarted = false;
  let muted = false;
  let currentTrack = '';
  let musicRequest = 0;
  let musicFrame = 0;
  let reportTimer = 0;
  let cakeTimer = 0;
  const missingTracks = new Set();
  const visitedScenes = new Set(['welcome']);
  let previousFocus = null;

  function updateProgress() {
    const index = scenes.findIndex((scene) => scene.id === activeScene);
    const current = index + 1;
    document.getElementById('progress-count').textContent =
      `${String(current).padStart(2, '0')} / 06`;
    document.getElementById('progress-fill').style.width =
      `${(current / scenes.length) * 100}%`;
    document.getElementById('scene-announcement').textContent =
      `Scene ${current} of 6: ${scenes[index].label}`;

    document.querySelectorAll('[data-scene-target]').forEach((button) => {
      const isActive = button.dataset.sceneTarget === activeScene;
      button.classList.toggle('active', isActive);
      button.classList.toggle('complete', visitedScenes.has(button.dataset.sceneTarget) && !isActive);
      if (isActive) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
    });
  }

  function showMissingTrack(track) {
    audio.pause();
    currentTrack = '';
    musicButton.disabled = true;
    musicLabel.textContent = 'Add song';
    musicIcon.textContent = '▶';
    musicButton.setAttribute('aria-label', `Add ${track.split('/').pop()} to play this scene`);
    musicButton.setAttribute('aria-pressed', 'false');
    musicStatus.textContent = `Track not added · ${track.split('/').pop()}`;
  }

  function playTrack(track, fade = true) {
    if (!audio) return;
    const request = ++musicRequest;
    if (musicFrame) {
      cancelAnimationFrame(musicFrame);
      musicFrame = 0;
    }

    const stopForMissingTrack = () => {
      if (request !== musicRequest) return;
      showMissingTrack(track);
    };

    const startTrack = () => {
      if (request !== musicRequest) return;
      if (missingTracks.has(track)) {
        stopForMissingTrack();
        return;
      }
      if (currentTrack !== track) {
        currentTrack = track;
        audio.src = track;
        audio.load();
      }
      audio.volume = 0.82;
      audio.muted = muted;
      audio.play().then(() => {
        if (request !== musicRequest) return;
        musicButton.disabled = false;
        musicLabel.textContent = 'Pause';
        musicIcon.textContent = 'Ⅱ';
        musicButton.setAttribute('aria-label', 'Pause birthday music');
        musicButton.setAttribute('aria-pressed', 'true');
        musicStatus.textContent = `Now playing · ${track.split('/').pop()}`;
      }).catch(() => {
        if (request !== musicRequest) return;
        missingTracks.add(track);
        stopForMissingTrack();
      });
    };

    if (missingTracks.has(track)) {
      if (fade && !audio.paused && audio.volume > 0) {
        const initialVolume = audio.volume;
        const startTime = performance.now();
        const fadeOut = () => {
          if (request !== musicRequest) return;
          const progress = Math.min((performance.now() - startTime) / 260, 1);
          audio.volume = initialVolume * (1 - progress);
          if (progress < 1) musicFrame = requestAnimationFrame(fadeOut);
          else {
            musicFrame = 0;
            stopForMissingTrack();
          }
        };
        musicFrame = requestAnimationFrame(fadeOut);
      } else stopForMissingTrack();
      return;
    }

    if (fade && !audio.paused && audio.volume > 0) {
      const initialVolume = audio.volume;
      const startTime = performance.now();
      const fadeOut = () => {
        if (request !== musicRequest) return;
        const progress = Math.min((performance.now() - startTime) / 260, 1);
        audio.volume = initialVolume * (1 - progress);
        if (progress < 1) musicFrame = requestAnimationFrame(fadeOut);
        else {
          musicFrame = 0;
          audio.pause();
          startTrack();
        }
      };
      musicFrame = requestAnimationFrame(fadeOut);
    } else startTrack();
  }

  function startMusicFromFirstInteraction() {
    if (musicStarted) return;
    musicStarted = true;
    const scene = scenes.find((item) => item.id === activeScene);
    if (scene) playTrack(scene.track, false);
  }

  function goToScene(nextScene) {
    if (!scenes.some((scene) => scene.id === nextScene)) return;
    if (nextScene === activeScene) return;

    document.querySelector(`[data-scene="${activeScene}"]`)?.classList.remove('active');
    document.querySelector(`[data-scene="${activeScene}"]`)?.setAttribute('hidden', '');
    const nextSection = document.querySelector(`[data-scene="${nextScene}"]`);
    nextSection?.removeAttribute('hidden');
    nextSection?.classList.add('active');

    activeScene = nextScene;
    visitedScenes.add(nextScene);
    if (nextScene === 'gugu') resetRoast();
    if (nextScene === 'report') resetReport();
    if (nextScene === 'letter') foldLetter();
    closeLightbox();
    updateProgress();
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (musicStarted) {
      const scene = scenes.find((item) => item.id === nextScene);
      if (scene && scene.track !== currentTrack) playTrack(scene.track, true);
    }
  }

  function resetRoast() {
    roastIndex = -1;
    document.getElementById('roast-count').textContent = '01';
    document.getElementById('roast-copy').textContent = 'A highly confidential roast is waiting…';
    document.getElementById('roast-sticker').textContent = roastStickers[0];
    document.getElementById('roast-icon').textContent = roastIcons[0];
    document.getElementById('next-roast').innerHTML = 'REVEAL THE ROAST <span aria-hidden="true">→</span>';
    document.getElementById('roast-card').classList.remove('revealed');
  }

  function showNextRoast() {
    roastIndex = (roastIndex + 1) % roasts.length;
    document.getElementById('roast-count').textContent =
      String(roastIndex + 1).padStart(2, '0');
    document.getElementById('roast-copy').textContent = roasts[roastIndex];
    document.getElementById('roast-sticker').textContent = roastStickers[roastIndex];
    document.getElementById('roast-icon').textContent = roastIcons[roastIndex];
    const card = document.getElementById('roast-card');
    card.classList.remove('revealed');
    void card.offsetWidth;
    card.classList.add('revealed');
    document.getElementById('next-roast').innerHTML =
      roastIndex === roasts.length - 1
        ? 'START AGAIN, MADAM <span aria-hidden="true">→</span>'
        : 'NEXT ROAST <span aria-hidden="true">→</span>';
  }

  function resetReport() {
    if (reportTimer) window.clearInterval(reportTimer);
    reportTimer = 0;
    document.querySelectorAll('.rating-row').forEach((row) => {
      row.classList.remove('show');
      row.querySelector('strong').textContent = '— — —';
    });
  }

  function revealResults() {
    resetReport();
    let count = 0;
    reportTimer = window.setInterval(() => {
      const row = document.querySelector(`.rating-row[data-rating="${count}"]`);
      if (row) {
        row.querySelector('strong').textContent = ratings[count][1];
        row.classList.add('show');
      }
      count += 1;
      if (count >= ratings.length) {
        window.clearInterval(reportTimer);
        reportTimer = 0;
      }
    }, 420);
  }

  function openLightbox(index) {
    const cards = [...document.querySelectorAll('.photo-card')];
    if (index < 0 || index >= cards.length) return;
    previousFocus = document.activeElement;
    activePhoto = index;
    document.getElementById('lightbox').hidden = false;
    document.body.style.overflow = 'hidden';
    renderLightbox();
    document.querySelector('.lightbox-close').focus();
  }

  function renderLightbox() {
    const card = document.querySelectorAll('.photo-card')[activePhoto];
    const originalImage = card.querySelector('img');
    const image = document.getElementById('lightbox-image');
    const placeholder = document.getElementById('lightbox-placeholder');
    const title = card.querySelector('h2').textContent;
    const caption = card.querySelector('p').textContent;

    document.getElementById('lightbox-title').textContent = title;
    document.getElementById('lightbox-caption').textContent = caption;
    document.getElementById('lightbox-count').textContent = `PHOTO ${activePhoto + 1} OF 4`;
    image.alt = `Bauni photo ${activePhoto + 1}`;
    image.hidden = false;
    placeholder.hidden = true;

    image.onload = () => {
      if (activePhoto === Number(card.dataset.photoIndex)) {
        image.hidden = false;
        placeholder.hidden = true;
      }
    };
    image.onerror = () => {
      image.hidden = true;
      placeholder.textContent = `PHOTO ${activePhoto + 1} · ADD bauni-${activePhoto + 1}.jpg`;
      placeholder.hidden = false;
    };
    image.src = originalImage.src;
  }

  function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox || lightbox.hidden) return;
    lightbox.hidden = true;
    document.body.style.overflow = '';
    if (previousFocus && typeof previousFocus.focus === 'function') previousFocus.focus();
    previousFocus = null;
  }

  function moveLightbox(direction) {
    activePhoto = (activePhoto + direction + 4) % 4;
    renderLightbox();
  }

  function openLetter() {
    document.getElementById('open-letter').hidden = true;
    document.getElementById('letter-paper').hidden = false;
    document.getElementById('fold-letter').hidden = false;
    document.getElementById('letter-copy').textContent = letterText;
    document.getElementById('fold-letter').focus();
  }

  function foldLetter() {
    const envelope = document.getElementById('open-letter');
    const paper = document.getElementById('letter-paper');
    const foldButton = document.getElementById('fold-letter');
    if (!envelope || !paper || !foldButton) return;
    envelope.hidden = false;
    paper.hidden = true;
    foldButton.hidden = true;
  }

  function createConfetti() {
    const holder = document.getElementById('cut-confetti');
    holder.replaceChildren();
    for (let i = 0; i < 52; i += 1) {
      const piece = document.createElement('span');
      piece.className = 'confetti-piece';
      piece.textContent = confettiSymbols[i % confettiSymbols.length];
      piece.style.setProperty('--x', `${(i * 37) % 100}%`);
      piece.style.setProperty('--c', confettiColors[i % confettiColors.length]);
      piece.style.setProperty('--s', `${10 + (i % 5) * 3}px`);
      piece.style.setProperty('--d', `${2.2 + (i % 7) * .22}s`);
      piece.style.setProperty('--delay', `${(i % 10) * .07}s`);
      holder.appendChild(piece);
    }
  }

  function cutCake() {
    const button = document.getElementById('cut-cake');
    if (button.disabled || !document.getElementById('celebration').hidden) return;
    button.disabled = true;
    button.textContent = 'ONE VERY IMPORTANT CUT…';
    document.getElementById('cake-stage').classList.add('cutting');
    cakeTimer = window.setTimeout(() => {
      document.getElementById('cake-art').classList.add('cut');
      document.querySelectorAll('.candle').forEach((candle) => candle.classList.add('out'));
      document.getElementById('cake-intro').hidden = true;
      button.hidden = true;
      document.getElementById('celebration').hidden = false;
      createConfetti();
      cakeTimer = 0;
    }, 1050);
  }

  function replayCakeCut() {
    if (cakeTimer) window.clearTimeout(cakeTimer);
    cakeTimer = 0;
    document.getElementById('cake-stage').classList.remove('cutting');
    document.getElementById('cake-art').classList.remove('cut');
    document.querySelectorAll('.candle').forEach((candle) => candle.classList.remove('out'));
    document.getElementById('cake-intro').hidden = false;
    document.getElementById('cut-cake').hidden = false;
    document.getElementById('cut-cake').disabled = false;
    document.getElementById('cut-cake').textContent = 'KAAT DE CAKEEE 🔪🎂';
    document.getElementById('celebration').hidden = true;
    document.getElementById('slice-reply').hidden = true;
    document.getElementById('cut-confetti').replaceChildren();
  }

  function toggleMusic() {
    if (!audio) return;
    if (!audio.paused) {
      musicRequest += 1;
      if (musicFrame) cancelAnimationFrame(musicFrame);
      musicFrame = 0;
      audio.pause();
      musicLabel.textContent = 'Music';
      musicIcon.textContent = '▶';
      musicButton.setAttribute('aria-label', 'Play birthday music');
      musicButton.setAttribute('aria-pressed', 'false');
      musicStatus.textContent = 'Music paused';
      return;
    }
    musicStarted = true;
    const scene = scenes.find((item) => item.id === activeScene);
    if (scene) playTrack(scene.track, false);
  }

  document.addEventListener('pointerdown', startMusicFromFirstInteraction, { once: true, capture: true });
  document.addEventListener('keydown', startMusicFromFirstInteraction, { once: true, capture: true });

  document.querySelectorAll('[data-scene-target]').forEach((button) => {
    button.addEventListener('click', () => goToScene(button.dataset.sceneTarget));
  });
  document.querySelectorAll('[data-go-scene]').forEach((button) => {
    button.addEventListener('click', () => goToScene(button.dataset.goScene));
  });
  document.querySelector('[data-reset]').addEventListener('click', () => {
    resetRoast();
    resetReport();
    foldLetter();
    replayCakeCut();
    visitedScenes.clear();
    visitedScenes.add('welcome');
    if (activeScene !== 'welcome') goToScene('welcome');
    else updateProgress();
  });
  document.getElementById('next-roast').addEventListener('click', showNextRoast);
  document.getElementById('reveal-results').addEventListener('click', revealResults);
  document.querySelectorAll('[data-photo-index]').forEach((button) => {
    button.addEventListener('click', () => openLightbox(Number(button.dataset.photoIndex)));
  });
  document.querySelectorAll('.photo-card img').forEach((image) => {
    image.addEventListener('error', () => {
      image.hidden = true;
      image.nextElementSibling.hidden = false;
    });
    image.addEventListener('load', () => {
      image.hidden = false;
      image.nextElementSibling.hidden = true;
    });
  });
  document.getElementById('open-letter').addEventListener('click', openLetter);
  document.getElementById('fold-letter').addEventListener('click', () => {
    foldLetter();
    document.getElementById('open-letter').focus();
  });
  document.getElementById('cut-cake').addEventListener('click', cutCake);
  document.getElementById('request-slice').addEventListener('click', () => {
    document.getElementById('slice-reply').hidden = false;
  });
  document.getElementById('replay-cut').addEventListener('click', replayCakeCut);
  document.getElementById('music-toggle').addEventListener('click', toggleMusic);
  document.getElementById('mute-toggle').addEventListener('click', () => {
    muted = !muted;
    audio.muted = muted;
    muteIcon.textContent = muted ? '×' : '◖))';
    muteButton.setAttribute('aria-label', muted ? 'Unmute music' : 'Mute music');
    muteButton.setAttribute('aria-pressed', String(muted));
  });

  document.querySelector('.lightbox-previous').addEventListener('click', () => moveLightbox(-1));
  document.querySelector('.lightbox-next').addEventListener('click', () => moveLightbox(1));
  document.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
  document.getElementById('lightbox').addEventListener('mousedown', (event) => {
    if (event.target === event.currentTarget) closeLightbox();
  });
  document.addEventListener('keydown', (event) => {
    const lightbox = document.getElementById('lightbox');
    if (lightbox.hidden) return;
    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowLeft') moveLightbox(-1);
    if (event.key === 'ArrowRight') moveLightbox(1);
    if (event.key === 'Tab') {
      const focusable = [...lightbox.querySelectorAll('button:not(:disabled)')];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  audio.addEventListener('play', () => {
    musicButton.disabled = false;
    musicLabel.textContent = 'Pause';
    musicIcon.textContent = 'Ⅱ';
    musicButton.setAttribute('aria-label', 'Pause birthday music');
    musicButton.setAttribute('aria-pressed', 'true');
  });
  audio.addEventListener('pause', () => {
    if (musicButton.disabled) return;
    musicLabel.textContent = 'Music';
    musicIcon.textContent = '▶';
    musicButton.setAttribute('aria-label', 'Play birthday music');
    musicButton.setAttribute('aria-pressed', 'false');
  });
  audio.addEventListener('error', () => {
    const track = currentTrack || scenes.find((item) => item.id === activeScene)?.track;
    if (!track) return;
    missingTracks.add(track);
    showMissingTrack(track);
  });

  updateProgress();
})();
