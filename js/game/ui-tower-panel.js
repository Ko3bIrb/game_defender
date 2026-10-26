let selectedTower = null;
let _mouseX = 0, _mouseY = 0;
// Кеш последней позиции мыши, для которой пересчитывали панель.
// Позволяет полностью пропускать пересчёт, когда мышь стоит на месте.
let _lastPanelX = -99999, _lastPanelY = -99999;

function initTowerPanel() {
    refreshTowerPanel();
    subscribeState(refreshTowerPanel);

    if (!IS_MOBILE) {
        window.addEventListener('mousemove', (e) => {
            _mouseX = e.clientX;
            _mouseY = e.clientY;
        });
    }
}

function selectTower(tower) {
    selectedTower = tower;
    // Форсируем пересчёт при следующем кадре, даже если мышь не двигалась.
    _lastPanelX = -99999;
    _lastPanelY = -99999;
    refreshTowerPanel();
    updateRangeCircle();
}

function deselectTower() {
    selectedTower = null;
    refreshTowerPanel();
    updateRangeCircle();
}

function updateTowerPanelPosition() {
    const line = document.getElementById('tower-pointer');

    if (!selectedTower) {
        if (line && line.style.display !== 'none') line.style.display = 'none';
        return;
    }
    const panel = document.getElementById('tower-panel');
    if (!panel || panel.classList.contains('hidden')) {
        if (line && line.style.display !== 'none') line.style.display = 'none';
        return;
    }

    // На мобильном — фиксированная панель снизу (без 3D-наклона и без линии)
    if (IS_MOBILE) {
        if (line && line.style.display !== 'none') line.style.display = 'none';
        panel.style.transform = 'translateX(-50%)';
        return;
    }

    // Пропускаем тяжёлую работу, если мышь не двигалась — getBoundingClientRect() не зовём.
    if (_mouseX === _lastPanelX && _mouseY === _lastPanelY) return;
    _lastPanelX = _mouseX;
    _lastPanelY = _mouseY;

    if (line && line.style.display !== 'block') line.style.display = 'block';

    const vector = selectedTower.position.clone();
    vector.y += 1.0;
    vector.project(camera);

    const towerX = (vector.x * 0.5 + 0.5) * window.innerWidth;
    const towerY = (-vector.y * 0.5 + 0.5) * window.innerHeight;

    const rect = panel.getBoundingClientRect();
    const panelX = rect.left + rect.width / 2;
    const panelY = rect.bottom;

    if (line) {
        line.setAttribute('x1', panelX);
        line.setAttribute('y1', panelY);
        line.setAttribute('x2', towerX);
        line.setAttribute('y2', towerY);
    }

    let dx = _mouseX - panelX;
    let dy = _mouseY - panelY;

    if (_mouseX >= rect.left && _mouseX <= rect.right && _mouseY >= rect.top && _mouseY <= rect.bottom) {
        dx = 0; dy = 0;
    }

    const tiltY = Math.max(-15, Math.min(15, dx * 0.03));
    const tiltX = Math.max(-15, Math.min(15, dy * -0.03));

    panel.style.transform = `translateX(-50%) perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
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
        <div class="tp-title">${data.icon} ${data.name}</div>
        <div class="tp-stars">${stars}</div>
        <div class="tp-stats">
            ${dmgLine}
            ${rateLine}
            Дальность: <b>${s.range.toFixed(1)}м</b><br>
            ${supportLine}
        </div>
        ${upgradeCost != null
            ? `<button class="tp-btn upgrade" id="tp-upgrade" ${canUpgrade ? '' : 'disabled'}>Улучшить — ${upgradeCost} 💰</button>`
            : `<button class="tp-btn upgrade" disabled>Макс. уровень</button>`
        }
        <button class="tp-btn sell" id="tp-sell">Продать — +${sellPrice} 💰</button>
    `;

    const upBtn = document.getElementById('tp-upgrade');
    if (upBtn && upgradeCost != null) upBtn.addEventListener('click', () => { upgradeTower(tower); });
    document.getElementById('tp-sell').addEventListener('click', () => { sellTower(tower); });
}