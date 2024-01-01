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
        5, 4, 7,
        5, 7, 6
    ],
    south: [
        0, 2, 1,
        0, 3, 2
    ],
    up: [
        2, 3, 4,
        2, 4, 5
    ],
    down: [
        0, 6, 7,
        0, 1, 6
    ],
    west: [
        1, 2, 5,
        1, 5, 6
    ],
    east: [
        0, 7, 4,
        0, 4, 3
    ]
}

const UVs = {
    north: [
        1, 1,
        0, 1,
        0, 0,
    
        1, 1,
        0, 0,
        1, 0
    ],
    south: [
        1, 0,
        0, 1, 
        0, 0,
    
        1, 0, 
        1, 1, 
        0, 1
    ],
    up: [
        1, 1,
        0, 1,
        0, 0,
    
        1, 1,
        0, 0,
        1, 0
    ],
    down: [
        1, 1,
        0, 0,
        1, 0,
    
        1, 1,
        0, 1,
        0, 0
    ],
    west: [
        1, 0,
        1, 1,
        0, 1,
    
        1, 0,
        0, 1,
        0, 0
    ],
    east: [
        0, 0,
        1, 0,
        1, 1,
    
        0, 0,
        1, 1,
        0, 1
    ]
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
}

const GAME_SETTINGS = {
    maxItems: 64
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