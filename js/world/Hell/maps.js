function distToSegment(p, a, b) {
    const abx = b.x - a.x, abz = b.z - a.z;
    const apx = p.x - a.x, apz = p.z - a.z;
    const abLenSq = abx*abx + abz*abz;
    let t = 0;
    if (abLenSq > 0) t = (apx*abx + apz*abz) / abLenSq;
    t = Math.max(0, Math.min(1, t));
    const cx = a.x + abx * t, cz = a.z + abz * t;
    return Math.hypot(p.x - cx, p.z - cz);
}

function distToPath(p, waypoints) {
    let minD = Infinity;
    for (let i = 0; i < waypoints.length - 1; i++) {
        const d = distToSegment(p, waypoints[i], waypoints[i+1]);
        if (d < minD) minD = d;
    }
    return minD;
}

const ROAD_HALF_WIDTH = 1.75;
const TOWER_BASE_RADIUS = 1.1;

function generateTowerSpotsEven(waypoints, offsetFromEdge, count) {
    const spots = [];
    const radius = ROAD_HALF_WIDTH + offsetFromEdge + TOWER_BASE_RADIUS;
    const segLens = [];
    let totalLen = 0;
    for (let i = 0; i < waypoints.length - 1; i++) {
        const l = waypoints[i].distanceTo(waypoints[i+1]);
        segLens.push(l); totalLen += l;
    }
    const step = totalLen / count;
    const house1 = waypoints[0], house2 = waypoints[waypoints.length - 1];
    const minBetween = 6.0;

    for (let i = 0; i < count; i++) {
        const d = step * (i + 0.5);
        let acc = 0, segIdx = 0;
        for (let k = 0; k < segLens.length; k++) {
            if (acc + segLens[k] >= d) { segIdx = k; break; }
            acc += segLens[k];
        }
        const tLocal = (d - acc) / segLens[segIdx];
        const from = waypoints[segIdx], to = waypoints[segIdx + 1];
        const dx = to.x - from.x, dz = to.z - from.z;
        const len = segLens[segIdx] || 1;
        const dirX = dx / len, dirZ = dz / len;
        const perpX = -dirZ, perpZ = dirX;
        const side = (i % 2 === 0) ? 1 : -1;
        const cx = from.x + dx * tLocal + perpX * radius * side;
        const cz = from.z + dz * tLocal + perpZ * radius * side;
        const p = new THREE.Vector3(cx, 0, cz);

        if (Math.abs(p.x) > 52 || Math.abs(p.z) > 23) continue;
        if (p.distanceTo(house1) < 8 || p.distanceTo(house2) < 8) continue;
        if (distToPath(p, waypoints) < ROAD_HALF_WIDTH + 0.5) continue;

        let clash = false;
        for (const s of spots) if (p.distanceTo(s) < minBetween) { clash = true; break; }
        if (clash) continue;

        spots.push(p);
    }
    return spots;
}

const CORRIDOR_WAYPOINTS = [
    new THREE.Vector3(-52, 0, -22),
    new THREE.Vector3(-30, 0, -22),
    new THREE.Vector3(-20, 0, -16),
    new THREE.Vector3(-8, 0, -16),
    new THREE.Vector3(2, 0, -22),
    new THREE.Vector3(20, 0, -22),
    new THREE.Vector3(30, 0, -14),
    new THREE.Vector3(48, 0, -14),
    new THREE.Vector3(50, 0, -6),
    new THREE.Vector3(40, 0, 0),
    new THREE.Vector3(20, 0, 0),
    new THREE.Vector3(8, 0, -6),
    new THREE.Vector3(-8, 0, -6),
    new THREE.Vector3(-18, 0, 2),
    new THREE.Vector3(-30, 0, 2),
    new THREE.Vector3(-42, 0, 8),
    new THREE.Vector3(-38, 0, 14),
    new THREE.Vector3(-25, 0, 14),
    new THREE.Vector3(-12, 0, 22),
    new THREE.Vector3(5, 0, 22),
    new THREE.Vector3(15, 0, 14),
    new THREE.Vector3(30, 0, 14),
    new THREE.Vector3(42, 0, 20),
    new THREE.Vector3(52, 0, 20)
];

const HELL_WAYPOINTS = [
    new THREE.Vector3(-50, 0, 0),
    new THREE.Vector3(-40, 0, -14),
    new THREE.Vector3(-25, 0, -16),
    new THREE.Vector3(-16, 0, -6),
    new THREE.Vector3(-22, 0, 8),
    new THREE.Vector3(-12, 0, 16),
    new THREE.Vector3(4, 0, 16),
    new THREE.Vector3(14, 0, 8),
    new THREE.Vector3(6, 0, -8),
    new THREE.Vector3(18, 0, -16),
    new THREE.Vector3(34, 0, -16),
    new THREE.Vector3(44, 0, -6),
    new THREE.Vector3(50, 0, 0)
];

// Стратегические точки для снайперов на карте Ад
const HELL_SNIPER_SPOTS = [
    new THREE.Vector3(-45, 0, 10),    // у входа, обзор на первый поворот
    new THREE.Vector3(-30, 0, -22),   // над левой верхней петлёй
    new THREE.Vector3(0, 0, 0),       // центр карты — видит обе петли
    new THREE.Vector3(10, 0, -22),    // над центральной петлёй
    new THREE.Vector3(25, 0, 0),      // правый центр — видит средний изгиб
    new THREE.Vector3(40, 0, 10)      // у цитадели, обзор на выход
];

const hellTowerSpots = generateTowerSpotsEven(HELL_WAYPOINTS, 3.0, 24);
for (const p of HELL_SNIPER_SPOTS) {
    p.restrictedTo = 'sniper';
    hellTowerSpots.push(p);
}

const MAPS = {
    corridor: {
        id: 'corridor', name: 'Коридор', difficulty: 'Новичок',
        totalWaves: 20, startCoins: 200, baseHp: 20,
        waypoints: CORRIDOR_WAYPOINTS,
        towerSpots: generateTowerSpotsEven(CORRIDOR_WAYPOINTS, 3.0, 22)
    },
    hell: {
        id: 'hell', name: 'Последний Бастион', difficulty: 'Средняя',
        totalWaves: 20, startCoins: 200, baseHp: 20,
        waypoints: HELL_WAYPOINTS,
        towerSpots: hellTowerSpots
    }
};

let currentMap = null;
function setCurrentMap(mapId) {
    currentMap = MAPS[mapId] || MAPS.corridor;
    return currentMap;
}