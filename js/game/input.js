const _raycaster = new THREE.Raycaster();
const _mouse = new THREE.Vector2();
const _floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

let _pointerGesture = null;

function initInput() {
    const dom = renderer.domElement;

    dom.tabIndex = 0;
    dom.addEventListener('pointerdown', onCanvasPointerDown);
    dom.addEventListener('pointermove', onCanvasPointerMove);
    dom.addEventListener('pointerup', onCanvasPointerUp);
    dom.addEventListener('pointercancel', cancelCanvasPointer);
    dom.addEventListener('lostpointercapture', cancelCanvasPointer);
    dom.addEventListener('pointerleave', (event) => {
        if (event.pointerType === 'mouse' && hoveredTower) {
            hoveredTower = null;
            updateRangeCircle();
        }
    });

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

// One gesture path for mouse, pen and touch, including hybrid devices.
function onCanvasPointerDown(event) {
    if (event.button !== 0) return;
    if (!event.isPrimary || _pointerGesture) {
        if (_pointerGesture) _pointerGesture.cancelled = true;
        return;
    }
    _pointerGesture = {
        id: event.pointerId, x: event.clientX, y: event.clientY,
        time: performance.now(), moved: false, cancelled: false
    };
    renderer.domElement.setPointerCapture(event.pointerId);
    if (buildingType) onCanvasMouseMove(event);
}

function onCanvasPointerMove(event) {
    const gesture = _pointerGesture;
    if (gesture && gesture.id === event.pointerId) {
        const dx = event.clientX - gesture.x, dy = event.clientY - gesture.y;
        if (dx * dx + dy * dy > 400) gesture.moved = true;
        if (!gesture.cancelled && buildingType) onCanvasMouseMove(event);
    } else if (event.pointerType === 'mouse') {
        onCanvasMouseMove(event);
    }
}

function onCanvasPointerUp(event) {
    const gesture = _pointerGesture;
    if (!gesture || gesture.id !== event.pointerId) return;
    _pointerGesture = null;
    const dx = event.clientX - gesture.x, dy = event.clientY - gesture.y;
    const isTap = !gesture.cancelled && !gesture.moved && dx * dx + dy * dy <= 400;
    const isQuick = event.pointerType === 'mouse' || performance.now() - gesture.time < 500;
    // A captured pointer may finish over the shop or the tower panel.
    if (isTap && isQuick && document.elementFromPoint(event.clientX, event.clientY) === renderer.domElement) {
        onCanvasClick(event);
    }
}

function cancelCanvasPointer(event) {
    if (_pointerGesture && _pointerGesture.id === event.pointerId) _pointerGesture = null;
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