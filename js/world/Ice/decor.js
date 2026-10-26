// js/world/Ice/decor.js

const MANUAL_DECOR = [
    // ── ФАКЕЛЫ ──
    { type: 'torch', x: -38.23, z: -6.08 },
    { type: 'torch', x: -36.5, z: -10.5 },
    { type: 'torch', x: -26.3, z: -19.88 },
    { type: 'torch', x: -26.5, z: -23.5 },
    { type: 'torch', x: -27.81, z: -34.29 },
    { type: 'torch', x: -17.45, z: -17.82 },
    { type: 'torch', x: -13.02, z: -3.99 },
    { type: 'torch', x: -9.46, z: 8.09 },
    { type: 'torch', x: 9.46, z: 8.09 },
    { type: 'torch', x: 13.02, z: -3.99 },
    { type: 'torch', x: 17.45, z: -17.82 },
    { type: 'torch', x: 27.81, z: -34.29 },
    { type: 'torch', x: 26.5, z: -23.5 },
    { type: 'torch', x: 26.3, z: -19.88 },
    { type: 'torch', x: 36.5, z: -10.5 },
    { type: 'torch', x: 38.23, z: -6.08 },

    // ── ОСТАЛЬНОЙ ДЕКОР ──
    { type: 'crystal', x: -51.91, z: -52.02 },
    { type: 'statue', x: -47.81, z: -35.49 },
    { type: 'obelisk', x: -48.36, z: -28.94 },
    { type: 'snowdrift', x: -51.23, z: 26.64 },
    { type: 'deadtree', x: -49.1, z: 34.05 },
    { type: 'snowdrift', x: -51.26, z: 39.54 },
    { type: 'snowdrift', x: -44.33, z: -49.32 },
    { type: 'deadtree', x: -42.56, z: -32.34 },
    { type: 'rock', x: -45.32, z: -24.81 },
    { type: 'pine', x: -42.25, z: 4.12 },
    { type: 'cozy', x: -43.15, z: 17.87 },
    { type: 'rock', x: -41.69, z: 25 },
    { type: 'rock', x: -40.31, z: 40.29 },
    { type: 'rock', x: -45.3, z: 47.54 },
    { type: 'pine', x: -33.18, z: -47.68 },
    { type: 'rock', x: -34.76, z: -36.42 },
    { type: 'pine', x: -33.81, z: -25.2 },
    { type: 'crystal', x: -37.5, z: -9.98 },
    { type: 'pine', x: -34.07, z: 4.64 },
    { type: 'pine', x: -36.5, z: 9.93 },
    { type: 'rock', x: -35.19, z: 16.68 },
    { type: 'rock', x: -34.56, z: 27.42 },
    { type: 'pillar', x: -35.56, z: 32.92 },
    { type: 'iceberg', x: -35.62, z: 40.7 },
    { type: 'rock', x: -37.52, z: 45.12 },
    { type: 'crystal', x: -29.34, z: -49.64 },
    { type: 'pine', x: -24.59, z: -43.45 },
    { type: 'pine', x: -28.42, z: -36.55 },
    { type: 'rock', x: -26.49, z: -5.15 },
    { type: 'ruins', x: -29.56, z: 10.13 },
    { type: 'pine', x: -28.29, z: 24.53 },
    { type: 'pine', x: -29.78, z: 32.14 },
    { type: 'iceberg', x: -27.41, z: 42.9 },
    { type: 'iceberg', x: -28.01, z: 48.71 },
    { type: 'rock', x: -21.85, z: -9.94 },
    { type: 'pine', x: -19.59, z: -7.57 },
    { type: 'pillar', x: -22.13, z: 1.64 },
    { type: 'rock', x: -21.06, z: 19.85 },
    { type: 'statue', x: -20.13, z: 24.49 },
    { type: 'crystal', x: -22.29, z: 44.87 },
    { type: 'pine', x: -13.54, z: -6.04 },
    { type: 'pine', x: -14.66, z: 8.62 },
    { type: 'crystal', x: -15.41, z: 16.59 },
    { type: 'rock', x: -14.42, z: 30.06 },
    { type: 'ruins', x: -9.76, z: 41.78 },
    { type: 'deadtree', x: -12.84, z: 47.38 },
    { type: 'pine', x: -7.66, z: 27.59 },
    { type: 'pine', x: -7.59, z: 31.24 },
    { type: 'pine', x: -7.06, z: 48.2 },
    { type: 'pine', x: 2.43, z: 24.23 },
    { type: 'pine', x: 0.4, z: 30.89 },
    { type: 'obelisk', x: 0.84, z: 37.73 },
    { type: 'statue', x: 3.89, z: 45.04 },
    { type: 'rock', x: 12.51, z: 3.18 },
    { type: 'rock', x: 10.13, z: 25.78 },
    { type: 'pine', x: 9.4, z: 31.19 },
    { type: 'pine', x: 10.32, z: 45.32 },
    { type: 'pine', x: 15.63, z: -10.81 },
    { type: 'pine', x: 16.53, z: -4.2 },
    { type: 'pine', x: 18.07, z: 10.03 },
    { type: 'pine', x: 19.97, z: 18.48 },
    { type: 'pine', x: 18.66, z: 27.34 },
    { type: 'deadtree', x: 15.45, z: 42.63 },
    { type: 'pine', x: 26.45, z: -49.63 },
    { type: 'pine', x: 25.78, z: -44.1 },
    { type: 'pine', x: 24.59, z: -22.93 },
    { type: 'pine', x: 27.91, z: -2.26 },
    { type: 'statue', x: 26.96, z: 12 },
    { type: 'iceberg', x: 27.6, z: 25.71 },
    { type: 'pillar', x: 22.67, z: 40.62 },
    { type: 'pine', x: 32.22, z: -39.55 },
    { type: 'rock', x: 32.08, z: -2.84 },
    { type: 'crystal', x: 34.56, z: 1.55 },
    { type: 'cozy', x: 33.03, z: 9.14 },
    { type: 'snowdrift', x: 30.65, z: 27.11 },
    { type: 'rock', x: 32.45, z: 42.16 },
    { type: 'ruins', x: 39.27, z: -44.68 },
    { type: 'crystal', x: 39.49, z: -28.15 },
    { type: 'pine', x: 41.35, z: 3.1 },
    { type: 'pine', x: 41.56, z: 9.15 },
    { type: 'deadtree', x: 41.32, z: 15.58 },
    { type: 'iceberg', x: 41.89, z: 24.73 },
    { type: 'iceberg', x: 37.33, z: 48.85 },
    { type: 'snowdrift', x: 45.97, z: -48.9 },
    { type: 'pine', x: 45.37, z: -42.83 },
    { type: 'iceberg', x: 49.78, z: -35.64 },
    { type: 'pine', x: 47.55, z: -25.17 },
    { type: 'pine', x: 45.46, z: -12.52 },
    { type: 'pine', x: 44.73, z: 9.37 },
    { type: 'pine', x: 49.03, z: 14.69 },
    { type: 'pine', x: 44.92, z: 22.68 },
    { type: 'pine', x: 44.57, z: 41.12 },
    { type: 'cozy', x: 49.41, z: 47.45 },

    // ── СТЕНА ПО ПЕРИМЕТРУ ──
    { type: 'rock_ice', x: -21.12, z: -65.26 },
    { type: 'rock_ice', x: 58.73, z: 56.37 },
    { type: 'rock_ice', x: 60.2, z: 47.6 },
    { type: 'rock_ice', x: 6.77, z: 58.37 },
    { type: 'rock_ice', x: 16.75, z: -58.32 },
    { type: 'rock_ice', x: -60.31, z: 27.9 },
    { type: 'rock_ice', x: -46.67, z: -63.09 },
    { type: 'rock_ice', x: -43.67, z: 55.9 },
    { type: 'rock_ice', x: 56.73, z: 28.74 },
    { type: 'rock_ice', x: 64.83, z: 34 },
    { type: 'rock_ice', x: -5.19, z: 59.61 },
    { type: 'rock_ice', x: 5.89, z: -63.84 },
    { type: 'rock_ice', x: 55.42, z: 13.07 },
    { type: 'rock_ice', x: -62.63, z: -30.04 },
    { type: 'rock_ice', x: 63.14, z: -42.41 },
    { type: 'rock_ice', x: -19.17, z: 60.25 },
    { type: 'rock_ice', x: -55.19, z: 19.26 },
    { type: 'rock_ice', x: 48.17, z: -62.37 },
    { type: 'rock_ice', x: 15.39, z: -66.11 },
    { type: 'rock_ice', x: 29.79, z: 52.76 },
    { type: 'rock_ice', x: -64.57, z: -38.56 },
    { type: 'rock_ice', x: -38.42, z: -63.98 },
    { type: 'rock_ice', x: 64.38, z: 3.75 },
    { type: 'rock_ice', x: 64.51, z: 25.85 },
    { type: 'rock_ice', x: 56.03, z: -22.02 },
    { type: 'rock_ice', x: 13.96, z: 52.71 },
    { type: 'rock_ice', x: 64.63, z: 41.62 },
    { type: 'rock_ice', x: -57.9, z: -47.68 },
    { type: 'rock_ice', x: -59.5, z: 11.6 },
    { type: 'rock_ice', x: -57.54, z: -35.37 },
    { type: 'rock_ice', x: -60.73, z: 52.83 },
    { type: 'rock_ice', x: 62.07, z: -9.16 },
    { type: 'rock_ice', x: -11.34, z: 52.4 },
    { type: 'rock_ice', x: -10.5, z: -67.9 },
    { type: 'rock_ice', x: -57.62, z: 38.94 },
    { type: 'rock_ice', x: 49.07, z: 59.38 },
    { type: 'rock_ice', x: 38.49, z: -67.32 },
    { type: 'rock_ice', x: 55.14, z: -43.32 },
    { type: 'rock_ice', x: -1.1, z: -62.88 },
    { type: 'rock_ice', x: 18.8, z: 60.09 },
    { type: 'rock_ice', x: 61.7, z: -29.65 },
    { type: 'rock_ice', x: -64.76, z: -12.3 },
    { type: 'rock_ice', x: 22.51, z: -65.71 },
    { type: 'rock_ice', x: -53.53, z: 53.08 },
    { type: 'rock_ice', x: 55.36, z: -53.63 },
    { type: 'rock_ice', x: -34.55, z: 54.49 },
    { type: 'rock_ice', x: -58.19, z: -65.91 },
    { type: 'rock_ice', x: -59.01, z: -23 },
    { type: 'rock_ice', x: -34.21, z: -58.13 }
];

let decorGroup = null;
let snowSystem = null;

const _LAKE_POLYGON = [
    new THREE.Vector2(-21, -39.5), new THREE.Vector2(-15, -24), new THREE.Vector2(-13, -12),
    new THREE.Vector2(-6, 0), new THREE.Vector2(-4, 13), new THREE.Vector2(4, 13),
    new THREE.Vector2(6, 0), new THREE.Vector2(13, -12), new THREE.Vector2(15, -24),
    new THREE.Vector2(21, -39.5), new THREE.Vector2(15, -52), new THREE.Vector2(0, -54),
    new THREE.Vector2(-15, -52)
];
const _ICE_PLATFORMS = [
    new THREE.Vector3(-8, 0, -28), new THREE.Vector3(8, 0, -28),
    new THREE.Vector3(-4, 0, -10), new THREE.Vector3(4, 0, -10),
    new THREE.Vector3(0, 0, -20)   // ← платформа для снайпера в центре озера
];

const _mat = (c, r=0.8, m=0.2, e=0x000000, ei=0) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m, emissive: e, emissiveIntensity: ei });

function _glowSprite(color, size) {
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const cx = c.getContext('2d'); const r = (color >> 16) & 255, g = (color >> 8) & 255, b = color & 255;
    const grd = cx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, 'rgba(255,255,255,1)'); grd.addColorStop(0.25, `rgba(${r},${g},${b},1)`);
    grd.addColorStop(0.6, `rgba(${r},${g},${b},0.35)`); grd.addColorStop(1, 'rgba(0,0,0,0)');
    cx.fillStyle = grd; cx.fillRect(0, 0, 64, 64);
    const tex = new THREE.CanvasTexture(c);
    const mat = new THREE.SpriteMaterial({ map: tex, color: 0xffffff, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false });
    const sprite = new THREE.Sprite(mat); sprite.scale.set(size, size, 1); return sprite;
}

function inLake(p) {
    for (const plat of _ICE_PLATFORMS) { if (p.distanceTo(plat) < 1.5) return false; }
    let inside = false;
    for (let i = 0, j = _LAKE_POLYGON.length - 1; i < _LAKE_POLYGON.length; j = i++) {
        const xi = _LAKE_POLYGON[i].x, zi = _LAKE_POLYGON[i].y;
        const xj = _LAKE_POLYGON[j].x, zj = _LAKE_POLYGON[j].y;
        const intersect = ((zi > p.z) != (zj > p.z)) && (p.x < (xj - xi) * (p.z - zi) / (zj - zi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

function createPerimeterRock(pos) {
    const g = new THREE.Group();
    const r = 3 + Math.random() * 3;
    const rockMat = _mat(0x5a6b7c, 0.9, 0.2);
    const iceMat = _mat(0x88ccff, 0.2, 0.8, 0x224466, 0.3);
    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(r, 0), rockMat);
    rock.position.y = r * 0.6; rock.scale.set(1, 0.8, 1); g.add(rock);
    for(let i=0; i<3; i++) {
        const h = 2 + Math.random() * 3;
        const spike = new THREE.Mesh(new THREE.ConeGeometry(0.4, h, 5), iceMat);
        spike.position.set((Math.random()-0.5)*r*0.8, r*1.2, (Math.random()-0.5)*r*0.8); g.add(spike);
    }
    g.position.copy(pos); g.rotation.y = Math.random() * Math.PI; return g;
}

function createLake() {
    const g = new THREE.Group();
    const shape = new THREE.Shape();
    shape.moveTo(_LAKE_POLYGON[0].x, -_LAKE_POLYGON[0].y);
    for (let i = 1; i < _LAKE_POLYGON.length; i++) { shape.lineTo(_LAKE_POLYGON[i].x, -_LAKE_POLYGON[i].y); }
    shape.lineTo(_LAKE_POLYGON[0].x, -_LAKE_POLYGON[0].y);

    const lakeGeo = new THREE.ShapeGeometry(shape);
    const lakeMat = new THREE.MeshStandardMaterial({
        color: 0x1a2a4a, roughness: 0.1, metalness: 0.9, transparent: true, opacity: 0.85,
        emissive: 0x051020, emissiveIntensity: 0.2, side: THREE.DoubleSide
    });
    const lake = new THREE.Mesh(lakeGeo, lakeMat);
    lake.rotation.x = -Math.PI / 2; 
    lake.position.y = 0.01; g.add(lake);

    for (const p of _ICE_PLATFORMS) {
        for (let i = 0; i < 4; i++) {
            const ang = (i / 4) * Math.PI * 2 + Math.PI/4;
            const pile = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 2.5, 5), _mat(0x1a1510, 0.9, 0.1));
            pile.position.set(p.x + Math.cos(ang)*0.8, -1.0, p.z + Math.sin(ang)*0.8); g.add(pile);
        }
    }
    return g;
}

function createMountain(pos) {
    const g = new THREE.Group();
    const rockMat = _mat(0x1a2025, 0.95, 0.15, 0x050a10, 0.1);
    const darkRock = _mat(0x0e1518, 0.95, 0.2);
    const snowMat = _mat(0xddeeff, 0.9, 0.05);
    const baseGeo = new THREE.DodecahedronGeometry(22, 2);
    const posAttr = baseGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
        let x = posAttr.getX(i), y = posAttr.getY(i), z = posAttr.getZ(i);
        if (y < 0) y = 0;
        const noise = Math.sin(x*0.5) * Math.cos(z*0.5) * 2;
        posAttr.setX(i, x + noise); posAttr.setY(i, y + Math.random() * 2); posAttr.setZ(i, z + noise);
    }
    baseGeo.computeVertexNormals();
    const base = new THREE.Mesh(baseGeo, rockMat);
    base.position.y = 5; base.scale.set(1.6, 1.4, 0.8); g.add(base);
    for (let i = 0; i < 6; i++) {
        const h = 20 + Math.random() * 15, r = 5 + Math.random() * 4;
        const peak = new THREE.Mesh(new THREE.ConeGeometry(r, h, 6), darkRock);
        peak.position.set((Math.random()-0.5)*20, 15 + Math.random()*8, (Math.random()-0.5)*12);
        peak.rotation.set((Math.random()-0.5)*0.3, Math.random()*Math.PI, (Math.random()-0.5)*0.3); g.add(peak);
        const cap = new THREE.Mesh(new THREE.ConeGeometry(r*0.6, h*0.4, 6), snowMat);
        cap.position.set(peak.position.x, peak.position.y + h*0.3, peak.position.z);
        cap.rotation.copy(peak.rotation); g.add(cap);
    }
    g.position.copy(pos); return g;
}

function createGateway(pos, dir) {
    const g = new THREE.Group();
    const mat = _mat(0x5588bb, 0.3, 0.7, 0x112244, 0.3);
    const iceMat = _mat(0x88ccff, 0.2, 0.8, 0x224466, 0.4);
    const h = 5.5, width = 3.2;
    for (const side of [-1, 1]) {
        const col = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.8, h, 6), mat); col.position.set(side * width, h/2, 0); g.add(col);
    }
    const beam = new THREE.Mesh(new THREE.BoxGeometry(width * 2 + 1, 0.8, 1.2), mat); beam.position.y = h; g.add(beam);
    for (let i = 0; i < 3; i++) {
        const spike = new THREE.Mesh(new THREE.ConeGeometry(0.3, 1.8, 4), iceMat); spike.position.set((i - 1) * 1.8, h + 1.2, 0); g.add(spike);
    }
    g.position.copy(pos); if (dir) g.rotation.y = Math.atan2(dir.x, dir.z); return g;
}

function createSnowPine(pos) {
    const g = new THREE.Group(); const h = 2.5 + Math.random() * 3.5;
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.35, h, 5), _mat(0x1a1510, 0.9)); trunk.position.y = h/2; g.add(trunk);
    for (let i = 0; i < 3; i++) {
        const cone = new THREE.Mesh(new THREE.ConeGeometry(1.4 - i*0.3, h*0.6, 6), _mat(0x0a1520, 0.8, 0.1, 0x002244, 0.2)); cone.position.y = h * 0.5 + i * h * 0.25; g.add(cone);
    }
    const snow = new THREE.Mesh(new THREE.ConeGeometry(0.7, 1, 6), _mat(0xddeeff, 0.9)); snow.position.y = h * 1.25; g.add(snow);
    g.position.copy(pos); g.rotation.y = Math.random() * Math.PI * 2; return g;
}

function createIceRock(pos) {
    const g = new THREE.Group(); const r = 0.8 + Math.random() * 1.5;
    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(r, 0), _mat(0x2a3b4c, 0.7, 0.4, 0x112233, 0.2));
    rock.position.y = r * 0.5; rock.scale.set(1, 0.6 + Math.random()*0.3, 1); rock.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI); g.add(rock);
    const iceCap = new THREE.Mesh(new THREE.SphereGeometry(r*0.7, 6, 4), _mat(0xddeeff, 0.9)); iceCap.scale.set(1, 0.2, 1); iceCap.position.y = r * 0.8; g.add(iceCap);
    g.position.copy(pos); return g;
}

function createCrystalCluster(pos) {
    const g = new THREE.Group(); const count = 3 + Math.floor(Math.random() * 4);
    const crystalMat = _mat(0x5588bb, 0.15, 0.85, 0x114488, 0.5);
    for (let i = 0; i < count; i++) {
        const h = 1 + Math.random() * 2;
        const spike = new THREE.Mesh(new THREE.ConeGeometry(0.2 + Math.random()*0.15, h, 4), crystalMat);
        spike.position.set((Math.random()-0.5)*1.2, h/2, (Math.random()-0.5)*1.2); spike.rotation.z = (Math.random()-0.5)*0.6; spike.rotation.x = (Math.random()-0.5)*0.6; g.add(spike);
    }
    g.position.copy(pos); return g;
}

function createTorch(pos) {
    const g = new THREE.Group();
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 2.2, 6), _mat(0x1a1510, 0.9, 0.1)); pole.position.y = 1.1; g.add(pole);
    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.15, 0.4, 6), _mat(0x2a1a0a, 0.8, 0.5)); bowl.position.y = 2.2; g.add(bowl);
    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.5, 5), new THREE.MeshBasicMaterial({ color: 0xffaa44 })); flame.position.y = 2.5; g.add(flame);
    const glow = _glowSprite(0xff7722, 1.5); glow.position.y = 2.5; g.add(glow);
    const light = new THREE.PointLight(0xff7722, 0.4, 7); light.position.y = 2.5; g.add(light);
    g.position.copy(pos); g.rotation.y = Math.random() * Math.PI * 2; return g;
}

function createRuins(pos) {
    const g = new THREE.Group(); const stoneMat = _mat(0x1a2025, 0.9, 0.3);
    const wall = new THREE.Mesh(new THREE.BoxGeometry(2.5 + Math.random()*1.5, 1.2 + Math.random()*1.5, 0.5), stoneMat);
    wall.position.y = 0.8; wall.rotation.y = Math.random() * Math.PI; g.add(wall);
    for (let i = 0; i < 3; i++) {
        const block = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.6), stoneMat);
        block.position.set((Math.random()-0.5)*3, 0.3, (Math.random()-0.5)*3); block.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI); g.add(block);
    }
    g.position.copy(pos); return g;
}

function createDeadTree(pos) {
    const g = new THREE.Group(); const woodMat = _mat(0x1a1510, 0.95, 0.05); const h = 1.5 + Math.random() * 2;
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.2, h, 5), woodMat); trunk.position.y = h/2; trunk.rotation.z = (Math.random()-0.5) * 0.2; g.add(trunk);
    for (let i = 0; i < 3; i++) {
        const ang = Math.random() * Math.PI * 2, bl = 0.5 + Math.random() * 0.6;
        const branch = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.06, bl, 4), woodMat);
        branch.position.set(Math.cos(ang)*0.2, h*0.7 + i*0.2, Math.sin(ang)*0.2); branch.rotation.z = Math.cos(ang) * 0.9; branch.rotation.x = -Math.sin(ang) * 0.9; g.add(branch);
    }
    g.position.copy(pos); return g;
}

function createAncientSkeleton(pos) {
    const g = new THREE.Group(); const boneMat = _mat(0x9ab0c0, 0.8, 0.1);
    for (let i = 0; i < 5; i++) {
        const rib = new THREE.Mesh(new THREE.TorusGeometry(1.2 - i*0.1, 0.1, 4, 8, Math.PI), boneMat);
        rib.rotation.x = -Math.PI / 2; rib.rotation.z = Math.PI / 2; rib.position.set(0, 0.15, i * 0.6 - 1.2); g.add(rib);
    }
    for (let i = 0; i < 5; i++) { const vert = new THREE.Mesh(new THREE.SphereGeometry(0.12, 5, 4), boneMat); vert.position.set(0, 0.3, i * 0.6 - 1.2); g.add(vert); }
    const skull = new THREE.Mesh(new THREE.SphereGeometry(0.4, 8, 6), boneMat); skull.scale.set(1.2, 0.9, 1.5); skull.position.set(0, 0.4, 2.0); g.add(skull);
    for (const sign of [-1, 1]) { const tusk = new THREE.Mesh(new THREE.ConeGeometry(0.08, 1.2, 5), boneMat); tusk.position.set(sign * 0.3, 0.3, 2.4); tusk.rotation.x = -0.4; tusk.rotation.z = sign * 0.3; g.add(tusk); }
    g.position.copy(pos); g.rotation.y = Math.random() * Math.PI * 2; return g;
}

function createFrozenStatue(pos) {
    const g = new THREE.Group(); const stoneMat = _mat(0x3a4a5c, 0.6, 0.4); const iceMat = _mat(0x88ccff, 0.2, 0.7, 0x224466, 0.4);
    const base = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.6, 1.6), stoneMat); base.position.y = 0.3; g.add(base);
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.5, 0.5), stoneMat); body.position.y = 1.35; g.add(body);
    const head = new THREE.Mesh(new THREE.IcosahedronGeometry(0.35, 0), stoneMat); head.position.y = 2.4; g.add(head);
    for (let i = 0; i < 4; i++) {
        const ang = (i / 4) * Math.PI * 2; const spike = new THREE.Mesh(new THREE.ConeGeometry(0.1, 1.2, 4), iceMat);
        spike.position.set(Math.cos(ang) * 0.5, 2.5, Math.sin(ang) * 0.5); spike.rotation.z = Math.cos(ang) * 0.3; spike.rotation.x = -Math.sin(ang) * 0.3; g.add(spike);
    }
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
    for (const sign of [-1, 1]) { const eye = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 4), eyeMat); eye.position.set(sign * 0.15, 2.4, 0.28); g.add(eye); }
    g.position.copy(pos); g.rotation.y = Math.random() * Math.PI * 2; return g;
}

function createBrokenPillar(pos) {
    const g = new THREE.Group(); const stoneMat = _mat(0x1a2025, 0.9, 0.3); const h = 1.5 + Math.random() * 2;
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, h, 6), stoneMat); pillar.position.y = h/2; pillar.rotation.z = (Math.random()-0.5)*0.3; g.add(pillar);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.4, 0.3, 6), stoneMat); cap.position.y = h + 0.1; cap.rotation.z = (Math.random()-0.5)*0.4; g.add(cap);
    g.position.copy(pos); return g;
}

function createIceObelisk(pos) {
    const g = new THREE.Group(); const h = 3 + Math.random() * 3; const crystalMat = _mat(0x5588bb, 0.2, 0.8, 0x113366, 0.5);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.9, 0.8, 6), _mat(0x2a3b4c, 0.8, 0.3)); base.position.y = 0.4; g.add(base);
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.4, h, 4), crystalMat); pillar.position.y = h/2 + 0.8; pillar.rotation.y = Math.PI/4; g.add(pillar);
    const top = new THREE.Mesh(new THREE.OctahedronGeometry(0.4, 0), crystalMat); top.position.y = h + 0.9; g.add(top);
    g.position.copy(pos); g.rotation.y = Math.random() * Math.PI; return g;
}

function createMassiveIceberg(pos) {
    const g = new THREE.Group(); const r = 4 + Math.random() * 4, h = 8 + Math.random() * 12;
    const mat = _mat(0x2a4a6a, 0.4, 0.6, 0x112244, 0.2); const iceMat = _mat(0x88ccff, 0.2, 0.7, 0x224466, 0.3);
    const base = new THREE.Mesh(new THREE.DodecahedronGeometry(r, 0), mat); base.position.y = h * 0.3; base.scale.set(1, h/r * 0.4, 1); g.add(base);
    for(let i=0; i<4; i++) {
        const spike = new THREE.Mesh(new THREE.ConeGeometry(r*0.3, h*0.8, 5), iceMat);
        spike.position.set((Math.random()-0.5)*r, h*0.5, (Math.random()-0.5)*r); spike.rotation.set((Math.random()-0.5)*0.5, Math.random()*Math.PI, (Math.random()-0.5)*0.5); g.add(spike);
    }
    g.position.copy(pos); g.rotation.y = Math.random() * Math.PI; return g;
}

function createSnowdrift(pos) {
    const g = new THREE.Group();
    const drift = new THREE.Mesh(new THREE.SphereGeometry(1.2 + Math.random()*1.2, 8, 6), _mat(0xddeeff, 0.95, 0.05));
    drift.scale.set(1.2, 0.3 + Math.random()*0.2, 1.0); drift.position.y = 0.1; g.add(drift); g.position.copy(pos); return g;
}

function createCozySpot(pos) {
    const g = new THREE.Group();
    g.add(createTorch(new THREE.Vector3(0, 0, 0)));
    const tree = createSnowPine(new THREE.Vector3(1.8, 0, 0.5)); tree.scale.set(0.6, 0.6, 0.6); g.add(tree);
    const rock = createIceRock(new THREE.Vector3(-1.5, 0, 1.2)); rock.scale.set(0.7, 0.7, 0.7); g.add(rock);
    g.position.copy(pos); g.rotation.y = Math.random() * Math.PI * 2; return g;
}

function createDecor(waypoints, towerSpots) {
    if (decorGroup) scene.remove(decorGroup);
    decorGroup = new THREE.Group();

    decorGroup.add(createLake());
    decorGroup.add(createMountain(new THREE.Vector3(0, 0, -48)));

    const archPoints = [{ x: -31.5, z: -18.9 }, { x: 31.5, z: -18.9 }];
    for (const ap of archPoints) {
        const p = new THREE.Vector3(ap.x, 0, ap.z); let closestIdx = 0, minDist = Infinity;
        for (let i = 0; i < waypoints.length - 1; i++) {
            const d = distToSegment(p, waypoints[i], waypoints[i+1]); if (d < minDist) { minDist = d; closestIdx = i; }
        }
        const dir = new THREE.Vector3().subVectors(waypoints[closestIdx+1], waypoints[closestIdx]).normalize();
        decorGroup.add(createGateway(p, dir));
    }

    for (let i = 0; i < MANUAL_DECOR.length; i++) {
        const item = MANUAL_DECOR[i];
        const pos = new THREE.Vector3(item.x, 0, item.z);

        switch(item.type) {
            case 'pine': decorGroup.add(createSnowPine(pos)); break;
            case 'rock': decorGroup.add(createIceRock(pos)); break;
            case 'crystal': decorGroup.add(createCrystalCluster(pos)); break;
            case 'ruins': decorGroup.add(createRuins(pos)); break;
            case 'deadtree': decorGroup.add(createDeadTree(pos)); break;
            case 'skeleton': decorGroup.add(createAncientSkeleton(pos)); break;
            case 'statue': decorGroup.add(createFrozenStatue(pos)); break;
            case 'pillar': decorGroup.add(createBrokenPillar(pos)); break;
            case 'obelisk': decorGroup.add(createIceObelisk(pos)); break;
            case 'iceberg': decorGroup.add(createMassiveIceberg(pos)); break;
            case 'snowdrift': decorGroup.add(createSnowdrift(pos)); break;
            case 'rock_ice': decorGroup.add(createPerimeterRock(pos)); break; 
            case 'torch': decorGroup.add(createTorch(pos)); break;
            case 'cozy': decorGroup.add(createCozySpot(pos)); break;
            default: console.warn(`Неизвестный тип: ${item.type}`);
        }
    }

    createSnowParticles(); 
    scene.add(decorGroup); 
    return decorGroup;
}

function createSnowParticles() {
    const count = 1500; const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3); const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        pos[i * 3] = (Math.random() - 0.5) * 150; pos[i * 3 + 1] = Math.random() * 40; pos[i * 3 + 2] = -65 + Math.random() * 130;
        vel[i * 3] = (Math.random() - 0.5) * 0.6; vel[i * 3 + 1] = -0.4 - Math.random() * 0.8; vel[i * 3 + 2] = (Math.random() - 0.5) * 0.6;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.15, transparent: true, opacity: 0.8, depthWrite: false, blending: THREE.AdditiveBlending });
    const points = new THREE.Points(geo, mat); scene.add(points); snowSystem = { points, vel };
}

function updateDecor(dt) {
    if (snowSystem) {
        const positions = snowSystem.points.geometry.attributes.position.array; const vel = snowSystem.vel;
        for (let i = 0; i < positions.length; i += 3) {
            positions[i] += vel[i] * dt; positions[i + 1] += vel[i + 1] * dt; positions[i + 2] += vel[i + 2] * dt;
            if (positions[i + 1] < 0) {
                positions[i + 1] = 40; positions[i] = (Math.random() - 0.5) * 150; positions[i + 2] = -65 + Math.random() * 130;
            }
        }
        snowSystem.points.geometry.attributes.position.needsUpdate = true;
    }
}