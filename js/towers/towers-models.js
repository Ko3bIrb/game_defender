// towers-models.js — мраморные башни в тон крепости (бежево-кремовые + золото)

const TOWER_PALETTE = {
    gun:      { stone: 0xc8b898, accent: 0xcc8820, rim: 0x5a4838 },
    sniper:   { stone: 0xd8d0b8, accent: 0x88aacc, rim: 0x6a6058 },
    mortar:   { stone: 0xb8a888, accent: 0xddaa44, rim: 0x5a4830 },
    slow:     { stone: 0xc0b8a8, accent: 0x88bbdd, rim: 0x605850 },
    skyguard: { stone: 0xe0d8c0, accent: 0xffcc44, rim: 0x706040 },
    amp:      { stone: 0xc0b8a8, accent: 0xff88cc, rim: 0x605850 }
};

function _buildBase(group, palette, typeId) {
    const stoneMat = new THREE.MeshStandardMaterial({
        color: palette.stone, roughness: 0.88, metalness: 0.25,
        emissive: 0x000000, emissiveIntensity: 0
    });
    const rimMat = new THREE.MeshStandardMaterial({
        color: palette.rim, roughness: 0.85, metalness: 0.3
    });

    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.68, 0.42, 8), stoneMat);
    base.position.y = 0.21; base.castShadow = true; base.receiveShadow = true;
    group.add(base);

    const crackMat = new THREE.MeshBasicMaterial({ color: 0x4a3a28 });
    for (let i = 0; i < 4; i++) {
        const ang = (i / 4) * Math.PI * 2 + 0.3;
        const crack = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.1 + Math.random() * 0.15, 0.02), crackMat);
        crack.position.set(Math.cos(ang) * 0.62, 0.15 + Math.random() * 0.2, Math.sin(ang) * 0.62);
        crack.rotation.y = ang;
        crack.rotation.z = (Math.random() - 0.5) * 0.3;
        group.add(crack);
    }

    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.6, 0.06, 8), stoneMat);
    cap.position.y = 0.45;
    group.add(cap);

    const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.62, 0.04, 6, 24),
        rimMat
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.46;
    group.add(ring);

    const runeMat = new THREE.MeshStandardMaterial({
        color: palette.accent, emissive: palette.accent, emissiveIntensity: 0.4,
        roughness: 0.6, metalness: 0.4
    });
    for (let i = 0; i < 4; i++) {
        const ang = (i / 4) * Math.PI * 2 + Math.PI / 8;
        const rune = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.03, 0.12), runeMat);
        rune.position.set(Math.cos(ang) * 0.55, 0.43, Math.sin(ang) * 0.55);
        rune.lookAt(0, 0.43, 0);
        group.add(rune);
    }
}

function buildTowerModel(typeId, level) {
    const palette = TOWER_PALETTE[typeId] || TOWER_PALETTE.gun;
    const group = new THREE.Group();
    group.userData.typeId = typeId;

    _buildBase(group, palette, typeId);

    const stoneMat = new THREE.MeshStandardMaterial({
        color: palette.stone, roughness: 0.85, metalness: 0.2
    });
    const darkStoneMat = new THREE.MeshStandardMaterial({
        color: palette.rim, roughness: 0.85, metalness: 0.3
    });
    const brightAccentMat = new THREE.MeshBasicMaterial({ color: palette.accent });

    const turret = new THREE.Group();
    turret.position.y = 0.62;

    const muzzlePoint = new THREE.Object3D();
    turret.add(muzzlePoint);
    group.userData.muzzlePoint = muzzlePoint;

    if (typeId === 'gun') {
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.48, 0.75), stoneMat);
        body.castShadow = true;
        turret.add(body);

        const plate = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.15, 0.6), darkStoneMat);
        plate.position.y = 0.3;
        turret.add(plate);

        const barrelMat = new THREE.MeshStandardMaterial({
            color: 0x2a2018, metalness: 0.9, roughness: 0.35
        });
        const barrel1 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.9, 8), barrelMat);
        barrel1.rotation.x = Math.PI / 2;
        barrel1.position.set(-0.15, 0.05, 0.55);
        barrel1.castShadow = true;
        turret.add(barrel1);

        if (level >= 2) {
            const barrel2 = barrel1.clone();
            barrel2.position.x = 0.15;
            turret.add(barrel2);
        } else {
            barrel1.position.x = 0;
        }

        const muzzles = level >= 2 ? [-0.15, 0.15] : [0];
        for (const mx of muzzles) {
            const glow = new THREE.Mesh(
                new THREE.SphereGeometry(0.06, 6, 4),
                brightAccentMat
            );
            glow.position.set(mx, 0.05, 1.0);
            turret.add(glow);
        }

        muzzlePoint.position.set(level >= 2 ? 0.15 : 0, 0.05, 1.0);

    } else if (typeId === 'sniper') {
        const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.48, 1.4, 6), stoneMat);
        tower.position.y = 0.7; tower.castShadow = true; turret.add(tower);

        for (let i = 0; i < 3; i++) {
            const band = new THREE.Mesh(
                new THREE.TorusGeometry(0.4 - i * 0.05, 0.04, 6, 12),
                darkStoneMat
            );
            band.rotation.x = Math.PI / 2;
            band.position.y = 0.3 + i * 0.4;
            turret.add(band);
        }

        const platform = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.42, 0.15, 6), darkStoneMat);
        platform.position.y = 1.45; platform.castShadow = true; turret.add(platform);

        const barrelMat = new THREE.MeshStandardMaterial({ color: 0x3a3028, metalness: 0.95, roughness: 0.3 });
        const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.075, 1.8, 8), barrelMat);
        barrel.rotation.x = Math.PI / 2;
        barrel.position.set(0, 1.55, 0.9);
        barrel.castShadow = true;
        turret.add(barrel);

        const lens = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 4), brightAccentMat);
        lens.position.set(0, 1.55, 1.75);
        turret.add(lens);

        const scope = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.35, 6), barrelMat);
        scope.rotation.x = Math.PI / 2;
        scope.position.set(0, 1.68, 0.6);
        turret.add(scope);

        muzzlePoint.position.set(0, 1.55, 1.85);

    } else if (typeId === 'mortar') {
        for (let i = 0; i < 3; i++) {
            const ang = (i / 3) * Math.PI * 2;
            const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.11, 0.9, 5), darkStoneMat);
            leg.position.set(Math.cos(ang) * 0.42, 0.45, Math.sin(ang) * 0.42);
            leg.rotation.z = -Math.cos(ang) * 0.3;
            leg.rotation.x = Math.sin(ang) * 0.3;
            leg.castShadow = true;
            turret.add(leg);
        }

        const cauldronGroup = new THREE.Group();
        cauldronGroup.position.y = 0.9;

        const cauldron = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.38, 0.6, 10), stoneMat);
        cauldron.castShadow = true;
        cauldronGroup.add(cauldron);

        const hoop = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.05, 6, 14), darkStoneMat);
        hoop.rotation.x = Math.PI / 2;
        hoop.position.y = 0.28;
        cauldronGroup.add(hoop);

        const muzzle = new THREE.Mesh(
            new THREE.CylinderGeometry(0.66, 0.48, 0.35, 10, 1, true),
            darkStoneMat
        );
        muzzle.position.y = 0.5;
        cauldronGroup.add(muzzle);

        const glow = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), brightAccentMat);
        glow.position.y = 0.42;
        cauldronGroup.add(glow);

        for (let i = 0; i < 6; i++) {
            const ang = (i / 6) * Math.PI * 2;
            const tooth = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.16, 4), darkStoneMat);
            tooth.position.set(Math.cos(ang) * 0.66, 0.72, Math.sin(ang) * 0.66);
            cauldronGroup.add(tooth);
        }

        cauldronGroup.rotation.x = 0.35;
        turret.add(cauldronGroup);

        muzzlePoint.position.set(0, 1.5, 0.35);

    } else if (typeId === 'slow') {
        const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.5, 0.9, 6), stoneMat);
        pedestal.position.y = 0.45; pedestal.castShadow = true; turret.add(pedestal);

        for (let i = 0; i < 4; i++) {
            const ang = (i / 4) * Math.PI * 2 + Math.PI / 4;
            const spike = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.35, 4), darkStoneMat);
            spike.position.set(Math.cos(ang) * 0.42, 0.95, Math.sin(ang) * 0.42);
            spike.rotation.z = -Math.cos(ang) * 0.4;
            spike.rotation.x = Math.sin(ang) * 0.4;
            turret.add(spike);
        }

        const crystalMat = new THREE.MeshStandardMaterial({
            color: palette.accent, emissive: palette.accent, emissiveIntensity: 0.6,
            roughness: 0.2, metalness: 0.4,
            transparent: true, opacity: 0.85
        });
        const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.36, 0), crystalMat);
        crystal.position.y = 1.2; crystal.castShadow = true; turret.add(crystal);

        muzzlePoint.position.set(0, 1.2, 0);

    } else if (typeId === 'skyguard') {
        const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, 0.9, 8), stoneMat);
        tower.position.y = 0.45; tower.castShadow = true; turret.add(tower);

        const rim = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.06, 6, 16), darkStoneMat);
        rim.rotation.x = Math.PI / 2;
        rim.position.y = 0.9;
        turret.add(rim);

        for (let i = 0; i < 4; i++) {
            const ang = (i / 4) * Math.PI * 2;
            const petal = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.32, 4), darkStoneMat);
            petal.position.set(Math.cos(ang) * 0.38, 1.0, Math.sin(ang) * 0.38);
            petal.rotation.x = -Math.PI / 2;
            petal.rotation.z = ang;
            turret.add(petal);
        }

        const crystalMat = new THREE.MeshStandardMaterial({
            color: palette.accent, emissive: palette.accent, emissiveIntensity: 0.8,
            roughness: 0.25, metalness: 0.6,
            transparent: true, opacity: 0.9
        });
        const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.3, 0), crystalMat);
        crystal.position.y = 1.25; crystal.castShadow = true; turret.add(crystal);
        group.userData.crystal = crystal;

        muzzlePoint.position.set(0, 1.25, 0.3);

    } else if (typeId === 'amp') {
        const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.55, 0.7, 8), stoneMat);
        pedestal.position.y = 0.35; pedestal.castShadow = true; turret.add(pedestal);

        const rim = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.05, 6, 20), darkStoneMat);
        rim.rotation.x = Math.PI / 2; rim.position.y = 0.7; turret.add(rim);

        const crystalMat = new THREE.MeshStandardMaterial({
            color: palette.accent, emissive: palette.accent, emissiveIntensity: 0.8,
            roughness: 0.2, metalness: 0.5, transparent: true, opacity: 0.9
        });
        const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.42, 0), crystalMat);
        crystal.position.y = 1.25; crystal.castShadow = true; turret.add(crystal);
        group.userData.crystal = crystal;

        const ringCount = level >= 3 ? 3 : level >= 2 ? 2 : 1;
        for (let i = 0; i < ringCount; i++) {
            const ring = new THREE.Mesh(
                new THREE.TorusGeometry(0.6 + i * 0.08, 0.03, 4, 16),
                new THREE.MeshStandardMaterial({
                    color: palette.accent, emissive: palette.accent,
                    emissiveIntensity: 0.5, transparent: true, opacity: 0.5
                })
            );
            ring.rotation.x = Math.PI / 2;
            ring.position.y = 1.25 + (i - (ringCount - 1) / 2) * 0.25;
            turret.add(ring);
        }

        for (let i = 0; i < 4; i++) {
            const ang = (i / 4) * Math.PI * 2;
            const orb = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 4), crystalMat);
            orb.position.set(Math.cos(ang) * 0.75, 1.0, Math.sin(ang) * 0.75);
            turret.add(orb);
        }

        muzzlePoint.position.set(0, 1.25, 0);
    }

    group.add(turret);
    group.userData.turret = turret;

    const levelRingMat = new THREE.MeshStandardMaterial({
        color: palette.rim, roughness: 0.6, metalness: 0.5,
        emissive: palette.accent, emissiveIntensity: level >= 2 ? 0.15 : 0.05
    });

    const r1 = new THREE.Mesh(new THREE.TorusGeometry(0.64, 0.05, 6, 24), levelRingMat);
    r1.rotation.x = Math.PI / 2;
    r1.position.y = 0.44;
    group.add(r1);

    if (level >= 2) {
        const r2 = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.045, 6, 20), levelRingMat);
        r2.rotation.x = Math.PI / 2;
        r2.position.y = 0.88;
        r2.scale.setScalar(0.85);
        group.add(r2);
    }

    if (level === 3) {
        const topSpike = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.4, 4), darkStoneMat);
        topSpike.position.set(0, 1.7, -0.15);
        group.add(topSpike);
    }

    group.scale.setScalar(2.0);
    return group;
}

let _iconRenderer = null;
const _iconCache = {};

function generateTowerIcon(typeId, level = 1) {
    const key = typeId + '_' + level;
    if (_iconCache[key]) return _iconCache[key];
    if (!_iconRenderer) {
        _iconRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
        _iconRenderer.setSize(128, 128);
        _iconRenderer.setClearColor(0x000000, 0);
        _iconRenderer.toneMapping = THREE.ACESFilmicToneMapping;
        _iconRenderer.toneMappingExposure = 1.2;
        _iconRenderer.outputEncoding = THREE.sRGBEncoding;
    }
    const scn = new THREE.Scene();
    scn.add(new THREE.HemisphereLight(0xffffff, 0x303040, 1.2));
    const dir = new THREE.DirectionalLight(0xffffff, 1.0);
    dir.position.set(3, 5, 3);
    scn.add(dir);

    const palette = TOWER_PALETTE[typeId] || TOWER_PALETTE.gun;
    const rim = new THREE.PointLight(palette.accent, 0.8, 10);
    rim.position.set(-2, 1.5, -2);
    scn.add(rim);

    const tower = buildTowerModel(typeId, level);
    tower.rotation.y = -Math.PI / 6;
    tower.rotation.x = 0.18;
    scn.add(tower);

    const cam = new THREE.PerspectiveCamera(35, 1, 0.1, 30);
    cam.position.set(4, 4.2, 5.8);
    cam.lookAt(0, 1.1, 0);
    _iconRenderer.render(scn, cam);
    const url = _iconRenderer.domElement.toDataURL('image/png');
    _iconCache[key] = url;

    scn.traverse(o => {
        if (o.isMesh) {
            o.geometry && o.geometry.dispose();
            if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => m.dispose());
        }
    });
    return url;
}