// ui-hud.js — кешируем DOM-ссылки и не дёргаем layout каждый кадр

const _hudEls = {};
const _hudCache = {
    hp: null, maxHp: null, coins: null, wave: null, totalWaves: null,
    timer: null, hpDanger: null, phase: null
};
let _exitPrevPaused = false;

function _cacheHudEls() {
    _hudEls.hpEl       = document.getElementById('hud-hp');
    _hudEls.hpVal      = _hudEls.hpEl.querySelector('.hud-val');
    _hudEls.hpMax      = _hudEls.hpEl.querySelector('.hud-max');
    _hudEls.coinsVal   = document.querySelector('#hud-coins .hud-val');
    _hudEls.waveVal    = document.querySelector('#hud-wave .hud-val');
    _hudEls.waveMax    = document.querySelector('#hud-wave .hud-max');
    _hudEls.timerVal   = document.querySelector('#hud-timer .hud-val');
    _hudEls.endOverlay = document.getElementById('end-overlay');
    _hudEls.endTitle   = document.getElementById('end-title');
    _hudEls.endStars   = document.getElementById('end-stars');
    _hudEls.endInfo    = document.getElementById('end-info');
    _hudEls.pauseBtn   = document.getElementById('hud-pause');
    _hudEls.audioBtn   = document.getElementById('hud-audio');
    _hudEls.menuBtn    = document.getElementById('hud-menu');
    _hudEls.speedBtns  = document.querySelectorAll('.speed-btn');
    // ─── Модалка выхода ───
    _hudEls.exitModal  = document.getElementById('exit-modal');
    _hudEls.exitCancel = document.getElementById('exit-cancel');
    _hudEls.exitConfirm= document.getElementById('exit-confirm');
}

function _openExitModal() {
    if (!_hudEls.exitModal) return;
    _exitPrevPaused = GameState.paused;
    GameState.paused = true;
    refreshSpeedButtons();
    _hudEls.exitModal.classList.remove('hidden');
}

function _closeExitModal(restorePause) {
    if (!_hudEls.exitModal) return;
    _hudEls.exitModal.classList.add('hidden');
    if (restorePause) {
        GameState.paused = _exitPrevPaused;
        refreshSpeedButtons();
    }
}

function initHUD() {
    _cacheHudEls();
    refreshHUD();
    subscribeState(refreshHUD);

    _hudEls.speedBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            GameState.speedMultiplier = parseInt(btn.dataset.speed, 10);
            refreshSpeedButtons();
        });
    });

    _hudEls.pauseBtn.addEventListener('click', () => {
        GameState.paused = !GameState.paused;
        refreshSpeedButtons();
    });

    refreshAudioButton(_hudEls.audioBtn);
    _hudEls.audioBtn.addEventListener('click', () => {
        const on = toggleAudio();
        updateAudioSetting(on);
        refreshAudioButton(_hudEls.audioBtn);
    });

    const restartBtn = document.getElementById('hud-restart');
    if (restartBtn) restartBtn.addEventListener('click', () => location.reload());

    // ─── Кнопка «Меню» — выход в index.html ───
    // В активном бою/подготовке — кастомная модалка (адаптирована под мобилку).
    // На победе/поражении — сразу переход без вопросов.
    if (_hudEls.menuBtn) {
        _hudEls.menuBtn.addEventListener('click', () => {
            const hasActiveGame = GameState.phase === 'prep' || GameState.phase === 'wave';
            if (!hasActiveGame) {
                window.location.href = '../../index.html';
                return;
            }
            _openExitModal();
        });
    }

    if (_hudEls.exitCancel) {
        _hudEls.exitCancel.addEventListener('click', () => _closeExitModal(true));
    }

    if (_hudEls.exitConfirm) {
        _hudEls.exitConfirm.addEventListener('click', () => {
            window.location.href = '../../index.html';
        });
    }

    // Клик по фону = «Остаться»
    if (_hudEls.exitModal) {
        _hudEls.exitModal.addEventListener('click', (e) => {
            if (e.target === _hudEls.exitModal) _closeExitModal(true);
        });
    }

    // Esc закрывает модалку выхода (не трогая другие модалки)
    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        if (_hudEls.exitModal && !_hudEls.exitModal.classList.contains('hidden')) {
            e.stopPropagation();
            _closeExitModal(true);
        }
    }, { capture: true });

    document.getElementById('end-restart').addEventListener('click', () => location.reload());

    refreshSpeedButtons();
}

function refreshAudioButton(btn) {
    const on = isAudioEnabled();
    btn.textContent = on ? '🔊' : '🔇';
    btn.classList.toggle('muted', !on);
}

function refreshSpeedButtons() {
    _hudEls.speedBtns.forEach(btn => {
        btn.classList.toggle('active', GameState.speedMultiplier === parseInt(btn.dataset.speed, 10));
    });
    const p = _hudEls.pauseBtn;
    p.classList.toggle('active', GameState.paused);
    p.textContent = GameState.paused ? '▶' : '⏸';
}

// Вызывается каждый кадр из animate() — DOM пишется только при реальном изменении.
function refreshHUD() {
    if (_hudCache.hp !== GameState.hp) {
        _hudCache.hp = GameState.hp;
        _hudEls.hpVal.textContent = GameState.hp;
    }
    if (_hudCache.maxHp !== GameState.maxHp) {
        _hudCache.maxHp = GameState.maxHp;
        _hudEls.hpMax.textContent = GameState.maxHp;
    }
    const danger = GameState.hp <= 5;
    if (_hudCache.hpDanger !== danger) {
        _hudCache.hpDanger = danger;
        _hudEls.hpEl.classList.toggle('hud-danger', danger);
    }
    if (_hudCache.coins !== GameState.coins) {
        _hudCache.coins = GameState.coins;
        _hudEls.coinsVal.textContent = GameState.coins;
    }
    if (_hudCache.wave !== GameState.wave) {
        _hudCache.wave = GameState.wave;
        _hudEls.waveVal.textContent = GameState.wave;
    }
    if (_hudCache.totalWaves !== GameState.totalWaves) {
        _hudCache.totalWaves = GameState.totalWaves;
        _hudEls.waveMax.textContent = GameState.totalWaves;
    }

    let timerText;
    if (GameState.phase === 'prep')      timerText = Math.ceil(Math.max(0, GameState.prepTimer)) + 'с';
    else if (GameState.phase === 'wave') timerText = 'Бой';
    else                                 timerText = '—';
    if (_hudCache.timer !== timerText) {
        _hudCache.timer = timerText;
        _hudEls.timerVal.textContent = timerText;
    }

    if (_hudCache.phase !== GameState.phase) {
        _hudCache.phase = GameState.phase;
        refreshEndOverlay();
    }
}

function refreshEndOverlay() {
    const overlay = _hudEls.endOverlay;
    if (GameState.phase !== 'win' && GameState.phase !== 'lose') {
        overlay.classList.add('hidden');
        return;
    }
    overlay.classList.remove('hidden');

    const title = _hudEls.endTitle;
    const stars = _hudEls.endStars;
    const info  = _hudEls.endInfo;

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