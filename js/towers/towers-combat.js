const tracers = [];
const explosions = [];
const coinParticles = [];
const karmaPillars = [];
const mortarProjectiles = [];
let rangeCircleMesh = null;
let hoveredTower = null;

// ═══════════════════════════════════════════
// ПУЛИ С РЕАЛЬНЫМ ПОЛЁТОМ
// ═══════════════════════════════════════════
const bullets = [];
let _bulletIdCounter = 0;

function _bulletGlowSprite(color, size) {
    if (typeof _glowSprite === 'function') return _glowSprite(color, size);
    if (typeof _iceGlowSprite === 'function') return _iceGlowSprite(color, size);
    return null;
}

function spawnBullet(opts) {
    const {
        start, target, damage,
        color = 0xffdd44,
        size = 0.07,
        length = 0.4,
        speed = 100,
        isCrit = false,
        towerType = 'gun'
    } = opts;

    const geo = new THREE.CylinderGeometry(size * 0.7, size, length, 6);
    geo.rotateX(Math.PI / 2);

    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 1 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(start);
    scene.add(mesh);

    const glow = _bulletGlowSprite(color, size * 7);
    if (glow) {
        glow.material.opacity = 0.85;
        mesh.add(glow);
    }

    const targetY = target.baseY || 0;
    const dir = new THREE.Vector3().subVectors(
        target.pos.clone().setY(targetY), start
    );
    if (dir.lengthSq() > 1e-6) {
        dir.normalize();
        mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);
    }

    bullets.push({
        id: ++_bulletIdCounter,
        mesh,
        pos: start.clone(),
        target,
        damage,
        isCrit,
        towerType,
        speed,
        color,
        ttl: 5.0,
        lastEndPos: null
    });
}

function _bulletImpact(b) {
    const e = b.target;
    if (!e || !e.alive) return;

    e.hp -= b.damage;
    updateHpBar(e);
    if (e.hp <= 0) killEnemy(e, true);

    spawnExplosion(b.pos.clone(), b.color, b.isCrit ? 0.9 : 0.5);
    if (b.isCrit) spawnExplosion(b.pos.clone(), 0xffffff, 0.4);
}

function _disposeBullet(b) {
    if (!b.mesh) return;
    scene.remove(b.mesh);
    b.mesh.traverse(o => {
        if (o.isMesh) {
            o.geometry && o.geometry.dispose();
            if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => m.dispose());
        } else if (o.isSprite) {
            o.material && o.material.dispose();
        }
    });
    b.mesh = null;
}

function updateBullets(dt) {
    for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.ttl -= dt;

        let endPos;
        if (b.target && b.target.alive) {
            endPos = b.target.pos.clone().setY(b.target.baseY);
            b.lastEndPos = endPos.clone();
        } else if (b.lastEndPos) {
            endPos = b.lastEndPos;
        } else {
            _disposeBullet(b);
            bullets.splice(i, 1);
            continue;
        }

        const dir = new THREE.Vector3().subVectors(endPos, b.pos);
        const dist = dir.length();
        const step = b.speed * dt;

        if (dist <= step || dist < 0.05) {
            b.pos.copy(endPos);
            b.mesh.position.copy(b.pos);
            _bulletImpact(b);
            _disposeBullet(b);
            bullets.splice(i, 1);
            continue;
        }

        dir.normalize();
        b.pos.addScaledVector(dir, step);
        b.mesh.position.copy(b.pos);
        b.mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);

        if (b.ttl <= 0) {
            _disposeBullet(b);
            bullets.splice(i, 1);
        }
    }
}

// ═══════════════════════════════════════════
// КРУГИ РАДИУСА
// ═══════════════════════════════════════════
function drawRangeCircleAt(pos, range, color = 0xff5522, opacity = 0.28) {
    hideRangeCircle();
    if (!range || range <= 0) return;
    const geo = new THREE.RingGeometry(range - 0.06, range, 72);
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity, side: THREE.DoubleSide, depthWrite: false });
    rangeCircleMesh = new THREE.Mesh(geo, mat);
    rangeCircleMesh.rotation.x = -Math.PI / 2;
    rangeCircleMesh.position.copy(pos);
    rangeCircleMesh.position.y = 0.1;
    scene.add(rangeCircleMesh);
}

function hideRangeCircle() {
    if (!rangeCircleMesh) return;
    scene.remove(rangeCircleMesh);
    rangeCircleMesh.geometry.dispose();
    rangeCircleMesh.material.dispose();
    rangeCircleMesh = null;
}

function updateRangeCircle() {
    if (buildingType) return;
    if (selectedTower) {
        drawRangeCircleAt(selectedTower.position, selectedTower.range, 0x4488ff, 0.28);
    } else if (hoveredTower) {
        drawRangeCircleAt(hoveredTower.position, hoveredTower.range, 0x4488ff, 0.16);
    } else {
        hideRangeCircle();
    }
}

function showRangeCircle(tower) {
    if (!tower) { hideRangeCircle(); return; }
    drawRangeCircleAt(tower.position, tower.range, 0x4488ff, 0.28);
}

function _dist2D(a, b) {
    const dx = a.x - b.x, dz = a.z - b.z;
    return Math.sqrt(dx*dx + dz*dz);
}

// ─── sqrt-free вариант для горячих циклов ───
function _dist2DSq(a, b) {
    const dx = a.x - b.x, dz = a.z - b.z;
    return dx * dx + dz * dz;
}

function updateTurretRotation(tw, target, dt) {
    if (!tw.mesh || !tw.mesh.userData || !tw.mesh.userData.turret) return;
    const turret = tw.mesh.userData.turret;
    const dx = target.pos.x - tw.position.x;
    const dz = target.pos.z - tw.position.z;
    const targetAngle = Math.atan2(dx, dz);
    let diff = targetAngle - turret.rotation.y;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    const maxRotate = 12 * dt;
    if (Math.abs(diff) <= maxRotate) turret.rotation.y = targetAngle;
    else turret.rotation.y += Math.sign(diff) * maxRotate;
}

function findTarget(tw) {
    let best = null, bestScore = -Infinity;
    const canAir = TOWERS_DATA[tw.type].canHitAir;
    const prio = TOWERS_DATA[tw.type].priority || 'progress';
    const rangeSq = tw.rangeSq;
    const minRange = (tw.type === 'mortar') ? (tw.stats.minRange || 0) : 0;
    const minRangeSq = minRange * minRange;

    for (const e of enemies) {
        if (!e.alive) continue;
        if (e.flying && !canAir) continue;
        if (prio === 'air' && !e.flying) continue;
        const dSq = _dist2DSq(e.pos, tw.position);
        if (dSq > rangeSq) continue;
        if (minRange > 0 && dSq < minRangeSq) continue;

        const score = (e.pathIndex + e.progress) * 1000000 + e.hp;
        if (score > bestScore) { bestScore = score; best = e; }
    }
    return best;
}

function _applyArmor(dmg, e, pierce) {
    const armor = e.armor || 0;
    const eff = Math.max(0, armor * (1 - (pierce || 0)));
    return dmg * (1 - eff);
}

function drawBeam(from, to, color, thickness = 0.1, duration = 0.15) {
    const distance = from.distanceTo(to);
    if (distance < 0.1) return;
    const geo = new THREE.CylinderGeometry(thickness, thickness, distance, 5);
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.85, depthWrite: false });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(from).lerp(to, 0.5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3().subVectors(to, from).normalize());
    scene.add(mesh);
    tracers.push({ obj: mesh, ttl: duration, maxTtl: duration });
}

function drawLightning(start, end, color, duration = 0.15) {
    const points = [start];
    const dist = start.distanceTo(end);
    const segments = 6;
    for (let i = 1; i < segments; i++) {
        const t = i / segments;
        const p = start.clone().lerp(end, t);
        p.x += (Math.random() - 0.5) * dist * 0.15;
        p.y += (Math.random() - 0.5) * dist * 0.15;
        p.z += (Math.random() - 0.5) * dist * 0.15;
        points.push(p);
    }
    points.push(end);
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.85 });
    const line = new THREE.Line(geo, mat);
    scene.add(line);
    tracers.push({ obj: line, ttl: duration, maxTtl: duration });
}

function spawnMuzzleFlash(pos, color) {
    const geo = new THREE.SphereGeometry(0.3, 8, 8);
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9, depthWrite: false });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(pos);
    scene.add(mesh);
    explosions.push({ obj: mesh, ttl: 0.08, maxTtl: 0.08, growSpeed: 8 });
}

function spawnExplosion(pos, color, scale = 1) {
    const geo = new THREE.SphereGeometry(0.5 * scale, 8, 8);
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.8 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(pos);
    scene.add(mesh);
    explosions.push({ obj: mesh, ttl: 0.4, maxTtl: 0.4, growSpeed: 4 * scale });
}

function spawnKarmaPillar(pos) {
    const geo = new THREE.CylinderGeometry(0.6, 1.0, 6, 12, 1, true);
    const mat = new THREE.MeshBasicMaterial({ color: 0xfff2b0, transparent: true, opacity: 0.65, side: THREE.DoubleSide, depthWrite: false });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(pos); mesh.position.y = 3;
    scene.add(mesh);
    karmaPillars.push({ obj: mesh, ttl: 0.35, maxTtl: 0.35 });
}

function spawnRing(pos, range, color) {
    const geo = new THREE.RingGeometry(0.9, 1.0, 32);
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.6, side: THREE.DoubleSide, depthWrite: false });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.copy(pos);
    mesh.position.y = 0.2;
    mesh.scale.set(0.01, 0.01, 1);
    scene.add(mesh);
    tracers.push({ obj: mesh, ttl: 0.6, maxTtl: 0.6, isRing: true, targetScale: range });
}

function spawnMortarProjectile(start, end, tw, targetPos) {
    const geo = new THREE.SphereGeometry(0.25, 8, 8);
    const mat = new THREE.MeshBasicMaterial({ color: 0xffaa22 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(start);
    scene.add(mesh);
    mortarProjectiles.push({
        mesh, start: start.clone(), end: end.clone(), targetPos: targetPos.clone(),
        progress: 0, speed: 1.2, tw
    });
}

function spawnDeathParticles(pos, color) { spawnExplosion(pos, color, 0.8); }

function spawnCoinBurst(origin, options = {}) {
    const count = options.count || (3 + Math.floor(Math.random() * 3));
    const ttlBase = options.ttl || 1.0;
    for (let i = 0; i < count; i++) {
        const geo = new THREE.CylinderGeometry(0.317, 0.317, 0.086, 12);
        const mat = new THREE.MeshStandardMaterial({ color: 0xffd166, emissive: 0xffd166, emissiveIntensity: 0.9, roughness: 0.3, metalness: 0.9, transparent: true, opacity: 1 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.rotation.x = Math.PI / 2;
        mesh.position.copy(origin); mesh.position.y += 0.2;
        scene.add(mesh);
        const ang = Math.random() * Math.PI * 2;
        const sp = 1.8 + Math.random() * 2.5;
        coinParticles.push({ mesh, vx: Math.cos(ang)*sp, vz: Math.sin(ang)*sp, vy: 3.5 + Math.random() * 2.5, ttl: ttlBase, maxTtl: ttlBase, landed: false });
    }
}

function updateCoinParticles(dt) {
    for (let i = coinParticles.length - 1; i >= 0; i--) {
        const c = coinParticles[i];
        c.ttl -= dt;
        if (!c.landed) {
            c.mesh.position.x += c.vx * dt; c.mesh.position.z += c.vz * dt;
            c.mesh.position.y += c.vy * dt; c.vy -= 12 * dt;
            c.mesh.rotation.z += dt * 6;
            if (c.mesh.position.y <= 0.18 && c.vy < 0) {
                c.mesh.position.y = 0.18; c.landed = true; c.mesh.rotation.x = 0; c.mesh.rotation.z = 0;
            }
        }
        if (c.ttl < 0.35) c.mesh.material.opacity = Math.max(0, c.ttl / 0.35);
        if (c.ttl <= 0) { scene.remove(c.mesh); c.mesh.geometry.dispose(); c.mesh.material.dispose(); coinParticles.splice(i, 1); }
    }
}

function updateMortarProjectiles(dt) {
    for (let i = mortarProjectiles.length - 1; i >= 0; i--) {
        const p = mortarProjectiles[i];
        p.progress += dt * p.speed;
        if (p.progress >= 1) {
            spawnExplosion(p.end, 0xffaa22, 1.4);
            const dmg = p.tw.damage * (1 + (p.tw.activeBuff || 0));
            const aoe = p.tw.stats.aoe || 4.5;
            const aoeSq = aoe * aoe;
            for (const e of enemies) {
                if (!e.alive || e.flying) continue;
                if (_dist2DSq(e.pos, p.targetPos) <= aoeSq) {
                    e.hp -= _applyArmor(dmg, e, p.tw.stats.armorPierce || 0);
                    updateHpBar(e);
                    if (e.hp <= 0) killEnemy(e, true);
                }
            }
            scene.remove(p.mesh); p.mesh.geometry.dispose(); p.mesh.material.dispose();
            mortarProjectiles.splice(i, 1);
        } else {
            const t = p.progress;
            const x = p.start.x + (p.end.x - p.start.x) * t;
            const z = p.start.z + (p.end.z - p.start.z) * t;
            const y = p.start.y + (p.end.y - p.start.y) * t + Math.sin(t * Math.PI) * 4.0;
            p.mesh.position.set(x, y, z);
            p.mesh.rotation.x += dt * 10; p.mesh.rotation.z += dt * 10;
        }
    }
}

function updateEffects(dt) {
    for (let i = tracers.length - 1; i >= 0; i--) {
        const t = tracers[i]; t.ttl -= dt;
        t.obj.material.opacity = Math.max(0, t.ttl / t.maxTtl) * 0.85;
        if (t.isRing) {
            const progress = 1.0 - (t.ttl / t.maxTtl);
            const currentScale = (t.targetScale || 1) * Math.min(1.0, progress * 1.5);
            t.obj.scale.set(currentScale, currentScale, 1);
        }
        if (t.ttl <= 0) { scene.remove(t.obj); t.obj.geometry.dispose(); t.obj.material.dispose(); tracers.splice(i, 1); }
    }
    for (let i = explosions.length - 1; i >= 0; i--) {
        const e = explosions[i]; e.ttl -= dt;
        e.obj.material.opacity = Math.max(0, e.ttl / e.maxTtl) * 0.8;
        e.obj.scale.addScalar(e.growSpeed * dt);
        if (e.ttl <= 0) { scene.remove(e.obj); e.obj.geometry.dispose(); e.obj.material.dispose(); explosions.splice(i, 1); }
    }
    for (let i = karmaPillars.length - 1; i >= 0; i--) {
        const k = karmaPillars[i]; k.ttl -= dt;
        k.obj.material.opacity = Math.max(0, k.ttl / k.maxTtl) * 0.65;
        if (k.ttl <= 0) { scene.remove(k.obj); k.obj.geometry.dispose(); k.obj.material.dispose(); karmaPillars.splice(i, 1); }
    }
    updateBullets(dt);
    updateCoinParticles(dt);
    updateMortarProjectiles(dt);
}

function updateTowersCombat(dt) {
    const t = GameState.gameTime;

    // ─── ПЕРЕСЧЁТ БАФФОВ ОТ УСИЛИТЕЛЕЙ ───
    // Только когда состав/уровень башен изменился (флаг выставляют build/upgrade/sell).
    // Было: O(T²) каждый кадр. Стало: 0 в стабильном бою.
    if (_towersBuffsDirty) {
        for (const tw of buildTowers) {
            if (tw.type === 'amp') { tw.activeBuff = 0; continue; }
            let total = 0;
            for (const other of buildTowers) {
                if (other.type !== 'amp') continue;
                if (_dist2DSq(tw.position, other.position) <= other.rangeSq) {
                    total += (other.stats.buffPercent || 0) / 100;
                }
            }
            tw.activeBuff = total;
        }
        _towersBuffsDirty = false;
    }

    for (const tw of buildTowers) {
        if (tw.type === 'slow') {
            let hasEnemyInRange = false;
            for (const e of enemies) {
                if (!e.alive || e.flying || e.slowImmune) continue;
                if (_dist2DSq(e.pos, tw.position) <= tw.rangeSq) {
                    e.slowFactor = Math.max(e.slowFactor, (tw.stats.slowPercent || 40) / 100);
                    e.slowUntil = t + 0.3;
                    hasEnemyInRange = true;
                }
            }
            if (hasEnemyInRange && t >= (tw._nextPulse || 0)) {
                spawnRing(tw.position, tw.range, 0x00c8ff);
                tw._nextPulse = t + 2.5;
            }
            tw.cooldownUntil = t + 0.2;
            continue;
        }

        if (tw.type === 'amp') {
            if (tw.mesh.userData.crystal) {
                tw.mesh.userData.crystal.rotation.y += dt * 1.5;
                tw.mesh.userData.crystal.position.y = 1.25 + Math.sin(t * 2) * 0.05;
            }
            continue;
        }

        const target = findTarget(tw);
        if (target) {
            updateTurretRotation(tw, target, dt);
        }

        if (t < tw.cooldownUntil) continue;
        if (!target) continue;

        const start = new THREE.Vector3();
        if (tw.mesh.userData.muzzlePoint) {
            tw.mesh.userData.muzzlePoint.getWorldPosition(start);
        } else {
            start.copy(tw.position).setY(1.6);
        }

        const end = target.pos.clone().setY(target.baseY);

        const distToTarget = tw.position.distanceTo(target.pos);
        const muzzleDist = tw.position.distanceTo(start);
        if (distToTarget < muzzleDist) {
            start.copy(tw.position).setY(start.y);
        }

        const baseDmg = tw.damage * (1 + (tw.activeBuff || 0));
        playShoot();

        if (tw.type === 'gun') {
            const dmg = _applyArmor(baseDmg, target, 0);
            spawnMuzzleFlash(start, 0xff5522);
            spawnBullet({
                start,
                target,
                damage: dmg,
                color: 0xffbb33,
                size: 0.06,
                length: 0.35,
                speed: 90,
                towerType: 'gun'
            });

        } else if (tw.type === 'sniper') {
            const isCrit = Math.random() * 100 < (tw.stats.critChance || 0);
            let dmg = _applyArmor(baseDmg, target, 0);
            if (isCrit) dmg *= (tw.stats.critMul || 2);
            spawnMuzzleFlash(start, isCrit ? 0xffe070 : 0x44ddff);
            spawnBullet({
                start,
                target,
                damage: dmg,
                color: isCrit ? 0xffe070 : 0x44ddff,
                size: 0.09,
                length: 0.7,
                speed: 160,
                isCrit,
                towerType: 'sniper'
            });

        } else if (tw.type === 'mortar') {
            spawnMortarProjectile(start, end, tw, target.pos.clone());

        } else if (tw.type === 'skyguard') {
            let mul = target.flying ? (tw.stats.airMul || 2.0) : (tw.stats.groundMul || 0.5);
            const dmg = _applyArmor(baseDmg * mul, target, 0);
            target.hp -= dmg;
            drawLightning(start, end, 0xffe070, 0.15);
            spawnMuzzleFlash(start, 0xffe070);

            tw.shotCount = (tw.shotCount || 0) + 1;
            if (tw.shotCount >= (tw.stats.karma || 5)) {
                tw.shotCount = 0;
                for (const e of enemies) {
                    if (!e.alive || !e.flying) continue;
                    if (_dist2DSq(e.pos, tw.position) <= tw.rangeSq) {
                        e.hp -= (tw.stats.karmaDmg || 45) * (1 + (tw.activeBuff || 0));
                        spawnKarmaPillar(e.pos.clone().setY(0));
                    }
                }
            }

            updateHpBar(target);
            if (target.hp <= 0) killEnemy(target, true);
        }

        tw.cooldownUntil = t + 1 / (tw.fireRate || 1);
    }

    updateEffects(dt);
}