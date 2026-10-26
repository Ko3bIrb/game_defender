// save.js — сохранение прогресса и настроек

const SAVE_KEY = 'defender_progress';

function defaultProgress() {
    return {
        unlockedMaps: ['corridor'],
        bestWaves: {},
        stars: {},
        totalKills: 0,
        totalWavesSurvived: 0,
        unlockedTowers: ['gun', 'sniper', 'mortar', 'slow'],
        audioEnabled: true
    };
}

function loadProgress() {
    try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (!raw) return defaultProgress();
        const parsed = JSON.parse(raw);
        return Object.assign(defaultProgress(), parsed);
    } catch(e) {
        return defaultProgress();
    }
}

function saveProgress(p) {
    try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(p));
    } catch(e) { /* quota — не страшно */ }
}

// Запись результата забега. Вызывается один раз при win/lose.
function recordRunResult(mapId, wave, hp, kills) {
    const p = loadProgress();
    if (!p.bestWaves[mapId] || wave > p.bestWaves[mapId]) {
        p.bestWaves[mapId] = wave;
    }
    const map = MAPS[mapId];
    if (map && wave >= map.totalWaves && hp > 0) {
        let stars = 1;
        if (hp >= 20) stars = 3;
        else if (hp >= 10) stars = 2;
        if (!p.stars[mapId] || stars > p.stars[mapId]) p.stars[mapId] = stars;
    }
    p.totalKills = (p.totalKills || 0) + kills;
    p.totalWavesSurvived = (p.totalWavesSurvived || 0) + wave;
    saveProgress(p);
    return p;
}

function updateAudioSetting(on) {
    const p = loadProgress();
    p.audioEnabled = on;
    saveProgress(p);
}