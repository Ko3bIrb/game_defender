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

const LAKE_POLYGON = [
    new THREE.Vector2(-21, -39.5), 
    new THREE.Vector2(-15, -24),
    new THREE.Vector2(-13, -12), 
    new THREE.Vector2(-6, 0), 
    new THREE.Vector2(-4, 13), 
    new THREE.Vector2(4, 13), 
    new THREE.Vector2(6, 0), 
    new THREE.Vector2(13, -12), 
    new THREE.Vector2(15, -24), 
    new THREE.Vector2(21, -39.5), 
    new THREE.Vector2(15, -52), 
    new THREE.Vector2(0, -54),
    new THREE.Vector2(-15, -52)
];

function isPointInLake(x, z) {
    let inside = false;
    for (let i = 0, j = LAKE_POLYGON.length - 1; i < LAKE_POLYGON.length; j = i++) {
        const xi = LAKE_POLYGON[i].x, zi = LAKE_POLYGON[i].y;
        const xj = LAKE_POLYGON[j].x, zj = LAKE_POLYGON[j].y;
        const intersect = ((zi > z) != (zj > z)) && (x < (xj - xi) * (z - zi) / (zj - zi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

const ICE_WAYPOINTS = [
    new THREE.Vector3(-52, 0, 0), new THREE.Vector3(-45, 0, 0), new THREE.Vector3(-40, 0, -15),
    new THREE.Vector3(-33, 0, -15), new THREE.Vector3(-28, 0, -28), new THREE.Vector3(-25, 0, -28),
    new THREE.Vector3(-22, 0, -38), new THREE.Vector3(-14, 0, -25), new THREE.Vector3(-12, 0, -12),
    new THREE.Vector3(-6, 0, 0), new THREE.Vector3(-4, 0, 15), new THREE.Vector3(4, 0, 15),
    new THREE.Vector3(6, 0, 0), new THREE.Vector3(12, 0, -12), new THREE.Vector3(14, 0, -25),
    new THREE.Vector3(22, 0, -38), new THREE.Vector3(25, 0, -28), new THREE.Vector3(28, 0, -28),
    new THREE.Vector3(33, 0, -15), new THREE.Vector3(40, 0, -15), new THREE.Vector3(45, 0, 0),
    new THREE.Vector3(52, 0, 0)
];

// ─── ВНИМАНИЕ ───
// Центр озера (0, 0, -20) НЕ включён в ICE_PLATFORMS — иначе бы он
// сгенерировал обычную точку, где можно было бы ставить башни внахлёст
// со снайперской. Платформа в озере визуально отрисовывается в decor.js,
// а точка для башни добавляется ниже через SNIPER_SPOTS.
const ICE_PLATFORMS = [
    new THREE.Vector3(-8, 0, -28),
    new THREE.Vector3(8, 0, -28),
    new THREE.Vector3(-4, 0, -10),
    new THREE.Vector3(4, 0, -10)
];

const LAND_SPOTS = [
    new THREE.Vector3(-48, 0, -10),
    new THREE.Vector3(-38, 0, -25),
    new THREE.Vector3(-20, 0, -32),
    new THREE.Vector3(-18, 0, -16),
    new THREE.Vector3(-12, 0, -2),
    new THREE.Vector3(0, 0, 20),
    new THREE.Vector3(12, 0, -2),
    new THREE.Vector3(18, 0, -16),
    new THREE.Vector3(20, 0, -32),
    new THREE.Vector3(38, 0, -25),
    new THREE.Vector3(48, 0, -10)
];

const iceTowerSpots = [];
for (const p of [...LAND_SPOTS, ...ICE_PLATFORMS]) {
    let isValid = true;
    if (distToPath(p, ICE_WAYPOINTS) < 3.5) isValid = false;
    if (isPointInLake(p.x, p.z) && !ICE_PLATFORMS.some(plat => plat.distanceTo(p) < 1)) isValid = false;
    
    if (isValid) iceTowerSpots.push(p);
}

// 6 элитных точек для снайперов
const SNIPER_SPOTS = [
    new THREE.Vector3(-48, 0, -18),  // возле левых ворот
    new THREE.Vector3(-26, 0, -10),  // центр левой петли
    new THREE.Vector3(0, 0, 25),     // внизу по центру
    new THREE.Vector3(26, 0, -10),   // центр правой петли
    new THREE.Vector3(48, 0, -18),   // возле цитадели
    new THREE.Vector3(0, 0, -20)     // центр озера
];

for (const p of SNIPER_SPOTS) {
    p.restrictedTo = 'sniper';
    iceTowerSpots.push(p);
}

const MAPS = {
    ice: {
        id: 'ice', name: 'Ледяной Предел', difficulty: 'Средняя',
        totalWaves: 20, startCoins: 200, baseHp: 20,
        waypoints: ICE_WAYPOINTS,
        towerSpots: iceTowerSpots
    }
};

let currentMap = null;
function setCurrentMap(mapId) {
    currentMap = MAPS[mapId] || MAPS.ice;
    return currentMap;
}