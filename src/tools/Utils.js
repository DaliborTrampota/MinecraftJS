import { BoxGeometry, Mesh, BoxHelper, MeshBasicMaterial, Vector3 } from 'https://cdn.skypack.dev/three@0.129.0';

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

function createEnum(arr, reversed = false){
    let enumObj = {};
    for(let i = 0; i < arr.length; ++i){
        if(reversed) enumObj[i] = arr[i];
        else enumObj[arr[i]] = i;
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


function drawBlock(pos, scene){
    const geometry = new BoxGeometry( 1, 1, 1 );
    geometry.translate( 0.5, 0.5, 0.5 );
    const cube = new Mesh( geometry, new MeshBasicMaterial( 0xff0000 ) );
    cube.position.copy(pos.floor())
    const box = new BoxHelper( cube, 0xffff00 );
    scene.add( box );
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

function moveTowards2(current, target, maxDistanceDelta) {
    let a = target.sub(current)
    let magnitude = a.length()

    if (magnitude <= maxDistanceDelta || magnitude == 0) {
        return target;
    }
    
    return current.add(a.divideScalar(magnitude).multiplyScalar(maxDistanceDelta))
}

function deltaAngle(target, current){
    let delta = repeat((target - current), 360);
    if (delta > 180)
        delta -= 360
    return delta;
}

function  repeat(t, length) {
    return clamp(t - Math.floor(t / length) * length, 0, length);
}

export {
    create3DArray,
    create2DArray,
    createEnum,

    drawBlock,

    clamp,
    moveTowards,
    deltaAngle,
    
    TwoWayMap
}
