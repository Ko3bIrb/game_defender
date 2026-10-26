const TOWERS_DATA = {
    gun: {
        id: 'gun', name: 'Пулемёт', icon: '🔫', category: 'damage',
        baseCost: 50,
        stats: { damage: 4, range: 9, fireRate: 4 },
        canHitAir: true,
        role: 'Универсал · земля + воздух',
        desc: 'Скорострельная башня с двумя стволами',
        details: 'Стреляет очередями по ближайшему к базе врагу. Попадает и по земле, и по воздуху. Дешёвая — хороша против толп слабых монстров (бесы, гончие).',
        upgrades: {
            2: 'Второй ствол — двойной урон в секунду',
            3: 'Усиленные стволы — ещё больше урона'
        }
    },
    sniper: {
        id: 'sniper', name: 'Снайпер', icon: '🎯', category: 'damage',
        baseCost: 120,
        stats: { damage: 60, range: 24, fireRate: 0.5, critChance: 15, critMul: 2 },
        canHitAir: true, priority: 'strongest',
        role: 'Одиночная цель · земля + воздух',
        desc: 'Мощная башня с огромной дальностью',
        details: 'Всегда целится в самого крепкого врага (по HP). 15% шанс критического удара ×2. Радиус 24м — достаёт до любого участка дороги. Строится ТОЛЬКО в специальных снайперских зонах.',
        upgrades: {
            2: 'Ещё больше урона и дальности — сносит рыцарей с 1–2 выстрелов',
            3: 'Максимальный урон — убивает элитных монстров почти мгновенно'
        }
    },
    mortar: {
        id: 'mortar', name: 'Мортира', icon: '💥', category: 'damage',
        baseCost: 100,
        stats: { damage: 30, range: 15, fireRate: 0.4, aoe: 4.5, minRange: 4.5, armorPierce: 0.5 },
        canHitAir: false,
        role: 'Только земля · AoE',
        desc: 'Осадная башня, бьёт по площади',
        details: 'Стреляет снарядом по площади — наносит урон всем врагам в радиусе 4.5м от падения. Игнорирует половину брони. НЕ бьёт по воздуху и НЕ бьёт вплотную (минимум 4.5м). Идеальна против плотных групп.',
        upgrades: {
            2: 'Больше урона — сносит целые пачки гончих одним залпом',
            3: 'Максимальный AoE-урон — сметает даже рыцарей'
        }
    },
    slow: {
        id: 'slow', name: 'Замедлитель', icon: '❄', category: 'support',
        baseCost: 70,
        stats: { damage: 0, range: 9, fireRate: 0, slowPercent: 40, slowDur: 0.3 },
        canHitAir: false,
        role: 'Поддержка · только земля',
        desc: 'Кристалл, замедляющий врагов рядом',
        details: 'Не наносит урона. Замедляет ВСЕХ наземных врагов в радиусе на 40%. Усиливает эффект соседних башен — враги дольше остаются под огнём. Не действует на воздух и на неуязвимых к замедлению (Колосс).',
        upgrades: {
            2: 'Замедление 50%, радиус +20% — враги ползут',
            3: 'Замедление 60%, ещё больший радиус — почти стоят'
        }
    },
    skyguard: {
        id: 'skyguard', name: 'Небесный страж', icon: '🛡', category: 'unique',
        baseCost: 150,
        stats: { damage: 35, range: 18, fireRate: 1.2, airMul: 2.0, groundMul: 0.5, karma: 5, karmaDmg: 45 },
        canHitAir: true, priority: 'air',
        role: 'ПВО · приоритет воздуха',
        desc: 'Специалист против воздушных врагов',
        details: 'По воздуху наносит ×2 урона (70), по земле — только ×0.5 (17). Всегда выбирает воздушную цель первой. Каждый 5-й выстрел — «Небесная кара»: молния наносит 45 урона всем воздушным врагам в радиусе.',
        upgrades: {
            2: 'Больше урона — суккубы падают за 1–2 выстрела',
            3: 'Максимальный ПВО-урон — сносит даже Трубача'
        }
    },
    amp: {
        id: 'amp', name: 'Усилитель', icon: '🔮', category: 'support',
        baseCost: 130,
        stats: { damage: 0, range: 10, fireRate: 0, buffPercent: 35 },
        canHitAir: false,
        role: 'Поддержка · бафф урона',
        desc: 'Кристалл, усиливающий урон соседних башен',
        details: 'Не наносит урона. Увеличивает урон всех башен в радиусе на 35%. Улучшения увеличивают радиус и бонус. Баффы от нескольких усилителей складываются.',
        upgrades: {
            2: 'Бонус +50%, радиус 15м',
            3: 'Бонус +60%, радиус 20м'
        }
    }
};

const AVAILABLE_TOWERS = ['gun', 'sniper', 'mortar', 'slow', 'skyguard', 'amp'];

function getTowerStatsForLevel(typeId, level) {
    const base = TOWERS_DATA[typeId].stats;
    const mulDmg  = 1 + 0.4 * (level - 1);
    let mulRange = level === 1 ? 1.0 : level === 2 ? 1.15 : 1.30;
    let slowPercent = base.slowPercent || 0;
    let buffPercent = base.buffPercent || 0;
    let range = (base.range || 0) * mulRange;

    if (typeId === 'slow') {
        mulRange = level === 1 ? 1.0 : level === 2 ? 1.20 : 1.40;
        slowPercent += (level - 1) * 10;
        range = (base.range || 0) * mulRange;
    } else if (typeId === 'amp') {
        range = level === 1 ? 10 : level === 2 ? 15 : 20;
        buffPercent = level === 1 ? 35 : level === 2 ? 50 : 60;
    }

    return {
        damage:   (base.damage   || 0) * mulDmg,
        range:    range,
        fireRate: (base.fireRate || 0),
        aoe: base.aoe, minRange: base.minRange, armorPierce: base.armorPierce,
        dot: base.dot, dotDur: base.dotDur,
        slowPercent, slowDur: base.slowDur,
        buffPercent,
        critChance: base.critChance, critMul: base.critMul,
        airMul: base.airMul, groundMul: base.groundMul,
        karma: base.karma, karmaDmg: base.karmaDmg,
        poisonDps: base.poisonDps, stunChance: base.stunChance,
        chain: base.chain
    };
}

function getUpgradeCost(typeId, currentLevel) {
    if (currentLevel >= 3) return null;
    const baseCost = TOWERS_DATA[typeId].baseCost;
    return Math.round(baseCost * (currentLevel === 1 ? 0.75 : 1.0));
}

function getTowerTotalValue(tower) {
    const baseCost = TOWERS_DATA[tower.type].baseCost;
    let total = baseCost;
    if (tower.level >= 2) total += baseCost * 0.75;
    if (tower.level >= 3) total += baseCost * 1.0;
    return total;
}