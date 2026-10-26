let towerSpotsGroup = null;
const towerSpots = [];

function createTowerSpots(mapData) {
    if (towerSpotsGroup) scene.remove(towerSpotsGroup);
    towerSpotsGroup = new THREE.Group();
    towerSpots.length = 0;

    const spotRadius = 1.0;
    const spotGeo = new THREE.CircleGeometry(spotRadius, 32);
    const ringGeo = new THREE.RingGeometry(spotRadius * 0.94, spotRadius * 1.06, 40);

    for (const pos of mapData.towerSpots) {
        const material = new THREE.MeshBasicMaterial({
            color: 0x00ee44, transparent: true, opacity: 0.55,
            side: THREE.DoubleSide, depthWrite: false
        });
        const mesh = new THREE.Mesh(spotGeo, material);
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.copy(pos);
        mesh.position.y = 0.16;
        mesh.visible = false;
        mesh.userData.isTowerSpot = true;
        towerSpotsGroup.add(mesh);

        const ringMat = new THREE.MeshBasicMaterial({
            color: 0x44ff66, transparent: true, opacity: 0.75,
            side: THREE.DoubleSide, depthWrite: false
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = -Math.PI / 2;
        ring.position.copy(pos);
        ring.position.y = 0.17;
        ring.visible = false;
        towerSpotsGroup.add(ring);

        towerSpots.push({
            position: pos.clone(),
            mesh, ring,
            material, ringMat,
            occupied: false, tower: null, highlight: false,
            restrictedTo: pos.restrictedTo || null
        });
    }
    scene.add(towerSpotsGroup);
}

function updateTowerSpots(dt, elapsed) {
    const t = elapsed || 0;
    const pulse = 0.5 + Math.sin(t * 3.0) * 0.5;
    for (const spot of towerSpots) {
        const shouldShow = spot.highlight && !spot.occupied;
        spot.mesh.visible = shouldShow;
        if (spot.ring) spot.ring.visible = shouldShow;
        if (shouldShow) {
            spot.material.opacity = 0.35 + pulse * 0.35;
            if (spot.ringMat) spot.ringMat.opacity = 0.55 + pulse * 0.35;
        }
    }
}

function setTowerSpotsHighlight(on, currentBuildType) {
    for (const spot of towerSpots) {
        if (on && !spot.occupied) {
            if (spot.restrictedTo) {
                spot.highlight = (spot.restrictedTo === currentBuildType);
            } else {
                spot.highlight = (currentBuildType !== 'sniper');
            }
        } else {
            spot.highlight = false;
        }
    }
}

function findTowerSpotByMesh(mesh) {
    for (const spot of towerSpots) if (spot.mesh === mesh) return spot;
    return null;
}