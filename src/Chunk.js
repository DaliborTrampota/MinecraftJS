import { ChunkHeight, ChunkSize, sides, triangles, UVs, vertices, CrossCheck } from "./Constants.js"
import { create3DArray } from "./Utils.js"
import { Vector3, Vector2, BufferGeometry, BufferAttribute, Mesh } from 'https://cdn.skypack.dev/three@0.129.0';

//import { SceneUtils } from 'https://cdn.jsdelivr.net/npm/three@0.129.0/examples/jsm/utils/SceneUtils.js';

export default class Chunk {
    constructor(x, y, world){
        this.x = x
        this.y = y

        this.world = world;

        this.vertices = []
        this.UVs = []
        this.geometry;
        this.mesh;

        this.data = []
        
        this.groupStart = 0
        this.enabled = false
        this.needsUpdate = false

        this.breaking = []

        this.Init()
    }

    get register(){
        return this.world.register;
    }

    get scene(){
        return this.world.game.scene;
    }

    Init(){
        this.data = create3DArray(ChunkSize, ChunkHeight, ChunkSize);
        this.geometry = new BufferGeometry();

        this.populate();
    }

    generate(){
        this.createMeshData();
        this.createMesh();

        this.mesh.position.set(this.x * ChunkSize, 0, this.y * ChunkSize)
        this.mesh.visible = this.enabled

        return this.mesh
    }

    populate(){
        //let height = Math.floor(this.world.noise.Get(i + this.x * ChunkSize, 0.0, k + this.y * ChunkSize)) + 20            
        for(let i = 0; i < ChunkSize; ++i){
            for(let j = 0; j < ChunkHeight; ++j){
                for(let k = 0; k < ChunkSize; ++k){
                    this.data[i][j][k] = this.world.getVoxel(new Vector3(i + this.x * ChunkSize, j, k + this.y * ChunkSize))
                }
            }
        }
    }

    createMeshData(update = false){//TODO filter only visible faces, sort them by texute, create a larger groups for each texture
        let textureGroups = {}
        for(let i = 0; i < ChunkSize; ++i){
            for(let j = 0; j < ChunkHeight; ++j){
                next:
                for(let k = 0; k < ChunkSize; ++k){

                    let blockID = this.data[i][j][k]
                    if(blockID <= 0) continue next;

                    let blockData = this.register.getBlockData(blockID)

                    let pos = new Vector3(i, j, k)
                    let breaking = this.breaking.find(o => o.pos.equals(pos))
                    if(breaking){
                        breaking.textureIndex = this.register.textureMap.get(`break_${breaking.progress}`)
                    }

                    sides:
                    for(let { side, dir } of sides){
                        if(this.checkVoxel(pos.clone().add(dir), update)) continue sides;

                        let textureIndex = blockData.textures.all ? this.register.textureMap.get(blockData.textures.all) : this.register.textureMap.get(blockData.textures[side])
                        
                        if(textureGroups.hasOwnProperty(textureIndex)) textureGroups[textureIndex].push({ side, pos, breaking })
                        else textureGroups[textureIndex] = [{ side, pos, breaking }]
                    }
                }
            }
        }
        for(let textureIndex in textureGroups) this.buildTexture(textureIndex, textureGroups[textureIndex])
    }

    buildTexture(textureIndex, data){
        let groupCount = 0;
        let breakingGroups = []

        for(let o of data){
            for(let vert of triangles[o.side]){
                this.vertices.push(vertices[vert].x + o.pos.x)
                this.vertices.push(vertices[vert].y + o.pos.y)
                this.vertices.push(vertices[vert].z + o.pos.z)
            }
            this.UVs.push(...UVs[o.side])

            if(o.breaking) breakingGroups.push({ start: this.groupStart + groupCount, texture: o.breaking.textureIndex })
            groupCount += 6
        }
        
        this.geometry.addGroup(this.groupStart, groupCount, Number(textureIndex))
        for(let { start, texture } of breakingGroups) this.geometry.addGroup(start, 6, texture)

        this.groupStart += groupCount;
    }
    
    createMesh(update = false){
        this.geometry.setAttribute('position', new BufferAttribute(new Float32Array(this.vertices), 3))
        this.geometry.setAttribute('uv', new BufferAttribute(new Float32Array(this.UVs), 2))

        if(update) return console.log(this.geometry)
        
        this.mesh = new Mesh(this.geometry, this.register.textures)
    }

    checkVoxel(pos, update){
        //console.log(pos)
        if(pos.y < 0 || pos.y >= ChunkHeight) return true

        let block;
        if(pos.x < 0 || pos.x >= ChunkSize || pos.z < 0 || pos.z >= ChunkSize) {
            pos.x += this.x * ChunkSize
            pos.z += this.y * ChunkSize

            block = update ? this.world.getVoxelFromPos(pos) : this.world.getVoxel(pos)
        }else {
            block = this.getVoxel(pos)
        }

        return block.solid
    }

    unload(){
        this.enabled = false;
        this.mesh.visible = false;
    }

    load(){
        this.enabled = true;
        this.mesh.visible = true;
    }

    rebuild(){
        this.vertices = []
        this.UVs = []
        this.geometry.clearGroups()
        this.groupStart = 0
        
        this.createMeshData(true)
        this.createMesh(true)
    }

    rebuildNeighbourChunks(pos, worldPos){
        this.needsUpdate = true
        if(pos.x == 0 || pos.x == ChunkSize - 1 || pos.z == 0 || pos.z == ChunkSize - 1){
            for(let dir of CrossCheck){
                let chunk = this.world.getChunkFromPos(worldPos.clone().add(dir))
                if(Chunk.compare(chunk, this)) continue
                chunk.needsUpdate = true
            }
        }
    }

    breakVoxel(pos, dir){
        pos.x = Math.floor(pos.x) - Math.max(dir.x, 0)
        pos.y = Math.floor(pos.y) - Math.max(dir.y, 0)
        pos.z = Math.floor(pos.z) - Math.max(dir.z, 0)

        let worldPos = pos.clone()

        pos.x -= this.mesh.position.x
        pos.z -= this.mesh.position.z

        this.breaking.push({ pos, progress: 4 })
        this.needsUpdate = true
        this.rebuildNeighbourChunks(pos, worldPos)
        //let blockID = this.data[pos.x][pos.y][pos.z] 
        //his.data[pos.x][pos.y][pos.z] = -blockID//this.register.blockMap.get('air')

        //let overlayData = this.register.blockData['break_4']
        /*let blockMesh = this.spawnBlock(blockID, overlayData)
        worldPos.z--
        worldPos.x--
        blockMesh.position.copy(worldPos)
        this.scene.add(blockMesh)

        console.log(blockMesh)
        this.rebuild()*/

    }

    removeVoxel(pos, dir){
        pos.x = Math.floor(pos.x) - Math.max(dir.x, 0)
        pos.y = Math.floor(pos.y) - Math.max(dir.y, 0)
        pos.z = Math.floor(pos.z) - Math.max(dir.z, 0)

        let worldPos = pos.clone()

        pos.x -= this.mesh.position.x
        pos.z -= this.mesh.position.z

        this.setVoxel(pos, this.register.blockMap.get('air'))
        
        this.rebuildNeighbourChunks(pos, worldPos)
    }

    addVoxel(pos, dir, blockID){
        pos.x = Math.floor(pos.x) + Math.min(dir.x, 0)
        pos.y = Math.floor(pos.y) + Math.min(dir.y, 0)
        pos.z = Math.floor(pos.z) + Math.min(dir.z, 0)

        let worldPos = pos.clone()
        
        pos.x -= this.mesh.position.x
        pos.z -= this.mesh.position.z

        this.setVoxel(pos, blockID)//possible out of bounds on borders
        
        this.rebuildNeighbourChunks(pos, worldPos)
    }

    getVoxel(pos){
        //console.log(pos, this.data)
        let blockID = this.data[pos.x][pos.y][pos.z]
        if(!blockID) return false
        return this.register.getBlockData(blockID)
    }

    setVoxel(pos, blockID){
        this.data[pos.x][pos.y][pos.z] = blockID
    }

    static compare(c1, c2){
        return c1.x == c2.x && c1.y == c2.y
    }

    spawnBlock(blockID){
        if(blockID <= 0) return false //update to next stage?
        const geometry = new BufferGeometry()
    
        let blockData = this.register.getBlockData(blockID)
        let groupStart = 0
    
        let verts = [], uvs = []
        for(let side in UVs){
            let textureIndex = blockData.textures.all ? this.register.textureMap.get(blockData.textures.all) : this.register.textureMap.get(blockData.textures[side])
            let groupCount = 0;
            for(let vert of triangles[side]){
                verts.push(vertices[vert].x + 1)
                verts.push(vertices[vert].y + 0)
                verts.push(vertices[vert].z + 1)
            }
            uvs.push(...UVs[side])
            groupCount += 6;
            
            if(overlayBlockData) {
                console.log(overlayBlockData.textures[side] || overlayBlockData.textures.all)
                let overlayTextureIndex = this.register.textureMap.get(overlayBlockData.textures[side] || overlayBlockData.textures.all)
                geometry.addGroup(groupStart, groupCount, overlayTextureIndex)
            }
            geometry.addGroup(groupStart, groupCount, textureIndex)
    
            groupStart += groupCount;
        }

        geometry.setAttribute('position', new BufferAttribute(new Float32Array(verts), 3))
        geometry.setAttribute('uv', new BufferAttribute(new Float32Array(uvs), 2))
        
        return new Mesh(geometry, this.register.textures)
    }
}