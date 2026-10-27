const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
let references = 0;
for (const file of ['index.html', 'html/game/game-hell.html', 'html/game/game-ice.html']) {
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    for (const match of html.matchAll(/<(?:script|link)\b[^>]*(?:src|href)="([^"]+)"/g)) {
        const url = match[1];
        if (url.startsWith('data:')) continue;
        assert(!/^(?:https?:)?\/\//.test(url), `${file} requires an external asset: ${url}`);
        assert(fs.existsSync(path.resolve(root, path.dirname(file), url)), `${file} is missing ${url}`);
        references++;
    }
}
const vendor = path.join(root, 'vendor/three-r128');
const manifest = JSON.parse(fs.readFileSync(path.join(vendor, 'manifest.json')));
assert.equal(manifest.version, '0.128.0');
assert.equal(Object.keys(manifest.files).length, 7);
assert(fs.readFileSync(path.join(vendor, 'LICENSE'), 'utf8').includes('MIT License'));
for (const [file, metadata] of Object.entries(manifest.files)) {
    const digest = crypto.createHash('sha256').update(fs.readFileSync(path.join(vendor, file))).digest('hex');
    assert.equal(digest, metadata.sha256, `${file} differs from its pinned original`);
}
console.log(`Passed: ${references} local asset references, seven pinned Three.js files and license.`);
