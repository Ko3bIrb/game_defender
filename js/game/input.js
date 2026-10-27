const _raycaster = new THREE.Raycaster();
const _mouse = new THREE.Vector2();
const _floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

let _touched = false; // флаг, чтобы отличить тап от свайпа

function initInput() {
    const dom = renderer.domElement;

    if (IS_MOBILE) {
        dom.addEventListener('touchstart', onTouchStart, { passive: false });
        dom.addEventListener('touchmove',  onTouchMove,  { passive: false });
        dom.addEventListener('touchend',   onTouchEnd,   { passive: false });
    } else {
        dom.addEventListener('click', onCanvasClick);
        dom.addEventListener('mousemove', onCanvasMouseMove);
    }

    // Клавиатура работает всегда (для десктопа + внешние клавиатуры на планшетах)
    document.addEventListener('keydown', (e) => {
        const modalIds = ['difficulty-modal', 'maps-modal', 'rules-modal', 'end-overlay'];
        let isModalOpen = false;
        for (const id of modalIds) {
            const el = document.getElementById(id);
            if (el && !el.classList.contains('hidden')) {
                isModalOpen = true;
                break;
            }
        }
        if (isModalOpen) return;

        if (e.code === 'Space' && e.target.closest('button, summary')) return;

        if (e.code === 'Space' || e.key === ' ' || e.keyCode === 32) {
            e.preventDefault();
            GameState.paused = !GameState.paused;
            if (typeof refreshSpeedButtons === 'function') refreshSpeedButtons();
        }

        if (e.keyCode === 39 || e.code === 'ArrowRight' || e.key === 'ArrowRight') {
            e.preventDefault();
            if (GameState.speedMultiplier === 1) GameState.speedMultiplier = 2;
            else if (GameState.speedMultiplier === 2) GameState.speedMultiplier = 5;
            if (typeof refreshSpeedButtons === 'function') refreshSpeedButtons();
        }

        if (e.keyCode === 37 || e.code === 'ArrowLeft' || e.key === 'ArrowLeft') {
            e.preventDefault();
            if (GameState.speedMultiplier === 5) GameState.speedMultiplier = 2;
            else if (GameState.speedMultiplier === 2) GameState.speedMultiplier = 1;
            if (typeof refreshSpeedButtons === 'function') refreshSpeedButtons();
        }

        if (e.key === 'Escape' || e.keyCode === 27) {
            if (typeof deselectTower === 'function') deselectTower();
            if (typeof exitBuildMode === 'function') exitBuildMode();
            const rulesModal = document.getElementById('rules-modal');
            if (rulesModal && !rulesModal.classList.contains('hidden')) {
                rulesModal.classList.add('hidden');
                if (typeof GameState !== 'undefined') {
                    GameState.paused = false;
                    if (typeof refreshSpeedButtons === 'function') refreshSpeedButtons();
                }
            }
        }
    }, { capture: true });
}

// ─── Тач-обработчики ───
let _touchStartX = 0, _touchStartY = 0, _touchStartTime = 0;

function onTouchStart(e) {
    e.preventDefault();
    if (e.touches.length === 0) return;
    const t = e.touches[0];
    _touchStartX = t.clientX;
    _touchStartY = t.clientY;
    _touchStartTime = performance.now();
    _touched = false;

    _updateMouse(t);
    // Показываем призрак башни при тапе (на случай если тап перейдёт в драг)
    if (buildingType) onCanvasMouseMove(t);
}

function onTouchMove(e) {
    e.preventDefault();
    if (e.touches.length === 0) return;
    const t = e.touches[0];

    const dx = t.clientX - _touchStartX;
    const dy = t.clientY - _touchStartY;
    if (dx * dx + dy * dy > 400) _touched = true; // сдвиг > 20px = свайп

    _updateMouse(t);
    if (buildingType) onCanvasMouseMove(t);
}

function onTouchEnd(e) {
    e.preventDefault();
    if (e.changedTouches.length === 0) return;
    const t = e.changedTouches[0];
    const dt = performance.now() - _touchStartTime;

    // Считаем тапом только если не сдвинулись и не долго держали
    if (!_touched && dt < 500) {
        _updateMouse(t);
        onCanvasClick(t);
    }
    _touched = false;
}

function _updateMouse(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    _mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    _mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

function _mouseWorldOnFloor() {
    _raycaster.setFromCamera(_mouse, camera);
    const point = new THREE.Vector3();
    const hit = _raycaster.ray.intersectPlane(_floorPlane, point);
    return hit ? point : null;
}

function _findTowerUnderCursor() {
    if (buildTowers.length === 0) return null;
    _raycaster.setFromCamera(_mouse, camera);
    const hits = _raycaster.intersectObjects(buildTowers.map(t => t.mesh), true);
    if (hits.length === 0) return null;
    let obj = hits[0].object;
    while (obj && !obj.userData.towerId) obj = obj.parent;
    if (obj && obj.userData.towerId) return buildTowers.find(t => t.id === obj.userData.towerId) || null;
    return null;
}

function _isSpotValidForType(spot, typeId) {
    if (spot.restrictedTo) {
        return spot.restrictedTo === typeId;
    }
    return typeId !== 'sniper';
}

function onCanvasMouseMove(event) {
    _updateMouse(event);
    if (buildingType) {
        const p = _mouseWorldOnFloor();
        if (p) updateGhostTower(p);
        return;
    }
    // На мобильных не показываем hover-круг (нет курсора)
    if (IS_MOBILE) return;
    const newHover = _findTowerUnderCursor();
    if (newHover !== hoveredTower) {
        hoveredTower = newHover;
        updateRangeCircle();
    }
}

function onCanvasClick(event) {
    _updateMouse(event);
    const tower = _findTowerUnderCursor();
    if (tower) {
        exitBuildMode();
        selectTower(tower);
        return;
    }
    if (buildingType) {
        const p = _mouseWorldOnFloor();
        if (p) {
            let best = null, bestDist = IS_MOBILE ? 6.0 : 4.0; // На мобильных радиус больше
            for (const spot of towerSpots) {
                if (spot.occupied) continue;
                if (!_isSpotValidForType(spot, buildingType)) continue;
                const d = spot.position.distanceTo(p);
                if (d < bestDist) { bestDist = d; best = spot; }
            }
            if (best) { tryBuildAt(best); return; }
        }
        exitBuildMode();
        deselectTower();
        return;
    }
    deselectTower();
}