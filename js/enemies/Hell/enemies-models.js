// enemies-models.js — скелетные модели в красной гамме (как рыцарь)

const _PAL = {
    // Красная палитра — для всех "обычных" монстров
    bone: 0xb89078,
    boneDark: 0x8a6858,
    boneBright: 0xd8b8a0,
    eye: 0xff3311,
    eyeDeep: 0xcc2200,
    accent: 0xcc2200,
    hot: 0xff4400,
    dark: 0x2a0808,
    mid: 0x5a1810,
    // Зелёная палитра — только Пожиратель Душ
    boneGreen: 0xa0b888,
    eyeGreen: 0x39ff5a,
};

const _glowTextureCache = new Map();
function _getGlowTexture(color) {
    if (_glowTextureCache.has(color)) return _glowTextureCache.get(color);
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const cx = c.getContext('2d');
    const r = (color >> 16) & 255, g = (color >> 8) & 255, b = color & 255;
    const grd = cx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0,    'rgba(255,255,255,1)');
    grd.addColorStop(0.15, `rgba(${r},${g},${b},1)`);
    grd.addColorStop(0.5,  `rgba(${r},${g},${b},0.45)`);
    grd.addColorStop(1,    'rgba(0,0,0,0)');
    cx.fillStyle = grd;
    cx.fillRect(0, 0, 64, 64);
    const tex = new THREE.CanvasTexture(c);
    _glowTextureCache.set(color, tex);
    return tex;
}

function _glowSprite(color, size) {
    const mat = new THREE.SpriteMaterial({
        map: _getGlowTexture(color),
        blending: THREE.AdditiveBlending, transparent: true, depthWrite: false
    });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(size, size, 1);
    return sprite;
}

// ──── СКЕЛЕТНЫЕ ХЕЛПЕРЫ ────
function _boneBetween(group, a, b, thick, mat) {
    const dir = new THREE.Vector3().subVectors(b, a);
    const len = dir.length();
    if (len < 0.001) return;
    const bone = new THREE.Mesh(new THREE.CylinderGeometry(thick * 0.82, thick, len, 6), mat);
    bone.position.copy(a).lerp(b, 0.5);
    bone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    bone.castShadow = true;
    group.add(bone);
}

function _joint(group, pos, radius, mat) {
    const j = new THREE.Mesh(new THREE.SphereGeometry(radius, 6, 5), mat);
    j.position.copy(pos); j.castShadow = true; group.add(j);
    return j;
}

function _spine(group, s, fromY, toY, z, boneMat) {
    const count = 6;
    for (let i = 0; i <= count; i++) {
        const t = i / count;
        const y = fromY + (toY - fromY) * t;
        const vert = new THREE.Mesh(new THREE.SphereGeometry(0.028 * s, 5, 4), boneMat);
        vert.position.set(0, y, z); vert.scale.set(1.6, 0.8, 1); group.add(vert);
        if (i > 0 && i < count) {
            const process = new THREE.Mesh(new THREE.ConeGeometry(0.015 * s, 0.06 * s, 4), boneMat);
            process.position.set(0, y + 0.01 * s, z - 0.05 * s);
            process.rotation.x = -Math.PI / 3; group.add(process);
        }
    }
}

function _ribcage(group, s, centerY, z, ribCount, ribR, boneMat) {
    for (let i = 0; i < ribCount; i++) {
        const y = centerY - (i - ribCount / 2) * 0.06 * s;
        const scale = 1 - i * 0.12;
        const rL = new THREE.Mesh(new THREE.TorusGeometry(ribR * s * scale, 0.016 * s, 5, 6, Math.PI * 0.8), boneMat);
        rL.rotation.x = Math.PI / 2; rL.rotation.z = Math.PI * 0.6;
        rL.position.set(0, y, z + 0.02 * s); group.add(rL);
        const rR = rL.clone(); rR.rotation.z = Math.PI * 0.4; group.add(rR);
    }
}

function _skull(group, s, opts) {
    const {
        y = 0, z = 0, sizeMul = 1,
        color = _PAL.bone,
        eyeColor = _PAL.eye,
        eyeIntensity = 1.0,
        withJaw = true, withTeeth = true
    } = opts;
    const sz = s * sizeMul;
    const boneMat = new THREE.MeshStandardMaterial({ color, roughness: 0.7, metalness: 0.15 });
    const darkMat = new THREE.MeshBasicMaterial({ color: 0x000000 });

    const brainCase = new THREE.Mesh(new THREE.SphereGeometry(0.16 * sz, 12, 10), boneMat);
    brainCase.scale.set(1.1, 1.15, 1.2);
    brainCase.position.set(0, y + 0.08 * sz, z);
    brainCase.castShadow = true; group.add(brainCase);

    const snout = new THREE.Mesh(new THREE.BoxGeometry(0.16 * sz, 0.12 * sz, 0.18 * sz), boneMat);
    snout.position.set(0, y + 0.01 * sz, z + 0.16 * sz); snout.castShadow = true; group.add(snout);

    const noseCavity = new THREE.Mesh(new THREE.ConeGeometry(0.025 * sz, 0.04 * sz, 4), darkMat);
    noseCavity.position.set(0, y + 0.05 * sz, z + 0.24 * sz);
    noseCavity.rotation.x = Math.PI; group.add(noseCavity);

    for (const sign of [-1, 1]) {
        const socket = new THREE.Mesh(new THREE.SphereGeometry(0.05 * sz, 8, 6), darkMat);
        socket.position.set(sign * 0.075 * sz, y + 0.08 * sz, z + 0.13 * sz); group.add(socket);

        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.028 * sz, 6, 4),
            new THREE.MeshBasicMaterial({ color: eyeColor }));
        eye.position.set(sign * 0.075 * sz, y + 0.075 * sz, z + 0.15 * sz); group.add(eye);

        if (eyeIntensity > 0) {
            const glow = _glowSprite(eyeColor, 0.4 * sz);
            glow.position.copy(eye.position);
            glow.material.opacity = eyeIntensity * 0.5;
            group.add(glow);
        }
    }

    if (withJaw) {
        const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.14 * sz, 0.05 * sz, 0.16 * sz), boneMat);
        jaw.position.set(0, y - 0.09 * sz, z + 0.13 * sz); jaw.castShadow = true; group.add(jaw);
    }

    if (withTeeth) {
        const toothMat = new THREE.MeshStandardMaterial({ color: 0xe8d0b8, roughness: 0.5 });
        for (let i = 0; i < 4; i++) {
            const x = (i - 1.5) * 0.035 * sz;
            const tUp = new THREE.Mesh(new THREE.ConeGeometry(0.013 * sz, 0.035 * sz, 4), toothMat);
            tUp.position.set(x, y - 0.04 * sz, z + 0.19 * sz); tUp.rotation.x = Math.PI; group.add(tUp);
            const tLow = new THREE.Mesh(new THREE.ConeGeometry(0.011 * sz, 0.03 * sz, 4), toothMat);
            tLow.position.set(x, y - 0.06 * sz, z + 0.19 * sz); group.add(tLow);
        }
    }
}

function _horn(group, s, side, opts) {
    const { color = 0x1a0505, length = 1.0, thick = 1.0, y = 1.0, x = 0.2, z = 0, curve = 0.45 } = opts;
    const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.7, metalness: 0.2 });
    const segments = 3;
    const segLen = 0.14 * s * length;
    let px = side * x * s, py = y * s, pz = z * s, angZ = -side * 0.25;
    for (let i = 0; i < segments; i++) {
        const r1 = 0.07 * s * thick * (1 - i * 0.2);
        const r2 = 0.07 * s * thick * (1 - (i + 1) * 0.2);
        const seg = new THREE.Mesh(new THREE.CylinderGeometry(Math.max(0.005, r2), r1, segLen, 5), mat);
        seg.position.set(px, py, pz); seg.rotation.z = angZ; seg.castShadow = true; group.add(seg);
        px += -Math.sin(angZ) * segLen * 0.9; py += Math.cos(angZ) * segLen * 0.9;
        angZ += -side * curve;
    }
    const tip = new THREE.Mesh(new THREE.ConeGeometry(Math.max(0.015, 0.02 * s * thick), 0.1 * s * length, 5), mat);
    tip.position.set(px, py, pz); tip.rotation.z = angZ; group.add(tip);
}

function _claw(group, s, pos, rotation, opts) {
    const { color = 0xe8d0b8, length = 0.08 } = opts || {};
    const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.5, metalness: 0.1 });
    const claw = new THREE.Mesh(new THREE.ConeGeometry(0.018 * s, length * s, 4), mat);
    claw.position.copy(pos);
    claw.rotation.set(rotation.x, rotation.y, rotation.z);
    group.add(claw);
}

function _skeletonWing(group, s, side, opts) {
    const { membraneColor = 0x3a0606, boneColor = 0x5a1810, x = 0.2, y = 0.3, z = 0, span = 1.8, drop = 1.2 } = opts;
    const boneMat = new THREE.MeshStandardMaterial({ color: boneColor, roughness: 0.7, metalness: 0.15 });
    const membraneMat = new THREE.MeshStandardMaterial({
        color: membraneColor, roughness: 0.85, metalness: 0.1,
        side: THREE.DoubleSide, transparent: true, opacity: 0.8
    });
    const base = new THREE.Vector3(side * x * s, y * s, z * s);
    const tips = [
        new THREE.Vector3(side * (x + span * 0.9) * s, y * s + 0.1 * s, z * s),
        new THREE.Vector3(side * (x + span * 0.8) * s, (y - drop * 0.4) * s, z * s),
        new THREE.Vector3(side * (x + span * 0.5) * s, (y - drop * 0.8) * s, z * s)
    ];
    for (const tip of tips) _boneBetween(group, base, tip, 0.018 * s, boneMat);
    for (let i = 0; i < tips.length - 1; i++) {
        const p1 = tips[i], p2 = tips[i + 1];
        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.lineTo(p1.x - base.x, p1.y - base.y);
        shape.lineTo(p2.x - base.x, p2.y - base.y);
        shape.lineTo(0, 0);
        const mem = new THREE.Mesh(new THREE.ShapeGeometry(shape), membraneMat);
        mem.position.copy(base); mem.position.z += z * s; group.add(mem);
    }
    _boneBetween(group, base, tips[0], 0.02 * s, boneMat);
}

function _skeletonTail(group, s, opts) {
    const { color = 0x2a0808, spikeColor = _PAL.accent, startY = -0.3, startZ = -0.3, len = 1.2, endSpike = true } = opts;
    const boneMat = new THREE.MeshStandardMaterial({ color, roughness: 0.75, metalness: 0.15 });
    const segs = 6;
    let prev = new THREE.Vector3(0, startY * s, startZ * s);
    for (let i = 1; i <= segs; i++) {
        const t = i / segs;
        const cur = new THREE.Vector3(
            Math.sin(t * 0.4) * 0.1 * s,
            startY * s - t * 0.25 * s - (i === segs ? 0.15 * s : 0),
            startZ * s - t * len * s
        );
        _boneBetween(group, prev, cur, 0.03 * s * (1 - t * 0.6), boneMat);
        _joint(group, cur, 0.035 * s * (1 - t * 0.5), boneMat);
        prev = cur;
    }
    if (endSpike) {
        const spike = new THREE.Mesh(new THREE.ConeGeometry(0.09 * s, 0.24 * s, 4),
            new THREE.MeshStandardMaterial({ color: spikeColor, emissive: spikeColor, emissiveIntensity: 0.9, roughness: 0.4, metalness: 0.3 }));
        spike.position.copy(prev); spike.rotation.x = -Math.PI / 2; group.add(spike);
        const glow = _glowSprite(spikeColor, 0.5 * s);
        glow.position.copy(prev); glow.material.opacity = 0.6; group.add(glow);
    }
}

// ──── HP BAR ────
function makeHpBar() {
    const g = new THREE.Group();
    const bg = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 0.26),
        new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.82, depthTest: false, side: THREE.DoubleSide }));
    bg.renderOrder = 998; g.add(bg);
    const fill = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 0.20),
        new THREE.MeshBasicMaterial({ color: 0x4a8a3a, depthTest: false, side: THREE.DoubleSide }));
    fill.position.z = 0.001; fill.renderOrder = 999; g.add(fill);
    const shine = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 0.05),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.15, depthTest: false, side: THREE.DoubleSide }));
    shine.position.set(0, 0.075, 0.002); shine.renderOrder = 999; g.add(shine);
    g.userData.fill = fill; g.userData.width = 2.0;
    return g;
}

function updateHpBar(enemy) {
    const bar = enemy.hpBar;
    if (!bar) return;
    const ratio = Math.max(0, enemy.hp / enemy.maxHp);
    const fill = bar.userData.fill;
    const w = bar.userData.width;
    fill.scale.x = ratio;
    fill.position.x = -(1 - ratio) * (w / 2);
    fill.material.color.setHex(ratio > 0.6 ? 0x4a8a3a : ratio > 0.3 ? 0xaa7722 : 0xaa2222);
}

// ═══════════════════════════════════════════
// МОНСТРЫ
// ═══════════════════════════════════════════

// ──── БЕС ──── (красный)
function buildBes(group, s, color) {
    const boneMat = new THREE.MeshStandardMaterial({ color: _PAL.bone, roughness: 0.7, metalness: 0.15 });
    const darkBoneMat = new THREE.MeshStandardMaterial({ color: _PAL.boneDark, roughness: 0.75 });

    _spine(group, s, -0.35, 0.4, 0, boneMat);
    const pelvis = new THREE.Mesh(new THREE.SphereGeometry(0.1 * s, 8, 6), darkBoneMat);
    pelvis.scale.set(1.4, 0.8, 1); pelvis.position.set(0, -0.35 * s, 0); group.add(pelvis);
    _ribcage(group, s, 0.1, 0, 3, 0.18, boneMat);
    _boneBetween(group, new THREE.Vector3(-0.18 * s, 0.28 * s, 0.05 * s), new THREE.Vector3(0, 0.32 * s, 0.02 * s), 0.02 * s, boneMat);
    _boneBetween(group, new THREE.Vector3(0.18 * s, 0.28 * s, 0.05 * s), new THREE.Vector3(0, 0.32 * s, 0.02 * s), 0.02 * s, boneMat);

    _skull(group, s, { y: 0.5, z: 0.04, sizeMul: 1.2, color: _PAL.bone, eyeColor: _PAL.eye, eyeIntensity: 1.0 });

    _horn(group, s * 1.1, 1, { color: 0x1a0303, length: 1.0, thick: 1.0, y: 0.65, x: 0.15 });
    _horn(group, s * 1.1, -1, { color: 0x1a0303, length: 1.0, thick: 1.0, y: 0.65, x: 0.15 });

    for (const sign of [-1, 1]) {
        const ear = new THREE.Mesh(new THREE.ConeGeometry(0.08 * s, 0.28 * s, 4), boneMat);
        ear.position.set(sign * 0.28 * s, 0.55 * s, -0.05 * s);
        ear.rotation.z = -sign * 1.0; ear.rotation.x = -0.3; group.add(ear);
    }

    for (const sign of [-1, 1]) {
        const shoulder = new THREE.Vector3(sign * 0.22 * s, 0.28 * s, 0);
        const elbow = new THREE.Vector3(sign * 0.38 * s, 0, 0.05 * s);
        const wrist = new THREE.Vector3(sign * 0.4 * s, -0.3 * s, 0.1 * s);
        _joint(group, shoulder, 0.05 * s, darkBoneMat);
        _boneBetween(group, shoulder, elbow, 0.03 * s, boneMat);
        _joint(group, elbow, 0.045 * s, darkBoneMat);
        _boneBetween(group, elbow, wrist, 0.026 * s, boneMat);
        _joint(group, wrist, 0.04 * s, darkBoneMat);
        for (let k = 0; k < 3; k++) _claw(group, s, new THREE.Vector3(sign * 0.4 * s + (k - 1) * 0.04 * s, -0.36 * s, 0.14 * s), { x: Math.PI / 2 + 0.3, y: 0, z: 0 }, { length: 0.09 });
    }

    for (const sign of [-1, 1]) {
        const hip = new THREE.Vector3(sign * 0.13 * s, -0.36 * s, 0);
        const knee = new THREE.Vector3(sign * 0.16 * s, -0.55 * s, 0.06 * s);
        const ankle = new THREE.Vector3(sign * 0.16 * s, -0.82 * s, 0.05 * s);
        _joint(group, hip, 0.05 * s, darkBoneMat);
        _boneBetween(group, hip, knee, 0.032 * s, boneMat);
        _joint(group, knee, 0.045 * s, darkBoneMat);
        _boneBetween(group, knee, ankle, 0.028 * s, boneMat);
        _joint(group, ankle, 0.04 * s, darkBoneMat);
        const foot = new THREE.Mesh(new THREE.BoxGeometry(0.11 * s, 0.05 * s, 0.18 * s), darkBoneMat);
        foot.position.set(sign * 0.16 * s, -0.85 * s, 0.1 * s); group.add(foot);
        for (let k = 0; k < 3; k++) _claw(group, s, new THREE.Vector3(sign * 0.16 * s + (k - 1) * 0.035 * s, -0.86 * s, 0.19 * s), { x: Math.PI / 2, y: 0, z: 0 }, { length: 0.07 });
    }

    _skeletonTail(group, s, { color: 0x2a0505, spikeColor: _PAL.accent, startY: -0.4, startZ: -0.15, len: 1.3 });
    _skeletonWing(group, s, 1, { membraneColor: 0x3a0606, boneColor: 0x5a1810, x: 0.22, y: 0.3, span: 2.0, drop: 1.4 });
    _skeletonWing(group, s, -1, { membraneColor: 0x3a0606, boneColor: 0x5a1810, x: 0.22, y: 0.3, span: 2.0, drop: 1.4 });
}

// ──── ГОНЧАЯ ──── (красная)
function buildHound(group, s, color) {
    const boneMat = new THREE.MeshStandardMaterial({ color: _PAL.bone, roughness: 0.7, metalness: 0.15 });
    const darkBoneMat = new THREE.MeshStandardMaterial({ color: _PAL.boneDark, roughness: 0.75 });
    const eyeColor = 0xff4400;

    for (let i = 0; i < 7; i++) {
        const vert = new THREE.Mesh(new THREE.SphereGeometry(0.03 * s, 5, 4), boneMat);
        vert.position.set((i - 3) * 0.09 * s, 0.15 * s, 0); vert.scale.set(1, 0.9, 1.4); group.add(vert);
    }
    for (let i = 0; i < 4; i++) {
        const x = (i - 1.5) * 0.12 * s;
        const ribR = (0.15 + Math.sin(i * 0.5) * 0.03) * s;
        const ribL = new THREE.Mesh(new THREE.TorusGeometry(ribR, 0.014 * s, 4, 6, Math.PI * 0.9), boneMat);
        ribL.rotation.x = Math.PI / 2; ribL.rotation.z = Math.PI * 0.55;
        ribL.position.set(x, 0.15 * s, 0); group.add(ribL);
        const ribR2 = ribL.clone(); ribR2.rotation.z = Math.PI * 0.45; group.add(ribR2);
    }
    _boneBetween(group, new THREE.Vector3(-0.15 * s, 0.15 * s, 0), new THREE.Vector3(-0.15 * s, -0.05 * s, 0), 0.02 * s, boneMat);
    _boneBetween(group, new THREE.Vector3(0.4 * s, 0.2 * s, 0), new THREE.Vector3(0.55 * s, 0.35 * s, 0), 0.04 * s, boneMat);

    _dogSkull(group, s, { x: 0.85 * s, y: 0.4 * s, z: 0, color: _PAL.bone, eyeColor });

    for (const sign of [-1, 1]) {
        const ear = new THREE.Mesh(new THREE.ConeGeometry(0.05 * s, 0.18 * s, 4), darkBoneMat);
        ear.position.set(0.75 * s, 0.55 * s, sign * 0.06 * s);
        ear.rotation.z = -0.2; ear.rotation.x = sign * 0.3; group.add(ear);
    }

    const legPositions = [
        { x: 0.35 * s, z: 0.12 * s, isFront: true },
        { x: 0.35 * s, z: -0.12 * s, isFront: true },
        { x: -0.3 * s, z: 0.12 * s, isFront: false },
        { x: -0.3 * s, z: -0.12 * s, isFront: false }
    ];
    for (const leg of legPositions) {
        const hip = new THREE.Vector3(leg.x, 0.05 * s, leg.z);
        const knee = new THREE.Vector3(leg.x + (leg.isFront ? 0.02 : -0.02) * s, -0.25 * s, leg.z);
        const ankle = new THREE.Vector3(leg.x, -0.55 * s, leg.z);
        const paw = new THREE.Vector3(leg.x, -0.62 * s, leg.z + 0.05 * s);
        _joint(group, hip, 0.04 * s, darkBoneMat);
        _boneBetween(group, hip, knee, 0.028 * s, boneMat);
        _joint(group, knee, 0.04 * s, darkBoneMat);
        _boneBetween(group, knee, ankle, 0.024 * s, boneMat);
        _joint(group, ankle, 0.035 * s, darkBoneMat);
        const pawMesh = new THREE.Mesh(new THREE.BoxGeometry(0.09 * s, 0.045 * s, 0.12 * s), darkBoneMat);
        pawMesh.position.copy(paw); group.add(pawMesh);
        for (let k = 0; k < 3; k++) _claw(group, s, new THREE.Vector3(paw.x + (k - 1) * 0.03 * s, paw.y, paw.z + 0.08 * s), { x: Math.PI / 2, y: 0, z: 0 }, { length: 0.06 });
    }

    _skeletonTail(group, s, { color: 0x2a0505, spikeColor: _PAL.accent, startY: 0.1, startZ: -0.35, len: 0.9 });

    const fireMat = new THREE.MeshBasicMaterial({ color: 0xdd3300 });
    for (let i = 0; i < 6; i++) {
        const flame = new THREE.Mesh(new THREE.ConeGeometry(0.1 * s, 0.35 * s, 4), fireMat);
        flame.position.set((i - 2.5) * 0.1 * s, 0.35 * s, 0);
        flame.rotation.z = (Math.random() - 0.5) * 0.3; group.add(flame);
    }
    const maneGlow = _glowSprite(0xdd3300, 1.8 * s);
    maneGlow.position.set(0, 0.35 * s, 0); maneGlow.material.opacity = 0.55; group.add(maneGlow);
}

function _dogSkull(group, s, opts) {
    const { x = 0, y = 0, z = 0, color = _PAL.bone, eyeColor = 0xff4400 } = opts;
    const boneMat = new THREE.MeshStandardMaterial({ color, roughness: 0.7, metalness: 0.15 });
    const darkMat = new THREE.MeshBasicMaterial({ color: 0x000000 });

    const brain = new THREE.Mesh(new THREE.SphereGeometry(0.12 * s, 10, 8), boneMat);
    brain.scale.set(1.2, 0.9, 1.0); brain.position.set(x, y + 0.04 * s, z);
    brain.castShadow = true; group.add(brain);

    const upperJaw = new THREE.Mesh(new THREE.BoxGeometry(0.16 * s, 0.06 * s, 0.2 * s), boneMat);
    upperJaw.position.set(x + 0.14 * s, y, z); group.add(upperJaw);

    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.03 * s, 6, 4), darkMat);
    nose.position.set(x + 0.24 * s, y + 0.02 * s, z); group.add(nose);

    const lowerJaw = new THREE.Mesh(new THREE.BoxGeometry(0.14 * s, 0.04 * s, 0.17 * s), boneMat);
    lowerJaw.position.set(x + 0.13 * s, y - 0.06 * s, z); group.add(lowerJaw);

    const toothMat = new THREE.MeshStandardMaterial({ color: 0xe8d0b8, roughness: 0.5 });
    for (let i = 0; i < 3; i++) {
        const up = new THREE.Mesh(new THREE.ConeGeometry(0.012 * s, 0.04 * s, 4), toothMat);
        up.position.set(x + 0.1 * s + i * 0.05 * s, y - 0.04 * s, z);
        up.rotation.x = Math.PI; group.add(up);
        const low = new THREE.Mesh(new THREE.ConeGeometry(0.011 * s, 0.035 * s, 4), toothMat);
        low.position.set(x + 0.1 * s + i * 0.05 * s, y - 0.08 * s, z); group.add(low);
    }

    for (const sign of [-1, 1]) {
        const socket = new THREE.Mesh(new THREE.SphereGeometry(0.04 * s, 6, 4), darkMat);
        socket.position.set(x + 0.05 * s, y + 0.06 * s, sign * 0.06 * s); group.add(socket);
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.025 * s, 6, 4),
            new THREE.MeshBasicMaterial({ color: eyeColor }));
        eye.position.set(x + 0.05 * s, y + 0.06 * s, sign * 0.065 * s); group.add(eye);
        const glow = _glowSprite(eyeColor, 0.3 * s);
        glow.position.copy(eye.position); glow.material.opacity = 0.6; group.add(glow);
    }
}

// ──── СУККУБ ──── (теперь КРАСНАЯ, была маджента)
function buildSuccubus(group, s, color) {
    const boneMat = new THREE.MeshStandardMaterial({ color: _PAL.bone, roughness: 0.65, metalness: 0.15 });
    const darkBoneMat = new THREE.MeshStandardMaterial({ color: _PAL.boneDark, roughness: 0.7 });
    const eyeColor = _PAL.eye;

    _spine(group, s, -0.4, 0.45, 0, boneMat);
    const pelvis = new THREE.Mesh(new THREE.SphereGeometry(0.12 * s, 8, 6), darkBoneMat);
    pelvis.scale.set(1.6, 0.8, 1); pelvis.position.set(0, -0.4 * s, 0); group.add(pelvis);
    _ribcage(group, s, 0.1, 0, 4, 0.16, boneMat);
    _boneBetween(group, new THREE.Vector3(-0.2 * s, 0.3 * s, 0.05 * s), new THREE.Vector3(0, 0.35 * s, 0.02 * s), 0.018 * s, boneMat);
    _boneBetween(group, new THREE.Vector3(0.2 * s, 0.3 * s, 0.05 * s), new THREE.Vector3(0, 0.35 * s, 0.02 * s), 0.018 * s, boneMat);

    _skull(group, s, { y: 0.55, z: 0.04, sizeMul: 1.0, color: _PAL.bone, eyeColor, eyeIntensity: 0.8 });

    _horn(group, s * 0.9, 1, { color: 0x1a0303, length: 0.7, thick: 0.8, y: 0.7, x: 0.12, curve: 0.55 });
    _horn(group, s * 0.9, -1, { color: 0x1a0303, length: 0.7, thick: 0.8, y: 0.7, x: 0.12, curve: 0.55 });

    // Волосы — тёмно-красные пряди
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x2a0505, roughness: 0.8, metalness: 0.15 });
    for (let i = 0; i < 6; i++) {
        const ang = (i - 2.5) * 0.4;
        const strand = new THREE.Mesh(new THREE.CylinderGeometry(0.04 * s, 0.015 * s, 0.85 * s, 5), hairMat);
        strand.position.set(Math.sin(ang) * 0.25 * s, 0.5 * s, Math.cos(ang) * 0.15 * s - 0.12 * s);
        strand.rotation.x = -0.35; strand.rotation.z = ang * 0.5; group.add(strand);
    }

    for (const sign of [-1, 1]) {
        const shoulder = new THREE.Vector3(sign * 0.2 * s, 0.3 * s, 0.02 * s);
        const elbow = new THREE.Vector3(sign * 0.32 * s, 0.05 * s, 0.05 * s);
        const wrist = new THREE.Vector3(sign * 0.34 * s, -0.25 * s, 0.08 * s);
        _joint(group, shoulder, 0.045 * s, darkBoneMat);
        _boneBetween(group, shoulder, elbow, 0.026 * s, boneMat);
        _joint(group, elbow, 0.04 * s, darkBoneMat);
        _boneBetween(group, elbow, wrist, 0.022 * s, boneMat);
        _joint(group, wrist, 0.035 * s, darkBoneMat);
        for (let k = 0; k < 3; k++) _claw(group, s, new THREE.Vector3(sign * 0.34 * s + (k - 1) * 0.04 * s, -0.32 * s, 0.12 * s), { x: Math.PI / 2 + 0.3, y: 0, z: 0 }, { length: 0.07 });
    }

    for (const sign of [-1, 1]) {
        const hip = new THREE.Vector3(sign * 0.15 * s, -0.4 * s, 0);
        const knee = new THREE.Vector3(sign * 0.18 * s, -0.6 * s, 0.06 * s);
        const ankle = new THREE.Vector3(sign * 0.18 * s, -0.95 * s, 0.05 * s);
        _joint(group, hip, 0.05 * s, darkBoneMat);
        _boneBetween(group, hip, knee, 0.03 * s, boneMat);
        _joint(group, knee, 0.042 * s, darkBoneMat);
        _boneBetween(group, knee, ankle, 0.026 * s, boneMat);
        _joint(group, ankle, 0.038 * s, darkBoneMat);
        const hoof = new THREE.Mesh(new THREE.ConeGeometry(0.09 * s, 0.18 * s, 4),
            new THREE.MeshStandardMaterial({ color: 0x1a0303, roughness: 0.7, metalness: 0.3 }));
        hoof.position.set(sign * 0.18 * s, -1.05 * s, 0.05 * s);
        hoof.rotation.x = Math.PI; group.add(hoof);
    }

    _skeletonTail(group, s, { color: 0x2a0505, spikeColor: _PAL.accent, startY: -0.35, startZ: -0.2, len: 1.4 });

    _skeletonWing(group, s, 1, { membraneColor: 0x4a0808, boneColor: 0x3a0505, x: 0.25, y: 0.35, span: 2.2, drop: 1.6 });
    _skeletonWing(group, s, -1, { membraneColor: 0x4a0808, boneColor: 0x3a0505, x: 0.25, y: 0.35, span: 2.2, drop: 1.6 });

    const aura = new THREE.Mesh(new THREE.SphereGeometry(1.1 * s, 10, 8),
        new THREE.MeshBasicMaterial({ color: _PAL.accent, transparent: true, opacity: 0.04, side: THREE.BackSide, depthWrite: false }));
    group.add(aura);
}

// ──── РЫЦАРЬ ──── (уже красный, минимальные правки)
function buildKnight(group, s, color) {
    const plateMat = new THREE.MeshStandardMaterial({
        color: 0x3a1810, roughness: 0.55, metalness: 0.85,
        emissive: 0x2a0808, emissiveIntensity: 0.18
    });
    const darkPlate = new THREE.MeshStandardMaterial({ color: 0x1a0806, roughness: 0.6, metalness: 0.8 });
    const fireMat = new THREE.MeshBasicMaterial({ color: 0xff3300 });
    const goldMat = new THREE.MeshStandardMaterial({
        color: 0x5a2010, roughness: 0.5, metalness: 0.85,
        emissive: 0x2a0800, emissiveIntensity: 0.2
    });

    for (const sign of [-1, 1]) {
        const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.15 * s, 0.12 * s, 0.55 * s, 8), plateMat);
        thigh.position.set(sign * 0.26 * s, -0.55 * s, 0); thigh.castShadow = true; group.add(thigh);
        const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.12 * s, 0.14 * s, 0.55 * s, 8), plateMat);
        shin.position.set(sign * 0.26 * s, -1.05 * s, 0); shin.castShadow = true; group.add(shin);
        const boot = new THREE.Mesh(new THREE.BoxGeometry(0.24 * s, 0.16 * s, 0.38 * s), darkPlate);
        boot.position.set(sign * 0.26 * s, -1.34 * s, 0.04 * s); group.add(boot);
    }
    const chest = new THREE.Mesh(new THREE.BoxGeometry(s * 0.92, s * 0.65, s * 0.58), plateMat);
    chest.position.y = s * 0.08; chest.castShadow = true; group.add(chest);
    const abdomen = new THREE.Mesh(new THREE.BoxGeometry(s * 0.75, s * 0.38, s * 0.48), darkPlate);
    abdomen.position.y = -s * 0.3; group.add(abdomen);
    for (const sign of [-1, 1]) {
        const pad = new THREE.Mesh(new THREE.SphereGeometry(s * 0.3, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), plateMat);
        pad.position.set(sign * s * 0.62, s * 0.32, 0); pad.rotation.z = -sign * 0.28; pad.castShadow = true; group.add(pad);
        const spike = new THREE.Mesh(new THREE.ConeGeometry(0.06 * s, 0.22 * s, 4), goldMat);
        spike.position.set(sign * s * 0.75, s * 0.55, 0); spike.rotation.z = -sign * 0.3; group.add(spike);
    }
    for (let k = 0; k < 3; k++) {
        const crack = new THREE.Mesh(new THREE.BoxGeometry(s * 0.04, s * 0.02 + k * s * 0.06, s * 0.02), fireMat);
        crack.position.set((k - 1) * s * 0.22, s * 0.12 - k * s * 0.1, s * 0.30); crack.rotation.z = (k - 1) * 0.4; group.add(crack);
    }
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.12 * s, 0.16 * s, 0.15 * s, 6), darkPlate);
    neck.position.y = s * 0.46; group.add(neck);
    const helmPts = [];
    for (let i = 0; i <= 8; i++) {
        const t = i / 8;
        helmPts.push(new THREE.Vector2(s * 0.34 * Math.sin(t * Math.PI * 0.92), t * s * 0.58));
    }
    const helm = new THREE.Mesh(new THREE.LatheGeometry(helmPts, 12), plateMat);
    helm.position.y = s * 0.56; helm.castShadow = true; group.add(helm);
    const visorSlot = new THREE.Mesh(new THREE.BoxGeometry(s * 0.4, s * 0.09, s * 0.05), new THREE.MeshBasicMaterial({ color: 0x000000 }));
    visorSlot.position.set(0, s * 0.72, s * 0.31); group.add(visorSlot);
    for (const sign of [-1, 1]) {
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.02 * s, 6, 4), fireMat);
        eye.position.set(sign * 0.07 * s, s * 0.72, s * 0.34); group.add(eye);
    }
    const capeGeo = new THREE.PlaneGeometry(s * 1.5, s * 2.2, 4, 6);
    const pos = capeGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
        const y = pos.getY(i), x = pos.getX(i);
        pos.setZ(i, -s * 0.15 - Math.pow((y + s) / (2 * s), 2) * s * 0.4 - Math.abs(x) * 0.06);
    }
    capeGeo.computeVertexNormals();
    const cape = new THREE.Mesh(capeGeo, new THREE.MeshStandardMaterial({ color: 0x2a0804, roughness: 0.92, metalness: 0.08, side: THREE.DoubleSide }));
    cape.position.set(0, s * 0.05, -s * 0.42); group.add(cape);
    const blade = new THREE.Mesh(new THREE.BoxGeometry(s * 0.1, s * 1.55, s * 0.06),
        new THREE.MeshStandardMaterial({ color: 0x8a6060, metalness: 0.95, roughness: 0.2, emissive: 0xcc2200, emissiveIntensity: 0.5 }));
    blade.position.set(s * 0.92, s * 0.5, s * 0.35); blade.castShadow = true; group.add(blade);
    const guard = new THREE.Mesh(new THREE.BoxGeometry(s * 0.44, s * 0.09, s * 0.11), goldMat);
    guard.position.set(s * 0.92, s * 1.15, s * 0.35); group.add(guard);
    const shield = new THREE.Mesh(new THREE.BoxGeometry(s * 0.3, s * 1.2, s * 0.14), darkPlate);
    shield.position.set(-s * 0.92, s * 0.15, s * 0.35); group.add(shield);
}

// ──── ПОЖИРАТЕЛЬ ДУШ ──── (ЗЕЛЁНЫЙ, единственный)
function buildSoulEater(group, s, color) {
    const robeMat = new THREE.MeshStandardMaterial({
        color: 0x051208, roughness: 0.94, metalness: 0.05,
        emissive: 0x001a00, emissiveIntensity: 0.1, side: THREE.DoubleSide
    });
    const hoodMat = new THREE.MeshStandardMaterial({ color: 0x040a06, roughness: 0.94, metalness: 0.1 });
    const boneMat = new THREE.MeshStandardMaterial({ color: _PAL.boneGreen, roughness: 0.75, metalness: 0.1 });
    const greenGlow = _PAL.eyeGreen;

    const robePts = [];
    const robeH = s * 2.4;
    for (let i = 0; i <= 14; i++) {
        const t = i / 14;
        let r = s * 0.95 * (1 - t) + s * 0.18 * t;
        if (t > 0.82) r += Math.sin(i * 7) * s * 0.09;
        robePts.push(new THREE.Vector2(r, t * robeH - robeH * 0.6));
    }
    const robe = new THREE.Mesh(new THREE.LatheGeometry(robePts, 14), robeMat);
    robe.castShadow = true; robe.receiveShadow = true; group.add(robe);

    const hood = new THREE.Mesh(new THREE.SphereGeometry(s * 0.65, 14, 12, 0, Math.PI * 2, 0, Math.PI * 0.62), hoodMat);
    hood.position.y = s * 1.32; hood.rotation.x = -0.15; hood.castShadow = true; group.add(hood);

    _skull(group, s, { y: s * 1.25, z: s * 0.12, sizeMul: 0.9, color: _PAL.boneGreen, eyeColor: greenGlow, eyeIntensity: 1.2 });

    for (const sign of [-1, 1]) {
        const shoulder = new THREE.Vector3(sign * 0.55 * s, s * 0.5, s * 0.15);
        const elbow = new THREE.Vector3(sign * 0.65 * s, s * 0.15, s * 0.25);
        const wrist = new THREE.Vector3(sign * 0.62 * s, -s * 0.2, s * 0.35);
        _joint(group, shoulder, 0.08 * s, boneMat);
        _boneBetween(group, shoulder, elbow, 0.045 * s, boneMat);
        _joint(group, elbow, 0.06 * s, boneMat);
        _boneBetween(group, elbow, wrist, 0.035 * s, boneMat);
        _joint(group, wrist, 0.05 * s, boneMat);
        for (let k = 0; k < 3; k++) _boneBetween(group, wrist, new THREE.Vector3(sign * 0.62 * s + (k - 1) * 0.05 * s, -s * 0.32, s * 0.42), 0.015 * s, boneMat);
    }

    const lantern = new THREE.Group();
    const lanternBody = new THREE.Mesh(new THREE.BoxGeometry(0.35 * s, 0.42 * s, 0.35 * s),
        new THREE.MeshStandardMaterial({ color: 0x101a10, metalness: 0.85, roughness: 0.4 }));
    lantern.add(lanternBody);
    const lanternGlass = new THREE.Mesh(new THREE.SphereGeometry(0.16 * s, 8, 6),
        new THREE.MeshBasicMaterial({ color: 0x5aff78 }));
    lantern.add(lanternGlass);
    const lanternGlow = _glowSprite(greenGlow, s * 1.0);
    lanternGlow.material.opacity = 0.6; lantern.add(lanternGlow);
    const cap = new THREE.Mesh(new THREE.ConeGeometry(0.28 * s, 0.2 * s, 4),
        new THREE.MeshStandardMaterial({ color: 0x101a10, metalness: 0.85 }));
    cap.position.y = 0.3 * s; lantern.add(cap);
    lantern.position.set(s * 0.7, s * 0.15, s * 0.5); group.add(lantern);

    const lanternLight = new THREE.PointLight(greenGlow, 0.5, 4);
    lanternLight.position.copy(lantern.position); group.add(lanternLight);

    for (let k = 0; k < 4; k++) {
        const link = new THREE.Mesh(new THREE.TorusGeometry(0.045 * s, 0.012 * s, 5, 6),
            new THREE.MeshStandardMaterial({ color: 0x2a2a2a, metalness: 0.9, roughness: 0.4 }));
        link.position.set(s * 0.7, s * 0.55 + k * s * 0.1, s * 0.5);
        link.rotation.x = k % 2 ? 0 : Math.PI / 2; group.add(link);
    }
}

// ──── БАЛЛИСТА ──── (красноватая)
function buildBallista(group, s, color) {
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x4a2a1a, roughness: 0.92, metalness: 0.1 });
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x2a0808, roughness: 0.55, metalness: 0.8 });

    for (const zOff of [-s * 0.32, s * 0.32]) {
        const rail = new THREE.Mesh(new THREE.BoxGeometry(s * 1.9, s * 0.22, s * 0.18), woodMat);
        rail.position.set(0, s * 0.15, zOff); rail.castShadow = true; group.add(rail);
    }
    for (const x of [-s * 0.7, s * 0.7]) {
        const cross = new THREE.Mesh(new THREE.BoxGeometry(s * 0.2, s * 0.2, s * 0.85), woodMat);
        cross.position.set(x, s * 0.13, 0); group.add(cross);
    }
    for (const x of [-s * 0.72, s * 0.72]) {
        for (const z of [-s * 0.58, s * 0.58]) {
            const wheel = new THREE.Mesh(new THREE.CylinderGeometry(s * 0.42, s * 0.42, s * 0.2, 16), metalMat);
            wheel.position.set(x, -s * 0.32, z); wheel.rotation.x = Math.PI / 2; wheel.castShadow = true; group.add(wheel);
            for (let k = 0; k < 6; k++) {
                const spoke = new THREE.Mesh(new THREE.BoxGeometry(s * 0.07, s * 0.72, 0.02 * s), woodMat);
                spoke.position.copy(wheel.position); spoke.rotation.x = Math.PI / 2; spoke.rotation.z = (k / 6) * Math.PI; group.add(spoke);
            }
        }
    }
    const mount = new THREE.Mesh(new THREE.BoxGeometry(s * 1.0, s * 0.35, s * 0.7), metalMat);
    mount.position.y = s * 0.45; group.add(mount);
    for (const yOff of [s * 0.35, s * 0.65]) {
        const arm = new THREE.Mesh(new THREE.TorusGeometry(s * 0.85, s * 0.06, 6, 16, Math.PI), metalMat);
        arm.position.set(0, yOff, s * 0.2); arm.rotation.x = Math.PI / 2; arm.rotation.z = Math.PI / 2; group.add(arm);
        const stringGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, yOff, s * 0.2 + s * 0.85),
            new THREE.Vector3(0, yOff - s * 0.06, s * 0.2),
            new THREE.Vector3(0, yOff, s * 0.2 - s * 0.85)
        ]);
        group.add(new THREE.Line(stringGeo, new THREE.LineBasicMaterial({ color: 0x8a5a48 })));
    }
    const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.055 * s, 0.055 * s, s * 2.4, 6),
        new THREE.MeshStandardMaterial({ color: 0x6a5040, metalness: 0.9, roughness: 0.35 }));
    bolt.rotation.x = Math.PI / 2; bolt.position.set(0, s * 0.5, s * 0.6); group.add(bolt);
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.11 * s, 0.32 * s, 6),
        new THREE.MeshStandardMaterial({ color: _PAL.accent, emissive: _PAL.hot, emissiveIntensity: 0.4 }));
    tip.position.set(0, s * 0.5, s * 1.95); tip.rotation.x = Math.PI / 2; group.add(tip);
    const post = new THREE.Mesh(new THREE.BoxGeometry(s * 0.25, s * 0.8, s * 0.25), woodMat);
    post.position.set(0, s * 0.7, -s * 0.3); group.add(post);

    _skull(group, s, { y: s * 0.85, z: s * 0.9, sizeMul: 0.7, color: _PAL.bone, eyeColor: _PAL.accent, eyeIntensity: 0.4 });

    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.035 * s, 0.035 * s, s * 1.4, 5), woodMat);
    pole.position.set(s * 0.85, s * 0.8, 0); group.add(pole);
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(s * 0.75, s * 0.5),
        new THREE.MeshBasicMaterial({ color: 0xaa2200, side: THREE.DoubleSide }));
    flag.position.set(s * 1.15, s * 1.2, 0); group.add(flag);
}

// ──── БАРОН ────
function buildBaron(group, s, color) {
    _skull(group, s, { y: 0.2 * s, z: 0.15 * s, sizeMul: 1.8, color: _PAL.bone, eyeColor: _PAL.eye, eyeIntensity: 1.5 });
    _horn(group, s * 1.5, 1, { color: 0x1a0303, length: 1.4, thick: 1.4, y: 0.5, x: 0.35 });
    _horn(group, s * 1.5, -1, { color: 0x1a0303, length: 1.4, thick: 1.4, y: 0.5, x: 0.35 });
    _spine(group, s, -0.9, 0.1, 0.05, new THREE.MeshStandardMaterial({ color: _PAL.bone, roughness: 0.7 }));
    _ribcage(group, s, -0.3, 0.05, 4, 0.35, new THREE.MeshStandardMaterial({ color: _PAL.bone, roughness: 0.7 }));

    const orb = new THREE.Mesh(new THREE.SphereGeometry(s * 0.25, 12, 10),
        new THREE.MeshBasicMaterial({ color: _PAL.accent }));
    orb.position.set(0, -0.3 * s, 0.3 * s); group.add(orb);
    const orbGlow = _glowSprite(_PAL.accent, 1.6 * s);
    orbGlow.position.copy(orb.position); orbGlow.material.opacity = 0.7; group.add(orbGlow);

    _skeletonWing(group, s, 1, { membraneColor: 0x3a0606, boneColor: 0x6a1a0a, x: 0.4, y: 0.1, span: 2.4, drop: 1.8 });
    _skeletonWing(group, s, -1, { membraneColor: 0x3a0606, boneColor: 0x6a1a0a, x: 0.4, y: 0.1, span: 2.4, drop: 1.8 });

    for (const sign of [-1, 1]) {
        const shoulder = new THREE.Vector3(sign * 0.5 * s, -0.4 * s, 0.1 * s);
        const elbow = new THREE.Vector3(sign * 0.75 * s, -0.8 * s, 0.15 * s);
        const wrist = new THREE.Vector3(sign * 0.7 * s, -1.2 * s, 0.2 * s);
        const boneMat = new THREE.MeshStandardMaterial({ color: _PAL.bone, roughness: 0.7 });
        _joint(group, shoulder, 0.1 * s, boneMat);
        _boneBetween(group, shoulder, elbow, 0.06 * s, boneMat);
        _joint(group, elbow, 0.08 * s, boneMat);
        _boneBetween(group, elbow, wrist, 0.05 * s, boneMat);
        for (let k = 0; k < 3; k++) _claw(group, s, new THREE.Vector3(sign * 0.7 * s + (k - 1) * 0.07 * s, -1.28 * s, 0.25 * s), { x: Math.PI / 2, y: 0, z: 0 }, { length: 0.15, color: _PAL.boneDark });
    }
}

// ──── ТРУБАЧ ──── (КРАСНЫЙ, был золотой)
function buildTrumpeter(group, s, color) {
    _skull(group, s, { y: 0.2 * s, z: 0.15 * s, sizeMul: 1.6, color: _PAL.bone, eyeColor: _PAL.eye, eyeIntensity: 1.2 });
    _spine(group, s, -0.9, 0.1, 0.05, new THREE.MeshStandardMaterial({ color: _PAL.bone, roughness: 0.7 }));
    _ribcage(group, s, -0.3, 0.05, 4, 0.32, new THREE.MeshStandardMaterial({ color: _PAL.bone, roughness: 0.7 }));

    // Корона из красных шипов
    for (let i = 0; i < 6; i++) {
        const ang = (i / 6) * Math.PI * 2;
        const spike = new THREE.Mesh(new THREE.ConeGeometry(0.06 * s, 0.25 * s, 4),
            new THREE.MeshStandardMaterial({ color: _PAL.accent, emissive: _PAL.hot, emissiveIntensity: 0.5, metalness: 0.9, roughness: 0.3 }));
        spike.position.set(Math.cos(ang) * 0.3 * s, 0.5 * s, Math.sin(ang) * 0.3 * s + 0.15 * s);
        group.add(spike);
    }

    // Рог — красный
    const hornPts = [];
    for (let i = 0; i <= 10; i++) {
        const t = i / 10;
        hornPts.push(new THREE.Vector2(0.16 * s + t * t * 0.55 * s, t * 1.7 * s));
    }
    const horn = new THREE.Mesh(new THREE.LatheGeometry(hornPts, 14),
        new THREE.MeshStandardMaterial({ color: 0x8a2210, emissive: _PAL.hot, emissiveIntensity: 0.5, roughness: 0.35, metalness: 0.9 }));
    horn.rotation.z = -Math.PI / 2; horn.position.set(s * 0.7, -0.1 * s, 0); group.add(horn);

    _skeletonWing(group, s, 1, { membraneColor: 0x3a0808, boneColor: 0x5a1810, x: 0.35, y: 0.05, span: 2.2, drop: 1.6 });
    _skeletonWing(group, s, -1, { membraneColor: 0x3a0808, boneColor: 0x5a1810, x: 0.35, y: 0.05, span: 2.2, drop: 1.6 });
}

// ──── ШПИЛЬ ──── (КРАСНЫЙ, был пурпурный)
function buildSpire(group, s, color) {
    const stoneMat = new THREE.MeshStandardMaterial({
        color: 0x1a0505, roughness: 0.85, metalness: 0.35,
        emissive: 0x220808, emissiveIntensity: 0.15
    });
    const spirePts = [];
    for (let i = 0; i <= 12; i++) {
        const t = i / 12;
        const r = s * 1.15 * (1 - t) + s * 0.12 * t;
        spirePts.push(new THREE.Vector2(r, t * s * 3.6 - s * 1.2));
    }
    const obelisk = new THREE.Mesh(new THREE.LatheGeometry(spirePts, 6), stoneMat);
    obelisk.castShadow = true; group.add(obelisk);

    for (let i = 0; i < 6; i++) {
        const ang = (i / 6) * Math.PI * 2;
        const spike = new THREE.Mesh(new THREE.ConeGeometry(0.14 * s, s * 1.4, 4),
            new THREE.MeshStandardMaterial({ color: 0x3a0808, emissive: 0x5a1810, emissiveIntensity: 0.4 }));
        spike.position.set(Math.cos(ang) * s * 0.9, s * 1.1, Math.sin(ang) * s * 0.9);
        spike.rotation.z = Math.cos(ang) * 0.4; spike.rotation.x = Math.sin(ang) * 0.4; group.add(spike);
    }

    const top = new THREE.Mesh(new THREE.OctahedronGeometry(s * 0.5, 0),
        new THREE.MeshStandardMaterial({ color: _PAL.accent, emissive: 0x661000, emissiveIntensity: 0.8, roughness: 0.3, metalness: 0.5 }));
    top.position.y = s * 2.65; group.add(top);
    const topGlow = _glowSprite(_PAL.accent, s * 1.8);
    topGlow.position.copy(top.position); topGlow.material.opacity = 0.7; group.add(topGlow);

    for (let i = 0; i < 3; i++) {
        _skull(group, s, { y: s * (0.2 + i * 0.5), z: s * 0.7, sizeMul: 0.5, color: _PAL.boneDark, eyeColor: _PAL.accent, eyeIntensity: 0.4 });
    }
}

// ──── КОЛОСС ────
function buildColossus(group, s, color) {
    const rockMat = new THREE.MeshStandardMaterial({
        color: 0x1a0808, roughness: 0.9, metalness: 0.25,
        emissive: 0x1a0202, emissiveIntensity: 0.1
    });
    const darkRock = new THREE.MeshStandardMaterial({ color: 0x0e0404, roughness: 0.95, metalness: 0.2 });
    const crackMat = new THREE.MeshBasicMaterial({ color: _PAL.accent });

    const torso = new THREE.Mesh(new THREE.BoxGeometry(s * 1.8, s * 2.2, s * 1.5), rockMat);
    torso.position.y = s * 0.3; torso.castShadow = true; torso.receiveShadow = true; group.add(torso);

    for (const x of [-1, 1]) {
        const shoulder = new THREE.Mesh(new THREE.SphereGeometry(s * 0.6, 10, 8), rockMat);
        shoulder.position.set(x * s * 1.0, s * 1.0, 0); shoulder.scale.set(1.15, 0.9, 1.15); shoulder.castShadow = true; group.add(shoulder);
    }

    _skull(group, s, { y: s * 1.9, z: 0, sizeMul: 1.5, color: _PAL.bone, eyeColor: _PAL.eyeDeep, eyeIntensity: 1.2 });

    for (let i = 0; i < 4; i++) {
        const ang = (i / 4) * Math.PI * 2 + Math.PI / 4;
        const horn = new THREE.Mesh(new THREE.ConeGeometry(0.13 * s, 0.65 * s, 5), darkRock);
        horn.position.set(Math.cos(ang) * s * 0.42, s * 2.45, Math.sin(ang) * s * 0.42);
        horn.rotation.z = Math.cos(ang) * 0.5; horn.rotation.x = -Math.sin(ang) * 0.5; group.add(horn);
    }

    for (const x of [-1, 1]) {
        const arm = new THREE.Mesh(new THREE.BoxGeometry(s * 0.55, s * 1.7, s * 0.55), rockMat);
        arm.position.set(x * s * 1.35, s * 0.15, 0); arm.castShadow = true; group.add(arm);
        const fist = new THREE.Mesh(new THREE.BoxGeometry(s * 0.7, s * 0.7, s * 0.7), darkRock);
        fist.position.set(x * s * 1.35, -s * 1.0, 0); fist.castShadow = true; group.add(fist);
    }
    for (const x of [-1, 1]) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(s * 0.65, s * 1.4, s * 0.65), rockMat);
        leg.position.set(x * s * 0.45, -s * 1.55, 0); leg.castShadow = true; group.add(leg);
        const foot = new THREE.Mesh(new THREE.BoxGeometry(s * 0.8, s * 0.35, s * 0.9), darkRock);
        foot.position.set(x * s * 0.45, -s * 2.35, s * 0.1); group.add(foot);
    }
    for (let i = 0; i < 8; i++) {
        const crack = new THREE.Mesh(new THREE.BoxGeometry(0.05 * s, 0.3 * s + Math.random() * 0.6 * s, 0.03 * s), crackMat);
        crack.position.set((Math.random() - 0.5) * s * 1.6, (Math.random() - 0.5) * s * 1.8 + s * 0.3, s * 0.76);
        crack.rotation.z = (Math.random() - 0.5) * 0.6; group.add(crack);
    }
    const core = new THREE.Mesh(new THREE.SphereGeometry(s * 0.28, 10, 8), crackMat);
    core.position.set(0, s * 0.4, s * 0.78); group.add(core);
    const coreGlow = _glowSprite(_PAL.accent, s * 1.8);
    coreGlow.position.copy(core.position); coreGlow.material.opacity = 0.75; group.add(coreGlow);
}

// ═══════════════════════════════════════════
// ДИСПЕТЧЕР
// ═══════════════════════════════════════════
function buildEnemyModel(type) {
    const data = ENEMIES_DATA[type];
    const group = new THREE.Group();
    const s = data.size;
    const color = data.color;
    switch (type) {
        case 'bes':        buildBes(group, s, color); break;
        case 'hound':      buildHound(group, s, color); break;
        case 'succubus':   buildSuccubus(group, s, color); break;
        case 'knight':     buildKnight(group, s, color); break;
        case 'soul_eater': buildSoulEater(group, s, color); break;
        case 'ballista':   buildBallista(group, s, color); break;
        case 'baron':      buildBaron(group, s, color); break;
        case 'trumpeter':  buildTrumpeter(group, s, color); break;
        case 'spire':      buildSpire(group, s, color); break;
        case 'colossus':   buildColossus(group, s, color); break;
        default: {
            const box = new THREE.Mesh(new THREE.BoxGeometry(s * 1.5, s * 1.5, s * 1.5),
                new THREE.MeshStandardMaterial({ color, roughness: 0.8 }));
            box.castShadow = true;
            group.add(box);
        }
    }
    return group;
}