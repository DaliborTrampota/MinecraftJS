import { BoxGeometry, SphereGeometry, Mesh, BoxHelper, MeshBasicMaterial, Vector3 } from 'three';
import { sides } from './Constants.js';

function create3DArray(x, y, height){
    let arr = new Array(x)
    for(let i = 0; i < x; ++i){
        arr[i] = new Array(y)
        for(let j = 0; j < y; ++j){
            arr[i][j] = new Array(height)
        }
    }
    return arr
}

function create2DArray(x, y){
    let arr = new Array(x)
    for(let i = 0; i < x; ++i){
        arr[i] = new Array(y)
    }
    return arr
}

function createEnum(arr){
    let enumObj = {};
    for(let i = 0; i < arr.length; ++i){
        enumObj[i] = arr[i];
        enumObj[arr[i]] = i;
    }

    return enumObj;
}

class TwoWayMap extends Map{
    constructor(iterable){
        super(iterable)
        this.reversed = new Map()
        this.ID = 0
    }

    get(query){
        if(!isNaN(query)) query = Number(query)
        return this.has(query) ? super.get(query) : this.reversed.get(query)
    }

    add(name){
        super.set(name, Number(this.ID))
        this.reversed.set(Number(this.ID), name)
        ++this.ID
    }

    keys(){
        return super.keys()
    }
}


function drawBlock(pos, col = 0xffff00){
    const geometry = new BoxGeometry( 1, 1, 1 );
    geometry.translate( 0.5, 0.5, 0.5 );
    const cube = new Mesh( geometry, new MeshBasicMaterial( 0xff0000 ) );
    cube.position.copy(pos.floor())
    const box = new BoxHelper( cube, col );
    window.scene.add( box );
}

function drawPoint(pos, col = 0xffff00){
    const geometry = new BoxGeometry( 0.1, 0.1, 0.1 );
    geometry.translate( 0.05, 0.05, 0.05 );
    const point = new Mesh( geometry, new MeshBasicMaterial( col ) );
    point.position.copy(pos)
    window.scene.add( point );
}


function clamp(value, min, max){
    return Math.max(min, Math.min(max, value))
}

function moveTowards(current, target, maxDistanceDelta){
    let toVector_x = target.x - current.x;
    let toVector_y = target.y - current.y;
    let toVector_z = target.z - current.z;

    let sqdist = toVector_x * toVector_x + toVector_y * toVector_y + toVector_z * toVector_z;

    if (sqdist == 0 || (maxDistanceDelta >= 0 && sqdist <= maxDistanceDelta * maxDistanceDelta))
        return target;

    var dist = Math.sqrt(sqdist);

    return new Vector3(current.x + toVector_x / dist * maxDistanceDelta,
        current.y + toVector_y / dist * maxDistanceDelta,
        current.z + toVector_z / dist * maxDistanceDelta);
}

function deltaAngle(target, current){
    let delta = repeat((target - current), 360);
    if (delta > 180)
        delta -= 360
    return delta;
}

function repeat(t, length) {
    return clamp(t - Math.floor(t / length) * length, 0, length);
}

const MAP_NAMES = [
    'map',
    'aoMap',
    'emissiveMap',
    'glossinessMap',
    'metalnessMap',
    'normalMap',
    'roughnessMap',
    'specularMap',
];

function dispose(object, disposeTextures = false){
    object.removeFromParent()

    // dispose geometry
    object.traverse((node) => {
        if (!node.isMesh) return;
        node.geometry.dispose();
        console.log('disposing', node)
    });
    
    if(disposeTextures){
        disposeTextures(object)
    }
}

function disposeTextures(object) {
    object.traverse(node => {
        if (!node.isMesh) return;
        const materials = Array.isArray(node.material) ? node.material : [node.material];
        materials.forEach(material => {
            MAP_NAMES.forEach((map) => {
                if(material[map])  {
                    material[map].dispose()
                    console.log('disposing', material[map])
                }
            })
        })
    });
}

function map(value, x1, y1, x2, y2){
    return (value - x1) * (y2 - x2) / (y1 - x1) + x2;
}

function dirToSide(normal){
    return sides.find(side => side.dir.equals(normal)).side
}

class PosMap extends Map {
    constructor(data){
        super(data)
    }

    get(vec3){
        vec3.floor()
        return super.get(`${vec3.x},${vec3.y},${vec3.z}`)
    }

    set(vec3, value){
        vec3.floor()
        return super.set(`${vec3.x},${vec3.y},${vec3.z}`, value)
    }

    has(vec3){
        vec3.floor()
        return super.has(`${vec3.x},${vec3.y},${vec3.z}`)
    }

    delete(vec3){
        vec3.floor()
        return super.delete(`${vec3.x},${vec3.y},${vec3.z}`)
    }
}

export {
    create3DArray,
    create2DArray,
    createEnum,

    drawBlock,
    drawPoint,
    dispose,
    disposeTextures,

    clamp,
    moveTowards,
    deltaAngle,
    map,
    dirToSide,
    
    TwoWayMap,
    PosMap,
}
