let decorGroup = null;
let ashSystem = null;
const _animatedDecor = { torches: [], wisps: [] };

function _decorGlowSprite(color, size) {
    let tex;
    if (typeof _getGlowTexture === 'function') {
        tex = _getGlowTexture(color);
    } else {
        const c = document.createElement('canvas');
        c.width = c.height = 64;
        const cx = c.getContext('2d');
        const r = (color >> 16) & 255, g = (color >> 8) & 255, b = color & 255;
        const grd = cx.createRadialGradient(32, 32, 0, 32, 32, 32);
        grd.addColorStop(0,    'rgba(255,255,255,1)');
        grd.addColorStop(0.25, `rgba(${r},${g},${b},1)`);
        grd.addColorStop(0.6,  `rgba(${r},${g},${b},0.35)`);
        grd.addColorStop(1,    'rgba(0,0,0,0)');
        cx.fillStyle = grd;
        cx.fillRect(0, 0, 64, 64);
        tex = new THREE.CanvasTexture(c);
    }
    const mat = new THREE.SpriteMaterial({
        map: tex, color: 0xffffff, blending: THREE.AdditiveBlending,
        transparent: true, depthWrite: false
    });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(size, size, 1);
    return sprite;
}

function createTorch(position) {
    const g = new THREE.Group();
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 2.2, 6),
        new THREE.MeshStandardMaterial({ color: 0x1a0a05, roughness: 0.9, metalness: 0.5 }));
    pole.position.y = 1.1; pole.castShadow = true; g.add(pole);

    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.14, 0.4, 8),
        new THREE.MeshStandardMaterial({ color: 0x2a1a0a, metalness: 0.8, roughness: 0.4 }));
    bowl.position.y = 2.2; g.add(bowl);

    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.55, 6),
        new THREE.MeshBasicMaterial({ color: 0xff7711 }));
    flame.position.y = 2.6; g.add(flame);

    const glow = _decorGlowSprite(0xff5511, 1.1);
    glow.position.copy(flame.position);
    glow.material.opacity = 0.6;
    g.add(glow);

    const light = new THREE.PointLight(0xff7733, 0.8, 6);
    light.position.y = 2.6; g.add(light);

    g.userData.flame = flame;
    g.userData.light = light;
    g.position.copy(position);
    return g;
}

function createSkull(position) {
    const g = new THREE.Group();
    const boneMat = new THREE.MeshStandardMaterial({ color: 0xb89078, roughness: 0.85 });
    const skull = new THREE.Mesh(new THREE.SphereGeometry(0.35, 10, 8), boneMat);
    skull.scale.set(1, 0.9, 1.1); skull.position.y = 0.3; skull.castShadow = true; g.add(skull);
    for (const sign of [-1, 1]) {
        const socket = new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 6),
            new THREE.MeshBasicMaterial({ color: 0x000000 }));
        socket.position.set(sign * 0.13, 0.33, 0.28); g.add(socket);
        const glow = _decorGlowSprite(0xcc2200, 0.22);
        glow.position.copy(socket.position);
        glow.material.opacity = 0.4;
        g.add(glow);
    }
    const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.12, 0.2), boneMat);
    jaw.position.set(0, 0.15, 0.15); g.add(jaw);
    g.position.copy(position);
    g.rotation.y = Math.random() * Math.PI * 2;
    return g;
}

function createBrokenPillar(position) {
    const g = new THREE.Group();
    const stoneMat = new THREE.MeshStandardMaterial({
        color: 0x1a0a08, roughness: 0.95, metalness: 0.2,
        emissive: 0x1a0303, emissiveIntensity: 0.08
    });
    const h = 1.5 + Math.random() * 2.5;
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.45, h, 6), stoneMat);
    pillar.position.y = h / 2; pillar.castShadow = true; pillar.receiveShadow = true; g.add(pillar);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.38, 0.3, 6), stoneMat);
    cap.position.y = h + 0.1; cap.rotation.z = (Math.random() - 0.5) * 0.4; g.add(cap);
    const fallen = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 1.2 + Math.random(), 6), stoneMat);
    fallen.position.set(1.0 + Math.random(), 0.3, Math.random() - 0.5);
    fallen.rotation.z = Math.PI / 2; fallen.rotation.y = Math.random() * Math.PI;
    fallen.castShadow = true; g.add(fallen);
    g.position.copy(position);
    return g;
}

function createDemonStatue(position) {
    const g = new THREE.Group();
    const stoneMat = new THREE.MeshStandardMaterial({
        color: 0x0a0608, roughness: 0.85, metalness: 0.35,
        emissive: 0x0a0008, emissiveIntensity: 0.1
    });
    const base = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.6, 1.6), stoneMat);
    base.position.y = 0.3; base.castShadow = true; base.receiveShadow = true; g.add(base);
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.9, 2.0, 0.7), stoneMat);
    body.position.y = 1.6; body.castShadow = true; g.add(body);
    const head = new THREE.Mesh(new THREE.IcosahedronGeometry(0.42, 0), stoneMat);
    head.position.y = 3.0; g.add(head);
    for (const sign of [-1, 1]) {
        const horn = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.7, 5), stoneMat);
        horn.position.set(sign * 0.32, 3.4, 0); horn.rotation.z = -sign * 0.4; g.add(horn);
        const arm = new THREE.Mesh(new THREE.BoxGeometry(0.22, 1.4, 0.22), stoneMat);
        arm.position.set(sign * 0.7, 1.8, 0); arm.rotation.z = -sign * 0.5; g.add(arm);
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 6),
            new THREE.MeshBasicMaterial({ color: 0xaa2222 }));
        eye.position.set(sign * 0.15, 3.05, 0.35); g.add(eye);
        const glow = _decorGlowSprite(0xaa2222, 0.35);
        glow.position.copy(eye.position);
        glow.material.opacity = 0.5;
        g.add(glow);
    }
    g.position.copy(position);
    g.rotation.y = Math.random() * Math.PI * 2;
    return g;
}

function createBonePile(position) {
    const g = new THREE.Group();
    const boneMat = new THREE.MeshStandardMaterial({ color: 0xb89078, roughness: 0.85 });
    for (let i = 0; i < 8; i++) {
        const bone = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.4 + Math.random() * 0.4, 5), boneMat);
        bone.position.set((Math.random() - 0.5), 0.08 + Math.random() * 0.2, (Math.random() - 0.5));
        bone.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        g.add(bone);
    }
    const skull = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6), boneMat);
    skull.scale.set(1, 0.9, 1.1); skull.position.set(0.2, 0.25, 0.1); g.add(skull);
    g.position.copy(position);
    return g;
}

function createFloatingWisp(position) {
    const g = new THREE.Group();
    const color = Math.random() < 0.5 ? 0xff3311 : 0xcc2200;
    const wisp = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6),
        new THREE.MeshBasicMaterial({ color }));
    wisp.position.y = 1.0 + Math.random() * 2.0; g.add(wisp);
    const glow = _decorGlowSprite(color, 0.7);
    glow.position.copy(wisp.position);
    glow.material.opacity = 0.5;
    g.add(glow);
    g.userData.baseY = wisp.position.y;
    g.userData.phase = Math.random() * Math.PI * 2;
    g.userData.mesh = wisp;
    g.userData.glow = glow;
    g.userData.speed = 0.8 + Math.random() * 0.8;
    g.position.copy(position);
    return g;
}

function createDecor(waypoints, towerSpots) {
    if (decorGroup) scene.remove(decorGroup);
    if (ashSystem) { scene.remove(ashSystem.points); ashSystem = null; }
    decorGroup = new THREE.Group();
    _animatedDecor.torches.length = 0;
    _animatedDecor.wisps.length = 0;

    const isHell = currentMap && currentMap.id === 'hell';
    const rand = _mulberry32(20241024);
    const ROAD_EDGE = 1.75 + 0.9;
    const minDistToSpot = 2.2;
    const minDistToHouse = 8.0;
    const house1 = waypoints[0], house2 = waypoints[waypoints.length - 1];

    function canPlace(p, extraRadius) {
        if (Math.abs(p.x) > 53 || Math.abs(p.z) > 23) return false;
        if (distToPath(p, waypoints) < ROAD_EDGE + extraRadius) return false;
        for (const s of towerSpots) if (p.distanceTo(s) < minDistToSpot + extraRadius) return false;
        if (p.distanceTo(house1) < minDistToHouse + extraRadius) return false;
        if (p.distanceTo(house2) < minDistToHouse + extraRadius) return false;
        return true;
    }

    if (isHell) {
        // ── ОБСИДИАНОВЫЕ ШИПЫ ──
        for (let i = 0; i < 50; i++) {
            for (let a = 0; a < 20; a++) {
                const p = new THREE.Vector3((rand() - 0.5) * 104, 0, (rand() - 0.5) * 46);
                if (!canPlace(p, 1.0)) continue;
                const h = 0.8 + rand() * 2.2, r = 0.3 + rand() * 0.4;
                const spire = new THREE.Mesh(new THREE.ConeGeometry(r, h, 4 + Math.floor(rand() * 3)),
                    new THREE.MeshStandardMaterial({ color: 0x0a0508, roughness: 0.65, metalness: 0.6, emissive: 0x100303, emissiveIntensity: 0.15 }));
                spire.position.set(p.x, h / 2, p.z);
                spire.rotation.y = rand() * Math.PI; spire.rotation.z = (rand() - 0.5) * 0.2;
                spire.castShadow = true; decorGroup.add(spire);
                break;
            }
        }
        // ── ВУЛКАНИЧЕСКИЕ КАМНИ ──
        for (let i = 0; i < 40; i++) {
            for (let a = 0; a < 15; a++) {
                const p = new THREE.Vector3((rand() - 0.5) * 104, 0, (rand() - 0.5) * 46);
                if (!canPlace(p, 0.8)) continue;
                const r = 0.4 + rand() * 0.8;
                const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(r, 0),
                    new THREE.MeshStandardMaterial({ color: 0x0a0606, roughness: 0.92, metalness: 0.4 }));
                rock.position.set(p.x, r * 0.55, p.z);
                rock.rotation.set(rand() * Math.PI, rand() * Math.PI, rand() * Math.PI);
                rock.scale.set(1, 0.6 + rand() * 0.3, 1); rock.castShadow = true;
                decorGroup.add(rock); break;
            }
        }
        // ── МЁРТВЫЕ ДЕРЕВЬЯ ──
        for (let i = 0; i < 25; i++) {
            for (let a = 0; a < 20; a++) {
                const p = new THREE.Vector3((rand() - 0.5) * 104, 0, (rand() - 0.5) * 46);
                if (!canPlace(p, 1.5)) continue;
                const treeGroup = new THREE.Group();
                const trunkH = 1.5 + rand() * 2.0;
                const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.22, trunkH, 6),
                    new THREE.MeshStandardMaterial({ color: 0x0a0505, roughness: 0.95, metalness: 0.15 }));
                trunk.position.y = trunkH / 2; trunk.castShadow = true; treeGroup.add(trunk);
                const branches = 2 + Math.floor(rand() * 3);
                for (let b = 0; b < branches; b++) {
                    const ang = (b / branches) * Math.PI * 2 + rand() * 0.5;
                    const bl = 0.7 + rand() * 0.8;
                    const br = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.06, bl, 4),
                        new THREE.MeshStandardMaterial({ color: 0x080404, roughness: 0.95 }));
                    br.position.set(Math.cos(ang) * 0.3, trunkH * 0.85, Math.sin(ang) * 0.3);
                    br.rotation.z = Math.cos(ang) * 0.7; br.rotation.x = -Math.sin(ang) * 0.7;
                    treeGroup.add(br);
                }
                treeGroup.position.set(p.x, 0, p.z); decorGroup.add(treeGroup); break;
            }
        }
        // ── БОЛЬШИЕ СКАЛЫ ──
        for (let i = 0; i < 20; i++) {
            for (let a = 0; a < 20; a++) {
                const p = new THREE.Vector3((rand() - 0.5) * 104, 0, (rand() - 0.5) * 46);
                if (!canPlace(p, 5.0)) continue;
                const r = 2.5 + rand() * 3, h = 2.0 + rand() * 3;
                const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(r, 0),
                    new THREE.MeshStandardMaterial({ color: 0x080404, roughness: 0.9, metalness: 0.35, emissive: 0x100202, emissiveIntensity: 0.1 }));
                rock.position.set(p.x, h * 0.4, p.z);
                rock.scale.set(1, h / r, 1); rock.castShadow = true;
                decorGroup.add(rock); break;
            }
        }
        // ── ФАКЕЛЫ ──
        for (let i = 0; i < 8; i++) {
            for (let a = 0; a < 25; a++) {
                const p = new THREE.Vector3((rand() - 0.5) * 100, 0, (rand() - 0.5) * 42);
                if (!canPlace(p, 1.5)) continue;
                const torch = createTorch(p);
                decorGroup.add(torch); _animatedDecor.torches.push(torch); break;
            }
        }
        // ── ЧЕРЕПА ──
        for (let i = 0; i < 25; i++) {
            for (let a = 0; a < 15; a++) {
                const p = new THREE.Vector3((rand() - 0.5) * 104, 0, (rand() - 0.5) * 46);
                if (!canPlace(p, 0.5)) continue;
                decorGroup.add(createSkull(p)); break;
            }
        }
        // ── КОСТИ ──
        for (let i = 0; i < 20; i++) {
            for (let a = 0; a < 15; a++) {
                const p = new THREE.Vector3((rand() - 0.5) * 104, 0, (rand() - 0.5) * 46);
                if (!canPlace(p, 1.0)) continue;
                decorGroup.add(createBonePile(p)); break;
            }
        }
        // ── СЛОМАННЫЕ КОЛОННЫ ──
        for (let i = 0; i < 14; i++) {
            for (let a = 0; a < 20; a++) {
                const p = new THREE.Vector3((rand() - 0.5) * 102, 0, (rand() - 0.5) * 44);
                if (!canPlace(p, 2.0)) continue;
                decorGroup.add(createBrokenPillar(p)); break;
            }
        }
        // ── СТАТУИ ──
        for (let i = 0; i < 4; i++) {
            for (let a = 0; a < 25; a++) {
                const p = new THREE.Vector3((rand() - 0.5) * 102, 0, (rand() - 0.5) * 44);
                if (!canPlace(p, 3.5)) continue;
                decorGroup.add(createDemonStatue(p)); break;
            }
        }
        // ── ПАРЯЩИЕ ОГОНЬКИ ──
        for (let i = 0; i < 12; i++) {
            for (let a = 0; a < 15; a++) {
                const p = new THREE.Vector3((rand() - 0.5) * 104, 0, (rand() - 0.5) * 46);
                if (!canPlace(p, 0.5)) continue;
                const wisp = createFloatingWisp(p);
                decorGroup.add(wisp); _animatedDecor.wisps.push(wisp); break;
            }
        }
        createAshParticles();
    } else {
        // ── НЕ-HELL карта ──
        for (let i = 0; i < 5; i++) {
            for (let a = 0; a < 30; a++) {
                const p = new THREE.Vector3((rand() - 0.5) * 102, 0, (rand() - 0.5) * 44);
                if (!canPlace(p, 4.0)) continue;
                const rx = 3 + rand() * 4, rz = 2 + rand() * 3, rot = rand() * Math.PI;
                const bank = new THREE.Mesh(new THREE.RingGeometry(0.92, 1.15, 32),
                    new THREE.MeshStandardMaterial({ color: 0x1a2015, roughness: 0.95 }));
                bank.rotation.x = -Math.PI / 2; bank.rotation.z = rot;
                bank.scale.set(rx, rz, 1); bank.position.set(p.x, 0.10, p.z); decorGroup.add(bank);
                const water = new THREE.Mesh(new THREE.CircleGeometry(1, 32),
                    new THREE.MeshStandardMaterial({ color: 0x1a3a5c, roughness: 0.12, metalness: 0.8, transparent: true, opacity: 0.85, emissive: 0x0a1a2a, emissiveIntensity: 0.2 }));
                water.rotation.x = -Math.PI / 2; water.rotation.z = rot;
                water.scale.set(rx, rz, 1); water.position.set(p.x, 0.11, p.z); decorGroup.add(water);
                break;
            }
        }
        for (let i = 0; i < 90; i++) {
            for (let a = 0; a < 25; a++) {
                const p = new THREE.Vector3((rand() - 0.5) * 104, 0, (rand() - 0.5) * 46);
                if (!canPlace(p, 1.5)) continue;
                const treeGroup = new THREE.Group();
                const trunkH = 1.3 + rand() * 1.6;
                const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.22, trunkH, 6),
                    new THREE.MeshStandardMaterial({ color: 0x3a2418, roughness: 0.9 }));
                trunk.position.y = trunkH / 2; trunk.castShadow = true; treeGroup.add(trunk);
                const layers = 2 + Math.floor(rand() * 2);
                for (let k = 0; k < layers; k++) {
                    const coneR = 1.0 + rand() * 0.5 - k * 0.28;
                    const coneH = 1.1 + rand() * 0.7;
                    const cone = new THREE.Mesh(new THREE.ConeGeometry(coneR, coneH, 7),
                        new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(0.33 + rand() * 0.06, 0.5, 0.14 + rand() * 0.08), roughness: 0.85 }));
                    cone.position.y = trunkH + k * 0.7 + coneH / 2 - 0.3;
                    cone.castShadow = true; treeGroup.add(cone);
                }
                treeGroup.position.set(p.x, 0, p.z); decorGroup.add(treeGroup); break;
            }
        }
    }
    scene.add(decorGroup);
    return decorGroup;
}

function createAshParticles() {
    // Оригинальное количество и параметры
    const count = 600;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        pos[i * 3]     = (Math.random() - 0.5) * 120;
        pos[i * 3 + 1] = Math.random() * 25;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 60;
        vel[i * 3]     = (Math.random() - 0.5) * 0.4;
        vel[i * 3 + 1] = -0.4 - Math.random() * 0.8;
        vel[i * 3 + 2] = (Math.random() - 0.5) * 0.4;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
        color: 0xcc7744, size: 0.1, transparent: true, opacity: 0.5,
        depthWrite: false, blending: THREE.AdditiveBlending
    });
    const points = new THREE.Points(geo, mat);
    scene.add(points);
    ashSystem = { points, vel };
}

function updateDecor(dt) {
    const elapsed = (typeof GameState !== 'undefined') ? GameState.gameTime : 0;

    if (ashSystem) {
        const positions = ashSystem.points.geometry.attributes.position.array;
        const vel = ashSystem.vel;
        for (let i = 0; i < positions.length; i += 3) {
            positions[i]     += vel[i]     * dt;
            positions[i + 1] += vel[i + 1] * dt;
            positions[i + 2] += vel[i + 2] * dt;
            if (positions[i + 1] < 0) {
                positions[i + 1] = 25;
                positions[i]     = (Math.random() - 0.5) * 120;
                positions[i + 2] = (Math.random() - 0.5) * 60;
            }
        }
        ashSystem.points.geometry.attributes.position.needsUpdate = true;
    }

    for (const torch of _animatedDecor.torches) {
        if (!torch.userData.flame) continue;
        const flicker = 0.92 + Math.random() * 0.12;
        torch.userData.flame.scale.set(flicker, 0.95 + Math.random() * 0.1, flicker);
        if (torch.userData.light) torch.userData.light.intensity = 0.7 + Math.random() * 0.25;
    }

    for (const wisp of _animatedDecor.wisps) {
        const t = elapsed * wisp.userData.speed + wisp.userData.phase;
        const m = wisp.userData.mesh;
        m.position.y = wisp.userData.baseY + Math.sin(t) * 0.4;
        m.position.x = Math.cos(t * 0.7) * 0.5;
        if (wisp.userData.glow) {
            wisp.userData.glow.position.copy(m.position);
            wisp.userData.glow.material.opacity = 0.4 + Math.sin(t * 3) * 0.2;
        }
    }
}