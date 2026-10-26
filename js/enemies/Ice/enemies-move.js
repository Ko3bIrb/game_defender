const enemies = [];
const lavaPools = [];
const dyingEnemies = [];
let _enemyIdCounter = 0;

const DIE_FALL_TIME = 0.6;
const DIE_LIE_TIME  = 9.0;
const DIE_FADE_TIME = 1.5;
const DIE_DURATION  = DIE_FALL_TIME + DIE_LIE_TIME + DIE_FADE_TIME;

function _applyWalkAnimation(e, speed, dt) {
    const data = ENEMIES_DATA[e.type];
    const w = data.walk;
    if (!w) return;

    const t = GameState.gameTime;
    const isStunned = t < e.stunUntil;

    if (isStunned) {
        e.group.position.y = e.baseY;
        e.group.rotation.x = 0;
        e.group.rotation.z = 0;
        return;
    }

    const isMoving = speed > 0.05;
    const baseSpeed = data.speed || 1;
    const speedFactor = isMoving
        ? Math.max(0.15, Math.min(1.5, speed / baseSpeed))
        : 0;
    const sizeMul = data.size;

    if (data.flying) {
        const floatRate = 2.2 * (isMoving ? speedFactor : 0.55);
        e.walkPhase += floatRate * dt;
        const ampScale = isMoving ? 1 : 0.6;
        const bob  = Math.sin(e.walkPhase)        * w.bobAmp  * sizeMul * ampScale;
        const roll = Math.sin(e.walkPhase * 0.7)  * w.swayAmp * sizeMul * ampScale;
        const pitch = Math.sin(e.walkPhase * 0.5) * 0.025 * ampScale;
        e.group.position.y = e.baseY + bob;
        e.group.rotation.z = roll;
        e.group.rotation.x = pitch;
    } else {
        const animRate = isMoving ? w.bobFreq * speedFactor : 1.2;
        e.walkPhase += animRate * dt;
        const ampScale = isMoving ? 1 : 0.12;
        const bob  = Math.abs(Math.sin(e.walkPhase))     * w.bobAmp  * sizeMul * ampScale;
        const sway = Math.sin(e.walkPhase)                * w.swayAmp * sizeMul * ampScale;
        const lean = Math.cos(e.walkPhase * 2) * w.leanAmp * ampScale;
        e.group.position.y = e.baseY + bob;
        e.group.rotation.z = sway;
        e.group.rotation.x = lean;
    }
}

function updateDyingEnemies(dt) {
    const t = GameState.gameTime;

    for (let i = dyingEnemies.length - 1; i >= 0; i--) {
        const e = dyingEnemies[i];
        const elapsed = t - e.dyingStartTime;

        if (elapsed >= DIE_DURATION) {
            scene.remove(e.group);
            e.group.traverse(o => {
                if (o.isMesh) {
                    o.geometry && o.geometry.dispose();
                    if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => m.dispose());
                } else if (o.isSprite) {
                    o.material && o.material.dispose();
                }
            });
            dyingEnemies.splice(i, 1);
            continue;
        }

        let scale = 1;
        let opacity = 1;
        let y;
        let rotZ;

        if (elapsed < DIE_FALL_TIME) {
            const p = elapsed / DIE_FALL_TIME;
            const ease = 1 - Math.pow(1 - p, 3);
            const jump = p < 0.35
                ? Math.sin((p / 0.35) * Math.PI) * 0.22
                : 0;
            y = e.dyingStartY + jump - (e.dyingStartY - e.dyingTargetY) * ease;
            rotZ = e.dyingStartRotZ + (Math.PI / 2 * e.dyingTiltDir) * ease;
            scale = 1 + Math.sin(p * Math.PI) * 0.06;
            opacity = 1;
        } else if (elapsed < DIE_FALL_TIME + DIE_LIE_TIME) {
            y = e.dyingTargetY;
            rotZ = e.dyingStartRotZ + Math.PI / 2 * e.dyingTiltDir;
            scale = 1;
            opacity = 1;
        } else {
            const p = (elapsed - DIE_FALL_TIME - DIE_LIE_TIME) / DIE_FADE_TIME;
            const ease = p * p;
            y = e.dyingTargetY;
            rotZ = e.dyingStartRotZ + Math.PI / 2 * e.dyingTiltDir;
            scale = 1 - ease * 0.35;
            opacity = 1 - p;
        }

        e.group.scale.set(scale, scale, scale);
        e.group.position.y = y;
        e.group.rotation.z = rotZ;

        e.group.traverse(o => {
            if (o.material) {
                const mats = Array.isArray(o.material) ? o.material : [o.material];
                mats.forEach(m => {
                    m.transparent = true;
                    const orig = (m.userData && m.userData._origOpacity != null) ? m.userData._origOpacity : 1;
                    m.opacity = opacity * orig;
                });
            }
        });
    }
}

function spawnEnemy(type, hpOverride) {
    try {
        const data = ENEMIES_DATA[type];
        const path = currentMap.waypoints;
        const start = path[0];

        const group = buildEnemyModel(type);
        group.position.set(start.x, 0, start.z);
        scene.add(group);

        const hpBar = makeHpBar();
        scene.add(hpBar);

        const hp = hpOverride != null ? hpOverride : getEnemyHp(type, GameState.wave);
        const baseY = data.flying ? 1.6 : Math.max(0.6, data.size * 0.75);
        const speedMul = (GameState.difficulty && GameState.difficulty.enemySpeedMul) || 1;

        const enemy = {
            id: ++_enemyIdCounter, type,
            hp, maxHp: hp, speed: data.speed * speedMul, damage: data.damage,
            reward: data.reward, armor: data.armor || 0,
            flying: data.flying,
            pathIndex: 0, progress: 0,
            pos: new THREE.Vector3(start.x, 0, start.z),
            group, hpBar, baseY, size: data.size,
            alive: true,
            slowFactor: 0, slowUntil: 0,
            poisonStacks: 0, poisonUntil: 0,
            stunUntil: 0,
            fireImmune: !!data.fireImmune,
            slowImmune: !!data.slowImmune,
            siegeTarget: null,
            _nextSummon: 0, _nextStep: 0, _nextBuff: 0, _nextSiege: 0,
            walkPhase: Math.random() * Math.PI * 2
        };

        group.position.y = baseY;
        hpBar.position.set(start.x, baseY + data.size + 0.8, start.z);
        updateHpBar(enemy);

        enemies.push(enemy);
        return enemy;
    } catch (err) {
        console.error('[spawnEnemy] ОШИБКА для типа', type, ':', err);
        return null;
    }
}

function killEnemy(e, reward) {
    if (!e.alive) return;
    e.alive = false;
    const data = ENEMIES_DATA[e.type];

    if (reward) {
        const rewardMul = (GameState.difficulty && GameState.difficulty.rewardMul) || 1;
        addCoins(Math.round(e.reward * rewardMul));
        GameState.kills++;

        if (data.isBoss) {
            spawnCoinBurst(e.pos.clone().setY(e.baseY), { count: 45, ttl: 3.0 });
            SFX.death();
            for (let i = 0; i < 6; i++) setTimeout(() => SFX.coin(), i * 80);
        } else {
            spawnCoinBurst(e.pos.clone().setY(e.baseY));
            SFX.death();
            playCoin();
        }
    }

    if (data.lavaOnDeath) {
        const lpGeo = new THREE.CircleGeometry(data.lavaOnDeath.radius, 24);
        const lpMat = new THREE.MeshBasicMaterial({ color: 0x88ccff, transparent: true, opacity: 0.6 });
        const pool = new THREE.Mesh(lpGeo, lpMat);
        pool.rotation.x = -Math.PI / 2;
        pool.position.copy(e.pos);
        pool.position.y = 0.1;
        scene.add(pool);
        lavaPools.push({
            mesh: pool, pos: e.pos.clone(),
            radius: data.lavaOnDeath.radius, dps: data.lavaOnDeath.dps,
            ttl: data.lavaOnDeath.duration, maxTtl: data.lavaOnDeath.duration
        });
    }

    if (data.healOnDeath && reward) {
        for (const other of enemies) {
            if (other === e || !other.alive) continue;
            if (e.pos.distanceTo(other.pos) <= data.healOnDeath.radius) {
                other.hp = Math.min(other.maxHp, other.hp + data.healOnDeath.amount);
                updateHpBar(other);
            }
        }
    }
    if (data.explosionOnDeath) spawnExplosion(e.pos.clone().setY(e.baseY), 0x88ccff, 1.5);

    spawnDeathParticles(e.pos.clone().setY(e.baseY), data.color);

    if (e.hpBar) {
        scene.remove(e.hpBar);
        e.hpBar.traverse(o => {
            if (o.isMesh) {
                o.geometry && o.geometry.dispose();
                if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => m.dispose());
            }
        });
        e.hpBar = null;
    }

    e.dyingStartTime = GameState.gameTime;
    e.dyingStartY = e.group.position.y;
    e.dyingStartRotZ = e.group.rotation.z;
    e.dyingTargetY = Math.max(0.08, data.size * 0.15);
    e.dyingTiltDir = Math.random() < 0.5 ? 1 : -1;

    e.group.traverse(o => {
        if (o.material) {
            const mats = Array.isArray(o.material) ? o.material : [o.material];
            mats.forEach(m => {
                if (!m.userData) m.userData = {};
                m.userData._origOpacity = m.opacity;
            });
        }
    });

    dyingEnemies.push(e);

    const idx = enemies.indexOf(e);
    if (idx >= 0) enemies.splice(idx, 1);
}

function _findNearestTower(pos, range) {
    let best = null, bestD = range;
    for (const tw of buildTowers) {
        const d = pos.distanceTo(tw.position);
        if (d < bestD) { bestD = d; best = tw; }
    }
    return best;
}

function updateEnemies(dt) {
    const t = GameState.gameTime;
    const path = currentMap.waypoints;
    const speedMul = (GameState.difficulty && GameState.difficulty.enemySpeedMul) || 1;

    for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        if (!e.alive) continue;
        const data = ENEMIES_DATA[e.type];

        if (data.aura) {
            for (const other of enemies) {
                if (other === e || !other.alive) continue;
                if (e.pos.distanceTo(other.pos) <= data.aura.radius) {
                    other.hp = Math.min(other.maxHp, other.hp + data.aura.healPerSec * dt);
                    updateHpBar(other);
                }
            }
        }

        if (data.summon && t >= e._nextSummon) {
            for (let k = 0; k < data.summon.count; k++) {
                const child = spawnEnemy(data.summon.type);
                if (!child) continue;
                child.pathIndex = e.pathIndex;
                child.progress = Math.max(0, e.progress - 0.02 * k);
                child.pos.copy(e.pos);
                child.group.position.set(e.pos.x, child.baseY, e.pos.z);
            }
            e._nextSummon = t + data.summon.cooldown;
        }

        if (data.stepDamage && t >= e._nextStep) {
            const sd = data.stepDamage;
            const near = _findNearestTower(e.pos, sd.radius);
            if (near) {
                near.cooldownUntil = Math.max(near.cooldownUntil || 0, t + (sd.towerStun || 1.5));
                spawnExplosion(e.pos.clone(), 0x88ccff, 1.5);
            }
            e._nextStep = t + sd.cooldown;
        }

        if (data.buffSpeed && t >= e._nextBuff) {
            for (const other of enemies) {
                if (other === e || !other.alive) continue;
                if (other.flying !== data.buffSpeed.targetFlying) continue;
                if (e.pos.distanceTo(other.pos) <= data.buffSpeed.radius) {
                    other.speed = other.speed * data.buffSpeed.mul;
                    other._speedBuffUntil = t + 3;
                }
            }
            e._nextBuff = t + 4;
        }
        if (e._speedBuffUntil && t > e._speedBuffUntil) {
            e.speed = data.speed * speedMul;
            e._speedBuffUntil = 0;
        }

        let speed = e.speed;
        if (t < e.slowUntil && !e.slowImmune) speed *= (1 - e.slowFactor);
        if (t < e.stunUntil) speed = 0;

        if (data.siege) {
            const near = _findNearestTower(e.pos, data.siege.stopRange);
            if (near) {
                e.siegeTarget = near;
                if (t >= e._nextSiege) {
                    drawBeam(e.pos.clone().setY(e.baseY), near.position.clone().setY(1.6), 0x88ccff, 0.08, 0.15);
                    near.cooldownUntil = Math.max(near.cooldownUntil || 0, t + (data.siege.towerStun || 1.5));
                    e._nextSiege = t + 1 / (data.siege.fireRate || 0.5);
                    playShoot();
                }
            }
        }

        if (speed > 0) {
            const from = path[e.pathIndex];
            const to = path[e.pathIndex + 1];
            const segLen = from.distanceTo(to);
            e.progress += (speed * dt) / segLen;
            while (e.progress >= 1) {
                e.progress -= 1;
                e.pathIndex++;
                if (e.pathIndex >= path.length - 1) {
                    GameState.waveLeaked++;
                    damageBase(e.damage);
                    killEnemy(e, false);
                    break;
                }
            }
            if (!e.alive) continue;
        }

        const from = path[e.pathIndex];
        const to = path[e.pathIndex + 1];
        e.pos.lerpVectors(from, to, e.progress);
        e.group.position.set(e.pos.x, e.baseY, e.pos.z);

        const dir = new THREE.Vector3().subVectors(to, from).normalize();
        e.group.rotation.y = Math.atan2(dir.x, dir.z);

        _applyWalkAnimation(e, speed, dt);

        if (e.hpBar) {
            e.hpBar.position.set(e.pos.x, e.baseY + e.size + 0.8, e.pos.z);
            e.hpBar.quaternion.copy(camera.quaternion);
        }

        if (t < e.poisonUntil && e.poisonStacks > 0 && !e.fireImmune) {
            e.hp -= e.poisonStacks * 10 * dt;
            if (e.hp <= 0) { killEnemy(e, true); continue; }
        }

        updateHpBar(e);
    }

    updateDyingEnemies(dt);

    for (let i = lavaPools.length - 1; i >= 0; i--) {
        const lp = lavaPools[i];
        lp.ttl -= dt;
        lp.mesh.material.opacity = Math.max(0, lp.ttl / lp.maxTtl) * 0.6;
        if (lp.ttl <= 0) {
            scene.remove(lp.mesh);
            lp.mesh.geometry.dispose();
            lp.mesh.material.dispose();
            lavaPools.splice(i, 1);
        }
    }
}