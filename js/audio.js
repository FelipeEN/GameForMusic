'use strict';

document.addEventListener('DOMContentLoaded', () => {
  // Coloque o arquivo de áudio na pasta assets/ e informe o caminho abaixo:
  // Exemplo: const AUTHORIZED_AUDIO_URL = 'assets/musica.mp3';
  const AUTHORIZED_AUDIO_URL = './assets/msc.wav';

  const audio = document.getElementById('soundtrack');
  const soundButton = document.getElementById('sound-button');
  const playLabel = document.querySelector('[data-template-id="sound-play-label"]');
  const pauseLabel = document.querySelector('[data-template-id="sound-pause-label"]');
  const feedback = document.getElementById('sound-feedback');

  const setAudioStatus = text => {
    feedback.textContent = text;
    feedback.hidden = !text;
  };

  function syncAudioUI() {
    const playing = !audio.paused;
    playLabel.hidden = playing;
    pauseLabel.hidden = !playing;
    soundButton.setAttribute('aria-pressed', String(playing));
  }

  if (AUTHORIZED_AUDIO_URL.trim()) {
    audio.src = AUTHORIZED_AUDIO_URL.trim();
  }

  soundButton.addEventListener('click', async () => {
    if (!AUTHORIZED_AUDIO_URL.trim()) {
      setAudioStatus('Adicione uma faixa autorizada em assets/musica.mp3 para tocar.');
      return;
    }

    if (!audio.paused) {
      audio.pause();
      setAudioStatus('');
      return;
    }

    try {
      await audio.play();
      setAudioStatus('');
    } catch (e) {
      setAudioStatus('Coloque o arquivo "musica.mp3" dentro da pasta "assets/" para ouvir a trilha.');
    }
  });

  syncAudioUI();
  audio.addEventListener('play', syncAudioUI);
  audio.addEventListener('pause', syncAudioUI);
  audio.addEventListener('error', () => {
    setAudioStatus('Arquivo de áudio não encontrado em "assets/musica.mp3".');
    syncAudioUI();
  });
});
