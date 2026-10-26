let pathGroup = null;
const _fireEffects = [];
const _angelEffects = [];
const _gateEffects = [];
const _bastionEffects = [];

// ═══════════════════════════════════════════
// ПРОЦЕДУРНЫЕ ТЕКСТУРЫ
// ═══════════════════════════════════════════
let _texCache = {};

function getRealisticHellRoad() {
    if (_texCache.road) return _texCache.road;
    const size = 1024;
    const c = document.createElement('canvas');
    c.width = size; c.height = size;
    const ctx = c.getContext('2d');

    const bg = ctx.createRadialGradient(size/2, size/2, size*0.1, size/2, size/2, size*0.8);
    bg.addColorStop(0, '#2a1510');
    bg.addColorStop(0.5, '#1a0a06');
    bg.addColorStop(1, '#0a0302');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, size, size);

    for (let i = 0; i < 180; i++) {
        const x = Math.random() * size, y = Math.random() * size;
        const r = 20 + Math.random() * 80;
        const grd = ctx.createRadialGradient(x, y, 0, x, y, r);
        grd.addColorStop(0, 'rgba(10, 5, 3, 0.55)');
        grd.addColorStop(1, 'rgba(10, 5, 3, 0)');
        ctx.fillStyle = grd;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }

    for (let i = 0; i < 70; i++) {
        ctx.save();
        ctx.shadowColor = 'rgba(255, 80, 20, 0.95)';
        ctx.shadowBlur = 10 + Math.random() * 6;
        ctx.strokeStyle = `rgba(255, ${100 + Math.random() * 80 | 0}, 20, ${0.5 + Math.random() * 0.4})`;
        ctx.lineWidth = 1 + Math.random() * 2;
        ctx.beginPath();
        let x = Math.random() * size, y = Math.random() * size;
        ctx.moveTo(x, y);
        const segs = 3 + Math.floor(Math.random() * 5);
        for (let j = 0; j < segs; j++) {
            x += (Math.random() - 0.5) * 150;
            y += (Math.random() - 0.5) * 150;
            ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.restore();
    }

    for (let i = 0; i < 3500; i++) {
        ctx.fillStyle = Math.random() > 0.5
            ? `rgba(60, 30, 20, ${0.3 + Math.random() * 0.3})`
            : `rgba(0, 0, 0, ${0.2 + Math.random() * 0.3})`;
        ctx.fillRect(Math.random() * size, Math.random() * size, Math.random() * 3 + 1, Math.random() * 3 + 1);
    }

    for (let i = 0; i < 80; i++) {
        ctx.save();
        ctx.shadowColor = 'rgba(255, 180, 60, 0.95)';
        ctx.shadowBlur = 6;
        ctx.fillStyle = `rgba(255, ${150 + Math.random() * 100 | 0}, 50, ${0.6 + Math.random() * 0.4})`;
        ctx.beginPath();
        ctx.arc(Math.random() * size, Math.random() * size, 0.8 + Math.random() * 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    _texCache.road = new THREE.CanvasTexture(c);
    _texCache.road.wrapS = THREE.RepeatWrapping;
    _texCache.road.wrapT = THREE.RepeatWrapping;
    _texCache.road.anisotropy = renderer.capabilities.getMaxAnisotropy();
    return _texCache.road;
}

function getRealisticHellRoadBump() {
    if (_texCache.roadBump) return _texCache.roadBump;
    const size = 1024;
    const c = document.createElement('canvas');
    c.width = size; c.height = size;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#808080'; ctx.fillRect(0, 0, size, size);

    for (let i = 0; i < 400; i++) {
        ctx.fillStyle = `rgba(0,0,0,${0.3 + Math.random() * 0.4})`;
        ctx.beginPath();
        ctx.arc(Math.random() * size, Math.random() * size, Math.random() * 30 + 5, 0, Math.PI * 2);
        ctx.fill();
    }
    for (let i = 0; i < 250; i++) {
        ctx.fillStyle = `rgba(255,255,255,${0.2 + Math.random() * 0.3})`;
        ctx.beginPath();
        ctx.arc(Math.random() * size, Math.random() * size, Math.random() * 20 + 2, 0, Math.PI * 2);
        ctx.fill();
    }
    for (let i = 0; i < 90; i++) {
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.lineWidth = Math.random() * 4 + 1;
        ctx.beginPath();
        let x = Math.random() * size, y = Math.random() * size;
        ctx.moveTo(x, y);
        for (let j = 0; j < 4; j++) {
            x += (Math.random() - 0.5) * 200;
            y += (Math.random() - 0.5) * 200;
            ctx.lineTo(x, y);
        }
        ctx.stroke();
    }

    _texCache.roadBump = new THREE.CanvasTexture(c);
    _texCache.roadBump.wrapS = THREE.RepeatWrapping;
    _texCache.roadBump.wrapT = THREE.RepeatWrapping;
    _texCache.roadBump.anisotropy = renderer.capabilities.getMaxAnisotropy();
    return _texCache.roadBump;
}

function getRealisticHellDirt() {
    if (_texCache.dirt) return _texCache.dirt;
    const size = 512;
    const c = document.createElement('canvas');
    c.width = size; c.height = size;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#1a0e08'; ctx.fillRect(0, 0, size, size);

    for (let i = 0; i < 150; i++) {
        const x = Math.random() * size, y = Math.random() * size;
        const r = 15 + Math.random() * 60;
        const grd = ctx.createRadialGradient(x, y, 0, x, y, r);
        grd.addColorStop(0, `rgba(80, 70, 60, ${0.15 + Math.random() * 0.2})`);
        grd.addColorStop(1, 'rgba(80, 70, 60, 0)');
        ctx.fillStyle = grd;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }

    for (let i = 0; i < 1500; i++) {
        const bright = Math.random() > 0.7;
        ctx.fillStyle = bright
            ? `rgba(200, 180, 150, ${0.15 + Math.random() * 0.3})`
            : `rgba(0, 0, 0, ${0.2 + Math.random() * 0.35})`;
        ctx.beginPath();
        ctx.arc(Math.random() * size, Math.random() * size, Math.random() * 2.5 + 0.5, 0, Math.PI * 2);
        ctx.fill();
    }

    for (let i = 0; i < 25; i++) {
        ctx.save();
        ctx.shadowColor = 'rgba(255, 80, 20, 0.7)';
        ctx.shadowBlur = 6;
        ctx.strokeStyle = `rgba(200, ${60 + Math.random() * 60 | 0}, 20, ${0.3 + Math.random() * 0.3})`;
        ctx.lineWidth = 1 + Math.random();
        ctx.beginPath();
        let x = Math.random() * size, y = Math.random() * size;
        ctx.moveTo(x, y);
        for (let j = 0; j < 3; j++) {
            x += (Math.random() - 0.5) * 100;
            y += (Math.random() - 0.5) * 100;
            ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.restore();
    }

    _texCache.dirt = new THREE.CanvasTexture(c);
    _texCache.dirt.wrapS = THREE.RepeatWrapping;
    _texCache.dirt.wrapT = THREE.RepeatWrapping;
    _texCache.dirt.anisotropy = renderer.capabilities.getMaxAnisotropy();
    return _texCache.dirt;
}

function getRealisticHellGrass() {
    if (_texCache.grass) return _texCache.grass;
    const size = 512;
    const c = document.createElement('canvas');
    c.width = size; c.height = size;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#0a0505'; ctx.fillRect(0, 0, size, size);

    for (let i = 0; i < 300; i++) {
        const x = Math.random() * size, y = Math.random() * size;
        const r = 8 + Math.random() * 40;
        const grd = ctx.createRadialGradient(x, y, 0, x, y, r);
        grd.addColorStop(0, `rgba(30, 15, 10, ${0.4 + Math.random() * 0.3})`);
        grd.addColorStop(1, 'rgba(30, 15, 10, 0)');
        ctx.fillStyle = grd;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }

    for (let i = 0; i < 2000; i++) {
        ctx.fillStyle = `rgba(${100 + Math.random() * 60 | 0}, ${80 + Math.random() * 40 | 0}, ${60 + Math.random() * 30 | 0}, ${0.1 + Math.random() * 0.25})`;
        ctx.fillRect(Math.random() * size, Math.random() * size, Math.random() * 2.5 + 0.5, Math.random() * 2.5 + 0.5);
    }

    for (let i = 0; i < 40; i++) {
        ctx.save();
        ctx.shadowColor = 'rgba(255, 120, 40, 0.9)';
        ctx.shadowBlur = 5;
        ctx.fillStyle = `rgba(255, ${100 + Math.random() * 80 | 0}, 40, ${0.5 + Math.random() * 0.4})`;
        ctx.beginPath();
        ctx.arc(Math.random() * size, Math.random() * size, 0.6 + Math.random() * 1.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    _texCache.grass = new THREE.CanvasTexture(c);
    _texCache.grass.wrapS = THREE.RepeatWrapping;
    _texCache.grass.wrapT = THREE.RepeatWrapping;
    _texCache.grass.anisotropy = renderer.capabilities.getMaxAnisotropy();
    return _texCache.grass;
}

// ═══════════════════════════════════════════
// Helper: один InstancedMesh на группу трансформаций
// ═══════════════════════════════════════════
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

function createHellHouse(position) {
    const g = new THREE.Group();
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x1a0505, roughness: 0.9, metalness: 0.1, emissive: 0xff3300, emissiveIntensity: 0.22 });
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x2a0808, roughness: 0.8, metalness: 0.2, emissive: 0xff2200, emissiveIntensity: 0.35 });
    const base = new THREE.Mesh(new THREE.BoxGeometry(3.4, 2.4, 3.4), baseMat); base.position.y = 1.2; base.castShadow = true; g.add(base);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(2.7, 1.8, 4), roofMat); roof.position.y = 3.3; roof.rotation.y = Math.PI / 4; g.add(roof);
    for (let i = 0; i < 3; i++) {
        const f = new THREE.Mesh(new THREE.ConeGeometry(0.28, 1.0, 6),
            new THREE.MeshBasicMaterial({ color: i % 2 ? 0xddaa44 : 0xcc3322, transparent: true, opacity: 0.7 }));
        const ang = (i / 3) * Math.PI * 2;
        f.position.set(Math.cos(ang) * 1.9, 4.8, Math.sin(ang) * 1.9); g.add(f);
        _fireEffects.push({ mesh: f, baseY: 4.8, phase: Math.random() * 6.28, speed: 3 + Math.random() * 2 });
    }
    g.position.copy(position);
    return g;
}

function createHeavenHouse(position) {
    const g = new THREE.Group();
    const baseMat = new THREE.MeshStandardMaterial({ color: 0xc0d0e8, roughness: 0.35, metalness: 0.3, emissive: 0x6688aa, emissiveIntensity: 0.3 });
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x7898cc, roughness: 0.3, metalness: 0.5, emissive: 0x2244aa, emissiveIntensity: 0.4 });
    const base = new THREE.Mesh(new THREE.BoxGeometry(3.4, 2.6, 3.4), baseMat); base.position.y = 1.3; base.castShadow = true; g.add(base);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(2.7, 2.0, 4), roofMat); roof.position.y = 3.6; roof.rotation.y = Math.PI / 4; g.add(roof);
    for (let i = 0; i < 4; i++) {
        const sp = new THREE.Mesh(new THREE.SphereGeometry(0.28, 6, 6),
            new THREE.MeshBasicMaterial({ color: 0xcceeff, transparent: true, opacity: 0.65 }));
        sp.position.set(0, 5.2, 0); g.add(sp);
        _angelEffects.push({ mesh: sp, baseY: 5.2, phase: (i / 4) * Math.PI * 2, speed: 1.2 + Math.random() * 0.5, radius: 2.0, yAmp: 0.4 });
    }
    g.position.copy(position);
    return g;
}

// ═══════════════════════════════════════════
// ВРАЖЕСКИЕ ВРАТА (Оптимизированные)
// ═══════════════════════════════════════════
function createGehennaGates(position) {
    const g = new THREE.Group();

    const platform = new THREE.Mesh(
        new THREE.CylinderGeometry(9, 10, 1, 12),
        new THREE.MeshStandardMaterial({ color: 0x0a0505, roughness: 0.9, metalness: 0.3, emissive: 0x1a0503, emissiveIntensity: 0.1 })
    );
    platform.position.y = 0.5; platform.receiveShadow = true; g.add(platform);

    const runeDisc = new THREE.Mesh(
        new THREE.RingGeometry(4, 8, 32),
        new THREE.MeshStandardMaterial({ color: 0x1a0805, roughness: 0.8, emissive: 0x661205, emissiveIntensity: 0.2 })
    );
    runeDisc.rotation.x = -Math.PI / 2; runeDisc.position.y = 1.01; g.add(runeDisc);

    const runeXf = [];
    for (let i = 0; i < 8; i++) {
        const ang = (i / 8) * Math.PI * 2;
        runeXf.push({ x: Math.cos(ang) * 6, y: 1.05, z: Math.sin(ang) * 6, ry: ang });
    }
    const runes = _makeInstanced(new THREE.BoxGeometry(0.6, 0.05, 0.15), new THREE.MeshBasicMaterial({ color: 0xcc3300 }), runeXf);
    if (runes) g.add(runes);

    for (const x of [-5, 5]) {
        const pillar = new THREE.Mesh(
            new THREE.CylinderGeometry(1.6, 2.0, 12, 8),
            new THREE.MeshStandardMaterial({ color: 0x080606, roughness: 0.85, metalness: 0.4, emissive: 0x100303, emissiveIntensity: 0.1 })
        );
        pillar.position.set(x, 7, 0); pillar.castShadow = true; g.add(pillar);

        const spiral = new THREE.Mesh(
            new THREE.TorusKnotGeometry(1.7, 0.12, 48, 6, 2, 1),
            new THREE.MeshStandardMaterial({ color: 0x2a0808, roughness: 0.5, metalness: 0.8, emissive: 0x3a0a00, emissiveIntensity: 0.3 })
        );
        spiral.position.set(x, 7, 0); spiral.scale.y = 2; g.add(spiral);

        const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.4, 0), new THREE.MeshBasicMaterial({ color: 0xdd2200 }));
        gem.position.set(x, 10, 1.6); g.add(gem);

        const gemGlow = _glowSprite(0xdd2200, 1.4);
        gemGlow.material.opacity = 0.5;
        gemGlow.position.copy(gem.position); g.add(gemGlow);
    }

    const spikeXf = [];
    for (const cx of [-5, 5]) {
        for (let k = 0; k < 4; k++) {
            const ang = (k / 4) * Math.PI * 2;
            spikeXf.push({
                x: cx + Math.cos(ang) * 1.0, y: 14, z: Math.sin(ang) * 1.0,
                rx: Math.sin(ang) * 0.3, rz: Math.cos(ang) * 0.3
            });
        }
    }
    const spikes = _makeInstanced(
        new THREE.ConeGeometry(0.3, 2.5, 4),
        new THREE.MeshStandardMaterial({ color: 0x0a0303, roughness: 0.7, metalness: 0.5 }),
        spikeXf
    );
    if (spikes) g.add(spikes);

    const arch = new THREE.Mesh(
        new THREE.TorusGeometry(5, 1.0, 8, 24, Math.PI),
        new THREE.MeshStandardMaterial({ color: 0x080606, roughness: 0.85, metalness: 0.4, emissive: 0x100303, emissiveIntensity: 0.15 })
    );
    arch.position.set(0, 12, 0); arch.rotation.z = Math.PI; g.add(arch);

    const skullBase = new THREE.Mesh(
        new THREE.IcosahedronGeometry(1.4, 0),
        new THREE.MeshStandardMaterial({ color: 0xa89878, roughness: 0.75, metalness: 0.15 })
    );
    skullBase.position.set(0, 14, 0);
    skullBase.scale.set(1.2, 1.0, 1.0); g.add(skullBase);

    for (const sign of [-1, 1]) {
        const socket = new THREE.Mesh(new THREE.SphereGeometry(0.35, 10, 8), new THREE.MeshBasicMaterial({ color: 0x000000 }));
        socket.position.set(sign * 0.5, 13.9, 1.0); g.add(socket);

        const eyeGlow = _glowSprite(0xdd2200, 1.0);
        eyeGlow.material.opacity = 0.55;
        eyeGlow.position.set(sign * 0.5, 13.9, 1.4); g.add(eyeGlow);

        const horn = new THREE.Mesh(
            new THREE.ConeGeometry(0.4, 2.0, 6),
            new THREE.MeshStandardMaterial({ color: 0x2a1010, roughness: 0.6, metalness: 0.3 })
        );
        horn.position.set(sign * 1.5, 15.5, 0);
        horn.rotation.z = -sign * 0.5; g.add(horn);
    }

    const portalTex = (() => {
        const c = document.createElement('canvas'); c.width = c.height = 256;
        const cx = c.getContext('2d');
        const grd = cx.createRadialGradient(128, 128, 20, 128, 128, 128);
        grd.addColorStop(0, 'rgba(220, 180, 80, 1)');
        grd.addColorStop(0.3, 'rgba(200, 60, 15, 0.85)');
        grd.addColorStop(0.7, 'rgba(140, 15, 0, 0.65)');
        grd.addColorStop(1, 'rgba(40, 0, 0, 0)');
        cx.fillStyle = grd; cx.fillRect(0, 0, 256, 256);
        for (let i = 0; i < 40; i++) {
            const ang = Math.random() * Math.PI * 2;
            const rad = Math.random() * 120;
            cx.fillStyle = `rgba(220, ${120 + Math.random() * 60 | 0}, ${40 + Math.random() * 80 | 0}, ${0.25 + Math.random() * 0.35})`;
            cx.beginPath();
            cx.arc(128 + Math.cos(ang) * rad, 128 + Math.sin(ang) * rad, 2 + Math.random() * 6, 0, Math.PI * 2);
            cx.fill();
        }
        return new THREE.CanvasTexture(c);
    })();
    const portal = new THREE.Mesh(
        new THREE.CircleGeometry(4.5, 32),
        new THREE.MeshBasicMaterial({ map: portalTex, transparent: true, opacity: 0.7, depthWrite: false, blending: THREE.AdditiveBlending })
    );
    portal.position.set(0, 7, 0); g.add(portal);

    for (let i = 0; i < 8; i++) {
        const ang = (i / 8) * Math.PI * 2;
        const flame = new THREE.Mesh(
            new THREE.ConeGeometry(0.35, 1.4, 6),
            new THREE.MeshBasicMaterial({ color: i % 2 ? 0xdd8820 : 0xcc4418, transparent: true, opacity: 0.7 })
        );
        flame.position.set(Math.cos(ang) * 8.5, 1.4, Math.sin(ang) * 8.5);
        g.add(flame);
        _gateEffects.push({ mesh: flame, baseY: 1.4, phase: Math.random() * 6.28, speed: 2 + Math.random() * 1.5 });
    }

    // Оптимизация света: оставляем только 1 свет для портала (вместо 3-х)
    const portalLight = new THREE.PointLight(0xff3300, 1.5, 15);
    portalLight.position.set(0, 7, 2); g.add(portalLight);

    g.position.copy(position);
    return g;
}

// ═══════════════════════════════════════════
// ДОБРЫЕ ВОРОТА (Оптимизированные)
// ═══════════════════════════════════════════
function createLastBastion(position) {
    const g = new THREE.Group();

    const marbleMat  = new THREE.MeshStandardMaterial({ color: 0xb0a8a0, roughness: 0.55, metalness: 0.25, emissive: 0x2a1a08, emissiveIntensity: 0.06 });
    const marbleDark = new THREE.MeshStandardMaterial({ color: 0x7a6a5a, roughness: 0.7, metalness: 0.3 });
    const marbleLight= new THREE.MeshStandardMaterial({ color: 0xd0c0a8, roughness: 0.5, metalness: 0.2 });
    const goldMat    = new THREE.MeshStandardMaterial({ color: 0xb8882c, roughness: 0.4, metalness: 0.85, emissive: 0x442a08, emissiveIntensity: 0.1 });
    const fireMat    = new THREE.MeshStandardMaterial({ color: 0xddaa44, roughness: 0.25, metalness: 0.5, emissive: 0xaa5510, emissiveIntensity: 0.6, transparent: true, opacity: 0.9 });
    const emberMat   = new THREE.MeshStandardMaterial({ color: 0xff6622, roughness: 0.4, metalness: 0.3, emissive: 0xff4400, emissiveIntensity: 0.8 });
    const warmMat    = new THREE.MeshBasicMaterial({ color: 0xffaa44 });
    const flameMat   = new THREE.MeshBasicMaterial({ color: 0xff6622 });
    const flagMat    = new THREE.MeshStandardMaterial({ color: 0x8a3a1a, roughness: 0.75, metalness: 0.1, side: THREE.DoubleSide, emissive: 0x4a1505, emissiveIntensity: 0.3 });
    const metalMat   = new THREE.MeshStandardMaterial({ color: 0x2a1a08, metalness: 0.9, roughness: 0.3 });
    const woodMat    = new THREE.MeshStandardMaterial({ color: 0x3a2010, roughness: 0.85 });

    const stepRadii = [9.5, 8.6, 7.7];
    for (let i = 0; i < 3; i++) {
        const r = stepRadii[i];
        const step = new THREE.Mesh(new THREE.CylinderGeometry(r, r + 0.3, 0.6, 32), i === 0 ? marbleDark : marbleMat);
        step.position.y = 0.3 + i * 0.6;
        step.castShadow = i < 2; // Тени только у нижних ступеней
        step.receiveShadow = true;
        g.add(step);
        const emberRing = new THREE.Mesh(new THREE.CylinderGeometry(r + 0.12, r + 0.12, 0.08, 32), emberMat);
        emberRing.position.y = 0.6 + i * 0.6;
        g.add(emberRing);
    }

    const spikeXf = [];
    for (let i = 0; i < 12; i++) {
        const ang = (i / 12) * Math.PI * 2 + Math.PI / 12;
        const h = 1.2 + (i % 3) * 0.35;
        spikeXf.push({ x: Math.cos(ang) * 9.2, y: 1.8 + h / 2, z: Math.sin(ang) * 9.2, rz: Math.cos(ang) * 0.15, rx: -Math.sin(ang) * 0.15, sy: h / 1.5 });
    }
    const spikes = _makeInstanced(new THREE.ConeGeometry(0.25, 1.5, 5), emberMat, spikeXf);
    if (spikes) g.add(spikes);

    const plaza = new THREE.Mesh(new THREE.CylinderGeometry(7.5, 7.7, 0.5, 32), marbleMat);
    plaza.position.y = 2.05; plaza.receiveShadow = true; g.add(plaza);

    const runeXf = [];
    for (let i = 0; i < 8; i++) {
        const ang = (i / 8) * Math.PI * 2;
        runeXf.push({ x: Math.cos(ang) * 4.5, y: 2.32, z: Math.sin(ang) * 4.5, ry: ang });
    }
    const runes = _makeInstanced(new THREE.BoxGeometry(0.6, 0.02, 0.2), emberMat, runeXf);
    if (runes) g.add(runes);

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
            xfMerlon.push({ x: tx + Math.cos(ka) * 1.35, y: 8.75, z: tz + Math.sin(ka) * 1.35, ry: -ka });
        }

        for (let k = 0; k < 4; k++) {
            const ka = ang + (k - 1.5) * 0.35;
            xfWindow.push({ x: tx + Math.cos(ka) * 1.05, y: 6.3, z: tz + Math.sin(ka) * 1.05, ry: -ka - Math.PI / 2 });
        }

        const tpx = tx + Math.cos(ang) * 1.2;
        const tpz = tz + Math.sin(ang) * 1.2;
        xfTorchPole.push({ x: tpx, y: 8.7, z: tpz });
        xfFlame.push({ x: tpx, y: 9.05, z: tpz });
    }

    // Тени отключены у мелких деталей (мерлоны, окна), включены только у крупных (стволы башен)
    const towerBase = _makeInstanced(new THREE.CylinderGeometry(1.15, 1.35, 0.8, 16), marbleDark, xfBase, true);
    if (towerBase) g.add(towerBase);
    const towerBody = _makeInstanced(new THREE.CylinderGeometry(1.0, 1.15, 5, 16), marbleMat, xfBody, true);
    if (towerBody) g.add(towerBody);
    const towerRim = _makeInstanced(new THREE.CylinderGeometry(1.2, 1.15, 0.25, 16), marbleLight, xfRim, false);
    if (towerRim) g.add(towerRim);
    const balcony = _makeInstanced(new THREE.CylinderGeometry(1.35, 1.35, 0.3, 16), marbleMat, xfBalc, false);
    if (balcony) g.add(balcony);
    const roof = _makeInstanced(new THREE.ConeGeometry(1.5, 2.2, 12), fireMat, xfRoof, true);
    if (roof) g.add(roof);
    const roofCap = _makeInstanced(new THREE.ConeGeometry(1.55, 0.35, 12), emberMat, xfRoofSnow, false);
    if (roofCap) g.add(roofCap);
    const finial = _makeInstanced(new THREE.ConeGeometry(0.12, 0.6, 6), goldMat, xfFinial, false);
    if (finial) g.add(finial);
    const flags = _makeInstanced(new THREE.PlaneGeometry(0.85, 0.55), flagMat, xfFlag, false);
    if (flags) g.add(flags);
    const torchPoles = _makeInstanced(new THREE.CylinderGeometry(0.04, 0.05, 0.6, 5), woodMat, xfTorchPole, false);
    if (torchPoles) g.add(torchPoles);
    const flames = _makeInstanced(new THREE.SphereGeometry(0.1, 6, 5), flameMat, xfFlame, false);
    if (flames) g.add(flames);

    const xfWall = [], xfWallEmber = [];
    for (let i = 0; i < towerCount; i++) {
        const a1 = towerAngles[i];
        const a2 = towerAngles[(i + 1) % towerCount];
        const x1 = Math.cos(a1) * towerRadius, z1 = Math.sin(a1) * towerRadius;
        const x2 = Math.cos(a2) * towerRadius, z2 = Math.sin(a2) * towerRadius;
        const mx = (x1 + x2) / 2, mz = (z1 + z2) / 2;
        const wallLen = Math.hypot(x2 - x1, z2 - z1) - 2.2;
        const ry = -Math.atan2(z2 - z1, x2 - x1);

        xfWall.push({ x: mx, y: 3.2, z: mz, ry, sz: wallLen });
        xfWallEmber.push({ x: mx, y: 4.15, z: mz, ry, sz: wallLen });

        const merlonCount = Math.max(3, Math.floor(wallLen / 0.7));
        for (let k = 0; k < merlonCount; k++) {
            const t = (k + 0.5) / merlonCount;
            xfMerlon.push({ x: x1 + (x2 - x1) * t, y: 4.3, z: z1 + (z2 - z1) * t, ry });
        }
    }
    const walls = _makeInstanced(new THREE.BoxGeometry(0.5, 1.8, 1), marbleMat, xfWall, true);
    if (walls) g.add(walls);
    const wallEmber = _makeInstanced(new THREE.BoxGeometry(0.55, 0.1, 1), emberMat, xfWallEmber, false);
    if (wallEmber) g.add(wallEmber);

    const t1 = new THREE.Mesh(new THREE.CylinderGeometry(4.0, 4.5, 3.5, 24), marbleMat);
    t1.position.y = 4.05; t1.castShadow = true; t1.receiveShadow = true; g.add(t1);

    const c1 = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.2, 0.35, 24), marbleLight);
    c1.position.y = 5.98; g.add(c1);

    const t2 = new THREE.Mesh(new THREE.CylinderGeometry(3.3, 3.8, 2.5, 24), marbleMat);
    t2.position.y = 7.4; t2.castShadow = true; g.add(t2);

    const balc = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 3.6, 0.3, 24), marbleLight);
    balc.position.y = 8.8; g.add(balc);

    const t3 = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.8, 2.0, 24), marbleMat);
    t3.position.y = 9.95; t3.castShadow = true; g.add(t3);

    const ember3 = new THREE.Mesh(new THREE.CylinderGeometry(2.85, 2.85, 0.15, 24), emberMat);
    ember3.position.y = 11.02; g.add(ember3);

    const dome = new THREE.Mesh(new THREE.SphereGeometry(1.8, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), fireMat);
    dome.position.y = 11.02; dome.castShadow = true; g.add(dome);

    const domeTop = new THREE.Mesh(new THREE.SphereGeometry(1.82, 16, 6, 0, Math.PI * 2, 0, Math.PI / 2.5), emberMat);
    domeTop.position.y = 11.04; g.add(domeTop);

    const crystalPole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 1.0, 6), goldMat);
    crystalPole.position.y = 13.32; g.add(crystalPole);

    const topCrystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.8, 0), fireMat);
    topCrystal.position.y = 14.62; g.add(topCrystal);
    _bastionEffects.push({ mesh: topCrystal, baseY: 14.62, speed: 1.2 });

    for (let k = 0; k < 8; k++) {
        const ka = (k / 8) * Math.PI * 2 + Math.PI / 8;
        xfWindow.push({ x: Math.cos(ka) * 4.15, y: 4.2, z: Math.sin(ka) * 4.15, ry: -ka - Math.PI / 2, sx: 1.2, sy: 1.1 });
        xfWindow.push({ x: Math.cos(ka) * 3.5, y: 7.5, z: Math.sin(ka) * 3.5, ry: -ka - Math.PI / 2 });
    }
    for (let k = 0; k < 16; k++) {
        const ka = (k / 16) * Math.PI * 2;
        xfMerlon.push({ x: Math.cos(ka) * 3.5, y: 9.15, z: Math.sin(ka) * 3.5, ry: -ka });
    }

    const gateGroup = new THREE.Group();
    gateGroup.position.set(-6.5, 2.3, 0);
    gateGroup.rotation.y = Math.PI / 2;

    const gateBase = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.0, 1.0), marbleDark);
    gateBase.position.y = 1.0; gateBase.castShadow = true; gateGroup.add(gateBase);

    const arch = new THREE.Mesh(new THREE.TorusGeometry(1.4, 0.25, 8, 16, Math.PI), goldMat);
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

    const sPedXf = [], sBodyXf = [], sHeadXf = [], sSpearXf = [], sHelmXf = [];
    for (const side of [-1, 1]) {
        const sx = side * 2.6, sz = 0.5;
        sPedXf.push({ x: sx, y: 0.3, z: sz });
        sBodyXf.push({ x: sx, y: 1.3, z: sz });
        sHeadXf.push({ x: sx, y: 2.2, z: sz });
        sSpearXf.push({ x: sx + 0.3, y: 1.6, z: sz, rz: 0.15 });
        sHelmXf.push({ x: sx, y: 2.25, z: sz });
    }
    [
        [new THREE.BoxGeometry(0.8, 0.6, 0.8), marbleDark, sPedXf],
        [new THREE.CylinderGeometry(0.25, 0.35, 1.4, 8), marbleMat, sBodyXf],
        [new THREE.SphereGeometry(0.25, 8, 6), marbleMat, sHeadXf],
        [new THREE.CylinderGeometry(0.03, 0.03, 2.0, 4), metalMat, sSpearXf],
        [new THREE.ConeGeometry(0.26, 0.3, 6), goldMat, sHelmXf]
    ].forEach(([geo, mat, xf]) => {
        const m = _makeInstanced(geo, mat, xf);
        if (m) gateGroup.add(m);
    });

    g.add(gateGroup);

    const banner = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 1.2), flagMat);
    banner.position.set(-6.5, 4.6, 0);
    banner.rotation.y = Math.PI / 2;
    g.add(banner);

    const obeliskXf = [];
    for (let i = 0; i < 4; i++) {
        const ang = (i / 4) * Math.PI * 2 + Math.PI / 4;
        obeliskXf.push({ x: Math.cos(ang) * 8.2, y: 3.3, z: Math.sin(ang) * 8.2 });
    }
    const obelisks = _makeInstanced(new THREE.ConeGeometry(0.4, 2.2, 5), fireMat, obeliskXf);
    if (obelisks) g.add(obelisks);

    const merlons = _makeInstanced(new THREE.BoxGeometry(0.28, 0.4, 0.22), marbleDark, xfMerlon);
    if (merlons) g.add(merlons);

    const windows = _makeInstanced(new THREE.BoxGeometry(0.25, 0.55, 0.08), warmMat, xfWindow);
    if (windows) g.add(windows);

    for (let i = 0; i < 4; i++) {
        const orb = new THREE.Mesh(
            new THREE.SphereGeometry(0.2, 8, 6),
            new THREE.MeshBasicMaterial({ color: 0xff8833, transparent: true, opacity: 0.6 })
        );
        orb.position.set(0, 15, 0);
        if (typeof _glowSprite === 'function') {
            const orbGlow = _glowSprite(0xff8833, 0.9);
            orbGlow.material.opacity = 0.5;
            orb.add(orbGlow);
        }
        g.add(orb);
        _angelEffects.push({ mesh: orb, baseY: 15, phase: (i / 4) * Math.PI * 2, speed: 0.8 + Math.random() * 0.3, radius: 5 + Math.random() * 2, yAmp: 0.5 });
    }

    // Оптимизация света: убираем лишние PointLight, оставляем только 1 тусклый для кристалла
    const crystalLight = new THREE.PointLight(0xffaa44, 1.2, 20);
    crystalLight.position.set(0, 14.62, 0); g.add(crystalLight);

    g.scale.setScalar(0.85);
    g.position.copy(position);
    return g;
}

// ═══════════════════════════════════════════
// ПОСТРОЕНИЕ ДОРОГИ (Классический вид)
// ═══════════════════════════════════════════
function createPath(mapData) {
    if (pathGroup) scene.remove(pathGroup);
    pathGroup = new THREE.Group();
    _fireEffects.length = 0;
    _angelEffects.length = 0;
    _gateEffects.length = 0;
    _bastionEffects.length = 0;

    const isHell = mapData.id === 'hell';
    
    // Возвращаем исходные точки (без densifyWaypoints)
    const waypoints = mapData.waypoints;
    
    const pathWidth = 3.5;
    const halfWidth = pathWidth / 2;
    const shoulderExtra = 0.9;
    const shoulderWidth = pathWidth + shoulderExtra * 2;

    const grassEdgeMat = new THREE.MeshStandardMaterial({
        map: getRealisticHellGrass(), roughness: 0.95, metalness: 0.15,
        emissive: 0x1a0503, emissiveIntensity: 0.06
    });
    const dirtMat = new THREE.MeshStandardMaterial({
        map: getRealisticHellDirt(), roughness: 0.92, metalness: 0.15,
        emissive: 0x1a0503, emissiveIntensity: 0.05
    });
    const roadMat = new THREE.MeshStandardMaterial({
        map: getRealisticHellRoad(), bumpMap: getRealisticHellRoadBump(), bumpScale: 0.15,
        roughness: 0.88, metalness: 0.2,
        emissive: 0x2a0800, emissiveIntensity: 0.12
    });

    function addStrip(from, to, width, mat, y, uvScale = 1) {
        const dir = new THREE.Vector3().subVectors(to, from);
        const length = dir.length();
        if (length < 0.01) return;
        const mid = new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5);
        const angle = Math.atan2(dir.x, dir.z);

        const geo = new THREE.PlaneGeometry(width, length);
        geo.rotateX(-Math.PI / 2);

        const uv = geo.attributes.uv;
        const repeatY = length / width * uvScale;
        for (let i = 0; i < uv.count; i++) uv.setY(i, uv.getY(i) * repeatY);

        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.copy(mid);
        mesh.position.y = y;
        mesh.rotation.y = angle;
        mesh.receiveShadow = true;
        pathGroup.add(mesh);
    }

    // Строим прямые сегменты между точками
    for (let i = 0; i < waypoints.length - 1; i++) {
        const from = waypoints[i], to = waypoints[i + 1];
        addStrip(from, to, shoulderWidth + 1.4, grassEdgeMat, 0.015);
        addStrip(from, to, shoulderWidth, dirtMat, 0.025);
        addStrip(from, to, pathWidth, roadMat, 0.045);
    }

    // Строим идеальные круги на стыках, чтобы перекрыть "швы"
    function addCircle(pos, radius, mat, y) {
        const geo = new THREE.CircleGeometry(radius, 32);
        const uv = geo.attributes.uv;
        for (let i = 0; i < uv.count; i++) {
            uv.setX(i, uv.getX(i) * radius * 1.5);
            uv.setY(i, uv.getY(i) * radius * 1.5);
        }
        const mesh = new THREE.Mesh(geo, mat);
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.copy(pos);
        mesh.position.y = y;
        mesh.receiveShadow = true;
        pathGroup.add(mesh);
    }

    for (let i = 1; i < waypoints.length - 1; i++) {
        addCircle(waypoints[i], (shoulderWidth + 1.4) / 2, grassEdgeMat, 0.015);
        addCircle(waypoints[i], shoulderWidth / 2, dirtMat, 0.025);
        addCircle(waypoints[i], halfWidth, roadMat, 0.05);
    }

    if (isHell) {
        pathGroup.add(createGehennaGates(waypoints[0]));
        pathGroup.add(createLastBastion(waypoints[waypoints.length - 1]));
    } else {
        pathGroup.add(createHellHouse(waypoints[0]));
        pathGroup.add(createHeavenHouse(waypoints[waypoints.length - 1]));
    }

    scene.add(pathGroup);
    return pathGroup;
}

function updatePath(delta, elapsed) {
    for (const f of _fireEffects) {
        const s = 0.7 + 0.5 * Math.abs(Math.sin(elapsed * f.speed + f.phase));
        f.mesh.scale.set(0.8 + s * 0.3, s, 0.8 + s * 0.3);
        f.mesh.position.y = f.baseY + Math.sin(elapsed * f.speed * 2 + f.phase) * 0.2;
        f.mesh.material.opacity = 0.4 + s * 0.35;
    }
    for (const a of _angelEffects) {
        const t = elapsed * a.speed + a.phase;
        a.mesh.position.set(Math.cos(t) * a.radius, a.baseY + Math.sin(elapsed * 1.5 + a.phase) * a.yAmp, Math.sin(t) * a.radius);
        a.mesh.material.opacity = 0.35 + 0.3 * Math.abs(Math.sin(elapsed * 2 + a.phase));
    }
    for (const f of _gateEffects) {
        const s = 0.7 + 0.6 * Math.abs(Math.sin(elapsed * f.speed + f.phase));
        f.mesh.scale.set(s, s * 1.2, s);
        f.mesh.position.y = f.baseY + Math.sin(elapsed * f.speed * 2 + f.phase) * 0.3;
        f.mesh.material.opacity = 0.5 + s * 0.3;
    }
    for (const b of _bastionEffects) {
        b.mesh.rotation.y = elapsed * 0.5;
        b.mesh.position.y = b.baseY + Math.sin(elapsed * b.speed) * 0.4;
    }
}