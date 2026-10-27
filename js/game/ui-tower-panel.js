let selectedTower = null;
let _towerPanelFrame = 0;

function initTowerPanel() {
    const panel = document.getElementById('tower-panel');
    // Keep action buttons mounted while coins change, including during a touch.
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-label', 'Выбранная башня');
    panel.innerHTML = `
        <div class="tp-header">
            <div><div class="tp-title"></div><div class="tp-stars"></div></div>
            <button class="tp-close" type="button" aria-label="Закрыть панель">×</button>
        </div>
        <div class="tp-stats"></div>
        <div class="tp-actions">
            <button class="tp-btn upgrade" id="tp-upgrade" type="button"></button>
            <button class="tp-btn sell" id="tp-sell" type="button"></button>
        </div>
    `;
    panel.querySelector('.tp-close').addEventListener('click', deselectTower);
    panel.querySelector('#tp-upgrade').addEventListener('click', () => {
        if (selectedTower) upgradeTower(selectedTower);
    });
    panel.querySelector('#tp-sell').addEventListener('click', () => {
        if (selectedTower) sellTower(selectedTower);
    });

    // Let CSS resolve device safe areas before measuring the available space.
    const bounds = document.createElement('div');
    bounds.id = 'tower-panel-bounds';
    bounds.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bounds);
    const observer = new ResizeObserver(scheduleTowerPanelPosition);
    for (const el of [panel, document.getElementById('hud'), document.getElementById('shop-dock')]) {
        if (el) observer.observe(el);
    }
    window.addEventListener('resize', scheduleTowerPanelPosition);
    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', scheduleTowerPanelPosition);
        window.visualViewport.addEventListener('scroll', scheduleTowerPanelPosition);
    }
    refreshTowerPanel();
    subscribeState(refreshTowerPanel);
}

function selectTower(tower) {
    selectedTower = tower;
    refreshTowerPanel();
    updateRangeCircle();
}

function deselectTower() {
    const panel = document.getElementById('tower-panel');
    const hadFocus = panel && panel.contains(document.activeElement);
    selectedTower = null;
    refreshTowerPanel();
    updateRangeCircle();
    if (hadFocus) renderer.domElement.focus({ preventScroll: true });
}

function refreshTowerPanel() {
    const panel = document.getElementById('tower-panel');
    if (!selectedTower) { panel.classList.add('hidden'); return; }
    panel.classList.remove('hidden');

    const tower = selectedTower;
    const data = TOWERS_DATA[tower.type];
    const s = tower.stats;
    panel.querySelector('.tp-title').textContent = data.name;
    panel.querySelector('.tp-stars').textContent = '★'.repeat(tower.level) + '☆'.repeat(3 - tower.level);

    const dmgLine = (s.damage && s.damage > 0) ? `Урон: <b>${Math.round(s.damage)}</b><br>` : '';
    const rateLine = (s.fireRate && s.fireRate > 0) ? `Скорость: <b>${s.fireRate.toFixed(2)}/сек</b><br>` : '';
    const supportLine = s.slowPercent
        ? `Замедление: <b>−${s.slowPercent}%</b><br>`
        : (s.buffPercent ? `Усиление: <b>+${s.buffPercent}%</b><br>` : '');
    panel.querySelector('.tp-stats').innerHTML = `${dmgLine}${rateLine}Дальность: <b>${s.range.toFixed(1)}м</b><br>${supportLine}`;

    const upgradeCost = getUpgradeCost(tower.type, tower.level);
    const upgrade = panel.querySelector('#tp-upgrade');
    upgrade.disabled = upgradeCost == null || GameState.coins < upgradeCost;
    upgrade.textContent = upgradeCost == null ? 'Макс. уровень' : `Улучшить · ${upgradeCost}`;
    panel.querySelector('#tp-sell').textContent = `Продать · +${Math.round(getTowerTotalValue(tower) * 0.5)}`;
    updateTowerPanelPosition();
}

function scheduleTowerPanelPosition() {
    if (_towerPanelFrame) return;
    _towerPanelFrame = requestAnimationFrame(() => {
        _towerPanelFrame = 0;
        updateTowerPanelPosition();
    });
}

// Prefer the nearest side that keeps the selected tower visible.
function getTowerPanelPlacement(anchor, size, bounds) {
    const clamp = (v, min, max) => Math.max(min, Math.min(v, max));
    const gap = 24;
    const candidates = [
        { x: anchor.x + gap, y: anchor.y - size.height / 2 },
        { x: anchor.x - gap - size.width, y: anchor.y - size.height / 2 },
        { x: anchor.x - size.width / 2, y: anchor.y - gap - size.height },
        { x: anchor.x - size.width / 2, y: anchor.y + gap }
    ];
    let best, bestScore = Infinity;
    for (const candidate of candidates) {
        const x = clamp(candidate.x, bounds.left, bounds.right - size.width);
        const y = clamp(candidate.y, bounds.top, bounds.bottom - size.height);
        const dx = Math.max(x - anchor.x, 0, anchor.x - x - size.width);
        const dy = Math.max(y - anchor.y, 0, anchor.y - y - size.height);
        const coversTower = dx < 18 && dy < 18;
        const score = Math.hypot(dx, dy) + (coversTower ? 10000 : 0);
        if (score < bestScore) { best = { x, y }; bestScore = score; }
    }
    return best;
}

function updateTowerPanelPosition() {
    const panel = document.getElementById('tower-panel');
    const safeArea = document.getElementById('tower-panel-bounds');
    if (!selectedTower || !panel || !safeArea || !camera || !renderer) return;

    const canvas = renderer.domElement.getBoundingClientRect();
    const safe = safeArea.getBoundingClientRect();
    const viewport = window.visualViewport;
    const left = Math.max(canvas.left, safe.left, viewport ? viewport.offsetLeft + 8 : 8);
    const right = Math.min(canvas.right, safe.right, viewport ? viewport.offsetLeft + viewport.width - 8 : window.innerWidth - 8);
    let top = Math.max(canvas.top, safe.top, viewport ? viewport.offsetTop + 8 : 8);
    let bottom = Math.min(canvas.bottom, safe.bottom, viewport ? viewport.offsetTop + viewport.height - 8 : window.innerHeight - 8);
    const hud = document.getElementById('hud');
    const dock = document.getElementById('shop-dock');
    if (hud) top = Math.max(top, hud.getBoundingClientRect().bottom + 8);
    if (dock) bottom = Math.min(bottom, dock.getBoundingClientRect().top - 8);

    const projected = selectedTower.position.clone();
    projected.y += 2;
    projected.project(camera);
    const anchor = {
        x: canvas.left + (projected.x + 1) * canvas.width / 2,
        y: canvas.top + (1 - projected.y) * canvas.height / 2
    };
    const sideRoom = Math.max(anchor.x - left, right - anchor.x) - 24;
    const width = Math.min(224, right - left);
    // On narrow portrait screens prefer a shorter panel above/below the tower
    // over covering it. The statistics scroll; both actions stay visible.
    const verticalRoom = Math.max(anchor.y - top, bottom - anchor.y) - 24;
    const maxHeight = sideRoom < width ? Math.min(bottom - top, Math.max(126, verticalRoom)) : bottom - top;
    panel.style.width = Math.max(0, width) + 'px';
    panel.style.maxHeight = Math.max(0, maxHeight) + 'px';
    const size = panel.getBoundingClientRect();
    const placement = getTowerPanelPlacement(anchor, size, { left, right, top, bottom });
    panel.style.left = Math.round(placement.x) + 'px';
    panel.style.top = Math.round(placement.y) + 'px';
}
