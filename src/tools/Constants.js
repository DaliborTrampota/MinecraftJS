import { Vector3 } from 'three';
import { createEnum } from './Utils.js';

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
    north: [
        4, 7, 5,
        6, 5, 7
    ],
    south: [
        0, 3, 1,
        2, 1, 3
    ],
    up: [
        3, 4, 2,
        5, 2, 4
    ],
    down: [
        7, 0, 6,
        1, 6, 0
    ],
    west: [
        5, 6, 2,
        1, 2, 6
    ],
    east: [
        3, 0, 4,
        7, 4, 0
    ]
}

const faceUVs = [
    0, 1,
    0, 0,
    1, 1,
    1, 0,
    1, 1,
    0, 0
]
const faceUVsFlipped = [
    1, 0,
    1, 1,
    0, 0,
    0, 1,
    0, 0,
    1, 1
]
const UVs = {
    north: faceUVs,
    south: faceUVsFlipped,
    up: faceUVs,
    down: faceUVsFlipped,
    west: faceUVs,
    east: faceUVs
}

const sides = [
    { side: 'north',dir: new Vector3( 0,  0,  1) },
    { side: 'south',dir: new Vector3( 0,  0, -1) },
    { side: 'up',   dir: new Vector3( 0,  1,  0) },
    { side: 'down', dir: new Vector3( 0, -1,  0) },
    { side: 'east', dir: new Vector3(-1,  0,  0) },
    { side: 'west', dir: new Vector3( 1,  0,  0) },
]


const Half = createEnum(['Top', 'Bottom'])

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
    CREATIVE:  1,
    SPECTATOR: 2,
}

const MOUSE_BUTTON = {
    LMB: 1,
    WHEEL: 2,
    RMB: 3
}

const BASE_PLAYER_SETTINGS = {
    viewDistance: 5,
    health: 100,
    acceleration: 60,
    jump: 1,
    speed: 5,
    sprintMultiplier: 1.5,
    throwSpeed: 6,
    
    magnetSpeed: 10,
    magnetRadius: 1,
    magnetError: 0.15,
    pickupDelay: 1000,
    placeDelay: 175
}

const PLAYER_DIMENSIONS = {
    height: 2,
    width: 0.35,
    depth: 0.2,
    cameraOffset: 0.25
}

const WORLD_SETTINGS = {
    globalSeaLevel: 12,
    chunkSize: 16,
    chunkHeight: 128,
    ambientOcclusion: false,
}

const GAME_SETTINGS = {
    maxItems: 64,
}

const Material = {
    AIR: 0,
    SOLID: 1,
    LIQUID: 2
}

const Section = {
    CENTER: 0,
    TOP: 1,
    RIGHT: 2,
    BOTTOM: 3,
    LEFT: 4,
}

export {
    sides,
    PI_2,
    vertices, 
    triangles,
    UVs,

    CrossCheck,
    CornerCheck,
    Section,
    
    Half,

    GAMEMODE,
    MOUSE_BUTTON,
    BASE_PLAYER_SETTINGS,
    PLAYER_DIMENSIONS,
    WORLD_SETTINGS,
    GAME_SETTINGS,
    
    Material,
}