import { Vector3 } from 'https://cdn.skypack.dev/three@0.129.0';

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
    CrossCheck
}