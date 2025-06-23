(function() {
  // Cria o botão se não existir
  if (!document.getElementById('music-btn')) {
    const btn = document.createElement('button');
    btn.id = 'music-btn';
    btn.textContent = '🎵 Música: ON';
    btn.style.position = 'fixed';
    btn.style.top = '24px';
    btn.style.right = '24px';
    btn.style.zIndex = '1000';
    btn.style.background = '#222';
    btn.style.color = '#ffcc00';
    btn.style.border = '2px solid #ffcc00';
    btn.style.borderRadius = '8px';
    btn.style.fontFamily = "'Press Start 2P', cursive";
    btn.style.fontSize = '1rem';
    btn.style.padding = '0.5rem 1.5rem';
    btn.style.cursor = 'pointer';
    btn.style.transition = 'background 0.2s, color 0.2s';
    document.body.appendChild(btn);
  }

  // Música global compartilhada entre páginas
  let bgm;
  let musicPlaying = false;

  if (!window._globalBGM) {
    window._globalBGM = new Audio('Music.mp3');
    window._globalBGM.loop = true;
    window._globalBGM.volume = 0.5;
  }
  bgm = window._globalBGM;

  // Estado salvo
  const btn = document.getElementById('music-btn');
  if (localStorage.getItem('musicPlaying') === 'true') {
    bgm.play();
    musicPlaying = true;
    btn.textContent = "🎵 ON";
  } else {
    musicPlaying = false;
    btn.textContent = "🎵 OFF";
  }

  btn.addEventListener('click', () => {
    if (musicPlaying) {
      bgm.pause();
      btn.textContent = "🎵 OFF";
      musicPlaying = false;
      localStorage.setItem('musicPlaying', 'false');
    } else {
      bgm.play();
      btn.textContent = "🎵 ON";
      musicPlaying = true;
      localStorage.setItem('musicPlaying', 'true');
    }
  });
})();