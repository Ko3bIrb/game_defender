// audio.js — процедурные звуки и MP3-файлы
// 1. the_monsters_exit.mp3 — при старте волны (тихо)
// 2. the_monster_roar.mp3 — при спавне монстра (редко, тихо)
// 3. scream.mp3 — когда монстр доходит до базы (не чаще 1 раза в 2 сек)
// 4. Выстрел башни — процедурный, мягкий, тихий
// 5. Смерть моба — такой же звук, как выстрел, но чуть громче

let _audioCtx = null;
let _audioEnabled = true;

const _files = {
    roar: '../../audio/the_monster_roar.mp3',
    exit: '../../audio/the_monsters_exit.mp3',
    scream: '../../audio/scream.mp3'
};

// ═══════════════════════════════════════════
// ИНИЦИАЛИЗАЦИЯ
// ═══════════════════════════════════════════
function initAudio() {
    const unlock = () => {
        if (!_audioCtx) {
            try {
                _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {}
        }
        if (_audioCtx && _audioCtx.state === 'suspended') _audioCtx.resume();
        document.removeEventListener('click', unlock);
        document.removeEventListener('keydown', unlock);
    };
    document.addEventListener('click', unlock);
    document.addEventListener('keydown', unlock);
}

// ═══════════════════════════════════════════
// ВОСПРОИЗВЕДЕНИЕ MP3 (через HTML5 Audio)
// ═══════════════════════════════════════════
function _playFile(key, volume = 0.5, rate = 1.0) {
    if (!_audioEnabled) return;
    try {
        const sound = new Audio(_files[key]);
        sound.volume = Math.max(0, Math.min(1, volume));
        sound.playbackRate = rate;
        sound.play().catch(e => console.warn('[audio] Play failed:', e));
    } catch (e) {}
}

// ═══════════════════════════════════════════
// ВЫСТРЕЛ БАШНИ (процедурный)
// ═══════════════════════════════════════════
function _shoot() {
    if (!_audioEnabled || !_audioCtx) return;
    try {
        const ctx = _audioCtx;
        const t0 = ctx.currentTime;
        const baseFreq = 280 + Math.random() * 80;
        
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq, t0);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.65, t0 + 0.055);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, t0);
        gain.gain.linearRampToValueAtTime(0.05, t0 + 0.004);
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.06);

        osc.connect(gain).connect(ctx.destination);
        osc.start(t0);
        osc.stop(t0 + 0.07);
    } catch (e) {}
}

// Троттлинг выстрелов (не чаще 6-7 раз в секунду)
let _lastShoot = 0;
function playShoot() {
    const n = performance.now();
    if (n - _lastShoot < 150) return;
    _lastShoot = n;
    _shoot();
}

// ═══════════════════════════════════════════
// СМЕРТЬ МОБА — Звук выстрела, но чуть громче
// ═══════════════════════════════════════════
let _lastDeath = 0;
function _playDeath() {
    if (!_audioEnabled || !_audioCtx) return;
    
    const n = performance.now();
    // Защита от каши при массовой смерти (не чаще 100 мс)
    if (n - _lastDeath < 100) return;
    _lastDeath = n;

    try {
        const ctx = _audioCtx;
        const t0 = ctx.currentTime;
        const baseFreq = 280 + Math.random() * 80;
        
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq, t0);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.65, t0 + 0.055);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, t0);
        // Увеличиваем громкость до 0.10 (в 2 раза громче выстрела)
        gain.gain.linearRampToValueAtTime(0.10, t0 + 0.004);
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.06);

        osc.connect(gain).connect(ctx.destination);
        osc.start(t0);
        osc.stop(t0 + 0.07);
    } catch (e) {}
}

function playCoin() {}
function playHit() {}

// ═══════════════════════════════════════════
// КРИК У БАЗЫ (scream.mp3)
// ═══════════════════════════════════════════
let _lastScreamTime = 0;
function _playScream() {
    if (!_audioEnabled) return;
    const now = performance.now();
    if (now - _lastScreamTime < 2000) return;
    _lastScreamTime = now;
    
    // Громкость 0.24 (в 2.5 раза тише стандартных 0.6)
    _playFile('scream', 0.24, 1.0);
}

// ═══════════════════════════════════════════
// РЫК МОНСТРА
// ═══════════════════════════════════════════
let _lastGrowlTime = 0;
function _monsterGrowl(size = 1, mode = 'near') {
    const now = performance.now();
    
    if (mode === 'boss') {
        // Боссы ревут всегда
    } else {
        // Обычные и дальние — не чаще 1 раза в 6 секунд
        if (now - _lastGrowlTime < 6000) return;
        _lastGrowlTime = now;
    }

    let vol, rate;
    if (mode === 'boss') {
        vol = 0.42;
        rate = 0.75;
    } else if (mode === 'far') {
        vol = 0.12;
        rate = 0.92;
    } else {
        vol = 0.22 * Math.min(1.3, size);
        rate = 1.0;
    }
    _playFile('roar', vol, rate);
}

// ═══════════════════════════════════════════
// ВЫХОД МОНСТРОВ
// ═══════════════════════════════════════════
function _monstersExit() {
    _playFile('exit', 0.3, 1.0);
}

// ═══════════════════════════════════════════
// SFX API
// ═══════════════════════════════════════════
const SFX = {
    shoot: _shoot,
    monsterGrowl: _monsterGrowl,
    waveStart: _monstersExit,
    death: _playDeath,
    baseDamage: _playScream,

    hit: () => {},
    coin: () => {},
    build: () => {},
    upgrade: () => {},
    sell: () => {},
    error: () => {},
    waveEnd: () => {},
    win: () => {},
    lose: () => {},
    startAmbient: () => {},
    stopAmbient: () => {},

    debug: () => {
        console.log('Audio enabled:', _audioEnabled);
        console.log('AudioContext:', _audioCtx ? _audioCtx.state : 'none');
    },
    testRoar: () => _monsterGrowl(1.5, 'boss'),
    testExit: () => _monstersExit(),
    testDeath: () => _playDeath(),
    testScream: () => _playScream()
};

// ═══════════════════════════════════════════
// УПРАВЛЕНИЕ ЗВУКОМ
// ═══════════════════════════════════════════
function setAudioEnabled(on) { _audioEnabled = on; }
function isAudioEnabled() { return _audioEnabled; }
function toggleAudio() { setAudioEnabled(!_audioEnabled); return _audioEnabled; }