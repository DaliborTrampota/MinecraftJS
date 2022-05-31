import { Vector3, Mesh, InstancedMesh, Scene, Clock, PerspectiveCamera,
    TextureLoader, WebGLRenderer, BufferAttribute, BufferGeometry, MeshBasicMaterial
} from 'https://cdn.skypack.dev/three@0.141.0';

import * as Three from 'https://cdn.skypack.dev/three@0.141.0'
import { vertices, triangles, UVs } from './Constants.js';

//NOTE water render DoubleSide
function generateCube(){

    const cube = buildCube()

    const loader = new TextureLoader()

    const front = loader.load(`resources/textures/blocks/furnace_front_on.png`)
    const top = loader.load(`resources/textures/blocks/furnace_top.png`)
    const back = loader.load(`resources/textures/blocks/furnace_side.png`)
    const bottom = loader.load(`resources/textures/blocks/dirt.png`)
    const right = loader.load(`resources/textures/blocks/furnace_side.png`)
    const left = loader.load(`resources/textures/blocks/furnace_side.png`)

    front.magFilter = Three.NearestFilter
    top.magFilter = Three.NearestFilter
    back.magFilter = Three.NearestFilter
    bottom.magFilter = Three.NearestFilter
    right.magFilter = Three.NearestFilter
    left.magFilter = Three.NearestFilter

    let frontT = new MeshBasicMaterial( { map: front } )
    let backT = new MeshBasicMaterial( { map: back } )
    let topT = new MeshBasicMaterial( { map: top } )
    let bottomT = new MeshBasicMaterial( { map: bottom } )
    let rightT = new MeshBasicMaterial( { map: right } )
    let leftT = new MeshBasicMaterial( { map: left } )

    return new Mesh(cube, [frontT, backT, topT, bottomT, rightT, leftT])
}

function buildFace(triangles, UVs, texture){
    const geometry = new BufferGeometry()


    const verts = []
    for(let vert of triangles){
        verts.push(vertices[vert].x)
        verts.push(vertices[vert].y)
        verts.push(vertices[vert].z)
    }
    geometry.setAttribute('position', new BufferAttribute(new Float32Array(verts), 3))
    geometry.setAttribute('uv', new BufferAttribute(new Float32Array(UVs), 2))

    
    const loader = new TextureLoader()
    const faceTexture = loader.load(`resources/textures/blocks/${texture}.png`)
    faceTexture.magFilter = Three.NearestFilter
    const mat = new MeshBasicMaterial( { map: faceTexture } );

    return new Mesh(geometry, mat)
}

function buildCube(){
    const geometry = new BufferGeometry()

    let sides = Object.keys(UVs)
    let materialIndex = 0
    let groupStart = 0

    let verts = [], uvs = []
    for(let side of sides){
        let groupCount = 0;
        for(let vert of triangles[side]){
            verts.push(vertices[vert].x + 1)
            verts.push(vertices[vert].y + 0)
            verts.push(vertices[vert].z + 1)
        }
        uvs.push(...UVs[side])

        groupCount += 6;
        geometry.addGroup(groupStart, groupCount, materialIndex)

        ++materialIndex;
        groupStart += groupCount;
    }
    geometry.setAttribute('position', new BufferAttribute(new Float32Array(verts), 3))
    geometry.setAttribute('uv', new BufferAttribute(new Float32Array(uvs), 2))

    return geometry
}

//in game.js
function testFloor(){
    const geometry = new PlaneGeometry( 30, 30 );

    const loader = new TextureLoader()
    const texture = loader.load('resources/textures/blocks/dirt.png')

    const material = new MeshBasicMaterial( {map: texture } );
    const plane = new Mesh( geometry, material );
    plane.rotateX(-PI_2)
    plane.position.set(0, -10, 0)
    
    return plane
}


function buildFaceInstance(triangles, UVs, texture){
    const geometry = new BufferGeometry()


    const verts = []
    for(let vert of triangles){
        verts.push(vertices[vert].x)
        verts.push(vertices[vert].y)
        verts.push(vertices[vert].z)
    }
    geometry.setAttribute('position', new BufferAttribute(new Float32Array(verts), 3))
    geometry.setAttribute('uv', new BufferAttribute(new Float32Array(UVs), 2))

    
    const loader = new TextureLoader()
    const faceTexture = loader.load(`resources/textures/blocks/${texture}.png`)
    faceTexture.magFilter = Three.NearestFilter
    const mat = new MeshBasicMaterial( { map: faceTexture } );

    return new InstancedMesh(geometry, mat, 10_000)
}

//in chunk
function addVoxel(pos){
    let blockID = this.data[pos.x][pos.y][pos.z]
    if(!blockID) return 
    let blockData = this.register.getBlock(blockID)
    
    for(let i = 0; i < 6; ++i){
        if(this.checkVoxel(new Vector3(pos.x, pos.y, pos.z).add(sides[i].dir))) continue;
        console.log(sides[i].side)

        let groupCount = 0;
        for(let vert of triangles[sides[i].side]){
            this.vertices.push(vertices[vert].x + pos.x + (this.x * ChunkSize))
            this.vertices.push(vertices[vert].y + pos.y)
            this.vertices.push(vertices[vert].z + pos.z + (this.y * ChunkSize))
        }
        this.UVs.push(...UVs[sides[i].side])

        groupCount += 6;
        let textureIndex = blockData.textures.all ? this.register.textureMap.get(blockData.textures.all) : this.register.textureMap.get(blockData.textures[sides[i].side])
        this.geometry.addGroup(this.groupStart, groupCount, textureIndex)
        this.groupStart += groupCount;
    }
}





import { Vector3, Vector2, BufferGeometry, BufferAttribute, Mesh } from 'https://cdn.skypack.dev/three@0.141.0';

export default class Block {

    constructor(blockID, chunk, pos){
        this.id = blockID
        this.chunk = chunk
        this.pos = pos

        this.metadata = {}
    }

    get worldPos(){
        return new Vector3(this.chunk.x + this.pos.x, this.pos.y, this.chunk.y + this.pos.z)
    }

    get isSolid(){
        return this.chunk.register.getBlock(this.id).solid
    }

    setData(key, value){
        this.metadata[key] = value
    }

    getData(key){
        return this.metadata[key.toString()]
    }

    


} 