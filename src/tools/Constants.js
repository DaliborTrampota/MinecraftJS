import { Vector3 } from 'https://cdn.skypack.dev/three@0.141.0';

const PI_2 = Math.PI / 2;
const vertices = [
    new Vector3(0, 0, 0),
    new Vector3(1, 0, 0),
    new Vector3(1, 1, 0),
    new Vector3(0, 1, 0),
    new Vector3(0, 1, 1),
    new Vector3(1, 1, 1),
    new Vector3(1, 0, 1),
    new Vector3(0, 0, 1)
]
const triangles = {
    front: [
        5, 4, 7,
        5, 7, 6
    ],
    back: [
        0, 2, 1,
        0, 3, 2
    ],
    top: [
        2, 3, 4,
        2, 4, 5
    ],
    bottom: [
        0, 6, 7,
        0, 1, 6
    ],
    right: [
        1, 2, 5,
        1, 5, 6
    ],
    left: [
        0, 7, 4,
        0, 4, 3
    ]
}

const UVs = {
    front: [
        1, 1,
        0, 1,
        0, 0,
    
        1, 1,
        0, 0,
        1, 0
    ],
    back: [
        1, 0,
        0, 1, 
        0, 0,
    
        1, 0, 
        1, 1, 
        0, 1
    ],
    top: [
        1, 1,
        0, 1,
        0, 0,
    
        1, 1,
        0, 0,
        1, 0
    ],
    bottom: [
        1, 1,
        0, 0,
        1, 0,
    
        1, 1,
        0, 1,
        0, 0
    ],
    right: [
        1, 0,
        1, 1,
        0, 1,
    
        1, 0,
        0, 1,
        0, 0
    ],
    left: [
        0, 0,
        1, 0,
        1, 1,
    
        0, 0,
        1, 1,
        0, 1
    ]
}

const ChunkSize = 16
const ChunkHeight = 128
const WorldSizeInChunks = 1000;
const WorldSize = ChunkSize * WorldSizeInChunks;
const HalfWorldSize = Math.floor(WorldSizeInChunks / 2);

const sides = [
    { side: 'front',    dir: new Vector3( 0,  0,  1) },
    { side: 'back',     dir: new Vector3( 0,  0, -1) },
    { side: 'top',      dir: new Vector3( 0,  1,  0) },
    { side: 'bottom',   dir: new Vector3( 0, -1,  0) },
    { side: 'right',    dir: new Vector3( 1,  0,  0) },
    { side: 'left',     dir: new Vector3(-1,  0,  0) },
]

const CrossCheck = [ 
    new Vector3(1, 0, 0),
    new Vector3(0, 0, 1),
    new Vector3(-1, 0, 0),
    new Vector3(0, 0, -1)
]

const CornerCheck = [ 
    new Vector3(1, 0, 1),
    new Vector3(1, 0, -1),
    new Vector3(-1, 0, -1),
    new Vector3(-1, 0, 1),
]

const GAMEMODE = {
    SURVIVAL: 0,
    CREATIVE:  1
}

const BASE_PLAYER_SETTINGS = {
    viewDistance: 5,
    health: 100,
    acceleration: 60,
    jump: 1,
    speed: 5,
    sprintMultiplier: 1.5,
    throwSpeed: 6
}

const PLAYER_DIMENSIONS = {
    height: 2,
    width: 0.4,
    depth: 0.2,
    cameraOffset: 0.25
}

const WORLD_SETTINGS = {
    globalSeaLevel: 12
}

const GAME_SETTINGS = {
    maxItems: 64
}

const RIGHT = new Vector3(1, 0, 0)
const UP = new Vector3(0, 1, 0)
const FORWARD = new Vector3(0, 0, -1)
const ZERO = new Vector3(0, 0, 0)

const MATERIAL = {
    AIR: 0,
    SOLID: 1,
    LIQUID: 2
}

export {
    sides,
    PI_2,
    vertices, 
    triangles,
    UVs,

    ChunkSize,
    ChunkHeight,
    WorldSizeInChunks,
    HalfWorldSize,
    WorldSize,

    CrossCheck,
    CornerCheck,

    GAMEMODE,
    BASE_PLAYER_SETTINGS,
    PLAYER_DIMENSIONS,
    WORLD_SETTINGS,
    GAME_SETTINGS,

    RIGHT,
    UP,
    FORWARD,
    ZERO,

    MATERIAL
}