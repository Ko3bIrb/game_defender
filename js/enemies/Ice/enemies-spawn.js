const WAVES_TABLE = [
    { groups: [{type:'ice_skeleton', count:15}] },
    { groups: [{type:'ice_golem', count:5}, {type:'ice_skeleton', count:10}] },
    { groups: [{type:'blizzard_spirit', count:10}] },
    { groups: [{type:'snow_witch', count:2}, {type:'ice_skeleton', count:20}] },
    { groups: [{type:'ice_knight', count:8}] },
    { groups: [{type:'ice_harpy', count:12}, {type:'blizzard_spirit', count:8}] },
    { groups: [{type:'ice_ballista', count:2}, {type:'ice_golem', count:10}] },
    { groups: [{type:'ice_knight', count:12}, {type:'snow_witch', count:3}] },
    { groups: [{type:'ice_harpy', count:20}, {type:'ice_skeleton', count:20}] },
    { groups: [{type:'ice_ballista', count:3}, {type:'ice_knight', count:10}] },
    { groups: [{type:'blizzard_lord', count:1}, {type:'blizzard_spirit', count:15}] },
    { groups: [{type:'ice_ballista', count:4}, {type:'ice_harpy', count:15}] },
    { groups: [{type:'ice_ballista', count:4}, {type:'ice_golem', count:15}, {type:'snow_witch', count:4}] },
    { groups: [{type:'ice_knight', count:20}, {type:'blizzard_spirit', count:20}] },
    { groups: [{type:'ice_harpy', count:30}, {type:'ice_ballista', count:4}] },
    { groups: [{type:'frost_guardian', count:1}, {type:'ice_skeleton', count:30}] },
    { groups: [{type:'ice_ballista', count:6}, {type:'ice_knight', count:20}] },
    { groups: [{type:'blizzard_lord', count:2}, {type:'ice_harpy', count:25}] },
    { groups: [{type:'ice_golem', count:30}, {type:'snow_witch', count:8}, {type:'ice_ballista', count:5}] },
    { groups: [{type:'snow_devourer', count:1}, {type:'ice_knight', count:15}, {type:'blizzard_spirit', count:15}] }
];

const SPAWN_GAP = {
    ice_skeleton: 0.9, ice_golem: 1.8, snow_witch: 2.5, ice_knight: 2.2,
    blizzard_spirit: 1.0, ice_harpy: 1.2, ice_ballista: 3.5,
    blizzard_lord: 5, frost_guardian: 6, snow_devourer: 7
};
const GROUP_EXTRA_GAP = 1.5;

let waveQueue = [];
let waveSpawnIndex = 0;

function generateWaveQueue(n) {
    const wave = WAVES_TABLE[n - 1];
    if (!wave) return [];
    const q = [];
    let t = 0;
    for (const g of wave.groups) {
        const gap = SPAWN_GAP[g.type] || 1.0;
        const hp = getEnemyHp(g.type, n);
        for (let i = 0; i < g.count; i++) {
            q.push({ type: g.type, time: t, hp: hp });
            t += gap;
        }
        t += GROUP_EXTRA_GAP;
    }
    return q;
}

function startWave() {
    if (GameState.phase !== 'prep') return;
    GameState.wave++;
    GameState.phase = 'wave';
    GameState.waveStartTime = GameState.gameTime;
    GameState.waveLeaked = 0;
    waveQueue = generateWaveQueue(GameState.wave);
    waveSpawnIndex = 0;
    SFX.waveStart();
    onStateChanged();
}

function endWave() {
    if (GameState.phase !== 'wave') return;
    const diffMul = (GameState.difficulty && GameState.difficulty.waveBonusMul) || 1;
    const waveGold = Math.round((30 + 5 * GameState.wave) * diffMul);
    const bonus = GameState.waveLeaked === 0 ? Math.round(20 * diffMul) : 0;
    GameState.coins += waveGold + bonus;
    SFX.waveEnd();
    if (GameState.wave >= GameState.totalWaves) {
        GameState.phase = 'win';
        _finishRun(true);
    } else {
        GameState.phase = 'prep';
        GameState.prepTimer = GameState.wave % 10 === 0 ? 15 : 10;
    }
    onStateChanged();
}

function updateWave(dt) {
    if (GameState.phase === 'prep') {
        GameState.prepTimer -= dt;
        if (GameState.prepTimer <= 0) startWave();
        return;
    }
    if (GameState.phase !== 'wave') return;
    const elapsed = GameState.gameTime - GameState.waveStartTime;
    while (waveSpawnIndex < waveQueue.length && waveQueue[waveSpawnIndex].time <= elapsed) {
        const item = waveQueue[waveSpawnIndex];
        try {
            spawnEnemy(item.type, item.hp);
        } catch (err) {
            console.error('[updateWave] Ошибка спавна', item.type, ':', err);
        }
        waveSpawnIndex++;
    }
    if (waveSpawnIndex >= waveQueue.length && enemies.length === 0) endWave();
}