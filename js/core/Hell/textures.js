// textures.js — процедурная текстура «земли демонов»: базальт, лава, пепел, багровое свечение

function _mulberry32(seed) {
    return function() {
        let t = seed += 0x6D2B79F5;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function createFantasyTexture(size = 2048) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const rand = _mulberry32(66613);

    // 1) База — раскалённая багровая земля
    const bg = ctx.createRadialGradient(size/2, size/2, size*0.05, size/2, size/2, size*0.85);
    bg.addColorStop(0, '#2a0f0a');
    bg.addColorStop(0.45, '#1a0805');
    bg.addColorStop(1, '#080302');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, size, size);

    // 2) Базальтовые плиты — крупные тёмные пятна с обугленными краями
    for (let i = 0; i < 220; i++) {
        const x = rand() * size, y = rand() * size;
        const r = 30 + rand() * 120;
        const grd = ctx.createRadialGradient(x, y, 0, x, y, r);
        const shade = 8 + Math.floor(rand() * 14);
        grd.addColorStop(0, `rgba(${shade + 8}, ${shade}, ${shade - 2}, 0.55)`);
        grd.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    // 3) Тёмные трещины-разломы (обугленные)
    for (let i = 0; i < 90; i++) {
        const x = rand() * size, y = rand() * size;
        ctx.save();
        ctx.strokeStyle = 'rgba(0,0,0,0.85)';
        ctx.lineWidth = 1 + rand() * 2.5;
        ctx.beginPath();
        ctx.moveTo(x, y);
        let cx = x, cy = y;
        const segs = 3 + Math.floor(rand() * 4);
        for (let k = 0; k < segs; k++) {
            cx += (rand() - 0.5) * 100;
            cy += (rand() - 0.5) * 100;
            ctx.lineTo(cx, cy);
        }
        ctx.stroke();
        ctx.restore();
    }

    // 4) Лавовые трещины — светящиеся оранжевые/красные линии
    for (let i = 0; i < 45; i++) {
        const x = rand() * size, y = rand() * size;
        ctx.save();
        ctx.lineCap = 'round';
        ctx.shadowColor = 'rgba(255, 90, 20, 0.95)';
        ctx.shadowBlur = 14 + rand() * 10;
        ctx.strokeStyle = `rgba(255, ${90 + rand()*60|0}, 20, ${0.6 + rand()*0.35})`;
        ctx.lineWidth = 1.2 + rand() * 1.8;
        ctx.beginPath();
        ctx.moveTo(x, y);
        let cx = x, cy = y;
        const segs = 4 + Math.floor(rand() * 5);
        for (let k = 0; k < segs; k++) {
            cx += (rand() - 0.5) * 140;
            cy += (rand() - 0.5) * 140;
            ctx.lineTo(cx, cy);
        }
        ctx.stroke();

        // слабое свечение вокруг
        ctx.shadowBlur = 0;
        ctx.strokeStyle = `rgba(255, 120, 40, ${0.15 + rand()*0.15})`;
        ctx.lineWidth = 6 + rand() * 6;
        ctx.stroke();
        ctx.restore();
    }

    // 5) Лавовые лужицы (немного)
    for (let i = 0; i < 8; i++) {
        const x = rand() * size, y = rand() * size;
        const r = 12 + rand() * 26;
        const grd = ctx.createRadialGradient(x, y, 0, x, y, r);
        grd.addColorStop(0, 'rgba(255, 200, 80, 0.9)');
        grd.addColorStop(0.5, 'rgba(255, 100, 20, 0.75)');
        grd.addColorStop(1, 'rgba(120, 20, 0, 0)');
        ctx.save();
        ctx.shadowColor = 'rgba(255, 100, 20, 0.9)';
        ctx.shadowBlur = 22;
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.ellipse(x, y, r * (1 + rand()*0.4), r * (0.6 + rand()*0.4), rand()*Math.PI, 0, Math.PI*2);
        ctx.fill();
        ctx.restore();
    }

    // 6) Обугленные камни
    for (let i = 0; i < 60; i++) {
        const x = rand() * size, y = rand() * size;
        const r = 4 + rand() * 14;
        ctx.save();
        ctx.fillStyle = `rgba(${25 + rand()*15|0}, ${18 + rand()*10|0}, ${15 + rand()*10|0}, 0.9)`;
        ctx.beginPath();
        const sides = 5 + Math.floor(rand() * 3);
        for (let s = 0; s < sides; s++) {
            const angle = (s / sides) * Math.PI * 2;
            const rr = r * (0.7 + rand() * 0.5);
            const px = x + Math.cos(angle) * rr;
            const py = y + Math.sin(angle) * rr;
            if (s === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        // подсветка сверху-слева
        ctx.strokeStyle = 'rgba(120, 80, 60, 0.25)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
    }

    // 7) Пепел — мелкая россыпь светлых точек
    for (let i = 0; i < 800; i++) {
        const x = rand() * size, y = rand() * size;
        const r = 0.4 + rand() * 1.4;
        ctx.fillStyle = `rgba(${120 + rand()*70|0}, ${100 + rand()*50|0}, ${90 + rand()*40|0}, ${0.15 + rand()*0.3})`;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    // 8) Тлеющие искры — золотые точки со свечением
    for (let i = 0; i < 90; i++) {
        const x = rand() * size, y = rand() * size;
        ctx.save();
        ctx.shadowColor = 'rgba(255, 180, 60, 0.9)';
        ctx.shadowBlur = 6 + rand() * 6;
        ctx.fillStyle = `rgba(255, ${180 + rand()*50|0}, ${80 + rand()*50|0}, ${0.6 + rand()*0.4})`;
        ctx.beginPath();
        ctx.arc(x, y, 0.8 + rand() * 1.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    // 9) Тёмные вулканические «горы» по углам
    const drawVolcanoCluster = (cx, cy, spread, count) => {
        for (let i = 0; i < count; i++) {
            const angle = rand() * Math.PI * 2;
            const dist = rand() * spread;
            const x = cx + Math.cos(angle) * dist;
            const y = cy + Math.sin(angle) * dist;
            const w = 80 + rand() * 180;
            const h = 50 + rand() * 110;
            ctx.save();
            ctx.fillStyle = `rgba(${18 + rand()*10|0}, ${10 + rand()*8|0}, ${8 + rand()*6|0}, 0.85)`;
            ctx.beginPath();
            ctx.moveTo(x - w/2, y + h/2);
            ctx.lineTo(x + w/2, y + h/2);
            ctx.lineTo(x + (rand()*10 - 5), y - h/2);
            ctx.closePath();
            ctx.fill();
            // раскалённый кратер
            const cg = ctx.createRadialGradient(x, y - h/2 + 6, 0, x, y - h/2 + 6, w*0.15);
            cg.addColorStop(0, 'rgba(255, 120, 40, 0.6)');
            cg.addColorStop(1, 'rgba(255, 60, 0, 0)');
            ctx.fillStyle = cg;
            ctx.beginPath();
            ctx.arc(x, y - h/2 + 6, w*0.15, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    };
    drawVolcanoCluster(size*0.08, size*0.08, size*0.15, 10);
    drawVolcanoCluster(size*0.92, size*0.08, size*0.15, 10);
    drawVolcanoCluster(size*0.08, size*0.92, size*0.15, 10);
    drawVolcanoCluster(size*0.92, size*0.92, size*0.15, 10);

    // 10) Виньетка — края в тень
    const vg = ctx.createRadialGradient(size/2, size/2, size*0.3, size/2, size/2, size*0.78);
    vg.addColorStop(0, 'rgba(8,3,2,0)');
    vg.addColorStop(1, 'rgba(3,1,1,0.95)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, size, size);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.anisotropy = 4;
    return texture;
}