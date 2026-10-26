// audio.js — процедурные звуки через Web Audio API (без файлов)

let _audioCtx = null;
let _audioEnabled = true;

function initAudio() {
    const unlock = () => {
        if (!_audioCtx) {
            try {
                _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            } catch(e) { /* нет Web Audio — не страшно */ }
        }
        if (_audioCtx && _audioCtx.state === 'suspended') _audioCtx.resume();
        document.removeEventListener('click', unlock);
        document.removeEventListener('keydown', unlock);
    };
    document.addEventListener('click', unlock);
    document.addEventListener('keydown', unlock);
}

function _playTone({freq, duration, type='sine', volume=0.15, slideTo=null, delay=0}) {
    if (!_audioEnabled || !_audioCtx) return;
    try {
        const ctx = _audioCtx;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        const t0 = ctx.currentTime + delay;
        osc.frequency.setValueAtTime(freq, t0);
        if (slideTo != null) {
            osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t0 + duration);
        }
        gain.gain.setValueAtTime(volume, t0);
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t0);
        osc.stop(t0 + duration + 0.03);
    } catch(e) {}
}

const SFX = {
    shoot: () => _playTone({freq: 880, duration: 0.06, type:'square', volume:0.045, slideTo: 440}),
    hit:   () => _playTone({freq: 300, duration: 0.05, type:'triangle', volume:0.05}),
    death: () => _playTone({freq: 250, duration: 0.18, type:'sawtooth', volume:0.07, slideTo: 90}),
    coin:  () => {
        _playTone({freq: 1000, duration: 0.07, type:'sine', volume:0.09});
        _playTone({freq: 1400, duration: 0.08, type:'sine', volume:0.07, delay: 0.05});
    },
    build: () => {
        _playTone({freq: 440, duration: 0.1, type:'square', volume:0.09});
        _playTone({freq: 660, duration: 0.12, type:'square', volume:0.07, delay: 0.08});
    },
    upgrade: () => {
        _playTone({freq: 523, duration: 0.1, type:'triangle', volume:0.1});
        _playTone({freq: 784, duration: 0.1, type:'triangle', volume:0.1, delay: 0.07});
        _playTone({freq: 1046, duration: 0.16, type:'triangle', volume:0.1, delay: 0.14});
    },
    sell: () => _playTone({freq: 660, duration: 0.12, type:'sine', volume:0.09, slideTo: 330}),
    error: () => _playTone({freq: 200, duration: 0.15, type:'square', volume:0.09}),
    baseDamage: () => _playTone({freq: 120, duration: 0.32, type:'sawtooth', volume:0.16, slideTo: 55}),
    waveStart: () => {
        _playTone({freq: 220, duration: 0.22, type:'sawtooth', volume:0.1});
        _playTone({freq: 330, duration: 0.22, type:'sawtooth', volume:0.1, delay: 0.16});
        _playTone({freq: 440, duration: 0.3, type:'sawtooth', volume:0.11, delay: 0.32});
    },
    waveEnd: () => {
        _playTone({freq: 660, duration: 0.2, type:'sine', volume:0.1});
        _playTone({freq: 880, duration: 0.25, type:'sine', volume:0.1, delay: 0.15});
    },
    win: () => {
        [523, 659, 784, 1046].forEach((f, i) =>
            _playTone({freq: f, duration: 0.32, type:'triangle', volume:0.11, delay: i*0.13}));
    },
    lose: () => {
        [440, 330, 220].forEach((f, i) =>
            _playTone({freq: f, duration: 0.38, type:'sawtooth', volume:0.11, delay: i*0.2}));
    }
};

// Троттлинг частых звуков (выстрелы, монеты)
let _lastShoot = 0, _lastCoin = 0, _lastHit = 0;
function playShoot() {
    const n = performance.now();
    if (n - _lastShoot < 70) return;
    _lastShoot = n; SFX.shoot();
}
function playCoin() {
    const n = performance.now();
    if (n - _lastCoin < 90) return;
    _lastCoin = n; SFX.coin();
}
function playHit() {
    const n = performance.now();
    if (n - _lastHit < 90) return;
    _lastHit = n; SFX.hit();
}

function setAudioEnabled(on) { _audioEnabled = on; }
function isAudioEnabled() { return _audioEnabled; }
function toggleAudio() { _audioEnabled = !_audioEnabled; return _audioEnabled; }