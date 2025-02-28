// Show modal on load and preload colors
window.onload = () => {
    document.getElementById("notificationModal").style.display = "flex";
    preloadCardColors();
    playAudio(currentIndex); // Автоматически воспроизводить первую песню
  };
  
  function closeModal() {
    document.getElementById("notificationModal").style.display = "none";
  }
  
  document.getElementById("notificationModal").addEventListener("click", (e) => {
    if (e.target === e.currentTarget) closeModal();
  });
  
  /* SLIDER & PLAYER LOGIC */
  const items = document.querySelectorAll('input[name="slider"]');
  const songInfos = document.querySelectorAll(".song-info");
  const prevButton = document.getElementById("prev");
  const nextButton = document.getElementById("next");
  const pauseButton = document.getElementById("pause");
  const progressEls = document.querySelectorAll(".progress");
  const progressBars = document.querySelectorAll(".progress-bar");
  let currentIndex = 0;
  let progressInterval;
  let isPaused = false;
  
  // Audio elements
  const audioElements = [
    document.getElementById("audio-1"),
    document.getElementById("audio-2"),
    document.getElementById("audio-3"),
    document.getElementById("audio-4"),
    document.getElementById("audio-5"),
  ];
  
  // Helper: format seconds to mm:ss
  function formatTime(seconds) {
    let m = Math.floor(seconds / 60);
    let s = Math.floor(seconds % 60);
    return m + ":" + (s < 10 ? "0" + s : s);
  }
  
  // Update time-indicator: left shows elapsed, right shows remaining
  function updateTimeIndicator(index, elapsed, duration) {
    const indicator = songInfos[index].querySelector(".time-indicator");
    const elapsedSpan = indicator.querySelector(".elapsed");
    const remainingSpan = indicator.querySelector(".remaining");
  
    elapsedSpan.innerText = formatTime(elapsed);
    remainingSpan.innerText = formatTime(duration - elapsed);
  }
  
  // Update progress bar based on audio current time
  function updateProgressBar(index) {
    const audio = audioElements[index];
    const progressEl = progressEls[index];
    const duration = audio.duration;
    const currentTime = audio.currentTime;
  
    if (duration > 0) {
      const progressPercent = (currentTime / duration) * 100;
      progressEl.style.width = progressPercent + "%";
      updateTimeIndicator(index, currentTime, duration);
    }
  }
  
  // Start progress bar and audio
  function startProgressBar(index) {
    const audio = audioElements[index];
    const progressEl = progressEls[index];
  
    // Update progress bar on timeupdate
    audio.addEventListener("timeupdate", () => {
      updateProgressBar(index);
    });
  
    // Play audio
    audio.play();
  }
  
  function resetProgressBar(el) {
    el.style.width = "0%";
  }
  
  function playAudio(index) {
    audioElements.forEach((audio, i) => {
      if (i === index) {
        audio.play();
      } else {
        audio.pause();
        audio.currentTime = 0; // Reset playback time
      }
    });
  }
  
  function pauseAudio(index) {
    audioElements[index].pause();
  }
  
  function updateActiveSong(index) {
    items.forEach((item, i) => {
      if (i === index) {
        item.checked = true;
        songInfos[i].classList.add("active");
        startProgressBar(i); // Start progress bar and audio
      } else {
        songInfos[i].classList.remove("active");
        resetProgressBar(progressEls[i]);
        pauseAudio(i); // Stop audio
      }
    });
  
    // Apply theme based on the currently selected card
    const card = document.getElementById(`song-${index + 1}`);
    if (card) {
      applySoftTheme(card);
    }
  }
  
  // Перемотка по прогресс-бару
  progressBars.forEach((progressBar, index) => {
    progressBar.addEventListener("click", (e) => {
      const audio = audioElements[index];
      const progressRect = progressBar.getBoundingClientRect();
      const clickPosition = e.clientX - progressRect.left;
      const progressWidth = progressRect.width;
      const seekTime = (clickPosition / progressWidth) * audio.duration;
  
      audio.currentTime = seekTime; // Устанавливаем время воспроизведения
      updateProgressBar(index); // Обновляем прогресс-бар
    });
  });
  
  prevButton.addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + items.length) % items.length;
    isPaused = false;
    pauseButton.textContent = "||";
    updateActiveSong(currentIndex);
  });
  
  nextButton.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % items.length;
    isPaused = false;
    pauseButton.textContent = "||";
    updateActiveSong(currentIndex);
  });
  
  pauseButton.addEventListener("click", () => {
    if (!isPaused) {
      isPaused = true;
      pauseButton.textContent = "►";
      pauseAudio(currentIndex); // Pause audio
    } else {
      isPaused = false;
      pauseButton.textContent = "||";
      playAudio(currentIndex); // Resume audio
    }
  });
  
  // Initialize first song
  updateActiveSong(currentIndex);
  
  /* Favorite Button Toggle */
  document.getElementById("favorite").addEventListener("click", function () {
    this.classList.toggle("favorited");
  });
  
  /* Preload card colors and apply dynamic theme */
  function preloadCardColors() {
    const cards = document.querySelectorAll(".card");
    let cardsLoaded = 0;
  
    cards.forEach((card) => {
      const img = card.querySelector("img");
      if (!img) return;
  
      getAverageColor(img, (ar, ag, ab) => {
        card.dataset.avgR = ar;
        card.dataset.avgG = ag;
        card.dataset.avgB = ab;
  
        const [dr, dg, db] = shiftLightness(ar, ag, ab, -0.25);
        card.dataset.darkR = dr;
        card.dataset.darkG = dg;
        card.dataset.darkB = db;
  
        // Set initial card background & border color
        card.style.backgroundColor = `rgb(${ar}, ${ag}, ${ab})`;
        card.style.borderColor = `rgb(${dr}, ${dg}, ${db})`;
  
        cardsLoaded++;
        if (cardsLoaded === cards.length) {
          updateActiveSong(currentIndex);
          updateModalTheme();
        }
      });
    });
  }
  
  /* Update modal theme to match the Season card (#song-1) */
  function updateModalTheme() {
    const seasonCard = document.getElementById("song-1");
    if (seasonCard) {
      const ar = seasonCard.dataset.avgR || 200;
      const ag = seasonCard.dataset.avgG || 200;
      const ab = seasonCard.dataset.avgB || 200;
      const [lr, lg, lb] = shiftLightness(ar, ag, ab, 0.6);
  
      const modalContent = document.getElementById("modalContent");
      modalContent.style.background = `rgb(${lr}, ${lg}, ${lb})`;
  
      const dr = seasonCard.dataset.darkR || 70;
      const dg = seasonCard.dataset.darkG || 70;
      const db = seasonCard.dataset.darkB || 70;
      modalContent.style.borderColor = `rgb(${dr}, ${dg}, ${db})`;
      modalContent.style.color = `rgb(${dr}, ${dg}, ${db})`;
    }
  }
  
  /* Apply soft theme based on card color */
  function applySoftTheme(card) {
    const ar = parseInt(card.dataset.avgR || 200);
    const ag = parseInt(card.dataset.avgG || 200);
    const ab = parseInt(card.dataset.avgB || 200);
  
    const dr = parseInt(card.dataset.darkR || 70);
    const dg = parseInt(card.dataset.darkG || 70);
    const db = parseInt(card.dataset.darkB || 70);
  
    const container = document.querySelector(".container");
    const body = document.querySelector("body");
  
    // Lighten the card’s average color for background
    const [lr, lg, lb] = shiftLightness(ar, ag, ab, 0.3);
    body.style.background = `linear-gradient(135deg, rgb(${lr},${lg},${lb}) 0%, #ffffff 80%)`;
  
    container.style.borderColor = `rgb(${dr}, ${dg}, ${db})`;
    container.style.color = `rgb(${dr}, ${dg}, ${db})`;
  
    const [cr, cg, cb] = shiftLightness(ar, ag, ab, 0.6);
    container.style.backgroundColor = `rgb(${cr},${cg},${cb})`;
  
    const player = document.querySelector(".player");
    player.style.borderColor = `rgb(${dr}, ${dg}, ${db})`;
    player.style.color = `rgb(${dr}, ${dg}, ${db})`;
  
    const [pr, pg, pb] = shiftLightness(ar, ag, ab, 0.45);
    player.style.backgroundColor = `rgb(${pr}, ${pg}, ${pb})`;
  
    const bars = document.querySelectorAll(".progress-bar");
    bars.forEach((bar) => {
      bar.style.backgroundColor = `rgb(${ar}, ${ag}, ${ab})`;
    });
  
    const fills = document.querySelectorAll(".progress");
    fills.forEach((fill) => {
      fill.style.backgroundColor = `rgb(${dr}, ${dg}, ${db})`;
    });
  
    const leftH1 = document.querySelector(".left-side h1");
    const leftP = document.querySelector(".left-side p");
    leftH1.style.color = `rgb(${dr}, ${dg}, ${db})`;
    leftP.style.color = `rgb(${dr}, ${dg}, ${db})`;
  
    const controls = document.querySelectorAll(".controls button");
    controls.forEach((btn) => {
      btn.style.color = `rgb(${dr}, ${dg}, ${db})`;
    });
  }
  
  /* Helper: shift lightness */
  function shiftLightness(r, g, b, factor) {
    if (factor < -1) factor = -1;
    if (factor > 1) factor = 1;
  
    let { h, s, l } = rgbToHsl(r, g, b);
  
    // Increase or decrease lightness by a percentage of itself
    l = l + factor * l;
    if (l < 0) l = 0;
    if (l > 1) l = 1;
  
    let { rr, gg, bb } = hslToRgb(h, s, l);
    return [Math.round(rr), Math.round(gg), Math.round(bb)];
  }
  
  /* Helper: get average color from image */
  function getAverageColor(img, cb) {
    const c = document.createElement("canvas");
    const ctx = c.getContext("2d");
    const tempImg = new Image();
    tempImg.crossOrigin = "Anonymous";
    tempImg.src = img.src;
  
    tempImg.onload = function () {
      c.width = tempImg.width;
      c.height = tempImg.height;
      ctx.drawImage(tempImg, 0, 0);
      try {
        const data = ctx.getImageData(0, 0, c.width, c.height).data;
        let rSum = 0,
          gSum = 0,
          bSum = 0;
        const totalPixels = data.length / 4;
  
        for (let i = 0; i < data.length; i += 4) {
          rSum += data[i];
          gSum += data[i + 1];
          bSum += data[i + 2];
        }
  
        const rAvg = Math.floor(rSum / totalPixels);
        const gAvg = Math.floor(gSum / totalPixels);
        const bAvg = Math.floor(bSum / totalPixels);
  
        cb(rAvg, gAvg, bAvg);
      } catch {
        // Fallback if crossOrigin/canvas is blocked
        cb(200, 200, 200);
      }
    };
  
    tempImg.onerror = function () {
      cb(200, 200, 200);
    };
  }
  
  /* RGB <-> HSL conversions */
  function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s;
    let l = (max + min) / 2;
  
    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }
  
    return { h, s, l };
  }
  
  function hslToRgb(h, s, l) {
    let r, g, b;
    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      function hue2rgb(p, q, t) {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      }
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }
    return { rr: r * 255, gg: g * 255, bb: b * 255 };
  }