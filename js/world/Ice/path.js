let pathGroup = null;
const _iceEffects = [];

// ─── Helper: один InstancedMesh на группу трансформаций ───
function _makeInstanced(geo, mat, transforms, castShadow = false) {
    if (!transforms.length) return null;
    const mesh = new THREE.InstancedMesh(geo, mat, transforms.length);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < transforms.length; i++) {
        const t = transforms[i];
        dummy.position.set(t.x || 0, t.y || 0, t.z || 0);
        dummy.rotation.set(t.rx || 0, t.ry || 0, t.rz || 0);
        dummy.scale.set(
            t.sx != null ? t.sx : 1,
            t.sy != null ? t.sy : 1,
            t.sz != null ? t.sz : 1
        );
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    mesh.castShadow = castShadow;
    mesh.receiveShadow = false;
    return mesh;
}

// ─── ПРОЦЕДУРНЫЕ ТЕКСТУРЫ ───
let _texCache = {};

function getRealisticIceRoad() {
    if (_texCache.road) return _texCache.road;
    const size = 1024;
    const c = document.createElement('canvas');
    c.width = size; c.height = size;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#3a5578'; ctx.fillRect(0, 0, size, size);
    for(let i=0; i<8000; i++) {
        const shade = Math.random();
        ctx.fillStyle = shade > 0.5 ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.15)';
        ctx.fillRect(Math.random()*size, Math.random()*size, Math.random()*4+1, Math.random()*4+1);
    }
    for(let i=0; i<100; i++) {
        ctx.strokeStyle = `rgba(10, 20, 35, ${Math.random()*0.6 + 0.4})`;
        ctx.lineWidth = Math.random()*3 + 0.5;
        ctx.beginPath();
        let x = Math.random()*size, y = Math.random()*size;
        ctx.moveTo(x, y);
        const segments = Math.floor(Math.random()*5) + 2;
        for(let j=0; j<segments; j++) {
            x += (Math.random()-0.5)*200; y += (Math.random()-0.5)*200; ctx.lineTo(x, y);
        }
        ctx.stroke();
    }
    for(let i=0; i<100; i++) {
        const r = Math.random()*100 + 30;
        const grd = ctx.createRadialGradient(Math.random()*size, Math.random()*size, 0, Math.random()*size, Math.random()*size, r);
        grd.addColorStop(0, 'rgba(180, 220, 255, 0.1)'); grd.addColorStop(1, 'rgba(180, 220, 255, 0)');
        ctx.fillStyle = grd; ctx.fillRect(0, 0, size, size);
    }
    _texCache.road = new THREE.CanvasTexture(c);
    _texCache.road.wrapS = THREE.RepeatWrapping; _texCache.road.wrapT = THREE.RepeatWrapping;
    _texCache.road.anisotropy = renderer.capabilities.getMaxAnisotropy();
    return _texCache.road;
}

function getRealisticIceRoadBump() {
    if (_texCache.roadBump) return _texCache.roadBump;
    const size = 1024;
    const c = document.createElement('canvas');
    c.width = size; c.height = size;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#808080'; ctx.fillRect(0, 0, size, size);
    for(let i=0; i<500; i++) {
        ctx.fillStyle = `rgba(0,0,0,${Math.random()*0.4})`;
        ctx.beginPath(); ctx.arc(Math.random()*size, Math.random()*size, Math.random()*30+5, 0, Math.PI*2); ctx.fill();
    }
    for(let i=0; i<300; i++) {
        ctx.fillStyle = `rgba(255,255,255,${Math.random()*0.3})`;
        ctx.beginPath(); ctx.arc(Math.random()*size, Math.random()*size, Math.random()*20+2, 0, Math.PI*2); ctx.fill();
    }
    for(let i=0; i<80; i++) {
        ctx.strokeStyle = 'rgba(0,0,0,0.8)';
        ctx.lineWidth = Math.random()*4 + 1;
        ctx.beginPath();
        let x = Math.random()*size, y = Math.random()*size; ctx.moveTo(x, y);
        for(let j=0; j<4; j++) { x += (Math.random()-0.5)*200; y += (Math.random()-0.5)*200; ctx.lineTo(x, y); }
        ctx.stroke();
    }
    _texCache.roadBump = new THREE.CanvasTexture(c);
    _texCache.roadBump.wrapS = THREE.RepeatWrapping; _texCache.roadBump.wrapT = THREE.RepeatWrapping;
    _texCache.roadBump.anisotropy = renderer.capabilities.getMaxAnisotropy();
    return _texCache.roadBump;
}

function getRealisticIceDirt() {
    if (_texCache.dirt) return _texCache.dirt;
    const size = 512;
    const c = document.createElement('canvas'); c.width = size; c.height = size;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#1a2a38'; ctx.fillRect(0, 0, size, size);
    for(let i=0; i<3000; i++) {
        ctx.fillStyle = Math.random() > 0.3 ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.2)';
        ctx.fillRect(Math.random()*size, Math.random()*size, Math.random()*3+1, Math.random()*3+1);
    }
    for(let i=0; i<50; i++) {
        const r = Math.random()*50 + 10;
        const x = Math.random()*size, y = Math.random()*size;
        const grd = ctx.createRadialGradient(x, y, 0, x, y, r);
        grd.addColorStop(0, 'rgba(220, 240, 255, 0.25)'); grd.addColorStop(1, 'rgba(220, 240, 255, 0)');
        ctx.fillStyle = grd; ctx.fillRect(0, 0, size, size);
    }
    _texCache.dirt = new THREE.CanvasTexture(c);
    _texCache.dirt.wrapS = THREE.RepeatWrapping; _texCache.dirt.wrapT = THREE.RepeatWrapping;
    _texCache.dirt.anisotropy = renderer.capabilities.getMaxAnisotropy();
    return _texCache.dirt;
}

function getRealisticIceGrass() {
    if (_texCache.grass) return _texCache.grass;
    const size = 512;
    const c = document.createElement('canvas'); c.width = size; c.height = size;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#0e1620'; ctx.fillRect(0, 0, size, size);
    for(let i=0; i<2000; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? 'rgba(100,150,200,0.15)' : 'rgba(0,0,0,0.3)';
        ctx.fillRect(Math.random()*size, Math.random()*size, Math.random()*4+1, Math.random()*4+1);
    }
    _texCache.grass = new THREE.CanvasTexture(c);
    _texCache.grass.wrapS = THREE.RepeatWrapping; _texCache.grass.wrapT = THREE.RepeatWrapping;
    _texCache.grass.anisotropy = renderer.capabilities.getMaxAnisotropy();
    return _texCache.grass;
}

// ─── КАМЕННЫЕ ПРЕГРАДЫ ───
function createStoneBarriers(waypoints, pathWidth) {
    const wallGroup = new THREE.Group();
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x5a6b7c, roughness: 0.8, metalness: 0.2 });
    const darkStoneMat = new THREE.MeshStandardMaterial({ color: 0x3a4b5c, roughness: 0.9, metalness: 0.2 });
    const glowCrystalMat = new THREE.MeshStandardMaterial({
        color: 0xffffff, emissive: 0x88ccff, emissiveIntensity: 2.0, roughness: 0.1, metalness: 0.1
    });

    const bayIndices = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
    const cornerPositions = [];
    const lakeCenter = new THREE.Vector3(0, 0, -20);

    for (let i of bayIndices) {
        const p_prev = waypoints[i - 1];
        const p_curr = waypoints[i];
        const p_next = waypoints[i + 1];

        const dir_in = new THREE.Vector3().subVectors(p_curr, p_prev).normalize();
        const dir_out = new THREE.Vector3().subVectors(p_next, p_curr).normalize();

        let n_in = new THREE.Vector3(-dir_in.z, 0, dir_in.x);
        let n_out = new THREE.Vector3(-dir_out.z, 0, dir_out.x);

        const toLake = new THREE.Vector3().subVectors(lakeCenter, p_curr).normalize();
        if (n_in.dot(toLake) < 0) n_in.negate();
        if (n_out.dot(toLake) < 0) n_out.negate();

        const bisector = new THREE.Vector3().addVectors(n_in, n_out).normalize();
        const dot = n_in.dot(bisector);
        const R = pathWidth / 2 + 0.6;
        const safeDot = Math.max(0.2, dot);
        const dist = R / safeDot;

        cornerPositions.push(p_curr.clone().addScaledVector(bisector, dist));
    }

    const wallXf = [], wallStoneXf = [], pillarXf = [], crystalXf = [];
    for (let i = 0; i < cornerPositions.length - 1; i++) {
        const from = cornerPositions[i];
        const to = cornerPositions[i + 1];
        const length = from.distanceTo(to);
        if (length < 0.1) continue;

        const mid = new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5);
        const dir = new THREE.Vector3().subVectors(to, from).normalize();
        const safeLength = Math.max(0.1, length - 0.4);
        const ry = Math.atan2(dir.x, dir.z);

        wallXf.push({ x: mid.x, y: 0.35, z: mid.z, ry, sz: safeLength });

        const stoneCount = Math.max(1, Math.floor(safeLength / 1.5));
        for (let k = 1; k < stoneCount; k++) {
            const localZ = -safeLength / 2 + (k / stoneCount) * safeLength;
            const dx = Math.sin(ry) * localZ + Math.cos(ry) * 0.075;
            const dz = Math.cos(ry) * localZ - Math.sin(ry) * 0.075;
            wallStoneXf.push({
                x: mid.x + dx, y: 0.75, z: mid.z + dz,
                rx: Math.random(), ry: Math.random(), rz: Math.random()
            });
        }
    }

    for (let i = 0; i < cornerPositions.length; i++) {
        const pos = cornerPositions[i];
        pillarXf.push({ x: pos.x, y: 0.4, z: pos.z });
        crystalXf.push({ x: pos.x, y: 0.95, z: pos.z });
    }

    const walls = _makeInstanced(new THREE.BoxGeometry(0.4, 0.7, 1), darkStoneMat, wallXf, true);
    if (walls) wallGroup.add(walls);
    const wallStones = _makeInstanced(new THREE.DodecahedronGeometry(0.28, 0), stoneMat, wallStoneXf, true);
    if (wallStones) wallGroup.add(wallStones);
    const pillars = _makeInstanced(new THREE.CylinderGeometry(0.25, 0.25, 0.8, 8), stoneMat, pillarXf, true);
    if (pillars) wallGroup.add(pillars);
    const crystals = _makeInstanced(new THREE.OctahedronGeometry(0.15, 0), glowCrystalMat, crystalXf);
    if (crystals) wallGroup.add(crystals);

    // Свет: 5 вместо 10 (через одного)
    for (let i = 0; i < cornerPositions.length; i += 2) {
        const pos = cornerPositions[i];
        const light = new THREE.PointLight(0x88ccff, 1.2, 7);
        light.position.set(pos.x, 1.1, pos.z);
        wallGroup.add(light);
    }

    return wallGroup;
}

// ─── ВРАЖЕСКИЕ ВОРОТА (оптимизировано) ───
function createIceGate(position) {
    const g = new THREE.Group();

    // ─── МАТЕРИАЛЫ ───
    const darkIceMat = new THREE.MeshStandardMaterial({
        color: 0x1a2a3a, metalness: 0.8, roughness: 0.2,
        emissive: 0x051020, emissiveIntensity: 0.3
    });
    const iceMat = new THREE.MeshStandardMaterial({
        color: 0x2a4a6a, metalness: 0.9, roughness: 0.1,
        emissive: 0x113355, emissiveIntensity: 0.5
    });
    const iceLightMat = new THREE.MeshStandardMaterial({
        color: 0x88ccff, metalness: 0.5, roughness: 0.15,
        emissive: 0x4488bb, emissiveIntensity: 0.6,
        transparent: true, opacity: 0.85
    });
    const snowMat = new THREE.MeshStandardMaterial({
        color: 0xeef8ff, roughness: 0.95, metalness: 0.05,
        emissive: 0x88aacc, emissiveIntensity: 0.1
    });
    const stoneMat = new THREE.MeshStandardMaterial({
        color: 0x3a4a5a, roughness: 0.9, metalness: 0.2
    });
    const evilMat = new THREE.MeshBasicMaterial({ color: 0xff0044 });
    const darkMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const runeMat = new THREE.MeshBasicMaterial({ color: 0x88ccff });

    // ─── ОСНОВАНИЕ: 3 скруглённые ступени ───
    const stepRadii = [9.5, 8.5, 7.5];
    for (let i = 0; i < 3; i++) {
        const r = stepRadii[i];
        const step = new THREE.Mesh(
            new THREE.CylinderGeometry(r, r + 0.4, 0.5, 32),
            i === 0 ? stoneMat : darkIceMat
        );
        step.position.y = 0.25 + i * 0.5;
        step.castShadow = i < 2;
        step.receiveShadow = true;
        g.add(step);

        const snowRing = new THREE.Mesh(
            new THREE.CylinderGeometry(r + 0.15, r + 0.15, 0.08, 32),
            snowMat
        );
        snowRing.position.y = 0.5 + i * 0.5;
        g.add(snowRing);
    }

    // ─── 12 ЛЕДЯНЫХ СТАЛАГМИТОВ по краю ───
    const stalagmiteXf = [];
    for (let i = 0; i < 12; i++) {
        const ang = (i / 12) * Math.PI * 2 + Math.PI / 12;
        const h = 1.2 + (i % 3) * 0.4;
        stalagmiteXf.push({
            x: Math.cos(ang) * 9.3, y: 1.5 + h / 2, z: Math.sin(ang) * 9.3,
            rz: Math.cos(ang) * 0.1, rx: -Math.sin(ang) * 0.1,
            sy: h
        });
    }
    const stalagmites = _makeInstanced(
        new THREE.ConeGeometry(0.25, 1, 5), iceMat, stalagmiteXf
    );
    if (stalagmites) g.add(stalagmites);

    // ─── 8 РУН на полу ───
    const runeXf = [];
    for (let i = 0; i < 8; i++) {
        const ang = (i / 8) * Math.PI * 2;
        runeXf.push({
            x: Math.cos(ang) * 4.5, y: 1.52, z: Math.sin(ang) * 4.5,
            ry: ang
        });
    }
    const runes = _makeInstanced(
        new THREE.BoxGeometry(0.6, 0.02, 0.2), runeMat, runeXf
    );
    if (runes) g.add(runes);

    // ─── 5 ШПИЛЕЙ ───
    const spikeXf = [];
    const spikeRingXf = [];
    const spikeSnowXf = [];
    const spikeCrystalXf = [];

    for (let i = 0; i < 5; i++) {
        const ang = (i / 5) * Math.PI * 2 - Math.PI / 2;
        const h = 8 + (i % 3) * 1.3;
        const sx = Math.cos(ang) * 6;
        const sz = Math.sin(ang) * 6;

        spikeXf.push({
            x: sx, y: 1.5 + h / 2, z: sz,
            ry: ang,
            rx: -Math.sin(ang) * 0.12,
            rz: Math.cos(ang) * 0.12,
            sy: h
        });

        spikeRingXf.push({ x: sx, y: 2.1, z: sz });

        spikeSnowXf.push({
            x: sx, y: 1.5 + h * 0.92, z: sz,
            ry: ang,
            sy: h * 0.2
        });

        spikeCrystalXf.push({
            x: sx + Math.sin(ang) * h * 0.15,
            y: 1.5 + h + 0.3,
            z: sz + Math.cos(ang) * h * 0.15
        });
    }

    const spikes = _makeInstanced(
        new THREE.ConeGeometry(1.5, 1, 12), iceMat, spikeXf, true
    );
    if (spikes) g.add(spikes);

    const spikeRings = _makeInstanced(
        new THREE.TorusGeometry(1.55, 0.15, 6, 20), iceLightMat, spikeRingXf
    );
    if (spikeRings) g.add(spikeRings);

    const spikeSnow = _makeInstanced(
        new THREE.ConeGeometry(0.4, 1, 12), snowMat, spikeSnowXf
    );
    if (spikeSnow) g.add(spikeSnow);

    const spikeCrystals = _makeInstanced(
        new THREE.OctahedronGeometry(0.35, 0), iceLightMat, spikeCrystalXf
    );
    if (spikeCrystals) g.add(spikeCrystals);

    // ─── ГЛАЗА ───
    const eyeSocketXf = [];
    const eyeXf = [];
    const eyeRingXf = [];

    for (let i = 0; i < 5; i++) {
        const ang = (i / 5) * Math.PI * 2 - Math.PI / 2;
        const h = 8 + (i % 3) * 1.3;
        const ex = Math.cos(ang) * 5.4;
        const ez = Math.sin(ang) * 5.4;
        const ey = 1.5 + h * 0.7;

        eyeSocketXf.push({ x: ex, y: ey, z: ez });
        eyeXf.push({ x: ex, y: ey, z: ez });
        eyeRingXf.push({ x: ex, y: ey, z: ez, ry: ang });
    }

    const eyeSockets = _makeInstanced(
        new THREE.SphereGeometry(0.5, 10, 8), darkMat, eyeSocketXf
    );
    if (eyeSockets) g.add(eyeSockets);

    const eyes = _makeInstanced(
        new THREE.SphereGeometry(0.3, 10, 8), evilMat, eyeXf
    );
    if (eyes) g.add(eyes);

    const eyeRings = _makeInstanced(
        new THREE.TorusGeometry(0.6, 0.08, 6, 16), iceLightMat, eyeRingXf
    );
    if (eyeRings) g.add(eyeRings);

    // ─── ПОРТАЛ ───
    const portal = new THREE.Mesh(
        new THREE.CircleGeometry(3.5, 32),
        new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.85 })
    );
    portal.position.set(0, 4.5, 0); g.add(portal);

    const portalGlow = new THREE.Mesh(
        new THREE.CircleGeometry(3.3, 32),
        new THREE.MeshBasicMaterial({
            color: 0x4400ff, transparent: true, opacity: 0.35,
            blending: THREE.AdditiveBlending, depthWrite: false
        })
    );
    portalGlow.position.set(0, 4.5, -0.05); g.add(portalGlow);

    const portalArch = new THREE.Mesh(
        new THREE.TorusGeometry(3.75, 0.3, 8, 32), iceLightMat
    );
    portalArch.position.set(0, 4.5, 0); g.add(portalArch);

    const portalArchOuter = new THREE.Mesh(
        new THREE.TorusGeometry(4.2, 0.18, 6, 32), iceMat
    );
    portalArchOuter.position.set(0, 4.5, -0.1); g.add(portalArchOuter);

    // ─── СВЕТ: 3 источника ───
    const portalLight = new THREE.PointLight(0x4400ff, 1.5, 18);
    portalLight.position.set(0, 4.5, 0); g.add(portalLight);

    const eyeLight = new THREE.PointLight(0xff0044, 0.9, 14);
    eyeLight.position.set(0, 8, 0); g.add(eyeLight);

    const frostLight = new THREE.PointLight(0x88ccff, 0.6, 20);
    frostLight.position.set(0, 3, 0); g.add(frostLight);

    // ─── УМЕНЬШЕНИЕ РАЗМЕРА ───
    // Коэффициент 0.8 = 80% от исходного размера.
    // Хотите сильнее — 0.7 / 0.65. Хотите чуть-чуть — 0.9.
    g.scale.setScalar(0.8);

    g.position.copy(position);
    return g;
}

// ─── ЗАЩИТНАЯ ЦИТАДЕЛЬ (оптимизировано) ───
function createIceFortress(position) {
    const g = new THREE.Group();

    const stoneMat  = new THREE.MeshStandardMaterial({ color: 0x7a9abc, roughness: 0.85, metalness: 0.2, emissive: 0x0a1a2a, emissiveIntensity: 0.05 });
    const stoneDark = new THREE.MeshStandardMaterial({ color: 0x4a6a8a, roughness: 0.9, metalness: 0.25 });
    const stoneLight= new THREE.MeshStandardMaterial({ color: 0x9ab4d0, roughness: 0.8, metalness: 0.15 });
    const iceMat    = new THREE.MeshStandardMaterial({ color: 0xaaddff, metalness: 0.7, roughness: 0.15, emissive: 0x446688, emissiveIntensity: 0.4, transparent: true, opacity: 0.9 });
    const snowMat   = new THREE.MeshStandardMaterial({ color: 0xeef8ff, roughness: 0.95, metalness: 0.05, emissive: 0x88aacc, emissiveIntensity: 0.05 });
    const warmMat   = new THREE.MeshBasicMaterial({ color: 0xffcc66 });
    const woodMat   = new THREE.MeshStandardMaterial({ color: 0x4a3018, roughness: 0.85 });
    const metalMat  = new THREE.MeshStandardMaterial({ color: 0x2a3a4a, metalness: 0.9, roughness: 0.3 });
    const flagMat   = new THREE.MeshStandardMaterial({ color: 0x3a5a8a, roughness: 0.7, metalness: 0.1, side: THREE.DoubleSide, emissive: 0x1a2a4a, emissiveIntensity: 0.2 });
    const flameMat  = new THREE.MeshBasicMaterial({ color: 0xff9944 });

    // Фундамент
    const stepRadii = [9.5, 8.6, 7.7];
    for (let i = 0; i < 3; i++) {
        const r = stepRadii[i];
        const step = new THREE.Mesh(new THREE.CylinderGeometry(r, r + 0.3, 0.6, 32), i === 0 ? stoneDark : stoneMat);
        step.position.y = 0.3 + i * 0.6;
        step.castShadow = i < 2;
        step.receiveShadow = true;
        g.add(step);
        const snow = new THREE.Mesh(new THREE.CylinderGeometry(r + 0.12, r + 0.12, 0.08, 32), snowMat);
        snow.position.y = 0.6 + i * 0.6;
        g.add(snow);
    }

    // 12 шпилей
    const spikeXf = [];
    for (let i = 0; i < 12; i++) {
        const ang = (i / 12) * Math.PI * 2 + Math.PI / 12;
        const h = 1.2 + (i % 3) * 0.35;
        spikeXf.push({
            x: Math.cos(ang) * 9.2, y: 1.8 + h / 2, z: Math.sin(ang) * 9.2,
            rz: Math.cos(ang) * 0.15, rx: -Math.sin(ang) * 0.15,
            sy: h / 1.5
        });
    }
    const spikes = _makeInstanced(new THREE.ConeGeometry(0.25, 1.5, 5), iceMat, spikeXf);
    if (spikes) g.add(spikes);

    // Площадка
    const plaza = new THREE.Mesh(new THREE.CylinderGeometry(7.5, 7.7, 0.5, 32), stoneMat);
    plaza.position.y = 2.05; plaza.receiveShadow = true; g.add(plaza);
    const snowCircle = new THREE.Mesh(new THREE.CircleGeometry(7.3, 32), snowMat);
    snowCircle.rotation.x = -Math.PI / 2; snowCircle.position.y = 2.31; g.add(snowCircle);

    // 6 башен
    const towerRadius = 7;
    const towerCount = 6;
    const towerAngles = [];
    for (let i = 0; i < towerCount; i++) towerAngles.push((i / towerCount) * Math.PI * 2);

    const xfBase = [], xfBody = [], xfRim = [], xfBalc = [];
    const xfRoof = [], xfRoofSnow = [], xfFinial = [], xfFlag = [];
    const xfTorchPole = [], xfFlame = [];
    const xfMerlon = [], xfWindow = [];

    for (let i = 0; i < towerCount; i++) {
        const ang = towerAngles[i];
        const tx = Math.cos(ang) * towerRadius;
        const tz = Math.sin(ang) * towerRadius;

        xfBase.push({ x: tx, y: 2.7, z: tz });
        xfBody.push({ x: tx, y: 5.6, z: tz });
        xfRim.push({ x: tx, y: 8.2, z: tz });
        xfBalc.push({ x: tx, y: 8.4, z: tz });
        xfRoof.push({ x: tx, y: 9.8, z: tz });
        xfRoofSnow.push({ x: tx, y: 10.55, z: tz });
        xfFinial.push({ x: tx, y: 11.15, z: tz });
        xfFlag.push({ x: tx + 0.42, y: 11.05, z: tz });

        for (let k = 0; k < 8; k++) {
            const ka = (k / 8) * Math.PI * 2;
            xfMerlon.push({
                x: tx + Math.cos(ka) * 1.35, y: 8.75, z: tz + Math.sin(ka) * 1.35, ry: -ka
            });
        }

        for (let k = 0; k < 4; k++) {
            const ka = ang + (k - 1.5) * 0.35;
            xfWindow.push({
                x: tx + Math.cos(ka) * 1.05, y: 6.3, z: tz + Math.sin(ka) * 1.05, ry: -ka - Math.PI / 2
            });
        }

        const tpx = tx + Math.cos(ang) * 1.2;
        const tpz = tz + Math.sin(ang) * 1.2;
        xfTorchPole.push({ x: tpx, y: 8.7, z: tpz });
        xfFlame.push({ x: tpx, y: 9.05, z: tpz });
    }

    const towerBase = _makeInstanced(new THREE.CylinderGeometry(1.15, 1.35, 0.8, 16), stoneDark, xfBase, true);
    if (towerBase) g.add(towerBase);
    const towerBody = _makeInstanced(new THREE.CylinderGeometry(1.0, 1.15, 5, 16), stoneMat, xfBody, true);
    if (towerBody) g.add(towerBody);
    const towerRim = _makeInstanced(new THREE.CylinderGeometry(1.2, 1.15, 0.25, 16), stoneLight, xfRim);
    if (towerRim) g.add(towerRim);
    const balcony = _makeInstanced(new THREE.CylinderGeometry(1.35, 1.35, 0.3, 16), stoneMat, xfBalc);
    if (balcony) g.add(balcony);
    const roof = _makeInstanced(new THREE.ConeGeometry(1.5, 2.2, 12), iceMat, xfRoof, true);
    if (roof) g.add(roof);
    const roofSnow = _makeInstanced(new THREE.ConeGeometry(1.55, 0.35, 12), snowMat, xfRoofSnow);
    if (roofSnow) g.add(roofSnow);
    const finial = _makeInstanced(new THREE.ConeGeometry(0.12, 0.6, 6), metalMat, xfFinial);
    if (finial) g.add(finial);
    const flags = _makeInstanced(new THREE.PlaneGeometry(0.85, 0.55), flagMat, xfFlag);
    if (flags) g.add(flags);
    const torchPoles = _makeInstanced(new THREE.CylinderGeometry(0.04, 0.05, 0.6, 5), woodMat, xfTorchPole);
    if (torchPoles) g.add(torchPoles);
    const flames = _makeInstanced(new THREE.SphereGeometry(0.1, 6, 5), flameMat, xfFlame);
    if (flames) g.add(flames);

    // Стены между башнями
    const xfWall = [], xfWallSnow = [];
    for (let i = 0; i < towerCount; i++) {
        const a1 = towerAngles[i];
        const a2 = towerAngles[(i + 1) % towerCount];
        const x1 = Math.cos(a1) * towerRadius, z1 = Math.sin(a1) * towerRadius;
        const x2 = Math.cos(a2) * towerRadius, z2 = Math.sin(a2) * towerRadius;
        const mx = (x1 + x2) / 2, mz = (z1 + z2) / 2;
        const wallLen = Math.hypot(x2 - x1, z2 - z1) - 2.2;
        const ry = -Math.atan2(z2 - z1, x2 - x1);

        xfWall.push({ x: mx, y: 3.2, z: mz, ry, sz: wallLen });
        xfWallSnow.push({ x: mx, y: 4.15, z: mz, ry, sz: wallLen });

        const merlonCount = Math.max(3, Math.floor(wallLen / 0.7));
        for (let k = 0; k < merlonCount; k++) {
            const t = (k + 0.5) / merlonCount;
            xfMerlon.push({ x: x1 + (x2 - x1) * t, y: 4.3, z: z1 + (z2 - z1) * t, ry });
        }
    }
    const walls = _makeInstanced(new THREE.BoxGeometry(0.5, 1.8, 1), stoneMat, xfWall, true);
    if (walls) g.add(walls);
    const wallSnow = _makeInstanced(new THREE.BoxGeometry(0.55, 0.1, 1), snowMat, xfWallSnow);
    if (wallSnow) g.add(wallSnow);

    // Донжон
    const t1 = new THREE.Mesh(new THREE.CylinderGeometry(4.0, 4.5, 3.5, 24), stoneMat);
    t1.position.y = 4.05; t1.castShadow = true; t1.receiveShadow = true; g.add(t1);

    const c1 = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.2, 0.35, 24), stoneLight);
    c1.position.y = 5.98; g.add(c1);

    const t2 = new THREE.Mesh(new THREE.CylinderGeometry(3.3, 3.8, 2.5, 24), stoneMat);
    t2.position.y = 7.4; t2.castShadow = true; g.add(t2);

    const balc = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 3.6, 0.3, 24), stoneLight);
    balc.position.y = 8.8; g.add(balc);

    const t3 = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.8, 2.0, 24), stoneMat);
    t3.position.y = 9.95; t3.castShadow = true; g.add(t3);

    const snow3 = new THREE.Mesh(new THREE.CylinderGeometry(2.85, 2.85, 0.15, 24), snowMat);
    snow3.position.y = 11.02; g.add(snow3);

    const dome = new THREE.Mesh(new THREE.SphereGeometry(1.8, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), iceMat);
    dome.position.y = 11.02; dome.castShadow = true; g.add(dome);

    const domeSnow = new THREE.Mesh(new THREE.SphereGeometry(1.82, 16, 6, 0, Math.PI * 2, 0, Math.PI / 2.5), snowMat);
    domeSnow.position.y = 11.04; g.add(domeSnow);

    const crystalPole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 1.0, 6), metalMat);
    crystalPole.position.y = 13.32; g.add(crystalPole);

    const topCrystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.8, 0), iceMat);
    topCrystal.position.y = 14.62; g.add(topCrystal);
    _iceEffects.push({ mesh: topCrystal, baseY: 14.62, speed: 1.2 });

    for (let k = 0; k < 8; k++) {
        const ka = (k / 8) * Math.PI * 2 + Math.PI / 8;
        xfWindow.push({ x: Math.cos(ka) * 4.15, y: 4.2, z: Math.sin(ka) * 4.15, ry: -ka - Math.PI / 2, sx: 1.2, sy: 1.1 });
        xfWindow.push({ x: Math.cos(ka) * 3.5, y: 7.5, z: Math.sin(ka) * 3.5, ry: -ka - Math.PI / 2 });
    }
    for (let k = 0; k < 16; k++) {
        const ka = (k / 16) * Math.PI * 2;
        xfMerlon.push({ x: Math.cos(ka) * 3.5, y: 9.15, z: Math.sin(ka) * 3.5, ry: -ka });
    }

    // Ворота
    const gateGroup = new THREE.Group();
    gateGroup.position.set(-6.5, 2.3, 0);
    gateGroup.rotation.y = Math.PI / 2;

    const gateBase = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.0, 1.0), stoneDark);
    gateBase.position.y = 1.0; gateBase.castShadow = true; gateGroup.add(gateBase);

    const arch = new THREE.Mesh(new THREE.TorusGeometry(1.4, 0.25, 8, 16, Math.PI), stoneLight);
    arch.position.y = 2.0; arch.castShadow = true; gateGroup.add(arch);

    const doorGap = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.9, 0.1), new THREE.MeshBasicMaterial({ color: 0x000000 }));
    doorGap.position.set(0, 1.05, 0.55); gateGroup.add(doorGap);

    const barXf = [];
    for (let k = 0; k < 5; k++) barXf.push({ x: -0.9 + k * 0.45, y: 1.05, z: 0.6 });
    const bars = _makeInstanced(new THREE.CylinderGeometry(0.04, 0.04, 1.9, 5), metalMat, barXf);
    if (bars) gateGroup.add(bars);

    const gatePoleXf = [{ x: -1.4, y: 2.5, z: 0.3 }, { x: 1.4, y: 2.5, z: 0.3 }];
    const gatePoles = _makeInstanced(new THREE.CylinderGeometry(0.05, 0.06, 1.0, 5), woodMat, gatePoleXf);
    if (gatePoles) gateGroup.add(gatePoles);

    const gateFlameXf = [{ x: -1.4, y: 3.1, z: 0.3 }, { x: 1.4, y: 3.1, z: 0.3 }];
    const gateFlames = _makeInstanced(new THREE.SphereGeometry(0.13, 6, 5), new THREE.MeshBasicMaterial({ color: 0xffaa44 }), gateFlameXf);
    if (gateFlames) gateGroup.add(gateFlames);

    const lanternPole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.8, 5), woodMat);
    lanternPole.position.set(0, 3.7, 0); gateGroup.add(lanternPole);

    const lantern = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.5, 0.35), warmMat);
    lantern.position.set(0, 4.35, 0); gateGroup.add(lantern);

    // Статуи
    const sPedXf = [], sBodyXf = [], sHeadXf = [], sSpearXf = [], sSnowXf = [];
    for (const side of [-1, 1]) {
        const sx = side * 2.6, sz = 0.5;
        sPedXf.push({ x: sx, y: 0.3, z: sz });
        sBodyXf.push({ x: sx, y: 1.3, z: sz });
        sHeadXf.push({ x: sx, y: 2.2, z: sz });
        sSpearXf.push({ x: sx + 0.3, y: 1.6, z: sz, rz: 0.15 });
        sSnowXf.push({ x: sx, y: 2.25, z: sz });
    }
    [
        [new THREE.BoxGeometry(0.8, 0.6, 0.8), stoneDark, sPedXf],
        [new THREE.CylinderGeometry(0.25, 0.35, 1.4, 8), stoneMat, sBodyXf],
        [new THREE.SphereGeometry(0.25, 8, 6), stoneMat, sHeadXf],
        [new THREE.CylinderGeometry(0.03, 0.03, 2.0, 4), metalMat, sSpearXf],
        [new THREE.SphereGeometry(0.26, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), snowMat, sSnowXf]
    ].forEach(([geo, mat, xf]) => {
        const m = _makeInstanced(geo, mat, xf);
        if (m) gateGroup.add(m);
    });

    g.add(gateGroup);

    const banner = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 1.2), flagMat);
    banner.position.set(-6.5, 4.6, 0);
    banner.rotation.y = Math.PI / 2;
    g.add(banner);

    // Обелиски
    const obeliskXf = [];
    for (let i = 0; i < 4; i++) {
        const ang = (i / 4) * Math.PI * 2 + Math.PI / 4;
        obeliskXf.push({ x: Math.cos(ang) * 8.2, y: 3.3, z: Math.sin(ang) * 8.2 });
    }
    const obelisks = _makeInstanced(new THREE.ConeGeometry(0.4, 2.2, 5), iceMat, obeliskXf);
    if (obelisks) g.add(obelisks);

    // Мерлоны и окна
    const merlons = _makeInstanced(new THREE.BoxGeometry(0.28, 0.4, 0.22), stoneDark, xfMerlon);
    if (merlons) g.add(merlons);

    const windows = _makeInstanced(new THREE.BoxGeometry(0.25, 0.55, 0.08), warmMat, xfWindow);
    if (windows) g.add(windows);

    // Свет: 3 вместо 10
    const crystalLight = new THREE.PointLight(0x88ccff, 2.2, 30);
    crystalLight.position.set(0, 14.62, 0); g.add(crystalLight);

    const gateLight = new THREE.PointLight(0xffcc66, 1.4, 14);
    gateLight.position.set(-7, 5, 0); g.add(gateLight);

    const torchLight = new THREE.PointLight(0xff8833, 0.9, 10);
    torchLight.position.set(Math.cos(0) * 8.2, 9.05, Math.sin(0) * 8.2); g.add(torchLight);

    g.position.copy(position);
    return g;
}

// ─── ПОСТРОЕНИЕ ДОРОГИ ───
function createPath(mapData) {
    if (pathGroup) scene.remove(pathGroup);
    pathGroup = new THREE.Group();
    _iceEffects.length = 0;

    const waypoints = mapData.waypoints;
    const pathWidth = 3.5;
    const halfWidth = pathWidth / 2;
    const shoulderExtra = 0.9;
    const shoulderWidth = pathWidth + shoulderExtra * 2;

    const grassEdgeMat = new THREE.MeshStandardMaterial({ map: getRealisticIceGrass(), roughness: 0.95, metalness: 0.05 });
    const dirtMat = new THREE.MeshStandardMaterial({ map: getRealisticIceDirt(), roughness: 0.9, metalness: 0.1 });
    const roadMat = new THREE.MeshStandardMaterial({
        map: getRealisticIceRoad(), bumpMap: getRealisticIceRoadBump(), bumpScale: 0.15,
        roughness: 0.6, metalness: 0.3, emissive: 0x0a1525, emissiveIntensity: 0.05
    });

    function addStrip(from, to, width, mat, y) {
        const dir = new THREE.Vector3().subVectors(to, from);
        const length = dir.length();
        if (length < 0.01) return;
        const mid = new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5);
        const angle = Math.atan2(dir.x, dir.z);
        const geo = new THREE.PlaneGeometry(width, length);
        geo.rotateX(-Math.PI / 2);
        const uv = geo.attributes.uv;
        const repeatY = length / width;
        for (let i = 0; i < uv.count; i++) uv.setY(i, uv.getY(i) * repeatY);
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.copy(mid); mesh.position.y = y; mesh.rotation.y = angle; mesh.receiveShadow = true;
        pathGroup.add(mesh);
    }

    for (let i = 0; i < waypoints.length - 1; i++) {
        const from = waypoints[i], to = waypoints[i + 1];
        addStrip(from, to, shoulderWidth + 1.4, grassEdgeMat, 0.015);
        addStrip(from, to, shoulderWidth, dirtMat, 0.025);
        addStrip(from, to, pathWidth, roadMat, 0.045);
    }

    function addCircle(pos, radius, mat, y) {
        const geo = new THREE.CircleGeometry(radius, 32);
        const mesh = new THREE.Mesh(geo, mat);
        mesh.rotation.x = -Math.PI / 2; mesh.position.copy(pos); mesh.position.y = y; mesh.receiveShadow = true;
        pathGroup.add(mesh);
    }

    for (let i = 1; i < waypoints.length - 1; i++) {
        addCircle(waypoints[i], (shoulderWidth + 1.4) / 2, grassEdgeMat, 0.015);
        addCircle(waypoints[i], shoulderWidth / 2, dirtMat, 0.025);
        addCircle(waypoints[i], halfWidth, roadMat, 0.05);
    }

    const wallGroup = createStoneBarriers(waypoints, pathWidth);
    pathGroup.add(wallGroup);

    pathGroup.add(createIceGate(waypoints[0]));
    pathGroup.add(createIceFortress(waypoints[waypoints.length - 1]));

    scene.add(pathGroup);
    return pathGroup;
}

function updatePath(delta, elapsed) {
    for (const e of _iceEffects) {
        e.mesh.rotation.y = elapsed * 0.5;
        e.mesh.position.y = e.baseY + Math.sin(elapsed * (e.speed || 1)) * 0.3;
    }
}