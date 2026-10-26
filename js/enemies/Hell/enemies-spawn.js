const WAVES_TABLE = [
    { groups: [{type:'bes', count:15}] },
    { groups: [{type:'hound', count:10}] },
    { groups: [{type:'knight', count:8}] },
    { groups: [{type:'bes', count:12}, {type:'succubus', count:4}] },
    { groups: [{type:'soul_eater', count:2}, {type:'knight', count:10}] },
    { groups: [{type:'hound', count:20}, {type:'succubus', count:6}] },
    { groups: [{type:'ballista', count:2}, {type:'bes', count:15}] },
    { groups: [{type:'knight', count:12}, {type:'succubus', count:8}] },
    { groups: [{type:'soul_eater', count:3}, {type:'hound', count:20}] },
    { groups: [{type:'baron', count:1}, {type:'knight', count:8}, {type:'succubus', count:6}] },
    { groups: [{type:'ballista', count:4}, {type:'knight', count:15}] },
    { groups: [{type:'succubus', count:25}] },
    { groups: [{type:'hound', count:30}, {type:'soul_eater', count:4}] },
    { groups: [{type:'ballista', count:5}, {type:'knight', count:20}, {type:'soul_eater', count:3}] },
    { groups: [{type:'trumpeter', count:1}, {type:'succubus', count:15}, {type:'knight', count:10}] },
    { groups: [{type:'bes', count:30}, {type:'soul_eater', count:6}] },
    { groups: [{type:'succubus', count:25}, {type:'ballista', count:4}] },
    { groups: [{type:'spire', count:1}, {type:'hound', count:20}, {type:'knight', count:15}] },
    { groups: [{type:'knight', count:25}, {type:'soul_eater', count:8}, {type:'succubus', count:15}] },
    { groups: [{type:'colossus', count:1}, {type:'soul_eater', count:4}, {type:'bes', count:20}] }
];

const SPAWN_GAP = {
    bes: 1.0, knight: 2.2, soul_eater: 1.8, hound: 0.9,
    succubus: 1.4, ballista: 3.5,
    baron: 5, trumpeter: 5, spire: 5, colossus: 6
};
const GROUP_EXTRA_GAP = 1.2;

let waveQueue = [];
let waveSpawnIndex = 0;

function generateWaveQueue(n) {
    const wave = WAVES_TABLE[n - 1];
    if (!wave) return [];
    const q = [];
    let t = 0;
    for (const g of wave.groups) {
        const gap = SPAWN_GAP[g.type] || 1.0;
        const hp = getEnemyHp(g.type, n);   // ← уже с учётом сложности
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