// ui-maps.js — управление окном выбора карты

const MAPS_LIST = [
    {
        id: 'hell', name: 'Последний Бастион', icon: '🔥', difficulty: 'Средняя',
        description: 'Огненные демоны идут из Врат Геенны к Последнему Бастиону. Лава, пепел, обсидиан.',
        url: 'game-hell.html', implemented: true
    },
    {
        id: 'ice', name: 'Ледяной Предел', icon: '❄️', difficulty: 'Средняя',
        description: 'Снежные твари и ледяные колоссы пробираются к Цитадели. Мороз, вьюга, иней.',
        url: 'game-ice.html', implemented: true
    }
];

let _mapsPrevPaused = false;

function initMaps() {
    const btn = document.getElementById('hud-maps');
    const modal = document.getElementById('maps-modal');
    const closeBtn = document.getElementById('maps-close');
    if (!btn || !modal) return;

    btn.addEventListener('click', openMapsModal);
    if (closeBtn) closeBtn.addEventListener('click', closeMapsModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeMapsModal(); });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) closeMapsModal();
    });
}

function openMapsModal() {
    const modal = document.getElementById('maps-modal');
    if (!modal) return;
    if (typeof exitBuildMode === 'function') exitBuildMode();
    if (typeof deselectTower === 'function') deselectTower();

    _mapsPrevPaused = GameState.paused;
    GameState.paused = true;
    if (typeof refreshSpeedButtons === 'function') refreshSpeedButtons();

    renderMapsList();
    modal.classList.remove('hidden');
}

function closeMapsModal() {
    const modal = document.getElementById('maps-modal');
    if (!modal) return;
    modal.classList.add('hidden');
    GameState.paused = _mapsPrevPaused;
    if (typeof refreshSpeedButtons === 'function') refreshSpeedButtons();
}

function renderMapsList() {
    const container = document.getElementById('maps-list');
    if (!container) return;
    container.innerHTML = '';

    // Определяем, на какой карте мы сейчас, по data-map у <body>
    const currentMapId = document.body.dataset.map || 'hell';

    for (const map of MAPS_LIST) {
        const card = document.createElement('div');
        card.className = 'map-card';
        if (map.id === currentMapId) card.classList.add('current');
        if (!map.implemented) card.classList.add('disabled');

        card.innerHTML = `
            <div class="map-icon">${map.icon}</div>
            <div class="map-name">${map.name}</div>
            <div class="map-diff">${map.difficulty}</div>
            <div class="map-desc">${map.description}</div>
        `;

        card.addEventListener('click', () => {
            if (!map.implemented || map.id === currentMapId) {
                closeMapsModal();
                return;
            }
            window.location.href = map.url;   // ← переходим на другой HTML
        });
        container.appendChild(card);
    }
}