import { Vector3, Mesh, InstancedMesh, Scene, Clock, PerspectiveCamera,
    TextureLoader, WebGLRenderer, BufferAttribute, BufferGeometry, MeshBasicMaterial
} from 'three';

import * as Three from 'three'
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



getAOForVertex(vertPos, pos, dir, side) {
    //get blocks around the vertex   
    let faceCenter = pos.clone().add(new Vector3(0.5, 0.5, 0.5)).add(dir) 
    let vertDir = vertPos.clone().sub(faceCenter)

    // if(pos.equals(new Vector3(7, 26, 8))) {
    //     const o = {
    //         faceCenter: faceCenter.toArray(),
    //         vertDir: vertDir.toArray(),
    //         vertPos: vertPos.toArray(),
    //         pos: pos.toArray(),
    //         dir: dir.toArray(),
    //         side: side,
    //     }
    //     console.log(JSON.stringify(o))
    // }
    let colors = {
        up: 0x00ff00, // green
        down: 0x0000ff, // blue
        north: 0xff0000, // red
        south: 0xffff00, // yellow
        west: 0x00ffff, // cyan
        east: 0xff00ff, // magenta
    }
    vertPos.add(dir) // go up a block
    // if(pos.equals(new Vector3(7, 26, 8))){
    //     window.scene.add(new ArrowHelper(dir.clone().normalize(), faceCenter, 1, colors[side]))
    //     window.scene.add(new ArrowHelper(vertDir.clone().normalize(), vertPos, vertDir.length(), colors[side]))
    //     window.scene.add(new ArrowHelper(vertDir.clone().normalize(), vertPos.clone().sub(dir), vertDir.length(), colors[side]))
    // }

    
    const getBlock = (pos) => {
        return this.chunk.world.getVoxelFromPos(this.chunk.toWorldPosition(pos))
    }
    let corner = getBlock(vertPos.clone().add(vertDir))//.clone())
    let blocksAtSides = []

    let i = 0
    for(let comp of vertDir.toArray()) {
        if(comp != 0) {
            const sidePos = vertPos.clone().add(Vector3.Zero.setComponent(i, -Math.sign(comp) * 0.5))
            blocksAtSides.push(getBlock(sidePos).material != 0)
            
            // if(pos.equals(new Vector3(7, 26, 8))){
            //     window.scene.add(new ArrowHelper(Vector3.Zero.setComponent(i, -Math.sign(comp)), vertPos, 0.25, colors[side]))
            // }
        }
        i++
        //console.log(comp)
    }
    let ao = this.vertexAOType(blocksAtSides[0], blocksAtSides[1], corner.material != 0) / 3
    //if(pos.equals(new Vector3(7, 26, 8))) console.log(blocksAtSides, corner.material != 0, ao, side)
    //console.log(blocksAtSides, ao)
    return ao
}




import { Vector3, Vector2, BufferGeometry, BufferAttribute, Mesh } from 'three';

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