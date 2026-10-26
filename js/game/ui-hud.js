function initHUD() {
    refreshHUD();
    subscribeState(refreshHUD);

    document.querySelectorAll('.speed-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            GameState.speedMultiplier = parseInt(btn.dataset.speed, 10);
            refreshSpeedButtons();
        });
    });

    document.getElementById('hud-pause').addEventListener('click', () => {
        GameState.paused = !GameState.paused;
        refreshSpeedButtons();
    });

    const audioBtn = document.getElementById('hud-audio');
    refreshAudioButton(audioBtn);
    audioBtn.addEventListener('click', () => {
        const on = toggleAudio();
        updateAudioSetting(on);
        refreshAudioButton(audioBtn);
    });

    // Кнопка рестарта
    const restartBtn = document.getElementById('hud-restart');
    if (restartBtn) {
        restartBtn.addEventListener('click', () => location.reload());
    }

    document.getElementById('end-restart').addEventListener('click', () => location.reload());

    refreshSpeedButtons();
}

function refreshAudioButton(btn) {
    const on = isAudioEnabled();
    btn.textContent = on ? '🔊' : '🔇';
    btn.classList.toggle('muted', !on);
}

function refreshSpeedButtons() {
    document.querySelectorAll('.speed-btn').forEach(btn => {
        btn.classList.toggle('active', GameState.speedMultiplier === parseInt(btn.dataset.speed, 10));
    });
    const p = document.getElementById('hud-pause');
    p.classList.toggle('active', GameState.paused);
    p.textContent = GameState.paused ? '▶' : '⏸';
}

function refreshHUD() {
    const hpEl = document.getElementById('hud-hp');
    hpEl.querySelector('.hud-val').textContent = GameState.hp;
    hpEl.querySelector('.hud-max').textContent = GameState.maxHp;
    hpEl.classList.toggle('hud-danger', GameState.hp <= 5);

    document.querySelector('#hud-coins .hud-val').textContent = GameState.coins;
    document.querySelector('#hud-wave .hud-val').textContent = GameState.wave;
    document.querySelector('#hud-wave .hud-max').textContent = GameState.totalWaves;

    const timerVal = document.querySelector('#hud-timer .hud-val');
    if (GameState.phase === 'prep') {
        timerVal.textContent = Math.ceil(Math.max(0, GameState.prepTimer)) + 'с';
    } else if (GameState.phase === 'wave') {
        timerVal.textContent = 'Бой';
    } else {
        timerVal.textContent = '—';
    }

    refreshEndOverlay();
}

function refreshEndOverlay() {
    const overlay = document.getElementById('end-overlay');
    if (GameState.phase !== 'win' && GameState.phase !== 'lose') {
        overlay.classList.add('hidden');
        return;
    }
    overlay.classList.remove('hidden');

    const title = document.getElementById('end-title');
    const stars = document.getElementById('end-stars');
    const info = document.getElementById('end-info');

    if (GameState.phase === 'win') {
        title.textContent = 'Победа!';
        title.style.color = 'var(--success)';
        let s = '★☆☆';
        if (GameState.hp >= 20) s = '★★★';
        else if (GameState.hp >= 10) s = '★★☆';
        stars.textContent = s;
        info.textContent = `Все ${GameState.totalWaves} волн пройдены. HP базы: ${GameState.hp}`;
    } else {
        title.textContent = 'Поражение';
        title.style.color = 'var(--danger)';
        stars.textContent = '☆☆☆';
        info.textContent = `Пали на волне ${GameState.wave} из ${GameState.totalWaves}.`;
    }
}