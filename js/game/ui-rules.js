// ui-rules.js — окно правил. Текст описывает РЕАЛЬНОЕ поведение из towers-combat.js.

function initRules() {
    const rulesBtn = document.getElementById('hud-rules');
    const rulesModal = document.getElementById('rules-modal');
    const closeBtn = document.getElementById('rules-close');

    if (!rulesBtn || !rulesModal) return;

    rulesBtn.addEventListener('click', () => {
        rulesModal.classList.remove('hidden');
        if (typeof GameState !== 'undefined') GameState.paused = true;
    });

    const closeRules = () => {
        rulesModal.classList.add('hidden');
        if (typeof GameState !== 'undefined') {
            GameState.paused = false;
            const pauseBtn = document.getElementById('hud-pause');
            if (pauseBtn) pauseBtn.textContent = '⏸';
        }
    };
    closeBtn.addEventListener('click', closeRules);
    rulesModal.addEventListener('click', (e) => {
        if (e.target === rulesModal) closeRules();
    });

    generateTowerRulesList();
}

function _fmt(n, digits = 0) {
    if (n == null || isNaN(n)) return '—';
    return digits > 0 ? n.toFixed(digits) : Math.round(n).toString();
}

function _buildTowerCard(typeId) {
    const data = TOWERS_DATA[typeId];
    const l1 = getTowerStatsForLevel(typeId, 1);
    const l2 = getTowerStatsForLevel(typeId, 2);
    const l3 = getTowerStatsForLevel(typeId, 3);

    const card = document.createElement('div');
    card.className = 'rule-tower-card';

    const header = `
        <div class="rtc-header">
            <img src="${generateTowerIcon(typeId, 1)}" alt="${data.name}">
            <span>${data.name}</span>
        </div>
        <div class="rtc-role">${data.role || ''}</div>
        <div class="rtc-cost">💰 ${data.baseCost} монет</div>
    `;

    // ─── Статы Ур. 1 ───
    let statsBlock = '';

    if (typeId === 'gun') {
        const dps = l1.damage * l1.fireRate;
        statsBlock = `
            <div><b>Урон:</b> ${_fmt(l1.damage)}</div>
            <div><b>Скорострельность:</b> ${_fmt(l1.fireRate, 1)}/сек</div>
            <div><b>DPS:</b> ~${_fmt(dps)}</div>
            <div><b>Радиус:</b> ${_fmt(l1.range, 1)}м</div>
        `;
    } else if (typeId === 'sniper') {
        const dps = l1.damage * l1.fireRate;
        const avg = dps * (1 + (l1.critChance / 100) * ((l1.critMul || 2) - 1));
        statsBlock = `
            <div><b>Урон:</b> ${_fmt(l1.damage)}</div>
            <div><b>Скорострельность:</b> ${_fmt(l1.fireRate, 1)}/сек</div>
            <div><b>DPS без крита:</b> ~${_fmt(dps)} · <b>с критом:</b> ~${_fmt(avg)}</div>
            <div><b>Крит:</b> ${l1.critChance}% → ×${l1.critMul}</div>
            <div><b>Радиус:</b> ${_fmt(l1.range, 1)}м</div>
        `;
    } else if (typeId === 'mortar') {
        const dps = l1.damage * l1.fireRate;
        statsBlock = `
            <div><b>Урон:</b> ${_fmt(l1.damage)} <span style="opacity:.7">(каждой цели в AoE)</span></div>
            <div><b>Скорострельность:</b> ${_fmt(l1.fireRate, 1)}/сек · <b>DPS</b> ~${_fmt(dps)} по одной</div>
            <div><b>Радиус:</b> ${_fmt(l1.range, 1)}м · <b>мин. дистанция:</b> ${_fmt(l1.minRange, 1)}м</div>
            <div><b>Радиус AoE:</b> ${_fmt(l1.aoe, 1)}м</div>
            <div><b>Бронепробитие:</b> ${_fmt((l1.armorPierce || 0) * 100)}%</div>
        `;
    } else if (typeId === 'slow') {
        statsBlock = `
            <div><b>Замедление:</b> −${l1.slowPercent}%</div>
            <div><b>Радиус:</b> ${_fmt(l1.range, 1)}м</div>
            <div><b>Длительность:</b> пока в радиусе + 0.3с после выхода</div>
            <div><b>Урон:</b> — (не атакует)</div>
        `;
    } else if (typeId === 'skyguard') {
        const airDmg = l1.damage * (l1.airMul || 2);
        const airDps = airDmg * l1.fireRate;
        statsBlock = `
            <div><b>Урон по воздуху:</b> ${_fmt(airDmg)} <span style="opacity:.7">(база ${_fmt(l1.damage)} × ${l1.airMul})</span></div>
            <div><b>Скорострельность:</b> ${_fmt(l1.fireRate, 1)}/сек</div>
            <div><b>DPS по воздуху:</b> ~${_fmt(airDps)}</div>
            <div><b>Радиус:</b> ${_fmt(l1.range, 1)}м</div>
            <div><b>Урон по земле:</b> — (наземные цели не выбираются)</div>
        `;
    } else if (typeId === 'amp') {
        statsBlock = `
            <div><b>Бонус урона:</b> +${l1.buffPercent}%</div>
            <div><b>Радиус действия:</b> ${_fmt(l1.range, 1)}м</div>
            <div><b>Урон:</b> — (не атакует)</div>
        `;
    }

    // ─── Как выбирает цель / особенности ───
    const specials = [];
    if (typeId === 'gun') {
        specials.push('Стреляет по земле и по воздуху');
        specials.push('Цель — враг, дальше всех прошедший по дороге');
        specials.push('Урон снижается бронёй цели');
    }
    if (typeId === 'sniper') {
        specials.push('Стреляет по земле и по воздуху');
        specials.push('Цель — враг, дальше всех прошедший по дороге');
        specials.push('⚠ НЕ фокусит самого крепкого — параметр priority в коде не применяется');
        specials.push(`Крит ${l1.critChance}% × ${l1.critMul} (учитывает броню цели после крита)`);
        specials.push('⚠ Строится ТОЛЬКО в специальных снайперских зонах');
    }
    if (typeId === 'mortar') {
        specials.push('Стреляет ТОЛЬКО по земле');
        specials.push(`Не бьёт ближе ${_fmt(l1.minRange, 1)}м`);
        specials.push(`AoE ${_fmt(l1.aoe, 1)}м: наносит урон всем наземным вокруг точки падения`);
        specials.push(`Снижает эффективность брони на ${_fmt((l1.armorPierce || 0) * 100)}%`);
        specials.push('Урон снаряда фиксируется в момент попадания (учитывает актуальные баффы)');
    }
    if (typeId === 'slow') {
        specials.push('Стреляет только по земле (воздух не затрагивает)');
        specials.push(`Замедляет на ${l1.slowPercent}% всех наземных в радиусе`);
        specials.push('⚠ Урон других башен НЕ увеличивает — только замедляет');
        specials.push('⚠ Несколько замедлителей НЕ стакаются — берётся максимум');
        specials.push('❌ Не действует на воздух и на slowImmune-врагов');
    }
    if (typeId === 'skyguard') {
        specials.push('⚠ Стреляет ТОЛЬКО по воздуху — наземные цели игнорируются');
        specials.push('Если в радиусе нет воздуха — башня молчит');
        specials.push(`Небесная кара: каждый ${l1.karma}-й выстрел — ${_fmt(l1.karmaDmg)} урона ВСЕМ воздушным в радиусе`);
        specials.push('Кара игнорирует броню (вычитается из HP напрямую)');
        specials.push('Кара усиливается Усилителем');
    }
    if (typeId === 'amp') {
        specials.push('Усиливает урон всех стреляющих башен в радиусе');
        specials.push('⚠ Баффы от нескольких усилителей СКЛАДЫВАЮТСЯ');
        specials.push('Пример: 2 усилителя Ур.3 (+60%) = +120% урона');
        specials.push('Также усиливает «Небесную кару» стража');
        specials.push('❌ Не стреляет · на себя не действует');
    }
    const specialsBlock = specials.length
        ? `<div style="margin-top:6px; color:#ffb040; font-size:11px; line-height:1.6;">${specials.map(s => `• ${s}`).join('<br>')}</div>`
        : '';

    // ─── Улучшения ───
    let upgradeRows = '';
    if (typeId === 'amp') {
        upgradeRows = `
            <div><b>Ур. 2:</b> +${l2.buffPercent}%, радиус ${_fmt(l2.range, 1)}м</div>
            <div><b>Ур. 3:</b> +${l3.buffPercent}%, радиус ${_fmt(l3.range, 1)}м</div>
        `;
    } else if (typeId === 'slow') {
        upgradeRows = `
            <div><b>Ур. 2:</b> замедление −${l2.slowPercent}%, радиус ${_fmt(l2.range, 1)}м</div>
            <div><b>Ур. 3:</b> замедление −${l3.slowPercent}%, радиус ${_fmt(l3.range, 1)}м</div>
        `;
    } else if (typeId === 'skyguard') {
        const a2 = l2.damage * (l2.airMul || 2);
        const a3 = l3.damage * (l3.airMul || 2);
        upgradeRows = `
            <div><b>Ур. 2:</b> урон по воздуху ${_fmt(a2)}, радиус ${_fmt(l2.range, 1)}м</div>
            <div><b>Ур. 3:</b> урон по воздуху ${_fmt(a3)}, радиус ${_fmt(l3.range, 1)}м</div>
        `;
    } else if (typeId === 'mortar') {
        upgradeRows = `
            <div><b>Ур. 2:</b> урон ${_fmt(l2.damage)}, радиус ${_fmt(l2.range, 1)}м</div>
            <div><b>Ур. 3:</b> урон ${_fmt(l3.damage)}, радиус ${_fmt(l3.range, 1)}м</div>
        `;
    } else if (typeId === 'sniper') {
        const avg2 = l2.damage * l2.fireRate * (1 + (l2.critChance / 100) * ((l2.critMul || 2) - 1));
        const avg3 = l3.damage * l3.fireRate * (1 + (l3.critChance / 100) * ((l3.critMul || 2) - 1));
        upgradeRows = `
            <div><b>Ур. 2:</b> урон ${_fmt(l2.damage)}, радиус ${_fmt(l2.range, 1)}м, DPS с критом ~${_fmt(avg2)}</div>
            <div><b>Ур. 3:</b> урон ${_fmt(l3.damage)}, радиус ${_fmt(l3.range, 1)}м, DPS с критом ~${_fmt(avg3)}</div>
        `;
    } else {
        upgradeRows = `
            <div><b>Ур. 2:</b> урон ${_fmt(l2.damage)}, радиус ${_fmt(l2.range, 1)}м</div>
            <div><b>Ур. 3:</b> урон ${_fmt(l3.damage)}, радиус ${_fmt(l3.range, 1)}м</div>
        `;
    }

    const cost12 = Math.round(data.baseCost * 0.75);
    const cost23 = Math.round(data.baseCost * 1.0);

    card.innerHTML = `
        ${header}
        <div class="rtc-section">
            <div class="rtc-section-title">Базовые статы (Ур. 1)</div>
            ${statsBlock}
            ${specialsBlock}
        </div>
        <div class="rtc-section rtc-upgrades">
            <div class="rtc-section-title">Улучшения</div>
            ${upgradeRows}
            <div class="rtc-cost-small">1→2: ${cost12}💰 · 2→3: ${cost23}💰</div>
        </div>
    `;

    return card;
}

function generateTowerRulesList() {
    const container = document.getElementById('rules-towers-list');
    if (!container) return;
    container.innerHTML = '';

    for (const typeId of AVAILABLE_TOWERS) {
        container.appendChild(_buildTowerCard(typeId));
    }
}