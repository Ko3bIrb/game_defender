const GameState = {
    hp: 20, maxHp: 20, coins: 200,
    wave: 0, totalWaves: 20, phase: 'prep',
    prepDuration: 10, prepTimer: 10,
    speedMultiplier: 1, paused: false,
    gameTime: 0, waveStartTime: 0, waveLeaked: 0,
    kills: 0, totalKills: 0
};

let _runRecorded = false;

function addCoins(n)   { GameState.coins += n; onStateChanged(); }
function spendCoins(n) {
    if (GameState.coins >= n) { GameState.coins -= n; onStateChanged(); return true; }
    return false;
}
function damageBase(n) {
    GameState.hp = Math.max(0, GameState.hp - n);
    SFX.baseDamage();
    if (GameState.hp <= 0 && GameState.phase !== 'lose') {
        GameState.phase = 'lose';
        _finishRun(false);
    }
    onStateChanged();
}

function _finishRun(win) {
    if (_runRecorded) return;
    _runRecorded = true;
    if (currentMap) recordRunResult(currentMap.id, GameState.wave, GameState.hp, GameState.kills);
    if (win) SFX.win(); else SFX.lose();
}

const _stateListeners = [];
function onStateChanged() { for (const fn of _stateListeners) fn(); }
function subscribeState(fn) { _stateListeners.push(fn); }