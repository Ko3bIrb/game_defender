const ENEMIES_DATA = {
    bes:        { name:'Бес',           baseHp:18,   speed:2.5, damage:1, reward:1,  armor:0,    color:0x8a1a1a, size:1.0,  shape:'box',    flying:false,
                  walk: { bobFreq: 9,   bobAmp: 0.07, swayAmp: 0.09, leanAmp: 0.05 } },
    knight:     { name:'Огненный рыцарь', baseHp:134,  speed:1.5, damage:1, reward:5, armor:0.3, color:0xff5522, size:1.25, shape:'box',    flying:false,
                  walk: { bobFreq: 4.5, bobAmp: 0.05, swayAmp: 0.05, leanAmp: 0.04 } },
    soul_eater: { name:'Пожиратель Душ', baseHp:178,  speed:2.0, damage:1, reward:8, armor:0,   color:0x39ff5a, size:1.3,  shape:'sphere', flying:false,
                  aura: { radius:5, healPerSec:10, armorBonus:0.15 }, healOnDeath: { radius:6, amount:80 },
                  walk: { bobFreq: 3,   bobAmp: 0.04, swayAmp: 0.03, leanAmp: 0.02 } },
    hound:      { name:'Адская гончая',  baseHp:35,   speed:4.5, damage:1, reward:2,  armor:0,   color:0xff3b3b, size:1.15, shape:'cone',   flying:false,
                  lavaOnDeath: { radius:3, dps:20, duration:4 },
                  walk: { bobFreq: 13,  bobAmp: 0.05, swayAmp: 0.11, leanAmp: 0.08 } },

    succubus:   { name:'Суккуб',         baseHp:54,   speed:3.5, damage:1, reward:4,  armor:0,   color:0xff3bff, size:1.1,  shape:'octa',   flying:true,
                  explosionOnDeath: { radius:3, damage:30 },
                  walk: { bobFreq: 6,   bobAmp: 0.07, swayAmp: 0.08, leanAmp: 0.03 } },

    ballista:   { name:'Баллиста',       baseHp:355,  speed:0.8, damage:2, reward:15, armor:0.3, color:0x8a5a2a, size:1.75, shape:'box',    flying:false,
                  siege: { stopRange: 20, fireRate: 0.5, towerStun: 2.0 },
                  walk: { bobFreq: 2,   bobAmp: 0.03, swayAmp: 0.03, leanAmp: 0.02 } },

    baron:      { name:'Барон Преисподней', baseHp:1500, speed:1.0, damage:3, reward:150, armor:0.1, color:0xff2020, size:2.15, shape:'icosa', flying:false, isBoss:true,
                  fireImmune: true, summon: { type:'bes', count:2, cooldown:10 },
                  walk: { bobFreq: 3,   bobAmp: 0.07, swayAmp: 0.05, leanAmp: 0.04 } },
    trumpeter:  { name:'Иерихонский Трубач', baseHp:1944, speed:2.0, damage:2, reward:150, armor:0.1, color:0xffd166, size:2.05, shape:'icosa', flying:true, isBoss:true,
                  buffSpeed: { radius:20, mul:1.6, targetFlying: false },
                  walk: { bobFreq: 4,   bobAmp: 0.06, swayAmp: 0.06, leanAmp: 0.03 } },
    spire:      { name:'Дьявольский Шпиль', baseHp:2778, speed:0.6, damage:2, reward:200, armor:0.3, color:0x8a3a8a, size:2.35, shape:'icosa', flying:false, isBoss:true,
                  siege: { stopRange: 25, fireRate: 0.6, towerStun: 2.5, aoe: 4 },
                  walk: { bobFreq: 1.5, bobAmp: 0.03, swayAmp: 0.02, leanAmp: 0.015 } },

    colossus:   { name:'Гееннский Колосс', baseHp:1100, speed:0.6, damage:5, reward:250, armor:0.1, color:0x2a0a0a, size:2.95, shape:'icosa', flying:false, isBoss:true,
                  slowImmune: true, stepDamage: { radius: 6, cooldown: 8.0, towerStun: 0.5 },
                  summon: { type:'bes', count:2, cooldown: 15 },
                  walk: { bobFreq: 2.2, bobAmp: 0.1, swayAmp: 0.06, leanAmp: 0.06 } }
};

function getEnemyHp(type, wave) {
    const baseHp = ENEMIES_DATA[type].baseHp * Math.pow(1.15, wave - 1);
    const mul = (typeof GameState !== 'undefined' && GameState.difficulty && GameState.difficulty.enemyHpMul) || 1;
    return Math.round(baseHp * mul);
}