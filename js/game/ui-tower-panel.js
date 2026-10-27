let selectedTower = null;
function initTowerPanel() {
    refreshTowerPanel();
    subscribeState(refreshTowerPanel);
}

function selectTower(tower) {
    selectedTower = tower;
    refreshTowerPanel();
    updateRangeCircle();
}

function deselectTower() {
    selectedTower = null;
    refreshTowerPanel();
    updateRangeCircle();
}

function refreshTowerPanel() {
    const panel = document.getElementById('tower-panel');
    if (!selectedTower) { panel.classList.add('hidden'); return; }
    panel.classList.remove('hidden');

    const tower = selectedTower;
    const data = TOWERS_DATA[tower.type];
    const stars = '★'.repeat(tower.level) + '☆'.repeat(3 - tower.level);
    const s = tower.stats;

    const dmgLine = (s.damage && s.damage > 0) ? `Урон: <b>${Math.round(s.damage)}</b><br>` : '';
    const rateLine = (s.fireRate && s.fireRate > 0) ? `Скорость: <b>${s.fireRate.toFixed(2)}/сек</b><br>` : '';
    const supportLine = (s.slowPercent)
        ? `Замедление: <b>−${s.slowPercent}%</b><br>`
        : (s.buffPercent ? `Усиление: <b>+${s.buffPercent}%</b><br>` : '');

    const upgradeCost = getUpgradeCost(tower.type, tower.level);
    const canUpgrade = upgradeCost != null && GameState.coins >= upgradeCost;
    const sellPrice = Math.round(getTowerTotalValue(tower) * 0.5);

    panel.innerHTML = `
        <div class="tp-title">${data.name}</div>
        <div class="tp-stars">${stars}</div>
        <div class="tp-stats">
            ${dmgLine}
            ${rateLine}
            Дальность: <b>${s.range.toFixed(1)}м</b><br>
            ${supportLine}
        </div>
        ${upgradeCost != null
            ? `<button class="tp-btn upgrade" id="tp-upgrade" ${canUpgrade ? '' : 'disabled'}>Улучшить · ${upgradeCost}</button>`
            : `<button class="tp-btn upgrade" disabled>Макс. уровень</button>`
        }
        <button class="tp-btn sell" id="tp-sell">Продать · +${sellPrice}</button>
    `;

    const upBtn = document.getElementById('tp-upgrade');
    if (upBtn && upgradeCost != null) upBtn.addEventListener('click', () => { upgradeTower(tower); });
    document.getElementById('tp-sell').addEventListener('click', () => { sellTower(tower); });
}