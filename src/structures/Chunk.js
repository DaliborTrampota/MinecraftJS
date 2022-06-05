import { ChunkHeight, ChunkSize, sides, triangles, UVs, vertices, CrossCheck, MATERIAL, UP } from "../tools/Constants.js"
import { create3DArray, drawBlock, map } from "../tools/Utils.js"
import { Vector3, BufferGeometry, BufferAttribute, Mesh } from 'https://cdn.skypack.dev/three@0.141.0';
import ItemEntity from "./Entities/ItemEntity.js";
import TextureManager from "../tools/TextureManager.js";
import LootTable from "./LootTable.js";
import Register from "../Register.js";

//import { SceneUtils } from 'https://cdn.jsdelivr.net/npm/three@0.141.0/examples/jsm/utils/SceneUtils.js';

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
        this.entities = {}
        
        this.groupStart = 0
        this.enabled = false
        this.needsUpdate = false

        this.breaking = []

        this.Init()
    }

    get register(){
        return this.world.register;
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
                    if(!blockID) continue next;

                    let blockData = this.register.getBlock(blockID)
                    if(!blockData) console.log('createMesh no blockData', blockID, i, j, k)
                    let pos = new Vector3(i, j, k)
                    let breaking = this.breaking.find(o => o.pos.equals(pos))
                    if(breaking){
                        breaking.textureIndex = TextureManager.textureMap.get(`break_${breaking.progress}`)
                    }
                    
                    sides:
                    for(let { side, dir } of sides){
                        if(this.checkVoxel(pos.clone().add(dir), blockData, update)) continue sides;

                        let textureIndex = 'all' in blockData.textures ? blockData.textures.all : blockData.textures[side]
                        
                        const key = `${textureIndex}_${blockID}`
                        if(textureGroups.hasOwnProperty(`${textureIndex}_${blockID}`)) textureGroups[key].push({ side, pos, breaking })
                        else textureGroups[key] = [{ side, pos, breaking }]
                    }
                }
            }
        }
        for(let key in textureGroups) this.buildTexture(...key.split('_').map(Number), textureGroups[key])
    }

    buildTexture(textureIndex, blockID, data){
        let groupCount = 0;
        let breakingGroups = []
        let blockData = this.register.getBlock(blockID)
        
        for(let o of data){
            for(let vert of triangles[o.side]){
                this.vertices.push(vertices[vert].x + o.pos.x)
                this.vertices.push(vertices[vert].y + o.pos.y)
                this.vertices.push(vertices[vert].z + o.pos.z)
            }
            if(blockData.animation) this.UVs.push(...UVs[o.side].map((u, i) => i % 2 ? u / blockData.animation.frames : u))
            else this.UVs.push(...UVs[o.side])

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

        if(update) return //console.log(this.geometry)
        
        this.mesh = new Mesh(this.geometry, TextureManager.textures)
    }

    //return true to not render side
    checkVoxel(pos, curBlock, update){
        if(pos.y < 0 || pos.y >= ChunkHeight) return true

        let block;
        if(pos.x < 0 || pos.x >= ChunkSize || pos.z < 0 || pos.z >= ChunkSize) {//outside chunk
            pos.x += this.x * ChunkSize
            pos.z += this.y * ChunkSize

            block = update ? this.world.getVoxelFromPos(pos) : this.register.getBlock(this.world.getVoxel(pos))
        }else {
            block = this.getVoxel(pos)
        }

        if(block.material == MATERIAL.AIR) return false
        if(!block.transparent && block.solid || block.renderSides) return true
        return !block.renderSides && curBlock.id === block.id
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
                if(Chunk.equals(chunk, this)) continue
                chunk.needsUpdate = true
            }
        }
    }

    breakVoxel(pos, damage){
        pos.floor()

        let worldPos = pos.clone()

        pos.x -= this.mesh.position.x
        pos.z -= this.mesh.position.z

        let idx = this.breaking.findIndex(o => o.pos.equals(pos))
        if(idx != -1) {
            this.breaking[idx].hitpoints -= damage
            this.breaking[idx].progress = Math.floor(map(this.breaking[idx].hitpoints, 0, 1000, 9, 0))
            
            if(this.breaking[idx].progress === 10){
                this.breaking.splice(idx, 1)
                return this.removeVoxel(worldPos, true)
            }
        }
        else this.breaking.push({ pos, progress: 0, hitpoints: 1000 - damage })
        console.log(this.breaking)
        this.needsUpdate = true
        this.rebuildNeighbourChunks(pos, worldPos)
    }

    removeVoxel(pos, drop){
        pos.floor()

        let worldPos = pos.clone()

        pos.x -= this.mesh.position.x
        pos.z -= this.mesh.position.z
        
        let curBlock = this.getVoxel(pos)
        if(curBlock.material == MATERIAL.AIR) return false

        if(drop){
            //todo get drop from loot table, returns itemStack[]
            const table = new LootTable(curBlock.name, { register: window.game.register })
            let drops = table.roll()
            //console.log(table, drops)
            for(let stack of drops){//Todo sound particles
                let entity = new ItemEntity(this.world, stack.item.getModel(worldPos.add(new Vector3(0.5, 0.5, 0.5))), stack, UP.clone().multiplyScalar(2))
                window.game.addUpdateSub(entity)
            }
        }
        
        this.setVoxel(pos, this.register.blocks.getID('air'))
        this.rebuildNeighbourChunks(pos, worldPos)
        return true
    }

    addVoxel(pos, blockID){
        pos.floor()

        let worldPos = pos.clone()
        
        pos.x -= this.mesh.position.x
        pos.z -= this.mesh.position.z

        this.setVoxel(pos, blockID)//possible out of bounds on borders
        this.rebuildNeighbourChunks(pos, worldPos)
        return true
    }

    getVoxel(pos){
        let blockID = this.data[pos.x][pos.y][pos.z]
        if(!blockID && blockID != 0) {
            console.log(blockID, pos)
            return false
        }
        return this.register.getBlock(blockID)
    }

    setVoxel(pos, blockID){
        this.data[pos.x][pos.y][pos.z] = blockID
    }

    spawnBlock(blockID){
        if(blockID <= 0) return false //update to next stage?
        const geometry = new BufferGeometry()
    
        let blockData = this.register.getBlock(blockID)
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

    
    static equals(c1, c2){
        return c1.x == c2.x && c1.y == c2.y
    }

    toChunkPosition(position){
        position.x -= this.mesh.position.x
        position.z -= this.mesh.position.z
        
        return position
    }

    toString(){
        return `X: ${this.x} Y: ${this.y}`
    }
}