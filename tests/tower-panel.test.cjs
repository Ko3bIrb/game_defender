// Run with: node tests/tower-panel.test.cjs
// Geometry and event tests; browser rendering and real touch still require QA.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const source = file => fs.readFileSync(root + '/' + file, 'utf8');
let checks = 0;
function check(condition, message) {
    checks++;
    if (!condition) throw new Error(message);
}
function evaluate(code, globals, exports) {
    return new Function(...Object.keys(globals), code + '\nreturn {' + exports + '};')(...Object.values(globals));
}
class Vector3 {
    constructor(x = 0, y = 0, z = 0) { Object.assign(this, { x, y, z }); }
    distanceTo(p) { return Math.hypot(this.x - p.x, this.y - p.y, this.z - p.z); }
    clone() { return new Vector3(this.x, this.y, this.z); }
    project(camera) { Object.assign(this, camera.project(this)); return this; }
}
class Vector2 { constructor(x = 0, y = 0) { Object.assign(this, { x, y }); } }
const THREE = { Vector3, Vector2, Raycaster: class {}, Plane: class {} };
const files = ['js/game/ui-tower-panel.js', 'js/game/input.js', 'js/core/engine.js'];
for (const file of files) { new Function(source(file)); check(true, file + ' parses'); }

const panelSource = source(files[0]);
const inputSource = source(files[1]);
const place = evaluate(panelSource, {}, 'getTowerPanelPlacement').getTowerPanelPlacement;
for (const [w, top, bottom] of [[1440,70,790],[844,62,306],[568,62,236],[390,110,720],[320,130,440]]) {
    const bounds = { left: 8, right: w - 8, top, bottom };
    for (const x of [8,20,w/4,w/2,w-20,w-8]) for (const y of [top,top+5,(top+bottom)/2,bottom-5,bottom]) {
        const width = Math.min(224, w - 16);
        const sideRoom = Math.max(x - 8, w - 8 - x) - 24;
        const height = Math.min(190, sideRoom < width ? Math.min(bottom-top, Math.max(126, Math.max(y-top,bottom-y)-24)) : bottom-top);
        const p = place({x,y}, {width,height}, bounds);
        check(p.x >= 8 && p.x + width <= w - 8 + 0.01 && p.y >= top && p.y + height <= bottom + 0.01, 'Panel stays within bounds');
        check(!(x > p.x-18 && x < p.x+width+18 && y > p.y-18 && y < p.y+height+18), 'Selected tower remains visible');
    }
}

// Exercise the actual positioning function using both maps' generated spots.
// Projection is a controlled fixture; this does not test WebGL/camera rendering.
let mapCases = 0;
for (const mapId of ['hell', 'ice']) {
    const maps = evaluate(source('js/world/' + (mapId === 'hell' ? 'Hell' : 'Ice') + '/maps.js'), {THREE}, 'MAPS').MAPS;
    check(maps[mapId].towerSpots.length === (mapId === 'hell' ? 25 : 19), 'Expected map spots');
    for (const [w,h,hudBottom,dockTop] of [[1440,900,62,798],[844,390,54,314],[568,320,54,244],[390,844,102,728]]) {
        const style = {};
        const panel = {
            style,
            getBoundingClientRect: () => ({
                width: parseFloat(style.width),
                height: Math.min(190, parseFloat(style.maxHeight))
            })
        };
        const rect = (left,top,right,bottom) => ({left,top,right,bottom,width:right-left,height:bottom-top});
        const elements = {
            'tower-panel': panel,
            'tower-panel-bounds': {getBoundingClientRect: () => rect(8,8,w-8,h-8)},
            hud: {getBoundingClientRect: () => rect(18,16,w-18,hudBottom)},
            'shop-dock': {getBoundingClientRect: () => rect(10,dockTop,w-10,h-8)}
        };
        const camera = {project: v => ({x: v.x / 60, y: -v.z / 60, z: 0})};
        const api = evaluate(panelSource, {
            camera, renderer: {domElement: {getBoundingClientRect: () => rect(0,0,w,h)}},
            document: {getElementById: id => elements[id]},
            window: {innerWidth:w, innerHeight:h, visualViewport: {offsetLeft:0,offsetTop:0,width:w,height:h}},
            updateRangeCircle() {}, TOWERS_DATA: {}, GameState: {}
        }, 'updateTowerPanelPosition,setSelection: tower => selectedTower = tower');
        for (const position of maps[mapId].towerSpots) {
            api.setSelection({position});
            api.updateTowerPanelPosition();
            const size = panel.getBoundingClientRect(), left = parseFloat(style.left), top = parseFloat(style.top);
            check(left >= 7.5 && left + size.width <= w - 7.5, 'Map panel fits width');
            check(top >= hudBottom + 7.5 && top + size.height <= dockTop - 7.5, 'Map panel avoids HUD and purchase dock');
            mapCases++;
        }
    }
}

// Call the real gesture handlers: touch and mouse on any viewport/device.
let now = 0, clicks = 0, overCanvas = true;
const canvas = {setPointerCapture() {}};
const gestures = evaluate(inputSource, {
    THREE, renderer:{domElement:canvas}, buildingType:null,
    performance:{now:()=>now},
    document:{elementFromPoint:()=>overCanvas ? canvas : {}}
}, 'onCanvasPointerDown,onCanvasPointerMove,onCanvasPointerUp,cancelCanvasPointer,setClick:fn=>onCanvasClick=fn');
gestures.setClick(() => clicks++);
const event = (extra = {}) => ({button:0,isPrimary:true,pointerId:1,pointerType:'touch',clientX:100,clientY:100,...extra});
function gesture(actions, expected, message) {
    const before = clicks;
    for (const [handler, extra] of actions) gestures[handler](event(extra));
    check(clicks - before === expected, message);
}
gesture([['onCanvasPointerDown'],['onCanvasPointerUp']],1,'Touch tap activates once');
gesture([['onCanvasPointerDown'],['onCanvasPointerMove',{clientX:130}],['onCanvasPointerUp',{clientX:130}]],0,'Swipe does not activate');
gesture([['onCanvasPointerDown'],['onCanvasPointerUp',{clientX:130}]],0,'Large final displacement does not activate');
gesture([['onCanvasPointerDown'],['cancelCanvasPointer'],['onCanvasPointerUp']],0,'Cancelled touch does not activate');
gesture([['onCanvasPointerDown'],['onCanvasPointerDown',{pointerId:2,isPrimary:false}],['onCanvasPointerUp']],0,'Multitouch does not activate');
overCanvas = false;
gesture([['onCanvasPointerDown'],['onCanvasPointerUp']],0,'Ending over a panel does not activate canvas');
overCanvas = true;
gestures.onCanvasPointerDown(event()); now += 600;
const beforeHold = clicks; gestures.onCanvasPointerUp(event());
check(clicks === beforeHold, 'Long touch does not activate');
gesture([['onCanvasPointerDown',{pointerType:'mouse'}],['onCanvasPointerUp',{pointerType:'mouse'}]],1,'Mouse works after touch');
gesture([['onCanvasPointerDown',{button:2}],['onCanvasPointerUp',{button:2}]],0,'Secondary mouse button ignored');
// State refreshes must preserve buttons during a press, and handlers must use
// the current selection rather than a tower captured before switching.
let markupWrites = 0, subscriber, upgradedTower, soldTower;
const elements = {};
for (const key of ['.tp-title','.tp-stars','.tp-stats','.tp-close','#tp-upgrade','#tp-sell']) {
    elements[key] = {addEventListener(type, fn) { this[type] = fn; }};
}
const panel = {
    classList:{add(){},remove(){}}, setAttribute(){}, contains(){return false;},
    querySelector:key=>elements[key],
    set innerHTML(value){markupWrites++;}
};
const state = {coins:100};
const api = evaluate(panelSource, {
    document:{
        getElementById:id=>id === 'tower-panel' ? panel : null,
        createElement:()=>({setAttribute(){}}), body:{appendChild(){}}
    },
    window:{addEventListener(){}}, ResizeObserver:class{observe(){}},
    subscribeState:fn=>subscriber=fn, updateRangeCircle(){},
    TOWERS_DATA:{basic:{name:'Башня'}}, GameState:state,
    getUpgradeCost:(type,level)=>level<3?50:null, getTowerTotalValue:()=>100,
    upgradeTower:t=>upgradedTower=t, sellTower:t=>soldTower=t
}, 'initTowerPanel,selectTower,deselectTower');
api.initTowerPanel();
const makeTower = level=>({type:'basic',level,stats:{damage:10,fireRate:1,range:10}});
const first = makeTower(1), second = makeTower(2);
api.selectTower(first);
const button = elements['#tp-upgrade'];
state.coins = 20; subscriber();
check(button.disabled, 'Unaffordable upgrade disabled');
state.coins = 200; subscriber();
check(!button.disabled, 'Upgrade enabled when coins arrive');
check(markupWrites === 1, 'Coin updates do not replace pressed buttons');
api.selectTower(second); button.click();
check(upgradedTower === second, 'Upgrade targets current selection');
elements['#tp-sell'].click();
check(soldTower === second, 'Sell targets current selection');
api.selectTower(makeTower(3));
check(button.disabled && button.textContent === 'Макс. уровень', 'Max level state');
api.deselectTower(); soldTower = null; elements['#tp-sell'].click();
check(soldTower === null, 'No stale sell after deselection');

console.log('Passed ' + checks + ' checks; ' + mapCases + ' map-position fixtures; touch/mouse gesture coverage.');
