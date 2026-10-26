const ENEMIES_DATA = {
    // ── НАЗЕМНЫЕ ──
    ice_skeleton: { 
        name:'Мёрзлый Скелет', baseHp:18, speed:2.5, damage:1, reward:1, armor:0, color:0x9ab0c0, size:1.6, flying:false,
        walk: { bobFreq: 9.5, bobAmp: 0.07, swayAmp: 0.09, leanAmp: 0.05 }
    },
    ice_golem: { 
        name:'Ледяной Голем', baseHp:120, speed:1.2, damage:2, reward:5, armor:0.3, color:0x5588bb, size:1.35, flying:false,
        explosionOnDeath: { radius:3, damage:30 },
        walk: { bobFreq: 3, bobAmp: 0.08, swayAmp: 0.04, leanAmp: 0.04 }
    },
    snow_witch: { 
        name:'Снежная Ведьма', baseHp:150, speed:2.0, damage:1, reward:8, armor:0, color:0x88ccff, size:1.25, flying:false,
        aura: { radius:6, healPerSec:15, armorBonus:0 }, healOnDeath: { radius:6, amount:60 },
        walk: { bobFreq: 5, bobAmp: 0.05, swayAmp: 0.05, leanAmp: 0.03 }
    },
    ice_knight: { 
        name:'Ледяной Рыцарь', baseHp:350, speed:1.5, damage:2, reward:15, armor:0.4, color:0x2a4a6a, size:1.45, flying:false,
        walk: { bobFreq: 4.5, bobAmp: 0.05, swayAmp: 0.05, leanAmp: 0.04 }
    },

    // ── ВОЗДУШНЫЕ ──
    blizzard_spirit: { 
        name:'Метель-Дух', baseHp:54, speed:3.5, damage:1, reward:4, armor:0, color:0xaaddff, size:1.65, flying:true,
        walk: { bobFreq: 4, bobAmp: 0.1, swayAmp: 0.12, leanAmp: 0.02 }
    },
    ice_harpy: { 
        name:'Ледяная Гарпия', baseHp:80, speed:4.0, damage:1, reward:6, armor:0.1, color:0xddeeff, size:1.15, flying:true,
        buffSpeed: { radius:15, mul:1.3, targetFlying: false },
        walk: { bobFreq: 8, bobAmp: 0.08, swayAmp: 0.1, leanAmp: 0.04 }
    },

    // ── ОСАДНЫЕ ──
    ice_ballista: { 
        name:'Ледяная Баллиста', baseHp:355, speed:0.8, damage:2, reward:15, armor:0.3, color:0x8a5a2a, size:1.75, flying:false,
        siege: { stopRange: 20, fireRate: 0.5, towerStun: 2.0 },
        walk: { bobFreq: 2, bobAmp: 0.03, swayAmp: 0.03, leanAmp: 0.02 }
    },

    // ── ЭЛИТА И БОССЫ ──
    blizzard_lord: { 
        name:'Повелитель Метели', baseHp:1944, speed:2.0, damage:2, reward:150, armor:0.1, color:0xaaddff, size:2.05, flying:true, isBoss:true,
        buffSpeed: { radius:25, mul:1.6, targetFlying: true },
        walk: { bobFreq: 3, bobAmp: 0.08, swayAmp: 0.06, leanAmp: 0.03 }
    },
    frost_guardian: { 
        name:'Хранитель Мерзлоты', baseHp:2778, speed:0.6, damage:3, reward:200, armor:0.3, color:0x2a4a6a, size:2.35, flying:false, isBoss:true,
        slowImmune: true, stepDamage: { radius: 6, cooldown: 8.0, towerStun: 1.0 },
        walk: { bobFreq: 2, bobAmp: 0.06, swayAmp: 0.03, leanAmp: 0.03 }
    },
    snow_devourer: { 
        name:'Снежный Пожиратель', baseHp:4500, speed:1.2, damage:5, reward:300, armor:0.1, color:0xddeeff, size:2.95, flying:false, isBoss:true,
        slowImmune: true, summon: { type:'ice_skeleton', count:3, cooldown: 12 },
        walk: { bobFreq: 3, bobAmp: 0.08, swayAmp: 0.08, leanAmp: 0.05 }
    }
};

function getEnemyHp(type, wave) {
    const baseHp = ENEMIES_DATA[type].baseHp * Math.pow(1.15, wave - 1);
    const mul = (typeof GameState !== 'undefined' && GameState.difficulty && GameState.difficulty.enemyHpMul) || 1;
    return Math.round(baseHp * mul);
}