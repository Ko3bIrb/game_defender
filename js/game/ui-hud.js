// ui-hud.js — кешируем DOM-ссылки и не дёргаем layout каждый кадр

const _hudEls = {};
const _hudCache = {
    hp: null, coins: null, wave: null, totalWaves: null,
    hpDanger: null, phase: null
};
let _exitPrevPaused = false;

function _cacheHudEls() {
    _hudEls.hpEl       = document.getElementById('base-health');
    _hudEls.hpVal      = _hudEls.hpEl.querySelector('.base-health-value');
    _hudEls.coinsVal   = document.querySelector('#hud-coins .hud-val');
    _hudEls.waveVal    = document.querySelector('#hud-wave .hud-val');
    _hudEls.waveMax    = document.querySelector('#hud-wave .hud-max');
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
    updateBaseHealthPosition();
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

    const settings = document.getElementById('hud-settings');
    settings.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => { settings.open = false; });
    });
    document.addEventListener('pointerdown', event => {
        if (!settings.contains(event.target)) settings.open = false;
    });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') settings.open = false;
    });

    refreshSpeedButtons();
}

function hudIconMarkup(name) {
    return `<svg class="ui-icon" aria-hidden="true"><use href="#icon-${name}"></use></svg>`;
}

// The camera is fixed during play; reproject only after camera/layout changes.
const _baseHealthAnchor = new THREE.Vector3();
function updateBaseHealthPosition() {
    if (!_hudEls.hpEl || !currentMap || !camera || !renderer) return;
    _baseHealthAnchor.copy(currentMap.waypoints[currentMap.waypoints.length - 1]);
    _baseHealthAnchor.y += 18;
    camera.updateMatrixWorld();
    _baseHealthAnchor.project(camera);
    const bounds = renderer.domElement.getBoundingClientRect();
    const x = bounds.left + (_baseHealthAnchor.x + 1) * bounds.width / 2;
    const y = bounds.top + (1 - _baseHealthAnchor.y) * bounds.height / 2;
    _hudEls.hpEl.style.left = `${x}px`;
    _hudEls.hpEl.style.top = `${y}px`;
    _hudEls.hpEl.style.visibility = Math.abs(_baseHealthAnchor.x) <= 1 &&
        Math.abs(_baseHealthAnchor.y) <= 1 && Math.abs(_baseHealthAnchor.z) <= 1 ? 'visible' : 'hidden';
}

function refreshAudioButton(btn) {
    const on = isAudioEnabled();
    btn.innerHTML = hudIconMarkup(on ? 'volume' : 'muted');
    btn.setAttribute('aria-label', on ? 'Выключить звук' : 'Включить звук');
    btn.setAttribute('aria-pressed', String(!on));
    btn.classList.toggle('muted', !on);
}

function refreshSpeedButtons() {
    _hudEls.speedBtns.forEach(btn => {
        const active = GameState.speedMultiplier === parseInt(btn.dataset.speed, 10);
        btn.classList.toggle('active', active);
        btn.setAttribute('aria-pressed', String(active));
    });
    const p = _hudEls.pauseBtn;
    p.classList.toggle('active', GameState.paused);
    p.innerHTML = hudIconMarkup(GameState.paused ? 'play' : 'pause');
    p.setAttribute('aria-label', GameState.paused ? 'Продолжить игру' : 'Приостановить игру');
    p.setAttribute('aria-pressed', String(GameState.paused));
    p.title = `${GameState.paused ? 'Продолжить' : 'Пауза'} · Пробел`;
}

// Вызывается каждый кадр из animate() — DOM пишется только при реальном изменении.
function refreshHUD() {
    if (_hudCache.hp !== GameState.hp) {
        _hudCache.hp = GameState.hp;
        _hudEls.hpVal.textContent = GameState.hp;
        _hudEls.hpEl.setAttribute('aria-label', `Здоровье базы: ${GameState.hp}`);
    }
    const danger = GameState.hp <= GameState.maxHp * 0.25;
    if (_hudCache.hpDanger !== danger) {
        _hudCache.hpDanger = danger;
        _hudEls.hpEl.classList.toggle('base-danger', danger);
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