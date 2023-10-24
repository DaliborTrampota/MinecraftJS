import { Vector2, Vector3, BufferGeometry, BufferAttribute, Mesh } from 'https://cdn.skypack.dev/three@0.141.0';
import { ChunkHeight, ChunkSize, triangles, UVs, vertices, CrossCheck, Material, UP } from "../tools/Constants.js"
import { PosMap, create3DArray, map } from "../tools/Utils.js"
import ItemEntity from "./entities/ItemEntity.js";
import LootTable from "./LootTable.js";
import TerrainBuilder from "./TerrainBuilder.js";

//import { SceneUtils } from 'https://cdn.jsdelivr.net/npm/three@0.141.0/examples/jsm/utils/SceneUtils.js';

export default class Chunk {

    constructor(x, y, world){
        this.x = x
        this.y = y
        this.id = Chunk.id(x, y)
        
        this.world = world

        this.data = []
        this.metadata = {}
        this.entities = {}
        this.blockEntities = new PosMap()
        
        this.enabled = false
        this.needsUpdate = false

        this.breaking = []

        this.Init()
        this.builder = new TerrainBuilder(this)
        this.mesh
    }

    get register(){
        return this.world.register;
    }

    Init(){
        this.data = create3DArray(ChunkSize, ChunkHeight, ChunkSize);
        this.populate();
    }

    generate(){
        this.mesh = this.builder.build(new Vector2(this.x, this.y), this.enabled)
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

    getBlockState(pos) {
        return this.metadata[`${Math.floor(pos.x)}_${Math.floor(pos.y)}_${Math.floor(pos.z)}`]
    }

    /**
    * returns true if a block is on the position and should render the face
    */
    checkVoxel(pos, blockData, side, update){
        if(pos.y < 0 || pos.y >= ChunkHeight) return true

        let block;
        if(pos.x < 0 || pos.x >= ChunkSize || pos.z < 0 || pos.z >= ChunkSize) {//outside chunk
            pos.x += this.x * ChunkSize
            pos.z += this.y * ChunkSize

            block = update ? this.world.getVoxelFromPos(pos) : this.register.getBlock(this.world.getVoxel(pos))
        }else {
            block = this.getVoxel(pos)
        }

        /*if(blockData.voxel && !blockData.culling[side]){
            return false
        }
        if(block.voxel && !block.culling[side])
            return false*/
        if(block.voxel) return false
        if(block.material == Material.AIR) return false
        if(!block.opaque && block.solid || block.renderSides) return true
        return !block.renderSides && blockData.id === block.id
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
        this.mesh = this.builder.rebuild()
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
        } else {
            this.breaking.push({ pos, progress: 0, hitpoints: 1000 - damage, time: Date.now() })
        }
        
        this.needsUpdate = true
        this.rebuildNeighbourChunks(pos, worldPos)
    }

    removeVoxel(pos, drop){
        pos.floor()

        let worldPos = pos.clone()

        pos.x -= this.mesh.position.x
        pos.z -= this.mesh.position.z
        
        let curBlock = this.getVoxel(pos)
        if(curBlock.material == Material.AIR) return false

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
        
        this.setVoxel(pos, this.register.getBlockID('air'))
        delete this.metadata[`${pos.x}_${pos.y}_${pos.z}`]
        this.rebuildNeighbourChunks(pos, worldPos)
        return true
    }

    addVoxel(pos, blockID, blockData){
        pos.floor()

        let worldPos = pos.clone()
        
        pos.x -= this.mesh.position.x
        pos.z -= this.mesh.position.z

        this.setVoxel(pos, blockID)//possible out of bounds on borders
        if(blockData) {
            this.metadata[blockData.id] = blockData
        }
        this.rebuildNeighbourChunks(pos, worldPos)
        return true
    }

    getVoxel(pos){
        let blockID = this.data[pos.x][pos.y][pos.z]
        if(!blockID && blockID != 0) {
            return false
        }
        return this.register.getBlock(blockID)
    }

    setEntityAt(pos, entity){
        this.blockEntities.set(pos, entity)
    }

    getEntityAt(pos) {
        console.log(this.blockEntities, pos)
        return this.blockEntities.get(pos)
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

    static id(x, y){
        return `${x}_${y}`
    }

}