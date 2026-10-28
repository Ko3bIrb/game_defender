let scene, camera, renderer;
let composer = null, bloomPass = null;
let clock = new THREE.Clock();

// ─── Определение мобильного устройства ───
const IS_MOBILE = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
                  || window.innerWidth < 900;

const CAMERA_FOV  = 45;
const CAMERA_TILT = THREE.MathUtils.degToRad(50);
const PLAY_W      = 110;
const PLAY_D      = 30;
const PLAY_TOP_Y  = 2.0;
const FLOOR_SIZE  = 400;
const BASE_TIME_SCALE = 3;

// ──── Пресеты сложности ────
const DIFFICULTY_PRESETS = {
    easy: {
        key: 'easy', name: 'Лёгкий', icon: '🌿', color: '#39ff5a',
        hp: 40, coins: 400,
        enemyHpMul: 0.5, enemySpeedMul: 0.7,
        rewardMul: 1.5, waveBonusMul: 1.8
    },
    medium: {
        key: 'medium', name: 'Средний', icon: '⚔️', color: '#ffd166',
        hp: 30, coins: 300,
        enemyHpMul: 0.65, enemySpeedMul: 0.8,
        rewardMul: 1.3, waveBonusMul: 1.5
    },
    hard: {
        key: 'hard', name: 'Высокий', icon: '🔥', color: '#ff3b3b',
        hp: 20, coins: 200,
        enemyHpMul: 0.78,
        enemySpeedMul: 0.9,
        rewardMul: 1.0, waveBonusMul: 1.0
    }
};

let _diffPrevPaused = false;
let _diffForceSelect = false;

function _diffModalEl()  { return document.getElementById('difficulty-modal'); }
function _diffCancelEl() { return document.getElementById('difficulty-cancel'); }
function _diffBtnEl()    { return document.getElementById('hud-difficulty'); }

function _updateDifficultyButton() {
    const btn = _diffBtnEl();
    if (!btn) return;
    const preset = GameState.difficulty;
    const label = btn.querySelector('span');
    label.textContent = preset ? `Сложность · ${preset.name}` : 'Сложность';
}

function openDifficultyModal(forceSelect) {
    const modal = _diffModalEl();
    if (!modal) return;
    _diffPrevPaused = GameState.paused;
    _diffForceSelect = !!forceSelect;
    GameState.paused = true;
    if (typeof refreshSpeedButtons === 'function') refreshSpeedButtons();
    const curKey = GameState.difficulty ? GameState.difficulty.key : null;
    modal.querySelectorAll('.difficulty-card').forEach(card => {
        card.classList.toggle('preselected', card.dataset.diff === curKey);
    });
    const cancelBtn = _diffCancelEl();
    if (cancelBtn) {
        if (forceSelect || !GameState.difficulty) cancelBtn.classList.add('hidden');
        else cancelBtn.classList.remove('hidden');
    }
    modal.classList.remove('hidden');
}

function closeDifficultyModal(cancelled) {
    const modal = _diffModalEl();
    if (modal) modal.classList.add('hidden');
    if (cancelled) GameState.paused = _diffPrevPaused;
    if (typeof refreshSpeedButtons === 'function') refreshSpeedButtons();
}

function applyDifficultyOnLoad(key) {
    const preset = DIFFICULTY_PRESETS[key];
    if (!preset) return false;
    GameState.difficultyKey = key;
    GameState.difficulty = preset;
    GameState.maxHp = preset.hp;
    GameState.hp = preset.hp;
    GameState.coins = preset.coins;
    if (typeof onStateChanged === 'function') onStateChanged();
    _updateDifficultyButton();
    return true;
}

function _pickDifficulty(key) {
    const preset = DIFFICULTY_PRESETS[key];
    if (!preset) return;
    const mapId = (currentMap && currentMap.id) || 'hell';
    const saveKey = 'difficulty_' + mapId;
    const wasInGame = !!GameState.difficulty;
    const sameChoice = GameState.difficulty && GameState.difficulty.key === key;
    try { localStorage.setItem(saveKey, key); } catch(e) {}
    if (!wasInGame) {
        applyDifficultyOnLoad(key);
        closeDifficultyModal(false);
        GameState.paused = false;
        if (typeof refreshSpeedButtons === 'function') refreshSpeedButtons();
        try { if (typeof SFX !== 'undefined' && SFX.build) SFX.build(); } catch(e) {}
        return;
    }
    if (sameChoice) {
        closeDifficultyModal(false);
        GameState.paused = false;
        if (typeof refreshSpeedButtons === 'function') refreshSpeedButtons();
        return;
    }
    closeDifficultyModal(false);
    showRestartNotice(preset);
}

function showRestartNotice(preset) {
    let el = document.getElementById('restart-notice');
    if (!el) {
        el = document.createElement('div');
        el.id = 'restart-notice';
        el.style.cssText = `
            position: fixed; inset: 0;
            background: rgba(7, 3, 15, 0.95);
            display: flex; align-items: center; justify-content: center;
            z-index: 400; flex-direction: column;
            color: #e8d4ff; font-family: 'Segoe UI', sans-serif;
            backdrop-filter: blur(6px);
        `;
        document.body.appendChild(el);
    }
    el.innerHTML = `
        <div style="text-align:center;">
            <div style="font-size:48px; margin-bottom:16px;">${preset.icon}</div>
            <div style="font-size:22px; color:${preset.color}; letter-spacing:2px; text-transform:uppercase; font-weight:800; margin-bottom:8px;">
                ${preset.name} сложность
            </div>
            <div style="font-size:14px; opacity:0.8;">Перезапуск игры…</div>
        </div>
    `;
    setTimeout(() => { location.reload(); }, 600);
}

function showFatalError(e) {
    const el = document.getElementById('fatal-error');
    if (!el) { console.error('[FATAL]', e); return; }
    el.style.display = 'block';
    const msg = e && e.message ? e.message : String(e);
    const stack = e && e.stack ? e.stack.split('\n').slice(0, 4).join('<br>') : '';
    el.innerHTML = `<b>Ошибка запуска</b><br>${msg}<br><br>${stack}`;
    console.error('[FATAL]', e);
}

// ═══════════════════════════════════════════
// ИНИЦИАЛИЗАЦИЯ СЦЕНЫ
// ═══════════════════════════════════════════
function initEngine() {
    scene = new THREE.Scene();
    const isHell = currentMap && currentMap.id === 'hell';
    const isIce  = currentMap && currentMap.id === 'ice';

    let skyColor, fogNear, fogFar;
    let hemiSky, hemiGround, hemiIntensity;
    let sunColor, sunIntensity;
    let ambientColor, ambientIntensity;
    let atmosphericLights;

    if (isHell) {
        // Оригинальные настройки Ада (тёмные и мрачные)
        skyColor = 0x120303; fogNear = 70; fogFar = 200;
        hemiSky = 0x6a2222;  hemiGround = 0x120303;  hemiIntensity = 0.55;
        sunColor = 0xff6633; sunIntensity = 0.6;
        ambientColor = 0x2a0404; ambientIntensity = 0.35;
        atmosphericLights = [
            { color: 0xff3b0a, intensity: 0.9, pos: [-45, 5, 0] },
            { color: 0xffe070, intensity: 0.7, pos: [ 45, 5, 0] },
            { color: 0xff5522, intensity: 0.6, pos: [  0, 6, -18] },
            { color: 0xff5522, intensity: 0.6, pos: [  0, 6,  18] }
        ];
    } else if (isIce) {
        skyColor = 0x02050a; fogNear = 150; fogFar = 350;
        hemiSky = 0x223355;  hemiGround = 0x010205;  hemiIntensity = 0.3;
        sunColor = 0x4466aa; sunIntensity = 0.25;
        ambientColor = 0x050a15; ambientIntensity = 0.2;
        atmosphericLights = [
            { color: 0x0088ff, intensity: 0.6, pos: [-45, 5, 0] },
            { color: 0x44aaff, intensity: 0.4, pos: [ 45, 5, 0] },
            { color: 0x0055ff, intensity: 0.5, pos: [  0, 6, -18] },
            { color: 0x44aaff, intensity: 0.4, pos: [  0, 6,  18] }
        ];
    } else {
        skyColor = 0x050208; fogNear = 85; fogFar = 220;
        hemiSky = 0x5a7aef;  hemiGround = 0x1a0a2a;  hemiIntensity = 0.55;
        sunColor = 0x8aa0ff; sunIntensity = 0.6;
        ambientColor = 0x2a1550; ambientIntensity = 0.35;
        atmosphericLights = [
            { color: 0xff3b3b, intensity: 0.7, pos: [-40, 5, -15] },
            { color: 0xff8844, intensity: 0.6, pos: [ 40, 5,  15] },
            { color: 0xff3bff, intensity: 0.5, pos: [  0, 6,   0] }
        ];
    }

    scene.background = new THREE.Color(skyColor);
    scene.fog = new THREE.Fog(skyColor, fogNear, fogFar);

    camera = new THREE.PerspectiveCamera(CAMERA_FOV, window.innerWidth/window.innerHeight, 0.1, 1000);

    renderer = new THREE.WebGLRenderer({ antialias: !IS_MOBILE, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(IS_MOBILE ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = !IS_MOBILE;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.9;
    renderer.outputEncoding = THREE.sRGBEncoding;
    document.getElementById('game-container').appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(hemiSky, hemiGround, hemiIntensity));

    if (!IS_MOBILE) {
        const sun = new THREE.DirectionalLight(sunColor, sunIntensity);
        sun.position.set(10, 20, 10);
        sun.castShadow = true;
        sun.shadow.mapSize.set(2048, 2048);
        sun.shadow.camera.left = -60; sun.shadow.camera.right = 60;
        sun.shadow.camera.top = 30;   sun.shadow.camera.bottom = -30;
        sun.shadow.camera.near = 1;
        sun.shadow.camera.far = 80;
        sun.shadow.bias = -0.0005;
        scene.add(sun);
    } else {
        const sun = new THREE.DirectionalLight(sunColor, sunIntensity);
        sun.position.set(10, 20, 10);
        sun.castShadow = false;
        scene.add(sun);
    }

    scene.add(new THREE.AmbientLight(ambientColor, ambientIntensity));

    // На мобильном — только 2 атмосферных света
    const lights = IS_MOBILE ? atmosphericLights.slice(0, 2) : atmosphericLights;
    for (const L of lights) {
        const light = new THREE.PointLight(L.color, L.intensity, 30);
        light.position.set(L.pos[0], L.pos[1], L.pos[2]);
        scene.add(light);
    }

    createFloor();
    setupPostProcessing();

    window.addEventListener('resize', onWindowResize, false);
    window.addEventListener('orientationchange', onWindowResize, false);
}

function setupPostProcessing() {
    if (IS_MOBILE) {
        composer = null;
        return;
    }
    if (typeof THREE.EffectComposer === 'undefined' || typeof THREE.UnrealBloomPass === 'undefined') {
        console.warn('[Bloom] Post-processing скрипты не загружены.');
        return;
    }
    try {
        composer = new THREE.EffectComposer(renderer);
        composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        composer.addPass(new THREE.RenderPass(scene, camera));
        bloomPass = new THREE.UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            0.7, 0.5, 0.85
        );
        composer.addPass(bloomPass);
    } catch (e) {
        console.warn('[Bloom] Ошибка:', e);
        composer = null;
    }
}

// ─── КАМЕРА + ДИНАМИЧЕСКИЙ ТУМАН ───
// Раньше туман был фиксированный (70–200м), из-за чего на узких экранах
// (iPad 4:3, планшеты в портрете) камера отъезжает далеко и всё утопает в дымке.
// Теперь туман масштабируется пропорционально дистанции камеры.
function fitCameraToField() {
    const W = window.innerWidth, H = window.innerHeight;
    const padding = 0.98;
    const hud = document.getElementById('hud');
    const dock = document.getElementById('shop-dock');
    const topInset = hud ? hud.getBoundingClientRect().bottom + 10 : 16;
    const bottomInset = dock ? H - dock.getBoundingClientRect().top + 18 : 16;
    const usableHeight = Math.max(H * 0.35, H - topInset - bottomInset);
    const tanHalfFov = Math.tan(THREE.MathUtils.degToRad(CAMERA_FOV) / 2);
    const tanEffX = tanHalfFov * (W / H);
    const tanEffY = tanHalfFov * usableHeight / H;
    const forward = new THREE.Vector3(0, -Math.cos(CAMERA_TILT), -Math.sin(CAMERA_TILT)).normalize();
    const right = new THREE.Vector3(1, 0, 0);
    const screenUp = new THREE.Vector3().crossVectors(right, forward).normalize();
    const corners = [];
    for (const sx of [-PLAY_W/2, PLAY_W/2])
        for (const sz of [-PLAY_D/2, PLAY_D/2])
            for (const sy of [0, PLAY_TOP_Y])
                corners.push(new THREE.Vector3(sx, sy, sz));
    // Include every playable spot: Ice extends beyond the nominal floor bounds.
    if (currentMap) {
        for (const p of [...currentMap.waypoints, ...currentMap.towerSpots]) {
            corners.push(new THREE.Vector3(p.x, PLAY_TOP_Y, p.z));
        }
        for (const p of [currentMap.waypoints[0], currentMap.waypoints[currentMap.waypoints.length - 1]]) {
            corners.push(new THREE.Vector3(p.x, 18, p.z));
        }
    }
    let maxDist = 0;
    for (const c of corners) {
        const z = c.dot(forward), x = c.dot(right), y = c.dot(screenUp);
        maxDist = Math.max(maxDist, Math.abs(x) / tanEffX - z, Math.abs(y) / tanEffY - z);
    }
    const dist = Math.max(20, maxDist) / padding;

    // ─── ДИНАМИЧЕСКИЙ ТУМАН ───
    // Пропорционален дистанции камеры. На ПК (16:9) даёт ~70/200 (как раньше),
    // на iPad (4:3) отъезжает дальше, чтобы карта не утопала.
    if (scene && scene.fog) {
        scene.fog.near = Math.max(50, dist * 0.8);
        scene.fog.far  = Math.max(180, dist * 2.3);
    }

    // Centre the battlefield in the space between navigation and the shop.
    camera.setViewOffset(W, H, 0, (bottomInset - topInset) / 2, W, H);
    camera.position.copy(forward).multiplyScalar(-dist);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    if (typeof updateBaseHealthPosition === 'function') updateBaseHealthPosition();
    if (typeof scheduleTowerPanelPosition === 'function') scheduleTowerPanelPosition();
}

function createFloor() {
    const isHell = currentMap && currentMap.id === 'hell';
    const isIce  = currentMap && currentMap.id === 'ice';

    try {
        if (isHell) {
            const lavaTex = new THREE.CanvasTexture((() => {
                const c = document.createElement('canvas'); c.width = c.height = 512;
                const cx = c.getContext('2d');
                const grd = cx.createRadialGradient(256, 256, 20, 256, 256, 400);
                grd.addColorStop(0, '#aa4a08'); grd.addColorStop(0.5, '#5a1400'); grd.addColorStop(1, '#1a0300');
                cx.fillStyle = grd; cx.fillRect(0, 0, 512, 512);
                for (let i = 0; i < 30; i++) {
                    cx.fillStyle = `rgba(180, ${80+Math.floor(Math.random()*50)}, 20, ${0.25+Math.random()*0.25})`;
                    cx.beginPath(); cx.arc(Math.random()*512, Math.random()*512, 5+Math.random()*18, 0, Math.PI*2); cx.fill();
                }
                return c;
            })());
            const lavaSea = new THREE.Mesh(
                new THREE.PlaneGeometry(FLOOR_SIZE, FLOOR_SIZE),
                new THREE.MeshStandardMaterial({
                    map: lavaTex, emissive: 0x661800, emissiveIntensity: 0.2,
                    roughness: 0.75, metalness: 0.2
                })
            );
            lavaSea.rotation.x = -Math.PI / 2;
            lavaSea.position.y = -5.0;
            scene.add(lavaSea);

            let plateauTex = null;
            if (typeof createHellTexture === 'function') {
                try { plateauTex = createHellTexture(2048); } catch(e) { console.warn(e); }
            }
            if (!plateauTex && typeof createFantasyTexture === 'function') {
                try { plateauTex = createFantasyTexture(2048); } catch(e) { console.warn(e); }
            }
            const matOpts = { roughness: 0.96, metalness: 0.25, emissive: new THREE.Color(0x100504), emissiveIntensity: 0.08 };
            if (plateauTex) matOpts.map = plateauTex;
            else matOpts.color = 0x0e0606;

            const plateau = new THREE.Mesh(new THREE.PlaneGeometry(500, 500), new THREE.MeshStandardMaterial(matOpts));
            plateau.rotation.x = -Math.PI / 2;
            plateau.position.y = 0;
            plateau.receiveShadow = !IS_MOBILE;
            scene.add(plateau);
        } else if (isIce) {
            let iceTex = null;
            if (typeof createIceTexture === 'function') {
                try { iceTex = createIceTexture(2048); } catch(e) { console.warn(e); }
            }
            const matOpts = {
                roughness: 0.55, metalness: 0.25,
                emissive: new THREE.Color(0x0a1525), emissiveIntensity: 0.15
            };
            if (iceTex) matOpts.map = iceTex;
            else matOpts.color = 0xb8cee5;

            const floor = new THREE.Mesh(
                new THREE.PlaneGeometry(FLOOR_SIZE, FLOOR_SIZE),
                new THREE.MeshStandardMaterial(matOpts)
            );
            floor.rotation.x = -Math.PI / 2;
            floor.receiveShadow = !IS_MOBILE;
            scene.add(floor);
        } else {
            const texture = createFantasyTexture(2048);
            const floor = new THREE.Mesh(
                new THREE.PlaneGeometry(FLOOR_SIZE, FLOOR_SIZE),
                new THREE.MeshStandardMaterial({
                    map: texture, roughness: 0.92, metalness: 0.08,
                    emissive: new THREE.Color(0x08040e), emissiveIntensity: 0.1
                })
            );
            floor.rotation.x = -Math.PI / 2;
            floor.receiveShadow = !IS_MOBILE;
            scene.add(floor);
        }
    } catch(e) {
        console.warn('createFloor fallback:', e);
        const c = isHell ? 0x0e0403 : isIce ? 0x8aa0c0 : 0x04020a;
        const floor = new THREE.Mesh(new THREE.PlaneGeometry(FLOOR_SIZE, FLOOR_SIZE),
            new THREE.MeshStandardMaterial({ color: c, roughness: 0.95 }));
        floor.rotation.x = -Math.PI / 2;
        scene.add(floor);
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    if (composer) composer.setSize(window.innerWidth, window.innerHeight);
    fitCameraToField();
}

function animate() {
    requestAnimationFrame(animate);
    try {
        const rawDelta = Math.min(clock.getDelta(), 0.1);
        let gameDelta = 0;
        if (!GameState.paused && GameState.phase !== 'win' && GameState.phase !== 'lose') {
            gameDelta = rawDelta * GameState.speedMultiplier * BASE_TIME_SCALE;
            GameState.gameTime += gameDelta;
        }
        if (typeof updatePath === 'function') updatePath(gameDelta, GameState.gameTime);
        if (typeof updateTowerSpots === 'function') updateTowerSpots(gameDelta, GameState.gameTime);
        if (typeof updateDecor === 'function') updateDecor(rawDelta);
        if (gameDelta > 0) {
            if (typeof updateWave === 'function') updateWave(gameDelta);
            if (typeof updateEnemies === 'function') updateEnemies(gameDelta);
            if (typeof updateTowersCombat === 'function') updateTowersCombat(gameDelta);
            if (typeof refreshHUD === 'function') refreshHUD();
        } else {
            if (typeof updateEffects === 'function') updateEffects(0);
        }
        if (composer) composer.render();
        else renderer.render(scene, camera);
    } catch(e) {
        console.error('[ANIMATE]', e);
        try { renderer.render(scene, camera); } catch(_) {}
    }
}

// ═══════════════════════════════════════════
// СТАРТ ИГРЫ
// ═══════════════════════════════════════════
function startGame(mapId) {
    try {
        mapId = mapId || 'hell';

        if (typeof THREE === 'undefined') throw new Error('Three.js не загрузился.');
        if (typeof setCurrentMap !== 'function') throw new Error('maps.js не загружен.');
        if (typeof createPath !== 'function') throw new Error('path.js не загружен.');
        if (typeof createTowerSpots !== 'function') throw new Error('grid.js не загружен.');
        if (typeof initHUD !== 'function') throw new Error('ui-hud.js не загружен.');
        if (typeof initShop !== 'function') throw new Error('ui-shop.js не загружен.');
        if (typeof GameState === 'undefined') throw new Error('state.js не загружен.');

        if (typeof initAudio === 'function') initAudio();
        if (typeof loadProgress === 'function') {
            const progress = loadProgress();
            if (typeof setAudioEnabled === 'function') setAudioEnabled(progress.audioEnabled !== false);
        }

        const map = setCurrentMap(mapId);
        GameState.totalWaves = map.totalWaves;
        GameState.prepTimer = GameState.prepDuration;

        const diffKey = 'difficulty_' + map.id;
        const savedDiff = localStorage.getItem(diffKey);
        const hasSavedDiff = savedDiff && DIFFICULTY_PRESETS[savedDiff];

        if (hasSavedDiff) {
            const preset = DIFFICULTY_PRESETS[savedDiff];
            GameState.difficultyKey = savedDiff;
            GameState.difficulty = preset;
            GameState.maxHp = preset.hp;
            GameState.hp = preset.hp;
            GameState.coins = preset.coins;
        }

        initEngine();
        createPath(map);
        createTowerSpots(map);
        if (typeof createDecor === 'function') {
            try { createDecor(map.waypoints, map.towerSpots); }
            catch(e) { console.warn('createDecor failed:', e); }
        }
        initHUD();
        initShop();
        initTowerPanel();
        initRules();
        initMaps();
        initInput();
        fitCameraToField();  // ← динамический туман применяется здесь
        _updateDifficultyButton();

        const modal = _diffModalEl();
        if (modal) {
            modal.querySelectorAll('.difficulty-card').forEach(card => {
                card.addEventListener('click', () => _pickDifficulty(card.dataset.diff));
            });
            modal.addEventListener('click', (e) => {
                if (e.target === modal && !_diffForceSelect) closeDifficultyModal(true);
            });
        }

        document.addEventListener('keydown', (e) => {
            if (e.key !== 'Escape') return;
            const m = _diffModalEl();
            if (!m || m.classList.contains('hidden')) return;
            if (_diffForceSelect) return;
            closeDifficultyModal(true);
        });

        const cancelBtn = _diffCancelEl();
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => closeDifficultyModal(true));
        }

        const diffBtn = _diffBtnEl();
        if (diffBtn) {
            diffBtn.addEventListener('click', () => {
                if (typeof exitBuildMode === 'function') exitBuildMode();
                if (typeof deselectTower === 'function') deselectTower();
                openDifficultyModal(false);
            });
        }

        if (!hasSavedDiff) {
            openDifficultyModal(true);
        }

        animate();
    } catch(e) {
        showFatalError(e);
    }
}

// ═══════════════════════════════════════════
// АВТОЗАПУСК
// ═══════════════════════════════════════════
window.addEventListener('DOMContentLoaded', () => {
    const mapId = document.body.dataset.map || 'hell';
    startGame(mapId);
});
