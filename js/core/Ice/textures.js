// Ice/textures.js — процедурная текстура «ледяной пустоши»: снег, лёд, трещины

function _mulberry32(seed) {
    return function() {
        let t = seed += 0x6D2B79F5;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function createIceTexture(size = 2048) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const rand = _mulberry32(42424242);

    // 1) База — тёмный ночной лёд
    const bg = ctx.createRadialGradient(size/2, size/2, size*0.05, size/2, size/2, size*0.85);
    bg.addColorStop(0, '#1e2a38');
    bg.addColorStop(0.45, '#0f1620');
    bg.addColorStop(1, '#050810');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, size, size);

    // 2) Крупные пятна наста (светлые)
    for (let i = 0; i < 250; i++) {
        const x = rand() * size, y = rand() * size;
        const r = 40 + rand() * 140;
        const grd = ctx.createRadialGradient(x, y, 0, x, y, r);
        const c = 200 + Math.floor(rand() * 50);
        grd.addColorStop(0, `rgba(${c}, ${c + 20}, ${c + 40}, 0.5)`);
        grd.addColorStop(1, 'rgba(220, 235, 255, 0)');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    // 3) Тёмные пятна льда
    for (let i = 0; i < 120; i++) {
        const x = rand() * size, y = rand() * size;
        const r = 30 + rand() * 100;
        const grd = ctx.createRadialGradient(x, y, 0, x, y, r);
        grd.addColorStop(0, 'rgba(80, 120, 160, 0.35)');
        grd.addColorStop(1, 'rgba(80, 120, 160, 0)');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    // 4) Трещины льда
    for (let i = 0; i < 80; i++) {
        const x = rand() * size, y = rand() * size;
        ctx.save();
        ctx.strokeStyle = `rgba(30, 60, 100, ${0.4 + rand() * 0.4})`;
        ctx.lineWidth = 1 + rand() * 2;
        ctx.beginPath();
        ctx.moveTo(x, y);
        let cx = x, cy = y;
        const segs = 3 + Math.floor(rand() * 5);
        for (let k = 0; k < segs; k++) {
            cx += (rand() - 0.5) * 130;
            cy += (rand() - 0.5) * 130;
            ctx.lineTo(cx, cy);
        }
        ctx.stroke();
        ctx.restore();
    }

    // 5) Светящиеся голубые прожилки
    for (let i = 0; i < 35; i++) {
        const x = rand() * size, y = rand() * size;
        ctx.save();
        ctx.lineCap = 'round';
        ctx.shadowColor = 'rgba(160, 220, 255, 0.9)';
        ctx.shadowBlur = 12 + rand() * 8;
        ctx.strokeStyle = `rgba(${180 + rand()*60|0}, ${220 + rand()*30|0}, 255, ${0.5 + rand()*0.4})`;
        ctx.lineWidth = 1 + rand() * 1.6;
        ctx.beginPath();
        ctx.moveTo(x, y);
        let cx = x, cy = y;
        const segs = 4 + Math.floor(rand() * 4);
        for (let k = 0; k < segs; k++) {
            cx += (rand() - 0.5) * 160;
            cy += (rand() - 0.5) * 160;
            ctx.lineTo(cx, cy);
        }
        ctx.stroke();
        ctx.restore();
    }

    // 6) Снежные кристаллы (мелкие точки)
    for (let i = 0; i < 1200; i++) {
        const x = rand() * size, y = rand() * size;
        const r = 0.4 + rand() * 1.8;
        ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + rand() * 0.5})`;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    // 7) Мерцающие звёздочки-кристаллы
    for (let i = 0; i < 100; i++) {
        const x = rand() * size, y = rand() * size;
        ctx.save();
        ctx.shadowColor = 'rgba(200, 240, 255, 1)';
        ctx.shadowBlur = 8;
        ctx.fillStyle = `rgba(255, 255, 255, ${0.7 + rand() * 0.3})`;
        const s = 2 + rand() * 3;
        ctx.beginPath();
        ctx.moveTo(x - s, y);
        ctx.lineTo(x, y - s);
        ctx.lineTo(x + s, y);
        ctx.lineTo(x, y + s);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    // 8) Виньетка
    const vg = ctx.createRadialGradient(size/2, size/2, size*0.35, size/2, size/2, size*0.8);
    vg.addColorStop(0, 'rgba(20, 40, 70, 0)');
    vg.addColorStop(1, 'rgba(5, 15, 30, 0.85)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, size, size);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.anisotropy = 4;
    return texture;
}