// ui-shop.js — карточки магазина внизу (с 3D-иконками)

function initShop() {
    const shop = document.getElementById('shop');
    shop.innerHTML = '';

    for (const typeId of AVAILABLE_TOWERS) {
        const data = TOWERS_DATA[typeId];
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'shop-card';
        card.setAttribute('aria-pressed', 'false');
        card.dataset.typeId = typeId;

        const stats = getTowerStatsForLevel(typeId, 1);
        const dmgLabel = stats.damage > 0
            ? `Урон: ${Math.round(stats.damage)}`
            : (stats.buffPercent ? `+${stats.buffPercent}% урона` : '—');
        const rangeLabel = `Дальн.: ${stats.range.toFixed(1)}м`;
        const iconUrl = generateTowerIcon(typeId, 1);
        card.setAttribute('aria-label', `${data.name}, ${data.baseCost} монет. ${dmgLabel}. ${rangeLabel}`);

        card.innerHTML = `
            <img class="shop-icon" src="${iconUrl}" alt="">
            <span class="shop-name">${data.name}</span>
            <span class="shop-cost">${data.baseCost}</span>
            <span class="shop-details">${dmgLabel}<br>${rangeLabel}</span>
        `;

        card.addEventListener('click', () => {
            if (GameState.coins < data.baseCost) return;
            if (buildingType === typeId) {
                exitBuildMode();
            } else {
                enterBuildMode(typeId);
            }
        });

        shop.appendChild(card);
    }

    subscribeState(refreshShop);
    refreshShop();
}

function refreshShop() {
    const shop = document.getElementById('shop');
    for (const card of shop.querySelectorAll('.shop-card')) {
        const typeId = card.dataset.typeId;
        const cost = TOWERS_DATA[typeId].baseCost;
        const canAfford = GameState.coins >= cost;
        card.disabled = !canAfford;
        card.classList.toggle('selected', buildingType === typeId);
        card.setAttribute('aria-pressed', String(buildingType === typeId));
    }
}