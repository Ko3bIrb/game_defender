// enemies-models.js — детализированные модели ледяных монстров

// ──── КЕШ ТЕКСТУР И СВЕЧЕНИЯ ────
const _iceGlowCache = new Map();
function _getIceGlowTexture(color) {
    if (_iceGlowCache.has(color)) return _iceGlowCache.get(color);
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const cx = c.getContext('2d');
    const r = (color >> 16) & 255, g = (color >> 8) & 255, b = color & 255;
    const grd = cx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, 'rgba(255,255,255,1)');
    grd.addColorStop(0.15, `rgba(${r},${g},${b},1)`);
    grd.addColorStop(0.5, `rgba(${r},${g},${b},0.45)`);
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    cx.fillStyle = grd;
    cx.fillRect(0, 0, 64, 64);
    const tex = new THREE.CanvasTexture(c);
    _iceGlowCache.set(color, tex);
    return tex;
}

function _iceGlowSprite(color, size) {
    const mat = new THREE.SpriteMaterial({
        map: _getIceGlowTexture(color), blending: THREE.AdditiveBlending,
        transparent: true, depthWrite: false
    });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(size, size, 1);
    return sprite;
}

// ──── HP BAR ────
function makeHpBar() {
    const g = new THREE.Group();
    const bg = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 0.26),
        new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.82, depthTest: false, side: THREE.DoubleSide }));
    bg.renderOrder = 998; g.add(bg);
    const fill = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 0.20),
        new THREE.MeshBasicMaterial({ color: 0x39ff5a, depthTest: false, side: THREE.DoubleSide }));
    fill.position.z = 0.001; fill.renderOrder = 999; g.add(fill);
    const shine = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 0.05),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3, depthTest: false, side: THREE.DoubleSide }));
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
    fill.material.color.setHex(ratio > 0.6 ? 0x39ff5a : ratio > 0.3 ? 0xffd166 : 0xff3b3b);
}

// ──── МАТЕРИАЛЫ ────
const _iceMat = (c, r=0.8, m=0.2, e=0x000000, ei=0, t=false) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m, emissive: e, emissiveIntensity: ei, transparent: t });

// ═══════════════════════════════════════════
// НАЗЕМНЫЕ
// ═══════════════════════════════════════════

function buildIceSkeleton(group, s) {
    const boneMat = _iceMat(0xddeeff, 0.6, 0.1, 0x88ccff, 0.1);
    const rustMat = _iceMat(0x552211, 0.9, 0.5);
    const iceMat = _iceMat(0x88ccff, 0.2, 0.8, 0x224466, 0.5, true);

    for (const sign of [-1, 1]) {
        const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.08*s, 0.06*s, 0.5*s, 5), boneMat);
        thigh.position.set(sign*0.15*s, -0.25*s, 0);
        thigh.rotation.x = -0.3; group.add(thigh);
        const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.06*s, 0.08*s, 0.5*s, 5), boneMat);
        shin.position.set(sign*0.15*s, -0.65*s, 0.15*s);
        shin.rotation.x = 0.4; group.add(shin);
    }

    const spine = new THREE.Mesh(new THREE.CylinderGeometry(0.05*s, 0.05*s, 0.8*s, 5), boneMat);
    spine.position.set(0, 0.1*s, 0); spine.rotation.x = 0.4; group.add(spine);
    
    for (let i = 0; i < 4; i++) {
        const rib = new THREE.Mesh(new THREE.TorusGeometry(0.2*s, 0.02*s, 4, 6, Math.PI), boneMat);
        rib.rotation.x = Math.PI/2; rib.rotation.z = Math.PI/2;
        rib.position.set(0, -0.1*s + i*0.15*s, 0.1*s); group.add(rib);
        
        const icicle = new THREE.Mesh(new THREE.ConeGeometry(0.03*s, 0.15*s, 4), iceMat);
        icicle.position.set(0, -0.15*s + i*0.15*s, 0.2*s); icicle.rotation.x = Math.PI; group.add(icicle);
    }

    const skull = new THREE.Mesh(new THREE.SphereGeometry(0.15*s, 8, 6), boneMat);
    skull.scale.set(1, 1.2, 1.1); skull.position.set(0, 0.6*s, 0.25*s); group.add(skull);
    
    for (const sign of [-1, 1]) {
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.03*s, 4, 4), new THREE.MeshBasicMaterial({ color: 0x00ffff }));
        eye.position.set(sign*0.06*s, 0.6*s, 0.38*s); group.add(eye);
        const glow = _iceGlowSprite(0x00ffff, 0.2*s); glow.position.copy(eye.position); group.add(glow);
    }

    for (const sign of [-1, 1]) {
        const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.04*s, 0.03*s, 1.0*s, 5), boneMat);
        arm.position.set(sign*0.3*s, 0.0*s, 0.1*s);
        arm.rotation.z = sign * 0.2; arm.rotation.x = 0.2; group.add(arm);
    }

    const cleaver = new THREE.Mesh(new THREE.BoxGeometry(0.05*s, 0.4*s, 0.15*s), rustMat);
    cleaver.position.set(0.35*s, -0.4*s, 0.3*s); cleaver.rotation.x = 0.3; group.add(cleaver);
    
    const mail = new THREE.Mesh(new THREE.CylinderGeometry(0.22*s, 0.25*s, 0.3*s, 6), _iceMat(0x445566, 0.5, 0.8));
    mail.position.set(0, 0.1*s, 0); group.add(mail);
}

function buildIceGolem(group, s) {
    const stoneMat = _iceMat(0x2a3b4c, 0.9, 0.2);
    const iceMat = _iceMat(0x88ccff, 0.3, 0.6, 0x224466, 0.4, true);

    for (const sign of [-1, 1]) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.25*s, 0.3*s, 0.5*s, 6), stoneMat);
        leg.position.set(sign*0.3*s, -0.6*s, 0); group.add(leg);
    }

    const torso = new THREE.Mesh(new THREE.DodecahedronGeometry(0.7*s, 0), stoneMat);
    torso.position.y = 0; torso.scale.set(1.2, 1, 0.9); group.add(torso);

    const core = new THREE.Mesh(new THREE.SphereGeometry(0.2*s, 8, 6), new THREE.MeshBasicMaterial({ color: 0x00ffff }));
    core.position.set(0, 0.1*s, 0.6*s); group.add(core);
    const coreGlow = _iceGlowSprite(0x00ffff, 1.0*s); coreGlow.position.copy(core.position); group.add(coreGlow);

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.4*s, 0.4*s, 0.4*s), stoneMat);
    head.position.set(0, 0.8*s, 0.1*s); head.rotation.z = 0.2; group.add(head);

    for (const sign of [-1, 1]) {
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.05*s, 4, 4), new THREE.MeshBasicMaterial({ color: 0x00ffff }));
        eye.position.set(sign*0.1*s, 0.85*s, 0.3*s); group.add(eye);
    }

    for (const sign of [-1, 1]) {
        const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.2*s, 0.25*s, 0.8*s, 6), stoneMat);
        arm.position.set(sign*0.8*s, 0.1*s, 0); arm.rotation.z = sign*0.2; group.add(arm);
        
        const fist = new THREE.Mesh(new THREE.DodecahedronGeometry(0.35*s, 0), stoneMat);
        fist.position.set(sign*0.9*s, -0.4*s, 0); group.add(fist);

        for (let i = 0; i < 3; i++) {
            const spike = new THREE.Mesh(new THREE.ConeGeometry(0.1*s, 0.4*s, 4), iceMat);
            spike.position.set(sign*0.6*s, 0.5*s - i*0.15*s, 0);
            spike.rotation.z = sign * 0.8; group.add(spike);
        }
    }
}

function buildSnowWitch(group, s) {
    const dressMat = _iceMat(0x223344, 0.9, 0.1, 0x001122, 0.2);
    const skinMat = _iceMat(0x88ccff, 0.4, 0.2);

    const pts = [];
    for (let i = 0; i <= 8; i++) {
        const r = i === 0 ? 0.8*s : i === 8 ? 0.2*s : 0.6*s - i*0.05*s + (Math.random()*0.1*s);
        pts.push(new THREE.Vector2(r, i*0.15*s - 0.5*s));
    }
    const dress = new THREE.Mesh(new THREE.LatheGeometry(pts, 8), dressMat);
    group.add(dress);

    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.15*s, 0.2*s, 0.6*s, 6), skinMat);
    torso.position.y = 0.7*s; group.add(torso);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.15*s, 8, 6), skinMat);
    head.position.y = 1.1*s; group.add(head);

    for (const sign of [-1, 1]) {
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.04*s, 4, 4), new THREE.MeshBasicMaterial({ color: 0xffffff }));
        eye.position.set(sign*0.05*s, 1.12*s, 0.12*s); group.add(eye);
        const glow = _iceGlowSprite(0xffffff, 0.2*s); glow.position.copy(eye.position); group.add(glow);
    }

    for (let i = 0; i < 6; i++) {
        const hair = new THREE.Mesh(new THREE.CylinderGeometry(0.01*s, 0.03*s, 0.6*s, 4), _iceMat(0xffffff, 0.5, 0.1));
        hair.position.set((Math.random()-0.5)*0.3*s, 1.0*s, -0.1*s);
        hair.rotation.x = Math.PI/2 + (Math.random()-0.5)*0.5;
        hair.rotation.z = (Math.random()-0.5)*0.5;
        group.add(hair);
    }

    const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.02*s, 0.03*s, 1.5*s, 5), _iceMat(0x1a1510, 0.9, 0.1));
    staff.position.set(0.3*s, 0.6*s, 0.2*s); group.add(staff);
    const staffSkull = new THREE.Mesh(new THREE.SphereGeometry(0.08*s, 6, 4), _iceMat(0xddeeff, 0.6, 0.1));
    staffSkull.position.set(0.3*s, 1.35*s, 0.2*s); group.add(staffSkull);
}

function buildIceKnight(group, s) {
    const armorMat = _iceMat(0x1a2a3a, 0.4, 0.8, 0x000000, 0);
    const iceMat = _iceMat(0x88ccff, 0.2, 0.8, 0x224466, 0.5);

    for (const sign of [-1, 1]) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.12*s, 0.15*s, 0.6*s, 6), armorMat);
        leg.position.set(sign*0.2*s, -0.5*s, 0); group.add(leg);
    }

    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.6*s, 0.7*s, 0.4*s), armorMat);
    torso.position.y = 0.1*s; group.add(torso);

    for (const sign of [-1, 1]) {
        const pad = new THREE.Mesh(new THREE.BoxGeometry(0.25*s, 0.2*s, 0.3*s), armorMat);
        pad.position.set(sign*0.4*s, 0.4*s, 0); group.add(pad);
        const snout = new THREE.Mesh(new THREE.ConeGeometry(0.08*s, 0.2*s, 4), armorMat);
        snout.position.set(sign*0.45*s, 0.4*s, 0.2*s); snout.rotation.x = Math.PI/2; group.add(snout);
    }

    const helm = new THREE.Mesh(new THREE.BoxGeometry(0.25*s, 0.25*s, 0.25*s), armorMat);
    helm.position.y = 0.65*s; group.add(helm);
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.2*s, 0.03*s, 0.05*s), new THREE.MeshBasicMaterial({ color: 0x00ffff }));
    visor.position.set(0, 0.65*s, 0.15*s); group.add(visor);
    const visorGlow = _iceGlowSprite(0x00ffff, 0.3*s); visorGlow.position.copy(visor.position); group.add(visorGlow);

    const shield = new THREE.Mesh(new THREE.BoxGeometry(0.4*s, 0.6*s, 0.08*s), armorMat);
    shield.position.set(-0.4*s, 0.1*s, 0.2*s); group.add(shield);
    const snowflake = new THREE.Mesh(new THREE.TorusGeometry(0.1*s, 0.02*s, 4, 6), iceMat);
    snowflake.position.set(-0.4*s, 0.1*s, 0.25*s); group.add(snowflake);

    const spear = new THREE.Mesh(new THREE.CylinderGeometry(0.02*s, 0.02*s, 1.5*s, 5), _iceMat(0x3a2a1a, 0.8, 0.4));
    spear.position.set(0.4*s, 0.2*s, 0.2*s); group.add(spear);
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.06*s, 0.2*s, 4), iceMat);
    tip.position.set(0.4*s, 1.0*s, 0.2*s); group.add(tip);
}

// ═══════════════════════════════════════════
// ВОЗДУШНЫЕ
// ═══════════════════════════════════════════

function buildBlizzardSpirit(group, s) {
    for (let i = 0; i < 15; i++) {
        const shard = new THREE.Mesh(new THREE.OctahedronGeometry(0.05*s + Math.random()*0.1*s, 0), 
            _iceMat(0xaaddff, 0.2, 0.8, 0x224466, 0.5, true));
        shard.position.set((Math.random()-0.5)*0.8*s, (Math.random()-0.5)*0.8*s, (Math.random()-0.5)*0.8*s);
        group.add(shard);
    }

    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.1*s, 0.05*s, 0.6*s, 6), _iceMat(0xffffff, 0.1, 0.9, 0xffffff, 0.2, true));
    torso.position.y = 0.2*s; group.add(torso);

    for (const sign of [-1, 1]) {
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.04*s, 4, 4), new THREE.MeshBasicMaterial({ color: 0x00ffff }));
        eye.position.set(sign*0.05*s, 0.4*s, 0.1*s); group.add(eye);
        const glow = _iceGlowSprite(0x00ffff, 0.3*s); glow.position.copy(eye.position); group.add(glow);
    }

    const aura = _iceGlowSprite(0x88ccff, 1.2*s); aura.position.y = 0.2*s; aura.material.opacity = 0.3; group.add(aura);
}

function buildIceHarpy(group, s) {
    const skinMat = _iceMat(0x88ccff, 0.6, 0.1);
    const featherMat = _iceMat(0xddeeff, 0.4, 0.2);

    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.15*s, 0.1*s, 0.5*s, 6), skinMat);
    torso.position.y = 0.3*s; group.add(torso);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.12*s, 8, 6), skinMat);
    head.position.y = 0.7*s; group.add(head);
    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.05*s, 0.15*s, 4), _iceMat(0xffcc00, 0.5, 0.5));
    beak.position.set(0, 0.68*s, 0.15*s); beak.rotation.x = Math.PI/2; group.add(beak);

    for (const sign of [-1, 1]) {
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.03*s, 4, 4), new THREE.MeshBasicMaterial({ color: 0xffaa00 }));
        eye.position.set(sign*0.05*s, 0.73*s, 0.1*s); group.add(eye);
    }

    for (const sign of [-1, 1]) {
        const wingShape = new THREE.Shape();
        wingShape.moveTo(0, 0);
        wingShape.lineTo(sign * 1.5*s, 0.3*s);
        wingShape.lineTo(sign * 1.2*s, -0.2*s);
        wingShape.lineTo(sign * 0.5*s, -0.4*s);
        wingShape.lineTo(0, 0);
        const wing = new THREE.Mesh(new THREE.ShapeGeometry(wingShape), featherMat);
        wing.position.set(sign*0.1*s, 0.5*s, 0);
        group.add(wing);
        
        for(let i=0; i<4; i++) {
            const spike = new THREE.Mesh(new THREE.ConeGeometry(0.05*s, 0.3*s, 4), _iceMat(0x88ccff, 0.2, 0.8));
            spike.position.set(sign*(0.5*s + i*0.3*s), 0.2*s, 0);
            spike.rotation.z = sign * Math.PI/2; group.add(spike);
        }
    }

    for (const sign of [-1, 1]) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03*s, 0.03*s, 0.3*s, 4), skinMat);
        leg.position.set(sign*0.1*s, -0.1*s, 0); group.add(leg);
        for(let i=0; i<3; i++) {
            const claw = new THREE.Mesh(new THREE.ConeGeometry(0.02*s, 0.1*s, 4), _iceMat(0x1a1510, 0.9, 0.1));
            claw.position.set(sign*0.1*s + (i-1)*0.04*s, -0.25*s, 0.05*s);
            claw.rotation.x = Math.PI/2; group.add(claw);
        }
    }
}

// ═══════════════════════════════════════════
// ОСАДНЫЕ
// ═══════════════════════════════════════════

function buildIceBallista(group, s) {
    const woodMat = _iceMat(0x2a1a0a, 0.9, 0.1);
    const metalMat = _iceMat(0x445566, 0.4, 0.8);
    const iceMat = _iceMat(0x88ccff, 0.2, 0.8, 0x224466, 0.5);

    for (const zOff of [-s * 0.3, s * 0.3]) {
        const rail = new THREE.Mesh(new THREE.BoxGeometry(s * 1.8, s * 0.2, s * 0.15), woodMat);
        rail.position.set(0, s * 0.2, zOff); group.add(rail);
    }
    
    for (const x of [-s * 0.7, s * 0.7]) {
        for (const z of [-s * 0.5, s * 0.5]) {
            const wheel = new THREE.Mesh(new THREE.CylinderGeometry(s * 0.4, s * 0.4, s * 0.15, 12), metalMat);
            wheel.position.set(x, -s * 0.2, z); wheel.rotation.x = Math.PI / 2; group.add(wheel);
        }
    }

    const arm = new THREE.Mesh(new THREE.TorusGeometry(s * 0.8, s * 0.05, 6, 16, Math.PI), woodMat);
    arm.position.set(0, s * 0.5, 0); arm.rotation.x = Math.PI / 2; arm.rotation.z = Math.PI / 2; group.add(arm);

    const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.05 * s, 0.05 * s, s * 2, 6), iceMat);
    bolt.rotation.x = Math.PI / 2; bolt.position.set(0, s * 0.4, s * 0.5); group.add(bolt);
    
    const crystalTip = new THREE.Mesh(new THREE.OctahedronGeometry(0.1*s, 0), new THREE.MeshBasicMaterial({ color: 0x00ffff }));
    crystalTip.position.set(0, s * 0.4, s * 1.5); group.add(crystalTip);
    const tipGlow = _iceGlowSprite(0x00ffff, s * 0.8); tipGlow.position.copy(crystalTip.position); group.add(tipGlow);
}

// ═══════════════════════════════════════════
// БОССЫ
// ═══════════════════════════════════════════

function buildBlizzardLord(group, s) {
    const cloakMat = _iceMat(0xddeeff, 0.6, 0.1, 0x88ccff, 0.3, true);

    const cloak = new THREE.Mesh(new THREE.ConeGeometry(0.8*s, 2.5*s, 8), cloakMat);
    cloak.position.y = 0.5*s; group.add(cloak);

    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.2*s, 0.3*s, 0.8*s, 6), _iceMat(0x88ccff, 0.5, 0.2));
    torso.position.y = 1.0*s; group.add(torso);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.2*s, 8, 6), _iceMat(0x88ccff, 0.5, 0.2));
    head.position.y = 1.5*s; group.add(head);
    for (let i = 0; i < 5; i++) {
        const hair = new THREE.Mesh(new THREE.CylinderGeometry(0.02*s, 0.05*s, 1.0*s, 4), _iceMat(0xffffff, 0.4, 0.1));
        hair.position.set((Math.random()-0.5)*0.4*s, 1.3*s, -0.15*s);
        hair.rotation.x = Math.PI/3; group.add(hair);
    }

    for (let i = 0; i < 6; i++) {
        const ang = (i/6)*Math.PI*2;
        const spike = new THREE.Mesh(new THREE.ConeGeometry(0.03*s, 0.3*s, 4), _iceMat(0x88ccff, 0.2, 0.8));
        spike.position.set(Math.cos(ang)*0.15*s, 1.75*s, Math.sin(ang)*0.15*s);
        spike.rotation.z = Math.cos(ang)*0.3; spike.rotation.x = -Math.sin(ang)*0.3; group.add(spike);
    }

    const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.04*s, 0.04*s, 2.5*s, 6), _iceMat(0xaaddff, 0.1, 0.9, 0x224466, 0.4, true));
    staff.position.set(0.5*s, 1.0*s, 0); group.add(staff);
    const skull = new THREE.Mesh(new THREE.SphereGeometry(0.15*s, 8, 6), _iceMat(0xddeeff, 0.6, 0.1));
    skull.position.set(0.5*s, 2.3*s, 0); group.add(skull);

    const aura = _iceGlowSprite(0x88ccff, 4.0*s); aura.position.y = 1.0*s; aura.material.opacity = 0.2; group.add(aura);
}

function buildFrostGuardian(group, s) {
    const iceMat = _iceMat(0x2a4a6a, 0.6, 0.4, 0x112244, 0.2, true);
    const rockMat = _iceMat(0x1a2025, 0.9, 0.2);

    const torso = new THREE.Mesh(new THREE.BoxGeometry(1.4*s, 2.0*s, 1.0*s), iceMat);
    torso.position.y = 0; group.add(torso);

    for (let i = 0; i < 5; i++) {
        const shield = new THREE.Mesh(new THREE.BoxGeometry(0.3*s, 0.4*s, 0.05*s), _iceMat(0x445566, 0.5, 0.8));
        shield.position.set((Math.random()-0.5)*1.0*s, (Math.random()-0.5)*1.5*s, 0.5*s);
        shield.rotation.z = Math.random()*Math.PI; group.add(shield);
    }

    for (const sign of [-1, 1]) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.3*s, 0.4*s, 0.6*s, 6), rockMat);
        leg.position.set(sign*0.5*s, -1.1*s, 0); group.add(leg);
    }

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.5*s, 0.4*s, 0.5*s), rockMat);
    head.position.set(0, 1.0*s, 0); group.add(head);

    for (const sign of [-1, 1]) {
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.06*s, 4, 4), new THREE.MeshBasicMaterial({ color: 0x00ffff }));
        eye.position.set(sign*0.15*s, 1.0*s, 0.25*s); group.add(eye);
        const smoke = _iceGlowSprite(0x00ffff, 0.4*s); smoke.position.copy(eye.position); smoke.material.opacity = 0.5; group.add(smoke);
    }

    for (const sign of [-1, 1]) {
        const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.2*s, 0.25*s, 1.5*s, 6), iceMat);
        arm.position.set(sign*0.8*s, -0.2*s, 0); arm.rotation.z = sign*0.1; group.add(arm);
        
        const fist = new THREE.Mesh(new THREE.DodecahedronGeometry(0.4*s, 0), iceMat);
        fist.position.set(sign*0.9*s, -1.0*s, 0); group.add(fist);
        
        const sword = new THREE.Mesh(new THREE.BoxGeometry(0.05*s, 0.4*s, 0.05*s), _iceMat(0x445566, 0.4, 0.8));
        sword.position.set(sign*1.1*s, -1.0*s, 0.1*s); sword.rotation.z = 0.5; group.add(sword);
    }

    for (let i = 0; i < 5; i++) {
        const spike = new THREE.Mesh(new THREE.ConeGeometry(0.15*s, 0.6*s, 4), _iceMat(0x88ccff, 0.2, 0.8));
        spike.position.set(0, 0.5*s + i*0.3*s, -0.4*s);
        spike.rotation.x = -0.4; group.add(spike);
    }
}

function buildSnowDevourer(group, s) {
    const furMat = _iceMat(0x2a3b4c, 0.9, 0.1, 0x112233, 0.2);
    const iceMat = _iceMat(0x88ccff, 0.3, 0.6, 0x224466, 0.4);
    const boneMat = _iceMat(0xddeeff, 0.6, 0.1);

    const body1 = new THREE.Mesh(new THREE.SphereGeometry(0.6 * s, 8, 6), furMat);
    body1.scale.set(1.2, 0.8, 1.5);
    body1.position.set(0, 0.5 * s, 0); group.add(body1);
    
    const body2 = new THREE.Mesh(new THREE.SphereGeometry(0.5 * s, 8, 6), furMat);
    body2.scale.set(1.1, 0.7, 1.2);
    body2.position.set(0, 0.5 * s, 0.6 * s); group.add(body2);

    const hump = new THREE.Mesh(new THREE.SphereGeometry(0.4 * s, 8, 6), furMat);
    hump.position.set(0, 0.8 * s, -0.3 * s); group.add(hump);

    for (const x of [-0.5, 0.5]) {
        for (const z of [-0.6, 0.6]) {
            const legTop = new THREE.Mesh(new THREE.CylinderGeometry(0.15 * s, 0.2 * s, 0.5 * s, 6), furMat);
            legTop.position.set(x * s, 0.2 * s, z * s); group.add(legTop);
            const legBot = new THREE.Mesh(new THREE.CylinderGeometry(0.1 * s, 0.15 * s, 0.5 * s, 6), furMat);
            legBot.position.set(x * s, -0.2 * s, z * s); group.add(legBot);
            
            for (let i = 0; i < 3; i++) {
                const claw = new THREE.Mesh(new THREE.ConeGeometry(0.04 * s, 0.2 * s, 4), boneMat);
                claw.position.set(x * s + (i-1) * 0.08 * s, -0.45 * s, z * s + 0.15 * s);
                claw.rotation.x = Math.PI / 2; group.add(claw);
            }
        }
    }

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.5 * s, 0.4 * s, 0.6 * s), furMat);
    head.position.set(0, 0.7 * s, 1.1 * s); group.add(head);

    const snout = new THREE.Mesh(new THREE.BoxGeometry(0.3 * s, 0.25 * s, 0.4 * s), furMat);
    snout.position.set(0, 0.65 * s, 1.45 * s); group.add(snout);

    const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.25 * s, 0.1 * s, 0.4 * s), furMat);
    jaw.position.set(0, 0.5 * s, 1.4 * s);
    jaw.rotation.x = 0.4;
    group.add(jaw);

    for (const sign of [-1, 1]) {
        for (let i = 0; i < 3; i++) {
            const fang = new THREE.Mesh(new THREE.ConeGeometry(0.02 * s, 0.1 * s, 4), boneMat);
            fang.position.set(sign * 0.08 * s, 0.58 * s, 1.55 * s + i * 0.05 * s);
            fang.rotation.x = Math.PI; group.add(fang);
            
            const lowerFang = new THREE.Mesh(new THREE.ConeGeometry(0.02 * s, 0.1 * s, 4), boneMat);
            lowerFang.position.set(sign * 0.08 * s, 0.48 * s, 1.55 * s + i * 0.05 * s);
            group.add(lowerFang);
        }
    }

    for (const sign of [-1, 1]) {
        for (let i = 0; i < 3; i++) {
            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.04 * s, 4, 4), new THREE.MeshBasicMaterial({ color: 0x00ffff }));
            const ex = sign * (0.15 * s + i * 0.05 * s);
            const ey = 0.75 * s + i * 0.08 * s;
            const ez = 1.2 * s - i * 0.1 * s;
            eye.position.set(ex, ey, ez);
            group.add(eye);
            const glow = _iceGlowSprite(0x00ffff, 0.15 * s); glow.position.copy(eye.position); group.add(glow);
        }
    }

    for (let i = 0; i < 5; i++) {
        const spike = new THREE.Mesh(new THREE.ConeGeometry(0.1 * s, 0.4 * s, 4), iceMat);
        spike.position.set(0, 0.9 * s + Math.sin(i) * 0.1 * s, 0.8 * s - i * 0.3 * s);
        spike.rotation.x = -0.3; group.add(spike);
    }

    const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.05 * s, 0.15 * s, 1.2 * s, 5), iceMat);
    tail.position.set(0, 0.6 * s, -1.0 * s);
    tail.rotation.x = -Math.PI / 3;
    group.add(tail);

    const breath = _iceGlowSprite(0xaaffff, 0.8 * s);
    breath.position.set(0, 0.55 * s, 1.7 * s);
    breath.material.opacity = 0.4;
    group.add(breath);

    const aura = _iceGlowSprite(0x88ccff, 3.0 * s);
    aura.position.y = 0.5 * s;
    aura.material.opacity = 0.15;
    group.add(aura);
}

// ═══════════════════════════════════════════
// ДИСПЕТЧЕР
// ═══════════════════════════════════════════
function buildEnemyModel(type) {
    const data = ENEMIES_DATA[type];
    const group = new THREE.Group();
    const s = data.size;

    switch (type) {
        case 'ice_skeleton':     buildIceSkeleton(group, s);     break;
        case 'ice_golem':        buildIceGolem(group, s);        break;
        case 'snow_witch':       buildSnowWitch(group, s);       break;
        case 'ice_knight':       buildIceKnight(group, s);       break;
        case 'blizzard_spirit':  buildBlizzardSpirit(group, s);  break;
        case 'ice_harpy':        buildIceHarpy(group, s);        break;
        case 'ice_ballista':     buildIceBallista(group, s);     break;
        case 'blizzard_lord':    buildBlizzardLord(group, s);    break;
        case 'frost_guardian':   buildFrostGuardian(group, s);   break;
        case 'snow_devourer':    buildSnowDevourer(group, s);    break;
        default: {
            const box = new THREE.Mesh(
                new THREE.BoxGeometry(s * 1.5, s * 1.5, s * 1.5),
                new THREE.MeshStandardMaterial({ color: data.color || 0x88ccff, roughness: 0.8 })
            );
            box.castShadow = true;
            group.add(box);
        }
    }
    return group;
}