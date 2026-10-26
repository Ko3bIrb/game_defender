const buildTowers = [];
let buildingType = null;
let ghostTower = null;

// ─── Кеш баффов от Усилителей ───
// Инвалидируется при постройке/улучшении/продаже любой башни.
// Пересчёт O(T²) происходит только при изменении состава, а не каждый кадр.
let _towersBuffsDirty = true;
function invalidateTowerBuffs() { _towersBuffsDirty = true; }

function enterBuildMode(typeId) {
    exitBuildMode();
    const data = TOWERS_DATA[typeId];
    if (!data || GameState.coins < data.baseCost) {
        SFX.error();
        return;
    }
    buildingType = typeId;
    setTowerSpotsHighlight(true, typeId);
    deselectTower();

    ghostTower = buildTowerModel(typeId, 1);
    ghostTower.traverse(o => {
        if (o.isMesh && o.material) {
            o.material = o.material.clone();
            o.material.transparent = true;
            o.material.opacity = 0.45;
            o.material.depthWrite = false;
        }
    });
    ghostTower.visible = false;
    scene.add(ghostTower);

    refreshShop();
}

function exitBuildMode() {
    buildingType = null;
    setTowerSpotsHighlight(false);
    if (ghostTower) {
        scene.remove(ghostTower);
        ghostTower = null;
    }
    hideRangeCircle();
    refreshShop();
    updateRangeCircle();
}

function updateGhostTower(worldPos) {
    if (!ghostTower || !buildingType) return;
    let best = null, bestDist = 4.0;
    for (const spot of towerSpots) {
        if (spot.occupied) continue;
        if (spot.restrictedTo) {
            if (spot.restrictedTo !== buildingType) continue;
        } else {
            if (buildingType === 'sniper') continue;
        }

        const d = spot.position.distanceTo(worldPos);
        if (d < bestDist) { bestDist = d; best = spot; }
    }
    if (best) {
        ghostTower.visible = true;
        ghostTower.position.copy(best.position);
        ghostTower.position.y = 0;
        const range = getTowerStatsForLevel(buildingType, 1).range;
        drawRangeCircleAt(best.position, range, 0x39ff5a, 0.22);
    } else {
        ghostTower.visible = false;
        hideRangeCircle();
    }
}

function tryBuildAt(spot) {
    if (!buildingType || !spot || spot.occupied) return false;

    if (spot.restrictedTo) {
        if (spot.restrictedTo !== buildingType) {
            SFX.error();
            return false;
        }
    } else if (buildingType === 'sniper') {
        SFX.error();
        return false;
    }

    const data = TOWERS_DATA[buildingType];
    if (!spendCoins(data.baseCost)) {
        SFX.error();
        return false;
    }

    const mesh = buildTowerModel(buildingType, 1);
    mesh.position.copy(spot.position);
    mesh.position.y = 0;
    mesh.userData.towerId = buildingType + '_' + Date.now() + '_' + Math.floor(Math.random() * 1e5);
    scene.add(mesh);

    const tower = {
        id: mesh.userData.towerId,
        type: buildingType, level: 1,
        mesh, spot, position: spot.position.clone()
    };
    applyTowerStats(tower);

    buildTowers.push(tower);
    spot.occupied = true;
    spot.tower = tower;
    invalidateTowerBuffs();

    SFX.build();
    exitBuildMode();
    selectTower(tower);
    return true;
}

function applyTowerStats(tower) {
    const stats = getTowerStatsForLevel(tower.type, tower.level);
    tower.stats = stats;
    tower.range = stats.range;
    tower.rangeSq = stats.range * stats.range;   // квадрат радиуса — для sqrt-free проверок
    tower.damage = stats.damage;
    tower.fireRate = stats.fireRate;
}

function upgradeTower(tower) {
    if (!tower || tower.level >= 3) return false;
    const cost = getUpgradeCost(tower.type, tower.level);
    if (cost == null || !spendCoins(cost)) { SFX.error(); return false; }

    tower.level++;
    applyTowerStats(tower);
    invalidateTowerBuffs();

    scene.remove(tower.mesh);
    const newMesh = buildTowerModel(tower.type, tower.level);
    newMesh.position.copy(tower.position);
    newMesh.position.y = 0;
    newMesh.userData.towerId = tower.id;
    scene.add(newMesh);
    tower.mesh = newMesh;

    SFX.upgrade();
    if (selectedTower === tower) selectTower(tower);
    return true;
}

function sellTower(tower) {
    if (!tower) return false;
    const refund = Math.round(getTowerTotalValue(tower) * 0.5);
    addCoins(refund);
    tower.spot.occupied = false;
    tower.spot.tower = null;
    scene.remove(tower.mesh);
    const idx = buildTowers.indexOf(tower);
    if (idx >= 0) buildTowers.splice(idx, 1);
    invalidateTowerBuffs();
    SFX.sell();
    if (selectedTower === tower) deselectTower();
    return true;
}